import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

var templateName = 'timelineMain';

var instance;
var userId = '';
Template[templateName].onCreated(function(){
  Blaze._allowJavascriptUrls();
  instance = this;
  this.defaultData = [];
  this.userArray = [];
  this.timeline = new ReactiveVar();
  this.upButton = new ReactiveVar(true);
  this.downButton = new ReactiveVar(true);
  this._id = [];
  this.userId = '';
  this.isPageOwner = '';
  var friends;
  // this.type = new ReactiveVar('ALL'); // 타임라인의 모든타입검색
  this.limit = 5;
  this.upSkip = 0;
  this.downSkip = this.limit;

  instance.isFuture = new ReactiveVar(false);
  instance.futureLimit = new ReactiveVar(5);
  Session.set('timelineMain topLimit', 0);
  instance.bottomLimit = new ReactiveVar(5);
  instance.futureDataCount = 0;
  instance.topDataCount = 0;
  instance.bottomDataCount = 0;
  instance.type = new ReactiveVar('ALL');

  var today = new Date().format('yyyy-MM-dd');
  if (!global.fn_isExist(Session.get('timelineMain standardDate'))) {
    Session.set('timelineMain standardDate', today);
  }
  this.isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (this.isPageOwner) {
    userId = global.login.userId;
    instance.userId = global.login.userId;
  } else {
    userId = global.login.pageOwner;
    instance.userId = global.login.pageOwner;
  }


  var changeParametar = true;
  instance.autorun(function() {

    //친구정보 가져오기
    instance.userArray = [];
    friends = global.fn_getUserInfo(instance.userId);
    if (friends && friends.friends && friends.friends.accept) {
      friends.friends.accept.map(function(item) {
        if (item.timeline) {
          instance.userArray.push(item.userId);
        }
      });
    }
    instance.userArray.unshift(instance.userId);

    var subscribeTop = instance.subscribe('enTimelineTop', userId,  instance.userArray, Session.get('timelineMain standardDate'), Session.get('timelineMain topLimit'), instance.type.get(), changeParametar);
    var subscribeBottom = instance.subscribe('enTimelineBottom', userId,  instance.userArray, Session.get('timelineMain standardDate'), instance.bottomLimit.get(), instance.type.get(), changeParametar);

    //데이터 설정
    if (subscribeTop.ready() && subscribeBottom.ready()) {
      if(changeParametar){
        changeParametar = false;
      } else {
        changeParametar = true;
      }

      // 미래 유무 체크
      Meteor.call('timeline_main_future', userId, instance.userArray, today, 'ALL', function(error, result){
        if(!error && result !== 0) {
          instance.isFuture.set(true);
        }
      });


      var timelineTop = CLT.EnTimeline.find({timelineDate : { $gt: Session.get('timelineMain standardDate')}}).fetch();
      var timelineBottom = CLT.EnTimeline.find({timelineDate : {$lte: Session.get('timelineMain standardDate') }}).fetch();

      //기준일 아래 데이터 없으면 가장 가까운 날짜데이터 가져오기
      if(timelineBottom.length === 0){
        timelineBottom  = CLT.EnTimeline.find({},{sort:{timelineDate:1}, limit:1}).fetch();
      }

      instance.topDataCount = timelineTop.length; //미래 데이터
      instance.bottomDataCount = timelineBottom.length; //오늘이후 데이터

      var timeline = _.union(timelineTop, timelineBottom);

      console.log('timeline', timeline);
      setTimelineData(instance, timeline);
    }
  });
});

Template[templateName].onRendered(function(){
  //timeline 리스트 height리사이징을 위한 function
  global.fn_listHeightResize('.timeline-qna');
  global.fn_listHeightResize('.timeline-filter');
  global.fn_listHeightResize('.timeline-date');

  //툴팁 위치 지정
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'top'});
  // 필터
  Session.set('timelineMain selectedFilter', 'ALL');
});

Template[templateName].onDestroyed(function(){
  Session.set('timelineMain isFutureSelected', false);
  Session.set('timelineMain standardDate', null);
});

