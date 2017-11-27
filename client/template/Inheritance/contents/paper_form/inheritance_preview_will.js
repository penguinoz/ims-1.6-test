import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 유언장 미리보기
var templateName = 'inheritancePreviewWill';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.inhPreview = new ReactiveVar();
  instance.myInfo = new ReactiveVar();
  var subscribe = instance.subscribe('inheritancePreview',global.login.userId);

  instance.autorun(function(){
    if(subscribe.ready()){
      var assetUser = CLT.Inh.find({asset:{$not:{$size:0}}}).fetch();
      var assetfriendsId = [];
      for(var i in assetUser){
        assetfriendsId.push(assetUser[i].inheritorId);
      }
      assetfriendsId.push(global.login.userId);
      var searchOption = ['profile.name','profile.mobile','profile.address','profile.birthday','username'];
      // var userinfo = global.utilGetUsersInfo(assetfriendsId, searchOption);

      Meteor.call('getUserInfo', assetfriendsId, searchOption, function(error, result){
        if(error){
          return console.log(error);
        } else {
          var mergeData = result.map(function(item,j){
            for(var i in assetUser){
              if(item.username === assetUser[i].inheritorId){
                var reObj = item;
                reObj.asset = assetUser[i].asset;
                return reObj;
              }
            }
            if(item.username === global.login.userId){
              instance.myInfo.set(item);
            }
          });
          instance.inhPreview.set(_.filter(mergeData, function(obj){return obj;}));
        }
      });
    }
  });

});

Template[templateName].onRendered(function(){
});

Template[templateName].helpers({
  hpGetMyInfo : function(){
    return Template.instance().myInfo.get();
  },
  hpGetInheritanceUsers : function(){
    return Template.instance().inhPreview.get();
  },
  hpIncrementedIndex : function(index){
    return ++index;
  },
  hpGetTodate : function(){
    return global.utilGetDate().korYMD;
  }
});

Template.modalHandler.onRendered(function(){
  $('.modal').modal('handleUpdate');
});
