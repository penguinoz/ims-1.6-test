import {global} from '/imports/global/global_things.js';

// 마이페이지 > 쪽지함
var templateName = 'myPageMessage';

Template[templateName].onCreated(function(){
// loadMsgData("receiveTap");

Meteor.call('getMypageMsg',global.login.userId, 'receiveTap' ,"","" ,function(err, res){
  if(err){console.log(err);}
  if(res){
    Session.set('mypageMessage msgData',res);
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

Template[templateName].helpers({
  getMessageData: function(){
    if(Session.get('mypageMessage msgData')){
      return Session.get('mypageMessage msgData')[0];
    }else{

    }
  },
  hpGetIndex:function(index){
    return index+1;
  },
  //차단목록 그룹화 helpers
  hpDenialData:function(){
    var msgData = {}
    return Session.get('mypageMessage denialList');
  }

  // hpGetSendMessage:function(){
  //   return Session.get('mypageMessage sendMsgList');
  // }

  // getPageCounter: function(){
  //   var countNum = Session.get('mypageMessage msgData').receiveMsg.length / 2;
  //   if(Session.get('mypageMessage msgData').receiveMsg.length % 2){
  //     countNum = countNum + 1;
  //   }
  //   var pageArr = [];
  //   for(var i=1 ; i <= countNum ; i++){
  //     pageArr.push(i);
  //   }
  //   return pageArr;
  // }
});

Template[templateName].events({
  "click .modal-link": function(e, t){
    e.preventDefault();

    Meteor.call("checkMessage",global.login.userId , this._id, this.sender ,function(err,res){
      if(err){console.log(err);}
      if(res){
        loadMsgData("receiveTap");
        // Meteor.call('getMypageMsg',global.login.userId,function(err, res){
        //   if(err){console.log(err);}
        //   if(res){
        //     console.log('res = ',res);
        //     Session.set('mypageMessage msgData',res);
        //   }
        // });
      }
    });

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    var fromFlag = "";
    if(this.sender){
      fromFlag = "mymsg";
    }

    var checkedUserId = [];
    if(e.target.id === 'denialCancel'){
      checkedUserId = $('input[name=checkList]:checked').serializeArray().map(function(item) { return item.value });
      if(checkedUserId.length === 0){
        global.utilAlert("선택된 대상이 없습니다.")
        return;
      }
    }

    modalobj.size = 'imsr-pop modal-md';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    var parentView = t.view.name.replace("Template.","");
    modalobj.data = {
      content : this.content,
      sender : this.sender ? this.sender : global.login.userId,
      receiver : this.receiver,
      regDate : this.regDate,
      msgId : this._id,
      popupFrom : fromFlag,
      cancelSend : this.check,
      checkedUserId : checkedUserId
    };
    global.utilModalOpen(e, modalobj);
  },
  "click #receiveTap,#sendTap": function(e, t){
    e.preventDefault();
    var pagetype = "";
    if(e.currentTarget.id === "receiveTap"){
      pagetype = "receiveTap";
    }else if(e.currentTarget.id === "sendTap"){
      pagetype = "sendTap";
    }
    loadMsgData(pagetype);
  },
  "click button[name='searchBtsend']":function(e, t){
  e.preventDefault();
  var type = $("#keywordTypeSend").val();
  var serchtext = $("#keywordTextSend").val();
  Meteor.call('getMypageMsg',global.login.userId, 'sendTap', type, serchtext ,function(err, res){
    if(err){console.log(err);}
    if(res){
      Session.set('mypageMessage msgData',res);
    }
  });
  },
  "click button[name='searchBtReceive']":function(e, t){
  e.preventDefault();
  var type = $("#keywordTypeReceive").val();
  var serchtext = $("#keywordTextReceive").val();
  Meteor.call('getMypageMsg',global.login.userId, 'receiveTap', type, serchtext ,function(err, res){
    if(err){console.log(err);}
    if(res){
      Session.set('mypageMessage msgData',res);
    }
  });
  },
  "click a[name='deleteReceiveMsg']":function(){
    var checkedId = $('input[name=checkListReceive]:checked').serializeArray().map(function(item) { return item.value; });
    Meteor.call('deleteReceiveMsg',global.login.userId, checkedId,function(err,res){
      if(err) {
        console.log(err);
      } else {
        loadMsgData('receiveTap');
      }
    });
  },
  "click #all":function(e,t){
    $("input[name='checkList']").prop('checked', $(e.target).prop("checked"));
  },
  "click #allRecevie":function(e,t){
    $("input[name='checkListReceive']").prop('checked', $(e.target).prop("checked"));
  },
});

Template[templateName].onDestroyed(function(){
  Session.set('mypageMessage msgData',null);
  Session.set('mypageMessage denialList',null);

});

function loadMsgData(pagetype){
  Meteor.call('getMypageMsg',global.login.userId, pagetype,"","" ,function(err, res){
    if(err){console.log(err);}
    if(res){
      Session.set('mypageMessage msgData',res);
    }
  });
}
