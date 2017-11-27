import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

var templateName = 'imLifeTraceViewerPopup';
var markers =[];
var polyLines = [];
var startPointInfo = [];
var endPointInfo = [];
var schoolPointInfo = [];
var socialPointInfo = [];
var maxDate = {};
var minDate = {};
var toslDate = {};
var map;
var userInfo = null;
var age = 0;
var pageType;
var isFirst;
var startPointId = [];
var endPointId = [];
var tempCollection = [];
var data = null;
var userId = null;


Template[templateName].onCreated(function(){
  var instance = this;
  Session.set('imLifeTraceViewerPopup collection', null);
  instance.autorun(function() {
    tempCollection=[];
    var userId = global.login.userId;  //임시 아이디
    var subscription =  instance.subscribe("endingNoteImLifeTrace", userId);//var subscription = instance.subscribe("enImLifeTrace", g_enId);

    if (subscription.ready()) {
      var mapInfo = CLT.EnImLifeTrace.find({}, {sort:{fromDate:1, toDate:1}}).fetch();
      if (mapInfo.length !== 0) {
        var mapData = [];
        mapInfo.map(function(item) {
          mapData.push({
            _id: item._id,
            type: item.type,
            title: item.title,
            address: item.address,
            location : {
              lat: item.lat,
              lng: item.lng
            },
            fromDate: item.fromDate,
            toDate: item.toDate,
          });
        });
        Session.set('imLifeTraceViewerPopup collection', mapInfo);
      }
    }
  });

  isFirst = true;
  //userInfo = Meteor.user(); //지금 사용 안하는 중
  //age = utilGetAge(userInfo.profile.birthday);  //아직 없음
  age = 20;
  // Session.set('bool', true); //0
  Session.set('imLifeTraceViewerPopup periodTo', '');
  Session.set('imLifeTraceViewerPopup periodFrom', '');
});

Template[templateName].helpers({
  collection: function() {
    data = Session.get('imLifeTraceViewerPopup collection');
    if (data) {
      initializeObject(data);
    }
  }
});

