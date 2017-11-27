var templateName = 'file_upload';

Template[templateName].onCreated(function(){
  // var AWS = require('aws-sdk'),

  var instance =this;
  instance.fileInfo = {};
});

Template[templateName].events({
  "click #save": function(e,t){
    e.preventDefault();

    var filePath = t.fileInfo.path;
    // var fs = require('fs');
    // // var fs = Meteor.require('fs');
    // var reader = new FileReader();
    // reader.onload = function  () {
    //   console.log(reader.readAsDataURL(t.fileInfo.file));
    //
    //   var dataUrl = reader.readAsDataURL(t.fileInfo.file);
    //   // var fileStream = fs.createReadStream(filePath);
    //   var buf = new Buffer(dataUrl.replace(/^data:image\/\w+;base64,/, ""),'base64');
    //
    //   var path = 'scshin/' + t.fileInfo.newFileName;
    //
    //   var putParams = {
    //     Bucket: S3.config.bucket,
    //     Key: t.fileInfo.path,
    //     Body: buf,
    //     ContentEncoding: 'base64'
    //     // ContentType: 'image/jpeg'
    //   };
    //
    //   var s3Bucket = new AWS.S3();
    //
    //   s3Bucket.putObject(putParams, function(putErr, putData){
    //       if(putErr){
    //           console.error(putErr);
    //       } else {
    //           console.log(putData);
    //       }
    //   });
    //
    // };




  },
  "change #inputFile": function(e, t){
    e.preventDefault();
    // console.log($('#inputText').val(), $('#inputFile').val());
    var newFileName = '';
    $("input[name='inputFile']").each(function(){
      if($(this).val()){
        if(10485760 > $(this)[0].files[0].size){
          $('#inputText').val(e.currentTarget.value);

          var nameString = $(this).val();
          newFileName =  Meteor.uuid() + "_scshin." + nameString.substring(nameString.lastIndexOf('.')+1);
          var path = "scshin/" + newFileName;
          t.fileInfo = {
            file : $(this)[0].files[0],
            name : $(this)[0].files[0].name,
            newFileName : newFileName,
            size : $(this)[0].files[0].size,
            path : path
          };
        } else {
          alert('최대 10,240KB의 파일을 업로드 할 수 있습니다.');
        }
      }
    });

    var imageObj = e.target.files[0];

    // var fs = Meteor.require('fs');
    var reader = new FileReader();
    reader.readAsDataURL(imageObj);
    reader.onload = function  () {
      // console.log(reader.result.replace(/^data:image\/\w+;base64,/, ""));
      console.log(reader.result, reader.result.substr(reader.result.indexOf('base64')+7));
      // var buf = new Buffer(reader.result.replace(/^data:image\/\w+;base64,/, ""),'base64');
      var buf = new Buffer(reader.result.substr(reader.result.indexOf('base64')+7),'base64');
      // var dataUrl = reader.readAsDataURL(t.fileInfo.file);
      // // var fileStream = fs.createReadStream(filePath);
      // var buf = new Buffer(dataUrl.replace(/^data:image\/\w+;base64,/, ""),'base64');
      //
      var path = 'scshin/' + newFileName;

      var putParams = {
        Bucket: S3.config.bucket,
        Key: path,
        Body: buf,
        ContentEncoding: 'base64',
        // ContentType: 'image/jpeg'
      };

      var s3Bucket = new AWS.S3();

      s3Bucket.putObject(putParams, function(putErr, putData){
        if(putErr){
          console.error(putErr);
        } else {
          console.log(putData);
        }
      });

    };

  },"click #file": function(e,t){
    var convertFunction = convertFileToDataURLviaFileReader;
    convertFunction(e.currentTarget.href, function(base64Img) {
      console.log(base64Img);
    });
  }

});

function convertFileToDataURLviaFileReader(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}