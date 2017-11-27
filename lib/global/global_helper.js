import {global} from '/imports/global/global_things.js';
//#####################################################################################
// 글로벌 헬퍼
//#####################################################################################
// 현재 접속한 유저와 해당글에 대한 유저에 대한 매칭
// params: userId(작성자 유저아이디)
UI.registerHelper('g_userAuth', function(userId) {
  if (global.fn_isExist(userId)) {
    return global.login.userId === userId;
  }
});

UI.registerHelper('g_getPageOwnerId', function() {
  return global.login.pageOwner;
});

UI.registerHelper('g_getUserId', function() {
  return global.login.userId;
});



UI.registerHelper('g_isLogin', function(userId) {
  return Session.get('isLogin');
});

// 컨텐츠에 필요한 nickName정보 수집
// UI.registerHelper('g_getNickName', function(userId) {
//   return global.fn_getNickName(userId);
// });

// 사용자 이름정보 수집
// UI.registerHelper('g_name', function(userId) {
//   return global.fn_getName(userId);
// });

// 사용자 이메일 수집
UI.registerHelper('g_email', function(userId) {
  return global.fn_getEmail(userId);
});

// 오늘날짜이면 시간만, 오늘날짜가 아니면 날짜만 표기
UI.registerHelper('g_dateCheck', function(date) {
  var toDay = global.utilGetDate().defaultYMD;
  var day = global.utilGetDate(date).defaultYMD;
  if (toDay === day) {
    // 오늘날짜라면 시간만 보여준다
    day = global.utilGetDate(date).hm;
  } else if (toDay && toDay.split('-')[0] === day.split('-')[0]) {
    // 년도가 같을시 년도는 안보여준다
    day = global.utilGetDate(date).md;
  }
  return day;
});

UI.registerHelper('g_dateFormChange', function(date, type) {
  var result = null;
  switch(type){
    case 'default' :
      result = global.utilGetDate(date).default;
    break;
    case 'defaultHMS' :
      result = global.utilGetDate(date).defaultHMS;
    break;
    case 'defaultYMD' :
      result = global.utilGetDate(date).defaultYMD;
    break;
    case 'kor' :
      result = global.utilGetDate(date).kor;
    break;
    case 'korYMD' :
      result = global.utilGetDate(date).korYMD;
    break;
    case 'hm' :
      result = global.utilGetDate(date).hm;
    break;

  }

  return result;
  // var toDay = global.utilGetDate().defaultYMD;
  // var day = global.utilGetDate(date).defaultYMD;
  //
  // if (toDay === day) {
  //   // 오늘날짜라면 시간만 보여준다
  //   day = global.utilGetDate(date).hm;
  // }
  // return day;
});

// 글자수 자르기
UI.registerHelper('g_stringLength', function(len, str) {
  if (str && len < str.length) {
    // var aa = str.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g,"$&$1$2").length;
    str = str.substring(0, len) + '...';
  }
  return str;
});

// 이미지태그 제거
UI.registerHelper('g_imageTagRemove', function(content) {
  var str = content.replace(/<img(.*?)>/gi, "");
  return str;
});

// 태그 제거 + </p> 는 br 태그로 변환
UI.registerHelper('g_tagRemoveChange', function(content) {
  var result = '';
  if (content) {
    var str = content.replace(/<\/p>/gi, "\n");
    str = str.replace(/<br\/>/gi, "\n");
    str = str.replace(/(<([^>]+)>)/gi, "");

    // 특정태그 적용하기
    str = str.replace(/\|{preTag}\|/gi, '<span class="listTh">');
    str = str.replace(/\|{postTag}\|/gi, '</span>');

    // var str = content.replace(/<img(.*?)>/gi, "");
    // str = str.replace(/<p>/gi, "");
    // str = str.replace(/<br>/gi, "");
    // str = str.replace(/<\/p>/gi, "<br/>");
    // return str;
    // str = str.split('</p>');
    str = str.split('\n');

    for (var i = 0; i < str.length; i++) {
      if (str[i] !== "") {
        result += str[i];
        if (i !== str.length-1) {
          result += '<br/>';
        }
      }
    }
    return result;
  }
});

