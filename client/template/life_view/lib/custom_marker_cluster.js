import {global} from '/imports/global/global_things.js';

/**
 * @name mopsiMarkerClustering
 * @class This class includes Google maps related functions for clustering markers and
 *  handling related events and also information window
 *
 * @param {Google map object} map
 * @param {json} options includes required parameters for clustering,
 *  options.clusteringMethod {string} defines clustering method to remove clutter of markers e.g. "gridBased"
 *  options.markerStyle {string} defines marker style on map e.g. "thumbnail" or "marker1"
 *  options.representativeType {string} determines the criteria for the location of clusters' reprersentatives which
 *   can be "mean", "first" and "middleCell"
 *  options.autoUpdate {boolean} if it is set to 1, only updates the changed clusters on map during panning or zooming map
 *
 */

var CLUSTER = "Cluster";
var ROUTE = "Route";
var clusteringAPIPath = "images/icon/marker_cluster";

/**
 * constructor, initialization and checking parameters
 */
mopsiMarkerClustering = function(map, options)
{
  this.map = map;
  this.mapEx = new mapX(map);

  this.options = options;
  this.markersData = [];
  this.markers = [];

  this.markersData_old = null;

  this.clustersDel = [];
  this.nObjectsInView = 0;

  this.GridsTestID = new Array();
  this.validParams = "NO";

  this.checkParameters();
  this.instantMarker = [];
};

/**
 * checks input parameters
 */
mopsiMarkerClustering.prototype.checkParameters = function()
{
  var options;

  this.validParams = "NO";

  options = this.options;

  if ( options.clusteringMethod != "gridBased" ) // only grid-based clustering method now
    return;

  if ( options.markerStyle != "thumbnail" && options.markerStyle != "marker1" )
    return;

  if ( options.markerColor != "yellow" && options.markerColor != "green"  &&
       options.markerColor != "red" && options.markerColor != "blue" )
    return;

  if ( options.representativeType == undefined )
    return;
  if ( options.representativeType != "mean" && options.representativeType != "first" )
    return;

  if ( options.autoUpdate == null )
    options.autoUpdate = 0;

  if ( options.clusteringMethod == "gridBased" )  {
    if ( options.markerStyle == "thumbnail" ) {
      var cellHeight = 60; // in pixels
      var cellWidth = 80;
      var minDist = 70; // threshold in pixels
    }

    if ( options.markerStyle == "marker1" ) { // standard marker shape
      var cellHeight = 60; // in pixels
      var cellWidth = 60;
      var minDist = 60; // threshold in pixels
    }

    options.cellHeight = cellHeight;
    options.cellWidth = cellWidth;
    options.minDist = minDist;
  }

  mopsiMarkerClustering.prototype.myObj = this;

  google.maps.event.addListener(this.map, 'zoom_changed', function(){
    mopsiMarkerClustering.prototype.myObj.mapEx.closeInfoWindow();
  });



  // alert("pre "+this.map.getBounds());
  // google.maps.event.addListener(this.map, 'bounds_changed', function() {
  //   console.log(this.getBounds());
  //   mopsiMarkerClustering.prototype.myObj.mapEx.closeInfoWindow();
  // });

  this.validParams = "YES";
}



/**
 * add one object to data that should be clustered
 */
mopsiMarkerClustering.prototype.addObject = function(obj)
{
  if ( obj.lat > 85.05 )
    obj.lat = 85.05;
  if ( obj.lat < -85.05 )
    obj.lat = -85.05;
  if ( obj.lon > 180 )
    obj.lon = 180;
  if ( obj.lon < -180 )
    obj.lon = -180;

  this.markersData.push(obj);
}

/**
 * removes listeners and markers from map for new clustering
 */
mopsiMarkerClustering.prototype.clean = function()
{
  if(this.mapEx.myZoomListener != null)
    google.maps.event.removeListener(this.mapEx.myZoomListener);
  if(this.mapEx.myDragListener != null)
    google.maps.event.removeListener(this.mapEx.myDragListener);

  this.mapEx.removeOverlays();

  this.markersData = [];
}

/**
 * main flow of clustering and handling the clustered markers on map
 */
mopsiMarkerClustering.prototype.apply = function(zoom_pan)
{
  this.timeClient = new Date();

  var mapTemp = this.mapEx;

  if ( zoom_pan == undefined || zoom_pan == null ) // for the first time we need setBounds to all objects
    mapTemp.setBoundsFromData(this.markersData);

  this.clusterAndDisplay();

  if(mapTemp.myZoomListener != null)
    google.maps.event.removeListener(mapTemp.myZoomListener);
  if(mapTemp.myDragListener != null)
    google.maps.event.removeListener(mapTemp.myDragListener);

  mopsiMarkerClustering.prototype.myObj = this;

  mapTemp.myZoomListener = google.maps.event.addListener(mapTemp.map, "zoom_changed", function(){
    mopsiMarkerClustering.prototype.myObj.apply("zoom_pan");
  });
  mapTemp.myDragListener = google.maps.event.addListener(mapTemp.map, "dragend", function(){
    mopsiMarkerClustering.prototype.myObj.apply("zoom_pan");
  });

  this.timeClient = new Date() - this.timeClient;
  this.nClusters = this.markerClusters.clusters.length;
}

/**
 * applied clustering and creates markers and displays on map
 */
mopsiMarkerClustering.prototype.clusterAndDisplay = function()
{
  var i, j, mapTemp;
  mapTemp = this.mapEx;

  if ( this.autoUpdate )
    this.checkChangedMarkers(); // ???
  else {
    for (i=0; i < this.markersData.length; i++) {
      this.markersData[i].clusterId = -1;
      this.markersData[i].clusterNum = -1;
    }
  }

  if ( this.options.clusteringMethod == "gridBased" )
    this.gridBasedClustering();

  this.createAndAddMarkersOnMap();
}

/**
 * finds the clusters that need change in new clustering (when autoUpdate is requested)
 */
mopsiMarkerClustering.prototype.checkChangedMarkers = function()
{
  var i, thisLat, thisLon, ii, thisFound, thatLat, thatLon;

  for ( i=0; i < this.markersData.length; i++ ) {
    if ( this.markersData_old == null ) {
      this.markersData[i].clusterId = -1;
      this.markersData[i].clusterNum = -1;
    }
    else {
      thisLat = this.markersData[i].latitude;
      thisLon = this.markersData[i].longitude;

      thisFound = false;
      for ( ii = 0; ii < this.markersData_old.length; ii++ ) {
        thatLat = this.markersData_old[ii].latitude ;
        thatLon = this.markersData_old[ii].longitude ;
        if ( thisLat == thatLat && thisLon == thatLon ) {
           this.markersData[i].clusterId = this.markersData_old[ii].clusterId;
           this.markersData[i].clusterNum = this.markersData_old[ii].clusterNum;
           thisFound = true;
           break;
        }
      }
      if ( !thisFound ) {
        this.markersData[i].clusterId = -1;
        this.markersData[i].clusterNum = -1;
      }
    }
  }

  // update markersData_old
  this.markersData_old = [];
  for (i in markersData) {
    this.markersData_old[i] = {};
    for (j in markersData[i])
      this.markersData_old[i][j] = markersData[i][j];
  }
}

/**
 * main flow of grid-based clustering method
 * latitudes and longitudes are converted to pixel space and clustering algorithm is
 * applied in pixel space, then representatives are conerted to latitudes and longitudes
 */
// grid-based clustering
mopsiMarkerClustering.prototype.gridBasedClustering = function ()
{
  var objClusters, p, params, dataCluster, objCluster;

  p = this.gridBasedClusteringParams(this.options.cellHeight, this.options.cellWidth);
  this.GBCParams = p;

  params = {type: "gridbased", minX:p.minX1, maxX:p.maxX1,minY:p.minY,maxY:p.maxY, cellHeight:p.cellHeight, cellWidth:p.cellWidth, distMerge:p.minDist, representativeType:p.representativeType};

  dataCluster = this.convertDataToPixel();

  objCluster = new mopsiClustering(dataCluster, params);
  objClusters = objCluster.applyClustering();

  objClusters = this.representativesToLatLng(objClusters);

  if ( this.autoUpdate && objClusters !== null ) {
    this.createClusterId(objClusters); // needed for comapring clusters and auto update
    this.findChangingClusters(objClusters);
  }

  // note: this.markerClusters is used as old markerClusters for autoUpdate and findChangingClusters,
  // so, updating it should be done after findChangingClusters
  this.markerClusters = objClusters;
};

/**
 * finds clusters that change (when auto update is requested)
 * new clusters that should be added and the clusters that should be removed since
 * they are not in the view anymore
 */
