import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';

var templateName = 'timeline';

Template[templateName].onCreated(function(){
  var instance = this;
  this.defaultData = [];
  this.userArray = [];
  this.timeline = new ReactiveVar();
  this.upButton = new ReactiveVar(true);
  this.downButton = new ReactiveVar(true);
  Blaze._allowJavascriptUrls();

  this._id = [];
  this.userId = 'opistla';
  this.isPageOwner = 'opistla';
  var friends = global.fn_getUserInfo(this.userId);  // 친구
  this.friendsUserId = [];


  if (friends && friends.friends && friends.friends.accept) {
    friends.friends.accept.map(function(item) {
      instance.friendsUserId.push(item.userId);
      instance.userArray.push(item.userId);
    });
  }
  this.userArray.unshift(this.userId);

  this.upSkip = -4;
  this.donwSkip = 0;
  this.limit = 4;

  if (Session.get('test_timeline_standardDate') === undefined) {
    Session.set('test_timeline_standardDate', global.utilGetDate().defaultYMD);
  }

  this.autorun(function() {
    var subCalendar = instance.subscribe('time_calendar', instance.userArray, Session.get('test_timeline_standardDate'), instance.limit);
    if (subCalendar.ready()) {
      instance.defaultData = [];
      instance._id = [];
      var timeline = CLT.EnTimeline.find().fetch();

      timeline.map(function(item) {
        instance._id.push(item._id);
      });

      console.log('instance._id', instance._id);

      instance.upSkip = -4;
      instance.donwSkip = 0;
      instance.upButton.set(true);
      instance.downButton.set(true);
      setTimelineData(instance, instance._id);
    }
  });
});

Template[templateName].onRendered(function(){
  Template.fn_listHeightResize('.timeline-filter');
});

Template[templateName].onDestroyed(function(){
  Session.set('test_timeline_standardDate', null);
});

Template[templateName].events({
  "click #up_data": function(e, t){
    e.preventDefault();

    t.upSkip = t.upSkip + 4;
    Meteor.call('timeline_upButton', t._id, t.userArray, Session.get('test_timeline_standardDate'), t.upSkip, t.limit, function(error, result) {
      if (!error) {
        if (result.length === 0) {
          t.upButton.set(false);
        }
        var new_id = result.map(function(item) {
          t._id.push(item._id);
          return item._id;
        });
        setTimelineData(t, new_id);
      }
    });
  },
  "click #down_data": function(e, t){
    e.preventDefault();

    t.donwSkip = t.donwSkip + 4;
    Meteor.call('timeline_downButton', t._id, t.userArray, Session.get('test_timeline_standardDate'), t.donwSkip, t.limit, function(error, result) {
      if (!error) {
        if (result.length === 0) {
          t.downButton.set(false);
        }
        var new_id = result.map(function(item) {
          t._id.push(item._id);
          return item._id;
        });
        setTimelineData(t, new_id);
      }
    });
  },
  'click [name=today]': function(e, t) {
    e.preventDefault();
    Session.set('test_timeline_standardDate', global.utilGetDate().defaultYMD);
    $('.hl-scroll').scrollTop(0);
  }
});

Template[templateName].helpers({
  // 타임라인데이터
  hpTimeline: function() {
    var data = null;
    var result = _.chain(Template.instance().timeline.get()).sortBy('sort').sortBy('sortDate').sortBy('timelineDate').value().reverse();
    data = unionTime(result);
    return data;
  },
  hpUpButton: function() {
    return Template.instance().upButton.get();
  },
  hpDownButton: function() {
    return Template.instance().downButton.get();
  }
});

var setTimelineData = function(instance, _id) {
  Meteor.call('enTimelineGetList', instance.userId, instance.isPageOwner, _id, instance.userArray, instance.userId, Session.get('test_timeline_standardDate'), function(error, result) {
    if (!error) {
      console.log('result', result);
      instance.defaultData = _.union(instance.defaultData, result);
      instance.timeline.set(instance.defaultData);
    }
  });
};

// 타임라인 메인 날짜 중복제거
var unionTime = function(timeline) {
  if (timeline.length !== 0) {
    var tempData = $.extend(true, [{}], timeline);
    var dateArray = [];
    _.each(tempData, function(data) {
      if(_.isUndefined(_.findWhere(dateArray, data.timelineDate ))) {
        dateArray.push(data.timelineDate);
      } else {
        data.timelineDate = '';
      }
    });
    return tempData;
  }
};