import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsLike = new Mongo.Collection('imsLike');

Meteor.methods({
  // 좋아요 등록
  setLike: function(postId, obj) {
    CLT.ImsLike.insert({
      postId : postId,
      type: obj.type,
      userId : obj.userId,
      authorId : obj.authorId,
      regDate : global.utilGetDate().default
    });
  },

  // 좋아요 해제
  removeLike: function(postId, obj){
    CLT.ImsLike.remove({postId : postId, userId: obj.userId});
  },

  getLikeList: function(postId) {
    return CLT.ImsLike.find({postId: postId}).fetch();
  }
});