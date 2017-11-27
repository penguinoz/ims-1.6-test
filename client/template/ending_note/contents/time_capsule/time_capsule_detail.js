import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 타임캡슐 상세
var templateName = 'timeCapsuleDetail';
var dynamicTemplateData = {};
var _id = null;
var map = null;
var defaultLat = 37.537798;
var defaultLng = 127.001216;
var isAuthor= null; //사용자 역할(글 작성자(admin), 그룹원(member), )
var markers;
var instance;
var messageUsersTemp;

Template[templateName].onCreated(function(){
  markers = [];
  isAuthor= null;
  // Session.set('timeCapsuleDetail collection', null);
  Session.set('hpFirstHidden', false);
  Session.set('page interval', null);
  instance = this;
  instance.timeCapsuleDetail = new ReactiveVar();
  instance.groupMember = new ReactiveVar();
  instance.messageData = new ReactiveVar();
  instance.messageUsers = new ReactiveVar();


  _id = null; // imContent의 글ID

  if(instance.data){
    dynamicTemplateData = instance.data;
    _id = dynamicTemplateData._id;
  }

  var openCountFlag = true;
  var subscription = instance.subscribe("getTimeCapsuleByUid", _id);
  instance.autorun(function () {
    if(subscription.ready()){
      var timeCapsule = {};
      timeCapsule = CLT.EnTimeCapsule.findOne();
      if (timeCapsule) {
        timeCapsule.type = 'TC';
        var isStatusOpened = CLT.EnTimeCapsule.find(
          {
            status : 'BR',
            groupMember: {$elemMatch: {userId : global.login.userId, openedDate :{$exists:true}}}
          }
        ).count() > 0 ? true : false;

        if(isStatusOpened) {
          timeCapsule.status = 'US';
        }


        var commentCount = CLT.ImsComment.find({postId: _id}).count();
        var likeList = CLT.ImsLike.find({postId: _id}).fetch();
        var messageCount = CLT.EnCapsuleMessage.find({capsuleId: _id}, {sort: {regDate:1}}).count();
        var otherUsersMessageCount = CLT.EnCapsuleMessage.find({capsuleId: _id, userId:{$ne : global.login.userId}}, {sort: {regDate:1}}).count();
        var myMessages;
        if(timeCapsule.status === 'PB'){
          myMessages = CLT.EnCapsuleMessage.find({capsuleId: _id}).fetch();
        } else {
          myMessages = CLT.EnCapsuleMessage.find({capsuleId: _id, userId:global.login.userId}).fetch();
        }


        timeCapsule.commentCount = commentCount;
        timeCapsule.like = likeList;
        timeCapsule.regDate = global.utilGetDate(timeCapsule.regDate).default; //날짜형태 변환
        timeCapsule.messageCount = messageCount;
        timeCapsule.myMessages = myMessages;
        timeCapsule.otherUsersMessageCount = otherUsersMessageCount;
        // timeCapsule.messgeUsers = messgeUsers;

        if(_.isEqual(timeCapsule.userId, global.login.userId)) {
          isAuthor = true;
        } else {
          isAuthor = false;
        }

        if (openCountFlag && timeCapsule.status !== 'PR') {
          // 글의 조회수를 1 카운터한다
          // console.log(timeCapsule.open);
          var updateData = {
            open: timeCapsule.open + 1
          };
          Meteor.call('upsertTimeCapsule', _id, updateData, function(error) {
            if (error) {
              return alert(error);
            }
          });
          openCountFlag = false;
        }
        var tempGroupMember = [];
        tempGroupMember = _.pluck(timeCapsule.groupMember, 'userId');
        // instance.groupMember.set(tempGroupMember);

        //nickName가져오기
        Meteor.call('getNickAndImg', tempGroupMember, function(error, result){
          if(error){
            console.log(error);
          } else {
            var userInfo = result;
            instance.groupMember.set(userInfo);

            var extendData = _.findWhere(userInfo, {userId : timeCapsule.userId});
            timeCapsule.nickName  = extendData.nickName;
            timeCapsule.profileImg  = extendData.profileImg;
            timeCapsule.groupMember = userInfo;

            instance.timeCapsuleDetail.set(timeCapsule);
            var latLng = new google.maps.LatLng(timeCapsule.buryLat,timeCapsule.buryLng);
            setMarker(latLng);

          }
        });

        //메시지 정보 설정하기
        getMesseageList(timeCapsule.status);
      }
    }
  });
});
Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpCollection: function(){
    if (Template.instance().timeCapsuleDetail.get()) {
      return Template.instance().timeCapsuleDetail.get();
    }
  },
  hpStatusTypeCheck: function(status, thisStatus) {
    return status === thisStatus;
  },
  hpLikeFlag: function(likeList) {
    var flag = false;
    if (likeList) {
      if (_.findWhere(likeList, {userId:global.login.userId})) {
        // 현재 글에서 좋아요를 했는지 않했는지 체크
        flag = true;
      }
    }
    return flag;
  },
  hpIsExistNoneUser: function(nonUserGroupMember){
    var result = false;
    if(!_.isEmpty(nonUserGroupMember)){
      result = true;
    }
    return result;
  },
  hpIsExistGroupMemger: function(groupMember, nonUserMember){
    var result = false;
    var postUserId = this.userId;
    var groupMemberExceptMe = _.reject(groupMember, function(userInfo){
      return userInfo.userId === postUserId;
    });

    if((global.fn_isExist(groupMemberExceptMe) && groupMemberExceptMe.length > 0)||nonUserMember.length > 0){
      result = true;
    }
    return result;
  },
  hpMessageCollection: function(){
    return Template.instance().messageData.get();
  },
  hpMessageUsers: function(){
    return Template.instance().messageUsers.get();
  },
  hpTimeCapsuleLog: function(){
    return CLT.ImsLog.find({postId:_id},{sort:{regDate:-1, logType:-1}});
  },
  hpLocationInfo: function(){
    var result = null;
    var data = {
      class : 'content-map',
      location : {},
      placeName : this.buryPlace,
      // scrollSet : true, //렌더에서 커스텀 스크롤이 설정되지 않는 문제가 있어서 설정함 true일경우 maptemplate에서 이 화면의 스크롤을 정의한다.
      // hiddenOption : true
    };
    data.status = this.status;
    data.unsealDate = this.unsealDate;
    data.location.lat = parseFloat(this.buryLat);
    data.location.lng = parseFloat(this.buryLng);
    result = data;
    return result;
  },
  hpCalcDday: function(unsealDate){
    var result = {};
    var diffDate = global.fn_diffDate(unsealDate);
    var dDate = [];
    // 6543
    if(_.isEqual(diffDate.diffDay, 'day')){
      dDate = diffDate.diffDay;
    } else {
      for(i=0; i < diffDate.diffDay.length; i++){
        dDate.push({dateNum : diffDate.diffDay.substring(i,i+1)});
      }
    }
    // var dDayFirstDateNum = diffDate.diffDay.substring(0,1);
    // var dDayLastDateNum = diffDate.diffDay.substring(1,2);

    result = {
      dDate : dDate,
      flag : diffDate.flag
    };
    return result;
  },
  hpisFromPopup: function(){
    var fromView = "";
    if(Template.instance().data && Template.instance().data.parentViewId){
      fromView = Template.instance().data.parentViewId.replace("Template.","");
    }
    if(Template.instance().data && Template.instance().data.unableGoList){
      //상속화면 접근시
      return false;
    }else{
      return true;
    }
  },
  hpAuthorCheckGroup : function(author, member){
    if(author === global.login.userId && member !== author){
      return true;
    }else{
      return false;
    }

  },
  //대상과 작성자 비교
  hpisAuther :function(targetId){
    var userId = Template.instance().timeCapsuleDetail.get().userId;
    if(userId === targetId){
      return true;
    }else{
      return false;
    }
  },
  hpisNullCheck :function(param){
    if(typeof(param)=== "object"){
      if(param.path){
        return true
      }else{
        return false;
      }
    }

    if(!param || param.length === 0){
        return false;
    }else{
      return true;
    }
  },
  hpCheckIndex0 : function(index){
    var status =  Template.instance().timeCapsuleDetail.get().status;
    if(index === 1 && status === 'BS'){
      return true;
    }else{
      return false;
    }
  },
  hpFirstHidden: function(){
    return Session.get('hpFirstHidden');
  },
  // 메세지 오픈유저 확인 openusers(Array)
  hpCheckOpenMsgUsers : function(openUsers){
    //undefined 방어코딩
    if(!openUsers){
      return false;
    }
    for(var i in openUsers){
      if(openUsers[i] === global.login.userId){
        //오픈유져
        return true;
      }
    }
    //비오픈 유져
    return false;
  },
  hpIsChanged: function(messageUsers){
    if(messageUsers !== messageUsersTemp){
      messageUsersTemp = messageUsers;
      return false;
    } else {
      return true;
    }
  }
});
Template[templateName].events({
  //비유져 수신자 삭제
  "click a[name='delNonListTag']":function(e,t){
    e.preventDefault();
    var self = this;
    global.utilConfirm(self.nonUserName+'를 정말 삭제 하시겠습니까?').then(function(val) {
      if (!val) {
        return;
      }else{
        var nonMembers = t.timeCapsuleDetail.get().nonUserGroupMember;
        var barId = t.timeCapsuleDetail.get()._id;
        var nonUserParam = [];
        nonMembers.map(function(item, i){
          if(item.nonUserEmail !== self.nonUserEmail){
            nonUserParam.push(item);
          }
        });
        Meteor.call('delNonGroupMember',barId,nonUserParam,function(err,res){

        });
      }
    }).catch(swal.noop);
  },
  //수신자/참여자 삭제
  "click a[name='delGroupListTag']":function(e,t){
    e.preventDefault();
    var self = this;
    global.utilConfirm(self.nickName+'를 정말 삭제 하시겠습니까?').then(function(val) {
      if (!val) {
        return;
      }else{
        var groupMember = t.timeCapsuleDetail.get().groupMember;
        var barId = t.timeCapsuleDetail.get()._id;
        var userParam = [];

        groupMember.map(function(item, i){
          if(item.userId !== self.userId){
            userParam.push(item);
          }
        });

        Meteor.call('delGroupMember',barId,userParam,function(err,res){
          if (!err) {
            Meteor.call('enTimelineDalete', barId, self.userId);
          }
        });
      }
    }).catch(swal.noop);
  },
  //비유저명 변경
  "click .nonUsersClass" : function(e, t){
    e.preventDefault();
    var modalobj = {};
    modalobj.template = "timeCapsuleEditNoneuserPopup";
    modalobj.size = 'imsr-pop modal-md timecapsule';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '직접 입력한 수신인 정보 수정',
      parentViewId: Blaze.currentView.name,
      _id : t.data._id,
    };
    if($("input[name=capsuleGroupRadio]:checked").val() === 'group'){
      modalobj.data.preSelectedUsers = friendsListParam;
      modalobj.data.type = 'group';
      // modalobj.data.unUserFriends = nonUserFriendsList;
    }else{
      // modalobj.data.preSelectedUsers = friendsprivateParam;
      modalobj.data.type = 'private';
      modalobj.data.nonUsersInfo = t.timeCapsuleDetail.get().nonUserGroupMember;
    }
    global.utilModalOpen(e, modalobj);
  },
  "click #btnOpenComment": function(e, t){
    e.preventDefault();
    var slideTarget = $('.comment-container');
    slideTarget.slideToggle( "fast", function() {
      if(slideTarget.hasClass("on")){
        slideTarget.removeClass("on");
        t.$(e.target).html("<span class='glyphicon glyphicon-chevron-top'></span>댓글접기");
        t.$(e.target).parent().css("border-top", "1px solid #f1e6cc");
      }else{
        slideTarget.addClass("on");
        t.$(e.target).html("<span class='glyphicon glyphicon-chevron-bottom'></span>댓글열기");
        t.$(e.target).parent().css("border-top", "0px");
      }
    });
  },
  //목록으로
  'click #btnToList' : function(e, t){
    e.preventDefault();
    var templateData = {};
    var getSessionData = Session.get('endingNoteList templateData');
    if(getSessionData && getSessionData.data.lifeViewDataList){
      templateData.headerTmp = '';
      templateData.contentTmp = getSessionData.data.fromView;
      templateData.data = getSessionData.data.lifeViewDataList;
      if(getSessionData.data.lifeViewOriginData){
        templateData.data = getSessionData.data.lifeViewOriginData;
      }
      Session.set('endingNoteList templateData', templateData);
      return;
    }
    moveToList();
  },
  // 좋아요 유저리스트
  "click #btnLikeList": function(e, t) {
    e.preventDefault();
    var postId = e.target.getAttribute('postId');
    Session.set('endingNoteLikeList postId', postId);
  },
  //메시지 열고 닫기
  "click .msgTitle": function(e, t) {
    e.preventDefault();
    var targetId = this._id;
    // console.log($('#msg' + targetId).attr('class'));
    var isActive = $('#msg' + targetId).attr('class').indexOf('active') >= 0 ? true : false;
    if(isActive) {
      $('#msg' + targetId).removeClass('active');
    } else {
      $('#msg' + targetId).addClass('active');
    }
  },
  //지도, 이미지 선택
  "click #abucketImage,#abucketMap": function(e,t){
    e.preventDefault();
    if(_.isEqual(e.currentTarget.id,"abucketImage")){
      $("#capsuleImageViewer").attr("hidden", false);
      $("#map-canvas").attr("hidden", true);
      $('#abucketMap').removeClass('active');
      $('#abucketImage').addClass('active');
    } else {
      $("#capsuleImageViewer").attr("hidden", true);
      $("#map-canvas").attr("hidden", false);
      $('#abucketMap').addClass('active');
      $('#abucketImage').removeClass('active');
      Session.set('hpFirstHidden',true);
    }
  },
  //수정버튼 클릭
  "click #DetailMod": function(e, t){
    e.preventDefault();
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
    templateData.contentTmp = 'timeCapsuleWriting';
    templateData.data = {
      _id : this._id,
      parentViewId : Blaze.currentView.name.substr(9),
      selectedMenu : dynamicTemplateData.selectedMenu,
      statusMenu : dynamicTemplateData.statusMenu,
      contentTmp : dynamicTemplateData.contentTmp,
      searchOption : dynamicTemplateData.searchOption,
    };

    Session.set('endingNoteList templateData', templateData);
  },
  //매립 버튼
  "click #DetailBury": function(e, t){
    e.preventDefault();
    var self = this;
    if(this.messageCount <= 0){
      global.utilAlert('타임캡슐을 매립하려면 메시지가 1개 이상 등록되어야 합니다.');
    } else {
      global.utilConfirm('매립 후 수신자 정보 이외의 수정은 불가하며, 개봉 시까지 메시지가 보이지 않습니다. \r\n매립하시겠습니까?').then(function(val) {
        if (val) {
          var _id = self._id;
          var data = null;
          Meteor.call('getTimeCapsuleById', _id, function(error, result) {
            if (result) {
              data = result;
            }
          });

          var condition = {
            _id : _id
          };

          var dataObj = {
            $set : {
              status : 'BR',
              buryDate : global.utilGetDate().default,
              updateDate : global.utilGetDate().default
            }
          };

          var unsealDate = t.timeCapsuleDetail.get().unsealDate; // 개봉일

          Meteor.call('updateTimeCapsule', condition, dataObj, function(error, result){
            if(error){
              return console.log(error);
            } else {
              var isGroup =  self.authorType === 'private' ? false : true;
              //매립 시 비회원 캡슐 이메일 전송
              if(self.authorType === 'private' && self.nonUserGroupMember && self.nonUserGroupMember.length > 0){
                Meteor.call('sendTimeCapsuleEmail', self);
              }
              Meteor.call('setLog', _id, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.bury, 'bury');
              // if (self.authorType === 'private') {
              //   // 개인일때는 매립할때 수신자들에게 타임라인을 추가 시켜준다
              //   for (var i = 0; i < data.groupMember.length; i++) {
              //     if (data.groupMember[i].userId !== self.userId) {
              //       // 타임라인 등록 및 히스토리 등록
              //       global.utilTimelineRegister(self._id, data.groupMember[i].userId, 'TC', global.utilGetDate().defaultYMD, unsealDate, isGroup);
              //     }
              //   }
              // }

              // var timelineObj = [];
              // data.groupMember.map(function(item) {
              //   timelineObj.push({
              //     userId: item.userId,
              //     timeClass: 'start',
              //     contentType: 'E',
              //     timelineDate: global.utilGetDate().defaultYMD,
              //     updateDate: global.utilGetDate().default
              //   });
              //   timelineObj.push({
              //     userId: item.userId,
              //     timeClass: 'end',
              //     contentType: 'E',
              //     timelineDate: unsealDate,
              //     updateDate: global.utilGetDate().default
              //   });
              // });

              // 타임라인 추가
              data.groupMember.map(function(item) {
                global.utilTimelineRegister(self._id, item.userId, 'TC', global.utilGetDate().defaultYMD, unsealDate, isGroup);
              });

              var buryObj = {
                postId: self._id,
                typeKey: self._id,
                commentKey: '',
                postType: 'TC',
                type: 'BR',
                user: '',
                timelineDate: global.utilGetDate().defaultYMD,
                regDate: global.utilGetDate().default,
                updateDate: global.utilGetDate().default
              };
              data.groupMember.map(function(item) {
                buryObj.userId = item.userId;

                var contentType = 'bury';
                if (self.type === 'private') {
                  if (item.userId === self.userId) {
                    // 매립히스토리 추가
                    // global.utilHistoryInsert(buryObj);
                  }
                  contentType = 'receive';
                } else {
                  // 매립히스토리 추가
                  // global.utilHistoryInsert(buryObj);
                }
                if (item.userId !== global.login.userId) {
                  // 알림
                  var options = {
                    userId : self.userId,
                    title: data.title
                  };
                  Meteor.call('setNoti', item.userId, 'TC', _id, contentType, options);
                }
              });
              dynamicTemplateData.statusMenu = 'bury';
              dynamicTemplateData.contentTmp = 'timeCapsuleContentBury';
              moveToList('timeCapsuleDetail');
            }
          });
        }
      }).catch(swal.noop);
    } //if
  },
  //수신인 정보 수정
  "click #DetailEditUser": function(e, t){
    e.preventDefault();
    var modalobj = {};

    // console.log(this);
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-md timecapsule';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '수신인 정보수정',
      _id : this._id,
      nonUsersInfo : this.nonUserGroupMember
    };
    global.utilModalOpen(e, modalobj);
  },
  //메시지 추가 버튼 클릭
  "click #addMessage": function(e, t){
    e.preventDefault();

    var modalobj = {};

    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-sm timecapsule';
    modalobj.fade = false;    modalobj.backdrop = 'static';
    modalobj.data = {
      capsuleId : _id,
      groupMember: t.groupMember.get(),
      requestStatus : 'new'
    };

    global.utilModalOpen(e, modalobj);
  },
  //메시지 수정 버튼 클릭
  "click #aMessageEdit": function(e, t){
    e.preventDefault();

    var modalobj = {};
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-sm timecapsule';
    modalobj.fade = false;    modalobj.backdrop = 'static';
    modalobj.data = {
      capsuleId : _id,
      messageId : this._id,
      backgroundImage : this.backgroundImage,
      content : this.content,
      requestStatus : 'edit'
    };

    global.utilModalOpen(e, modalobj);
  },
  //메시지 삭제 버튼 클릭
  "click #aMessageDelete": function(e,t){
    e.preventDefault();

    var self = this;
    global.utilConfirm('메시지를 삭제 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('deleteCapsuleMessage', self._id, function(error, result){
          if(error){
            console.log(error);
          } else {
            var historyObj = {
              postId: self.capsuleId,
              typeKey: self._id
            };
            global.utilHistoryDelete(historyObj);
            var deleteArray = [];
            deleteArray.push(result.backgroundImage);
            global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);

            Meteor.call('setLog', _id, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.deleteMessage, 'deleteMessage');
          }
        });
      }
    }).catch(swal.noop);
  },
  //공개작성창 열기 버튼
  "click #DetailOpen":function(){
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
    templateData.contentTmp = 'timeCapsuleOpenWrite';
    templateData.data = {
      isRelease : true,
      _id : _id,
      selectedMenu : dynamicTemplateData.selectedMenu,
      statusMenu : dynamicTemplateData.statusMenu,
      contentTmp : dynamicTemplateData.contentTmp,
      searchOption : dynamicTemplateData.searchOption,
    };
    Session.set('endingNoteList templateData', templateData);
  },
  //타임캡슐 삭제
  "click #DetailDelete": function(e, t){
    var self = this;
    global.utilConfirm('타임캡슐을 삭제하시겠습니까?').then(function(val) {
      if (val) {

        var timeCapsuleId = self._id;
        var status = self.status;
        var myMessages = self.myMessages;
        var timeCapsuleImage = self.image;
        //작성중
        switch(status){
          case 'PR':
          if(isAuthor){ //글 생성자
            if(self.otherUsersMessageCount > 0) { //다른맴버의 메세지가 남아있는경우
              global.utilAlert('다른 참여자의 메시지가 있어 삭제할 수 없습니다.');
              // console.log(self.otherUsersMessageCount);
            } else {
              // console.log(self.otherUsersMessageCount);
              //타임캡슐 전체 삭제
              Meteor.call('deleteTimeCapsule', timeCapsuleId, global.login.userId, function(error, result){
                if(error){
                } else {
                  //타임캡슐 이미지 삭제
                  if(timeCapsuleImage){
                    global.fn_DeleteS3ImagesByType([timeCapsuleImage], global.s3.folder.timeCapsule);
                  }

                  // 타임캡슐타임라인 & 히스토리 삭제 (참여자 포함)
                  Meteor.call('enTimelineDalete', timeCapsuleId);

                  //메시지 삭제
                  if(myMessages) {
                    _.each(myMessages, function(meesage){
                      Meteor.call('deleteCapsuleMessage', meesage._id, function(error,result){
                        if(error){ console.log(error); }
                        if(result){
                          var deleteArray = [];
                          if(result.backgroundImage && result.backgroundImage.indexOf(global.s3.bucketPath) > -1){
                            deleteArray.push(result.backgroundImage);
                            global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                          }
                        }
                      }); //method deleteCapsuleMessage
                      //메시지 삭제 로그(히스토리)
                      Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.deleteMessage, 'deleteMessage');
                    }); //each
                  }
                  //남은 사용자에게 쪽지 알림(미진행)

                  //타임캡슐 삭제 로그(히스토리)
                  Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.delete, 'delete');
                } //if
              }); //method deleteTimeCapsule

              //전체 리스트 화면으로 이동
              goToList();
            }

          } else { //생성자가 아닐때 그룹에서 제외
            Meteor.call('pullTimeCapsuleUserFromMember', global.login.userId, timeCapsuleId, function(error) {
              if (error) {
                return alert(error);
              } else {
                //메시지 삭제
                _.each(myMessages, function(meesage){
                  Meteor.call('deleteCapsuleMessage', meesage._id, function(error,result){
                    if(error){ console.log(error); }
                    if(result){
                      var deleteArray = [];
                      if(result.backgroundImage && result.backgroundImage.indexOf(global.s3.bucketPath) > -1){
                        deleteArray.push(result.backgroundImage);
                        global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                      }
                    }
                  }); //method deleteCapsuleMessage
                  //메시지 삭제 로그(히스토리)
                  //Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.deleteMessage, 'deleteMessage');
                }); //each


                // 타임캡슐타임라인 & 히스토리 삭제 (수신자만)
                Meteor.call('enTimelineDalete', timeCapsuleId, global.login.userId);

                // 그룹원삭제 후 삭제되었다는 히스토리메세지 그룹원에게 추가
                groupRemoveHistoryInsert(timeCapsuleId);

                //타임캡슐 삭제 로그(히스토리)
                Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.delete, 'delete');

                //전체 리스트 화면으로 이동
                goToList();
              }
            });
          }
          break;
          case 'BR': //매립
          //매립인경우
          if(self.otherUsersMessageCount > 0) { //다른맴버의 메세지가 남아있는경우
            //1. 그룹에서 날 제외, 내 메시지 삭제
            Meteor.call('pullTimeCapsuleUserFromMember', global.login.userId, timeCapsuleId, function(error, result){
              if(error){
              } else {

                //내 메시지가 있을경우 삭제
                if(myMessages){
                  _.each(myMessages, function(meesage){

                    Meteor.call('deleteCapsuleMessage', meesage._id, function(error,result){
                      if(error){ console.log(error); }
                      if(result){
                        var deleteArray = [];
                        if(result.backgroundImage && result.backgroundImage.indexOf(global.s3.bucketPath) > -1){
                          deleteArray.push(result.backgroundImage);
                          global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                        }
                      }
                    }); //method deleteCapsuleMessage
                    //메시지 삭제 로그(히스토리) >> 매립인경우는 타임캡슐 삭제시 메시지 삭제 히스토리는 남기지 않음
                    // Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.deleteMessage, 'deleteMessage');
                  }); //each

                }
                //타임캡슐 삭제 로그(히스토리)
                Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.delete, 'delete');

                // 타임캡슐타임라인 & 히스토리 삭제 (선택자만)
                Meteor.call('enTimelineDalete', timeCapsuleId, global.login.userId);

                // 그룹원삭제 후 삭제되었다는 히스토리메세지 그룹원에게 추가
                groupRemoveHistoryInsert(timeCapsuleId);

                //전체 리스트 화면으로 이동
                goToList();

              } //if
            });

            // 쪽지 알림(난 이그룹에서 탈퇴)
          } else { //다른맴버의 메세지가 없는경우
            //1. 전체 타임캡슐 삭제, 내 메시지 삭제
            Meteor.call('deleteTimeCapsule', timeCapsuleId, global.login.userId, function(error, result){
              if(error){
              } else {
                //타임캡슐 이미지 삭제
                if(timeCapsuleImage){
                  global.fn_DeleteS3ImagesByType([timeCapsuleImage], global.s3.folder.timeCapsule);
                }

                //메시지 삭제
                _.each(myMessages, function(meesage){
                  Meteor.call('deleteCapsuleMessage', meesage._id, function(error,result){
                    if(error){ console.log(error); }
                    if(result){
                      var deleteArray = [];
                      if(result.backgroundImage && result.backgroundImage.indexOf(global.s3.bucketPath) > -1){
                        deleteArray.push(result.backgroundImage);
                        global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                      }
                    }
                  }); //method deleteCapsuleMessage
                  //메시지 삭제 로그(히스토리)
                  // Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.deleteMessage, 'deleteMessage');
                }); //each


                // 타임캡슐타임라인 & 히스토리 삭제 (참여자 포함)
                Meteor.call('enTimelineDalete', timeCapsuleId);

                //타임캡슐 삭제 로그(히스토리)
                Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.delete, 'delete');

                //타임캡슐 삭제 알림(개별 수신자 있을경우만 사용)
                if(self.authorType === 'private' && self.groupMember.length > 1){

                  var options = {
                    userId : self.userId,
                    contentTitle : self.title,
                    contentRegDate : self.regDate
                  };

                  _.each(self.groupMember, function(member){
                    if(!_.isEqual(member.userId, self.userId)){
                      Meteor.call('setNoti', member.userId, 'TC', self._id, 'deleted', options);
                    }
                  });
                }

                //전체 리스트 화면으로 이동
                goToList();
              } //if
            }); //method deleteTimeCapsule

            //쪽지 알림(남은 맴버가 있으면 : 타임캡슐이 삭제되었습니다.)
          }
          break;
          case 'US': //개봉
          //매립인경우
          if(self.otherUsersMessageCount > 0) { //다른맴버의 메세지가 남아있는경우
            //1. 그룹에서 날 제외, 개봉일경우 메시지 삭제 안함
            Meteor.call('pullTimeCapsuleUserFromMember', global.login.userId, timeCapsuleId, function(error, result){
              if(error){
              } else {
                // 타임캡슐타임라인 & 히스토리 삭제 (선택자만)
                Meteor.call('enTimelineDalete', timeCapsuleId, global.login.userId);

                // 그룹원삭제 후 삭제되었다는 히스토리메세지 그룹원에게 추가
                groupRemoveHistoryInsert(timeCapsuleId);

                //타임캡슐 삭제 로그(히스토리)
                Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.delete, 'delete');

                //전체 리스트 화면으로 이동
                goToList();
              } //if
            });
            // 쪽지 알림(난 이그룹에서 탈퇴)

          } else { //다른맴버의 메세지가 없는경우
            //1. 전체 타임캡슐 삭제, 내 메시지 삭제
            Meteor.call('deleteTimeCapsule', timeCapsuleId, global.login.userId, function(error, result){
              if(error){
              } else {
                //타임캡슐 이미지 삭제
                if(timeCapsuleImage){
                  global.fn_DeleteS3ImagesByType([timeCapsuleImage], global.s3.folder.timeCapsule);
                }

                //메시지 삭제
                _.each(myMessages, function(meesage){
                  Meteor.call('deleteCapsuleMessage', meesage._id, function(error,result){
                    if(error){ console.log(error); }
                    if(result){
                      var deleteArray = [];
                      if(result.backgroundImage && result.backgroundImage.indexOf(global.s3.bucketPath) > -1){
                        deleteArray.push(result.backgroundImage);
                        global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                      }
                    }
                  }); //method deleteCapsuleMessage
                  //메시지 삭제 로그(히스토리)
                  Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.deleteMessage, 'deleteMessage');
                }); //each


                // 타임캡슐타임라인 & 히스토리 삭제 (참여자 포함)
                Meteor.call('enTimelineDalete', timeCapsuleId);

                //타임캡슐 삭제 로그(히스토리)
                Meteor.call('setLog', timeCapsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.delete, 'delete');

                //타임캡슐 삭제 알림(개별 수신자 있을경우만 사용)
                if(self.authorType === 'private' && self.groupMember.length > 1){
                  var options = {
                    userId : self.userId,
                    contentTitle : self.title,
                    contentRegDate : self.regDate
                  };

                  _.each(self.groupMember, function(member){
                    if(!_.isEqual(member.userId, self.userId)){
                      Meteor.call('setNoti', member.userId, 'TC', self._id, 'deleted', options);
                    }
                  });
                }
                //전체 리스트 화면으로 이동
                goToList();
              } //if
            }); //method deleteTimeCapsule

            //쪽지 알림(남은 맴버가 있으면 : 타임캡슐이 삭제되었습니다.)
          }
          break;
          case 'PB':
          //1. 전체 타임캡슐 삭제, 내 메시지 삭제
          Meteor.call('deleteTimeCapsule', timeCapsuleId, global.login.userId, function(error, result){
            if(error){
            } else {
              //타임캡슐 이미지 삭제
              if(timeCapsuleImage){
                global.fn_DeleteS3ImagesByType([timeCapsuleImage], global.s3.folder.timeCapsule);
              }

              //메시지 삭제
              _.each(myMessages, function(meesage){
                Meteor.call('deleteCapsuleMessage', meesage._id, function(error,result){
                  if(error){ console.log(error); }
                  if(result){
                    var deleteArray = [];
                    if(result.backgroundImage && result.backgroundImage.indexOf(global.s3.bucketPath) > -1){
                      deleteArray.push(result.backgroundImage);
                      global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                    }
                  }
                }); //method deleteCapsuleMessage
              }); //each


              //전체 리스트 화면으로 이동
              // goToList();
              moveToList();
            } //if
          }); //method deleteTimeCapsule
          break;
        }
      }
    }).catch(swal.noop);
  },
  //공개타임캡슐 수정 버튼 클릭
  "click #pbEditButton" : function(){
    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
    templateData.contentTmp = 'timeCapsuleOpenWrite';
    templateData.data = {
      isRelease : false,
      _id : _id,
      selectedMenu : dynamicTemplateData.selectedMenu,
      statusMenu : dynamicTemplateData.statusMenu,
      contentTmp : dynamicTemplateData.contentTmp,
      searchOption : dynamicTemplateData.searchOption,
    };
    Session.set('endingNoteList templateData', templateData);
  },
  "click img.content-map" : function(e, t){
    e.preventDefault();

    if(e.currentTarget.src){
      $(e.currentTarget).colorbox({
        href:e.currentTarget.src,
        maxWidth : '80%',
        maxHeight : '80%',
        opacity : 0.8,
        transition : 'elastic',
        current : ''
      });
    }
  },
  // //사용자 프로파일 클릭
  // "click .dropdown-toggle" : function(e, t){
  //   var nameCardHeight = 370;// 네임카드의 높이
  //   if((nameCardHeight + $(e.currentTarget).offset().top) > window.innerHeight){
  //     t.isDropup.set(true);
  //   } else {
  //     t.isDropup.set(false);
  //   }
  // },

  "click div[name = 'messageDataList']" : function(e, t){
    var openUserData = [];
    if(this.openUsers){
      var opUser = this.openUsers;
      for(var i in opUser){
        if(opUser[i] === global.login.userId){
          //이미 오픈한적 있음 escape
          return;
        }
      }
      openUserData = opUser;
    }

    openUserData.push(global.login.userId);
    Meteor.call("updateOpenMessageUser",this._id,openUserData,function(err,res){

    });

  }
});

