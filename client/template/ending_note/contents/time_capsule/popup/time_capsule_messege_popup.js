import {global} from '/imports/global/global_things.js';

var templateName = "timeCapsuleMessagePopup";
var isEdit = false;
var originImage = null;
var selectedImage = null;
var isLocalImg = false;
var requestStatus = '';
var isRelease;
var imgMessage = {};
Template[templateName].onCreated(function(){
  isLocalImg = false;
  isEdit = false;
  selectedImage = '';
  requestStatus = '';
  isRelease = false;
  imgMessage = {};

  if(this.data){
    isEdit = true;
    // console.log(this.data);
    requestStatus = this.data.requestStatus;
    isRelease = this.data.isRelease;

    if(this.data && !this.data.backgroundImage){
      this.data.backgroundImage = '/images/bg/time_capsule_message/letter_02.jpg';
    }

    Session.set("timeCapsuleMessagePopup data",this.data);

    // var result = null;
    // var isExistS3 = originImage.indexOf(global.s3.folder.timeCapsule);
    // if(isExistS3 >= 0){
    //   result = global.s3.bucketPath + backgroundImage;
    // }else{
    //   result = backgroundImage;
    // }
  }

});

Template[templateName].onRendered(function(){
  $('.imgSlider').slick({
    // centerMode:true,
    // initialSlide : 0,
    infinite: false,
    slidesToShow: 5,
    slidesToScroll: 1,
    variableWidth: true,
    draggable: false
  });

  $('.image').on('click', function() {
    // console.log('aaaaa');
  });
  $('.imgSlider .slick-slide').removeClass('active');
  $('.imgSlider').on('afterChange', function(event, slick, currentSlide, nextSlide) {
    // console.log(currentSlide);
    //remove all active class
    $('.imgSlider .slick-slide').removeClass('active');
    //set active class for current slide
    // $('.imgSlider .slick-slide:not(.slick-cloned)').eq(currentSlide).addClass('slick-current');
  });
  global.fn_selectPicker('.selectpicker', null);
});



Template[templateName].helpers({
  hpCollection: function(content){
    return Session.get("timeCapsuleMessagePopup data");
  },
  // hpBackgroundPath: function(backgroundImage){
  //   var result = null;
  //   // console.log(backgroundImage);
  //   if(backgroundImage){
  //     var isExistS3 = backgroundImage.indexOf(global.s3.folder.timeCapsule);
  //     if(isExistS3 > -1){
  //       result = global.s3.bucketPath + backgroundImage;
  //     }else{
  //       result = backgroundImage;
  //     }
  //   }
  //   return result;
  // },
  hpSetContent: function(message){
    result = null;
    if(message){
      result = message.replace(/<br>/gi, "\r\n");
    }
    return result;
  }
});


