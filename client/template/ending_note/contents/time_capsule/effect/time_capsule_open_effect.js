import {global} from '/imports/global/global_things.js';

var templateName= 'timeCapsuleOpenEffect';
var instance;

Template[templateName].onCreated(function(){
  instance = this;
  instance.dynamicTemplateData = new ReactiveVar();
  instance.innerdata = new ReactiveVar();
  instance.receiveData = instance.data;

  var templateData = {};
  templateData = {};
  templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
  templateData.contentTmp = 'timeCapsuleDetail';
  templateData.data = {
    _id : instance.receiveData._id,
    selectedMenu : 'my',
    searchOption : instance.receiveData.searchOptionParam,
    statusMenu : 'unseal',
    contentTmp : 'timeCapsuleContentBury',
    contentTmpSec : 'timeCapsuleContentUnseal'
  };
  instance.dynamicTemplateData.set(templateData);
  instance.innerdata.set(instance.receiveData.innerData);
});

Template[templateName].onRendered(function(){
  var number = 0.2;
  $('.overlay-image').eraser({
    progressFunction: function(p) {
      if(p > number ){
        number = 100;
        $('.overlay-image').delay(100).fadeOut(3000);
        $('.overlay-image2').delay(100).fadeOut(3000);

        setTimeout(function(){
          var capsuleId = instance.receiveData._id;
          Meteor.call('setTimeCapsuleOpenedState', global.login.userId, capsuleId, function(error, result){
            if(error){
              return console.log(error);
            } else {
              //개봉 로그(히스토리)
              Meteor.call('setLog', capsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.unseal, 'unseal');
              var options = {
                userId: global.login.userId,
                title: instance.innerdata.get().title
              };
              // 개봉 알림 추가
              instance.innerdata.get().groupMember.map(function(item) {
                if (item.userId !== global.login.userId) {
                  Meteor.call('setNoti', item.userId, 'TC', capsuleId, 'open', options);
                }
              });
              // 개봉시 히스토리추가 및 타임라인 end값에 timelineDate추가
              var timelineObj = [{
                userId: global.login.userId,
                timeClass: 'end',
                contentType: 'E',
                timelineDate: self.unsealDate
              }];
              var openObj = {
                postId: self._id,
                typeKey: self._id,
                userId: global.login.userId,
                postType: 'TC',
                type: 'US',
                user: global.login.userId,
                timelineDate: global.utilGetDate().defaultYMD,
                regDate: global.utilGetDate().default,
                updateDate: global.utilGetDate().default
              };
              Meteor.call('enTimelineUpdate', self._id, timelineObj, function(error) {
                if (error) {
                  return alert(error);
                } else {
                  global.utilHistoryInsert(openObj);
                }
              });
            }
          });
        }, 3000);
        //setTimeout End;
        return;
      }
    }
  });
});

Template[templateName].helpers({
  hpDyTemplate: function(){
    return Template.instance().dynamicTemplateData.get();
  },
  hpTimeCapsuleData: function(){
    return Template.instance().innerdata.get();
  }
});