import {global} from '/imports/global/global_things.js';

// 텍스트 에디터
var templateName = 'textEditor';

Template[templateName].onCreated(function(){
  Session.set('awsBase', '');
  var aws = global.utilFroalaUpload('scshin');
  Session.set('awsBase', aws);
});

Template[templateName].helpers({
  hpToolbarButtons: function(){
    var toolbarButtons = [
      //'fullscreen',
      // 'subscript',
      // 'superscript',
      'bold',
      'italic',
      'underline',
      'strikeThrough',
      'fontFamily',
      'fontSize',
      'imozi',
      '-',
      // 'paragraphFormat',
      'align',
      'formatOL',
      'formatUL',
      'outdent',
      'indent',
      //'quote',
      //'insertHR',
      '-',
      //'insertLink',
      'insertImage',
      'insertVideo',
      'insertFile',
      'insertTable',
      'undo',
      'redo',
      //'clearFormatting',
      'selectAll',
      'html'
    ];
    return toolbarButtons;
  },
  imageUploadToS3: function() {
    return {
      bucket: 'iml-images',
      region: 's3-ap-northeast-2', //'s3-website-us-east-1', //us-east-1
      keyStart: 'scshin/',
      callback: function (url, key) {
        console.log(url);
        console.log(key);
      },
      params: {
        'acl': 'public-read',
        'policy': Session.get('awsBase').s3Policy,
        'x-amz-signature': Session.get('awsBase').s3Signature,
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': Session.get('awsBase').s3Credentials,
        'x-amz-date': Session.get('awsBase').s3Date
      }
    };
  },
  hpContext: function() {
    return {
      _value: '<p><img class="fr-dib fr-draggable" src="https://s3.ap-northeast-2.amazonaws.com/iml-images/scshin/1482976043559-15775021_1074856779292421_2673008832786470839_o+(1).jpg" style="width: 438px; height: 262.572px;"></p>'};
      //_value: '내가 그랬냐능'};
      //return '나한태 왜그랬어요<p><img class="fr-dib fr-draggable" src="https://s3-ap-northeast-2.amazonaws.com/iml-images/scshin%2F1482891058506-04.jpg" style="width: 438px; height: 262.572px;"></p>';
    },
    doSave: function() {
      var self = this; // 'self' has the data context inside the #each block ie. one document in the aCollection collection
      return function (e, editor) {
        // console.log('adfasdfasdf');
        // Get edited HTML from Froala-Editor
        Session.set('textEditor save', editor.html.get(true));
        var newHTML = editor.html.get(true /* keep_markers */);
        // console.log(newHTML);
        // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
        // if (!_.isEqual(newHTML, self.myDoc.myHTMLField)) {
        // action (upsert)
        console.log(newHTML);
        // }
        return false; // Stop Froala Editor from POSTing to the Save URL
      };
    },
    beforeUpload: function () {
      var self = this;
      return function (e, editor, images) {
        // Do something
        // console.log(editor.html);
        // console.log(images[0]);

        var imageObj = images[0];

        var reader = new FileReader();
        reader.readAsDataURL(images[0]);

        reader.onload = function  () {
          //로컬 이미지를 보여주기
          document.querySelector('#preview').src = reader.result;

          //썸네일 이미지 생성
          var tempImage = new Image(); //drawImage 메서드에 넣기 위해 이미지 객체화
          tempImage.src = reader.result; //data-uri를 이미지 객체에 주입
          tempImage.onload = function() {
            //리사이즈를 위해 캔버스 객체 생성
            var canvas = document.createElement('canvas');
            console.log(canvas);
            var canvasContext = canvas.getContext("2d");

            //캔버스 크기 설정
            canvas.width = 100; //가로 100px
            canvas.height = 100; //세로 100px

            //이미지를 캔버스에 그리기
            canvasContext.drawImage(this, 0, 0, 100, 100);
            //캔버스에 그린 이미지를 다시 data-uri 형태로 변환
            var dataURI = canvas.toDataURL("image/jpeg");

            //썸네일 이미지 보여주기
            document.querySelector('#thumbnail').src = dataURI;

            //썸네일 이미지를 다운로드할 수 있도록 링크 설정
            document.querySelector('#download').href = dataURI;
            console.log (dataURI);

            //함수호출 (S3에서 image삭제하는 함수)
            // var bucketName = S3.config.bucket;
            // AWS.config.region = S3.config.region;
            // AWS.config.update({
            //   accessKeyId: S3.config.key,
            //   secretAccessKey: S3.config.secret
            // });

            var extension = imageObj.type.split("/")[1];
            var originfileName = imageObj.name.substring(0, imageObj.name.lastIndexOf('.'));

            var bucketName = S3.config.bucket;
            var newFileName = Meteor.uuid() +'_' +originfileName + '.' + extension;
            console.log(newFileName);
            var path = 'scshin/' + newFileName;

            // console.log('path :',path);

            var s3Bucket = new AWS.S3();

            buf = new Buffer(dataURI.replace(/^data:image\/\w+;base64,/, ""),'base64')
            // console.log('buf' ,buf);
            var data = {
              Bucket: S3.config.bucket,
              Key: path,
              Body: buf,
              ContentEncoding: 'base64',
              ContentType: 'image/jpeg'
            };

            s3Bucket.putObject(data, function(err, data){
              if (err) {
                console.log(err);
                console.log('Error uploading data: ', data);
              } else {

                console.log('succesfully uploaded the image!',data);
              }
            });

          };

        };

        console.log('beforeUpload');
      };
    },
    // loaded: function () {
    //   var self = this;
    //   return function (e, editor, img) {
    //     console.log('loaded');
    //     console.log($(img)[0].src);
    //   };
    // },
    beforeRemove: function () {
      var self = this;
      return function (e, editor, img) {
        console.log('beforeRemove : ', $(img[0]).attr("src"));

        console.log('beforeRemove : ', img[0]);
        console.log('beforeRemove : ', editor);
        console.log('beforeRemove : ', e);

        // S3.config = {
        // 	key: 'AKIAJ5GKXJ5BN4RZ73EA',
        // 	secret: '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',
        // 	bucket: 'iml-images',
        // 	region: 'ap-northeast-2' // Only needed if not "us-east-1" or "us-standard"
        // };

        S3.config = {
        	key: 'AKIAJ5GKXJ5BN4RZ73EA',
        	secret: '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',
        	bucket: 'iml-images',
        	region: 'ap-northeast-2', // Only needed if not "us-east-1" or "us-standard"
        };

        //함수호출 (S3에서 image삭제하는 함수)
        var bucketName = S3.config.bucket;
        AWS.config.region = S3.config.region;
        AWS.config.update({
          accessKeyId: S3.config.key,
          secretAccessKey: S3.config.secret
        });

        // var urlPreText = 'https://s3-ap-northeast-2.amazonaws.com/iml-images/';
        var enUrl = $(img[0]).attr("src").replace('+', ' '); // '+' to ' '(space)
        var decodeUrl = decodeURIComponent(enUrl);  //url decode  예) console.log('decode', decodeURIComponent($(img[0]).attr("src")));
        var path = decodeUrl.replace(global.s3.bucketPath,''); //decodeUrl; //bucketName/ 이후부터 잘라서 넣는부분

        console.log('path :',path);
        var params = {
          Bucket: bucketName,
          //Key: 'scshin%2F1483329530116-15775021_1074856779292421_2673008832786470839_o+%281%29.jpg' //삭제할 파일 경로 및 파일명 folder/folder/file.ext
          Key: path
        };



        var fbUserId;
        var bucket = new AWS.S3();
        bucket.deleteObject(params, function (err, data) {
          if (err) {
            console.log("Check if you have sufficient permissions : "+err);
          } else {
            console.log("File deleted successfully");
          }
        });
      };
    },
    files: function(){
      return S3.collection.find();
    },
    hp5: function(){
      var a= [1,2,3,4,5];
      return a;
    },
    hpTrue:function(){
      return true;
    }

  });

  Template[templateName].events({
    'click #btnSave': function(e, t){
      console.log(Session.get('textEditor save'));
      Session.set('textEditor save','');
      // console.log('asdasd');

      //console.log(t.$('div.froala-reactive-meteorized-override').editor);
      //t.$('div.froala-reactive-meteorized-override').froalaEditor('save.save');
      //var aa = t.$('div.froala-reactive-meteorized-override').editable('getHTML', false, true);
      //var aa = t.$('div.froala-reactive-meteorized-override').editor.html.get;
      //console.log(aa);
    },
    "click button.upload": function(){
      var files = $("input.file_bag")[0].files;

      console.log('files',files);
      S3.upload({
        files:files,
        upload_name: 'aaaaaaaaaaa.jpeg',
        unique_name:true,
        acl:"private",
        path:"scshin",
        encoding:"base64",
      },function(e,r){
        console.log(r);
      });
    },
    "click button.upload2": function(){
      var files = $("input.fileItem")[0].files;
      console.log('files',files);
      test1(files);

    },
    "click button.delete": function(){
      console.log(this.relative_url);
      console.log('delete');
      S3.delete(this.relative_url, function(e,r){
        console.log('error', e);
        console.log('S3.delete complete', r);
      });
    },
    "click #templatePopupbuketDetail": function(e, t){
      e.preventDefault();
      var modalobj = {};

      modalobj.template = t.$(e.target).data('modal-template');
      modalobj.size = 'modal-lg';
      modalobj.fade = false;
      modalobj.backdrop = 'static';
      modalobj.data = {
        _id : 'nKSpmN3xSgqBrMzud',
        templateType : 'buketDetail'
      };
      global.utilModalOpen(e, modalobj);
    },
    "click #templatePopupimDetail": function(e, t){
      e.preventDefault();
      var modalobj = {};

      modalobj.template = t.$(e.target).data('modal-template');
      modalobj.size = 'modal-lg';
      modalobj.fade = false;
      modalobj.backdrop = 'static';
      modalobj.data = {
        _id : 'nKSpmN3xSgqBrMzud',
        templateType : 'imDetail'
      };
      global.utilModalOpen(e, modalobj);
    },
    "click #templatePopuptimeCapsuleDtail": function(e, t){
      e.preventDefault();
      var modalobj = {};

      modalobj.template = t.$(e.target).data('modal-template');
      modalobj.size = 'modal-lg';
      modalobj.fade = false;
      modalobj.backdrop = 'static';
      modalobj.data = {
        _id : 'nKSpmN3xSgqBrMzud',
        templateType : 'timeCapsuleDtail'
      };
      global.utilModalOpen(e, modalobj);
    },
    "change #exelLoad": function(e, t){
      var reader = new FileReader();
      ExcelToJSON();
      var file = $("#exelLoad").val();
      reader.readAsDataURL(file);
    }
  });


function ExcelToJSON() {
  this.parseExcel = function(file){

      reader.onload = function(e){
          var data = e.target.result();
          var workbook = XLSX.read(data, {type : 'binary'});

          workbook.SheetNames.forEach(function(sheetName){
              // Here is your object
              var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
              var json_object = JSON.stringify(XL_row_object);
              console.log(json_object);

          })

      };

      reader.onerror = function(ex){
          console.log(ex);
      };


  };};

function test1(files){
  var img1 = document.getElementById("fileTs");
  // EXIF.getData(files[0], function() {
  //       alert(EXIF.pretty(this));
  //   });
  EXIF.getData(files[0], function() {
  var make = EXIF.getTag(this, "Make"),
      model = EXIF.getTag(this, "Model");
  alert("I was taken by a " + make + " " + model);
  var latVal = EXIF.getTag(this, 'GPSLongitude');
  var logVal = EXIF.getTag(this, 'GPSLatitude');

  var toDecimal = function (number) {
       return number[0].numerator + number[1].numerator /
           (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
   };
  alert('lat : '+toDecimal(latVal)+' log : '+toDecimal(logVal) );
});
}
