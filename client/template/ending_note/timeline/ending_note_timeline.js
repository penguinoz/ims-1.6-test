import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';

var templateName = 'endingNoteTimeLine';
var isAlready = false;
var instance;
Template[templateName].onCreated(function(){
  Blaze._allowJavascriptUrls();
  instance = this;
  instance.friendsStatus = new ReactiveVar();
  instance.lifeGoal = new ReactiveVar();
  instance.isWriteDone = new ReactiveVar(true);
  instance.isPageOwner = new ReactiveVar(false);
  Session.set('refresh', false);
  Session.set('timelineMain selectedMenu', null);
  // Session.set('endingNoteTimeLine isPageOwner', null);

  instance.autorun(function(){
     Session.get('refresh'); //방문자 체크 트리거
    if(_.isEqual(global.login.userId, global.login.pageOwner)){
      instance.isPageOwner.set(true);
    } else {
      instance.isPageOwner.set(false);
    }
  });

  getLifeGoal();
});

Template[templateName].onRendered(function(){
  targetElementLeft = this.$('.hl-scroll');

  var contentTimeLineHeight = $('#contentTimeLine').height();
  var timeLineCenteredHeight = $('.timeline-centered').height();
  $('.timeline-show-more.top').hide();
  $('.timeline-show-more.bottom').hide();

  // 스크롤 페이징 구현
  var scrollCallbackOptions = {
    onTotalScrollBack: function() { //상단
      // return showMoreTopVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
      // $('.timeline-show-more.top').slideDown(100);
      return showMoreTopSlide();
    },
    onTotalScroll: function() { //하단
      // console.log(this.mcs.top);
      // return showMoreBottomVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
      // $('.timeline-show-more.bottom').slideDown(100);
      return showMoreDonwSlide();
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
      // console.log(this.mcs);
      if(this.mcs.top < -1){ //스크롤 상단 벗어났을때 내렸을때
        $('.timeline-show-more.top').slideUp(100);
      }

      if(this.mcs.topPct < 100){ //스크롤 하단 벗어났을때 찍었을떄
        $('.timeline-show-more.bottom').slideUp(100);
      }
    },
    // onUpdate: function(){
    //   // $('.mCSB_container').css({"height":""});
    //   // // if(!isAlready){
    //   //   if(contentTimeLineHeight < $('#contentTimeLine').height()){
    //   //     contentTimeLineHeight = $('#contentTimeLine').height();
    //   //   }
    //   //
    //   //   if(timeLineCenteredHeight > $('.timeline-centered').height()){
    //   //     timeLineCenteredHeight = $('.timeline-centered').height();
    //   //   }
    //   //
    //   //   if(contentTimeLineHeight > timeLineCenteredHeight){
    //   //     bottomPadding = (contentTimeLineHeight - timeLineCenteredHeight) + 60;
    //   //     $('.timeline-padding').css({'padding-bottom':bottomPadding});
    //   //   }
    //   //  // console.log('onUpdateScroll', $('#contentTimeLine').height(), $('.timeline-centered').height(), $('.endingNote-timeLine-list').height());
    //   // }
    // },
    // whileScrolling: function(){
    //   var bottomPadding;
    //   if(this.mcs.top < -2){ //스크롤 아래로 내렸을때
    //     if(!isAlready){
    //       $('.timeline-menuContainer').addClass('scrolling');
    //       $('.timeline_header').slideUp(500);
    //       $('.timeline-qna').slideUp(500);
    //       $('.timeline-filter').addClass('scrolling');
    //       $('.content.left').css({'padding-bottom':'65px', 'margin-bottom':'-65px' } );
    //       $('.logo-slogun').hide();
    //       $('.gnb').addClass('scrolling');
    //       $('#gnbList').hide();
    //
    //       isAlready = true;
    //     }
    //   }else{ //스크롤 상단 찍었을떄
    //     isAlready = false;
    //     $('.timeline-menuContainer').removeClass('scrolling');
    //     $('.timeline_header').slideDown(500);
    //     $('.timeline-qna').slideDown(500);
    //     $('.timeline-filter').removeClass('scrolling');
    //     $('.content.left').css( {'padding-bottom':'145px', 'margin-bottom':'-145px' } );
    //     $('.logo-slogun').show();
    //     $('.gnb').removeClass('scrolling');
    //     $('#gnbList').show();
    //   }
    // },
    alwaysTriggerOffsets:false
  };
  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
  // this.$('.hl-scroll').mCustomScrollbar({
  //   theme : 'dark',
  //   live : true,
  //   scrollInertia : 100,
  //   mouseWheel : {
  //     enable : true,
  //     scrollAmount : "auto",
  //     axis : "y",
  //     // preventDefault : false,
  //     // deltaFactor : "auto",
  //     // normalizeDelta : false,
  //     // invert : false,
  //     // disableOver : ["select","option","keygen","datalist","textarea"]
  //   },
  //   callbacks : {
  //     onTotalScroll: function() {
  //       return showMoreBottomVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
  //     },
  //     onTotalScrollBack: function() {
  //       return showMoreTopVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
  //     },
  //     // whileScrolling: function() {
  //     //   return showMoreTopVisibleTimeline(this);
  //     // },
  //     onOverflowY:function(){
  //       return setTop();
  //     }
  //   }
  // });

});

