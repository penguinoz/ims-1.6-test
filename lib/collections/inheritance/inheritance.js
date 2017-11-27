//상속 method
//가디언 method
import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
import export_email_inheritance from '/imports/email_template/email_inheritance.js';
// CLT.Inh = new Mongo.Collection('inheritance');

Meteor.methods({
  setInheritorExample:function(userId, inheritorId, inheritType){
    var instDate = '';
    var inheritanceDate = '';

    if(inheritType === 'instant'){
      instDate = global.utilGetDate().default;
    } else {
      inheritanceDate = global.utilGetDate().default;
    }
    CLT.Inh.insert({
      userId: userId,
      inheritorId: inheritorId,
      instDate : instDate,
      inheritanceDate : inheritanceDate,
      lastLetter : {
        "context" : "<p>모두에게 쓰는 마지막 편지</p><p><br></p><p>우리가 함께 했던 시간들이 정말 꿈만 같이 느껴지네...</p><p>난 이제 더이상 이세상에 없겠지만 내가 없더라도 모두 건강하고 행복하게 지냈으면 좋겠네;;</p><p>내 장례식엔 모두 꼭 참석 해줬으면 좋겠고</p><p><br></p><p>너희들 덕분에 한번뿐인 인생 후회없이 살았던것 같다</p>",
        "image" : [

        ],
        "updateDate" : "2017-03-24"
      },
      asset : [
        {
          "title" : "러시아 100만평",
          "share" : "50",
          "parentCode" : "asset001",
          "childCode" : "assetType001",
          "content" : "소유자:나\n위치:러시아 블라디보스톡\n시가:2000억\n근저당유무:무\n비고:\n"
        },
        {
          "title" : "서울 10만평",
          "share" : "50",
          "parentCode" : "asset001",
          "childCode" : "assetType001",
          "content" : "소유자:나\n위치:서울시 강남구 청담동\n시가:100억\n근저당유무:무\n비고:\n"
        }
      ],
      regDate: global.utilGetDate().default,
      updateDate: global.utilGetDate().default
    });
  },

  // 1. 상속자 등록
  setInheritors:function(userId, inheritors){
    _.each(inheritors, function(inheritorInfo){
      if(CLT.Inh.findOne({userId:userId, inheritorId:inheritorInfo.userId})){
        CLT.Inh.update(
          {userId:userId, inheritorId:inheritorInfo.userId},
          {$set : {
            inheritorDelete : false
          }},{multi:true}
        );
      } else {
        if(inheritorInfo.isIMSUser){
            CLT.Inh.insert({
              userId: userId,
              inheritorId: inheritorInfo.userId,
              msgId : '',
              lastLetter: {},
              asset: [],
              contents : [],
              instContents : [],
              inhPath : [],
              regDate: global.utilGetDate().default,
              updateDate: global.utilGetDate().default
            });
        } else {
          CLT.Inh.insert({
            userId: userId,
            inheritorId: Meteor.uuid(),
            msgId : '',
            lastLetter: {},
            asset: [],
            contents : [],
            instContents : [],
            inhPath : [],
            regDate: global.utilGetDate().default,
            updateDate: global.utilGetDate().default,
            eMail : inheritorInfo.eMail,
            name : inheritorInfo.name,
            phone : inheritorInfo.phone,
            image : inheritorInfo.image
          });
        } //if
      }//if
    }); //each
  },
  // 2. 상속자 수정
  updateInheritor:function(condition, data){
    CLT.Inh.update(
      condition,
      data,
      {multi:true}
    );
  },
  updateInheritorcheckSt:function(condition, data){
    var returnVal = CLT.Inh.findOne(condition,{fields:{contents:1}});
    CLT.Inh.update(
      condition,
      data,
      {multi:true}
    );
    return returnVal;
  },
  // 3. 상속자 삭제
  deleteinheritor: function(userId, inheritorId, msgId){
    if (msgId) {
      CLT.Inh.remove({userId:userId, inheritorId:inheritorId, msgId: msgId});
    } else {
      CLT.Inh.remove({userId:userId, inheritorId:inheritorId});
    }
  },
  // 4. 마지막 편지 등록
  setLastLetter:function( userId, target, data){
    var arr = CLT.Inh.find({userId:userId,inheritorId:{$in:target}},{fields:{lastLetter:1,inheritorId:1}}).fetch();
    CLT.Inh.update({userId:userId, inheritorId:{$in:target}},
      {$set:{lastLetter:data}},
      {multi:true}
    );
    return arr;
  },
  // 5. 마지막 편지 삭제
  deleteLastLetter:function(inhId){
    var resultArr = CLT.Inh.findOne({_id:inhId},{fields:{lastLetter:1,userId:1,inheritorId:1}});
    CLT.Inh.update(
      {_id:inhId},
      {$unset:{ lastLetter:'' }}
    );
    return resultArr;
  },
  getInheritanceById:function(id){
    return CLT.Inh.findOne({_id:id});
  },
  getInheritanceByInheritId: function(inheritorId) {
    return CLT.Inh.find({
      inheritorId:inheritorId,
      $and:[
        {$or: [
          {deletedRegDate:{$exists:false}},
          {deletedRegDate:''}
        ]},
        {$or: [
          {refuseDate:{$exists:false}},
          {refuseDate:''}
        ]},
        {$or : [
          {$and: [
            {inheritanceDate:{$exists:true}},
            {inheritanceDate:{$ne:''}}
          ]},
          {$and: [
            {instDate:{$exists:true}},
            {instDate:{$ne:''}},
            {instContents:{$exists:true}},
            {instContents:{$ne:[]}},
          ]},
        ]}
      ]
    }).fetch();
  },
  getInheritanceAllKindCount: function(userId) {
    var result = {};
    result.inheritorsCount = 0;
    result.inheritanceCount = 0; //상속받은 내역
    result.imGuardianCount = 0; //내가 가디언 수
    result.myGuardiansCount = 0; //나의 가디언 수
    result.funeralInvitationCount = 0; //장례식 초대 리스트 인원수

    //나의 상속인 수
    result.inheritorsCount = CLT.Inh.find({
      $and : [
        {userId: userId},
        {$or : [
          {parentInhId : {$exists : false}},
          {parentInhId : {$eq:''}},
        ]},
        {$or : [
          {inheritorDelete : {$exists : false}},
          {inheritorDelete : false}
        ]},
      ]
    }).count();

    //상속받은 내역
    result.inheritanceCount = CLT.Inh.find({
      inheritorId: userId,
      $and:[
        {$or:[
          {isDeleted:{$exists:false}},
          {isDeleted:false}
        ]},
        {$or : [
          {$and: [
            {inheritanceDate:{$ne:''}},
            {inheritanceDate:{$exists:true}}
          ]},
          {$and: [
            {instDate:{$ne:''}},
            {instDate:{$exists:true}}
          ]},
        ]}
      ]
    }).count();

    //내가 가디언 수
    var imGuardian = CLT.InhGuardians.findOne({userId: userId, 'accept.type' : 'IG'});
    if(imGuardian && imGuardian.accept){
      result.imGuardianCount = imGuardian.accept.length;
    }
    //나의 가디언 수
    var myGuardians = CLT.InhGuardians.findOne({userId: userId, 'accept.type' : 'MG'});
    if(myGuardians && myGuardians.accept){
      result.myGuardiansCount =  myGuardians.accept.length;
    }

    //장례식 초대 리스트 인원수
    var funeralInvitation = CLT.InhFuneralInvitation.findOne({userId: userId});
    if(funeralInvitation && funeralInvitation.member){
      result.funeralInvitationCount =  funeralInvitation.member.length;
    }
    return result;
  },
  getInheritanceContents: function(userId, inheritorId, messengerId, parentInhId){
    //userId : 상속해준 사용자
    //inheritoId :상속받은 사용자
    if(Meteor.isServer){
      //상속받은 컨텐츠 ID가져오기
      // test, scshin
      var timecapsuleMemberId = userId;
      var contentsInfo = [];
      var condition = {};
      var inheritanceData = null;


      if(messengerId){ //상속의 상속컨텐츠 일 경우
        timecapsuleMemberId = messengerId;
        inheritanceData = [];
        condition = {
          userId: userId,
          inheritorId: inheritorId,
          msgId : messengerId
        };

        //상속받은 컨텐츠 확인
        var childInhData = CLT.Inh.findOne(condition);
        // var childInhData = CLT.Inh.findOne(condition);
        condition = {
          _id : parentInhId
        };

        inheritanceData = CLT.Inh.findOne(condition,{fields:{contents:1, instContents:1, inheritanceDate:1}}); //상속에 상속 원본데이터

        if(inheritanceData){
          if(inheritanceData.inheritanceDate){
            inheritanceData.contentsData = inheritanceData.contents;
          } else {
            inheritanceData.contentsData = inheritanceData.instContents;
          }

          inheritanceData.instDate = childInhData.instDate;
          inheritanceData.inheritanceDate = childInhData.inheritanceDate;
        }
      } else { //일반 컨텐츠 상속일 경우
        condition = {
          userId: userId,
          inheritorId: inheritorId
        };

        //상속받은 컨텐츠 확인
        inheritanceData = CLT.Inh.findOne(condition,{fields:{contents:1, instContents:1, inheritanceDate:1}});
        if(inheritanceData.inheritanceDate){
          inheritanceData.contentsData = inheritanceData.contents;
        } else {
          inheritanceData.contentsData = inheritanceData.instContents;
        }

      }

      if(inheritanceData && inheritanceData.contentsData){
        _.each(inheritanceData.contentsData, function(inhInfo){
          switch(inhInfo.type){
            case global.pageType.me:
              var me = CLT.EnImMe.findOne({userId: userId});
              if(me){
                contentsInfo.push({
                  postId : inheritanceData._id,
                  contentId : inhInfo.contentId,
                  title: inhInfo.type,
                  date: global.utilGetDate(me.updateDate).defaultYMD,
                  type: inhInfo.type,
                  typeName : global.pageTypeName.ME,
                  openedUser : inhInfo.openedUser ? inhInfo.openedUser : [],
                  meUserId : userId
                });
              }
              break;
            case global.pageType.im:
              //추억정보 가져오기
              //타이틀, 추억일자
              var im = CLT.EnStory.findOne({_id : inhInfo.contentId},{fields:{title:1, startDate:1}});
              if(im){
                contentsInfo.push({
                  postId : inheritanceData._id,
                  contentId : inhInfo.contentId,
                  title: im.title,
                  date: im.startDate,
                  type:inhInfo.type,
                  typeName : global.pageTypeName.IM,
                  openedUser : inhInfo.openedUser ? inhInfo.openedUser : []
                });
              }
              break;
            case global.pageType.bucketList:
              //버킷리스트 가져오기
              //타이틀, 완료일자(없으면 '')
              var bl = CLT.EnBucketList.findOne({_id : inhInfo.contentId},{fields:{title:1, completeDate:1}});
              if(bl){
                contentsInfo.push({
                  postId : inheritanceData._id,
                  contentId : inhInfo.contentId,
                  title: bl.title,
                  date: bl.completeDate ? bl.completeDate : '',
                  type:inhInfo.type,
                  typeName : global.pageTypeName.BL,
                  openedUser : inhInfo.openedUser ? inhInfo.openedUser : []
                });
              }
              break;
            case global.pageType.timeCapsule:
              //타임캡슐 가져오기
              //타이틀, 개봉일(개봉) (BR, opendDate 있을경우)
              //타이틀, 개봉예정일(매립) (BR, opendDate가 없을경우, uncealDate(개봉예정일))
              var tc = CLT.EnTimeCapsule.findOne({_id : inhInfo.contentId},{fields:{title:1, groupMember:1, uncealDate:1}});
              if(tc){
                _.each(tc.groupMember,function(memberInfo){
                  if(_.isEqual(memberInfo.userId, timecapsuleMemberId)){
                    contentsInfo.push({
                      postId : inheritanceData._id,
                      contentId : inhInfo.contentId,
                      title: tc.title,
                      date: memberInfo.openedDate ? global.utilGetDate(memberInfo.completeDate).defaultYMD : global.utilGetDate(tc.uncealDate).defaultYMD,
                      type:inhInfo.type,
                      typeName : global.pageTypeName.TC,
                      openedUser : inhInfo.openedUser ? inhInfo.openedUser : []
                    });
                  }
                });
              }
              break;
          }
        });
      }

      contentsInfo = _.chain(contentsInfo).sortBy('title').sortBy('type').sortBy('date').value().reverse();
      return contentsInfo;
    }
  },
  deleteInhertanceContent: function(contentId){
    CLT.Inh.update(
      {},
      {$pull: {
        contents : {contentId : contentId}}
      },
      {multi:true}
    );

    CLT.Inh.update(
      {},
      {$pull: {
        inhContents : {contentId : contentId}}
      },
      {multi:true}
    );
  },
  // userId, inheritorId, msgId 일치하는 데이터
  getInheritanceByMsgId: function(userId, inheritorId, msgId) {
    return CLT.Inh.find({userId: userId, inheritorId: inheritorId, msgId: msgId}).fetch();
  },
  setInheritanceMsgId: function(obj) {
    CLT.Inh.insert(obj);
  },

  // 타임라인 상속 데이터
  getInheritanceTimeline: function(_id, isNote, type, topMenu, standardDate) {
    var inheritData = CLT.Inh.findOne({_id: _id});
    var data = [];
    if (inheritData) {
      var arrPostId = [];
      if (isNote === 'card') {
        // 카드의 엔딩노트
        if (Object.getOwnPropertyNames(inheritData.lastLetter).length !== 0) {
          data.push(
            {
              _id: _id,
              userId: inheritData.userId,
              type: 'lastLetter',
              title: '마지막편지',
              content: '',
              lock: false,
              timelineDate: global.utilGetDate(inheritData.lastLetter.updateDate).defaultYMD
            }
          );
        }
        if (inheritData.asset.length !== 0) {
          data.push(
            {
              _id: 'asset',
              userId: inheritData.userId,
              type: 'asset',
              title: '자산상속',
              content: '',
              lock: false,
              timelineDate: global.utilGetDate(inheritData.assetRegDate).defaultYMD
            }
          );
        }
        inheritData.contents.map(function(item) {
          arrPostId.push(item.contentId);
        });
      } else {
        // 상속내역의 엔딩노트
        inheritData.contents.map(function(item) {
          if (item.isInstant) {
            arrPostId.push(item.contentId);
          }
        });
      }


      if (arrPostId.length !== 0) {
        if (type === 'all' || type === 'im') {
          var storyData = null;
          switch(topMenu) {
            case 'endingNote': storyData = CLT.EnStory.find({_id: {$in: arrPostId}, type: 'IM'}).fetch(); break;
            case 'lifeView': storyData = CLT.EnStory.find({_id: {$in: arrPostId}, type: 'IM', $or:[{images: {$ne:[]}}, {tagList: {$ne:[]}}] }).fetch(); break;
          }
          storyData.map(function(item) {
            data.push(
              {
                _id: item._id,
                postId: item._id,
                subPostId: item.postId, // 버킷스토리의 버킷리스트 아이디
                userId: item.userId,
                type: item.type,
                title: item.title,
                content: item.content,
                images: item.images,
                lock: item.lock,
                timelineDate: global.utilGetDate(item.startDate).defaultYMD
              }
            );
          });
        }

        if (type === 'all' || type === 'bl') {
          var bucketData = null;
          var blStoryData = null;
          switch(topMenu) {
            case 'endingNote':
              bucketData = CLT.EnBucketList.find({_id: {$in: arrPostId}, startDate: {$lte: standardDate, $ne: ''}}).fetch();
              blStoryData = CLT.EnStory.find({_id: {$in: arrPostId}, type: 'BS', startDate: {$lte: standardDate, $ne: ''}}).fetch();
            break;
            case 'lifeView':
              bucketData = CLT.EnBucketList.find({_id: {$in: arrPostId}, $or:[{images: {$ne:[]}}, {tagList: {$ne:[]}}] }).fetch();
              blStoryData = CLT.EnStory.find({_id: {$in: arrPostId}, type: 'BS', $or:[{images: {$ne:[]}}, {tagList: {$ne:[]}}] }).fetch();
            break;
          }
          bucketData.map(function(item) {
            if (item.startDate) {
              // 일자가 있는 경우만 타임라인에 추가
              for (var i = 0; i < 1; i++) {
                var timelineDate = item.startDate;
                if (i === 1) {
                  timelineDate = item.completeDate;
                }
                data.push(
                  {
                    _id: item._id,
                    postId: item._id,
                    userId: item.userId,
                    type: item.type,
                    title: item.title,
                    content: item.content,
                    images: item.images,
                    lock: item.lock,
                    timelineDate: global.utilGetDate(item.startDate).defaultYMD
                  }
                );
              }
            }
          });
          blStoryData.map(function(item) {
            data.push(
              {
                _id: item._id,
                postId: item._id,
                subPostId: item.postId, // 버킷스토리의 버킷리스트 아이디
                userId: item.userId,
                type: item.type,
                title: item.title,
                content: item.content,
                images: item.images,
                lock: item.lock,
                timelineDate: global.utilGetDate(item.startDate).defaultYMD
              }
            );
          });
        }

        if (type === 'all' || type === 'tc') {
          var timeCapsule = null;
          switch(topMenu) {
            case 'endingNote': timeCapsule = CLT.EnTimeCapsule.find({_id: {$in: arrPostId}, unsealDate: {$lte: standardDate, $ne: ''}}).fetch(); break;
            case 'lifeView': timeCapsule = CLT.EnTimeCapsule.find({_id: {$in: arrPostId}, unsealDate: {$lte: standardDate, $ne: ''}, $or:[{image: {$ne:[]}}, {tagList: {$ne:[]}}] }).fetch(); break;
          }
          timeCapsule.map(function(item) {
            var groupMember = null;
            groupMember = global.fn_groupMemberNickName(item.userId, item.groupMember); // 참여자
            data.push(
              {
                _id: item._id,
                postId: item._id,
                userId: item.userId,
                type: 'TC',
                title: item.title,
                content: '<span class="listTh">참여자</span>: ' + groupMember + '<br/>' + '<span class="listTh">매립지</span>: ' + item.buryLocationName + '<br/>' + '<span class="listTh">개봉일</span>: ' + item.unsealDate,
                images: [],
                groupMember: item.groupMember,
                lock: item.lock,
                timelineDate: global.utilGetDate(item.regDate).defaultYMD
              }
            );
          });
        }
        var firstDate = null;
        var lastDate = null;
        if (data.length !== 0) {
          data = _.chain(data).sortBy('timelineDate').value().reverse();
          // 상속포함 날짜 가져오기 시작과 마지막
          firstDate = data[data.length-1].timelineDate;
          lastDate = data[0].timelineDate;
        }

        // 사용자 데이터 가져오기
        if (topMenu === 'endingNote') {
          var lock = [false];
          // 사용자 데이터 card일때는 비공개 데이터만 가져올것
          if (isNote !== 'card') {
            lock.push(true);
          }
          if (type === 'all' || type === 'im') {
            var onwerStory = CLT.EnStory.find({userId: inheritData.inheritorId, type: 'IM', startDate: {$gte: firstDate, $lte: lastDate}, lock: {$in: lock}}).fetch();
            onwerStory.map(function(item) {
              data.push(
                {
                  _id: item._id,
                  postId: item._id,
                  userId: item.userId,
                  type: item.type,
                  title: item.title,
                  content: item.content,
                  images: item.images,
                  lock: item.lock,
                  timelineDate: global.utilGetDate(item.startDate).defaultYMD
                }
              );
            });
          }
          if (type === 'all' || type === 'bl') {
            var onwerBuket = CLT.EnBucketList.find({userId: inheritData.inheritorId, startDate: {$gte: firstDate, $lte: lastDate}, lock: {$in: lock}}).fetch();
            var onwerBuketStory = CLT.EnStory.find({userId: inheritData.inheritorId, type: 'BS', startDate: {$gte: firstDate, $lte: lastDate}, lock: {$in: lock}}).fetch();
            onwerBuket.map(function(item) {
              for (var i = 0; i < 1; i++) {
                var timelineDate = item.startDate;
                if (i === 1) {
                  timelineDate = item.completeDate;
                }
                data.push(
                  {
                    _id: item._id,
                    postId: item._id,
                    userId: item.userId,
                    type: item.type,
                    title: item.title,
                    content: item.content,
                    images: item.images,
                    lock: item.lock,
                    timelineDate: global.utilGetDate(item.startDate).defaultYMD
                  }
                );
              }
            });
            onwerBuketStory.map(function(item) {
              data.push(
                {
                  _id: item._id,
                  postId: item._id,
                  userId: item.userId,
                  type: item.type,
                  title: item.title,
                  content: item.content,
                  images: item.images,
                  lock: item.lock,
                  timelineDate: global.utilGetDate(item.startDate).defaultYMD
                }
              );
            });
          }
          if (type === 'all' || type === 'tc') {
            var onwerTime = CLT.EnTimeCapsule.find({userId: inheritData.inheritorId, status: {$ne: 'PR'}, regDate: {$gte: firstDate, $lte: lastDate}, lock: {$in: lock}}).fetch();
            onwerTime.map(function(item) {
              var groupMember = null;
              groupMember = global.fn_groupMemberNickName(item.userId, item.groupMember); // 참여자
              data.push(
                {
                  _id: item._id,
                  postId: item._id,
                  userId: item.userId,
                  type: 'TC',
                  title: item.title,
                  content: '<span class="listTh">참여자</span>: ' + groupMember + '<br/>' + '<span class="listTh">매립지</span>: ' + item.buryLocationName + '<br/>' + '<span class="listTh">개봉일</span>: ' + item.unsealDate,
                  images: [],
                  groupMember: item.groupMember,
                  lock: item.lock,
                  timelineDate: global.utilGetDate(item.regDate).defaultYMD
                }
              );
            });
          }
        }
      }

      // 상속받은내역의 데이터
      var instPathData = CLT.Inh.find(
        {userId: inheritData.userId, inheritorId: inheritData.inheritorId, msgId: {$ne: ''}}
      ).fetch();

      instPathData = instPathData.map(function(item) {
        return {
          _id: item._id,
          userId: item.userId,
          type: 'path',
          title: item.msgId + '님으로 부터 상속받은 내역 입니다.',
          content: '',
          lock: false,
          timelineDate: ''
        };
      });
      return {
        userId: inheritData.userId,
        ownerId: inheritData.inheritorId,
        instPathData: instPathData,
        timeline: data
      };
    }
  },
  getInheritanceInstace: function(_id, userId, inheritorId) {
    var result = [];
    var inhData = CLT.Inh.findOne({_id: _id});

    var imKey = [];
    var meKey = [];
    var imLifeKey = [];
    var blKey = [];
    var tcKey = [];
    for (var i = 0; i < inhData.contents.length; i++) {
      switch(inhData.contents[i].type) {
        case 'IM': case 'BS': imKey.push(inhData.contents[i].contentId); break;
        case 'ME': meKey.push(inhData.contents[i].contentId); break;
        case 'LT': imLifeKey.push(inhData.contents[i].contentId); break;
        case 'BL': blKey.push(inhData.contents[i].contentId); break;
        case 'TC': tcKey.push(inhData.contents[i].contentId); break;
        // case 'IM': imkey.push(inhData[i].contentId); break;
      }
    }

    var story = CLT.EnStory.find({_id: {$in: imKey}});
    var bucket = CLT.EnBucketList.find({_id: {$in: blKey}});
    var tc = CLT.EnTimeCapsule.find({_id: {$in: tcKey}});
    var it = CLT.Inh.find({
      userId: userId,
      inheritorId:inheritorId,
      msgId: {$ne: ''}
    }).fetch();

    inhData.contents.map(function(item) {
      story.map(function(subItem) {
        if (item.contentId === subItem._id) {
          result.push({
            contentId: subItem._id,
            title: subItem.title,
            type: subItem.type,
            lock: subItem.lock,
            isInstant: item.isInstant,
            regDate: subItem.startDate,
            openedUser : item.openedUser ? item.openedUser : []
          });
        }
      });

      meKey.map(function(subItem) {
        if (item.contentId === 'ME' || item.contentId === 'BS') {
          result.push({
            contentId: 'ME',
            title: 'ME',
            type: item.type,
            lock: false,
            isInstant: item.isInstant,
            regDate: subItem.regDate,
            openedUser : item.openedUser ? item.openedUser : []
          });
        }
      });

      imLifeKey.map(function(subItem) {
        if (item.contentId === 'LT') {
          result.push({
            contentId: 'LT',
            title: 'LT',
            type: item.type,
            lock: false,
            isInstant: item.isInstant,
            regDate: subItem.regDate,
            openedUser : item.openedUser ? item.openedUser : []
          });
        }
      });

      bucket.map(function(subItem) {
        if (item.contentId === subItem._id) {
          result.push({
            contentId: subItem._id,
            title: subItem.title,
            type: subItem.type,
            lock: subItem.lock,
            isInstant: item.isInstant,
            regDate: subItem.startDate,
            openedUser : item.openedUser ? item.openedUser : []
          });
        }
      });

      tc.map(function(subItem) {
        if (item.contentId === subItem._id) {
          result.push({
            contentId: subItem._id,
            title: subItem.title,
            type: 'TC',
            lock: subItem.lock,
            isInstant: item.isInstant,
            regDate: subItem.regDate,
            openedUser : item.openedUser ? item.openedUser : []
          });
        }
      });
    });
    result = _.union(result, it);
    return result;
  },
  //상속인 아이디로 상속정보 가져오기
  getLastLetter:function(loginUserId, targetId){
    return CLT.Inh.findOne({userId:loginUserId, inheritorId:targetId});
  },

  // 상속자가 죽음설정했을때 상속인(비유저)에게 이메일 보내기
  sendInheritanceEmail: function(_data){
    if(Meteor.isServer){
      // 같은 inheritorId가 있을때 데이터를 합친다
      var group = _.map(_.groupBy(_data, function(doc) {
        return doc.inheritorId;
      }),function(grouped) {
        var _contents = _.pluck(grouped, "contents").join(',');
        return {
          userId: grouped[0].userId,
          inheritorId: grouped[0].inheritorId,
          eMail: grouped[0].eMail,
          name: grouped[0].name,
          contents: _contents.split(',').length
        };
      });
      _.each(group, function(info){
        var emailCode = 'ih' + info.inheritorId + '/' + info.eMail;
        var encdCode = global.utilAES(emailCode, 'encrypt');
        //이메일 전송
        var email_info = {
          senderName : global.fn_getName(info.userId),
          receiverName : info.name ? info.name : global.fn_getName(info.inheritorId),
          email : info.eMail,
          code : encdCode,
          contentsCnt: info.contents
        };

        var htmlContext = export_email_inheritance(email_info, 'death');
        var emailSend = global.fn_sendEmail('cert', email_info.email, "[It's my story] " + email_info.senderName + " 님으로 부터 디지털 컨텐츠를 상속 받았습니다.", htmlContext, '');
        Meteor.call('sendEmail', emailSend);

        // CLT.EnTimeCapsule.update({_id : _data._id, nonUserGroupMember : {$elemMatch :{nonUserName:info.nonUserName,  nonUserEmail:info.nonUserEmail}}},{$set:{"nonUserGroupMember.$.emailCode": emailCode}});
      });
    }
  },

  // 상속인 비유저 리스트
  getInheritorNonUserList: function(userId) {
    return CLT.Inh.find({userId: userId, eMail: {$exists: true}}).fetch();
  }
});
