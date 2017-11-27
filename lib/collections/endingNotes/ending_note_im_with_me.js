import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnImWithMe = new Mongo.Collection('endingNoteImWithMe');

Meteor.methods({
  imWithMeQuestionFindOne: function(_id) {
    return CLT.EnImWithMe.findOne({_id: _id});
  },

  imWithMeQuestionInsert: function(obj) {
    if (Meteor.isServer) {
      var withMeData = CLT.EnQuestionList.findOne({questionId: obj.questionId}); // 타이틀 가져오기위한 find
      return CLT.EnImWithMe.insert({
        userId: obj.userId,
        questionId: obj.questionId,
        type: 'WM',
        title: withMeData.question,
        content: obj.content,
        images: [],
        tagList: [],
        lock: true,
        questionRegDate: global.utilGetDate().default,
        regDate: global.utilGetDate().default,
        updateDate: global.utilGetDate().default
      });
    }
  },

  imWithMeQuestionUpsert: function(_id, data) {
    return CLT.EnImWithMe.upsert(
      {'_id': _id},
      {$set: data,
        // $setOnInsert: {'regDate': global.utilGetDate().default}
        $setOnInsert: {'regDate': global.utilGetDate().default}
      }
    );
  },

  getImWithMeList: function(userId, searchCondition, searchText, sortBy) {
    var contentAllCount = 0;
    var result = {
      data:[],
      countAll:0
    };
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

    var tag = /(<([^>]+)>)/gi;

    switch (searchCondition) {
      case 'title': condition=[{'title': {$in: regex}}];
      break;
      case 'content': condition=[{'content': {$in: regex}}];
      break;
      // case 'tag': condition=[{'tagList': {$in: regex}}];
      // break;
      default:
      condition = [
        // {"title": regex},
        // {"content": regex},
        // {"tagList": {$in:[searchText]}}
        {"title": {$in: regex}},
        {"content": {$in: regex}},
        // {"tagList": {$in: regex}}
      ];
    }

    switch(sortBy) {
      case 'regDateDesc':
        sortParam = {regDate:-1}; //result.data =  _.sortBy(result.data, 'regDate').reverse();
        break;
      case 'regDateAsc':
        sortParam = {regDate:1}; //result.data =  _.sortBy(result.data, 'regDate');
        break;
      // case 'startDateDesc':
      //   sortParam = {startDate:-1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate').reverse();
      // break;
      // case 'startDateAsc':
      //   sortParam = {startDate:1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate');
      // break;
      // case 'like':
      //   sortParam = {likeCount:-1, regDate:-1}; //result.data =  _.sortBy(result.data, 'likeCount').reverse();
      // break;
    }

    var imWithMeList = CLT.EnImWithMe.find({'userId': userId, $or: condition},{$sort:sortParam}).fetch();
    // var questionList = CLT.EnQuestionList.find().fetch();

    var im = [];
    imWithMeList.map(function(item) {
      // DB에 content에 html태그도 조건검색 방지
      if (searchText.toString() !== "") {
        for (var j = 0; j < searchText.length; j++) {
          var title = item.title.replace(/(<([^>]+)>)/gi, "");
          var content = item.content.replace(/(<([^>]+)>)/gi, "");
          var tag = item.tagList;
          var regSearch = new RegExp([searchText[j], ".*"].join(""), "");
          if (title.match(regSearch) || content.match(regSearch)){
            im.push(item);
          }
          // else if(_.indexOf(tag, searchText[j]) !== -1) {
          //   im.push(item);
          // }
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
          _.find(im[i].tagList, function(item, g) {
            if (item === searchText[x]) {
              im[i].tagList[g] = '<strong>' + searchText[x] + '</strong>';
            } else {
              im[i].tagList[g] = item;
            }
          });
        }

        titleTxt.push(title);
        contentTxt.push(content);

        // var comments = CLT.ImsComment.find({postId: im[i]._id}, {sort: {regDate: -1}}).fetch();
        // var commentTop = CLT.ImsComment.find({postId: im[i]._id, replyKey: ''}, {sort: {regDate: -1}}).fetch()[0];

        result.data.push({
          _id: im[i]._id,
          questionId: im[i].questionId,
          title: titleTxt,
          content: contentTxt,
          userId: im[i].userId,
          type: im[i].type,
          lock: im[i].lock,
          regDate: im[i].regDate,
          updateDate: im[i].updateDate,
          images: im[i].images,
          tagList: im[i].tagList,
        });
      }

      result.countAll = result.data.length ? result.data.length : 0;
      switch(sortBy) {
        case 'regDateDesc':
        result.data = _.sortBy(result.data, 'regDate').reverse(); //result.data =  _.sortBy(result.data, 'regDate').reverse();
        break;
        case 'regDateAsc':
        result.data = _.sortBy(result.data, 'regDate'); //result.data =  _.sortBy(result.data, 'regDate');
        break;
        // case 'startDateDesc':
        //   sortParam = {startDate:-1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate').reverse();
        // break;
        // case 'startDateAsc':
        //   sortParam = {startDate:1, regDate:-1}; //result.data =  _.sortBy(result.data, 'startDate');
        // break;
        // case 'like':
        //   sortParam = {likeCount:-1, regDate:-1}; //result.data =  _.sortBy(result.data, 'likeCount').reverse();
        // break;
      }

      result.data = _.chain(result.data).groupBy('questionId').map(function(value, key){
        return{
          title: value[0].title,
          questionId: key,
          count: value.length > 0 ? value.length : 0,
          content: value
        };
      }).value();
    }
    return result;
  },

  imWithMeQuestionRemove: function(_id, flag) {
    if (flag) {
      // flag값이 잇으면 timeline의 데이터도 같이 삭제한다
      CLT.EnTimeline.remove({postId: _id});
    }
    return CLT.EnImWithMe.remove({_id: _id});
  }
});