import {global} from '/imports/global/global_things.js';

var templateName = 'inheritanceTimeline';

Template[templateName].onCreated(function(){
  Blaze._allowJavascriptUrls();
  var instance = this;
  this.userId = new ReactiveVar();
  this.instPathData = new ReactiveVar();
  this.inheritData = new ReactiveVar();
  this.ownerData = new ReactiveVar();
  this._id = new ReactiveVar(this.data._id);
  this.isNote = new ReactiveVar(this.data.isNote);
  this.filter = new ReactiveVar('all');
  this.topMenu = 'endingNote';
  this.selectedMenu = new ReactiveVar();
  this.limit = 5;
  this.upSkip = 0;
  this.defaultData = [];
  this.today = new Date().format('yyyy-MM-dd');

  if (!global.fn_isExist(Session.get('timelineMain standardDate'))) {
    Session.set('timelineMain standardDate', this.today);
  }

  instance.autorun(function() {
    if (instance.today === Session.get('timelineMain standardDate')) {
      setCollectionData(instance, instance.data, instance.filter.get(), instance.topMenu, instance.today);
    } else {
      instance.today = Session.get('timelineMain standardDate');
      instance.limit = 5;
      instance.upSkip = 0;
      var defaultData = downDay(instance.defaultData, instance.today);
      defaultData = defaultData.slice(0, instance.limit);
      defaultData = unionTime(defaultData);
      instance.inheritData.set(defaultData);
      if(Session.get('timelineMain isDataChanged')){
        Session.set('timelineMain isDataChanged', false);
      } else {
        Session.set('timelineMain isDataChanged', true);
      }
    }
  });
  // setCollectionData(instance, instance.data, 'all', instance.topMenu, Session.get('timelineMain standardDate'));
});

Template[templateName].onRendered(function(){
  targetElementLeft = this.$('.hl-scroll');

  var contentTimeLineHeight = $('#contentTimeLine').height();
  var timeLineCenteredHeight = $('.timeline-centered').height();
  $('.timeline-show-more.top').hide();
  $('.timeline-show-more.bottom').hide();
  // 스크롤 페이징 구현
  var scrollCallbackOptions = {
    onTotalScroll: function() {
      $('.timeline-show-more.bottom').slideDown(100);
    },
    onTotalScrollBack: function() {
      $('.timeline-show-more.top').slideDown(100);
    },
    onInit:function(){
      contentTimeLineHeight = $('#contentTimeLine').height();
      timeLineCenteredHeight = $('.timeline-centered').height();
      return global.fn_setTop(targetElementLeft);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
    whileScrolling: function(){
      var bottomPadding;
      if(this.mcs.top < -1){ //스크롤 상단 벗어났을때 내렸을때
        $('.timeline-show-more.top').slideUp(100);
      }

      if(this.mcs.topPct < 100){ //스크롤 하단 벗어났을때 찍었을떄
        $('.timeline-show-more.bottom').slideUp(100);
      }
    },
    alwaysTriggerOffsets:false
  };
  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});

  global.fn_listHeightResize('.timeline-filter');
  global.fn_listHeightResize('.timeline-date');
  Session.set('endingNoteList templateData', {});
});

