// global = {};
//
// Meteor.global2 = function(_name, _params){
//  fn_test = function(id, type, calbacksOption){
//    var a = 'aaa';
//    return a;
//  };
//
//  fn_test2 = function(id, type, calbacksOption){
//    var a = 'aaa';
//    return a;
//  };
// };
// //function
// //set
// //get
// //del
// //upd
//
// //utility
// //set
// //get
// //del
// //upd
//
// //#####################################################################################
// // 글로벌 함수
// //#####################################################################################
// /**
// * @ 스크롤바를 사용자 스타일로 변환한다.
// * param1 : <Selector> id or class selector
// * param2 : <Sring> type
// * ex)global.fn_customerScrollBarInit(id)
// */
//
// //customer scroll
// global.fn_customerScrollBarInit = function(id, type, callbacksOption){
//   id.mCustomScrollbar({
//     theme : type,
//     live : false,
//     scrollInertia : 0,
//     alwaysShowScrollbar: 1,
//     mouseWheel : {
//       enable : true,
//       axis : "y",
//       scrollAmount : 45
//       // preventDefault : false,
//       // deltaFactor : "auto",
//       // normalizeDelta : false,
//       // invert : false,
//       // disableOver : ["select","option","keygen","datalist","textarea"]
//     },
//     advanced:{
//       autoScrollOnFocus: false,
//       updateOnContentResize: true
//     },
//     callbacks : callbacksOption
//   });
// };
// global.fn_heightResizing = function(target){
//   $(target).css({'height':($(document).height())+'px'});
//   $(window).resize(function(){
//       $(target).css({'height':($(document).height())+'px'});
//   });
// };
//
// global.fn_setTop = function(targetElement){
//   setTimeout(function(){
//     targetElement.mCustomScrollbar('scrollTo',"2");
//     // targetElement.mCustomScrollbar('scrollTo',"top");
//   }, 10);
// };
//
// /*
// * @ inputbox width리사이징을 위한 function
// * param1 : <Event> selector
// * ex)global.inputResizing(e.target)
// */
// global.fn_inputResizing = function(target){
//   $('body').append('<span class="new_width">'+$(target).val()+'</span>');
//   var textWidth = $('.new_width').width();
//   $(target).width(textWidth);
//   $('.new_width').remove();
// };
//
// /*
// * @ textarea height 리사이징을 위한 function
// * param1 : <Event> selector
// * ex)global.fn_textareaResizing(e.target)
// */
// global.fn_textareaResizing = function(target){
//   var tagetWidth = $(target).width()+45;
//   $('body').append('<div class="new_height" style="position:absolute; top:0; width:'+tagetWidth+'px; min-height:26px; padding-right:48px; line-height:26px;">'+$(target).val()+'</div>');
//   var textHeight = $('.new_height').height() - 1;
//   $(target).height(textHeight);
//   $('.new_height').remove();
// };
// /*
// * @ timeline textarea height 리사이징을 위한 function
// * param1 : <Event> selector
// * ex)global.fn_timeLineInputResizing(e.target)
// */
// global.fn_timeLineInputResizing = function(target){
//   $('body').append('<div class="new_timeline" style="position:absolute; top:0; min-width:40px; max-width:200px; min-height:17px; line-height:20px;">'+$(target).val()+'</div>');
//   var textWidth = $('.new_timeline').width()+8;
//   var textHeight = $('.new_timeline').height();
//   $(target).width(textWidth);
//   $(target).height(textHeight);
//   $('.new_timeline').remove();
// };
//
// /*
// * @ 현재 다른 사용자의 페이지를 방문중이지 확인
// * param1 : <String> selector
// * return : <boolen>
// * ex)global.fn_checkPageOwner('testUser');
// */
// global.fn_checkPageOwner = function(userId){
//   if(_.isEqual(userId, global.login.userId)){
//     return true;
//   }
//   else {
//     return false;
//   }
// };
//
// /*
// * @ 다른 사용자 페이지 방문 시 pageOwner값 설정
// * param1 : <String> selector
// * ex)global.fn_setPageOwner('testUser');
// */
// global.fn_setPageOwner = function(userId){
//   global.login.pageOwner = userId;
// };
//
// /*
// * @ custom select function
// * param1 : <Event> selector
// * param2 : <String> type class
// * ex)global.fn_selectPicker('.selectpicker', 'btn-info', '100px')
// */
// global.fn_selectPicker = function(_target, _type){
//   $(_target).selectpicker({
//     style: _type
//   });
// };
//
//
// /*
// * @ custom select function
// * param1 : <Event> selector
// * param2 : <String> type class
// * ex)global.fn_selectPicker('.selectpicker', 'btn-info', '100px')
// */
// global.fn_tableParse = function(){
//   var rowWidth = $('.tr:first').width();
//   var colWidth = $('.td:first').width();
//   var marginRight = colWidth - rowWidth + 20;
//   $('.td.colspan').css('margin-right', marginRight + 'px').show();
// };
//
// /*
// * @ 항목이 값을 갖고 있는지 확인
// * param1 : <object> selector
// * ex)global.fn_isExist(object);
// */
// global.fn_isExist = function(target) {
//   if(target){
//     var type = Object.prototype.toString.call(target);
//     switch(type){
//       case "[object Object]":
//         //빈 object?
//         if(Object.getOwnPropertyNames(target).length === 0){
//           return false;
//         }else{
//           return true;
//         }
//       break;
//       case "[object Array]":
//         //빈 array???
//         if(target.length === 0){
//           return false;
//         }else{
//           for(var i in target ){
//             if(target[i]){
//               if(Object.prototype.toString.call(target[i])==="[object Object]" && Object.getOwnPropertyNames(target).length === 0){
//                 return false;
//               }
//               return true;
//             }
//           }
//           return false;
//         }
//       break;
//       default:
//         return true;
//     }
//   } else {
//     return false;
//   }
// };
//
// global.fn_getName = function(userId) {
//   var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   if (userInfo) {
//     return userInfo.profile.name;
//   } else {
//     return userId;
//   }
// };
//
//
// global.fn_getNickName = function(userId) {
//   // var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   // if (userInfo) {
//   //   return userInfo.profile.nickName;
//   // }
//   if (!userId) {
//     userId = global.login.userId;
//   }
//   var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   if (userInfo) {
//     return userInfo.profile.nickName;
//   }else{
//     return userId;
//   }
// };
//
//
// global.fn_getUsersIdByNick = function(nickName) {
//   var result = [];
//   var regexNickName = new RegExp(["^.*", nickName, ".*"].join(""), "gi");
//   var usersInfo = Meteor.users.find({'profile.nickName': regexNickName}).fetch();
//   _.each(usersInfo, function(info){
//     result.push(info.username);
//   });
//
//   return result;
// };
//
// global.fn_getEmail = function(userId) {
//   if (!userId) {
//     userId = global.login.userId;
//   }
//   var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   if (userInfo) {
//     return userInfo.profile.email;
//   }else{
//     return userId;
//   }
// };
//
// //
// global.fn_getUserInfo = function(userId) {
//   var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   if (userInfo) {
//     return userInfo.profile;
//   }
// };
//
// global.fn_setLoginId = function(userId){
//   global.login.userId = userId;
//   global.login.pageOwner = userId;
// };
//
// //이미지 사이즈별 스트링 만들기
// global.fn_makeImageString = function(imagePath, type) {
//   var result = '';
//   if(type){
//     if(imagePath.indexOf('_originRe') > -1){
//       result = imagePath.substring(0, imagePath.lastIndexOf('_originRe'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
//     }
//     else if (imagePath.indexOf('_thumb') > -1) {
//       result = imagePath.substring(0, imagePath.lastIndexOf('_thumb'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
//     } else {
//       result = imagePath.substring(0, imagePath.lastIndexOf('.'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
//     }
//   } else {
//     result = imagePath;
//   }
//   return result;
// };
//
// //프로필 이미지 스트링 만들기 by userId(type : thumb, originRe)
// global.fn_getUsersProfileImageString = function(userId, type) {
//   var result = '';
//   var userInfo = Meteor.users.find({username: userId},{fields:{'profile.profileImg':1}}).fetch()[0];
//   if(userInfo && userInfo.profile.profileImg){
//     var profileImg = userInfo.profile.profileImg;
//     if(type){
//       result = global.s3.bucketPath + profileImg.substring(0, profileImg.lastIndexOf('.'))+ '_' + type + profileImg.substring(profileImg.lastIndexOf('.'));
//     } else {
//       result = global.s3.bucketPath + profileImg;
//     }
//   }
//   return result;
// };
//
// //프로필 이미지 스트링 만들기 by profilePath (type : thumb, originRe)
// global.fn_makeProfileImgString = function(_profilePath, _type) {
//   var result = '';
//   if(_profilePath){
//     if(_type){
//       result = global.s3.bucketPath + _profilePath.substring(0, _profilePath.lastIndexOf('.'))+ '_' + _type + _profilePath.substring(_profilePath.lastIndexOf('.'));
//     } else {
//       result = global.s3.bucketPath + _profilePath;
//     }
//   }
//   return result;
// };
//
// global.fn_setS3UploadInfo = function(folderPath){
//   var editorUploadInfo = global.utilFroalaUpload(folderPath);
//   global.editorSettings.imageUploadToS3 = {
//     bucket: 'iml-images',
//     region: 's3-ap-northeast-2', //'s3-website-us-east-1', //us-east-1
//     keyStart: folderPath + '/',
//     callback: function (url, key) {
//
//     },
//     params: {
//       'acl': 'public-read',
//       'policy': editorUploadInfo.s3Policy,
//       'x-amz-signature': editorUploadInfo.s3Signature,
//       'x-amz-algorithm': 'AWS4-HMAC-SHA256',
//       'x-amz-credential': editorUploadInfo.s3Credentials,
//       'x-amz-date': editorUploadInfo.s3Date
//     }
//   };
// };
//
// global.fn_deleteS3Img = function(arg){
//   var s3Bucket = new AWS.S3();
//   s3Bucket.deleteObject(arg, function (err, data) {
//     if (err) {
//       console.log("Check if you have sufficient permissions : "+err);
//     }
//   });
// };
//
// //imagethum -> originRe 변경
// global.fn_chagneImageType = function(path){
//   path = path.replace("_thumb.","_originRe.");
//   return path;
// };
//
// //s3에 있는 이미지를 삭제하는 함수
// //params : removeImageList ( type : array )
// global.fn_DeleteS3Images = function(removeImageList) {
//   var bucketName = S3.config.bucket;
//   var params = {};
//   // console.log(global.s3.bucketPath);
//   // console.log('fn_DeleteS3Images',global.s3.bucketPath);
//   // console.log('fn_DeleteS3Images',removeImageList);
//   if(!_.isEmpty(removeImageList[0])){
//     _.each(removeImageList, function(image){
//       var enUrl = image.path ? image.path.replace(/\+/gi, ' ') : image.replace(/\+/gi, ' '); // '+' to ' '(space)
//
//       var decodeUrl = decodeURIComponent(enUrl);  //url decode  예) console.log('decode', decodeURIComponent($(img[0]).attr("src")));
//       var path = decodeUrl.replace(global.s3.bucketPath,''); //decodeUrl; //bucketName/ 이후부터 잘라서 넣는부분
//
//       params = {
//         Bucket: bucketName,
//         Key: path
//       };
//
//
//       if(params.Key.indexOf('_originRe') >= 0){
//         //1. originRe 지우기
//         global.fn_deleteS3Img(params);
//         //2. thumbnail 지우기
//         params.Key = params.Key.replace('_originRe', '_thumb');
//         global.fn_deleteS3Img(params);
//         //3. 원본 지우기
//         params.Key = params.Key.replace('_thumb', '');
//         global.fn_deleteS3Img(params);
//       } else {
//         //1. origin 지우기
//         global.fn_deleteS3Img(params);
//         //2. originRe 지우기
//         params.Key = params.Key.split('.jpeg')[0] + '_originRe.jpeg';
//         global.fn_deleteS3Img(params);
//         //3. thumb 지우기
//         params.Key = params.Key.replace('_originRe', '_thumb');
//         global.fn_deleteS3Img(params);
//       }
//     });
//   }
// };
//
// //s3에 있는 이미지를 삭제하는 함수
// //params : removeImageList ( type : array )
// global.fn_DeleteS3ImagesByType = function(removeImageList, fromType) {
//   var bucketName = S3.config.bucket;
//   var params = {};
//
//   if(!_.isEmpty(removeImageList[0])){
//     _.each(removeImageList, function(imageData){
//       var image = imageData.path ? imageData.path : imageData;
//       Meteor.call('isNotThereUsedFile', image, fromType, function(error, result) {
//         if(error){
//           console.error(error);
//         } else {
//           if(result){
//             // var enUrl = image.path.replace(/\+/gi, ' '); // '+' to ' '(space)
//             var enUrl = image.replace(/\+/gi, ' '); // '+' to ' '(space)
//             var decodeUrl = decodeURIComponent(enUrl);  //url decode  예) console.log('decode', decodeURIComponent($(img[0]).attr("src")));
//             var path = decodeUrl.replace(global.s3.bucketPath,''); //decodeUrl; //bucketName/ 이후부터 잘라서 넣는부분
//
//             params = {
//               Bucket: bucketName,
//               Key: path
//             };
//
//             //1. originRe 지우기
//             global.fn_deleteS3Img(params);
//             //2. thumbnail 지우기
//             params.Key = params.Key.replace('_originRe', '_thumb');
//             global.fn_deleteS3Img(params);
//             //3. 원본 지우기
//             params.Key = params.Key.replace('_thumb', '');
//             global.fn_deleteS3Img(params);
//           }
//         }
//       });
//     });
//   }
// };
//
// // 유저닉네임 여러명 가져오기
// global.fn_groupMemberNickName = function(userId, groupMember) {
//   var result = '';
//   var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   if(userInfo){
//     result = userInfo.profile.nickName;
//
//     var message = '';
//     if (groupMember.length > 1) {
//       message = ' 외 ' + (groupMember.length - 1) + '명';
//     }
//     return result + message;
//   }
//   return result;
// };
//
// global.fn_numPad = function(n, width){
//   n = n + '';
//   return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
// };
//
//
// global.fn_diffDateTime = function(endDateTime){
//   var result = {};
//   var startTime = new Date(global.utilGetDate().default); // 시작일시 ('2009-01-01 12:30:00')
//   var endTime  = new Date(global.utilGetDate(endDateTime).default);    // 종료일시 ('2009-10-01 17:20:10')
//
//   // 두 일자(startTime, endTime) 사이의 차이를 구한다.
//   var dateGap = endTime.getTime() - startTime.getTime();
//   var timeGap = new Date(0, 0, 0, 0, 0, 0, endTime - startTime);
//
//   // 두 일자(startTime, endTime) 사이의 간격을 "일-시간-분"으로 표시한다.
//
//   result = {
//     diffDay  : global.fn_numPad(Math.floor(dateGap / (1000 * 60 * 60 * 24)), 1), // 일수
//     diffHour : timeGap.getHours(),       // 시간
//     diffMin  : timeGap.getMinutes(),      // 분
//     diffSec  : timeGap.getSeconds(),      // 초
//   };
//
//   return result;
// };
//
// global.fn_diffDate = function(eDate){
//   var result = {};
//   var toDay = new Date(global.utilGetDate().default);//new Date(); // 시작일시 ('2009-01-01')
//   var startDate = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate());
//   var endDate  = new Date(global.utilGetDate(eDate).defaultYMD);    // 종료일시 ('2009-10-01')
//   var flag = '-';
//
//   // 두 일자(startTime, endTime) 사이의 차이를 구한다.
//   var dateGap = endDate.getTime() - startDate.getTime();
//   dateGap = Math.floor(dateGap / (1000 * 60 * 60 * 24));
//
//   if(dateGap < 0){
//     dateGap = dateGap.toString().substring(1);
//     flag = '+';
//   } else if( dateGap === 0){
//     dateGap = 'day';
//   } else {
//     dateGap = dateGap.toString();
//   }
//
//   result = {
//     diffDay  : global.fn_numPad(dateGap, 1), // 일수
//     flag : flag
//   };
//
//   return result;
// };
//
// global.fn_concat_imageString_type = function(imagePath, type){
//   var result = '';
//     result = imagePath.substring(0, imagePath.lastIndexOf('.'))+ '_' + type + imagePath.substring(imagePath.lastIndexOf('.'));
//   return result;
// };
//
// global.fn_isPassAway = function(userId){
//   if(Meteor.users.findOne({username:userId})){
//     return Meteor.users.findOne({username:userId}).profile.isPassAway;
//   } else {
//     return false;
//   }
// };
//
// //조사선택 함수
// global.fn_getTextPostPosition = function(context, type){
//     //typeA : 을/를 구분, typeB : 이/가 구분, typeC : 으로/로 구분, typeD : 은/는 구분
//     var result = '';
//     if(global.fn_isHangul(context)){
//
//       var lastText = context.charAt(context.length - 1);
//       var textCode = lastText.charCodeAt(0);
//       var batchim = true;
//       if((textCode-44032)%28 === 0) {
//         batchim = false;
//       }
//       switch(type) {
//         case 'typeA': result = (batchim) ? '을':'를'; break;
//         case 'typeB': result = (batchim) ? '이':'가'; break;
//         case 'typeC': result = (batchim) ? '으로':'로'; break;
//         case 'typeD': result = (batchim) ? '은':'는'; break;
//       }
//     } else {
//       result = _.isEqual(type, 'typeA') ? '는/를' : '가';
//     }
//
//   return result;
// };
//
// global.fn_isHangul = function(context){
// var c = context.charCodeAt(0);
// if( 0x1100<=c && c<=0x11FF ) return true;
// if( 0x3130<=c && c<=0x318F ) return true;
// if( 0xAC00<=c && c<=0xD7A3 ) return true;
// return false;
// };
//
// global.fn_sendEmail = function(type, email, title, conText, fromEmail){
//   var emailInfo = {};
//   emailInfo = emailSend = {
//     to: email,
//     from: '잇츠마이스토리 <support@itsmystory.com>',
//     subject: title,
//     text: conText
//   };
//
//   // if(type === 'cert') {
//   //   emailInfo.from = '더푸르츠 인증 <noreply@itsmystory.com>';
//   // } else if('invite'){
//   //   emailInfo.from = fromEmail;
//   // } else {
//   //   emailInfo.from = '잇츠마이스토리 <support@itsmystory.com>';
//   // }
//
//   return emailInfo;
// };
//
// global.fn_getDifferenceData =  function(arrayTarget, arrSource){
//   // 두개의 ArrayData를 비교하여 target에 있는 다른 데이터만 Array로 반환
//   var resultTarget = _.reject(arrayTarget, function(obj){ return _.findWhere(arrSource, obj); });
//   return resultTarget;
// };
//
// //target이 source보다 크면 true
// global.fn_isGreaterThan = function(target, source){
//   return target > source;
// };
//
// //target이 source보다 작으면 true
// global.fn_isLessThan = function(target, source){
//   return target < source;
// };
//
// //2개값 덧셈
// global.fn_sumation = function(param1, param2){
//   return Number(param1) + Number(param2);
// };
//
// //2개값 뺄셈
// global.fn_subtraction = function(_param1, _param2){
//   var param1 = _param1 ? _param1 : 0;
//   var param2 = _param2 ? _param2 : 0;
//   return Number(param1) - Number(param2);
// };
//
// global.fn_rotateImage = function(orientation){
//   var deg = 0;
//   switch (orientation) {
//         case 2: //확인필요
//           deg = 90;
//           break;
//         case 3:
//           deg = 180;
//           break;
//         case 4: //확인필요
//           deg = 180;
//           break;
//         case 5: //확인필요
//           deg = 90;
//           break;
//         case 6:
//           deg = 90;
//           break;
//         case 7: //확인필요
//           deg = 90;
//           break;
//         case 8:
//           deg = 270;
//           break;
//         default: deg = 0;
//   }
//   return deg;
// };
//
// global.fn_upLoadeS3Image = function(imgInfo, folderName){
//   var imgsInfo = [];
//   if(_.isArray(imgInfo)){
//     imgsInfo = imgInfo;
//   } else {
//     imgsInfo.push(imgInfo);
//   }
//
//   _.each(imgsInfo, function(item){
//     // var extension = item.extension;
//     // var newFileName = item.fileName +item.type + '.' + extension;
//     var realPath = item.data.substring(item.data.indexOf("data"));//imagePath.substring(imagePath.indexOf("data"));
//
//     var path = '';
//     if(item.type){
//       path = folderName +'/' + item.fileName + '_'+ item.type +'.' + item.extension;
//     } else {
//       path = folderName +'/' + item.fileName + '.' + item.extension;
//     }
//
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
// };
//
// global.toDecimal = function (number) {
//      return number[0].numerator + number[1].numerator /
//          (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
//  };
//
//  /*
//  * @ scroll시 head 메뉴 영역을 변경하기 위한 function
//  * ex) global.tranceHeadMenu
//  */
//  global.tranceHeadMenu = function(){
//      if(this.mcs.top < -30){
//        $('.timeline-menuContainer').addClass('scrolling');
//        $('.timeline_header').slideUp();
//        $('.timeline-qna').slideUp();
//        $('.timeline-filter').addClass('scrolling');
//        $('.content.left').css({'padding-bottom':'65px', 'margin-bottom':'-65px' } );
//        $('.logo-slogun').hide();
//        $('.gnb').addClass('scrolling');
//        $('#gnbList').hide();
//      }else{
//        $('.timeline-menuContainer').removeClass('scrolling');
//        $('.timeline_header').slideDown();
//        $('.timeline-qna').slideDown();
//        $('.timeline-filter').removeClass('scrolling');
//        $('.content.left').css( {'padding-bottom':'145px', 'margin-bottom':'-145px' } );
//        $('.logo-slogun').show();
//        $('.gnb').removeClass('scrolling');
//        $('#gnbList').show();
//      }
//  };
//
//  /*
//  * @ lifemap detail 이동 function()
//  * requestTemplate = {postId: 'string', type: 'BS','TC'....}
//  */
//  global.fn_replaceLifeViewDetail = function(requestTemplate, pageType){
//    var templateData = {};
//    var sessionName = 'endingNoteList templateData';
//    var parentViewId = '';
//    if (pageType === 'ihLifeView') {
//      sessionName = 'ihLifeView templateData';
//      parentViewId = 'inheritanceContents';
//    }
//    if(requestTemplate.type == 'BS'){
//      var requestData = [];
//      requestData.push(requestTemplate);
//      Meteor.call('getClickedImgDatas',requestData, function(error, result){
//        if(error){
//         console.error(error);
//        }
//        if(result){
//          if(result.length === 1){  //BS일경우
//            templateData.headerTmp = 'endingNoteListHeaderBucketList';
//            templateData.contentTmp = 'bucketDetail';
//            templateData.data = {
//              _id : result[0].postId,
//              subId : result[0]._id
//            };
//          }
//          console.log("getClick",result);
//          templateData.data.lifeViewDataList = requestTemplate.lifeViewDataList;
//          templateData.data.lifeViewOriginData = requestTemplate.lifeViewOriginData;
//          templateData.data.fromView = requestTemplate.fromView;
//          templateData.data.parentViewId = parentViewId;
//          Session.set(sessionName, null);
//          setTimeout(function(){
//            Session.set(sessionName, templateData);
//          }, 100);
//        }
//      });
//    }else{
//      var _id = requestTemplate.postId;
//      templateData.contentTmp = 'imDetail';
//      templateData.data = {
//        _id : _id,
//      };
//      switch(requestTemplate.type){
//        case 'IM':
//         templateData.headerTmp = 'endingNoteListHeaderIm';
//         templateData.contentTmp = 'imDetail';
//        break;
//        case 'BL':
//         templateData.headerTmp = 'endingNoteListHeaderBucketList';
//         templateData.contentTmp = 'bucketDetail';
//        break;
//        case 'TC':
//         templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
//         templateData.contentTmp = 'timeCapsuleDetail';
//        break;
//      }
//      templateData.data.lifeViewDataList = requestTemplate.lifeViewDataList;
//      templateData.data.lifeViewOriginData = requestTemplate.lifeViewOriginData;
//      templateData.data.fromView = requestTemplate.fromView;
//      templateData.data.parentViewId = parentViewId;
//
//      Session.set(sessionName, null);
//      setTimeout(function(){
//        Session.set(sessionName, templateData);
//      }, 100);
//    }
//
//  };
//
// global.fn_getBirthDay = function(userId){
//   var result = '';
//   var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   if (userInfo) {
//     return userInfo.profile.birthday.date ? userInfo.profile.birthday.date : undefined;
//   }
// };
//
// global.fn_getCalDate = function(_date, _day, _type){
//   var date = new Date(_date);
//   switch(_type){
//     case 'SUM' : //더하기
//     date.setDate(date.getDate() + _day);
//     break;
//     case 'SUB' : //빼기
//     date.setDate(date.getDate() - _day);
//     break;
//   }
//   return date.toISOString();
// };
//
// global.fn_getCalDateByMonth = function(_date, _month, _type){
//   var date = new Date(_date);
//   switch(_type){
//     case 'SUM' : //더하기
//     date.setMonth(date.getMonth() + _month);
//     break;
//     case 'SUB' : //빼기
//     date.setMonth(date.getMonth() - _month);
//     break;
//   }
//   return date.toISOString();
// };
//
// global.fn_getCalDateByYear = function(_date, _year, _type){
//   var date = new Date(_date);
//   switch(_type){
//     case 'SUM' : //더하기
//     date.setYear(date.getFullYear() + _year);
//     break;
//     case 'SUB' : //빼기
//     date.setYear(date.getFullYear() - _year);
//     break;
//   }
//   return date.toISOString();
// };
// //대문자 만들기
// global.fn_toUpperCase = function(_string){
//   var result = _string.toUpperCase();
//   return result;
// };
//
// //소문자만들기
// global.fn_toLowerCase = function(_string){
//   var result = _string.toLowerCase();
//   return result;
// };
//
// //인덱스 이용해서 문장, 글자 일부발최하기
// global.fn_getSubstring = function(_string, _startIndex, _count){
//   var result = _string.substring(_startIndex,_count);
//   return result;
// };
// // 엔터값 <br/>로 전환
// global.fn_enter = function(content) {
//   if (content) {
//     var str = content.replace(new RegExp('\n','g'), "<br/>");
//     return str;
//   }
// };
