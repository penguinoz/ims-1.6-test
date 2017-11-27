// Meteor.publish('bucketList_id', function(_id) {
//   // var bsIds = _.keys(_.object(_.map(CLT.EnStory.find({postId:_id},{fields:{_id:1}}).fetch(), _.values)));
//   return [
//     CLT.EnBucketList.find({_id: _id}),
//     CLT.EnBucketListExecPlan.find({bucketId: _id}),
//     CLT.EnStory.find({postId:_id, type:'BS'}),
//     // CLT.ImsLog.find({$or:[{postId:_id}, {postId:{$in:bsIds}}]},{fields:{userId:1, contextUserId:1, regDate:1, context:1, type:1, logType:1}}),
//     CLT.ImsLog.find({postId:_id}),
//     CLT.ImsComment.find({}),
//     CLT.ImsFavor.find({contentId: _id}),
//     CLT.ImsLike.find({postId: _id})
//   ];
// });
//
// Meteor.publish('bucketComment', function(_contentId){
//   return CLT.ImsComment.find({postId : _contentId, replyKey : ""}, {sort: {regDate: -1}});
// });
//
// Meteor.publish('bucketGetListWithTitleAndId', function(userId) {
//   return CLT.EnBucketList.find(
//     {
//       $or:[
//         {userId:userId},
//         {groupUsers : {$in : [userId]}}
//       ]
//     }, {sort:{updateDate:-1}, fields: {title: 1}}
//   );
// });
