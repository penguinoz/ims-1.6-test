import {global} from '/imports/global/global_things.js';

var templateName = 'timelineQnaPop';


Template[templateName].onCreated(function(){
  var instance = this;
  instance.questionHistory = new ReactiveVar();

  Meteor.call('getQuestionHistory', global.login.userId, function(error, result){
    if(error){
      return console.log(error);
    } else {
      result = _.sortBy(result, 'updateDate').reverse();
      instance.questionHistory.set(result);
    }
  });
});

Template[templateName].onRendered(function(){
  targetElement = this.$('.pop-body-scroll');
  global.fn_customerScrollBarInit(targetElement, "dark");
});

Template[templateName].events({
  'click [name=questionId]': function(e, t) {
    e.preventDefault();

    // 선택한 질문 바로 표시
    Meteor.call('enQuestionChoice', this.questionId, function(error, result) {
      if (!error) {
        Session.set('timelineQna data', result);
      }
    });
  }
});

Template[templateName].helpers({
  hpQuestionList : function(){
    return Template.instance().questionHistory.get();
  }
});
