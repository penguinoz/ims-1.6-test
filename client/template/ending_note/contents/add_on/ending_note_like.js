import {global} from '/imports/global/global_things.js';

var templateName = 'endingNoteLike';

var otherUser = null; // 현재 접속자

Template[templateName].onCreated(function(){
  var instance = this;
  this.likeFlag = new ReactiveVar(false);
  otherUser = global.login.userId;
  if (this.data && this.data.collectionData) {
    Meteor.call('getLikeList', this.data.collectionData._id, function(erorr, result) {
      var likeList = [];
      result.map(function(item) {
        likeList.push(item.userId);
      });
      likeFlag(instance, likeList);
    });
  }
});

Template[templateName].events({
  // 좋아요 이벤트
  "click #btnLike": function(e, t) {
    e.preventDefault();
    var title = this.collectionData.title; // 글 제목
    var postId = this.collectionData._id;       // 글key
    var parentPostId = this.collectionData.postId; // 부모 글key
    var postUser = this.collectionData.userId;  // 글주인
    var likeList = this.collectionData.like;    // 좋아요 유저들
    var targetTemplateName = this.templateName;
    var likeFlag = t.likeFlag.get(); // 이글에서 현재 접속유저가 좋아요했는지 안했는지 체크
    var postType = this.collectionData.type;
    var groupUsers = [];
    groupUsers = this.collectionData.groupUsers; // 버킷그룹유저

    var obj = {
      userId: global.login.userId,
      authorId: postUser,
      type: postType
    };
    var like;
    var callMath = null;
    if (likeFlag) {
      // 이미 좋아요하고있는경우
      // obj.like = _.without(likeList, otherUser); // 같은 유저가 있으면 뺀다
      callMath = 'removeLike';
      like = false;
    } else {
      // likeList.unshift(otherUser); // 배열의 제일앞에 추가
      // obj.like = likeList;
      callMath = 'setLike';
      like = true;
    }
    t.likeFlag.set(like);

    switch(this.templateName){
      case 'futureDetail':
        // callMath = 'futureStoryUpsert';
      break;
      case 'bucketDetail':
        // callMath = 'bucketUpsert';
        if(like){
          Meteor.call('setLog', postId, null, global.login.userId, global.login.userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketList.like, 'like');
        } else {
          Meteor.call('deleteLog', global.login.userId, postId, null, global.pageType.bucketList, 'like');
        }
      break;
      case 'timeCapsuleDetail':
        obj.type = 'TC';
        // callMath = 'upsertTimeCapsule';
        // if(like){
        //   Meteor.call('setLog', postId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.like, 'like');
        // }
      break;
      default:
        // callMath = 'storyUpsert';
      break;
    }

    Meteor.call(callMath, postId, obj, function(error) {
      if (error) {
        return alert(error);
      } else {
        if (!groupUsers || groupUsers.length === 0) {
          if (obj.type !== 'BS') {
            global.utilHistoryLike(postId, postUser, otherUser, likeFlag, '', postType, title); // 히스토리 좋아요 추가
          } else {
            global.utilHistoryLike(parentPostId, postUser, otherUser, likeFlag, postId, postType, title); // 히스토리 좋아요 추가
          }
        } else {
          groupUsers.unshift(postUser);
          groupUsers.map(function(item) {
            if (obj.type !== 'BS') {
              global.utilHistoryLike(postId, item, otherUser, likeFlag, '', postType, title); // 히스토리 좋아요 추가
            } else {
              global.utilHistoryLike(parentPostId, postUser, otherUser, likeFlag, postId, postType, title); // 히스토리 좋아요 추가
            }
          });
        }
      }
    });
  }
});

Template[templateName].helpers({
  likeFlag: function() {
    return Template.instance().likeFlag.get();
  }
});

// 현재 글에서 좋아요를 했는지 않했는지 체크
function likeFlag(instance, likeList) {
  var flag = false;
  if (_.indexOf(likeList, otherUser) !== -1) {
    flag = true;
  }
  instance.likeFlag.set(flag);
}
