import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsMessage = new Mongo.Collection("imsMessage");

Meteor.methods({

  getMypageMsg:function(user, pageType,searchtype,_searchTxt){
    if(Meteor.isServer){
      var msgData = {};
      var regex = [];
      var unwinObj = {};
      var lookupObj = {};
      var groupObj = {};
      var groupObj2 = {};
      // return CLT.ImsMessage.findOne({userId:user});
      //검색어 생성
      var searchText = _searchTxt ? _searchTxt.split(',') : [];
      var srchTextTemp = [];
      for (var t = 0; t < searchText.length; t++) {
        srchTextTemp.push(searchText[t].trim()); // 앞뒤 공백 제거
      }
      searchText = srchTextTemp;

      if(searchText[0]){
        for (var s = 0; s < searchText.length; s++) {
          var titleRegexStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
          regex.push(titleRegexStr);
        }
      } else {
        var regexStr = new RegExp(["^.*.*"].join(""), "gi");
        regex.push(regexStr);
      }

      switch (searchtype) {
        case 'content':
        if(_.isEqual('receiveTap', pageType)){
          condition=[{'receiveMsg.content': {$in: regex}}];
        }else{
          condition=[{'sendMsg.content': {$in: regex}}];
        }

        break;
        case 'name':
        if(_.isEqual('receiveTap', pageType)){
          condition = [
            {"receiveMsg.userNick":{$in: regex}},
          ];
        }else{
          condition = [
            {"sendMsg.userNick":{$in: regex}},
          ];
        }

        break;
        default:
        if(_.isEqual('receiveTap', pageType)){
          condition = [
            {"receiveMsg.content": {$in: regex}},
            {"receiveMsg.userNick":{$in: regex}},
          ];
        } else {
          condition = [
            {"sendMsg.content": {$in: regex}},
            {"sendMsg.userNick":  {$in: regex}},
          ];
        }
      }
      switch(pageType){
        case "receiveTap" :
        //unwin option
        unwinObj = {path:"$receiveMsg"};
        //lookup option
        lookupObj = {
          "from" : "users",
          "localField" : "receiveMsg.sender",
          "foreignField" : "username",
          "as" : "userNick"
        };
        //group option
        groupObj = {
          _id : "$_id" ,
          userId: {$first:"$userId"},
          denial: {$first:"$denial"},
          receiveMsg : { $push : {
            _id:"$receiveMsg._id",
            content: "$receiveMsg.content",
            sender: "$receiveMsg.sender",
            check: "$receiveMsg.check",
            regDate: "$receiveMsg.regDate",
            refuse: "$receiveMsg.refuse",
            userNick:"$userNick.profile.nickName"
          }},
        };
        groupObj2 = {
          _id : "$_id" ,
          userId: {$first:"$userId"},
          denial:{$first:"$denial"},
          receiveMsg : { $push : {
            _id:"$receiveMsg._id",
            content: "$receiveMsg.content",
            sender: "$receiveMsg.sender",
            check: "$receiveMsg.check",
            regDate: "$receiveMsg.regDate",
            refuse: "$receiveMsg.refuse",
            userNick:"$receiveMsg.userNick"
          }},
        };

        break;
        case "sendTap":
        unwinObj = {path:"$sendMsg"};
        lookupObj = {
          "from" : "users",
          "localField" : "sendMsg.receiver",
          "foreignField" : "username",
          "as" : "userNick"
        };
        groupObj = {
          _id : "$_id" ,
          userId: {$first:"$userId"},
          denial:{$first:"$denial"},
          sendMsg : { $push : {
            _id:"$sendMsg._id",
            content: "$sendMsg.content",
            receiver: "$sendMsg.receiver",
            check: "$sendMsg.check",
            regDate: "$sendMsg.regDate",
            sendCancel: "$sendMsg.sendCancel",
            userNick:"$userNick.profile.nickName"
          }
        },
      };
      groupObj2 = {
        _id : "$_id" ,
        userId: {$first:"$userId"},
        denial:{$first:"$denial"},
        sendMsg : { $push : {
          _id:"$sendMsg._id",
          content: "$sendMsg.content",
          receiver: "$sendMsg.receiver",
          check: "$sendMsg.check",
          regDate: "$sendMsg.regDate",
          sendCancel: "$sendMsg.sendCancel",
          userNick:"$sendMsg.userNick"
        }},
      };
      break;
    }//end switch

    var data = CLT.ImsMessage.aggregate(
      // Pipeline
      [
        {$match: {"userId" : user}},
        {$unwind: unwinObj},
        {$lookup: lookupObj},
        {$unwind: {path: "$userNick", preserveNullAndEmptyArrays: true}},
        {$group: groupObj},
        {$unwind: unwinObj},
        {$match: {$or : condition}},
        {$group: groupObj2},
        {$project: {
          _id : 1,
          userId:1,
          receiveMsg:1,
          sendMsg:1,
          denial:1
        }
      },
    ]);
    return data;
  }},
  //메세지 삭제
  // deleteMsg:function(id,user){
  //   return CLT.ImsMessage.update({userId:user},{$pull: {receiveMsg :{_id:id}}},{multi: true});
  // },
  //메세지 전송
  sendMessage:function(loginid, receiverId, msgContent){
    if(Meteor.isServer){
      var msgObject = CLT.ImsMessage.findOne({userId:receiverId});
      var uid = new Meteor.Collection.ObjectID().valueOf();
      var refuseTf = false;
      if(msgObject){
        _.each(msgObject.denial, function(userInfo){
          if(userInfo.userId === loginid){
            refuseTf = true;
          }
        });

        CLT.ImsMessage.update({userId:loginid },{$push: {sendMsg:{_id:uid, content:msgContent, receiver:receiverId, check:false, regDate:global.utilGetDate().default}}});
        CLT.ImsMessage.update({userId:receiverId },{$push: {receiveMsg:{_id:uid, content:msgContent, sender:loginid, check:false, regDate:global.utilGetDate().default, refuse:refuseTf}}});

      } else {
        CLT.ImsMessage.insert({
          userId: receiverId,
          denial:[],
          receiveMsg:[{
            _id:uid,
            content : msgContent,
            sender : loginid,
            check : false,
            regDate : global.utilGetDate().default,
            refuse : refuseTf
          }],
          sendMsg:[]
        });

        CLT.ImsMessage.insert({
          userId: loginid,
          denial:[],
          sendMsg:[{
            _id:uid,
            content : msgContent,
            receiver : receiverId,
            check : false,
            regDate : global.utilGetDate().default,
          }],
          receiveMsg:[]
        });
      }

      return uid;
    }
  },
  //메세지 확인
  checkMessage:function(user,msgId,senderId){
    CLT.ImsMessage.update({userId:senderId,sendMsg:{$elemMatch: {_id:msgId }}},{$set: {"sendMsg.$.check": true}});
    return CLT.ImsMessage.update({userId:user,receiveMsg:{$elemMatch: {_id:msgId }}},{$set: {"receiveMsg.$.check": true}});
  },
  //보낸메세지 조회 user: 사용자 recipient:보낸대상
  getSendMessage: function(user,recipient){
    CLT.ImsMessage.find().fetch();
  },
  //신규가입유져 추가
  addUserMsgData: function(loginUserId){
    CLT.ImsMessage.insert({userId:loginUserId, denial:[], recipient:[], receiveMsg:[], sendMsg:[]});
  },
  //보낸메세지 내쪽에서만 삭제
  sendedMsgDel: function(loginUserId, uid){
    return CLT.ImsMessage.update({userId:loginUserId },{$pull: {sendMsg :{_id:uid}}});
  },
  //메세지 삭제
  deleteReceiveMsg:function(_userId, _targetUid){
    var targetUid;
    if(_.isArray(_targetUid)){
      targetUid = _targetUid;
    } else {
      targetUid = [_targetUid];
    }

    return CLT.ImsMessage.update(
      {userId:_userId },
      {$pull: {
        receiveMsg:{_id:{$in : targetUid}}}
      }
    );
  },

  //사용자 차단
  addDenialUser: function(loginUserId,targeUser){
    var findResult = CLT.ImsMessage.find({userId:loginUserId,"denial.userId":targeUser}).fetch()[0];
    if(findResult){
      return true;
    }else{
      return CLT.ImsMessage.upsert({userId:loginUserId },{$push: {denial : {userId:targeUser, regDate:global.utilGetDate().default }}});
    }
  },
  //발신데이터 취소 flag
  setCancleMsgFlag : function(loginUserId,targetId){
    return CLT.ImsMessage.update({userId:loginUserId,sendMsg:{$elemMatch: {_id:targetId }}},{$set: {"sendMsg.$.sendCancel": true}});
  },
  //차단목록 취소
  unSetDenialUserArr : function(loginUserId, targetArr){
    //차단글 취소

    if(Meteor.isServer){
      CLT.ImsMessage.find({ userId: loginUserId })
      .forEach(function (doc) {
        doc.receiveMsg.forEach(function (msg) {
          for(var i in targetArr){
            if (msg.sender === targetArr[i]) {
              msg.refuse=false;
            }
          }
        });
        CLT.ImsMessage.update({userId:loginUserId},doc);
      });
    }

    // CLT.ImsMessage.update({userId:loginUserId,receiveMsg:{$elemMatch:{sender:{$in:targetArr}}}},{$set :{"receiveMsg.$.refuse":false }},{multi:true});
    return CLT.ImsMessage.update({userId:loginUserId},{$pull : {"denial": {"userId": {$in:targetArr}}}});
  }
});
