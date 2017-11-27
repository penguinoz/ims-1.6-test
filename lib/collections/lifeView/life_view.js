import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// userId, pageType, limit
Meteor.methods({
  getAllImages: function(_userId, _isPageOwner, _showLock, _limit, _searchCondition, _searchText, _sortBy) {
    var imageCount = 0;
    var result = {};
    if(Meteor.isServer){
      // 검색텍스트 ',' 로 구분해서 여러개 찾기
      var searchText = _searchText.split(',');

      var srchTextArr = [];
      for (var t = 0; t < searchText.length; t++) {
        // srchTextArr.push(searchText[t].replace(/ /g, '')); //텍스트의 모든공백제거
        srchTextArr.push(searchText[t].trim()); // 앞뒤 공백 제거
      }
      // searchText = srchTextArr;


      var imData = null;
      var regex = [];
      for (var s = 0; s < srchTextArr.length; s++) {
        var tempStr = new RegExp(["^.*", srchTextArr[s], ".*"].join(""), "gi");
        regex.push(tempStr);
      }
      var condition = [];

      var tag = /(<([^>]+)>)/gi;

      switch (_searchCondition) {
        case 'title': condition=[{'title': {$in: regex}}];
        break;
        case 'content': condition=[{'content': {$in: regex}}];
        break;
        case 'tag': condition=[{'tagList': {$in: regex}}];
        break;
        default:
        condition = [
          {"title": {$in: regex}},
          {"content": {$in: regex}},
          {"tagList": {$in: regex}}
        ];
      }

      var sortParam = {};
      switch(_sortBy) {
        case 'regDateDesc':
        sortParam = {regDate:-1};
        break;
        case 'regDateAsc':
        sortParam = {regDate:1};
        break;
        case 'startDateDesc':
        sortParam = {startDate:-1, regDate:-1};
        break;
        case 'startDateAsc':
        sortParam = {startDate:1, regDate:-1};
        break;
        case 'like':
        sortParam = {likeCount:-1, regDate:-1};
        break;
        default: sortParam = {regDate:-1};
      }

      var lookupLike = {
        "from" : "imsLike",
        "localField" : "_id",
        "foreignField" : "postId",
        "as" : "like"
      };

      var unwindLike = {path: "$like", preserveNullAndEmptyArrays: true};

      var group = {
        _id : "$_id" ,
        like: {$push:"$like.userId"},
        type: {$first:"$type"},
        postId : {$first:"$postId"},
        title: {$first:"$title"},
        content: {$first:"$content"},
        userId: {$first:"$userId"},
        open:{$first:"$open"},
        lock: {$first:"$lock"},
        startDate: {$first:"$startDate"},
        regDate: {$first:"$regDate"},
        updateDate : {$first:"$updateDate"},
        images : {$first:"$images"}, //추억, 버킷
        image : {$first:"$image"}, //타임캡슐
        tagList : {$first:"$tagList"}
      };

      var project = {
        _id: 1,
        postId : 1,
        title: 1,
        content: 1,
        userId: 1,
        like: 1,
        likeCount: {$size: "$like"},
        open:1,
        lock: 1,
        startDate: 1,
        regDate: 1,
        updateDate : 1,
        images : 1, //추억, 버킷
        image : 1, //타임캡슐
        type: {
          $cond: { if: { $gte: [ "$type", 0 ] }, then: '$type', else: 'TC' } //type 컬럼에 값이 있으면 type컬럼값 출력 없으면 'TC'로 출력
        },
        tagList : 1,
      };

      var lockOption = {};

      //다른사람 방문시 lock
      if(!_isPageOwner){
        lockOption = {
          lock: _showLock
        };
      } else {
        if(!_showLock ){
          //비공개 글 보지 않게 설정
          lockOption = {
            lock: _showLock
          };
        }
      }

      // if(_sortBy === 'custom'){
      //   sortParam = {'images.order':-1, regDate :-1};
      // }

      var stage = [];
      stage = [
        {$lookup:lookupLike},
        {$unwind:unwindLike},
        {$group:group},
        {$match: {
          $and:[
            {$or : [
              {userId: _userId},
              {'groupUsers':{$in:[_userId]}},
              {'groupMember.$.userId':{$in:[_userId]}}
            ]},
            // { lock: _showLock},
            lockOption,
            { $or: condition }
          ]
        }},
        {$project: project},
        {$sort : sortParam},
        {$limit: _limit}
      ];
      var stroy = [];
      story = CLT.EnStory.aggregate(stage);
      story = _.intersection(story, story); // 똑같은 데이터 하나로 합치기


      var bucketList = [];
      bucketList = CLT.EnBucketList.aggregate(stage);


      // if(_sortBy === 'custom'){
      //   sortParam = {'image.order':-1, regDate :-1};
      // }
      //개봉, 공개, 작성중(개인, 그룹만)
      stage = [
        {$lookup:lookupLike},
        {$unwind:unwindLike},
        {$match: {
          $and:[
            {$or : [
              {$and : [
                {"groupMember": {$elemMatch: {userId : _userId, openedDate :{$exists:false}}}},
                {"authorType":'private'},
                {status : 'PR'}
              ]}, //작성중 (개인)
              {$and : [
                {"groupMember": {$elemMatch: {userId : _userId, openedDate :{$exists:false}}}},
                {"authorType":'group'},
                {status : 'PR'}
              ]}, //작성중 (그룹)
              {$and : [
                {"groupMember": {$elemMatch: {userId : _userId, openedDate :{$exists:false}}}},
                {status : 'BR'}
              ]}, //매립
              {$and : [
                {"groupMember": {$elemMatch: {userId : _userId, openedDate :{$exists:true}}}},
                {status : 'BR'}
              ]}, //개봉
              // {$and : [
              //   {"userId": _userId},
              //   {status : 'PB'}
              // ]}, //공개
            ]},
            lockOption,
            { $or: condition }
          ]
        }},
        {$group:group},
        {$project: project},
        {$sort : sortParam},
        {$limit: _limit}
      ];

      var timeCapsule = [];
      timeCapsule = CLT.EnTimeCapsule.aggregate(stage);

      // //검색내용 적용
      // story.map(function(item) {
      //   if (searchText.toString() !== "") {
      //     for (var j = 0; j < searchText.length; j++) {
      //       var title = item.title.replace(/(<([^>]+)>)/gi, "");
      //       var content = item.content.replace(/(<([^>]+)>)/gi, "");
      //       var tag = item.tagList;
      //       var regSearch = new RegExp([searchText[j], ".*"].join(""), "");
      //       if (title.match(regSearch) || content.match(regSearch) || _.indexOf(tag, searchText[j]) !== -1) {
      //         story.push(item);
      //       }
      //     }
      //   } else {
      //     story.push(item);
      //   }
      // });



      var images = [];
      _.each(story, function(info){
        _.each(info.images, function(image){
          var imageInfo = {};
          imageInfo.postId = info._id;
          imageInfo.parentPostId = info.postId;
          imageInfo.type = info.type;
          imageInfo.path = image.path;
          imageInfo.lat = image.lat;
          imageInfo.lng = image.lng;
          imageInfo.order = image.order ? image.order : 0;
          imageInfo.startDate = info.startDate;
          imageInfo.title = info.title;
          imageInfo.likeCnt = info.like.length;
          imageInfo.hitCnt = info.open;
          imageInfo.commentCnt = CLT.ImsComment.find({postId:info._id}).count();
          imageInfo.regDate = info.regDate;
          imageInfo.test = info.test;
          imageInfo.content = info.content;
          imageInfo.tagList = info.tagList;
          imageInfo.exclusionDate = image.exclusionDate ? image.exclusionDate : '';
          images.push(imageInfo);
        });
      });

      _.each(bucketList, function(info){
        _.each(info.images, function(image){
          var imageInfo = {};
          imageInfo.postId = info._id;
          imageInfo.type = info.type;
          imageInfo.path = image.path;
          imageInfo.lat = image.lat;
          imageInfo.lng = image.lng;
          imageInfo.order = image.order ? image.order : 0;
          imageInfo.startDate = info.startDate ? info.startDate : '';
          imageInfo.title = info.title;
          imageInfo.likeCnt = info.like.length;
          imageInfo.hitCnt = info.open;
          imageInfo.commentCnt = CLT.ImsComment.find({postId:info._id}).count();
          imageInfo.regDate = info.regDate;
          imageInfo.test = info.test;
          imageInfo.content = info.content;
          imageInfo.tagList = info.tagList;
          imageInfo.exclusionDate = image.exclusionDate ? image.exclusionDate : '';
          images.push(imageInfo);
        });
      });

      _.each(timeCapsule, function(info){
        if(info.image.path){
          var imageInfo = {};
          imageInfo.postId = info._id;
          imageInfo.type = info.type;
          imageInfo.path = info.image.path;
          imageInfo.lat = info.image.lat;
          imageInfo.lng = info.image.lng;
          imageInfo.order = info.image.order ? info.image.order : 0;
          imageInfo.startDate = info.buryDate ? info.buryDate : '';
          imageInfo.title = info.title;
          imageInfo.likeCnt = info.like.length;
          imageInfo.hitCnt = info.open;
          imageInfo.commentCnt = CLT.ImsComment.find({postId:info._id}).count();
          imageInfo.regDate = info.unsealDate;
          imageInfo.test = info.test;
          imageInfo.content = info.buryLocationName;
          imageInfo.tagList = info.tagList;
          imageInfo.exclusionDate = info.image.exclusionDate ? info.image.exclusionDate : '';
          images.push(imageInfo);
        }
      });


      var excludedimages = _.reject(images, function(info){
        return _.isEqual(info.exclusionDate, '');
      });

      var imagesTemp = [];
      images.map(function(item) {
        // DB에 content에 html태그도 조건검색 방지
        if (srchTextArr.toString() !== "") {
          for (var j = 0; j < srchTextArr.length; j++) {
            var title = item.title.replace(/(<([^>]+)>)/gi, "");
            var content = item.content.replace(/(<([^>]+)>)/gi, "");
            var tag = item.tagList;
            var regSearch = new RegExp([srchTextArr[j], ".*"].join(""), "");
            if (title.match(regSearch) || content.match(regSearch) || _.indexOf(tag, srchTextArr[j]) !== -1) {
              imagesTemp.push(item);
            }
          }
        } else {
          imagesTemp.push(item);
        }
      });

      images = _.intersection(imagesTemp); // 똑같은 데이터 하나로 합치기

      // images = imagesTemp;

      switch(_sortBy) {
        case 'regDateDesc':
        images = _.chain(images).sortBy('regDate').value().reverse();// sortParam = {regDate:-1};
        break;
        case 'regDateAsc':
        images = _.chain(images).sortBy('regDate').value();//sortParam = {regDate:1};
        break;
        case 'startDateDesc':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('startDate').value().reverse();//sortParam = {startDate:-1, regDate:-1};
        break;
        case 'startDateAsc':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('startDate').value();//sortParam = {startDate:1, regDate:-1};
        break;
        case 'like':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('likeCnt').value().reverse();//sortParam = {likeCount:-1, regDate:-1};
        break;
        case 'custom':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('startDate').reverse().sortBy('order').value();
        break;
        default:
        images = _.chain(images).sortBy('regDate').value().reverse();//sortParam = {regDate:-1};
      }

      result.images = images;
      result.imageCount = images.length ? images.length : 0;
      result.excludedimages = excludedimages;
    }
    return result;
  },
  saveImageLocation: function(imageData){
    var result;
    imageData.image.path = global.fn_chagneImageType(imageData.image.path);
    switch(imageData.type){
      case 'BS': case'IM':
      // console.log("bs");
      // console.log("imageData "+ imageData.path);
      result =CLT.EnStory.update({$and:[{_id:imageData.postId},{images:{$elemMatch:{path:imageData.image.path}}}]},
        {$set: {'images.$.lat': imageData.image.lat,'images.$.lng': imageData.image.lng }
      });
      break;
      case 'BL':
      result = CLT.EnBucketList.update({$and:[{_id:imageData.postId},{images:{$elemMatch:{path:imageData.image.path}}}]},
        {$set: {'images.$.lat': imageData.image.lat,'images.$.lng': imageData.image.lng }
      });
      break;
      case 'TC':
      result = CLT.EnTimeCapsule.update({_id:imageData.postId},
        {$set: {'image.lat': imageData.image.lat,'image.lng': imageData.image.lng }
      });
      break;
    }
  },
  getClickedImgDatas: function(datas) {
    var arrayReturn = [];
    var imDatas = {type:['IM','BS'],ids : []};
    var blDatas = {type:['BL','BP'],ids : []};
    var tcDatas = {type:'TC',ids : []};
    for(var i in datas){
      switch(datas[i].type){
        case 'IM': case 'BS':
        imDatas.ids.push(datas[i].postId);
        break;

        case 'BL':
        blDatas.ids.push(datas[i].postId);
        break;

        case 'TC':
        tcDatas.ids.push(datas[i].postId);
        break;
      }
    }
    var imResult = CLT.EnStory.find({_id:{$in:imDatas.ids}}).fetch();
    var blResult = CLT.EnBucketList.find({_id:{$in:blDatas.ids}}).fetch();
    var tcResult = CLT.EnTimeCapsule.find({_id:{$in:tcDatas.ids}}).fetch();
    for(var i in tcResult){
      tcResult[i].type = 'TC';
      tcResult[i].images = [];
      tcResult[i].images.push(tcResult[i].image);
      delete tcResult[i].image;
    }
    arrayReturn = _.union(imResult,blResult,tcResult);
    var userIds = [];
    for(var i in arrayReturn){
      userIds.push(arrayReturn[i].userId);
    }
    var userInfos = Meteor.users.find({username: {$in:userIds}}).fetch();
    for(var i in arrayReturn){
      for(var j  in userInfos){
        if(arrayReturn[i].userId === userInfos[j].username){
          arrayReturn[i].userNick = userInfos[j].profile.nickName;
        }
      }
    }
    return arrayReturn;
  },

  // postId로 각 테이블에 있는 데이터 가져오기
  getStoryBucketData: function(arryPostId, userId) {
    var result = null;
    var story = CLT.EnStory.find({userId: userId, _id: {$in: arryPostId} }).fetch();
    var bucket = CLT.EnBucketList.find({userId: userId, _id: {$in: arryPostId} }).fetch();
    result = _.union(story, bucket);
    return result;
  },
  setImageOrder: function(_imageData){
    //IM, BS, BL, TC
    var result;
    // console.log(_typeData);
    switch(_imageData.typeData){
      case 'BS': case'IM':
      result = CLT.EnStory.update({$and:[{_id:_imageData.postId},{images:{$elemMatch:{path:_imageData.path}}}]},
        {$set: {'images.$.order': _imageData.order}
      });
      break;
      case 'BL':
      result = CLT.EnBucketList.update({$and:[{_id:_imageData.postId},{images:{$elemMatch:{path:_imageData.path}}}]},
        {$set: {'images.$.order': _imageData.order}
      });
      break;
      case 'TC':
      result = CLT.EnTimeCapsule.update({$and:[{_id:_imageData.postId},{'image.path':_imageData.path}]},
      {$set: {'image.order': _imageData.order}});
      break;
    }
  },
  setImageInExclusion: function(_imageData){

    var exclusionDate = global.utilGetDate().default; //제외시킨날짜
    if(!_imageData.isExclude){ //포함시키기
      exclusionDate = '';
    }

    //IM, BS, BL, TC
    switch(_imageData.typeData){
      case 'BS': case'IM':
      CLT.EnStory.update({$and:[{_id:_imageData.postId},{images:{$elemMatch:{path:_imageData.path}}}]},
        {$set: {'images.$.exclusionDate': exclusionDate}
      });
      break;
      case 'BL':
      CLT.EnBucketList.update({$and:[{_id:_imageData.postId},{images:{$elemMatch:{path:_imageData.path}}}]},
        {$set: {'images.$.exclusionDate': exclusionDate}
      });
      break;
      case 'TC':
      CLT.EnTimeCapsule.update({$and:[{_id:_imageData.postId},{'image.path':_imageData.path}]},
      {$set: {'image.exclusionDate': exclusionDate}});
      break;
    }
  },
  getAllIhImages: function(_postId, _showLock, _limit, _searchCondition, _searchText, _sortBy) {
    var imageCount = 0;
    var result = {};
    if(Meteor.isServer){
      // 검색텍스트 ',' 로 구분해서 여러개 찾기
      var searchText = _searchText.split(',');

      var srchTextArr = [];
      for (var t = 0; t < searchText.length; t++) {
        // srchTextArr.push(searchText[t].replace(/ /g, '')); //텍스트의 모든공백제거
        srchTextArr.push(searchText[t].trim()); // 앞뒤 공백 제거
      }

      var imData = null;
      var regex = [];
      for (var s = 0; s < srchTextArr.length; s++) {
        var tempStr = new RegExp(["^.*", srchTextArr[s], ".*"].join(""), "gi");
        regex.push(tempStr);
      }
      var condition = [];

      var tag = /(<([^>]+)>)/gi;

      switch (_searchCondition) {
        case 'title': condition=[{'title': {$in: regex}}];
        break;
        case 'content': condition=[{'content': {$in: regex}}];
        break;
        case 'tag': condition=[{'tagList': {$in: regex}}];
        break;
        default:
        condition = [
          {"title": {$in: regex}},
          {"content": {$in: regex}},
          {"tagList": {$in: regex}}
        ];
      }

      var sortParam = {};
      switch(_sortBy) {
        case 'regDateDesc':
        sortParam = {regDate:-1};
        break;
        case 'regDateAsc':
        sortParam = {regDate:1};
        break;
        case 'startDateDesc':
        sortParam = {startDate:-1, regDate:-1};
        break;
        case 'startDateAsc':
        sortParam = {startDate:1, regDate:-1};
        break;
        case 'like':
        sortParam = {likeCount:-1, regDate:-1};
        break;
        default: sortParam = {regDate:-1};
      }

      var lookupLike = {
        "from" : "imsLike",
        "localField" : "_id",
        "foreignField" : "postId",
        "as" : "like"
      };

      var unwindLike = {path: "$like", preserveNullAndEmptyArrays: true};

      var group = {
        _id : "$_id" ,
        like: {$push:"$like.userId"},
        type: {$first:"$type"},
        postId : {$first:"$postId"},
        title: {$first:"$title"},
        content: {$first:"$content"},
        userId: {$first:"$userId"},
        open:{$first:"$open"},
        lock: {$first:"$lock"},
        startDate: {$first:"$startDate"},
        regDate: {$first:"$regDate"},
        updateDate : {$first:"$updateDate"},
        images : {$first:"$images"}, //추억, 버킷
        image : {$first:"$image"}, //타임캡슐
        tagList : {$first:"$tagList"}
      };

      var project = {
        _id: 1,
        postId : 1,
        title: 1,
        content: 1,
        userId: 1,
        like: 1,
        likeCount: {$size: "$like"},
        open:1,
        lock: 1,
        startDate: 1,
        regDate: 1,
        updateDate : 1,
        images : 1, //추억, 버킷
        image : 1, //타임캡슐
        type: {
          $cond: { if: { $gte: [ "$type", 0 ] }, then: '$type', else: 'TC' } //type 컬럼에 값이 있으면 type컬럼값 출력 없으면 'TC'로 출력
        },
        tagList : 1,
      };

      var lockOption = {};
      if (!_showLock) {
        lockOption = {lock: false};
      }

      var stage = [];
      stage = [
        {$lookup:lookupLike},
        {$unwind:unwindLike},
        {$group:group},
        {$match: {
          $and:[
            {$or : [
              {_id: {$in: _postId}}
            ]},
            lockOption,
            { $or: condition }
          ]
        }},
        {$project: project},
        {$sort : sortParam},
        {$limit: _limit}
      ];
      var stroy = [];
      story = CLT.EnStory.aggregate(stage);
      story = _.intersection(story, story); // 똑같은 데이터 하나로 합치기


      var bucketList = [];
      bucketList = CLT.EnBucketList.aggregate(stage);

      stage = [
        {$lookup:lookupLike},
        {$unwind:unwindLike},
        {$match: {
          $and:[
            {$or : [
              {$and : [
                {"_id": {$in: _postId}},
                {"authorType":'private'},
                {status : 'PR'}
              ]}, //작성중 (개인)
              {$and : [
                {"_id": {$in: _postId}},
                {"authorType":'group'},
                {status : 'PR'}
              ]}, //작성중 (그룹)
              {$and : [
                {"_id": {$in: _postId}},
                {status : 'BR'}
              ]}, //매립
              {$and : [
                {"_id": {$in: _postId}},
                {status : 'BR'}
              ]}
            ]},
            lockOption,
            { $or: condition }
          ]
        }},
        {$group:group},
        {$project: project},
        {$sort : sortParam},
        {$limit: _limit}
      ];

      var timeCapsule = [];
      timeCapsule = CLT.EnTimeCapsule.aggregate(stage);

      var images = [];
      _.each(story, function(info){
        _.each(info.images, function(image){
          var imageInfo = {};
          imageInfo.postId = info._id;
          imageInfo.parentPostId = info.postId;
          imageInfo.type = info.type;
          imageInfo.path = image.path;
          imageInfo.lat = image.lat;
          imageInfo.lng = image.lng;
          imageInfo.order = image.order ? image.order : 0;
          imageInfo.startDate = info.startDate;
          imageInfo.title = info.title;
          imageInfo.likeCnt = info.like.length;
          imageInfo.hitCnt = info.open;
          imageInfo.commentCnt = CLT.ImsComment.find({postId:info._id}).count();
          imageInfo.regDate = info.regDate;
          imageInfo.test = info.test;
          imageInfo.content = info.content;
          imageInfo.tagList = info.tagList;
          imageInfo.exclusionDate = image.exclusionDate ? image.exclusionDate : '';
          images.push(imageInfo);
        });
      });

      _.each(bucketList, function(info){
        _.each(info.images, function(image){
          var imageInfo = {};
          imageInfo.postId = info._id;
          imageInfo.type = info.type;
          imageInfo.path = image.path;
          imageInfo.lat = image.lat;
          imageInfo.lng = image.lng;
          imageInfo.order = image.order ? image.order : 0;
          imageInfo.startDate = info.startDate ? info.startDate : '';
          imageInfo.title = info.title;
          imageInfo.likeCnt = info.like.length;
          imageInfo.hitCnt = info.open;
          imageInfo.commentCnt = CLT.ImsComment.find({postId:info._id}).count();
          imageInfo.regDate = info.regDate;
          imageInfo.test = info.test;
          imageInfo.content = info.content;
          imageInfo.tagList = info.tagList;
          imageInfo.exclusionDate = image.exclusionDate ? image.exclusionDate : '';
          images.push(imageInfo);
        });
      });

      _.each(timeCapsule, function(info){
        if(info.image.path){
          var imageInfo = {};
          imageInfo.postId = info._id;
          imageInfo.type = info.type;
          imageInfo.path = info.image.path;
          imageInfo.lat = info.image.lat;
          imageInfo.lng = info.image.lng;
          imageInfo.order = info.image.order ? info.image.order : 0;
          imageInfo.startDate = info.buryDate ? info.buryDate : '';
          imageInfo.title = info.title;
          imageInfo.likeCnt = info.like.length;
          imageInfo.hitCnt = info.open;
          imageInfo.commentCnt = CLT.ImsComment.find({postId:info._id}).count();
          imageInfo.regDate = info.unsealDate;
          imageInfo.test = info.test;
          imageInfo.content = info.buryLocationName;
          imageInfo.tagList = info.tagList;
          imageInfo.exclusionDate = info.image.exclusionDate ? info.image.exclusionDate : '';
          images.push(imageInfo);
        }
      });


      var excludedimages = _.reject(images, function(info){
        return _.isEqual(info.exclusionDate, '');
      });

      var imagesTemp = [];
      images.map(function(item) {
        // DB에 content에 html태그도 조건검색 방지
        if (srchTextArr.toString() !== "") {
          for (var j = 0; j < srchTextArr.length; j++) {
            var title = item.title.replace(/(<([^>]+)>)/gi, "");
            var content = item.content.replace(/(<([^>]+)>)/gi, "");
            var tag = item.tagList;
            var regSearch = new RegExp([srchTextArr[j], ".*"].join(""), "");
            if (title.match(regSearch) || content.match(regSearch) || _.indexOf(tag, srchTextArr[j]) !== -1) {
              imagesTemp.push(item);
            }
          }
        } else {
          imagesTemp.push(item);
        }
      });

      images = _.intersection(imagesTemp); // 똑같은 데이터 하나로 합치기

      // images = imagesTemp;

      switch(_sortBy) {
        case 'regDateDesc':
        images = _.chain(images).sortBy('regDate').value().reverse();// sortParam = {regDate:-1};
        break;
        case 'regDateAsc':
        images = _.chain(images).sortBy('regDate').value();//sortParam = {regDate:1};
        break;
        case 'startDateDesc':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('startDate').value().reverse();//sortParam = {startDate:-1, regDate:-1};
        break;
        case 'startDateAsc':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('startDate').value();//sortParam = {startDate:1, regDate:-1};
        break;
        case 'like':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('likeCnt').value().reverse();//sortParam = {likeCount:-1, regDate:-1};
        break;
        case 'custom':
        images = _.chain(images).sortBy('regDate').reverse().sortBy('startDate').reverse().sortBy('order').value();
        break;
        default:
        images = _.chain(images).sortBy('regDate').value().reverse();//sortParam = {regDate:-1};
      }

      result.images = images;
      result.imageCount = images.length ? images.length : 0;
    }
    return result;
  }
});
