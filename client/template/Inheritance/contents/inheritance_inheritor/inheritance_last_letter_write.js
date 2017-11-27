import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 마지막편지 등록/수정
var templateName = 'inheritanceLastLetterWrite';
var removeImageList;
var imageListTemp;
var instance;
var imageDataArray = [];
var imgOrigin = {};
var imgOriginRe = {};
var orientation = 1;
var imgFirstTimeUpload = true;
var loadedLetter;

Template[templateName].onCreated(function(){
  removeImageList = [];
  imageListTemp = [];
  orientation = 1;
  imageDataArray = [];
  imgOrigin = {};
  imgOriginRe = {};
  loadedLetter = {};

  var initalData = {userId:global.login.userId};
  this.loadedData = new ReactiveVar();
  instance = this;
  // this.inheritors = new ReactiveVar();
  global.fn_setS3UploadInfo(global.s3.folder.inheritance);
  Session.set("inheritanceLastLetterWrite inheritors", null );
  instance.allImageList = [];
  var subscribe = instance.subscribe("inheritance_userid",global.login.userId);
  instance.autorun(function(){
    if(subscribe.ready()){
      // instance.templateInstance().inheritors.set(CLT.Inh.find().fetch());

      var inheritorInfo = CLT.Inh.find().fetch();

      var inheritorIds = _.uniq(_.pluck(inheritorInfo,'inheritorId'));

      //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
      Meteor.call('getNickAndImg', inheritorIds, function(error, result){
        if(error){
          console.log(error);
        } else {
          var userInfo = result;
          // im.nickName  = userInfo.nickName;
          // im.profileImg  = userInfo.profileImg;

          _.map(inheritorInfo, function(info){
            var extend = _.findWhere(userInfo, {userId : info.inheritorId});
            if(extend){
              info.nickName = extend.nickName ? extend.nickName : '';
            } else {
              info.nickName = info.name ? info.name : '';
            }
          });

          Session.set("inheritanceLastLetterWrite inheritors", inheritorInfo);
        }
      });

      // instance.templateInstance().loadedData.set(initalData);
    }
  });
  if(instance.data && instance.data._id){
    var contentKey = instance.data._id;
    Meteor.call('getInheritanceById',contentKey,function(err, res){
      if(err){console.error(err);
      }else{
        instance.loadedData.set(res);
        instance.$('div.froala-reactive-meteorized').froalaEditor('html.set',res.lastLetter.context);
      }
    });
  }


});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpGetMeId: function(){
    return global.login.userId;
  },
  hpLatterWriteCol: function(){
    return Template.instance().loadedData.get();
  },
  hpCheckSelectSession: function(){
    if(Session.get("inheritanceLastLetterWrite inheritors")){
      return true;
    }else{
      return false;
    }
  },
  hpGetContext: function () {
    var self = Template.instance();
    return {
      key: global.editorSettings.key,
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

      // "_onimage.loaded": function (e, editor, img) {
      //   imageListTemp.push($(img[0]).attr("src"));
      // }, //end _onimage.loaded
      //
      // "_onimage.beforeRemove": function (e, editor, img,self) {
      //   removeImageList.push($(img[0]).attr("src"));
      // } // end _onimage.beforeRemove
      "_onblur": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
      }, //end _onimage.loaded
      "_onimage.beforePasteUpload": function (e, editor, img) {
        // console.log('beforePaste');
      }, //end _onimage.loaded
      "_onmousedown": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
        if($("#ihnSearch").val() === 'emptyUser'){
          document.getElementById("ihnSearch").focus();
          global.utilAlert("상속대상을 선택해 주세요");
        }
      }, //end _onimage.loaded
      "_onimage.uploadedToS3": function(e, editor, link, key, response){
        imageListTemp.push(global.fn_makeImageString(link, 'originRe'));

        var storeFolder = global.s3.folder.inheritance+'/';
        var imageName = key.substring(key.indexOf(storeFolder) + storeFolder.length, key.lastIndexOf('.'));

        imgOriginRe.fileName = imgOriginRe.fileName.replace('fileName', imageName);
        imgOriginRe.filePath = global.fn_makeImageString(link, 'originRe');

        imageDataArray.push(imgOriginRe);

        //에디터 등록 화면에 등록될 이미지를 보여주기 위해서 originRe를 선 Upload한다
        global.fn_upLoadeS3Image(imageDataArray, global.s3.folder.inheritance);

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

              orientation = EXIF.getTag(this, "Orientation");
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
  hpgetUserName: function(name){
    //비유져는 name을 가져옴
    if(name){
      return true;
    }
      return false;
  }
});

