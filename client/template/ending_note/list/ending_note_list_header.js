import {global} from '/imports/global/global_things.js';

/////////////////////////////////////////////////////////////////////////////
// Im menu
/////////////////////////////////////////////////////////////////////////////
Template.endingNoteListHeaderIm.onCreated(function(){
  this.isNote = this.data.isNote;
  this.writeButton = new ReactiveVar(true);
  if (this.isNote) {
    this.writeButton.set(false);
  }
  Session.set('endingNoteListHeaderIm selectedMenu', null);
});

Template.endingNoteListHeaderIm.onRendered(function(){
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template.endingNoteListHeaderIm.helpers({
  selectedMenu: function(menuName){
    if(_.isEqual(Session.get('endingNoteListHeaderIm selectedMenu'), menuName)){
      return true;
    } else {
      return false;
    }
  },
  hpWriteButton: function() {
    return Template.instance().writeButton.get();
  }
});

Template.endingNoteListHeaderIm.events({
  "click #writeEnding,#traceEnding,#talkToMeEnding,#feelEnding": function(e, t){
    e.preventDefault();

    Session.set('endingNoteListHeaderIm selectedMenu', e.currentTarget.id);
    Session.set('timelineMain selectedMenu', 'im');

    var templateData = {};
    switch(e.currentTarget.id) {
      // 나 -> 글쓰기
      case 'writeEnding':
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imWriting';
      break;

      // 나 -> 발자취
      case 'traceEnding':
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imLifeTrace';
      break;

      // 나 -> 톡투미
      case 'talkToMeEnding':
        if (t.isNote) {
          templateData = {
            data: {
              content: {
                meUserId: global.login.userId
              }
            }
          };
        }
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imMe';
      break;

      // 나 -> 나랑
      case 'feelEnding':
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imWithMe';
        // templateData.contentTmp = 'imWithMeSub';
        // templateData.contentTmp = 'imWithMeDetail';
      break;
    }

    Session.set('endingNoteList templateData', templateData);
  },
  "click #meMain": function(e, t){
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderIm';
    templateData.contentTmp = 'imContent';
    Session.set('endingNoteListHeaderIm selectedMenu', null);
    Session.set('endingNoteList templateData', templateData);
  }
});

/////////////////////////////////////////////////////////////////////////////
// bucketlist menu
/////////////////////////////////////////////////////////////////////////////
Template.endingNoteListHeaderBucketList.onCreated(function(){
  this.isNote = this.data.isNote;
  this.writeButton = new ReactiveVar(true);
  if (this.isNote) {
    this.writeButton.set(false);
  }
  Session.set('endingNoteListHeaderBucketList selectedMenu', null);
});

Template.endingNoteListHeaderBucketList.onRendered(function(){
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template.endingNoteListHeaderBucketList.helpers({
  selectedMenu: function(menuName){
    if(_.isEqual(Session.get('endingNoteListHeaderBucketList selectedMenu'), menuName)){
      return true;
    } else {
      return false;
    }
  },
  hpWriteButton: function() {
    return Template.instance().writeButton.get();
  }
});

Template.endingNoteListHeaderBucketList.events({
  "click #writeEnding,#bucketChart": function(e, t){
    e.preventDefault();

    Session.set('endingNoteListHeaderBucketList selectedMenu', e.currentTarget.id);
    Session.set('timelineMain selectedMenu', 'bucket');

    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    Session.set('endingNoteList templateData', templateData);
      switch(e.currentTarget.id) {
        // 버킷리스트 -> 글쓰기
        case 'writeEnding':
        setTimeout(function(){
          templateData.contentTmp = 'bucketwriting';
          Session.set('endingNoteList templateData', templateData);
        });
        break;

        // 버킷리스트 -> 통계
        case 'bucketChart':
        setTimeout(function(){
          templateData.contentTmp = 'bucketChart';
          Session.set('endingNoteList templateData', templateData);
        });
        break;

      }
  },
  "click #bucketMain": function(e, t){
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketContent';
    Session.set('endingNoteListHeaderBucketList selectedMenu', null);
    Session.set('endingNoteList templateData', templateData);
  }
});

/////////////////////////////////////////////////////////////////////////////
// timeCapsule menu
/////////////////////////////////////////////////////////////////////////////
Template.endingNoteListHeaderTimeCapsule.onCreated(function(){
  this.isNote = this.data.isNote;
  this.writeButton = new ReactiveVar(true);
  if (this.isNote) {
    this.writeButton.set(false);
  }
  Session.set('endingNoteListHeaderTimeCapsule selectedMenu', null);
});
Template.endingNoteListHeaderTimeCapsule.onRendered(function(){
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template.endingNoteListHeaderTimeCapsule.helpers({
  selectedMenu: function(menuName){
    if(_.isEqual(Session.get('endingNoteListHeaderTimeCapsule selectedMenu'), menuName)){
      return true;
    } else {
      return false;
    }
  },
  hpWriteButton: function() {
    return Template.instance().writeButton.get();
  }
});

Template.endingNoteListHeaderTimeCapsule.events({
  "click #capsuleMap,#capsuleWrite": function(e, t){
    e.preventDefault();

    Session.set('timelineMain selectedMenu', 'time');
    var templateData = {};
    switch(e.currentTarget.id) {
      // 타임캡슐 -> 지도보기
      case 'capsuleMap':
        var modalobj = {};
        modalobj.template = 'timeCapsuleAllviewMapPopup';
        modalobj.size = 'imsr-pop modal-xxl timecapsule';
        modalobj.fade = true;
        modalobj.backdrop = 'static';
        modalobj.data = {
          screenId:'bigScreen',
          rangeId:'bigScreenRange'
        };
        global.utilModalOpen(e, modalobj);
        // templateData = Session.get('endingNoteList templateData');
      break;

      // 타임캡슐 -> 글쓰기
      case 'capsuleWrite':
        Session.set('endingNoteListHeaderTimeCapsule selectedMenu', e.currentTarget.id);
        templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
        Session.set('endingNoteList templateData', templateData);

        templateData.contentTmp = 'timeCapsuleWriting';
        setTimeout(function(){
          Session.set('endingNoteList templateData', templateData);
        });
      break;
    }
  },
  "click #timeMain": function(e, t){
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
    templateData.contentTmp = 'timeCapsuleContent';
    Session.set('endingNoteListHeaderTimeCapsule selectedMenu', null);
    Session.set('endingNoteList templateData', templateData);
  }
});

/////////////////////////////////////////////////////////////////////////////
// future menu
/////////////////////////////////////////////////////////////////////////////

Template.endingNoteListHeaderFuture.onCreated(function(){

});

Template.endingNoteListHeaderFuture.helpers({
  selectedMenu: function(){

  }
});

Template.endingNoteListHeaderFuture.events({
  "click #futureMain": function(e, t){
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderFuture';
    templateData.contentTmp = 'futureContent';
    Session.set('endingNoteList templateData', templateData);
  }
});

/////////////////////////////////////////////////////////////////////////////
// search menu
/////////////////////////////////////////////////////////////////////////////

Template.endingNoteListHeaderSearch.onCreated(function(){
 // var instance = this;
 // instance.searchText = new ReactiveVar();
 // if(instance.data){
 //   instance.searchText.set(instance.data);
 // }
});

Template.endingNoteListHeaderSearch.helpers({
  hpSearchText: function(){
    return Session.get('imsSearching text');
  }
});


