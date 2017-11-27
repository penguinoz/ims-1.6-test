// Meteor.publish('inheritance_userid', function(userId) {
//   return CLT.Inh.find({userId:userId},{sort:{regDate:1}});
// });
//
// Meteor.publish('inheritance_inheritanceId', function(inheritanceId) {
//   return CLT.Inh.find({_id:inheritanceId});
// });
//
// Meteor.publish('getInheritanceHistory', function(userId) {
//   return [CLT.ImsLog.find({userId:userId,type:'IH'},{sort:{regDate:-1}}),
//     CLT.Inh.find({userId:userId , msgId:''})];
//
// });
//
// Meteor.publish('inheritanceList_inheritorId', function(inheritorId) {
//   var parentInhIds = [];
//   var parentInh = CLT.Inh.find({
//     $and:[
//       {inheritorId:inheritorId},
//       {$and: [
//         {parentInhId:{$exists:true}},
//         {parentInhId:{$ne:''}}
//       ]},
//       {$or: [
//         {isDeleted:{$exists:false}},
//         {isDeleted : false}
//       ]}
//     ]
//   }).fetch();
//   _.each(parentInh, function(pInhInfo){
//     if(pInhInfo.parentInhId){
//         parentInhIds.push(pInhInfo.parentInhId);
//     }
//   });
//   return CLT.Inh.find({
//       $or : [
//         {_id : {$in : parentInhIds}},
//         {inheritorId:inheritorId, parentInhId : {$in : parentInhIds}},
//         {$and:[
//           {inheritorId:inheritorId},
//           {$or: [
//             {isDeleted:{$exists:false}},
//             {isDeleted : false}
//           ]},
//           {$or : [
//             {$and: [
//               {inheritanceDate:{$exists:true}},
//               {inheritanceDate:{$ne:''}},
//               {contents:{$ne:[]}}
//             ]},
//             {$and: [
//               {instDate:{$exists:true}},
//               {instDate:{$ne:''}},
//               {instContents:{$ne:[]}}
//             ]},
//           ]}
//         ]}
//       ]
//     });
// });
//
// Meteor.publish('inheritancePreview',function(userId){
//   return CLT.Inh.find({userId:userId});
// });
