import {global} from '/imports/global/global_things.js';

// 마이페이지 > 쪽지함 > 답장보내기 (팝업)
var templateName = 'myPageMessageWritePopup';

Template[templateName].onCreated(function(){
});

Template[templateName].onRendered(function(){
});

Template[templateName].helpers({
  hpChangeTextForm: function(){
    var context = this.content.replace(/ /g, '\u00a0');
    context = context.replace(/\n/gi, '<br />');
    return context;
  },
});

Template[templateName].events({
  "click #sendMsg": function(e, t){
    var msgContent = $('#replycontent').val();
    Meteor.call('sendMessage', global.login.userId , t.data.receiver, msgContent, function(err,res){
      if(err){console.log(err);}
      if(res){
        // console.log(res);
        uid = res;
        Meteor.call('getMypageMsg',global.login.userId, 'receiveTap',"","" ,function(err, res){
          if(err){console.log(err);}
          if(res){
            Session.set('mypageMessage msgData',res);
          }
        });
        //쪽지보냄 알림
        var options = {
          userId : global.login.userId,
          context : msgContent
        };
        Meteor.call('setNoti', t.data.receiver, 'MG', uid, 'msgReceive', options); //쪽지 받음 알림
      }
    });
    Modal.hide();
  },
  "click #cancel":function(e,t){
    Modal.hide();
  }

});
