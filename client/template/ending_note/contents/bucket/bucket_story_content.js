import {global} from '/imports/global/global_things.js';

// 나는 > 리스트컨텐츠
var templateName = 'bucketStoryContent';
var defaultData = [];
var userId = null;
var pageType = null;
var bucketListId = '';
var parentTemplateName = '';
var groupUsers = [];
var bucketListUserId = null;

Template[templateName].onCreated(function(){
  userId = global.login.userId;
  pageType=global.pageType.im;
  if(this.data){
    bucketListId = this.data._id;
    parentTemplateName = this.data.parentTemplateName;
    groupUsers = this.data.groupUsers;
    bucketListUserId = this.data.bucketListUserId; // 버킷리스트의 유저아이디
  }

  Session.set('bucketStory itemsLimit', global.itemsIncrement);

  //상세에서 목록으로 올때 기존 메뉴(my/all)의 데이터를 검색

});

Template[templateName].onRendered(function(){

  // targetElement = this.$('.hr-scroll');
  // initialData();
  // //jquery 스크롤 적용
  // var scrollCallbackOptions = {
  //   whileScrolling: function() {
  //     return showMoreVisibleImContent(this);
  //   }
  // };
  // global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark", scrollCallbackOptions);

  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    whileScrolling: function() {
      return showMoreVisibleImContent(this);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].events({
  // 상세 이벤트
  "click #title": function(e, t) {
    e.preventDefault();
    // var _id = e.target.getAttribute('value');
    var _id = e.target.getAttribute('value');

    var templateData = {};
    templateData.template = 'bucketStoryDetail';
    templateData.data = {
      title : this.title,
      bucketStoryId : _id,
      bucketListKey : bucketListId,
      templateName : 'bucketStoryDetail',
      parentTemplateName : parentTemplateName,
      groupUsers: groupUsers,
      bucketListUserId: bucketListUserId
    };
    Session.set('bucketStory templateList', templateData);

    //'이전' 버튼 활성화
    Session.set('bucketDetail hpUseGolistButton', true);

  },

  // // 유저 아이콘클릭
  // "click #userIcon": function(e, t) {
  //   e.preventDefault();
  //   var userId = e.target.getAttribute('value');
  //
  //   var templateData = {};
  //   Session.set('endingNoteTimeline templateData', templateData);
  //
  //   setTimeout(function() {
  //     templateData = {
  //       templateName: 'timelineMain',
  //       data: {
  //         userId: userId
  //       }
  //     };
  //     Session.set('endingNoteTimeline templateData', templateData);
  //   });
  // }
});

Template[templateName].helpers({
  hpListData: function(){
    return Session.get('bucketStory collection');
  },
  hpTotalCount: function() {
    if (Session.get('bucketStory collection')) {
      return Session.get('bucketStory collection').length;
    }
  },
  hpMoreResults: function(){
    // var elem = $(".h-scroll");
    if(_.isUndefined(Session.get('bucketStory collection'))){
      return false;
    }
    else {
      return (Session.get('bucketStory collection').length >= Session.get('bucketStory itemsLimit'));
    }
  },
  hpMemoryDate: function (startDate) {
    return global.utilGetDate(startDate).defaultYMD;
  },
  hpcallbackList: function (){
    initialData();
  }
});

// 이미지 뿌려줄 갯수를 정의하는 헬퍼
Template.registerHelper('imageCount', function(index, count) {
  return index < count;
});
// 이미지 4건 이상일 경우 + 헬퍼
Template.registerHelper('imageOver', function (list) {
  var flag = false;
  if(list && list.length > 3){
    flag = true;
  }
  return flag;
});

// 좋아요 구분 헬퍼
Template.registerHelper('isLike', function(like) {
  var flag = false;
  if (_.indexOf(like, userId) !== -1) {
    flag = true;
  }
  return flag;
});

//데이터 검색 (조건에 따라 검색)
//params : searchCondition(검색필터), searchText(검색입력조건)
function initialData(){
  var postId = bucketListId;
  Meteor.call('bucketStoryGetList',postId , Session.get('bucketStory itemsLimit'),
   function(error, result){
    if(error){
      console.log('error : ' + error);
    }
    else {
      defaultData = [];
      Session.set('bucketStory collection', null);

      defaultData = result;
      Session.set('bucketStory collection', defaultData);

    }
  });
}

// 스크롤에 의한 추가데이터 로드(loading... 템플릿 보이기/안보이기)
function showMoreVisibleImContent(data) {
  var target = $("#showMoreResults");
  if (target.length === 0) return;

  var elem = $(".mCSB_draggerContainer");
  if ( data.mcs.topPct > 85) { //스크롤이 아래 내려오는 위치의 비율로 추가 데이터 보여줌 결정
    Session.set('bucketStory itemsLimit', Session.get('bucketStory itemsLimit') + global.itemsIncrement);
    initialData();
  }
}

// 필터(인기순, 최신순)에 의한 데이터 리스트 sort
// function defualtDataSort(targetData, sortKey){
//   targetData.sort(function(a,b) {
//     var aData = null;
//     var bData = null;
//     if (sortKey === 'regDate') {
//       aData = new Date(a[sortKey]).getTime();
//       bData = new Date(b[sortKey]).getTime();
//     } else {
//       aData = a[sortKey];
//       bData = b[sortKey];
//     }
//     return (aData > bData) ? -1 : ((bData > aData) ? 1 : 0);
//   });
//   return targetData;
// }