Template[templateName].events({
  "click [name=timeline-label]": function(e, t) {
    e.preventDefault();

    var templateData = {};
    var data = {};
    var type = this.type;

    //타임아웃을 이용해 선택된 페이지를 띄움
    switch (type) {
      // 나
      case 'IM':
        data._id = this.postId ? this.postId : this._id;
        Session.set('endingNoteListHeaderIm selectedMenu', null);
        global.utilTemplateMove('endingNoteListHeaderIm', 'imDetail', data);
      break;
      // 버킷
      case 'BL': case 'BP': case 'BS':
        if (type === 'BS' || type === 'BP') {
          data._id = this.subPostId;  // 버킷리스트 키
          if (type === 'BS') {
            data.subId = this.postId; // 스토리 키
          } else {
            data.subId = null;
            data.tab = 'BP';
          }
        } else {
          // console.log('this', this);
          data._id = this.postId ? this.postId : this._id; // 버킷리스트 키
          data.subId = null;
          // console.log('data', data._id);
        }
        global.utilTemplateMove('endingNoteListHeaderBucketList', 'bucketDetail', data);
      break;

      //타임캡슐
      case 'TC':
      var diffResult = global.fn_diffDate(this.unsealDate);

      var openedFlag = false;
      this.groupMember.map(function(item) {
        if (item.userId === global.login.userId) {
          if (item.openedDate) {
            openedFlag = true;
          }
        }
      });

      if(this.status === 'PR' || diffResult.flag === '-' && diffResult.diffDay !== 'day' || openedFlag){ //개봉일 지나지 않음 || 이미 개봉됨
        data._id = this.postId; // 타임캡슐 키
        data.serchOption = {};
        global.utilTemplateMove('endingNoteListHeaderTimeCapsule', 'timeCapsuleDetail', data);
      } else {
        data._id = this.postId;
        data.serchOption = {};
        data.innerData = this;
        global.utilTemplateMove('endingNoteListHeaderTimeCapsule', 'timeCapsuleOpenEffect', data);
      }
      break;

      //보금자리
      case 'LT':
        value = this.title;
        data = {};
        Session.set('endingNoteListHeaderIm selectedMenu', 'traceEnding');
        global.utilTemplateMove('endingNoteListHeaderIm', 'imLifeTrace', data);
      break;

      case 'ME':
        data.questionId = this.postId;
        Session.set('endingNoteListHeaderIm selectedMenu', 'talkToMeEnding');
        global.utilTemplateMove('endingNoteListHeaderIm', 'imMe', data);
      break;

      case 'WM':
        data._id = this.postId;
        data.searchOption = {
          filter : 'tag',
          searchText : ''
        };
        Session.set('endingNoteListHeaderIm selectedMenu', 'feelEnding');
        global.utilTemplateMove('endingNoteListHeaderIm', 'imWithMeDetail', data);
      break;

      case 'FT':
        data._id = this.postId;
        global.utilTemplateMove('endingNoteListHeaderFuture', 'futureDetail', data);
      break;
    }
  },
  // 타임라인 왼쪽 이벤트풍선 더보기 버튼
  "click #timelineL": function(e, t) {
    e.preventDefault();
    var value = null;
    var type = e.target.getAttribute('valueType');
    var templateData = {};
    var sortParam = null;
    switch(type) {
      case 'IM':
        value = e.target.getAttribute('value');
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imContent';
        sortParam = 'startDateDesc';
      break;
      case 'BL':
        value = e.target.getAttribute('value');
        templateData.headerTmp = 'endingNoteListHeaderBucketList';
        templateData.contentTmp = 'bucketContent';
        sortParam = 'regDateDesc';
      break;
      case 'LT':
        value = e.target.getAttribute('txt');
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imContent';
      break;
      case 'ME':
        value = e.target.getAttribute('txt');
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imContent';
      break;
    }
    var data = {
      searchOption: {
        filter : 'tag',
        searchText : value,
        sortParam: sortParam
      },
      selectedMenu : 'all'
    };

    global.utilTemplateMove(templateData.headerTmp, templateData.contentTmp, data);
  },
  "click .spaceship": function(e, t){
    e.preventDefault();

    //미래 영역 열림 표시
    if(Session.get('timelineMain isFutureSelected')) { //닫기
      Session.set('timelineMain isFutureSelected', false);

      //topLimit 0 초기화
      Session.set('timelineMain topLimit', 0);
      Session.set('timelineMain standardDate', global.utilGetDate().defaultYMD);
    } else { //열기
      Session.set('timelineMain isFutureSelected', true);

      //topLimit 초기값 설정 하여 top 데이터 t.addCount만큼 add
      Session.set('timelineMain topLimit', global.timeLineItemsIncrement);
      //미래 클릭시 오늘날짜로 startDate 변경
      Session.set('timelineMain standardDate', global.utilGetDate().defaultYMD);

      //달력 오늘로 설정
      var date = global.utilGetDate().defaultYMD;
      $('.single-calendar').data('daterangepicker').setStartDate(date);
      $('.single-calendar').data('daterangepicker').setEndDate(date);

      //미래영역 말풍선 간격 조정
      if(Session.get('timelineMain isDataChanged')){
        Session.set('timelineMain isDataChanged', false);
      } else {
        Session.set('timelineMain isDataChanged', true);
      }
    }
  },
  "click .timelineFilter": function(e, t){
    e.preventDefault();
    beforeDataCount = 0;

    Session.set('timelineMain selectedFilter', e.currentTarget.id);
    t.type.set(e.currentTarget.id);
  },
  "click #myContents": function(e, t){
    value = e.target.getAttribute('txt');
    data = {
      searchOption : {
        filter : 'tag',
        searchText : value
      }
    };
    global.utilTemplateMove('endingNoteListHeaderIm', 'imContent', data);
  },
  "click [name=up_data]": function(e, t){
    e.preventDefault();

    // Session.set('timelineMain standardDate', t.topDate);

    //시작일자 표시된 가장 최근일로 입력
    Session.set('timelineMain topLimit', Session.get('timelineMain topLimit') + global.timeLineItemsIncrement);
  },
  "click [name=down_data]": function(e, t){
    e.preventDefault();

    t.bottomLimit.set(t.bottomLimit.get() + global.timeLineItemsIncrement);
  },
  'click [name=today]': function(e, t) {
    e.preventDefault();
    $('.hl-scroll').mCustomScrollbar('scrollTo',"top");
    Session.set('timelineMain standardDate', global.utilGetDate().defaultYMD);
    var date = global.utilGetDate().defaultYMD;
    $('.single-calendar').data('daterangepicker').setStartDate(date);
    $('.single-calendar').data('daterangepicker').setEndDate(date);
  }
});

