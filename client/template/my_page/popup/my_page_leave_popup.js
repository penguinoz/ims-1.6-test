var templateName = 'myPageLeavePopup';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.leaveUserId = instance.data.userId;
});


Template[templateName].events({
  "click #cancel": function(e, t){
    e.preventDefault();
    Modal.hide();
    //이메일 인증 코드 변경
  },
  "click #leave": function(e, t){
    e.preventDefault();

    console.log(t.leaveUserId);

    // Meteor.call('removeAllDataByUserId', t.leaveUserId, function(error, result){
    //   if(error){
    //     return console.log(error);
    //   } else {
    //     Modal.hide();
    //     Meteor.logout();
    //   }
    // });
  }
});
