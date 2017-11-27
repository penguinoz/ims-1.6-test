import {global} from '/imports/global/global_things.js';

// 마이페이지 > 친구관리 > 친구추가(팝업)
var templateName = 'myPageFriendAddPopup';

Template[templateName].onCreated(function(){
  // this.friends = this.data.friends; // 이미 등록된 친구들
  this.collection = new ReactiveVar();
});

Template[templateName].onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  "click [name=search], keypress [name=keywordText]": function(e, t){
    // e.preventDefault();
    if (e.type === 'click' || e.keyCode === 13) {
      var condition = t.find('#keywordCondition').value;
      var text = t.find('#keywordText').value;

      if (text !== '') {
        var unUserId = [];
        // var accept = t.data.friends.profile.friends.accept;
        // var request = t.data.friends.profile.friends.request;
        // var receive = t.data.friends.profile.friends.receive;
        // accept = accept.map(function(item) {
        //   return item.userId;
        // });
        // request = request.map(function(item) {
        //   return item.userId;
        // });
        // receive = receive.map(function(item) {
        //   return item.userId;
        // });

        // friends = _.union(accept, request, receive);
        unUserId.push(global.login.userId);

        Meteor.call('getUsersInfoInAddFriends', unUserId, text, condition, function(error, result){
          if(error){
            return console.log(error);
          } else {
            // var list = Meteor.users.find(findObj).fetch();
            t.collection.set(result);
          }
        });
      } else {
        global.utilAlert('검색할 친구를 입력하세요.');
      }
    }
  },
  // 저장
  'click [name=save]': function(e, t) {
    e.preventDefault();

    var userList = t.findAll('input[name="friendAdd"]:checked');
    var introduction = t.find('textarea[name="introduction"]').value;
    userList = userList.map(function(item) {
      return item.value;
    });

    Meteor.call('setFriendRequest', global.login.userId, userList, introduction, function(error, result) {
      if (result) {
        var options = {
          userId : global.login.userId
        };
        _.each(userList, function(userInfo){
          Meteor.call('setNoti', userInfo, 'FR', '친구요청(Id)', 'receive', options);
        });
        global.utilAlert('선택된사람들에게 친구추가 요청을 보냈습니다.');
        Modal.hide();
      }
    });
  },
  // 취소
  'click [name=cancel]': function(e, t) {
    e.preventDefault();
    Modal.hide();
  },
  // 체크
  'change #friendAllCheck': function(e, t) {
    e.preventDefault();
    var _checked = e.target.checked;
    $('input:checkbox[name="friendAdd"]').prop('checked', _checked);
  }
});

Template[templateName].helpers({
  hpCollection: function(){
    return Template.instance().collection.get();
  },
  // 친구 체크
  hpFriendCheck: function(friendId) {
    var friends = ReactiveMethod.call('getUserInfo', global.login.userId, ['profile.friends']);
    var message = null;
    if (friends) {
      var data = friends[0];
      for (var i = 0; i < data.profile.friends.accept.length; i++) {
        if (data.profile.friends.accept[i].userId === friendId) {
          message = '친구';
          break;
        }
      }
      if (message == null) {
        for (var i = 0; i < data.profile.friends.request.length; i++) {
          if (data.profile.friends.request[i].userId === friendId) {
            message = '보낸요청';
            break;
          }
        }
      }
      if (message == null) {
        for (var i = 0; i < data.profile.friends.receive.length; i++) {
          if (data.profile.friends.receive[i].userId === friendId) {
            message = '받은요청';
            break;
          }
        }
      }
    }
    return message;
  }
});
