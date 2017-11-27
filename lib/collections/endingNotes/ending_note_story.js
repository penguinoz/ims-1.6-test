import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnStory = new Mongo.Collection('endingNoteStory');


// userId, pageType, limit
Meteor.methods({
  storyFind: function(obj) {
    var data = CLT.EnStory.find(obj).fetch();
    return data;
  },
  storyGetList: function(userId, isPageOwner, pageType, limit, searchCondition, searchText, sortBy, selectedMenu) {
    var contentAllCount = 0;
    var result = {
      data : [],
      count : contentAllCount
    };
    if(Meteor.isServer){
      // 검색텍스트 ',' 로 구분해서 여러개 찾기
      searchText = searchText.split(',');

      var srchTextArr = [];
      for (var t = 0; t < searchText.length; t++) {
        // srchTextArr.push(searchText[t].replace(/ /g, '')); //텍스트의 모든공백제거
        srchTextArr.push(searchText[t].trim()); // 앞뒤 공백 제거
      }
      searchText = srchTextArr;


      var imData = null;
      var regex = [];
      for (var s = 0; s < searchText.length; s++) {
        var tempStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
        regex.push(tempStr);
      }
      var condition = [];

      var tag = /(<([^>]+)>)/gi;

      switch (searchCondition) {
        case 'title': condition=[{'title': {$in: regex}}];
        break;
        case 'content': condition=[{'content': {$in: regex}}];
        break;
        case 'tag': condition=[{'tagList': {$in: regex}}];
        break;
        default:
        condition = [
          // {"title": regex},
          // {"content": regex},
          // {"tagList": {$in:[searchText]}}
          {"title": {$in: regex}},
          {"content": {$in: regex}},
          {"tagList": {$in: regex}}
        ];
      }

      var sortParam = {};
      switch(sortBy) {
        case 'regDateDesc':
        sortParam = {regDate:-1}; //result.data =  _.sortBy(result.data, 'regDate').reverse();
        break;
        case 'regDateAsc':
        sortParam = {regDate:1}; //result.data =  _.sortBy(result.data, 'regDate');
        break;
        case 'startDateDesc':
        sortParam = {startDate:-1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate').reverse();
        break;
        case 'startDateAsc':
        sortParam = {startDate:1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate');
        break;
        // case 'like':
        //   sortParam = {likeCount:-1, regDate:-1}; //result.data =  _.sortBy(result.data, 'likeCount').reverse();
        // break;
        default: sortParam = {regDate:-1};
      }

      var project = {
        _id: 1,
        title: 1,
        content: 1,
        userId: 1,
        type: 1,
        postId: 1,
        // like: 1,
        // likeCount: {$size: "$like"},
        open:1,
        lock: 1,
        startDate: 1,
        regDate: 1,
        updateDate : 1,
        images : 1,
        tagList : 1
      };

      var stage = [];
      if(selectedMenu === 'all'){
        stage = [
          {$match: {
            $and:[
              {'lock': false},
              { $or: condition }
            ],
            // type: pageType
          }},
          {$project: project},
          {$sort : sortParam},
          {$limit: limit}
        ];
        if(Meteor.isServer){
          imData = CLT.EnStory.aggregate(stage);
        }
        contentAllCount = CLT.EnStory.find(
          {
            $and:[
              {'lock': false},
              { $or: condition }
            ],
            // type: pageType
          }
        ).count();
      } else { //나의 추억 선택시

        var lock = false;
        if(isPageOwner){ //로그인 사용자가 현재 페이지의 주인
          stage = [
            {$match: {
              $or:condition,
              userId: userId,
              // type: pageType,
            }},
            {$project: project},
            {$sort : sortParam},
            {$limit: limit}
          ];
          if(Meteor.isServer){
            imData = CLT.EnStory.aggregate(stage);
          }

          contentAllCount = CLT.EnStory.find(
            {$or:condition,
              userId: userId,
              // type: pageType,
              // }, {sort:sortParam, limit:limit}
            }
          ).count();
        } else { //로그인 사용자가 다른 페이지 열람
          stage = [
            {$match: {
              $or:condition,
              userId: userId,
              lock: false,
              // type: pageType,
            }},
            {$project: project},
            {$sort : sortParam},
            {$limit: limit},
          ];
          if(Meteor.isServer){
            imData = CLT.EnStory.aggregate(stage);
          }

          contentAllCount = CLT.EnStory.find(
            {
              $or:condition,
              userId: userId,
              lock: false,
              // type: pageType,
            }
          ).count();
        }
      }

      var im = [];
      imData.map(function(item) {
        // DB에 content에 html태그도 조건검색 방지
        if (searchText.toString() !== "") {
          for (var j = 0; j < searchText.length; j++) {
            var title = item.title.replace(/(<([^>]+)>)/gi, "");
            var content = item.content.replace(/(<([^>]+)>)/gi, "");
            var tag = item.tagList;
            var regSearch = new RegExp([searchText[j], ".*"].join(""), "");
            if (title.match(regSearch) || content.match(regSearch) || _.indexOf(tag, searchText[j]) !== -1) {
              im.push(item);
            }
          }
        } else {
          im.push(item);
        }
      });

      im = _.intersection(im, im); // 똑같은 데이터 하나로 합치기

      if (im.length !== 0) {
        for (var i = 0; i < im.length; i++) {
          // 데이터영역의 html태그를 삭제
          var title = im[i].title.replace(/(<([^>]+)>)/gi, "");
          var content = im[i].content.replace(/<\/p>/gi, "\n");
          content = content.replace(/(<([^>]+)>)/gi, "");
          // var content = im[i].content.replace(/<img(.*?)>/gi, "");  // 이미지태크 삭제
          // content = content.replace(/<p>/gi, "");                   // <p>태그 삭제
          // content = content.replace(/<br>/gi, "");
          // content = content.replace(/<\/p>/gi, "<br/>");            // </p> 태그 <br>태그 전환
          content = content.split('\n');
          var contentResult = '';
          for (var c = 0; c < content.length; c++) {
            if (content[c] !== "") {
              contentResult += content[c];
              if (c !== content.length-1) {
                contentResult += '<br/>';
              }
            }
          }
          content = contentResult;

          var titleTxt = [];
          var contentTxt = [];
          for (var x = 0; x < searchText.length; x++) {
            var regex2 = new RegExp([searchText[x]].join(""), "gi");

            // 태그를 삭제한 데이터영역과 검색키워드의 문자열을 찾는다
            var titleFlag = title.indexOf(searchText[x]);
            var contentFlag = content.indexOf(searchText[x]);

            // 제목과 내용의 길이를 자른다
            // titleTxt = global.utilEllipsis(title, 20);
            // contentTxt = global.utilEllipsis(content, 100);

            // 태그를 삭제한 데이터영역과 검색키워드의 문자열이 일치하지 않을때
            // 태그를 삭제하지않은 데이터로 검색 키워드를 비교해 result배열에 데이터를 담는다

            if(!_.isEmpty(searchText[x]) && titleFlag !== -1 && (searchCondition === 'all' || searchCondition === 'title')){
              title = title.replace(regex2, '<strong value='+im[i]._id+'>' + searchText[x] + '</strong>');
            }
            if(!_.isEmpty(searchText[x]) && contentFlag !== -1 && (searchCondition === 'all' || searchCondition === 'content')) {
              content = content.replace(regex2, '<strong value='+im[i]._id+'>' + searchText[x] + '</strong>');
            }

            // 태그글씨 굵게 표시
            // _.find(im[i].tagList, function(item, g) {
            //   if (item === searchText[x]) {
            //     im[i].tagList[g] = '<strong>' + searchText[x] + '</strong>';
            //   } else {
            //     im[i].tagList[g] = item;
            //   }
            // });

            _.find(im[i].tagList, function(item, g) {
              if (item === searchText[x]) {
                var tempTag = '<strong>' + searchText[x] + '</strong>';
                im[i].tagList.splice(g,1);
                im[i].tagList.unshift(tempTag);
              } else {
                im[i].tagList[g] = item;
              }
            });
          }

          titleTxt.push(title);
          if(!_.isEmpty(content)){
            contentTxt.push(content);
          }


          var likeCollection = CLT.ImsLike.find({postId: im[i]._id}).fetch();
          var likeCount = 0;
          if(global.fn_isExist(likeCollection)){
            likeCount = likeCollection.length;
          }

          var comments = CLT.ImsComment.find({postId: im[i]._id}, {sort: {regDate: -1}}).fetch();
          var commentTop = CLT.ImsComment.find({postId: im[i]._id, replyKey: ''}, {sort: {regDate: -1}}).fetch()[0];

          result.data.push({
            title: titleTxt,
            content: contentTxt,
            _id: im[i]._id,
            userId: im[i].userId,
            type: im[i].type,
            postId: im[i].postId,
            like: likeCollection,
            likeCount : likeCount,
            open: im[i].open,
            lock: im[i].lock,
            startDate: im[i].startDate,
            regDate: im[i].regDate,
            updateDate: im[i].updateDate,
            image: im[i].images,
            tags: im[i].tagList,
            commentList: comments,
            commentTop: commentTop
          });
        }
        if (sortBy === 'like') {
          result.data =  _.sortBy(result.data, 'likeCount').reverse();
        }
      }
      result.count = contentAllCount;
    }
    return result;
  },
  storyUpsert: function(_id, data) {
    return CLT.EnStory.upsert(
      {'_id': _id},
      {$set: data,
        // $setOnInsert: {'regDate': global.utilGetDate().default}
        $setOnInsert: {'regDate': global.utilGetDate().default}
      }
    );
  },
  storyDelete: function(_id, userId){
    CLT.EnStory.remove(_id);
    CLT.ImsComment.remove({postId: _id});
    CLT.ImsLike.remove({postId: _id});
    // 상속된 컨텐츠 삭제
    CLT.Inh.update(
      {userId: userId},
      {
        $pull: { contents: {contentId: _id}, instContents: {contentId: _id} }
      },{multi: true}, function(error) {
        if (!error) {
          var inhInfo = CLT.Inh.find({userId, userId}).fetch();
          // 상속된 컨텐츠를 제거한뒤 상속받은 컨텐츠가 없으면 상속받은 날짜를 제거함
          inhInfo.map(function(item) {
            if (item.instContents.length === 0) {
              CLT.Inh.update({userId: item.userId, inheritorId: item.inheritorId}, {$unset: {instDate: ''}});
            }
          });
        }
      }
    );
  },

  bucketStoryGetList: function(postId, limit){
    var result = [];
    var bucketList = CLT.EnStory.find({$and:[{'postId':postId}, {'type':global.pageType.bucketStory} ]}, {sort:{startDate:-1, regDate:-1}}).fetch();
    if (bucketList.length !== 0) {
      for (var i = 0; i < bucketList.length; i++) {
        // 데이터영역의 태그를 삭제
        var title = bucketList[i].title.replace(/(<([^>]+)>)/gi, "");
        var content = bucketList[i].content.replace(/(<([^>]+)>)/gi, "");
        var titleTxt = title;
        var contentTxt = content;

        var comments = CLT.ImsComment.find({postId: bucketList[i]._id}, {sort: {regDate: -1}}).fetch();
        var commentTop = CLT.ImsComment.find({postId: bucketList[i]._id, replyKey: ''}, {sort: {regDate: -1}}).fetch()[0];
        var likeCollection = CLT.ImsLike.find({postId: bucketList[i]._id}).fetch();


        //nickName 찾기
        result.push({
          title: titleTxt,
          content: contentTxt,
          _id: bucketList[i]._id,
          userId: bucketList[i].userId,
          like: likeCollection,
          open: bucketList[i].open,
          lock: bucketList[i].lock,
          regDate: bucketList[i].regDate,
          updateDate: bucketList[i].updateDate,
          image: bucketList[i].images,
          tags: bucketList[i].tagList,
          exePlanLength: bucketList[i].exePlanList,
          startDate: bucketList[i].startDate,
          completeDate: bucketList[i].completeDate,
          isCompleted: bucketList[i].isCompleted,
          commentList: comments,
          commentTop: commentTop
        });
      }
    }
    return result;
  },
  endingNoteStoryRandom: function(type, tag, userId, limit) {
    var stage = [
      {$match: {type: type, lock: false, tagList: {$in: tag}, userId: {$ne:userId}, images: {$ne: []}}},
      {$sample: {size: limit}}
      // {$sort: {regDate: -1}},
      // {$limit: limit}
    ];
    if (Meteor.isServer) {
      var result = CLT.EnStory.aggregate(stage);
      return result;
    }
  },
  // 내가쓴 버키스토리수
  ctMyBucketStory: function(postId, userId){
    var result = CLT.EnStory.find({$and:[{postId:postId},{userId:userId}]}).count();
    return result;
  },
  // 내 버킷 스토리 삭제
  delStoryUsePostId: function(postId, userId){
    CLT.EnStory.remove({$and:[{postId:postId},{userId:userId}]});
  },
  endingNoteStoryCount: function(type, tag, userId) {
    var stage = {
      type: type,
      tagList: {$in: tag},
      userId: {$ne:userId}
    };
    if (Meteor.isServer) {
      var result = CLT.EnStory.find(stage).count();
      return result;
    }
  },
  storySearchFind: function(userId, searchCondition, searchText) {
    // 검색텍스트 ',' 로 구분해서 여러개 찾기
    searchText = searchText.split(',');
    var srchTextArr = [];
    for (var t = 0; t < searchText.length; t++) {
      // srchTextArr.push(searchText[t].replace(/ /g, '')); //텍스트의 모든공백제거
      srchTextArr.push(searchText[t].trim()); // 앞뒤 공백 제거
    }
    searchText = srchTextArr;

    var regex = [];
    for (var s = 0; s < searchText.length; s++) {
      var tempStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
      regex.push(tempStr);
    }

    var condition = [];

    switch (searchCondition) {
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

    var imData = CLT.EnStory.find(
      {
        $or:condition,
        'userId': userId
      },
      {sort: {regDate: -1} }
    ).fetch();

    var im = [];
    imData.map(function(item) {
      // DB에 content에 태그도 조건검색 방지
      if (searchText.toString() !== "") {
        for (var j = 0; j < searchText.length; j++) {
          var title = item.title.replace(/(<([^>]+)>)/gi, "");
          var content = item.content.replace(/(<([^>]+)>)/gi, "");
          var tag = item.tagList;
          var regSearch = new RegExp([searchText[j], ".*"].join(""), "");
          if (title.match(regSearch) || content.match(regSearch) || _.indexOf(tag, searchText[j]) !== -1) {
            im.push(item);
          }
        }
      } else {
        im.push(item);
      }
    });

    return _.intersection(im, im); // 똑같은 데이터 하나로 합치기
  },

  getTagListAll: function() {
    var data = null;
    var story = CLT.EnStory.find({tagList: {$ne: []} }, {fields: {'tagList': 1}}).fetch();
    var bucket = CLT.EnBucketList.find({tagList: {$ne: []} }, {fields: {'tagList': 1}}).fetch();
    data = _.union(story, bucket);
    return data;
  },

  getTagList: function(userId) {
    var data = null;
    var story = CLT.EnStory.find({userId: userId, tagList: {$ne: []} }, {fields: {'tagList': 1}}).fetch();
    var bucket = CLT.EnBucketList.find({userId: userId, tagList: {$ne: []} }, {fields: {'tagList': 1}}).fetch();
    data = _.union(story, bucket);
    return data;
  },

  getTagListByPostId: function(postId) {
    var data = null;
    var story = CLT.EnStory.find({_id: {$in: postId}, tagList: {$ne: []} }, {fields: {'tagList': 1}}).fetch();
    var bucket = CLT.EnBucketList.find({_id: {$in: postId}, tagList: {$ne: []} }, {fields: {'tagList': 1}}).fetch();
    data = _.union(story, bucket);
    return data;
  },

  // 태그없는 글 리스트
  getNotTagList: function(userId) {
    var data = null;
    var story = CLT.EnStory.find({userId: userId, tagList: []}).fetch();
    var bucket = CLT.EnBucketList.find({userId: userId, tagList: []}).fetch();
    data = _.union(story, bucket);
    return data;
  },

  storyUpdate: function(_id, data) {
    CLT.EnStory.update(
      {_id: _id},
      data
    );
  },
  // text(태그, 제목, 별명)로 추억, 버키스토리 글 찾기
  getStoryBucketSearchFind: function(text) {
    var result = null;
    var regex = new RegExp(["^.*", text, ".*"].join(""), "gi");
    var userInfo = Meteor.users.findOne({'profile.nickName': text});
    var condition = [
      {"title": regex},
      {"tagList": regex}
    ];
    if (userInfo) {
      condition.push({
        'userId': new RegExp(["^.*", userInfo.username, ".*"].join(""), "gi")
      });
    }
    var story = CLT.EnStory.find({$or: condition}).fetch();
    var bucket = CLT.EnBucketList.find({$or: condition}).fetch();

    result = _.sortBy(_.union(story, bucket),'regDate').reverse();


    _.each(result, function(data){
      // var likeCollection = CLT.ImsLike.find({postId: data._id}).fetch();
      var contextString = data.content.replace(/(<([^>]+)>)/gi, "");
      var likeCount = CLT.ImsLike.find({postId: data._id}).count();
      var commentCount = CLT.ImsComment.find({postId: data._id}).count();
      data.likeCount = likeCount;
      data.commentCount = commentCount;
      data.contextString = contextString;
    });

    return result;
  }
});
