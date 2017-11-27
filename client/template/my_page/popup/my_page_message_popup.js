import {global} from '/imports/global/global_things.js';

//마이페이지 > 쪽지함 > 쪽지보기 (팝업)
var templateName = 'myPageMessagePopup';

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
  "click #reply": function(e, t){
    e.preventDefault();
    Modal.hide();
    var modalobj = {};
    modalobj.template = 'myPageMessageWritePopup';
    modalobj.size = 'imsr-pop modal-md';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      content : t.data.content,
      receiver : t.data.sender,
      regDate : t.data.regDate
    };
    setTimeout(function(){
      global.utilModalOpen(e, modalobj);
    }, 400);
  },
  //받은 메시지 삭제
  "click #delMsg": function(e, t){
    e.preventDefault();
    var popupFrom = t.data.popupFrom;
    Meteor.call('deleteReceiveMsg', global.login.userId, this.msgId, function(err,res){
      if(err) {
        console.log(err);
      } else {
        refleshdata(popupFrom);
      }
    });
    Modal.hide();
  },
  //사용차 차단
  "click #denialUser": function(e, t){
    var popupFrom = t.data.popupFrom;
    Meteor.call('addDenialUser',global.login.userId,this.sender,function(err,res){
      if(err){console.log(err);}
      if(res){
        refleshdata(popupFrom);
        denialRelesh();
      }
    });
    Modal.hide();
  },

  //전송취소
  "click #cancelSend": function(e, t){
    var popupFrom = t.data.popupFrom;
    Meteor.call("deleteReceiveMsg",this.receiver ,this.msgId);
    //전송취소 db에 flag 변경
    Meteor.call("setCancleMsgFlag",global.login.userId ,this.msgId,function(err,res){
      if(err){console.log(err);}
      if(res){
        refleshdata(popupFrom);
      }
    });
    Modal.hide();
  },
  //보낸메세지 삭제
  "click #sendDel": function(e, t){
    var popupFrom = t.data.popupFrom;
    Meteor.call("sendedMsgDel",global.login.userId,this.msgId,function(err,res){
      if(err){console.log(err);}
      if(res){
        refleshdata(popupFrom);
      }
    });
    Modal.hide();
  },
  "click #cancel":function(){
    Modal.hide();
  }

});

function refleshdata(pageFrom){
  var type = "";
  if(pageFrom === "mymsg"){
    type = "receiveTap";
  }else{
    type = "sendTap";
  }
  Meteor.call('getMypageMsg',global.login.userId, type,"all","" ,function(err, res){
    if(err){console.log(err);}
    if(res){
      Session.set('mypageMessage msgData',res);
    }
  });
}

function denialRelesh(){
  Meteor.call('getMypageMsg',global.login.userId, 'receiveTap' ,"","" ,function(err, res){
    if(err){console.log(err);}
    if(res){
      msgData = res[0];
      if(!msgData){
        return;
      }
      var denialDatas = msgData.denial;
      var deMsgList = [];

      for(var i in msgData.receiveMsg){
        if(msgData.receiveMsg[i].refuse === true){
          deMsgList.push(msgData.receiveMsg[i]);
        }
      }
      var groupby = _.groupBy(deMsgList,'sender');
      var keyList = Object.keys(groupby);
      var returnArray = [];
      /////////////
      for(var i in denialDatas){
        var deuser = denialDatas[i].userId;
        var msgCount = 0;
        if(groupby[deuser]){
        msgCount = groupby[deuser].length;
        }
        returnArray.push({userId:deuser,denialDate:denialDatas[i].regDate,refMsgLength:msgCount});
      }
      /////////////
      // for(var i in keyList){
      //   var denialRegDate = _.findWhere(denialDatas,{userId:keyList[i]});
      //   returnArray.push({userId:keyList[i],refMsg:groupby[keyList[i]],denialDate:denialRegDate.regDate,refMsgLength:groupby[keyList[i]].length});
      // }
      Session.set('mypageMessage denialList',returnArray);
    }
  });
}
