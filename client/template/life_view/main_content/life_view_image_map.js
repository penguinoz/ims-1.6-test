import {global} from '/imports/global/global_things.js';

// 라이프뷰 이미지 맵으로 보기
var templateName = 'lifeViewImageMap';
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
 instance.noLatImages = new ReactiveVar();
 instance.traces = new ReactiveVar();
 var showAllData = true;
 if(!this.data || !this.data.showAll){
   showAllData = false;
 }
 Meteor.call('getAllImages', userId, isPageOwner, showAllData, 100, 'all', '', 'all', function(error, result){
   if(error){
     return console.log(error);
   } else {
     if(result){
       var arrayNolat = [];
       instance.images.set(result);
       _.each(result.images, function(imageInfo){
         if(!imageInfo.lat && !imageInfo.lng && imageInfo.path){
           var noObj = {};
           noObj.photourl = imageInfo.path;
           noObj.postId = imageInfo.postId;
           noObj.type = imageInfo.type;
           noObj.startDate = imageInfo.startDate;
           arrayNolat.push(noObj);
         }
       });
       arrayNolat = _.sortBy(arrayNolat,'startDate').reverse();
       instance.noLatImages.set(arrayNolat);
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

 Meteor.call('lifeFindList',userId,function(error,result){
   if(error){
     console.error(error);
   }
   if(result){
     instance.traces.set(result);
   }
 });

});

Template[templateName].onRendered(function(){
  if(isPageOwner){
    if(this.data){
      if(this.data.showAll === true){
        $('#showPrivateData').attr("checked", true);
      }else{
        $('#showPrivateData').attr("checked", false);
      }
    }else{
      $('#showPrivateData').attr("checked", true);
    }

  } else {
    $('#showPrivateData').attr("checked", false);
    $('#showPrivateData').attr("disabled", true);
  }
  // // 스크롤 페이징 구현
  var targetElementLeft = $('.hl-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpImages: function(){
    var returnObj = {};
    returnObj.imagesData = Template.instance().images.get();
    returnObj.traceData = Template.instance().traces.get();
    if(returnObj.imagesData && returnObj.traceData){
      return returnObj;
    }
    return;
  },
  hpSlideImages: function(){
    return Template.instance().noLatImages.get();
  },
  hpIsPageOwner: function(){
    return isPageOwner;
  }
});

Template[templateName].events({
  "click #saveLoation": function(e, t){
    var selectedData = Session.get("lifeViewImageMap selectedImage");
    Meteor.call('saveImageLocation',selectedData,function(){
      var mainTemplateData = {};
      var dtailTemplateData = {};
      mainTemplateData.contentTmp = 'lifeViewImageMap';
      dtailTemplateData.contentTmp = 'lifeViewDetailList';
      Session.set('lifeViewMain templateData', null);
      Session.set('endingNoteList templateData', null);
      setTimeout(function(){
        Session.set('lifeViewMain templateData', mainTemplateData);
        Session.set('endingNoteList templateData', dtailTemplateData);
      }, 100);
    });

  },
  "click #loctionDelete": function(e, t){
    var selectedData = {postId:"",
                      type:"",
                      image:{path:"",lng:"",lat:""}
        };
    selectedData.postId = $('#postIdVal').attr('value');
    selectedData.type = $('#typeVal').attr('value');
    selectedData.image.path = $('#loctionDelete').attr('value');

    Meteor.call('saveImageLocation',selectedData,function(){
      var mainTemplateData = {};
      var dtailTemplateData = {};
      mainTemplateData.contentTmp = 'lifeViewImageMap';
      dtailTemplateData.contentTmp = 'lifeViewDetailList';
      Session.set('lifeViewMain templateData', null);
      Session.set('endingNoteList templateData', null);
      setTimeout(function(){
        Session.set('lifeViewMain templateData', mainTemplateData);
        Session.set('endingNoteList templateData', dtailTemplateData);
      }, 100);
    });

  },
  "click #showPrivateData": function(){
    isShowLocks = $("#showPrivateData").is(":checked");
    var mainTemplateData = {};
    var dtailTemplateData = {};
    var showOption = {};
    mainTemplateData.contentTmp = 'lifeViewImageMap';
    showOption.showAll = isShowLocks;
    mainTemplateData.data = showOption;
    dtailTemplateData.contentTmp = 'lifeViewDetailList';
    Session.set('lifeViewMain templateData', null);
    Session.set('endingNoteList templateData', null);
    setTimeout(function(){
      Session.set('lifeViewMain templateData', mainTemplateData);
      Session.set('endingNoteList templateData', dtailTemplateData);
    }, 100);

  },
  "click #sliderImage": function(e,t){
    e.preventDefault();
    isLocalImg = false;
    var markers = cluseringObj.myObj.instantMarker;
    for(var i in markers){
      markers[i].setMap(null);
    } //removes the marker
    var agent = navigator.userAgent.toLowerCase();
    var selectedObj = {postId:"",
                      type:"",
                      image:{}
                        };
    if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
      // console.log('image1', e.target.children[0].src);
      selectedObj.postId = e.target.children[1].textContent;
      selectedObj.type = e.target.children[2].textContent;
      selectedObj.image.path = e.target.children[0].src;
    }else{
      // console.log('image2', e.target.childNodes[1].currentSrc);
      selectedObj.postId = e.target.childNodes[3].textContent;
      selectedObj.type = e.target.childNodes[5].textContent;
      selectedObj.image.path = e.target.childNodes[1].currentSrc;
    }
    Session.set("lifeViewImageMap selectedImage",selectedObj);
    global.fn_replaceLifeViewDetail(selectedObj);
  },
  "click [name=imgCount]": function(e, t){
    e.preventDefault();
    var slideTarget = $('.hideTarget');

    if(slideTarget.hasClass("on")){
      slideTarget.removeClass("on");
      $('.over').animate({"top": '+=50'});
    }else{
      slideTarget.addClass("on");
      $('.over').animate({"top": '-=50'});
    }

    slideTarget.slideToggle( 400, function() {});
  },
  "click .image": function(e,t){
    e.preventDefault();

    $(e.target).parent().siblings().removeClass('active');
    $(e.target).parent().addClass('active');
  }
});

Template.imageMap.onCreated(function(){
  var instance = this;
  instance.imageData = new ReactiveVar(this.data.datas.imagesData);
  instance.traceData = new ReactiveVar(this.data.datas.traceData);

});

Template.imageMap.onRendered(function(){
  initMap(Template.instance().imageData.get(), Template.instance().traceData.get());
});

Template.imageMapSliderView.onRendered(function(){
  $('#lifeviewSlider').slick({
    // centerMode:true,
    // initialSlide : 0,
    infinite: false,
    slidesToShow: 7,
    slidesToScroll: 1,
    variableWidth: true,
    draggable: false
  });
  $('#lifeviewSlider .slick-slide').removeClass('active');
  $('.hideTarget').hide(); //초기에 타겟을 숨김;
});


Template.imageMapSliderView.events({
  "click .slick-prev": function(e, t){
    var selectedImageIndex = $('#lifeviewSlider .slick-slide.slick-active.active').attr('index');
    $('#lifeviewSlider .slick-slide').removeClass('active');
    if(selectedImageIndex){
      $('#lifeviewSlider .slick-slide.slick-active[index='+selectedImageIndex+']').addClass('active');
    }

  },
  "click .slick-next": function(e, t){
    var selectedImageIndex = $('#lifeviewSlider .slick-slide.slick-active.active').attr('index');
    $('#lifeviewSlider .slick-slide').removeClass('active');
    if(selectedImageIndex){
      $('#lifeviewSlider .slick-slide.slick-active[index='+selectedImageIndex+']').addClass('active');
    }
  },
});

Template.imageMap.events({
  "click #btnSearch": function(e, t){
    var input = document.getElementById('txtSearch');
    google.maps.event.trigger(input, 'focus');
    google.maps.event.trigger(input, 'keydown', {keyCode: 13});

    // google.maps.event.trigger(e.target, 'places_changed');
  }
});



function initMap(imageData,traceData) {
  var infowindow = new google.maps.InfoWindow();
  var map = new google.maps.Map(document.getElementById('lifeTraceMapPop'), {
    zoom: global.mapDefault.zoom,
    center: {
      lat: global.mapDefault.lat,
      lng: global.mapDefault.lng
     }
  });

  // 검색부 ==================================================================================
  var input = (document.getElementById('txtSearch'));/** @type {!HTMLInputElement} */
  var search = document.getElementById('btnSearch');
  var searchBox = new google.maps.places.SearchBox(input);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(search);

  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }

    // // Clear out the old markers.
    // markers.forEach(function(marker) {
    //   marker.setMap(null);
    // });
    // markers = [];

    if (!places[0].geometry) {
      // console.log("Returned place contains no geometry");
      alert("주소의 위치정보를 찾을 수 없습니다.");
      return;
    }

    // if (places[0].formatted_address && places[0].address_components){
    if (places[0].formatted_address){
      setMapThings(places[0], infowindow, true, map);
    } else {
      setMapThings(places[0], infowindow, false, map);
    }
  }); //end listener