// array의 each문 갯수제한
UI.registerHelper('g_limitIndex', function(index, count) {
  return index < count;
});

// 카테고리 + 제목
UI.registerHelper('g_getCategoryTitle', function(data) {
  if (data) {
    var result = data.title;
    var textPostPosition = '';

    if (global.category[data.category]) {
      result = global.category[data.category];
      if(result.indexOf('|postPositionA') >= 0){
        textPostPosition = global.fn_getTextPostPosition(data.title, 'typeA'); //typeA = 을/를
        result = result.replace('|postPositionA', textPostPosition);
      } else if(result.indexOf('|postPositionB') >= 0){
        textPostPosition = global.fn_getTextPostPosition(data.title, 'typeB'); //typeB = 이/가
        result = result.replace('|postPositionB', textPostPosition);
      } else if(result.indexOf('|postPositionC') >= 0){
        textPostPosition = global.fn_getTextPostPosition(data.title, 'typeC'); //typeB = 으로/로
        result = result.replace('|postPositionC', textPostPosition);
      } else if(result.indexOf('|postPositionD') >= 0){
        textPostPosition = global.fn_getTextPostPosition(data.title, 'typeD'); //typeB = 은/는
        result = result.replace('|postPositionD', textPostPosition);
      }
      result = result.replace('[', '<span class="cate-txt">[');
      result = result.replace(']', ']</span>');
      result = result.replace('keyword', data.title);
    }
    return result;
  }
});

// 타임라인 timeClass 한글로 변환
UI.registerHelper('g_timeClass', function(data) {
  var result = null;
  switch(data.type) {
    case global.pageType.bucketList: // 버킷리스트
      result = (data.timeClass === 'start' ? '시작' : data.isCompleted ? '완료' : '미완료');
    break;

    // case global.pageType.lifeTrace: // 발자취
    //   switch(data.subType) {
    //     case 'home': case 'social':
    //       result = (data.timeClass === 'start' ? '시작' : '종료');
    //     break;
    //     default: result = (data.timeClass === 'start' ? '입학' : '졸업');
    //   }
    // break;
  }
  return result;
});

// 타임라인 가운데 icon
UI.registerHelper('g_timelineConterIcon', function(data) {
  var result = null;
  switch(data.type) {
    case global.pageType.bucketList: result = 'bucket'; break;
    case global.pageType.bucketStory: result = 'bucket'; break;
    case global.pageType.bucketPlan: result = 'bucket'; break;
    case global.pageType.timeCapsule: result = 'time'; break;
    case global.pageType.lifeMap: result = 'glyphicon-certificate'; break;
    case global.pageType.inHeritance: result = 'glyphicon-heart-empty'; break;
    // case global.pageType.lifeTrace: result = 'glyphicon-home'; break;
    case global.pageType.future: result = 'dot'; break;
    default: result = 'im';
  }
  return result;
});

UI.registerHelper('g_concat', function(data1, data2) {
  return data1 + data2;
});

UI.registerHelper('g_concatThree', function(data1, data2, data3) {
  return data1 + data2 + data3;
});

UI.registerHelper('g_groupMemberNickName', function(userId ,groupMember, nonUserGroupMember, sortParam) {
  var resultGroup = [];
  _.each(groupMember, function(user){
    var userNick =  ReactiveMethod.call('getNickName', user.userId);//Meteor.users.find({username: user.userId}).fetch()[0];
    if (userNick) {
      resultGroup.push(userNick);
    }
  });

  if(nonUserGroupMember) {
    _.each(nonUserGroupMember ,function(nonUserInfo){
      resultGroup.push(nonUserInfo.nonUserName);
    });
  }
  return resultGroup.join(',');
});