function moveToList(templateNm){
  var templateData = {};
  var selectedMenu = 'my';
  var statusMenu ='';
  var contentTmp ='';

  if(Template.instance() && Template.instance().timeCapsuleDetail.get()){
    switch(Template.instance().timeCapsuleDetail.get().status){
      case 'PR':
        statusMenu = 'process';
        contentTmp = 'timeCapsuleContentProcess';
        break;
      case 'BR':
        statusMenu = 'bury';
        contentTmp = 'timeCapsuleContentBury';
        break;
      case 'US':
        statusMenu = 'unseal';
        contentTmp = 'timeCapsuleContentUnseal';
        break;
      case 'PB':
        statusMenu = 'public';
        contentTmp = 'timeCapsuleContentPublic';
        break;
      default:
        selectedMenu = 'all';
        statusMenu = 'all';
        contentTmp = 'timeCapsuleContentAll';
        break;
    }
  }


  templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
  templateData.contentTmp = templateNm ? templateNm : 'timeCapsuleContent';

  //개봉된 컨텐츠일경우 목록 클릭시 개봉화면으로 넘어가기 위한 설정
  if(dynamicTemplateData.contentTmpSec){
    dynamicTemplateData.contentTmp = dynamicTemplateData.contentTmpSec;
  }

  templateData.data = {
    selectedMenu : dynamicTemplateData.selectedMenu ? dynamicTemplateData.selectedMenu : selectedMenu, //my/all
    statusMenu : dynamicTemplateData.statusMenu ? dynamicTemplateData.statusMenu : statusMenu, // 상태(전체, 작성중, 매립, 개봉)
    contentTmp : dynamicTemplateData.contentTmp ? dynamicTemplateData.contentTmp : contentTmp, //
    searchOption : dynamicTemplateData.searchOption,
  };

  if(Template.instance() && Template.instance().data.status){
    templateData.data.contentTmp = "timeCapsuleContentPublic";
    templateData.data.selectedMenu = 'all';
    templateData.data.statusMenu = 'public';
    Session.set('timeCapsuleContent hpIsMyMenu', 'all');
  }

  Session.set('endingNoteList templateData', templateData);
}