mopsiMarkerClustering.prototype.findChangingClusters = function (objClusters)
{
  var i, ii, kk, match;

  if ( objClusters === null )
    return;

  this.clustersAdd = [];
  this.clustersDel = [];

  match = false;

  if ( this.markerClusters !== null) {
    for ( i = 0; i < objClusters.clusters.length; i++ ) {
      match = false;
      for ( ii = 0; ii < this.markerClusters.clusters.length && !match; ii++ ) {
        if ( objClusters.clusters[i].idx == this.markerClusters.clusters[ii].idx )
          match = true;
      }
      if ( !match )
        this.clustersAdd[i] = true;
    }
  }
  else {
    for ( i = 0; i < objClusters.clusters.length; i++ )
      this.clustersAdd[i] = true;
  }

  if ( this.markerClusters !== null) {
    kk = 0;
    for ( i = 0; i < this.markerClusters.clusters.length; i++ ) {
      match = false;
      for ( ii = 0; ii < objClusters.clusters.length && !match; ii++ ) {
        if ( objClusters.clusters[ii].idx == this.markerClusters.clusters[i].idx )
          match = true;
      }
      if ( !match ) {
        this.clustersDel[kk] = this.markerClusters.clusters[i].idx;
        kk++;
      }
    }
  }

  return objClusters;
};

/**
 * converts representative location of clusters from pixel to latitude and longitude
 */
mopsiMarkerClustering.prototype.representativesToLatLng = function (objClusters)
{
  var i, j, x, y, latLng, p;

  p = this.GBCParams;

  // convert representatives to lat and lon
  for ( i = 0; i < objClusters.clusters.length; i++) {
    x = objClusters.clusters[i].represent[0];
    y = objClusters.clusters[i].represent[1];

	if ( p.reverseX ) {
	  if ( x < p.W1 )
	    x += p.minX;
	  else
	    x -= p.W1;
    }

    x = x / Math.pow(2, p.zoomlevel);
    y = y / Math.pow(2, p.zoomlevel);

    latLng = this.mapEx.map.getProjection().fromPointToLatLng(new google.maps.Point(x,y));
    // limit precision
    y = latLng.lat();
    x = latLng.lng();
    y = Math.floor(y*100000000);y=y/100000000;
    x = Math.floor(x*100000000);x=x/100000000;
    objClusters.clusters[i].represent[0] = y;
    objClusters.clusters[i].represent[1] = x;
  }

  return objClusters;
};

/**
 * converts representative location of clusters from latitude and longitude to pixel
 */
mopsiMarkerClustering.prototype.convertDataToPixel = function ()
{
  var GBCParams, minX1, maxX1, minX, maxX, minY, maxY, dataCluster;
  var rep, objCluster, point, lat, lng, i;

  GBCParams = this.GBCParams;

  maxX = GBCParams.maxX;
  maxY = GBCParams.maxY;
  minX = GBCParams.minX;
  minY = GBCParams.minY;

  dataCluster = [];

  try {
    for (i=0; i < this.markersData.length; i++) {
      lat = this.markersData[i].lat;
      lng = this.markersData[i].lon;

      // convert to pixel
      point = this.mapEx.getPointFromLatLng(lat,lng);

      if ( GBCParams.reverseX ) {
        if ( point.x < GBCParams.maxW && point.x >= minX && point.y <= maxY && point.y >= minY)
          point.x -= minX;
        else if ( point.x < maxX && point.x >= 0 && point.y <= maxY && point.y >= minY )
          point.x += GBCParams.W1;
      }

        dataCluster[i] = {};
        dataCluster[i].x = point.x;
        dataCluster[i].y = point.y;
    }
  }catch(err){
    alert("Fatal error in clustering!");
  }

  this.nObjectsInView = this.markersData.length;

  return dataCluster;
}

/**
 * removes overlays from map and close info window, sets cluster info for every input data object,
 * then create marker per cluster and display on map
 */
mopsiMarkerClustering.prototype.createAndAddMarkersOnMap = function () {
  var i, j, group, clusters;

  clusters = this.markerClusters.clusters;

  if ( this.autoUpdate )
    this.mapEx.removeMarkersWithId(this.clustersDel);
  else
    this.mapEx.removeOverlays();

  // close info window if open
  this.mapEx.closeInfoWindow();
  this.mapEx.infoWindow.index = -1;

  this.markers = [];

  //Only add one thumbnail per group, the first one in the group
  for ( group = 0; group < clusters.length; group++) {
    for ( i = 0 ; i < clusters[group].group.length ; i++ ) {
      j = clusters[group].group[i];
      this.markersData[j].clusterId = group;
      this.markersData[j].clusterNum = i;
    }

    this.createAndAddClusterMarker(group);
  }
}

/**
 * create and add marker for a cluster
 */
mopsiMarkerClustering.prototype.createAndAddClusterMarker = function (group)
{
  var groupIndexes, i, j, clusters, mopsiMarker;
  clusters = this.markerClusters.clusters;

  groupIndexes = new Array();
  for ( i = 0 ; i < clusters[group].group.length ; i++ ) {
    j = clusters[group].group[i]; // index of object in cluster among whole data
    groupIndexes.push(j);
  }

  if ( this.autoUpdate && !this.clustersAdd[group] ) {
    mopsiMarker = this.mapEx.getMarkerOnLatLng(lat,lon); // we should use old id to find the marker not lat ???
    if (mopsiMarker == null)
      alert("Error in createAndAddMarkersOnMap function!");
    else {
      mopsiMarker.clusterIndexes = groupIndexes;
      mopsiMarker.marker.selectedIndex = -1;
      this.markers.push(mopsiMarker);
    }
  }
  else {
    jsonInfo = this.getJsonInfo(group);
    mopsiMarker = createMarker(this.mapEx,jsonInfo);
    mopsiMarker.clusterIndexes = groupIndexes;
    mopsiMarker.markersClusteringObj = this;
    mopsiMarker.marker.selectedIndex = -1;
    mopsiMarker.idx = clusters[group].idx;
    this.markers.push(mopsiMarker);
  }
}

/**
 * provides json data needed to create a marker
 */
mopsiMarkerClustering.prototype.getJsonInfo = function (group)
{
  var i, lat, lon, thumb, type;
  var title, jsonInfo, label, clusterSize, style, zIndex, clusters, markerColor;

  clusters = this.markerClusters.clusters;
  markerColor = this.options.markerColor;

  i = clusters[group].group[0]; // index of object among whole data

  lat = clusters[group].represent[0];
  lon = clusters[group].represent[1];

  style = this.options.markerStyle;
  thumb = "";
  if ( style == "thumbnail" ) {
    thumb = this.markersData[i].photourl;
    // if ( thumb != "" && thumb != null && thumb != undefined) {
    //   thumb = getThumb(thumb);
    // }
    // else {
    //   thumb = getThumburlDisplay(thumb);
    // }
  }

  zIndex = 8;
  clusterSize = clusters[group].group.length;
  if ( clusterSize > 1 ) {
    // title = clusterSize + " objects";

    jsonInfo = '{'+
    '"latitude": "'+lat+'",'+
    '"longitude": "'+lon+'",'+
    '"type": "'+CLUSTER+'",'+
    '"style": "'+style+'",'+
    '"draggable": "'+"false"+'",'+
    // '"title": "'+title+'",'+
    '"label": "'+"3"+'",'+
    '"thumb": "'+thumb+'",'+
    '"color": "'+markerColor+'",'+
    '"zIndex": "'+zIndex+'",'+
    '"clusterSize": "'+clusterSize+'" '+
    '}';
  }
  else {
    // title = "single object";

    jsonInfo = '{'+
    '"latitude": "'+lat+'",'+
    '"longitude": "'+lon+'",'+
    '"type": "'+CLUSTER+'",'+
    '"style": "'+style+'",'+
    '"draggable": "'+"false"+'",'+
    // '"title": "'+title+'",'+
    '"thumb": "'+thumb+'",'+
    '"color": "'+markerColor+'",'+
    '"zIndex": "'+zIndex+'",'+
    '"clusterSize": "'+clusterSize+'" '+
    '}';
  }

  return jsonInfo;
}

/**
 * handles opening info window when a request is fired from outside of map
 */
mopsiMarkerClustering.prototype.remoteClick = function(num) {
  var i, j;

  var name = this.markersData[num].name;

  // apply clustering by changing zoom as defined a listener for it
  this.mapEx.setCenter(new google.maps.LatLng(this.markersData[num].lat, this.markersData[num].lon));
  this.mapEx.setZoom(15);

  mopsiMarkerClustering.prototype.myObj.clusterAndDisplay()
  i = this.markersData[num].clusterId;
  j = this.markersData[num].clusterNum;
  var marker = this.markers[i];
  marker.marker.selectedIndex = j;

  marker.openInfoWindow();
}

/**
 * provides unique cluster id for each cluster based on lat and lng of a cluster representative and
 * the indexes of objects in the cluster
 */
mopsiMarkerClustering.prototype.createClusterId = function(clusters)
{
  var i, j;

  for ( i = 0; i < clusters.clusters.length; i++) {
	var clusterMembersCatenated = "";
    for ( j = 0; j < clusters.clusters[i].group.length; j++)
      clusterMembersCatenated += clusters.clusters[i].group[j];

    clusterMembersCatenated += clusters.clusters[i].represent[0]; // lat
    clusterMembersCatenated += clusters.clusters[i].represent[1]; // lon
    clusters.clusters[i].idx = clusterMembersCatenated;
  }

  return clusters;
}

