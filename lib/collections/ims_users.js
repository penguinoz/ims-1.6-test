import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// imsUser = new Mongo.Collection("users");

Meteor.methods({
  //고인이됨을 표시
  //1. users에 isPassAway false로 설정,
  //2. 상속컨텐츠 상속 되도록 수정
  setPassAway: function(userId, isPassAway){
    Meteor.users.update(
      {username : userId},
      {$set:{
        'profile.isPassAway' : isPassAway,
        'profile.passAwayDate' : global.utilGetDate().default
        }
      }
    );

    if(isPassAway){
      CLT.Inh.update(
        {userId:userId},
        {$set : {
          inheritanceDate : global.utilGetDate().default
        }},{multi: true}
      );
    } else {
      CLT.Inh.update(
        {userId:userId},
        {$set : {
          inheritanceDate : ''
        }},{multi: true}
      );
    }
  },

  userTimelineUpdate: function(userId, obj, userList) {
    _.each(userList, function(item) {
      return Meteor.users.update(
        {username: userId, 'profile.friends.accept.userId': item},
        {$set: obj}
      );
    });
  },

  userGroupRemove: function(userId, groupList) {
    _.each(groupList, function(item) {
      return Meteor.users.update(
        {username: userId},
        {$pull: {'profile.friends.groups': {groupName: item}}}
      );
    });
  },

  userGroupMemberAdd: function(userId, groupName, groupMember) {
    _.each(groupMember, function(item) {
      return Meteor.users.update(
        {username: userId, 'profile.friends.groups.groupName': groupName},
        {$push: {'profile.friends.groups.$.groupMember': {userId: item, regDate: global.utilGetDate().default}}}
      );
    });
  },

  userGroupMemberRemove: function(userId, groupName, groupMember) {
    _.each(groupMember, function(item) {
      return Meteor.users.update(
        {username: userId, 'profile.friends.groups.groupName': groupName},
        {$pull: {'profile.friends.groups.$.groupMember': {userId: item}}}
      );
    });
  },

  userGroupTitleUpdate: function(userId, title, defaultTitle) {
    return Meteor.users.update(
      {username: userId, 'profile.friends.groups.groupName': defaultTitle},
      {$set: {'profile.friends.groups.$.groupName': title}}
    );
  },

  setPassword: function(userId, password) {
    if (Meteor.isServer) {
      return Accounts.setPassword(userId, password);
    }
  },
  //기대수명 저장
  setExpectYear:function(loginUserId,expectYear){
    var birth = Meteor.users.find({username:loginUserId}).fetch()[0];
    if(birth && birth.profile.birthday && birth.profile.birthday.date){
      var date = new Date(birth.profile.birthday.date.substr(0,4),0,1);
      date.setYear(date.getFullYear()+parseInt(expectYear)-1);
      date = date.format("yyyy-MM-dd");
      return Meteor.users.update(
        {username:loginUserId},
        {$set:{'profile.expectYear':date}}
      );
    }
  },

  //별명과 프로파일 정보 Get
  // return Object
  getNickAndImg: function(_userIds){
    var result = [];
    var userIds =[];
    if(_.isArray(_userIds)){
      userIds = _userIds;
    } else {
      userIds = [_userIds];
    }

    var data = Meteor.users.find({username: {$in: userIds}},{fields:{'username':1, 'profile.nickName':1, 'profile.name':1, 'profile.profileImg':1}}).fetch();
    _.each(data, function(info){
      result.push({
        userId : info.username,
        nickName : info.profile.nickName,
        name : info.profile.name,
        profileImg : info.profile.profileImg ? info.profile.profileImg : null
      });
    });

    return result;
  },

  //사용자 이미지 정보 Get
  // return String
  getProfileImg: function(_userId){
    var result = Meteor.users.findOne({username: _userId},{fields:{'profile.profileImg':1}});
    return result ? result.profile.profileImg : null;
  },

  //사용자 별명정보 Get
  // return String
  getNickName: function(_userId){
    var result = Meteor.users.findOne({username: _userId},{fields:{'profile.nickName':1}});
    return result ? result.profile.nickName : _userId;
  },

  //사용자 이름정보 Get
  // return String
  getName: function(_userId){
    var result = Meteor.users.findOne({username: _userId},{fields:{'profile.name':1}});
    return result ? result.profile.name : _userId;
  },

  //사용자 정보 수집
  //prarms :
  //  - _userId : 사용자 아이디
  //  - _fieldsName[] : 사용 할 컬럼명
  getUserInfo: function(_userIds, _fieldsName){
    var selectedField = {};

    var userIds = [];
    if(_.isArray(_userIds)){
      userIds = _userIds;
    } else {
      userIds = [_userIds];
    }

    if(_fieldsName){
      _.each(_fieldsName, function(fName){
        selectedField[fName] = 1;
      });
    }
    var result = Meteor.users.find({username: {$in:userIds}},{fields:selectedField}).fetch();
    return result;
  },
  // 내 친구 검색
  getUsersInfoInAddFriends: function(_unUserId, _searchText, _condition){
    var tempStr = new RegExp(["^.*", _searchText, ".*"].join(""), "gi");
    var findObj = {
      username: {$nin: _unUserId}
    };
    if (_condition === 'all') {
      findObj.$or = [
        {'profile.nickName': tempStr},
        {'profile.name': tempStr}
      ];
    } else {
      findObj['profile.' + _condition] = tempStr;
    }

    result = Meteor.users.find(findObj).fetch();
    return result;
  },

  accountsCreateUser: function(join) {
    return Accounts.createUser(join);
  },

  // 유저가 있는지 없는지 체크
  getUserCheck: function(condition) {
    return Meteor.users.find(condition).count();
  },
  // 이름과 이메일로 유저 정보
  getUserInfoByNameEmail: function(name, email) {
    return Meteor.users.find({'profile.name': name, 'profile.email': email}).fetch();
  },
  // 비밀번호 변경시 날짜 및 flag 변경
  getPwChangeUpdate: function(userId, updateDate, isChange) {
    Meteor.users.update(
      {username: userId},
      {$set:
        {pwchange: { updateDate: updateDate, isChange: isChange } }
      }
    );
  }
});
