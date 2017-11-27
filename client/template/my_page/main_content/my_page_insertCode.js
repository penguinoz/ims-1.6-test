import {global} from '/imports/global/global_things.js';

// 마이페이지 > 회원정보관리 > 비밀번호 확인
var templateName = 'insertCode';

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
  'click [name=confirm], keypress [name=code]': function(e, t){
    // e.preventDefault();

    var code = t.find('input[name=code]').value;
    var email = t.find('input[name=email]').value;

    if (e.type === 'click' || e.keyCode === 13) {
      Meteor.call('updateCodeContents', global.login.userId, code, email, function(error, result){
        if(error){
          return console.log(error);
        } else {
          var message = '';
          if(result.result){
            if(_.isEqual(result.type, 'TC')){
              message = '타임캡슐이 정상등록 되었습니다.';
            } else {
              message = '상속된 컨텐츠가 정상 등록되었습니다.';
            }
            global.utilAlert(message);
          } else {
            global.utilAlert('이메일 또는 코드가 잘못되었습니다. 확인 후 다시 입력해주세요.');
          }
        }
      });

    }
  }
});