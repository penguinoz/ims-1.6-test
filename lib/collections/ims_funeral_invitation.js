import {global} from '/imports/global/global_things.js';
//장례식 초대 method
import {collections as CLT} from '/imports/global/collections.js';
// CLT.InhFuneralInvitation = new Mongo.Collection("imsFuneralInvitation");

Meteor.methods({
  getInviteFuneralInfo : function(userId){
    return CLT.InhFuneralInvitation.findOne({userId:userId});

  },
  setInvitationUser : function(userId, selecters){
    var selectedUsers = [];
    for(var i in selecters){
      selectedUsers.push(selecters[i].userId);
    }
    var users = Meteor.users.find({username:{$in:selectedUsers}}).fetch();
    var buildParam = users.map(function(item){
      var reObj = {};
      reObj.relationKind = '';
      reObj.userId = item.username;
      reObj.name = item.profile.name;
      reObj.phone = item.profile.phone;
      reObj.email = item.profile.email;
      reObj.address = item.profile.address;
      selecters = _.reject(selecters, function(obj){return obj.userId === item.username;});
      return reObj;
    });
    //비유져 처리
    for(var i in selecters){
      var obj = {};
      obj.relationKind = '';
      obj.userId = selecters[i].nonUserName;
      obj.name = selecters[i].nonUserName;
      obj.email = selecters[i].nonUserEmail;
      obj.phone = '';
      obj.address = '';
      buildParam.push(obj);

    }
    return buildParam;
  },
  saveInvitation : function(id, data){
    CLT.InhFuneralInvitation.upsert(
      {'_id':id},
      {$set:data,
      $setOnInsert: {'regDate': global.utilGetDate().default }});
  }
});
