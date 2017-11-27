// 라이프뷰 사진앨범으로 보기
var templateName = 'image_album';

Template[templateName].onCreated(function(){
});


Template[templateName].helpers({
});


Template[templateName].onRendered(function(){
    $('#gallery').justifiedGallery({
    // option: default,
    rowHeight: 100,
    // maxRowHeight: 100,
    // lastRow: 'nojustify',
    // fixedHeight: true,
    // captions: true,
    // margins: 1,
    // randomize: false,
    // extension: /.[^.]+$/,
    // refreshTime: 250,
    // waitThumbnailsLoad: true,
    // // justifyThreshold: 0.35,
    // cssAnimation: false,
    // imagesAnimationDuration: 300
  }).on('jg.complete', function (e) {
    // this callback runs after the gallery layout is created
    // $( '.swipebox' ).swipebox();
    // $(this).find('a').colorbox({
    //     maxWidth : '80%',
    //     maxHeight : '80%',
    //     opacity : 0.8,
    //     transition : 'elastic',
    //     // current : '',
    //     closeButton: true,
    // });
  }).on('jg.resize', function (e) {
    // this callback runs after the gallery is resized
  }).on('jq.rowflush', function (e) {
    // this callback runs when a new row is ready
  });

  // $( '.swipebox' ).swipebox( {
	// 	useCSS : true, // false will force the use of jQuery for animations
	// 	useSVG : true, // false to force the use of png for buttons
	// 	initialIndexOnArray : 0, // which image index to init when a array is passed
	// 	hideCloseButtonOnMobile : false, // true will hide the close button on mobile devices
	// 	removeBarsOnMobile : true, // false will show top bar on mobile devices
	// 	hideBarsDelay : 3000, // delay before hiding bars on desktop
	// 	videoMaxWidth : 1140, // videos max width
	// 	beforeOpen: function() {}, // called before opening
	// 	afterOpen: null, // called after opening
	// 	afterClose: function() {}, // called after closing
	// 	loopAtEnd: false // true will return to the first image after the last image is reached
	// } );


  $('a').colorbox({
          maxWidth : '80%',
          maxHeight : '80%',
          // opacity : 0.8,
          transition : 'elastic',
          current : ''
      });

  // $('#gallery').justifiedGallery({
  //     lastRow : 'nojustify',
  //     rowHeight : 100,
  //     rel : 'gallery1', //replace with 'gallery1' the rel attribute of each link
  //     margins : 1
  // }).on('jg.complete', function () {
  //     $(this).find('a').colorbox({
  //         maxWidth : '80%',
  //         maxHeight : '80%',
  //         opacity : 0.8,
  //         transition : 'elastic',
  //         current : ''
  //     });
  // });
});