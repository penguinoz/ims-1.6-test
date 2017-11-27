import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

//가디언(내가/나의)
var templateName = 'inheritanceGuardians';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.guardians = new ReactiveVar();
  instance.autorun(function(){
    var subscription = instance.subscribe('guardiansList_userId', global.login.userId);
    instance.guardians.set(CLT.InhGuardians.findOne());
  });
});

Template[templateName].helpers({
  hpGetguardians: function(){
    return Template.instance().guardians.get();
  },
  hpPageCheck: function(){
    var result = false;
    var pageType = Template.instance().data.pageType;
    if(_.isEqual(pageType, global.pageType.myGuardian)){
      result = true;
    }
    // console.log(result);
    return result;
  },
  hpAddUsersCallBack : function(addUser,nonParam, userObj){
    var reqPullUser = [];
    for(var i in addUser){
      if(!addUser[i].userId){
        if(addUser[i].nonUserName){
          reqPullUser.push({
            nonUserName:addUser[i].nonUserName,
            userId: addUser[i].nonUserEmail,
            regDate:global.utilGetDate().default});
        }
      }else{
        reqPullUser.push({
          userId:addUser[i].userId,
          regDate:global.utilGetDate().default});
      }
    }
    Meteor.call('pullReqList', global.login.userId, reqPullUser,function(err, res){
      if(err){
        console.log(err);
      }else{
        for(var i in addUser){

          if(addUser[i].userId){
            Meteor.call('setLog', '', '', global.login.userId, addUser[i].userId,  global.pageType.inHeritance, '', 'requestGuad','' );
            Meteor.call('setLog', '', '', addUser[i].userId ,global.login.userId ,  global.pageType.inHeritance, '', 'requestedGuadian','' );
          }else{
            Meteor.call('setLog', '', '', global.login.userId, addUser[i].nonUserName,  global.pageType.inHeritance, '', 'requestGuad','' );
            Meteor.call('setLog', '', '', addUser[i].nonUserName ,global.login.userId ,  global.pageType.inHeritance, '', 'requestedGuadian','' );
          }
          if(addUser[i].userId){
            var options = {
              userId : global.login.userId
            };
            Meteor.call('setNoti', addUser[i].userId, 'GD', '가디언 요청(postId)', 'receive', options);
          }
        }
      }
    });
  }
});



