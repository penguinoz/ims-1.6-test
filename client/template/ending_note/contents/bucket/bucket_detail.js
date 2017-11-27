import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

var templateName = 'bucketDetail';
var dynamicTemplateData = {};
var bucket = {};

Template[templateName].onCreated(function(){
  var instance = this;
  var _id = null; // imContent의 글ID
  instance.memberNicks = new ReactiveVar();
  instance.bucketDetailData = new ReactiveVar();
  Session.set('bucketDetail isBsExist', null);
  Session.set('bucketDetail hpUseGolistButton', false);
  Session.set('bucketStory hpBucketLog', null);

  if(this.data){
    dynamicTemplateData = this.data;
    _id = dynamicTemplateData._id;
    this._id = new ReactiveVar(dynamicTemplateData._id);
    this.subId = new ReactiveVar(dynamicTemplateData.subId);
    this.tab = new ReactiveVar(dynamicTemplateData.tab);
    this.groupUsers = new ReactiveVar();
  }

  var openCountFlag = true;
  var subscription = instance.subscribe('bucketList_id',_id);
  instance.autorun(function(){
    if(subscription.ready()){


      var bucket = CLT.EnBucketList.findOne();
      bucket.groupUsersInfo = [];
      var exePlanList = CLT.EnBucketListExecPlan.find({bucketId: _id},{sort:{"planStartDate": 1, "planCompleteDate": 1}}).fetch();
      var commentCount = CLT.ImsComment.find({postId: _id}).count();
      var favorite = CLT.ImsFavor.findOne({userId: global.login.userId}) ? true : false;
      var likeList = CLT.ImsLike.find({postId: _id}).fetch();

      if (openCountFlag) {
        // 글의 조회수를 1 카운터한다
        var updateData = {
          open: bucket.open + 1
        };
        Meteor.call('bucketUpsert', _id, updateData, function(error) {
          if (error) {
            return alert(error);
          }
        });
        openCountFlag = false;
      }

      var usersId = [];
      if(bucket.groupUsers[0]){
        usersId = bucket.groupUsers.slice(0);
        usersId.push(bucket.userId);
      } else {
        usersId.push(bucket.userId);
      }

      //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
      Meteor.call('getNickAndImg', usersId, function(error, result){
        if(error){
          console.log(error);
        } else {
          var userInfo = result;

          _.each(result, function(info){
            if(info.userId === bucket.userId){
              bucket.nickName = info.nickName;
              bucket.profileImg = info.profileImg;
            } else {
              bucket.groupUsersInfo.push(info);
            }
          });

          if (bucket) {
            bucket.exePlanList = exePlanList;
            bucket.commentCount = commentCount;
            bucket.favorite = favorite;
            bucket.like = likeList;
          }

          instance.bucketDetailData.set(bucket);//Session.set('bucketDetail collection', bucket);
        }
      });
    }
  });

  Meteor.call('getBucketStroyData',_id, function(error, result){
    if(error){
      return console.log(error);
    } else {
      isExistBS = result.isExistBS ? true : false;
      Session.set('bucketDetail isBsExist', isExistBS);

      var templateData = {};
      templateData.template = 'bucketStoryContent';
      templateData.data = {
        _id : _id,
        parentTemplateName : templateName,
        groupUsers: result.groupUsers,
        bucketListUserId: result.userId
      };
      Session.set('bucketStory templateList', templateData);
    }
  });


});

