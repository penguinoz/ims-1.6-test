import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 나는 > 글쓰기(추억작성)
var templateName = 'imWriting';
var imageListTemp = [];
var removeImageList=[];
var _id = null; // imContent의 글ID
var targetId = null;
var userId = null;
var imageDataArray = [];
var imgOrigin = {};
var imgThumb = {};
var imgOriginRe = {};
var orientation = 1;
var imgFirstTimeUpload = true;
var saveWaitImgUp = true;

Template[templateName].onCreated(function(){
  var instance = this;
  orientation = 1;

  imageDataArray = [];
  imgOrigin = {};
  imgThumb = {};
  imgOriginRe = {};

  userId = global.login.userId;
  imageListTemp=[];
  removeImageList=[];
  _id = null;
  targetId = null;
  global.fn_setS3UploadInfo(global.s3.folder.im);

  Session.set('imWriting defaultData', null);
  Session.set('imWriting useBucketSelectTemplate', false);

  var defaultData = {
    regDate : global.utilGetDate().korYMD
  };
  if (this.data) {
    defaultData.title = this.data.title;
  }

  var subscriptionBuketList = instance.subscribe('bucketGetListWithTitleAndId', userId);

  instance.autorun(function(){
    if(subscriptionBuketList.ready()){
      if(CLT.EnBucketList.find().count() > 0){
        Session.set('imWriting useBucketSelectTemplate', true);
      }
    }
  });

  Session.set('imWriting defaultData', defaultData);
});

Template[templateName].helpers({
  hpGetContext: function () {
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
      pluginsEnabled: ['image','codeView','draggable','fontSize', 'url'],
      initOnClick: false,
      placeholderText: null,
      charCounterCount: false,
      dragInline: true,
      // linkAlwaysBlank: true,
      // linkEditButtons: null,

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

        var storeFolder = global.s3.folder.im+'/';
        var imageName = key.substring(key.indexOf(storeFolder) + storeFolder.length, key.lastIndexOf('.'));

        imgThumb.fileName = imgThumb.fileName.replace('fileName', imageName);
        imgOriginRe.fileName = imgOriginRe.fileName.replace('fileName', imageName);
        // imgOriginRe.filePath = global.s3.bucketPath + global.s3.folder.im +'/' + imgOriginRe.fileName +'_originRe.'+ imgOriginRe.extension;
        imgOriginRe.filePath = global.fn_makeImageString(link, 'originRe');

        imageDataArray.push(imgThumb);
        imageDataArray.push(imgOriginRe);

        //에디터 등록 화면에 등록될 이미지를 보여주기 위해서 originRe를 선 Upload한다
        global.fn_upLoadeS3Image(imageDataArray, global.s3.folder.im);

        imgFirstTimeUpload = true;
        saveWaitImgUp = true;
      },
      "_onimage.loaded": function (e, editor, img) {
        //originRe이미지로 에디터에 이미지를 교체

        setTimeout(function(){
          if(imgFirstTimeUpload){
            // editor.image.get()[0].src = global.s3.bucketPath + global.s3.folder.im +'/' + imgOriginRe.fileName +'_originRe.'+ imgOriginRe.extension;
            editor.image.get()[0].src = imgOriginRe.filePath;
            imgFirstTimeUpload = false;
          }
        },100);

      }, //end _onimage.loaded

      "_onimage.beforeUpload": function (e, editor, img) {
        var imageObj = img[0];
        saveWaitImgUp = false;
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
  },
  // 타임라인에서 질문등록햇을때 기본으로 입력시켜주는 데이터
  hpDefaultData: function() {
    return Session.get('imWriting defaultData');
  },
  hpIsCalled: function() {
    return Session.get('imWriting useBucketSelectTemplate');
  }
});

