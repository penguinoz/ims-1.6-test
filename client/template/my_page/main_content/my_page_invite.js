import {global} from '/imports/global/global_things.js';

// 마이페이지 > 초대하기
var templateName = 'myPageInvite';

Template[templateName].onCreated(function(){
  Meteor.call("getInviteData",global.login.userId,function(err,res){
    if(err){console.log(err);}
    if(res){
      Session.set("myPageInvite inviteData",res);
    }
  });
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  "click .modal-link": function(e, t){
    e.preventDefault();
    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg';
    modalobj.fade = false;
    modalobj.backdrop = 'static';

    if(modalobj.template === "myPageInvitePopup"){
      modalobj.data = {
        title:this.title,
        name:this.name,
        email:this.email,
        content:this.content,
        regDate:this.regDate
      };
    }else{
      modalobj.data = {
      };
    }

    global.utilModalOpen(e, modalobj);
  },
  "click #delete": function(){
    var checkedID = $('input[name=inviteCheck]:checked').serializeArray().map(function(item) { return item.value });
    Meteor.call('delInviteData',global.login.userId, checkedID,function(err,res){
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
  }
});

Template[templateName].helpers({
  hpInvateData: function(){
    return Session.get("myPageInvite inviteData");
  },
  hpIndex:function(index){
    return index+1;
  }
});
