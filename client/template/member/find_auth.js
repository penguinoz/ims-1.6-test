import {global} from '/imports/global/global_things.js';
import export_email_code_validation from '/imports/email_template/email_code_validation.js';

var templateName = 'findAuth';

Template[templateName].onCreated(function(){
  this.templateType = Session.get('findAuth type');
  this.active = new ReactiveVar('email');
  this.authCheck = false;
  this.authType = '';
  this.authNumber = '';
});

Template[templateName].onRendered(function(){
  // global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark");
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  "click [name=next]": function(e, t){
    e.preventDefault();

    var nextFlag = true;
    if (t.authNumber === '') {
      return global.utilAlert('인증단계를 거쳐주세요.');
    }
    if (t.authType === 'phone') {
      if (t.authNumber !== t.find('input[name=authPhoneNumber]').value) {
        nextFlag = false;
      }
    } else if (t.authType === 'email') {
      if (t.authNumber !== t.find('input[name=authEmailNumber]').value) {
        nextFlag = false;
      }
    } else {
      return global.utilAlert('본인인증을 해주세요.');
    }

    if (nextFlag) {
      var name = t.find('input[name=emailAuthName]').value;
      var email = t.find('input[name=email]').value;
      Meteor.call('getUserInfoByNameEmail', name, email, function(error, result) {
        if (!error) {
          if (result.length !== 0) {
            Session.set('main findUserData', result[0]);
            var template = 'findPassword2';
            if (t.templateType === 'id') {
              template = 'findId2';
            }
            Session.set('main template', template);
          } else {
            return global.utilAlert('입력하신 정보가 잘못되었습니다.');
          }
        }
      });
    } else {
      global.utilAlert('인증번호가 맞지않습니다.');
    }
  },
  'click [name=previous]': function(e, t) {
    e.preventDefault();

    var template = 'findPassword';
    if (t.templateType === 'id') {
      template = 'imLogin';
    }
    Session.set('main template', template);
  },
  'change [name=groupRadio]': function(e, t) {
    e.preventDefault();

    var checked = t.find('input:radio[name=groupRadio]:checked').value;
    t.authType = '';
    t.authNumber = '';
    $('.authText').val('');
    t.active.set(checked);
  },
  'click [name=authType]': function(e, t) {
    e.preventDefault();

    var type = e.target.getAttribute('value');
    t.authType = type;
    var userInfo = null;
    var name = '';
    var query = {};
    if (t.templateType === 'pw') {
      query.username = Session.get('findPassword userId');
    }

    // 임시 인증번호
    if (type === 'phone') {
      name = t.find('input[name=phoneAuthName]').value;
      var mobile = t.find('input[name=phone]').value;
      if (mobile === '') {
        return global.utilAlert('휴대전화를 입력해주세요.');
      }
      query['profile.name'] = name;
      query['profile.mobile'] = mobile;
      Meteor.call('getUserCheck', query, function(error, result) {
        if (!error) {
          if (result === 0) {
            return global.utilAlert('등록되지않은 회원정보입니다.');
          } else {
            t.authNumber = '1234';
          }
        }
      });
    } else {
      name = t.find('input[name=emailAuthName]').value;
      var email = t.find('input[name=email]').value;
      var emailRegExp = global.utilEmailCheck(email);
      if (email === '' || !emailRegExp) {
        return global.utilAlert('이메일을 올바르게 입력해주세요.');
      }
      query['profile.name'] = name;
      query['profile.email'] = email;
      Meteor.call('getUserCheck', query, function(error, result) {
        if (!error) {
          if (result === 0) {
            return global.utilAlert('등록되지않은 회원정보입니다.');
          } else {
            var randomNum = Math.floor(Math.random() * 1000000)+100000;
            if (randomNum > 1000000){
               randomNum = randomNum - 100000;
            }
            var authNum = randomNum.toString();

            //이메일 인증 들어감
            var email_info = {
                    receiverName : name,
                    code : authNum
            };
            var htmlContext = export_email_code_validation(email_info);
            var emailSend = global.fn_sendEmail('cert', email, "[It's my story] 계정 본인 확인 메일", htmlContext, '');
            Meteor.call('sendEmail', emailSend);


            // var emailSend = global.fn_sendEmail('cert', email, '더푸르츠 테스트 메일 발송(Hello from admin)', '인증번호: '+authNum+'', '');
            // Meteor.call('sendEmail', emailSend);
            t.authNumber = authNum;
            global.utilAlert('인증번호를 발송했습니다. 인증번호가 오지 않으면 입력하신 정보가 회원정보와 일치하는지 확인해 주세요.');
          }
        }
      });
    }
  }
});

Template[templateName].helpers({
  hpActive: function(active) {
    return Template.instance().active.get() === active;
  },
  hpAuthType: function() {
    var result = '비밀번호';
    if (Session.get('findAuth type') === 'id') {
      result = '아이디';
    }
    return result;
  }
});