/**
 * prepare all parameters needed for grid-based clustering including map bound in pixel space
 */
mopsiMarkerClustering.prototype.gridBasedClusteringParams = function(cellHeight, cellWidth)
{
  var markersBounding, zoomlevel, latDiff, lngDiff, point1, point2, mg1, mg2, p1, p2;
  var leftTopPoint, rightTopPoint, leftBottomPoint, rightBottomPoint;
  var maxLat, minLat, maxLng, minLng, outVal, center, map;

  map = this.map;

  outVal = {};

  zoomlevel = map.getZoom();
  center = map.getCenter();
  // Retrieve the coord for the top right of the map
  maxLat = map.getBounds().getNorthEast().lat();
  maxLng = map.getBounds().getNorthEast().lng();
  //Retrieve the coord for the bottom left of the map
  minLat = map.getBounds().getSouthWest().lat();
  minLng = map.getBounds().getSouthWest().lng();

  outVal.reverseX = false;

  if ( (center.lng() > minLng) && (center.lng() < maxLng) ) {
  }
  else {
    outVal.reverseX = true;
  }

  latDiff = maxLat - minLat;
  lngDiff = maxLng - minLng;

  if ( latDiff <= 0 ) {
    minLat = -90;
    maxLat = 90;
  }

  if ( maxLat > 85.05 )
    maxLat = 85.05;
  if ( minLat < -85.05 )
    minLat = -85.05;
  if ( maxLng > 180 )
    maxLng = 180;
  if ( minLng < -180 )
    minLng = -180;

  // convert bound to pixels
  point1 = map.getProjection().fromLatLngToPoint(new google.maps.LatLng(maxLat,minLng));
  point2 = map.getProjection().fromLatLngToPoint(new google.maps.LatLng(minLat,maxLng));

  point1.x = point1.x * Math.pow(2, zoomlevel);
  point1.y = point1.y * Math.pow(2, zoomlevel);
  point2.x = point2.x * Math.pow(2, zoomlevel);
  point2.y = point2.y * Math.pow(2, zoomlevel);

  // start from beginning of cells
  point1.x = Math.floor(point1.x);

  point1.x = point1.x - (point1.x%cellWidth);
  point1.y = Math.floor(point1.y);
  point1.y = point1.y - (point1.y%cellHeight);

  point2.x = Math.floor(point2.x);
  point2.x = point2.x + (point2.x%cellWidth);
  point2.y = Math.floor(point2.y);

  point2.y = point2.y + (point2.y%cellHeight);
  outVal.minX = point1.x;
  outVal.minY = point1.y;
  outVal.maxX = point2.x;
  outVal.maxY = point2.y;

  outVal.cellHeight = cellHeight;
  outVal.cellWidth = cellWidth;

  outVal.maxW = 256*Math.pow(2, zoomlevel);

  if ( outVal.reverseX ) { // when map ends and a new one appears after a vertical line
    outVal.minX1 = 0;
	outVal.W1 = (outVal.maxW) - (outVal.minX);
	W2 = outVal.maxX;
	outVal.maxX1 = (outVal.W1)+W2;
  }
  else {
    outVal.minX1 = outVal.minX;
	outVal.maxX1 = outVal.maxX;
  }
  outVal.zoomlevel = zoomlevel;

  outVal.minDist = this.options.minDist;
  outVal.representativeType = this.options.representativeType;

  return outVal;
}

/**
 * add red grid lines to map for test
 */
mopsiMarkerClustering.prototype.addGrids = function ()
{
  var latLngs, latLng1, latLng2, latLng, lat1, lon1, lat2, lon2, maxX;
  var route, zoomlevel, flag, maxW, center, temp1, temp2;

  zoomlevel = this.mapEx.getZoom();
  center = this.mapEx.getCenter();

  var GBCParams = this.GBCParams;
  var point1 = {};
  var point2 = {};

  // remove old grids
  if ( this.GridsTestID.length > 0 ) {
    this.mapEx.removeMarkersWithId(this.GridsTestID);
  }
  this.GridsTestID = new Array();

  // bounding points
  point1.x = GBCParams.minX; point1.y = GBCParams.minY;
  point2.x = GBCParams.maxX; point2.y = GBCParams.maxY;

  latLng1 = this.mapEx.getLatLngFromPoint(point1);
  latLng2 = this.mapEx.getLatLngFromPoint(point2);

  // vertical lines
  lat1 = latLng1.lat();
  lat2 = latLng2.lat();
  lon1 = latLng1.lng();
  lon2 = latLng2.lng();

  var xMax, temp;
  maxW = 256*Math.pow(2, zoomlevel);

  var flag = true;
  xMax = maxW;
  if ( (center.lng() > lon1) && (center.lng() < lon2) ) {
    flag = false;
    xMax = point2.x;
  }

  if ( Math.abs(point2.x-point1.x) >= maxX || Math.abs(lon2-lon1)>=180 )
    flag = true;

  while ( point1.x < xMax ) {
    latLngs=new Array();
    latLngs.push(new google.maps.LatLng(lat1,lon1));
    latLngs.push(new google.maps.LatLng(lat2,lon1));

    // draw route
    route = new google.maps.Polyline({
      path: latLngs,
      strokeColor: "red",
      strokeOpacity: 1.0,
      strokeWeight: 1,
      zIndex: 10
    });

    route.setMap(this.mapEx.map);
    route.idx = "route"; route.idx += lat1;route.idx += lon1;
    route.type = ROUTE;
    addToOverlays(route);

    this.GridsTestID.push(route.idx);
    // find points for the next line
    point1.x += GBCParams.cellWidth;
    latLng1 = this.mapEx.getLatLngFromPoint(point1);

    lon1 = latLng1.lng();
  }

  lon1 = -180;
  if ( flag ) {
    point1.x = 0;
    while ( point1.x < point2.x ) {
      latLngs=new Array();
      latLngs.push(new google.maps.LatLng(lat1,lon1));
      latLngs.push(new google.maps.LatLng(lat2,lon1));

      // draw route
      route = new google.maps.Polyline({
        path: latLngs,
        strokeColor: "red",
        strokeOpacity: 1.0,
        strokeWeight: 1,
        zIndex: 10
      });

      route.setMap(this.mapEx.map);
      route.idx = "route"; route.idx += lat1;route.idx += lon1;
      route.type = ROUTE;
      addToOverlays(route);

      this.GridsTestID.push(route.idx);
      // find points for the next line
      point1.x += GBCParams.cellWidth;
      latLng1 = this.mapEx.getLatLngFromPoint(point1);

      lon1 = latLng1.lng();
    }
  }

  // bounding points
  maxX = 256 * Math.pow(2, zoomlevel);
  point1.x = GBCParams.minX; point1.y = GBCParams.minY;
  point2.x = GBCParams.maxX; point2.y = GBCParams.maxY;
  latLng1 = this.mapEx.getLatLngFromPoint(point1);
  latLng2 = this.mapEx.getLatLngFromPoint(point2);


  // horizontal lines
  lon1 = latLng1.lng();
  lon2 = latLng2.lng();
  lat1 = latLng1.lat();


  if ( flag ) {
    temp1 = 0;
    temp2 = 0;
    if ( Math.abs(point2.x-point1.x) >= maxX ) {
      lon1 = -180;
      lon2 = 180;
    }
    else {
      if ( lon1 < 0 && lon2 > 0 ) {
      }
      else {
        temp1 = 180;
        temp2 = -180;
      }
    }
  }

  while ( point1.y <= GBCParams.maxY ) {
    latLngs=new Array();
    if ( !flag ) {
      latLngs.push(new google.maps.LatLng(lat1,lon1));
      latLngs.push(new google.maps.LatLng(lat1,lon2));

      // draw route
      route = new google.maps.Polyline({
        path: latLngs,
        strokeColor: "red",
        strokeOpacity: 1.0,
        strokeWeight: 1,
        zIndex: 10
      });

      route.setMap(this.mapEx.map);
      route.idx = "route"; route.idx += lat1;route.idx += lon1;
      route.type = ROUTE;
      addToOverlays(route);

      this.GridsTestID.push(route.idx);
    }
    else {
      latLngs.push(new google.maps.LatLng(lat1,lon1));
      latLngs.push(new google.maps.LatLng(lat1,temp1));
      // draw route
      route = new google.maps.Polyline({
        path: latLngs,
        strokeColor: "red",
        strokeOpacity: 1.0,
        strokeWeight: 1,
        zIndex: 10
      });

      route.setMap(this.mapEx.map);
      route.idx = "route"; route.idx += lat1;route.idx += lon1;
      route.type = ROUTE;
      addToOverlays(route);

      this.GridsTestID.push(route.idx);

      latLngs=new Array();
      latLngs.push(new google.maps.LatLng(lat1,temp2));
      latLngs.push(new google.maps.LatLng(lat1,lon2));
      // draw route
      route = new google.maps.Polyline({
        path: latLngs,
        strokeColor: "red",
        strokeOpacity: 1.0,
        strokeWeight: 1,
        zIndex: 10
      });

      route.setMap(this.mapEx.map);
      route.idx = "route"; route.idx += lat1;route.idx += lon2;
      route.type = ROUTE;
      addToOverlays(route);

      this.GridsTestID.push(route.idx);
    }
    // find points for the next line
    point1.y += GBCParams.cellHeight;
    latLng1 = this.mapEx.getLatLngFromPoint(point1);

    lat1 = latLng1.lat();
  }
}

