import {global} from '/imports/global/global_things.js';

// 라이프뷰 우측 리스트 화면
var templateName = 'lifeViewDetailAlbum';
var userId = null;
var isPageOwner = false;
var srchCondition = ''; //검색조건
var srchText = ''; //검색어
var sortBy = null; //정렬기준
var sortable = true;
var isShowLocks = null;
var instance;

Template[templateName].onCreated(function(){
  isPageOwner = false;
  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    isShowLocks = true;
    userId = global.login.userId;
  } else {
    isShowLocks = false; //비공개 선택(초기설정 : false)
    userId = global.login.pageOwner;
  }

  srchCondition = ''; //검색조건
  srchText = ''; //검색어
  sortBy = isPageOwner ? 'startDateDesc' : 'custom'; //정렬기준
  sortable = true;


  Session.set('lifeViewDetailListAlbum images', null);
  Session.set('lifeViewDetailListAlbum changeSearchOption', false);
  // var instance = this;
  // instance.images = new ReactiveVar();


  //초기 데이터 설정
  instance = this;
  Tracker.autorun(function(){

    var imageDatas = {images : instance.data, imagesCount : instance.data.length};
    Session.set('lifeViewDetailListAlbum images', imageDatas);
    Session.set('lifeViewDetailListAlbum changeSearchOption', true);
  });
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hl-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

  // 스크롤 페이징 구현
  var scrollCallbackOptions = {
    onInit:function(){
      return global.fn_setTop(targetElementLeft);
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].events({
  "click [name=lifeViewImg]": function(e, t){
    e.preventDefault();

    if(e.target.name === 'btnDeleteLocation'){
      return;
    }

    var templateData = {};

    switch($(e.currentTarget).attr('typeData')) {
      // 나
      case 'IM':
      templateData.contentTmp = 'imDetail';
      templateData.data = {
        _id : this.postId,
      };
      templateData.data.lifeViewDataList = t.data;
      // 버킷
      break;
      case 'BL':
      templateData.contentTmp = 'bucketDetail';
      templateData.data = {
        _id : this.postId,
      };
      templateData.data.lifeViewDataList = t.data;
      break;

      // 버키스토리
      case 'BS':
      templateData.contentTmp = 'bucketDetail';
      templateData.data = {
        _id : this.parentPostId,
        subId : this.postId,
      };
      templateData.data.lifeViewDataList = t.data;
      break;

      //타임캡슐
      case 'TC':
      templateData.contentTmp = 'timeCapsuleDetail';
      templateData.data = {
        _id : this.postId,
      };
      templateData.data.lifeViewDataList = t.data;
      break;
    }
    // templateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)


    Session.set('endingNoteList templateData', null);
    setTimeout(function(){
      templateData.data.fromView = "lifeViewDetailAlbum";
      Session.set('endingNoteList templateData', templateData);
    }, 100);

  },
  "mouseenter [name=lifeViewImg]": function(e, t){
    e.preventDefault();
    var _target = $(e.currentTarget).find('.gallery-btnExclude');
    _target.show();
  },
  //상속인 카드에서 마우스 뻈을때
  "mouseleave [name=lifeViewImg]": function(e, t){
    e.preventDefault();
    var _target = $(e.currentTarget).find('.gallery-btnExclude');
    // var _target = $(e.currentTarget).parents('.thumbnail').find('.thumb-over');
    _target.hide();
  },
  // "click #searchAlbum": function(e, t) {
  //   e.preventDefault();
  //   console.log('search2');
  //   //검색 조건 설정
  //   srchCondition = t.find('#keywordCondition').value;
  //   srchText = t.find('#keywordText').value;
  //   sortBy = t.find('#imgAlbumSort').value;
  //   if(srchText){
  //     sortable = false;
  //     // t.$('#customSave').css('pointer-events','none');
  //   } else {
  //     sortable = true;
  //     // t.$('#customSave').css('pointer-events','');
  //   }
  //   //데이터 검색
  //   initialData(srchCondition, srchText, sortBy, isShowLocks);
  // },
  // "click [name=imgCount]": function(){
  //   var slideTarget = $('.hideTarget');
  //
  //   if(slideTarget.hasClass("on")){
  //     slideTarget.removeClass("on");
  //     $('.hideSelector').animate({"margin-top": '+=30'});
  //   }else{
  //     slideTarget.addClass("on");
  //     $('.hideSelector').animate({"margin-top": '-=30'});
  //   }
  //
  //   slideTarget.slideToggle( 400, function() {});
  // }
});

Template[templateName].helpers({
  hpImages: function(){
    return Session.get('lifeViewDetailListAlbum images');
    // return Template.instance().images.get();
  },
  hpIsChangedSort: function(){
    return Session.get('lifeViewDetailListAlbum changeSearchOption');
  }
});

Template[templateName].onDestroyed(function(){
  Session.set('endingNoteList templateData', null);
  Session.set('lifeViewDetailListAlbum images', null);
});



Template.imageAlbumForMap.events({
  "click [name=btnDeleteLocation]": function(e, t){
    e.preventDefault();
    var imageData = {
      postId : this.postId,
      type : this.type,
      image:{
        path:this.path,
        lng:"",
        lat:""
      }
    };

    var requestData = _.reject(t.data.imageData, function(info){
      return _.isEqual(_.findWhere(t.data.imageData, {path:imageData.image.path}), info);
    });

    global.utilConfirm('위치정보를 삭제하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('saveImageLocation', imageData, function(error, result){
          if(error){
            return console.log('error');
          } else {
            var mainTemplateData = {};
            var dtailTemplateData = {};
            mainTemplateData.contentTmp = 'lifeViewImageMap';
            dtailTemplateData.contentTmp = 'lifeViewDetailAlbum';
            dtailTemplateData.data = requestData;
            Session.set('lifeViewMain templateData', null);
            Session.set('endingNoteList templateData', null);
            setTimeout(function(){
              Session.set('lifeViewMain templateData', mainTemplateData);
              Session.set('endingNoteList templateData', dtailTemplateData);
            }, 100);
          }
        });
      }
    }).catch(swal.noop);
  }
});
Template.imageAlbumForMap.onRendered(function(){
  $('.gallery').sortablePhotos({
    selector: '> .my-item',
    // sortable: _.isEqual(sortBy, 'custom') && sortable && isPageOwner ? true : false,
    sortable: sortable && isPageOwner ? true : false,
    padding: 2,
    beforeArrange: function (event, data) {
    },
    afterDrop: function (event, data) {
    }
  });
});

Template.imageAlbumSortForMap.onCreated(function(){
  var instance = this;
  instance.content = new ReactiveVar();
  Session.set('lifeViewDetailListAlbum changeSearchOption', false);
});
