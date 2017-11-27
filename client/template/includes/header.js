import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

var templateName = "header";
var navigationItems=[
  {
    "id": 0,
    "menuName": "엔딩",
    "menuSubName": "노트",
    "templateName": "topMenu1",
    "basePath": "/endingNote"
  },
  {
    "id": 1,
    "menuName": "라이프",
    "menuSubName": "뷰",
    "templateName": "topMenu2",
    "basePath": "/lifeView"
  },
  //lifemap 제외 추석처리
  // {
  //   "id": 2,
  //   "menuName": "LIFE",
  //   "menuSubName": "MAP",
  //   "templateName": "topMenu3",
  //   "basePath": "/lifeMap"
  // }
];

var userId = '';

Template[templateName].onCreated(function(){
  Session.set('imsSearching text', null);
  var instance = this;
  instance.notiCount = new ReactiveVar();
  instance.isPageOwner = new ReactiveVar();

  var subscription = instance.subscribe("getNotiCount", global.login.userId);
  instance.autorun(function(){

    Session.get('refresh'); //방문자 체크 트리거
    if(_.isEqual(global.login.userId, global.login.pageOwner)){
      instance.isPageOwner.set(true);
    } else {
      instance.isPageOwner.set(false);
    }

    if(subscription.ready()){
      var notiCount = CLT.ImsNoti.find().count();

      instance.notiCount.set(notiCount);
    }
  });

});

Template[templateName].onRendered(function(){
  history.pushState(null, null, document.location.pathname);
  //툴팁 위치 지정
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template[templateName].helpers({
  items: function(){
    return navigationItems;
  },

  isSelected: function(){
    var isSelect = "";
    var currentRoute = Router.current().route.options.template === undefined ? "topMenu1" : Router.current().route.options.template;
    if(this.templateName == currentRoute){
      isSelect = "active";
    }
    return isSelect;
  },
  currentName: function(_target){
    var currentName = "";
    var currentRoute = Router.current().route.options.template;
    for(var key in navigationItems){
      if(navigationItems[key].templateName == currentRoute){
        if(_target == "menuName"){
          currentName = navigationItems[key].menuName;
        }else{
          currentName = navigationItems[key].menuSubName;
        }
      }
    }
    return currentName;
  },
  hpNotiCount: function(){
    return Template.instance().notiCount.get();
  },
  hpIsPageOwner: function(){
    return Template.instance().isPageOwner.get();
  }
});

Template[templateName].events({
  "click #sample": function(e, t){
    e.preventDefault();

    var modalObj = {};
    modalObj.template = t.$(e.target).data('modal-template');
    global.utilModalOpen(e, modalObj);
  },
  "mouseenter #gnbSelect,#gnbList":function(e, t) {
    e.preventDefault();
    var hasClass = $(e.target).parents('.gnb').hasClass("scrolling");
    if(hasClass){
      $('#gnbList').show();
    }
  },
  "mouseleave #gnbSelect,#gnbList":function(e, t) {
    e.preventDefault();
    var hasClass = $(e.target).parents('.gnb').hasClass("scrolling");
    if(hasClass){
      $('#gnbList').hide();
    }else{
      $('#gnbList').show();
    }
  },
  "click li.gnb01":function(e, t) {
    if($('.gnb').hasClass("scrolling") && !_.isEqual(this.menuSubName,'NOTE')){
      $('.timeline-menuContainer').removeClass('scrolling');
      $('.timeline_header').slideDown();
      $('.timeline-qna').slideDown();
      $('.timeline-filter').removeClass('scrolling');
      $('.content.left').css( {'padding-bottom':'145px', 'margin-bottom':'-145px' } );
      $('.logo-slogun').show();
      $('.gnb').removeClass('scrolling');
      $('#gnbList').show();
    }
  },
  "click [name=myPage]":function(e, t){
    e.preventDefault();
    $(".mypage-container").show().animate( { left: 0 }, 500 );

    containerRefresh();
  },
  "click [name=customer]":function(e, t){
    e.preventDefault();
    $(".customer-container").show().animate( { left: 0 }, 500 );
  },
  // "click [name=notification]":function(e, t){
  //   // e.preventDefault();
  //   // if(Router.current().route.options.template !== 'topMenu1'){
  //   //   Router.go('/endingNote');
  //   // }
  //   // setTimeout(function(){
  //   //   var templateData = {};
  //   //   templateData.headerTmp = 'endingNoteListHeadernotification';
  //   //   templateData.contentTmp = 'notification';
  //   //   Session.set('endingNoteList templateData', templateData);
  //   // }, 100);
  //   // window.open(Router.url('popupChild'), 'title', "width=500, height=300");
  //   window.open(Router.url('notification'), '알림', "width=498, height=500");
  // },
  "click [name=logout]":function(e, t){
    e.preventDefault();
    Meteor.logout();
    Router.go('/');
    global.login.userId = null;
    global.login.pageOwner = null;
    // global.utilAlert('로그아웃되었습니다.');
  },
  "click [name=otherClose]" : function(e, t){
    e.preventDefault();

    close();
    // $('.gnb-other').hide();
    // $('#header').css('border-bottom', '0');
    // Router.go('/endingNote');
    // //다른사용자의 엔딩노트로 이동하기 위한 pageOnwer설정
    // var selectedUserId = global.login.userId;
    // global.fn_setPageOwner(global.login.userId);
    //
    //
    // // //다이나믹 템플릿
    // var templateData = {};
    // Session.set('endingNoteTimeline templateData', templateData);
    //
    //
    // setTimeout(function() {
    //   //타임라인 설정
    //   templateData.contentTmp = 'timelineMain';
    //   Session.set('endingNoteTimeline templateData', templateData);
    //   Session.set('endingNoteList templateData', null);
    //   Session.set('refresh', Session.get('refresh') ? false : true);
    // },100);
  },
  "click [name=search], keypress [name=searchText]": function(e, t) {
    // e.preventDefault();
    if (e.type === 'click' || e.keyCode === 13) {
      var text = t.find('input[name=searchText]').value;
      Session.set('imsSearching text', null);
      Session.set('imsSearching text', text);
      Meteor.call('getStoryBucketSearchFind', text, function(error, result) {
        if (!error && result) {
          var templateData = {};
          setTimeout(function(){
            templateData.headerTmp = 'endingNoteListHeaderSearch';
            templateData.contentTmp = 'lifeViewDetailList';
            templateData.data = result;
            Session.set('endingNoteList templateData', templateData);
          }, 100);
        }
      });
    }
  },
  "click #inheritance": function(e, t){
    e.preventDefault();
    $(".inh-container").show().animate( { left: 0 }, 500 );

    //항상 처음 메뉴가 오게 해야함
    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  }
});

function containerRefresh(){
  if(Session.get('container refresh'))
  {
    Session.set('container refresh', false);
  } else {
    Session.set('container refresh', true);
  }
}
