import {global} from '/imports/global/global_things.js';

var templateName = 'timeCapsuleContentAll';

var userId = null;
var isPageOwner = false;
var selectedMenu = null;

Template[templateName].onCreated(function(){

  isPageOwner = false;
  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    userId = global.login.userId;
  } else {
    userId = global.login.pageOwner;
  }
  if(Session.set('timeCapsuleContent reflash') === null){
    Session.set('timeCapsuleContent reflash', "reload");
  }else{
    Session.set('timeCapsuleContent reflash', null);
  }

  Meteor.call('getTimeCapsuleTop3List', userId, isPageOwner, 4, 'my', function(error, result){
    if(error){
      console.log(error);
    } else {
      Session.set('timeCapsuleContentAll collectionTop', result);
    }
  });
});

Template[templateName].helpers({
  hpTimeCapsuleCollectionAl: function(){
    return Session.get('timeCapsuleContentAll collectionTop');
  },
  hpIsPrivateGroupCheck: function(postUserId, authorType){
    result = false;
    if(_.isEqual(authorType, 'group') ||  _.isEqual(global.login.userId, postUserId)){
      result = true;
    }
    return result;
  },
  hpIsEqualGroup : function(type){
    if(type === 'group'){
      return true;
    }else{
      return false;
    }
  },
  //3개이상일때 true (3넘어가면 안보여주기 )
  hpContentLength:function(num){
    return num>3;
  }
});

