import {global} from '/imports/global/global_things.js';

var templateName = 'findPassword2';

Template[templateName].onCreated(function(){
  this.pw1Check = new ReactiveVar(false);
  this.pw2Check = new ReactiveVar(false);

});

Template[templateName].onRendered(function(){
  // global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark");
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].onDestroyed(function(){
  Session.set('main findUserData', null);
});

Template[templateName].events({
  'click [name=next]': function(e, t){
    e.preventDefault();

    // 비밀번호변경 + 자동로그인 => 메인페이지 이동
    var _id = Session.get('main findUserData')._id;
    var userId = Session.get('main findUserData').username;
    var pw1 = t.find('input[name=pw1]').value;
    var pw2 = t.find('input[name=pw2]').value;

    if (!t.pw1Check.get() || !t.pw2Check.get()) {
      return global.utilAlert('패스워드를 양식에 맞게 적어주세요.');
    }

    Meteor.call('setPassword', _id, pw1, function(error, result) {
      if (error) {
        console.log('error', error);
      } else {
        Meteor.loginWithPassword(userId, pw1, function(error) {
          if (error) {
            if (error.reason === 'User not found') {
              global.utilAlert('유저아이디를 찾을수 없습니다');
              //console.log('유저아이디를 찾을수 없습니다');
            } else if (error.reason === 'Incorrect password') {
              global.utilAlert('유저아이디를 찾을수 없습니다');
              console.log('잘못된 패스워드 입니다');
            }
          } else {
            global.fn_setLoginId(userId);
            Meteor.call('getPwChangeUpdate', userId, global.utilGetDate().default, true);
            Router.go('/endingNote');
          }
        });
      }
    });
  },
  'click [name=previous]': function(e, t) {
    e.preventDefault();

    Session.set('main template', 'findAuth');
  },
  // 비밀번호1
  'keyup [name=pw1]': function(e, t) {
    e.preventDefault();

    var pw1 = t.find('input[name=pw1]').value;
    var pw2 = t.find('input[name=pw2]').value;
    var regFlag = global.utilPasswordCheck(pw1);
    t.pw1Check.set(regFlag);

    if (pw1 === pw2) {
      t.pw2Check.set(true);
    } else {
      t.pw2Check.set(false);
    }
  },
  // 비밀번호2
  'keyup [name=pw2]': function(e, t) {
    e.preventDefault();

    var pw1 = t.find('input[name=pw1]').value;
    var pw2 = t.find('input[name=pw2]').value;

    if (pw1 === pw2) {
      t.pw2Check.set(true);
    } else {
      t.pw2Check.set(false);
    }
  },
});

Template[templateName].helpers({
  hpPw1Check: function() {
    return Template.instance().pw1Check.get();
  },
  hpPw2Check: function() {
    return Template.instance().pw2Check.get();
  },
  hpIdcut: function() {
    var userId = Session.get('main findUserData').username;
    var len = userId.length;
    var hidden = '';
    for (var i = 2; i < len; i++) {
      hidden += '*';
    }
    return userId.substring(0,2) + hidden;
  }
});