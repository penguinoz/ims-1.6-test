import {global} from '/imports/global/global_things.js';

var templateName = 'ihLifeViewMap';

var instance;
Template[templateName].onCreated(function(){
  instance = this;
  instance.postId = null;
  instance.images = new ReactiveVar();
  instance.traces = new ReactiveVar();
  Session.set('ihLifeView templateData', null);
  Meteor.call('getInheritanceById', this.data._id, function(error, result) {
    if (!error) {
      var postId = [];
      if (instance.data.isNote === 'card') {
        postId = result.contents.map(function(item) {
          return item.contentId;
        });
      } else {
        postId = result.instContents.map(function(item) {
          return item.contentId;
        });
      }
      instance.postId = postId;
      initData(postId, true, 100, '', '');
    }
  });
  Meteor.call('lifeFindList', global.login.userId, function(error,result){
    if(error) {
      console.error(error);
    }
    if(result) {
      instance.traces.set(result);
    }
  });
});

Template[templateName].events({
  // 비공개 체크
  'change #showPrivateData': function(e, t){
    e.preventDefault();

    // initData(t.postId, e.target.checked, 100, '', '');
    Meteor.call('getAllIhImages', t.postId, e.target.checked, 100, '', '', '', function(error, result) {
      if (!error) {
        Session.set('ihLifeView templateData', null);
        instance.images.set(result);
        initMap(result, t.traces.get());
      }
    });
  }
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
  }
});

function initData(_postId, _showLock, _limit, _searchCondition, _searchText, _sortBy) {
  Meteor.call('getAllIhImages', _postId, _showLock, _limit, _searchCondition, _searchText, _sortBy, function(error, result) {
    if (!error) {
      instance.images.set(result);
    }
  });
}

Template.ihImageMap.onCreated(function(){
  this.imageData = new ReactiveVar(this.data.datas.imagesData);
  this.traceData = new ReactiveVar(this.data.datas.traceData);
});

Template.ihImageMap.onRendered(function(){
  initMap(Template.instance().imageData.get(), Template.instance().traceData.get());
  var targetElementLeft = $('.hl-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

function initMap(imageData,traceData) {
  var map = new google.maps.Map(document.getElementById('ihLifeTraceMapPop'), {
    zoom: global.mapDefault.zoom,
    center: {lat: global.mapDefault.lat, lng: global.mapDefault.lng}
  });
  map.pageType = 'ihLifeView';

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

    google.maps.event.addListener(map, 'click', function(e){
      // console.log('map click', map.getCenter().lat());
      var nullPositionPicture = Session.get("lifeViewImageMap selectedImage");
      var markers = cluseringObj.myObj.instantMarker;
      for(var i in markers){
        markers[i].setMap(null);
      }
      if(!nullPositionPicture || !nullPositionPicture.postId){
        return;
      }
      var contentString = '<div><img src='+nullPositionPicture.image.path+' width="50" height="50"/><br><button id="saveLoation">위치 확정</button></div>';
      var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

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
        // title: '여기에 추가하시겠습니까?'
      });

      google.maps.event.addListener(infowindow,'closeclick',function(){
        var markers = cluseringObj.myObj.instantMarker;
        for(var i in markers){
          markers[i].setMap(null);
        } //removes the marker
       // then, remove the infowindows name from the array
     });
      infowindow.open(this, marker);
      cluseringObj.myObj.instantMarker.push(marker);
      if(nullPositionPicture){
        // var SessionObj = Session.get("lifeViewImageMap selectedImage");
        nullPositionPicture.image.lat = e.latLng.lat();
        nullPositionPicture.image.lng = e.latLng.lng();
        Session.set("lifeViewImageMap selectedImage", nullPositionPicture);
      }else{
        // var SessionObj = {image:{}};
        // Session.image.lat = e.latLng.lat();
        // Session.image.lng = e.latLng.lng();
        // Session.set("lifeViewImageMap selectedImage", SessionObj);
      }
    });
 }
}
