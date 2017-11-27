// //자주 사용하는 함수를 정의
// //'util'을 preFix로 사용함
//
// // ex)
// // utilExample = function(after, before) {
// //  var result = _.isEqual(after, before);
// //  return result;
// // };
//
//
// // 2017. 1. 4. 오후 4:27:02
// // 2017-01-03 15:05:10
//
//
// global.utilGetDate = function(date) {
//   if (_.isUndefined(date) || _.isNull(date) || _.isEmpty(date)) {
//     if(Meteor.isClient){
//       if(!TimeSync.isSynced()){
//         TimeSync.resync();
//       } else {
//         date = Deps.nonreactive(function(){
//           return new Date(TimeSync.serverTime()).toISOString();
//         });
//       }
//     } else {
//       date = new Date().toISOString();
//     }
//   }
//   return {
//     default: date,
//     defaultHMS: new Date(date).format('yyyy-MM-dd HH:mm:ss'),
//     defaultYMD: new Date(date).format('yyyy-MM-dd'),
//     defaultYM : new Date(date).format('yyyy-MM'),
//     defaultYMDdot: new Date(date).format('yyyy.MM.dd'),
//     defaultYMdot: new Date(date).format('yyyy.MM'),
//     kor: new Date(date).format('yyyy년 MM월 dd일 HH:mm:ss'),
//     korYMD: new Date(date).format('yyyy년 MM월 dd일'),
//     hm: new Date(date).format('HH:mm'), // 시/분
//     md: new Date(date).format('MM-dd')
//   };
// };
//
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
//
// // froala editor upload files to S3(AWS)
// global.utilFroalaUpload = function(folderPath) {
//   var crypto = require('crypto');
//
//   var expiration = moment.utc(moment().add(2, 'days')).toISOString();
//   var metaDate = moment().format('YYYYMMDD');
//   var metaCredential = S3.config.key+ '/' + moment().format('YYYYMMDD') +'/' + S3.config.region + '/s3/aws4_request';
//   var metaStartsWithPath = folderPath + '/';
//   var metaAcl = 'public-read';
//   //var acl = 'private';
//
//   var policy = {
//     'expiration': expiration,
//     'conditions': [
//       {'bucket': S3.config.bucket},
//       {'acl': metaAcl},
//       {'success_action_status': '201'},
//       {'x-requested-with': 'xhr'},
//       {'x-amz-algorithm': 'AWS4-HMAC-SHA256'},
//       {'x-amz-credential': metaCredential},
//       {'x-amz-date': metaDate + 'T000000Z'},
//       ['starts-with', '$key', metaStartsWithPath],
//       ['starts-with', '$Content-Type', '']// # Accept all files.
//     ]
//   };
//
//   var policy64 = new Buffer(JSON.stringify(policy), 'utf-8').toString('base64');
//
//   // generate signing key
//   var kDate = crypto.createHmac('sha256', "AWS4" + S3.config.secret).update(metaDate).digest('');
//   var kRegion = crypto.createHmac('sha256', kDate).update(S3.config.region).digest('');
//   var kService = crypto.createHmac('sha256', kRegion).update('s3').digest('');
//   var kSigning = crypto.createHmac('sha256', kService).update("aws4_request").digest('');
//
//   // generate signature.V4
//   var signature = crypto.createHmac("sha256", kSigning).update(policy64).digest("hex");
//
//   // build the results object
//   var s3Credentials = {
//     s3Policy: policy64,
//     s3Signature: signature,
//     s3Credentials : metaCredential,
//     s3Date : metaDate + 'T000000Z'
//   };
//
//   // return S3 signature and policy for client or server to use
//   return s3Credentials;
// };
//
// //모달팝업 호출 시 사용
// utilModalOpen = function(e, obj) {
//   Template.modal.__helpers.get('modalRequest')(e, obj); // modal 템플릿의 헬퍼를 호출 (template) 템플릿이름을 파라미터값으로 넘김
// };
// // alert호출
// global.utilAlert = function(message, target) {
//   if (!target) {
//     target = 'warning';
//   }
//   swal({
//     type: target,
//     text : message,
//     allowOutsideClick: false,
//   });
// };
//
// // confirm 호출
// // 사용법 global.utilConfirm(message).then(function(val) { if (val) -->> 로직시작 } )
// global.utilConfirm = function(message, target, button) {
//   if (!button) {
//     button = {
//       confirm: '확인',
//       cancel: '취소'
//     };
//   }
//   return new Promise(function(resolve, reject) {
//     if (!target) {
//       target = 'question';
//     }
//     swal({
//       type: target,
//       html : message,
//       allowOutsideClick: false,
//       showCancelButton: true,
//       confirmButtonText: button.confirm,
//       cancelButtonText: button.cancel
//     }).then(function(result) {
//       resolve(result);
//     }, function(dis) {
//       if(dis){
//         reject(dis);
//       }
//     });
//   });
// };
//
// // 두 날짜사이에 속해있는지 확인 polyLine용도 (returnType : boolen)
// global.utilIsContainDateforPoly = function(from, to, homeFrom, homeTo, periodFrom, priodTo) {
//   var sFrom = Date.parse(from); //회사, 학교 From
//   var sTo = Date.parse(to); //회사, 학교 To
//   var hFrom = Date.parse(homeFrom); // 집 From
//   var hTo = Date.parse(homeTo); // 집 To
//   var pFrom = Date.parse(periodFrom); //검색기간 From
//   var pTo = Date.parse(priodTo); //검색기간 To
//
//   // console.log('=================================================');
//   // console.log("global.utilIsContainDateforPoly-S", sFrom +'~'+sTo);
//   // console.log("global.utilIsContainDateforPoly-H", hFrom +'~'+hTo);
//   // console.log("global.utilIsContainDateforPoly-P", pFrom +'~'+pTo);
//
//   if(sFrom > hTo || sTo < hFrom) {
//     return false;
//   }
//
//   if((pFrom <= hTo && pFrom <= sTo) && (pTo >= hFrom && pTo >= sFrom)) {
//     return true;
//   }
//
//   //if(tStart <= check && start <= check) {
//   // if(((pFrom <= sFrom && sFrom <= pTo) || (pFrom <= sTo && sTo <= pTo)) &&
//   //    ((pFrom <= hFrom && hFrom <= pTo) || (pFrom <= hTo && hTo <= pTo)) &&
//   //    ((hFrom <= sFrom && sFrom <= hTo)||(hFrom <= sTo && sTo <= hTo))) {
//   //   return true;
//   // }
//   return false;
// };
//
// // 두 날짜사이에 속해있는지 확인 (returnType : boolen)
// global.utilIsContainDate = function(from, to, periodFrom, priodTo) {
//   var sFrom = Date.parse(from); // From
//   var sTo = Date.parse(to); // To
//   var pFrom = Date.parse(periodFrom); //검색기간 From
//   var pTo = Date.parse(priodTo); //검색기간 To
//
//   //  console.log('=================================================');
//   //  console.log(sFrom +'~'+sTo);
//   //  console.log(pFrom +'~'+pTo);
//
//   //if(tStart <= check && start <= check) {
//   //if((pFrom <= sFrom && sFrom <= pTo) || (pFrom <= sTo && sTo <= pTo) || (sFrom <= pFrom && pFrom <= sTo) || (sFrom <= pTo && pTo <= sTo)
//   if(pFrom > sTo || pTo < sFrom) {
//     return false;
//   }
//   return true;
// };
//
// // 특정시점의 나이 구하기
// global.utilGetPastAge = function(birthday, pastDate) {
//   var years = 0;
//   //pastdate 이 빈 object 일때 (에러방어코딩)
//   if(typeof(pastDate)!=="string" && !pastDate.hasOwnProperty()){
//     pastDate = birthday;
//   }
//   // console.log(birthday);
//   // console.log(pastDate);
//
//   if (birthday) {
//     var birthdayDate = new Date(birthday);
//     var enddayDate = new Date(pastDate.replace(".","-"));
//
//     years = enddayDate.getFullYear() - birthdayDate.getFullYear();
//
//     // // 현재 년도에서 생일을 재설정
//     // birthdayDate.setFullYear(enddayDate.getFullYear());
//     // // 생일이 지났으면 -1
//     // if(enddayDate < birthdayDate) {
//     //   years --;
//     // }
//   }
//
//   return years + 1;
// };
//
// // 문자열 특정숫자만큼 자르기
// global.utilEllipsis = function(str, maxLen) {
//   if (str.length > maxLen) {
//     str = str.substring(0, maxLen) + '...';
//   }
//   return str;
// };
//
// // Validation 체크
// global.utilValidation = function(t) {
//   var returnFlag = true;
//   var input = t.findAll('input');
//   var select = t.findAll('select');
//   var textarea = t.findAll('textarea');
//
//   var targetList = [].concat(input, select, textarea);
//
//   Array.prototype.map.call(targetList, function(targets) {
//     if (Boolean(targets.required) && returnFlag) {
//       if(targets.type === 'checkbox') {
//         if (!targets.checked) {
//           returnFlag = false;
//           targets.focus();
//           return global.utilAlert(targets.title);
//         }
//       } else {
//         if (!targets.value) {
//           returnFlag = false;
//           targets.focus();
//           return global.utilAlert(targets.title);
//         }
//       }
//     }
//   });
//
//   return returnFlag;
// };
//
// // 글등록 -> (timeline & history) Collection insert
// global.utilTimelineRegister = function(postId, userId, type, startDay, endDay, historyType) {
//   var timelineArr = [];
//   var firstPosition = 0;
//   var isInsertHistory = true;
//   var count = 2;
//   if (type === global.pageType.bucketList || type === global.pageType.timeCapsule) {
//     count = 3;
//   }
//
//   //히스토리를 등록하지 않는 타입을 여기에 정의한다.
//   if(_.isEqual(type, 'LT') || _.isEqual(type, 'ME') || _.isEqual(type, 'BS') || _.isEqual(type, 'BP') || _.isEqual(type, 'WM') || _.isEqual(type, 'FT')){
//     firstPosition = 1;
//     isInsertHistory = false;
//   }
//
//   var thisTime = global.utilGetDate().default;
//   for (var i = firstPosition; i < count; i++) {
//     var timelineObj = {
//       postId: postId,
//       userId: userId,
//       timeClass: 'start',
//       updateDate: thisTime,
//       regDate: thisTime
//     };
//     switch(i) {
//       case 0:
//       timelineObj.contentType = 'H';
//       timelineObj.type = type;
//       timelineObj.timeClass = 'start';
//       timelineObj.timelineDate = global.utilGetDate().defaultYMD;
//       timelineObj.sort = 2;
//       break;
//       case 1:
//       timelineObj.contentType = 'E';
//       timelineObj.type = type;
//       timelineObj.timeClass = 'start';
//       timelineObj.timelineDate = startDay ? global.utilGetDate(startDay).defaultYMD : '';
//       timelineObj.sort = 1;
//       break;
//       case 2:
//       timelineObj.contentType = 'E';
//       timelineObj.type = type;
//       timelineObj.timeClass = 'end';
//       timelineObj.timelineDate = endDay ? global.utilGetDate(endDay).defaultYMD : '';
//       timelineObj.sort = 1;
//       break;
//     }
//     timelineArr.push(timelineObj);
//   }
//   Meteor.call('enTimelineInsert', timelineArr);
//   if (!historyType) {
//     historyType = 'WR';
//   }
//   //히스토리 컬렉션 등록
//   var historyObj = {
//     postId: postId,
//     typeKey: postId,
//     commentKey: '',
//     userId: userId,
//     postType: type,
//     type: historyType,
//     user: '',
//     timelineDate: global.utilGetDate().defaultYMD,
//     updateDate: global.utilGetDate().default
//   };
//
//   if(isInsertHistory) {
//     setTimeout(function() {
//       Meteor.call('enHistoryUpsert', null, historyObj);
//     }, 100);
//   }
// };
//
// // 히스토리 글등록 추가하기
// global.utilHistoryWrite = function(obj, crud) {
//   var historyMethod = null;
//   var historyObj = {};
//   if (crud === 'insert') {
//     historyMethod = 'enHistoryInsert';
//     historyObj = {
//       postId: obj.postId,
//       typeKey: obj.subPostId,
//       commentKey: '',
//       userId: obj.postUser,
//       postType: obj.postType,
//       type: 'WR',
//       user: obj.user,
//       timelineDate: global.utilGetDate().defaultYMD,
//       regDate: global.utilGetDate().default,
//       updateDate: global.utilGetDate().default
//     };
//   } else if (crud === 'remove') {
//     historyMethod = 'enHistoryDelete';
//     historyObj = {
//       typeKey: obj.subPostId
//     };
//   }
//
//   var timelineObj = [{
//     userId: global.login.userId,
//     contentType: 'H',
//     timeClass: 'start',
//     timelineDate: global.utilGetDate().defaultYMD
//   }];
//
//   if (crud !== 'remove') {
//     Meteor.call('enTimelineUpdate', obj.postId, timelineObj);
//   }
//   setTimeout(function() {
//     Meteor.call(historyMethod, obj.postId, historyObj);
//   }, 100);
// };
//
// // 히스토리 좋아요 추가하기
// global.utilHistoryLike = function(postId, postUser, likeUser, likeFlag, parentPostId, postType) {
//   if (!parentPostId) {
//     parentPostId = postId;
//   }
//   var historyObj = {
//     postId: postId,
//     typeKey: parentPostId,
//     commentKey: '',
//     userId: postUser,
//     postType: postType,
//     type: 'LK',
//     user: likeUser,
//     timelineDate: global.utilGetDate().defaultYMD,
//     regDate: global.utilGetDate().default,
//     updateDate: global.utilGetDate().default
//   };
//   var historyMethod = null;
//   if (likeFlag) {
//     // 이미 좋아요하는경우에는 히스토리에서 좋아요 삭제
//     historyMethod = 'enHistoryDelete';
//     delete historyObj.timelineDate;
//     delete historyObj.regDate;
//     delete historyObj.updateDate;
//   } else {
//     historyMethod = 'enHistoryInsert';
//   }
//
//   Meteor.call(historyMethod, postId, historyObj, function(error) {
//     if (error) {
//       return alert(error);
//     } else {
//       var timelineObj = [{
//         userId: postUser,
//         contentType: 'H',
//         timeClass: 'start',
//         timelineDate: global.utilGetDate().defaultYMD
//       }];
//       Meteor.call('enTimelineUpdate', postId, timelineObj);
//     }
//   });
// };
//
// // 히스토리 댓글 추가하기
// global.utilHistoryComment = function(obj, crud) {
//   var historyObj = {};
//   var meteorMethod = null;
//   if (crud === 'insert') {
//     meteorMethod = 'enHistoryInsert';
//     historyObj = {
//       postId: obj.postId,
//       typeKey: obj.typeKey,
//       commentKey: obj.commentKey,
//       userId: obj.postUserId,
//       postType: obj.type,
//       type: 'CM',
//       user: obj.userId,
//       timelineDate: global.utilGetDate().defaultYMD,
//       regDate: global.utilGetDate().default,
//       updateDate: global.utilGetDate().default
//     };
//   } else {
//     meteorMethod = 'enHistoryDelete';
//     historyObj = {
//       postId: obj.postId,
//       commentKey: obj.cmtKey
//     };
//   }
//   var timelineObj = [{
//     userId: obj.postUserId,
//     contentType: 'H',
//     timeClass: 'start',
//     timelineDate: global.utilGetDate().defaultYMD
//   }];
//
//   Meteor.call(meteorMethod, obj.postId, historyObj, function(error) {
//     if (error) {
//       return alert(error);
//     } else {
//       if (crud !== 'remove') {
//         Meteor.call('enTimelineUpdate', obj.postId, timelineObj);
//       }
//     }
//   });
// };
//
// // 히스토리 데이터 추가하기
// global.utilHistoryInsert = function(obj) {
//   var timelineObj = {
//     userId: obj.userId,
//     contentType: 'H',
//     timeClass: 'start',
//     timelineDate: global.utilGetDate().defaultYMD
//   };
//
//   Meteor.call('enTimelineUpdateOne', obj.postId, timelineObj);
//   Meteor.call('enHistoryInsert', obj.postId, obj);
// };
//
// // 히스토리 데이터 삭제하기
// global.utilHistoryDelete = function(obj) {
//   Meteor.call('enHistoryDelete', obj.postId, obj);
// };
//
// // 유저 닉네임 가져오기
// global.utilGetNickName = function(userId) {
//   var userInfo = Meteor.users.find({username: userId}).fetch()[0];
//   if (userInfo) {
//     return userInfo.profile.nickName;
//   }
// };
//
// global.utilGetUsersInfo = function(userIds, searchOption){
//   var selectedField = {};
//   if(searchOption){
//     for(var i=0 ; i<searchOption.length ; i++){
//       selectedField[searchOption[i]] = 1;
//     }
//   } else {
//     // console.error('option은 필수 요소 입니다.');
//     return;
//   }
//   return Meteor.users.find({username: {$in:userIds}},{fields:selectedField}).fetch();
// };
//
// // 글자수 자르기
// global.utilStrCut = function(str, len) {
//   if (str && len < str.length) {
//     str = str.substring(0, len) + '...';
//   }
//   return str;
// };
//
// // 태그 제거
// global.utilTagRemove = function(content) {
//   if (content) {
//     var str = content.replace(/(<([^>]+)>)/gi, "");
//     return str;
//   }
// };
//
// // 템플릿이동
// utilTemplateMove = function(header, content, data) {
//   var template = {
//     headerTmp: header
//   };
//   Session.set('endingNoteList templateData', template);
//
//   setTimeout(function(){
//     var templateData = {
//       headerTmp: header,
//       contentTmp: content,
//       data: data
//     };
//     setTimeout(function() {
//       Session.set('endingNoteList templateData', templateData);
//     });
//   }, 100);
// };
//
// // 버킷스토리 -> 추억이동
// global.utilMoveStory = function(postId, parentPostId, timelineObj, historyObj, title) {
//   Meteor.call('enHistoryMoveStoryTimeline', postId, parentPostId, timelineObj, function(error) {
//     if (error) {
//       return alert(error);
//     } else {
//       Meteor.call('enHistoryMoveStoryHistory', postId, parentPostId ,historyObj);
//       Meteor.call('deleteLog', null, null, postId, null, null, function(error, result){
//         if(error) {
//           return console.log(error);
//         } else {
//           Meteor.call('setLog', parentPostId, postId, global.login.userId, global.login.userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketStoryComment, 'bucketStoryDelete', title); //버킷리스트의 히스토리란에 해당 버키스토리 기록을 모두 삭제
//         }
//       }); //버킷리스트의 히스토리란에 해당 버키스토리 기록을 모두 삭제
//     }
//   });
// };
//
// // template의 데이터 find Array형태로 가져오기
// global.utilGetFormDataArray = function(template, flag) {
//   var arrayData = [];
//   var result = {};
//   var text = template.findAll('input[type="text"]');
//   var hidden = template.findAll('input[type="hidden"]');
//   var checkbox = template.findAll('input[type="checkbox"]');
//   var radio = template.findAll('input[type="radio"]');
//   var select = template.findAll('select');
//   var textarea = template.findAll('textarea');
//
//   Array.prototype.map.call(text, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(hidden, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(checkbox, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(radio, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(select, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(textarea, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//
//
//   var keys = Object.keys(result);
//   if (flag === undefined) {
//     flag = true;
//   }
//
//   if (keys.length > 0 && flag) {
//     var cnt = result[keys[0]].length;
//     // var keys = Object.keys(result);
//     for (var i = 0; i < cnt; i++) {
//       var array = {};
//       for (var j = 0; j < keys.length; j++) {
//         if (result[keys[j]][i]) {
//           array[keys[j]] = result[keys[j]][i];
//         } else {
//           array[keys[j]] = null;
//         }
//       }
//       arrayData.push(array);
//     }
//     return arrayData;
//   } else {
//     return result;
//   }
// };
//
// // template의 데이터 find Array형태로 가져오기
// global.utilGetChlidrenDataArray = function(target, flag) {
//   var arrayData = [];
//   var result = {};
//   var text = target.find('input[type="text"]');
//   var hidden = target.find('input[type="hidden"]');
//   var checkbox = target.find('input[type="checkbox"]');
//   var radio = target.find('input[type="radio"]');
//   var select = target.find('select');
//   var textarea = target.find('textarea');
//
//   Array.prototype.map.call(text, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(hidden, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(checkbox, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(radio, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(select, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   Array.prototype.map.call(textarea, function(targets) {
//     if (typeof(result[targets.name]) !== typeof([])) {
//       result[targets.name] = [];
//     }
//     result[targets.name].push(targets.value);
//   });
//   var keys = Object.keys(result);
//   if (flag === undefined) {
//     flag = true;
//   }
//
//   if (keys.length > 0 && flag) {
//     var cnt = result[keys[0]].length;
//     // var keys = Object.keys(result);
//     for (var i = 0; i < cnt; i++) {
//       var array = {};
//       for (var j = 0; j < keys.length; j++) {
//         if (result[keys[j]][i]) {
//           array[keys[j]] = result[keys[j]][i];
//         } else {
//           array[keys[j]] = null;
//         }
//       }
//       arrayData.push(array);
//     }
//     return arrayData;
//   } else {
//     return result;
//   }
// };
//
// // 달력 시작일 종료일 체크하기
// global.utilCalendarBetween = function(start, end) {
//   var result = false;
//
//   if (start && end) {
//     if (new Date(start).getTime() > new Date(end).getTime()) {
//       result = true;
//     }
//   }
//   return result;
// };
//
// // 아이디 정규식 체크
// global.utilUserIdCheck = function(userId) {
//   var result = false;
//   var regType = /^[A-Za-z0-9+]{4,12}$/; // 영문 또는 숫자만 가능 4~12자리
//   if (regType.test(userId)) {
//     result = true;
//   }
//   return result;
// };
//
// // 패스워드 정규식 체크
// global.utilPasswordCheck = function(password) {
//   var result = false;
//   var regType = /^.*(?=.{8,30})(?=.*[0-9])(?=.*[a-zA-Z]).*$/; // 8 ~ 30자리 영문+숫자혼합
//   if (regType.test(password)) {
//     result = true;
//   }
//   return result;
// };
//
// // 이메일 정규식 체크
// global.utilEmailCheck = function(email) {
//   var result = false;
//   var regExp = /[0-9a-zA-Z][_0-9a-zA-Z-]*@[_0-9a-zA-Z-]+(\.[_0-9a-zA-Z-]+){1,2}$/;
//   if (email.match(regExp)) {
//     result = true;
//   }
//   return result;
// };
//
// // 암호화 & 복호화
// global.utilAES = function(message, type) {
//   var result = null;
//   var password = '050812';
//   var hashedPassword = CryptoJS.SHA256(password).toString();
//
//   switch(type) {
//     // 암호화
//     case 'encrypt':
//       var encrypt = CryptoJS.AES.encrypt(message, hashedPassword);
//       // url의 '/'를 없애기 위한 base64로 변경이후 url에 표시
//       var wordArray = CryptoJS.enc.Utf8.parse(encrypt);
//       result = CryptoJS.enc.Base64.stringify(wordArray);
//     break;
//     // 복호화
//     case 'decrypted':
//       // base64를 복호화한뒤 message를 AES 256복호화 작업
//       var parsedWordArray = CryptoJS.enc.Base64.parse(message);
//       parsedWordArray = parsedWordArray.toString(CryptoJS.enc.Utf8);
//       var decrypt = CryptoJS.AES.decrypt(parsedWordArray, hashedPassword);
//       result = decrypt.toString(CryptoJS.enc.Utf8);
//     break;
//   }
//   return result;
// };
