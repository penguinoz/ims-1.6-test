import {global} from '/imports/global/global_things.js';

var templateName = 'register3';

Template[templateName].onCreated(function(){
  this.active = new ReactiveVar('white');
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
  'click [name=choice]': function(e, t) {
    e.preventDefault();

    var membership = e.target.getAttribute('value');
    t.active.set(membership);
  },
  'click [name=next]': function(e, t){
    e.preventDefault();

    var join = Session.get('main registerJoinData');
    // join.profile.payment = {
    //   membership: t.active.get(),
    //   credit : '신용카드 ****_****_****_1234',
    // };
    // join.profile.pwchange = utilGetDate();
    // Session.set('main registerJoinData', join);
    // Session.set('main template', 'register4');


    // 결제화면 생기면 지울것
    // var join = Session.get('main registerJoinData');
    Meteor.call('accountsCreateUser', join, function(error, result) {
      if (error) {
        console.log('error', error);
      } else {
        Session.set('main template', 'register5');
      }
    });
  },
  'click [name=previous]': function(e, t) {
    e.preventDefault();

    Session.set('main template', 'register2');
  }
});

Template[templateName].helpers({
  hpActive: function(active){
    return Template.instance().active.get() === active;
  }
});
