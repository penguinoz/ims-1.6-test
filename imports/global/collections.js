var collections = {};
//로컬
collections.LocalCollection = new Mongo.Collection(null);
collections.LcInhContentsList = new Mongo.Collection(null);

//엔딩노트
collections.EnBucketListExecPlan = new Mongo.Collection('endingNoteBucketListExecPlan');
collections.EnBucketList = new Mongo.Collection('endingNoteBucketList');
collections.EnCapsuleMessage = new Mongo.Collection('endingNoteCapsuleMessage');
collections.EnFutureStory = new Mongo.Collection('endingNoteFutureStory');
collections.EnHistory = new Mongo.Collection('endingNoteHistory');
collections.EnImLifeTrace = new Mongo.Collection('endingNoteImLifeTrace');
collections.EnImMe = new Mongo.Collection('endingNoteImMe');
collections.EnImWithMe = new Mongo.Collection('endingNoteImWithMe');
collections.EnQuestionList = new Mongo.Collection('endingNoteQuestionList');
collections.EnQuestionHistory = new Mongo.Collection('endingNoteQuestionHistory');
collections.EnStory = new Mongo.Collection('endingNoteStory');
collections.EnTimeCapsule = new Mongo.Collection('endingNoteTimeCapsule');
collections.EnTimeline = new Mongo.Collection('endingNoteTimeline');

//가디언 method
collections.InhGuardians = new Mongo.Collection('inheritanceGuardians');
collections.Inh = new Mongo.Collection('inheritance');

//IMS
collections.ImsInvite = new Mongo.Collection("imsInvite");
collections.ImsCode = new Mongo.Collection('imsCode');
collections.ImsComment = new Mongo.Collection('imsComment');
collections.ImsFavor = new Mongo.Collection('imsFavorite');
collections.ImsNoti = new Mongo.Collection('imsNotification');
collections.ImsLifeGoal = new Mongo.Collection('imsLifeGoal');
collections.ImsCustomFaq = new Mongo.Collection('imsCustomFaq');
collections.ImsCustomQna = new Mongo.Collection('imsCustomQna');
collections.InhFuneralInvitation = new Mongo.Collection("imsFuneralInvitation");
collections.ImsLike = new Mongo.Collection('imsLike');
collections.ImsLog = new Mongo.Collection("imsLog");
collections.ImsMessage = new Mongo.Collection("imsMessage");
collections.ImsNotice = new Mongo.Collection('imsNotice');
collections.BucketChart = new Mongo.Collection('bucketChart');
collections.ImsCodeOption = new Mongo.Collection('imsCodeOption');
collections.collectionExDay = new Mongo.Collection('imsExpectDay');

export {collections};