UI.registerHelper('g_groupMemberNickNameExceptMe', function(userId ,groupMember, nonUserGroupMember, sortParam) {
  var result = '';
  var resultGroup = [];
  resultGroup = _.reject(groupMember, function(user) { return user.userId === userId; });

  if(nonUserGroupMember) {
    _.each(nonUserGroupMember ,function(nonUserInfo){
      resultGroup.push(nonUserInfo.nonUserName);
    });
  }
  _.each(resultGroup, function(user){
    var userNick = ReactiveMethod.call('getNickName', user.userId); //Meteor.users.find({username: user.userId}).fetch()[0];
    if (userNick) {
      result += userNick + ', ' ;
    } else if( user.constructor() === "") {
      result += user + ', ' ;
    }
  });
  if(sortParam){
    var rsStr = result.slice(0,-2).split(", ");
    var rsArr = _.sortBy(rsStr,function(num){return num;});
    rsStr = "";
    for(var i in rsArr){
      rsStr += rsArr[i] + ', ' ;
    }
    return rsStr.slice(0,-2);
  }
  return result.slice(0,-2);

});

UI.registerHelper('g_setLikeParameters', function(collectionData, templateName) {
  var result = {};
  result = {
    collectionData : collectionData,
    templateName : templateName
  };
  return result;
});

UI.registerHelper('g_diffDate', function(eDate) {
  var result = {};
  var toDay = new Date(global.utilGetDate().default);//new Date(); // 시작일시 ('2009-01-01')
  var startDate = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate());
  var endDate  = new Date(global.utilGetDate(eDate).defaultYMD);    // 종료일시 ('2009-10-01')

  // 두 일자(startTime, endTime) 사이의 차이를 구한다.
  var dateGap = endDate.getTime() - startDate.getTime();
  // var timeGap = new Date(0, 0, 0, 0, 0, 0, endTime - startTime);
  dateGap = Math.floor(dateGap / (1000 * 60 * 60 * 24));

  if(dateGap < 0){
    dateGap = '+' + global.fn_numPad(dateGap.toString().substring(1),1);
  } else if( dateGap === 0){
    dateGap = '-day';
  } else {
    dateGap = '-' + global.fn_numPad(dateGap.toString(),1);
  }

  result = dateGap; // 일수
  return result;
});

// 타이틀 여부, 작성자 여부, 그룹여부,
UI.registerHelper('g_logConcat', function(contextUserId, pageType, logType, title, author, nonUserName, isGroup){
  var result = null;
  var userNick = ReactiveMethod.call('getNickName', contextUserId); //Meteor.users.find({username: contextUserId}).fetch()[0];
  var preFixString = null;
  if (userNick) {
    preFixString = userNick + '님이';
    switch(pageType){
      case 'BL':
        if(_.isEqual(logType, 'comment')){
          result = preFixString + ' ' + global.Message.comment;
        } else if (_.isEqual(logType, 'bucketStoryComment')){
          result = preFixString + ' ' + global.Message.bucketList[logType];
        } else if (_.isEqual(logType, 'write')){
          result = global.Message.bucketList[logType];
        } else if (logType.indexOf('execPlanWrite') > -1 ){
          var fn_execPlanWrite = new Function("count", global.Message.bucketList.execPlanWrite);
          var count = logType.split('|')[1];
          if(isGroup){
            result = preFixString + ' ' + fn_execPlanWrite(count);
          } else {
            result = fn_execPlanWrite(count);
          }
        } else if (_.isEqual(logType, 'bucketStoryWrite') || _.isEqual(logType, 'bucketStoryDelete') || _.isEqual(logType, 'bucketStoryLike')) {
          if(_.isEqual(author, contextUserId) && !isGroup){
            preFixString = '스토리';
          }
          if(title){
            if(isGroup){
              if(title.length > 14){
                preFixString = preFixString+ '[' + title.substring(0, 13)+ '...]';
              }else{
                preFixString = preFixString+ '[' + title + ']';
              }
            } else {
              if(title.length > 17){
                preFixString = preFixString+ '[' + title.substring(0, 16)+ '...]';
              }else{
                preFixString = preFixString+ '[' + title + ']';
              }
            }
          }
          result = preFixString + ' ' + global.Message.bucketList[logType];
        } else if(_.isEqual(logType, 'follow')){
          preFixString = userNick + '님의 버킷을';
          result = preFixString + ' ' + global.Message.bucketList[logType];
        } else {
          result = preFixString + ' ' + global.Message.bucketList[logType];
        }
        break;
      case 'TC':
        if(_.isEqual(logType, 'comment')){
          result = preFixString + ' ' + global.Message.comment;
        } else if (_.isEqual(logType, 'write') || _.isEqual(logType, 'bury')){
          result = global.Message.timeCapsule[logType];
        } else if (_.isEqual(logType, 'writeMessage') || _.isEqual(logType, 'editMessage') ||_.isEqual(logType, 'deleteMessage')){
          if(isGroup){
            result = preFixString + ' ' + global.Message.timeCapsule[logType];
          } else {
            result = global.Message.timeCapsule[logType];
          }
        } else {
          result = preFixString + ' ' + global.Message.timeCapsule[logType];
        }
        break;
      case 'IH':
        if(logType === 'letterwriteAll'){
          result = global.Message.inheritance[logType];
        }else{
          result = preFixString.substr(0, preFixString.length-2) + ' ' + global.Message.inheritance[logType];
        }
    }
  } else if(nonUserName && pageType==='IH') {  //비유저 mail찍는 else
    result =  nonUserName+ ' ' + global.Message.inheritance[logType];
  }

  return result;
});

