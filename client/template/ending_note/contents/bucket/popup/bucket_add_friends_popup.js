import {global} from '/imports/global/global_things.js';

// 상속인/가디언 추가(팝업)
var templateName = 'bucketAddFriendsPopup';
var totalArray = [];
var instance;
Template[templateName].onCreated(function(){
  instance =  this;
  instance.userGroupsInfo = [];
  instance.preSelectedUsers = [];
  instance.groups = new ReactiveVar();
  instance.friendsList = new ReactiveVar();
  instance.nonUsers = new ReactiveVar();
  instance.nonUsersAddCount = 0;
  instance.orginFriendsList = [];
  instance.imsUsers = [];

  instance.profileImg = []; //썸네일

  instance.profileImgThumb = null; //썸네일
  instance.profileImgOrigin = null; //원본파일
  instance.profileImgOriginRe = null; //원본파일 줄인것


  if(this.data.preSelectedUsers){
    instance.preSelectedUsers = this.data.preSelectedUsers;

  }

  getFriendsData(instance.preSelectedUsers);
});

Template[templateName].onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].helpers({
  hpGroupList: function(){
    return Template.instance().groups.get();
  },
  hpFriendList: function(){
    return Template.instance().friendsList.get();
  },
  hpResultCounter: function(){
    var friends = Template.instance().friendsList.get();
    if(friends){
      return friends.length;
    }

    return 0;
  },
  hpIsPrivate : function(type){
    var result = false;
    if(_.isEqual(type, 'private')){
      result = true;
    }

    return result;
  },
  hpNonUsers : function(){
    return Template.instance().nonUsers.get();
  }
});

