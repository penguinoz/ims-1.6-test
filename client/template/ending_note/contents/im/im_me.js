import {global} from '/imports/global/global_things.js';

// 톡투미 > meQna
var templateName = 'imMe';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.isInherit = new ReactiveVar(false);
  // instance.userId = global.login.userId;
  // var userId = Meteor.userId;
  Session.set('imMe selectedList', null);
  Session.set('imMe collection', null);
  Session.set('answerEntry selectUpdate', null);

  if(instance.data && instance.data.content){
    instance.userId = instance.data.content.meUserId;
    instance.isInherit.set(true);
  } else {
    instance.userId = global.login.userId;
  }

  instance.autorun(function(){
    initMeData(instance.userId);
  });

  //
  // var subscription = instance.subscribe("endingNoteImMe", userId);
  // instance.autorun(function(){
  //   if (subscription.ready()) {
  //     var talkToMeList = CLT.EnImMe.find({'userId': userId}, {sort : {'updateDate': -1}});
  //     var questionList = CLT.EnQuestionList.find().fetch();
  //     var defaultData = [];
  //
  //     talkToMeList.forEach(function(talkToMe){
  //       var reOrder = _.sortBy(talkToMe.answer, 'updateDate').reverse();
  //       talkToMe.answer = reOrder;
  //       var dateArray = [];
  //       talkToMe.answer.forEach(function(data){
  //
  //         //동일답변한 사용자 수 정보 가져오기
  //         var sameAnswerUserCount = CLT.EnImMe.find({'userId': {$ne:userId}, 'questionId': talkToMe.questionId, 'answer' : {$elemMatch : {value : data.value}}}).count();
  //         data.sameAnswerUserCount = sameAnswerUserCount;
  //
  //         //tag에 연결된 내 추억글 개수 정보 가져오기
  //         var memoryListCount = CLT.EnStory.find({'userId': userId, 'tagList': { $in: [data.value] }}).count();
  //         data.memoryListCount = memoryListCount;
  //
  //         //중복일자 제거
  //         if(_.isUndefined(_.findWhere(dateArray, global.utilGetDate(data.updateDate).korYMD ))) {
  //           dateArray.push(global.utilGetDate(data.updateDate).korYMD);
  //         }
  //         else {
  //           data.updateDate = '';
  //         }
  //       });
  //
  //       //질문별 답변 그룹짓기
  //       var question = _.findWhere(questionList, {questionId : talkToMe.questionId});
  //       talkToMe = _.extend(question, talkToMe);
  //       defaultData.push(talkToMe);
  //
  //       //초기질문 화면 열기
  //       if(!Session.get('imMe selectedList')) {
  //         var questionId = question._id;
  //         if (instance.data) {
  //           questionId = instance.data.questionId;
  //         }
  //         Session.set('imMe selectedList', questionId);
  //       }
  //     });
  //     Session.set('imMe collection', defaultData);
  //   }
  // });
});

Template[templateName].helpers({
  hpTalkToMeList: function(){
    return Session.get('imMe collection');
  },
  hpIsInherit: function(){
    return Template.instance().isInherit.get();
  }
});