UI.registerHelper('g_isExist', function(item){
  return global.fn_isExist(item);
});


UI.registerHelper('g_isEqual', function(item, targetItem){
  var result = false;
  if(_.isEqual(item, targetItem)){
    result = true;
  }
  return result;
});
//빈 변수 확인
UI.registerHelper('g_isEmpty', function(item){
  return global.fn_isExist(item);
});

// selected표기
UI.registerHelper('g_selected', function(dbCode, code) {
  return dbCode === code ? "selected" : "";
});

// 엔터값 <br/>로 전환
UI.registerHelper('g_enter', function(content) {
  return global.fn_enter(content);
});

// true/false값 확인
// param : true or false
UI.registerHelper('g_isTrue', function(param) {
  return param;
});

//이미지 type별 image string 만들기
UI.registerHelper('g_makeImageString', function(imagePath, type) {
  return global.fn_makeImageString(imagePath, type);
});

//사용자 프로파일 이미지 만들기 (with userId)
UI.registerHelper('g_getProfileImg', function(_userId, _type){
  var profileImg = ReactiveMethod.call('getProfileImg', _userId);
  if(profileImg){
    return global.fn_makeProfileImgString(profileImg, _type);
  } else {
    return global.profileDefaultImg;
  }
});

//사용자 프로파일 이미지 만들기 (with imagePath)
UI.registerHelper('g_getProfileImgByPath', function(_path, _type) {
  if(_path && _type){
    return global.fn_makeProfileImgString(_path, _type);
  }else{
    //비어있을경우 디폴트 이미지
    return "/images/bg/avata_big.png";
  }
});