Template[templateName].helpers({
  hpCollection: function() {
    return Template.instance().timeline.get();
  },
  hpTimelineLeftType: function(data) {
    var template = null;

    if(_.isEqual(data.contentType, 'H') || _.isEqual(data.type, 'BP')) {
      // template = 'timelineMainType2'; //히스토리
    } else {
      if (data.userId === Template.instance().userId) {
        if (data.type === 'BL') {
          template = 'timelineMainLeft2';
        } else {
          template = 'timelineMainLeft';
        }

        if (data.follow) {
          // 따라가기를 했을때
          template = 'timelineFriendType1'; // 제목, 내용, 이미지

          if (global.fn_isExist(data.content)) {
            // content가 있을떄
            if (global.fn_isExist(data.images)) {
              // 이미지가 있을시
              template = 'timelineFriendType2'; // 제목, 내용, 이미지
            }
          } else {
            // content가 없을때
            template = 'timelineFriendType3'; // 제목, 이미지만
          }
        }

      } else {
        // 등록된글이 친구 글일때
        template = 'timelineFriendType1';

        var content = global.utilTagRemove(data.content); // 태그를 제거한다
        if (global.fn_isExist(content)) {
          // content가 있을떄
          if (global.fn_isExist(data.images)) {
            // 이미지가 있을시
            template = 'timelineFriendType2'; // 제목, 내용, 이미지
          }
        } else {
          // content가 없을때
          template = 'timelineFriendType3'; // 제목, 이미지만
        }
      }

      if (data.type === 'FT') {
        template = 'timelineFutrueType';
      }
      if (_.isEqual(data.type, 'LT') && _.isEqual(data.timeClass, 'end')) {
        template = null;
      }
    }
    return template;
  },
  hpTimelineRightType: function(data) {
    var template = null;

    if (data.userId === Template.instance().userId) {
      if(_.isEqual(data.contentType, 'H')) {
        template = 'timelineMainType2'; //히스토리
      } else if (_.isEqual(data.type, 'ME')) {
        template = 'timelineMainType3';
      } else {
        template = 'timelineMainType1'; //기본(제목, 내용)

        var content = global.utilTagRemove(data.content); // 태그를 제거한다
        if (global.fn_isExist(content)) {
          // content가 있을떄
          if (global.fn_isExist(data.images)) {
            // 이미지가 있을시
            template = 'timelineMainType5'; // 제목, 내용, 이미지
          }
        } else {
          // content가 없을때
          template = 'timelineMainType4'; // 제목, 이미지만
        }
      }
    }

    return template;
  },
  // hpMoreTopResults: function(){
  //   if(_.isUndefined(Session.get('timelineMain data'))){
  //     return false;
  //   } else {
  //     return Session.get('timelineMain topLoading');
  //   }
  // },
  // hpMoreBottomResults: function(){
  //   if(_.isUndefined(Session.get('timelineMain data'))){
  //     return false;
  //   } else {
  //     return Session.get('timelineMain bottomLoading');
  //   }
  // },
  hpSelectedFilter: function(filterName){
    if(_.isEqual(Session.get('timelineMain selectedFilter'), filterName)) {
      return true;
    }
  },
  hIsFutureListActive: function(){
    return Session.get('timelineMain isFutureSelected') === true ? 'active' : '';
  },
  hpSelectedFuture: function(){
    if(Session.get('timelineMain isFutureSelected') === true) {
      return true;
    }
  },
  hpUpButton: function() {
    return Template.instance().upButton.get();
  },
  hpDownButton: function() {
    return Template.instance().downButton.get();
  },
  hpDataChanged: function() {
    return Session.get('timelineMain isDataChanged');
  },
  hpIsFuture: function() {
    return Template.instance().isFuture.get();
  }
});

