import {global} from '/imports/global/global_things.js';

var templateName = 'bucketContent';
var userId = null;
var srchCondition = '';
var srchText = '';
var sortBy = '';
var selectedMenu = '';
var statusMenu = '';
var categorySerchOp = '';
var isPageOwner = false;
var inheritanceKey = null;
var pageType = '';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.selectedMenu = new ReactiveVar('my');
  instance.isDropup = new ReactiveVar();
  instance.pageType = new ReactiveVar();
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
  sortBy = 'regDateDesc';
  categorySerchOp = '';

  Session.set('bucketContent friendsStatus', null);
  Session.set('bucketContent itemsLimit', global.itemsIncrement);
  Session.set('bucketContent clickTabMenu', false); //my/all 메뉴를 클릭했을때 항상 Sort값을 초기화 해주기 위한 구분자로 사용

  if (this.data) {
    if (instance.data.pageType === 'inheritance') {
      inheritanceKey = instance.data.inheritanceKey;
      pageType = instance.data.pageType;
      instance.pageType.set(instance.data.pageType);
    } else {
      if(this.data.searchOption) {
        srchCondition = this.data.searchOption.filter;
        srchText = this.data.searchOption.searchText;
        sortBy = this.data.searchOption.sortParam;
        categorySerchOp = this.data.searchOption.categorySerchParam;
      }

      if(this.data.selectedMenu) { // my/all
        selectedMenu = this.data.selectedMenu;
      }

      if(this.data.statusMenu) { // my/all
        statusMenu = this.data.statusMenu;
      }
      Session.set('bucketContent selectedStatusMenu',  this.data.statusMenu); //전체, 완료, 진행중, 따라쟁이
    }
  } else {
    Session.set('bucketContent selectedStatusMenu', 'all');
  }



  //상세에서 목록으로 올때 기존 메뉴(my/all)의 데이터를 검색
  stateCounter(selectedMenu);
  initialData(srchCondition,srchText,sortBy,categorySerchOp);

});

