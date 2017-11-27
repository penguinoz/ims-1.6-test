import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';


Meteor.methods({
  getLikeData:function(_userId, _searchTxt, _searchType, _sortBy, _tab){
    var result = {};
    var toResult = [];
    var fromResult = [];
    var regex = [];


    var searchText = _searchTxt ? _searchTxt.split(',') : [];
    var srchTextTemp = [];
    for (var t = 0; t < searchText.length; t++) {
      srchTextTemp.push(searchText[t].trim()); // 앞뒤 공백 제거
    }
    searchText = srchTextTemp;

    if(searchText[0]){
      for (var s = 0; s < searchText.length; s++) {
        var titleRegexStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
        regex.push(titleRegexStr);
      }
    } else {
      var regexStr = new RegExp(["^.*.*"].join(""), "gi");
      regex.push(regexStr);
    }

    switch (_searchType) {
      case 'title':
      condition=[{'title': {$in: regex}}];
      break;
      case 'nick':
      condition = [
        {"userNick":{$in: regex}},
      ];
      break;
      default:
      condition = [
        {'title': {$in: regex}},
        {"userNick":{$in: regex}},
      ];
    }

    var lookupIM = {
      "from" : "endingNoteStory",
      "localField" : "postId",
      "foreignField" : "_id",
      "as" : "story"
    };
    var lookupBL = {
      "from" : "endingNoteBucketList",
      "localField" : "postId",
      "foreignField" : "_id",
      "as" : "bucket"
    };
    var lookupTC = {
      "from" : "endingNoteTimeCapsule",
      "localField" : "postId",
      "foreignField" : "_id",
      "as" : "timeCapsule"
    };
    var lookupUser1= {
      "from" : "users",
      "localField" : "authorId",
      "foreignField" : "username",
      "as" : "nicks"
    };
    var lookupUser2= {
      "from" : "users",
      "localField" : "userId",
      "foreignField" : "username",
      "as" : "nicks"
    };

    var unwindIm = { path : "$story", preserveNullAndEmptyArrays: true};
    var unwindBL = { path : "$bucket", preserveNullAndEmptyArrays: true};
    var unwindTC = { path : "$timeCapsule", preserveNullAndEmptyArrays: true};
    var unwindUser = { path : "$nicks", preserveNullAndEmptyArrays: true};
    var project = {
      _id: 1,
      type: {
        $cond: { if: { $gte: [ "$type", 0 ] }, then: '$type', else: 'TC' } //type 컬럼에 값이 있으면 type컬럼값 출력 없으면 'TC'로 출력
      },
      postId:{
        $cond: { if: { $eq: [ "$type", 'IM' ] }, then: '$story._id', else: {
          $cond: { if: { $eq: [ "$type", 'BS' ] }, then: '$story.postId', else: {
            $cond: { if: { $eq: [ "$type", 'BL' ] }, then: '$bucket._id', else: {
              $cond: { if: { $lte: [ "$type", 'TC' ] }, then: '$timeCapsule._id', else:''
            }}}}}
          }
        }
      },
      userId : 1,
      authorId:1,
      userNick: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$nicks.profile.nickName', else: '$nicks.profile.nickName' }
      },
      targetUserId: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$nicks.username', else: '$nicks.username' }
      },
      title:{
        $cond: { if: { $eq: [ "$type", 'IM' ] }, then: '$story.title', else: {
          $cond: { if: { $eq: [ "$type", 'BS' ] }, then: '$story.title', else: {
            $cond: { if: { $eq: [ "$type", 'BL' ] }, then: '$bucket.title', else: {
              $cond: { if: { $lte: [ "$type", 'TC' ] }, then: '$timeCapsule.title', else:''
            }}}}}
          }
        }
      },
      regDate: 1
    };

    var toStage = [
      {$lookup : lookupIM},
      {$lookup : lookupBL},
      {$lookup : lookupTC},
      {$lookup : lookupUser1},
      {$unwind : unwindIm},
      {$unwind : unwindBL},
      {$unwind : unwindUser},
      {$project: project},
      {$match: {$and : [
        {userId : _userId},
        {$or: condition}
      ]}}
      // {$limit: limit},
    ];

    var fromStage = [
      {$lookup : lookupIM},
      {$lookup : lookupBL},
      {$lookup : lookupTC},
      {$lookup : lookupUser2},
      {$unwind : unwindIm},
      {$unwind : unwindBL},
      {$unwind : unwindUser},
      {$project: project},
      {$match: {$and : [
        {authorId : _userId},
        {$or: condition}
      ]}},
      {$sort:{regDate:-1}}
      // {$limit: limit},
    ];

    if(Meteor.isServer){
      toResult = CLT.ImsLike.aggregate(toStage);
      fromResult = CLT.ImsLike.aggregate(fromStage);
      fromResult = _.chain(fromResult).groupBy("postId").map(function(value,key){
        return{
          postId: key,
          type: value[0].type,
          regDate: value[0].regDate,
          title: value[0].title,
          targetUserIds: _.map(value, function(a){return a.targetUserId;})
        };
      }).value();
    }
    switch(_sortBy){
      case 'regDateDesc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
      break;
      case 'regDateAsc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').value() : fromResult;
      break;
      case 'titleDesc':
      result.to = toResult ? _.chain(toResult).sortBy('title').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').reverse().value() : fromResult;
      break;
      case 'titleAsc':
      result.to = toResult ? _.chain(toResult).sortBy('title').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').value() : fromResult;
      break;
      default:
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
    }
    return result;
  },
  getFavoriteData:function(_userId, _searchTxt, _searchType, _sortBy, _tab){
    var result = {};
    var toResult = [];
    var fromResult = [];
    var regex = [];


    var searchText = _searchTxt ? _searchTxt.split(',') : [];
    var srchTextTemp = [];
    for (var t = 0; t < searchText.length; t++) {
      srchTextTemp.push(searchText[t].trim()); // 앞뒤 공백 제거
    }
    searchText = srchTextTemp;

    if(searchText[0]){
      for (var s = 0; s < searchText.length; s++) {
        var titleRegexStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
        regex.push(titleRegexStr);
      }
    } else {
      var regexStr = new RegExp(["^.*.*"].join(""), "gi");
      regex.push(regexStr);
    }

    switch (_searchType) {
      case 'title':
      condition=[{'title': {$in: regex}}];
      break;
      case 'nick':
      if(_.isEqual('toTab', _tab)){
        condition = [
          {"userNick":{$in: regex}},
        ];
      }else{
        condition = [
          {"userNick":{$in: regex}},
        ];
      }
      break;
      default:
      if(_.isEqual('toTab', _tab)){
        condition = [
          {"title": {$in: regex}},
          {"userNick":{$in: regex}},
        ];
      }else{
        condition = [
          {"title": {$in: regex}},
          {"userNick":{$in: regex}},
        ];
      }
    }

    var lookup1 = {
      "from" : "endingNoteBucketList",
      "localField" : "contentId",
      "foreignField" : "_id",
      "as" : "bucket"
    };
    var lookup2= {
      "from" : "users",
      "localField" : "authorId",
      "foreignField" : "username",
      "as" : "nicks"
    };
    var lookup3= {
      "from" : "users",
      "localField" : "userId",
      "foreignField" : "username",
      "as" : "nicks"
    };

    var unwind1 = "$nicks";
    var unwind2 = "$bucket";
    var project = {
      _id: 1,
      type:1,
      userId : 1,
      contentId:1,
      authorId:1,
      userNick: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$nicks.profile.nickName', else: '$nicks.profile.nickName' }
      },
      targetUserId: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$nicks.username', else: '$nicks.username' }
      },
      title:{
        $cond: { if: { $gte: [ "$bucket", 0 ] }, then: '$bucket.title', else: '$bucket.title' }
      },
      regDate: 1,
    };

    var toStage = [
      {$lookup : lookup1},
      {$lookup : lookup2},
      {$unwind : unwind1},
      {$unwind : unwind2},
      {$project: project},
      {$match: {$and : [
        {userId : _userId},
        {$or: condition}
      ]}}
      // {$limit: limit},
    ];

    var fromStage = [
      {$lookup : lookup1},
      {$lookup : lookup3},
      {$unwind : unwind1},
      {$unwind : unwind2},
      {$project: project},
      {$match: {$and : [
        {authorId : _userId},
        {$or: condition}
      ]}},
      {$sort:{regDate:-1}}
      // {$limit: limit},
    ];

    if(Meteor.isServer){
      toResult = CLT.ImsFavor.aggregate(toStage);
      fromResult = CLT.ImsFavor.aggregate(fromStage);
      fromResult = _.chain(fromResult).groupBy("contentId").map(function(value,key){
        return{
          contentId: key,
          type: value[0].type,
          regDate: value[0].regDate,
          title: value[0].title,
          // userNick: _.map(value, function(a){return a.userNick;}),
          targetUserIds: _.map(value, function(a){return a.targetUserId;})
        };
      }).value();
    }
    switch(_sortBy){
      case 'regDateDesc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
      break;
      case 'regDateAsc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').value() : fromResult;
      break;
      case 'titleDesc':
      result.to = toResult ? _.chain(toResult).sortBy('title').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').reverse().value() : fromResult;
      break;
      case 'titleAsc':
      result.to = toResult ? _.chain(toResult).sortBy('title').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').value() : fromResult;
      break;
      default:
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
    }
    return result;
  },
  getCommentData:function(_userId, _searchTxt, _searchType, _sortBy, _tab){
    var result = {};
    var toResult = [];
    var fromResult = [];
    var regex = [];


    var searchText = _searchTxt ? _searchTxt.split(',') : [];
    var srchTextTemp = [];
    for (var t = 0; t < searchText.length; t++) {
      srchTextTemp.push(searchText[t].trim()); // 앞뒤 공백 제거
    }
    searchText = srchTextTemp;

    if(searchText[0]){
      for (var s = 0; s < searchText.length; s++) {
        var titleRegexStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
        regex.push(titleRegexStr);
      }
    } else {
      var regexStr = new RegExp(["^.*.*"].join(""), "gi");
      regex.push(regexStr);
    }

    switch (_searchType) {
      case 'title':
      condition=[{'title': {$in: regex}}];
      break;
      case 'nick':
      condition = [
        {"userNick":{$in: regex}},
      ];
      break;
      default:
      condition = [
        {'title': {$in: regex}},
        {"userNick":{$in: regex}},
      ];
    }

    var lookupIM = {
      "from" : "endingNoteStory",
      "localField" : "postId",
      "foreignField" : "_id",
      "as" : "story"
    };
    var lookupBL = {
      "from" : "endingNoteBucketList",
      "localField" : "postId",
      "foreignField" : "_id",
      "as" : "bucket"
    };
    var lookupTC = {
      "from" : "endingNoteTimeCapsule",
      "localField" : "postId",
      "foreignField" : "_id",
      "as" : "timeCapsule"
    };
    var lookupUser1= {
      "from" : "users",
      "localField" : "postUserId",
      "foreignField" : "username",
      "as" : "nicks"
    };
    var lookupUser2= {
      "from" : "users",
      "localField" : "userId",
      "foreignField" : "username",
      "as" : "nicks"
    };

    var unwindIm = { path : "$story", preserveNullAndEmptyArrays: true};
    var unwindBL = { path : "$bucket", preserveNullAndEmptyArrays: true};
    var unwindTC = { path : "$timeCapsule", preserveNullAndEmptyArrays: true};
    var unwindUser = { path : "$nicks", preserveNullAndEmptyArrays: true};
    var project = {
      _id: 1,
      type: {
        $cond: { if: { $gte: [ "$type", 0 ] }, then: '$type', else: 'TC' } //type 컬럼에 값이 있으면 type컬럼값 출력 없으면 'TC'로 출력
      },
      postId:{
        $cond: { if: { $eq: [ "$type", 'IM' ] }, then: '$story._id', else: {
          $cond: { if: { $eq: [ "$type", 'BS' ] }, then: '$story.postId', else: {
            $cond: { if: { $eq: [ "$type", 'BL' ] }, then: '$bucket._id', else: {
              $cond: { if: { $lte: [ "$type", 'TC' ] }, then: '$timeCapsule._id', else:''
            }}}}}
          }
        }
      },
      userId : 1,
      postUserId:1,
      userNick: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$nicks.profile.nickName', else: '$nicks.profile.nickName' }
      },
      targetUserId: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$nicks.username', else: '$nicks.username' }
      },
      title:{
        $cond: { if: { $eq: [ "$type", 'IM' ] }, then: '$story.title', else: {
          $cond: { if: { $eq: [ "$type", 'BS' ] }, then: '$story.title', else: {
            $cond: { if: { $eq: [ "$type", 'BL' ] }, then: '$bucket.title', else: {
              $cond: { if: { $lte: [ "$type", 'TC' ] }, then: '$timeCapsule.title', else:''
            }}}}}
          }
        }
      },
      regDate: 1
    };

    var toStage = [
      {$lookup : lookupIM},
      {$lookup : lookupBL},
      {$lookup : lookupTC},
      {$lookup : lookupUser1},
      {$unwind : unwindIm},
      {$unwind : unwindBL},
      {$unwind : unwindUser},
      {$project: project},
      {$match: {$and : [
        {userId : _userId},
        {$or: condition}
      ]}}
      // {$limit: limit},
    ];

    var fromStage = [
      {$lookup : lookupIM},
      {$lookup : lookupBL},
      {$lookup : lookupTC},
      {$lookup : lookupUser2},
      {$unwind : unwindIm},
      {$unwind : unwindBL},
      {$unwind : unwindUser},
      {$project: project},
      {$match: {$and : [
        {postUserId : _userId},
        {$or: condition}
      ]}},
      {$sort:{regDate:-1}}
      // {$limit: limit},
    ];

    if(Meteor.isServer){
      toResult = CLT.ImsComment.aggregate(toStage);
      fromResult = CLT.ImsComment.aggregate(fromStage);
      fromResult = _.chain(fromResult).groupBy("postId").map(function(value,key){
        return{
          postId: key,
          type: value[0].type,
          regDate: value[0].regDate,
          title: value[0].title,
          targetUserIds: _.map(value, function(a){return a.targetUserId;})
        };
      }).value();
    }
    switch(_sortBy){
      case 'regDateDesc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
      break;
      case 'regDateAsc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').value() : fromResult;
      break;
      case 'titleDesc':
      result.to = toResult ? _.chain(toResult).sortBy('title').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').reverse().value() : fromResult;
      break;
      case 'titleAsc':
      result.to = toResult ? _.chain(toResult).sortBy('title').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').value() : fromResult;
      break;
      default:
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
    }
    return result;
  },
  getFollowData:function(_userId, _searchTxt, _searchType, _sortBy, _tab){
    var result = {};
    var toResult = [];
    var fromResult = [];
    var regex = [];
    var userIdCondition = [];
    var followedContents = [];

    var searchText = _searchTxt ? _searchTxt.split(',') : [];
    var srchTextTemp = [];
    for (var t = 0; t < searchText.length; t++) {
      srchTextTemp.push(searchText[t].trim()); // 앞뒤 공백 제거
    }
    searchText = srchTextTemp;

    if(searchText[0]){
      for (var s = 0; s < searchText.length; s++) {
        var titleRegexStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
        regex.push(titleRegexStr);
      }
    } else {
      var regexStr = new RegExp(["^.*.*"].join(""), "gi");
      regex.push(regexStr);
    }

    switch (_searchType) {
      case 'title':
      condition=[{'title': {$in: regex}}];
      break;
      case 'nick':
      condition = [
        {"userNick":{$in: regex}},
      ];
      break;
      default:
      condition = [
        {"title": {$in: regex}},
        {"userNick":  {$in: regex}},
      ];
    }

    var lookupNest = {
      "from" : "endingNoteBucketList",
      "localField" : "_id",
      "foreignField" : "postId",
      "as" : "nested"
    };
    var lookupUser= {
      "from" : "users",
      "localField" : "userId",
      "foreignField" : "username",
      "as" : "userNick"
    };
    var lookupUser2= {
      "from" : "users",
      "localField" : "nestUserId",
      "foreignField" : "username",
      "as" : "userNick"
    };

    var unwindNest = { path : "$nested", preserveNullAndEmptyArrays: true};
    var unwindUser= { path : "$userNick", preserveNullAndEmptyArrays: true};

    var project = {
      _id: 1,
      userId: 1,
      nestUserId : {
        $cond: { if: { $gte: [ "$nested.userId", 0 ] }, then: '$nested.userId', else: '$nested.userId' }
      },
      userNick:{
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$userNick.profile.nickName', else: '$userNick.profile.nickName' }
      },
      targetUserId: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$userNick.username', else: '$userNick.username' }
      },
      follow: 1,
      postId: 1,
      postUserId :1,
      type: {
        $cond: { if: { $gte: [ "$type", 0 ] }, then: '$type', else: 'TC' } //type 컬럼에 값이 있으면 type컬럼값 출력 없으면 'TC'로 출력
      },
      title:1,
      regDate: 1,
    };


    var project2 = {
      _id: 1,
      userId: 1,
      nestUserId : {
        $cond: { if: { $gte: [ "$nested.userId", 0 ] }, then: '$nested.userId', else: '$nested.userId' }
      },
      userNick:{
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$userNick.profile.nickName', else: '$userNick.profile.nickName' }
      },
      targetUserId: {
        $cond: { if: { $gte: [ "$userId", 0 ] }, then: '$userNick.username', else: '$userNick.username' }
      },
      follow: 1,
      postId: 1,
      postUserId :1,
      type: {
        $cond: { if: { $gte: [ "$type", 0 ] }, then: '$type', else: 'TC' } //type 컬럼에 값이 있으면 type컬럼값 출력 없으면 'TC'로 출력
      },
      title:1,
      regDate: {
        $cond: { if: { $gte: [ "$nested.regDate", 0 ] }, then: '$nested.regDate', else: '$nested.regDate' } //type 컬럼에 값이 있으면 type컬럼값 출력 없으면 'TC'로 출력
      },
    };


    var toStage = [
      {$lookup : lookupNest},
      {$lookup : lookupUser},
      {$unwind : unwindNest},
      {$unwind : unwindUser},
      {$project: project},
      {$match: {$and : [
        {nestUserId: _userId},
        {$or: condition}
      ]}}
      // {$limit: limit},
    ];

    var fromStage = [
      {$lookup : lookupNest},
      {$unwind : unwindNest},
      {$project: project2},
      {$sort: {regDate:-1}}, //등록한 사람의 최신순으로 1차 정렬
      {$lookup : lookupUser2},
      {$unwind : unwindUser},
      {$match: {$and : [
        {userId:_userId},
        {nestUserId: {$exists : true}},
        {$or: condition}
      ]}},
      {$project: project} //nestUserId nickName때문에 한번더 Project함
      // {$limit: limit},
    ];

    if(Meteor.isServer){

      if(_.isEqual('toTab', _tab)){
        toResult = CLT.EnBucketList.aggregate(toStage);
      } else {
        fromResult = CLT.EnBucketList.aggregate(fromStage);
        fromResult = _.chain(fromResult).groupBy("_id").map(function(value,key){
          return{
            _id: key,
            userId : value[0].userId,
            title: value[0].title,
            type: value[0].type,
            follow : value[0].follow,
            regDate: value[0].regDate,
            // userNick: _.map(value, function(a){return a.userNick;}),
            targetUserIds: _.map(value, function(a){return a.targetUserId;})
          };
        }).value();
      }
    }

    switch(_sortBy){
      case 'regDateDesc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
      break;
      case 'regDateAsc':
      result.to = toResult ? _.chain(toResult).sortBy('regDate').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').value() : fromResult;
      break;
      case 'titleDesc':
      result.to = toResult ? _.chain(toResult).sortBy('title').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').reverse().value() : fromResult;
      break;
      case 'titleAsc':
      result.to = toResult ? _.chain(toResult).sortBy('title').value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('title').value() : fromResult;
      break;
      default:
      result.to = toResult ? _.chain(toResult).sortBy('regDate').reverse().value() : toResult;
      result.from = fromResult ? _.chain(fromResult).sortBy('regDate').reverse().value() : fromResult;
    }
    return result;
  },
  updateCodeContents: function(_userId, _message, _email){
    var result = {};
    if(Meteor.isServer){
      var code = global.utilAES(_message,'decrypted');
      var type = code.substring(0,2);
      var contentsId = code.substring(2, code.indexOf('/'));

      switch(type){
        case 'tc':
          var timeCapsuleData = CLT.EnTimeCapsule.find({_id : contentsId, nonUserGroupMember: { $elemMatch:{emailCode: code, nonUserEmail: _email}} },{fields:{userId:1}}).fetch();
          if(!_.isArray(timeCapsuleData)){
            timeCapsuleData = [timeCapsuleData];
          }

          if(timeCapsuleData.length > 0){
            result.type = 'TC';

            CLT.EnTimeCapsule.update({_id : contentsId, nonUserGroupMember: { $elemMatch:{emailCode: code, nonUserEmail: _email}} },{$push:{ groupMember:{userId:_userId}}});
            CLT.EnTimeCapsule.update({_id : contentsId, nonUserGroupMember: { $elemMatch:{emailCode: code, nonUserEmail: _email}} },{$pull:{ nonUserGroupMember:{emailCode: code, nonUserEmail: _email}}});

            //타임라인 처리
            var timeLineData = CLT.EnTimeline.find({postId: contentsId, contentType:'E', userId: timeCapsuleData[0].userId}).fetch();
            if(!_.isArray(timeLineData)){
              timeLineData = [timeLineData];
            }

            var currentDate = global.utilGetDate().default;

            _.each(timeLineData, function(data){
              data._id = Meteor.uuid();
              data.userId = _userId;
              data.regDate = currentDate;
              data.updateDate = currentDate;

              CLT.EnTimeline.insert(data);
            });

            result.result = true;
          } else {
            result.result = false;
          }
          break;
        case 'ih':
          var inhertiData = CLT.Inh.find({inheritorId: contentsId, eMail: _email}).fetch();
          // inheritance테이블에 inhertiorId 값 변경, eMail, name, phone, image 칼럼삭제
          if (inhertiData.length !== 0) {
            CLT.Inh.update(
              {inheritorId: contentsId, eMail: _email},
              {
                $set: {inheritorId: _userId},
                $unset: {eMail: 1, name: 1, phone: 1, image: 1}
              },{ multi: true }
            );
            result.result = true;
          } else {
            result.result = false;
          }
        break;
      }
    }
    return result;
  }
});