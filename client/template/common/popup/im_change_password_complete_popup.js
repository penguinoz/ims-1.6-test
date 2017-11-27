var templateName = 'imChangePasswordCompletePopup';

Template[templateName].onCreated(function(){

});

Template[templateName].events({
  "click #confirm": function(e, t){
    e.preventDefault();

    Modal.hide();
    Session.set('myPageMain profileLogin', false); // 최초 로그인시 마이피에지회원관리 접속세션 제거
    Router.go('/endingNote');
  }
});