import {global} from '/imports/global/global_things.js';

var templateName = 'timeCapsuleContentBury';

var userId = null;
var isPageOwner = false;
var srchCondition = null;
var srchText = null;
var selectedMenu = null;
var statusMenu = null;
var instance;

Template[templateName].onCreated(function(){
  instance = this;
  instance.processData = new ReactiveVar();
  instance.processDataTop3 = new ReactiveVar();
  isPageOwner = false;
  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    userId = global.login.userId;
  } else {
    userId = global.login.pageOwner;
  }

  srchCondition = '';
  srchText = '';
  selectedMenu = '';
  statusMenu = '';

  Session.set('timeCapsuleContentBury itemsLimit', global.itemsIncrement);
  if(Session.set('timeCapsuleContent reflash') === null){
    Session.set('timeCapsuleContent reflash', "reload");
  }else{
    Session.set('timeCapsuleContent reflash', null);
  }

  if (this.data) {
    // console.log(this.data);
    if(this.data.searchOption && (this.data.searchOption.filter || this.data.searchOption.searchText)) {
      srchCondition = this.data.searchOption.filter;
      srchText = this.data.searchOption.searchText;
    }

    if(this.data.selectedMenu) {
      selectedMenu = this.data.selectedMenu;
    }

    if(this.data.statusMenu) {
      statusMenu = this.data.statusMenu;
    }
  }

  instance.autorun(function(){
    initialData(srchCondition,srchText);
  });
});

Template[templateName].helpers({
  hpTimeCapsuleCollectionBrTop: function(){
    return Template.instance().processDataTop3.get();
  },
  hpTimeCapsuleCollectionBrList: function(){
    return Template.instance().processData.get();
  },
  hpTimeCapsuleBuryCount: function(){
    return Session.get('timeCapsuleContent ContentsCount') ? Session.get('timeCapsuleContent ContentsCount').buryStatusCount : 0;//Session.get('timeCapsuleContentBury collectionList');
  },
  hpMoreResults: function(){
    // var elem = $(".h-scroll");
    // if(_.isUndefined(Session.get('timeCapsuleContentBury collectionList'))){
    //   return false;
    // }
    // else {
    //   return (Session.get('timeCapsuleContentBury collectionList').length >= Session.get('timeCapsuleContentBury itemsLimit'));
    // }
    return true;
  },
  hpIsEqualGroup : function(type){
    if(type === 'group'){
      return true;
    }else{
      return false;
    }
  },
  hpisLoginOnerId : function(targetUser){
    return targetUser === global.login.userId;
  }
});

Template[templateName].onRendered(function(){
  if(this.data){
    if(this.data.selectedMenu) {
      selectedMenu = this.data.selectedMenu;
      if (selectedMenu === 'my') {
        $('#liTabMe').attr('class','active');
        $('#liTabAll').attr('class','');
      }
      else {
        $('#liTabAll').attr('class','active');
        $('#liTabMe').attr('class','');
      }
    }

    if(this.data.searchOption) {
      if(this.data.searchOption.searchText){
        $('#keywordText').val(this.data.searchOption.searchText);
      }
      if(this.data.searchOption.filter){
        $('#keywordCondition').val(this.data.searchOption.filter);
      }
      // if(this.data.searchOption.sortParam){
      //   $('#sort').val(this.data.searchOption.sortParam);
      // }
    }
  }

  //jquery 스크롤 적용
  // var scrollCallbackOptions = {
  //   whileScrolling: function() {
  //     return showMoreVisibleTimeCapsuleContentBury(this);
  //   }
  // };
  // global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark", scrollCallbackOptions);
  //
  //
  var targetElementLeft = $('.hr-scroll');

  var scrollCallbackOptions = {
    whileScrolling: function() {
      return showMoreVisibleTimeCapsuleContentBury(this);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  "click #search": function(e, t) {
    e.preventDefault();

    //검색 리미트 재설정
    Session.set('timeCapsuleContentBury itemsLimit', global.itemsIncrement);

    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;

    //데이터 검색
    initialData(srchCondition, srchText);
  },
  "click #title": function(e, t) {
    e.preventDefault();
    var capsuleId = this._id;
    var searchOptionParam = {};
    var templateData = {};
    diffResult = global.fn_diffDate(this.unsealDate);

    if(diffResult.flag === '-'  && diffResult.diffDay !== 'day'){ //개봉일 지나지 않음
      searchOptionParam = {};
      searchOptionParam.filter = srchCondition;
      searchOptionParam.searchText = srchText;

      templateData = {};
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleDetail';
      templateData.data = {
        _id : capsuleId,
        selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
        searchOption : searchOptionParam,
        statusMenu : 'bury',
        contentTmp : 'timeCapsuleContentBury'
      };

      Session.set('endingNoteList templateData', templateData);
    } else { //개봉일이거나 개봉일이 지남
      searchOptionParam = {};

      templateData = {};
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleOpenEffect';
      templateData.data = {
        _id : capsuleId,
        searchOption : searchOptionParam,
        innerData : this
      };

      Session.set('endingNoteList templateData', templateData);
    }
  }
});

//데이터 검색 (조건에 따라 검색)
//params : searchCondition(검색필터), searchText(검색입력조건)
function initialData(searchCondition, searchText){
  Meteor.call('getTimeCapsuleTop3List', userId, isPageOwner, 3, 'my', function(error, result){
    if(error){
      console.log(error);
    } else {
      instance.processDataTop3.set(result);
    }
  });

  // console.log(userId, isPageOwner, statusMenu, Session.get('timeCapsuleContentBury itemsLimit'), searchCondition, searchText, selectedMenu);
  //
  Meteor.call('getTimeCapsuleListByStatus', userId, isPageOwner, statusMenu, Session.get('timeCapsuleContentBury itemsLimit'),
  searchCondition, searchText, selectedMenu, function(error, result){
    if(error){
      console.log('error : ' + error);
    }
    else {
      defaultData = result;
      instance.processData.set(result);
    }
  });
}

// 스크롤에 의한 추가데이터 로드(loading... 템플릿 보이기/안보이기)
function showMoreVisibleTimeCapsuleContentBury(data) {
  var target = $("#showMoreResults");
  if (target.length === 0) return;

  if ( data.mcs.topPct > 85) { //스크롤이 아래 내려오는 위치의 비율로 추가 데이터 보여줌 결정
    Session.set('timeCapsuleContentBury itemsLimit', Session.get('timeCapsuleContentBury itemsLimit') + global.itemsIncrement);
    initialData(srchCondition, srchText);
  }
}
