import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
Meteor.methods({
  // 친구리스트
  getFriendsList: function(userId) {
    var result = [];
    var resultTmp = Meteor.users.find({username: userId}, {fields:{'profile.friends.accept' : 1}}).fetch()[0];
    if(resultTmp){
      _.each(resultTmp.profile.friends.accept, function(item){
        // console.log(resultTmp.profile.friends.accept);
        result.push({
          userId : item.userId,
          regDate : item.regDate,
          userInfo : global.fn_getUserInfo(item.userId)
        });
      });
    }

    return result;
  },
  getFriendsListExceptChosen: function(userId, chosenFriends) {
    var result = [];
    var resultTmp = Meteor.users.find({username: userId}, {fields:{'profile.friends.accept' : 1}}).fetch()[0];
    if(resultTmp){
      _.each(resultTmp.profile.friends.accept, function(item){
        // console.log(resultTmp.profile.friends.accept);
        if(!_.has(_.invert(chosenFriends),item.userId)){
          result.push({
            userId : item.userId,
            regDate : item.regDate,
            userInfo : global.fn_getUserInfo(item.userId)
          });
        }
      });
    }

    return result;
  },

  // 친구요청 리스트 (내가 친구요청한 경우)
  getFriendListRequest: function(userId) {
    var result = [];
    var resultTmp = Meteor.users.find({username: userId}, {fields:{'profile.friends.request' : 1}}).fetch()[0];

    if(resultTmp){
      _.each(resultTmp.profile.friends.request, function(item){
        result.push({
          userId : item.userId,
          regDate : item.regDate,
          userInfo : global.fn_getUserInfo(item.userId)
        });
      });
    }
    return result;
    //L,M
  },

  // 친구요청 받은 리스트 (내가 친구요청 받은경우)
  getFriendListReceive: function(userId){
    var result = [];
    var resultTmp = Meteor.users.find({username: userId}, {fields:{'profile.friends.receive' : 1}}).fetch()[0];

    if(resultTmp){
      _.each(resultTmp.profile.friends.receive, function(item){
        result.push({
          userId : item.userId,
          regDate : item.regDate,
          userInfo : global.fn_getUserInfo(item.userId)
        });
      });
    }
    return result;
    // I, J
  },

  //친구신청 가능한 리스트
  getNotFriendList: function(userId){
    var result = [];
    // var resultTmp = ImsFriends.find({requestUserId: userId, accept: null},{fields: {userId: 1}}).fetch();
    // _.each(resultTmp, function(item){
    //     result.push({userId: item.userId});
    // });
    return result;
    // F, G, H, K
  },

  //친구요청가능한지 확인
  // param : userId (사용자 ID), targetUserId(친구요청할 ID)
  // return : ALF(already친구), RCF(received이미요청받음), RQF(request기요청함), NOF(none요청가능)
  getFriendRequestStatus: function(userId, targetUserId){
    var result = 0;
    var requestInfo = null;
    //본인인경우
    if(_.isEqual(userId, targetUserId)){
      // return 'MYS'; //myself
      requestInfo = {
        code : 'MYS',
        targetUserId : targetUserId,
        enableFlag : 'disabled',
        title : '나'
      };
      return requestInfo;
    }

    //이미 친구인경우
    //result = ImsFriends.find({$and: [{accept:true, $or: [{userId: userId, requestUserId: targetUserId}, {userId: targetUserId, requestUserId: userId}] }] }).count();
    result = Meteor.users.find({username: userId, 'profile.friends.accept':{$elemMatch : {userId : targetUserId}}}).count();
    if(result > 0){
      // return 'ALF';
      requestInfo = {
        code : 'ALF',
        targetUserId : targetUserId,
        enableFlag : 'enabled',
        title : '친구 끊기'
      };
      return requestInfo;
    }

    //기 친구요청한 경우
    result = Meteor.users.find({username: userId, 'profile.friends.request':{$elemMatch : {userId : targetUserId}}}).count();
    if(result > 0){
      // return 'RQF';
      requestInfo = {
        code : 'RQF',
        targetUserId : targetUserId,
        enableFlag : 'disabled',
        title : '친구요청 중'
      };

      return requestInfo;
    }

    //기 친구요청받은 경우
    result = Meteor.users.find({username: userId, 'profile.friends.receive':{$elemMatch : {userId : targetUserId}}}).count();
    if(result > 0){
      // return 'REF';
      // requestInfo = {
      //   code : 'REF',
      //   targetUserId : targetUserId,
      //   enableFlag : 'disabled',
      //   title : '수락대기 중'
      // };
      requestInfo = {
        code : 'REF',
        targetUserId : targetUserId,
        enableFlag : 'enabled',
        title : '친구수락'
      };
      return requestInfo;
    }

    //친구요청 가능
    // return 'NOF';
    requestInfo = {
      code : 'NOF',
      targetUserId : targetUserId,
      enableFlag : 'enabled',
      title : '친구요청'
    };
    return requestInfo;
    //return :
  },

  // 친구요청 신청 (INSERT)
  // param : userId (사용자 ID), targetUserId(친구요청할 ID)
  setFriendRequest: function(userId, targetUserId, message){
    // ImsFriends.insert({
    //   userId : userId,
    //   requestUserId : targetUserId,
    //   accept : null
    // });

    var condition = null;
    var regDate = global.utilGetDate().default;
    var result = true;

    if (_.isArray(targetUserId)){ //여러명에가 한꺼번에 친구요청
      condition = {$in : targetUserId};

      //내 정보에 친구요청 대상자 정보 추가
      _.each(targetUserId, function(tUserId){
        Meteor.users.update({username : userId},{$push: {'profile.friends.request':{
          userId : tUserId,
          message: message,
          regDate : regDate
        }}}, function(error){
          if(error){
            result = false;
            console.log(error);
          }
        });
      });

      //요청받는 대상자들에게 내정보 추가
      Meteor.users.update({username : condition},{$push: {'profile.friends.receive':{
        userId : userId,
        message: message,
        regDate : regDate
      }}},{multi: true}, function(error) {
        if (error) {
          result = false;
        }
      });

    } else { //한명에게 친구요청

      //내 정보에 친구요청 대상자 정보 추가
      Meteor.users.update({username : userId},{$push: {'profile.friends.request':{
        userId : targetUserId,
        regDate : regDate
      }}}, function(error){
        if(error){
          result = false;
          console.log(error);
        }
      });

      //요청받는 대상의 정보에 내정보 추가
      Meteor.users.update({username : targetUserId},{$push: {'profile.friends.receive':{
        userId : userId,
        message: message,
        regDate : regDate
      }}}, function(error) {
        if (error) {
          result = false;
        }
      });
    }

    return result;
  },

  //친구요청 수락
  // param : userId (사용자 ID), targetUserId(수락할 친구 ID)
  setAcceptFriendRequest: function(userId, targetUserId){
    // ImsFriends.update(
    //   { userId : targetUserId,
    //     requestUserId : userId },
    //   { $set : {accept : true} }
    // );

    var condition = null;
    var regDate = global.utilGetDate().default;


    // 다중 친구 수락
    if (_.isArray(targetUserId)){
      condition = {$in : targetUserId};


      _.each(targetUserId, function(tUserId){
        // 1.친구를 등록(다중)
        Meteor.users.update({username : userId},{$push: {'profile.friends.accept':{
          userId : tUserId,
          regDate : regDate,
          timeline: true
        }}}, function(error){
          if(error){
            console.log(error);
          }
        });

        //2. 요청 및 받은리스트에서 제거(다중)
        Meteor.users.update({username : userId},{$pull: {'profile.friends.receive':{
          userId : tUserId,
        }}}, function(error){
          if(error){
            console.log(error);
          }
        });
      });

      //3. 상대방 정보에 내 ID정보 친구로 등록
      Meteor.users.update({username : condition},{$push: {'profile.friends.accept':{
        userId : userId,
        regDate : regDate,
        timeline: true
      }}});

      //2. 요청 및 받은리스트에서 제거(다중)
      Meteor.users.update({username : condition},{$pull: {'profile.friends.request':{
        userId : userId
      }}});

    } else { //단일 친구 수락
      // 1.친구를 등록
      Meteor.users.update({username : userId},{$push: {'profile.friends.accept':{
        userId : targetUserId,
        regDate : regDate,
        timeline: true
      }}}, function(error){
        if(error){
          console.log(error);
        }
      });

      //2. 요청 및 받은리스트에서 제거
      Meteor.users.update({username : userId},{$pull: {'profile.friends.receive':{
        userId : targetUserId,
      }}}, function(error){
        if(error){
          console.log(error);
        }
      });

      //3. 상대방 정보에 내 ID정보 친구로 등록
      Meteor.users.update({username : targetUserId},{$push: {'profile.friends.accept':{
        userId : userId,
        regDate : regDate,
        timeline: true
      }}});

      Meteor.users.update({username : targetUserId},{$pull: {'profile.friends.request':{
        userId : userId,
      }}});
    }
  },

  //친구요청 거절
  // param : userId (사용자 ID), targetUserId(거절될 친구 ID)
  setDenyFriendRequest: function(userId, targetUserId){
    var condition = null;
    if (_.isArray(targetUserId)){
      condition = {$in : targetUserId};
      _.each(targetUserId, function(tUserId){
        Meteor.users.update({username : userId},{$pull: {'profile.friends.receive':{
          userId : tUserId
        }}}, function(error){
          if(error){
            console.log(error);
          }
        });
      });

      Meteor.users.update({username : condition},{$pull: {'profile.friends.request':{
        userId : targetUserId
      }}});
    } else {

      Meteor.users.update({username : userId},{$pull: {'profile.friends.receive':{
        userId : targetUserId
      }}}, function(error){
        if(error){
          console.log(error);
        }
      });

      Meteor.users.update({username : targetUserId},{$pull: {'profile.friends.request':{
        userId : userId
      }}});
    }
  },

  //친구 끊기
  setDeleteFriend: function(userId, targetUserId){
    var condition = null;
    var result = true;
    if (_.isArray(targetUserId)){
      condition = {$in : targetUserId};
      _.each(targetUserId, function(tUserId){
        Meteor.users.update({username : userId},{$pull: {'profile.friends.accept':{
          userId : tUserId
        }}}, function(error){
          if(error){
            console.log(error);
            result = false;
          }
        });

        // 그룹에 속한 친구들도 삭제하기
        var userInfo = Meteor.users.find({username: userId}).fetch()[0];
        var count = 0;
        userInfo.profile.friends.groups.map(function(item) {
          item.groupMember.map(function(sub) {
            if (sub.userId === tUserId) {
              count++;
            }
          });
        });
        for (var i = 0; i < count; i++) {
          Meteor.users.update({username: userId, 'profile.friends.groups.groupMember.userId': tUserId},
            {
              $pull: {'profile.friends.groups.$.groupMember': {userId: tUserId}}
            },
            function(error){
            if(error){
              console.log(error);
              result = false;
            }
          });
        }
        // 상대방친구 그룹에 내가 속한부분 빼기
        var targetUserInfo = Meteor.users.find({username: tUserId}).fetch()[0];
        var tCount = 0;
        targetUserInfo.profile.friends.groups.map(function(item) {
          item.groupMember.map(function(sub) {
            if (sub.userId === userId) {
              tCount++;
            }
          });
        });
        for (var j = 0; j < tCount; j++) {
          Meteor.users.update({username : tUserId, 'profile.friends.groups.groupMember.userId': userId},
            {
              $pull: {'profile.friends.groups.$.groupMember':{userId : userId}}
            },
            function(error) {
              if (error) {
                result = false;
              }
            }
          );
        }

      });

      Meteor.users.update({username : condition},
        {
          $pull: {'profile.friends.accept':{userId : userId}}
        },{multi: true},
        function(error) {
          if (error) {
            result = false;
          }
        }
      );

      return result;
    } else {
      Meteor.users.update({username : userId},{$pull: {'profile.friends.accept':{
        userId : targetUserId
      }}}, function(error){
        if(error){
          console.log(error);
        }
      });

      Meteor.users.update({username : targetUserId},{$pull: {'profile.friends.accept':{
        userId : userId
      }}});
    }
  },

  // 요청한 친구가있는지 체크
  requestCheck: function(userId, targetUserId) {
    return Meteor.users.find({username: userId, 'profile.friends.request.userId': {$ne: targetUserId} }).count();
  },

  // 요청받은 친구가있는지 체크
  receiveCheck: function(userId, targetUserId) {
    return Meteor.users.find({username: userId, 'profile.friends.receive.userId': targetUserId}).count();
  }

  //userId array로 유저정보 가져오기 param (array, array(string))
  // getSelectUserInfo: function(userIds, searchOption){
  //   var selectedField = {};
  //   if(searchOption){
  //     for(var i=0 ; i<searchOption.length ; i++){
  //       selectedField[searchOption[i]] = 1;
  //     }
  //   } else {
  //     console.error('option은 필수 요소 입니다.');
  //     return;
  //   }
  //   return Meteor.users.find({username: {$in:userIds}},{fields:selectedField}).fetch();
  // }
});

//사용예시 ###############################################################################################
// Meteor.call('getFriendsList', 'A', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendsList', result);
//   }
// });
// Meteor.call('getFriendListRequest', 'A', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendListRequest',result);
//   }
// });
// Meteor.call('getFriendListReceive', 'A', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendListReceive',result);
//   }
// });
//
//
// Meteor.call('getFriendRequestStatus', 'A','B', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendRequestStatus',result);
//   }
// });
//
// Meteor.call('getFriendRequestStatus', 'A','M', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendRequestStatus',result);
//   }
// });
//
// Meteor.call('getFriendRequestStatus', 'A','J', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendRequestStatus',result);
//   }
// });
//
// Meteor.call('getFriendRequestStatus', 'A','K', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendRequestStatus',result);
//   }
// });
//
// Meteor.call('getFriendRequestStatus', 'A','Z', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log('getFriendRequestStatus',result);
//   }
// });

// B : 친구
// M : 기 요청한
//
// J : 요청 받은
//
//
// K : 친구요청 수락안함
// Z : 친구 아님

// Meteor.call('getNotFriendList', 'A', function(error, result){
//   if(error){
//     console.log('error : ' + error);
//   }
//   else {
//     console.log(result);
//   }
// });
//###############################################################################################
