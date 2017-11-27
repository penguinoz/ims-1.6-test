import {global} from '/imports/global/global_things.js';

var templateName = 'futureWriting';

var imageListTemp = [];
var removeImageList=[];
var imageDataArray = [];
var imgOrigin = {};
var imgThumb = {};
var imgOriginRe = {};
var orientation = 1;
var imgFirstTimeUpload = true;

Template[templateName].onCreated(function(){
  this._id = new ReactiveVar();
  orientation = 1;

  imageDataArray = [];
  imgOrigin = {};
  imgThumb = {};
  imgOriginRe = {};

  imageListTemp=[];
  removeImageList=[];
  global.fn_setS3UploadInfo(global.s3.folder.future);
});

Template[templateName].events({
  "click #saveWriteMe": function(e, t){
    e.preventDefault();
    $('.mCS_img_loaded').removeClass('fr-dragging');

    var isMoveToBucketList = $('#chkselMoveToBucket').is(':checked');

    if (global.utilValidation(t)) {
      setTimeout(function(){
        var titleText = t.find('input[id="meTitle"]').value;
        var memoryDay = t.find('input[id="my-datepicker1"]').value;
        var tagArray = [];
        var contentImag = t.$('.editor-content').find('img');
        $('#tagUlList').find('li').each(function(index){
          if($(this).text()!== ""){
            var splitTage = $( this ).text().replace('#','');
            tagArray.push(splitTage);
          }
        });

        //리사이징된 이미지를 화면에서 사용하도록 수정
        var image = [];
        _.each(contentImag, function(item) {
          var src = item.src;
          if(src.indexOf('_originRe') < 0){
            item.src = src.substring(0, src.lastIndexOf('.'))+ '_originRe' + src.substring(src.lastIndexOf('.'));
          }

          var imageInfo = {};
          var lat = null;
          var lng = null;
          if(imageDataArray) {
            var imageData = _.findWhere(imageDataArray, {filePath : item.src});
            if(imageData){
              lat = imageData.lat ? imageData.lat : null;
              lng = imageData.lng ? imageData.lng : null;
            }
          }

          imageInfo.path = item.src;
          imageInfo.lat = lat;
          imageInfo.lng = lng;

          image.push(imageInfo);
        });


        var saveWriteMeData = {
          type : global.pageType.future,
          userId : 'admin',								//임시 아이디
          open : 0,
          title : titleText,					//제목
          content : t.$('div.froala-reactive-meteorized').froalaEditor('html.get', true, {imagePasteProcess: true}),
          startDate : global.utilGetDate(memoryDay).defaultYMD,
          images : image,											// 업로드 이미지
          tagList : tagArray,
          updateDate: global.utilGetDate().default,
          lock : (t.find('select[id=lockOp]').value === 'true')			// 공개여부
        };

        Meteor.call('futureStoryUpsert', t._id.get(), saveWriteMeData, function(error, result) {
          if (error) {
            return console.log(error);
          } else {
            if (!t._id.get()) {
              var postId = result.insertedId;
              var type = global.pageType.future;
              global.utilTimelineRegister(postId, 'admin', type, memoryDay);
              global.utilAlert('저장되었습니다.(임시화면!!)', 'success');
            }
          }
        });

        if(global.fn_isExist(removeImageList)){
          // global.fn_DeleteS3Images(removeImageList);
          global.fn_DeleteS3ImagesByType(removeImageList, global.s3.folder.future);
        }
        imageListTemp = [];
      }, 500);
    }
  },
  "click .btn-tagDelete": function(e, t){
    $(e.target.parentElement).remove();
  },
  "keyup #inputTag": function(e, t){
    var tag = t.find('input[id="inputTag"]').value;
    if(e.keyCode === 13 && tag !== ""){
      $("#inputTag").before("<li><a ><strong>#</strong>"+tag+"</a><a class=\"btn-tagDelete\"></a></li>");
      t.find('input[id="inputTag"]').value = "";
    }
    //inputbox width리사이징을 위한 function global
    global.fn_inputResizing(e.target);
  },

});

