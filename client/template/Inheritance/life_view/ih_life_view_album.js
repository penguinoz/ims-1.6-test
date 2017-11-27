import {global} from '/imports/global/global_things.js';
var templateName = 'ihLifeViewAlum';

var instance;
Template[templateName].onCreated(function(){
  // console.log('this', this);
  instance = this;
  this.postId = null;
  this.images = new ReactiveVar();
  this.searchCondition = '';
  this.searchText = '';
  this.lock = true;
  this.sort = 'regDateDesc';
  Session.set('ihLifeView templateData', null);

  Meteor.call('getInheritanceById', this.data._id, function(error, result) {
    if (!error) {
      var postId = [];
      if (instance.data.isNote === 'card') {
        postId = result.contents.map(function(item) {
          return item.contentId;
        });
      } else {
        postId = result.instContents.map(function(item) {
          return item.contentId;
        });
      }
      instance.postId = postId;
      initData(postId, instance.lock, 100, '', '');
    }
  });
});

Template[templateName].onRendered(function(){
    $('#imgAlbumSort').val('startDateDesc');
    $('#imgAlbumSort').on('change', function(e, t) {
      var sortBy = $('#imgAlbumSort option:selected').val();
      Template.instance().sort = sortBy;
      initData(instance.postId, instance.lock, 100, instance.searchCondition, instance.searchText, sortBy);
    });

    // 스크롤 페이징 구현
    var targetElementLeft = $('.hl-scroll');
    var scrollCallbackOptions = {
      onUpdate: function(){
        $('.mCSB_container').css({"height":""});
      }
    };

    global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

    global.fn_selectPicker('.selectpicker.imgAlbum', null);
});

Template[templateName].onDestroyed(function(){
  Session.set('ihLifeView templateData', null);
});

Template[templateName].events({
  // 비공개글 체크박스
  'change #chkShowLocks': function(e, t) {
    e.preventDefault();

    initData(t.postId, e.target.checked, 100, '', '', t.sort);
  },
  // 검색
  'click #searchAlbum': function(e, t) {
    e.preventDefault();

    var condition = t.find('#keywordCondition').value;
    var text = t.find('#keywordText').value;
    t.searchCondition = condition;
    t.searchText = text;
    initData(t.postId, instance.lock, 100, condition, text, t.sort);
  },
  // // 정렬
  // 'change #imgAlbumSort': function(e, t) {
  //   e.preventDefault();
  //
  //   var sort = t.find('#imgAlbumSort').value;
  //   t.sort = sort;
  //   initData(t.postId, instance.lock, 100, t.searchCondition, t.searchText, sort);
  // },
  // 상세보기
  'click [name=lifeViewImg]': function(e, t) {
    if(e.target.name === 'btnExcludeImg'){
      return;
    }
    var templateData = {};
    //상셰영역에 템플릿 확인

    switch($(e.currentTarget).attr('typeData')) {
      // 나
      case 'IM':
      templateData.contentTmp = 'imDetail';
      templateData.data = {
        _id : this.postId
      };
      break;
      // 버킷
      case 'BL':
      templateData.contentTmp = 'bucketDetail';
      templateData.data = {
        _id : this.postId
      };
      break;

      // 버키스토리
      case 'BS':
      templateData.contentTmp = 'bucketDetail';
      templateData.data = {
        _id : this.parentPostId,
        subId : this.postId
      };
      break;

      //타임캡슐
      case 'TC':
      templateData.contentTmp = 'timeCapsuleDetail';
      templateData.data = {
        _id : this.postId
      };
      break;
    }
    // templateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)

    templateData.data.parentViewId = 'inheritanceContents';
    Session.set('ihLifeView templateData', null);
    setTimeout(function(){
      Session.set('ihLifeView templateData', templateData);
    }, 100);
  }
});

Template[templateName].helpers({
  hpImages: function() {
    return Template.instance().images.get();
  }
});

function initData(_postId, _showLock, _limit, _searchCondition, _searchText, _sortBy) {
  Meteor.call('getAllIhImages', _postId, _showLock, _limit, _searchCondition, _searchText, _sortBy, function(error, result) {
    if (!error) {
      instance.images.set(result);
    }
  });
}