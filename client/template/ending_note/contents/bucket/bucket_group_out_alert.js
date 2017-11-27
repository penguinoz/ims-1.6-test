import {global} from '/imports/global/global_things.js';

var templateName = 'bucketGroupOutAlert';
var isThereReturn = false;
var postIdParam = "";

Template[templateName].onCreated(function(){
  if(this.data){
    postIdParam = this.data._id;
  }
  Meteor.call("ctMyBucketStory", postIdParam, global.login.userId, function(error,result){

    if(error){
      console.log("error", error);
    }
    if(result){
      isThereReturn = true;
    } else {
      isThereReturn = false;
    }
    Session.set('bucketStory alertContext', isThereReturn);
  });
});

Template[templateName].onRendered(function(){
});

Template[templateName].events({
  "click #okButton": function(e, t){
    var radioValue = $("input[name=outGroupRadio]:checked").val();

    if(isThereReturn){
      switch(radioValue){
      //삭제요청
        case "delStory" :
          Meteor.call("delStoryUsePostId", postIdParam, global.login.userId ,function(error){
            if(error){
              console.error(error);
            }
          });
        break;
        case "moveIm" :
          //im이동 요청
          Meteor.call('moveStory', global.login.userId, null, postIdParam, global.pageType.im, function(error){
            if(error) {
              console.log(error);
            }
          });
        break;
      }
    }
    var usersData = this.groupUsers;
    if(usersData.indexOf(global.login.userId) !== -1){
      usersData.splice(usersData.indexOf(global.login.userId),1); //loginuser 삭제
    }
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketContent';
    Session.set('endingNoteList templateData', templateData);
    Meteor.call("removeGroupId", this._id , usersData, function(error){    //groupusers에서 id 삭제
      if(error){console.error(error);}
      Modal.hide();
    });

  }   //end okButton
});

Template[templateName].helpers({
  alertContext: function(){
    return Session.get('bucketStory alertContext');
  }
});

Template[templateName].onDestroyed(function(){
  isThereReturn = false;
  postIdParam = "";
});
