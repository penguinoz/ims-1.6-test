import {global} from '/imports/global/global_things.js';
import export_email_regist_new from '/imports/email_template/email_regist_new.js';

var templateName = 'register5';

Template[templateName].onCreated(function(){
  this.collection = new ReactiveVar(Session.get('main registerJoinData'));
  Meteor.call('setNoti', this.collection.get().username, 'MG', '회원가입(_id)', 'signUp');
});

Template[templateName].onRendered(function(){
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };
  global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);


  var userInfo = Template.instance().collection.get();

  //이메일 전송
  var email_info = {
    userName : userInfo.profile.name,
    userId : userInfo.username,
    nickName : userInfo.profile.nickName,
    membership : userInfo.profile.payment.membership,
    paymentInfo : userInfo.profile.payment.credit
  };

  var htmlContext = export_email_regist_new(email_info);
  var emailSend = global.fn_sendEmail('cert', userInfo.profile.email, "[It's my story] 신규가입을 환영합니다.", htmlContext, '');
  Meteor.call('sendEmail', emailSend);
});

Template[templateName].onDestroyed(function(){
  Session.set('main registerJoinData', null);
});

Template[templateName].events({
  'click [name=btnLogin]': function(e, t){
    e.preventDefault();

    Session.set('main template', 'imLogin');
  }
});

Template[templateName].helpers({
  hpCollection: function(){
    return Template.instance().collection.get();
  }
});
