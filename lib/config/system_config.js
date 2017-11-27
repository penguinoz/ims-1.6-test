if(Meteor.settings.public.serverType === 'prod'){
  // console.log("prod: ", Meteor.settings.public.serverType);
  S3.config = {
  	key: 'AKIAJYDF7IPWB3EMBPMA',
  	secret: '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',
  	bucket: 's3-ims-contents',
  	region: 'ap-northeast-2', // Only needed if not "us-east-1" or "us-standard"
  };

}else{
  // console.log("dev : ", Meteor.settings.public.serverType);
  S3.config = {
  	key: 'AKIAJ5GKXJ5BN4RZ73EA',
  	secret: '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',
  	bucket: 'iml-images',
  	region: 'ap-northeast-2', // Only needed if not "us-east-1" or "us-standard"
  };
}

AWS.config.region = S3.config.region;
AWS.config.update({
  accessKeyId: S3.config.key,
  secretAccessKey: S3.config.secret
});