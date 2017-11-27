//
// function createMarker(mapEx, jsonString){
//   var mopsiMarker, map;
//   var jsonObject = eval("(" + jsonString + ")");
//   map = mapEx.map;
//
//   mopsiMarker = new markerX(mapEx,jsonObject);
//   mopsiMarker.clusterSize = jsonObject.clusterSize;
//   mopsiMarker.myLat = jsonObject.latitude;
//   mopsiMarker.myLng = jsonObject.longitude;
//   google.maps.event.addListener(mopsiMarker.marker, 'click', function(){
//      mopsiMarker.clickMarkerOnMap();
//     });
//
//   google.maps.event.addListener(mopsiMarker.marker, 'dragstart', function(){
//   });
//
//   mapEx.addToOverlays(mopsiMarker);
//   return mopsiMarker;
// }
//
// function markerX(mapEx, jsonObject)
// {
//   var icon, map;
//   map = mapEx.map;
//
//   if ( jsonObject.icon == undefined || jsonObject.icon == null )
//     icon = getIconForMarkerParamType(jsonObject.style, jsonObject.color, jsonObject.thumb, jsonObject.clusterSize);
//   else
//     icon = jsonObject.icon;
//
//   this.marker = new google.maps.Marker({
//     position: new google.maps.LatLng(jsonObject.latitude,jsonObject.longitude),
//     map: map,
//     draggable: jsonObject.draggable=="true"?true:false,
//     title: jsonObject.title,
//     optimized:false,
//     shadow: getShadowForMarkerParamType(jsonObject.style, jsonObject.clusterSize),
//     icon: icon,
//     raiseOnDrag:(jsonObject.raiseOnDrag=="false")?false:true,
//     zIndex:8,
//     clickable:jsonObject.clickable,
//     destination: jsonObject.destination
//   });
//
//   this.mapEx = mapEx;
//
//   this.clusterSize=jsonObject.clusterSize;
//
//   this.draggable=jsonObject.draggable=="true"?true:false;
//   this.thumb = jsonObject.thumb;
//   this.map=map;
//
//   this.markerStyle = jsonObject.style;
//
//   this.id=jsonObject.id;
//
//   //
//   if(jsonObject.html!=undefined)
//   	this.labelInfo=jsonObject.html;
//   else
//   	this.labelInfo=jsonObject.label;
//
//   this.type = jsonObject.type;
//   this.addLabel(jsonObject.style, jsonObject.type, jsonObject.color, jsonObject.thumb);
// }
//
// function getIconForMarkerParamType(markerStyle, color, thumb, clusterSize){
//   var image, size, origin, anchor, iconUrl;
//
//   image = "";
//   if ( markerStyle == "thumbnail" ) {
//     if ( thumb == undefined || thumb == "" )
//       iconUrl = clusteringAPIPath + "icon/thumb-nophoto.jpg";
//     else
//       iconUrl = thumb;
//
//     size = new google.maps.Size(64, 49);
//     origin = new google.maps.Point(0,0);
//     anchor = new google.maps.Point(32, 49);
//     scaledSize = new google.maps.Size(64, 49);
//   }
//
//   if ( markerStyle == "marker1" ) {
//      if ( clusterSize > 1 ) {
//        iconUrl = clusteringAPIPath + "icon/marker1_cluster_"+color+".png";
//        size = new google.maps.Size(64, 64);
//        origin = new google.maps.Point(0,0);
//        anchor = new google.maps.Point(0, 0);
//        scaledSize = new google.maps.Size(32, 32);
//      }
//      else {
//        iconUrl =clusteringAPIPath + "icon/marker1_single_"+color+".png";
//        size = new google.maps.Size(20, 34);
//        origin = new google.maps.Point(0,0);
//        anchor = new google.maps.Point(0, 0);
//        scaledSize = new google.maps.Size(20, 34);
//      }
//   }
//
//   var image = {
//     url: iconUrl,
//     size: size,
//     origin: origin,
//     anchor: anchor,
//     scaledSize: scaledSize
//   };
//
//   return image;
// }
// function getShadowForMarkerParamType(markerStyle, type, clusterSize)
// {
//   var shadow = "";
//
//   if ( markerStyle == "thumbnail" ) {
//     if ( clusterSize > 1 )
//       shadow = new google.maps.MarkerImage(clusteringAPIPath+'icon/photoCollectionShadow.png', null, new google.maps.Point(0,0), new google.maps.Point(35, 57));
//     else
//       shadow = new google.maps.MarkerImage(clusteringAPIPath+'icon/photoShadow.png', null, new google.maps.Point(0,0), new google.maps.Point(35, 49));
//   }
//
//   if ( markerStyle == "marker1" ) {
//     if ( clusterSize > 1 )
//       shadow = "";
//     else
//       shadow = "";
//   }
//
//
//   return shadow;
// }
//
// function getThumburlDisplay(photourl)
// {
//   var photoThumburlDisplay = "";
//   if ( photourl != "" && photourl != undefined )
//     photoThumburlDisplay = getThumb(photourl);
//   else {
//     photoThumburlDisplay = clusteringAPIPath+"icon/nophoto.jpg";
//     photoThumburlDisplay = getThumb(photoThumburlDisplay);
//   }
//
//   return photoThumburlDisplay;
// }
//
// function getThumb(url){
//
//   if(url==undefined || url=="" || url.indexOf("thumb-")!=-1 )
//     return url;
//
//   var fname = getFilenameFromWholePath(url);
//   fname = "thumb-" + fname;
//
//   var path = url.substring(0, url.lastIndexOf('/'));
//   path += "/"+fname;
//
//   return path;
// }
//
// function getFilenameFromWholePath(url){
//   if(url==undefined || url=="")
//   	return url;
//
//   var filename = url.replace(/^.*[\\\/]/, '');
//
//   return filename;
// }
//
// //methods
// markerX.prototype.setPosition=function(latlng){
// 	this.marker.setPosition(latlng);
// }
// markerX.prototype.getPosition=function(){
// 	return this.marker.position;
// }
// markerX.prototype.getDestination=function(){
// 	return this.marker.destination;
// }
// markerX.prototype.setDestination=function(latlng){
// 	this.marker.destination = latlng;
// }
// markerX.prototype.setIcon=function(icon){
// 	this.marker.setOptions({icon:icon});
// }
// markerX.prototype.setMap=function(map){
// 	this.marker.setMap(map);
// 	try{
// 		this.label.setMap(map);
// 	}catch(err){
//     }
// }
//
// markerX.prototype.setDraggable=function(draggable){
// 	this.marker.setDraggable(draggable);
// }
// markerX.prototype.getDraggable=function(){
// 	return this.marker.getDraggable();
// }
// markerX.prototype.setTitle=function(title){
// 	this.marker.setTitle(title);
// }
// markerX.prototype.getTitle=function(){
// 	return this.marker.getTitle();
// }
//
// markerX.prototype.getThumb=function(){
// 	return this.thumb;
// }
// markerX.prototype.getType=function(){
// 	return this.type;
// }
//
// //listener support
// markerX.prototype.addListener=function(event,callbackFunction){
// 	var marker=this.marker;
// 	var mopsiMarker=this;
// 	google.maps.event.addListener(this.marker, event, function(){
// 		callbackFunction(mopsiMarker)
// 	});
// }
// markerX.prototype.removeListener = function(type){
// 	google.maps.event.clearListeners(this.marker, type);
// }
//
// // click on marker on the map
// markerX.prototype.clickMarkerOnMap = function()
// {
//   var i, j, n, dist, p, q, type;
//
//   var markersData = this.markersClusteringObj.markersData;
//   var myMarker = this;
//   var flagZoomToCluster = 0;
//   if ( myMarker.clusterIndexes == undefined || myMarker.clusterIndexes == null )
//     n = 1;
//   else
//     n = myMarker.clusterIndexes.length;
//
//   if ( n > 1 )
//     type = "cluster";
//   else
//     type = "single";
//
//   // Are objects in a cluster very close?
//   if ( type == "cluster" ) {
//     if ( n < 50 && n > 1 ) { // this check is not necessary for big clusters
//       for ( i = 0 ; i < n && !flagZoomToCluster ; i++ ) {
//         p = myMarker.clusterIndexes[i];
//         for ( j = i+1 ; j < n && !flagZoomToCluster ; j++ ) {
//           q = myMarker.clusterIndexes[j];
//           dist = this.mapEx.hvs(markersData[p].lat,markersData[q].lat,markersData[p].lon, markersData[q].lon);
//           if ( dist > 20 ) // in meter
//             flagZoomToCluster = 1;
//         }
//       }
//     }
//     else
//       flagZoomToCluster = 1;
//   }
//
//   if ( flagZoomToCluster )
//     myMarker.zoomToCluster();
//   else
//   	myMarker.openOrUpdateInfoWindow();
// }
//
// // click marker or cluster on the map
// markerX.prototype.openOrUpdateInfoWindow = function()
// {
//   var check = false;
//   if ( this.mapEx.infoWindow.isOpen ) {
//     if ( this.clusterIndexes.indexOf(this.mapEx.infoWindow.index) > -1 ) {
//       this.marker.selectedIndex += 1;
//       check = true;
//     }
//   }
//
//   if ( check )
//     this.updateInfoWindow();
//   else
//     this.openInfoWindow();
// }
//
// // open infowindow with this.marker.selectedIndex
// markerX.prototype.openInfoWindow = function()
// {
//   var i, selectedIndex, doOpen;
//   doOpen = true;
//
//   if ( this.mapEx.infoWindow.isOpen ) {
//     if ( this.clusterIndexes.indexOf(this.mapEx.infoWindow.index) > -1 )
//       doOpen = false;
//   }
//
//   if ( doOpen ) {
//     this.mapEx.closeInfoWindow();
//     this.marker.selectedIndex = -1;
//   }
//
//   this.updateInfoWindow();
//
//   if ( doOpen ) {
//     this.mapEx.infoWindow.open(this.map,this.marker);
//     this.mapEx.infoWindow.isOpen = true;
//   }
//
// }
//
// //infoWindow
// markerX.prototype.updateInfoWindow = function()
// {
//   var N, iconUrl;
//
//   N = this.clusterIndexes.length;
//
//   if ( this.marker.selectedIndex >= N || this.marker.selectedIndex < 0 )
//     this.marker.selectedIndex = 0;
//
//   // index for this.mapEx.infoWindow is considered among all data in markersData
//   this.mapEx.infoWindow.index = this.clusterIndexes[this.marker.selectedIndex];
//
//   this.mapEx.infoWindow.anchor = this.marker;
//   this.mapEx.infoWindow.setContent(this.createInfoWindow());
//
//   // update marker icon
//   if ( this.markerStyle == "thumbnail" ) {
//     iconUrl = getThumburlDisplay(this.markersClusteringObj.markersData[this.mapEx.infoWindow.index].photourl);
//     this.setIcon(iconUrl);
//   }
// }
//
// markerX.prototype.zoomToCluster = function()
// {
//   this.mapEx.setBoundsFromIndexes(this.markersClusteringObj.markersData, this.clusterIndexes);
// }
//
// markerX.prototype.addLabel = function(markerStyle, type, color, thumb)
// {
//   var map = this.map;
//   this.thumb=thumb;
//
//   if ( this.labelInfo != undefined || type==CLUSTER ) {
//     this.label = new Label({
//       map:map,
//       type:this.type,
//       color: color,
//       clusterSize:this.clusterSize,
//       thumb:this.thumb,
//       markerStyle:markerStyle,
//       marker:this
//     });
//
//     this.label.set('zIndex', 10);
//     this.label.bindTo('position', this.marker, 'position');
//     if(this.labelInfo==undefined){
//       this.labelInfo=" ";
//     }
//     this.label.set('text', this.labelInfo);
//   }
// }
//
// markerX.prototype.createInfoWindow=function()
// {
//   var selectedIndex, content, markersData, indexes, j, c;
//   var photourl, address, title, author, date, location;
//
//   selectedIndex = this.marker.selectedIndex; // if a cluster has 5 objects, selectedIndex is a number between 0 to 4
//
//   markersData = this.markersClusteringObj.markersData;
//   indexes = this.clusterIndexes;
//
//   j = indexes[selectedIndex]; // real index in markersData containing whole data
//   photourl = markersData[j].photourl;
//   address = markersData[j].address;
//   title = markersData[j].name;
//
//   author = markersData[j].author;
//   date = markersData[j].date;
//   time = markersData[j].time;
//
//   if ( this.markerStyle == "thumbnail" && (photourl == "" || photourl == undefined) )
//     photourl = clusteringAPIPath + "icon/nophoto.jpg";
//
//   content = '<div id="infoWindowContentMain" class="infoWindowContentMain" >';
//   content += '<div id="infoWindowTitle" class="infoWindowTitle" ';
//   if ( this.markerStyle == "marker1" )
//     content += ' style="border-bottom:2px solid black;margin-bottom:10px;" ';
//
//   content += '>' + title + '</div>';
//
//   if ( this.markerStyle == "thumbnail" )
//     content += '<div id="photoInfoWindow" class="photoInfoWindow"><img class="bigThumbnail1" src="' + photourl + '" /></div>';
//
//   content += '<div class="infoWindowDetailInfo" id="infoWindowDetailInfo">';
//   content += '<div id="dateAndTime">' + date + ', ' + time + '</div><div id="address">' + address +
//       '<br><b>' + author + '</b></div>';
//
//   content += '</div>'; // infoWindowDetailInfo
//   content += '<div>'; // infoWindowContentMain
//
//   return content;
// }
//
// markerX.prototype.clickThumbCircleOnMap = function()
// {
//   this.mapEx.closeInfoWindowByClick = false; // because of the issue of clicking on the circle triggers also click on map
//   this.openOrUpdateInfoWindow();
// }
//
//
// //----LABEL----//
//
// function Label(opt_options) {
//   var top = "0px;";
//      // Initialization
//   this.setValues(opt_options);
//   this.type=opt_options.type;
//   this.thumb=opt_options.thumb;
//   this.clusterSize=opt_options.clusterSize;
//   this.marker = opt_options.marker;
//   this.markerStyle = opt_options.markerStyle;
//
//   switch (this.markerStyle ) {
//     case "thumbnail":
//       top = "-56px;";
//     break;
//
//     case "marker1":
//       top = "0px;";
//     break;
//
//     default:
//       top = "0px;";
//     break;
//   }
//
//   // Here go the label styles
//   var span = this.span_ = document.createElement('span');
//   span.style.cssText = 'position: relative; left: 0px; top:'+ top +
//                        'white-space: nowrap;color:#000000;' +
//                        'font-family: Arial; font-weight: bold;' +
//                        'font-size: 15px;';
//
//   var div = this.div_ = document.createElement('div');
//   div.appendChild(span);
//   div.style.cssText = 'position: absolute; display: none;';
// };
//
// Label.prototype = new google.maps.OverlayView;
//
// Label.prototype.onAdd = function()
// {
//    var pane = this.getPanes().overlayImage;
//    pane.appendChild(this.div_);
//
//    // Ensures the label is redrawn if the text or position is changed.
//    var me = this;
//    this.listeners_ = [
//      google.maps.event.addListener(this, 'position_changed', function() { me.draw(); }),
//      google.maps.event.addListener(this, 'text_changed', function() { me.draw(); }),
//      google.maps.event.addListener(this, 'zindex_changed', function() { me.draw(); })
//    ];
// };
//
// // Implement onRemove
// Label.prototype.onRemove = function()
// {
//   this.div_.parentNode.removeChild(this.div_);
//   // Label is removed from the map, stop updating its position/text.
//   for (var i = 0, I = this.listeners_.length; i < I; ++i)
//     google.maps.event.removeListener(this.listeners_[i]);
// };
//
// // Implement draw
// Label.prototype.draw = function() {
//   var projection = this.getProjection();
//   var position = projection.fromLatLngToDivPixel(this.get('position'));
//   var div = this.div_;
//   div.style.left = position.x + 'px';
//   div.style.top = position.y + 'px';
//   div.style.display = 'block';
//   div.style.zIndex = 10;
//
//   switch ( this.markerStyle ) {
//     case "thumbnail":
//       if ( this.thumb!=undefined && this.marker.clusterSize > 1 ) {
//         var left=-46;
//         var topText=-42;
//         var topCircle=-47;
//         var icon_filename = 'circle_'+this.color+'.png';
//         this.span_.innerHTML = '<img src="'+"../clusteringAPI/icon/photoCollectionFrame.png"+'" style="left: -35px;position: relative;top: 0px;">';
//         if ( this.clusterSize!=0 ) {
//           var nr=this.clusterSize>99?"*":this.clusterSize;
//           var id=Math.round(position.x)+""+Math.round(position.y);
//           this.span_.innerHTML += '<img src="'+'../clusteringAPI/icon/'+icon_filename+'" style="cursor: pointer; z-index:1000;left: '+left+'px; position: relative; top: '+topText+'px;width:22px;height:22px; " id="'+id+'" >'+ '<span id="P'+id+'" style="cursor: pointer; z-index:1001;left: 33px;overflow: hidden;position: absolute;text-align: center;top: '+topCircle+'px;width: 20px;"><font color=black>'+nr+'</font></span></img>';
//         }
//         var me=this;
//         $('#P'+Math.round(position.x)+""+Math.round(position.y)).click(function(){
//           me.marker.clickThumbCircleOnMap();
//         });
//       } else {
// 	    //
//       }
//     break;
//
//     case "marker1":
//       if ( this.marker.clusterSize > 1 ) {
//         var left=5;
//         var top=22;
//         this.span_.innerHTML = '';
//
//           var nr=this.clusterSize>99?"*":this.clusterSize;
//           var id=Math.round(position.x)+""+Math.round(position.y);
//           this.span_.innerHTML += '<span id="P'+id+'" style="cursor: pointer; z-index:10;left: '+left+'px;overflow: hidden;position: absolute;text-align: center;top: '+top+'px;width: 20px;"><font color=black>'+nr+'</font></span>';
//       }
//     break;
//   }
// }