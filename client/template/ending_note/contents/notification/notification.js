import {global} from '/imports/global/global_things.js';

// notification
var templateName = 'notification';
var instance;

Template[templateName].onCreated(function(){
  instance = this;
  instance.username = Meteor.users.findOne().username;
  instance.notiList = new ReactiveVar();
  instance.selected = new ReactiveVar();

  initNotificationList();
});

function initNotificationList(){
  Meteor.call('getNoti', instance.username, function(error, result){
    if(error){
      return console.log(error);
    } else {
      console.log('getNoti result', result);
      var notiData = result;
      _.each(notiData, function(noti){
        noti.isNew = false;
        regDate = global.utilGetDate(noti.regDate).defaultYMD;
        if(global.fn_diffDate(regDate).diffDay === 1 || global.fn_diffDate(regDate).diffDay === 'day'){
          noti.isNew = true;
        }
        noti.isReaded = noti.opened;
      });
      instance.notiList.set(notiData);
    }
  });
}

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');

  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpNotification : function(){
    return Template.instance().notiList.get();
  },
  hpSelectedId: function(){
    return Template.instance().selected.get();
  },
  hpTypeName: function(type, contentType){
    var typeName = '';
    switch(type){
      case 'IM':
      typeName = '나는';
      break;
      case 'BL':
      typeName = '버킷리스트';
      break;
      case 'TC':
      typeName = '타임캡슐';
      break;
      case 'BS':
      typeName = '버키스토리';
      break;
      case 'MG':
      typeName = '쪽지함';
      break;
      case 'CT':
      typeName = '고객센터';
      break;
      case 'IH':
      typeName = '상속';
      break;
      case 'GD':
      typeName = '가디언';
      break;
      case 'FR':
        switch(contentType) {
          case 'accept': typeName = '친구수락'; break;
          case 'refusal': typeName = '친구거절'; break;
          default: typeName = '친구요청'; break;
        }

      break;
    }
    return typeName;
  }
});