Template[templateName].events({
  'click [name="add"]': function(e, t) {
    e.preventDefault();


    var nonUsers = t.nonUsers.get();
    t.nonUsersAddCount = t.nonUsersAddCount + 1;
    var addRowData = {
      id : t.nonUsersAddCount,
      nonUserName : '',
      nonUserEmail : ''
    };
    nonUsers.push(addRowData);
    t.nonUsers.set(nonUsers);
  },
  // - (row 삭제)이벤트
  'click [name="remove"]': function(e, t) {
    e.preventDefault();

    var temp = t.nonUsers.get();
    var selectedId = this.id;
    temp = _.reject(temp, function(nonUser){
      return _.isEqual(_.findWhere(temp, {id:selectedId}), nonUser);
    });

    // var index = e.target.getAttribute('index');
    // temp.splice(Number(this.id), 1);
    // console.log(Number(this.id),temp);

    t.nonUsers.set(temp);
  },
  //그룹친구 추가 버튼
  "click #save": function(e, t){
    e.preventDefault();

    var parentTempl = this.parentViewId.replace("Template.","");    //modal 호출 필수요소
    var imsUserList = Template.instance().imsUsers; //[{userId:'aaa', isIMSUser: true},{userId:'bbb', isIMSUser: true}] 형태

    if(!$("[name=nonUserName]").val().trim() && $("[name=nonUserEmail]").val().trim()){
      global.utilAlert("직접입력 대상의 이름은 필수 항목입니다.");
      $("a[href='#selfInsert']").tab("show");
      $("[name=nonUserName]").focus();
      return;
    }

    if(!$("[name=nonUserEmail]").val().trim() && $("[name=nonUserName]").val().trim()){
      global.utilAlert("직접입력 대상의 이메일은 필수 항목입니다.");
      $("a[href='#selfInsert']").tab("show");
      $("[name=nonUserEmail]").focus();
      return;
    }

    var preUserId = Template.instance().preSelectedUsers;
    if(_.has(_.invert(preUserId), $("[name=nonUserEmail]").val().trim().toLowerCase())){
      global.utilAlert($("[name=nonUserEmail]").val() + "은 이미 등록된 이메일입니다.");
      return;
    }

    var imageInfo = '';
    if(t.profileImgOriginRe){
      imageInfo = global.s3.folder.profile +'/' + t.profileImgOriginRe.fileName;
    }

    var noneUserList = [];
    var noneUserInfo = {
      isIMSUser : false,
      userId : $("[name=nonUserEmail]").val().trim(),
      eMail : $("[name=nonUserEmail]").val().trim(),
      name : $("[name=nonUserName]").val().trim(),
      image : imageInfo
    };


    // console.log(imsUserList, noneUserInfo);
    if(!_.isEmpty(noneUserInfo.userId) && noneUserInfo.userId !== '0'){
      noneUserList = [noneUserInfo];
    }

    Template[parentTempl].__helpers.get('hpAddUsersCallBack')(imsUserList);
    Modal.hide();
  },
  "click #cancel":function(){
    Modal.hide();
  },
  //사용자 그룹 검색
  "change #keywordCondition": function(e, t){
    e.preventDefault();

    resObjRef = [];
    var searchGroupOp = $('#keywordCondition').val();
    if(searchGroupOp === '전체'){
      t.friendsList.set(t.orginFriendsList);
    } else {
      var resObj = _.findWhere(t.userGroupsInfo, {groupName : searchGroupOp});
      var userIds = _.uniq(_.pluck(resObj.groupMember, 'userId'));
      //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
      Meteor.call('getNickAndImg', userIds, function(error, result){
        if(error){
          console.log(error);
        } else {
          var userInfo = result;
          _.map(resObj.groupMember, function(info){
            var extend = _.findWhere(userInfo, {userId : info.userId});

            var refine = {};
            if(t.preSelectedUsers){
              if(!_.has(_.invert(t.preSelectedUsers),info.userId)){
                refine.groupName = resObj.groupName;
                refine.userId = info.userId;
                refine.nickName = extend.nickName;
                resObjRef.push(refine);
              }
            } else {
              refine.groupName = resObj.groupName;
              refine.userId = info.userId;
              refine.nickName = extend.nickName;
              resObjRef.push(refine);
            }
          });

          instance.friendsList.set(resObjRef);
        }
      });
    }
  },
  //친구 검색
  "click #search, keyup #keywordText": function(e,t){
    // e.preventDefault();

    if (e.type === 'click' || e.keyCode === 13) {
      var searchKeyword = $("#keywordText").val()||"";
      var searchResult = [];
      var friendsList = t.orginFriendsList;
      _.each(friendsList, function(friend){
        if(global.fn_getNickName(friend.nickName).search(searchKeyword) !== -1 || global.fn_getName(friend.name).search(searchKeyword) !== -1){
          searchResult.push(friend);
        }
      });
      // for(var i=0; i<friendsList.length; i++){
      //   if(global.fn_getNickName(friendsList[i].userId).search(searchKeyword) !== -1){
      //     searchResult.push(friendsList[i]);
      //   }
      // }

      if(!searchKeyword){
        searchResult = friendsList;
      }
      t.friendsList.set(searchResult);
    }
  },
  "change input[name=inputCkeck]": function(e, t){
    e.preventDefault();

    var instanceData = Template.instance();
    var userId = this.userId;

    if(e.target.checked){
      instanceData.imsUsers.push({
        userId : userId,
        isIMSUser : true
      });
    } else {
      instanceData.imsUsers.splice(_.indexOf(instanceData.imsUsers, _.find(instanceData.imsUsers, function (item) { return item.userId === userId; })), 1);
    }

    //검색시 check를 유지하기 위해 설정
    _.each(instanceData.orginFriendsList, function(friendsInfo){
      if(friendsInfo.userId === userId){
        friendsInfo.isMember = !friendsInfo.isMember;
      }
    });
  },

  "change input[name=inputCkeck]": function(e, t){
    e.preventDefault();

    var instanceData = Template.instance();
    var userId = this.userId;

    if(e.target.checked){
      instanceData.imsUsers.push({
        userId : userId,
        isIMSUser : true
      });
    } else {
      instanceData.imsUsers.splice(_.indexOf(instanceData.imsUsers, _.find(instanceData.imsUsers, function (item) { return item.userId === userId; })), 1);
      $("#tableCheck0").prop('checked', false);
    }

    //검색시 check를 유지하기 위해 설정
    _.each(instanceData.orginFriendsList, function(friendsInfo){
      if(friendsInfo.userId === userId){
        friendsInfo.isMember = !friendsInfo.isMember;
      }
    });
  },
  "change #tableCheck0": function(e, t){
    e.preventDefault();
    var instanceData = Template.instance();
    var fList = t.friendsList.get();
    if(e.target.checked){
      for(var i in fList){
        fList[i].isMember = true;
        instanceData.imsUsers.push({
          userId : fList[i].userId,
          isIMSUser : true
        });
      }
    }else{
      for(var j in fList){
        fList[j].isMember = false;
        instanceData.imsUsers = [];
      }
    }
    t.friendsList.set(fList);
  },
  // "click #addNoneUser": function(e, t){
  //   e.preventDefault();
  //
  //   if(!$("[name=nonUserName]").val()){
  //     alert("이름을 작성해 주세요");
  //     return;
  //   }
  //   if(!$("[name=nonUserEmail]").val()){
  //     alert("이메일을 작성해 주세요");
  //     return;
  //   }
  //
  //   var noneUserList = [];
  //   var noneUserInfo = {};
  //   noneUserInfo.nonUserName = $("[name=nonUserName]").val();
  //   noneUserInfo.nonUserEmail = $("[name=nonUserEmail]").val();
  //   // noneUserList.push(noneUserInfo);
  //   // $("[name=nonUserName]").val("");
  //   // $("[name=nonUserEmail]").val("");
  //   // Template.instance().nonUsers.set(noneUserList);
  //   // Session.set('adduserAndNonuser nonUsergroupInfo',noneUserList);
  // },
});

