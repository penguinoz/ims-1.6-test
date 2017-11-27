import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';
//CLT.EnCapsuleMessage = new Mongo.Collection('endingNoteCapsuleMessage');

Meteor.methods({
  upsertCapsuleMessage: function(id,data){
    var qeuryRes = CLT.EnCapsuleMessage.findOne({_id:id},{backgroundImage : 1});

    var returnMessage = CLT.EnCapsuleMessage.upsert(
      {_id:id},
      {$set:{
        content:data.content,
        userId:data.userId,
        backgroundImage:data.backgroundImage,
        capsuleId:data.capsuleId,
        },
      $setOnInsert: {'regDate': global.utilGetDate().default, 'updateDate':global.utilGetDate().default}
      }
    );
    if (qeuryRes === undefined) {
      qeuryRes = {};
    }
    if (returnMessage) {
      qeuryRes.messageId = returnMessage.insertedId;
    }
    return qeuryRes;
  },

  deletetForReInsertMsg: function(capsuleid){
    CLT.EnCapsuleMessage.remove({capsuleId:capsuleid});
  },

  insertOpenCapMsgs: function(id,data){
    var qeuryRes = CLT.EnCapsuleMessage.findOne({_id:id},{backgroundImage : 1});

    var returnMessage = CLT.EnCapsuleMessage.insert(
      {
        content:data.content,
        userId:data.userId,
        backgroundImage:data.backgroundImage,
        capsuleId:data.capsuleId,
        'regDate': global.utilGetDate().default,
        'updateDate':global.utilGetDate().default
      }
    );
    if (qeuryRes === undefined) {
      qeuryRes = {};
    }
    if (returnMessage) {
      qeuryRes.messageId = returnMessage.insertedId;
    }
    return qeuryRes;
  },
  updateCapsuleMessage:function(id, dataObj){
    dataObj.updateDate = global.utilGetDate().default;

    CLT.EnCapsuleMessage.update(
      {_id : id},
      {$set: dataObj}
    );
  },
  findForEditMessage: function(id, userId){
    if(userId === " "){
      userId = /^/;
    }
    return CLT.EnCapsuleMessage.find({capsuleId:id,userId:userId}).fetch();
  },
  deleteCapsuleMessage: function(_id){
    var returnObj = CLT.EnCapsuleMessage.findOne({_id:_id});
    CLT.EnCapsuleMessage.remove(_id);
    return returnObj;
  },
  getMessageUserList: function(_id){
    //return CLT.EnCapsuleMessage.distinct('userId',{capsuleId:_id});
    var fList = CLT.EnCapsuleMessage.find({capsuleId:_id},{fields:{userId:1}}).fetch();
    var editFlist = [];
    for(var i in fList){
      editFlist.push(fList[i].userId);
    }
    return _.uniq(editFlist);
  },
  updateOpenMessageUser: function(id, openUser){
    CLT.EnCapsuleMessage.update({_id:id},{$set: {openUsers:openUser}});
  }
});