Template[templateName].events({
  "click .list-group-item": function(e, t){
    e.preventDefault();

    var self = this;
    var templateData = {};
    var data = {};
    var modalobj = {};
    var setData={};

    $(e.currentTarget).addClass('visited');
    t.selected.set(self._id);

    if(!self.isReaded){
      setData = {
        opened : true
      };
      Meteor.call('updateNoti', self._id, t.username, setData);
    }

    Meteor.call('isContentExist', self.contentId, self.type, function(error, result){
      if(error){
        console.log(error);
      } else {
        var button = {
          confirm: '삭제',
          cancel: '취소'
        };

        console.log('self', self);

        // 댓글 && 좋아요 && 따라하기 && 그룹 이동
        switch(self.contentType) {
          case 'comment': case 'subComment': case 'like': case 'follow': case 'write': case 'groupDelete': case 'message': case 'bury':
          case 'delete': case 'open': case 'openPlz':
            if(result){
              templateData = {
                data: {_id: self.contentId}
              };
              switch(self.type) {
                case 'IM': case 'BS':
                  templateData.headerTmp = 'endingNoteListHeaderIm';
                  templateData.contentTmp = 'imDetail';
                  utilTemplateMove(templateData.headerTmp, templateData.contentTmp, templateData.data);
                break;
                case 'BL':
                  templateData.headerTmp = 'endingNoteListHeaderBucketList';
                  templateData.contentTmp = 'bucketDetail';
                  utilTemplateMove(templateData.headerTmp, templateData.contentTmp, templateData.data);
                break;
                case 'TC':
                  templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
                  templateData.contentTmp = 'timeCapsuleDetail';
                  templateData.data.serchOption = {};
                  templateData.contentTmp = 'timeCapsuleDetail';

                  Meteor.call('getCapsuleInnerData', self.contentId, function(error, result) {
                    if (!error) {
                      templateData.data.innerData = result;
                      var openedFlag = false;
                      result.groupMember.map(function(item) {
                        if (item.userId === t.username) {
                          if (item.openedDate) {
                            openedFlag = true;
                          }
                        }
                      });
                      var today = new Date().format('yyyy-MM-dd');
                      if(new Date(result.unsealDate) <= new Date(today) && !openedFlag){ // 개봉함
                        templateData.data.innerData = result;
                        templateData.contentTmp = 'timeCapsuleOpenEffect';
                      } else {
                        templateData.contentTmp = 'timeCapsuleDetail';
                      }
                      utilTemplateMove(templateData.headerTmp, templateData.contentTmp, templateData.data);
                    }
                  });

                break;
              }
            } else {
              global.utilConfirm('해당 게시물이 삭제되었습니다.<br/>,' + '알림내용을 삭제하시겠습니까?', null, button).then(function(val) {
                if (val) {
                  Meteor.call('deleteConetents', self._id);
                  initNotificationList();
                }
              }).catch(swal.noop);
            }
          break;
        }




        switch(self.type){
          case 'IM': case 'BS':
          // if(self.contentType === 'subComment'){//추억답글 && 버키스토리답글
          //   if(result){
          //     //나는 >상세컨텐츠로 이동
          //     templateData = {
          //       headerTmp: 'endingNoteListHeaderIm',
          //       contentTmp: 'imDetail',
          //       data: {_id: self.contentId}
          //     };
          //     opener.parent.Session.set('endingNoteList templateData', templateData);
          //   } else {
          //     global.utilConfirm('해당 게시물이 삭제되었습니다.<br/>,' + '알림내용을 삭제하시겠습니까?', null, button).then(function(val) {
          //       if (val) {
          //         Meteor.call('deleteConetents', self._id);
          //         initNotificationList();
          //       }
          //     }).catch(swal.noop);
          //   }
          // }
          break;
          // case 'BS':
          // if(self.contentType === 'subComment'){//버키스토리답글
          //   if(result){
          //     //버키스토리 > 상세컨텐츠로 이동
          //     data._id = self.contentId;
          //     data.subId = self.subContentId;
          //     console.log('data', data);
          //     global.utilTemplateMove('endingNoteListHeaderBucketList', 'bucketDetail', data);
          //     // var template = {
          //     //   headerTmp: 'endingNoteListHeaderBucketList',
          //     //   contentTmp: 'bucketDetail',
          //     //   data: {
          //     //     _id: self.contentId,
          //     //     subId: self.subContentId
          //     //   }
          //     // };
          //     // console.log('template', template);
          //     // opener.parent.Session.set('endingNoteList templateData', template);
          //   } else {
          //     global.utilConfirm('해당 게시물이 삭제되었습니다.<br/>,' + '알림내용을 삭제하시겠습니까?', null, button).then(function(val) {
          //       if (val) {
          //         Meteor.call('deleteConetents', self._id);
          //         initNotificationList();
          //       }
          //     }).catch(swal.noop);
          //   }
          // }
          // break;
          case 'BL':
          // if(self.contentType === 'subComment'){//버킷리스트답글
          //   if(result){
          //     //버킷리스트 > 상세컨텐츠 이동
          //     templateData = {
          //       headerTmp: 'endingNoteListHeaderBucketList',
          //       contentTmp: 'bucketDetail',
          //       data: {_id: self.contentId}
          //     };
          //     opener.parent.Session.set('endingNoteList templateData', templateData);
          //   } else {
          //     global.utilConfirm('해당 게시물이 삭제되었습니다.<br/>,' + '알림내용을 삭제하시겠습니까?', null, button).then(function(val) {
          //       if (val) {
          //         Meteor.call('deleteConetents', self._id);
          //         initNotificationList();
          //       }
          //     }).catch(swal.noop);
          //   }
          // }
          break;
          case 'BLT':
          //버킷리스트 > 통계로 이동
          global.utilTemplateMove('endingNoteListHeaderBucketList', 'bucketChart', data);
          break;
          case 'TC':
          // if(self.contentType === 'deleted'){ //개별(수신자있음)타임캡슐 삭제
          //   var mainText = global.notification.messageContext.deletedTC;
          //   var authorNick = global.fn_getNickName(self.options.userId);
          //   var tcTitle = self.options.contentTitle;
          //   var deletedDate = global.utilGetDate(self.options.contentRegDate).korYMD;
          //
          //   mainText = mainText.replace('index[0]',deletedDate);
          //   mainText = mainText.replace('index[1]',tcTitle);
          //   mainText = mainText.replace('index[2]',authorNick);
          //
          //   //[팝업] 타임캡슐 삭제되었다는 메시지 들어있는 팝업
          //   modalobj.template = t.$(e.currentTarget).data('modal-template');
          //   modalobj.size = 'imsr-pop modal-md';
          //   modalobj.fade = false;
          //   modalobj.backdrop = 'static';
          //   modalobj.data = {
          //     modalTitle : '받은 쪽지', //팝업 타이틀
          //     contentTitle : '<span class="important"></span>' +  self.title, //제목
          //     context : mainText, //본문
          //     regDate : global.utilGetDate(self.regDate).defaultYMD
          //   };
          //   // global.utilModalOpen(e, modalobj);
          //   opener.parent.Template.modal.__helpers.get('modalRequest')(e, modalobj);
          //   break;
          // }

          // if(self.contentType === 'openPlz'){
          //   Meteor.call('getTimeCapsuleById', self.contentId, function(error, result){
          //     if(error){
          //       console.log('error : ' + error);
          //     } else {
          //       var searchOptionParam = {};
          //       templateData = {};
          //
          //       var isOpend = _.has(_.findWhere(result.groupMember, {userId:global.login.userId}), 'openedDate');
          //       if(isOpend){ //열림
          //         templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
          //         templateData.contentTmp = 'timeCapsuleDetail';
          //         templateData.data = {
          //           _id : result._id,
          //           selectedMenu : 'my',
          //           searchOption : searchOptionParam,
          //           statusMenu : 'unseal',
          //           contentTmp : 'timeCapsuleContentUnseal'
          //         };
          //       } else {
          //         templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
          //         templateData.contentTmp = 'timeCapsuleOpenEffect';
          //         templateData.data = {
          //           _id : result._id,
          //           searchOption : searchOptionParam,
          //           innerData : result
          //         };
          //       }
          //
          //       opener.parent.Session.set('endingNoteList templateData', templateData);
          //     }
          //   });
          //   break;
          // }

          // if(result){//수신된 타임캡슐 알림
          //   // data._id = self.contentId;
          //   // global.utilTemplateMove('endingNoteListHeaderTimeCapsule', 'timeCapsuleDetail', data);
          //   templateData = {
          //       headerTmp: 'endingNoteListHeaderTimeCapsule',
          //       contentTmp: 'timeCapsuleDetail',
          //       data: {_id: self.contentId}
          //     };
          //   opener.parent.Session.set('endingNoteList templateData', templateData);
          // } else {
          //   global.utilConfirm('해당 게시물이 삭제되었습니다.<br/>,' + '알림내용을 삭제하시겠습니까?', null, button).then(function(val) {
          //     if (val) {
          //       Meteor.call('deleteConetents', self._id);
          //       initNotificationList();
          //     }
          //   }).catch(swal.noop);
          // }
          break;


          case 'IH' :
          //상속 > 상속받은내역 Open
          opener.parent.$(".inh-container").show().animate( { left: 0 }, 500 );

          templateData.contentTmp = 'inheritanceList';
          opener.parent.Session.set('inheritanceMain templateData', templateData);
          break;
          case 'GD':
          opener.parent.$(".inh-container").show().animate( { left: 0 }, 500 );
          if(self.contentType === 'receive'){ //가디언 요청받음
            //[container]상속 > 가디언 > 내가 가디언 화면 Open
            templateData.contentTmp = 'inheritanceGuardians';
            templateData.data = {
              //옵션으로 구분(내가 가디언)
              pageType : global.pageType.imGuardian
            };
            opener.parent.Session.set('inheritanceMain templateData', templateData);
            break;
          }
          if(self.contentType === 'accept' || self.contentType === 'refusal'){ //가디언 요청 수락/거절
            //[container]상속 > 가디언 > 나의 가디언 화면 Open
            templateData.contentTmp = 'inheritanceGuardians';
            templateData.data = {
              //옵션으로 구분(나의 가디언)
              pageType : global.pageType.myGuardian
            };
            opener.parent.Session.set('inheritanceMain templateData', templateData);
            break;
          }
          break;
          case 'FR' :
          opener.parent.$(".mypage-container").show().animate( { left: 0 }, 500 );
          opener.parent.Session.set('myPageMenu selectedMenu', 'friend');
          if(self.contentType === 'receive'){ //친구요청받음
            //[container]마이페이지>친구관리>받은 요청
            templateData.contentTmp = 'myPageFriend';
            templateData.data = {
              tabName : 'myPageFriendRequest',
              menuType : 'receive'
            };
            opener.parent.Session.set('myPageMain templateData', templateData);
            break;
          }
          if(self.contentType === 'refusal'){ //친구요청 거절
            //[container]마이페이지>친구관리>보낸 요청
            templateData.contentTmp = 'myPageFriend';
            templateData.data = {
              tabName : 'myPageFriendRequest',
              menuType : 'request'
            };
            opener.parent.Session.set('myPageMain templateData', templateData);
            break;
          }
          if(self.contentType === 'accept'){ //친구요청 수락
            //[container]마이페이지>친구관리>목록
            templateData.contentTmp = 'myPageFriend';
            opener.parent.Session.set('myPageMain templateData', templateData);
            break;
          }
          break;
          case 'MG': case 'CT' :
          if(self.contentType === 'msgReceive'){ //쪽지 받음
            //[팝업]쪽지팝업 Open
            modalobj.template = t.$(e.currentTarget).data('modal-template');
            modalobj.size = 'imsr-pop modal-md';
            modalobj.fade = false;
            modalobj.backdrop = 'static';
            modalobj.data = {
              modalTitle : '받은 쪽지', //팝업 타이틀
              contentTitle : self.title, //제목
              context : self.options.context, //본문
              sender : self.options.userId,
              profileImg : global.fn_getUsersProfileImageString(global.login.pageOwner, 'thumb') ? global.fn_getUsersProfileImageString(global.login.pageOwner, 'thumb') : '/images/bg/avata_big.png',
              regDate : global.utilGetDate(self.regDate).defaultYMD
            };
            opener.parent.Template.modal.__helpers.get('modalRequest')(e, modalobj);
            break;
          }
          if(self.contentType === 'notice'){ //공지사항 알림
            Meteor.call('getNoticeById', self.contentId, function(error, result){
              if(error){
                return  console.log(error);
              } else {
                var mainText = result.content;

                //[팝업] 공지사항 알림창
                modalobj.template = t.$(e.currentTarget).data('modal-template');
                modalobj.size = 'imsr-pop modal-md';
                modalobj.fade = false;
                modalobj.backdrop = 'static';
                modalobj.data = {
                  modalTitle : '공지사항', //팝업 타이틀
                  contentTitle : '<span class="important"></span>' +  result.title, //제목
                  context : mainText, //본문
                  regDate : global.utilGetDate(result.regDate).defaultYMD
                };
                opener.parent.Template.modal.__helpers.get('modalRequest')(e, modalobj);
              }
            });
            break;
          }
          if(self.contentType === 'recommend'){ //1:1 답변
            opener.parent.$(".customer-container").show().animate( { left: 0 }, 500 );
            opener.parent.Session.set('customerMenu selectedMenu', 'qna');
            //[container]고객센터 1:1문의로 이동
            templateData.contentTmp = 'customerQna';
            opener.parent.Session.set('customerMain templateData', templateData);
            break;
          }
          if(self.contentType === 'signUp'){ //신규가입
            //[팝업]가입축하
            modalobj.template = t.$(e.currentTarget).data('modal-template');
            modalobj.size = 'imsr-pop modal-md';
            modalobj.fade = false;
            modalobj.backdrop = 'static';
            modalobj.data = {
              modalTitle : '받은 쪽지', //팝업 타이틀
              contentTitle : self.title, //제목
              context : global.notification.messageContext.signUp, //본문
              regDate : global.utilGetDate(self.regDate).defaultYMD
            };
            opener.parent.Template.modal.__helpers.get('modalRequest')(e, modalobj);
            break;
          }
          if(self.contentType === 'payment'){ //서비스 결제완료
            //[팝업]결제완료
            break;
          }
          if(self.contentType === 'paymentError'){ //서비스 결제오류1,2,3차
            //[팝업]결제오류(숫자에 따라 다른 팝업)
            break;
          }
          if(self.contentType === 'changePassword'){ //비밀번호 변경요청 알림
            //[팝업]비밀번호 변경
            break;
          }
          break;
        }
      }
    });




  }
});

// 템플릿이동
var utilTemplateMove = function(header, content, data) {
  var template = {
    headerTmp: header
  };
  opener.parent.Session.set('endingNoteList templateData', template);

  setTimeout(function(){
    var templateData = {
      headerTmp: header,
      contentTmp: content,
      data: data
    };
    setTimeout(function() {
      opener.parent.Session.set('endingNoteList templateData', templateData);
    });
  }, 100);
};