Template.timelineMainType2.helpers({
  // history 메세지 타입
  hpHistoryMessage: function(type, len, index) {
    if (len !== 0 && index < 2) {
      return true;
    }
  },
  // 히스토리 메세지 뿌리는형식 헬퍼
  hpMessage: function(obj, mainType) {
    var typeMessage = '';
    var lastMessage = '';
    var storyObj = {
      _id: obj.typeKey
    };
    var bsTitle = null;
    switch(obj.type) {
      case 'WR':
      switch(obj.postType) {
        case global.pageType.im: typeMessage = '추억을 '; break;
        case global.pageType.bucketList: typeMessage = '버킷리스트를 '; break;
        case global.pageType.bucketStory:
          bsTitle = ReactiveMethod.call('storyFind', storyObj);
          if (bsTitle) {
            typeMessage = '스토리[' + global.utilEllipsis(bsTitle[0].title, 15) + ']을 ';
          }
        break;
        case global.pageType.timeCapsule: typeMessage = '타임캡슐을 '; break;
        case global.pageType.lifeMap: typeMessage = '라이프맵을 '; break;
      }
      if (obj.postType === global.pageType.timeCapsule) {
        lastMessage = '생성했습니다.';
      } else {
        lastMessage = '등록했습니다.';
      }
      break;

      case 'LK':
        if (obj.postType === 'BS') {
          bsTitle = ReactiveMethod.call('storyFind', storyObj);
          if (bsTitle) {
            lastMessage = '[' + global.utilEllipsis(bsTitle[0].title, 11) + ']을 좋아합니다.';
          }
        } else {
          lastMessage = '좋아합니다.';
        }
      break;

      case 'CM':
        if (obj.postType === 'BS') {
          bsTitle = ReactiveMethod.call('storyFind', storyObj);
          if (bsTitle) {
            lastMessage = '[' + global.utilEllipsis(bsTitle[0].title, 9) + ']에 댓글을 썻습니다.';
          }
        } else {
          lastMessage = '댓글을 썼습니다.';
        }
      break;

      case 'FW':
        lastMessage = '버킷을 따라하기 시작했습니다.';
      break;

      case 'CP':
        lastMessage = '버킷을 따라하기 시작했습니다.';
      break;

      case 'BR':
        lastMessage = '타임캡슐을 매립했습니다.';
      break;

      case 'MS':
        lastMessage = '메세지를 등록하였습니다.';
      break;

      case 'US':
        lastMessage = '타임캡슐을 개봉했습니다.';
      break;

      case 'GR':
        lastMessage = '타임캡슐을 삭제했습니다.';
      break;
    }

    if (obj.type === 'LK' || obj.type === 'CM' || obj.type === 'MS' || obj.type === 'GR' || obj.type === 'FW') {
      if (obj.multi === 1) {
        // typeMessage = global.utilStrCut(global.utilGetNickName(obj.user), 6) + '님이 ';
        typeMessage = global.utilStrCut(ReactiveMethod.call('getNickName', obj.user), 6) + '님이 ';

      } else {
        // typeMessage = global.utilStrCut(global.utilGetNickName(obj.user), 6) + '님 외' + (obj.multi - 1) + '명이 ';
        typeMessage = global.utilStrCut(ReactiveMethod.call('getNickName', obj.user), 6) + '님 외' + (obj.multi - 1) + '명이 ';
      }
    }

    if (obj.type === 'CP') { // 따라하기한사람
      // typeMessage = global.utilStrCut(global.utilGetNickName(obj.user), 6) + '님의 ';
      typeMessage = global.utilStrCut(ReactiveMethod.call('getNickName', obj.user), 6) + '님의 ';
    }
    // 그룹원이 버킷스토리 등록한경우
    if (obj.postType === 'BS' && obj.type === 'WR' && obj.userId !== obj.user) {
      // typeMessage = global.utilStrCut(global.utilGetNickName(obj.user), 6) + '님이 ' + typeMessage;
      typeMessage = global.utilStrCut(ReactiveMethod.call('getNickName', obj.user), 6) + '님이 ' + typeMessage;
    }

    return typeMessage + lastMessage;
  },
  hpContentSort: function(data) {
    var content = data.content;
    var sortData = _.chain(_.compact(content)).sortBy('typeKey').sortBy('type').sortBy('updateDate').value().reverse();
    var result = [];
    sortData = _.groupBy(sortData, function(a) {
      return a.typeKey + '/' + a.postType + '/' + a.type + '/' + new Date(a.updateDate).format('yyyy-MM-dd');
    });

    var keys = _.keys(sortData);
    keys.map(function(item, i) {
      // var count = sortData[keys[i]].length;
      var temp = [];
      sortData[item].map(function(subItem) {
        temp.push(subItem.user);
      });
      var count = _.uniq(temp).length;
      sortData[item][0].multi = count;
      if(data.type === 'TC'){
        sortData[item][0].unsealDate = data.unsealDate;
        sortData[item][0].title = data.title;
        sortData[item][0].groupMember = data.groupMember;
        sortData[item][0].nonUserGroupMember = data.nonUserGroupMember;
        sortData[item][0].buryLocationName = data.buryLocationName;
      }

      result.push(sortData[item][0]);
    });

    return result;
  }
});