function getFriendsData(chosenFriends){
  //1. 그룹이 있는 친구정보 가져오기
  var searchOp = ['profile.friends.groups'];
  var userGroupsInfo = global.utilGetUsersInfo([global.login.userId],searchOp)[0].profile.friends.groups;
  var groupsName = [];
  var friends = [];
  _.each(userGroupsInfo, function(groupInfo){
    //2. 그룹 정보 가져오기 groupsName = [];
    groupsName.push(groupInfo.groupName);

    //3. 그룹에 속한 친구 정보 가져오기 friends = [];
    _.each(groupInfo.groupMember, function(member){
      var friendInfo = {};
      friendInfo.groupName = groupInfo.groupName;
      friendInfo.userId = member.userId;
      friends.push(friendInfo);
    });
  });

  //4. 친구 데이터 형태 변경
  var result = _.chain(friends).groupBy("userId").map(function(value,key){
    return{
      userId: key,
      groupName: _.map(value, function(a){return a.groupName;})
    };
  }).value();
  for(var j in result){
    result[j].groupName = result[j].groupName.toString();
  }

  //4. 그룹이 없는 친구 정보 가져오기
  searchOp = ['profile.friends.accept'];
  var nonGroupUser = global.utilGetUsersInfo([global.login.userId],searchOp)[0].profile.friends.accept;
  if(nonGroupUser){
    for(var i= 0; i<nonGroupUser.length ; i++){
      if(!_.findWhere(result,{userId:nonGroupUser[i].userId})){
        var paramObj = {};
        paramObj.userId = nonGroupUser[i].userId;
        paramObj.groupName = "";
        result.push(paramObj);
      }
    }
  }
  var resultTemp = result;

  //5.기선택된 친구리스트는 가져오지 않음
  if(chosenFriends){
    result = [];
    _.each(resultTemp, function(item){
      // console.log(resultTmp.profile.friends.accept);
      if(!_.has(_.invert(chosenFriends),item.userId)){
        result.push({
          groupName : item.groupName,
          userId : item.userId,
          isMember : false
        });
      }
    });
  }




  var userIds = _.uniq(_.pluck(result, 'userId'));
  //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
  Meteor.call('getNickAndImg', userIds, function(error, res){
    if(error){
      console.log(error);
    } else {
      var userInfo = res;
      _.map(result, function(info){
        var extend = _.findWhere(userInfo, {userId : info.userId});
        info.nickName = extend.nickName;
        info.name = extend.name;
      });

      instance.userGroupsInfo = userGroupsInfo;
      instance.groups.set(groupsName);
      instance.friendsList.set(result);
      instance.orginFriendsList = result;

      var nonUsers = [
        {
          id : instance.nonUsersAddCount,
          nonUserName : '',
          nonUserEmail : '',
          theFirst : true
        }
      ];
      instance.nonUsers.set(nonUsers);
    }
  });
}
