var templateName = 'systemUpdateMethod';

Template[templateName].events({
  "click #timelineUpdate01": function(e, t){
    Meteor.call('timelineUpdate01', function(error, result){
      if(error){
        return console.log(error);
      } else {
        console.log(result);
      }
    });
  }
});