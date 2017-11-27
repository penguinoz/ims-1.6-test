import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsComment = new Mongo.Collection('imsComment');

Meteor.methods({
  // 댓글 등록,수정
  commentUpsert: function(data, _id) {
    delete data.bucketListKey;
    return CLT.ImsComment.upsert(
      {'_id': _id},
      {$set: data,
        // $setOnInsert: {'regDate': global.utilGetDate().default}
        $setOnInsert: {'regDate': global.utilGetDate().default}
      }
    );
  },

  // 댓글 삭제
  commentDelete: function(_id) {
    CLT.ImsComment.remove({$or:[{_id:_id}, {replyKey:_id}]});
  },

  //스토리 이동
  // bucketPostId : 버킷리스트 bucketPostId (없는경우 null로 입력한다 : 버킷-->추억으로 이동)
  moveStory: function(userId, storyId, bucketPostId, changeType) {

    var userIdArray = [];
    var storyIdArray = [];
    if(_.isArray(userId)){
      userIdArray = userId;
    } else {
      userIdArray.push(userId);
    }

    if(_.isArray(storyId)){
      storyIdArray = storyId;
    } else {
      storyIdArray.push(storyId);
    }


    CLT.EnStory.update(
      {$and:[{$or:[
        {_id: {$in: storyIdArray}},
        {postId: bucketPostId}]},
        {userId: {$in: userIdArray}}]
      },
      {$set: {
        type: changeType,
        postId: bucketPostId,
      }},{multi:true}
    );

    CLT.EnTimeline.update(
      {
        postId: {$in: storyIdArray},
        userId: {$in:userIdArray}
      },
      {$set: {
        type:changeType
      }},{multi:true}
    );
  },
  // 내 버킷 스토리 im으로 변경
  // changeTypeToIm: function(postId, userId){
  //   CLT.EnStory.update(
  //     {
  //       postId:postId,
  //       userId:userId
  //     },
  //     {$set: {
  //       type:'IM'
  //     }},{multi:true});
  // },
  // 버킷리스트 추방
  // banishBucketList: function(postId, userIdArry){
  //   CLT.EnStory.update({$and:[{postId:postId},{userId:{$in:userIdArry}}]},{$set:{type:'IM'}},{multi:true});
  // }
});