/**
 * @name mopsiClustering
 * @class This class includes functions at logic level for clustering objects
 *
 * @param {array of objects} dataIn All input data information that should be clustered and it includes:
 *  e.g. dataIn[i].x and dataIn[i].y
 * @param {json} params includes all required parameters for clustering,
 *  e.g. for grid-based clustering:
 *  params.type in this case it is "gridBased"
 *  params.minX minimum x in x axis of view
 *  params.maxX maximum x in x axis of view
 *  params.minY minimum y in y axis of view
 *  params.maxY maximum y in y axis of view
 *  params.cellHeight cell height in grid
 *  params.cellWidth cell width in grid
 *  params.cellWidth cell width in grid
 *  params.distMerge distance threshold to merge two clusters
 *  params.representativeType determines the criteria for the location of clusters' reprersentatives which
 *   can be "mean", "first" and "middleCell"
 * @return {json} dataOut includes all information about output clusters and also cluster labels of input data, it includes:
 *  dataOut.numClusters {number} represents number of clusters
 *  dataOut.dataSize {number} represents size of input data
 *  dataOut.clusters {array} represents information of clusters and includes:
 *   dataOut.clusters[i].clusterSize {number} the size of cluster i
 *   dataOut.clusters[i].group {array} the indexes of the objects in cluster i among whole input data
 *   dataOut.clusters[i].represent {array} the representative of cluster i, for grid-based clustering it includes:
 *    dataOut.clusters[i].represent[0] x value of location of representative (in pixel)
 *    dataOut.clusters[i].represent[1] y value of location of representative (in pixel)
 *  dataOut.dataLabel {array} represents cluster label for every input data
 */

function mopsiClustering(dataIn, params)
{
  this.params = params;
  this.dataIn = dataIn;
  this.init();
}

/**
 * intitialization and checking input data and parameters
 */
mopsiClustering.prototype.init = function()
{

}

/**
 * clustering procedure starts here
 */
mopsiClustering.prototype.applyClustering = function()
{

  switch ( this.params.type ) {
    case "overlap":
	  this.overlappedItemsClustering();
	  break;
    case "gridbased":
      this.gridBasedClustering();
	  break;
    case "clutter_noClustering":
      this.clutterNoClustering();
      break;
	default:
	  break;
  }

  return this.dataOut;
}

/**
 * main flow of grid based clustering
*/
mopsiClustering.prototype.gridBasedClustering = function()
{
  var clusters, representType, clustersOrder;
  representType = this.params.representativeType; // mean or first

  clusters = this.initializeGridBasedClusters();
  clustersOrder = this.assignPointsToCells(clusters);
  this.setRepresentatives(clusters, clustersOrder, representType);
  this.checkOverlapAmongNeighbors(clusters, clustersOrder, representType);
  this.dataOut = this.constructOutputClusters(clusters, clustersOrder, true, representType);
}

/**
 * it checks a cluster with 8 neighbor cells (if contains clusters) for overlap,
 * in case of overlap, it merges two clusters
 */
mopsiClustering.prototype.checkOverlapAmongNeighbors = function(clusters, clustersOrder, representType)
{
  var i, j, c, cluster1, cluster2, numColumn, index1, index2;

  numColumn = clusters.numColumn;

  // initialize parent of each cluster as itself
  for (c=0; c < clustersOrder.length; c++) {
    i = clustersOrder[c];
    clusters.clusters[i].parent = i;
  }

  for (c=0; c < clustersOrder.length; c++) {
    index1 = clustersOrder[c];
    cluster1 = clusters.clusters[index1];

    if (cluster1.valid == false)
      continue;

    // check 8 neighbors
    for ( j = 0 ; j < 9 ; j++ ) {
      index2 = this.getNeighbourCellNum(j, index1, numColumn);
      cluster2 = clusters.clusters[index2];

      if ( cluster2 != undefined && index2 != index1 && cluster2.clusterSize > 0 ) {
        index2 = this.checkForMerge(clusters, index1, index2, representType); // might be new index different from index2
        if ( index2 != -1 )
          this.mergeTwoClusters(clusters, index1, index2, representType);
      }
    }
  }
}

/**
 * merge two clusters
 * cluster index2 is merged in cluster index1
 * the representative locations of both clusters are updated to new location
 */
mopsiClustering.prototype.mergeTwoClusters = function(clusters, index1, index2, representType)
{
  var cluster1, cluster2, point1, point2, k, n1, n2;

  point1 = {};
  point2 = {};
  cluster1 = clusters.clusters[index1];
  cluster2 = clusters.clusters[index2];

  n1 = cluster1.group.length;
  n2 = cluster2.group.length;
  point1.x = cluster1.represent[0];
  point1.y = cluster1.represent[1];
  point2.x = cluster2.represent[0];
  point2.y = cluster2.represent[1];

  for (k=0; k < n2; k++) {
    cluster1.group.push(cluster2.group[k]);
    clusters.dataLabel[cluster2.group[k]] = index1;
  }
  cluster1.clusterSize += cluster2.clusterSize;
  cluster2.valid = false; // not valid after merged into cluster1

  // update the representative
  if ( representType == "mean" ) {
    cluster1.represent[0] = (point1.x*n1+point2.x*n2)/(n1+n2);
    cluster1.represent[1] = (point1.y*n1+point2.y*n2)/(n1+n2);
    cluster2.represent[0] = cluster1.represent[0];
    cluster2.represent[1] = cluster1.represent[1];
    cluster2.parent = index1;
  }
  if ( representType == "first" ) {
    cluster1.represent[0] = point1.x;
    cluster1.represent[1] = point1.y;
  }
}

/**
 * it checks two clusters index1 and index2 for overlap based on the distance between their representatives
 * if cluster index2 is already merged with another cluster, its parents are checked
 */
mopsiClustering.prototype.checkForMerge = function(clusters, index1, index2, representType)
{
  var flagC, cnt, cluster1, cluster2, point1, point2, minDist, indexX;

  indexX = index2;
  flagC = false;
  point1 = {};
  point2 = {};
  cluster1 = clusters.clusters[index1];
  cluster2 = clusters.clusters[index2];
  minDist = this.params.distMerge; // threshold in pixel

  point1.x = cluster1.represent[0];
  point1.y = cluster1.represent[1];
  point2.x = cluster2.represent[0];
  point2.y = cluster2.represent[1];
  dist = this.EucDistance(point1, point2); // between two representative

  if (dist < minDist) {
    flagC = true;
    if ( representType == "mean" ) {
      cnt = 0;
      while ( cluster2.valid == false && flagC ) {
        if ( cluster2.parent == index1 )
          flagC = false;
        else {
          indexX = cluster2.parent;
          cluster2 = clusters.clusters[cluster2.parent];
          // parent has same representative, so no need to update point2 and check dist,
          // we update the location of a cluster to new representative location when it is merged
        }

        if ( cnt > 50 ) {
          alert(index1+" "+index2);
          alert("Too many check for neighbors in grid-based clustering!");
          flagC = false;
        }

        cnt++;
      }
    }

    if ( representType == "first" && cluster2.valid == false )
      flagC = false;
  }

  if ( flagC )
    return indexX;
  else
    return -1;
}

/**
 * it finds the cell containing every input data and constructs the initial clusters
 * the points in the same cell are considered in one cluster
 */
mopsiClustering.prototype.assignPointsToCells = function(clusters)
{
  var dataSize, x, y, k, i, j;
  var lat, lng, numRow, numColumn, clustersOrder;

  numRow = clusters.numRow;
  numColumn = clusters.numColumn;
  dataSize = this.dataIn.length;

  j = 0;
  clustersOrder = new Array();
  for ( i=0; i < dataSize; i++) {
    x = this.dataIn[i].x;
    y = this.dataIn[i].y;

    k = this.getCellNum(x, y, numColumn, numRow);

    clusters.dataLabel[i] = k;
    if(k == -1)
      continue;

	if ( k < 0 || k >= clusters.numCells || (clusters.clusters[k] == undefined) )
      alert("Fatal error: in grid-based clustering in clustering.js");

    if ( clusters.clusters[k].clusterSize == 0 ) {
      clustersOrder[j] = k;
      j++;
    }

	clusters.clusters[k].group[clusters.clusters[k].clusterSize] = i;
	clusters.clusters[k].clusterSize += 1;
	clusters.clusters[k].valid = true;
  }

  return clustersOrder;
}

/**
 * it provides grid based on input parameters and initializes clusters
 * every cell in the grid is ceonsidered as an empty cluster
 */
