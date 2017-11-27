import {global} from '/imports/global/global_things.js';

// 나는 > 리스트컨텐츠
var templateName = 'imContent';
var defaultData = [];
var userId = null;
var pageType = null;
var srchCondition = '';
var srchText = '';
var sortBy = '';
var selectedMenu = '';
var isPageOwner = false;
var inheritanceKey = null;

Template[templateName].onCreated(function(){
  var instance = this;
  instance.selectedMenu = new ReactiveVar('my');
  instance.isDropup = new ReactiveVar();
  instance.pageType = new ReactiveVar();
  Session.set('imContent clickTabMenu', false); //my/all 메뉴를 클릭했을때 항상 Sort값을 초기화 해주기 위한 구분자로 사용

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
  sortBy = 'startDateDesc'; //최초 my메뉴의 화면일때는 추억일 기준으로 정렬을 한다.s

  // Session.set('imContent friendsStatus', null);
  Session.set('imContent itemsLimit', global.itemsIncrement);

  if (instance.data) {
    if (instance.data.pageType === 'inheritance') {
      inheritanceKey = instance.data.inheritanceKey;
      pageType = instance.data.pageType;
      instance.pageType.set(instance.data.pageType);
    } else {
      if(instance.data.searchOption) {
        srchCondition = instance.data.searchOption.filter;
        srchText = instance.data.searchOption.searchText;
        sortBy = instance.data.searchOption.sortParam;
      }

      if(instance.data.selectedMenu) {
        selectedMenu = instance.data.selectedMenu;
      }
    }
  }
  // console.log('im content', instance);
  instance.autorun(function(){
    initialData(srchCondition,srchText,sortBy);
  });
  //상세에서 목록으로 올때 기존 메뉴(my/all)의 데이터를 검색
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
    }
  }


  //
  //   $("ul.nav-justified").on('click', function(e) {
  //     $('#sort').val('like');
  //     console.log('ul click', $('#sort option:selected').val());
  // });
  var targetElementLeft = $('.hr-scroll');

  // var scrollCallbackOptions = {
  //   whileScrolling: function() {
  //     return showMoreVisibleImContent(this);
  //   }
  // };
  // global.fn_customerScrollBarInit(targetElement, "dark", scrollCallbackOptions);

  // 에디터를 readonly 상태로 만들어 놓음

  var scrollCallbackOptions = {
    whileScrolling: function() {
      return showMoreVisibleImContent(this);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

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

    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderIm';
    templateData.contentTmp = 'imDetail';
    templateData.data = {
      _id : _id,
      selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
      searchOption : searchOptionParam
    };

    Session.set('endingNoteList templateData', templateData);
  },
  // 검색 이벤트
  "click #search": function(e, t) {
    e.preventDefault();

    //검색 리미트 재설정
    Session.set('imContent itemsLimit', global.itemsIncrement);

    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;
    sortBy = t.find('#sort').value;

    //데이터 검색
    initialData(srchCondition, srchText, sortBy);
  },
  // tab 이벤트
  "click #tabMe,#tabAll": function(e, t) {
    e.preventDefault();

    var target = e.currentTarget.getAttribute('value');
    if (target === 'my') {
      selectedMenu = 'my';
      sortBy = 'startDateDesc';
      t.selectedMenu.set('my');
    } else {
      selectedMenu = 'all';
      sortBy = 'regDateDesc';
      t.selectedMenu.set('all');
    }
    Session.set('imContent clickTabMenu', true);
    Session.set('imContent itemsLimit', global.itemsIncrement);

    //데이터 검색

    Session.set('imContent collection', null);
    setTimeout(function(){
      initialData(srchCondition, srchText, sortBy);
    }, 100);
  },
  //사용자 프로파일 클릭
  "click .dropdown-toggle" : function(e, t){
    var nameCardHeight = 370;// 네임카드의 높이
    if((nameCardHeight + $(e.currentTarget).offset().top) > window.innerHeight){
      t.isDropup.set(true);
    } else {
      t.isDropup.set(false);
    }
  },
  "click a[name='tagButton']" : function(e, t){
    e.preventDefault();
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderIm';
    templateData.contentTmp = 'imContent';
    var textVal = this.valueOf();
    if(textVal.indexOf("<strong>") !== -1 && textVal.indexOf("</strong>") !== -1){
      textVal = textVal.replace("<strong>","");
      textVal = textVal.replace("</strong>","");
    }
    templateData.data = {
      selectedMenu : 'all',
      searchOption :
      {
        filter:"tag",
        searchText:textVal,
        sortParam:"startDateDesc",
      }
    };
    Session.set('endingNoteList templateData', null);
    setTimeout(function(){
      Session.set('endingNoteList templateData', templateData);
    }, 100);
  },
});

Template[templateName].helpers({
  hpListData: function(){
    return Session.get('imContent collection');
  },
  hpMoreResults: function(){
    if(!Session.get('imContent collection') || _.isUndefined(Session.get('imContent collection'))){
      return false;
    }
    else {
      // return (Session.get('imContent collection').data.length >= Session.get('imContent itemsLimit'));
      return (Session.get('imContent collection').data.length !== Session.get('imContent collection').count);
    }
  },
  hpMemoryDate: function (startDate) {
    return global.utilGetDate(startDate).defaultYMD;
  },
  // hpFriendStatus: function() {
  //   return Session.get('imContent friendsStatus');
  // },
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
  // 모두 추억 가리기
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
function initialData(searchCondition, searchText, sortByparam){
  Meteor.call('storyGetList', userId, isPageOwner, global.pageType.im, Session.get('imContent itemsLimit'),
  searchCondition, searchText, sortByparam,  selectedMenu, function(error, result){
    if(error){
      console.log('error : ' + error);
    }
    else {
      // console.log('result', result);
      // Session.set('imContent collection', null);
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
                    if (item.type === 'IM' || item.type === 'BS') {
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
                  Session.set('imContent collection', inheritanceData);
                }
              });
            } else {
              Session.set('imContent collection', resultData);
            }
          }
        });
      }
    }
  });
}

// 스크롤에 의한 추가데이터 로드(loading... 템플릿 보이기/안보이기)
function showMoreVisibleImContent(data) {
  var target = $("#showMoreResults");
  if (target.length === 0) return;

  if ( data.mcs.topPct > 85) { //스크롤이 아래 내려오는 위치의 비율로 추가 데이터 보여줌 결정
    Session.set('imContent itemsLimit', Session.get('imContent itemsLimit') + global.itemsIncrement);
    initialData(srchCondition, srchText, sortBy);
  }
}


Template[templateName].onDestroyed(function(){
  Session.set('imContent clickTabMenu', false);
});


// imContentSort ================================================================================
Template.imContentSort.onRendered(function(){

  $('#sort').val('startDateDesc'); //초기설정
  var searchOption = Session.get('endingNoteList templateData');
  if(Session.get('imContent clickTabMenu')){
    if(_.isEqual(this.data.type, 'my')) {
      $('#sort').val('startDateDesc');
    } else {
      $('#sort').val('regDateDesc');
    }
  } else {
    if(searchOption.data && searchOption.data.searchOption && searchOption.data.searchOption.sortParam) {
      $('#sort').val(searchOption.data.searchOption.sortParam);
    }
  }

  $('#sort').on('change', function(e, t) {
    //e.preventDefault();
    // console.log('sort');
    sortBy = $('#sort option:selected').val();
    initialData(srchCondition, srchText, sortBy);
  });

  global.fn_selectPicker('.selectpicker', null);
});
