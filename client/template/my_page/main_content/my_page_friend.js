import {global} from '/imports/global/global_things.js';

// 마이페이지 > 친구관리
var templateName = 'myPageFriend';
var instance = null;
var defaultData = null;

Template[templateName].onCreated(function(){
  instance = this;
  this.friendData = new ReactiveVar();
  this.seletedTab = new ReactiveVar();
  this.requestType = true; // 친구요청내역(받은요청, 보낸요청)
  defaultData = Meteor.users.find({_id: Meteor.userId()}).fetch()[0];

  var selectedMenuType = 'receive';
  var selectedTab = 'myPageFriendList';

  if(this.data){
    selectedMenuType = this.data.menuType;
    selectedTab = this.data.tabName;
  }
  this.seletedTab.set(selectedTab);
  setMyPageFriendCollection(this, selectedMenuType);
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].onDestroyed(function(){
  Session.set('friendGroup groupList', null);
  Session.set('myPageFriendRequest collection', null);
});

Template[templateName].events({
  // tab 클릭시 재 조회
  'click [name=myPageFriendTab]': function(e, t) {
    e.preventDefault();

    var target = e.target.getAttribute('href');
    switch(target) {
      case '#myPageFriendRequest':
        setMyPageFriendCollection(t, 'receive');
      break;
      case '#friendGroup':
        Session.set('friendGroup groupList', null);
        setMyPageFriendCollection(t, 'group');
      break;
      default: setMyPageFriendCollection(t);
    }
  },
  // [친구목록]타임라인추가/제외, 친추추가 팝업
  "click .modal-link": function(e, t){
    e.preventDefault();

    var checkList = t.findAll('input[name="friendList"]:checked');
    checkList = checkList.map(function(item) {
      return item.value;
    });
    var modalSize = 'modal-lg';
    var templateName = t.$(e.currentTarget).data('modal-template');

    if (templateName === 'myPageFriendExceptTimeLinePopup') {
      modalSize = 'modal-md';
      if (checkList.length === 0) {
        return global.utilAlert('대상을 선택해주세요.');
      }
    }

    var modalobj = {};
    modalobj.template = templateName;
    modalobj.size = 'imsr-pop ' + modalSize;
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      instance: t,
      friends: t.friendData.get(),
      checkList: checkList,
      parentViewId: 'friendGroup'
    };
    global.utilModalOpen(e, modalobj);
  },
  // [친구목록]친구삭제
  'click [name=friendDelete]': function(e ,t) {
    e.preventDefault();

    var checkList = t.findAll('input[name="friendList"]:checked');
    checkList = checkList.map(function(item) {
      return item.value;
    });
    if (checkList.length === 0) {
      return global.utilAlert('대상을 선택해주세요.');
    } else {
      global.utilConfirm('친구를 삭제하시겠습니까?').then(function(val) {
        if (val) {
          Meteor.call('setDeleteFriend', global.login.userId, checkList, function(error, result) {
            if (result) {
              setMyPageFriendCollection(t, 'receive');
            }
          });
        }
      }).catch(swal.noop);
    }
  },
  // [친구요청내역] 받은요청, 보낸요청 tab
  'click [name=myPageFriendRequestList]': function(e, t) {
    e.preventDefault();

    var target = e.target.getAttribute('value');
    var data = {};
    if (target === 'receive') {
      data.collection = t.friendData.get().profile.friends.receive;
      data.type = true;
      t.requestType = true;
    } else if(target === 'request') {
      data.collection = t.friendData.get().profile.friends.request;
      data.type = false;
      t.requestType = false;
    }
    Session.set('myPageFriendRequest collection', data);
  },
  // [친구요청내역] 수락,거절,취소
  'click [name=friendRequestButton]': function(e, t) {
    e.preventDefault();

    var target = e.target.getAttribute('value');
    var index = e.target.getAttribute('index');
    var userId = global.login.userId;

    var confirmMessage = '';
    var callMethod = '';
    var targetUserId = null;
    var notiType = ''; //알림
    var checkMethod = '';
    var checkErrorMessage = '';
    var type = '';
    var notiTitle = '';
    switch (target) {
      case 'acceptance':
        confirmMessage = '수락 하시겠습니까?';
        callMethod = 'setAcceptFriendRequest';
        checkMethod = 'requestCheck';
        checkErrorMessage = '상대방이 이미 요청취소를 하였습니다.';
        type = 'receive';
        notiType = 'accept';
        notiTitle = '친구수락';
        targetUserId = t.friendData.get().profile.friends.receive[index].userId;
      break;
      case 'refusal':
        confirmMessage = '거절 하시겠습니까?';
        callMethod = 'setDenyFriendRequest';
        checkMethod = 'requestCheck';
        checkErrorMessage = '상대방이 이미 요청취소를 하였습니다.';
        type = 'receive';
        notiType = 'refusal';
        notiTitle = '친구거절';
        targetUserId = t.friendData.get().profile.friends.receive[index].userId;
      break;
      case 'cancel':
        confirmMessage = '요청취소 하시겠습니까?';
        callMethod = 'setDenyFriendRequest';
        checkMethod = 'receiveCheck';
        checkErrorMessage = '상대방이 이미 수락&거절을 하였습니다.';
        type = 'request';
        userId = t.friendData.get().profile.friends.request[index].userId;
        targetUserId = global.login.userId;
      break;
    }
    global.utilConfirm(confirmMessage).then(function(val) {
      if (val) {
        Meteor.call(checkMethod, userId, targetUserId, function(error, result) {
          if (!error) {
            if (result === 0) {
              global.utilAlert(checkErrorMessage);
              setMyPageFriendCollection(t, type);
            } else {
              Meteor.call(callMethod, userId, targetUserId, function(error) {
                if (error) {
                  return console.log(error);
                } else {
                  setMyPageFriendCollection(t, type);
                   //친구 수락/거절 알림
                  if(_.isEqual(notiType, 'accept') || _.isEqual(notiType, 'refusal')){ //취소인경우는 알림없음
                    var options = {
                      userId : global.login.userId
                    };
                    Meteor.call('setNoti', targetUserId, 'FR', notiTitle, notiType, options);
                  }
                }
              });
            }
          }
        });
      }
    }).catch(swal.noop);
  },
  // [그룹관리] 추가
  'click [name=groupAdd]': function(e, t) {
    e.preventDefault();

    var friendsUserId = [];
    defaultData.profile.friends.accept.map(function(item) {
      friendsUserId.push(item.userId);
    });
    searchGroupFriends(t, friendsUserId, '');
  },
  // [그룹관리] 그룹상세보기
  'click [name=friendGroupName]': function(e, t) {
    e.preventDefault();

    var groupName = e.target.getAttribute('value');
    var groupData = null;
    t.friendData.get().profile.friends.groups.map(function(item) {
      if (item.groupName === groupName) {
        groupData = item;
      }
    });
    var data = {
      template: 'friendGroupDetail',
      data: groupData
    };
    Session.set('friendGroup groupList', data);
  },
  // [그룹관리] 그룹추가저장
  'click [name=groupAddSave]': function(e, t) {
    e.preventDefault();

    var title = t.find('input[name=groupName]').value;
    var users = t.findAll('input[name=groupUserCheck]:checked');

    var groupData = t.friendData.get().profile.friends.groups;
    groupData = groupData.map(function(item) {
      return item.groupName;
    });

    if (title === '') {
      return global.utilAlert('그룹명을 입력해주세요.');
    }
    if (users.length === 0) {
      return global.utilAlert('구성원을 1명이상 선택해주세요.');
    }
    if (_.indexOf(groupData, title) !== -1) {
      return global.utilAlert('동일한 그룹명이 존재합니다.');
    }

    users = users.map(function(item) {
      return {
        userId: item.value,
        regDate: global.utilGetDate().default
      };
    });

    var dataObj = {
      groupName: title,
      groupMember: users
    };
    Meteor.users.update(
      Meteor.userId(),
      {$push: {'profile.friends.groups' : dataObj} }, function(error) {
      if (!error) {
        global.utilAlert('그룹이 추가 되었습니다.');
        setMyPageFriendCollection(t, 'receive');
        Session.set('friendGroup groupList', null); // 그룹추가화면 초기화
      }
    });
  },
  // [그룹관리] 취소
  'click [name=groupAddCancel]': function(e, t) {
    e.preventDefault();
    Session.set('friendGroup groupList', null);
  },
  // [그룹관리] 그룹삭제
  'click [name=groupDelete]': function(e, t) {
    e.preventDefault();

    var checkList = t.findAll('input[name="friendGroupListCheck"]:checked');
    var groupName = checkList.map(function(item) {
      return item.value;
    });

    if (groupName.length === 0) {
      return global.utilAlert('삭제할 그룹을 선택해주세요.');
    } else {
      global.utilConfirm('그룹을 삭제하시겠습니까?').then(function(val) {
        if (val) {
          Meteor.call('userGroupRemove', global.login.userId, groupName, function(error) {
            if (!error) {
              setMyPageFriendCollection(t, 'receive');
            }
          });
        }
      }).catch(swal.noop);
    }
  },
  // [그룹관리] 그룹원 삭제
  'click [name=friendGroupDetailDelete]': function(e, t) {
    e.preventDefault();

    var title = t.find('input[name=friendGroupDetailTitle]').value;
    var checkList = t.findAll('input[name="friendGroupDetailCheck"]:checked');
    var groupMember = checkList.map(function(item) {
      return item.value;
    });

    if (groupMember.length === 0) {
      return global.utilAlert('삭제할 멤버를 선택해주세요.');
    } else {
      global.utilConfirm('선택한 멤버를 삭제하시겠습니까?').then(function(val) {
        if (val) {
          Meteor.call('userGroupMemberRemove', global.login.userId, title, groupMember, function(error) {
            if (!error) {
              setMyPageFriendCollection(t);
              setGroupDetaiCollection(title);
            }
          });
        }
      }).catch(swal.noop);
    }
  },
  // [그룹관리] 그룹명 수정
  'click [name=groupNameSave]': function(e, t) {
    e.preventDefault();

    var titleDefault = t.find('input[name=friendGroupDetailTitleDefault]').value;
    var title = t.find('input[name=friendGroupDetailTitle]').value;

    if (!global.fn_isExist(title)) {
      return global.utilAlert('그룹명을 입력해주세요.');
    } else {
      Meteor.call('userGroupTitleUpdate', global.login.userId, title, titleDefault, function(error) {
        if (!error) {
          setMyPageFriendCollection(t);
          setGroupDetaiCollection(title);
        }
      });
    }
  },
  // 체크박스 all
  'change .checkAll': function(e, t) {
    e.preventDefault();

    var id = e.target.getAttribute('id');
    var _checked = e.target.checked;
    switch(id) {
      case 'myPageFriendListAll': $('input:checkbox[name=friendList]').prop('checked', _checked); break;
      case 'friendGroupListAll': $('input:checkbox[name=friendGroupListCheck]').prop('checked', _checked); break;
      case 'friendGroupDetailAll': $('input:checkbox[name=friendGroupDetailCheck]').prop('checked', _checked); break;
      case 'friendGroupAddAll': $('input:checkbox[name=groupUserCheck]').prop('checked', _checked); break;
    }
  },
  // 검색기능
  'click .search': function(e, t) {
    e.preventDefault();

    var target = e.target.getAttribute('name');
    var condition = 'all';
    if (target !== 'friendGroupAddSearch') {
      condition = t.find('select[name=' + target + ']').value;
    }
    var text = t.find('input[name=' + target + ']').value;
    // console.log('search', target, condition, text);
    var data = t.friendData.get();

    switch(target) {
      // 친구목록
      case 'fiendListSearch':
        var accept = searchFriend(defaultData, text, condition);
        data.profile.friends.accept = _.uniq(accept);
        t.friendData.set(data);
      break;
      // 친구요청내역
      case 'friendRequestSearch':
        var request = searchFriendRequest(defaultData, text, t.requestType);
        Session.set('myPageFriendRequest collection', request);
      break;
      // 그룹관리
      case 'friendGroupAddSearch':
        var friendsUserId = [];
        defaultData.profile.friends.accept.map(function(item) {
          friendsUserId.push(item.userId);
        });
        searchGroupFriends(t, friendsUserId, text);

      break;
    }

  }
});

