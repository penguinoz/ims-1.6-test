// Meteor.publish('endingNoteImMe', function(userId) {
//   return [
//     //EndingNoteImMe.find({userId: userId})
//     CLT.EnImMe.find(),
//     //EndingNoteImMe.find({},{projection : {questionId : 1, answer:1}}),
//     CLT.EnQuestionList.find(),
//     CLT.EnStory.find({userId : userId})
//   ];
// });
// //
// // Meteor.publish('endingNoteImMe', function(userId) {
// //   console.log('asdfasdfasdfasdf');
// //
// //   var questionList = CLT.EnQuestionList.find().fetch();
// //   var result = [];
// //   var talkToMeList = EndingNoteImMe.find({'userId': userId}, {sort : {'regDate': 1}});
// //   talkToMeList.forEach(function(talkToMe){
// //     // var reOrder = _.sortBy(talkToMe.answer, 'updateDate').reverse();
// //     // talkToMe.answer = reOrder;
// //     // console.log(talkToMe.answer);
// //     // var dateArray = [];
// //     // talkToMe.answer.forEach(function(data){
// //     //   if(_.isUndefined(_.findWhere(dateArray, new Date(data.updateDate).format("yyyy년 MM월 dd일")))) {
// //     //     dateArray.push(new Date(data.updateDate).format("yyyy년 MM월 dd일"));
// //     //   }
// //     //   else {
// //     //     data.updateDate = '';
// //     //   }
// //     // });
// //
// //     var question = _.findWhere(questionList, {questionId : talkToMe.questionId});
// //     talkToMe = _.extend(question, talkToMe);
// //     result.push(talkToMe);
// //   });
// //   console.log(result);
// //   return result;
// // });
//
//