Template[templateName].events({
  "change #ihnSearch":function(e, t){
    var targetUserId = e.currentTarget.selectedOptions[0].value;
    Meteor.call('getLastLetter',global.login.userId, targetUserId,function(err,res){
      if(res && res.lastLetter){
        loadedLetter = res.lastLetter;
        t.$('div.froala-reactive-meteorized').froalaEditor('html.set',res.lastLetter.context);
        //마지막 편지 상세 화면으로 이동
        // global.utilConfirm('작성된 편지가 이미 있습니다 작성된 편지를 확인 하시겠습니까?').then(function(val) {
        //   if (val) {
        //     var templateData = {};
        //     templateData.contentTmp = 'inheritanceLastLetter';
        //     templateData.data = {
        //       _id : res._id,
        //       userId : res.userId,
        //       inheritorId : res.inheritorId,
        //       name : res.name,
        //       lastLetter : res.lastLetter
        //     };
        //     Session.set('inheritanceMain templateData', templateData);
        //   }
        // });
      }
    });
  },
  "click a[name='saveLetter']": function(e, t){
    var targetUser = $("#ihnSearch").val();
    if(targetUser === 'emptyUser'){
      global.utilAlert("상속인을 선택해주세요.");
      return;
    }
    if(t.$('div.froala-reactive-meteorized').froalaEditor('html.get', true) === ""){
      global.utilAlert('내용을 작성해 주세요.');
      return;
    }else if(loadedLetter.context){
      global.utilConfirm(targetUser+'께 보내는 마지막 편지를 수정하시겠습니까?').then(function(val) {
        if(val){
          var userId = global.login.userId;
          var uploadImages = [];
          t.findAll('img').map(function(item) {
            uploadImages.push(item.getAttribute('src').replace("https://s3-ap","https://s3.ap"));
          });
          var latterData = {
            context: t.$('div.froala-reactive-meteorized').froalaEditor('html.get', true),
            image: uploadImages,
            updateDate: t.$("#updateDate").val()
          };

          // if(targetUser == 'all'){ //전체발송 없음
          //   var inhUsers = Session.get("inheritanceLastLetterWrite inheritors");
          //   var nonLetterUser = [];
          //   var allInhUsers = [];
          //   for(var index in inhUsers ){
          //     if(!inhUsers[index].lastLetter || !inhUsers[index].lastLetter.context){
          //       nonLetterUser.push(inhUsers[index].inheritorId);
          //     }
          //     allInhUsers.push(inhUsers[index].inheritorId);
          //   }
          //   var saveInhUsers = _.difference(allInhUsers, nonLetterUser);
          //   if(saveInhUsers.length === 0){
          //     saveInhUsers = allInhUsers;
          //   }
          //   var message = confirmBulder(saveInhUsers);
          //
          //   if(saveInhUsers.length === 0 ){
          //     // 작성된 내용이 한명도 없을시.
          //     saveMeteorCall(userId, allInhUsers, latterData);
          //   }else{
          //     //작성된 내용이 1명이라도 있을시
          //     global.utilConfirm(message).then(function(val) {
          //       if (val) {
          //         //없는대상만
          //         saveMeteorCall(userId, allInhUsers, latterData);
          //       }else{
          //         //전부
          //         saveMeteorCall(userId, nonLetterUser, latterData);
          //       }
          //     });
          //   }
          //
          //
          //   //한명도 작성된사람이 없으면
          //   // if(saveInhUsers.length === 0  || confirm(message)){
          //   //   //확인 모든 대상
          //   //   saveMeteorCall(userId, allInhUsers, latterData);
          //   // }else{
          //   //   //취소선택 이미 상속자는 제외
          //   //   saveMeteorCall(userId, nonLetterUser, latterData);
          //   // }
          //
          //
          // }else{
            //개인 발송
          saveMeteorCall(userId, [targetUser], latterData);
          // }
          imageListTemp = [];
        }
      }).catch(swal.noop);
    }else{
      //기작성내용 없음 바로저
      //소스 정리 필요 위에 global.utilConfirm과 같은 내용 asnyc??
      var userId = global.login.userId;
      var uploadImages = [];
      t.findAll('img').map(function(item) {
        uploadImages.push(item.getAttribute('src').replace("https://s3-ap","https://s3.ap"));
      });
      var latterData = {
        context: t.$('div.froala-reactive-meteorized').froalaEditor('html.get', true),
        image: uploadImages,
        updateDate: t.$("#updateDate").val()
      };

      //전체발송없음
      // if(targetUser == 'all'){
      //   var inhUsers = Session.get("inheritanceLastLetterWrite inheritors");
      //   var nonLetterUser = [];
      //   var allInhUsers = [];
      //   for(var index in inhUsers ){
      //     if(!inhUsers[index].lastLetter || !inhUsers[index].lastLetter.context){
      //       nonLetterUser.push(inhUsers[index].inheritorId);
      //     }
      //     allInhUsers.push(inhUsers[index].inheritorId);
      //   }
      //   var saveInhUsers = _.difference(allInhUsers, nonLetterUser);
      //   if(saveInhUsers.length === 0){
      //     saveInhUsers = allInhUsers;
      //   }
      //   var message = confirmBulder(saveInhUsers);
      //
      //   if(saveInhUsers.length === 0 ){
      //     // 작성된 내용이 한명도 없을시.
      //     saveMeteorCall(userId, allInhUsers, latterData);
      //   }else{
      //     //작성된 내용이 1명이라도 있을시
      //     global.utilConfirm(message).then(function(val) {
      //       if (val) {
      //         //없는대상만
      //         saveMeteorCall(userId, allInhUsers, latterData);
      //       }else{
      //         //전부
      //         saveMeteorCall(userId, nonLetterUser, latterData);
      //       }
      //     });
      //   }
      //
      // }else{
      // 개인 발송
      saveMeteorCall(userId, [targetUser], latterData);
      // }
      imageListTemp = []; //업로드된 이미지 삭제안되게 clear
    }

  },
  "click a[name='canselLatter']" : function(){
    templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  }
});

