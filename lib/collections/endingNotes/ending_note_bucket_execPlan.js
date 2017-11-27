import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnBucketListExecPlan = new Mongo.Collection('endingNoteBucketListExecPlan');

// userId, pageType, limit
Meteor.methods({
  getBucketListExecPlan: function(bucketId) {
    var result = [];
    result = CLT.EnBucketListExecPlan.find({bucketId:bucketId},{$sort: {regDate:-1}}).fetch();

    result.push({
      planId : result._id,
      bucketId : result.bucketId,
      planCompleteDate : result.planCompleteDate,
      planContent : result.planContent
    });

    return result;
  },
  setBucketExecPlan: function(bucketId, execPlanArray){
    var result = [];
    _.each(execPlanArray, function(execPlanObj){
      if(!execPlanObj._id){
        execPlanObj.bucketId = bucketId;
      }

      result.push(CLT.EnBucketListExecPlan.upsert(
        {'_id': execPlanObj._id},
        {$set: {
          bucketId : execPlanObj.bucketId,
          userId: execPlanObj.userId,
          planContent : execPlanObj.planContent,
          planStartDate : execPlanObj.planStartDate,
          planCompleteDate : execPlanObj.planCompleteDate,
        },
          // $setOnInsert: {'regDate': global.utilGetDate().default}
          $setOnInsert: {'regDate': global.utilGetDate().default}
        }
      ));
    });
    return result;
  },
  deleteBucketExecPlan: function( execPlanArray){
    _.each(execPlanArray, function(execPlan){
      CLT.EnBucketListExecPlan.remove({_id: execPlan._id});
      CLT.EnTimeline.remove({postId: execPlan._id});
    });
  },

  deleteTimelineBucketExecPlan: function(planId, userId) {
    CLT.EnTimeline.remove({postId: {$in: planId}, userId: {$in: userId}});
  },
  deleteTimelineBucketExecPlanSingle: function(postId, userId) {
    CLT.EnTimeline.remove({postId:postId, userId:userId});
  }

  // bucketUpsert: function(_id, data) {
  //   return CLT.EnBucketList.upsert(
  //     {'_id': _id},
  //     {$set: data,
  //       // $setOnInsert: {'regDate': global.utilGetDate().default}
  //       $setOnInsert: {'regDate': global.utilGetDate().default}
  //     }
  //   );
  // },
  // bucketDelete: function( _id ){
  //   CLT.EnBucketList.remove(_id);
  //   CLT.ImsComment.remove({postId: _id});
  //
  //   //속해있던 버키스토리의 _id 정보를 넘긴다.
  //   return CLT.EnStory.find({postId : _id},{fields:{_id:1}}).fetch();
  // },
  // bucketGetStateCount: function(userId, selectedTapMenu){
  //   var countObject = {};
  //   var conditionParam = [];
  //   var serchObject = {};
  //   var condition = [];
  //   if(_.isEqual(selectedTapMenu, 'my')){
  //     condition = [{'userId':userId},{'groupUsers':{$in:[userId]}}];
  //   } else {
  //     //상관없이 모두 조회
  //     // condition = [{lock:false},{lock:true}];
  //     condition = [{}];
  //   }
  //
  //   countObject.totalCount = CLT.EnBucketList.find({$or:condition}).count();
  //   countObject.completeCount = CLT.EnBucketList.find({$and:[{$or:condition}, {isCompleted:true}]}).count();
  //   countObject.ingCount = CLT.EnBucketList.find({$and:[{$or:condition, isCompleted:false}]}).count();
  //   countObject.followCount = CLT.EnBucketList.find({$and:[{$or:condition, follow:true }]}).count();
  //
  //   return countObject;
  // },
  // removeGroupId: function(_id, groupData){
  //   CLT.EnBucketList.update({_id:_id},{$set:{groupUsers:groupData}});
  // },
  //
  // bucketListRandom: function(tag, userId, limit) {
  //   var stage = [
  //     {$match: {tagList: {$in: tag}, userId: {$ne:userId}, images: {$ne: []}}},
  //     {$sample: {size: limit}}
  //   ];
  //   if (Meteor.isServer) {
  //     var result = CLT.EnBucketList.aggregate(stage);
  //     return result;
  //   }
  // },
  //
  // isNotThereUsedFile: function(imgPath){
  //   return CLT.EnBucketList.find({images:{$in:[imgPath]}}).count();
  // },
  // //barchart용 count조회
  // bucketChartMyCount: function(user,categorys){
  //   var categoryItem = [];
  //   categoryItem = Object.keys(categorys);
  //   var counterList = [];
  //   var ingCount = {};
  //   var completeCount = {};
  //   var condition = {};
  //   if(user){
  //     condition = {$or:[{userId:user},{groupUsers:{$in:[user]}}]};
  //   }
  //
  //   for(var i=0; i<categoryItem.length ; i++){
  //     ingCount[categoryItem[i]] = CLT.EnBucketList.find({$and:[condition,{category:categoryItem[i]},{isCompleted:false}]}).count();
  //     completeCount[categoryItem[i]] = CLT.EnBucketList.find({$and:[condition,{category:categoryItem[i]},{isCompleted:true}]}).count();
  //   }
  //   counterList.push(ingCount);
  //   counterList.push(completeCount);
  //   return counterList;
  // },
  // //my 버킷 목록count
  // getMybucketCountInfo: function(userid){
  //   var returnCount = {};
  //   var condition = [{}];
  //   if(userid){
  //     condition = [{'userId':userid},{'groupUsers':{$in:[userid]}}];
  //   }
  //   returnCount.totalCount = CLT.EnBucketList.find({$or:condition}).count();
  //   returnCount.completeCount = CLT.EnBucketList.find({$and:[{$or:condition}, {isCompleted:true}]}).count();
  //   returnCount.ingCount = CLT.EnBucketList.find({$and:[{$or:condition, isCompleted:false}]}).count();
  //   returnCount.iFollow = CLT.EnBucketList.find({$and:[{$or:condition, follow:true }]}).count();
  //   var myBucketList = CLT.EnBucketList.find({$or:condition },{fields:{'_id':1}} ).fetch();
  //   var searchParam = [];
  //   for(var i=0; i<myBucketList.length ; i++){
  //     searchParam.push(myBucketList[i]._id);
  //   }
  //   returnCount.myFollower = CLT.EnBucketList.find({postId:{$in:searchParam}}).count();
  //   return returnCount;
  // },
  // getBucketChartRank: function(){
  //   var renderChartData = {
  //     under10 : '50',
  //     under20 : '34',
  //     under30 : '11',
  //     under40 : '9',
  //     over40 : '4',
  //     rankers : [
  //       {userNick: '꿈꾼이', listCount: 65, lateContent:'아랍어 배우기'},
  //       {userNick: '크러쉬', listCount: 40, lateContent:'월드투어(10개국 이상)'},
  //       {userNick: '신두유', listCount: 31, lateContent:'개껌 200모으기'},
  //       {userNick: '딘', listCount: 21, lateContent:'패셔니스타로 선정되기'},
  //       {userNick: '지호', listCount: 15, lateContent:'걸그룹과 연애하기'},
  //     ]
  //   };
  //   var renderChartCompData = {
  //     under10 : '43',
  //     under20 : '41',
  //     under30 : '21',
  //     under40 : '10',
  //     over40 : '4',
  //     rankers : [
  //       {userNick: '꿈꾼이', listCount: 65, lateContent:'아랍어 배우기'},
  //       {userNick: '크러쉬', listCount: 40, lateContent:'월드투어(10개국 이상)'},
  //       {userNick: '신두유', listCount: 31, lateContent:'개껌 200모으기'},
  //       {userNick: '딘', listCount: 21, lateContent:'패셔니스타로 선정되기'},
  //       {userNick: '지호', listCount: 15, lateContent:'걸그룹과 연애하기'},
  //     ]
  //   };
  //   var arrayDatas = [];
  //   arrayDatas.push(renderChartData);
  //   arrayDatas.push(renderChartCompData);
  //   return arrayDatas;
  // }
});
