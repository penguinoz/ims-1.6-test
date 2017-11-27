import {global} from '/imports/global/global_things.js';

var templateName = 'endingNoteLikeSub';
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

    var postId = this.collectionData._id;       // 글key
    var parentPostId = this.collectionData.postId; // 부모 글key
    var postUser = this.collectionData.userId;  // 글주인
    var likeList = this.collectionData.like;    // 좋아요 유저들
    var title = this.collectionData.title;  //글 제목
    var targetTemplateName = this.templateName; //대상 템플릿 명 (버키스토리)
    var likeFlag = t.likeFlag.get(); // 이글에서 현재 접속유저가 좋아요했는지 안했는지 체크
    var postType = this.collectionData.type;

    var parentData = null;
    var bucketObj = {
      _id: parentPostId
    };
    Meteor.call('bucketTimelineGetList', bucketObj, function(error, result) {
      if (error) {
        return alert(error);
      } else {
        parentData = result;

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

        switch(targetTemplateName){
          case 'bucketStoryDetail':
            obj.type = 'BS';
            if(like){
              Meteor.call('setLog', parentPostId, postId, global.login.userId, global.login.userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketList.bucketStoryLike, 'bucketStoryLike', title);
            } else {
              Meteor.call('deleteLog', global.login.userId, parentPostId, null, global.pageType.bucketList, 'bucketStoryLike');
            }
          break;

        }

        Meteor.call(callMath, postId, obj, function(error) {
          if (error) {
            return alert(error);
          } else {
            var groupUsers = parentData[0].groupUsers;
            if (groupUsers.length === 0) {
              global.utilHistoryLike(parentPostId, postUser, otherUser, likeFlag, postId, postType, title); // 히스토리 좋아요 추가
            } else {
              groupUsers.unshift(parentData[0].userId);
              groupUsers.map(function(item) {
                global.utilHistoryLike(parentPostId, item, otherUser, likeFlag, postId, postType, title); // 히스토리 좋아요 추가
              });
            }
          }
        });
      }
    });
  }
});

Template[templateName].helpers({
  likeFlag: function() {
    return Template.instance().likeFlag.get();
  }
});

function likeFlag(instance, likeList) {
  var flag = false;
  if (_.indexOf(likeList, otherUser) !== -1) {
    // 현재 글에서 좋아요를 했는지 않했는지 체크
    flag = true;
  }
  instance.likeFlag.set(flag);
}
