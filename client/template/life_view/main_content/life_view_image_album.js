import {global} from '/imports/global/global_things.js';

// 라이프뷰 사진앨범으로 보기
var templateName = 'lifeViewImageAlbum';
var userId = null;
var isPageOwner = false;
var srchCondition = ''; //검색조건
var srchText = ''; //검색어
var sortBy = null; //정렬기준
var sortable = true;
var isShowLocks = null;

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

  Session.set('lifeViewImageAlbum images', null);
  Session.set('lifeViewImageAlbum isChanged', false);

  //초기 데이터 설정
  var instance = this;
  instance.userId = new ReactiveVar();
  instance.showAddButton = new ReactiveVar(false);
  instance.selectedExImage = null;
  instance.autorun(function(){
    isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
    if (isPageOwner) {
      isShowLocks = true;
      userId = global.login.userId;
    } else {
      isShowLocks = false; //비공개 선택(초기설정 : false)
      userId = global.login.pageOwner;
    }

    instance.userId.set(userId);
    initialData(srchCondition, srchText, sortBy, isShowLocks);
  });
});

function initialData(_srchCondition, _srchText, _sortBy, _showLock){
  //사용자, 비공개허용, limit, 검색조건(태그, 등등), 검색어, 정렬기준(_userId, _showLock, _limit, _searchCondition, _searchText, _sortBy)
  Meteor.call('getAllImages', userId, isPageOwner, _showLock, 100, _srchCondition, _srchText, _sortBy, function(error, result){
    if(error){
      return console.log(error);
    } else {
      // console.log('result', result);
      Session.set('lifeViewImageAlbum images', result);
      Session.set('lifeViewImageAlbum isChanged', true);
      // instance.images.set(result);
    }
  });
}

Template[templateName].onRendered(function(){

  if(isPageOwner){
    $('#chkShowLocks').attr("checked", true);
  } else {
    $('#chkShowLocks').attr("checked", false);
    $('#chkShowLocks').attr("disabled", true);
  }

  $.getScript('lib/js/jquery-sortable-photos.js', function(){
        // script should be loaded and do something with it.
  });
  // // 스크롤 페이징 구현
  // var targetElementLeft = $('.hl-scroll');
  // var scrollCallbackOptions = {
  //   // onTotalScroll: function() {
  //   //   return showMoreBottomVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
  //   // },
  //   // onTotalScrollBack: function() {
  //   //   return showMoreTopVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
  //   // },
  //   onInit:function(){
  //     return global.fn_setTop(targetElementLeft);
  //   }
  //   // // whileScrolling: function() {
  //   // //   return showMoreTopVisibleTimeline(this);
  //   // // }
  // };
  //
  // global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);



});