function setMarker(latLng){
  var iconImg = "/images/googleMap/icon3.png";
  var iconOption = {
    url: iconImg, // url
    scaledSize: new google.maps.Size(43, 48), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(21, 49) // anchor
  };
  var marker = new google.maps.Marker({
    position: latLng,
    map: map,
    icon: iconOption
  });
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  markers.push(marker);
}

function goToList(){
  var templateData = {};

  templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
  templateData.contentTmp = 'timeCapsuleContent';
  Session.set('endingNoteList templateData', templateData);
}

// 수신자 또는 그룹원 타임캡슐 삭제시 다른그룹원들 히스토리 추가
var groupRemoveHistoryInsert = function(timeCapsuleId) {
  Meteor.call('getTimeCapsuleById', timeCapsuleId, function(error, result) {
    if (result) {
      var userDeleteObj = {
        postId: result._id,
        typeKey: result._id,
        postType: 'TC',
        type: 'GR',
        user: global.login.userId,
        timelineDate: global.utilGetDate().defaultYMD,
        regDate: global.utilGetDate().default,
        updateDate: global.utilGetDate().default
      };
      result.groupMember.map(function(item) {
        userDeleteObj.userId = item.userId;
        // 히스토리 삭제되었다는 메세지 추가
        global.utilHistoryInsert(userDeleteObj);
        // 그룹타임캡슐 삭제시 그룹원들에게 알림
        if (item.userId !== global.login.userId) {
          var options = {
            userId: global.login.userId,
            title: result.title
          }
          Meteor.call('setNoti', item.userId, 'TC', result._id, 'delete', options);
        }
      });
    }
  });
};