mopsiClustering.prototype.initializeGridBasedClusters = function()
{
  var dataSize, clusters, i;
  var numRow, numColumn, minX, maxX, minY, maxY;

  maxX = this.params.maxX;
  maxY = this.params.maxY;
  minX = this.params.minX;
  minY = this.params.minY;
  dataSize = this.dataIn.length;

  clusters = {};
  clusters.clusters = [];
  clusters.dataLabel = [];

  numRow = Math.ceil((maxY - minY)/this.params.cellHeight);
  numColumn = Math.ceil((maxX - minX)/this.params.cellWidth);
  clusters.numCells = numRow*numColumn;

  for (i=0; i < dataSize; i++)
    clusters.dataLabel[i] = -1;

  for (i=0; i < clusters.numCells; i++) {
    clusters.clusters[i] = {};
    clusters.clusters[i].clusterSize = 0; // counter over clusters
    clusters.clusters[i].valid = false; // counter over clusters
    clusters.clusters[i].group = [];
    clusters.clusters[i].represent = [];
  }

  clusters.dataSize = dataSize;
  clusters.numRow = numRow;
  clusters.numColumn = numColumn;

  return clusters;
}

/**
 * it does not apply clustering to remove clutter and just provides same output data format
 */
mopsiClustering.prototype.clutterNoClustering = function()
{
  var dataSize, clusters, x, y;
  var i;

  var maxX = this.params.maxX;
  var maxY = this.params.maxY;
  var minX = this.params.minX;
  var minY = this.params.minY;

  dataSize = this.dataIn.length;

  clusters = {};
  clusters.clusters = [];
  clusters.dataLabel = [];

  clusters.numClusters = dataSize;

  for(i=0; i < dataSize; i++)
    clusters.dataLabel[i] = -1;

  for(i=0; i < clusters.numClusters; i++) {
    clusters.clusters[i] = {};
    clusters.clusters[i].clusterSize = 0;
    clusters.clusters[i].valid = false;
    clusters.clusters[i].group = [];
    clusters.clusters[i].represent = [];
  }

  clusters.dataSize = dataSize;

  for( i=0; i < dataSize; i++) {
    x = this.dataIn[i].x;
    y = this.dataIn[i].y;

    clusters.dataLabel[i] = i;

	clusters.clusters[i].group[0] = i;
	clusters.clusters[i].clusterSize += 1;
	clusters.clusters[i].valid = true;

    clusters.clusters[i].represent[0] = x;
    clusters.clusters[i].represent[1] = y;
  }

  this.dataOut = clusters;

}

/**
 * clustering algorithm to remove overlap of markers:
 * it check the distance of markers to a marker and the close markers are merged into it
 */
mopsiClustering.prototype.overlappedItemsClustering = function()
{
  var cnt, dataSize, markerWidth, markerHeight, i, j, dataOut, groupID, visited, distFlag;

  markerWidth = this.params.width;
  markerHeight = this.params.height;
  dataSize = this.dataIn.length;
  dataOut = {};
  dataOut.clusters = [];
  dataOut.dataLabel = [];
  visited = [];
  for(i=0; i < dataSize; i++)
  {
    visited[i] = 0;
	dataOut.clusters[i] = {};
    dataOut.clusters[i].clusterSize = 1; // at least one bubble in each cluster at first
    dataOut.dataLabel[i] = -1;
  }
  dataOut.nrepresent = 2;

  groupID = 0;
  for ( i=0; i < dataSize; i++ )
    if (visited[i] != 1)
    {
	  visited[i] = 1;
      dataOut.dataLabel[i] = groupID;
	  dataOut.clusters[groupID].represent = [];
	  dataOut.clusters[groupID].group = [];
      dataOut.clusters[groupID].represent[0] = this.dataIn[i].x;
	  dataOut.clusters[groupID].represent[1] = this.dataIn[i].y;
	  dataOut.clusters[groupID].group[0] = i;
      for (j=i+1; j < dataSize; j++)
        if (visited[j] != 1) {
          distFlag = this.checkDist(this.dataIn[i] , this.dataIn[j]);
          if (!distFlag) { // two points are considered as in one cluster
            dataOut.dataLabel[j] = groupID;
			cnt = dataOut.clusters[groupID].clusterSize;
			dataOut.clusters[groupID].group[cnt] = j;
			dataOut.clusters[groupID].clusterSize += 1;
            visited[j] = 1;

          }
        }
	  groupID++;
    }

  dataOut.numClusters = groupID;

  this.dataOut = dataOut;
}

/**
 * provides variable as output data of clustering
 */
mopsiClustering.prototype.constructOutputClusters = function(clusters)
{
  var i, j, k, dataOut;

  dataOut = {};
  dataOut.clusters = [];
  dataOut.dataLabel = [];
  k = 0;
  for ( i=0; i < clusters.numCells; i++ ) {
    if ( clusters.clusters[i].valid == true ) {
	  dataOut.clusters.push(clusters.clusters[i]);
	  for ( j = 0; j < clusters.clusters[i].clusterSize ; j++)
	    dataOut.dataLabel[clusters.clusters[i].group[j]] = k;
	  k++;
	}
  }

  dataOut.numClusters = dataOut.clusters.length;
  dataOut.dataSize = clusters.dataSize;

  return dataOut;
}

/**
 * finds representative location for every cluster
 */
mopsiClustering.prototype.setRepresentatives = function(clusters, clustersOrder, representType)
{
  var i, k, t, dataIn;

  dataIn = this.dataIn;

  for (i=0; i < clustersOrder.length ; i++) {
    k = clustersOrder[i]; // cluster number
    switch ( representType ) {
      case "gridMiddle":
        this.setRepresentativeCellMiddle(clusters, k);
        break;

      case "first":
        t = clusters.clusters[k].group[0];
        clusters.clusters[k].represent[0] = dataIn[t].x; // center of the grid
        clusters.clusters[k].represent[1] = dataIn[t].y;
        break;

      case "mean":
      default:
        this.setRepresentativeMean(clusters, k);
        break;
    }
  }
}

/**
 * calculates the middle location of cell as representative location for cluster
 */
mopsiClustering.prototype.setRepresentativeCellMiddle = function(clusters, k)
{
  var nC, nR, numColumn;

  numColumn = clusters.numColumn;

  nC = k%numColumn;
  nR = Math.floor(k/numColumn);
  clusters.clusters[k].represent[0] = Math.floor(this.params.minX + (nC*this.params.cellWidth)+this.params.cellWidth/2); // center of the grid
  clusters.clusters[k].represent[1] = Math.floor(this.params.minY + (nR*this.params.cellHeight)+this.params.cellHeight/2);
}

/**
 * calculates the average location of objects in a cluster as representative location
 */
mopsiClustering.prototype.setRepresentativeMean = function(clusters, k)
{
  var tmpX, tmpY, j, n, t, dataIn;

  dataIn = this.dataIn;

  tmpX = 0;
  tmpY = 0;
  n = clusters.clusters[k].clusterSize;
  for ( j = 0; j < n ; j++) {
    t = clusters.clusters[k].group[j];
    tmpX += dataIn[t].x;
    tmpY += dataIn[t].y;
  }

  tmpX /= n;
  tmpY /= n;

  clusters.clusters[k].represent[0] = tmpX;
  clusters.clusters[k].represent[1] = tmpY;
}

/**
 * calculates Euclidean distance between two points in cartezian space
 */
mopsiClustering.prototype.EucDistance = function(point1, point2)
{
  var tempX, tempY;
  tempX = (point1.x - point2.x)*(point1.x - point2.x);
  tempY = (point1.y - point2.y)*(point1.y - point2.y);

  return Math.sqrt(tempX+tempY);
}

/**
 * check whether the disatce between two points is bigger than marker dimensions
 */
mopsiClustering.prototype.checkDist = function(point1, point2)
{
  if(Math.abs(point1.x - point2.x) > this.params.width || Math.abs(point1.y - point2.y) > this.params.height )
    return true;
  else
    return false;
}

/**
 * finds the cell number containing a point
 */
mopsiClustering.prototype.getCellNum = function(x, y, numColumn, numRow)
{
  var row, column;
  var clusterNum;

  var maxX = this.params.maxX;
  var maxY = this.params.maxY;
  var minX = this.params.minX;
  var minY = this.params.minY;

  // photo is out of the map bounding box
  if( x > maxX || x < minX || y > maxY || y < minY )
    return -1;

  row = Math.floor((y-minY)/this.params.cellHeight);
  column = Math.floor((x-minX)/this.params.cellWidth);

  if ( row < 0 )
    row = 0;

  if ( row >= numRow )
    row = numRow - 1;

  if ( column < 0 )
    column = 0;

  if ( column >= numColumn )
    column = numColumn - 1;

  clusterNum = row*numColumn + column;
  return clusterNum;
}

/**
 * find the cell index of neighbour cluster k (0 to 8) in grid,
 *
 * the nubmers of 8 neighbours are shown as below
 * (index-numColumn-1)  (index-numColumn)  (index-numColumn+1)
 *     (index-1)          index          index+1
 * (index+numColumn-1)  (index+numColumn)  (index+numColumn+1)
 */
