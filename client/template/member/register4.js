import {global} from '/imports/global/global_things.js';

var templateName = 'register4';

Template[templateName].onCreated(function(){
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
  'click [name=next]': function(e, t){
    e.preventDefault();

    var join = Session.get('main registerJoinData');
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

    Session.set('main template', 'register3');
  }
});
