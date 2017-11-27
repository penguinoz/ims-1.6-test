import {global} from '/imports/global/global_things.js';

var templateName = 'adduserAndNonuser';
var resultGroupInfo;
var datas;
var resObjRef;
var friendChecked;

Template[templateName].onCreated(function(){
  datas = [];
  datas = this.data;
  resultGroupInfo = [];
  groupItem = [];
  resObjRef = [];
  friendChecked = [];
  Session.set("adduserAndNonuser groups", []);
  Session.set('adduserAndNonuser groupMemberInfo', []);
  Session.set('adduserAndNonuser messageUsers', []);
  var strIndex = datas.friends.indexOf(global.login.userId);
  if(strIndex !== -1){
      datas.friends.splice(strIndex,1);
  }
  friendChecked = datas.friends;
  if(this.data.unUserFriends){
    Session.set('adduserAndNonuser nonUsergroupInfo', this.data.unUserFriends);
  }else{
    Session.set('adduserAndNonuser nonUsergroupInfo', []);
  }
  Meteor.call('getMessageUserList',datas.underbarId,function(err,res){
    if(err){console.log(err);}
    if(res){
      Session.set('adduserAndNonuser messageUsers',res);
    }
  });
});

Template[templateName].onRendered(function(){
  var searchOp = ['profile.friends.groups'];
  resultGroupInfo = global.utilGetUsersInfo([global.login.userId],searchOp)[0].profile.friends.groups;
  searchFullData();
});

Template[templateName].helpers({
  hpGroupList: function(){
    return Session.get("adduserAndNonuser groups");
  },
  hpFriendList: function(){
    return Session.get('adduserAndNonuser groupMemberInfo');
  },
  hpNonGroupFriendList: function(){
   return Session.get('adduserAndNonuser nonUsergroupInfo');
 },
  isGroupMem: function(userId){
    return _.where(friendChecked, userId).length !== 0;
  },
  hpHaveMsgUser: function(userId){
    var fList = Session.get('adduserAndNonuser messageUsers');
    return _.where(fList, userId).length !== 0;
  }
});

Template[templateName].events({
  "change #keywordCondition": function(e, t){
    resObjRef = [];
    var searchGroupOp = $('#keywordCondition').val();
    if(searchGroupOp === '전체'){
      searchFullData();
      return;
    }
    var resObj = _.findWhere(resultGroupInfo, {groupName : searchGroupOp});

    for(var i=0; i<resObj.groupMember.length ; i++){
      var refine = {};
       refine.groupName = resObj.groupName;
       refine.groupMember = resObj.groupMember[i];
       resObjRef.push(refine);
    }
    Session.set('adduserAndNonuser groupMemberInfo', resObjRef);
  },
  "click #checkboxDiv": function(e, t){
    var fList = Session.get('adduserAndNonuser messageUsers');
    if(_.where(fList, this.groupMember).length !== 0){
      global.utilAlert("메세지 작성유저는 삭제 할 수 없습니다.");
    }
  },
  "change input[name='inputCheck']": function(e, t){
    if(e.target.checked){
      friendChecked.push(this.groupMember);
    }else{
      friendChecked.splice(friendChecked.indexOf(this.groupMember),1);
    }
  },
  "click #searchBt": function(e, t){
    var searchText = $("#searchKeyword").val();
    var refinedArr = [];
    if(!searchText){
      Session.set('adduserAndNonuser groupMemberInfo', resObjRef);
      return;
    }
    var sessionObj = resObjRef;
    for(var i=0; i<sessionObj.length ; i++){
      if(sessionObj[i].groupMember.indexOf(searchText) !== -1){
        refinedArr.push(sessionObj[i]);
      }
    }
    Session.set('adduserAndNonuser groupMemberInfo',refinedArr);
  },
  "click #saveFriendBt": function(e, t){

    if(!$("#nonUserName").val()){
      global.utilAlert("이름을 작성해 주세요");
      return;
    }
    if(!$("#nonUserEmail").val()){
      global.utilAlert("이메일을 작성해 주세요");
      return;
    }
    var tackbebox = Session.get('adduserAndNonuser nonUsergroupInfo');
    var baguny = {};
    baguny.nonUserName = $("#nonUserName").val();
    baguny.nonUserEmail = $("#nonUserEmail").val();
    tackbebox.push(baguny);
    $("#nonUserName").val("");
    $("#nonUserEmail").val("");
    Session.set('adduserAndNonuser nonUsergroupInfo',tackbebox);
  },
  "click #delFriendBt": function(e, t){
    var sessData = Session.get('adduserAndNonuser nonUsergroupInfo');
    for(var i=0; i<sessData.length ; i++){
      if(sessData[i].nonUserEmail === this.nonUserEmail && sessData[i].nonUserName === this.nonUserName){
        sessData.splice(i,1);
      }
    }
    Session.set('adduserAndNonuser nonUsergroupInfo',sessData);
  },
  "click #saveClose": function(e, t){
    var parentTempl = t.data.parentViewId;
    parentTempl = parentTempl.substr(9);
    var nonUsers = Session.get('adduserAndNonuser nonUsergroupInfo');
    var userSession = Session.get('adduserAndNonuser groupMemberInfo');
    // var users = [];
    // for(var i=0; i<userSession.length ; i++){
    //   if($("#groupCheck_"+i).is(":checked")){
    //
    //     users.push(userSession[i].groupMember);
    //   }
    // }
    Template[parentTempl].__helpers.get('hpUserNonUserCallBack')(friendChecked,nonUsers);
    Modal.hide();
  },
  "click #cancelClose": function(e, t){
    Modal.hide();
  }
});

function searchFullData(){
    var groups = [];
    var friendsList = [];
    for(var index in resultGroupInfo){
      for(var i=0; i<resultGroupInfo[index].groupMember.length; i++){
        var fobj = {};
        fobj.groupName = resultGroupInfo[index].groupName;
        groups.push(resultGroupInfo[index].groupName);
        fobj.groupMember = resultGroupInfo[index].groupMember[i];
        friendsList.push(fobj);
      }
    }
    Session.set("adduserAndNonuser groups", _.uniq(groups));

    var result = _.chain(friendsList).groupBy("groupMember").map(function(value,key){
                            return{
                                groupMember: key,
                                groupName: _.map(value, function(a){return a.groupName;})
                            };
                        }).value();
    for(var j in result){
      result[j].groupName = result[j].groupName.toString();
    }
    var searchOp = ['profile.friends.accept'];
    var nonGroupUser = global.utilGetUsersInfo([global.login.userId],searchOp)[0].profile.friends.accept;
    if(nonGroupUser){
      for(var i= 0; i<nonGroupUser.length ; i++){
        if(!_.findWhere(result,{groupMember:nonGroupUser[i].userId})){
          var paramObj = {};
          paramObj.groupMember = nonGroupUser[i].userId;
          paramObj.groupName = "";
          result.push(paramObj);
        }
      }
    }
    resObjRef = result;
    Session.set('adduserAndNonuser groupMemberInfo', result);

}
