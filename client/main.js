Meteor.startup(function(){
  Meteor.subscribe('imsCode');
  Meteor.subscribe('emojis');
  $.getScript('lib/js/jquery.eraser.js', function(){ });
});