Template[templateName].events({
  "click .image": function(e,t){
    e.preventDefault();
    $(e.target).parent().siblings().removeClass('active');
    $(e.target).parent().addClass('active');
    isLocalImg = false;

    var agent = navigator.userAgent.toLowerCase();
    if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
      // console.log('image1', e.target.children[0].childNodes[0].src);
      t.$("#messageContentBg").css("background-image","url('"+e.target.children[0].childNodes[0].value+"')");
      selectedImage = e.target.children[0].childNodes[0].value;
    }else{
      // console.log('image2', e.target.childNodes[0].currentSrc);
      t.$("#messageContentBg").css("background-image","url('"+$(e.target.childNodes[0]).attr('value')+"')");
      selectedImage = $(e.target.childNodes[0]).attr('value');
    }
  },
  "change .txtImageFile": function(e, t){
    isLocalImg = true;
    var imageObj = e.target.files[0];

    var reader = new FileReader();
    reader.readAsDataURL(imageObj);

    // var fName = imageObj.name.substring(0, imageObj.name.lastIndexOf('.'));
    var extension = imageObj.name.substring(imageObj.name.lastIndexOf('.')+1);

    reader.onload = function  () {
      var tempImage = new Image();
      tempImage.src = reader.result;
      tempImage.onload = function () {
        var targetImage = this;
        EXIF.getData(imageObj, function(e,r) {
          var width = targetImage.width;
          var height = targetImage.height;

          //이미지 사이즈 조정
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

          canvasContext.drawImage(targetImage, 0, 0, width, height);
          var dataURI = canvas.toDataURL("image/jpeg");
          t.$("#messageContentBg").css("background-image","url('"+dataURI+"')");

          // var newFileName =  Meteor.uuid() + '-' + fName;
          var newFileName =  Meteor.uuid();
          selectedImage = global.s3.bucketPath + global.s3.folder.timeCapsule + '/' + newFileName + '_originRe.' + extension;
          //원본파일 줄인것
           imgMessage = {
            filePath : selectedImage,
            fileName : newFileName,
            type : 'originRe',
            extension : extension,
            data : dataURI
          };

        });
      };
    };
  },
  //저장버튼
  "click #saveMsg": function(e, t){
    //공개 타임캡슐 메시지 저장 시
    if(isRelease && Session.get('timeCapsuleDetail msgCollection')){
      var sessData = Session.get('timeCapsuleDetail msgCollection');
      for(var i=0; i<sessData.length ; i++){
        if(sessData[i]._id == this.messageId){
          sessData[i].content = $("#messageContent").val();
          if(selectedImage){
            if(isLocalImg){
              sessData[i].backgroundImage = imgMessage.data;
              sessData[i].backgroundImageData = imgMessage;
              sessData[i].imageFlag = isLocalImg;
            } else {
              sessData[i].backgroundImage = selectedImage;
              sessData[i].imageFlag = isLocalImg;
            }

          }
        }
      }
      Session.set('timeCapsuleDetail msgCollection',sessData);
      Modal.hide();
    } else { //작성중 타임캡슐 메시지 저장 시
      var capsuleId = this.capsuleId;
      var messageId = this.messageId;
      var methodName = 'upsertCapsuleMessage';
      var capsuleMsg = {
        userId : global.login.userId,
        content : $("#messageContent").val().replace(/\n/g, "<br>"),
        capsuleId : capsuleId
      };

        if(selectedImage){ //이미지가 선택되었을경우
          if(isLocalImg && imgMessage){
            global.fn_upLoadeS3Image(imgMessage, global.s3.folder.timeCapsule);
          }
          imagePath = selectedImage;
          capsuleMsg.backgroundImage = imagePath;
        } else { //이미지가 선택되지 않았을경우
          if(_.isEqual(requestStatus, 'edit')){
            methodName = 'updateCapsuleMessage';
          }
        }

      setTimeout(function(){ //이미지가 업로드 되기전에 화면에서 해당이미지를 찾지 못하기 때문에 딜레이를 준다.
        Meteor.call(methodName, messageId ,capsuleMsg ,function(error,result){
          if(error){
            console.log(error);
          } else {
            if (methodName === 'upsertCapsuleMessage') {
              var messageObj = {
                postId: capsuleId,
                typeKey: result.messageId,
                // userId: global.login.userId,
                postType: 'TC',
                type: 'MS',
                user: global.login.userId,
                timelineDate: global.utilGetDate().defaultYMD,
                regDate: global.utilGetDate().default,
                updateDate: global.utilGetDate().default
              };
              if ('groupMember' in t.data) {
                Meteor.call('getCapsuleInnerData', capsuleId, function(error, result) {
                  if (!error) {
                    t.data.groupMember.map(function(item) {
                      messageObj.userId = item.userId;
                      // 메시지등록 히스토리 추가
                      global.utilHistoryInsert(messageObj);

                      if (item.userId !== global.login.userId) {
                        var options = {
                          userId: global.login.userId,
                          title: result.title
                        };
                        Meteor.call('setNoti', item.userId, 'TC', capsuleId, 'message', options);
                      }
                    });
                  }
                });
              }
              if ('backgroundImage' in result) {
                if(result.backgroundImage !== capsuleMsg.backgroundImage && result.backgroundImage !== ""){
                  var deleteArray = [];
                  deleteArray.push(result.backgroundImage);
                  // console.log('deleteArray', deleteArray);
                  global.fn_DeleteS3Images(deleteArray);
                }
              }
            } //if
          }//if
        });

        if(!messageId){
          Meteor.call('setLog', capsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.writeMessage, 'writeMessage');
        }

        Modal.hide();
      }, 100);
    }
  },
  'click #cancelMsg': function(){
    Modal.hide();
  }
});