Template[templateName].events({
  "click div[name='addGuadianThum']": function(e, t){
    e.preventDefault();

    var friendsListParam =[];
    var nonUserprivateList =[];
    var friendsprivateParam = [];
    var modalobj = {};

    modalobj.template = 'inheritanceAddFriendsPopup';
    modalobj.size = 'imsr-pop modal-md inheritance';
    modalobj.fade = false;      modalobj.backdrop = 'static';
    modalobj.data = {
      title : '가디언 선택',
      parentViewId: Blaze.currentView.name,
      infoment:'*나의 가디언 정보를 입력해주세요.',
      viewOption : true
    };

    //리스트업되면 안돼는 리스트 생성
    var guardians = t.guardians.get();
    var usersId = [];
    var nonUserPreId = [];
    if(guardians){
      guardians.request.map(function(user){
        if(!user.nonUserEmail){
          usersId.push(user.userId);
        }else if(user.nonUserEmail){
          nonUserPreId.push(user.nonUserEmail);
        }
        // console.log(inheritor.inheritorId, usersId);
      });
      guardians.accept.map(function(user){
        if(user.type === 'MG'){
          usersId.push(user.userId);
        }
        // console.log(inheritor.inheritorId, usersId);
      });
      guardians.refuse.map(function(user){
        usersId.push(user.userId);
        // console.log(inheritor.inheritorId, usersId);
      });
    }

    modalobj.data.preSelectedUsers = usersId;
    modalobj.data.nonUserpreSelected = nonUserPreId;

    global.utilModalOpen(e, modalobj);
  },
  "click i[name='delRequestList']": function(e, t){
    var selfid = this;
    global.utilConfirm('요청을 취소 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('delGuardiansRequest',global.login.userId, selfid.userId, function(err, res){
          if(err){
            console.log(err);
          }else{
            // Meteor.call('setLog', '', '', global.login.userId, addUser[i].userId,  global.pageType.inHeritance, '', 'requestGuad','' );
          }
        });
      }
    }).catch(swal.noop);
  },
  "click a[name='checkRecive']": function(e, t){
    var self = this;
    Session.set('inheritance guardian selectedUser', this);
    global.utilConfirm("이름 : "+ this.name + "<br>  별명 : "+ this.nickName + "<br>   연락처 : "+ this.mobile +"<br>  이메일 : "+this.email,"",{confirm:'확인',cancel:'거절'}, this ).then(function(val) {
      if (val) {
        //확인
        var resUser = Session.get('inheritance guardian selectedUser');
        var user = global.login.userId;
        var targetId = resUser.userId;
        Meteor.call('accetpGuardian',user ,targetId ,function(err,res){
          if(err){
            console.log(err);
          }else{
            //님의 가디언이 되었습니다.
            Meteor.call('setLog', '', '', targetId ,user ,  global.pageType.inHeritance, '', 'acceptedGuadian','' );
            //님이 가디언 이 되었습니다.
            Meteor.call('setLog', '', '', user ,targetId ,  global.pageType.inHeritance, '', 'acceptGuadian','' );
            //알림
            var options = {
              userId : user
            };
            Meteor.call('setNoti', targetId, 'GD', '가디언 수락(postId)', 'accept', options);
          }
        });
      }
    },
    function(val){
      if(val){
        //거절
        var resUser = Session.get('inheritance guardian selectedUser');
        var user = global.login.userId;
        var targetId = resUser.userId;
        Meteor.call('refuseGuardian',user, targetId,function(err,res){
          if(err){
            console.log(err);
          }else{
            Meteor.call('setLog', '', '', targetId, user, global.pageType.inHeritance, '', 'refuseGuadian','' );
            var options = {
              userId : user
            };
            //알림
            Meteor.call('setNoti', targetId, 'GD', '가디언 거절(postId)', 'refusal', options);
          }
        });
      }
    }).catch(swal.noop);
  },
  "click i[name='delRefuesData']": function(e, t){
    var self = this;
    global.utilConfirm('정말 삭제 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('deleteRefuseData',global.login.userId, self.userId);
      }
    }).catch(swal.noop);
  },
  "click a[name='cancelRefuse']": function(e, t){
    var self = this;
    global.utilConfirm('거절을 취소 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('cancelRefuseData',global.login.userId, self.userId);
      }
    }).catch(swal.noop);
  },
  "mouseenter div[name='thembMain']": function(e, t){
    $(e.currentTarget).find('.thumb-over').addClass('on');
  },
  "mouseleave div[name='thembMain']": function(e, t){
    $(e.currentTarget).find('.thumb-over').removeClass('on');
  },
  "click i[name='removeMyGuardian']": function(e, t){
    var user = this.userId;
    global.utilConfirm('해당 나의 가디언을 삭제 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('removeMyGuardian',global.login.userId,user,function(err,res){
          if(err){
            console.log(err);
          }else{
            Meteor.call('setLog', '', '', global.login.userId ,user ,  global.pageType.inHeritance, '', 'delGuardian','' );
          }
        });
      }
    }).catch(swal.noop);
  },
  "click i[name='removeIGuardian']": function(e, t){
    var user = this.userId;
    global.utilConfirm('해당 내가 가디언을 삭제 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('removeIGuardian',global.login.userId,user,function(err,res){
          if(err){
            console.log(err);
          }else{
            Meteor.call('setLog', '', '', global.login.userId ,user ,  global.pageType.inHeritance, '', 'delGuardian','' );
          }
        });
      }
    }).catch(swal.noop);
  },
  "click a[name='noticObituary']": function(e, t){
    var modalobj = {};
    modalobj.template = 'inheritanceNoticeObituaryPopup';
    modalobj.size = 'imsr-pop modal-md inheritance';
    modalobj.fade = false;      modalobj.backdrop = 'static';
    modalobj.data = {
      name : this.name,
      userId : this.userId
    };
    global.utilModalOpen(e, modalobj);
  },
  "click a[name='cancelObituary']" : function(e, t){
    var self = this;
    global.utilConfirm('부고알림을 취소 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('setRemoveObituaryData',global.login.userId, self.userId);
      }
    }).catch(swal.noop);
    $(e.currentTarget).find('.thumb-over').removeClass('on');
  },
  //내용 접기 /펼치기
  "click [name=requesReadytSlideToggle],[name=refuseRequestSlideToggle]": function(e, t){
    e.preventDefault();

    var slideTarget;
    switch(e.currentTarget.name){
      case 'requesReadytSlideToggle':
        slideTarget = $('.inh-assets-table.requestReady');
        break;
      case 'refuseRequestSlideToggle':
        slideTarget = $('.inh-assets-table.refuseRequest');
        break;
    }

    slideTarget.slideToggle( "fast", function() {
      e.stopPropagation();
      if(slideTarget.hasClass("on")){
        slideTarget.removeClass("on");
        $(e.currentTarget).find('i').removeClass('ion-chevron-up');
        $(e.currentTarget).find('i').addClass('ion-chevron-down');
      }else{
        slideTarget.addClass("on");
        $(e.currentTarget).find('i').removeClass('ion-chevron-down');
        $(e.currentTarget).find('i').addClass('ion-chevron-up');
      }
    });
  }
});


