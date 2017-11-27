// /**
//  * @name mopsiClustering
//  * @class This class includes functions at logic level for clustering objects
//  *
//  * @param {array of objects} dataIn All input data information that should be clustered and it includes:
//  *  e.g. dataIn[i].x and dataIn[i].y
//  * @param {json} params includes all required parameters for clustering,
//  *  e.g. for grid-based clustering:
//  *  params.type in this case it is "gridBased"
//  *  params.minX minimum x in x axis of view
//  *  params.maxX maximum x in x axis of view
//  *  params.minY minimum y in y axis of view
//  *  params.maxY maximum y in y axis of view
//  *  params.cellHeight cell height in grid
//  *  params.cellWidth cell width in grid
//  *  params.cellWidth cell width in grid
//  *  params.distMerge distance threshold to merge two clusters
//  *  params.representativeType determines the criteria for the location of clusters' reprersentatives which
//  *   can be "mean", "first" and "middleCell"
//  * @return {json} dataOut includes all information about output clusters and also cluster labels of input data, it includes:
//  *  dataOut.numClusters {number} represents number of clusters
//  *  dataOut.dataSize {number} represents size of input data
//  *  dataOut.clusters {array} represents information of clusters and includes:
//  *   dataOut.clusters[i].clusterSize {number} the size of cluster i
//  *   dataOut.clusters[i].group {array} the indexes of the objects in cluster i among whole input data
//  *   dataOut.clusters[i].represent {array} the representative of cluster i, for grid-based clustering it includes:
//  *    dataOut.clusters[i].represent[0] x value of location of representative (in pixel)
//  *    dataOut.clusters[i].represent[1] y value of location of representative (in pixel)
//  *  dataOut.dataLabel {array} represents cluster label for every input data
//  */
//
// function mopsiClustering(dataIn, params)
// {
//   this.params = params;
//   this.dataIn = dataIn;
//   this.init();
// }
//
// /**
//  * intitialization and checking input data and parameters
//  */
// mopsiClustering.prototype.init = function()
// {
//
// }
//
// /**
//  * clustering procedure starts here
//  */
// mopsiClustering.prototype.applyClustering = function()
// {
//
//   switch ( this.params.type ) {
//     case "overlap":
// 	  this.overlappedItemsClustering();
// 	  break;
//     case "gridbased":
//       this.gridBasedClustering();
// 	  break;
//     case "clutter_noClustering":
//       this.clutterNoClustering();
//       break;
// 	default:
// 	  break;
//   }
//
//   return this.dataOut;
// }
//
// /**
//  * main flow of grid based clustering
// */
// mopsiClustering.prototype.gridBasedClustering = function()
// {
//   var clusters, representType, clustersOrder;
//   representType = this.params.representativeType; // mean or first
//
//   clusters = this.initializeGridBasedClusters();
//   clustersOrder = this.assignPointsToCells(clusters);
//   this.setRepresentatives(clusters, clustersOrder, representType);
//   this.checkOverlapAmongNeighbors(clusters, clustersOrder, representType);
//   this.dataOut = this.constructOutputClusters(clusters, clustersOrder, true, representType);
// }
//
// /**
//  * it checks a cluster with 8 neighbor cells (if contains clusters) for overlap,
//  * in case of overlap, it merges two clusters
//  */
// mopsiClustering.prototype.checkOverlapAmongNeighbors = function(clusters, clustersOrder, representType)
// {
//   var i, j, c, cluster1, cluster2, numColumn, index1, index2;
//
//   numColumn = clusters.numColumn;
//
//   // initialize parent of each cluster as itself
//   for (c=0; c < clustersOrder.length; c++) {
//     i = clustersOrder[c];
//     clusters.clusters[i].parent = i;
//   }
//
//   for (c=0; c < clustersOrder.length; c++) {
//     index1 = clustersOrder[c];
//     cluster1 = clusters.clusters[index1];
//
//     if (cluster1.valid == false)
//       continue;
//
//     // check 8 neighbors
//     for ( j = 0 ; j < 9 ; j++ ) {
//       index2 = this.getNeighbourCellNum(j, index1, numColumn);
//       cluster2 = clusters.clusters[index2];
//
//       if ( cluster2 != undefined && index2 != index1 && cluster2.clusterSize > 0 ) {
//         index2 = this.checkForMerge(clusters, index1, index2, representType); // might be new index different from index2
//         if ( index2 != -1 )
//           this.mergeTwoClusters(clusters, index1, index2, representType);
//       }
//     }
//   }
// }
//
// /**
//  * merge two clusters
//  * cluster index2 is merged in cluster index1
//  * the representative locations of both clusters are updated to new location
//  */
// mopsiClustering.prototype.mergeTwoClusters = function(clusters, index1, index2, representType)
// {
//   var cluster1, cluster2, point1, point2, k, n1, n2;
//
//   point1 = {};
//   point2 = {};
//   cluster1 = clusters.clusters[index1];
//   cluster2 = clusters.clusters[index2];
//
//   n1 = cluster1.group.length;
//   n2 = cluster2.group.length;
//   point1.x = cluster1.represent[0];
//   point1.y = cluster1.represent[1];
//   point2.x = cluster2.represent[0];
//   point2.y = cluster2.represent[1];
//
//   for (k=0; k < n2; k++) {
//     cluster1.group.push(cluster2.group[k]);
//     clusters.dataLabel[cluster2.group[k]] = index1;
//   }
//   cluster1.clusterSize += cluster2.clusterSize;
//   cluster2.valid = false; // not valid after merged into cluster1
//
//   // update the representative
//   if ( representType == "mean" ) {
//     cluster1.represent[0] = (point1.x*n1+point2.x*n2)/(n1+n2);
//     cluster1.represent[1] = (point1.y*n1+point2.y*n2)/(n1+n2);
//     cluster2.represent[0] = cluster1.represent[0];
//     cluster2.represent[1] = cluster1.represent[1];
//     cluster2.parent = index1;
//   }
//   if ( representType == "first" ) {
//     cluster1.represent[0] = point1.x;
//     cluster1.represent[1] = point1.y;
//   }
// }
//
// /**
//  * it checks two clusters index1 and index2 for overlap based on the distance between their representatives
//  * if cluster index2 is already merged with another cluster, its parents are checked
//  */
// mopsiClustering.prototype.checkForMerge = function(clusters, index1, index2, representType)
// {
//   var flagC, cnt, cluster1, cluster2, point1, point2, minDist, indexX;
//
//   indexX = index2;
//   flagC = false;
//   point1 = {};
//   point2 = {};
//   cluster1 = clusters.clusters[index1];
//   cluster2 = clusters.clusters[index2];
//   minDist = this.params.distMerge; // threshold in pixel
//
//   point1.x = cluster1.represent[0];
//   point1.y = cluster1.represent[1];
//   point2.x = cluster2.represent[0];
//   point2.y = cluster2.represent[1];
//   dist = this.EucDistance(point1, point2); // between two representative
//
//   if (dist < minDist) {
//     flagC = true;
//     if ( representType == "mean" ) {
//       cnt = 0;
//       while ( cluster2.valid == false && flagC ) {
//         if ( cluster2.parent == index1 )
//           flagC = false;
//         else {
//           indexX = cluster2.parent;
//           cluster2 = clusters.clusters[cluster2.parent];
//           // parent has same representative, so no need to update point2 and check dist,
//           // we update the location of a cluster to new representative location when it is merged
//         }
//
//         if ( cnt > 50 ) {
//           alert(index1+" "+index2);
//           alert("Too many check for neighbors in grid-based clustering!");
//           flagC = false;
//         }
//
//         cnt++;
//       }
//     }
//
//     if ( representType == "first" && cluster2.valid == false )
//       flagC = false;
//   }
//
//   if ( flagC )
//     return indexX;
//   else
//     return -1;
// }
//
// /**
//  * it finds the cell containing every input data and constructs the initial clusters
//  * the points in the same cell are considered in one cluster
//  */
// mopsiClustering.prototype.assignPointsToCells = function(clusters)
// {
//   var dataSize, x, y, k, i, j;
//   var lat, lng, numRow, numColumn, clustersOrder;
//
//   numRow = clusters.numRow;
//   numColumn = clusters.numColumn;
//   dataSize = this.dataIn.length;
//
//   j = 0;
//   clustersOrder = new Array();
//   for ( i=0; i < dataSize; i++) {
//     x = this.dataIn[i].x;
//     y = this.dataIn[i].y;
//
//     k = this.getCellNum(x, y, numColumn, numRow);
//
//     clusters.dataLabel[i] = k;
//     if(k == -1)
//       continue;
//
// 	if ( k < 0 || k >= clusters.numCells || (clusters.clusters[k] == undefined) )
//       alert("Fatal error: in grid-based clustering in clustering.js");
//
//     if ( clusters.clusters[k].clusterSize == 0 ) {
//       clustersOrder[j] = k;
//       j++;
//     }
//
// 	clusters.clusters[k].group[clusters.clusters[k].clusterSize] = i;
// 	clusters.clusters[k].clusterSize += 1;
// 	clusters.clusters[k].valid = true;
//   }
//
//   return clustersOrder;
// }
//
// /**
//  * it provides grid based on input parameters and initializes clusters
//  * every cell in the grid is ceonsidered as an empty cluster
//  */
// mopsiClustering.prototype.initializeGridBasedClusters = function()
// {
//   var dataSize, clusters, i;
//   var numRow, numColumn, minX, maxX, minY, maxY;
//
//   maxX = this.params.maxX;
//   maxY = this.params.maxY;
//   minX = this.params.minX;
//   minY = this.params.minY;
//   dataSize = this.dataIn.length;
//
//   clusters = {};
//   clusters.clusters = [];
//   clusters.dataLabel = [];
//
//   numRow = Math.ceil((maxY - minY)/this.params.cellHeight);
//   numColumn = Math.ceil((maxX - minX)/this.params.cellWidth);
//   clusters.numCells = numRow*numColumn;
//
//   for (i=0; i < dataSize; i++)
//     clusters.dataLabel[i] = -1;
//
//   for (i=0; i < clusters.numCells; i++) {
//     clusters.clusters[i] = {};
//     clusters.clusters[i].clusterSize = 0; // counter over clusters
//     clusters.clusters[i].valid = false; // counter over clusters
//     clusters.clusters[i].group = [];
//     clusters.clusters[i].represent = [];
//   }
//
//   clusters.dataSize = dataSize;
//   clusters.numRow = numRow;
//   clusters.numColumn = numColumn;
//
//   return clusters;
// }
//
// /**
//  * it does not apply clustering to remove clutter and just provides same output data format
//  */
// mopsiClustering.prototype.clutterNoClustering = function()
// {
//   var dataSize, clusters, x, y;
//   var i;
//
//   var maxX = this.params.maxX;
//   var maxY = this.params.maxY;
//   var minX = this.params.minX;
//   var minY = this.params.minY;
//
//   dataSize = this.dataIn.length;
//
//   clusters = {};
//   clusters.clusters = [];
//   clusters.dataLabel = [];
//
//   clusters.numClusters = dataSize;
//
//   for(i=0; i < dataSize; i++)
//     clusters.dataLabel[i] = -1;
//
//   for(i=0; i < clusters.numClusters; i++) {
//     clusters.clusters[i] = {};
//     clusters.clusters[i].clusterSize = 0;
//     clusters.clusters[i].valid = false;
//     clusters.clusters[i].group = [];
//     clusters.clusters[i].represent = [];
//   }
//
//   clusters.dataSize = dataSize;
//
//   for( i=0; i < dataSize; i++) {
//     x = this.dataIn[i].x;
//     y = this.dataIn[i].y;
//
//     clusters.dataLabel[i] = i;
//
// 	clusters.clusters[i].group[0] = i;
// 	clusters.clusters[i].clusterSize += 1;
// 	clusters.clusters[i].valid = true;
//
//     clusters.clusters[i].represent[0] = x;
//     clusters.clusters[i].represent[1] = y;
//   }
//
//   this.dataOut = clusters;
//
// }
//
// /**
//  * clustering algorithm to remove overlap of markers:
//  * it check the distance of markers to a marker and the close markers are merged into it
//  */
// mopsiClustering.prototype.overlappedItemsClustering = function()
// {
//   var cnt, dataSize, markerWidth, markerHeight, i, j, dataOut, groupID, visited, distFlag;
//
//   markerWidth = this.params.width;
//   markerHeight = this.params.height;
//   dataSize = this.dataIn.length;
//   dataOut = {};
//   dataOut.clusters = [];
//   dataOut.dataLabel = [];
//   visited = [];
//   for(i=0; i < dataSize; i++)
//   {
//     visited[i] = 0;
// 	dataOut.clusters[i] = {};
//     dataOut.clusters[i].clusterSize = 1; // at least one bubble in each cluster at first
//     dataOut.dataLabel[i] = -1;
//   }
//   dataOut.nrepresent = 2;
//
//   groupID = 0;
//   for ( i=0; i < dataSize; i++ )
//     if (visited[i] != 1)
//     {
// 	  visited[i] = 1;
//       dataOut.dataLabel[i] = groupID;
// 	  dataOut.clusters[groupID].represent = [];
// 	  dataOut.clusters[groupID].group = [];
//       dataOut.clusters[groupID].represent[0] = this.dataIn[i].x;
// 	  dataOut.clusters[groupID].represent[1] = this.dataIn[i].y;
// 	  dataOut.clusters[groupID].group[0] = i;
//       for (j=i+1; j < dataSize; j++)
//         if (visited[j] != 1) {
//           distFlag = this.checkDist(this.dataIn[i] , this.dataIn[j]);
//           if (!distFlag) { // two points are considered as in one cluster
//             dataOut.dataLabel[j] = groupID;
// 			cnt = dataOut.clusters[groupID].clusterSize;
// 			dataOut.clusters[groupID].group[cnt] = j;
// 			dataOut.clusters[groupID].clusterSize += 1;
//             visited[j] = 1;
//
//           }
//         }
// 	  groupID++;
//     }
//
//   dataOut.numClusters = groupID;
//
//   this.dataOut = dataOut;
// }
//
// /**
//  * provides variable as output data of clustering
//  */
// mopsiClustering.prototype.constructOutputClusters = function(clusters)
// {
//   var i, j, k, dataOut;
//
//   dataOut = {};
//   dataOut.clusters = [];
//   dataOut.dataLabel = [];
//   k = 0;
//   for ( i=0; i < clusters.numCells; i++ ) {
//     if ( clusters.clusters[i].valid == true ) {
// 	  dataOut.clusters.push(clusters.clusters[i]);
// 	  for ( j = 0; j < clusters.clusters[i].clusterSize ; j++)
// 	    dataOut.dataLabel[clusters.clusters[i].group[j]] = k;
// 	  k++;
// 	}
//   }
//
//   dataOut.numClusters = dataOut.clusters.length;
//   dataOut.dataSize = clusters.dataSize;
//
//   return dataOut;
// }
//
// /**
//  * finds representative location for every cluster
//  */
// mopsiClustering.prototype.setRepresentatives = function(clusters, clustersOrder, representType)
// {
//   var i, k, t, dataIn;
//
//   dataIn = this.dataIn;
//
//   for (i=0; i < clustersOrder.length ; i++) {
//     k = clustersOrder[i]; // cluster number
//     switch ( representType ) {
//       case "gridMiddle":
//         this.setRepresentativeCellMiddle(clusters, k);
//         break;
//
//       case "first":
//         t = clusters.clusters[k].group[0];
//         clusters.clusters[k].represent[0] = dataIn[t].x; // center of the grid
//         clusters.clusters[k].represent[1] = dataIn[t].y;
//         break;
//
//       case "mean":
//       default:
//         this.setRepresentativeMean(clusters, k);
//         break;
//     }
//   }
// }
//
// /**
//  * calculates the middle location of cell as representative location for cluster
//  */
// mopsiClustering.prototype.setRepresentativeCellMiddle = function(clusters, k)
// {
//   var nC, nR, numColumn;
//
//   numColumn = clusters.numColumn;
//
//   nC = k%numColumn;
//   nR = Math.floor(k/numColumn);
//   clusters.clusters[k].represent[0] = Math.floor(this.params.minX + (nC*this.params.cellWidth)+this.params.cellWidth/2); // center of the grid
//   clusters.clusters[k].represent[1] = Math.floor(this.params.minY + (nR*this.params.cellHeight)+this.params.cellHeight/2);
// }
//
// /**
//  * calculates the average location of objects in a cluster as representative location
//  */
// mopsiClustering.prototype.setRepresentativeMean = function(clusters, k)
// {
//   var tmpX, tmpY, j, n, t, dataIn;
//
//   dataIn = this.dataIn;
//
//   tmpX = 0;
//   tmpY = 0;
//   n = clusters.clusters[k].clusterSize;
//   for ( j = 0; j < n ; j++) {
//     t = clusters.clusters[k].group[j];
//     tmpX += dataIn[t].x;
//     tmpY += dataIn[t].y;
//   }
//
//   tmpX /= n;
//   tmpY /= n;
//
//   clusters.clusters[k].represent[0] = tmpX;
//   clusters.clusters[k].represent[1] = tmpY;
// }
//
// /**
//  * calculates Euclidean distance between two points in cartezian space
//  */
// mopsiClustering.prototype.EucDistance = function(point1, point2)
// {
//   var tempX, tempY;
//   tempX = (point1.x - point2.x)*(point1.x - point2.x);
//   tempY = (point1.y - point2.y)*(point1.y - point2.y);
//
//   return Math.sqrt(tempX+tempY);
// }
//
// /**
//  * check whether the disatce between two points is bigger than marker dimensions
//  */
// mopsiClustering.prototype.checkDist = function(point1, point2)
// {
//   if(Math.abs(point1.x - point2.x) > this.params.width || Math.abs(point1.y - point2.y) > this.params.height )
//     return true;
//   else
//     return false;
// }
//
// /**
//  * finds the cell number containing a point
//  */
// mopsiClustering.prototype.getCellNum = function(x, y, numColumn, numRow)
// {
//   var row, column;
//   var clusterNum;
//
//   var maxX = this.params.maxX;
//   var maxY = this.params.maxY;
//   var minX = this.params.minX;
//   var minY = this.params.minY;
//
//   // photo is out of the map bounding box
//   if( x > maxX || x < minX || y > maxY || y < minY )
//     return -1;
//
//   row = Math.floor((y-minY)/this.params.cellHeight);
//   column = Math.floor((x-minX)/this.params.cellWidth);
//
//   if ( row < 0 )
//     row = 0;
//
//   if ( row >= numRow )
//     row = numRow - 1;
//
//   if ( column < 0 )
//     column = 0;
//
//   if ( column >= numColumn )
//     column = numColumn - 1;
//
//   clusterNum = row*numColumn + column;
//   return clusterNum;
// }
//
// /**
//  * find the cell index of neighbour cluster k (0 to 8) in grid,
//  *
//  * the nubmers of 8 neighbours are shown as below
//  * (index-numColumn-1)  (index-numColumn)  (index-numColumn+1)
//  *     (index-1)          index          index+1
//  * (index+numColumn-1)  (index+numColumn)  (index+numColumn+1)
//  */
// mopsiClustering.prototype.getNeighbourCellNum = function(k, index, numColumn)
// {
//   var r = Math.floor(k/3);
//   var c = k%3;
//   var n;
//
//   if(r == 0) {
//     n = index - numColumn -1 + c;
//   }else if(r == 1) {
//     n = index - 1 + c;
//   }else if(r == 2) {
//     n = index + numColumn - 1 + c;
//   }
//
//   return n;
// }