import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsFavor = new Mongo.Collection('imsFavorite');
// CLT.ImsNoti = new Mongo.Collection('imsNotification');
// CLT.ImsLifeGoal = new Mongo.Collection('imsLifeGoal');

Meteor.methods({
  getCodeOption: function() {
    if(Meteor.isServer){
      var res = CLT.ImsCodeOption.findOne({});
      Object.keys(res).map(function(key,index){
        global[key] = res[key];
      });
      return global;
    }
  },
  importFile: function(file, fileData){
    if(Meteor.isServer){
      var excel;
      // console.log(file);
      if(file.indexOf("xlsx") > -1){
        excel = new Excel('xlsx');
      }else {
        excel = new Excel('xls');
      }

      var workbook = excel.read(fileData, {type: 'binary'});

      var yourSheetsName = workbook.SheetNames;

      var result = "";
      var sheet_name_list = workbook.SheetNames;
      sheet_name_list.forEach(function(y) { /* iterate through sheets */
        var worksheet = workbook.Sheets[y];
        for (z in worksheet) {
          /* all keys that do not begin with "!" correspond to cell addresses */
          if(z[0] === '!') continue;
          var log = "Sheet: " + y + ", cell: " + z + " = " + JSON.stringify(worksheet[z].v);
          // console.log(log);
          result += log + "\n";
        }
      });

      return result;
    }

  },
  sendEmail: function (email) {
    check([email.to, email.from, email.subject, email.text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    if (Meteor.isServer) {
      Email.send({
        to: email.to,
        from: email.from,
        subject: email.subject,
        html: email.text
      });
    }
  },
  getConentsInfo: function(_contentId, _type){
    var result = {};
    switch(_type){
      case 'IM':
      result.contentInfo = CLT.EnStory.findOne({_id:_contentId},{fields:{userId:1}});
      result.templateHeader = 'endingNoteListHeaderIm';
      result.templateName = 'imDetail';
      break;
      case 'BS':
      result.contentInfo = CLT.EnStory.findOne({postId:_contentId},{fields:{userId:1}});
      result.templateHeader = 'endingNoteListHeaderBucketList';
      result.templateName = 'bucketDetail';
      break;
      case 'BL':
      result.contentInfo = CLT.EnBucketList.findOne({_id:_contentId},{fields:{userId:1}});
      result.templateHeader = 'endingNoteListHeaderBucketList';
      result.templateName = 'bucketDetail';
      break;
      case 'TC':
      result.contentInfo = CLT.EnTimeCapsule.findOne({_id:_contentId},{fields:{userId:1}});
      result.templateHeader = 'endingNoteListHeaderTimeCapsule';
      result.templateName = 'timeCapsuleDetail';
      break;
    }
    return result;
  },
  setFavorite: function(_contentId, _userId, _authorId){
    CLT.ImsFavor.insert({
      contentId : _contentId,
      type: 'BL',
      userId : _userId,
      authorId : _authorId,
      regDate : global.utilGetDate().default
    });
  },
  removeFavorite: function(_contentId, _userId){
    CLT.ImsFavor.remove({contentId : _contentId, userId: _userId});
  },
  getNoti: function(_userId){
    var result = [];
    result = CLT.ImsNoti.find({
      $or : [
        {userId : _userId},
        {userId : 'imsadmin'}
      ],
      $and : [//본인인 쓴 답글에 대한 내용은 count 하지 않는다.
        {$or : [
          {contentType: 'subComment', 'options.userId' : {$ne:_userId}},
          {contentType: {$ne:'subComment'}}
        ]}
      ],
    },{sort:{regDate:-1}}).fetch();

    _.each(result, function(noti){
      //제목 설정
      var title  = '';
      var userNick = '';
      if(noti.options && noti.options.userId){
        userNick = global.fn_getNickName(noti.options.userId);
      }

      switch(noti.type){
        case 'BL':
          if(noti.contentType === 'manyCompleteVIP' || noti.contentType === 'manyWriteVIP'){
            title = global.notification.bucketList[noti.contentType](noti.options.count);
            break;
          }
        break;
        case 'TC':
        break;
        case 'IH' :
          if(global.fn_isPassAway(_userId)){
            userNick = '故 ' + userNick;
          }
          title = userNick + global.notification.inheritance[noti.contentType];
        break;
        case 'GD':
        break;
        case 'FR' :
        break;
        case 'MG': case 'CT' : //CT:공지,1:1답변
          if(noti.contentType === 'msgReceive'){
            title = userNick + global.notification.message[noti.contentType];
            break;
          }
          if(noti.contentType === 'notice'){
            title = global.utilStrong(noti.options.title);
            break;
          }
          if(noti.contentType === 'paymentError'){
            title = global.notification.message[noti.contentType](noti.options.count);
            break;
          }
          title = global.notification.message[noti.contentType];
        break;
      }

      switch(noti.contentType) {
        // 댓글 && 좋아요 && 따라하기
        case 'comment': case 'subComment': case 'like': case 'follow':
          title = userNick + '님이 '+ global.utilStrong(noti.options.title) + global.notification[noti.contentType];
        break;
        case 'write':
          switch(noti.type) {
            case 'BL':
              title = userNick + '님이 '+ global.utilStrong(noti.options.title) + global.notification.bucketList[noti.contentType];
            break;
            case 'BS':
              title = userNick + '님이 '+ global.utilStrong(noti.options.title) + global.notification.bucketStory[noti.contentType];
            break;
            case 'TC':
              title = userNick + '님이 '+ global.utilStrong(noti.options.title) + global.notification.timeCapsule[noti.contentType];
            break;
          }
        break;
        case 'delete':
          switch(noti.type) {
            case 'BL':
              title = userNick + '님이 '+ global.utilStrong(noti.options.title) + global.notification.bucketList[noti.contentType];
            break;
            case 'TC':
              title = userNick + '님이 '+ global.utilStrong(noti.options.title) + global.notification.timeCapsule[noti.contentType];
            break;
          }
        break;
        case 'message': case 'bury': case 'open':
          title = userNick + '님이 '+ global.utilStrong(noti.options.title) + global.notification.timeCapsule[noti.contentType];
        break;
        case 'receive': case 'refusal': case 'accept':
          switch(noti.type) {
            case 'TC':
              title = global.notification.timeCapsule[noti.contentType];
            break;
            case 'GD':
              title = userNick + global.notification.guardian[noti.contentType];
            break;
            case 'FR':
              title = userNick + global.notification.friends[noti.contentType];
            break;
          }
        break;
        case 'openPlz':
          title = '타임캡슐 '+ global.utilStrong(noti.options.title) + global.notification.timeCapsule[noti.contentType];
        break;
      }



      //최신데이터인지 확인 (하루가 안된 데이터)
      noti.title = title;
    });

    return result;
  },
  setNoti : function(_userId, _type, _contentId, _contentType, _options){
    //메서드 사용 예시
    // 댓글
    //Meteor.call('setNoti', global.login.userId, 'IM', postId, 'subComment', '_options.userId');
    //Meteor.call('setNoti', global.login.userId, 'BL', postId, 'subComment', '_options.userId');
    //Meteor.call('setNoti', global.login.userId, 'TC', postId, 'subComment', '_options.userId');
    //Meteor.call('setNoti', global.login.userId, 'BS', postId, 'subComment', '_options.userId / _options.subpostId');
    //타임캡슐
    //Meteor.call('setNoti', global.login.userId, 'TC', postId, 'receive', '_options.userId');
    //Meteor.call('setNoti', global.login.userId, 'TC', postId, 'deleted', '_options.userId / _options.contentTitle / _options.contentRegDate');
    //상속
    //Meteor.call('setNoti', global.login.userId, 'IH', postId, 'inherit', '_options.userId');
    //가디언 요청
    //Meteor.call('setNoti', addUser[i].userId, 'GD', '가디언 요청(postId)', 'receive', '_options.userId');
    //Meteor.call('setNoti', targetId, 'GD', '가디언 수락(postId)', 'accept', '_options.userId');
    //Meteor.call('setNoti', targetId, 'GD', '가디언 거절(postId)', 'refusal', '_options.userId');
    //쪽지
    //Meteor.call('setNoti', receiverId, 'MG', 'msgId', 'msgReceive', '_options.userId, _options.context'); //쪽지 받음 알림
    //회원가입
    //Meteor.call('setNoti', receiverId, 'MG', 'msgId', 'signUp'); //회원가입 환영

    //친구요청
    //Meteor.call('setNoti', receiverId, 'FR', 'msgId', 'receive', '_options.userId'); //친구 등록요청 알림
    //Meteor.call('setNoti', receiverId, 'FR', 'msgId', 'accept', '_options.userId'); //친구 수락 알림
    //Meteor.call('setNoti', receiverId, 'FR', 'msgId', 'refusal', '_options.userId'); //친구 수락 거절 알림

    //나중에 작업
    //Meteor.call('setNoti', global.login.userId, 'TC', postId, 'openPlz'); (나중에 처리) *************타임캡슐***************
    //Meteor.call('setNoti', global.login.userId, 'BL', postId, 'manyWrite', global.login.userId); (나중에 처리) *************버킷***************
    //Meteor.call('setNoti', global.login.userId, 'BL', postId, 'manyComplete', global.login.userId); (나중에 처리) *************버킷***************
    //Meteor.call('setNoti', global.login.userId, 'BL', postId, 'manyWriteVIP', 50); (나중에 처리) *************버킷***************
    //Meteor.call('setNoti', global.login.userId, 'BL', postId, 'manyCompleteVIP', 50); (나중에 처리) *************버킷***************
    //Meteor.call('setNoti', receiverId, 'MG', 'msgId', 'notice', _option.title); //*************공지사항*************
    //Meteor.call('setNoti', receiverId, 'MG', 'msgId', 'recommend'); //*************1:1문의 답변*************
    //Meteor.call('setNoti', receiverId, 'MG', 'msgId', 'payment'); //*************결제완료*************
    //Meteor.call('setNoti', receiverId, 'MG', 'msgId', 'paymentError', cnt); //*************결제오류*************
    //Meteor.call('setNoti', receiverId, 'MG', 'msgId', 'changePassword', cnt); //*************비번변경요청*************





    if(_contentType === 'openPlz'){
      CLT.ImsNoti.upsert(
        {
          contentId:_contentId,
          userId : _userId,
          contentType : _contentType
        },
        {$set:{
          contentId : _contentId,
          type : _type,
          // title : title,
          contentType : _contentType,
          userId : _userId,
          options : _options,
          updateDate : global.utilGetDate().default
        },
        $setOnInsert: {
          'regDate': global.utilGetDate().default,
          opened : false
        }}
      );
    } else {
      CLT.ImsNoti.insert({
        contentId : _contentId,
        type : _type,
        // title : title,
        contentType : _contentType,
        userId : _userId,
        opened : false,
        options : _options,
        regDate : global.utilGetDate().default,
        updateDate : global.utilGetDate().default
      });
    }
  },
  updateNoti : function(_id, _userId, _obj){
    CLT.ImsNoti.update(
      {
        _id : _id
      },{$set : _obj}
    );
  },
  removeOldNotification : function(_userId){
    var today = global.utilGetDate().default;
    var sixMonthBefore = global.fn_getCalDateByMonth(today,6,'SUB');
    CLT.ImsNoti.remove({
      $or :[
        {userId : _userId},
        {userId : 'imsadmin'}
      ],
      regDate : {$lt : sixMonthBefore}
    });
  },
  getLatestUserData: function(_userId, _targetUserId){
    var result = {};
    var imList = CLT.EnStory.find({userId: _targetUserId, type: global.pageType.im},{sort:{regDate:-1}, fields:{title:1}, limit:2}).fetch();
    var bucketList = CLT.EnBucketList.find({userId: _targetUserId, type: global.pageType.bucketList},{sort:{regDate:-1}, fields:{title:1}, limit:2}).fetch();
    var userInfo = Meteor.users.findOne({username: _targetUserId});
    var introduction = '';
    var groupNames = [];
    var count = 0;
    var isPassAway = false;

    if(userInfo && userInfo.profile){
      introduction = userInfo.profile.introduction ? userInfo.profile.introduction : '';
      isPassAway = userInfo.profile.isPassAway ? true : false;
      if(userInfo.profile.friends && userInfo.profile.friends.groups){
        _.each(userInfo.profile.friends.groups, function(group){
          groupNames.push(group.groupName);
        });
      }
    }

    result = {
      imList : imList,
      bucketList : bucketList,
      groupNames : groupNames.toString(), //array를 스트링으로 변환하게끔 작업
      introduction : introduction ? introduction : '소개 글이 없습니다.',
      isPassAway: isPassAway
    };

    //본인인경우
    if(_.isEqual(_userId, _targetUserId)){
      result.code = 'MYS';
      result.targetUserId = _targetUserId;
      result.enableFlag = 'disabled';
      result.title = '나';
      return result;
    }

    //이미 친구인경우
    count = Meteor.users.find({username: _userId, 'profile.friends.accept':{$elemMatch : {userId : _targetUserId}}}).count();
    if(count > 0){
      result.code = 'ALF';
      result.targetUserId = _targetUserId;
      result.enableFlag = 'enabled';
      result.title = '친구 끊기';
      return result;
    }

    //기 친구요청한 경우
    count = Meteor.users.find({username: _userId, 'profile.friends.request':{$elemMatch : {userId : _targetUserId}}}).count();
    if(count > 0){
      result.code = 'RQF';
      result.targetUserId = _targetUserId;
      result.enableFlag = 'disabled';
      result.title = '친구요청 중';
      return result;
    }

    //기 친구요청받은 경우
    count = Meteor.users.find({username: _userId, 'profile.friends.receive':{$elemMatch : {userId : _targetUserId}}}).count();
    if(count > 0){
      result.code = 'REF';
      result.targetUserId = _targetUserId;
      result.enableFlag = 'enabled';
      result.title = '친구수락';
      return result;
    }

    //친구요청 가능
    result.code = 'NOF';
    result.targetUserId = _targetUserId;
    result.enableFlag = 'enabled';
    result.title = '친구요청';
    return result;
  },
  isContentExist: function(_postId, _type){
    var result = true;

    switch(_type){
      case 'IM': case 'BS':
      result = CLT.EnStory.find({_id: _postId}).count() > 0 ? true : false;
      break;
      case 'BL':
      result = CLT.EnBucketList.find({_id: _postId}).count() > 0 ? true : false;
      break;
      case 'TC':
      result = CLT.EnTimeCapsule.find({_id: _postId}).count() > 0 ? true : false;
      break;
    }
    return result;
  },
  deleteConetents: function(_postId){
    CLT.ImsNoti.remove({_id : _postId});
  },
  getLifeGoal: function(_userId){
    var result = {};
    var goalTemp = null;
    goalTemp = CLT.ImsLifeGoal.findOne({userId:_userId});
    if(goalTemp && goalTemp.goalList){
      result.goalData = _.first(_.chain(goalTemp.goalList ).sortBy('regDate').reverse().value());
      result.lock = goalTemp.lock;
      result.userId = goalTemp.userId;
    }

    return result;
  },
  setLifeGoal: function(_userId, _goal){
    var uid = Meteor.uuid();
    var goalInfo = CLT.ImsLifeGoal.findOne({userId : _userId});

    if(goalInfo){
      CLT.ImsLifeGoal.update(
        {userId:_userId},
        {$push:{goalList:{_id: uid, goal:_goal, regDate: global.utilGetDate().default}}}
      );
    } else {
      CLT.ImsLifeGoal.insert(
        {
          userId:_userId,
          goalList:[{_id: uid, goal:_goal, regDate: global.utilGetDate().default}],
          lock : true
        }
      );
    }
  },
  getPassAwayInfo: function(_userId){
    var result = false;
    result = Meteor.users.findOne({username: _userId},{fields:{'profile.isPassAway':1}});
    return result ? result.profile.isPassAway : false;
  },
  chatscriptTest: function(_message){
    if(Meteor.isServer){
      var result = "none";
      var net = require('net');

      // var message = 'what is your name?';
      var userIp = '::1';//($_SERVER['X_FORWARDED_FOR']) ? $_SERVER['X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
      var bot = "harry";
      var none = "\x00";
      var msg = userIp + none + bot + none + _message + none;

      var client = new net.Socket();
      client.connect(1024, '52.78.184.240', function() {
        console.log('Connected');
        client.write(msg);
      });

      client.on('data', function(data) {
        console.log('Received: ' + data);
        client.destroy(); // kill client after server's response
      });

      client.on('close', function() {
        console.log('Connection closed');
        // return result;
      });

      console.log('result:', result);
    }
    // return 'ok';
  },

  //탈퇴처리
  removeAllDataByUserId: function(_userId){
    //추억
    CLT.EnStory.remove({userId:_userId});
    //Me,
    CLT.EnImMe.remove({userId:_userId});
    //오늘의 질문 히스토리,
    CLT.EnQuestionHistory.remove({userId:_userId});
    //Comment
    CLT.ImsComment.remove({userId:_userId});
    //Qna
    CLT.ImsCustomQna.remove({userId:_userId});
    //즐겨찾기
    CLT.ImsFavor.remove({userId:_userId});
    //장례식쵀장
    CLT.InhFuneralInvitation.remove({userId:_userId});
    // 초대하기
    CLT.ImsInvite.remove({userId:_userId});
    //인생목표
    CLT.ImsLifeGoal.remove({userId:_userId});
    // 알림
    CLT.ImsNoti.remove({userId:_userId});
    //상속
    CLT.Inh.remove({$or: [
      {userId:_userId},
      {inheritorId:_userId}
    ]});

    //좋아요
    CLT.ImsLike.remove({userId:_userId});

    //가디언 데이터 삭제 ================================================================================================================================================================================
    var userList = CLT.InhGuardians.find({userId : _userId},{fields:{receive:1,request:1,accept:1,refuse:1}}).fetch();
    var request = _.pluck(userList.request, 'userId');
    var receive = _.pluck(userList.receive, 'userId');
    var accept= _.pluck(userList.accept, 'userId');
    var refuse = _.pluck(userList.refuse, 'userId');
    userList = _.union(request, receive, accept, refuse);

    CLT.InhGuardians.update({
      userId:{$in:[userList]},
      $or : [
        {accept:{$elemMatch : {userId : _userId}}},
        {request:{$elemMatch : {userId : _userId}}},
        {receive:{$elemMatch : {userId : _userId}}},
        {refuse:{$elemMatch : {userId : _userId}}}
      ]
    },
    {
      $pull:{
        accept:{userId:_userId},
        request:{userId:_userId},
        receive:{userId:_userId},
        refuse:{userId:_userId}
      }
    });

    CLT.InhGuardians.remove({userId:_userId});

    //쪽지
    CLT.ImsMessage.remove({userId:_userId});


    // 솔로 버킷리스트 ================================================================================================================================================================================
    var bucketSoloList = CLT.EnBucketList.find({userId : _userId, groupType:'solo'},{fields:{_id:1}}).fetch();
    if(!_.isArray(bucketSoloList)){
      bucketSoloList = [bucketSoloList];
    }
    var bkIdsSolo = _.pluck(bucketSoloList, '_id');
    CLT.EnBucketListExecPlan.remove({bucketId:{$in:bkIdsSolo},userId:_userId},{multi:true}); //실행계획 삭제
    CLT.EnBucketList.remove({_id:{$in:bkIdsSolo}, userId:_userId},{multi:true}); //버킷리스트 삭제

    // 그룹 버킷리스트 처리
    var bucketGroupList = CLT.EnBucketList.find({userId : _userId, groupType:'group'},{fields:{_id:1, groupUsers:1}}).fetch();
    if(!_.isArray(bucketGroupList)){
      bucketGroupList = [bucketGroupList];
    }

    _.each(bucketGroupList, function(bucket){
      var agentUserId = _.first(_.sortBy(bucket.groupUsers)); //그룹 대리인 설정

      //그룹에서 pull
      CLT.EnBucketList.update({ _id:bucket._id, groupUsers:{$in:[agentUserId]}},{$pull:{ groupUsers:agentUserId}});

      //실행계획 userId 대체
      var expIds = CLT.EnBucketListExecPlan.update({bucketId:bucket._id, userId:_userId},{fields:{_id:1}}).fetch();
      if(!_.isArray(expIds)){
        expIds = [expIds];
      }
      expIds = _.pluck(expIds,'_id');

      //버킷리스트 실행계획 대리인 설정
      CLT.EnBucketListExecPlan.update({bucketId:bucket._id, userId:_userId},{$set:{userId:agentUserId}},{multi:true});

      //버킷 대리인설정
      if(bucket.groupUsers.length <= 1){
        //userId대체, groupType : solo로 변경
        CLT.EnBucketList.update({_id:bucket._id},{$set:{userId:agentUserId, groupType :'solo'}});
      } else {
        //userId대체
        CLT.EnBucketList.update({_id:bucket._id},{$set:{userId:agentUserId}});
      }

      //타임라인 사용자 변경 (버킷리스트)
      CLT.EnTimeline.update({userId:_userId, postId:bucket._id},{$set:{userId:agentUserId}},{multi:true});

      //타임라인 사용자 변경 (버킷리스트 실행계획)
      CLT.EnTimeline.update({userId:_userId, postId: {$in: expIds}},{$set:{userId:agentUserId}},{multi:true});

      //로그 변경 (적용여부 확인)
      // CLT.ImsLog.update({postId:bucket._id, userId:_userId, logType:'write', type:'BL'},{$set:{userId:agentUserId, contextUserId:agentUserId}},{multi:true});
    });


    //타임캡슐 메시지 삭제 ================================================================================================================================================================================
    CLT.EnCapsuleMessage.remove({userId:_userId},{multi:true});

    //개인 타임캡슐 삭제
    CLT.EnTimeCapsule.remove({userId:_userId, authorType:'private'},{multi:true});

    //그룹 타임캡슐 삭제
    var capsuleGroupList = CLT.EnTimeCapsule.find({userId : _userId, authorType:'group'},{fields:{_id:1, groupMember:1}}).fetch();
    if(!_.isArray(capsuleGroupList)){
      capsuleGroupList = [capsuleGroupList];
    }

    _.each(capsuleGroupList, function(capsule){
      var agentUserId = _.first(_.sortBy(_.pluck(capsule.groupUsers, 'userId'))); //그룹 대리인 설정

      //그룹에서 pull
      CLT.EnTimeCapsule.update({_id:capsule._id, userId : _userId, authorType:'group', groupUsers: {$elemMatch : {userId : _userId}}},{$pull:{ groupUsers:{userId:_userId}}});


      //타임캡슐 대리인 설정
      if(capsule.groupUsers.length <= 2){
        ////userId대체, groupType : solo로 변경
        CLT.EnTimeCapsule.update({_id:capsule._id},{$set:{userId:agentUserId, authorType :'private'}});
      } else {
        //userId대체
        CLT.EnTimeCapsule.update({_id:capsule._id},{$set:{userId:agentUserId}});
      }

      //타임라인 사용자 변경 (타임캡슐)
      CLT.EnTimeline.update({userId:_userId, postId:capsule._id},{$set:{userId:agentUserId}},{multi:true});

      //로그 변경 (적용여부 확인)
      // CLT.ImsLog.update({postId:capsule._id, userId:_userId, logType:'write', type:'TC'},{$set:{userId:agentUserId, contextUserId:agentUserId}},{multi:true});
    });

    //타임라인,
    CLT.EnTimeline.remove({userId:_userId});

    //로그
    CLT.ImsLog.remove({userId:_userId});

    //사용자 정보
    //기본데이터를 남기고 모두 삭제
    //친구이력도 모두 삭제(모든 유저에서 해당 유저의 정보를 모두 pull)

  },
});