function getMesseageList(status){
    Session.get('timecapsulemessage autorun');
    var result = {};
    // <!-- 작성중일때는 내 메시지만 보여야 한다. -->
    // <!-- 개봉일때는 모든 메시지가 보여진다.-->
    // <!-- 매립시에는 메시지를 출력하지 않는다.-->
    // console.log('hpMessageCollection status', status, _id);

    var condition = null;
    switch(status) {
      case 'PR':
      condition = {
        userId:global.login.userId,
        capsuleId: _id
      };
      break;
      case 'US':
      condition = {capsuleId: _id};
      break;
      case 'PB':
      condition = {capsuleId: _id};
      break;
      case 'BR':
      return result;
    }

    if (!Session.get('page interval')) {
      var interval = {
        limit: 3,
        skip: 0
      };
      Session.set('page interval', interval);
    }
    result.data = CLT.EnCapsuleMessage.find(
      condition,
      {sort: {regDate:1}, skip: Session.get('page interval').skip, limit: Session.get('page interval').limit}
    ).fetch();

    var userInfo = _.pluck(result.data, 'userId');

    //nickName가져오기
    Meteor.call('getNickAndImg', userInfo, function(err, res){
      if(err){
        console.log(err);
      } else {

        _.map(result.data, function(info){
          var extend = _.findWhere(res, {userId : info.userId});
          info.nickName = extend ? extend.nickName : info.userId;
        });

        //각 메시지 사용자별 갯수(index) 처리
        //p : previousValue, c: currentValue, i: index
        result.data.reduce(function(p, c, i){
          if (p.userId !== undefined && c.userId in p) {
            p[c.userId]++;
            p.userId = c.userId;
            result.data[i].index = p[c.userId];
          } else {
            var condition = null;
            switch(status) {
              case 'PR':
              condition = {
                userId:c.userId,
                capsuleId: _id
              };
              break;
              case 'US':
              condition = {capsuleId: _id};
              break;
              case 'PB':
              condition = {capsuleId: _id};
              break;
              case 'BR':
              return result;
            }

            var previousData = CLT.EnCapsuleMessage.find(
              condition,
              {sort: {regDate:1}, limit: Session.get('page interval').skip}
            ).fetch();

            var previousDataCount = _.countBy(previousData, function(prev){
              return  prev.userId === c.userId ? 'count' : 'junk';
            });

            p[c.userId] = Session.get('page interval').skip === 0 ? 1 : previousDataCount.count+1;
            p.userId = c.userId;
            result.data[i].index = p[c.userId];
          }
          return p;
        }, {});

        result.count = CLT.EnCapsuleMessage.find(condition, {sort: {regDate:1}}).count();
        instance.messageData.set(result);
      }
    });

    var messageUsers = CLT.EnCapsuleMessage.find({capsuleId:_id}).fetch();
    messageUsers = _.uniq(_.pluck(messageUsers,'userId'));
    messageUsersTemp = _.uniq(_.pluck(messageUsers,'userId'));

    //메시지 작성한 사람 목록
    Meteor.call('getNickAndImg', messageUsers, function(err, res){
      if(err){
        console.log(err);
      } else {
        instance.messageUsers.set(res);
      }
    });
}

Template[templateName].onDestroyed(function(){
});
