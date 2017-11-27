import {global} from '/imports/global/global_things.js';

var templateName = 'findId2';

Template[templateName].onCreated(function(){
  this.collection = new ReactiveVar(Session.get('main findUserData'));
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

    Session.set('main template', 'imLogin');
  },
  'click [name=previous]': function(e, t) {
    e.preventDefault();

    Session.set('main template', 'findAuth');
  },
  'click [name=findPassword]': function(e, t) {
    e.preventDefault();

    Session.set('main template', 'findPassword');
  }
});

Template[templateName].helpers({
  hpCollection: function(){
    return Template.instance().collection.get();
  }
});