Template[templateName].onDestroyed(function(){
  Session.set('endingNoteTimeline templateData', null);
});

Template[templateName].events({
  "click #im,#bucket,#time,#write": function(e, t){
    var templateData = {};
    switch(e.currentTarget.id) {
      // 나
      case 'im':
      templateData.headerTmp = 'endingNoteListHeaderIm';
      templateData.contentTmp = 'imContent';
      Session.set('endingNoteListHeaderIm selectedMenu', null);
      break;
      // 버킷
      case 'bucket':
      templateData.headerTmp = 'endingNoteListHeaderBucketList';
      templateData.contentTmp = 'bucketContent';
      Session.set('endingNoteListHeaderBucketList selectedMenu', null);
      break;

      //타임캡슐
      case 'time':
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleContent';
      Session.set('endingNoteListHeaderTimeCapsule selectedMenu', null);
      break;

      //글쓰기(추억)
      case 'write':
      templateData.headerTmp = 'endingNoteListHeaderIm';
      templateData.contentTmp = 'imWriting';
      break;
    }

    //엔딩노트 리스트 템플릿명
    Session.set('endingNoteList templateData', templateData);
    //Template.endingNoteList.__helpers.get('contentList')(e.target.id);
  },
  "click .timeLineMenu": function(e, t){
    e.preventDefault();

    if(_.isEqual(e.currentTarget.id,'write')){
      Session.set('timelineMain selectedMenu','im');
      setTimeout(function(){
        Session.set('endingNoteListHeaderIm selectedMenu', 'writeEnding');
      }, 100);
    } else {
      Session.set('timelineMain selectedMenu', e.currentTarget.id);
    }
  },
  "click .dropdown-toggle" : function(e, t){
    // console.log('dropdown-toggle click', global.login.userId, e.target.getAttribute('value'));
    // Meteor.call('getFriendRequestStatus', global.login.userId, e.currentTarget.id, function(error, result){
    Meteor.call('getFriendRequestStatus', global.login.userId, global.login.pageOwner, function(error, result){
      if(error){
        console.log(error);
      } else {
        t.friendsStatus.set(result);
        // Session.set('imContent friendsStatus', result);
      }
    });
  },
  "click #txtGoalPencilEdit": function(e, t) {
    $('#txtGoal').focus();
    t.isWriteDone.set(false);
  },
  "click #txtGoalPencilSave, keyup #txtGoal": function(e, t) {
    //1. 글자수 제한
    var goalString = $('input[id="txtGoal"]').val();
    var inputMaxLength = $('input[id="txtGoal"]').prop("maxlength");
    var j = 0;
    var count = 0;
    for(var i = 0;i < goalString.length;i++) {
      val = escape(goalString.charAt(i)).length;
      if(val == 6){
        j++;
      }
      j++;
      if(j <= inputMaxLength){
        count++;
      }
    }
    console.log('j&inputMaxLength :', j, inputMaxLength, count);
    if(j > inputMaxLength){
      $('#txtGoal').blur();
      global.utilAlert('글자수는 한글16자, 영문32자로 제한됩니다.');
      $('input[id="txtGoal"]').val(goalString.substr(0, count));
    }

    //2. 저장
    if (e.keyCode === 13 || e.type === 'click') {

      if(!_.isEmpty(goalString)){
        setLifeGoal(goalString);
        t.isWriteDone.set(true);
        getLifeGoal();
      }
    }
  },
  "click [name=writeGoalCancel]": function(e, t){
    e.preventDefault();
    t.isWriteDone.set(true);
  }
});

Template[templateName].helpers({
  hpTemplate: function() {
    if (Session.get('endingNoteTimeline templateData') === null || Session.get('endingNoteTimeline templateData') === undefined) {
      var templateData = {};
      templateData.contentTmp = 'timelineMain';
      Session.set('endingNoteTimeline templateData', templateData);
    }
    return Session.get('endingNoteTimeline templateData');
  },
  hpSelectedMenu: function(menuName) {
    if(_.isEqual(Session.get('timelineMain selectedMenu'), menuName)) {
      return true;
    }
  },
  hpUserAuth: function() {
    return Template.instance().isPageOwner.get();
    // return Session.get('endingNoteTimeLine isPageOwner');
  },
  hpFriendStatus: function() {
    return Template.instance().friendsStatus.get();
    // return Session.get('imContent friendsStatus');
  },
  hpLifeGoal: function() {
    return Template.instance().lifeGoal.get();
  },
  hpIsWriteDone: function() {
    return Template.instance().isWriteDone.get();
  },
  hpRefreash: function() {
    return Session.get('refresh');
  }
});


function getLifeGoal(){
  Meteor.call('getLifeGoal', global.login.userId, function(error, result){
    if(error){
      return console.log(error);
    } else {
      if(result){
        instance.lifeGoal.set(result);
      } else {
        instance.lifeGoal.set('');
      }
    }
  });
}

function setLifeGoal(_goalString){
  Meteor.call('setLifeGoal', global.login.userId, _goalString);
}

//목표설정 쓰기 템블릿 툴팁
Template.endingNoteTimeLineGoal.onRendered(function(){
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});