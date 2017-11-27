import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
import export_email_time_capsule from '/imports/email_template/email_time_capsule.js';

Meteor.methods({
    batchSendTimeCapsuleEmail: function(){
    if(Meteor.isServer){
      console.log('runAt : ',global.utilGetDate().default);
      //타임캡슐중 개봉 대상인 데이터 가져오기
      // 조건1 : 개인/비회원을 수신자로 가진 타임캡슐
      // return : [{보내는 사람 이름, 받는 사람 이름, 받는사람 이메일, 매립일, 매링위치, 개봉일, 제목}]
      var project = {
        _id:1,
        userId:1,
        title:1,
        authorType:1,
        buryLocationName:1,
        buryDate:1,
        unsealDate:1,
        nonUserGroupMember:1,
        memberCnt: {$size: "$nonUserGroupMember"},
        emailCode:1

      };

      var unwind = {path:"$nonUserGroupMember"};

      var project2 = {
        _id: 1,
        userId: 1,
        title: 1,
        authorType: 1,
        buryLocationName: 1,
        buryDate: 1,
        unsealDate: 1,
        nonName : "$nonUserGroupMember.nonUserName",
        nonEmail : "$nonUserGroupMember.nonUserEmail",
        complete : "$nonUserGroupMember.emailComplete",
        memberCnt: 1,
        emailCode:1
      };

      var match={
        authorType: 'private',
        unsealDate : {$lte : global.utilGetDate().defaultYMD},
        $or : [
          {emailSendComplete : {$exists:false}},
          {emailSendComplete : {$ne : true}}
        ],
        status:'BR'
      };

      var match2 = {
        memberCnt : {$gt : 0},
        $or : [
          {complete : {$exists : false}},
          {complete : {$ne:true}},
        ],

      };

      var result = CLT.EnTimeCapsule.aggregate([
        {$match: match},
        {$project: project},
        {$unwind: unwind},
        {$project: project2},
        {$match: match2}
      ]);

      if(result.length > 0){
        _.each(result, function(info){

          var emailCode = info.emailCode
          var encdCode = global.utilAES(emailCode, 'encrypt');

          //이메일 전송
          var email_info = {
            senderName : global.fn_getName(info.userId),
            receiverName : info.nonName,
            email : info.nonEmail,
            buryDate : info.buryDate,
            buryLocation : info.buryLocationName,
            unsealDate : info.unsealDate,
            title : info.title,
            code : encdCode
          };

          var htmlContext = export_email_time_capsule(email_info);
          var emailSend = global.fn_sendEmail('cert', email_info.email, "[It's my story] 소중한 타임캡슐이 도착했습니다.", htmlContext, '');
          Meteor.call('sendEmail', emailSend);

          CLT.EnTimeCapsule.update({_id : info._id, nonUserGroupMember : {$elemMatch :{nonUserName:info.nonName,  nonUserEmail:info.nonEmail}}},{$set:{"nonUserGroupMember.$.emailComplete":true}});
        });

        var _ids = _.pluck(result,'_id');
        CLT.EnTimeCapsule.update({_id : {$in : _ids}},{$set:{"emailSendComplete":true}});
      }

    }
  },

  bucketChartCountBatch: function(){
    var bucketBatchData = {};
    var result =  CLT.EnBucketList.aggregate(
        // Pipeline
     [
        // Stage 1
        {
           $project: {
              userId:1,
              groupUsers:1,
              category:1,
              postId:1,
              isCompleted:1,
              regDate:1,
              title:1
           }

        },

        // Stage 2
        {
           $group: {
              _id:"$_id",
              userId:{$first:"$userId"},
              userIdArray : {$addToSet: "$userId"},
              category:{$first:"$category"},
              postId:{$first:"$postId"},
              isCompleted:{$first:"$isCompleted"},
              groupUsers:{$first:"$groupUsers"},
              regDate:{$first:"$regDate"},
              title:{$first:"$title"}
           }

        },

        // Stage 3
        {
           $project: {
              userId:1,
              category:1,
              postId:1,
              isCompleted:1,
              groupUsers: { $concatArrays: [ "$userIdArray", "$groupUsers" ] },
              regDate:1,
              title:1
           }

        },

        // Stage 4
        {
           $unwind: {path:"$groupUsers"}
        },

     ]
    );

    //     =================================================
    // ㅇ 전체개수
    // var allData = _.where(result, {userId:'scshin'});
    var allCnt = result.length;


    // ㅇ 완료개수
    var completeCnt =_.where(result, {isCompleted:true}).length;



    // ㅇ 진행중 개수
    var ingCnt = allCnt - completeCnt;
    // =================================================


    // (2) 카테고리별
    // =================================================
    // 1) 진행중
    var cateIngCountItem = _.chain(result).where({isCompleted:false}).groupBy("category").map(function(value,key){
        return{
          category: key,
          cnt: value.length
        };
      }).value();

    var labelParam = [];
    var resKeys = Object.keys(global.category);

    for(var i=0; i<resKeys.length ; i++){
      if(resKeys[i].substr(0,3) === "CA0"){
        labelParam.push(resKeys[i].substr(0,5));

      }
    }
    //없는 코드 ctn 0 으로 생성
    for(var i=0; i < labelParam.length ; i++){
      var isthere = true;
      for(var item in cateIngCountItem){
        if(cateIngCountItem[item].category == labelParam[i]) isthere = false;
      }
      if(isthere){
        cateIngCountItem.push({category:labelParam[i],cnt:0});
      }

    }
    var categoryCountIng = cateIngCountItem;

    // 2) 완료

    var categoryCountEndItem = _.chain(result).where({isCompleted:true}).groupBy("category").map(function(value,key){
        return{
          category: key,
          cnt: value.length
        };
      }).value();

      //없는 코드 ctn 0 으로 생성
      for(var i=0; i < labelParam.length ; i++){
        var isthere = true;
        for(var item in categoryCountEndItem){
          if(categoryCountEndItem[item].category == labelParam[i]) isthere = false;
        }
        if(isthere){
          categoryCountEndItem.push({category:labelParam[i],cnt:0});
        }

      }
      var categoryCountEnd = categoryCountEndItem;

    // (3) 개수별 분포
    // =================================================
    // 1) 각사람당 가지고있는 수
      // > 그룹 : 10, 30, 50, 80, 100, 150, 200, 200이상

     var groupSynArrAll =  _.chain(result).groupBy("userId").map(function(value,key){
        return{
          userId: key,
          cnt: value.length
        };
     }).value();
    var haveSumGroupAllCnt = _.countBy(groupSynArrAll, function(num){
       if(num.cnt<10){
         return "10";
       }else if(num.cnt<30){
         return '30';
       }else if(num.cnt<50){
         return '50';
       }else if(num.cnt<80){
         return '80';
       }else if(num.cnt<100){
         return '100';
       }else if(num.cnt <150){
         return '150';
       }else if(num.cnt<200){
         return '200';
       }else if(num.cnt <200){
         return '200over';
       }
     });

// .filter(function(info){return  info.cnt >= 1 && info.cnt < 10}).length;

    // 2) 순위
    var topFiveUserListAll = _.chain(result).groupBy("userId").map(function(value,key){
        return{
          userId: key,
          cnt: value.length,
          data : _.first(_.sortBy(value,'regDate').reverse()),
        };
      }).sortBy('cnt').reverse().value();
    // =================================================





    // (4) 개수별 분포 (완료)
    /////////////////////////////////////////////////////////
    // 1) 각사람당 가지고있는 수
      // > 그룹 : 10, 30, 50, 80, 100, 150, 200, 200이상
    var groupSynArrEnd =_.chain(result).where({isCompleted:true}).groupBy("userId").map(function(value,key){
        return{
          category: key,
          cnt: value.length
        };
      }).value();

     var haveSumGroupEndCnt = _.countBy(groupSynArrEnd, function(num){
        if(num.cnt<10){
          return "10";
        }else if(num.cnt<30){
          return '30';
        }else if(num.cnt<50){
          return '50';
        }else if(num.cnt<80){
          return '80';
        }else if(num.cnt<100){
          return '100';
        }else if(num.cnt <150){
          return '150';
        }else if(num.cnt<200){
          return '200';
        }else if(num.cnt <200){
          return '200over';
        }
      });


    // 2) 순위
    var topFiveUserListEnd = _.chain(result).where({isCompleted:true}).groupBy("userId").map(function(value,key){
        return{
          userId: key,
          cnt: value.length,
          data : _.first(_.sortBy(value,'regDate').reverse()),
        };
      }).sortBy('cnt').reverse().value();
    ////////////////////////////////////////////////////////

    var insertBatchData = {
      'allCnt' : allCnt,
      'completeCnt' : completeCnt,
      'ingCnt': ingCnt,
      'categoryCountIng' : categoryCountIng,
      'categoryCountEnd' : categoryCountEnd,
      'haveSumGroupAllCnt' : haveSumGroupAllCnt,
      'topFiveUserListAll' : topFiveUserListAll,
      'haveSumGroupEndCnt' : haveSumGroupEndCnt,
      'topFiveUserListEnd' : topFiveUserListEnd,
      'regDate' : global.utilGetDate().default
    };
    console.log('inserted');
    CLT.BucketChart.insert(insertBatchData);

    // var bucketAggreData = CLT.EnBucketList.aggregate(
    // 	// Pipeline
    // 	[
    // 		// Stage 1
    // 		{
    // 			$unwind: {
    // 			    path : "$groupUsers",
    // 			    preserveNullAndEmptyArrays : true // optional
    // 			}
    // 		},
    // 		// Stage 2
    // 		{
    // 			$project: {
    // 			    userId:1, isCompleted:1, category:1, lock:1, title:1
    // 			}
    // 		},
    // 	]
    // );
    // //end aggregate
    //
    // var batchMongoCollectino = new Mongo.Collection(null);
    // batchMongoCollectino.insert(bucketAggreData);
    // console.log(batchMongoCollectino.find({}).count());
    // batchMongoCollectino.find({}).fetch();
    // //total count
    // bucketBatchData.totalBucketCount = batchMongoCollectino.find().count();
    // //completed count
    // bucketBatchData.completedCount = batchMongoCollectino.find({}).count({completeDate:{"$ne":""}});
    // //진행중 데이터
    // bucketBatchData.startedCount = bucketBatchData.totalBucketCount - bucketBatchData.completedCount;
    // //카테고리별 완료 count
    // var categoryArray = [];
    // for(var i=0; i<global.category ; i++){
    //   if(resKeys[i].substr(0,3) === "CA0"){
    //     var startSt = global.category[resKeys[0]].indexOf("[");
    //     var endStr = global.category[resKeys[0]].indexOf("]");
    //     var categoryItem = {};
    //     categoryItem.categoryCode = global.category[resKeys[i]].substr(startSt+1,endStr-1);
    //     categoryItem.notCompCateCount = 0;
    //     categoryItem.completedCateCount = 0;
    //     categoryArray.push(categoryItem);
    //   }
    // }
    //
    // var findAggData = batchMongoCollectino.aggregate(
    // 	// Pipeline
    // 	[
    // 		// Stage 1
    // 		{
    // 			$project: {
    // 			  userId:1,
    // 			  completeDate:1,
    // 			  category:1,
    // 			  lock:1,
    // 			  title:1,
    // 			  isCompleted:1,
    // 			  groupUsers:1
    //
    // 			}
    // 		},
    // 		// Stage 2
    // 		{
    // 			$group: {
    // 			   _id : {isCompleted: "$isCompleted", category: "$category"},
    // 			   cnt : {$sum : 1}
    // 			}
    // 		},
    //     // Stage 3
    //     {
    //       $project: {
    //          isCompleted:"$_id.isCompleted",
    //          category:"$_id.category",
    //          cnt:"$cnt"
    //       }
    //     },
    // 	]
    // ).fetch();
    //
    // for(var i=0 ; i<categoryArray.length(); i++ ){
    //   var cateItem = _.findWhere(findAggData,{category:categoryArray[i].categoryCode});
    //   if(cateItem.isCompleted){
    //     categoryArray[i].completedCateCount = cateItem.cnt;
    //   }else{
    //     categoryArray[i].notCompCateCount = cateItem.cnt;
    //   }
    // }
    // //모든 카테고리의 count
    // bucketBatchData.categoryCountAll = categoryArray;
    // //카테고리 count end
    //
    // //모든 유저의 보유 버킷 count
    // var allUsersBcCount = batchMongoCollectino.aggregate([{
		// 	$group: {
		// 		_id:"$userId",count:{ $sum: 1}
		// 	},
		// 	$sort: {
		// 		count:-1
		// 	}
		// },]).fetch();
    //
    // var mergeCountAll =
    // _.countBy(allUsersBcCount,function(num){
    //   if(num<10){
    //     return "10";
    //   }else if(num<30){
    //     return '30';
    //   }else if(num <50){
    //     return '50';
    //   }else if(num<80){
    //     return '80';
    //   }else if(num <100){
    //     return '100';
    //   }else if(num<150){
    //     return '150';
    //   }else if(num <200){
    //     return '200';
    //   }else if(num >200){
    //     return '200over';
    //   }
    // });
    // bucketBatchData.usersBucketCountAll = allUsersBcCount;
    // //다수보유 상위 5인
    // allUsersBcCount = allUsersBcCount.splice(0,5);
    // var allTopFiveUserIds = [];
    // allUsersBcCount.forEach(function(value){
    //   allTopFiveUserIds.push(value.userId);
    // });
    //
    // var topFiveUserAll =
    // //5인 content
    // bucketBatchData.topUserContentsAll = batchMongoCollectino.aggregate(
    //   // Pipeline
    //   [
    //     // Stage 1
    //     {
    //       $match: {
    //         userId:{$in:allTopFiveUserIds}
    //       }
    //     },
    //     // Stage 2
    //     {
    //       $group: {
    //         _id:"$userId",
    //         date:{ $max: "$regDate"},
    //         title:{ $max: "$title"},
    //       }
    //     },
    //   ]
    //   // Created with 3T MongoChef, the GUI for MongoDB - https://3t.io/mongochef
    // ).fetch();
    //
    // //완료 버킷 유져카운트
    // var usersCompBcCount = batchMongoCollectino.aggregate([{
    //   $match:{
    //     isCompleted:true
    //   },
    //   $group: {
    //     _id:"$userId",count:{ $sum: 1}
    //   },
    //   $sort: {
    //     count:-1
    //   }
    // },]).fetch();
    //
    // var mergeCountComp = _.countBy(usersCompBcCount,function(num){
    //   if(num<10){
    //     return "10";
    //   }else if(num<30){
    //     return '30';
    //   }else if(num <50){
    //     return '50';
    //   }else if(num<80){
    //     return '80';
    //   }else if(num <100){
    //     return '100';
    //   }else if(num<150){
    //     return '150';
    //   }else if(num <200){
    //     return '200';
    //   }else if(num >200){
    //     return '200over';
    //   }
    // });
    // bucketBatchData.usersBucketCountComp = mergeCountComp;
    //
    // //다수완료보유 상위 5인
    // usersCompBcCount = usersCompBcCount.splice(0,5);
    // var topFiveUserCompIds = [];
    // usersCompBcCount.forEach(function(value){
    //   topFiveUserCompIds.push(value.userId);
    // });
    //
    // bucketBatchData.topUserContentsComp = batchMongoCollectino.aggregate(
    //   // Pipeline
    //   [
    //     // Stage 1
    //     {
    //       $match: {
    //         userId:{$in:topFiveUserCompIds},
    //         isCompleted:true
    //       }
    //     },
    //     // Stage 2
    //     {
    //       $group: {
    //         _id:"$userId",
    //         date:{ $max: "$regDate"},
    //         title:{ $max: "$title"},
    //       }
    //     },
    //   ]
    //   // Created with 3T MongoChef, the GUI for MongoDB - https://3t.io/mongochef
    // ).fetch();
    //
    // var batchCollection = new Mongo.Collection("bucketContentChartBacth");
    // batchCollection.upsert(bucketBatchData);
    //

  }







});
