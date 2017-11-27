import {global} from '/imports/global/global_things.js';

var templateName = 'dropdownMenuUserCard';
var userId;

Template[templateName].onCreated(function(){
  var instance = this;
  instance.userInfoData = new ReactiveVar();
  userId = global.login.userId;

  instance.autorun(function(){
    if(instance.data.targetUserId){
      Meteor.call('getLatestUserData', userId, instance.data.targetUserId, function(error, result){
        if(error){
          return console.log(error);
        } else {
          instance.userInfoData.set(result);
        }
      });
    }
  });
});

Template[templateName].onRendered(function(){
});

Template[templateName].helpers({
  hpUserData: function(){
    return Template.instance().userInfoData.get();
  }
});

Template[templateName].events({
  'click #aRequestFriend': function(e, t){
    var targetUserId = t.userInfoData.get().targetUserId;
    var callStr = '';
    var notiTitle = '';
    var notiFlag = false;
    var notiType = '';
    var alertMessage = '';
    if(_.isEqual(t.userInfoData.get().code,'NOF')){
      // 친구 요청
      callStr = 'setFriendRequest';
      notiTitle = '친구요청';
      notiFlag = true;
      notiType = 'receive';
      alertMessage = '친구 요청을 보냈습니다.';
    } else if (_.isEqual(t.userInfoData.get().code,'ALF')){
      // 친구 끊기
      callStr = 'setDeleteFriend';
      alertMessage = '친구 끊기를 하였습니다.';
    } else {
      // 친구 수락
      callStr = 'setAcceptFriendRequest';
      notiTitle = '친구수락';
      notiFlag = true;
      notiType = 'accept';
      alertMessage = '친구 수락을 하였습니다.';
    }
    Meteor.call(callStr, userId, targetUserId, function(error, result){
      if(!error){
        global.utilAlert(alertMessage,'success');
        if (notiFlag) {
          var options = {
            userId : global.login.userId
          };
          Meteor.call('setNoti', targetUserId, 'FR', notiTitle, notiType, options);
        }
      }
    });
  },
  'click #aSendMemo': function(e, t){
    // 쪽지보내기 기능 추가
    var modalobj = {};
    modalobj.template = 'myPageMessageWritePopup';
    modalobj.size = 'imsr-pop modal-md';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      content : '',
      receiver : t.userInfoData.get().targetUserId,
    };
    global.utilModalOpen(e, modalobj);
  },
  //엔딩노트 방문
  // 'click #aVisitEndingNote': function(e,t){
  //   e.preventDefault();
  //
  //   Router.go('/endingNote');
  //   //다른사용자의 엔딩노트로 이동하기 위한 pageOnwer설정
  //   var selectedUserId = t.userInfoData.get().targetUserId;
  //   global.fn_setPageOwner(selectedUserId);
  //
  //
  //   // //다이나믹 템플릿
  //   var templateData = {};
  //   Session.set('endingNoteTimeline templateData', templateData);
  //
  //
  //   setTimeout(function() {
  //     //타임라인 설정
  //     templateData.contentTmp = 'timelineMain';
  //     Session.set('endingNoteTimeline templateData', templateData);
  //     Session.set('endingNoteList templateData', null);
  //
  //     //타임라인의 글쓰기 메뉴 활성/비활성을 위해 사용
  //     Session.set('refresh', Session.get('refresh') ? false : true);
  //   },100);
  // }
});
