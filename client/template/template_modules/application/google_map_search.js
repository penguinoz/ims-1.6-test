import {global} from '/imports/global/global_things.js';

var templateName = 'googleMapSearch';
var markers = [];
var map;
var returnData = {};
var defaultLat = 37.537798;
var defaultLng = 127.001216;

Template[templateName].onRendered(function(){
  initMap(this.data);
});

Template[templateName].helpers({
  modalTitle: function(){
    var title = '위치검색';

    if(this.title){
      title = this.title + ' 위치';
    }
    return title;
  }
});

Template[templateName].events({
  "click #btnSelect": function(event, template){
    //모달 닫기
    Modal.hide();

    //텍스트 넘기기
    if(returnData && this.parentViewId === "Template.imLifeTrace") {
      Template.imLifeTrace.__helpers.get('hpRemoveClass')(template.data.index);
      Template.imLifeTrace.__helpers.get('setAddressInfo')(returnData, template.data.targetId);
    }else if(returnData){
      var parentTempl = this.parentViewId;
      parentTempl = parentTempl.replace("Template.","");    //modal 호출 필수요소
      Template[parentTempl].__helpers.get('hpGoogleMapCallBack')(returnData);
    }
  }
});

function initMap(data){
  var isNewData = true;
  var lat = global.mapDefault.lat;
  var lng = global.mapDefault.lng;
  //console.log(data);
  if(data.location.lat && data.location.lat){
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

  map = new google.maps.Map(document.getElementById('map-canvas-custom'), mapOptions);

  var locationName = '새 위치';
  if(data.title.length) {
    locationName = data.title;
  }

  if(!isNewData){
    geocodeLatLng(geocoder, data.location, addMarker(data.location), map, infowindow, locationName);
  }

  // This event listener calls addMarker() when the map is clicked.
  map.addListener('click', function(event) {
    // console.log(event.latLng);
    geocodeLatLng(geocoder, event.latLng, addMarker(event.latLng), map, infowindow, locationName);
  });

  // 검색부 ==================================================================================
  var input = (document.getElementById('txtSearch'));/** @type {!HTMLInputElement} */
  var select = document.getElementById('btnSelect');
  var searchBox = new google.maps.places.SearchBox(input);


  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(select);

  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // var autocomplete = new google.maps.places.Autocomplete(input);
  // autocomplete.bindTo('bounds', map);
  // searchBox.addListener('place_changed', function() {
  //   infowindow.close();
  //   var place = searchBox.getPlace();
  //
  //   if (places.length === 0) {
  //     return alert('검색리스트에 검색된 내용을 선택해주시기 바랍니다.');;
  //   }
  //   // if (!place.geometry) {
  //   //   // window.alert("Autocomplete's returned place contains no geometry");
  //   //   alert('검색리스트에 검색된 내용을 선택해주시기 바랍니다.');
  //   //   return;
  //   // }
  //
  //   // If the place has a geometry, then present it on a map.
  //   if (place.geometry.viewport) {
  //     map.fitBounds(place.geometry.viewport);
  //   } else {
  //     map.setCenter(place.geometry.location);
  //     map.setZoom(17);  // Why 17? Because it looks good.
  //   }
  //
  //
  //
  //   var address = '';
  //   if (place.address_components) {
  //     address = [
  //       (place.address_components[3] && place.address_components[3].short_name || ''),
  //       (place.address_components[2] && place.address_components[2].short_name || ''),
  //       (place.address_components[1] && place.address_components[1].short_name || ''),
  //       (place.address_components[0] && place.address_components[0].short_name || '')
  //     ].join(' ');
  //
  //     if(_.isEqual(address.substring(0,2), 'KR')){
  //       address = address.substring(3);
  //     }
  //   }
  //
  //   var mark = addMarker(place.geometry.location);
  //
  //   // console.log('click');
  //   //     var click = false;
  //   mark.addListener('click', function() {
  //     // console.log('click');
  //     infowindow.close();
  //     infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
  //     infowindow.open(map, mark);
  //     click = true;
  //   });
  //   //
  //   //     mark.addListener('mouseover', function() {
  //   //
  //   //       console.log('click');
  //   //       infowindow.close();
  //   //       // infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + mapInfo.address +  '<br>' + mapInfo.fromDate +' ~ ' + mapInfo.toDate);
  //   //       infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
  //   //       infowindow.open(map, mark);
  //   //     });
  //   //
  //   //     mark.addListener('mouseout', function() {
  //   //
  //   //       console.log('click');
  //   //       if(!click) {
  //   //         infowindow.close();
  //   //       }
  //   //     });
  //   infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
  //   infowindow.open(map, mark);
  //
  //   returnData = {
  //     lat : place.geometry.location.lat(),
  //     lng : place.geometry.location.lng(),
  //     address : address
  //   };
  // });

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    if (!places[0].geometry) {
      // console.log("Returned place contains no geometry");
      alert("주소의 위치정보를 찾을 수 없습니다.");
      return;
    }

    // if (places[0].formatted_address && places[0].address_components){
    if (places[0].formatted_address){
      setMapThings(places[0], infowindow, true);
    } else {
      setMapThings(places[0], infowindow, false);
    }
  }); //end listener
}



function geocodeLatLng(geocoder, latlng, marker, map, infowindow, locationName) {
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK || true) {
      if (results[0].address_components) {
        // console.log(results[0].address_components);
        var address = [
          (results[0].address_components[3] && results[0].address_components[3].short_name || ''),
          (results[0].address_components[2] && results[0].address_components[2].short_name || ''),
          (results[0].address_components[1] && results[0].address_components[1].short_name || ''),
          (results[0].address_components[0] && results[0].address_components[0].short_name || '')
        ].join(' ');

        if(_.isEqual(address.substring(0,2), 'KR')){
          address = address.substring(3);
        }

        infowindow.setContent('<div><strong>' + locationName + '</strong><br>' + address);
        infowindow.open(map, marker);
        returnData = {
          lat : marker.getPosition().lat(),
          lng : marker.getPosition().lng(),
          address : address
        };

        marker.addListener('click', function() {
          infowindow.close();
          infowindow.setContent('<div><strong>' + locationName + '</strong><br>' + address);
          infowindow.open(map, marker);
          click = true;
        });
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

function addMarker(latLng){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });

  markers.push(marker);
  return marker;
}

function setMapThings(place, infowindow, isExistAddress){
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


    var mark = addMarker(place.geometry.location);
    mark.addListener('click', function() {
      // console.log('click');
      infowindow.close();
      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, mark);
      click = true;
    });

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, mark);

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


      var mark = addMarker(place.geometry.location);
      mark.addListener('click', function() {
        // console.log('click');
        infowindow.close();
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, mark);
        click = true;
      });

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, mark);

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