Template[templateName].events({
  "click #saveWriteMe": function(e, t){
    e.preventDefault();

    if(!saveWaitImgUp){
      global.utilAlert("이미지 업로드가 지연되고 있습니다 잠시후에 다시시도해 주세요");
      return;
    }

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

        if(titleText!== "" && memoryDay !== ""){

          // //회전된 이미지를 정상적으로 보여주기 위해 transform 스타일 제거
          // t.$('div.froala-reactive-meteorized').find('img').css('transform','');
          // t.$('div.froala-reactive-meteorized').find('img').css('margin-top','');
          // t.$('div.froala-reactive-meteorized').find('img').css('margin-bottom','');
          // t.$('div.froala-reactive-meteorized').find('img').css('margin-left','');
          // t.$('div.froala-reactive-meteorized').find('img').css('margin-right','');

          var saveWriteMeData = {
            type : global.pageType.im,
            userId : userId,								//임시 아이디
            open : 0,
            title : titleText,					//제목
            content : t.$('div.froala-reactive-meteorized').froalaEditor('html.get', true, {imagePasteProcess: true}),
            startDate : global.utilGetDate(memoryDay).defaultYMD,
            images : image,											// 업로드 이미지
            tagList : tagArray,
            updateDate: global.utilGetDate().default,
            lock : (t.find('select[id=lockOp]').value === 'true')			// 공개여부
          };



          Meteor.call('storyUpsert', _id, saveWriteMeData, function(error, result) {
            if (error) {
              return console.log(error);
            } else {
              var postId = result.insertedId;
              var type = global.pageType.im;
              global.utilTimelineRegister(postId, userId, type, memoryDay);

              //버킷리스트로 이동 작업
              if(isMoveToBucketList){
                Meteor.call('moveStory', userId, postId, targetId, global.pageType.bucketStory, function(error){
                  if(error) {
                    // console.log('moveStory_error', error);
                  } else {
                    var historyObj = {
                      postId: targetId,
                    };
                    // 버킷리스트이동시 히스토리 이동
                    Meteor.call('enHistoryMoveBucket', postId, historyObj, function(error) {
                      if (error) {
                        return console.log(error);
                      } else {
                        var templateData = {};
                        templateData.headerTmp = 'endingNoteListHeaderBucketList';
                        templateData.contentTmp = 'bucketDetail';
                        templateData.data = {
                          _id : targetId
                        };

                        Session.set('endingNoteList templateData', templateData);
                      }
                    });
                  }
                });
              } else {
                //화면이동
                var templateData = {};
                templateData.headerTmp = 'endingNoteListHeaderIm';
                templateData.contentTmp = 'imDetail';
                templateData.data = {
                  _id : result.insertedId
                };

                Session.set('endingNoteList templateData', templateData);
              }
            }
          });
        }

        if(global.fn_isExist(removeImageList)){
          // global.fn_DeleteS3Images(removeImageList);
          global.fn_DeleteS3ImagesByType(removeImageList, global.s3.folder.im);
        }
        imageListTemp = [];
      }, 500);
    }
    //헤더메뉴 초기화
    Session.set('endingNoteListHeaderIm selectedMenu', null);
  },
  "click #cancelWriteMe": function(e, t){
    global.utilConfirm("취소 하시겠습니까?").then(function(val) {
      if (val) {
        //sessioin set 이용 화면이동
        e.preventDefault();

        var templateData = {};
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imContent';
        Session.set('endingNoteList templateData', templateData);
        Session.set('endingNoteListHeaderIm selectedMenu', null); //헤더메뉴 초기화
      }
    }).catch(swal.noop);
  },
  "click .btn-tagDelete": function(e, t){
    $(e.target.parentElement).remove();
  },
  "keydown #inputTag": function(e, t){
    if(e.target.value.length >= 15 && e.which !== 8){
      console.log(e.target.value.length);
      return;
    }
  },

  "keyup #inputTag": function(e, t){
    var tag = t.find('input[id="inputTag"]').value;
    if(e.keyCode === 13 && tag !== ""){
      $("#inputTag").before("<li><a ><strong>#</strong>"+tag+"</a><a class=\"btn-tagDelete\"></a></li>");
      t.find('input[id="inputTag"]').value = "";
    }
    //inputbox width리사이징을 위한 function global
    global.fn_inputResizing(e.target);
  }
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');

  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].onDestroyed(function(){
  if(global.fn_isExist(imageListTemp)) {
    // global.fn_DeleteS3Images(imageListTemp);
    global.fn_DeleteS3ImagesByType(imageListTemp, global.s3.folder.im);
  }
});


Template.selectTemplateWirte.onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);

  //버킷리스트로 이동 체크박스 초기 비활성
  $("#selMoveToBucket").attr("disabled",true);

  //버킷리스트로 이동 체크박스 선택 이벤트
  $("#chkselMoveToBucket").click( function(){
    if( $(this).is(':checked') ) {
      $("#selMoveToBucket").attr("disabled",false);
      $("#selMoveToBucket").attr("required",true);
    } else {
      $("#selMoveToBucket").attr("disabled",true);
      $("#selMoveToBucket").attr("required",false);
    }
  });

  $("#selMoveToBucket").on("change",  function(e, t) {
    e.preventDefault();

    targetId = $('#selMoveToBucket option:selected').val();
    // console.log(targetId);
  });
});

Template.selectTemplateWirte.helpers({
  hpBucketlist: function() {
    return CLT.EnBucketList.find().fetch();
  }
});


//
// function upLoadeS3Image (imgInfo){
//   var imgsInfo = [];
//   if(_.isArray(imgInfo)){
//     imgsInfo = imgInfo;
//   } else {
//     imgsInfo.push(imgInfo);
//   }
//
//
//   // /원본파일 줄인것
//   // imgOriginRe = {
//   //   fileName : 'fileName_thumb',
//   //   type : 'originRe',
//   //   extension : extension,
//   //   data : dataURIOriginRe
//   // };
//
//   _.each(imgsInfo, function(item){
//     // var extension = item.extension;
//     // var newFileName = item.fileName +item.type + '.' + extension;
//     var realPath = item.data.substring(item.data.indexOf("data"));//imagePath.substring(imagePath.indexOf("data"));
//
//     var path = global.s3.folder.im +'/' + item.fileName + '_'+ item.type +'.' + item.extension;
//     var s3Bucket = new AWS.S3();
//
//     var buf = new Buffer(realPath.replace(/^data:image\/\w+;base64,/, ""),'base64');
//     var data = {
//       Bucket: S3.config.bucket,
//       Key: path,
//       Body: buf,
//       ContentEncoding: 'base64',
//       ContentType: 'image/jpeg'
//     };
//     //위에서 설정한 파일명과, 서버정보를 이용하여, DB에 데이터를 저장한다.
//     s3Bucket.putObject(data, function(err, data){
//       if (err) {
//         console.log(err);
//         console.log('Error uploading data: ', data);
//       } else {
//         console.log('succesfully uploaded the image!',data);
//       }
//     });
//   });
//
//   // return path;
// }
