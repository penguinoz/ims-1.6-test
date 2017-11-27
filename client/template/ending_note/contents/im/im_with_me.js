import {global} from '/imports/global/global_things.js';

// 톡투미 > meQna
var templateName = 'imWithMe';
var srchCondition = '';
var srchText = '';
var sortBy = '';
var instance;

Template[templateName].onCreated(function(){
  instance = this;
  instance.data = new ReactiveVar(); //question, regDate로 분류
  var userId = global.login.userId;
  Session.set('imWithMe withMelist', null);
  Session.set('imWithMe selectedList', null);

  var subscription = instance.subscribe("endingNoteImWithMe", userId);

  var srchCondition = 'all';
  var srchText = '';
  var sortBy = 'regDateDesc';

  initialData(srchCondition, srchText, sortBy);
  //
  // instance.autorun(function(){
  //   if (subscription.ready()) {
  //     var imWithMeList = CLT.EnImWithMe.find({'userId': userId}, {sort : {'questionRegDate': -1}}).fetch();
  //     var questionList = CLT.EnQuestionList.find().fetch();
  //     var resultData = [];
  //
  //     if(_.isEqual(instance.sortType.get(), 'question')){
  //       //데이터 재 정의(질문순)
  //       resultData = _.chain(_.sortBy(imWithMeList, 'content')).groupBy('questionId').map(function(value, key){
  //
  //         _.each(value, function(val){
  //           var content = val.content.replace(/<\/p>/gi, "\n");
  //           content = content.replace(/(<([^>]+)>)/gi, "");
  //           // var content = im[i].content.replace(/<img(.*?)>/gi, "");  // 이미지태크 삭제
  //           // content = content.replace(/<p>/gi, "");                   // <p>태그 삭제
  //           // content = content.replace(/<br>/gi, "");
  //           // content = content.replace(/<\/p>/gi, "<br/>");            // </p> 태그 <br>태그 전환
  //           content = content.split('\n');
  //           var contentResult = '';
  //           for (var c = 0; c < content.length; c++) {
  //             if (content[c] !== "") {
  //               contentResult += content[c];
  //               if (c !== content.length-1) {
  //                 contentResult += '<br/>';
  //               }
  //             }
  //           }
  //           val.content = contentResult;
  //         });
  //
  //         return{
  //           title: value[0].title,
  //           questionId: key,
  //           content: value
  //         };
  //       }).value();
  //
  //       instance.withMelist.set(resultData);
  //     } else {
  //       //데이터 재 정의(등록순)
  //       instance.withMelist.set(imWithMeList);
  //     }
  //
  //     //초기질문 화면 열기
  //     if(!Session.get('imWithMe selectedList')) {
  //       var questionId = resultData[0].questionId;
  //       if (instance.data) {
  //         questionId = instance.data.questionId;
  //       }
  //       Session.set('imWithMe selectedList', questionId);
  //     }
  //   }
  // });
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');

  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpImWithMeList: function(){
    return Session.get('imWithMe withMelist');
  }
});

Template[templateName].events({
  "click div[name='questionHeader']": function(e, t){
    e.preventDefault();
    Session.set('imWithMe selectedList', e.currentTarget.id);
  },
  "click #search": function(e, t) {
    e.preventDefault();
    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;
    sortBy = t.find('#sort').value;

    //데이터 검색
    initialData(srchCondition, srchText, sortBy);
  },
  'click #subList': function(e, t){
    e.preventDefault();
    var templateData = {};

    var questionId = e.target.getAttribute('value');
    var title = e.target.getAttribute('titleText');
    templateData.headerTmp = 'endingNoteListHeaderIm';
    templateData.contentTmp = 'imWithMeWriting';
    templateData.data = {
      _id: null,
      questionId: questionId,
      title: title,
      searchOption:{
        filter : 'tag',
        searchText : this.value
      }
    };
    // templateData.searchOption = {
    //   filter : 'tag',
    //   searchText : this.value
    // };
    Session.set('endingNoteList templateData', templateData);
  },
  //개별 컨텐츠 클릭 > 상세내용보기
  'click article': function(e, t){
    e.preventDefault();

    var templateData = {};

    var questionId = e.target.getAttribute('value');
    var title = e.target.getAttribute('titleText');
    var data = {
      _id: this._id,
      searchOption:{
        filter : 'tag',
        searchText : this.value
      }
    };
    global.utilTemplateMove('endingNoteListHeaderIm', 'imWithMeDetail', data);
  }
});


function initialData(_srchCondition, _srchText, _sortBy){
  Meteor.call('getImWithMeList', global.login.userId, _srchCondition, _srchText, _sortBy, function(error, result){
    if(error){
      return console.log(error);
    } else {
      // Template.instance().withMelist.set(result);
      Session.set('imWithMe withMelist', result);
      //초기질문 화면 열기
      if(!Session.get('imWithMe selectedList') && result.data[0]) {
        var questionId = result.data[0].questionId;
        if (instance.data) {
          questionId = instance.data.questionId;
        }
        Session.set('imWithMe selectedList', questionId);
      }
    }
  });
}

Template.imWithMeList.helpers({
  hpSelected: function(questionId){
    return _.isEqual(Session.get('imWithMe selectedList'), questionId);
  },
});


// imWithMeSort ================================================================================
Template.imWithMeSort.onRendered(function(){

  $('#sort').val('startDateDesc'); //초기설정
  var searchOption = Session.get('endingNoteList templateData');
  if(Session.get('imContent clickTabMenu')){
    if(_.isEqual(this.data.type, 'my')) {
      $('#sort').val('startDateDesc');
    } else {
      $('#sort').val('regDateDesc');
    }
  } else {
    if(searchOption.data && searchOption.data.searchOption && searchOption.data.searchOption.sortParam) {
      $('#sort').val(searchOption.data.searchOption.sortParam);
    }
  }

  $('#sort').on('change', function(e, t) {
    sortBy = $('#sort option:selected').val();
    initialData(srchCondition, srchText, sortBy);
  });

  global.fn_selectPicker('.selectpicker', null);
});
