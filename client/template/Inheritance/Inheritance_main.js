//상속화면 가운데 메인 화면
var templateName = 'inheritanceMain';
Template[templateName].onCreated(function(){
  Session.set('inheritanceMain templateData', null);

  var templateData = {};
  templateData.contentTmp = 'inheritanceInheritor';
  Session.set('inheritanceMain templateData', templateData);
});

Template[templateName].helpers({
  hpTemplate: function(){
    return Session.get('inheritanceMain templateData');
  }
});