//가디언 method
import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.InhGuardians = new Mongo.Collection('inheritanceGuardians');

Meteor.methods({
  //1. 가디언 요청
  setMyGuardiansRequest : function(userId, guardiansId){
    var gId = [];
    if(_.isArray(guardiansId)) {
      gId = guardiansId;
    } else {
      gid.push(guardiansId);
    }

    // CLT.InhGuardians.upsert(
    //   {userId:userId},
    //   {$set:,
    //     $setOnInsert: {'regDate': global.utilGetDate().default}
    //   }
    // );
  },

  //2. 가디언 수락
  setGuardiansAccept : function(userId, guardianId){
    var gId = [];
    if(_.isArray(guardiansId)) {
      gId = guardiansId;
    } else {
      gid.push(guardiansId);
    }

    // CLT.InhGuardians.upsert(
    //   {userId:userId},
    //   {$set:,
    //     $setOnInsert: {'regDate': global.utilGetDate().default}
    //   }
    // );
  },

  //3. 가디언 삭제
  deleteGuardians : function(useRId, guardianId){
    var gId = [];
    if(_.isArray(guardiansId)) {
      gId = guardiansId;
    } else {
      gid.push(guardiansId);
    }

    // CLT.InhGuardians.update(
    //   {useRId:guardianId},
    //  {$pull:{}}
    // );
  },
  pullReqList : function(userId , reqUserList){
    CLT.InhGuardians.update(
      {userId:userId},
      {$push:{
        request: {
          $each:reqUserList
        }
      }}
    );
    var users = [];
    for(var i in reqUserList){
      if(!reqUserList[i].userId){
        continue;
      }
      users.push(reqUserList[i].userId);
    }
    CLT.InhGuardians.update(
      {userId:{$in:users}},
      {$push:{
        receive: {
          userId:userId, regDate:global.utilGetDate().default
        }
      }},
      {multi: true}
    );
  },
  //가디언요청 취소
  delGuardiansRequest : function(userId, targetId){
    //방어코딩
    if(!targetId){
      return;
    }
    CLT.InhGuardians.update({userId:userId},{$pull:{request: {userId:targetId}}});
    CLT.InhGuardians.update({userId:targetId},{$pull:{receive: {userId:userId}}});
  },
  //가디언요청 취소 (비회원)
  delGuardiansRequestNonUser : function(userId, targetId){
    //방어코딩
    if(!targetId){
      return;
    }
    CLT.InhGuardians.update({userId:userId},{$pull:{request: {userId:targetId}}});
  },
  //가디언 요청 수락
  accetpGuardian : function(userId, targetId){
    CLT.InhGuardians.update({userId:userId},{$pull:{receive: {userId:targetId}}});
    CLT.InhGuardians.update({userId:targetId},{$pull:{request: {userId:userId}}});
    CLT.InhGuardians.update(
      {userId:userId},
      {$push:{
        accept: {
          userId:targetId,
          regDate:global.utilGetDate().default,
          type:'IG',
          obituary:false,
          obituaryRegDate:'',
          dieDate:''
        }
      }}
    );
    CLT.InhGuardians.update(
      {userId:targetId},
      {$push:{
        accept: {
          userId:userId,
          regDate:global.utilGetDate().default,
          type:'MG',
          obituary:false,
          obituaryRegDate:'',
          dieDate:''
        }
      }}
    );
  },
  // 가디언 거절
  refuseGuardian : function(userId, targetId){
    CLT.InhGuardians.update({userId:userId},{$pull:{receive: {userId:targetId}}});
    CLT.InhGuardians.update(
      {userId:userId},
      {$push:{
        refuse: {
          userId:targetId,
          regDate:global.utilGetDate().default,
        }
      }}
    );
  },
  //거절삭제
  deleteRefuseData : function(userId, targetId){
    CLT.InhGuardians.update({userId:userId},{$pull:{refuse: {userId:targetId}}});
    CLT.InhGuardians.update({userId:targetId},{$pull:{receive: {userId:userId}}});
  },
  cancelRefuseData : function(userId, targetId){
    CLT.InhGuardians.update({userId:userId},{$pull:{refuse: {userId:targetId}}});
    CLT.InhGuardians.update(
      {userId:userId},
      {$push:{
        receive: {
          userId:targetId, regDate:global.utilGetDate().default
        }
      }}
    );
  },
  //가디언 삭제 내가 가디언
  removeIGuardian : function(userId, targetId){
    CLT.InhGuardians.update({userId:userId}, {$pull:{accept: {$and:[{userId:targetId},{type:'IG'}]}}});
    CLT.InhGuardians.update({userId:targetId}, {$pull:{accept: {$and:[{userId:userId},{type:'MG'}]}}});
  },
  //나의 가디언 삭제
  removeMyGuardian : function(userId, targetId){
    CLT.InhGuardians.update({userId:userId}, {$pull:{accept: {$and:[{userId:targetId},{type:'MG'}]}}});
    CLT.InhGuardians.update({userId:targetId}, {$pull:{accept: {$and:[{userId:userId},{type:'IG'}]}}});
  },
  setObituaryData : function(userId, targetId,dieDate){
    var accepter = CLT.InhGuardians.findOne({userId:userId},{fields:{accept:1}});
    // console.log(accepter);
    // console.log(accepter.accept);
    var accData = accepter.accept.map(function(item){
      var reObj = item;
      if(reObj.userId === targetId && reObj.type === 'IG'){
        reObj.obituary = true;
        reObj.obituaryRegDate = global.utilGetDate().default;
        reObj.dieDate = dieDate;
      }
      return reObj;
    });
    CLT.InhGuardians.update({userId:userId}, {$set:{accept:accData} });
  },
  setRemoveObituaryData : function(userId, targetId){
    var accepter = CLT.InhGuardians.findOne({userId:userId},{fields:{accept:1}});
    // console.log(accepter.accept);
    var accData = accepter.accept.map(function(item){
      var reObj = item;
      if(reObj.userId === targetId && reObj.type === 'IG'){
        reObj.obituary = false;
        reObj.obituaryRegDate = "";
        reObj.dieDate = "";
      }
      return reObj;
    });
    CLT.InhGuardians.update({userId:userId}, {$set:{accept:accData} });
  }
});
