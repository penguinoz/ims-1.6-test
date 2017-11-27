import {global} from '/imports/global/global_things.js';
var templateName = 'imChangePasswordPopup';

Template[templateName].onCreated(function(){
  this.userId = this.data.userId;
});

Template[templateName].events({
  // 다음에 변경
  "click #nextTime": function(e, t){
    e.preventDefault();

    Meteor.call('getPwChangeUpdate', t.userId, global.utilGetDate().default, false);
    Modal.hide();
    Session.set('myPageMain profileLogin', false); // 최초 로그인시 마이피에지회원관리 접속세션 제거
    Router.go('/endingNote');
  },
  // 변경완료
  "click #save": function(e, t){
    e.preventDefault();


    var oldPw = t.find('input[name=oldPassword]').value;
    var newPw1 = t.find('input[name=newPassword1]').value;
    var newPw2 = t.find('input[name=newPassword2]').value;

    if (!global.utilPasswordCheck(newPw1) || !global.utilPasswordCheck(newPw2)) {
      return global.utilAlert('패스워드 양식에 맞춰 입력해주세요.');
    }

    if (newPw1 === newPw2) {
      Accounts.changePassword(oldPw, newPw1, function(error) {
        if (error) {
          if (error.reason === 'Incorrect password') {
            return global.utilAlert('비밀번호를 잘못입력하셨습니다.');
          }
        } else {
          // global.utilAlert('비밀번호가 변경되었습니다.', 'success');
          // 비밀번호 변경시 날짜를 변경
          Meteor.call('getPwChangeUpdate', t.userId, global.utilGetDate().default, true);
          Modal.hide();

          var modalobj = {};
          modalobj.template = 'imChangePasswordCompletePopup';
          modalobj.size = 'imsr-pop chg-pwd modal-md3';
          modalobj.fade = false;
          modalobj.backdrop = 'static';
          modalobj.data = {
            content : '',
            receiver : '',
          };

          setTimeout(function(){
            global.utilModalOpen(e, modalobj);
          }, 400);
        }
      });
    } else {
      return global.utilAlert('비밀번호가 서로 다릅니다.');
    }
  }
});