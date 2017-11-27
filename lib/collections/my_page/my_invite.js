import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsInvite = new Mongo.Collection("imsInvite");
Meteor.methods({

updateInviteData:function(loginId, inviteData){
  for(var i in inviteData){
    inviteData[i].regDate = global.utilGetDate().default;
     inviteData[i]._id = new Meteor.Collection.ObjectID().valueOf();
  }
  var findData = CLT.ImsInvite.find({userId:loginId}).fetch();
  if(findData.length === 0){
    CLT.ImsInvite.insert({userId:loginId,sendedInvite:[]});
  }

  return CLT.ImsInvite.update({userId:loginId},{$push:{ sendedInvite:{$each: inviteData } }});
},

getInviteData:function(loginId){
  return CLT.ImsInvite.findOne({userId:loginId});
},
//초대목록 삭제
delInviteData:function(loginId, dataIdArr){
  return CLT.ImsInvite.update({userId:loginId},{$pull : {"sendedInvite": {"_id": {$in:dataIdArr}}}});
}

});