Template[templateName].events({
  "click [name=lifeViewImg]": function(e, t){
    e.preventDefault();
    if(e.target.name === 'btnExcludeImg'){
      return;
    }
    var templateData = {};
    // console.log(e.currentTarget.name);
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


    Session.set('endingNoteList templateData', null);
    setTimeout(function(){
      Session.set('endingNoteList templateData', templateData);
    }, 100);

  },
  "click #searchAlbum": function(e, t) {
    e.preventDefault();
    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;
    sortBy = t.find('#imgAlbumSort').value;
    if(srchText){
      sortable = false;
      t.$('#customSave').css('pointer-events','none');
    } else {
      sortable = true;
      t.$('#customSave').css('pointer-events','');
    }
    //데이터 검색
    initialData(srchCondition, srchText, sortBy, isShowLocks);
  },
  "click #chkShowLocks": function(){
    isShowLocks = $("#chkShowLocks").is(":checked");
    initialData(srchCondition, srchText, sortBy, isShowLocks);
  },
  // "click #customSave": function(e, t){
  //   e.preventDefault();
  //
  //   var images = t.$('a.my-item');
  //
  //   global.utilConfirm('지정한 순서로 이미지를 저장하시겠습니까?\n지정한 이미지순서는 사용자정의 정렬에서 사용할 수 있습니다.').then(function(val) {
  //     if (val) {
  //       if(images){
  //         _.each(images, function(info, i){
  //           // var order = convertToNumberingScheme(i+1);
  //           var order = i+1;
  //           var imageData = {
  //             postId : $(info).attr('postId'),
  //             path : $(info).attr('path'),
  //             order : order,
  //             typeData : $(info).attr('typeData')
  //           };
  //
  //           // DB데이터 업데이트
  //           Meteor.call('setImageOrder', imageData, function(error, result){
  //             if(error){
  //               return console.log(error);
  //             } else {
  //               swal({
  //                 title: '사용자정의순 저장',
  //                 text: '저장되었습니다.',
  //                 type: 'success',
  //                 confirmButtonText: '저장',
  //               });
  //             }
  //           });
  //         });
  //       }
  //       // } //END IF
  //     }
  //   }).catch(swal.noop);
  //
  //   //
  //   // swal({
  //   //   title: '사용자정의순 저장',
  //   //   text: '지정한 순서로 이미지를 저장하시겠습니까?\n지정한 이미지순서는 사용자정의 정렬에서 사용할 수 있습니다.',
  //   //   type: 'question',
  //   //   showCancelButton: true,
  //   //   confirmButtonColor: '#3085d6',
  //   //   cancelButtonColor: '#d33',
  //   //   confirmButtonText: '저장',
  //   //   cancelButtonText: '취소',
  //   //   confirmButtonClass: 'btn btn-success',
  //   //   cancelButtonClass: 'btn btn-danger',
  //   //   // buttonsStyling: false
  //   // }).then(function () {
  //   //
  //   // }, function (dismiss) {
  //   //   // dismiss can be 'cancel', 'overlay',
  //   //   // 'close', and 'timer'
  //   //   if (dismiss === 'cancel') {
  //   //     swal({
  //   //       title: '사용자정의순 저장',
  //   //       text: '저장되었습니다.',
  //   //       type: 'success',
  //   //       confirmButtonText: '저장',
  //   //     });
  //   //   }
  //   // });
  //   // // var images = $(t).find('a.my-item');
  //
  //
  // },
  // "mouseleave .over.album": function(e,t){
  //   var slideTarget = $('.hideTarget');
  //
  //   if(slideTarget.hasClass("on")){
  //     slideTarget.removeClass("on");
  //     $('.over').animate({"top": '+=50'});
  //     slideTarget.slideToggle( 400, function() {});
  //   }
  // },
  "click [name=imgCount]": function(e, t){
    var slideTarget = $('.hideTarget');

    if(slideTarget.hasClass("on")){
      slideTarget.removeClass("on");
      $('.over').animate({"top": '+=50'});
      t.showAddButton.set(false);
    }else{
      slideTarget.addClass("on");
      $('.over').animate({"top": '-=50'});
      t.showAddButton.set(true);
    }

    slideTarget.slideToggle( 400, function() {});
  },
  // //상속인 사진에 마우스올렸을때
  // "mouseenter [name=lifeViewImg]": function(e, t){
  //   e.preventDefault();
  //   var target = $(e.currentTarget).find('.gallery-btnExclude');
  //   // var target2 = $(e.currentTarget).find('.gallery-infomation');
  //
  //   target.show();
  //   // target2.show();
  // },
  // "mouseleave [name=lifeViewImg]": function(e, t){
  //   e.preventDefault();
  //   var target = $(e.currentTarget).find('.gallery-btnExclude');
  //   // var target2 = $(e.currentTarget).find('.gallery-infomation');
  //   // var _target = $(e.currentTarget).parents('.thumbnail').find('.thumb-over');
  //   target.hide();
  //   // target2.hide();
  // },
  // "click [name=btnExcludeImg]": function(e, t){
  //   e.preventDefault();
  //   var imageData = {
  //     postId : this.postId,
  //     path : this.path,
  //     isExclude : true,
  //     typeData : this.type,
  //   };
  //
  //   global.utilConfirm('이미지를 제외하시겠습니까?\n제외된 이미지는 아래 슬라이더에서 확인/적용 할 수 있습니다.').then(function(val) {
  //     if (val) {
  //       Meteor.call('setImageInExclusion', imageData, function(error, result){
  //         if(error){
  //           return console.log('error');
  //         } else {
  //           initialData(srchCondition, srchText, sortBy, isShowLocks);
  //         }
  //       });
  //     }
  //   }).catch(swal.noop);
  // },
  //슬라이드 뷰 이미지 선택 이벤트
  "click .image": function(e,t){
    e.preventDefault();

    $(e.target).parent().siblings().removeClass('active');
    $(e.target).parent().addClass('active');

    var imageData = {
      postId : this.postId,
      path : this.path,
      isExclude : false, //포함시키기
      typeData : this.type,
    };

     t.selectedExImage = imageData;

     var templateData = {};
     // console.log(e.currentTarget.name);
     //상셰영역에 템플릿 확인

     switch(this.type) {
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


     Session.set('endingNoteList templateData', null);
     setTimeout(function(){
       Session.set('endingNoteList templateData', templateData);
     }, 100);
  },
  //이미지 추가시키기
  "click [name=addAlbumImg]": function(e, t){
    e.preventDefault();

    if(t.selectedExImage){
      var imageData = t.selectedExImage;
      global.utilConfirm('이미지를 추가하시겠습니까?').then(function(val) {
        if (val) {
          Meteor.call('setImageInExclusion', imageData, function(error, result){
            if(error){
              return console.log('error');
            } else {
              t.showAddButton.set(false);
              t.selectedExImage = null;
              initialData(srchCondition, srchText, sortBy, isShowLocks);
            }
          });
        }
      }).catch(swal.noop);
    } else {
      global.utilAlert('선택된 이미지가 없습니다.');
    }

  }
});

Template[templateName].helpers({
  hpImages: function(){
    return Session.get('lifeViewImageAlbum images');
    // return Template.instance().images.get();
  },
  hpIsChanged: function(){
    return Session.get('lifeViewImageAlbum isChanged');
  },
  hpShowAddButton: function(){
    return Template.instance().showAddButton.get();
  }
});

Template[templateName].onDestroyed(function(){
  Session.set('endingNoteList templateData', null);
  Session.set('lifeViewImageAlbum images', null);
});


Template.imageAlbum.onCreated(function(){
  var instance = this;
  instance.content = new ReactiveVar();
  Session.set('lifeViewImageAlbum isChanged', false);
});

Template.imageAlbum.onRendered(function(){
  // 스크롤 페이징 구현
  var targetElementLeft = $('.hl-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

   var self = this;
  $('.gallery').sortablePhotos({
    selector: '> .my-item',
    sortable: false,
    // sortable: sortable && isPageOwner ? true : false,
    padding: 2,
    beforeArrange: function (event, data) {
      // console.log('beforeArrange',event,data);
    },
    afterDrop: function (event, data) {
      // var postId = $(event.target).find('.ui-draggable-dragging').attr('postId');
      // var path = $(event.target).find('.ui-draggable-dragging').attr('path');
      // var order = $(event.target).find('.ui-draggable-dragging').attr('order');

      // var images = $(event.target).find('a.my-item');
      // _.each(images, function(info){
      //   console.log($(info).attr('postId'));
      // });

      // if(!_.isEqual(order, 'ZZZZ')){
      // orderText정보 생성 : 바로 위에 있는 이미지의 order정보를 확인해서 ''상위order + 타깃order'로 생성
      // } else { //한번도 이동하지 않았으면 order정보를 전체 정보에 갱신한다.
    }
  });





  _.each(this.data.imageData, function(imageInfo){
    var content = '<h4 class="media-heading subject-title">\
    <a href="" class="ellipsis" id="title">'+imageInfo.title+'</a>\
    <small class="text-right">'+imageInfo.startDate+'</small>\
    </h4>\
    <div class="group-box" role="group" aria-label="...">\
    <span class="group-xs"><i class="imsr-icon icon-me0045 red heart " aria-hidden="true"></i>'+imageInfo.likeCnt+'</span>\
    <span class="group-xs"><i class="imsr-icon icon-me0023 red"  aria-hidden="true"></i>'+imageInfo.commentCnt+'</span>\
    <span class="group-xs"><i class="imsr-icon icon-me0024 red"  aria-hidden="true"></i>'+imageInfo.hitCnt+'</span>\
    </div>';

    $('[path="'+imageInfo.path+'"]').popover({
      trigger : 'hover',
      placement: 'auto bottom',
      content: content,
      html: true
    });
  });

});



// imageAlbumSortSort ================================================================================
Template.imageAlbumSort.onRendered(function(){
  if(_.isEqual(this.data.type, 'owner')) {
    $('#imgAlbumSort').val('startDateDesc');
  } else {
    $('#imgAlbumSort').val('custom');
  }

  $('#imgAlbumSort').on('change', function(e, t) {
    //e.preventDefault();
    // console.log('sort');
    sortBy = $('#imgAlbumSort option:selected').val();
    // sortable = true;
    initialData(srchCondition, srchText, sortBy, isShowLocks);
  });

  global.fn_selectPicker('.selectpicker.imgAlbum', null);
});

convertToNumberingScheme = function(number) {
  var baseChar = ("A").charCodeAt(0),
  letters  = "";
  do {
    number -= 1;
    letters = String.fromCharCode(baseChar + (number % 26)) + letters;
    number = (number / 26) >> 0; // quick `floor`
  } while(number > 0);

  return letters;
};

//  imageAlbumSliderView ==================================================================================
// Template.imageAlbumSliderView.onRendered(function(){
//   $('#imageAlbumSlider').slick({
//     // centerMode:true,
//     // initialSlide : 0,
//     infinite: false,
//     slidesToShow: 7,
//     slidesToScroll: 1,
//     variableWidth: true,
//     draggable: false
//   });
//
//   $('#lifeviewSlider .slick-slide').removeClass('active');
//   $('.hideTarget').hide(); //초기에 타겟을 숨김;
// });
//
// Template.imageAlbumSliderView.events({
//   "click .slick-prev": function(e, t){
//     var selectedImageIndex = $('#lifeviewSlider .slick-slide.slick-active.active').attr('index');
//     $('#lifeviewSlider .slick-slide').removeClass('active');
//     if(selectedImageIndex){
//       $('#lifeviewSlider .slick-slide.slick-active[index='+selectedImageIndex+']').addClass('active');
//     }
//
//   },
//   "click .slick-next": function(e, t){
//     var selectedImageIndex = $('#lifeviewSlider .slick-slide.slick-active.active').attr('index');
//     $('#lifeviewSlider .slick-slide').removeClass('active');
//     if(selectedImageIndex){
//       $('#lifeviewSlider .slick-slide.slick-active[index='+selectedImageIndex+']').addClass('active');
//     }
//   }
// });

Template.registerHelper('hpIsPageOwner', function() {
  return isPageOwner;
});