Template[templateName].events({
  "click .timeline-label": function(e, t) {
    e.preventDefault();
    var type = this.type;

    var templateData = {};
    var data = {
      parentViewId: 'inheritanceContents'
    };

    //타임아웃을 이용해 선택된 페이지를 띄움
    switch (this.type) {
      // 나
      case 'IM':
        data._id = this.postId;
        global.utilTemplateMove('endingNoteListHeaderIm', 'imDetail', data);
      break;
      // 버킷
      case 'BL': case 'BP': case 'BS':
        if (type === 'BS' || type === 'BP') {
          data._id = e.target.getAttribute('postId');
          if (type === 'BS') {
            data.subId = this.postId; // 스토리 키
          } else {
            data.subId = null;
            data.tab = 'BP';
          }
        } else {
          data._id = this.postId;
        }
        global.utilTemplateMove('endingNoteListHeaderBucketList', 'bucketDetail', data);
      break;

      //타임캡슐
      case 'TC':
        data._id = this.postId;
        global.utilTemplateMove('endingNoteListHeaderTimeCapsule', 'timeCapsuleDetail', data);
      break;

      //보금자리
      case 'LT':
        value = this.title;
        data = {};
        global.utilTemplateMove('endingNoteListHeaderIm', 'imLifeTrace', data);
      break;

      case 'ME':
        data.content.meUserId = global.login.userId;
        global.utilTemplateMove('endingNoteListHeaderIm', 'imMe', data);
      break;

      case 'lastLetter':
        var modalobj = {};
        modalobj.template = 'inheritanceLastLetterPopup';
        modalobj.size = 'imsr-pop modal-md';
        modalobj.fade = false;
        modalobj.backdrop = 'static';
        modalobj.data = {
          _id : this._id
        };
        global.utilModalOpen(e, modalobj);
      break;
    }
  },
  'click .selectFilter': function(e, t) {
    e.preventDefault();

    var target = e.target.getAttribute('value');
    t.filter.set(target);
    setCollectionData(t, this, target, t.topMenu, Session.get('timelineMain standardDate'));
  },
  'click [name=endingNote]': function(e, t) {
    e.preventDefault();
    t.topMenu = 'endingNote';
    setCollectionData(t, this, 'all', t.topMenu, Session.get('timelineMain standardDate'));
  },
  'click [name=lifeView]': function(e, t) {
    e.preventDefault();
    t.topMenu = 'lifeView';
    setCollectionData(t, this, 'all', t.topMenu, Session.get('timelineMain standardDate'));
  },
  'click #im,#bucket,#time': function(e, t) {
    e.preventDefault();

    var templateData = {
      inheritanceKey: t._id.get(),
      pageType: 'inheritance'
    };
    switch(e.currentTarget.id) {
      // 나
      case 'im':
      templateData.headerTmp = 'endingNoteListHeaderIm';
      templateData.contentTmp = 'imContent';
      break;
      // 버킷
      case 'bucket':
      templateData.headerTmp = 'endingNoteListHeaderBucketList';
      templateData.contentTmp = 'bucketContent';
      break;

      //타임캡슐
      case 'time':
      templateData.selectedMenu = 'my';
      templateData.statusMenu = 'unseal';
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleContent';
      break;
    }
    global.login.pageOwner = global.login.userId;
    t.selectedMenu.set(e.currentTarget.id);
    global.utilTemplateMove(templateData.headerTmp, templateData.contentTmp, templateData);
  },
  'click [name=today]': function(e, t) {
    e.preventDefault();
    $('.hl-scroll').mCustomScrollbar('scrollTo',"top");
    Session.set('timelineMain standardDate', global.utilGetDate().defaultYMD);

  },
  "click [name=up_data]": function(e, t){
    e.preventDefault();

    var upData = upDay(t.defaultData, t.today);
    var up = upData.slice(t.upSkip - 5, upData.length);
    var down = downDay(t.defaultData, t.today);
    down = down.slice(0, t.limit);
    var defaultData = _.union(up, down);
    defaultData = unionTime(defaultData);

    if (t.inheritData.get().length !== defaultData.length) {
      t.upSkip -= 5;
      t.inheritData.set(defaultData);
      if(Session.get('timelineMain isDataChanged')){
        Session.set('timelineMain isDataChanged', false);
      } else {
        Session.set('timelineMain isDataChanged', true);
      }
    }

  },
  "click [name=down_data]": function(e, t){
    e.preventDefault();

    var upData = upDay(t.defaultData, t.today);
    if (t.upSkip === 0) {
      upData.length = 0;
    }
    var up = upData.slice(t.upSkip, upData.length);
    var down = downDay(t.defaultData, t.today);
    down = down.slice(0, t.limit + 5);
    var defaultData = _.union(up, down);
    defaultData = unionTime(defaultData);

    if (t.inheritData.get().length !== defaultData.length) {
      t.limit += 5;
      t.inheritData.set(defaultData);
      if(Session.get('timelineMain isDataChanged')){
        Session.set('timelineMain isDataChanged', false);
      } else {
        Session.set('timelineMain isDataChanged', true);
      }
    }
  },
});

