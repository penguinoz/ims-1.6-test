import {global} from '/imports/global/global_things.js';

var templateName = 'addFriendsPopup';
var totalArray = [];

Template[templateName].onCreated(function(){
  this.totalData = totalArray;
  const temp = Template.instance();
  var preCheckedList = [];
  if(this.data.checkedList){
    preCheckedList = this.data.checkedList;
    // console.log(preCheckedList);
  }
  if(global.login.userId){
    Meteor.call('getFriendsList', global.login.userId, function(error, result){
      if(error){console.error(error);}
      if(result && preCheckedList){
        for(var i=0; i<result.length ; i++){
          if(preCheckedList.indexOf(result[i].userId) !== -1){
            result[i].isMember = true;
            result[i].fakeIndex = i;
          }else{
            result[i].isMember = false;
            result[i].fakeIndex = i;
          }
        }
      }
      Session.set('addFriendsPopup friendsList', result);
      temp.totalData = result;
      //Session.set('addFriendsPopup friendsListFullList', result);
      //Template.instance().totalData = result;

    });
  }

  //this.totalData = Session.get('addFriendsPopup friendsList')||[];
});

Template[templateName].onRendered(function(){

});

Template[templateName].helpers({
  hpGroupFrendList: function(){
    return Session.get('addFriendsPopup friendsList');
  },
  hpResultCounter: function(){
    if(Session.get('addFriendsPopup friendsList')){
      return Session.get('addFriendsPopup friendsList').length;
    }
    return 0;
  }
});

Template[templateName].events({
  //그룹친구 추가 버튼
  "click #groupSave": function(){
    friendsListParam = [];
    var listParam = Template.instance().totalData;
    var groupNameList = "";
    for(var i=0 ; i<listParam.length ; i++){
      if(listParam[i].isMember){
        friendsListParam.push({userId:listParam[i].userId,
                              nickName:listParam[i].userInfo.nickName,
                              email:listParam[i].userInfo.email,
                              phone: listParam[i].userInfo.phone });
      }
    }
    var parentTempl = this.parentViewId.replace("Template.","");    //modal 호출 필수요소
    Template[parentTempl].__helpers.get('hpAddFriendCallBack')(friendsListParam);
    Modal.hide();
  },
  "click #search": function(){
    var searchOp = $("#keywordCondition").val();
    var searchKeyword = $("#keywordText").val()||"";
    var searchResult = [];
    switch(searchOp){
      case 'userId':
        for(var i=0; i<Template.instance().totalData.length; i++){
          if(Template.instance().totalData[i].userId.search(searchKeyword) !== -1){
            searchResult.push(Template.instance().totalData[i]);
          }
        }
      break;
      case 'nickName':
        for(var k=0; k<Template.instance().totalData.length; k++){
          if(Template.instance().totalData[k].userInfo.nickName.search(searchKeyword) !== -1){
            searchResult.push(Template.instance().totalData[k]);
          }
        }
      break;
      case 'email':
        for(var l=0; l<Template.instance().totalData.length; l++){
          if(Template.instance().totalData[l].userInfo.email.search(searchKeyword) !== -1){
            searchResult.push(Template.instance().totalData[l]);
          }
        }
      break;
      case 'phone':
        for(var m=0; m<Template.instance().totalData.length; m++){
          if(Template.instance().totalData[m].userInfo.phone.search(searchKeyword) !== -1){
            searchResult.push(Template.instance().totalData[m]);
          }
        }
      break;
    }
    if(!searchKeyword){
      searchResult = Template.instance().totalData;
    }
    var friList = Session.get('addFriendsPopup friendsList');
    for(var n=0; n<friList.length ; n++){
      $("#groupCheck_"+n).attr('checked',false);
    }
    Session.set('addFriendsPopup friendsList',searchResult);
  },
  "change input[name=inputCkeck]": function(e, t){
    var instanceData = Template.instance().totalData;

    for(var i=0; i<instanceData.length; i++){
      if(this.fakeIndex === Template.instance().totalData[i].fakeIndex){
        Template.instance().totalData[i].isMember = !Template.instance().totalData[i].isMember;
      }
    }

  }
});
