//#####################################################################################
// 전역
//#####################################################################################

var global = {};
/**
* @ 스크롤바를 사용자 스타일로 변환한다.
* param1 : <Selector> id or class selector
* param2 : <Sring> type
* ex)global.fn_customerScrollBarInit(id)
*/

//customer scroll
global.fn_customerScrollBarInit = function(id, type, callbacksOption){
  id.mCustomScrollbar({
    theme : type,
    live : false,
    scrollInertia : 0,
    alwaysShowScrollbar: 1,
    mouseWheel : {
      enable : true,
      axis : "y",
      scrollAmount : 45
      // preventDefault : false,
      // deltaFactor : "auto",
      // normalizeDelta : false,
      // invert : false,
      // disableOver : ["select","option","keygen","datalist","textarea"]
    },
    advanced:{
      autoScrollOnFocus: false,
      updateOnContentResize: true
    },
    callbacks : callbacksOption
  });
};
global.fn_heightResizing = function(target){
  $(target).css({'height':($(document).height())+'px'});
  $(window).resize(function(){
    $(target).css({'height':($(document).height())+'px'});
  });
};

global.fn_setTop = function(targetElement){
  setTimeout(function(){
    targetElement.mCustomScrollbar('scrollTo',"2");
    // targetElement.mCustomScrollbar('scrollTo',"top");
  }, 10);
};

/*
* @ inputbox width리사이징을 위한 function
* param1 : <Event> selector
* ex)global.inputResizing(e.target)
*/
global.fn_inputResizing = function(target){
  $('body').append('<span class="new_width">'+$(target).val()+'</span>');
  var textWidth = $('.new_width').width();
  $(target).width(textWidth);
  $('.new_width').remove();
};

/*
* @ textarea height 리사이징을 위한 function
* param1 : <Event> selector
* ex)global.fn_textareaResizing(e.target)
*/
global.fn_textareaResizing = function(target){
  var tagetWidth = $(target).width()+45;
  $('body').append('<div class="new_height" style="position:absolute; top:0; width:'+tagetWidth+'px; min-height:26px; padding-right:48px; line-height:26px;">'+$(target).val()+'</div>');
  var textHeight = $('.new_height').height() - 1;
  $(target).height(textHeight);
  $('.new_height').remove();
};
/*
* @ timeline textarea height 리사이징을 위한 function
* param1 : <Event> selector
* ex)global.fn_timeLineInputResizing(e.target)
*/
global.fn_timeLineInputResizing = function(target){
  $('body').append('<div class="new_timeline" style="position:absolute; top:0; min-width:40px; max-width:200px; min-height:17px; line-height:20px;">'+$(target).val()+'</div>');
  var textWidth = $('.new_timeline').width()+8;
  var textHeight = $('.new_timeline').height();
  $(target).width(textWidth);
  $(target).height(textHeight);
  $('.new_timeline').remove();
};

/*
* @ 현재 다른 사용자의 페이지를 방문중이지 확인
* param1 : <String> selector
* return : <boolen>
* ex)global.fn_checkPageOwner('testUser');
*/
global.fn_checkPageOwner = function(userId){
  if(_.isEqual(userId, global.login.userId)){
    return true;
  }
  else {
    return false;
  }
};

/*
* @ 다른 사용자 페이지 방문 시 pageOwner값 설정
* param1 : <String> selector
* ex)global.fn_setPageOwner('testUser');
*/
global.fn_setPageOwner = function(userId){
  global.login.pageOwner = userId;
};

/*
* @ custom select function
* param1 : <Event> selector
* param2 : <String> type class
* ex)global.fn_selectPicker('.selectpicker', 'btn-info', '100px')
*/
global.fn_selectPicker = function(_target, _type){
  $(_target).selectpicker({
    style: _type
  });
};


/*
* @ custom select function
* param1 : <Event> selector
* param2 : <String> type class
* ex)global.fn_selectPicker('.selectpicker', 'btn-info', '100px')
*/
global.fn_tableParse = function(){
  var rowWidth = $('.tr:first').width();
  var colWidth = $('.td:first').width();
  var marginRight = colWidth - rowWidth + 20;
  $('.td.colspan').css('margin-right', marginRight + 'px').show();
};

/*
* @ 항목이 값을 갖고 있는지 확인
* param1 : <object> selector
* ex)global.fn_isExist(object);
*/
global.fn_isExist = function(target) {
  if(target){
    var type = Object.prototype.toString.call(target);
    switch(type){
      case "[object Object]":
      //빈 object?
      if(Object.getOwnPropertyNames(target).length === 0){
        return false;
      }else{
        return true;
      }
      break;
      case "[object Array]":
      //빈 array???
      if(target.length === 0){
        return false;
      }else{
        for(var i in target ){
          if(target[i]){
            if(Object.prototype.toString.call(target[i])==="[object Object]" && Object.getOwnPropertyNames(target).length === 0){
              return false;
            }
            return true;
          }
        }
        return false;
      }
      break;
      default:
      return true;
    }
  } else {
    return false;
  }
};

global.fn_getName = function(userId) {
  var userInfo = Meteor.users.find({username: userId}).fetch()[0];
  if (userInfo) {
    return userInfo.profile.name;
  } else {
    return userId;
  }
};


global.fn_getNickName = function(userId) {
  if (!userId) {
    userId = global.login.userId;
  }
  var userInfo = Meteor.users.find({username: userId}).fetch()[0];
  if (userInfo) {
    return userInfo.profile.nickName;
  }else{
    return userId;
  }
};


global.fn_getUsersIdByNick = function(nickName) {
  var result = [];
  var regexNickName = new RegExp(["^.*", nickName, ".*"].join(""), "gi");
  var usersInfo = Meteor.users.find({'profile.nickName': regexNickName}).fetch();
  _.each(usersInfo, function(info){
    result.push(info.username);
  });

  return result;
};

global.fn_getEmail = function(userId) {
  if (!userId) {
    userId = global.login.userId;
  }
  var userInfo = ReactiveMethod.call('getUserInfo', userId, ['profile.email']);
  if (userInfo) {
    return userInfo[0].profile.email;
  }
};

