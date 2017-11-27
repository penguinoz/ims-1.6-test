var templateName = 'imsMain';

Template[templateName].onCreated(function(){
  if (Session.get('main template') === undefined || Session.get('main template') === null) {
    Session.set('main template', 'imLogin');
  }
});

Template[templateName].onDestroyed(function(){
  Session.set('main template', null);
  Session.set('main registerJoinData', null);
});

Template[templateName].helpers({
  templateName: function(){
    return Session.get('main template');
  }
});

