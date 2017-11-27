// import { Meteor } from 'meteor/meteor';
import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';
import export_email_time_capsule from '/imports/email_template/email_time_capsule.js';

Meteor.startup(() => {

  if(!Meteor.settings.public.serverType){
    console.log('check a start option');
    throw new Meteor.Error('check a start option', 'check a start option');
  }
  // code to run on server at startup
  // Meteor.subscribe('emojis');
  var inhguardUsers = CLT.InhGuardians.find({},{fields:{userId:1,_id:0}}).fetch();
  for(var i in inhguardUsers){
    inhguardUsers[i] = inhguardUsers[i].userId;
  }
  // console.log('inhguardUsers',inhguardUsers);
  var usersList = Meteor.users.find({},{fields:{username:1,_id:0}}).fetch();
  for(var i in usersList){
    usersList[i] = usersList[i].username;
  }
  // console.log('usersList',usersList);
  // console.log('diff',_.difference(usersList,inhguardUsers));
  var diffUsers = _.difference(usersList,inhguardUsers);
  var updateParam = [];
  for(var i in diffUsers){
    updateParam.push({
      userId:diffUsers[i],
      regDate:global.utilGetDate().korYMD,
      updateDate:global.utilGetDate().korYMD,
      request : [],
      receive : [],
      accept : [],
      refuse : []
    });
  }
  for(var i in updateParam){
    CLT.InhGuardians.insert(updateParam[i]);
  }


  Meteor.call('getCodeOption',function(error, result){
    if(error){
      return;
    } else {
      process.env.MAIL_URL = result.smtpServerInfo;
    }
  }); //서버쪽 codeConfig설정
  // process.env.MAIL_URL = 'smtp://52.79.223.154:25';


  // var schedule = later.parse.text('every 1 min'); //https://bunkat.github.io/later/parsers.html#text 문법 참고
  //타임캡슐 스케쥴 : 매일 새벽 3시 1회 동작
  var timeCapsuleSchedule = later.parse.text('at 3:00 am every 1 day'); //https://bunkat.github.io/later/parsers.html#text 문법 참고
  var sendDailyEmailer = new ScheduledTask(timeCapsuleSchedule, callbatchSendTimeCapsuleEmail);
  sendDailyEmailer.start();

  var bucketChartSchedule = later.parse.text('at 4:00 am every 1 day');
  var setDailyBucketChart = new ScheduledTask(bucketChartSchedule, callbucketChartCountBatch);
  setDailyBucketChart.start();

  function callbatchSendTimeCapsuleEmail(){
    Meteor.call('batchSendTimeCapsuleEmail');
  }

  function callbucketChartCountBatch(){
    Meteor.call('bucketChartCountBatch');
  }
});