//블랙리본 사용 여부(사망여부 확인)
UI.registerHelper('g_isUseBlackRebon', function(_userId) {
  if(Meteor.isClient){
    // var result = false;
    var result;
    // fields = ['profile.isPassAway'];
    fields = ['profile.isPassAway'];
    result = ReactiveMethod.call('getUserInfo', _userId, fields);
    if(result){
      if(result[0].profile.isPassAway){
        return 'on';
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
});

// 상속 유져/비유져 nickName 정보 수집
UI.registerHelper('g_nonUserNickname', function(_userId, name) {
  var result;
  var userId = _userId;

  if (name) { //이름이 있으면 비유져
    result = name;
    return result;
  } else {
    if (!userId) {
      userId = global.login.userId;
    }

    result = ReactiveMethod.call('getNickName', userId);
    return result ? result : userId;
  }
});


//target이 source보다 크면 true
UI.registerHelper('g_isGreaterThan', function(target, source) {
  return global.fn_isGreaterThan(target, source);
});
//target이 source보다 작으면 true
UI.registerHelper('g_isLessThan', function(target, source) {
  return global.fn_isLessThan(target, source);
});

//2개값 덧셈
UI.registerHelper('g_sumation', function(param1, param2) {
  return global.fn_sumation(param1, param2);
});
//2개값 뺄셈
UI.registerHelper('g_subtraction', function(param1, param2) {
  return global.fn_subtraction(param1, param2);
});
// 이메일 자르기
UI.registerHelper('g_emailCut', function(email, cut) {
  var data = null;
  if (cut === 'first') {
    data = email.split('@')[0];
  } else {
    data = email.split('@')[1];
  }
  return data;
});


UI.registerHelper('g_toUpperCase', function(_string){
  return global.fn_toUpperCase(_string);
});

UI.registerHelper('g_toLowerCase', function(_string){
  return global.fn_toLowerCase(_string);
});

UI.registerHelper('g_getSubstring', function(_string, _startIndex, _count){
  return global.fn_getSubstring(_string, _startIndex, _count);
});

UI.registerHelper('g_getNickAndImg', function(_members){
  return ReactiveMethod.call('getNickAndImg', _members);
});

UI.registerHelper('g_getNickName', function(_userId){
  return ReactiveMethod.call('getNickName', _userId);
});

UI.registerHelper('g_name', function(_userId){
  return ReactiveMethod.call('getName', _userId);
});



UI.registerHelper("g_setImageSize", function(_path, _ratio , valueId){
  var img = new Image();
  img.onload = function(){
    var width = img.width;
    var height = img.height;
    var translate = 0;

    var imgHalfWidth = 0; //이미지 가로길이 반
    var imgHalfHeight = 0; //이미지 세로길이 반
    var halfWidth = Math.floor(global.imageRatio[_ratio].width/2); //틀의 가로길이 반
    var halfHeight = Math.floor(global.imageRatio[_ratio].height/2); //틀의 세로길이 반

    if(width > height){
      var imgRatio = Math.floor(height/width*100); //새로가 차지하는 비율 확인

      if( imgRatio <= global.imageRatio[_ratio].ratio){
        $('img[name="'+valueId+'"]').css('height',global.imageRatio[_ratio].height+'px');
        $('img[name="'+valueId+'"]').css('width',img.width*(global.imageRatio[_ratio].height/img.height)+'px');

        //가운데 맞추기
        imgHalfWidth = Math.floor(Number($('img[name="'+valueId+'"]').width())/2);
        translate = imgHalfWidth - halfWidth;
        $('img[name="'+valueId+'"]').css('transform','translate(-' + translate + 'px, 0px)');
      } else {
        $('img[name="'+valueId+'"]').css('width',global.imageRatio[_ratio].width+'px');
        $('img[name="'+valueId+'"]').css('height',img.height*(global.imageRatio[_ratio].width/img.width)+'px');

        //가운데 맞추기
        imgHalfHeight = Math.floor(Number($('img[name="'+valueId+'"]').height())/2);
        translate = imgHalfHeight - halfHeight;
        $('img[name="'+valueId+'"]').css('transform','translate(0px, -' + translate + 'px)');
      }
    } else {
      // $('img[src="'+_path+'"]').css('width','100%');
      // $('img[src="'+_path+'"]').css('height','auto');
      $('img[name="'+valueId+'"]').css('width',global.imageRatio[_ratio].width+'px');
      $('img[name="'+valueId+'"]').css('height',img.height*(global.imageRatio[_ratio].width/img.width)+'px');

      //가운데 맞추기
      imgHalfHeight = Math.floor(Number($('img[name="'+valueId+'"]').height())/2);
      translate = imgHalfHeight - halfHeight;
      $('img[name="'+valueId+'"]').css('transform','translate(0px, -' + translate + 'px)');
    }
  };
  img.src = _path;
});

UI.registerHelper("g_refreash", function(argument){
  return Session.get('refresh');
});

UI.registerHelper('g_AES', function(message, type) {
  return global.utilAES(message, type);
});

UI.registerHelper('g_numPad', function(stringCnt, length) {
  return global.fn_numPad(stringCnt,length);
});

// 현재 서버 주소
UI.registerHelper('g_serverURL', function() {
  return document.location.origin;
});
// 관리자 계정화면 flag
UI.registerHelper('g_adminFullAuth', function(userId) {
  return global.login.authority === 'adminFull';
});
// 모든 관리자 권한
UI.registerHelper('g_supportAuth', function(userId) {
  return global.login.authority === 'support' || global.login.authority === 'adminFull';
});

UI.registerHelper('g_bucketPath', function(){
  return global.s3.bucketPath;
});
UI.registerHelper('g_imsSiteName', function(){
  return global.imsSiteName;
});

// UI.registerHelper('g_friendCheckMessage', function(friend) {
//
// });
