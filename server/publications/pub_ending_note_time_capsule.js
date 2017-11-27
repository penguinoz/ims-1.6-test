// Meteor.publish('getTimeCapsuleByUid', function(_id) {
//   return [
//     CLT.EnTimeCapsule.find({_id:_id}),
//     CLT.EnCapsuleMessage.find({capsuleId:_id}),
//     CLT.ImsLog.find({postId:_id}),
//     CLT.ImsComment.find({postId: _id}),
//     CLT.ImsLike.find({postId: _id})
//   ];
// });
//
//
// // Meteor.publish('timeCapsuleGetListWithTitleAndId', function(userId) {
// //   return CLT.EnTimeCapsule.find(
// //     {userId:userId}, {sort:{updateDate:-1}, fields: {title: true}}
// //   );
// // });
