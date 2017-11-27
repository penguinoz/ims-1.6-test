import {global} from '/imports/global/global_things.js';

var templateName = 'timeCapsuleContentPublic';

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

  Session.set('timeCapsuleContentPublic itemsLimit', global.itemsIncrement);

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
  hpTimeCapsuleCollectionPbTop: function(){
    return Template.instance().processDataTop3.get();
  },
  hpTimeCapsuleCollectionPbList: function(){
    return Template.instance().processData.get();
  },
  hpTimeCapsulePublicCount: function(){
    return Session.get('timeCapsuleContent ContentsCount') ? Session.get('timeCapsuleContent ContentsCount').publicStatusCount : 0;
  },
  hpMoreResults: function(){
    // var elem = $(".h-scroll");
    // if(_.isUndefined(Session.get('timeCapsuleContentPublic collectionList'))){
    //   return false;
    // }
    // else {
    //   return (Session.get('timeCapsuleContentPublic collectionList').length >= Session.get('timeCapsuleContentPublic itemsLimit'));
    // }
    return true;
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
    Session.set('timeCapsuleContentPublic itemsLimit', global.itemsIncrement);

    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;

    //데이터 검색
    initialData(srchCondition, srchText);
  },
  "click #title": function(e, t) {
    e.preventDefault();

    var searchOptionParam = {};
    searchOptionParam.filter = srchCondition;
    searchOptionParam.searchText = srchText;

    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
    templateData.contentTmp = 'timeCapsuleDetail';
    templateData.data = {
      _id : this._id,
      selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
      searchOption : searchOptionParam,
      statusMenu : 'public',
      contentTmp : 'timeCapsuleContentPublic'
    };
    Session.set('timeCapsuleDetail template', 'PB');
    Session.set('endingNoteList templateData', templateData);
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

  // console.log(userId, isPageOwner, statusMenu, Session.get('timeCapsuleContentPublic itemsLimit'), searchCondition, searchText, selectedMenu);
  //
  Meteor.call('getTimeCapsuleListByStatus', userId, isPageOwner, statusMenu, Session.get('timeCapsuleContentPublic itemsLimit'),
  searchCondition, searchText, selectedMenu, function(error, result){
    if(error){
      console.log('error : ' + error);
    }
    else {
      defaultData = result;
      instance.processData.set(defaultData);
    }
  });
}

// 스크롤에 의한 추가데이터 로드(loading... 템플릿 보이기/안보이기)
function showMoreVisibleTimeCapsuleContentBury(data) {
  var target = $("#showMoreResults");
  if (target.length === 0) return;

  if ( data.mcs.topPct > 85) { //스크롤이 아래 내려오는 위치의 비율로 추가 데이터 보여줌 결정
    Session.set('timeCapsuleContentPublic itemsLimit', Session.get('timeCapsuleContentPublic itemsLimit') + global.itemsIncrement);
    initialData(srchCondition, srchText);
  }
}

