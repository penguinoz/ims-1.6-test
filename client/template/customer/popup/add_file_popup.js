var templateName = 'addFilePopup';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.fileInfo = null;
});

Template[templateName].helpers({
});

Template[templateName].events({
  "click #confirm": function(e, t){
    e.preventDefault();
    // var fileInfo = null;

    // $("input[name='inputFile']").each(function(){
    //   if($(this).val()){
    //     var nameString = $(this).val();
    //     var newFileName =  Meteor.uuid();
    //     var pathId = "customer_desk/"+newFileName+ "." + nameString.substring(nameString.lastIndexOf('.')+1);
    //     fileInfo = {
    //       file : $(this)[0].files[0],
    //       name : $(this)[0].files[0].name,
    //       size : $(this)[0].files[0].size,
    //       path : pathId
    //     };
    //   }
    // });

    Template.customerWrite.__helpers.get('hpFileListSet')(t.fileInfo);
    Modal.hide();
  },
  "click #cancel":function(e,t){
    e.preventDefault();

    Modal.hide();
  },
  "change #inputFile": function(e, t){
    e.preventDefault();
    // console.log($('#inputText').val(), $('#inputFile').val());

    $("input[name='inputFile']").each(function(){
      if($(this).val()){

        //file확장자 확인
        if(this.accept && this.accept == "image/*"){
          var filePath = $(this).val();
          var lastIndex = filePath.lastIndexOf('.');
          var ext = filePath.substring(lastIndex+1, filePath.len).toLowerCase();
          if($.inArray(ext, ['gif','png','jpg','jpeg']) == -1) {
            alert('gif,png,jpg,jpeg 파일만 업로드 할수 있습니다.');
            return;
          }
        }

        if(10485760 > $(this)[0].files[0].size){
          $('#inputText').val(e.currentTarget.value);

          var nameString = $(this).val();
          var newFileName =  Meteor.uuid();
          var pathId = "customer_desk/"+newFileName+ "." + nameString.substring(nameString.lastIndexOf('.')+1);
          t.fileInfo = {
            file : $(this)[0].files[0],
            name : $(this)[0].files[0].name,
            size : $(this)[0].files[0].size,
            path : pathId
          };
        } else {
          alert('최대 10,240KB의 파일을 업로드 할 수 있습니다.');
        }
      }
    });

  }
});