Template[templateName].helpers({
  hpFriendData: function() {
    return Template.instance().friendData.get();
  },
  hpActive: function(tabName) {
    if(_.isEqual(Template.instance().seletedTab.get(), tabName)){
      return 'active';
    } else {
      return '';
    }
  },
  hpTabName: function(){
    return Template.instance().seletedTab.get();
  }
});

Template.myPageFriendList.helpers({
  hpGetGroupName: function(friend, groupMember){
    return friend === groupMember;
  },
  hpActive: function(name){
    if(_.isEqual(Template.instance().seletedTab.get(), tabName)){
      return 'active';
    } else {
      return '';
    }
  }

});

Template.myPageFriendRequest.helpers({
  hpFriendData: function(){
    return Session.get('myPageFriendRequest collection');
  }
});

Template.friendGroup.helpers({
  hpGroupDetail: function() {
    return Session.get('friendGroup groupList');
  },
  hpAddUsersCallBack: function(data) {
    var groupName = Session.get('friendGroup groupList').data.groupName;
    var users = null;
    var addUsers = data.map(function(item) {
      return item.userId;
    });
    var defaultUsers = [];
    if (Session.get('friendGroup groupList').data.groupMember) {
      defaultUsers = Session.get('friendGroup groupList').data.groupMember.map(function(item) {
        return item.userId;
      });
    }
    users = _.difference(addUsers, defaultUsers);
    Meteor.call('userGroupMemberAdd', global.login.userId, groupName, users, function(error) {
      if (!error) {
        setMyPageFriendCollection(instance);
        setGroupDetaiCollection(groupName);
      }
    });
  }
});

