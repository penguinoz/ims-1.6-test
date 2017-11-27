// 상속받은 내역 상세보기
var templateName = 'inheritanceListAsset';

Template[templateName].onCreated(function(){
  var instance = this;
  this._id = new ReactiveVar(this.data._id);
  this.inheritData = new ReactiveVar(this.data.data);
  this.inheritDataOne = new ReactiveVar();
  Meteor.call('getInheritanceById', this.data._id, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      instance.inheritDataOne.set(result);
    }
  });
});

Template[templateName].onRendered(function(){

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
      _id: t._id.get(),
      data: t.inheritData.get()
    };
    Session.set('inheritanceMain templateData', templateData);
  }
});

Template[templateName].helpers({
  hpCollection: function(){
    return Template.instance().inheritDataOne.get();
  },
  hpIsImsUser: function(name){
    var result = false;
    if(name){
      //이름항목이 있으면 비유저로 판단한다.
      result = true;
    } else {
      result = false;
    }
    return result;
  },
});