import {global} from '/imports/global/global_things.js';

//자산리스트
var templateName = 'inheritanceAssets';

Template[templateName].onCreated(function(){
  var instance = this;
  instance._id = this.data._id;
  instance.inheritDataOne = new ReactiveVar();

  Meteor.call('getInheritanceById', instance._id, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      instance.inheritDataOne.set(result);
    }
  });
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].onDestroyed(function(){

});

Template[templateName].events({
  // 목록 이벤트
  'click [name="cancel"]': function(e, t){
    e.preventDefault();

    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  },
  // 수정 이벤트
  'click [name="edit"]': function(e, t) {
    e.preventDefault();

    var templateData = {};
    templateData.contentTmp = 'inheritanceAssetsWrite';
    templateData.data = {
      _id: t._id,
      data: [t.inheritDataOne.get()],
      pageType: true
    };
    Session.set('inheritanceMain templateData', templateData);
  }
});

Template[templateName].helpers({
  hpCollection: function(){
    return Template.instance().inheritDataOne.get();
  }
});