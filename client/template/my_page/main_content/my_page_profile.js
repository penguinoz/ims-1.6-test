import {global} from '/imports/global/global_things.js';

// 마이페이지 > 회원정보관리
var templateName = 'myPageProfile';

Template[templateName].onCreated(function(){
  this.nickCheck = new ReactiveVar('');
  this.nickNameCheckMessage = new ReactiveVar('');
  this.userInfo = new ReactiveVar(Meteor.users.find({_id: Meteor.userId()}).fetch()[0]);
  this.email = new ReactiveVar(this.userInfo.get().profile.email);

  this.nickName = this.userInfo.get().profile.nickName;
  this.originImg = this.userInfo.get().profile.profileImg;
  this.changedImg = '';
  this.deleteImg = [];
  this.profileImg = []; //썸네일
  this.profileImgThumb = null; //썸네일
  this.profileImgOrigin = null; //원본파일
  this.profileImgOriginRe = null; //원본파일 줄인것
});

Template[templateName].onRendered(function(){
  // 체크박스 default checked
  $('input[name=sex][value='+this.userInfo.get().profile.sex+']').prop('checked', true);
  $('input[name=month][value='+this.userInfo.get().profile.birthday.month+']').prop('checked', true);

  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  // [프로필관리] 별명 중복확인
  "click [name=nickNameCheck]": function(e, t){
    e.preventDefault();

    var nickCheck = 0;
    var nickName = t.find('input[name=nickName]').value;
    if (!global.fn_isExist(nickName)) {
      t.nickNameCheckMessage.set('별명을 입력해주세요.');
      t.nickCheck.set('error');
    } else {
      nickCheck = Meteor.users.find({'profile.nickName': nickName, username: {$ne: t.userInfo.get().username}}).count();
      if (nickCheck !== 0) {
        t.nickNameCheckMessage.set('이미 있는 별명입니다.');
        t.nickCheck.set('error');
      } else {
        t.nickNameCheckMessage.set('사용가능한 별명입니다.');
        t.nickCheck.set('success');
      }
    }
  },
  'keyup [name=nickName]': function(e, t) {
    e.preventDefault();
    t.nickCheck.set('');
    t.nickNameCheckMessage.set('');
  },
  // [프로필관리] 프로필업로드
  "change .txtImageFile": function(e, t){
    e.preventDefault();

    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function  () {
      var newFileName = Meteor.uuid();
      //원본이미지 파일
      t.profileImgOrigin = {
        fileName : (newFileName + '.jpeg'),// + e.target.files[0].type.split("/")[1]),
        data : reader.result
      };

      var tempImage = new Image();
      tempImage.src = reader.result;
      tempImage.onload = function () {
        //보기용 canvas생성
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext("2d");
        canvas.width = 129;
        canvas.height = 129;
        canvasContext.drawImage(this, 0, 0, 129, 129);
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
          fileName : (newFileName + '_thumb.jpeg'),
          data : dataURI
        };

        //원본파일 줄인것
        t.profileImgOriginRe = {
          fileName : (newFileName + '_originRe.jpeg'),
          data : dataURIOriginRe
        };

        t.profileImg = [
          t.profileImgOrigin,
          t.profileImgThumb,
          t.profileImgOriginRe
        ];
      };
    };
  },
  // [프로필관리] 이메일 select
  'change [name=emailSelect]': function(e, t) {
    e.preventDefault();

    var userInfo = t.userInfo.get().profile.email.split('@')[0];
    var email = e.target.value;

    t.email.set(userInfo + '@' + email);
  },
  // [프로필관리] 저장
  'click [name=profileSave]': function(e, t) {
    e.preventDefault();

    var data = global.utilGetFormDataArray(t)[0];

    if (t.nickName !== data.nickName) {
      if (t.nickCheck.get() === '') {
        return global.utilAlert('별명 중복확인을 해주세요.');
      }
    }

    if (!global.fn_isExist(data.nickName)) {
      return global.utilAlert('별명을 입력해주세요.');
    }
    if (!global.fn_isExist(data['email-first']) || !global.fn_isExist(data['email-last'])) {
      return global.utilAlert('Email을 입력해주세요.');
    }
    if (!global.fn_isExist(data.birthday)) {
      return global.utilAlert('생일을 입력해주세요.');
    }
    // if (!global.fn_isExist(data.mobile)) {
    //   return global.utilAlert('휴대폰번호를 입력해주세요.');
    // }

    var defaultImag = t.userInfo.get().profile.profileImg;
    var imageInfo = t.userInfo.get().profile.profileImg;
    if(t.profileImgOrigin){
      imageInfo = global.s3.folder.profile +'/' + t.profileImgOrigin.fileName;
    }

    var sex = $('input:radio[name=sex]:checked').val();
    var month = $('input:radio[name=month]:checked').val();

    var updateObj = {
      'profile.nickName': data.nickName,
      'profile.sex': sex,
      'profile.birthday': {month: month, date: data.birthday},
      'profile.email': data['email-first'] + '@' + data['email-last'],
      'profile.mobile': data.mobile,
      'profile.joinRoute': data.joinRoute,
      'profile.profileImg': imageInfo,
      'profile.introduction': data.introduction
    };

    if(global.fn_isExist(t.profileImg)){
      // 변경된 이미지가 있는경우
      if (global.fn_isExist(defaultImag) && imageInfo !== defaultImag) {
        // 기존이미지 삭제
        var imageData = [{
          path: defaultImag
        }];
        global.fn_DeleteS3Images(imageData);
      }
      upLoadeS3ImageAndDbUpdate(t.profileImg, updateObj);
    } else {
      // 변경된 이미지가 없을때 DB업데이트
      Meteor.users.update({_id: Meteor.userId()}, {$set: updateObj}, function(error) {
        if (!error) {
          global.utilAlert('저장되었습니다', 'success');
        }
      });
    }
  },
  // [비밀변호변경] 저장
  'click [name=passwordChangeSave]': function(e, t) {
    e.preventDefault();

    var oldPw = t.find('input[name=oldPassword]').value;
    var newPw1 = t.find('input[name=newPassword1]').value;
    var newPw2 = t.find('input[name=newPassword2]').value;

    if (!global.utilPasswordCheck(newPw1) || !global.utilPasswordCheck(newPw2)) {
      return global.utilAlert('패스워드 양식에 맞춰 입력해주세요.');
    }

    if (newPw1 === newPw2) {
      Accounts.changePassword(oldPw, newPw1, function(error) {
        if (error) {
          if (error.reason === 'Incorrect password') {
            return global.utilAlert('비밀번호를 잘못입력하셨습니다.');
          }
        } else {
          Meteor.call('getPwChangeUpdate', t.userInfo.get().username, global.utilGetDate().default, true);
          global.utilAlert('비밀번호가 변경되었습니다.', 'success');
          $('.password').val('');
        }
      });
    } else {
      return global.utilAlert('비밀번호가 서로 다릅니다.');
    }
  },
  'keyup [name=mobile]': function(e, t) {
    e.preventDefault();

    var target = e.target;
    var numPattern = /([^0-9])/;

    var pattern = target.value.match(numPattern);
    if (pattern !== null) {
      target.value = '';
      return global.utilAlert('숫자만 입력해주세요.');
    }
  },
  'click [name=leave]': function(e, t){
    e.preventDefault();


    //패스워드 확인
    var password = t.find('input[name=passwordCheck]').value;

    //이메일 인증코드 확인
    var emailCodeCheck = true;

    if (e.type === 'click' || e.keyCode === 13) {
      Meteor.loginWithPassword(global.login.userId, password, function(error) {
        if (error) {
          global.utilAlert('패스워드를 잘못 입력하였습니다.');
        } else {
          var passwordCheck = true;
        }
      });
    }



    if(passwordCheck && emailCodeCheck){
      var modalobj = {};
      modalobj.template = t.$(e.target).data('modal-template');
      modalobj.size = 'modal-md2';
      modalobj.fade = false;
      modalobj.backdrop = 'static';
      modalobj.data = {
        userId : global.login.userId
      };
      global.utilModalOpen(e, modalobj);
    } else {
      if(!passwordCheck){
        //팝업처리
        console.log('비밀번호가 일치하지 않습니다. 비밀번호를 확인해주세요');
      } else if(!emailCodeCheck){
        //팝업처리
        console.log('이메일 코드 입력이 잘못되었습니다. 이메일을 다시 확인해주세요');
      }

    }
  }
});

Template[templateName].helpers({
  hpNickCheck: function() {
    return Template.instance().nickCheck.get();
  },
  hpCollection: function(){
    return Template.instance().userInfo.get();
  },
  hpNickNameCheck: function() {
    return Template.instance().nickNameCheckMessage.get();
  },
  hpEmailChange: function() {
    return Template.instance().email.get();
  }
});

function upLoadeS3ImageAndDbUpdate (imgInfo, updateObj){
  var count = 0;
  var imgsInfo = [];
  if(_.isArray(imgInfo)){
    imgsInfo = imgInfo;
  } else {
    imgsInfo.push(imgInfo);
  }

  _.each(imgsInfo, function(item){

    count++;
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
        console.log('Error uploading data: ', err + ":" + data);
      } else {
        if(imgsInfo.length === count){
          Meteor.users.update({_id: Meteor.userId()}, {$set: updateObj}, function(error) {
            if (!error) {
              //타임라인 page에 표시되는 이미지 새로고침
              Session.set('refresh', Session.get('refresh') ? false : true);

              global.utilAlert('저장되었습니다', 'success');
            }
          });
        }
      }
    });
  });
}
