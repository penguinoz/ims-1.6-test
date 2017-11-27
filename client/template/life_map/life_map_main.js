// 라이프맵 메인
var templateName = 'lifeMapMain';

Template[templateName].onCreated(function(){
  Session.set('lifeMapMain templateData', null);
});

Template[templateName].onRendered(function(){

});

Template[templateName].helpers({
  hpTemplate: function(){
    return Session.get('lifeViewMain templateData');
  }
});

Template[templateName].events({
});

Template[templateName].onDestroyed(function(){
  Session.set('lifeMapMain templateData', null);
});