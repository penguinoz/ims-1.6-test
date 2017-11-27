import {global} from '/imports/global/global_things.js';
var templateName ='map_overay';
Template.map_overay.onCreated(function(){

});



Template.map_overay.onRendered(function(){
  var mapOptions = {
    zoom: global.mapDefault.zoom,
    center: new google.maps.LatLng(global.mapDefault.lat, global.mapDefault.lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var geocoder = new google.maps.Geocoder();
  var infowindow = new google.maps.InfoWindow();

  map = new google.maps.Map(document.getElementById('map-canvas-custom'), mapOptions);
});


Template.map_overay.events({
  "click #hideSlider": function(){
    var slideTarget = $('.sliderview');

    if(slideTarget.hasClass("on")){
      slideTarget.removeClass("on");
      $('#hideSlider').animate({"margin-top": '-=30'});
      // $('#hideSlider').animate({"margin-top": '-=200'});
    }else{
      slideTarget.addClass("on");
      $('#hideSlider').animate({"margin-top": '+=30'});
      // $('#hideSlider').animate({"margin-top": '+=200'});
    }

    slideTarget.slideToggle( 400, function() {});
  }
});

Template.imageMapSliderView2.onRendered(function(){
  $('#lifeviewSlider').slick({
    initialSlide : 5,
      slidesToShow: 5,
      slidesToScroll: 1,
  });
});