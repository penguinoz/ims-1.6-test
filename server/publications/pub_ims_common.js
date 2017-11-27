// // 일반적인 publish를 선언 함
// // 추후 페이지, 기능에 따라서 파일을 분류할 수도 있음
//
// // ex)
// // Meteor.publish('getExample', function(id) {
// //   return Meteor.users.find({'_id': id}, {fields: {'services': 1}});
// // });
// Meteor.publish('emojis', function() {
//   return Emojis.find();
// });
//
// // Meteor.publish('usersInfo', function() {
// //   // return Meteor.users.find({},{fields : {username : 1, 'profile.nickName' : 1, 'profile.email' : 1, 'profile.name':1, 'profile.friends':1}});
// //   return Meteor.users.find({});
// // });
//
// Meteor.publish('imsCode', function() {
//   return CLT.ImsCode.find();
// });
//
// Meteor.publish('userOneInfo', function(_id) {
//   return Meteor.users.find({_id: _id},{fields : {username : 1, 'profile' : 1}});
// });
//
// Meteor.publish('getNotiCount', function(_userId){
//   var today = global.utilGetDate().default;
//   var yesterday = global.fn_getCalDate(today,1,'SUB');
//   return CLT.ImsNoti.find({
//     $and:[
//       {$or : [
//         {userId: _userId},
//         {userId: 'imsadmin'},
//       ]},
//       {$and : [//본인인 쓴 답글에 대한 내용은 count 하지 않는다.
//         {$or : [
//           {contentType: 'subComment', 'options.userId' : {$ne:_userId}},
//           {contentType: {$ne:'subComment'}}
//         ]}
//       ]},
//       {opened : false},
//       //날짜가 하루가 넘지 않은것들
//       {regDate : {$gte : yesterday}}
//     ]
//   });
// });
//
// Meteor.publish('getComments', function(_id) {
//   return CLT.ImsComment.find({postId: _id});
// });