///////////////////////////////지도검색//////////////////////////
  // var map;
  // // default location in Joensuu, Finland
  // map = createMap(62.60, 29.76, "lifeTraceMapPop", 12);
  // var mapReadyListener = google.maps.event.addListenerOnce(map, 'idle', function () {
  //   google.maps.event.removeListener(mapReadyListener);
  // });

  var options = {};
  options.clusteringMethod = "gridBased";
  options.markerStyle = 'thumbnail'; // “thumbnail”, “marker1”
  options.markerColor = 'red'; // “yellow”, “green”, “red”, “blue”
  options.representativeType = 'mean'; // “mean”, “first”, “middleCell”
  options.autoUpdate = 0; // updates only changed clusters on map if =1

  cluseringObj = new mopsiMarkerClustering(map, options); // constructor

  if (cluseringObj.validParams == "YES" ) { // validParams: “YES” or “NO”
   // add data objects
    // supposing your data is in the array data

    _.each(imageData.images, function(imageInfo){
      if(imageInfo.lat && imageInfo.lng && imageInfo.path){
        // creating objects one by one and adding to cluseringObj using addObject
        obj = {};
        obj.lat = imageInfo.lat;
        obj.lon = imageInfo.lng;
        // optional,
        obj.photourl = imageInfo.path; // needed for “thumbnail”, photourl: full path of a photo on server
        obj.postId = imageInfo.postId;
        obj.type = imageInfo.type;
        obj.parentPostId = imageInfo.parentPostId;
        cluseringObj.addObject(obj); // adds object to the array markersData of cluseringObj
      }
    });

    _.each(traceData, function(traceInfo){
      if(traceInfo.lat && traceInfo.lng){
        // creating objects one by one and adding to cluseringObj using addObject
        var iconOption = {
          //url: nullPositionPicture.image.path, // url
          scaledSize: new google.maps.Size(43, 48), // scaled size
          origin: new google.maps.Point(0,0), // origin
          anchor: new google.maps.Point(21, 49) // anchor
        };
        switch(traceInfo.type){
          case 'home' :
          iconOption.url = "/images/googleMap/icon3.png";
          break;
          case 'school' :
          iconOption.url = "/images/googleMap/icon2.png";
          break;
          case 'social' :
          iconOption.url = "/images/googleMap/icon1.png";
          break;
        }


        var marker = new google.maps.Marker({
          position : new google.maps.LatLng(traceInfo.lat,traceInfo.lng),
          map: map,
          icon: iconOption
          // title: '여기에 추가하시겠습니까?'
        });
      }
    });
    var flag = true;
    google.maps.event.addListener(map, 'bounds_changed', function() {
      if(flag){
        cluseringObj.apply(); // performing clustering algorithm and displaying markers
        flag = false;
      }
    //  alert(map.getBounds());
    });
    if(map.getBounds()){
      cluseringObj.apply();
    }

    map.addListener('click', function(e){
      var nullPositionPicture = Session.get("lifeViewImageMap selectedImage");
      var markers = cluseringObj.myObj.instantMarker;
      for(var i in markers){
        markers[i].setMap(null);
      }
      if(!nullPositionPicture || !nullPositionPicture.postId){
        return;
      }

      var iconOption = {
        //url: nullPositionPicture.image.path, // url
        scaledSize: new google.maps.Size(43, 48), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(21, 49) // anchor
      };

      var marker = new google.maps.Marker({
        position: e.latLng,
        map: map,
        icon: iconOption
      });
      cluseringObj.myObj.instantMarker.push(marker);

      var contentString = '<div><img src='+nullPositionPicture.image.path+' width="50" height="50"/><br><button id="saveLoation">위치 확정</button></div>';
      infowindow.setContent(contentString);
      infowindow.open(this, marker);

      google.maps.event.addListener(infowindow,'closeclick',function(){
       _.each(cluseringObj.myObj.instantMarker, function(marker){
           marker.setMap(null);
       });
     });

      if(nullPositionPicture) {
        // var SessionObj = Session.get("lifeViewImageMap selectedImage");
        nullPositionPicture.image.lat = e.latLng.lat();
        nullPositionPicture.image.lng = e.latLng.lng();
        Session.set("lifeViewImageMap selectedImage", nullPositionPicture);
      } else {
        // var SessionObj = {image:{}};
        // Session.image.lat = e.latLng.lat();
        // Session.image.lng = e.latLng.lng();
        // Session.set("lifeViewImageMap selectedImage", SessionObj);
      }

    });
 }
}