Template[templateName].onRendered(function(){
  var mapOptions = {
    zoom: global.mapDefault.zoom,
    center: {
      lat : global.mapDefault.lat,
      lng : global.mapDefault.lng
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var geocoder = new google.maps.Geocoder();
  var infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById('lifeTraceMapPop'), mapOptions);
});

Template[templateName].events({
  "keyup #txtPeriodFrom": function(e, t){
    e.preventDefault();

    Session.set('imLifeTraceViewerPopup periodFrom', e.target.value);
  },
  "keyup #txtPeriodTo": function(e, t){
    e.preventDefault();

    Session.set('imLifeTraceViewerPopup periodTo', e.target.value);
  },
  "click #closeView": function(e, t){
    e.preventDefault();
    Modal.hide();
    Session.set('imLifeTrace reset', true);
  }
});

function initializeObject(data){
  maxDate = {};
  minDate = {};
  //지도 객체 초기화
  var geocoder = new google.maps.Geocoder();

  var infowindow = new google.maps.InfoWindow();
  var toDay = global.utilGetDate().defaultYMD;//new Date().toLocaleString().substring(0,11).replace(/. /g,'-');

  initialize();

  //마커, rangeSlider 생성
  if(data){
    data.forEach(function (mapInfo, i){
      //Rnage Slider의 최소, 최대값 구하기
      if(mapInfo.fromDate) {
        if(!minDate.length || minDate > mapInfo.fromDate) {
          minDate = mapInfo.fromDate;
        }
      }

      if(mapInfo.toDate) {
        if(!maxDate.length || maxDate < mapInfo.toDate) {
          maxDate = mapInfo.toDate;
        }
      }

      if(toDay > maxDate || maxDate === "") {
        toslDate = toDay;
      }
      if(toslDate < maxDate){
        toslDate = maxDate;
      }

      var latLng = {};
      if(mapInfo){
        latLng = {
          lat : parseFloat(mapInfo.lat),
          lng : parseFloat(mapInfo.lng)
        };
      }

      var periodInfo = {
        latLng : latLng,
        from : mapInfo.fromDate,
        to : mapInfo.toDate
      };

      if(mapInfo.type === 'home') {
        startPointInfo.push(periodInfo);
        startPointId.push(mapInfo._id);
      } else if (mapInfo.type === 'school') {
        endPointInfo.push(periodInfo);
        schoolPointInfo.push(periodInfo);
        endPointId.push(mapInfo._id);
      } else {
        endPointInfo.push(periodInfo);
        socialPointInfo.push(periodInfo);
      }

      if(latLng.lat !== '' && latLng.lat !== 'NaN' && latLng.lat !== undefined){
        if(global.utilIsContainDate(periodInfo.from, periodInfo.to, Session.get('imLifeTraceViewerPopup periodFrom'),Session.get('imLifeTraceViewerPopup periodTo'))) {
          var mark = addMarker(latLng, mapInfo.type);
          var click = false;
          mark.addListener('click', function() {
            infowindow.close();
            infowindow.setContent('<div><strong>' + mapInfo.title + '</strong><br>주소 : ' + mapInfo.address +  '<br>기간 : ' + mapInfo.fromDate +' ~ ' + mapInfo.toDate);
            infowindow.open(map, mark);
            click = true;
          });

          mark.addListener('mouseover', function() {
            infowindow.close();
            infowindow.setContent('<div><strong>' + mapInfo.title + '</strong><br>주소 : ' + mapInfo.address +  '<br>기간 : ' + mapInfo.fromDate +' ~ ' + mapInfo.toDate);
            infowindow.open(map, mark);
          });

          mark.addListener('mouseout', function() {
            if(!click) {
              infowindow.close();
            }
          });
        } //if
      } //if

    });
  } //if(data)

  //폴리라인 그리기
  if(startPointInfo.length > 0 && endPointInfo.length > 0) {
    for(var i=0; i < startPointInfo.length; i++) {
      for(var j=0; j < endPointInfo.length; j++) {
        if(global.utilIsContainDateforPoly(endPointInfo[j].from, endPointInfo[j].to, startPointInfo[i].from, startPointInfo[i].to, Session.get('imLifeTraceViewerPopup periodFrom'), Session.get('imLifeTraceViewerPopup periodTo'))) {
          var lineId = {
            start: startPointId[i],
            end: endPointId[j]
          };
          addLine(startPointInfo[i].latLng, endPointInfo[j].latLng, lineId);
        }
      }
    }
  } //if (폴리라인)

  setTimeout(function(){
    if(startPointInfo.length > 0) {
      map.setCenter(new google.maps.LatLng(startPointInfo[startPointInfo.length-1].latLng));
    } else {
      map.setCenter(new google.maps.LatLng(global.mapDefault.lat, global.mapDefault.lng));
    }


    //RangeSlider 그리기
    var birthDay = global.fn_getBirthDay(global.login.userId) ? global.fn_getBirthDay(global.login.userId) :"1940-05-01";
    var birthYM = global.utilGetDate(birthDay).defaultYM;
    var min = birthYM.substring(0,4)-1 +'-'+birthYM.substring(5);
    $("#sliderPopDiv").removeClass('hidden');
    $("#lifeTraceSlidePop").ionRangeSlider({
      type: "double",
      grid: true,
      grid_num: global.utilGetPastAge(birthYM, maxDate)/10,
      keyboard: true,
      min: +moment(min).format("X"),
      max: +moment(toslDate).format("X"),
      from: +moment(minDate).format("X"),
      to: +moment(maxDate).format("X"),

      //prefix: global.utilGetPastAge(userInfo.profile.birthday, +moment(minDate.replace(".", "-")).format("X")) + "(",
      postfix: " 세",
      prettify: function (num) {
        // return global.utilGetPastAge("1986-05", moment(num, "X").format("YYYY-MM-DD"));
        return global.utilGetPastAge(birthYM, moment(num, "X").format("YYYY-MM-DD"));
        //return "2020-06"; //임시포멧
      },
      onStart: function (data) {
        Session.set('imLifeTraceViewerPopup periodFrom', moment(data.from, "X").format("YYYY-MM-DD"));
        Session.set('imLifeTraceViewerPopup periodTo', moment(data.to, "X").format("YYYY-MM-DD"));
      },
      onChange: function (data) {
        Session.set('imLifeTraceViewerPopup periodFrom', moment(data.from, "X").format("YYYY-MM-DD"));
        Session.set('imLifeTraceViewerPopup periodTo', moment(data.to, "X").format("YYYY-MM-DD"));
      },
      onFinish: function (data) {
        Session.set('imLifeTraceViewerPopup periodFrom', moment(data.from, "X").format("YYYY-MM-DD"));
        Session.set('imLifeTraceViewerPopup periodTo', moment(data.to, "X").format("YYYY-MM-DD"));
      },
      onUpdate: function (data) {
        Session.set('imLifeTraceViewerPopup periodFrom', moment(data.from, "X").format("YYYY-MM-DD"));
        Session.set('imLifeTraceViewerPopup periodTo', moment(data.to, "X").format("YYYY-MM-DD"));
      }
    });
  }, 100);

}

function initialize(){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  for (var j = 0; j < polyLines.length; j++) {
    polyLines[j].setMap(null);
  }
  polyLines = [];

  startPointInfo = [];
  endPointInfo = [];
}

function addMarker(latLng, type){
  var iconImg;
  switch(type)
  {
    case 'home' :
    iconImg = "/images/googleMap/icon3.png";
    break;
    case 'school' :
    iconImg = "/images/googleMap/icon2.png";
    break;
    case 'social' :
    iconImg = "/images/googleMap/icon1.png";
    break;
    default:
    iconImg = "/images/googleMap/icon3.png";
    break;
  }

  var iconOption = {
    url: iconImg, // url
    scaledSize: new google.maps.Size(43, 48), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(21, 49) // anchor
  };

  var marker = new google.maps.Marker({
    position: latLng,
    map: map,
    icon: iconOption
  });

  markers.push(marker);

  return marker;
}

function addLine(start, end, id) {
  var polyLine = new google.maps.Polyline({
    _id: {start: id.start, end: id.end},
    linePath: [start, end],
    path: [start, end],
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map
  });

  polyLines.push(polyLine);
}

setMapCenter = function(lat, lng) {
  map.setCenter(new google.maps.LatLng(lat, lng));
};
