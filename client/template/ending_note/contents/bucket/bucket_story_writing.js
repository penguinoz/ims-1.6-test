import {global} from '/imports/global/global_things.js';

// 나는 > 글쓰기(추억작성)
var templateName = 'bucketStoryWriting';
var imageListTemp =[];
var removeImageList=[];
var _id = null; // imContent의 글ID
var postIdParam = null;
var receiveData = {};
var userId = null;
var isPageOwner = false;
var imageDataArray = [];
var imgOrigin = {};
var imgThumb = {};
var imgOriginRe = {};
var orientation = 1;

Template[templateName].onCreated(function(){
  var self = this;
  imageListTemp =[];
  removeImageList=[];
  _id = null; // imContent의 글ID
  postIdParam = null;
  receiveData = {};

  orientation = 1;
  imageDataArray = [];
  imgOrigin = {};
  imgThumb = {};
  imgOriginRe = {};

  this.groupUsers = new ReactiveVar();

  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    userId = global.login.userId;
  } else {
    userId = global.login.pageOwner;
  }

  global.fn_setS3UploadInfo(global.s3.folder.bucketStory);

  if(this.data._id){ //수정
    receiveData = this.data;
  } else { //새 글 쓰기
    postIdParam = this.data.postId;
    var bucketListObj = {
      _id: postIdParam
    };
    Meteor.call('bucketTimelineGetList', bucketListObj, function(error, result) {
      if (error) {
        return alert(error);
      } else {
        self.postUserId = result[0].userId;
        self.groupUsers = result[0].groupUsers;
      }
    });
  }
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    whileScrolling: function() {
      return showMoreVisibleImContent(this);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

  if(receiveData._id){
    _id = receiveData._id;
    $("#meTitle").val(receiveData.title);
    $("#my-datepicker1").val(receiveData.startDate);
    postIdParam = receiveData.postId;
    this.$('div.froala-reactive-meteorized').froalaEditor('html.set',receiveData.content);
    Session.set("bucketWriting exePlanList",receiveData.exePlanList);

    receiveData.tagList.forEach(function(tag){
      $("#inputTag").before("<li><a href=\"javascript:void(0)\"><strong>#</strong>"+tag+"</a><a href=\"javascript:void(0)\" class=\"btn-tagDelete\"></a></li>");
    });
  }
});

Template[templateName].helpers({
  hpGetContext: function () {
    return {
      key: global.editorSettings.key,

      heightMin : 600,
      toolbarButtons: global.editorSettings.toolbarButtons,
      toolbarButtonsMD: global.editorSettings.toolbarButtons,
      toolbarButtonsSM: global.editorSettings.toolbarButtons,
      toolbarButtonsXS: global.editorSettings.toolbarButtons,
      imageUploadToS3: global.editorSettings.imageUploadToS3,
      imageEditButtons: global.editorSettings.imageEditButtons,
      imageDefaultAlign: 'left',
      imagePaste: false,
      pluginsEnabled: ['image','codeView','draggable','fontSize','url'],
      initOnClick: false,
      placeholderText: null,
      charCounterCount: false,
      dragInline: true,
      // linkEditButtons: null,
      // linkAlwaysBlank: true,

      "_onblur": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
      }, //end _onimage.loaded
      "_onmousedown": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
      }, //end _onimage.loaded
      "_onimage.uploadedToS3": function(e, editor, link, key, response){
        imageListTemp.push(global.fn_makeImageString(link, 'originRe'));

        var storeFolder = global.s3.folder.bucketStory+'/';
        var imageName = key.substring(key.indexOf(storeFolder) + storeFolder.length, key.lastIndexOf('.'));

        imgThumb.fileName = imgThumb.fileName.replace('fileName', imageName);
        imgOriginRe.fileName = imgOriginRe.fileName.replace('fileName', imageName);
        imgOriginRe.filePath = global.fn_makeImageString(link, 'originRe');

        imageDataArray.push(imgThumb);
        imageDataArray.push(imgOriginRe);

        //에디터 등록 화면에 등록될 이미지를 보여주기 위해서 originRe를 선 Upload한다
        global.fn_upLoadeS3Image(imageDataArray, global.s3.folder.bucketStory);

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

      "_onimage.beforeRemove": function (e, editor, img) {
        removeImageList.push(global.fn_makeImageString($(img[0]).attr("src"), 'originRe'));
      } // end _onimage.beforeRemove
    };
  },
  // // 타임라인에서 질문등록햇을때 기본으로 입력시켜주는 데이터
  // hpDefaultData: function() {
  //   return Session.get('imWriting defaultData');
  // }
});

