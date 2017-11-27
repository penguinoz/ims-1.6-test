import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

Meteor.publish('bucketList_id', function(_id) {
  // var bsIds = _.keys(_.object(_.map(CLT.EnStory.find({postId:_id},{fields:{_id:1}}).fetch(), _.values)));
  return [
    CLT.EnBucketList.find({_id: _id}),
    CLT.EnBucketListExecPlan.find({bucketId: _id}),
    CLT.EnStory.find({postId:_id, type:'BS'}),
    // CLT.ImsLog.find({$or:[{postId:_id}, {postId:{$in:bsIds}}]},{fields:{userId:1, contextUserId:1, regDate:1, context:1, type:1, logType:1}}),
    CLT.ImsLog.find({postId:_id}),
    CLT.ImsComment.find({}),
    CLT.ImsFavor.find({contentId: _id}),
    CLT.ImsLike.find({postId: _id})
  ];
});

Meteor.publish('bucketComment', function(_contentId){
  return CLT.ImsComment.find({postId : _contentId, replyKey : ""}, {sort: {regDate: -1}});
});

Meteor.publish('bucketGetListWithTitleAndId', function(userId) {
  return CLT.EnBucketList.find(
    {
      $or:[
        {userId:userId},
        {groupUsers : {$in : [userId]}}
      ]
    }, {sort:{updateDate:-1}, fields: {title: 1}}
  );
});

Meteor.publish('futureStory_id', function(_id) {
  return [
    CLT.EnFutureStory.find({_id:_id}),
    CLT.ImsComment.find({postId: _id}),
    CLT.ImsLike.find({postId: _id}),
  ];
});

Meteor.publish("endingNoteImLifeTrace", function(argument){
  return [
          CLT.EnImLifeTrace.find({userId : argument}),
          CLT.EnStory.find()
        ];
});
Meteor.publish('endingNoteImMe', function(userId) {
  return [
    //EndingNoteImMe.find({userId: userId})
    CLT.EnImMe.find(),
    //EndingNoteImMe.find({},{projection : {questionId : 1, answer:1}}),
    CLT.EnQuestionList.find(),
    CLT.EnStory.find({userId : userId})
  ];
});
Meteor.publish('story_id', function(_id) {
  return [
    CLT.EnStory.find({_id: _id}),
    CLT.ImsComment.find({postId: _id}),
    CLT.ImsLike.find({postId: _id}),
    // CLT.Imstag.find({postId: _id})
  ];
});
Meteor.publish('storyAll', function() {
  return [
    CLT.EnStory.find({}),
    // CLT.ImsComment.find({}),
    // CLT.Imstag.find({userId: userId})
  ];
});
Meteor.publish('getTimeCapsuleByUid', function(_id) {
  return [
    CLT.EnTimeCapsule.find({_id:_id}),
    CLT.EnCapsuleMessage.find({capsuleId:_id}),
    CLT.ImsLog.find({postId:_id}),
    CLT.ImsComment.find({postId: _id}),
    CLT.ImsLike.find({postId: _id})
  ];
});

// ex)
// Meteor.publish('getExample', function(id) {
//   return Meteor.users.find({'_id': id}, {fields: {'services': 1}});
// });
Meteor.publish('emojis', function() {
  return Emojis.find();
});

Meteor.publish('imsCode', function() {
  return CLT.ImsCode.find();
});

Meteor.publish('userOneInfo', function(_id) {
  return Meteor.users.find({_id: _id},{fields : {username : 1, 'profile' : 1, authority: 1}});
});

Meteor.publish('getNotiCount', function(_userId){
  var today = global.utilGetDate().default;
  var yesterday = global.fn_getCalDate(today,1,'SUB');
  return CLT.ImsNoti.find({
    $and:[
      {$or : [
        {userId: _userId},
        {userId: 'imsadmin'},
      ]},
      {$and : [//본인인 쓴 답글에 대한 내용은 count 하지 않는다.
        {$or : [
          {contentType: 'subComment', 'options.userId' : {$ne:_userId}},
          {contentType: {$ne:'subComment'}}
        ]}
      ]},
      {opened : false},
      //날짜가 하루가 넘지 않은것들
      {regDate : {$gte : yesterday}}
    ]
  });
});

Meteor.publish('getComments', function(_id) {
  return CLT.ImsComment.find({postId: _id});
});
//코드성 데이터를 Publication함

// ex) 코드 데이터
// Meteor.publish('code', function() {
//   return Code.find();
// });
Meteor.publish('guardiansList_userId', function(userId) {
  return CLT.InhGuardians.find({userId: userId});
});
Meteor.publish('inheritance_userid', function(userId) {
  return CLT.Inh.find({userId:userId},{sort:{regDate:1}});
});

Meteor.publish('inheritance_inheritanceId', function(inheritanceId) {
  return CLT.Inh.find({_id:inheritanceId});
});

Meteor.publish('getInheritanceHistory', function(userId) {
  return [CLT.ImsLog.find({userId:userId,type:'IH'},{sort:{regDate:-1}}),
    CLT.Inh.find({userId:userId , msgId:''})];

});

Meteor.publish('inheritanceList_inheritorId', function(inheritorId) {
  var parentInhIds = [];
  var parentInh = CLT.Inh.find({
    $and:[
      {inheritorId:inheritorId},
      {$and: [
        {parentInhId:{$exists:true}},
        {parentInhId:{$ne:''}}
      ]},
      {$or: [
        {isDeleted:{$exists:false}},
        {isDeleted : false}
      ]}
    ]
  }).fetch();
  _.each(parentInh, function(pInhInfo){
    if(pInhInfo.parentInhId){
        parentInhIds.push(pInhInfo.parentInhId);
    }
  });
  return CLT.Inh.find({
      $or : [
        {_id : {$in : parentInhIds}},
        {inheritorId:inheritorId, parentInhId : {$in : parentInhIds}},
        {$and:[
          {inheritorId:inheritorId},
          {$or: [
            {isDeleted:{$exists:false}},
            {isDeleted : false}
          ]},
          {$or : [
            {$and: [
              {inheritanceDate:{$exists:true}},
              {inheritanceDate:{$ne:''}},
              {contents:{$ne:[]}}
            ]},
            {$and: [
              {instDate:{$exists:true}},
              {instDate:{$ne:''}},
              {instContents:{$ne:[]}}
            ]},
          ]}
        ]}
      ]
    });
});

Meteor.publish('inheritancePreview',function(userId){
  return CLT.Inh.find({userId:userId});
});
Meteor.publish('getMyMessagePub', function(userId) {
  return CLT.ImsMessage.find({userId:userId});
});
