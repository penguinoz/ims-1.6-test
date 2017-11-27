import {global} from '/imports/global/global_things.js';

var templateName = 'image_album_sortable';
// //
// // Template[templateName].onCreated(function(){
// //   isPageOwner = false;
// //   isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
// //   if (isPageOwner) {
// //     userId = global.login.userId;
// //   } else {
// //     userId = global.login.pageOwner;
// //   }
// //
// //   var instance = this;
// //   instance.images = new ReactiveVar();
// //
// //   Meteor.call('getAllImages', userId, true, 100, 'all', '', 'all', function(error, result){
// //     if(error){
// //       return console.log(error);
// //     } else {
// //       if(result){
// //         instance.images.set(result);
// //       } else {
// //         var images = [];
// //         var image = {
// //           _id : '',
// //           path : '',
// //           lat : '',
// //           lng : ''
// //         };
// //
// //         images.push(images);
// //         instance.images.set(result);
// //       }
// //     }
// //   });
// // });
// //
// // Template[templateName].helpers({
// //   imageData: function(){
// //     return Template.instance().images.get();
// //   }
// // });
// //
// // Template[templateName].onRendered(function(){
// //   $('.my-container').sortablePhotos({
// //   selector: '> .my-item',
// //   sortable: true,
// //   padding: 2
// // });
// //   // $(function () {
// //   //   var placeholders = [
// //   //     'http://lorempixel.com/%w/%h/',
// //   //     'http://placeimg.com/%w/%h/any',
// //   //     'http://placehold.it/%wx%h'
// //   //   ];
// //   //   var activePlaceholder = 0;
// //   //
// //   //   // Renders the grid with random images.
// //   //   function renderImages() {
// //   //     var gridSize = $('.buttons-option-size').find('.active').attr('data-value');
// //   //     var gridPadding = $('.buttons-option-padding').find('.active').attr('data-value');
// //   //     var sortable = ($('.buttons-option-sortable').find('.active').attr('data-value') === '1');
// //   //     var baseSize = (gridSize == 'small' ? 150 : 500);
// //   //     var count = (gridSize == 'small' ? 30 : 15);
// //   //
// //   //     // Unload widget, clear content.
// //   //     try {
// //   //       // Later versions of jQuery UI throw error if
// //   //       // the widget is not yet initialized.
// //   //       $('.photo-grid-container').sortablePhotos('destroy');
// //   //     } catch (exception) {}
// //   //
// //   //     $('.photo-grid-container').empty();
// //   //
// //   //     // Generate random-sized images.
// //   //     for (var i = 0; i < count; i++) {
// //   //       var w = baseSize + 50 * Math.round(5 * Math.random());
// //   //       var h = baseSize + 50 * Math.round(5 * Math.random());
// //   //       var url = placeholders[activePlaceholder];
// //   //
// //   //       url = url.replace('%w', w);
// //   //       url = url.replace('%h', h);
// //   //
// //   //       $('.photo-grid-container').append('<div class="photo-grid-item"><img width="' + w + '" height="' + h + '" src="' + url + '"></div>');
// //   //     }
// //   //
// //   //     // Initialize jQuery Sortable Photos.
// //   //     $('.photo-grid-container').sortablePhotos({
// //   //       selector: '> .photo-grid-item',
// //   //       sortable: sortable,
// //   //       padding: gridPadding,
// //   //       beforeArrange: function (event, data) {
// //   //       },
// //   //       afterDrop: function (event, data) {
// //   //       }
// //   //     });
// //   //
// //   //     // Check for image loading error and switch placeholder service.
// //   //     $('.photo-grid-container img').first().error(function () {
// //   //       if (activePlaceholder < (placeholders.length - 1)) {
// //   //         activePlaceholder++;
// //   //         renderImages();
// //   //       }
// //   //     });
// //   //
// //   //   }
// //   //
// //   //   // Click handler for the buttons.
// //   //   $('.buttons-option button').click(function () {
// //   //     $(this).parent().find('button').removeClass('active');
// //   //     $(this).addClass('active');
// //   //
// //   //     renderImages();
// //   //   });
// //   //
// //   //   renderImages();
// //   // });
// // });
//
// // 라이프뷰 사진앨범으로 보기
// var templateName = 'lifeViewImageAlbum';
var userId = null;
var isPageOwner = false;

Template[templateName].onCreated(function(){
  isPageOwner = false;
  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    userId = global.login.userId;
  } else {
    userId = global.login.pageOwner;
  }

  var instance = this;
  instance.images = new ReactiveVar();

  Meteor.call('getAllImages', userId, true, 100, 'all', '', 'all', function(error, result){
    if(error){
      return console.log(error);
    } else {
      if(result){
        instance.images.set(result);
      } else {
        var images = [];
        var image = {
          _id : '',
          path : '',
          lat : '',
          lng : ''
        };

        images.push(images);
        instance.images.set(result);
      }
    }
  });
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hl-scroll');

  // 스크롤 페이징 구현
  var scrollCallbackOptions = {
    // onTotalScroll: function() {
    //   return showMoreBottomVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
    // },
    // onTotalScrollBack: function() {
    //   return showMoreTopVisibleTimeline(this); //실제 내용이증가하는 timelineMain 템플릿쪽 함수를 호출하게 함
    // },
    onInit:function(){
      return global.fn_setTop(targetElementLeft);
    }
    // // whileScrolling: function() {
    // //   return showMoreTopVisibleTimeline(this);
    // // }
  };
  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

});

Template[templateName].helpers({
  hpImages: function(){
    return Template.instance().images.get();
  }
});
Template[templateName].onDestroyed(function(){
  Session.set('endingNoteList templateData', null);
});

Template.imageSortableAlbum.events({
  "click a": function(e, t){
    e.preventDefault();

    console.log(e, t);
  }
});


Template.imageSortableAlbum.onRendered(function(){
  $('.my-container').sortablePhotos({
    selector: '> .my-item',
    sortable: true,
    padding: 2,
    beforeArrange: function (event, data) {
      console.log('beforeArrange',event,data);
    },
    afterDrop: function (event, data) {
      console.log('postId',$(event.target).find('.ui-draggable-dragging').attr('postId'));
      console.log('path',$(event.target).find('.ui-draggable-dragging').attr('path'));
    }
  });
});

Template.registerHelper("g_imageSize", function(baseSize){
  return baseSize + 50 * Math.round(5 * Math.random());
});