Template[templateName].events({

  "click #saveWriteMe": function(e, t){
    e.preventDefault();
    var isMoveToIm = $('#chkMoveToIm').is(':checked');
    $('.mCS_img_loaded').removeClass('fr-dragging');

    if (global.utilValidation(t)) {
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
          } else {
            var preSavedImageData = _.findWhere(receiveData.images, {path : item.src});
            lat = preSavedImageData.lat;
            lng = preSavedImageData.lng;
          }
        }

        imageInfo.path = item.src;
        imageInfo.lat = lat;
        imageInfo.lng = lng;

        image.push(imageInfo);
      });

      if(titleText!== ""){
        var saveWriteMeData = {
          type : 'BS',
          userId : userId,								//임시 아이디
          title : titleText,					//제목
          content : t.$('div.froala-reactive-meteorized').froalaEditor('html.get', true),
          startDate : global.utilGetDate(memoryDay).defaultYMD,
          images : image,											// 업로드 이미지
          tagList : tagArray,
          updateDate: global.utilGetDate().default,
          postId : postIdParam
        };
        if(!_id){
          saveWriteMeData.like = [];
          saveWriteMeData.open = 0;
          saveWriteMeData.lock = false;
        }

        var templateDataDetail = {};
        templateDataDetail.data = {
          bucketListKey : Template.instance().data.postId,
          parentTemplateName : Template.instance().data.parentTemplateName,
          groupUsers: t.groupUsers,
          bucketListUserId: Template.instance().data.bucketListUserId
        };

        // console.log('savewriteMeData',saveWriteMeData);
        Meteor.call('storyUpsert', _id, saveWriteMeData, function(error, result) {
          if (error) {
            return alert(error);
          } else {
            var postId = result.insertedId;
            var type = global.pageType.bucketStory;
            if(!_id){
              global.utilTimelineRegister(postId, userId, type, memoryDay, '', false);
              var historyObj = {
                postId: postIdParam,
                subPostId: postId,
                postType: "BS",
                user: userId
              };

              t.groupUsers.unshift(t.postUserId);
              if (t.groupUsers.length !== 0) {
                t.groupUsers.map(function(item) {
                  historyObj.postUser = item;
                  global.utilHistoryWrite(historyObj, 'insert');

                  var options = {
                    userId: userId,
                    title: titleText
                  };
                  // 등록한 사람은 알림을 보내지 않음
                  if (userId !== item) {
                    Meteor.call('setNoti', item, type, postId, 'write', options);
                  }
                });
              }

              if(isMoveToIm){ //신규등록 > 추억으로 이동 선택
                Meteor.call('moveStory', global.login.userId, postId, null, global.pageType.im, function(error){
                  if(error) {
                    console.log('moveStory_error', error);
                  } else {
                    var historyObj = {
                      postId: postId,
                      userId: global.login.userId
                    };
                    var timelineObj = {
                      postId: postId,
                      userId: userId,
                      timeClass: 'start',
                      contentType: 'H',
                      type: 'IM',
                      sort: 2,
                      timelineDate: global.utilGetDate(memoryDay).defaultYMD,
                      updateDate: global.utilGetDate().default,
                      regDate: global.utilGetDate().default,
                    };
                    // 버킷 -> 스토리 이동
                    global.utilMoveStory(postId, postIdParam, timelineObj, historyObj, titleText);
                    var templateData = {};
                    templateData.headerTmp = 'endingNoteListHeaderIm';
                    templateData.contentTmp = 'imContent';

                    Session.set('endingNoteList templateData', templateData);
                  }
                });
              } else {  //신규등록 > 추억으로 이동 선택안함
                Meteor.call('setLog', postIdParam, postId, userId, userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketList.bucketStoryWrite, 'bucketStoryWrite', titleText);
              } //if

              templateDataDetail.template = 'bucketStoryDetail';
              templateDataDetail.data.bucketStoryId = result.insertedId;
              templateDataDetail.data.templateName = 'bucketStoryDetail';

              Session.set('bucketStory templateList', null);
              setTimeout(function(){
                Session.set('bucketStory templateList', templateDataDetail);
              }, 100);

              //'이전' 버튼 활성화
              Session.set('bucketDetail hpUseGolistButton', true);
            } //if
          }
        });

        //수정일경우
        if(_id){
          var obj = [{
            userId: userId,
            timeClass: 'start',
            contentType: 'E',
            timelineDate: global.utilGetDate(memoryDay).defaultYMD,
            updateDate: global.utilGetDate().default
          }];
          Meteor.call('enTimelineUpdate', _id, obj, function(error) {
            if (error) {
              return alert(error);
            } else {
              if(isMoveToIm){ //수정 > 추억으로 이동 안함
                Meteor.call('moveStory', global.login.userId, _id, null, global.pageType.im, function(error){
                  if(error) {
                    console.log('moveStory_error', error);
                  } else {
                    var historyObj = {
                      postId: _id,
                      userId: global.login.userId
                    };
                    var timelineObj = {
                      postId: _id,
                      userId: userId,
                      timeClass: 'start',
                      contentType: 'H',
                      type: 'IM',
                      sort: 2,
                      timelineDate: global.utilGetDate(memoryDay).defaultYMD,
                      updateDate: global.utilGetDate().default,
                      regDate: global.utilGetDate().default,
                    };
                    // 버킷 -> 스토리이동
                    global.utilMoveStory(_id, postIdParam, timelineObj, historyObj, titleText);
                    var templateData = {};

                    templateData.headerTmp = 'endingNoteListHeaderIm';
                    templateData.contentTmp = 'imContent';

                    Session.set('endingNoteList templateData', templateData);
                  }
                });
              }
            }
          });
        }
      }

      if(!global.fn_isExist(removeImageList)){
        global.fn_DeleteS3Images(removeImageList);
      }
      imageListTemp = [];

      //화면이동
      global.fn_DeleteS3Images(removeImageList);
      Template.bucketStoryContent.__helpers.get('hpcallbackList')();
      Modal.hide();

    }
  },
  "click #cancelWriteMe": function(e, t){
    e.preventDefault();
    global.utilConfirm('취소 하시겠습니까?').then(function(val) {
      if (val) {
        Modal.hide();
      }
    }).catch(swal.noop);
  },
  "click .btn-tagDelete": function(e, t){
    $(e.target.parentElement).remove();
  },
  "keyup #inputTag": function(e, t){
    var tag = t.find('input[id="inputTag"]').value;
    if(e.keyCode === 13 && tag !== ""){
      $("#inputTag").before("<li><a href=\"javascript:void(0)\"><strong>#</strong>"+tag+"</a><a href=\"javascript:void(0)\" class=\"btn-tagDelete\"></a></li>");
      t.find('input[id="inputTag"]').value = "";
    }
    //inputbox width리사이징을 위한 function global
    global.fn_inputResizing(e.target);
  }
});

Template[templateName].onDestroyed(function(){
  if(global.fn_isExist(imageListTemp)) {
    global.fn_DeleteS3ImagesByType(imageListTemp, global.s3.folder.bucketStory);
    imageListTemp=[];
  }
});
