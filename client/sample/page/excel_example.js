templateName ='excel_example';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){
});

Template[templateName].events({
  'change .uploadFile': function (event,template) {

    FS.Utility.eachFile(event, function(file){
      var reader = new FileReader();
      reader.onload = function(fileLoadEvent) {
           Meteor.call('importFile', event.target.value, reader.result, function(error, result){
              console.log('hello');
              alert(result);
           });
      };
      reader.readAsBinaryString(file);
    });

  }
});

Template[templateName].helpers({
  helper: function(){

  }
});