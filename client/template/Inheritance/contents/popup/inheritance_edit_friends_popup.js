import {global} from '/imports/global/global_things.js';

// 친구 정보 수정 (비회원 정보수정)
var templateName = 'inheritanceEditFriendsPopup';

Template[templateName].onCreated(function(){
  console.log(this.data);
  var instance = this;
  instance.noneUserInfo = new ReactiveVar(instance.data.data);
  instance.preSelectedUsers = instance.data.preSelectedUsers;
  instance.originImg = instance.data.data.image;
  instance.changedImg = '';
  instance.deleteImg = [];
  instance.profileImg = []; //썸네일

  instance.profileImgThumb = null; //썸네일
  instance.profileImgOrigin = null; //원본파일
  instance.profileImgOriginRe = null; //원본파일 줄인것

});

Template[templateName].helpers({
  hpNoneUserInfo: function(){
    return Template.instance().noneUserInfo.get();
  }
});

Template[templateName].events({
  //정보수정내용 저장
  "click #save": function(e,t){
    //validation check
    if(!$("#nonUserName").val().trim() && $("#nonUserEmail").val().trim()){
      global.utilAlert("직접입력 대상의 이름은 필수 항목입니다.");
      $("#nonUserName").focus();
      return;
    }
    if(!$("#nonUserEmail").val().trim() && $("#nonUserName").val().trim()){
      global.utilAlert("직접입력 대상의 이메일은 필수 항목입니다.");
      $("#nonUserEmail").focus();
      return;
    }

    var preUserId = Template.instance().preSelectedUsers;
    if(_.has(_.invert(preUserId), $("#nonUserEmail").val().trim().toLowerCase())){
      global.utilAlert($("#nonUserEmail").val() + "은 이미 등록된 이메일입니다.");
      return;
    }

    //1. 신규이미지 추가
    if(t.changedImg){
      // console.log('t.profileImg', t.profileImg);
      upLoadeS3Image(t.profileImg);
    }

    //2. 기존이미지 삭제
    if(t.deleteImg){
      // console.log('t.deleteImg', t.deleteImg);
      global.fn_DeleteS3Images(t.deleteImg);
    }

    //3. DB데이터 갱신
    var condition = {
      _id : t.noneUserInfo.get()._id
    };

    var data = {
      $set : {
        name : $("#nonUserName").val().trim(),
        eMail : $("#nonUserEmail").val().trim(),
        image : t.changedImg
      }
    };
    var sessData = Template.instance().noneUserInfo.get();
    var oriData = {
      eMail: sessData.eMail,
      name : sessData.name
    };
    var modiData = {
      name : $("#nonUserName").val().trim(),
      eMail : $("#nonUserEmail").val().trim(),
    };

    Meteor.call('setModifyNonUserLog', global.login.userId ,modiData ,oriData);


    setTimeout(function(){
      Meteor.call('updateInheritor', condition, data ,function(error, result){
        if(error){
          return console.log(error);
        }
      });
    }, 100);


    Modal.hide();
},
//정보수정 취소
"click #cancel": function(e,t){
  Modal.hide();
},
//비유저 프로필사진 추가
"change .txtImageFile": function(e, t){
  e.preventDefault();

  var reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = function  () {
    var newFileName = Meteor.uuid();
    //원본이미지 파일
    t.profileImgOrigin = {
      fileName : (newFileName + '_origin' + '.jpeg'),
      data : reader.result
    };

    if(t.originImg){
      t.deleteImg.push(global.fn_concat_imageString_type(t.originImg, 'origin')); // profile_images/231012012932fj293e01j.jpeg --> profile_images/231012012932fj293e01j_origin.jpeg로 변환
      t.deleteImg.push(global.fn_concat_imageString_type(t.originImg, 'thumb')); // profile_images/231012012932fj293e01j.jpeg --> profile_images/231012012932fj293e01j_thumb.jpeg로 변환
      t.deleteImg.push(t.originImg); //profile_images/231012012932fj293e01j.jpeg
    }



    var tempImage = new Image();
    tempImage.src = reader.result;
    tempImage.onload = function () {
      //보기용 canvas생성
      var canvas = document.createElement('canvas');
      var canvasContext = canvas.getContext("2d");
      canvas.width = 47;
      canvas.height = 47;
      canvasContext.drawImage(this, 0, 0, 47, 47);
      var dataURI = canvas.toDataURL("image/jpeg");

      //썸네일 이미지 보여주기
      t.$('#profileImg').attr('src',dataURI);

      //원본수정(originRe)용 canvas생성
      var width = this.width;
      var height = this.height;

      if(width >= height){
        if(width > 1024){
          width = 1024;
          height = this.height * (1024/this.width);
        }
      } else {
        if(height > 800){
          height = 800;
          width = this.width * (1024/this.height);
        }
      }

      var canvasOriginRe = document.createElement('canvas');
      var canvasContextOriginRe = canvasOriginRe.getContext("2d");
      canvasOriginRe.width = width;
      canvasOriginRe.height = height;
      canvasContextOriginRe.drawImage(this, 0, 0, width, height);
      var dataURIOriginRe = canvasOriginRe.toDataURL("image/jpeg");

      //썸네일
      t.profileImgThumb = {
        fileName : (newFileName + '_thumb' + '.' + 'jpeg'),
        data : dataURI
      };

      //원본파일 줄인것
      t.profileImgOriginRe = {
        fileName : (newFileName + '.' + 'jpeg'),
        data : dataURIOriginRe
      };

      t.profileImg = [
        t.profileImgOrigin,
        t.profileImgThumb,
        t.profileImgOriginRe
      ];

      t.changedImg = global.s3.folder.profile +'/'+ t.profileImgOriginRe.fileName;
    };
  };
},
});

function upLoadeS3Image (imgInfo){
  var imgsInfo = [];
  if(_.isArray(imgInfo)){
    imgsInfo = imgInfo;
  } else {
    imgsInfo.push(imgInfo);
  }

  _.each(imgsInfo, function(item){
    // var extension = item.extension;
    // var newFileName = item.fileName +item.type + '.' + extension;
    var realPath = item.data.substring(item.data.indexOf("data"));//imagePath.substring(imagePath.indexOf("data"));

    var path = global.s3.folder.profile +'/' + item.fileName;
    var s3Bucket = new AWS.S3();

    buf = new Buffer(realPath.replace(/^data:image\/\w+;base64,/, ""),'base64');
    var data = {
      Bucket: S3.config.bucket,
      Key: path,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg'
    };
    //위에서 설정한 파일명과, 서버정보를 이용하여, DB에 데이터를 저장한다.
    s3Bucket.putObject(data, function(err, data){
      if (err) {
        console.log(err);
        console.log('Error uploading data: ', data);
      } else {
        console.log('succesfully uploaded the image!',data);
      }
    });
  });

  // return path;
}
