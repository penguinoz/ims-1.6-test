import {global} from '/imports/global/global_things.js';
import export_email_code_validation from '/imports/email_template/email_code_validation.js';

var templateName = 'register2';

Template[templateName].onCreated(function(){
  Blaze._allowJavascriptUrls();
  this.joinData = new ReactiveVar(Session.get('main registerJoinData'));
  this.userIdCheck = new ReactiveVar('');
  this.userIdCheckMessage = new ReactiveVar('');
  this.pwCheck1 = new ReactiveVar('');
  this.pwCheck2 = new ReactiveVar('');
  this.pwIcon1 = new ReactiveVar('');
  this.pwIcon2 = new ReactiveVar('');
  this.nickNameCheck = new ReactiveVar('');
  this.nickNameCheckMessage = new ReactiveVar('');
  this.email1 = new ReactiveVar('');
  this.email2 = new ReactiveVar('');
  this.emailCheck = new ReactiveVar(false);
  this.authNumber = '';
});

Template[templateName].onRendered(function(){
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };
  global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
  if (this.joinData.get()) {
    $('input[name=sex][value='+this.joinData.get().profile.sex+']').prop('checked', true);
    $('input[name=month][value='+this.joinData.get().profile.birthday.month+']').prop('checked', true);
    this.email1.set(this.joinData.get().profile.email.split('@')[0]);
    this.email2.set(this.joinData.get().profile.email.split('@')[1]);
  }
});

