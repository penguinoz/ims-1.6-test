import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
import export_email_time_capsule from '/imports/email_template/email_time_capsule.js';

Meteor.methods({
  timeCapsuleFind:function(obj){
    return CLT.EnTimeCapsule.find(obj).fetch();
  },
  getCapsuleInnerData:function(_id){
    return CLT.EnTimeCapsule.findOne({'_id':_id},
    {
      _id : 1,
      title: 1,
      userId: 1,
      groupMember: 1,
      groupMemberCount: {$size: "$groupMember"},
      nonUserGroupMember:1,
      status: 1,
      buryLocationName: 1,
      regDate: 1,
      unsealDate : 1,
      buryDate : 1,
      authorType : 1
    });
  },
  //userId, isPageOwner, pageType, limit, searchCondition, searchText, sortBy, selectedMenu(my/all)
  // getTimeCapsuleList:function(userId, isPageOwner, limit, searchCondition, searchText, selectedMenu, statusMenu){
  getTimeCapsuleTop3List:function(userId, isPageOwner, limit, selectedMenu){
    var result = [];
    var resultArray = [];
    var sortOption = {};
    var stage = [];

    var processStatusResult = [];
    var unsealStatusResult = [];
    var buryStatusResult = [];
    var publicStatusResult = [];

    var project = {
      _id : 1,
      title: 1,
      userId: 1,
      groupMember: 1,
      groupMemberCount: {$size: "$groupMember"},
      nonUserGroupMember:1,
      status: 1,
      buryLocationName: 1,
      regDate: 1,
      unsealDate : 1,
      buryDate : 1,
      authorType : 1
    };

    // stage1 = [
    //   {$match: {$and : [
    //     {$or : [ {groupMember: {$elemMatch: {userId : userId}}} ]},
    //     {status : 'PR'},
    //     {authorType : 'private'}
    //   ]}},
    //   {$sort : {regDate: -1}},
    //   {$limit: limit},
    //   {$project: project}
    // ];

    //작성중
    stage = [
      {$match: {$and : [
        {$or : [{groupMember: {$elemMatch: {userId : userId}}} ]},
        {status : 'PR'}
      ]}},
      {$sort : {regDate: -1}},
      {$limit: limit},
      {$project: project}
    ];
    if(Meteor.isServer){
      processStatusResult = CLT.EnTimeCapsule.aggregate(stage);
      _.each(processStatusResult, function(data){

        //메시지 정보 수집
        var message = CLT.EnCapsuleMessage.find({capsuleId:data._id},{fields:{'userId':1}}).fetch();
        var messageCount = message.length ? message.length : 0;
        var isAllWriteMsg = false;

        if(messageCount > 0){
          //메시지 모두 작성여부
          var tempGroupMember = _.reject(data.groupMember, function(member){
            return _.findWhere(message, {userId:member.userId});
          });
          // _.isEqual(_.findWhere(message, {userId:member.userId}), member.userId);
          isAllWriteMsg = tempGroupMember.length > 0 ? false : true;
        }
        data.isAllWriteMsg = isAllWriteMsg;
      });
    }

    //개봉
    stage = [
      {$match: {$and : [
        {$or : [{groupMember: {$elemMatch: {userId : userId, openedDate :{$exists:true}}}} ]},
        {status : 'BR'}
      ]}},
      // {$sort : {unsealDate: -1}},
      {$sort : {'groupMember.openedDate': -1}},
      {$limit: limit},
      {$project: project}
    ];
    if(Meteor.isServer){
      unsealStatusResult = CLT.EnTimeCapsule.aggregate(stage);
    }

    //매립
    stage = [
      {$match: {$and : [
        {$or : [{groupMember: {$elemMatch: {userId : userId, openedDate :{$exists:false}}}} ]},
        {status : 'BR'}
      ]}},
      {$sort : {unsealDate: 1}},
      {$limit: limit},
      {$project: project}
    ];
    if(Meteor.isServer){
      buryStatusResult = CLT.EnTimeCapsule.aggregate(stage);
    }

    //공개
    stage = [
      {$match: {status : 'PB'}},
      {$sort : {buryDate: -1}},
      {$limit : limit},
      {$project: project}
    ];
    if(Meteor.isServer){
      publicStatusResult = CLT.EnTimeCapsule.aggregate(stage);
    }

    result = {
      'process' : processStatusResult,
      'unseal' : unsealStatusResult,
      'bury' : buryStatusResult,
      'public' : publicStatusResult
    };
    return result;
  },
  getTimeCapsuleContentsCount: function(userId){
    var countObject = {};
    var condition = [];
    var allCount = 0;
    var processStatusCount = 0;
    var buryStatusCount = 0;
    var unsealStatusCount = 0;
    var publicStatusCount = 0;



    //작성중인
    var prStatusAllCount = CLT.EnTimeCapsule.find({$and : [
      {$or : [{userId : userId},{groupMember: {$elemMatch: {userId : userId}}} ]},
      {status : 'PR'}
    ]}).count();

    var prStatusPrivateCount = CLT.EnTimeCapsule.find({$and : [
      {userId : {$ne:userId}},
      {groupMember: {$elemMatch: {userId : userId}}},
      {status : 'PR'},
      {authorType : 'private'}
    ]}).count();

    processStatusCount = prStatusAllCount - prStatusPrivateCount > 0 ? prStatusAllCount - prStatusPrivateCount : 0;
    countObject.processStatusCount = processStatusCount;


    //매립된
    buryStatusCount = CLT.EnTimeCapsule.find({$and : [
      {groupMember: {$elemMatch: {userId : userId, openedDate :{$exists:false}}}},
      {status : 'BR'}
    ]}).count();

    //개봉된
    unsealStatusCount = CLT.EnTimeCapsule.find({$and : [
      {groupMember: {$elemMatch: {userId : userId, openedDate :{$exists:true}}}},
      {status : 'BR'}
    ]}).count();

    //공개된
    publicStatusCount = CLT.EnTimeCapsule.find({status : 'PB'}
    // {$and : [
    // {$or : [
    //   {userId : userId},
    //   {groupMember: {$elemMatch: {userId : userId}}}
    // ]},
    // {status : 'PB'}
    // ]}
  ).count();

  //전체
  allCount = buryStatusCount + unsealStatusCount + processStatusCount;

  countObject = {
    buryStatusCount : buryStatusCount,
    publicStatusCount : publicStatusCount,
    unsealStatusCount : unsealStatusCount,
    processStatusCount : processStatusCount,
    allCount : allCount
  };

  return countObject;
},
getTimeCapsuleListByStatus:function(userId, isPageOwner, statusMenu, limit, searchCondition, searchText, selectedMenu){
  var result = [];
  var contents = [];
  // var contentsCount = [];
  var sortOption = {};
  var statusOption = {};
  var imData = null;
  var regex = [];
  var condition = [];
  var userIdCondition = [];
  var resultCollection = [];
  var status = '';

  searchText = searchText ? searchText.split(',') : [];
  var srchTextArr = [];
  for (var t = 0; t < searchText.length; t++) {
    srchTextArr.push(searchText[t].trim()); // 앞뒤 공백 제거
  }
  searchText = srchTextArr;


  if(searchText[0]){
    for (var s = 0; s < searchText.length; s++) {
      _.each(global.fn_getUsersIdByNick(searchText[s]), function(userIdInfo){
        userIdCondition.push(userIdInfo);
      });

      var titleRegexStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
      regex.push(titleRegexStr);
    }
  } else {
    if(_.isEqual(statusMenu,'public')){
      var regexStr = new RegExp(["^.*.*"].join(""), "gi");
      userIdCondition.push(regexStr);
    } else {
      userIdCondition.push(userId);
    }
  }

  switch (searchCondition) {
    case 'title':
    condition=[{'title': {$in: regex}}];
    break;
    case 'groupMember':
    if (_.isEqual(statusMenu,'public')){
      condition=[{'groupMember': {$elemMatch: {userId : {$in : userIdCondition}, openedDate :{$exists:false}}}}];
    } else if(_.isEqual(statusMenu,'process') || _.isEqual(statusMenu,'bury')) {
      condition=[{'groupMember': {$elemMatch: {userId : {$in : userIdCondition}, openedDate :{$exists:false}}}}];
    } else  {
      condition=[{'groupMember': {$elemMatch: {userId : {$in : userIdCondition}, openedDate :{$exists:true}}}}];
    }
    break;
    default:
    if (_.isEqual(statusMenu,'public')){
      condition = [
        {"title": {$in: regex}},
        {'groupMember': {$elemMatch: {userId : {$in : userIdCondition}, openedDate :{$exists:false}}}},
      ];
    } else if (_.isEqual(statusMenu,'process') || _.isEqual(statusMenu,'bury')) { //작성중(process)인 경우 조건이 다르기떄문에 해당 condition을 사용하지 않는다.
      condition = [
        {"title": {$in: regex}},
        {'groupMember': {$elemMatch: {userId : {$in : userIdCondition}, openedDate :{$exists:false}}}},
      ];
    } else {
      condition = [
        {"title": {$in: regex}},
        {"groupMember": {$elemMatch: {userId : {$in : userIdCondition}, openedDate :{$exists:true}}}},
      ];
    }
  }
  if(selectedMenu === 'all') { //공개 컨텐츠
    resultCollection = CLT.EnTimeCapsule.find(
      {$and : [
        {$or : condition},
        {status : 'PB'}
      ]},
      {sort : {regDate: -1}, limit: limit}
    ).fetch();

    // console.log('all',searchCondition, resultCollection, condition, userIdCondition);
    // contentsCount = resultCollection.length;
    status = 'PB';
  } else { // 작성중, 매립, 개봉 컨텐츠
    switch(statusMenu){
      case 'process': //작성중 (PRocess)
      resultCollection = CLT.EnTimeCapsule.find(
        {$and : [
          {'groupMember': {$elemMatch: {userId : userId, openedDate :{$exists:false}}}},
          {$or : condition},
          {status : 'PR'}
        ]},
        {sort : {regDate: -1}, limit: limit}
      ).fetch();

      //작성중인 경우 조건이 다르기떄문에 위에 선언된 condition을 사용하지 않는다.
      // var prStatusAllCount = CLT.EnTimeCapsule.find({
      //   $and : [
      //     {$or : [
      //       {userId : {$in : userId}},
      //       {groupMember: {$elemMatch: {userId : {$in : userIdCondition}}}} ]},
      //     {status : 'PR'}
      //   ]
      // }).count();
      //
      // var prStatusPrivateCount = CLT.EnTimeCapsule.find({$and : [
      //   {userId : {$ne:userId}},
      //   {groupMember: {$elemMatch: {userId :  {$in : userIdCondition}}}},
      //   {status : 'PR'},
      //   {authorType : 'private'}
      // ]}).count();

      // contentsCount = prStatusAllCount - prStatusPrivateCount > 0 ? prStatusAllCount - prStatusPrivateCount : 0;
      // contentsCount = resultCollection.length;
      status = 'PR';
      break;

      case 'bury': //매립(Bury)
      resultCollection = CLT.EnTimeCapsule.find(
        {$and : [
          {"groupMember": {$elemMatch: {userId : userId, openedDate :{$exists:false}}}},
          {$or : condition},
          {status : 'BR'}
        ]},
        {sort : {unsealDate: 1}, limit: limit}
      ).fetch();
      // contentsCount = resultCollection.length;
      status = 'BR';
      break;

      case 'unseal': //개봉(UnSeal)
      resultCollection = CLT.EnTimeCapsule.find(
        {$and : [
          {"groupMember": {$elemMatch: {userId : userId, openedDate :{$exists:true}}}},
          {$or : condition},
          {status : 'BR'}
        ]},
        {sort : {'groupMember.openedDate': -1}, limit: limit}
      ).fetch();

      // contentsCount = resultCollection.length;
      status = 'US';
      break;
    }
  }

  var im = [];

  resultCollection.map(function(item) {
    var groupMemberString = '';
    // item.groupMember.push(item.userId); //이부분 왜 들어가있는지 모르겠음 테스트 후 문제없으면 삭제
    _.each(item.groupMember, function(memberInfo){
      var userInfo = Meteor.users.find({username: memberInfo.userId}).fetch()[0];
      if (userInfo) {
        groupMemberString += userInfo.profile.nickName + ', ' ;
      }
    });
    _.each(item.nonUserGroupMember, function(memberInfo){
      if (memberInfo.nonUserName) {
        groupMemberString += memberInfo.nonUserName + ', ' ;
      }
    });
    groupMemberString = groupMemberString.slice(0, -2);
    item.groupMemberString = groupMemberString;

    if (searchText.toString() !== "") {
      for (var j = 0; j < searchText.length; j++) {
        var title = item.title.replace(/(<([^>]+)>)/gi, "");
        var groupMemberStr = item.groupMemberString.replace(/(<([^>]+)>)/gi, "");
        // var tag = item.tagList;
        var regSearch = new RegExp([searchText[j], ".*"].join(""), "");
        if (title.match(regSearch) || groupMemberStr.match(regSearch)){
          im.push(item);
        }
      }
    } else {
      im.push(item);
    }
  });

  im = _.intersection(im, im); // 똑같은 데이터 하나로 합치기


  if (im.length !== 0) {
    for (var i = 0; i < im.length; i++) {


      // 데이터영역의 태그를 삭제
      var title = im[i].title.replace(/(<([^>]+)>)/gi, "");
      var groupMemberString = im[i].groupMemberString.replace(/(<([^>]+)>)/gi, "");

      var titleTxt = [];
      var groupMemberStringTxt = [];
      for (var x = 0; x < searchText.length; x++) {
        var regex2 = new RegExp([searchText[x]].join(""), "gi");

        // 태그를 삭제한 데이터영역과 검색키워드의 문자열을 찾는다
        var titleFlag = title.indexOf(searchText[x]);
        var groupMemberStringFlag = groupMemberString.indexOf(searchText[x]);


        if(!_.isEmpty(searchText[x]) && titleFlag !== -1 && (searchCondition === 'all' || searchCondition === 'title')){
          title = title.replace(regex2, '<strong value='+im[i]._id+'>' + searchText[x] + '</strong>');
        }
        if(!_.isEmpty(searchText[x]) && groupMemberStringFlag !== -1 && (searchCondition === 'all' || searchCondition === 'groupMember')) {
          groupMemberString = groupMemberString.replace(regex2, '<strong value='+im[i]._id+'>' + searchText[x] + '</strong>');
        }
      }

      titleTxt.push(title);
      groupMemberStringTxt.push(groupMemberString);

      var commentCount = CLT.ImsComment.find({postId: im[i]._id}).count();

      var likeCount = 0;
      if(global.fn_isExist(im[i].like)){
        likeCount = im[i].like.length;
      }

      //메시지 정보 수집
      var message = CLT.EnCapsuleMessage.find({capsuleId:im[i]._id},{fields:{'userId':1}}).fetch();
      var messageCount = message.length ? message.length : 0;
      var isAllWriteMsg = false;

      if(messageCount > 0){
        //메시지 모두 작성여부
        var tempGroupMember = _.reject(im[i].groupMember, function(member){
          return _.findWhere(message, {userId:member.userId});
        });
        // _.isEqual(_.findWhere(message, {userId:member.userId}), member.userId);
        isAllWriteMsg = tempGroupMember.length > 0 ? false : true;
      }

      //그룹 개봉타임캡슐 개봉인원
      var openedUserCount = _.countBy(im[i].groupMember, function(item){
        var i=0;
        return _.has(item,'openedDate') ? 'opened' : 'notOpened';
      });

      var image = global.fn_isExist(im[i].image);
      if (image) {
        image = im[i].image;
      } else {
        image = undefined;
      }

      contents.push({
        _id: im[i]._id,
        title: titleTxt,
        userId: userId,
        postUserId : im[i].userId,
        status: status,
        groupMember: im[i].groupMember,
        groupMemberString : groupMemberStringTxt,
        nonUserGroupMember: im[i].nonUserGroupMember,
        buryLocationName: im[i].buryLocationName,
        regDate: im[i].regDate,
        unsealDate : im[i].unsealDate,
        buryDate : im[i].buryDate,
        openedDate : im[i].openedDate,
        commentCount : commentCount,
        publicContent : im[i].publicContent,
        authorType : im[i].authorType,
        messageCount : messageCount,
        isAllWriteMsg :  isAllWriteMsg,
        openedUserCount : openedUserCount.opened,
        image: image
      });
    }
  }


  result = {
    contents : contents,
    // count : contentsCount
  };
  // console.log('result', result);
  return result;
},
deleteTimeCapsule:function(_id, userId){
  CLT.EnTimeCapsule.remove(_id);
  CLT.ImsComment.remove({postId: _id});
  CLT.ImsLike.remove({postId: _id});
  // CLT.EnCapsuleMessage.remove({capsuleId: _id});
  // 상속된 컨텐츠 삭제
  CLT.Inh.update(
    {userId: userId},
    {
      $pull: { contents: {contentId: _id}, instContents: {contentId: _id} }
    },{multi: true}, function(error) {
      if (!error) {
        var inhInfo = CLT.Inh.find({userId, userId}).fetch();
        // 상속된 컨텐츠를 제거한뒤 상속받은 컨텐츠가 없으면 상속받은 날짜를 제거함
        inhInfo.map(function(item) {
          if (item.instContents.length === 0) {
            CLT.Inh.update({userId: item.userId, inheritorId: item.inheritorId}, {$unset: {instDate: ''}});
          }
        });
      }
    }
  );
},
upsertTimeCapsule:function(id,data){
  var returnObj = {};
  if(data.image){
    returnObj.oldImg = CLT.EnTimeCapsule.findOne({_id:id});
  }
  returnObj.res = CLT.EnTimeCapsule.upsert(
    {_id:id},
    {$set:data,
      $setOnInsert: {'regDate': global.utilGetDate().default}
    }
  );
  return returnObj;
},
updateTimeCapsule:function(condition, dataObj){
  CLT.EnTimeCapsule.update(
    condition,
    dataObj
  );

},
getTimeCapsuleById:function(id){
  return CLT.EnTimeCapsule.findOne({_id: id});
},
pullTimeCapsuleUserFromMember: function(userId, capsuleId){
  var userIdArray = [];
  if(_.isArray(userId)){
    userIdArray = userId;
  } else {
    userIdArray.push(userId);
  }

  CLT.EnTimeCapsule.update(
    {_id : capsuleId},
    {$pull: {groupMember: {userId : {$in:userIdArray}} }}
  );
},
setTimeCapsuleOpenedState:function(userId, id){
  CLT.EnTimeCapsule.update(
    {
      _id : id,
      'groupMember.userId' : userId
    },
    {$set:
      {
        isEverOpened : true,
        status : 'BR',
        updateDate : global.utilGetDate().default,
        'groupMember.$.openedDate' : global.utilGetDate().default
      }
    }
  );
},
getCapsuleUsersForEdit:function(id){
  return CLT.EnTimeCapsule.findOne({_id:id},{fields:{groupMember:1,nonUserGroupMember:1}});
},
timeCapsuleSearchFind: function(userId, searchCondition, searchText) {
  // 검색텍스트 ',' 로 구분해서 여러개 찾기
  searchText = searchText.split(',');
  var srchTextArr = [];
  for (var t = 0; t < searchText.length; t++) {
    // srchTextArr.push(searchText[t].replace(/ /g, '')); //텍스트의 모든공백제거
    srchTextArr.push(searchText[t].trim()); // 앞뒤 공백 제거
  }
  searchText = srchTextArr;

  var regex = [];
  for (var s = 0; s < searchText.length; s++) {
    var tempStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
    regex.push(tempStr);
  }

  var condition = [];

  switch (searchCondition) {
    case 'title': condition=[{groupUsers: userId}, {'title': {$in: regex}}];
    break;
    default: condition=[{groupUsers: userId}, {'title': {$in: regex}}];
  }

  var data = CLT.EnTimeCapsule.find(
    {
      $or:condition,
      userId: userId,
      status: 'BR',
      groupMember: {$elemMatch: {userId : userId, openedDate :{$exists:true}}}
    },
    {sort: {regDate: -1} }
  ).fetch();

  if (searchCondition === 'content' || searchCondition === 'tag') {
    return [];
  } else {
    return data;
  }
},
getMessageUsers : function(underbarId){
  return CLT.EnCapsuleMessage.find({capsuleId:underbarId},{fields:{userId:1,_id:0}}).fetch();
},
//디테일에서 맴버삭제
delGroupUserFromdtl : function(underbarId , members){
  return CLT.EnTimeCapsule.update({_id:underbarId},{$set:{groupMember:members}});
},
delNonGroupMember : function(underbarId , members){
  return CLT.EnTimeCapsule.update({_id:underbarId},{$set:{nonUserGroupMember:members}});
},
delGroupMember : function(underbarId , members){
  return CLT.EnTimeCapsule.update({_id:underbarId},{$set:{groupMember:members}});
},
getLocationData : function(userId){
  var result = [];
  var timeCapsule = CLT.EnTimeCapsule.find({
    $and:[
      {"groupMember.userId" : {$ne:userId}},
      {buryLat :{$exists:true}},
      {buryLat :{$ne:''}},
      {status : {$nin:['PR','PB']}}
    ]
  },{fields:{buryLat:1,buryLng:1,buryPlace:1,buryLocationName:1,_id:1, status:1, unsealDate:1, isEverOpened:1, updateDate:1, groupMember:1}}).fetch();

  _.each(timeCapsule, function(info){
    var data = {
      _id : info._id,
      buryLat : info.buryLat,
      buryLng : info.buryLng,
      buryPlace : info.buryPlace,
      buryLocationName : info.buryLocationName,
      status : info.isEverOpened ? 'US' : info.status,
      unsealDate : info.unsealDate,
      buryDate : info.buryDate,
      latestOpenDate : info.isEverOpened ? info.updateDate : undefined
    };
    var findMyid = false;
    if(info.groupMember){
      findMyid = _.where(info.groupMember, {'userId':userId});
    }
    if(findMyid.length){
      data.isNotMyContent = false;
    }else{
      data.isNotMyContent = true;
      delete data._id;
    }

    result.push(data);
  });


  return result;
},
getMyLocationData : function(_userId){
  var result = [];
  var timeCapsule = CLT.EnTimeCapsule.find({
    $and:[
      {buryLat :{$exists:true}},
      {buryLat :{$ne:''}},
      {status : {$nin:['PR','PB']}}
    ],
    $or : [
      {userId : _userId},
      {groupMember: {$elemMatch: {userId : _userId}}}
    ]
  },{fields:{buryLat:1, buryLng:1, buryPlace:1, buryLocationName:1, _id:1, status:1, unsealDate:1, groupMember:1}}).fetch();

  _.each(timeCapsule, function(info){
    var openedInfo = _.findWhere(info.groupMember, {userId: _userId});
    var data = {
      _id : info._id,
      buryLat : info.buryLat,
      buryLng : info.buryLng,
      buryPlace : info.buryPlace,
      buryLocationName : info.buryLocationName,
      status : _.has(openedInfo, 'openedDate') ? 'US' : info.status,
      unsealDate : info.unsealDate,
      buryDate : info.buryDate,
      latestOpenDate : _.has(openedInfo, 'openedDate') ? openedInfo.openedDate : undefined
    };
    result.push(data);
  });


  return result;
},
getDdayTimeCapsule: function(userId){
  var today = global.utilGetDate().defaultYMD;
  return CLT.EnTimeCapsule.find(
    {$and : [
      {"groupMember": {$elemMatch: {userId : userId, openedDate :{$exists:false}}}},
      {status : 'BR'},
      {unsealDate : {$lte : today}}
    ]}
  ).fetch();
},
sendTimeCapsuleEmail: function(_data){
  if(Meteor.isServer){
    _.each(_data.nonUserGroupMember, function(info){
      var emailCode = 'tc' + _data._id + '/' + Meteor.uuid();
      var encdCode = global.utilAES(emailCode, 'encrypt');
      //이메일 전송
      var email_info = {
        senderName : global.fn_getName(_data.userId),
        receiverName : info.nonUserName,
        email : info.nonUserEmail,
        buryDate : global.utilGetDate().default,
        buryLocation : _data.buryLocationName,
        unsealDate : _data.unsealDate,
        title : _data.title,
        code : encdCode
      };

      var htmlContext = export_email_time_capsule(email_info);
      var emailSend = global.fn_sendEmail('cert', email_info.email, "[It's my story] 소중한 타임캡슐이 도착했습니다.", htmlContext, '');
      Meteor.call('sendEmail', emailSend);

      CLT.EnTimeCapsule.update({_id : _data._id, nonUserGroupMember : {$elemMatch :{nonUserName:info.nonUserName,  nonUserEmail:info.nonUserEmail}}},{$set:{"nonUserGroupMember.$.emailCode": emailCode}});
    });
  }
}
});
