import {global} from '/imports/global/global_things.js';

var templateName = 'findPassword';

Template[templateName].onCreated(function(){
  Session.set('findPassword userId', null);
});

Template[templateName].onRendered(function(){
  // global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark");
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  'click [name=next]': function(e, t){
    e.preventDefault();

    var userId = t.find('input[name=userId]').value;
    var fields = ['username'];
    Meteor.call('getUserInfo', userId, function(error, result){
      if(error){
        return console.log(error);
      } else {
        if (result.length > 0) {
          Session.set('findPassword userId', userId);
          Session.set('findAuth type', 'pw');
          Session.set('main template', 'findAuth');
        } else {
          global.utilAlert('등록되지않은 회원입니다.');
        }
      }
    });
  },
  'click [name=previous]': function(e, t) {
    e.preventDefault();

    Session.set('main template', 'imLogin');
  },
  'click [name=findId]': function(e, t) {
    e.preventDefault();

    Session.set('findAuth type', 'id');
    Session.set('main template', 'findAuth');
  }
});
