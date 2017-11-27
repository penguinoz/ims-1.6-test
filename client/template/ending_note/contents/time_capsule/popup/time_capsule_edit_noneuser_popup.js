import {global} from '/imports/global/global_things.js';

// 친구 정보 수정 (비회원 정보수정)
var templateName = 'timeCapsuleEditNoneuserPopup';

Template[templateName].onCreated(function(){
  // console.log(this.data.nonUsersInfo);
  var instance = this;
  instance.noneUsersInfo = instance.data.nonUsersInfo;
  instance._id = instance.data._id;
  // instance.currentInfo = [];
});

Template[templateName].helpers({
  hpNoneUserInfo: function(){
    return Template.instance().noneUsersInfo;
  }
});

Template[templateName].onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  //정보수정내용 저장
  "click #save": function(e,t){
    var parentTempl = "";
    if(t.data.parentViewId){
      parentTempl = this.parentViewId.replace("Template.","");
    }

    if(t.data.parentViewId !== "Template.timeCapsuleWriting"){
      var condition = {
        _id : t._id
      };
      var dataObj = {
        $set : {
          nonUserGroupMember : global.utilGetFormDataArray(t),
          updateDate : global.utilGetDate().default
        }
      };
      setTimeout(function(){
        Meteor.call('updateTimeCapsule', condition, dataObj, function(error, result){
          if(error){
            return console.log(error);
          }
        });
      }, 100);
    }else{
      //from > Template.timeCapsuleWriting
      var nonUsers =global.utilGetFormDataArray(t);
      Template[parentTempl].__helpers.get('hpEditUsersCallBack')(nonUsers);
      Modal.hide();
    }


    Modal.hide();
},
//정보수정 취소
"click #cancel": function(e,t){
  Modal.hide();
}
});