Template[templateName].helpers({
  // 상속받은내역의 데이터
  hpInstPathCollection: function() {
    return Template.instance().instPathData.get();
  },
  // 컨텐츠데이터
  hpCollection: function(){
    return Template.instance().inheritData.get();
  },
  hpSelectedFilter: function(filter) {
    return Template.instance().filter.get() === filter;
  },
  hpTimelineLeftType: function(data) {
    var template = null;

    if (data.userId !== Template.instance().userId.get()) {
      template = 'instTimelineMainType1'; //기본(제목, 내용)

      content = global.utilTagRemove(data.content); // 태그를 제거한다
      if (global.fn_isExist(content)) {
        // content가 있을떄
        if (global.fn_isExist(data.images)) {
          // 이미지가 있을시
          template = 'instTimelineMainType5'; // 제목, 내용, 이미지
        }
      } else {
        // content가 없을때
        template = 'instTimelineMainType4'; // 제목, 이미지만
      }
    }
    return template;
  },
  hpTimelineRightType: function(data) {
    var template = null;

    if (data.userId === Template.instance().userId.get()) {
      if (_.isEqual(data.type, 'ME') || _.isEqual(data.type, 'lastLetter') || _.isEqual(data.type, 'asset')) {
        template = 'instTimelineMainType3';
      } else {
        template = 'instTimelineMainType1'; //기본(제목, 내용)

        content = global.utilTagRemove(data.content); // 태그를 제거한다
        if (global.fn_isExist(content)) {
          // content가 있을떄
          if (global.fn_isExist(data.images)) {
            // 이미지가 있을시
            template = 'instTimelineMainType5'; // 제목, 내용, 이미지
          }
        } else {
          // content가 없을때
          template = 'instTimelineMainType4'; // 제목, 이미지만
        }
      }
    }
    return template;
  },
  hpSelectedMenu: function(menu) {
    return Template.instance().selectedMenu.get() === menu ? true : false;
  },
  hpOwnerData: function() {
    return Template.instance().ownerData.get();
  },
  hpIsNote: function() {
    var result = '상속받은 내역';
    if (Template.instance().isNote.get() === 'card') {
      result = '상속한 내역';
    }
    return result;
  },
  hpDataChanged: function() {
    return Session.get('timelineMain isDataChanged');
  },
});

var setCollectionData = function(instance, data, type, topMenu, standardDate) {
  Meteor.call('getInheritanceTimeline', data._id, data.isNote, type, topMenu, standardDate, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      console.log('result', result);
      instance.userId.set(result.userId);
      global.login.userId = result.userId;

      var inheritData = null;
      inheritData = _.chain(result.timeline).sortBy('sort').sortBy('sortDate').sortBy('timelineDate').value().reverse();

      instance.instPathData.set(result.instPathData);
      instance.defaultData = inheritData;
      var defaultData = downDay(instance.defaultData, instance.today);
      defaultData = defaultData.slice(0, instance.limit);
      defaultData = unionTime(defaultData);
      instance.inheritData.set(defaultData);
      var fields = ['username','profile.profileImg','profile.isPassAway'];

      Meteor.call('getUserInfo', result.userId, fields, function(error, result){
        if(error){
          return console.log(error);
        } else {
          instance.ownerData.set(result[0]);
        }
      });

      if(Session.get('timelineMain isDataChanged')){
        Session.set('timelineMain isDataChanged', false);
      } else {
        Session.set('timelineMain isDataChanged', true);
      }
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

// 지정된 날짜에 맞춰 데이터 자르기
var upDay = function(data, day) {
  var result = [];
  data.map(function(item) {
    if (new Date(item.timelineDate).getTime() > new Date(day).getTime()) {
      result.push(item);
    }
  });
  return result;
};
var downDay = function(data, day) {
  var result = [];
  data.map(function(item) {
    if (new Date(item.timelineDate).getTime() <= new Date(day).getTime()) {
      result.push(item);
    }
  });
  return result;
};