Template[templateName].onRendered(function(){
  // 에디터를 readonly 상태로 만들어 놓음
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template[templateName].events({
  //목록으로
  'click #btnToList' : function(e, t){
    e.preventDefault();

    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketContent';
    var getSessionData = Session.get('endingNoteList templateData');
    if(getSessionData && getSessionData.data.lifeViewDataList){
      templateData.headerTmp = 'endingNoteListHeaderSearch';
      templateData.contentTmp = getSessionData.data.fromView;
      templateData.data = getSessionData.data.lifeViewDataList;
      if(getSessionData.data.lifeViewOriginData){
        templateData.data = getSessionData.data.lifeViewOriginData;
      }
      Session.set('endingNoteList templateData', templateData);
      return;
    }

    templateData.data = {
      selectedMenu : dynamicTemplateData.selectedMenu,
      searchOption : dynamicTemplateData.searchOption,
      statusMenu : dynamicTemplateData.statusMenu
    };

    Session.set('endingNoteList templateData', templateData);
  },
  //태그 클릭
  "click a[name='tagButton']" : function(e, t){
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketContent';
    var textVal = this.valueOf();
    if(textVal.indexOf("<strong>") !== -1 && textVal.indexOf("</strong>") !== -1){
      textVal = textVal.replace("<strong>","");
      textVal = textVal.replace("</strong>","");
    }
    templateData.data = {
      selectedMenu : 'all',
      searchOption :
      {
        categorySerchParam:"",
        filter:"tag",
        searchText:textVal,
        sortParam:"startDateDesc",
      },
      statusMenu : ""
    };
    Session.set('endingNoteList templateData', templateData);
  },
  //수정화면 이동
  "click #DetailEdit": function(e, t){
    e.preventDefault();
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketwriting';
    templateData.data = dynamicTemplateData;

    var passData = t.bucketDetailData.get();//Session.get('bucketDetail collection');

    templateData.followData = {
      _id : passData._id,
      title : passData.title,					//제목
      content : passData.content,
      lock : passData.lock,
      images : passData.images,											// 업로드 이미지
      startDate : passData.startDate,
      completeDate : passData.completeDate,
      tagList : passData.tagList,
      privFollow : passData.privFollow,
      category : passData.category,
      exePlace : passData.exePlace,
      lat : passData.lat,
      lng : passData.lng,
      isCompleted : passData.isCompleted,
      exePlanList : passData.exePlanList,
      groupName : passData.groupName,
      groupType : passData.groupType,
      groupUsers : passData.groupUsers,
      follow : passData.follow
    };

    Session.set('endingNoteList templateData', templateData);
  },
  //버킷리스트 삭제
  "click #DetailDelete": function(e, t){
    e.preventDefault();
    var self = this;

    global.utilConfirm("버킷리스트를 삭제하면, 등록된 '버키스토리'는 '나는'으로 이동합니다. \n\r삭제 하시겠습니까??").then(function(val) {
      if (val) {
        var bucketDetailfotDel = t.bucketDetailData.get();//Session.get('bucketDetail collection');

        Meteor.call('bucketDelete',bucketDetailfotDel._id, global.login.userId, function(error, result) {
          if (error) {
            return alert(error);
          } else {
            //함수호출 (S3에서 image삭제하는 함수)
            if(global.fn_isExist(bucketDetailfotDel.images)){
              global.fn_DeleteS3ImagesByType(bucketDetailfotDel.images, global.s3.folder.bucketList);
            }

            var passData = bucketDetailfotDel;
            if (passData.follow) {
              // 따라하기한 버킷일때는 따라하기당한 버킷의 히스토리를 제거해야됨
              var historyObj = {
                postId: passData.postId,
                typeKey: passData._id,
                user: passData.userId,
                type: 'FW'
              };
              global.utilHistoryDelete(historyObj);
            }

            //실행계획 데이터 삭제
            Meteor.call('deleteBucketExecPlan', bucketDetailfotDel.exePlanList);
            // 타임라인 데이터 삭제
            Meteor.call('enTimelineDalete', bucketDetailfotDel._id, function(error) {
              if (error) {
                console.log(error);
              } else {
                var templateData = {};
                templateData.headerTmp = 'endingNoteListHeaderBucketList';
                templateData.contentTmp = 'bucketContent';
                Session.set('endingNoteList templateData', templateData);
              }
            });

            postIds = [];
            _.each(result, function(item){
              postIds.push(item._id);
            });
            Meteor.call('removeUsersBStory',bucketDetailfotDel._id,"");
            //로그테이블의 데이터 삭제여부에 따라 아래 기능 활성화
            //Meteor.call('deleteLog', bucketDetailfotDel._id);
          }
        });
      }
    }).catch(swal.noop);
  },
  // 좋아요 유저리스트
  "click #btnLikeList": function(e, t) {
    e.preventDefault();
    var postId = e.target.getAttribute('postId');
    Session.set('endingNoteLikeList postId', postId);
  },
  "click #btnfollowList": function(e, t) {
    e.preventDefault();
    var postId = e.target.getAttribute('postId');
    Session.set('endingNoteLikeList postId', postId);
  },
  //따라하기 버튼 클릭
  "click #doFollow": function(e, t){
    e.preventDefault();
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketwriting';
    templateData.data = dynamicTemplateData;

    var passData = t.bucketDetailData.get();//Session.get('bucketDetail collection');

    templateData.followData = {
      Author : passData.userId,//Session.get('bucketDetail collection').userId,
      title : passData.title,					//제목
      content : passData.content,
      lock : passData.lock,
      images : passData.images,											// 업로드 이미지
      startDate : passData.startDate,
      completeDate : passData.completeDate,
      tagList : "",
      privFollow : passData.privFollow,
      category : passData.category,
      exePlace : passData.exePlace,
      lat : passData.lat,
      lng : passData.lng,
      isCompleted : false,
      exePlanList : passData.exePlanList,
      postId : passData._id,
      userId : passData.userId,
      groupUsers: passData.groupUsers,
      categroy: passData.category
    };

    Session.set('endingNoteList templateData', templateData);
  },
  // 버키스토리 등록 클릭
  "click #addBucketStory": function(e, t){
    e.preventDefault();

    var modalobj = {};
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-md bucket';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      postId : dynamicTemplateData._id,
      parentTemplateName : templateName,
      groupUsers: bucket.groupUsers,
      bucketListUserId: bucket.userId
    };

    global.utilModalOpen(e, modalobj);
  },
  //이전 목록으로(하단 버키스토리에서 사용)
  "click #goList": function(e, t){
    var templateData = {};
    t.subId.set(null);
    templateData.template = 'bucketStoryContent';
    templateData.data = {
      _id: dynamicTemplateData._id,
    };
    Session.set('bucketStory templateList', templateData);

    //'이전' 버튼 활성화
    Session.set('bucketDetail hpUseGolistButton', false);
  },
  //이 버킷리스트에서 빠지기
  "click #outBucketGroup": function(e, t){
    var detailData = t.bucketDetailData.get();//Session.get('bucketDetail collection');
    e.preventDefault();

    var text = '버킷에서 빠지길 원합니까?';

    global.utilConfirm(text).then(function(val) {
      if (val) {
        var buketObj = {
          $pull: {groupUsers: global.login.userId}
        };
        Meteor.call('bucketUpdate', detailData._id, buketObj);  // group에서 자신 빠지기
        Meteor.call('enTimelineDalete', detailData._id, global.login.userId); // 히스토리 & 타임라인 삭제
        Meteor.call('removeUsersBStory',detailData._id, global.login.userId); // 버키스토리가 있는경우 나의 추억으로 옴기기

        var planId = detailData.exePlanList.map(function(item) {
          return item._id;
        });
        Meteor.call('deleteTimelineBucketExecPlan', planId, [global.login.userId]);  // 플랜삭제
        Meteor.call('setLog', detailData._id, null, detailData.userId, global.login.userId, global.pageType.bucketList, global.Message.bucketList.leaveBucket, 'leaveBucket');

        var options = {
          userId: global.login.userId,
          title: detailData.title
        };
        detailData.groupUsers.map(function(item) {
          if (item !== global.login.userId) {
            Meteor.call('setNoti', item, detailData.type, detailData._id, 'delete', options);
          }
        });

        var bucketData = detailData;//Session.get('bucketDetail collection');
        // if (bucketData.lock) {
        // 글이 비공개일때는 버킷list화면으로 이동
        var templateData = {};
        templateData.headerTmp = 'endingNoteListHeaderBucketList';
        templateData.contentTmp = 'bucketContent';
        Session.set('endingNoteListHeaderBucketList selectedMenu', null);
        Session.set('endingNoteList templateData', templateData);
        // }
      }
    }).catch(swal.noop);
  },
  //댓글 접기/열기
  "click #btnOpenComm": function(e, t){
    e.preventDefault();
    var slideTarget = $('.comment-bigcontainer');
    slideTarget.slideToggle( "fast", function() {
      e.stopPropagation();
      if(slideTarget.hasClass("on")){
        slideTarget.removeClass("on");
        t.$(e.target).html("<span class='glyphicon glyphicon-chevron-top'></span>댓글접기");
        t.$(e.target).parent().css("border-top", "1px solid #e0f0f0");
      }else{
        slideTarget.addClass("on");
        t.$(e.target).html("<span class='glyphicon glyphicon-chevron-bottom'></span>댓글열기");
        t.$(e.target).parent().css("border-top", "0px");
      }
    });
  },
  //즐겨찾기 클릭
  "click #favorite": function(e, t){
    //로그(즐겨찾기 버튼클릭 시) 임시 구현
    if(!this.favorite){ //즐겨찾기 설정
      Meteor.call('setFavorite', this._id, global.login.userId, this.userId);
      // Meteor.call('setLog', contentId, null, global.login.userId, global.login.userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketList.favorite, 'favorite');
    } else { //즐겨찾기 해제
      Meteor.call('removeFavorite', this._id, global.login.userId);
    }
    // Meteor.call('setFavorite', this._id, global.login.userId);
    // Meteor.call('setLog', contentId, null, global.login.userId, global.login.userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketList.favorite, 'favorite');
  },
  //본문내용 접기
  "click #contentDropdown":function(e, t){
    e.preventDefault();

    $('#dropdownTarget').show();
    var heights = $('#dropdownTarget div').height()  + 'px';
    // var tagHeights = $('.tag').height() ? $('.tag').height() : 0;
    // var heights = targetHeights + tagHeights + 30 ; //margin, padding값까지 합한값
    // heights = heights + 'px';
    if(!$('#contentDropdown').hasClass("open")){ //열기
      $('#contentDropdown').addClass("open");
      $('#dropdownTarget').animate({
        height: heights
      },{
        duration: 200,
        complete: function(){$('.tag').slideDown(50);}
      }
    );

    $('#contentDropdown').text('전체내용접기');
  }else{ //접기
    $('#contentDropdown').removeClass("open");
    $('#dropdownTarget').animate({
      height: '0px'
    }, {
      duration: 200,
      complete: function(){$('.tag').slideUp(50);}
    }
  );
  $('#dropdownTarget').addClass('content-short');
  $('#contentDropdown').text('전체내용보기');
}
},
//완료토글 변경
"change #isComplete": function(e, t){
  e.preventDefault();
  var completeTrue = {};
  var cofirmText = "";

  if(e.target.checked){
    cofirmText = "버킷을 완료처리하시겠습니까?";
  }else{
    cofirmText = "버킷의 완료를 취소 하시겠습니까?";
  }
  var button = {
    confirm: '예',
    cancel: '아니오'
  };
  global.utilConfirm(cofirmText, null, button).then(function(val) {
    if(val){
      var keyid = t.data._id;
      var compParam = e.target.checked;
      Meteor.call('bucketCompleteUpdate',keyid,compParam, function(err,res){
        if(err){console.log(err);}
      });
    }
  }, function(val){
    // 아니요
    e.target.checked = !e.target.checked;
    return;
  }).catch(swal.noop);


  // 기능 변경 삭제대기
  // if(e.target.checked){
  //   var contentId = t.data._id;
  //   var compDate = t.bucketDetailData.get().completeDate;//Session.get('bucketDetail collection').completeDate;
  //   completeTrue = {isCompleted: true};
  //   if(!compDate){
  //     completeTrue.completeDate = global.utilGetDate().defaultYMD;
  //   }else if(compDate > global.utilGetDate().defaultYMD){
  //     var button = {
  //       confirm: '예',
  //       cancel: '아니오'
  //     };
  //     global.utilConfirm('완료일을 오늘날짜로 변경하시겠습니까?', null, button).then(function(val) {
  //       if (val) {
  //         completeTrue.completeDate = global.utilGetDate().defaultYMD;
  //         Meteor.call('bucketUpsert', contentId, completeTrue, function(error){
  //           if(error){
  //             console.error(error);
  //           } else {
  //             var timelineObj = {
  //               userId: global.login.userId,
  //               timeClass: 'end',
  //               contentType: 'E',
  //               timelineDate: completeTrue.completeDate
  //             };
  //             Meteor.call('enTimelineUpdateOne', contentId, timelineObj);
  //             Meteor.call('setLog', contentId, null, global.login.userId, global.login.userId, global.pageType.bucketList, global.Message.bucketList.complete, 'complete');
  //           }
  //         });
  //       }
  //     });
  //   }
  //   if(!contentId){
  //     console.log('has not key');
  //     return;
  //   }
  //
  //   // console.log('contentId', contentId, completeTrue);
  //
  //   Meteor.call('bucketUpsert', contentId, completeTrue, function(error){
  //     if(error){
  //       console.error(error);
  //     } else {
  //       var timelineObj = {
  //         userId: global.login.userId,
  //         timeClass: 'end',
  //         contentType: 'E',
  //         timelineDate: completeTrue.completeDate
  //       };
  //       Meteor.call('enTimelineUpdateOne', contentId, timelineObj);
  //       Meteor.call('setLog', contentId, null, global.login.userId, global.login.userId, global.pageType.bucketList, global.Message.bucketList.complete, 'complete');
  //     }
  //   });
  // }else{
  //   //취소시 완료일 삭제
  //   var keyid = t.data._id;
  //   var compParam = e.target.checked;
  //   Meteor.call('bucketCompleteUpdate',keyid,compParam, function(err,res){
  //     if(err){console.log(err);}
  //     if(res){
  //
  //     }
  //   });
  // }
},
//따라하기토글 변경
"change #followPermit": function(e, t){
  e.preventDefault();
  var keyid = t.data._id;
  var compParam = e.target.checked;
  Meteor.call('bucketFollowPermitUpdate',keyid,compParam,function(err,res){
    if(err){console.log(err);}
    if(res){

    }
  });
},
//삭제클릭
"click #deleteBut": function(e, t){
  e.preventDefault();
  var postId = t.data._id;
  var targetUser = this.valueOf();
  if(confirm(targetUser+" 을 정말 삭제 하시겠습니까?")){
    Meteor.call('enTimelineDalete', postId, targetUser);
    Meteor.call('deleteTimelineBucketExecPlanSingle', postId, targetUser);
    Meteor.call('bucketDeleteMember',postId,targetUser,function(err, res){
      if(err){console.log(err);
      }else{
        Meteor.call('removeUsersBStory',postId, global.login.userId);
      }
    });
  }
},
//컨텐츠 이미지 상세보기
"click [name=froalaEditor] img": function(e, t){
  e.preventDefault();
  $(e.currentTarget).colorbox({
    href : e.currentTarget.src,
    maxWidth : '80%',
    maxHeight : '80%',
    opacity : 0.8,
    transition : 'elastic',
    current : ''
  });
}
});

Template[templateName].helpers({
  //기간 ~ 붙이는 함수
  //안씀 삭제?
  // hpAtachtChar:function(startDate, endDate){
  //   if(startDate || endDate){
  //     return true;
  //   }else{
  //     return false;
  //   }
  // },

  hpCollection: function() {
    if (Template.instance().bucketDetailData.get()) {
      return Template.instance().bucketDetailData.get();
    }
  },
  hpLikeFlag: function(likeList) {
    var flag = false;
    if (likeList) {
      // if (_.indexOf(likeList, global.login.userId) !== -1) {
      if(_.findWhere(likeList, {userId:global.login.userId})){
        // 현재 글에서 좋아요를 했는지 않했는지 체크
        flag = true;
      }
    }
    return flag;
  },
  hpGetContext: function () {
    if (Template.instance().bucketDetailData.get()) {
      return {
        key: global.editorSettings.key,
        _value: Template.instance().bucketDetailData.get().content,
        toolbarInline: true,
        imageUploadToS3: global.editorSettings.imageUploadToS3,
        placeholderText: null,
        // imageResize: false,
        // initOnClick: false,
        // dragInline: false,
        // imageMove: false,
        charCounterCount: false,
        pluginsEnabled: ['image','codeView','fontSize','link','url'],

        "_oninitialized": function(e, editior){
          Template.instance().$('div.froala-reactive-meteorized').froalaEditor('edit.off');
        },
        // "_onclick": function (e, editor, img) {
        //   if(img.target.src){
        //     $(img.target).colorbox({
        //       href:img.target.src,
        //       maxWidth : '80%',
        //       maxHeight : '80%',
        //       opacity : 0.8,
        //       transition : 'elastic',
        //       current : ''
        //     });
        //   }
        // }, //end _onclick
      };
    }
  },
  bucketContentList: function(){
    if (global.fn_isExist(Template.instance().subId.get()) && global.fn_isExist(Template.instance().bucketDetailData.get())) {
      var template = {};
      template = {
        template: 'bucketStoryDetail',
        data: {
          bucketStoryId: Template.instance().subId.get(),
          bucketListKey : Template.instance()._id.get(),
          groupUsers: Template.instance().bucketDetailData.get().groupUsers
        }
      };
      Session.set('bucketDetail hpUseGolistButton', true);
      Session.set('bucketStory templateList', template);
    }

    return Session.get('bucketStory templateList');
  },
  hpaddBkVisible: function(){
    if(Template.instance().bucketDetailData.get()){
      var fromView = "";
      if(Blaze.Template.parentData().viewName){
        fromView = Blaze.Template.parentData().viewName.replace("Template.","");
      }
      if(fromView === 'inheritanceListContentsDetailPopup'){
        //상속화면 접근시
        return true;
      }
      if(dynamicTemplateData && dynamicTemplateData.unableGoList){
        return false;
      }
      var editAthor = Template.instance().bucketDetailData.get().groupUsers||[];
      if(editAthor.indexOf(global.login.userId) > -1 || Template.instance().bucketDetailData.get().userId === global.login.userId){
        return true;
      }
      return false;
    }
  },
  hpCompBtVisible: function(boo){
    return !boo;
  },
  hpDelBtVisible: function(group){
    if(global.fn_isExist(group)){
      return false;
    }else{
      return true;
    }
  },
  hpisGroupMember: function(userList){
    for(var num in userList){
      if( userList[num] === global.login.userId){
        return true;
      }
    }
    return false;
  },

  hpUseGolistButton: function(){
    return Session.get('bucketDetail hpUseGolistButton');
  },
  hpisFromPopup: function(){

    if(dynamicTemplateData && dynamicTemplateData.unableGoList){
      //상속화면 접근시
      return false;
    }else{
      return true;
    }
  },
  hpTabList: function(tabType) {
    if (Template.instance().tab.get()) {
      return tabType === 'BP';
    } else {
      return tabType === 'BS';
    }
  },
  hpFollowerCount: function(){
    return ReactiveMethod.call('bucketFollowerCount', this._id);
  },
  //그룹여부 확인
  hpisGroupType: function(groupType){
    return groupType === 'group';
  },
  hpGroupName: function(groupName){
    if(groupName){
      return "("+groupName+")";
    }
    return "";
  },
  hpOpenOrClose: function(){
    return Session.get('bucketDetail isBsExist');
  },
  //즐겨찾기 active판단
  hpFavor : function(){
    if(this.favorite){
      return 'active';
    } else {
      return '';
    }
  },
  hpGroupMemgerNicks : function(members){
    var result = ReactiveMethod.call('getNickAndImg', members);
    return result;
  },
});

function commentUpsert(objData, _id, message) {
  Meteor.call('commentUpsert', objData, _id, function(error) {
    if (error) {
      return alert(error);
    } else {
      Session.set('bucketDetail cmtUpdate', null);
      alert(message);
    }
  });
}

Template[templateName].onDestroyed(function(){
  Session.set('bucketStory templateList',null);
});

Template.bucketLog.onCreated(function(){
  var instance = this;
  instance.bucketLog = new ReactiveVar();

  instance.autorun(function(){
    Meteor.call('getLog', instance.data._id, function(error, result){
      if(error){
        return console.log(error);
      } else {
        instance.bucketLog.set(result);
        // return instance.bucketLog.get();
      }
    });
  });

});


Template.bucketLog.onRendered(function(){
  console.log('render');
});

Template.bucketLog.helpers({
  hpBucketLog: function(){
    // if(Template.instance().bucketDetailData.get()){
    //   return ReactiveMethod.call('getLog', Template.instance().bucketDetailData.get()._id);
    //   // return CLT.ImsLog.find({postId:Template.instance().bucketDetailData.get()._id},{sort:{regDate:-1}}).fetch();
    // }
    return Template.instance().bucketLog.get();
  }
});