Template[templateName].onRendered(function(){
  if(this.data){
    if(this.data.selectedMenu) {
      selectedMenu = this.data.selectedMenu;
      if (selectedMenu === 'my') {
        $('#liTabMe').attr('class','active');
        $('#liTabAll').attr('class','');
      }
      else {
        $('#liTabAll').attr('class','active');
        $('#liTabMe').attr('class','');
      }
    }
  }

  // //jquery 스크롤 적용
  // var scrollCallbackOptions = {
  //   whileScrolling: function() {
  //     //return showMoreVisibleImContent(this);
  //   }
  // };
  // global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark", scrollCallbackOptions);


  var targetElementLeft = $('.hr-scroll');

  var scrollCallbackOptions = {
    whileScrolling: function() {
      //return showMoreVisibleImContent(this);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].events({
  //상세이벤트(작성중, 개봉)
  "click #processTitle,#unsealTitle": function(e, t){
    e.preventDefault();

    var searchOptionParam = {};
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
    templateData.contentTmp = 'timeCapsuleDetail';
    templateData.data = {
      _id : this._id,
      selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
      searchOption : searchOptionParam
    };

    switch(e.currentTarget.id){
      case 'processTitle':
        templateData.data.contentTmp = 'timeCapsuleContentProcess';
        templateData.data.statusMenu = 'process';
        break;
      case 'unsealTitle':
        templateData.data.contentTmp = 'timeCapsuleContentUnseal';
        templateData.data.statusMenu = 'unseal';
        break;
    }

    Session.set('endingNoteList templateData', templateData);

  },
  // 매립은 개봉일자 됬거나 지났을경우 다른 페이지로 이동해야하기 때문에 분류한다.
  "click #buryTitle": function(e,t){
    e.preventDefault();

    var capsuleId = this._id;
    var searchOptionParam = {};
    var templateData = {};
    //D-day체크
    diffResult = global.fn_diffDate(this.unsealDate);

    if(diffResult.flag === '-' && diffResult.diffDay !== 'day'){ //개봉일 지나지 않음
      searchOptionParam = {};

      templateData = {};
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleDetail';
      templateData.data = {
        _id : capsuleId,
        selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
        searchOption : searchOptionParam,
        statusMenu : 'all',
        contentTmp : 'timeCapsuleContentBury'
      };

      Session.set('endingNoteList templateData', templateData);
    } else {
      searchOptionParam = {};

      templateData = {};
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleOpenEffect';
      templateData.data = {
        _id : capsuleId,
        searchOption : searchOptionParam,
        innerData : this
        // buryLocationName
        // userId
        // groupMember
        // nonUserGroupMember
        // title
      };

      Session.set('endingNoteList templateData', templateData);
       //개봉일이거나 개봉일이 지남
      //여기에 개봉 이벤트로 가는 세션 변경값 설정해야함
      //아래 alert은 임시로 작성해놓음
      // var confirmText = 'D-day 로부터 ' + diffResult.diffDay + '일이 지났습니다. 개봉하시겠습니까?';
      // if(diffResult.diffDay === 'day') {
      //   confirmText = 'D-day 입니다. 개봉하시겠습니까?';
      // }
      // var self = this;
      // global.utilConfirm(confirmText).then(function(val) {
      //   if (val) {
      //     Meteor.call('setTimeCapsuleOpenedState', global.login.userId, capsuleId, function(error, result){
      //       if(error){
      //         return console.log(error);
      //       } else {
      //         //개봉 로그(히스토리)
      //         Meteor.call('setLog', capsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.unseal, 'unseal');
      //         // 개봉시 히스토리추가 및 타임라인 end값에 timelineDate추가
      //         var timelineObj = [{
      //           userId: global.login.userId,
      //           timeClass: 'end',
      //           contentType: 'E',
      //           timelineDate: self.unsealDate
      //         }];
      //         var openObj = {
      //           postId: self._id,
      //           typeKey: self._id,
      //           userId: global.login.userId,
      //           postType: 'TC',
      //           type: 'US',
      //           user: global.login.userId,
      //           timelineDate: global.utilGetDate().defaultYMD,
      //           regDate: global.utilGetDate().default,
      //           updateDate: global.utilGetDate().default
      //         };
      //         Meteor.call('enTimelineUpdate', self._id, timelineObj, function(error) {
      //           if (error) {
      //             return alert(error);
      //           } else {
      //             global.utilHistoryInsert(openObj);
      //             var searchOptionParam = {};
      //
      //             var templateData = {};
      //             templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      //             templateData.contentTmp = 'timeCapsuleDetail';
      //             templateData.data = {
      //               _id : capsuleId,
      //               selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
      //               searchOption : searchOptionParam,
      //               statusMenu : 'unseal',
      //               contentTmp : 'timeCapsuleContentUnseal'
      //             };
      //
      //             Session.set('endingNoteList templateData', templateData);
      //             Session.set('timeCapsuleContent reflash', capsuleId); //위 통계자료 갱신을 위함
      //           }
      //         });
      //       }
      //     });
      //   } else {
      //     searchOptionParam = {};
      //
      //     templateData = {};
      //     templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      //     templateData.contentTmp = 'timeCapsuleDetail';
      //     templateData.data = {
      //       _id : capsuleId,
      //       selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
      //       searchOption : searchOptionParam,
      //       statusMenu : 'bury',
      //       contentTmp : 'timeCapsuleContentBury'
      //     };
      //
      //     Session.set('endingNoteList templateData', templateData);
      //   }
      // });
    }
  },
  "click #timeContentWrite,#timeContentUnseal,#timeContentBury" : function(e,t){
    var searchOptionParam = {};
    searchOptionParam.filter = $('#keywordCondition option:selected').val();
    searchOptionParam.searchText = $('#keywordText').val();
    var templateData = {};
    var statMenu = "";
    switch(e.target.id){
      case 'timeContentWrite':
        templateData.contentTmp = 'timeCapsuleContentProcess';
        templateData.data = {
          // _id : _id,
          selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
          statusMenu : 'process',
          searchOption : searchOptionParam
        };
        statMenu = 'process';
        break;
      case 'timeContentUnseal':
        templateData.contentTmp = 'timeCapsuleContentUnseal';
        templateData.data = {
          // _id : _id,
          selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
          statusMenu : 'unseal',
          searchOption : searchOptionParam
        };
        statMenu = 'unseal';
        break;
      case 'timeContentBury':
        templateData.contentTmp = 'timeCapsuleContentBury';
        templateData.data = {
          // _id : _id,
          selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
          statusMenu : 'bury',
          searchOption : searchOptionParam
        };
        statMenu = 'bury';
        break;
    }
    Session.set('timeCapsuleContent selectedStatusMenu',statMenu)
    templateDataBackup = templateData;
    Session.set('timeCapsuleContent templateData', templateData);
  },
  "click #timeWriteDot,#timeDotUnseal,#timeBuryDot" : function(e,t){
    var searchOptionParam = {};
    searchOptionParam.filter = $('#keywordCondition option:selected').val();
    searchOptionParam.searchText = $('#keywordText').val();
    var templateData = {};
    var statMenu = "";
    switch(e.currentTarget.id){
      case 'timeWriteDot':
        templateData.contentTmp = 'timeCapsuleContentProcess';
        templateData.data = {
          // _id : _id,
          selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
          statusMenu : 'process',
          searchOption : searchOptionParam
        };
        statMenu = 'process';
        break;
      case 'timeDotUnseal':
        templateData.contentTmp = 'timeCapsuleContentUnseal';
        templateData.data = {
          // _id : _id,
          selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
          statusMenu : 'unseal',
          searchOption : searchOptionParam
        };
        statMenu = 'unseal';
        break;
      case 'timeBuryDot':
        templateData.contentTmp = 'timeCapsuleContentBury';
        templateData.data = {
          // _id : _id,
          selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
          statusMenu : 'bury',
          searchOption : searchOptionParam
        };
        statMenu = 'bury';
        break;
    }
    Session.set('timeCapsuleContent selectedStatusMenu',statMenu)
    templateDataBackup = templateData;
    Session.set('timeCapsuleContent templateData', templateData);
  }
});
