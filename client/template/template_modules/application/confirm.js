var templateName = 'confirm';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){
  // $('#alert').draggable({
  //   handle: ".modal-header"
  // });
});

Template[templateName].onDestroyed(function(){

});

Template[templateName].events({
  'click [name="confirm"]': function(e, t){
    e.preventDefault();

    console.log('this', t);
    // global.utilConfirm('', true);
    // Template[templateName].__helpers.get('confirm')('', true);
    return 'aaaaaa';
  }
});

Template[templateName].helpers({

});