Template.timelineMainType4.helpers({
  // hpImages: function(images) {
  //   return images;
  // }
  hpImagesCheck: function(index) {
    return index == 3;
  }
});

/*
 * TIMELINE FUTURE onRendered
 */
Template.timelineFutureList.onRendered(function(){
  this.$('#timelineFutureContainer').slideDown();
});

Template.timelineFutureList.helpers({
  hpCollection: function() {
    // return Session.get('timelineMain data');
    return Template.instance().timeline.get();
  },
  hpTimelineLeftType: function(data) {
    var template = null;

    if(_.isEqual(data.contentType, 'H') || _.isEqual(data.type, 'BP')) {
      // template = 'timelineMainType2'; //히스토리
    } else {
      if (data.userId === userId) {
        if (data.type === 'BL') {
          template = 'timelineMainLeft2';
        } else {
          template = 'timelineMainLeft';
        }
        if (data.follow) {
          // 따라가기를 했을때
          template = 'timelineFriendType1'; // 제목, 내용, 이미지

          if (global.fn_isExist(data.content)) {
            // content가 있을떄
            if (global.fn_isExist(data.images)) {
              // 이미지가 있을시
              template = 'timelineFriendType2'; // 제목, 내용, 이미지
            }
          } else {
            // content가 없을때
            template = 'timelineFriendType3'; // 제목, 이미지만
          }
        }

      } else {
        // 등록된글이 친구 글일때
        template = 'timelineFriendType1';

        var content = global.utilTagRemove(data.content); // 태그를 제거한다
        if (global.fn_isExist(data.content)) {
          // content가 있을떄
          if (global.fn_isExist(data.images)) {
            // 이미지가 있을시
            template = 'timelineFriendType2'; // 제목, 내용, 이미지
          }
        } else {
          // content가 없을때
          template = 'timelineFriendType3'; // 제목, 이미지만
        }
      }
      if (data.type === 'FT') {
        template = 'timelineFutrueType';
      }
      if (_.isEqual(data.type, 'LT') && _.isEqual(data.timeClass, 'end')) {
        template = null;
      }
    }
    return template;
  },
  hpTimelineRightType: function(data) {
    var template = null;

    if (data.userId === userId) {
      if(_.isEqual(data.contentType, 'H')) {
        template = 'timelineMainType2'; //히스토리
      } else if (_.isEqual(data.type, 'ME')) {
        template = 'timelineMainType3';
      } else {
        template = 'timelineMainType1'; //기본(제목, 내용)

        var content = global.utilTagRemove(data.content); // 태그를 제거한다
        if (global.fn_isExist(content)) {
          // content가 있을떄
          if (global.fn_isExist(data.images)) {
            // 이미지가 있을시
            template = 'timelineMainType5'; // 제목, 내용, 이미지
          }
        } else {
          // content가 없을때
          template = 'timelineMainType4'; // 제목, 이미지만
        }
      }
    }

    return template;
  },
  hpSelectedFilter: function(filterName){
    if(_.isEqual(Session.get('timelineMain selectedFilter'), filterName)) {
      return true;
    }
  },
  hIsFutureListActive: function(){
    return Session.get('timelineMain isFutureSelected') === true ? 'active' : '';
  }
});

