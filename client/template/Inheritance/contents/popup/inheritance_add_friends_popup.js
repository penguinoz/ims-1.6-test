import {global} from '/imports/global/global_things.js';

// 상속인/가디언 추가(팝업)
var templateName = 'inheritanceAddFriendsPopup';
var totalArray = [];

Template[templateName].onCreated(function(){

  var instance =  this;
  instance.userGroupsInfo = [];
  instance.preSelectedUsers = [];
  instance.groups = new ReactiveVar();
  instance.friendsList = new ReactiveVar();
  instance.nonUserList = new ReactiveVar();
  instance.orginFriendsList = [];
  instance.nonUsersAddCount = 0;
  instance.imsUsers = [];
  instance.noneUsers = [];
  instance.profileImg = []; //썸네일

  instance.profileImgThumb = null; //썸네일
  instance.profileImgOrigin = null; //원본파일
  instance.profileImgOriginRe = null; //원본파일 줄인것

  var nonUsers = [
    {
      _id : Template.instance().nonUsersAddCount,
      nonUserName : '',
      nonUserEmail : '',
    }
  ];
  Template.instance().nonUserList.set(nonUsers);

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
  isFromGuardian : function(){
    var inst = Template.instance();
    if(inst.data.viewOption && inst.data.viewOption === true){
      return true;
    }else{
      return false;
    }
  },
  hpNonUsers : function(){
    return Template.instance().nonUserList.get();
  }
});

