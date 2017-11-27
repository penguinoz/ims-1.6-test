import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsLike = new Mongo.Collection('imsLike');

Meteor.methods({
  // 타임라인에 isGroup컬럼을 추가하고 데이터를 update한다.
  timelineUpdate01: function() {
    //1. 타임라인에 있는 postId, type수집 (isGroup이 없는 놈들만)
    var timelineData = CLT.EnTimeline.find({contentType:'E', type:{$in:['BL','BP','TC']}, isGroup:{$exists:false}},{fields:{type:1, postId:1}}).fetch();
    var postIdByType = _.chain(timelineData).groupBy("type").map(function(value,key){
       return{
         type: key,
         postId: _.pluck(value,'postId')
       };
    }).value();

    // return postIdByType;
    // 1-1. type별 아이디로 각 컬렉션에서 그룹정보 여부 확인
    var result = [];
    _.each(postIdByType, function(info){
      var tempResult = [];
      // ["IM", "BL", "BP", "TC", "ME", "BS"]
      switch(info.type){
        case 'BL':
          tempResult = CLT.EnBucketList.find({_id:{$in:info.postId}, groupType:'group'},{fields:{_id:1}}).fetch();

          if(tempResult.length > 0){
            result = _.union(result, _.pluck(tempResult, '_id'));
          }
          break;
        case 'BP':
          var planResult = CLT.EnBucketListExecPlan.find({_id:{$in:info.postId}},{fields:{bucketId:1}}).fetch();
          var bucketIds = _.pluck(planResult, 'bucketId');

          tempResult = CLT.EnBucketList.find({_id:{$in:bucketIds}, groupType:'group'},{fields:{_id:1}}).fetch();

          if(tempResult.length > 0){
            result = _.union(result, _.pluck(tempResult, '_id'));
          }
          break;
        case 'TC':
          tempResult = CLT.EnTimeCapsule.find({_id:{$in:info.postId}, authorType:'group'},{fields:{_id:1}}).fetch();

          if(tempResult.length > 0){
            result = _.union(result, _.pluck(tempResult, '_id'));
          }
          break;
      }
    });
    // result = ['postId1', 'postId2', 'postId3', ...]; //결과물은 모두 그룹인 postId들

    //2. timeline 업데이트
    //2.1 리턴받은 데이터로 timeline 업데이트
    CLT.EnTimeline.update({postId:{$in:result}},{$set:{isGroup:true}},{multi:true});
    //2.2 'IM', 'BS','ME'는 무조건 isGroup:true
    CLT.EnTimeline.update({isGroup:{$exists:false}},{$set:{isGroup:false}},{multi:true});

    return result;
  }

});