Template[templateName].events({
  "click div[name='questionHeader']": function(e, t){
    e.preventDefault();
    Session.set('imMe selectedList', e.currentTarget.id);
    Session.set('answerEntry selectUpdate', null);
  },
  'keyup #keywordText': function(e, t){
    e.preventDefault();

    var value = '';
    var objData = {};
    if (e.type === 'keyup' && e.keyCode === 13) {
      value = e.target.value;
      if(value.trim()){
        objData = {
          _id: Session.get('imMe selectedList'),
          answer: {
            uid : new Meteor.Collection.ObjectID().valueOf(),
            value : value,
            regDate: global.utilGetDate().default,
            updateDate: global.utilGetDate().default
          }
        };
        Meteor.call('imMeAddUpdate', objData);
        $(e.target).blur().val('');
        initMeData(t.userId);
      }
    }
  },
  'click #keywordClick': function(e, t){
    e.preventDefault();

    var value = '';
    var objData = {};
    if(e.target.id === 'keywordClick'){
      value = $(e.target).siblings().val() ? $(e.target).siblings().val() : '';
      $(e.target).siblings().blur().val('');
    } else {
      value = $(e.target).parent().siblings().val() ? $(e.target).parent().siblings().val() : '';
      $(e.target).parent().siblings().blur().val('');
    }

    if(value.trim()){
      objData = {
        _id: Session.get('imMe selectedList'),
        answer: {
          uid : new Meteor.Collection.ObjectID().valueOf(),
          value : value,
          regDate: global.utilGetDate().default,
          updateDate: global.utilGetDate().default
        }
      };
      Meteor.call('imMeAddUpdate', objData);
      initMeData(t.userId);
      // $('#keywordText').blur().val('');
    }
  },
  'click #btnDelete': function(e, t){
    e.preventDefault();
    var self = this;
    var userId = t.userId;
    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('imMeAnswerDelete', Session.get('imMe selectedList'), self.data.uid, function(error, result){
          if(error){
            return console.log("error", error);
          } else {
            if(result[0].answer.length === 0){
              Meteor.call('enTimelineDalete', Session.get('imMe selectedList'));
            }
            initMeData(userId);
          }
        });
      }
    }).catch(swal.noop);
  },
  'click #btnUpdate': function(e, t){
    e.preventDefault();
    Session.set('answerEntry selectUpdate', this.data.uid);
    setTimeout(function(){
      global.fn_timeLineInputResizing('#txtValue');
    }, 10);
  },
  'keyup #txtValue': function(e, t){
    e.preventDefault();

    if (e.keyCode === 13) {
      var objData = {
        _id: Session.get('imMe selectedList'),
        uid: this.data.uid,
        answerValue: e.target.value
      };
      Meteor.call('imMeUpdate', objData);
      Session.set('answerEntry selectUpdate', null);
      initMeData(t.userId);
    }
    //inputbox width리사이징을 위한 function global
    global.fn_timeLineInputResizing(e.target);

  },
  'click #lnkMemListCnt': function(e, t){
    e.preventDefault();

    if(this.data.memoryListCount === 0){
      return global.utilAlert('관련된 내 글이 없습니다.');
    }

    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderIm';
    templateData.contentTmp = 'imContent';
    templateData.data = {
      searchOption:{
        filter : 'tag',
        searchText : this.data.value
      }
    };
    // templateData.searchOption = {
    //   filter : 'tag',
    //   searchText : this.value
    // };
    Session.set('endingNoteList templateData', templateData);
  }
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

function initMeData(_userId){
  var instanceData = null;
  if(Template.instance() && Template.instance().data){
    instanceData = Template.instance().data;
  }
  Meteor.call('imMeAndQuestionList', _userId, function(error, result){
    if(error){
      return console.log(error);
    } else {
      //초기질문 화면 열기
      if(!Session.get('imMe selectedList') && result.length > 0) {
        var questionId = result[0]._id;
        if (instanceData && instanceData.questionId) {
          questionId = instanceData.questionId;
        }
        Session.set('imMe selectedList', questionId);
      }
      Session.set('imMe collection', result);
    }
  });
}

Template.talkToMeList.helpers({
  hpAnswerArray: function(data){
    var answers = '';
    if(data.answer) {
      data.answer.forEach(function(answer) {
        answers += answer.value + ',';
      });
    }
    var str = global.utilEllipsis(answers.slice(0,-1), 20);
    return str;
  },
  hpQuestionTitle: function(data){
    return data.question;
  },
  hpSelected: function(_id){
    return _.isEqual(Session.get('imMe selectedList'), _id);
  }
});

Template.answerEntry.helpers({
  hpRegDate: function(){

    var hRegDate = '';
    if(_.isEmpty(this.data.updateDate)){
      hRegDate = '';
    }
    else {
      hRegDate = global.utilGetDate(this.data.updateDate).defaultYMD;//moment(this.updateDate).format("YYYY년 MM월 DD일");
    }

    return hRegDate;
  },
  hpSelectUpdate: function(uid){
    return _.isEqual(Session.get('answerEntry selectUpdate'), uid);
  }
});
