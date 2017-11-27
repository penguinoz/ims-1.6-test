import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnQuestionList = new Mongo.Collection('endingNoteQuestionList');
// CLT.EnQuestionHistory = new Mongo.Collection('endingNoteQuestionHistory');

Meteor.methods({
  enQuestionFind: function(questionId) {
    var stage = [
      {$sample: {size: 1}}
    ];
    if (questionId) {
      stage = [
        {$match: {questionId: {$ne: questionId}}}, // $ne 이미 가져왓던 질문은 제외시킨다
        {$sample: {size: 1}}
      ];
    }
    if (Meteor.isServer) {
      var result = CLT.EnQuestionList.aggregate(stage);
      return result;
    }
  },
  getQuestionHistory: function(_userId){
      var result = [];
      if(Meteor.isServer){
        var qList = CLT.EnQuestionList.find().fetch();
        var qHistory = CLT.EnQuestionHistory.find({userId:_userId}).fetch()[0];

        if(qHistory){
          _.each(qHistory.questionList, function(qhList){
            var question = _.findWhere(qList, {questionId : qhList.questionId});
            qhList = _.extend(qhList, question);
            result.push(qhList);
          });
        }
      }
      return result;
  },
  saveQuestionList: function(_questionId, _userId){
    if(Meteor.isServer){
      var qHistory = CLT.EnQuestionHistory.find({userId: _userId}).fetch()[0];

      if(!qHistory){
        CLT.EnQuestionHistory.insert(
          {
            'userId' : _userId,
            'questionList' : [{
              questionId : _questionId,
              updateDate : global.utilGetDate().default
            }]
          }
        );
      } else if(_.findWhere(qHistory.questionList,{'questionId':_questionId})){
        CLT.EnQuestionHistory.update(
          {
            'userId' : _userId,
            'questionList.questionId' : _questionId
          },
          {$set:
            {'questionList.$.updateDate' : global.utilGetDate().default}
          }
        );
      } else {
        CLT.EnQuestionHistory.update(
          {
            'userId' : _userId,
          },
          {$push:
            {
              'questionList':{
                questionId:_questionId,
                updateDate: global.utilGetDate().default
              }
            }
          }
        );
      } //end if
    } //end if
  },
  enQuestionChoice: function(questionId) {
    var stage = [
      {$sample: {size: 1}}
    ];
    if (questionId) {
      stage = [
        {$match: {questionId: questionId}},
        {$sample: {size: 1}}
      ];
    }
    if (Meteor.isServer) {
      var result = CLT.EnQuestionList.aggregate(stage);
      return result;
    }
  }
});