mopsiClustering.prototype.getNeighbourCellNum = function(k, index, numColumn)
{
  var r = Math.floor(k/3);
  var c = k%3;
  var n;

  if(r == 0) {
    n = index - numColumn -1 + c;
  }else if(r == 1) {
    n = index - 1 + c;
  }else if(r == 2) {
    n = index + numColumn - 1 + c;
  }

  return n;
}


function mapX(map){
  this.map = map;
  this.myClickListener = null;

  this.overlay = new google.maps.OverlayView();
  this.overlay.draw = function() {};
  this.overlay.setMap(this.map);

  this.infoWindow = new google.maps.InfoWindow();
  this.infoWindow.index = -1;
  // associative array for overlays
  this.overlays = new Array();
  this.pendingInfo=null;
  this.zIndex=0;
  this.closeInfoWindowByClick = true;

  var me=this;
  me.myClickListener = google.maps.event.addListener(this.map, "click", function() {
    setTimeout(function() {
      var temp = me.closeInfoWindowByClick;
      if ( temp ) {// because of conflict with clicking on a label
        me.closeInfoWindow();
      }
      me.closeInfoWindowByClick = true;
    }, 100);
  });
}

mapX.prototype.addToOverlays = function(overlay)
{
  if ( this.overlays[overlay.type] == null ) {
    this.overlays[overlay.type] = new Array();
  }
  this.overlays[overlay.type].push(overlay);
}

mapX.prototype.removeOverlays = function()
{
  this.removeMarkersWithType(CLUSTER);
}

//methods
mapX.prototype.getZIndex = function(){
	this.zIndex++;
	return this.zIndex-1;
}
mapX.prototype.setCenter = function(latlng){
	this.map.setCenter(latlng);
}
mapX.prototype.getCenter = function(){
	return this.map.getCenter();
}

mapX.prototype.setOptions=function(options){
	this.map.setOptions(options);
}

mapX.prototype.getLatLngFromPoint=function(point)
{
  var latLng, point1, lat, lon;
  var zoomlevel = this.getZoom();
  point1 = {};

  point1.x = point.x / Math.pow(2, zoomlevel);
  point1.y = point.y / Math.pow(2, zoomlevel);

  latLng = this.map.getProjection().fromPointToLatLng(new google.maps.Point(  point1.x,  point1.y));

  return latLng;
}

mapX.prototype.getPointFromLatLng=function(lat, lng)
{
  var point;
  var zoomlevel = this.getZoom();

  point = this.map.getProjection().fromLatLngToPoint(new google.maps.LatLng(lat,lng));
  point.x = point.x * Math.pow(2, zoomlevel);
  point.y = point.y * Math.pow(2, zoomlevel);
  point.x = Math.floor(point.x);
  point.y = Math.floor(point.y);

  return point;
}

mapX.prototype.setBoundsFromMarkers = function(){
	var bounds=null;
	for(var i in this.overlays){
		for(var j=0;j<this.overlays[i].length;j++){
			try{
				var latlng=this.overlays[i][j].getPosition();
				if(bounds==null){
					bounds = new google.maps.LatLngBounds (latlng,latlng);
				}else{
					bounds.extend (latlng);
				}
			}catch(err){}
		}
	}
	if(bounds!=null && !bounds.getSouthWest().equals(bounds.getNorthEast())){
		this.setBounds(bounds);
	}
}

mapX.prototype.setBoundsFromLatLngBoundingBox = function(minLat, maxLat, minLng, maxLng)
{
  var bounds=null;
  var latlng, j;

  latlng = new google.maps.LatLng(minLat, minLng);
  bounds = new google.maps.LatLngBounds (latlng,latlng);
  latlng = new google.maps.LatLng(maxLat, maxLng);
  bounds.extend(latlng);

  if ( bounds != null )
    this.setBounds(bounds);
}

mapX.prototype.setBoundsFromIndexes = function(markersData, indexes){
  var bounds=null;
  var latlng, j;

  for(var i = 0 ; i < indexes.length ; i++){
    try{
      j = indexes[i];
      latlng = new google.maps.LatLng(markersData[j].lat, markersData[j].lon);

      if(bounds==null){
      	bounds = new google.maps.LatLngBounds (latlng,latlng);
      }else{
      	bounds.extend(latlng);
      }
    }catch(err){}
  }

  if(bounds!=null )
  	this.setBounds(bounds);
}

mapX.prototype.setBoundsFromData = function(markersData){
  var bounds=null;
  var latlng;
  var data = markersData;

  for(var i = 0 ; i < data.length ; i++){
    try{
      latlng = new google.maps.LatLng(data[i].lat, data[i].lon);

      if(bounds==null){
      	bounds = new google.maps.LatLngBounds (latlng,latlng);
      }else{
      	bounds.extend(latlng);
      }
    }catch(err){}
  }

  if(bounds!=null )
  	this.setBounds(bounds);
  if(data.length === 1 || this.getZoom() > 8)
    //1개일때 줌설정
    this.setZoom(8)
}

mapX.prototype.getBounds = function(){
	return this.map.getBounds();
}
mapX.prototype.getProjection = function(){
	return this.overlay.getProjection();
}
mapX.prototype.setBounds = function(bounds){
	this.map.fitBounds(bounds);
}
mapX.prototype.getZoom = function(){
	return this.map.getZoom();
}
mapX.prototype.setZoom = function(zoom){
	return this.map.setZoom(zoom);
}

mapX.prototype.addListener = function(event,callbackFunction)
{
  var mopsiMap=this;
  google.maps.event.addListener(this.map, event, function() {
    callbackFunction(mopsiMap)
  });
}
mapX.prototype.removeListener = function(type){
	google.maps.event.clearListeners(this.map, type);
}

mapX.prototype.removeMarkersWithType = function(type)
{
  if ( this.overlays[type] != undefined )
    while ( this.overlays[type].length != 0 ) {
      var overlay = this.overlays[type].pop();
      overlay.setMap(null);
    }
}

mapX.prototype.removeMarkersWithId=function(Ids) {

  if ( Ids == undefined )
    return;

  for ( ii = 0; ii < Ids.length; ii++ )
    for ( var i in this.overlays ) {
      for ( var j = this.overlays[i].length - 1; j >= 0; j-- ) {
        if ( this.overlays[i][j] == undefined ) {
          continue;
        }
        if ( Ids[ii] == this.overlays[i][j].idx ) {
          var overlay = this.overlays[i][j];
          this.overlays[i].splice(j, 1);
          overlay.setMap(null);
        }
      }
   }
}

mapX.prototype.getMarkerOnLatLng=function(latStamp, lngStamp) {
  for ( var i in this.overlays ) {
    for ( var j = this.overlays[i].length - 1; j >= 0; j-- ) {
      if ( this.overlays[i][j] == undefined )
        continue;
      if ( this.overlays[i][j].myLat == latStamp && this.overlays[i][j].myLng == lngStamp )
      	return this.overlays[i][j];
    }
  }
  return null;
}

mapX.prototype.removeClickListenerFromMap=function()
{
  if ( this.myClickListener != null ) {
    google.maps.event.removeListener(this.myClickListener);
    this.myClickListener = null;
  }
}

mapX.prototype.addClickListenerToMap=function()
{
  removeClickListenerFromMap();
  this.myClickListener = google.maps.event.addListener(this.map, "click", function () {
	setTimeout(function(){
      if ( this.closeInfoWindowByClick ) {
        this.closeInfoWindow();
      }
      this.closeInfoWindowByClick = true;
	},100);
  });
}

mapX.prototype.closeInfoWindow = function()
{
  this.infoWindow.close();
  this.infoWindow.isOpen = false;
}

