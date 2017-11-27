import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

Meteor.publish('enTimelineTop', function(userId, userArray, standardDate, limit, type) {
  var aggregate = [];
  if(limit > 0){
    aggregate = getAggTimeLineData(userId, userArray, standardDate,  limit, 'top', type);
  }

  var self = this;
  aggregate.forEach(function(entry) {
    self.added ('endingNoteTimeline', entry._id, entry);
  });
  self.ready();
});


Meteor.publish('enTimelineBottom', function(userId, userArray, standardDate, limit, type) {
  var aggregate = [];

  aggregate = getAggTimeLineData(userId, userArray, standardDate,  limit, 'bottom', type);

  if (aggregate.length === 0) {
    var lastTimelineDate = getAggTimeLineData(userId, userArray, standardDate,  1, 'top', type);
    if (lastTimelineDate.length !== 0) {
      aggregate = getAggTimeLineData(userId, userArray, lastTimelineDate[0].timelineDate,  limit, 'bottom', type);
    }
  }

  var self = this;
  aggregate.forEach(function(entry) {
    self.added ('endingNoteTimeline', entry._id, entry);
  });
  self.ready();
});

var getAggTimeLineData = function(_userId, _userArray, _standardDate, _limit, _case, _type) {
  var type = _type;
  var friendType = _type;

  if(_type === 'ALL'){
    type = /^/;
    friendType = {$in: ['BL','IM','BS']};
  }

  var condStardDate = {};
  var today = global.utilGetDate().defaultYMD;

  switch(_case){
    case 'future':
      if(_standardDate > today){
        condStardDate = { $lte: _standardDate, $gt: today, $ne:'' };
      } else {
        condStardDate = { $gt: today, $ne:'' };
      }
      sortValue = -1;
    break;
    case 'top':
     condStardDate = { $gt: _standardDate, $ne:'' };
     sortValue = 1;
    break;
    case 'bottom':
      condStardDate = { $lte: _standardDate, $ne:'' };
      sortValue = -1;
    break;
  }

  var frineds = _.without(_userArray, _userId);
  return CLT.EnTimeline.aggregate(
  	// Pipeline
  	[
  		// Stage 1
  		{
  			$match: {
  				$or:[
  					{userId : _userId},
  					{
  					  //친구꺼 설정
  					  $and : [
  						{userId : {$in: frineds}},
  						{timeClass : 'start'},
  						{type: friendType }
  					  ],
  					}
  				],
          type: type,
  				contentType:'E'
  			}
  		},

  		// Stage 2
  		{
  			$project: {
          _id:1,
          postId:1,
          userId:1,
          timeClass:1,
          updateDate:1,
          regDate:1,
          isGroup:1,
  			  targetUser: {$cond: { if: {$eq: [ "$userId", _userId ]}, then: '', else: _userId }},
          timelineDate:1
  			}
  		},

  		// Stage 3
  		{
  			$lookup: {
  			    "from" : "users",
  			    "localField" : "targetUser",
  			    "foreignField" : "username",
  			    "as" : "profile"
  			}
  		},

  		// Stage 4
  		{
  			$unwind: {
  			    path : "$profile",
  			    preserveNullAndEmptyArrays : true
  			}
  		},

  		// Stage 5
  		{
  			$project: {
          _id:1,
          postId:1,
          userId:1,
          timeClass:1,
          updateDate:1,
          regDate:1,
          isGroup:1,
          friends : "$profile.profile.friends.accept",
          timelineDate:1,
  			}
  		},

  		// Stage 6
  		{
  			$unwind: {
  			    path : "$friends",
  			    preserveNullAndEmptyArrays : true
  			}
  		},

  		// Stage 7
  		{
  			$project: {
          _id:1,
          postId:1,
          userId:1,
          timeClass:1,
          updateDate:1,
          regDate:1,
          showUp : {$cond:{if:{$eq:["$isGroup",true]}, then:{$cond:{if:{$eq:["$userId",_userId]}, then:true, else:false}}, else: true}},
          isFriend: { $eq: [ "$friends.userId", "$userId" ] },
  			  timelineDate : {$cond: { if: {$eq: [ "$userId", _userId ]}, then: '$timelineDate', else: {$cond: { if: {$lte: [ "$friends.regDate", '$regDate' ]}, then: {$substr:['$regDate',0,10]}, else: '' }}}},
  			}
  		},

  		// Stage 8
  		{
  			$match: {
  				$or : [
  					{friendYn : true},
  					{userId : _userId}
  				],
  				timelineDate : condStardDate,
          showUp:true
  			}
  		},

  		// Stage 9
  		{
  			$sort: {
  			timelineDate: sortValue,
  			regDate: sortValue,
  			timeClass:1
  			}
  		},

  		// Stage 10
  		{
  			$limit: _limit
  		},

  	]
  );
};