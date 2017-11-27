import {global} from '/imports/global/global_things.js';

var templateName = 'googleMapTemplate';
var markers = [];
var map;
var returnData = {};
var defaultLat = 37.537798;
var defaultLng = 127.001216;
var parentTemplateName = '';

Template[templateName].onRendered(function(){
  parentTemplateName = '';

  if(this.data && this.data.templateName){
    parentTemplateName = this.data.templateName;
  }

  initMap(this.data);
  // if(this.data.scrollSet){
  //   //jquery 스크롤 적용
  //   var scrollCallbackOptions = {
  //     whileScrolling: function() {
  //       //return showMoreVisibleImContent(this);
  //     }
  //   };
  //   global.fn_customerScrollBarInit($('.hr-scroll'), "dark", scrollCallbackOptions);
  // }
});

Template[templateName].helpers({
  hpClass: function(){
    if(this.class){
      return this.class;
    }
  },
  hpGoogleMapCallBack: function(callbackData){
    var mapData = {
      location : {
        lat : callbackData.lat,
        lng : callbackData.lng
      },
      placeName : callbackData.address
    };
    initMap(mapData);
    Template[parentTemplateName].__helpers.get('hpMapDataCallBack')(mapData);

  }
});

Template[templateName].events({
});

function initMap(data){
  var isNewData = true;
  var lat = global.mapDefault.lat;
  var lng = global.mapDefault.lng;
  if(data.location.lat && data.location.lng){
    isNewData = false;
    lat = data.location.lat;
    lng = data.location.lng;
  }
  var mapOptions = {
    zoom: global.mapDefault.zoom,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var geocoder = new google.maps.Geocoder();
  var infowindow = new google.maps.InfoWindow();

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  if(!_.isNaN(data.location.lat)){
    var marker  = addMarker(data);

    marker.addListener('click', function() {
      console.log('click');
      infowindow.close();
      infowindow.setContent('<div><strong>' + data.placeName + '</strong>');
      infowindow.open(map, marker);
      click = true;
    });

    // infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.setContent('<div><strong>' + data.placeName + '</strong>');
    infowindow.open(map, marker);
  }
}

function addMarker(data){
  var iconOption = {};

  if(data.status === "PR" || data.status === "BR"){
    var diffResult = global.fn_diffDate(data.unsealDate);
    label = {
      text: 'D' + diffResult.flag + diffResult.diffDay,
      color: '#e00000',
      fontSize : '12px',
      fontWeight : 'bolder',
      fontFamily: 'Roboto, Arial, sans-serif'
    };
    iconOption = {
      url: global.timeCapsuleEggImg.default, // url
      size: new google.maps.Size(46, 55),
      scaledSize: new google.maps.Size(46, 55), // scaled size
      origin: new google.maps.Point(0,0), // origin
      labelOrigin: new google.maps.Point(24,29), //(left, top)
      anchor: new google.maps.Point(21, 49) // anchor
    };
  } else {
    label = {
      text: global.utilGetDate(data.unsealDate).defaultYMdot,
      color: '#0063ff',
      fontSize : '10px',
      fontWeight : 'bolder',
      fontFamily: 'Roboto, Arial, sans-serif'
    };
    iconOption = {
      url: global.timeCapsuleEggImg.open, // url
      size: new google.maps.Size(46, 55),
      scaledSize: new google.maps.Size(46, 55), // scaled size
      origin: new google.maps.Point(0,0), // origin
      labelOrigin: new google.maps.Point(23,35), //(left, top)
      anchor: new google.maps.Point(21, 49) // anchor
    };
  }

  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  var marker = new google.maps.Marker({
    position: data.location,
    map: map,
    icon: iconOption,
    label: label
  });

  markers.push(marker);
  return marker;
}