mapX.prototype.hvs = function(lat1,lat2,lng1,lng2)
{
  var earthRadius = 3958.75;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  			   Math.cos((lat1) * Math.PI / 180) * Math.cos((lat2) * Math.PI / 180) *
  			   Math.sin(dLng/2) * Math.sin(dLng/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var dist = earthRadius * c;

  var meterConversion = 1609;

  return dist * meterConversion;
}


function createMarker(mapEx, jsonString){
  var mopsiMarker, map;
  var jsonObject = eval("(" + jsonString + ")");
  map = mapEx.map;

  mopsiMarker = new markerX(mapEx,jsonObject);
  mopsiMarker.clusterSize = jsonObject.clusterSize;
  mopsiMarker.myLat = jsonObject.latitude;
  mopsiMarker.myLng = jsonObject.longitude;
  google.maps.event.addListener(mopsiMarker.marker, 'click', function(e){
    if(cluseringObj){
      var markers = cluseringObj.myObj.instantMarker;
      for(var i in markers){
        markers[i].setMap(null);
      }
    }

    Session.set("lifeViewImageMap selectedImage",null);
    mopsiMarker.clickMarkerOnMap();
    mopsiMarker.clickMarkerViewList();
    google.maps.event.addListener(mopsiMarker.mapEx.infoWindow,'closeclick',function(){
      mopsiMarker.mapEx.infoWindow.isOpen = false;
   });
  });


  google.maps.event.addListener(mopsiMarker.marker, 'dragstart', function(){
  });

  mapEx.addToOverlays(mopsiMarker);
  return mopsiMarker;
}

function markerX(mapEx, jsonObject)
{
  var icon, map;
  map = mapEx.map;

  if ( jsonObject.icon == undefined || jsonObject.icon == null )
    icon = getIconForMarkerParamType(jsonObject.style, jsonObject.color, jsonObject.thumb, jsonObject.clusterSize);
  else
    icon = jsonObject.icon;

  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(jsonObject.latitude,jsonObject.longitude),
    map: map,
    draggable: jsonObject.draggable=="true"?true:false,
    title: jsonObject.title,
    optimized:false,
    shadow: getShadowForMarkerParamType(jsonObject.style, jsonObject.clusterSize),
    icon: icon,
    raiseOnDrag:(jsonObject.raiseOnDrag=="false")?false:true,
    zIndex:8,
    clickable:jsonObject.clickable,
    destination: jsonObject.destination
  });

  this.mapEx = mapEx;

  this.clusterSize=jsonObject.clusterSize;

  this.draggable=jsonObject.draggable=="true"?true:false;
  this.thumb = jsonObject.thumb;
  this.map=map;

  this.markerStyle = jsonObject.style;

  this.id=jsonObject.id;

  //
  if(jsonObject.html!=undefined)
  	this.labelInfo=jsonObject.html;
  else
  	this.labelInfo=jsonObject.label;

  this.type = jsonObject.type;
  this.addLabel(jsonObject.style, jsonObject.type, jsonObject.color, jsonObject.thumb);
}

function getIconForMarkerParamType(markerStyle, color, thumb, clusterSize){
  var image, size, origin, anchor, iconUrl;

  image = "";
  if ( markerStyle == "thumbnail" ) {
    if ( thumb == undefined || thumb == "" )
      iconUrl = clusteringAPIPath + "icon/thumb-nophoto.jpg";
    else
      iconUrl = thumb;

    size = new google.maps.Size(64, 49);
    origin = new google.maps.Point(0,0);
    anchor = new google.maps.Point(32, 49);
    scaledSize = new google.maps.Size(64, 49);
  }

  if ( markerStyle == "marker1" ) {
     if ( clusterSize > 1 ) {
       iconUrl = clusteringAPIPath + "icon/marker1_cluster_"+color+".png";
       size = new google.maps.Size(64, 64);
       origin = new google.maps.Point(0,0);
       anchor = new google.maps.Point(0, 0);
       scaledSize = new google.maps.Size(32, 32);
     }
     else {
       iconUrl =clusteringAPIPath + "icon/marker1_single_"+color+".png";
       size = new google.maps.Size(20, 34);
       origin = new google.maps.Point(0,0);
       anchor = new google.maps.Point(0, 0);
       scaledSize = new google.maps.Size(20, 34);
     }
  }

  var image = {
    url: iconUrl,
    size: size,
    origin: origin,
    anchor: anchor,
    scaledSize: scaledSize
  };

  return image;
}
function getShadowForMarkerParamType(markerStyle, type, clusterSize)
{
  var shadow = "";

  if ( markerStyle == "thumbnail" ) {
    if ( clusterSize > 1 )
      shadow = new google.maps.MarkerImage(clusteringAPIPath+'icon/photoCollectionShadow.png', null, new google.maps.Point(0,0), new google.maps.Point(35, 57));
    else
      shadow = new google.maps.MarkerImage(clusteringAPIPath+'icon/photoShadow.png', null, new google.maps.Point(0,0), new google.maps.Point(35, 49));
  }

  if ( markerStyle == "marker1" ) {
    if ( clusterSize > 1 )
      shadow = "";
    else
      shadow = "";
  }


  return shadow;
}

function getThumburlDisplay(photourl)
{
  var photoThumburlDisplay = "";
  if ( photourl != "" && photourl != undefined )
    photoThumburlDisplay = getThumb(photourl);
  else {
    photoThumburlDisplay = clusteringAPIPath+"icon/nophoto.jpg";
    photoThumburlDisplay = getThumb(photoThumburlDisplay);
  }

  return photoThumburlDisplay;
}

function getThumb(url){

  if(url==undefined || url=="" || url.indexOf("thumb-")!=-1 )
    return url;

  var fname = getFilenameFromWholePath(url);
  fname = "thumb-" + fname;

  var path = url.substring(0, url.lastIndexOf('/'));
  path += "/"+fname;

  return path;
}

function getFilenameFromWholePath(url){
  if(url==undefined || url=="")
  	return url;

  var filename = url.replace(/^.*[\\\/]/, '');

  return filename;
}

//methods
markerX.prototype.setPosition=function(latlng){
	this.marker.setPosition(latlng);
}
markerX.prototype.getPosition=function(){
	return this.marker.position;
}
markerX.prototype.getDestination=function(){
	return this.marker.destination;
}
markerX.prototype.setDestination=function(latlng){
	this.marker.destination = latlng;
}
markerX.prototype.setIcon=function(icon){
	this.marker.setOptions({icon:icon});
}
markerX.prototype.setMap=function(map){
	this.marker.setMap(map);
	try{
		this.label.setMap(map);
	}catch(err){
    }
}

markerX.prototype.setDraggable=function(draggable){
	this.marker.setDraggable(draggable);
}
markerX.prototype.getDraggable=function(){
	return this.marker.getDraggable();
}
markerX.prototype.setTitle=function(title){
	this.marker.setTitle(title);
}
markerX.prototype.getTitle=function(){
	return this.marker.getTitle();
}

markerX.prototype.getThumb=function(){
	return this.thumb;
}
markerX.prototype.getType=function(){
	return this.type;
}

//listener support
markerX.prototype.addListener=function(event,callbackFunction){
	var marker=this.marker;
	var mopsiMarker=this;
	google.maps.event.addListener(this.marker, event, function(){
		callbackFunction(mopsiMarker)
	});
}
markerX.prototype.removeListener = function(type){
	google.maps.event.clearListeners(this.marker, type);
}

// click on marker on the map
markerX.prototype.clickMarkerOnMap = function()
{
  var i, j, n, dist, p, q, type;

  var markersData = this.markersClusteringObj.markersData;
  var myMarker = this;
  var flagZoomToCluster = 0;
  if ( myMarker.clusterIndexes == undefined || myMarker.clusterIndexes == null )
    n = 1;
  else
    n = myMarker.clusterIndexes.length;

  if ( n > 1 )
    type = "cluster";
  else
    type = "single";

  // Are objects in a cluster very close?
  if ( type == "cluster" ) {
    if ( n < 50 && n > 1 ) { // this check is not necessary for big clusters
      for ( i = 0 ; i < n && !flagZoomToCluster ; i++ ) {
        p = myMarker.clusterIndexes[i];
        for ( j = i+1 ; j < n && !flagZoomToCluster ; j++ ) {
          q = myMarker.clusterIndexes[j];
          dist = this.mapEx.hvs(markersData[p].lat,markersData[q].lat,markersData[p].lon, markersData[q].lon);
          if ( dist > 20 ) // in meter
            flagZoomToCluster = 1;
        }
      }
    }
    else
      flagZoomToCluster = 1;
  }

  if ( flagZoomToCluster )
    myMarker.zoomToCluster();
  else
  	myMarker.openOrUpdateInfoWindow();
}

markerX.prototype.clickMarkerViewList = function()
{
  var markersData = this.markersClusteringObj.markersData;
  var requestData = [];
  for(var i in markersData){
    if(this.clusterIndexes.find(parseInt(i)) === -1){
      continue;
    }
    var reqObj = {};
    reqObj.postId = markersData[i].postId;
    reqObj.type = markersData[i].type;
    reqObj.path = markersData[i].photourl
    if(markersData[i].parentPostId){
      reqObj.parentPostId = markersData[i].parentPostId
    }
    requestData.push(reqObj);
  }
  if(requestData.length === 1){
    global.fn_replaceLifeViewDetail(requestData[0], this.map.pageType); //상세페이지 이동
  }else{
    if (this.map.pageType === 'ihLifeView') {
      // 다른사람엔딩노트의 라이프뷰화면
      var templateData = {};
      templateData.contentTmp = 'ihLifeViewDetailAlbum';
      templateData.data = requestData;
      Session.set('ihLifeView templateData', null);
      setTimeout(function(){
        Session.set('ihLifeView templateData', templateData);
      }, 100);
    } else {
      var templateData = {};
      templateData.contentTmp = 'lifeViewDetailAlbum';
      templateData.data = requestData;
      Session.set('endingNoteList templateData', null);
      setTimeout(function(){
        Session.set('endingNoteList templateData', templateData);
      }, 100);
    }
    // Meteor.call('getClickedImgDatas',requestData, function(error, result){
    //   if(error){
    //
    //   }else{
    //     console.log("getClick",result);
    //     result = _.chain(_.compact(result)).sortBy('open').sortBy('like').sortBy('regDate').value().reverse();
    //     var templateData = {};
    //     templateData.contentTmp = 'lifeViewDetailList';
    //     templateData.data = result;
    //     Session.set('endingNoteList templateData', templateData);
    //   }
    // });
  }
}