function addMarker(_map, _latLng){
  var iconOption = {
    //url: nullPositionPicture.image.path, // url
    scaledSize: new google.maps.Size(43, 48), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(21, 49) // anchor
  };

  var marker = new google.maps.Marker({
    position: _latLng,
    map: _map,
    icon: iconOption
  });

  cluseringObj.myObj.instantMarker.push(marker);

  return marker;
}

function addImageOnMap(_map, _marker, _infowindow, _nullPositionPicture){
  var contentString = '<div><img src='+_nullPositionPicture.image.path+' width="50" height="50"/><br><button id="saveLoation">위치 확정</button></div>';
  _infowindow.setContent(contentString);
  _infowindow.open(_map, _marker);
}

Template[templateName].onDestroyed(function(){
  Session.set("lifeViewImageMap selectedImage", null);
  Session.set('endingNoteList templateData', null);
});

//위치 검색

function setMapThings(place, infowindow, isExistAddress, map){
  var address = '';
  var bounds = new google.maps.LatLngBounds();
  if (place.geometry.viewport) {
    bounds.union(place.geometry.viewport);
  } else {
    bounds.extend(place.geometry.location);
  }

  if(isExistAddress){
    address = place.formatted_address;

    if(address.indexOf('KR') >= 0){
      address = address.replace('KR ', '');
    }

    if(address.indexOf('대한민국') >= 0){
      address = address.replace('대한민국 ', '');
    }


    // var mark = addMarker(place.geometry.location);
    // mark.addListener('click', function() {
    //   // console.log('click');
    //   infowindow.close();
    //   infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    //   infowindow.open(map, mark);
    //   click = true;
    // });
    //
    // infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    // infowindow.open(map, mark);

    returnData = {
      lat : place.geometry.location.lat(),
      lng : place.geometry.location.lng(),
      address : address
    };
    map.fitBounds(bounds);
  } else {
    var displaySuggestions = function(predictions, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
        return;
      }
      address = predictions[0].description;

      if(address.indexOf('KR') >= 0){
        address = address.replace('KR ', '');
      }

      if(address.indexOf('대한민국') >= 0){
        address = address.replace('대한민국 ', '');
      }


      // var mark = addMarker(place.geometry.location);
      // mark.addListener('click', function() {
      //   // console.log('click');
      //   infowindow.close();
      //   infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      //   infowindow.open(map, mark);
      //   click = true;
      // });
      //
      // infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      // infowindow.open(map, mark);

      returnData = {
        lat : place.geometry.location.lat(),
        lng : place.geometry.location.lng(),
        address : address
      };
      map.fitBounds(bounds);
    };

    var service = new google.maps.places.AutocompleteService();
    service.getQueryPredictions({ input: place.name }, displaySuggestions);
  }
}
