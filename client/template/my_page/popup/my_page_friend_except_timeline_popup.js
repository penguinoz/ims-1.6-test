import {global} from '/imports/global/global_things.js';

// 마이페이지 > 친구관리 > 타임라인 추가/제외 (팝업)
var templateName = 'myPageFriendExceptTimeLinePopup';

Template[templateName].onCreated(function(){
  this.instance = this.data.instance;
  this.collection = new ReactiveVar(this.data.checkList);
});

Template[templateName].events({
  'click [name=save]': function(e, t) {
    e.preventDefault();

    var checked = t.find('input[name="groupRadio"]:checked').value;
    var timelineFlag = true;
    var message = '타임라인이 추가 되었습니다.';
    if (checked === 'remove') {
      timelineFlag = false;
      message = '타임라인이 제외 되었습니다.';
    }

    var dataObj = {
      'profile.friends.accept.$.timeline': timelineFlag
    };

    Meteor.call('userTimelineUpdate', global.login.userId, dataObj, t.collection.get(), function(error, result) {
      if (!error) {
        global.utilAlert(message);
        var today = new Date().format('yyyy-MM-dd');
        // 타임라인을 갱신시킨다.
        Session.set('timelineMain standardDate', today);
        Modal.hide();
        setMyPageFriendCollection(t.instance, 'receive');
      }
    });
  },
  'click [name=cancel]': function(e, t) {
    e.preventDefault();
    Modal.hide();
  }
});

Template[templateName].helpers({
  hpCollection: function() {
    return Template.instance().collection.get();
  }
});