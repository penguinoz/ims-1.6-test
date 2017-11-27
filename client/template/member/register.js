import {global} from '/imports/global/global_things.js';

var templateName = 'register';

Template[templateName].onCreated(function(){
  Session.set('main agreement', null);
});

Template[templateName].onRendered(function(){
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };
  global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  // 모두동의 체크박스
  'change [name=chkselMoveToBucket]': function(e, t){
    e.preventDefault();

    var _checked = e.target.checked;
    $('input:checkbox[name=check01]').prop('checked', _checked);
    $('input:checkbox[name=check02]').prop('checked', _checked);
    $('input:checkbox[name=check03]').prop('checked', _checked);
  },
  // 동의하기
  'click [name=next]': function(e, t) {
    e.preventDefault();

    var check1 = t.find('input:checkbox[name=check01]:checked');
    var check2 = t.find('input:checkbox[name=check02]:checked');
    var check3 = t.find('input:checkbox[name=check03]:checked');

    if (check1 === null || check2 === null) {
      return global.utilAlert('필수항목에 동의해주세요.');
    } else {
      var agreement = {
        essential: true,
        agree1: check3 !== null ? true : false
      };
      Session.set('main agreement', agreement);
      Session.set('main template', 'register2');
    }
  },
  // 이전으로
  'click [name=previous]': function(e, t) {
    e.preventDefault();

    Session.set('main template', 'imLogin');
  }
});