Template[templateName].events({
  // 아이디중복확인
  'click [name=userIdCheck]': function(e, t){
    e.preventDefault();

    var userId = t.find('input[name=userId]').value;
    if (userId === '') {
      t.userIdCheck.set('error');
      t.userIdCheckMessage.set('아이디를 입력해주세요.');
    } else {
      var regFlag = global.utilUserIdCheck(userId);
      if (!regFlag) {
        t.userIdCheck.set('error');
        t.userIdCheckMessage.set('양식에 맞게 입력해주세요.');
      } else {
        Meteor.call('getUserCheck', {username: userId}, function(error, result) {
          if (!error) {
            if (result !== 0) {
              t.userIdCheck.set('error');
              t.userIdCheckMessage.set('이미 사용중입니다 다른 아이디를 입력해주세요.');
            } else {
              t.userIdCheck.set('success');
              t.userIdCheckMessage.set('사용 가능한 아이디입니다.');
            }
          }
        });
      }
    }
  },
  // 아이디text
  'keyup [name=userId]': function(e, t) {
    e.preventDefault();

    t.userIdCheck.set('');
    t.userIdCheckMessage.set('');
  },
  // 비밀번호1
  'focusout [name=pw1]': function(e, t) {
    e.preventDefault();

    var pw1 = t.find('input[name=pw1]').value;
    var pw2 = t.find('input[name=pw2]').value;
    var errorType = '';
    if (pw1 !== '') {
      if (global.utilPasswordCheck(pw1)) {
        errorType = 'pass';
        t.pwIcon1.set('icon-lg0003');
      } else {
        errorType = 'error';
        t.pwIcon1.set('icon-lg0004');
      }
    } else {
      t.pwIcon1.set('');
    }
    t.pwCheck1.set(errorType);

    if (pw1 === pw2) {
      t.pwCheck2.set('pass');
      t.pwIcon2.set('icon-lg0003');
    } else {
      t.pwCheck2.set('error');
      t.pwIcon2.set('icon-lg0004');
    }
  },
  // 비밀번호2
  'focusout [name=pw2]': function(e, t) {
    e.preventDefault();

    var pw1 = t.find('input[name=pw1]').value;
    var pw2 = t.find('input[name=pw2]').value;
    var errorType = '';
    if (pw2 !== '') {
      if (global.utilPasswordCheck(pw2)) {
        errorType = 'pass';
      } else {
        errorType = 'error';
      }
    } else {
      t.pwIcon2.set('');
    }
    t.pwCheck2.set(errorType);

    if (pw1 !== '' && pw2 !== '') {
      if (pw1 === pw2) {
        t.pwCheck2.set('pass');
        t.pwIcon2.set('icon-lg0003');
      } else {
        t.pwCheck2.set('error');
        t.pwIcon2.set('icon-lg0004');
      }
    }
  },
  // 닉네임 중복확인
  'click [name=nickNameCheck]': function(e, t) {
    e.preventDefault();

    var nickName = t.find('input[name=nickName]').value;
    if (nickName === '') {
      t.nickNameCheck.set('error');
      t.nickNameCheckMessage.set('별명을 입력해주세요.');
    } else {
      var regFlag = false;
      if (nickName.length < 2 || nickName.length > 12) regFlag = true;
      if (regFlag) {
        t.nickNameCheck.set('error');
        t.nickNameCheckMessage.set('양식에 맞게 입력해주세요.');
      } else {
        Meteor.call('getUserCheck', {'profile.nickName': nickName}, function(error, result) {
          if (!error) {
            if (result !== 0) {
              t.nickNameCheck.set('error');
              t.nickNameCheckMessage.set('이미 사용중입니다 다른 별명을 입력해주세요.');
            } else {
              t.nickNameCheck.set('success');
              t.nickNameCheckMessage.set('사용 가능한 별명입니다.');
            }
          }
        });
      }
    }
  },
  // 별명text
  'keyup [name=nickName]': function(e, t) {
    e.preventDefault();

    t.nickNameCheck.set('');
    t.nickNameCheckMessage.set('');
  },
  // 이메일 선택
  'change [name=emaillSelect]': function(e, t) {
    e.preventDefault();

    var email = e.target.value;
    t.email2.set(email);
  },
  // 다음단계(회원가입)
  'click [name=next]': function(e, t) {
    e.preventDefault();

    if (global.utilValidation(t)) {
      if (t.userIdCheck.get() === '' || t.userIdCheck.get() === 'error') {
        return global.utilAlert('아이디 중복확인을 해주세요.');
      }
      if (t.pwCheck1.get() === 'error' || t.pwCheck2.get() === 'error') {
        return global.utilAlert('패스워드를 양식에 맞게 적어주세요.');
      }
      if (t.nickNameCheck.get() === '' || t.nickNameCheck.get() === 'error') {
        return global.utilAlert('별명 중복확인을 해주세요.');
      }

      var userId = t.find('input[name=userId]').value;
      var pw1 = t.find('input[name=pw1]').value;
      var nickName = t.find('input[name=nickName]').value;
      var name = t.find('input[name=name]').value;
      var sex = t.find('input:radio[name=sex]:checked').value;
      var month = t.find('input:radio[name=month]:checked').value;
      var birthday = t.find('input[name=birthday]').value;
      var email = t.find('input[name=email1]').value + '@' + t.find('input[name=email2]').value;
      var mobile = t.find('input[name=mobile]').value;
      var joinRoute = t.find('select[name=joinRoute]').value;
      var emailAuth = t.find('input[name=emailAuth]').value;

      if (!global.utilEmailCheck(email)) {
        return global.utilAlert('이메일을 올바르게 입력해주세요.');
      }
      if (t.emailCheck.get() === false) {
        return global.utilAlert('이메일인증을 해주세요.');
      } else {
        if (emailAuth !== t.authNumber) {
          return global.utilAlert('인증번호가 올바르지 않습니다.');
        }
      }

      var join = {};
      join.username = userId;
      join.password = pw1;
      join.profile = {
        name: name,
        nickName: nickName,
        profileImg: '',
        sex: sex,
        birthday: {month: month, date: birthday},
        email : email,
        mobile : mobile,
        friends : {
          accept:[],
          receive:[],
          request:[],
          groups:[],
        },
        joinRoute: joinRoute,
        introduction: '',
        agreement: Session.get('main agreement'),
        isPassAway : false, //사망여부
        authority : 'user',
        payment : {
          membership: 'white',
          // credit : '신용카드 ****_****_****_1234',
        }
      };

      Meteor.call('getUserCheck', {'profile.email': email}, function(error, result) {
        if(!error) {
          if (result !== 0) {
            return global.utilAlert('이미 사용중인 이메일입니다.');
          } else {
            // Session.set('main registerJoinData', join);
            // Session.set('main template', 'register3');
            Meteor.call('accountsCreateUser', join, function(error, result) {
              if (error) {
                console.log('error', error);
              } else {
                Meteor.call('getPwChangeUpdate', userId, global.utilGetDate().default, true);
                Session.set('main registerJoinData', join);
                Session.set('main template', 'register5');
              }
            });
          }
        }
      });
    }
  },
  // 이전
  'click [name=previous]': function(e, t) {
    e.preventDefault();
    Session.set('main template', 'register');
  },
  'keyup [name=mobile]': function(e, t) {
    e.preventDefault();

    var target = e.target;
    var numPattern = /([^0-9])/;

    var pattern = target.value.match(numPattern);
    if (pattern !== null) {
      target.value = '';
      return global.utilAlert('숫자만 입력해주세요.');
    }
  },
  // email인증
  'click [name=emailCheck]': function(e, t) {
    e.preventDefault();

    var email = t.find('input[name=email1]').value + '@' + t.find('input[name=email2]').value;
    if (!global.utilEmailCheck(email)) {
      return global.utilAlert('이메일을 올바르게 입력해주세요.');
    }
    if (t.emailCheck.get()) {
      global.utilConfirm('이미 인증을 받으셨습니다. 다시 받겠습니까?').then(function(val) {
        if (val) {
          eamilAuth(email);
        }
      }).catch(swal.noop);
    } else {
      eamilAuth(email);
    }

    function eamilAuth(email) {
      Meteor.call('getUserCheck', {'profile.email': email}, function(error, result) {
        if (!error) {
          if (result !== 0) {
            return global.utilAlert('이미 사용중인 이메일 입니다.');
          } else {
            var randomNum = Math.floor(Math.random() * 1000000)+100000;
            if (randomNum > 1000000){
               randomNum = randomNum - 100000;
            }
            var authNum = randomNum.toString();

//이메일 인증 들어감
            var email_info = {
                    receiverName : '고객',
                    code : authNum
            };
            var htmlContext = export_email_code_validation(email_info);
            var emailSend = global.fn_sendEmail('cert', email, "[It's my story] 계정 본인 확인 메일", htmlContext, '');
            Meteor.call('sendEmail', emailSend);

            t.authNumber = authNum;
            global.utilAlert('인증번호를 발송했습니다. 인증번호가 오지 않으면 입력하신 이메일이 맞는지 확인해주세요.');
            t.emailCheck.set(true);
          }
        }
      });
    }
  }
});

