import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

var templateName = 'endingNoteComment';
var instance;

Template[templateName].onCreated(function(){
  instance = this;
  instance.comments = new ReactiveVar();
  instance.mainComment = new ReactiveVar();
  instance.postData = instance.data.postData;
  instance.commentLimitCount = new ReactiveVar(global.commentIncrement);
  instance.required = new ReactiveVar(false);
  instance.isDropup = new ReactiveVar();
  Session.set('endingNoteComment cmtUpdate', null); // 댓글 수정영역
  Session.set('endingNoteComment cmtReply', null);  // 댓글 답글영역

  var subscription = instance.subscribe('getComments', instance.postData._id);
  instance.autorun(function(){
    if(subscription.ready()){
      var commentsData = CLT.ImsComment.find({postId : instance.postData._id}, {sort: {regDate: -1}}).fetch();

      //1. 어떤 유저들이 있는지확인 및 distinct
      if(commentsData){
        var userIds = _.uniq(_.pluck(commentsData, 'userId'));
        //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
        Meteor.call('getNickAndImg', userIds, function(error, result){
          if(error){
            console.log(error);
          } else {
            var userInfo = result;
            //3. userInfo와 comments를 비교하여 일치하는 사용자정보에 userInfo를 add하기
            _.map(commentsData, function(info){
              var extend = _.findWhere(userInfo, {userId : info.userId});
              info.nickName = extend.nickName;
              info.profileImg = extend.profileImg;
            });

            instance.comments.set(commentsData);
          }
        });
      }
    }
  });
});

Template[templateName].onRendered(function(){
  $('#txtComment').blur(function() {
    instance.required.set(false);
  });
  $('.navbar a.dropdown-toggle').on('click', function(e) {
    var $el = $(this);
    var $parent = $(this).offsetParent(".dropdown-menu");
    $(this).parent("li").toggleClass('open');

    return false;
  });
});

Template[templateName].onDestroyed(function(){
  Session.set('endingNoteComment cmtUpdate', null); // 댓글 수정영역
  Session.set('endingNoteComment cmtReply', null);  // 댓글 답글영역
});

Template[templateName].events({
  // 댓글입력 이벤트
  "keypress #txtComment": function(e, t) {
    if (e.keyCode === 13) {
      var comment = t.find('#txtComment').value;
      // comment = comment.replace(/\s/g, "");//엔터제거
      if (global.utilValidation(t) && comment) {
        var objData = {
          postId: this.postData._id,
          postUserId: this.postData.userId,
          parentPostId : this.postData.postId,
          replyKey: '',
          userId: global.login.userId,
          type: this.postData.type,
          content: comment,
          updateDate: global.utilGetDate().default,
          groupMember: this.postData.groupMember ? this.postData.groupMember : null, // 타임캡슐 그룹맴버
          groupUsers: this.postData.groupUsers ? this.postData.groupUsers : null, // 버킷리스트 그룹맴버
          status: this.postData.status,
          title: this.postData.title
        };
        $('#txtComment').blur().val('');
        commentUpsert(objData, null, 'txtComment', 'insert');
      }
    }
    //textarea height 자동 resizing
    global.fn_textareaResizing(e.target);
  },
  //댓글 popup 이벤트
  "click .comment-alert": function(e, t) {
    e.preventDefault();
    $(e.currentTarget).parent().find('.comment-pop').show();
  },
  'click #showMore': function(e,t){
    var count = t.commentLimitCount.get() + global.commentIncrement;
    t.commentLimitCount.set(count);
  },
  //사용자 프로파일 클릭
  "click .dropdown-toggle" : function(e, t){
    var nameCardHeight = 370;// 네임카드의 높이
    if((nameCardHeight + $(e.currentTarget).offset().top) > window.innerHeight){
      t.isDropup.set(true);
    } else {
      t.isDropup.set(false);
    }
    // t.selectedItem.set(this._id);
  },
});

Template[templateName].helpers({
  hpCollection: function() {
    var mainLimitedComment = [];
    var mainComment = [];
    if(Template.instance().comments.get()){
      var count = 0;
      _.each(Template.instance().comments.get(), function(comment){
        if(!comment.replyKey){
          count++;
          if(count <= Template.instance().commentLimitCount.get()){
            mainLimitedComment.push(comment);
          }
          mainComment.push(comment);
        }
      });
      Template.instance().mainComment.set(mainComment);
    }
    return mainLimitedComment;
  },
  hpRequired: function() {
    return Template.instance().required.get(); //Session.get('endingNoteComment required');
  },
  //더보기 버튼 표시 여부
  hpIsShowButton: function(){
    if(Template.instance().mainComment.get()){
      if(Template.instance().mainComment.get().length >  Template.instance().commentLimitCount.get()){
        return true;
      }else{
        return false;
      }
    }
  }
});




