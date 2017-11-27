import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 장례식 초대
var templateName = 'inheritanceInviteFuneral';
var funeralIns;

Template[templateName].onCreated(function(){
  funeralIns = this;
  funeralIns.inviteFuneralInfo = new ReactiveVar();
  // funeralIns.funeralCode = new ReactiveVar();

  // var code = CLT.ImsCode.find({type: 'inviteFuneralType'});
  // funeralIns.funeralCode.set(code);
  Meteor.call('getInviteFuneralInfo', global.login.userId, function(error, result){
    if(error){
      return console.log(error);
    } else {
      if(result){
        funeralIns.inviteFuneralInfo.set(result);
      }else{
        funeralIns.inviteFuneralInfo.set(['']);
      }
    }
  });
});

Template[templateName].onRendered(function(){
  // // 스크롤 페이징 구현
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpInvitedOnes: function(){
    return funeralIns.inviteFuneralInfo.get();
  },
  hpAddUsersCallBack : function(addUsers){

    Meteor.call('setInvitationUser',global.login.userId,addUsers, function(err,res){
      if(err){console.log(err);}
      if(res){
        var inviinfo = funeralIns.inviteFuneralInfo.get();
        if(!inviinfo.member){
          inviinfo.member = [];
        }
        for(var i in res){
          inviinfo.member.push(res[i]);
        }
        funeralIns.inviteFuneralInfo.set(inviinfo);
      }
    });
  },

  hpGetMemberLength : function(member){
    if(member && member.length){
      var propArr = Object.getOwnPropertyNames(member[0]);
      for(var i in propArr){
        if(member[0][propArr[i]]){
          return member.length;
        }
      }
    }
    return 0;
  }
});

Template[templateName].events({
  //초대자 추가
  "click [name=addUser]": function(e, t){
    e.preventDefault();

    var friendsListParam =[];
    var nonUserprivateList =[];
    var friendsprivateParam = [];
    var modalobj = {};

    modalobj.template = 'inheritanceAddFriendsPopup';
    modalobj.size = 'imsr-pop modal-md inheritance';
    modalobj.fade = false;
      modalobj.backdrop = 'static';
    modalobj.data = {
      title : '장례식 초대 친구 선택',
      parentViewId: Blaze.currentView.name,
      infoment:'*장례식 초대 친구를 선택하세요.',
      viewOption : true
    };

    var preUsers = [];
    if(funeralIns.inviteFuneralInfo.get() && funeralIns.inviteFuneralInfo.get().member ){
      var members = funeralIns.inviteFuneralInfo.get().member;
      for(var i in members){
        preUsers.push(members[i].userId);
      }
    }
    modalobj.data.preSelectedUsers = preUsers;
    global.utilModalOpen(e, modalobj);
  },
  //업로드
  "click [name=upload]": function(e, t){

  },
  //엑셀다운로드
  "click [name=download]": function(e, t){

  },
  //프린트
  "click [name=print]": function(e, t){

  },
  //삭제
  "click [name=delRefuesData]": function(e, t){
    var editData = funeralIns.inviteFuneralInfo.get();
    if(editData && editData.member){
      for(var i in editData.member){
        if(editData.member[i].userId === this.userId){
          editData.member.splice(i,1);
          funeralIns.inviteFuneralInfo.set(editData);
        }
      }
    }
  },
  //저장
  "click a[name=save]": function(e, t){
    var inviObj = global.utilGetFormDataArray(t);
    var tempData = inviObj.map(function(item, i) {
      delete item.invitation;
        return item;
    });

    var saveData = {
      userId:global.login.userId,
      invitation : $("textarea[name='invitation']").val(),
      member : tempData,
      updateDate : global.utilGetDate().default
    };
    var id = funeralIns.inviteFuneralInfo.get()._id;
    Meteor.call('saveInvitation',id,saveData,function(err,res){
      if(err){console.log(err);
      }else{
        global.utilAlert('저장되었습니다.');
        Session.set('inheritanceMain templateData', null);
        setTimeout(function(){
          templateData = {};
          templateData.contentTmp = 'inheritanceInviteFuneral';
          Session.set('inheritanceMain templateData', templateData);
        }, 100);
      }

    });
  },
  //내용 접기 /펼치기
  "click [name=inviteFuneralSlideToggle]": function(e, t){
    e.preventDefault();

    var slideTarget = $('.inh-inviteFuneral-input');
    slideTarget.slideToggle( "fast", function() {
      e.stopPropagation();
      if(slideTarget.hasClass("on")){
        slideTarget.removeClass("on");
        $(e.currentTarget).find('i').removeClass('ion-chevron-up');
        $(e.currentTarget).find('i').addClass('ion-chevron-down');
      }else{
        slideTarget.addClass("on");
        $(e.currentTarget).find('i').removeClass('ion-chevron-down');
        $(e.currentTarget).find('i').addClass('ion-chevron-up');
      }
    });
  }
});


Template.inheritanceInviteFuneralselector.onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);
});

Template.inheritanceInviteFuneralselector.helpers({
  hpGetCodeList : function(){
    return CLT.ImsCode.find({type: 'inviteFuneralType'});
  }
});
