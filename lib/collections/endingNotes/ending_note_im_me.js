import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnImMe = new Mongo.Collection('endingNoteImMe');

Meteor.methods({
  // questionId있는지 없는지
  imMeQuestionIdFind: function(_userId, questionId) {
    return CLT.EnImMe.find({userId: _userId, questionId: questionId}).fetch();
  },
  imMeAndQuestionList: function(_userId){
    var result = [];
    if(Meteor.isServer){
      var talkToMeList = CLT.EnImMe.find({'userId': _userId}, {sort : {'updateDate': -1}}).fetch();
      var questionList = CLT.EnQuestionList.find().fetch();


      _.each(talkToMeList, function(talkToMe){
        var reOrder = _.sortBy(talkToMe.answer, 'updateDate').reverse();
        talkToMe.answer = reOrder;
        var dateArray = [];

        _.each(talkToMe.answer, function(data){
          //동일답변한 사용자 수 정보 가져오기
          var sameAnswerUserCount = CLT.EnImMe.find({'userId': {$ne:_userId}, 'questionId': talkToMe.questionId, 'answer' : {$elemMatch : {value : data.value}}}).count();
          data.sameAnswerUserCount = sameAnswerUserCount;

          //tag에 연결된 내 추억글 개수 정보 가져오기
          var memoryListCount = CLT.EnStory.find({'userId': _userId, 'tagList': { $in: [data.value] }}).count();
          data.memoryListCount = memoryListCount;

          //중복일자 제거
          if(_.isUndefined(_.findWhere(dateArray, global.utilGetDate(data.updateDate).korYMD ))) {
            dateArray.push(global.utilGetDate(data.updateDate).korYMD);
          }
          else {
            data.updateDate = '';
          }
        });
        // talkToMe.answer.forEach(function(data){
        //
        // });

        //질문별 답변 그룹짓기
        var question = _.findWhere(questionList, {questionId : talkToMe.questionId});
        talkToMe = _.extend(question, talkToMe);
        result.push(talkToMe);
        // //초기질문 화면 열기
        // if(!Session.get('imMe selectedList')) {
        //   var questionId = question._id;
        //   if (instance.data) {
        //     questionId = instance.data.questionId;
        //   }
        //   Session.set('imMe selectedList', questionId);
        // }
      });
      // talkToMeList.forEach(function(talkToMe){
      //
      // });
    }
    return result;
  },
  imMeFindList: function(_userId) {
    return CLT.EnImMe.find({userId: _userId}).fetch();
  },
  // 1.신규 질문 및 답변 추가
  imMeInsert: function(obj) {
    return CLT.EnImMe.insert({
      userId: obj.userId,
      questionId: obj.questionId,
      type: obj.type,
      answer: obj.answer,
      lock: true,
      regDate: global.utilGetDate().default,
      updateDate: global.utilGetDate().default
    });
  },
  //2. 기존 질문에 답변 추가
  imMeAddUpdate:function(obj) {
    return CLT.EnImMe.update(
      {_id : obj._id},
      {
        $push: {answer : obj.answer},
        $set : {updateDate: global.utilGetDate().default}
      }
    );
  },
  //3. 기존 답변 수정
  imMeUpdate:function(obj) {
    return CLT.EnImMe.update(
      {_id : obj._id, 'answer.uid' : obj.uid},
      {$set : {
        'answer.$.value' : obj.answerValue
        // 'answer.$.updateDate' : global.utilGetDate().default
        //updateDate: global.utilGetDate().default
      }}
    );
  },
  //4. 배열데이터 삭제
  imMeAnswerDelete:function(talkToMeId, uid) {
    var result;
    if(Meteor.isServer){
      CLT.EnImMe.update(
        {_id : talkToMeId},
        {$pull:
          {answer :
            {
              uid : uid,
            }
          }
        }
      );

      result = CLT.EnImMe.find(
        {_id : talkToMeId},
        {fields:{answer:1}}).fetch();

        if(result[0].answer.length === 0){
          CLT.EnImMe.remove({_id: talkToMeId});
        }
      }
      return result;
    },
    imMeDelete: function(_id) {
      CLT.EnImMe.remove({_id: _id});
    },
    // 질문+답변이 같은 count구하기
    imMeQuestionCount: function(_userId, questionId, text) {
      if (Meteor.isServer) {
        return CLT.EnImMe.find({
          userId: {$ne: _userId},
          questionId: questionId,
          answer: {$elemMatch: {value: text}}
        }).count();
      }
    },

  });