setMyPageFriendCollection = function(instance, type) {
  instance.friendData.set(Meteor.users.find({_id: Meteor.userId()}).fetch()[0]);
  if (instance.friendData.get()) {
    var collection = {};
    if (type === 'receive') {
      collection.collection = instance.friendData.get().profile.friends.receive;
      collection.type = true;
    } else if(type === 'respons') {
      collection.collection = instance.friendData.get().profile.friends.request;
      collection.type = false;
    }
    Session.set('myPageFriendRequest collection', collection);
  }
};

setGroupDetaiCollection = function(groupName) {
  var userInfo = Meteor.users.find({_id: Meteor.userId()}).fetch()[0];
  var groupData = null;
  userInfo.profile.friends.groups.map(function(item) {
    if (item.groupName === groupName) {
      groupData = item;
    }
  });
  var data = {
    template: 'friendGroupDetail',
    data: groupData
  };
  Session.set('friendGroup groupList', data);
};

var searchFriend = function(data, text, type) {
  var accept = [];
  data.profile.friends.accept.map(function(item) {
    if (type === 'nickName' || type === 'all') {
      if (global.fn_getNickName(item.userId).match(text) !== null) {
        accept.push(item);
      }
    }
    if (type === 'email' || type === 'all') {
      if (global.fn_getEmail(item.userId).match(text) !== null) {
        accept.push(item);
      }
    }
  });

  return accept;
};

