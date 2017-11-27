import {global} from '/imports/global/global_things.js';

// 마이페이지 > 회원정보관리 > 비밀번호 확인
var templateName = 'myPageProfileVerify';

Template[templateName].onCreated(function(){
  if (Session.get('myPageMain profileLogin')) {
    var templateData = {
      contentTmp: 'myPageProfile'
    };
    Session.set('myPageMain templateData', templateData);
  }
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  'click [name=confirm], keypress [name=password]': function(e, t){
    // e.preventDefault();

    var password = t.find('input[name=password]').value;
    if (e.type === 'click' || e.keyCode === 13) {
      Meteor.loginWithPassword(global.login.userId, password, function(error) {
        if (error) {
          global.utilAlert('패스워드를 잘못 입력하였습니다.');
        } else {
          var templateData = {
            contentTmp: 'myPageProfile'
          };
          Session.set('myPageMain profileLogin', true);
          Session.set('myPageMain templateData', templateData);
        }
      });
    }
  }
});