//
global.fn_getUserInfo = function(userId) {
  var userInfo = Meteor.users.find({username: userId}).fetch()[0];
  if (userInfo) {
    return userInfo.profile;
  }
};

global.fn_setLoginId = function(userId){
  global.login.userId = userId;
  global.login.pageOwner = userId;
};

global.fn_setLoginAuth = function(author){
  if(author){
    global.login.authority = author;
  }else{
    global.login.authority = 'user';
  }

};

//이미지 사이즈별 스트링 만들기
global.fn_makeImageString = function(imagePath, type) {
  var result = '';
  if(type){
    if(imagePath.indexOf('_originRe') > -1){
      result = imagePath.substring(0, imagePath.lastIndexOf('_originRe'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
    }
    else if (imagePath.indexOf('_thumb') > -1) {
      result = imagePath.substring(0, imagePath.lastIndexOf('_thumb'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
    } else {
      result = imagePath.substring(0, imagePath.lastIndexOf('.'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
    }
  } else {
    result = imagePath;
  }
  return result;
};

//프로필 이미지 스트링 만들기 by userId(type : thumb, originRe)
global.fn_getUsersProfileImageString = function(userId, type) {
  var result = '';
  var userInfo = Meteor.users.find({username: userId},{fields:{'profile.profileImg':1}}).fetch()[0];
  if(userInfo && userInfo.profile.profileImg){
    var profileImg = userInfo.profile.profileImg;
    if(type){
      result = global.s3.bucketPath + profileImg.substring(0, profileImg.lastIndexOf('.'))+ '_' + type + profileImg.substring(profileImg.lastIndexOf('.'));
    } else {
      result = global.s3.bucketPath + profileImg;
    }
  }
  return result;
};

//프로필 이미지 스트링 만들기 by profilePath (type : thumb, originRe)
global.fn_makeProfileImgString = function(_profilePath, _type) {
  var result = '';
  if(_profilePath){
    if(_type){
      result = global.s3.bucketPath + _profilePath.substring(0, _profilePath.lastIndexOf('.'))+ '_' + _type + _profilePath.substring(_profilePath.lastIndexOf('.'));
    } else {
      result = global.s3.bucketPath + _profilePath;
    }
  }
  return result;
};

global.fn_setS3UploadInfo = function(folderPath){
  var editorUploadInfo = global.utilFroalaUpload(folderPath);
  global.editorSettings.imageUploadToS3 = {
    bucket: global.s3.bucketName,
    region: global.s3.region, //'s3-website-us-east-1', //us-east-1
    keyStart: folderPath + '/',
    callback: function (url, key) {
    },
    params: {
      'acl': 'public-read',
      'policy': editorUploadInfo.s3Policy,
      'x-amz-signature': editorUploadInfo.s3Signature,
      'x-amz-algorithm': 'AWS4-HMAC-SHA256',
      'x-amz-credential': editorUploadInfo.s3Credentials,
      'x-amz-date': editorUploadInfo.s3Date
    }
  };
};

global.fn_deleteS3Img = function(arg){
  var s3Bucket = new AWS.S3();
  if(arg.Key.split("iml-images/")[1]){
    arg.Key = arg.Key.split("iml-images/")[1];
  }else{
    arg.Key = arg.Key.split("iml-images/")[0];
  }

  s3Bucket.deleteObject(arg, function (err, data) {
    if (err) {
      console.log("Check if you have sufficient permissions : "+err);
    }
  });
};

//imagethum -> originRe 변경
global.fn_chagneImageType = function(path){
  path = path.replace("_thumb.","_originRe.");
  return path;
};

//s3에 있는 이미지를 삭제하는 함수
//params : removeImageList ( type : array )
global.fn_DeleteS3Images = function(removeImageList) {
  var bucketName = S3.config.bucket;
  var params = {};
  if(!_.isEmpty(removeImageList[0])){
    _.each(removeImageList, function(image){
      var enUrl = image.path ? image.path.replace(/\+/gi, ' ') : image.replace(/\+/gi, ' '); // '+' to ' '(space)

      var decodeUrl = decodeURIComponent(enUrl);  //url decode  예) console.log('decode', decodeURIComponent($(img[0]).attr("src")));
      var path = decodeUrl.replace(global.s3.bucketPath,''); //decodeUrl; //bucketName/ 이후부터 잘라서 넣는부분

      params = {
        Bucket: bucketName,
        Key: path
      };


      if(params.Key.indexOf('_originRe') >= 0){
        //1. originRe 지우기
        global.fn_deleteS3Img(params);
        //2. thumbnail 지우기
        params.Key = params.Key.replace('_originRe', '_thumb');
        global.fn_deleteS3Img(params);
        //3. 원본 지우기
        params.Key = params.Key.replace('_thumb', '');
        global.fn_deleteS3Img(params);
      } else {
        //1. origin 지우기
        global.fn_deleteS3Img(params);
        //2. originRe 지우기
        params.Key = params.Key.split('.jpeg')[0] + '_originRe.jpeg';
        global.fn_deleteS3Img(params);
        //3. thumb 지우기
        params.Key = params.Key.replace('_originRe', '_thumb');
        global.fn_deleteS3Img(params);
      }
    });
  }
};

//s3에 있는 이미지를 삭제하는 함수
//params : removeImageList ( type : array )
global.fn_DeleteS3ImagesByType = function(removeImageList, fromType) {
  var bucketName = S3.config.bucket;
  var params = {};

  if(!_.isEmpty(removeImageList[0])){
    _.each(removeImageList, function(imageData){
      var image = imageData.path ? imageData.path : imageData;
      Meteor.call('isNotThereUsedFile', image, fromType, function(error, result) {
        if(error){
          console.error(error);
        } else {
          if(result){
            // var enUrl = image.path.replace(/\+/gi, ' '); // '+' to ' '(space)
            var enUrl = image.replace(/\+/gi, ' '); // '+' to ' '(space)
            var decodeUrl = decodeURIComponent(enUrl);  //url decode  예) console.log('decode', decodeURIComponent($(img[0]).attr("src")));
            var path = decodeUrl.replace(global.s3.bucketPath,''); //decodeUrl; //bucketName/ 이후부터 잘라서 넣는부분

            params = {
              Bucket: bucketName,
              Key: path
            };

            //1. originRe 지우기
            global.fn_deleteS3Img(params);
            //2. thumbnail 지우기
            params.Key = params.Key.replace('_originRe', '_thumb');
            global.fn_deleteS3Img(params);
            //3. 원본 지우기
            params.Key = params.Key.replace('_thumb', '');
            global.fn_deleteS3Img(params);
          }
        }
      });
    });
  }
};

// 유저닉네임 여러명 가져오기
global.fn_groupMemberNickName = function(userId, groupMember) {
  var result = '';
  var userInfo = Meteor.users.find({username: userId}).fetch()[0];
  if(userInfo){
    result = userInfo.profile.nickName;

    var message = '';
    if (groupMember.length > 1) {
      message = ' 외 ' + (groupMember.length - 1) + '명';
    }
    return result + message;
  }
  return result;
};

global.fn_numPad = function(n, width){
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
};


global.fn_diffDateTime = function(endDateTime){
  var result = {};
  var startTime = new Date(global.utilGetDate().default); // 시작일시 ('2009-01-01 12:30:00')
  var endTime  = new Date(global.utilGetDate(endDateTime).default);    // 종료일시 ('2009-10-01 17:20:10')

  // 두 일자(startTime, endTime) 사이의 차이를 구한다.
  var dateGap = endTime.getTime() - startTime.getTime();
  var timeGap = new Date(0, 0, 0, 0, 0, 0, endTime - startTime);

  // 두 일자(startTime, endTime) 사이의 간격을 "일-시간-분"으로 표시한다.

  result = {
    diffDay  : global.fn_numPad(Math.floor(dateGap / (1000 * 60 * 60 * 24)), 1), // 일수
    diffHour : timeGap.getHours(),       // 시간
    diffMin  : timeGap.getMinutes(),      // 분
    diffSec  : timeGap.getSeconds(),      // 초
  };

  return result;
};

global.fn_diffDate = function(eDate){
  var result = {};
  var toDay = new Date(global.utilGetDate().default);//new Date(); // 시작일시 ('2009-01-01')
  var startDate = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate());
  var endDate  = new Date(global.utilGetDate(eDate).defaultYMD);    // 종료일시 ('2009-10-01')
  var flag = '-';

  // 두 일자(startTime, endTime) 사이의 차이를 구한다.
  var dateGap = endDate.getTime() - startDate.getTime();
  dateGap = Math.floor(dateGap / (1000 * 60 * 60 * 24));

  if(dateGap < 0){
    dateGap = dateGap.toString().substring(1);
    flag = '+';
  } else if( dateGap === 0){
    dateGap = 'day';
  } else {
    dateGap = dateGap.toString();
  }

  result = {
    diffDay  : global.fn_numPad(dateGap, 1), // 일수
    flag : flag
  };

  return result;
};

global.fn_concat_imageString_type = function(imagePath, type){
  var result = '';
  result = imagePath.substring(0, imagePath.lastIndexOf('.'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
  return result;
};

global.fn_isPassAway = function(userId){
  if(Meteor.users.findOne({username:userId})){
    return Meteor.users.findOne({username:userId}).profile.isPassAway;
  } else {
    return false;
  }
};

//조사선택 함수
global.fn_getTextPostPosition = function(context, type){
  //typeA : 을/를 구분, typeB : 이/가 구분, typeC : 으로/로 구분, typeD : 은/는 구분
  var result = '';
  if(global.fn_isHangul(context)){

    var lastText = context.charAt(context.length - 1);
    var textCode = lastText.charCodeAt(0);
    var batchim = true;
    if((textCode-44032)%28 === 0) {
      batchim = false;
    }
    switch(type) {
      case 'typeA': result = (batchim) ? '을':'를'; break;
      case 'typeB': result = (batchim) ? '이':'가'; break;
      case 'typeC': result = (batchim) ? '으로':'로'; break;
      case 'typeD': result = (batchim) ? '은':'는'; break;
    }
  } else {
    result = _.isEqual(type, 'typeA') ? '는/를' : '가';
  }

  return result;
};

global.fn_isHangul = function(context){
  var c = context.charCodeAt(0);
  if( 0x1100<=c && c<=0x11FF ) return true;
  if( 0x3130<=c && c<=0x318F ) return true;
  if( 0xAC00<=c && c<=0xD7A3 ) return true;
  return false;
};

global.fn_sendEmail = function(type, email, title, conText, fromEmail){
  var emailInfo = {};
  emailInfo = emailSend = {
    to: email,
    from: '잇츠마이스토리 <support@itsmystory.com>',
    subject: title,
    text: conText
  };

  // if(type === 'cert') {
  //   emailInfo.from = '더푸르츠 인증 <noreply@itsmystory.com>';
  // } else if('invite'){
  //   emailInfo.from = fromEmail;
  // } else {
  //   emailInfo.from = '잇츠마이스토리 <support@itsmystory.com>';
  // }

  return emailInfo;
};

global.fn_getDifferenceData =  function(arrayTarget, arrSource){
  // 두개의 ArrayData를 비교하여 target에 있는 다른 데이터만 Array로 반환
  var resultTarget = _.reject(arrayTarget, function(obj){ return _.findWhere(arrSource, obj); });
  return resultTarget;
};

//target이 source보다 크면 true
global.fn_isGreaterThan = function(target, source){
  return target > source;
};

//target이 source보다 작으면 true
global.fn_isLessThan = function(target, source){
  return target < source;
};

//2개값 덧셈
global.fn_sumation = function(param1, param2){
  return Number(param1) + Number(param2);
};

//2개값 뺄셈
global.fn_subtraction = function(_param1, _param2){
  var param1 = _param1 ? _param1 : 0;
  var param2 = _param2 ? _param2 : 0;
  return Number(param1) - Number(param2);
};

global.fn_rotateImage = function(orientation){
  var deg = 0;
  switch (orientation) {
    case 2: //확인필요
    deg = 90;
    break;
    case 3:
    deg = 180;
    break;
    case 4: //확인필요
    deg = 180;
    break;
    case 5: //확인필요
    deg = 90;
    break;
    case 6:
    deg = 90;
    break;
    case 7: //확인필요
    deg = 90;
    break;
    case 8:
    deg = 270;
    break;
    default: deg = 0;
  }
  return deg;
};

global.fn_upLoadeS3Image = function(imgInfo, folderName){
  var imgsInfo = [];
  if(_.isArray(imgInfo)){
    imgsInfo = imgInfo;
  } else {
    imgsInfo.push(imgInfo);
  }

  _.each(imgsInfo, function(item){
    var realPath = item.data.substring(item.data.indexOf("data"));

    var path = '';
    if(item.type){
      path = folderName +'/' + item.fileName + '_'+ item.type +'.' + item.extension;
    } else {
      path = folderName +'/' + item.fileName + '.' + item.extension;
    }

    var s3Bucket = new AWS.S3();

    var buf = new Buffer(realPath.replace(/^data:image\/\w+;base64,/, ""),'base64');
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
};

global.toDecimal = function (number) {
  return number[0].numerator + number[1].numerator /
  (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
};

/*
* @ scroll시 head 메뉴 영역을 변경하기 위한 function
* ex) global.tranceHeadMenu
*/
global.tranceHeadMenu = function(){
  if(this.mcs.top < -30){
    $('.timeline-menuContainer').addClass('scrolling');
    $('.timeline_header').slideUp();
    $('.timeline-qna').slideUp();
    $('.timeline-filter').addClass('scrolling');
    $('.content.left').css({'padding-bottom':'65px', 'margin-bottom':'-65px' } );
    $('.logo-slogun').hide();
    $('.gnb').addClass('scrolling');
    $('#gnbList').hide();
  }else{
    $('.timeline-menuContainer').removeClass('scrolling');
    $('.timeline_header').slideDown();
    $('.timeline-qna').slideDown();
    $('.timeline-filter').removeClass('scrolling');
    $('.content.left').css( {'padding-bottom':'145px', 'margin-bottom':'-145px' } );
    $('.logo-slogun').show();
    $('.gnb').removeClass('scrolling');
    $('#gnbList').show();
  }
};

/*
* @ lifemap detail 이동 function()
* requestTemplate = {postId: 'string', type: 'BS','TC'....}
*/
global.fn_replaceLifeViewDetail = function(requestTemplate, pageType){
  var templateData = {};
  var sessionName = 'endingNoteList templateData';
  var parentViewId = '';
  if (pageType === 'ihLifeView') {
    sessionName = 'ihLifeView templateData';
    parentViewId = 'inheritanceContents';
  }
  if(requestTemplate.type == 'BS'){
    var requestData = [];
    requestData.push(requestTemplate);
    Meteor.call('getClickedImgDatas',requestData, function(error, result){
      if(error){
        console.error(error);
      }
      if(result){
        if(result.length === 1){  //BS일경우
          templateData.headerTmp = 'endingNoteListHeaderBucketList';
          templateData.contentTmp = 'bucketDetail';
          templateData.data = {
            _id : result[0].postId,
            subId : result[0]._id
          };
        }
        console.log("getClick",result);
        templateData.data.lifeViewDataList = requestTemplate.lifeViewDataList;
        templateData.data.lifeViewOriginData = requestTemplate.lifeViewOriginData;
        templateData.data.fromView = requestTemplate.fromView;
        templateData.data.parentViewId = parentViewId;
        Session.set(sessionName, null);
        setTimeout(function(){
          Session.set(sessionName, templateData);
        }, 100);
      }
    });
  }else{
    var _id = requestTemplate.postId;
    templateData.contentTmp = 'imDetail';
    templateData.data = {
      _id : _id,
    };
    switch(requestTemplate.type){
      case 'IM':
      templateData.headerTmp = 'endingNoteListHeaderIm';
      templateData.contentTmp = 'imDetail';
      break;
      case 'BL':
      templateData.headerTmp = 'endingNoteListHeaderBucketList';
      templateData.contentTmp = 'bucketDetail';
      break;
      case 'TC':
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleDetail';
      break;
    }
    templateData.data.lifeViewDataList = requestTemplate.lifeViewDataList;
    templateData.data.lifeViewOriginData = requestTemplate.lifeViewOriginData;
    templateData.data.fromView = requestTemplate.fromView;
    templateData.data.parentViewId = parentViewId;

    Session.set(sessionName, null);
    setTimeout(function(){
      Session.set(sessionName, templateData);
    }, 100);
  }

};

global.fn_getBirthDay = function(userId){
  var result = '';
  var userInfo = Meteor.users.find({username: userId}).fetch()[0];
  if (userInfo) {
    return userInfo.profile.birthday.date ? userInfo.profile.birthday.date : undefined;
  }
};

global.fn_getCalDate = function(_date, _day, _type){
  var date = new Date(_date);
  switch(_type){
    case 'SUM' : //더하기
    date.setDate(date.getDate() + _day);
    break;
    case 'SUB' : //빼기
    date.setDate(date.getDate() - _day);
    break;
  }
  return date.toISOString();
};

global.fn_getCalDateByMonth = function(_date, _month, _type){
  var date = new Date(_date);
  switch(_type){
    case 'SUM' : //더하기
    date.setMonth(date.getMonth() + _month);
    break;
    case 'SUB' : //빼기
    date.setMonth(date.getMonth() - _month);
    break;
  }
  return date.toISOString();
};

global.fn_getCalDateByYear = function(_date, _year, _type){
  var date = new Date(_date);
  switch(_type){
    case 'SUM' : //더하기
    date.setYear(date.getFullYear() + _year);
    break;
    case 'SUB' : //빼기
    date.setYear(date.getFullYear() - _year);
    break;
  }
  return date.toISOString();
};
//대문자 만들기
global.fn_toUpperCase = function(_string){
  var result = _string.toUpperCase();
  return result;
};

//소문자만들기
global.fn_toLowerCase = function(_string){
  var result = _string.toLowerCase();
  return result;
};

//인덱스 이용해서 문장, 글자 일부발최하기
global.fn_getSubstring = function(_string, _startIndex, _count){
  var result = _string.substring(_startIndex,_count);
  return result;
};
// 엔터값 <br/>로 전환
global.fn_enter = function(content) {
  if (content) {
    var str = content.replace(new RegExp('\n','g'), "<br/>");
    return str;
  }
};

global.fn_listHeightResize = function(ids){
  var eHeight = 70;
  var eDefault = 50;
  var ePadding = 20;
  $(ids).each(function(i){
    var qObj = $(this).find('.timeline-question');
    var aObj = $(this).find('.timeline-answer');
    var qHeight = qObj.height();
    var aHeight = aObj.height();
    var tHeight = 0;
    if( qHeight !== null && qHeight >= aHeight){
      tHeight = qHeight + ePadding;
      $(this).height(tHeight);
    }else if(aHeight !== null && aHeight >= qHeight){
      tHeight = aHeight + ePadding;
      $(this).height(tHeight);
    }else{
      tHeight = eDefault + ePadding;
      $(this).height(tHeight);
    }
  });
};

//###################################################################################################################################
//###################################################### CODE & DEFAULT DATA ########################################################
//###################################################################################################################################

// //로그인한 사용자 정보
global.login = {
  userId : '', // 로그인 UserId
  nickName : '', // test용 별명
  pageOwner : '', // 페이지 권한(내 페이지와, 다른사람의 페이지 구분)
  authority : ''  // 권한
};

//###################################################################################################################################
//###################################################### UTILITY ####################################################################
//###################################################################################################################################

//자주 사용하는 함수를 정의
//'util'을 preFix로 사용함

// ex)
// utilExample = function(after, before) {
//  var result = _.isEqual(after, before);
//  return result;
// };


// 2017. 1. 4. 오후 4:27:02
// 2017-01-03 15:05:10


global.utilGetDate = function(date) {
  if (_.isUndefined(date) || _.isNull(date) || _.isEmpty(date)) {
    if(Meteor.isClient){
      if(!TimeSync.isSynced()){
        TimeSync.resync();
      } else {
        date = Deps.nonreactive(function(){
          return new Date(TimeSync.serverTime()).toISOString();
        });
      }
    } else {
      date = new Date().toISOString();
    }
  }
  return {
    default: date,
    defaultHMS: new Date(date).format('yyyy-MM-dd HH:mm:ss'),
    defaultYMD: new Date(date).format('yyyy-MM-dd'),
    defaultYM : new Date(date).format('yyyy-MM'),
    defaultYMDdot: new Date(date).format('yyyy.MM.dd'),
    defaultYMdot: new Date(date).format('yyyy.MM'),
    kor: new Date(date).format('yyyy년 MM월 dd일 HH:mm:ss'),
    korYMD: new Date(date).format('yyyy년 MM월 dd일'),
    hm: new Date(date).format('HH:mm'), // 시/분
    md: new Date(date).format('MM-dd')
  };
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};
Date.prototype.format = function(f) {
  if (!this.valueOf()) return undefined;

  var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  var d = this;

  return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
    switch ($1) {
      case "yyyy": return d.getFullYear();
      case "yy": return (d.getFullYear() % 1000).zf(2);
      case "MM": return (d.getMonth() + 1).zf(2);
      case "dd": return d.getDate().zf(2);
      case "E": return weekName[d.getDay()];
      case "HH": return d.getHours().zf(2);
      case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
      case "mm": return d.getMinutes().zf(2);
      case "ss": return d.getSeconds().zf(2);
      case "a/p": return d.getHours() < 12 ? "오전" : "오후";
      default: return $1;
    }
  });
};

// froala editor upload files to S3(AWS)
global.utilFroalaUpload = function(folderPath) {
  var crypto = require('crypto');

  var expiration = moment.utc(moment().add(2, 'days')).toISOString();
  var metaDate = moment().format('YYYYMMDD');
  var metaCredential = S3.config.key+ '/' + moment().format('YYYYMMDD') +'/' + S3.config.region + '/s3/aws4_request';
  var metaStartsWithPath = folderPath + '/';
  var metaAcl = 'public-read';
  //var acl = 'private';

  var policy = {
    'expiration': expiration,
    'conditions': [
      {'bucket': S3.config.bucket},
      {'acl': metaAcl},
      {'success_action_status': '201'},
      {'x-requested-with': 'xhr'},
      {'x-amz-algorithm': 'AWS4-HMAC-SHA256'},
      {'x-amz-credential': metaCredential},
      {'x-amz-date': metaDate + 'T000000Z'},
      ['starts-with', '$key', metaStartsWithPath],
      ['starts-with', '$Content-Type', '']// # Accept all files.
    ]
  };

  var policy64 = new Buffer(JSON.stringify(policy), 'utf-8').toString('base64');

  // generate signing key
  var kDate = crypto.createHmac('sha256', "AWS4" + S3.config.secret).update(metaDate).digest('');
  var kRegion = crypto.createHmac('sha256', kDate).update(S3.config.region).digest('');
  var kService = crypto.createHmac('sha256', kRegion).update('s3').digest('');
  var kSigning = crypto.createHmac('sha256', kService).update("aws4_request").digest('');

  // generate signature.V4
  var signature = crypto.createHmac("sha256", kSigning).update(policy64).digest("hex");

  // build the results object
  var s3Credentials = {
    s3Policy: policy64,
    s3Signature: signature,
    s3Credentials : metaCredential,
    s3Date : metaDate + 'T000000Z'
  };

  // return S3 signature and policy for client or server to use
  return s3Credentials;
};

//모달팝업 호출 시 사용
global.utilModalOpen = function(e, obj) {
  Template.modal.__helpers.get('modalRequest')(e, obj); // modal 템플릿의 헬퍼를 호출 (template) 템플릿이름을 파라미터값으로 넘김
};
// alert호출
global.utilAlert = function(message, target) {
  swal({
    title: target ? global.fn_toUpperCase(target) : 'ALERT',
    type: target ? target : 'warning',
    text : message,
    allowOutsideClick: false,
    customClass:'popup-alert',
    confirmButtonText: '확인',
    showCloseButton:true
  });
};

// confirm 호출
// 사용법 global.utilConfirm(message).then(function(val) { if (val) -->> 로직시작 } )
global.utilConfirm = function(message, target, button) {
  if (!button) {
    button = {
      confirm: '확인',
      cancel: '취소'
    };
  }
  return new Promise(function(resolve, reject) {
    if (!target) {
      target = 'question';
    }
    swal({
      title: 'Confirm',
      type: target,
      html : message,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: button.confirm,
      cancelButtonText: button.cancel,
      customClass:'popup-confirm',
      showCloseButton:true
    }).then(function(result) {
      resolve(result);
    }, function(dis) {
      if(dis){
        reject(dis);
      }
    });
  });
};

// 두 날짜사이에 속해있는지 확인 polyLine용도 (returnType : boolen)
global.utilIsContainDateforPoly = function(from, to, homeFrom, homeTo, periodFrom, priodTo) {
  var sFrom = Date.parse(from); //회사, 학교 From
  var sTo = Date.parse(to); //회사, 학교 To
  var hFrom = Date.parse(homeFrom); // 집 From
  var hTo = Date.parse(homeTo); // 집 To
  var pFrom = Date.parse(periodFrom); //검색기간 From
  var pTo = Date.parse(priodTo); //검색기간 To

  if(sFrom > hTo || sTo < hFrom) {
    return false;
  }

  if((pFrom <= hTo && pFrom <= sTo) && (pTo >= hFrom && pTo >= sFrom)) {
    return true;
  }

  return false;
};

// 두 날짜사이에 속해있는지 확인 (returnType : boolen)
global.utilIsContainDate = function(from, to, periodFrom, priodTo) {
  var sFrom = Date.parse(from); // From
  var sTo = Date.parse(to); // To
  var pFrom = Date.parse(periodFrom); //검색기간 From
  var pTo = Date.parse(priodTo); //검색기간 To

  if(pFrom > sTo || pTo < sFrom) {
    return false;
  }
  return true;
};

// 특정시점의 나이 구하기
global.utilGetPastAge = function(birthday, pastDate) {
  var years = 0;
  //pastdate 이 빈 object 일때 (에러방어코딩)
  if(typeof(pastDate)!=="string" && !pastDate.hasOwnProperty()){
    pastDate = birthday;
  }

  if (birthday) {
    var birthdayDate = new Date(birthday);
    var enddayDate = new Date(pastDate.replace(".","-"));

    years = enddayDate.getFullYear() - birthdayDate.getFullYear();

    // // 현재 년도에서 생일을 재설정
    // birthdayDate.setFullYear(enddayDate.getFullYear());
    // // 생일이 지났으면 -1
    // if(enddayDate < birthdayDate) {
    //   years --;
    // }
  }

  return years + 1;
};

// 문자열 특정숫자만큼 자르기
global.utilEllipsis = function(str, maxLen) {
  if (str.length > maxLen) {
    str = str.substring(0, maxLen) + '...';
  }
  return str;
};

// Validation 체크
global.utilValidation = function(t) {
  var returnFlag = true;
  var input = t.findAll('input');
  var select = t.findAll('select');
  var textarea = t.findAll('textarea');

  var targetList = [].concat(input, select, textarea);

  Array.prototype.map.call(targetList, function(targets) {
    if (Boolean(targets.required) && returnFlag) {
      if(targets.type === 'checkbox') {
        if (!targets.checked) {
          returnFlag = false;
          targets.focus();
          return global.utilAlert(targets.title);
        }
      } else {
        if (!targets.value) {
          returnFlag = false;
          targets.focus();
          return global.utilAlert(targets.title);
        }
      }
    }
  });

  return returnFlag;
};

// 글등록 -> (timeline & history) Collection insert
global.utilTimelineRegister = function(postId, userId, type, startDay, endDay, isGroup) {
  var timelineArr = [];
  var firstPosition = 1;
  var isInsertHistory = true;
  var count = 2;
  if (type === global.pageType.bucketList || type === global.pageType.timeCapsule) {
    count = 3;
  }

  if(type === global.pageType.im || type === global.pageType.bucketStory || type === global.pageType.me || type === global.pageType.lifeTrace){
    isGroup = false;
  }

  //히스토리를 등록하지 않는 타입을 여기에 정의한다.
  // if(_.isEqual(type, 'LT') || _.isEqual(type, 'ME') || _.isEqual(type, 'BS') || _.isEqual(type, 'BP') || _.isEqual(type, 'WM') || _.isEqual(type, 'FT')){
  //   firstPosition = 1;
  //   isInsertHistory = false;
  // }

  var thisTime = global.utilGetDate().default;
  for (var i = firstPosition; i < count; i++) {
    var timelineObj = {
      postId: postId,
      userId: userId,
      timeClass: 'start',
      updateDate: thisTime,
      regDate: thisTime,
      isGroup : isGroup
    };
    switch(i) {
      case 0:
      timelineObj.contentType = 'H';
      timelineObj.type = type;
      timelineObj.timeClass = 'start';
      timelineObj.timelineDate = global.utilGetDate().defaultYMD;
      timelineObj.sort = 2;
      break;
      case 1:
      timelineObj.contentType = 'E';
      timelineObj.type = type;
      timelineObj.timeClass = 'start';
      timelineObj.timelineDate = startDay ? global.utilGetDate(startDay).defaultYMD : '';
      timelineObj.sort = 1;
      break;
      case 2:
      timelineObj.contentType = 'E';
      timelineObj.type = type;
      timelineObj.timeClass = 'end';
      timelineObj.timelineDate = endDay ? global.utilGetDate(endDay).defaultYMD : '';
      timelineObj.sort = 1;
      break;
    }
    timelineArr.push(timelineObj);
  }
  Meteor.call('enTimelineInsert', timelineArr);
  // if (!historyType) {
  //   historyType = 'WR';
  // }
  //히스토리 컬렉션 등록
  // var historyObj = {
  //   postId: postId,
  //   typeKey: postId,
  //   commentKey: '',
  //   userId: userId,
  //   postType: type,
  //   type: historyType,
  //   user: '',
  //   timelineDate: global.utilGetDate().defaultYMD,
  //   updateDate: global.utilGetDate().default
  // };
  //
  // if(isInsertHistory) {
  //   setTimeout(function() {
  //     Meteor.call('enHistoryUpsert', null, historyObj);
  //   }, 100);
  // }
};

// 히스토리 글등록 추가하기
global.utilHistoryWrite = function(obj, crud) {
  var historyMethod = null;
  var historyObj = {};
  if (crud === 'insert') {
    historyMethod = 'enHistoryInsert';
    historyObj = {
      postId: obj.postId,
      typeKey: obj.subPostId,
      commentKey: '',
      userId: obj.postUser,
      postType: obj.postType,
      type: 'WR',
      user: obj.user,
      timelineDate: global.utilGetDate().defaultYMD,
      regDate: global.utilGetDate().default,
      updateDate: global.utilGetDate().default
    };
  } else if (crud === 'remove') {
    historyMethod = 'enHistoryDelete';
    historyObj = {
      typeKey: obj.subPostId
    };
  }

  var timelineObj = [{
    userId: global.login.userId,
    contentType: 'H',
    timeClass: 'start',
    timelineDate: global.utilGetDate().defaultYMD
  }];

  if (crud !== 'remove') {
    Meteor.call('enTimelineUpdate', obj.postId, timelineObj);
  }
  setTimeout(function() {
    Meteor.call(historyMethod, obj.postId, historyObj);
  }, 100);
};

// 히스토리 좋아요 추가하기
global.utilHistoryLike = function(postId, postUser, likeUser, likeFlag, parentPostId, postType, title) {
  if (!parentPostId) {
    parentPostId = postId;
  }
  var historyObj = {
    postId: postId,
    typeKey: parentPostId,
    commentKey: '',
    userId: postUser,
    postType: postType,
    type: 'LK',
    user: likeUser,
    timelineDate: global.utilGetDate().defaultYMD,
    regDate: global.utilGetDate().default,
    updateDate: global.utilGetDate().default
  };
  var historyMethod = null;
  if (likeFlag) {
    // 이미 좋아요하는경우에는 히스토리에서 좋아요 삭제
    historyMethod = 'enHistoryDelete';
    delete historyObj.timelineDate;
    delete historyObj.regDate;
    delete historyObj.updateDate;
  } else {
    historyMethod = 'enHistoryInsert';

    // 좋아요 알림
    if (postUser !== global.login.userId) {
      var options = {
        userId : likeUser,
        title: title
      };
      if (postType === 'BS') {
        postId = parentPostId;
      }
      Meteor.call('setNoti', postUser, postType, postId, 'like', options);
    }
  }

  // Meteor.call(historyMethod, postId, historyObj, function(error) {
  //   if (error) {
  //     return alert(error);
  //   } else {
  //     var timelineObj = [{
  //       userId: postUser,
  //       contentType: 'H',
  //       timeClass: 'start',
  //       timelineDate: global.utilGetDate().defaultYMD
  //     }];
  //     Meteor.call('enTimelineUpdate', postId, timelineObj);
  //   }
  // });
};

// 히스토리 댓글 추가하기 = 로그 및 알림 추가하기
global.utilHistoryComment = function(obj, crud) {
  var historyObj = {};
  var meteorMethod = null;
  if (crud === 'insert' || crud === 'insert_sub') {
    meteorMethod = 'enHistoryInsert';
    historyObj = {
      postId: obj.postId,
      typeKey: obj.typeKey,
      commentKey: obj.commentKey,
      userId: obj.postUserId, // 댓글이 달린 글의 주인
      postType: obj.type,
      type: 'CM',
      user: obj.userId, // 댓글을 단사람
      timelineDate: global.utilGetDate().defaultYMD,
      regDate: global.utilGetDate().default,
      updateDate: global.utilGetDate().default
    };
    // 알림 추가(글유저와 댓글유저가 다를때만 알림)
    if (obj.postUserId !== obj.userId || crud === 'insert_sub') {
      var notifiUser = obj.postUserId;
      if (crud === 'insert_sub') {
        notifiUser = obj.replyUserId;
      }
      var options = {
        userId : obj.userId,
        title: obj.title
      };
      var comment = crud === 'insert' ? 'comment': 'subComment';
      if (obj.type === 'BS') {
        obj.postId = obj.typeKey;
      }
      Meteor.call('setNoti', notifiUser, obj.type, obj.postId, comment, options);
    }
  }
  // else {
  //   meteorMethod = 'enHistoryDelete';
  //   historyObj = {
  //     postId: obj.postId,
  //     commentKey: obj.cmtKey
  //   };
  // }
  // var timelineObj = [{
  //   userId: obj.postUserId,
  //   contentType: 'H',
  //   timeClass: 'start',
  //   timelineDate: global.utilGetDate().defaultYMD
  // }];
  //
  // Meteor.call(meteorMethod, obj.postId, historyObj, function(error) {
  //   if (error) {
  //     return alert(error);
  //   } else {
  //     if (crud !== 'remove') {
  //       Meteor.call('enTimelineUpdate', obj.postId, timelineObj);
  //     }
  //   }
  // });
};

// 히스토리 데이터 추가하기
global.utilHistoryInsert = function(obj) {
  var timelineObj = {
    userId: obj.userId,
    contentType: 'H',
    timeClass: 'start',
    timelineDate: global.utilGetDate().defaultYMD
  };

  // Meteor.call('enTimelineUpdateOne', obj.postId, timelineObj);
  // Meteor.call('enHistoryInsert', obj.postId, obj);
};

// 히스토리 데이터 삭제하기
global.utilHistoryDelete = function(obj) {
  Meteor.call('enHistoryDelete', obj.postId, obj);
};

// 유저 닉네임 가져오기
global.utilGetNickName = function(userId) {
  var userInfo = Meteor.users.find({username: userId}).fetch()[0];
  if (userInfo) {
    return userInfo.profile.nickName;
  }
};

global.utilGetUsersInfo = function(userIds, searchOption){
  var selectedField = {};
  if(searchOption){
    for(var i=0 ; i<searchOption.length ; i++){
      selectedField[searchOption[i]] = 1;
    }
  } else {
    // console.error('option은 필수 요소 입니다.');
    return;
  }
  return Meteor.users.find({username: {$in:userIds}},{fields:selectedField}).fetch();
};

// 글자수 자르기
global.utilStrCut = function(str, len) {
  if (str && len < str.length) {
    str = str.substring(0, len) + '...';
  }
  return str;
};

// 태그 제거
global.utilTagRemove = function(content) {
  if (content) {
    var str = content.replace(/(<([^>]+)>)/gi, "");
    return str;
  }
};

// 템플릿이동
global.utilTemplateMove = function(header, content, data) {
  var template = {
    headerTmp: header
  };
  Session.set('endingNoteList templateData', template);

  setTimeout(function(){
    var templateData = {
      headerTmp: header,
      contentTmp: content,
      data: data
    };
    setTimeout(function() {
      Session.set('endingNoteList templateData', templateData);
    });
  }, 100);
};

// 버킷스토리 -> 추억이동
global.utilMoveStory = function(postId, parentPostId, timelineObj, historyObj, title) {
  Meteor.call('enHistoryMoveStoryTimeline', postId, parentPostId, timelineObj, function(error) {
    if (error) {
      return alert(error);
    } else {
      Meteor.call('enHistoryMoveStoryHistory', postId, parentPostId ,historyObj);
      Meteor.call('deleteLog', null, null, postId, null, null, function(error, result){
        if(error) {
          return console.log(error);
        } else {
          Meteor.call('setLog', parentPostId, postId, global.login.userId, global.login.userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketStoryComment, 'bucketStoryDelete', title); //버킷리스트의 히스토리란에 해당 버키스토리 기록을 모두 삭제
        }
      }); //버킷리스트의 히스토리란에 해당 버키스토리 기록을 모두 삭제
    }
  });
};

// template의 데이터 find Array형태로 가져오기
global.utilGetFormDataArray = function(template, flag) {
  var arrayData = [];
  var result = {};
  var text = template.findAll('input[type="text"]');
  var hidden = template.findAll('input[type="hidden"]');
  var checkbox = template.findAll('input[type="checkbox"]');
  var radio = template.findAll('input[type="radio"]');
  var select = template.findAll('select');
  var textarea = template.findAll('textarea');

  Array.prototype.map.call(text, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(hidden, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(checkbox, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(radio, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(select, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(textarea, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });


  var keys = Object.keys(result);
  if (flag === undefined) {
    flag = true;
  }

  if (keys.length > 0 && flag) {
    var cnt = result[keys[0]].length;
    // var keys = Object.keys(result);
    for (var i = 0; i < cnt; i++) {
      var array = {};
      for (var j = 0; j < keys.length; j++) {
        if (result[keys[j]][i]) {
          array[keys[j]] = result[keys[j]][i];
        } else {
          array[keys[j]] = null;
        }
      }
      arrayData.push(array);
    }
    return arrayData;
  } else {
    return result;
  }
};

// template의 데이터 find Array형태로 가져오기
global.utilGetChlidrenDataArray = function(target, flag) {
  var arrayData = [];
  var result = {};
  var text = target.find('input[type="text"]');
  var hidden = target.find('input[type="hidden"]');
  var checkbox = target.find('input[type="checkbox"]');
  var radio = target.find('input[type="radio"]');
  var select = target.find('select');
  var textarea = target.find('textarea');

  Array.prototype.map.call(text, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(hidden, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(checkbox, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(radio, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(select, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  Array.prototype.map.call(textarea, function(targets) {
    if (typeof(result[targets.name]) !== typeof([])) {
      result[targets.name] = [];
    }
    result[targets.name].push(targets.value);
  });
  var keys = Object.keys(result);
  if (flag === undefined) {
    flag = true;
  }

  if (keys.length > 0 && flag) {
    var cnt = result[keys[0]].length;
    // var keys = Object.keys(result);
    for (var i = 0; i < cnt; i++) {
      var array = {};
      for (var j = 0; j < keys.length; j++) {
        if (result[keys[j]][i]) {
          array[keys[j]] = result[keys[j]][i];
        } else {
          array[keys[j]] = null;
        }
      }
      arrayData.push(array);
    }
    return arrayData;
  } else {
    return result;
  }
};

// 달력 시작일 종료일 체크하기
global.utilCalendarBetween = function(start, end) {
  var result = false;

  if (start && end) {
    if (new Date(start).getTime() > new Date(end).getTime()) {
      result = true;
    }
  }
  return result;
};

// 아이디 정규식 체크
global.utilUserIdCheck = function(userId) {
  var result = false;
  var regType = /^[A-Za-z0-9+]{4,12}$/; // 영문 또는 숫자만 가능 4~12자리
  if (regType.test(userId)) {
    result = true;
  }
  return result;
};

// 패스워드 정규식 체크
global.utilPasswordCheck = function(password) {
  var result = false;
  var regType = /^.*(?=.{8,30})(?=.*[0-9])(?=.*[a-zA-Z]).*$/; // 8 ~ 30자리 영문+숫자혼합
  if (regType.test(password)) {
    result = true;
  }
  return result;
};

// 이메일 정규식 체크
global.utilEmailCheck = function(email) {
  var result = false;
  var regExp = /[0-9a-zA-Z][_0-9a-zA-Z-]*@[_0-9a-zA-Z-]+(\.[_0-9a-zA-Z-]+){1,2}$/;
  if (email.match(regExp)) {
    result = true;
  }
  return result;
};

// 암호화 & 복호화
global.utilAES = function(message, type) {
  var result = null;
  var password = '050812';
  var hashedPassword = CryptoJS.SHA256(password).toString();

  switch(type) {
    // 암호화
    case 'encrypt':
    var encrypt = CryptoJS.AES.encrypt(message, hashedPassword);
    // url의 '/'를 없애기 위한 base64로 변경이후 url에 표시
    var wordArray = CryptoJS.enc.Utf8.parse(encrypt);
    result = CryptoJS.enc.Base64.stringify(wordArray);
    break;
    // 복호화
    case 'decrypted':
    // base64를 복호화한뒤 message를 AES 256복호화 작업
    var parsedWordArray = CryptoJS.enc.Base64.parse(message);
    parsedWordArray = parsedWordArray.toString(CryptoJS.enc.Utf8);
    var decrypt = CryptoJS.AES.decrypt(parsedWordArray, hashedPassword);
    result = decrypt.toString(CryptoJS.enc.Utf8);
    break;
  }
  return result;
};

// 글씨 strong태그 추가
global.utilStrong = function(title) {
  var result = '';
  if (title) {
      result = '<strong>' + title + '</strong>';
  }
  return result;
};

export {global};