Template[templateName].helpers({
  hpDefaultData: function() {
    return Template.instance().joinData.get();
  },
  hpUserIdCheck: function() {
    return Template.instance().userIdCheck.get();
  },
  hpUserIdCheckMessage: function() {
    return Template.instance().userIdCheckMessage.get();
  },
  hpPwCheck1: function() {
    return Template.instance().pwCheck1.get();
  },
  hpPwCheck2: function() {
    return Template.instance().pwCheck2.get();
  },
  hpPwIcon1: function() {
    return Template.instance().pwIcon1.get();
  },
  hpPwIcon2: function() {
    return Template.instance().pwIcon2.get();
  },
  hpPwCheck1Message: function(message) {
    if (message === 'error') {
      return '양식에 맞게 입력해주세요.';
    }
  },
  hpPwCheck2Message: function(message) {
    if (message === 'error') {
      return '비밀번호가 일치하지 않습니다.';
    }
  },
  hpNickNameCheck: function() {
    return Template.instance().nickNameCheck.get();
  },
  hpNickNameCheckMessage: function() {
    return Template.instance().nickNameCheckMessage.get();
  },
  hpEmail1: function() {
    return Template.instance().email1.get();
  },
  hpEmail2: function() {
    return Template.instance().email2.get();
  }
});