Template[templateName].onRendered(function(){
  //상세에서 목록으로 올때 기존 메뉴(my/all)를 활성화
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
      if(this.data.searchOption.categorySerchParam){
        $('#categoryOption').val(this.data.searchOption.categorySerchParam);
      }
    }
  }

  // targetElement = this.$('.hr-scroll');
  //
  // //jquery 스크롤 적용
  // var scrollCallbackOptions = {
  //   whileScrolling: function() {
  //     return showMoreVisibleBucketContent(this);
  //   }
  // };
  // global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark", scrollCallbackOptions);
  //


  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    whileScrolling: function() {
      return showMoreVisibleBucketContent(this);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  // global.fn_selectPicker('.selectpicker', null);

  $('#categoryOption').on('change', function(e, t) {
    // e.preventDefault();
    srchCondition = $('#keywordCondition option:selected').val();
    srchText = $('#keywordText').val();
    sortBy = $('#sort option:selected').val();
    categorySerchOp = $('#categoryOption option:selected').val();

    initialData(srchCondition, srchText, sortBy, categorySerchOp);
  });

  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template[templateName].events({
  // 상세 이벤트
  "click #title": function(e, t) {
    e.preventDefault();
    // var _id = e.target.getAttribute('value');
    var _id = this._id;
    if(!_id){
      _id = e.target.getAttribute('value');
    }
    var searchOptionParam = {};
    searchOptionParam.filter = srchCondition;
    searchOptionParam.searchText = srchText;
    searchOptionParam.sortParam = sortBy;
    searchOptionParam.categorySerchParam = categorySerchOp;

    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketDetail';
    templateData.data = {
      _id : _id,
      isGroup : this.isGroup,
      selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
      searchOption : searchOptionParam,
      statusMenu : statusMenu
    };

    Session.set('endingNoteList templateData', templateData);
  },
  // 검색 이벤트
  "click #search": function(e, t) {
    e.preventDefault();

    //검색 리미트 재설정
    Session.set('bucketContent itemsLimit', global.itemsIncrement);

    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;
    sortBy = t.find('#sort').value;
    categorySerchOp = t.find('#categoryOption').value;

    // console.log(srchCondition, srchText, sortBy, categorySerchOp);
    //데이터 검색
    initialData(srchCondition, srchText, sortBy, categorySerchOp);
  },
  // sort이벤트
  // "change #sort": function(e, t) {
  //   e.preventDefault();
  //   sortBy = t.find('#sort').value;
  //   initialData(srchCondition, srchText, sortBy, categorySerchOp);
  // },
  // tab 이벤트
  "click #tabMe,#tabAll": function(e, t) {
    e.preventDefault();

    var target = e.currentTarget.getAttribute('value');
    if (target === 'my') {
      selectedMenu = 'my';
      sortBy = 'regDateDesc';
      t.selectedMenu.set('my');
    }
    else {
      selectedMenu = 'all';
      sortBy = 'regDateDesc';
      t.selectedMenu.set('all');
    }
    Session.set('bucketContent itemsLimit', global.itemsIncrement);
    Session.set('bucketContent clickTabMenu', true);
    stateCounter(selectedMenu);

    Session.set('bucketContent collection', null);
    //데이터 검색
    initialData(srchCondition,srchText,sortBy, categorySerchOp);
  },
  "click #all,#complete,#process,#follow": function(e, t) {
    e.preventDefault();
    // console.log(e.currentTarget.id);
    Session.set('bucketContent selectedStatusMenu', e.currentTarget.id);
    statusMenu = e.currentTarget.id;

    Session.set('bucketContent collection', null);
    setTimeout(function () {
      initialData(srchCondition,srchText,sortBy, categorySerchOp);
    }, 100);
  },
  // "click .dropdown-toggle" : function(e, t){
  //   Meteor.call('getFriendRequestStatus', global.login.userId, this.userId, function(error, result){
  //     if(error){
  //       console.log(error);
  //     } else {
  //       Session.set('bucketContent friendsStatus', result);
  //     }
  //   });
  // },
  //사용자 프로파일 클릭
  "click .dropdown-toggle" : function(e, t){
    var nameCardHeight = 370;// 네임카드의 높이
    if((nameCardHeight + $(e.currentTarget).offset().top) > window.innerHeight){
      t.isDropup.set(true);
    } else {
      t.isDropup.set(false);
    }
  },
  "click a[name='tagButton']": function(e, t){
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketContent';
    var textVal = this.valueOf();
    if(textVal.indexOf("<strong>") !== -1 && textVal.indexOf("</strong>") !== -1){
      textVal = textVal.replace("<strong>","");
      textVal = textVal.replace("</strong>","");
    }

    templateData.data = {
      selectedMenu : 'all',
      searchOption :
      {
        categorySerchParam:"",
        filter:"tag",
        searchText:textVal,
        sortParam:"startDateDesc",
      },
      statusMenu : ""
    };
    Session.set('endingNoteList templateData', null);
    setTimeout(function(){
      Session.set('endingNoteList templateData', templateData);
    }, 100);
  },
});

Template[templateName].helpers({
  hpListData: function(){
    return Session.get('bucketContent collection');
  },
  hpMoreResults: function(){
    // var elem = $(".h-scroll");
    if(!Session.get('bucketContent collection') || _.isUndefined(Session.get('bucketContent collection'))){
      return false;
    }
    else {
      // return (Session.get('bucketContent collection').data.length >= Session.get('bucketContent itemsLimit'));
      return (Session.get('bucketContent collection').data.length !== Session.get('bucketContent collection').count);
    }
  },
  hpMemoryDate: function (startDate) {
    return global.utilGetDate(startDate).korYMD;
  },
  hpStateCount: function(){
    return Session.get('bucketContent stateCounter');
  },
  hpFriendStatus: function() {
    return Session.get('bucketContent friendsStatus');
  },
  hpSelectedStatusMenu: function(menuName){
    if(_.isEqual(Session.get('bucketContent selectedStatusMenu'), menuName)){
      return true;
    } else {
      return false;
    }
  },
  hpRangeDate: function(startDate, completeDate){
    var result = '';

    result = startDate + ' ~ '+ completeDate;
    if(!startDate && !completeDate){
      result = '';
    }

    return result;
  },
  hpSelectedMenu: function() {
    return Template.instance().selectedMenu.get();
  },
  hpisDropup: function(){
    if(Template.instance().isDropup.get()){
      return 'dropup';
    } else {
      return '';
    }
  },
  // 모두 버킷 가리기
  hpTabMenu: function() {
    return Template.instance().pageType.get() === 'inheritance' ? false : true;
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
  if (_.indexOf(like, global.login.userId) !== -1) {
    flag = true;
  }
  return flag;
});

//데이터 검색 (조건에 따라 검색)
//params : searchCondition(검색필터), searchText(검색입력조건)
function initialData(searchCondition, searchText, sortByparam, categoryParam){
  Meteor.call('bucketGetList', userId, isPageOwner, Session.get('bucketContent itemsLimit'), searchCondition, searchText, categoryParam, sortByparam, selectedMenu, statusMenu, function(error, result){
    if(error){
      console.log('error : '+ error);
    }
    else {
      // result = Object {data: Array(2), count: 2}
      var resultData = result;
      if(resultData){
        var userIds = _.uniq(_.pluck(resultData.data, 'userId'));
        //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
        Meteor.call('getNickAndImg', userIds, function(error, result){
          if(error){
            console.log(error);
          } else {
            var userInfo = result;
            _.map(resultData.data, function(info){
              var extend = _.findWhere(userInfo, {userId : info.userId});
              info.nickName = extend.nickName;
              info.profileImg = extend.profileImg;
            });

            if (pageType === 'inheritance') {
              Meteor.call('getInheritanceById', inheritanceKey, function(error, result) {
                if (!error) {
                  var inheritanceData = {};
                  var tempArr = [];
                  var tempCount = 0;
                  result.contents.map(function(item) {
                    if (item.type === 'BL') {
                      tempCount ++;
                      resultData.data.map(function(subItem) {
                        if (item.contentId === subItem._id) {
                          tempArr.push(subItem);
                        }
                      });
                    }
                  });
                  inheritanceData.count = tempCount;
                  inheritanceData.data = tempArr;
                  Session.set('bucketContent collection', inheritanceData);
                }
              });
            } else {
              Session.set('bucketContent collection', resultData);
            }
          }
        });
      }
    }
  });
}

// 스크롤에 의한 추가데이터 로드(loading... 템플릿 보이기/안보이기)
function showMoreVisibleBucketContent(data) {
  var target = $("#showMoreResults");
  if (target.length === 0) return;

  var elem = $(".mCSB_draggerContainer");
  if ( data.mcs.topPct > 85) { //스크롤이 아래 내려오는 위치의 비율로 추가 데이터 보여줌 결정
    Session.set('bucketContent itemsLimit', Session.get('bucketContent itemsLimit') + global.itemsIncrement);
    initialData(srchCondition, srchText, sortBy, categorySerchOp);
  }
}

function stateCounter(tap) {
  var selectedTapMenu = null;
  if(_.isEqual(tap,'my') || _.isEqual(tap,'')){
    selectedTapMenu = 'my';
  }
  Meteor.call('bucketGetStateCount', userId, selectedTapMenu, function(error, result){
    if(error){
      console.log('error : '+ error);
    }else{
      Session.set('bucketContent stateCounter',null);
      Session.set('bucketContent stateCounter',result);
    }
  });
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
Template[templateName].onDestroyed(function(){
  userId = null;
  srchCondition = '';
  srchText = '';
  sortBy = '';
  selectedMenu = '';
  categorySerchOp = '';
});

// bucketContentSort ================================================================================
Template.bucketContentSort.onRendered(function(){
  $('#sort').val('regDateDesc'); //초기설정
  var searchOption = Session.get('endingNoteList templateData');
  if(Session.get('bucketContent clickTabMenu')){
      $('#sort').val('regDateDesc');
  } else {
    if(searchOption.data && searchOption.data.searchOption && searchOption.data.searchOption.sortParam) {
      $('#sort').val(searchOption.data.searchOption.sortParam);
    }
  }

  $('#sort').on('change', function(e, t) {
    // e.preventDefault();
    srchCondition = $('#keywordCondition option:selected').val();
    srchText = $('#keywordText').val();
    sortBy = $('#sort option:selected').val();
    categorySerchOp = $('#categoryOption option:selected').val();

    initialData(srchCondition, srchText, sortBy, categorySerchOp);
  });

  global.fn_selectPicker('.selectpicker', null);
});
