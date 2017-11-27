import {global} from '/imports/global/global_things.js';

//마이페이지 > 초대하기 > 초대하기 작성 (팝업)
import export_email_invitation from '/imports/email_template/email_invitation.js';
var templateName = 'myPageInviteWritePopup';

Template[templateName].onCreated(function(){
  this.rowsData = new ReactiveVar();
  this.rowsData.set([{_id:0}]);
});

Template[templateName].onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].helpers({
  hpInviteUserList: function(){
    return Template.instance().rowsData.get();
  },
  hpMatchIndex:function(index){
    var count = Template.instance().rowsData.get().length;
    if(index === count-1){
      return true;
    }else{
      return false;
    }
  }
});

Template[templateName].events({
  "click #addInvite": function(e, t){
    var rows = t.rowsData.get();
    var count = rows.length;
    rows.push({_id:count});
    t.rowsData.set(rows);
  },
  "click #delInvite":function(e,t){
    var rows = t.rowsData.get();
    rows.splice(this._id, 1);
    t.rowsData.set(rows);
  },
  "click #saveInvite":function(e,t){
    e.preventDefault();
    var title = $("#inviteTitle").val();
    var content = $("#inviteContent").val();
    var inviteData = [];
    var insertData = [];
    $('.mypage-form input').each(function() {
    inviteData.push($(this).val());
    });
    inviteData.splice(inviteData.length-1,1);
    for(var i=0 ; i<inviteData.length; i=i+2 ){
      if((inviteData[i] !== inviteData[i+1]) && (!inviteData[i] || !inviteData[i+1])){
        global.utilAlert("이름과 이메일을 모두 작성해 주세요");
        return;
      }else if(inviteData[i] && inviteData[i+1]){
        insertData.push({name:inviteData[i] , email:inviteData[i+1], 'title':title, 'content':content});

        //이메일 전송
        var email_info = {
          title : title,
          receiverName : inviteData[i],
          senderName : global.fn_getName(global.login.userId),
          email : inviteData[i+1],
          message : content
        };
        var htmlContext = export_email_invitation(email_info);
        var emailSend = global.fn_sendEmail('cert', inviteData[i+1], "[It's my story] 잇츠마이스토리에 당신을 초대합니다.", htmlContext, '');
        Meteor.call('sendEmail', emailSend);
      }
    }
    Meteor.call("updateInviteData",global.login.userId,insertData,function(err,res){
      if(err){console.log(err);}
      if(res){
        Meteor.call("getInviteData",global.login.userId,function(err,res){
          if(err){console.log(err);}
          if(res){
            Session.set("myPageInvite inviteData",res);
          }
        });
      }
    });

    Modal.hide();
  },
  "click #cancel":function(e,t){
    Modal.hide();
  }
});