Template.myGuardians.onRendered(function(){
  // // 스크롤 페이징 구현
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template.imGuardians.onRendered(function(){
  // // 스크롤 페이징 구현
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

//리스트 컨텐츠 생성
function buildUserList(users,resUsers){
  var searchOption = ['profile.nickName','profile.name','profile.mobile','profile.email','username'];
  var getUserList = global.utilGetUsersInfo(users,searchOption).map(function(item){
    var returnObj = {};
    returnObj.userId = item.username;
    returnObj.name = item.profile.name;
    returnObj.nickName = item.profile.nickName;
    returnObj.mobile = item.profile.mobile;
    returnObj.email = item.profile.email;
    returnObj.isPassAway = item.profile.isPassAway;
    for(var i in resUsers){
      if(resUsers[i].userId === returnObj.userId){
        returnObj.regDate = resUsers[i].regDate;
        returnObj.dieDate = resUsers[i].dieDate;
      }
    }
    return returnObj;
  });
  return getUserList;
}

//가디언 정보
Template.registerHelper('hpGetGuardianList', function(accUsers, type){
  var userIds = [];
  accTypeUser = _.where(accUsers,{type:type});
  for(var i in accTypeUser){
    userIds.push(accTypeUser[i].userId);
  }

  var searchOption = ['profile.nickName','profile.name','profile.mobile','profile.email','username'];

  var getUserList = ReactiveMethod.call('getUserInfo', userIds, searchOption);

  if(getUserList){
    getUserList  = getUserList.map(function(item){ //global.utilGetUsersInfo(userIds,searchOption).map(function(item){
      var returnObj = {};
      returnObj.userId = item.username;
      returnObj.name = item.profile.name;
      returnObj.nickName = item.profile.nickName;
      returnObj.mobile = item.profile.mobile;
      returnObj.email = item.profile.email;
      returnObj.isPassAway = item.profile.isPassAway;
      returnObj.profileImg = item.profile.profileImg ? item.profile.profileImg : global.profileDefaultImg;
      for(var i in accTypeUser){
        if(accTypeUser[i].userId === returnObj.userId){
          returnObj.regDate = accTypeUser[i].regDate;
          returnObj.dieDate = accTypeUser[i].dieDate;
        }
      }
      return returnObj;
    });
  }
  return getUserList;
  // return buildUserList(userIds,accTypeUser);
});
//요청대상 정보
Template.registerHelper('hpGetRequestList', function(resUsers){
  var userIds = [];
  for(var i in resUsers){
    userIds.push(resUsers[i].userId);
  }

  var searchOption = ['profile.nickName','profile.name','profile.mobile','profile.email','username'];

  var getUserList = ReactiveMethod.call('getUserInfo', userIds, searchOption);
  if(getUserList){
    getUserList = getUserList.map(function(item){
      var returnObj = {};
      returnObj.userId = item.username;
      returnObj.name = item.profile.name;
      returnObj.nickName = item.profile.nickName;
      returnObj.mobile = item.profile.mobile;
      returnObj.email = item.profile.email;
      returnObj.isPassAway = item.profile.isPassAway;
      returnObj.profileImg = item.profile.profileImg ? item.profile.profileImg : global.profileDefaultImg;
      for(var i in resUsers){
        if(resUsers[i].userId === returnObj.userId){
          returnObj.regDate = resUsers[i].regDate;
          returnObj.dieDate = resUsers[i].dieDate;
        }
      }
      return returnObj;
    });
  }
  return getUserList;

  // return buildUserList(userIds,resUsers);
});

Template.registerHelper('hpGetLength', function(list , type){
  var resultArr = [];
  for(var i in list){
    if(list[i].type === type){
      resultArr.push(list[i]);
    }
  }
  return resultArr.length;
});

Template.registerHelper('hpLeangthZero', function(leangth){
  if(leangth === 0){
    return false;
  }else{
    return true;
  }
});

Template[templateName].onDestroyed(function(){
  Session.set('inheritance guardian selectedUser', null);
});
