// // Meteor.publish('story_all', function(pageType, limit) {
// //   return [
// //     CLT.EnStory.find({$or:[
// //       {'lock': false},
// //       {'userId': global.login.userId}
// //     ], type: pageType}, {sort:{regDate:-1}, limit:limit}),
// //     CLT.ImsComment.find({}),
// //     CLT.Imstag.find({})
// //   ];
// // });
// // Meteor.publish('story', function(userId, pageType, limit) {
// //   return [
// //     CLT.EnStory.find({userId: userId, type: pageType}, {sort:{regDate:-1}, limit:limit}),
// //     CLT.ImsComment.find({}),
// //     // CLT.Imstag.find({userId: userId})
// //   ];
// // });
// Meteor.publish('story_id', function(_id) {
//   return [
//     CLT.EnStory.find({_id: _id}),
//     CLT.ImsComment.find({postId: _id}),
//     CLT.ImsLike.find({postId: _id}),
//     // CLT.Imstag.find({postId: _id})
//   ];
// });
// Meteor.publish('storyAll', function() {
//   return [
//     CLT.EnStory.find({}),
//     // CLT.ImsComment.find({}),
//     // CLT.Imstag.find({userId: userId})
//   ];
// });