Template.endingNoteCommentDetail.helpers({
  hpCmtUpdateKey: function() {
    return Session.get('endingNoteComment cmtUpdate');
  },
  hpCmtReplyKey: function() {
    return Session.get('endingNoteComment cmtReply');
  },
  hpisPublicCapsule: function(_postData){
    var self = this.commentData ? this.commentData : this;
    if (self.type === 'TC' && _postData.status === 'PB') {
      // 공개 타임캡슐일때는 글작성자와 댓글작성자가 같으면 '작성자'라고 표기해준다
      if (self.postUserId === self.userId) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  hpCommentReply: function(_id) {
    if (_id) {
      var replyData = instance.comments.get();//Session.get('endingNoteComment collection');
      return _.where(replyData, {replyKey:_id});
    }
  },
  hpisDropup: function(){
    if(instance.isDropup.get()){
      return 'dropup';
    } else {
      return '';
    }
  }
});

Template.endingNoteCommentDetail.events({
  // 댓글수정 이벤트
  "click #cmtUpdate": function(e, t) {
    e.preventDefault();
    Session.set('endingNoteComment cmtReply', null);
    var cmtKey = e.target.getAttribute('value');
    Session.set('endingNoteComment cmtUpdate', cmtKey);
    //textarea height 자동 resizing
    setTimeout(function(){
      global.fn_textareaResizing('#txtCommentUpdate');
    }, 10);
  },
  // 댓글수정 완료이벤트
  "keypress #txtCommentUpdate": function(e, t) {
    if (e.keyCode === 13) {
      if (global.utilValidation(t)) {
        var self = this.commentData ? this.commentData : this;
        var comment = t.find('#txtCommentUpdate').value;
        var cmtKey = t.find('#txtCommentUpdate').getAttribute('key');
        var objData = {
          postId: self.postId,
          postUserId: self.userId,
          userId: global.login.userId,
          type: self.type,
          content: comment,
          updateDate: global.utilGetDate().default
        };
        $('#txtCommentUpdate').blur().val('');
        commentUpsert(objData, cmtKey, 'txtCommentUpdate');
      }
    }
    //textarea height 자동 resizing
    global.fn_textareaResizing(e.target);
  },
  // 댓글수정취소 이벤트
  "click #cmtCancel": function(e, t) {
    e.preventDefault();
    Session.set('endingNoteComment cmtUpdate', null);
    Session.set('endingNoteComment cmtReply', null);
  },
  // 댓글삭제 이벤트
  "click #cmtDelete": function(e, t) {
    e.preventDefault();
    var self = this.commentData ? this.commentData : this;
    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
        var cmtKey = e.target.getAttribute('value');
        var postId = self.postId;
        Meteor.call('commentDelete', cmtKey, function(error) {
          if (error) {
            return alert(error);
          } else {
            var historyObj = {
              postId: postId,
              cmtKey: cmtKey
            };
            global.utilHistoryComment(historyObj, 'remove');
          }
        });
      }
    }).catch(swal.noop);
  },
  // 답글달기 이벤트
  "click #cmtReply": function(e, t) {
    e.preventDefault();
    Session.set('endingNoteComment cmtUpdate', null);
    var cmtKey = e.target.getAttribute('value');
    Session.set('endingNoteComment cmtReply', cmtKey);
  },
  // 답글달기 완료 이벤트
  "keypress #cmtReplyContent": function(e, t) {
    if (e.keyCode === 13) {
      var comment = e.target.value;
      // comment = comment.replace(/\s/g, "");//엔터제거
      if (global.utilValidation(t) && comment) {

        var cmtKey = e.target.getAttribute('key');  // 답글의 부모 키
        var objData = {
          postId: this.commentData.postId,
          postUserId: this.commentData.postUserId,
          replyKey: cmtKey,
          userId: global.login.userId,
          type: this.commentData.type,
          content: comment,
          updateDate: global.utilGetDate().default,
          groupMember: this.postData.groupMember ? this.postData.groupMember : null, // 타임캡슐 그룹맴버
          groupUsers: this.postData.groupUsers ? this.postData.groupUsers : null, // 버킷리스트 그룹맴버
          status: this.postData.status,
          title: this.postData.title,
          replyUserId: this.commentData.userId
        };
        commentUpsert(objData, null, 'cmtReplyContent', 'insert_sub');
      }
    }
    //textarea height 자동 resizing
    global.fn_textareaResizing(e.target);
  },
  "blur #cmtReplyContent": function(e,t) {
    $("#cmtReplyContent").val('');
  }
});

Template.registerHelper('commentUpdateInput',function(_id, cmtKey) {
  return _id === cmtKey;
});
Template.registerHelper('commentReplyInput',function(_id, cmtKey) {
  return _id === cmtKey;
});


function commentUpsert(objData, _id, clickId, crud) {
  Meteor.call('commentUpsert', objData, _id, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      $('#' + clickId).blur().val(''); // input 의 포커스와 text를 초기화
      Session.set('endingNoteComment cmtUpdate', null);
      Session.set('endingNoteComment cmtReply', null);

      if (crud) {
        objData.typeKey = objData.postId;
        objData.commentKey = result.insertedId;

        switch(objData.type){
          case 'IM':
            global.utilHistoryComment(objData, crud);
            break;
          case 'BS':
            objData.postId = objData.parentPostId;
            global.utilHistoryComment(objData, crud);
            break;
          case 'BL':
            var unshiftUser = global.login.userId;
            if (objData.postUserId !== global.login.userId) {
              unshiftUser = objData.postUserId;
            }
            objData.groupUsers.unshift(unshiftUser);
            objData.groupUsers.map(function(item) {
              objData.postUserId = item;
              global.utilHistoryComment(objData, crud);
            });
            break;
          case 'TC':
            objData.groupMember.map(function(item) {
              objData.postUserId = item.userId;
              global.utilHistoryComment(objData, crud);
            });
            break;
        }
      } else {
        global.utilHistoryComment(objData, crud);
      }

      // 로그 추가
      if (crud === 'insert' || crud === 'insert_sub') {
        if (objData.type === 'BS') {
          Meteor.call('setLog', objData.postId, objData.parentPostId, objData.userId, objData.userId, global.pageType.bucketList, global.utilGetNickName(objData.userId) + global.Message.bucketStoryComment, 'bucketStoryComment', obj.title);
        } else if (objData.type !== 'IM' && objData.status !== 'PB') {
          Meteor.call('setLog', objData.postId, null, objData.userId, objData.userId, objData.type, global.utilGetNickName(objData.userId) + global.Message.comment, 'comment');
        }
      }
    }
  });
}