// setTop = function() {
//   setTimeout(function(){
//     targetElementLeft.mCustomScrollbar('scrollTo',"1");
//     targetElementLeft.mCustomScrollbar('scrollTo',"top");
//   }, 10);
// };

// 스크롤top
showMoreTopSlide = function() {
  Meteor.call('timeline_upButton_count', instance._id, instance.userArray, Session.get('timelineMain standardDate'), instance.type.get(), (instance.upSkip+instance.limit), instance.limit, function(error, result) {
    if (!error) {
      if (result !== 0) {
        $('.timeline-show-more.top').slideDown(100);
      }
    }
  });
};
// 스크롤bottom
showMoreDonwSlide = function(data) {
  Meteor.call('timeline_downButton_count', instance._id, instance.userArray, Session.get('timelineMain standardDate'), instance.type.get(), (instance.donwSkip+instance.limit), instance.limit, function(error, result) {
    if (!error) {
      if (result !== 0) {
        $('.timeline-show-more.bottom').slideDown(100);
      }
    }
  });
};

var setTimelineData = function(instance, timelineItem, button) {
  Meteor.call('enTimelineGetList', instance.userId, instance.isPageOwner, timelineItem, instance.userArray, global.login.userId, Session.get('timelineMain standardDate'), function(error, result) {
    if (!error) {
      if (result.length !== 0) {
        data = _.chain(result).sortBy('timeClass').reverse().sortBy('sort').sortBy('sortDate').sortBy('timelineDate').value().reverse();
        data = unionTime(data);

        //가장 최근 일자 저장
        // instance.topDate = _.first(_.compact(_.pluck(data, 'timelineDate')));

        // 미래 현재 데이터 나누기
        var resultData = {};
        var futureData = [];
        var currentData = [];
        for (var i = 0; i < data.length; i++) {
          var startDate = data[i].startDate;
          if (data[i].userId !== userId) {
            // 친구일때는 등록일자로 비교
            startDate = global.utilGetDate(data[i].sortDate).defaultYMD;
          }

          if (startDate > global.utilGetDate().defaultYMD) {
            futureData.push(data[i]);
          } else {
            currentData.push(data[i]);
          }
        }

        resultData.futureData = futureData;
        resultData.currentData = currentData;

        if(futureData.length > 0){ //미래데이터 유무 확인
          // if(Session.get('timelineMain standardDate') > global.utilGetDate().defaultYMD && Session.get('timelineMain isFutureSelected') === false){
            Session.set('timelineMain isFutureSelected', true);
          // }
        } else {
          Session.set('timelineMain isFutureSelected', false);
        }

        instance.timeline.set(resultData);
      } else {
        instance.timeline.set();
      }


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


// 데이터 랜덤으로 뽑아오는 헬퍼
UI.registerHelper('hpEndingNoteStory', function(data, limit) {
  var result = null;
  switch (this.type) {
    case 'IM': result = ReactiveMethod.call('endingNoteStoryRandom', data.type, data.tag, data.userId, limit);
    break;

    case 'BL': result = ReactiveMethod.call('bucketListRandom', data.tag, data.userId, limit);
    break;

    case 'LT': result = ReactiveMethod.call('endingNoteStoryRandom', 'IM', [data.title], data.userId, limit);
    break;

    case 'ME':
      switch(data.subType) {
        case 'ME': case 'IM':
        var dataFlag = true;
        if (data.category === 'NM0010' || data.category === 'NM0013' || data.category === 'NM0021' || data.category === 'NM0022') {
          // 해당질문은 연관데이터를 안보여준다
          dataFlag = false;
        }
        if (dataFlag) {
          result = ReactiveMethod.call('endingNoteStoryRandom', 'IM', [data.title], data.userId, limit);
        }
        break;
      }
    break;
  }
  return result;
});

UI.registerHelper('hpGetTitle', function(data) {
  var mainTitle = global.timelineLeftTitle[data.type];
  if (data.type === 'LT') {
    mainTitle = '다른분들의 ' + data.title + ' 추억은...';
  }
  if (data.type === 'ME') {
    var count = ReactiveMethod.call('imMeQuestionCount', global.login.userId, data.category, data.title);
    mainTitle = global.timelineLeftTitle[data.category];
    mainTitle = mainTitle.replace('keyword', data.title);
    var textPostPosition = '';
    if(mainTitle.indexOf('|postPositionA') >= 0){
      textPostPosition = global.fn_getTextPostPosition(data.title, 'typeA'); //typeA = 을/를
      mainTitle = mainTitle.replace('|postPositionA', textPostPosition);
    } else if(mainTitle.indexOf('|postPositionB') >= 0){
      textPostPosition = global.fn_getTextPostPosition(data.title, 'typeB'); //typeB = 이/가
      mainTitle = mainTitle.replace('|postPositionB', textPostPosition);
    } else if(mainTitle.indexOf('|postPositionC') >= 0){
      textPostPosition = global.fn_getTextPostPosition(data.title, 'typeC'); //typeB = 으로/로
      mainTitle = mainTitle.replace('|postPositionC', textPostPosition);
    } else if(mainTitle.indexOf('|postPositionD') >= 0){
      textPostPosition = global.fn_getTextPostPosition(data.title, 'typeD'); //typeB = 은/는
      mainTitle = mainTitle.replace('|postPositionD', textPostPosition);
    }
    // 인원표시는 빼기로 함
    // if (count === 0) {
    //   mainTitle = mainTitle.replace('count명', '');
    // } else {
    //   mainTitle = mainTitle.replace('count', count);
    // }
  }
  return mainTitle;
});

UI.registerHelper('hpImagesCheck', function(data) {
  return data.length >= 4;
});

UI.registerHelper('hpImages', function(images) {
  return images;
});

// 이미지 여러개중 첫번째 하나만 보여주는 헬퍼
UI.registerHelper('hpImageOne', function(images) {
  return images[0];
});

UI.registerHelper('hpTypeName', function(data) {
  var result = null;
  switch(data.type) {
    case 'BP': result = '플랜'; break;
    case 'BS': result = '버키스토리'; break;
  }
  return result;
});

UI.registerHelper('hpMyDataCount', function(data) {
  var result = ReactiveMethod.call('myDataCount', data);
  return result;
});

UI.registerHelper('hpMeDataCount', function(data) {
  var result = ReactiveMethod.call('meDataCount', data);
  return result;
});
// 친구템플릿 제목 기재 헬퍼
UI.registerHelper('hpFriendType', function(type) {
  var result = null;
  switch(type) {
    case 'IM': result = '추억'; break;
    case 'BL': result = '버킷리스트'; break;
    case 'BS': result = '버키스토리'; break;
  }
  return result;
});
// 친구템플릿 기간 표시헬퍼
UI.registerHelper('hpFriendDate', function(data) {
  var result = null;
  switch(data.type) {
    case 'BL':
      result = data.title + '<br/>|{preTag}|기간:|{postTag}| ' + global.utilGetDate(data.startDate).defaultYMD + ' ~ ' + (data.endDate ? global.utilGetDate(data.endDate).defaultYMD : '') + '<br/>';
    break;
  }
  return result;
});
// lock 표시여부
UI.registerHelper('hpIsLock', function(lock) {
  return lock;
});
// 타임캡슐 개봉 표시 여부
UI.registerHelper('hpTimeCapsuleDday', function(data) {
  var result = null;
  if (data.type === 'TC') {
    var openedFlag = false;
    data.groupMember.map(function(item) {
      if (item.userId === global.login.userId) {
        if (item.openedDate) {
          openedFlag = true;
        }
      }
    });
    if (openedFlag) {
      result = 'Opened';
    } else {
      var dDay = global.fn_diffDate(data.unsealDate);
      result = 'D' + dDay.flag + dDay.diffDay;
    }
    return result;
  }
});
// 버킷따라가기 설정
UI.registerHelper('hpBkFollow', function(data) {
  if (data.follow && global.login.userId === data.userId) {
    var bkObj = {
      _id: data.parentPostId
    };
    var bkData = ReactiveMethod.call('bucketTimelineGetList', bkObj);
    if (bkData) {
      return bkData[0];
    }
  }
});

/*
* timeline 리스트 height리사이징을 위한 function (중복처리)
* 20170117 이병현
*/
// Template.fn_listHeightResizeControll = function(){
//   setTimeout(function(){
//     Template.fn_listHeightResize('.timeline-list');
//   }, 500);
// };
/*
// * timeline 리스트 height리사이징을 위한 function
// * 20170117 이병현
// */
// fn_listHeightResize = function(ids){
//   var eHeight = 70;
//   var eDefault = 50;
//   var ePadding = 20;
//   $(ids).each(function(i){
//     var qObj = $(this).find('.timeline-question');
//     var aObj = $(this).find('.timeline-answer');
//     var qHeight = qObj.height();
//     var aHeight = aObj.height();
//     var tHeight = 0;
//     if( qHeight !== null && qHeight >= aHeight){
//       tHeight = qHeight + ePadding;
//       $(this).height(tHeight);
//     }else if(aHeight !== null && aHeight >= qHeight){
//       tHeight = aHeight + ePadding;
//       $(this).height(tHeight);
//     }else{
//       tHeight = eDefault + ePadding;
//       $(this).height(tHeight);
//     }
//   });
// };

Template.timelineHeightRebuild.onRendered(function(){
  global.fn_listHeightResize('.timeline-list');
});