var searchFriendRequest = function(data, text, type) {
  var collection = {};
  var request = [];
  if (type) {
    // collection.collection = data.profile.friends.receive;
    collection.type = true;
    data.profile.friends.receive.map(function(item) {
      if (global.fn_getNickName(item.userId).match(text) !== null) {
        request.push(item);
      }
    });
  } else {
    // collection.collection = data.profile.friends.request;
    collection.type = false;
    data.profile.friends.request.map(function(item) {
      if (global.fn_getNickName(item.userId).match(text) !== null) {
        request.push(item);
      }
    });
  }
  collection.collection = request;
  return collection;
};

// 그룹 친구 검색
var searchGroupFriends = function(instance, friendsUserId, text) {
  Meteor.call('getUserInfo', friendsUserId, ['username','profile.nickName', 'profile.name'], function(error, result) {
    if (!error) {
      var data = instance.friendData.get();
      var tempArr = [];
      var strName = null;
      var strNick = null;
      var _searchText = new RegExp(["^.*", text, ".*"].join(""), "gi");
      result.map(function(item) {
        strName = item.profile.name;
        strNick = item.profile.nickName;
        if (strName.match(_searchText) !== null || strNick.match(_searchText) !== null) {
          tempArr.push({userId: item.username});
        }
      });
      data.profile.friends.accept = _.uniq(tempArr);
      var groupSearch = {
        template: 'friendGroupAdd',
        data: data
      };
      Session.set('friendGroup groupList', groupSearch);
    }
  });
};
