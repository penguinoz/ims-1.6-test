import {global} from '/imports/global/global_things.js';

var templateName = 'inheritanceCheckReciversPopup';

Template[templateName].onCreated(function(){
});

Template[templateName].helpers({
  hpShowInfo: function(){
    return Template.instance().data;
  }
});

Template[templateName].events({
  //승락
  "click button[name='acceptUser']": function(e, t){
    e.preventDefault();

    var user = global.login.userId;
    var targetId = this.userId;
    Meteor.call('accetpGuardian',user ,targetId ,function(err,res){
      if(err){
        console.log(err);
      }else{
        //님의 가디언이 되었습니다.
        Meteor.call('setLog', '', '', targetId ,user ,  global.pageType.inHeritance, '', 'acceptedGuadian','' );
        //님이 가디언 이 되었습니다.
        Meteor.call('setLog', '', '', user ,targetId ,  global.pageType.inHeritance, '', 'acceptGuadian','' );
        //알림
        var options = {
          userId : user
        };
        Meteor.call('setNoti', targetId, 'GD', '가디언 수락(postId)', 'accept', options);
      }
    });
    Modal.hide();
  },
  //거절
  "click button[name='refuseUser']": function(e, t){
    e.preventDefault();

    var user = global.login.userId;
    var targetId = this.userId;
    Meteor.call('refuseGuardian',user, t.data.userId,function(err,res){
      if(err){
        console.log(err);
      }else{
        Meteor.call('setLog', '', '', targetId, user, global.pageType.inHeritance, '', 'refuseGuadian','' );
        var options = {
          userId : user
        };
        //알림
        Meteor.call('setNoti', targetId, 'GD', '가디언 거절(postId)', 'refusal', options);
      }
    });
    Modal.hide();
  },
});
