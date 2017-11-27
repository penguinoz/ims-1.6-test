import {global} from '/imports/global/global_things.js';

// 나는 > 리스트컨텐츠
var templateName = 'futureContent';
var defaultData = [];
var userId = null;
var option;
var srchCondition = '';
var srchText = '';
var sortBy = '';
var isPast = '';

Template[templateName].onCreated(function(e, t){
  userId = global.login.userId;
  srchCondition = '';
  srchText = '';
  sortBy = '';
  isPast = '';

  Session.set('futureContent itemsLimit', global.itemsIncrement);
  option = Session.get('endingNoteList templateData');

  if (this.data) {
    if(this.data.searchOption) {
      srchCondition = this.data.searchOption.filter;
      srchText = this.data.searchOption.searchText;
      sortBy = this.data.searchOption.sortParam;
      isPast = this.data.searchOption.pastParam;
    }
  }

  initialData(srchCondition,srchText,sortBy,isPast);

});

Template[templateName].onRendered(function(){
  if(this.data){
    // if(this.data.selectedMenu) {
    //   selectedMenu = this.data.selectedMenu;
    //   if (selectedMenu === 'my') {
    //     $('#liTabMe').attr('class','active');
    //     $('#liTabAll').attr('class','');
    //   }
    //   else {
    //     $('#liTabAll').attr('class','active');
    //     $('#liTabMe').attr('class','');
    //   }
    // }

    if(this.data.searchOption) {
      if(this.data.searchOption.searchText){
        $('#keywordText').val(this.data.searchOption.searchText);
      }
      if(this.data.searchOption.filter){
        $('#keywordCondition').val(this.data.searchOption.filter);
      }
      if(this.data.searchOption.sortParam){
        $('#sort').val(this.data.searchOption.sortParam);
      }
      if(this.data.searchOption.pastParam){
        $('#past').attr('checked', this.data.searchOption.pastParam);
      }
    }
  }

  targetElement = this.$('.hr-scroll');
  //
  // if(option.searchOption) {
  //   if(option.searchOption.searchText){
  //     $('#keywordText').val(option.searchOption.searchText);
  //   }
  //   if(option.searchOption.filter){
  //     $('#keywordCondition').val(option.searchOption.filter);
  //   }
  //   if(option.searchOption.sortParam){
  //     $('#sort').val(option.searchOption.sortParam);
  //   }
  //   if(option.searchOption.pastParam){
  //     $('#past').attr('checked',option.searchOption.pastParam);
  //   }
  // }

  var scrollCallbackOptions = {
    whileScrolling: function() {
      return showMoreVisibleFutureContent(this);
    }
  };
  global.fn_customerScrollBarInit(targetElement, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
  $('#sort').on('change', function(e, t) {
    e.preventDefault();
    sortBy = $('#sort option:selected').val();
    initialData(srchCondition, srchText, sortBy, isPast);
  });
});

Template[templateName].events({

  // 상세 이벤트
  "click #title": function(e, t) {
    e.preventDefault();
    // var _id = e.target.getAttribute('value');
    var _id = e.target.getAttribute('value');

    var searchOptionParam = {};
    searchOptionParam.filter = srchCondition;
    searchOptionParam.searchText = srchText;
    searchOptionParam.sortParam = sortBy;
    searchOptionParam.pastParam = $("#past").is(":checked");

    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderFuture';
    templateData.contentTmp = 'futureDetail';
    templateData.data = {
      _id : _id,
      searchOption : searchOptionParam
    };

    Session.set('endingNoteList templateData', templateData);



    // var searchOptionParam = {};
    // searchOptionParam.filter = srchCondition;
    // searchOptionParam.searchText = srchText;
    // searchOptionParam.sortParam = sortBy;
    //
    // var templateData = {};
    // templateData.headerTmp = 'endingNoteListHeaderIm';
    // templateData.contentTmp = 'imDetail';
    // templateData.data = {
    //   _id : _id,
    //   selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
    //   searchOption : searchOptionParam
    // };
    //
    // Session.set('endingNoteList templateData', templateData);
  },
  // 검색 이벤트
  "click #search": function(e, t) {
    e.preventDefault();

    //검색 리미트 재설정
    Session.set('futureContent itemsLimit', global.itemsIncrement);
    option.searchOption = null;

    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;
    sortBy = t.find('#sort').value;

    //데이터 검색
    initialData(srchCondition, srchText, sortBy, isPast);
  },
  // sort이벤트
  "change #sort": function(e, t) {
    e.preventDefault();
    sortBy = t.find('#sort').value;
    Session.set('futureContent itemsLimit', global.itemsIncrement);
    initialData(srchCondition, srchText, sortBy, isPast);
  },
  "change #past": function(e, t){
    isPast = $("#past").is(":checked");
    Session.set('futureContent itemsLimit', global.itemsIncrement);
    initialData(srchCondition, srchText, sortBy, isPast);
  }
});

Template[templateName].helpers({
  hpListData: function(){
    return Session.get('futureContent collection').data;
  },
  hpTotalCount: function() {
    return Session.get('futureContent collection').count;
  },
  hpMoreResults: function(){
    if(_.isUndefined(Session.get('futureContent collection').data)){
      return false;
    }
    else {
      return (Session.get('futureContent collection').data.length >= Session.get("futureContent itemsLimit"));
    }
  },
  hpMemoryDate: function (startDate) {
    return global.utilGetDate(startDate).korYMD;
  }
});

// 이미지 뿌려줄 갯수를 정의하는 헬퍼
Template.registerHelper('imageCount', function(index, count) {
  return index < count;
});
// 좋아요 구분 헬퍼
Template.registerHelper('isLike', function(like) {
  var flag = false;
  if (_.indexOf(like, global.login.userId) !== -1) {
    flag = true;
  }
  return flag;
});

//데이터 검색 (조건에 따라 검색)
//params : searchCondition(검색필터), searchText(검색입력조건)
function initialData(searchCondition, searchText, sortParam, pastParam){
  Meteor.call('futureGetList', userId, Session.get('futureContent itemsLimit'), searchCondition, searchText, pastParam, sortParam,function(error, result){
    if(error){
      console.log('error : '+ error);
    }
    else {
      defaultData = [];
      Session.set('futureContent collection', null);

      defaultData = result; // = defualtDataSort(result, $('#sort option:selected').val());
      Session.set('futureContent collection', defaultData);

    }
  });
}

// 스크롤에 의한 추가데이터 로드(loading... 템플릿 보이기/안보이기)
showMoreVisibleFutureContent = function(data) {
  var target = $("#showMoreResults");
  if (target.length === 0) return;

  var elem = $(".mCSB_draggerContainer");
  if ( data.mcs.topPct > 85) { //스크롤이 아래 내려오는 위치의 비율로 추가 데이터 보여줌 결정
    Session.set("futureContent itemsLimit", Session.get("futureContent itemsLimit") + global.itemsIncrement);
    initialData(srchCondition, srchText, sortBy, isPast);
  }
};
