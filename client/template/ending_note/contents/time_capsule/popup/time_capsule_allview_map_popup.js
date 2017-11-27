import {global} from '/imports/global/global_things.js';

var templateName = 'timeCapsuleAllviewMapPopup';
var markers =[];
var polyLines = [];
var startPointInfo = [];
var endPointInfo = [];
var schoolPointInfo = [];
var socialPointInfo = [];
var maxDate = {};
var minDate = {};
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
  instance.selectedMenu = new ReactiveVar();
  instance.selectedMenu.set('liTabMe');

});

Template[templateName].onRendered(function(){

  Meteor.call("getMyLocationData",global.login.userId,function(err, res){
    if(err){console.log(err);}
    if(res){
      var mapOptions = {
        zoom: global.mapDefault.zoom,
        center: {
          lat : global.mapDefault.lat,
          lng : global.mapDefault.lng
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      var geocoder = new google.maps.Geocoder();
      var infowindow = new google.maps.InfoWindow();
      map = new google.maps.Map(document.getElementById('lifeTraceMapPop'), mapOptions);
      global.fn_selectPicker('.selectpicker', null);
      Session.set('capsulesMyData',res);
      setLocationVal(res);
    }
  });
  Meteor.call("getLocationData",global.login.userId,function(err, res){
    if(err){console.log(err);}
    if(res){
      Session.set('capsulesAnatherData',res);
    }
  });
});

Template[templateName].helpers({
  hpSelectedMenu: function(id){
    if(id === Template.instance().selectedMenu.get()){
      return 'active';
    } else {
      return '';
    }
  },
  hpMyCapsuleCount : function(){
    return Session.get('capsulesMyData').length;
  },
  hpOthersCapsuleCount : function(){
    return Session.get('capsulesAnatherData').length;
  }
});

Template[templateName].events({
  "click #closeView": function(e, t){
    e.preventDefault();
    Modal.hide();
    // Session.set('imLifeTrace reset', true);
  },
  "click #checkMe" : function(e, t){
    var resultDatas = [];
    if($(e.target).is(":checked")){
      if(Session.get('capsulesMyData')){
        resultDatas = Session.get('capsulesMyData');
      }
    }
    if($("#checkAll").is(":checked")){
      if(Session.get('capsulesAnatherData')){
        resultDatas = resultDatas.concat(Session.get('capsulesAnatherData'));
      }
    }
    setLocationVal(resultDatas);
    // t.selectedMenu.set(e.currentTarget.id);
    // Meteor.call("getMyLocationData",global.login.userId,function(err, res){
    //   if(err){console.log(err);}
    //   if(res){
    //
    //     setLocationVal(res);
    //
    //   }
    // });
  },
  "click #checkAll" : function(e, t){
    var resultDatas = [];
    if($("#checkMe").is(":checked")){
      if(Session.get('capsulesMyData')){
        resultDatas = Session.get('capsulesMyData');
      }
    }
    if($(e.target).is(":checked")){
      if(Session.get('capsulesAnatherData')){
        resultDatas = resultDatas.concat(Session.get('capsulesAnatherData'));
      }
    }
    setLocationVal(resultDatas);
    // t.selectedMenu.set(e.currentTarget.id);
    // Meteor.call("getLocationData",global.login.userId,function(err, res){
    //   if(err){console.log(err);}
    //   if(res){
    //     setLocationVal(res);
    //   }
    // });
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

      var latLng = {};
      if(mapInfo){
        latLng = {
          lat : parseFloat(mapInfo.lat),
          lng : parseFloat(mapInfo.lng),
        };
      }


      var status = mapInfo.status;//PR, US, BR, PB mapInfo.type
      var date = mapInfo.date;//PR, US, BR, PB mapInfo.date
      if(latLng.lat !== '' && latLng.lat !== 'NaN' && latLng.lat !== undefined){
        var mark = addMarker(latLng, status, date, mapInfo.isNotMyContent);
        var click = false;
        mark.addListener('click', function() {
          // infowindow.close();
          // infowindow.setContent('<div><strong>' + mapInfo.title + '</strong><br>주소 : ' + mapInfo.address);
          // infowindow.open(map, mark);
          // click = true;
          if(!mapInfo.isNotMyContent){
            moveMyCapsuleDetail(mapInfo);
          }



        });

        mark.addListener('mouseover', function() {
          infowindow.close();
          infowindow.setContent('<div><strong>' + mapInfo.title + '</strong><br>주소 : ' + mapInfo.address);
          infowindow.open(map, mark);
        });

        mark.addListener('mouseout', function() {
          if(!click) {
            infowindow.close();
          }
        });

      } //if

    });
  } //if(data)


}

function moveMyCapsuleDetail(mpaInfo){

  //////////////////////////////////////////////
  var searchOptionParam = {};
  var templateData = {};

  templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
  templateData.data = {
    _id : mpaInfo._id,
  };


  Modal.hide();
  switch(mpaInfo.status){
    case 'US':
      templateData.contentTmp = 'timeCapsuleDetail';
      templateData.data.contentTmp = 'timeCapsuleContentUnseal';
      templateData.data.statusMenu = 'unseal';
      templateData.data.selectedMenu = "my";
      Session.set('endingNoteList templateData', null);
      setTimeout(function(){
        Session.set('endingNoteList templateData', templateData);
      }, 200);
      break;
    case 'BR':
      //D-day체크
      diffResult = global.fn_diffDate(mpaInfo.unsealDate);

      if(diffResult.flag === '-' && diffResult.diffDay !== 'day'){ //개봉일 지나지 않음
        searchOptionParam = {};
        templateData.contentTmp = 'timeCapsuleDetail';
        Session.set('endingNoteList templateData', null);
        setTimeout(function(){
          Session.set('endingNoteList templateData', templateData);
        }, 200);
      } else {
      searchOptionParam = {};

      Meteor.call('getCapsuleInnerData',mpaInfo._id,function(err,res){
        if(err) console.log(err);
        if(res){
          var templateData = {};
          templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
          templateData.contentTmp = 'timeCapsuleOpenEffect';
          templateData.data = {
            _id : res._id
          };
          templateData.data.innerData = res;
          Session.set('endingNoteList templateData', null);
          setTimeout(function(){
            Session.set('endingNoteList templateData', templateData);
          }, 200);
        }
      });

      }
      break;


  }
}
function initialize(){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  startPointInfo = [];
  endPointInfo = [];
}

function addMarker(latLng, status, date, isNotMine){
  var labelTxt = date;
  var label= {};
  var iconOption = {};

  switch(status){
    case 'PR': case 'BR':
    label = {
      text: labelTxt,
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
    break;
    default: //'US', 'PB'
    label = {
      text: labelTxt,
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
  if(isNotMine){
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });
  }else{
    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: iconOption,
      label: label,
    });
  }


  // google.maps.event.addListener(map, 'idle', function() {
  //   var labels = document.querySelectorAll("[style*='custom-label-']");
  //   _.each(labels, function(labelInfo){
  //     if(labelInfo.getAttribute('style').match(/custom-label-OP/)){
  //       labelInfo.classList.add( 'openedeggicon' );
  //     } else {
  //       labelInfo.classList.add( 'closedeggicon' );
  //     }
  //   });
  // });

  markers.push(marker);

  return marker;
}

function setLocationVal(arrObj){
  var mapInfo = arrObj;
  var mapData = [];
  var dateInfo = '';
  mapInfo.map(function(item) {
    if(!item.buryLat && !item.buryLng){
      return;
    }

    if(item.status === 'US'){
      dateInfo = global.utilGetDate(item.latestOpenDate).defaultYMdot;
    } else {
      //d-day만들어야함
      var diffResult = global.fn_diffDate(item.unsealDate);
      dateInfo = 'D' + diffResult.flag + diffResult.diffDay;
    }

    var pushParam = {
      lat: item.buryLat,
      lng: item.buryLng,
      title: item.buryLocationName,
      address : item.buryPlace,
      status: item.status,
      date: dateInfo,
      isNotMyContent : item.isNotMyContent
    };

    if(!item.isNotMyContent){
      pushParam._id = item._id;
      pushParam.unsealDate = item.unsealDate
    }

    mapData.push(pushParam);
  });

  initializeObject(mapData);
}

setMapCenter = function(lat, lng) {
  map.setCenter(new google.maps.LatLng(lat, lng));
};