Template[templateName].onDestroyed(function(){
  Session.set("inheritanceLastLetterWrite inheritors", null );
  if(global.fn_isExist(imageListTemp)) {
    // global.fn_DeleteS3Images(imageListTemp);
    global.fn_DeleteS3ImagesByType(imageListTemp, global.s3.folder.inheritance);
  }
});

Template.inhListSelector.onCreated(function(){

});

Template.inhListSelector.onRendered(function(){
    global.fn_selectPicker('.selectpicker', null);
    if(Template.instance().isSetToValue){
      $("#ihnSearch").attr('disabled', true);
    }
});

Template.inhListSelector.helpers({
  hpGetInheritors: function(){
    return Session.get("inheritanceLastLetterWrite inheritors");
  },
  hpGetSelecter: function(users){
    if(Template.instance().data &&
      Template.instance().data.inheritorId === users){
        Template.instance().isSetToValue = true;
        $("#selectTemap").addClass('hidden');
        $("#selectedDiv").removeClass('hidden');
      return true;
    }else{
      return false;
    }
  },
  hpgetUserName: function(name){
    //name있으면 비유져
    if(name){
      return true;
    }
      return false;
  }
});

function saveMeteorCall(userId, targetusers, latterData){

  Meteor.call('setLastLetter', userId, targetusers, latterData, function(err, res){
    if(err){console.error(err);}
    if(res){
      var deletedImages = [];
      var logtype = 'letterwrite';
      // if($("#ihnSearch").val() === 'all') {
      //   logtype = 'letterwriteAll';
      // }

      res.map(function(item,i){
        if(item.lastLetter && item.lastLetter.image){
          deletedImages = _.union(deletedImages,item.lastLetter.image);
        }
        // if(logtype !== 'letterwriteAll') {
        //   if(item.lastLetter && item.lastLetter.context){
        //     //context내용이 있으면 수정
        //     logtype = 'letterEdit';
        //   }
        //   Meteor.call('setLog', item._id, '', global.login.userId, item.inheritorId,  global.pageType.inHeritance, '', logtype,'' );
        // }
      });
      // if(logtype === 'letterwriteAll') {
      //   Meteor.call('setLog', null, '', global.login.userId, global.login.userId, global.pageType.inHeritance, '', logtype,'' );
      // }
      global.fn_DeleteS3ImagesByType(deletedImages, global.s3.folder.inheritance);

      if(!global.fn_isExist(removeImageList)){
        global.fn_DeleteS3ImagesByType(removeImageList, global.s3.folder.inheritance);
      }

      var templateData = {};
      // if($("#ihnSearch").val() === 'all') {
      //   templateData.contentTmp = 'inheritanceLastLetter';
      //   templateData.data = {
      //     _id: res[0]._id,
      //     property : "all"
      //   };
      // }else{
      templateData.contentTmp = 'inheritanceLastLetter';
      templateData.data = {
        _id: res[0]._id,
      };
      // }
      // templateData.contentTmp = 'inheritanceInheritor';
      Session.set('inheritanceMain templateData', templateData);
    }
  });
}

// function confirmBulder (usersNick){
//   if(usersNick.length){
//     var nickName = "";
//     for(var i=0; i<$("#ihnSearch")[0].length ; i++){
//       if($("#ihnSearch")[0][i].value === usersNick[0]){
//         nickName = $("#ihnSearch")[0][i].label;
//       }
//     }
//     if(usersNick.length === 1){
//       return nickName + "님에게 기 작성된 마지막편지가 있습니다.\n 위 상속인들에게도 적용 하시겠습니까? \n \"확인\"을 선택하면 모두 적용되고, \"취소를\" 선택하면 위 상속인을 제외한 분들에게 현재 작성한 마지막 편지가 적용됩니다.";
//     }else{
//       return nickName + "님 외 "+(usersNick.length-1) +"명의 상속인에게 기 작성된 마지막편지가 있습니다.\n 위 상속인들에게도 적용 하시겠습니까? \n \"확인\"을 선택하면 모두 적용되고, \"취소를\" 선택하면 위 상속인을 제외한 분들에게 현재 작성한 마지막 편지가 적용됩니다.";
//     }
//   }
//     return "";
// }
