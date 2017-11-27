import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnFutureStory = new Mongo.Collection('endingNoteFutureStory');

// param 1.id 2.
Meteor.methods({
  futureGetList: function(userId, limit, searchCondition, searchText, isPast, sortBy) {
    var contentAllCount = 0;
    var result = {
      data : [],
      count : contentAllCount
    };
    var im = null;
    var regex = new RegExp(["^.*", searchText, ".*"].join(""), "gi");
    var condition = [];
    //on일경우 과거 포함
    if(isPast){
      startPoint = "";
    }else{
      //내일부터 반영
      startPoint = new Date().toISOString();
    }
    //sorting 변수 설정
    var sortParam = {};
    if(_.isEqual(sortBy,'regDateDesc')){
      sortParam ={regDate:-1};
    } else if(_.isEqual(sortBy,'regDateAsc')){
      sortParam ={regDate:1};
    } else if(_.isEqual(sortBy,'like')){
      sortParam ={open:-1,regDate:-1};
    } else {
      sortParam ={startDate:-1};
    }

    switch (searchCondition) {
      case 'title': condition=[{'title': regex}];
      break;
      case 'content': condition=[{'content': regex}];
      break;
      // case 'tag': condition=[{'tagList': regex}];
      // break;
      default:
      condition=[
        {"title": regex},
        {"content": regex}
      ];
    }

    futureResult = CLT.EnFutureStory.find(
      {$or:condition ,'startDate':{$gt:startPoint}},
      {sort:sortParam, limit:limit}
    ).fetch();

    contentAllCount = CLT.EnFutureStory.find(
      {$or:condition ,'startDate':{$gt:startPoint}}
    ).count();

    if (futureResult.length !== 0) {
      for (var i = 0; i < futureResult.length; i++) {
        var regex2 = new RegExp([searchText].join(""), "gi");
        // 데이터영역의 태그를 삭제
        var title = futureResult[i].title.replace(/(<([^>]+)>)/gi, "");
        var content = futureResult[i].content.replace(/(<([^>]+)>)/gi, "");

        // 태그를 삭제한 데이터영역과 검색키워드의 문자열을 찾는다
        var titleFlag = title.indexOf(searchText);
        var contentFlag = content.indexOf(searchText);


        var titleTxt = title;
        var contentTxt = content;

        // 태그를 삭제한 데이터영역과 검색키워드의 문자열이 일치하지 않을때
        // 태그를 삭제하지않은 데이터로 검색 키워드를 비교해 result배열에 데이터를 담는다
        // if (titleFlag !== -1 || contentFlag !== -1 || searchCondition === 'all' || searchCondition === 'tag') {

        if(!_.isEmpty(searchText) && titleFlag !== -1 && (searchCondition === 'all' || searchCondition === 'title')){
          titleTxt = title.replace(regex2, '<strong value='+futureResult[i]._id+'>' + searchText + '</strong>');
        }
        if(!_.isEmpty(searchText) && contentFlag !== -1 && (searchCondition === 'all' || searchCondition === 'content')) {
          contentTxt = content.replace(regex2, '<strong value='+futureResult[i]._id+'>' + searchText + '</strong>');
        }
        contentTxt = global.utilEllipsis(contentTxt, 100);

        // 태그글씨 굴게 표시
        _.find(futureResult[i].tagList, function(item, g) {
          if (item === searchText) {
            futureResult[i].tagList[g] = '<strong>' + searchText + '</strong>';
          } else {
            futureResult[i].tagList[g] = item;
          }
        });
        var comments = CLT.ImsComment.find({postId: futureResult[i]._id}, {sort: {regDate: -1}}).fetch();
        var commentTop = CLT.ImsComment.find({postId: futureResult[i]._id, replyKey: ''}, {sort: {regDate: -1}}).fetch()[0];
        var likeList = CLT.ImsLike.find({postId: futureResult[i]._id}).fetch();

        result.data.push({
          title: titleTxt,
          content: contentTxt,
          _id: futureResult[i]._id,
          userId: futureResult[i].userId,
          like: likeList,
          open: futureResult[i].open,
          lock: futureResult[i].lock,
          startDate: futureResult[i].startDate,
          regDate: futureResult[i].regDate,
          updateDate: futureResult[i].updateDate,
          image: futureResult[i].images,
          tags: futureResult[i].tagList,
          commentList: comments,
          commentTop: commentTop
        });
      }
    }
    result.count = contentAllCount;
    return result;
  },
  futureStoryUpsert: function(_id, data) {
    return CLT.EnFutureStory.upsert(
      {'_id': _id},
      {$set: data,
        // $setOnInsert: {'regDate': global.utilGetDate().default}
        $setOnInsert: {'regDate': global.utilGetDate().default}
      }
    );
  },
  futureStoryInsert: function(data) {
    CLT.EnFutureStory.insert({
      "open" : data.open,
      "userId" : data.userId,
      "title" : data.title,
      "content" : data.content,
      "comment" : data.comment,
      "startDate" : data.startDate,
      "images" : data.images,
      "updateDate" : data.updateDate,
      "like" : data.like,
      // 'regDate': global.utilGetDate().default
      'regDate': global.utilGetDate().default

    }
  );
},
futureStoryDelete: function( _id ){
  CLT.EnFutureStory.remove(_id);
},
});