// click marker or cluster on the map
markerX.prototype.openOrUpdateInfoWindow = function()
{
  var check = false;
  if ( this.mapEx.infoWindow.isOpen ) {
    if ( this.clusterIndexes.indexOf(this.mapEx.infoWindow.index) > -1 ) {
      this.marker.selectedIndex += 1;
      check = true;
    }
  }

  if ( check )
    this.updateInfoWindow();
  else
    this.openInfoWindow();
}

// open infowindow with this.marker.selectedIndex
markerX.prototype.openInfoWindow = function()
{
  var i, selectedIndex, doOpen;
  doOpen = true;

  if ( this.mapEx.infoWindow.isOpen ) {
    if ( this.clusterIndexes.indexOf(this.mapEx.infoWindow.index) > -1 )
      doOpen = false;
  }

  if ( doOpen ) {
    this.mapEx.closeInfoWindow();
    this.marker.selectedIndex = -1;
  }

  this.updateInfoWindow();

  if ( doOpen ) {
    this.mapEx.infoWindow.open(this.map,this.marker);
    this.mapEx.infoWindow.isOpen = true;
  }

}

//infoWindow
markerX.prototype.updateInfoWindow = function()
{
  var N, iconUrl;

  N = this.clusterIndexes.length;

  if ( this.marker.selectedIndex >= N || this.marker.selectedIndex < 0 )
    this.marker.selectedIndex = 0;

  // index for this.mapEx.infoWindow is considered among all data in markersData
  this.mapEx.infoWindow.index = this.clusterIndexes[this.marker.selectedIndex];

  this.mapEx.infoWindow.anchor = this.marker;
  this.mapEx.infoWindow.setContent(this.createInfoWindow());

  // update marker icon
  if ( this.markerStyle == "thumbnail" ) {
    // iconUrl = getThumburlDisplay(this.markersClusteringObj.markersData[this.mapEx.infoWindow.index].photourl);
    // this.setIcon(iconUrl);
  }
}

markerX.prototype.zoomToCluster = function()
{
  // this.mapEx.setBoundsFromIndexes(this.markersClusteringObj.markersData, this.clusterIndexes);
}

markerX.prototype.addLabel = function(markerStyle, type, color, thumb)
{
  var map = this.map;
  this.thumb=thumb;

  if ( this.labelInfo != undefined || type==CLUSTER ) {
    this.label = new Label({
      map:map,
      type:this.type,
      color: color,
      clusterSize:this.clusterSize,
      thumb:this.thumb,
      markerStyle:markerStyle,
      marker:this
    });

    this.label.set('zIndex', 10);
    this.label.bindTo('position', this.marker, 'position');
    if(this.labelInfo==undefined){
      this.labelInfo=" ";
    }
    this.label.set('text', this.labelInfo);
  }
}

markerX.prototype.createInfoWindow=function()
{
  var selectedIndex, content, markersData, indexes, j, c;
  var photourl, address, title, author, date, location;
  var postId, type;

  selectedIndex = this.marker.selectedIndex; // if a cluster has 5 objects, selectedIndex is a number between 0 to 4

  markersData = this.markersClusteringObj.markersData;
  indexes = this.clusterIndexes;

  j = indexes[selectedIndex]; // real index in markersData containing whole data
  photourl = markersData[j].photourl;
  address = markersData[j].address;
  title = markersData[j].name;

  author = markersData[j].author;
  date = markersData[j].date;
  time = markersData[j].time;
  postId = markersData[j].postId;
  type = markersData[j].type;

  if ( this.markerStyle == "thumbnail" && (photourl == "" || photourl == undefined) )
    photourl = clusteringAPIPath + "icon/nophoto.jpg";

  // content = '<div id="infoWindowContentMain" class="infoWindowContentMain" >';
  // content += '<div id="infoWindowTitle" class="infoWindowTitle" ';
  // if ( this.markerStyle == "marker1" )
  //   content += ' style="border-bottom:2px solid black;margin-bottom:10px;" ';
  //
  // content += '>' + title + '</div>';
  //
  // if ( this.markerStyle == "thumbnail" )
  //   content += '<div id="photoInfoWindow" class="photoInfoWindow"><img class="bigThumbnail1" src="' + photourl + '" /></div>';
  //
  // content += '<div class="infoWindowDetailInfo" id="infoWindowDetailInfo">';
  // content += '<div id="dateAndTime">' + date + ', ' + time + '</div><div id="address">' + address +
  //     '<br><b>' + author + '</b></div>';
  //
  // content += '</div>'; // infoWindowDetailInfo
  // content += '<div>'; // infoWindowContentMain
  content = "<button id='loctionDelete' value="+photourl+">위치삭제</button>";
  content += "<div id='postIdVal' value="+postId+" hidden>";
  content += "<div id='typeVal' value="+type+" hidden>";

  return content;
}

markerX.prototype.clickThumbCircleOnMap = function()
{
  this.mapEx.closeInfoWindowByClick = false; // because of the issue of clicking on the circle triggers also click on map
  this.openOrUpdateInfoWindow();
}


//----LABEL----//

function Label(opt_options) {
  var top = "0px;";
     // Initialization
  this.setValues(opt_options);
  this.type=opt_options.type;
  this.thumb=opt_options.thumb;
  this.clusterSize=opt_options.clusterSize;
  this.marker = opt_options.marker;
  this.markerStyle = opt_options.markerStyle;

  switch (this.markerStyle ) {
    case "thumbnail":
      top = "-56px;";
    break;

    case "marker1":
      top = "0px;";
    break;

    default:
      top = "0px;";
    break;
  }

  // Here go the label styles
  var span = this.span_ = document.createElement('span');
  span.style.cssText = 'position: relative; left: 0px; top:'+ top +
                       'white-space: nowrap;color:#000000;' +
                       'font-family: Arial; font-weight: bold;' +
                       'font-size: 15px;';

  var div = this.div_ = document.createElement('div');
  div.appendChild(span);
  div.style.cssText = 'position: absolute; display: none;';
};

Label.prototype = new google.maps.OverlayView;

Label.prototype.onAdd = function()
{
   var pane = this.getPanes().overlayImage;
   pane.appendChild(this.div_);

   // Ensures the label is redrawn if the text or position is changed.
   var me = this;
   this.listeners_ = [
     google.maps.event.addListener(this, 'position_changed', function() { me.draw(); }),
     google.maps.event.addListener(this, 'text_changed', function() { me.draw(); }),
     google.maps.event.addListener(this, 'zindex_changed', function() { me.draw(); })
   ];
};

// Implement onRemove
Label.prototype.onRemove = function()
{
  this.div_.parentNode.removeChild(this.div_);
  // Label is removed from the map, stop updating its position/text.
  for (var i = 0, I = this.listeners_.length; i < I; ++i)
    google.maps.event.removeListener(this.listeners_[i]);
};

// Implement draw
Label.prototype.draw = function() {
  var projection = this.getProjection();
  var position = projection.fromLatLngToDivPixel(this.get('position'));
  var div = this.div_;
  div.style.left = position.x + 'px';
  div.style.top = position.y + 'px';
  div.style.display = 'block';
  div.style.zIndex = 10;

  switch ( this.markerStyle ) {
    case "thumbnail":
      if ( this.thumb!=undefined && this.marker.clusterSize > 1 ) {
        var left=-53;
        var topText=-19;
        var topCircle=-17;
        var icon_filename = 'circle_'+this.color+'.png';
        this.span_.innerHTML = '<img src="'+ clusteringAPIPath + "/photoCollectionFrame.png"+'" style="left: -35px;position: relative;top: 0px;">';
        if ( this.clusterSize!=0 ) {
          var nr=this.clusterSize>99?"*":this.clusterSize;
          var id=Math.round(position.x)+""+Math.round(position.y);
          this.span_.innerHTML += '<img src="'+ clusteringAPIPath + '/'+icon_filename+'" style="cursor: pointer; z-index:1000;left: '+left+'px; position: relative; top: '+topText+'px;width:22px;height:22px; " id="'+id+'" >'+ '<span id="P'+id+'" style="cursor: pointer; z-index:1001;left: 24px;overflow: hidden;position: absolute;text-align: center;top: '+topCircle+'px;width: 20px;"><font color=black>'+nr+'</font></span></img>';
        }
        var me=this;
        $('#P'+Math.round(position.x)+""+Math.round(position.y)).click(function(){
          me.marker.clickThumbCircleOnMap();
        });
      } else {
	    //
      }
    break;

    case "marker1":
      if ( this.marker.clusterSize > 1 ) {
        var left=5;
        var top=22;
        this.span_.innerHTML = '';

          var nr=this.clusterSize>99?"*":this.clusterSize;
          var id=Math.round(position.x)+""+Math.round(position.y);
          this.span_.innerHTML += '<span id="P'+id+'" style="cursor: pointer; z-index:10;left: '+left+'px;overflow: hidden;position: absolute;text-align: center;top: '+top+'px;width: 20px;"><font color=black>'+nr+'</font></span>';
      }
    break;
  }
}