Template[templateName].events({
  'click [name="add"]': function(e, t) {
    e.preventDefault();

    var nonUsers = t.nonUserList.get();
    t.nonUsersAddCount = t.nonUsersAddCount + 1;
    var addRowData = {
      _id : t.nonUsersAddCount,
      nonUserName : '',
      nonUserEmail : ''
    };
    nonUsers.push(addRowData);
    t.nonUserList.set(nonUsers);
  },
  'click [name="remove"]': function(e, t) {
    e.preventDefault();

    var temp = t.nonUserList.get();
    var selectedId = this._id;
    temp = _.reject(temp, function(nonUser){
      return _.isEqual(_.findWhere(temp, {_id:selectedId}), nonUser);
    });

    t.nonUserList.set(temp);
  },
  //그룹친구 추가 버튼
  "click #save": function(e, t){
    e.preventDefault();

    var parentTempl = this.parentViewId.replace("Template.","");    //modal 호출 필수요소
    var imsUserList = Template.instance().imsUsers; //[{userId:'aaa', isIMSUser: true},{userId:'bbb', isIMSUser: true}] 형태

    var imageInfo = '';
    if(t.profileImgOriginRe){
      imageInfo = global.s3.folder.profile +'/' + t.profileImgOriginRe.fileName;
    }

    var noneUserList = [];
    var noneUserInfo = {};
    //제약조건 확인
    if(t.data.viewOption && t.data.viewOption === true){
      // 가디언추가 일때 (이미지가 없음)
      var insertUserData = global.utilGetChlidrenDataArray($('#selfInsert'));
      for(var i in insertUserData){
        if(insertUserData[i].nonUserName && insertUserData[i].nonUserEmail){
          noneUserList.push(insertUserData[i]);
        }else{
          if(!insertUserData[i].nonUserName && !insertUserData[i].nonUserEmail){

          }else{
            global.utilAlert('비유저 정보는 이름과 이메일을 모두 작성하셔야 합니다.')
            return;
          }
        }
      }

      // var preUserId = Template.instance().preSelectedUsers;
      // for(var i in noneUserList){
      //   if(_.has(_.invert(preUserId), noneUserList[i].nonUserEmail.trim().toLowerCase())){
      //     global.utilAlert(noneUserList[i].nonUserEmail + "은 이미 등록된 이메일입니다.");
      //     return;
      //   }
      // }
      //
      // ////////////////////비유져 중복체크 ////////////////////////////////////
      // //가입유저중에 확인
      // if(t.usersEmails){
      //   for(var j in noneUserList){
      //     for(var i in t.usersEmails){
      //       if(t.usersEmails[i].email === noneUserList[j].nonUserEmail){
      //         global.utilAlert(noneUserList[j].nonUserEmail+' 는 이미 등록된 이메일 입니다.');
      //         return;
      //       }
      //     }
      //   }
      // }
      //입력된 내용에서 중복확인
      // for(var i in noneUserList){
      //   var countEmail = 0;
      //   for(var j in noneUserList){
      //
      //     if(noneUserList[i].nonUserEmail !== undefined && noneUserList[i].nonUserEmail === noneUserList[j].nonUserEmail){
      //       countEmail++;
      //     }
      //     if(countEmail > 1){
      //       global.utilAlert(noneUserList[j].nonUserEmail+' 는 중복된 이메일 입니다.');
      //       return;
      //     }
      //   }
      // }
      ///////////////////////////////////////////////////////////////////////


    }else{
      // 상속인추가일때 (이미지를 업로드함)
      noneUserInfo = {
        isIMSUser : false,
        userId : $("#nonUserEmail").val().trim(),
        eMail : $("#nonUserEmail").val().trim(),
        name : $("#nonUserName").val().trim(),
        image : imageInfo
      };
      if(!$("#nonUserName").val().trim() && $("#nonUserEmail").val().trim()){
        global.utilAlert("직접입력 대상의 이름은 필수 항목입니다.");
        $("a[href='#selfInsert']").tab("show");
        $("#nonUserName").focus();
        return;
      }

      if(!$("#nonUserEmail").val().trim() && $("#nonUserName").val().trim()){
        global.utilAlert("직접입력 대상의 이메일은 필수 항목입니다.");
        $("a[href='#selfInsert']").tab("show");
        $("#nonUserEmail").focus();
        return;
      }

      // var preUserId = Template.instance().preSelectedUsers;
      // if(_.has(_.invert(preUserId), $("#nonUserEmail").val().trim().toLowerCase())){
      //   global.utilAlert($("#nonUserEmail").val() + "은 이미 등록된 이메일입니다.");
      //   return;
      // }
    }

    // console.log(imsUserList, noneUserInfo);
    if(!_.isEmpty(noneUserInfo.userId)){
      noneUserList = [noneUserInfo];
    }
    var userListObj = {
      users : imsUserList,
      nonUsers : noneUserList
    };
    if(t.data && t.data.preSelectedUsers){
      userListObj.preSelecter = t.data.preSelectedUsers;
    }
    var errorMessage = '';
    var emailList = [];
    if (t.data.viewOption && t.data.viewOption === true) {
      userListObj.nonUsers.map(function(item) {
        emailList.push(item.nonUserEmail);
      });
    } else {
      userListObj.nonUsers.map(function(item) {
        emailList.push(item.eMail);
      });
    }

    var sameFlag = false;
    emailList.reduce(function(a, b) {
      if (a.indexOf(b) < 0) {
        a.push(b);
      } else {
        sameFlag = true;
      }
      return a;
    }, []);

    if (sameFlag) {
      return global.utilAlert("중복된 이메일이 있습니다.");
    }

    var query = {
      'profile.email': {$in: emailList}
    };
    Meteor.call('getUserCheck', query, function(error, result) {
      if (!error) {
        if (result !== 0) {
          return global.utilAlert("이미 등록된 이메일입니다.");
        } else {
          unionUserList = _.union(imsUserList, noneUserList);
          Template[parentTempl].__helpers.get('hpAddUsersCallBack')(unionUserList, t.profileImg, userListObj);
          Modal.hide();
        }
      }
    });
  },
  "click #cancel":function(){
    Modal.hide();
  },
  //상속인 그룹 검색
  "change #keywordCondition": function(e, t){
    e.preventDefault();

    resObjRef = [];
    var searchGroupOp = $('#keywordCondition').val();
    if(searchGroupOp === '전체'){
      t.friendsList.set(t.orginFriendsList);
    } else {
      var resObj = _.findWhere(t.userGroupsInfo, {groupName : searchGroupOp});
      for(var i=0; i<resObj.groupMember.length ; i++){
        var refine = {};
        if(t.preSelectedUsers){
          if(!_.has(_.invert(t.preSelectedUsers),resObj.groupMember[i])){
            refine.groupName = resObj.groupName;
            refine.userId = resObj.groupMember[i].userId;
            resObjRef.push(refine);
          }
        } else {
          refine.groupName = resObj.groupName;
          refine.userId = resObj.groupMember[i].userId;
          resObjRef.push(refine);
        }
      }
      t.friendsList.set(resObjRef);
    }
  },
  //상속인 검색
  "click #search": function(e,t){
    e.preventDefault();
    // var searchOp = $("#keywordCondition").val();
    var searchKeyword = $("#keywordText").val()||"";
    var searchResult = [];
    var friendsList = Template.instance().orginFriendsList;
    // switch(searchOp){
    //   case 'userId':
    //   for(var i=0; i<friendsList.length; i++){
    //     if(friendsList[i].userId.search(searchKeyword) !== -1){
    //       searchResult.push(friendsList[i]);
    //     }
    //   }
    //   break;
    //   default:
    //   for(var j=0; j<friendsList.length; j++){
    //     if(friendsList[j].userInfo[searchOp].search(searchKeyword) !== -1){
    //       searchResult.push(friendsList[j]);
    //     }
    //   }
    //   break;
    // }
    for(var i=0; i<friendsList.length; i++){
      if(global.fn_getNickName(friendsList[i].userId).search(searchKeyword) !== -1){
        searchResult.push(friendsList[i]);
      }
    }

    if(!searchKeyword){
      searchResult = friendsList;
    }

    Template.instance().friendsList.set(searchResult);
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
      for(var i in fList){
        fList[i].isMember = false;
        instanceData.imsUsers = [];
      }
    }
    t.friendsList.set(fList);
  },
  "click #addNoneUser": function(e, t){
    e.preventDefault();

    if(!$("#nonUserName").val()){
      return global.utilAlert("이름을 작성해 주세요");
    }
    if(!$("#nonUserEmail").val()){
      return global.utilAlert("이메일을 작성해 주세요");
    }

    var noneUserList = [];
    var noneUserInfo = {};
    noneUserInfo.nonUserName = $("#nonUserName").val();
    noneUserInfo.nonUserEmail = $("#nonUserEmail").val();
    // noneUserList.push(noneUserInfo);
    // $("#nonUserName").val("");
    // $("#nonUserEmail").val("");
    // Template.instance().noneUsers.set(noneUserList);
    // Session.set('adduserAndNonuser nonUsergroupInfo',noneUserList);
  },
  "click #deleteNoneUser": function(e, t){
    e.preventDefault();

    var sessData = Session.get('adduserAndNonuser nonUsergroupInfo');
    for(var i=0; i<sessData.length ; i++){
      if(sessData[i].nonUserEmail === this.nonUserEmail && sessData[i].nonUserName === this.nonUserName){
        sessData.splice(i,1);
      }
    }
    Template.instance().noneUsers.set(sessData);
    Session.set('adduserAndNonuser nonUsergroupInfo',sessData);
  },
  //비유저 프로필사진 추가
  "change .txtImageFile": function(e, t){
    e.preventDefault();

    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function  () {
      var newFileName = Meteor.uuid();
      //원본이미지 파일
      t.profileImgOrigin = {
        fileName : (newFileName + '_origin.jpeg'),// + e.target.files[0].type.split("/")[1]),
        data : reader.result
      };

      var tempImage = new Image();
      tempImage.src = reader.result;
      tempImage.onload = function () {
        //보기용 canvas생성
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext("2d");
        canvas.width = 47;
        canvas.height = 47;
        canvasContext.drawImage(this, 0, 0, 47, 47);
        var dataURI = canvas.toDataURL("image/jpeg");

        //썸네일 이미지 보여주기
        t.$('#profileImg').attr('src',dataURI);

        //원본수정(originRe)용 canvas생성
        var width = this.width;
        var height = this.height;

        if(width >= height){
          if(width > 1024){
            width = 1024;
            height = this.height * (1024/this.width);
          }
        } else {
          if(height > 800){
            height = 800;
            width = this.width * (1024/this.height);
          }
        }

        var canvasOriginRe = document.createElement('canvas');
        var canvasContextOriginRe = canvasOriginRe.getContext("2d");
        canvasOriginRe.width = width;
        canvasOriginRe.height = height;
        canvasContextOriginRe.drawImage(this, 0, 0, width, height);
        var dataURIOriginRe = canvasOriginRe.toDataURL("image/jpeg");

        //썸네일
        t.profileImgThumb = {
          fileName : (newFileName + '_thumb' + '.' + 'jpeg'),
          data : dataURI
        };

        //원본파일 줄인것
        t.profileImgOriginRe = {
          fileName : (newFileName + '.' + 'jpeg'),
          data : dataURIOriginRe
        };

        t.profileImg = [
          t.profileImgOrigin,
          t.profileImgThumb,
          t.profileImgOriginRe
        ];
      };
    };
  },
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

  searchOp = ['profile.email','username'];
  var userEmails = global.utilGetUsersInfo(Template.instance().data.preSelectedUsers,searchOp);
  var userEmailResult = [];
  _.each(userEmails, function(item){
    userEmailResult.push({
      email : item.profile.email,
      userId : item.userId,
    });
  });


  Template.instance().userGroupsInfo = userGroupsInfo;
  Template.instance().groups.set(groupsName);
  Template.instance().friendsList.set(result);
  Template.instance().orginFriendsList = result;
  Template.instance().usersEmails = userEmailResult;
}