Template[templateName].helpers({
  hpGetContext: function(){
    var self = this;
    return {
      key: global.editorSettings.key,
      heightMin : global.editorSettings.heightMin,
      toolbarButtons: global.editorSettings.toolbarButtons,
      toolbarButtonsMD: global.editorSettings.toolbarButtons,
      toolbarButtonsSM: global.editorSettings.toolbarButtons,
      toolbarButtonsXS: global.editorSettings.toolbarButtons,
      imageUploadToS3: global.editorSettings.imageUploadToS3,
      imageEditButtons: global.editorSettings.imageEditButtons,
      imageDefaultAlign: 'left',
      imagePaste: false,
      pluginsEnabled: ['image','codeView','draggable','fontSize','link','url'],
      initOnClick: false,
      placeholderText: null,
      charCounterCount: false,
      dragInline: true,
      linkEditButtons: null,
      linkAlwaysBlank: true,

      "_onblur": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
      }, //end _onimage.loaded
      "_onimage.beforePasteUpload": function (e, editor, img) {
        // console.log('beforePaste');
      }, //end _onimage.loaded
      "_onmousedown": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
      }, //end _onimage.loaded
      "_onimage.uploadedToS3": function(e, editor, link, key, response){
        imageListTemp.push(global.fn_makeImageString(link, 'originRe'));

        var storeFolder = global.s3.folder.future+'/';
        var imageName = key.substring(key.indexOf(storeFolder) + storeFolder.length, key.lastIndexOf('.'));

        imgThumb.fileName = imgThumb.fileName.replace('fileName', imageName);
        imgOriginRe.fileName = imgOriginRe.fileName.replace('fileName', imageName);
        imgOriginRe.filePath = global.fn_makeImageString(link, 'originRe');

        imageDataArray.push(imgThumb);
        imageDataArray.push(imgOriginRe);

        //에디터 등록 화면에 등록될 이미지를 보여주기 위해서 originRe를 선 Upload한다
        global.fn_upLoadeS3Image(imageDataArray, global.s3.folder.future);

        imgFirstTimeUpload = true;
      },
      "_onimage.loaded": function (e, editor, img) {
        //originRe이미지로 에디터에 이미지를 교체

        setTimeout(function(){
          if(imgFirstTimeUpload){
            editor.image.get()[0].src = imgOriginRe.filePath;
            imgFirstTimeUpload = false;
          }
        },100);

      }, //end _onimage.loaded

      "_onimage.beforeUpload": function (e, editor, img) {
        var imageObj = img[0];

        var reader = new FileReader();
        reader.readAsDataURL(imageObj);
        var extension = imageObj.name.substring(imageObj.name.lastIndexOf('.')+1);

        reader.onload = function  () {
          var tempImage = new Image();
          tempImage.src = reader.result;
          tempImage.onload = function () {
            var targetImage = this;

            //원본수정(thumbnail)용 canvas생성
            //휴대전화 rotate된 사진 똑바로 보이게 수정
            EXIF.getData(imageObj, function(e,r) {
              var width = targetImage.width;
              var height = targetImage.height;

              //이미지 사이즈 조정
              if(targetImage.width >= targetImage.height){
                if(targetImage.width > 84){
                  width = 84;
                  height = targetImage.height * (84/targetImage.width);
                }
              } else {
                if(targetImage.height > 50){
                  height = 50;
                  width = targetImage.width * (50/targetImage.height);
                }
              }

              //보기용 canvas생성 (thumbnail용)
              var canvas = document.createElement('canvas');
              var canvasContext = canvas.getContext("2d");

              orientation = EXIF.getTag(this, "Orientation");
              if ([5,6,7,8].indexOf(orientation) > -1) {
                canvas.width = height;
                canvas.height = width;
              } else {
                canvas.width = width;
                canvas.height = height;
              }

              switch (orientation) {
                case 2: canvasContext.transform(-1, 0, 0, 1, width, 0); break;
                case 3: canvasContext.transform(-1, 0, 0, -1, width, height ); break;
                case 4: canvasContext.transform(1, 0, 0, -1, 0, height ); break;
                case 5: canvasContext.transform(0, 1, 1, 0, 0, 0); break;
                case 6: canvasContext.transform(0, 1, -1, 0, height , 0); break;
                case 7: canvasContext.transform(0, -1, -1, 0, height , width); break;
                case 8: canvasContext.transform(0, -1, 1, 0, 0, width); break;
                default: canvasContext.transform(1, 0, 0, 1, 0, 0);
              }

              // canvas.width = 47;
              // canvas.height = 47;
              canvasContext.drawImage(targetImage, 0, 0, width, height);
              var dataURI = canvas.toDataURL("image/jpeg");

              //썸네일
              imgThumb = {
                fileName : 'fileName',
                type : 'thumb',
                extension : extension,
                data : dataURI
              };

              //원본수정(originRe)용 canvas생성
              width = targetImage.width;
              height = targetImage.height;

              if(targetImage.width >= targetImage.height){
                if(targetImage.width > 1024){
                  width = 1024;
                  height = targetImage.height * (1024/targetImage.width);
                }
              } else {
                if(targetImage.height > 800){
                  height = 800;
                  width = targetImage.width * (800/targetImage.height);
                }
              }

              var canvasOriginRe = document.createElement('canvas');
              var canvasContextOriginRe = canvasOriginRe.getContext("2d");

              if ([5,6,7,8].indexOf(orientation) > -1) {
                canvasOriginRe.width = height;
                canvasOriginRe.height = width;
              } else {
                canvasOriginRe.width = width;
                canvasOriginRe.height = height;
              }

              switch (orientation) {
                case 2: canvasContextOriginRe.transform(-1, 0, 0, 1, width, 0); break;
                case 3: canvasContextOriginRe.transform(-1, 0, 0, -1, width, height ); break;
                case 4: canvasContextOriginRe.transform(1, 0, 0, -1, 0, height ); break;
                case 5: canvasContextOriginRe.transform(0, 1, 1, 0, 0, 0); break;
                case 6: canvasContextOriginRe.transform(0, 1, -1, 0, height , 0); break;
                case 7: canvasContextOriginRe.transform(0, -1, -1, 0, height , width); break;
                case 8: canvasContextOriginRe.transform(0, -1, 1, 0, 0, width); break;
                default: canvasContextOriginRe.transform(1, 0, 0, 1, 0, 0);
              }

              // canvasOriginRe.width = width;
              // canvasOriginRe.height = height;
              canvasContextOriginRe.drawImage(targetImage, 0, 0, width, height);
              var dataURIOriginRe = canvasOriginRe.toDataURL("image/jpeg");

              //위치정보 저장
              var latitued = EXIF.getTag(this, "GPSLatitude");
              var longitude = EXIF.getTag(this, "GPSLongitude");

              //원본파일 줄인것
              imgOriginRe = {
                fileName : 'fileName',
                type : 'originRe',
                extension : extension,
                data : dataURIOriginRe,
                lat : latitued ? global.toDecimal(latitued) : null,
                lng : longitude ? global.toDecimal(longitude) : null
              };
            });
          };
        };
      },
      "_onimage.beforeRemove": function (e, editor, img) { //이미지 삭제전
        removeImageList.push(global.fn_makeImageString($(img[0]).attr("src"), 'originRe'));
      } // end _onimage.beforeRemove
    };
  }
});
