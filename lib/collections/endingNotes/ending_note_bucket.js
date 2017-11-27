import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnBucketList = new Mongo.Collection('endingNoteBucketList');

// userId, pageType, limit
Meteor.methods({
  bucketTimelineGetList: function(obj) {
    var data = CLT.EnBucketList.find(obj).fetch();
    return data;
  },
  bucketGetList: function(userId, isPageOwner, limit, searchCondition, searchText, category, sortBy, selectedMenu, statusMenu) {
    var contentAllCount = 0;
    var result = {
      data : [],
      count : contentAllCount
    };
    if(Meteor.isServer){
      var bucket = null;
      var regex = new RegExp(["^.*", searchText, ".*"].join(""), "gi");
      var condition = [];

      switch (searchCondition) {
        case 'title': condition=[{'title': regex}];
        break;
        case 'content': condition=[{'content': regex}];
        break;
        case 'tag': condition=[{'tagList': regex}];
        break;
        default:
        condition=[
          {"title": regex},
          {"content": regex},
          {"tagList": {$in:[searchText]}}
        ];
      }

      var statusOption = null;
      switch(statusMenu){
        case 'all':
        statusOption =null;
        break;
        case 'complete':
        statusOption = {isCompleted : true};
        break;
        case 'process':
        statusOption = {isCompleted : false};
        break;
        case 'follow':
        statusOption = {follow : true};
        break;
      }

      var sortParam = {};
      switch(sortBy) {
        case 'regDateDesc':
          sortParam = {regDate:-1}; //result.data =  _.sortBy(result.data, 'regDate').reverse();
        break;
        case 'regDateAsc':
          sortParam = {regDate:1}; //result.data =  _.sortBy(result.data, 'regDate');
        break;
        case 'startDateDesc':
          sortParam = {startDate:-1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate').reverse();
        break;
        case 'startDateAsc':
          sortParam = {startDate:1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate');
        break;
        case 'like':
          sortParam = {regDate:-1}; //result.data =  _.sortBy(result.data, 'likeCount').reverse();
        break;
      }

      var project = {
        _id: 1,
        title: 1,
        content: 1,
        category :1,
        userId: 1,
        open:1,
        lock: 1,
        startDate: 1,
        completeDate: 1,
        isCompleted: 1,
        images : 1,
        tagList : 1,
        regDate: 1,
        updateDate : 1,
        groupUsers : 1,
        groupType : 1,
        postId: 1
      };

      var dynamicQuery = [];
      var stage = [];
      if(selectedMenu === 'all'){
        dynamicQuery = [
          {'lock': false},
          {$or: condition}
        ];

        if(statusOption){
          dynamicQuery.push(statusOption);
        }


        if(category){
          dynamicQuery.push({'category': category});
        }

        stage = [
          {$match: {
            $and:dynamicQuery
          }},
          {$project: project},
          {$sort : sortParam},
          {$limit: limit}
        ];
        if(Meteor.isServer){
          bucket = CLT.EnBucketList.aggregate(stage);
        }

        contentAllCount = CLT.EnBucketList.find(
          {$and:dynamicQuery}
        ).count();
      } else { //selectedMenu === 'my'

      dynamicQuery = [
        {$or:condition},
        {$or:[{'userId': userId},
        {'groupUsers':{$in:[userId]}}]}
      ];

      if(statusOption){
        dynamicQuery.push(statusOption);
      }


      if(category){
        dynamicQuery.push({'category': category});
      }

      if(!isPageOwner){ //방문자일경우
        dynamicQuery.push({'lock': false});
      }

      stage = [
        {$match: {
          $and:dynamicQuery
        }},
        {$project: project},
        {$sort : sortParam},
        {$limit: limit}
      ];
      if(Meteor.isServer){
        bucket = CLT.EnBucketList.aggregate(stage);
      }

      contentAllCount = CLT.EnBucketList.find(
        {$and:dynamicQuery}
      ).count();
    }

    // 따라쟁이 tab일때는 따라쟁이한 사람의 데이터를 보여준다
    if (statusMenu === 'follow') {
      var uniq = bucket.reduce(function(a, b) {
        if (a.indexOf(b.postId) < 0) {
          a.push(b.postId);
        }
        return a;
      },[]);
      bucket = CLT.EnBucketList.find({_id: {$in: uniq}}).fetch();
    }

    if (bucket.length !== 0) {
      for (var i = 0; i < bucket.length; i++) {
        var regex2 = new RegExp([searchText].join(""), "gi");
        // 데이터영역의 태그를 삭제
        var title = bucket[i].title.replace(/(<([^>]+)>)/gi, "");
        var content = bucket[i].content.replace(/<\/p>/gi, "\n");
        content = content.replace(/(<([^>]+)>)/gi, "");
        // var content = bucket[i].content.replace(/<img(.*?)>/gi, "");  // 이미지태크 삭제
        // content = content.replace(/<p>/gi, "");                   // <p>태그 삭제
        // content = content.replace(/<br>/gi, "");
        // content = content.replace(/<\/p>/gi, "<br/>");            // </p> 태그 <br>태그 전환
        content = content.split('\n');
        var contentResult = '';
        for (var c = 0; c < content.length; c++) {
          if (content[c] !== "") {
            contentResult += content[c];
            if (c !== content.length-1) {
              contentResult += '<br/>';
            }
          }
        }
        content = contentResult;


        // 태그를 삭제한 데이터영역과 검색키워드의 문자열을 찾는다
        var titleFlag = title.indexOf(searchText);
        var contentFlag = content.indexOf(searchText);


        var titleTxt = title;
        var contentTxt = content;

        // 태그를 삭제한 데이터영역과 검색키워드의 문자열이 일치하지 않을때
        // 태그를 삭제하지않은 데이터로 검색 키워드를 비교해 result배열에 데이터를 담는다
        // if (titleFlag !== -1 || contentFlag !== -1 || searchCondition === 'all' || searchCondition === 'tag') {

        if(!_.isEmpty(searchText) && titleFlag !== -1 && (searchCondition === 'all' || searchCondition === 'title')){
          titleTxt = title.replace(regex2, '<strong value='+bucket[i]._id+'>' + searchText + '</strong>');
        }
        if(!_.isEmpty(searchText) && contentFlag !== -1 && (searchCondition === 'all' || searchCondition === 'content')) {
          contentTxt = content.replace(regex2, '<strong value='+bucket[i]._id+'>' + searchText + '</strong>');
        }
        contentTxt = global.utilEllipsis(contentTxt, 100);

        // 태그글씨 굴게 표시
        _.find(bucket[i].tagList, function(item, g) {
          if (item === searchText) {
            tempTag = '<strong>' + searchText + '</strong>';
            bucket[i].tagList.splice(g,1);
            bucket[i].tagList.unshift(tempTag);
          } else {
            bucket[i].tagList[g] = item;
          }
        });

        var comments = CLT.ImsComment.find({postId: bucket[i]._id}, {sort: {regDate: -1}}).fetch();
        var commentTop = CLT.ImsComment.find({postId: bucket[i]._id, replyKey: ''}, {sort: {regDate: -1}}).fetch()[0];
        var bucketStoryCount = CLT.EnStory.find({postId: bucket[i]._id}).count();
        var exePlanLength = CLT.EnBucketListExecPlan.find({bucketId:bucket[i]._id}).count();
        var followerLength = CLT.EnBucketList.find({postId: bucket[i]._id}).count();


        var likeCollection = CLT.ImsLike.find({postId: bucket[i]._id}).fetch();
        var likeCount = 0;
        if(global.fn_isExist(likeCollection)){
          likeCount = likeCollection.length;
        }

        //nickName 찾기
        // var resultUserInfo = _.findWhere(usersInfo, {username : bucket[i].userId});

        result.data.push({
          title: titleTxt,
          content: contentTxt,
          category: bucket[i].category,
          _id: bucket[i]._id,
          userId: bucket[i].userId,
          // nickName: resultUserInfo.profile.nickName,
          like: likeCollection,
          likeCount : likeCount,
          open: bucket[i].open,
          lock: bucket[i].lock,
          regDate: bucket[i].regDate,
          updateDate: bucket[i].updateDate,
          image: bucket[i].images,
          tags: bucket[i].tagList,
          exePlanLength: exePlanLength,
          startDate: bucket[i].startDate,
          completeDate: bucket[i].completeDate,
          isCompleted: bucket[i].isCompleted,
          commentList: comments,
          commentTop: commentTop,
          bucketStoryCount : bucketStoryCount,
          groupCount : bucket[i].groupUsers.length+1,
          followerCount : followerLength,
          isGroup : (bucket[i].groupType === 'group')
        });
      }
    }
    result.count = contentAllCount;

    if (sortBy === 'like') {
      result.data =  _.sortBy(result.data, 'likeCount').reverse();
    }

    // switch(sortBy) {
    //   case 'regDateDesc':
    //   result.data =  _.sortBy(result.data, 'regDate').reverse();
    //   break;
    //   case 'regDateAsc':
    //   result.data =  _.sortBy(result.data, 'regDate');
    //   break;
    //   case 'startDateDesc':
    //   result.data =  _.sortBy(result.data, 'startDate').reverse();
    //   break;
    //   case 'startDateAsc':
    //   result.data =  _.sortBy(result.data, 'startDate');
    //   break;
    //   case 'like':
    //   result.data =  _.sortBy(result.data, 'likeCount').reverse();
    //   break;
    // }
  }
  return result;
},
bucketUpsert: function(_id, data) {
  return CLT.EnBucketList.upsert(
    {'_id': _id},
    {$set: data,
      // $setOnInsert: {'regDate': global.utilGetDate().default}
      $setOnInsert: {'regDate': global.utilGetDate().default}
    }
  );
},
bucketDelete: function(_id, userId){
  CLT.EnBucketList.remove(_id);
  CLT.ImsComment.remove({postId: _id});
  CLT.ImsLike.remove({postId: _id});
  // 상속된 컨텐츠 삭제
  CLT.Inh.update(
    {userId: userId},
    {
      $pull: { contents: {contentId: _id}, instContents: {contentId: _id} }
    },{multi: true}, function(error) {
      if (!error) {
        var inhInfo = CLT.Inh.find({userId, userId}).fetch();
        // 상속된 컨텐츠를 제거한뒤 상속받은 컨텐츠가 없으면 상속받은 날짜를 제거함
        inhInfo.map(function(item) {
          if (item.instContents.length === 0) {
            CLT.Inh.update({userId: item.userId, inheritorId: item.inheritorId}, {$unset: {instDate: ''}});
          }
        });
      }
    }
  );
  //속해있던 버키스토리의 _id 정보를 넘긴다.
  return CLT.EnStory.find({postId : _id},{fields:{_id:1}}).fetch();

},
bucketGetStateCount: function(userId, selectedTapMenu){
  var countObject = {};
  var conditionParam = [];
  var serchObject = {};
  var condition = [];
  if(_.isEqual(selectedTapMenu, 'my')){
    condition = [{'userId':userId},{'groupUsers':{$in:[userId]}}];
  } else {
    //비공개는 카운트 하지 않음
    condition = [{lock:false}];
    //condition = [{}];
  }

  countObject.totalCount = CLT.EnBucketList.find({$or:condition}).count();
  countObject.completeCount = CLT.EnBucketList.find({$and:[{$or:condition}, {isCompleted:true}]}).count();
  countObject.ingCount = CLT.EnBucketList.find({$and:[{$or:condition, isCompleted:false}]}).count();
  // 따라가기 카운트
  var follow = CLT.EnBucketList.find({$and:[{$or:condition, follow:true }]}).fetch();
  var followUniq = follow.reduce(function(a, b) {
    if (a.indexOf(b.postId) < 0) {
      a.push(b.postId);
    }
    return a;
  },[]);
  countObject.followCount = CLT.EnBucketList.find({_id: {$in: followUniq}}).count();

  return countObject;
},
removeGroupId: function(_id, groupData){
  CLT.EnBucketList.update({_id:_id},{$set:{groupUsers:groupData}});
},

bucketListRandom: function(tag, userId, limit) {
  var stage = [
    {$match: {tagList: {$in: tag}, userId: {$ne:userId}, groupUsers: {$ne: userId}, images: {$ne: []}}},
    {$sample: {size: limit}}
  ];
  if (Meteor.isServer) {
    var result = CLT.EnBucketList.aggregate(stage);
    return result;
  }
},

isNotThereUsedFile: function(imgPath,fromType){
  var countParam = 1;
  switch(fromType){
    case global.s3.folder.timeCapsule://"time_capsule_images"
    countParam = CLT.EnCapsuleMessage.find({backgroundImage:{$in:[imgPath]}}).count();
    countParam = countParam + CLT.EnTimeCapsule.find({'image.path':{$in:[imgPath]}}).count();
    if(countParam === 0){
      return true;
    }
    return false;

    case global.s3.folder.inheritance://"inheritance_images":
    countParam = CLT.Inh.find({"lastLetter.image":{$in:[imgPath]}}).count();
    if(countParam === 0){
      return true;
    }
    return false;

    case global.s3.folder.bucketList://"bucketlist_images":
    countParam = CLT.EnBucketList.find({'images.$.path':{$in:[imgPath]}}).count();
    if(countParam === 0){
      return true;
    }
    return false;

    case global.s3.folder.im://"추억 이미지":
    countParam = CLT.EnStory.find({'images.$.path':{$in:[imgPath]}}).count();
    if(countParam === 0){
      return true;
    }
    return false;

    default:
    return true;
  }
},
//barchart용 count조회
bucketChartMyCount: function(user,categorys){
  var categoryItem = [];
  categoryItem = Object.keys(categorys);
  var counterList = [];
  var ingCount = {};
  var completeCount = {};
  var condition = {};
  if(user){
    condition = {$or:[{userId:user},{groupUsers:{$in:[user]}}]};
  }

  for(var i=0; i<categoryItem.length ; i++){
    ingCount[categoryItem[i]] = CLT.EnBucketList.find({$and:[condition,{category:categoryItem[i]},{isCompleted:false}]}).count();
    completeCount[categoryItem[i]] = CLT.EnBucketList.find({$and:[condition,{category:categoryItem[i]},{isCompleted:true}]}).count();
  }
  counterList.push(ingCount);
  counterList.push(completeCount);
  return counterList;
},
//my 버킷 목록count
getMybucketCountInfo: function(userid){
  var returnCount = {};
  var condition = [{}];
  if(userid){
    condition = [{'userId':userid},{'groupUsers':{$in:[userid]}}];
  }
  returnCount.totalCount = CLT.EnBucketList.find({$or:condition}).count();
  returnCount.completeCount = CLT.EnBucketList.find({$and:[{$or:condition}, {isCompleted:true}]}).count();
  returnCount.ingCount = CLT.EnBucketList.find({$and:[{$or:condition, isCompleted:false}]}).count();
  returnCount.iFollow = CLT.EnBucketList.find({$and:[{$or:condition, follow:true }]}).count();
  var myBucketList = CLT.EnBucketList.find({$or:condition },{fields:{'_id':1}} ).fetch();
  var searchParam = [];
  for(var i=0; i<myBucketList.length ; i++){
    searchParam.push(myBucketList[i]._id);
  }
  returnCount.myFollower = CLT.EnBucketList.find({postId:{$in:searchParam}}).count();
  return returnCount;
},
getBucketChartRank: function(){

  // var bucketCountObj = EnBucketList.aggregate([{
  //                         $group : {_id:"$userId",count:{ $sum: 1}}
  //                       }]);
  // var topfiveUsers = _sortBy(bucketCountObj,'count').splice(0,5);
  //
  // var renderChartData = _.countBy(bucketCountObj,function(num){
  //                   if(num<10){
  //                       return "10";
  //                     }else if(num<30){
  //                       return '30';
  //                     }else if(num <50){
  //                       return '50';
  //                     }else if(num <80){
  //                       return '80';
  //                     }else if(num <100){
  //                       return '100';
  //                     }else if(num <150){
  //                       return '150';
  //                     }else if(num <200){
  //                       return '200';
  //                     }else if(num >200){
  //                       return '200over';
  //                     }
  //                 });



// 완료 버킷 카운트
  // db.endingNoteBucketList.aggregate([
  //   	{$match: { completeDate:{"$ne":""}}},
  // 	{$group : {_id:"$userId",count:{ $sum: 1}}},
  // ])

  var renderChartData = {
    under10 : '50',
    under20 : '34',
    under30 : '11',
    under40 : '9',
    over40 : '4',
    rankers : [
      {userNick: '꿈꾼이', listCount: 65, lateContent:'아랍어 배우기'},
      {userNick: '크러쉬', listCount: 40, lateContent:'월드투어(10개국 이상)'},
      {userNick: '신두유', listCount: 31, lateContent:'개껌 200모으기'},
      {userNick: '딘', listCount: 21, lateContent:'패셔니스타로 선정되기'},
      {userNick: '지호', listCount: 15, lateContent:'걸그룹과 연애하기'},
    ]
  };
  var renderChartCompData = {
    under10 : '43',
    under20 : '41',
    under30 : '21',
    under40 : '10',
    over40 : '4',
    rankers : [
      {userNick: '꿈꾼이', listCount: 65, lateContent:'아랍어 배우기'},
      {userNick: '크러쉬', listCount: 40, lateContent:'월드투어(10개국 이상)'},
      {userNick: '신두유', listCount: 31, lateContent:'개껌 200모으기'},
      {userNick: '딘', listCount: 21, lateContent:'패셔니스타로 선정되기'},
      {userNick: '지호', listCount: 15, lateContent:'걸그룹과 연애하기'},
    ]
  };
  var arrayDatas = [];
  arrayDatas.push(renderChartData);
  arrayDatas.push(renderChartCompData);
  return arrayDatas;
},

removeUsersBStory: function(postId,userId){
  if(Meteor.isServer){
    var users = [];
    if(userId){
      //userId가 없으면 버킷 삭제
      var usersGroup = CLT.EnBucketList.findOne({_id:postId},{fields:{groupUsers:1,userId:1}})||[];
      users = usersGroup.groupUsers;
      users.push(usersGroup.userId);
    }
    var storyData = CLT.EnStory.find({postId: postId, userId: {$nin:users}}).fetch();

    if (storyData.length !== 0) {
      CLT.EnStory.update({postId:postId,userId:{$nin:users}},{$set:{type:'IM',postId:''}},{multi:true});
      var today = global.utilGetDate().defaultYMD;
      var todays = global.utilGetDate().default;
      storyData.map(function(item) {
        CLT.EnTimeline.update({postId: item._id, userId: item.userId, type:'BS', contentType: 'E'}, {$set: {type: 'IM'}});
        CLT.EnTimeline.insert({postId: item._id, userId: item.userId, timeClass: 'start',
        updateDate: todays, regDate: todays, contentType: 'H', type: 'IM', timelineDate: today, sort: 2});
        CLT.EnHistory.insert({postId: item._id, typeKey: item._id, commentKey: '', userId: item.userId,
        postType: 'IM', type:'WR', user: '', timelineDate: today, updateDate: todays, regDate: todays});
      });
    }
  }
},

bucketSearchFind: function(userId, searchCondition, searchText) {
  // 검색텍스트 ',' 로 구분해서 여러개 찾기
  searchText = searchText.split(',');
  var srchTextArr = [];
  for (var t = 0; t < searchText.length; t++) {
    // srchTextArr.push(searchText[t].replace(/ /g, '')); //텍스트의 모든공백제거
    srchTextArr.push(searchText[t].trim()); // 앞뒤 공백 제거
  }
  searchText = srchTextArr;

  var regex = [];
  for (var s = 0; s < searchText.length; s++) {
    var tempStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
    regex.push(tempStr);
  }

  var condition = [];

  switch (searchCondition) {
    case 'title': condition=[{userId: userId}, {groupUsers: userId}, {'title': {$in: regex}}];
    break;
    case 'content': condition=[{userId: userId}, {groupUsers: userId}, {'content': {$in: regex}}];
    break;
    case 'tag': condition=[{userId: userId}, {groupUsers: userId}, {'tagList': {$in: regex}}];
    break;
    default:
    condition = [
      {userId: userId},
      {groupUsers: userId},
      {"title": {$in: regex}},
      {"content": {$in: regex}},
      {"tagList": {$in: regex}}
    ];
  }

  var bkData = CLT.EnBucketList.find(
    {
      $or:condition,
      'userId': userId,
    },
    {sort: {regDate: -1} }
  ).fetch();

  var bk = [];
  bkData.map(function(item) {
    // DB에 content에 태그도 조건검색 방지
    if (searchText.toString() !== "") {
      for (var j = 0; j < searchText.length; j++) {
        var title = item.title.replace(/(<([^>]+)>)/gi, "");
        var content = item.content.replace(/(<([^>]+)>)/gi, "");
        var tag = item.tagList;
        var regSearch = new RegExp([searchText[j], ".*"].join(""), "");
        if (title.match(regSearch) || content.match(regSearch) || _.indexOf(tag, searchText[j]) !== -1) {
          bk.push(item);
        }
      }
    } else {
      bk.push(item);
    }
  });

  return _.intersection(bk, bk); // 똑같은 데이터 하나로 합치기
},

bucketUpdate: function(_id, data) {
  CLT.EnBucketList.update(
    {_id: _id},
    data
  );
},
//따라하기 허용여부 설정
bucketFollowPermitUpdate : function(_id, bool){
  CLT.EnBucketList.update(
    {_id: _id},
    {$set:{privFollow:bool}}
  );
},
//버킷 허용여부 설정
bucketCompleteUpdate : function(_id, bool){
  CLT.EnBucketList.update(
    {_id: _id},
    {$set:{isCompleted:bool}}
  );
},
//따라하기 카운트
bucketFollowerCount : function(id){
  return CLT.EnBucketList.find({postId:id}).count();
},
//유저 삭제
bucketDeleteMember : function(id,user){
  CLT.EnBucketList.update({_id:id},{$pull:{groupUsers:user}});
},
getBucketStroyData : function(_contentId){
    var bucket = CLT.EnBucketList.findOne({_id: _contentId});
    var isExistBS = CLT.EnStory.find({postId: _contentId, type:'BS'}).count() > 0 ? true : false;

    if (bucket) {
      bucket.isExistBS = isExistBS;
    }
  return bucket;
},
//따라하기 유져 리스트
bucketGetFollowUserList : function(contentId){
  return CLT.EnBucketList.find({postId:contentId},{userId:1}).fetch();
}

});
