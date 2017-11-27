var templateName = 'schedule_task';

Template[templateName].onCreated(function(){

});

Template[templateName].events({
  "click [name=1min]": function(e, t){
    Meteor.call('sendTimeCapsuleEmail', 1);
  }
});
