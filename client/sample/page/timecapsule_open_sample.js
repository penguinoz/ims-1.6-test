var templateName= 'timecapsule_open_sample';

Template[templateName].onRendered(function(){
  $('.overlay-image').eraser({
    progressFunction: function(p) {
      if(p > 0.2){
        $('.overlay-image').delay(100).fadeOut(3000);
        $('.overlay-image2').delay(100).fadeOut(3000);
      }
    }
  });
});
