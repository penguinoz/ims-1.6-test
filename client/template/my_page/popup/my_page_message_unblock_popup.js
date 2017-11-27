import {global} from '/imports/global/global_things.js';

// 마이페이지 > 쪽지함 > 차단자관리 > 차단해지(팝업)
var templateName = 'myPageMessageUnblockPopup';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){

});

Template[templateName].helpers({
  hpCheckLastIndex: function(index){
    if(index+1 === Template.instance().data.checkedUserId.length){
      return false;
    }else{
      return true;
    }
  }
});

Template[templateName].events({
  "click #denialCancel": function(e, t){
    var targetArr = t.data.checkedUserId;
    Meteor.call('unSetDenialUserArr',global.login.userId, targetArr,function(err,res){
      if(err){console.log(err);}
      if(res){
        Meteor.call('getMypageMsg',global.login.userId, "receiveTap","","" ,function(err, res){
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
            Session.set('mypageMessage denialList',returnArray);
            Session.set('mypageMessage msgData',res);
          }
        });
      }
    });
    Modal.hide();
  },
  "click #cancel":function(){
    Modal.hide();
  }
});
