import {global} from '/imports/global/global_things.js';

// 지금상속 화면
import export_email_inheritance from '/imports/email_template/email_inheritance.js';
var templateName = 'inheritanceInstant';

Template[templateName].onCreated(function(){
  var instance = this;

  this._id = new ReactiveVar(this.data._id);
  this.inheritorId = new ReactiveVar(this.data.inheritorId);
  this.inheritData = new ReactiveVar(this.data.data);
  this.instanceData = new ReactiveVar();
  this.imList = new ReactiveVar();
  this.meList = new ReactiveVar();
  this.imLifeList = new ReactiveVar();
  this.bkList = new ReactiveVar();
  this.tcList = new ReactiveVar();
  this.itList = new ReactiveVar();
  this.implus = new ReactiveVar(9);
  this.bkplus = new ReactiveVar(9);
  this.tcplus = new ReactiveVar(9);
  this.itplus = new ReactiveVar(9);

  Meteor.call('getInheritanceInstace', this.data._id, global.login.userId, this.data.inheritorId, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      var imArr = [];
      var meArr = [];
      var imLifeArr = [];
      var bkArr = [];
      var tcArr = [];
      var itArr = [];

      instance.instanceData.set(result);
      result.map(function(item) {
        switch(item.type) {
          case 'IM': case 'BS': imArr.push(item); break;
          case 'ME': meArr.push(item); break;
          case 'LT': imLifeArr.push(item); break;
          case 'BL': bkArr.push(item); break;
          case 'TC': tcArr.push(item); break;
          default: itArr.push(item); break;
        }
      });
      instance.imList.set(imArr);
      instance.meList.set(meArr);
      instance.imLifeList.set(imLifeArr);
      instance.bkList.set(bkArr);
      instance.tcList.set(tcArr);
      instance.itList.set(itArr);
    }
  });
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].events({
  // 더보기 이벤트
  'click [name="plus"]': function(e, t) {
    e.preventDefault();

    var type = e.target.getAttribute('type');
    var count = 0;
    switch(type) {
      case 'IM': case 'BS': count = t.implus.get() + 10; t.implus.set(count); break;
      case 'BL': count = t.bkplus.get() + 10; t.bkplus.set(count); break;
      case 'TC': count = t.tcplus.get() + 10; t.tcplus.set(count); break;
      case 'IT': count = t.itplus.get() + 10; t.itplus.set(count); break;
    }
  },
  // 지금상속 이벤트
  'click [name="save"]': function(e, t) {
    e.preventDefault();

    var instanceData = t.instanceData.get();

    var condition = {
      userId: global.login.userId,
      inheritorId: t.inheritorId.get(),
      msgId: ''
    };
    var isTitleExist = false;
    var listData = [];
    instanceData.map(function(item) {
      if (_.has(item, "title")) {
        isTitleExist = true;
        listData.push({
          contentId: item.contentId,
          type: item.type,
          isInstant: true,
          regDate: global.utilGetDate().default,
          openedUser: item.openedUser ? item.openedUser : []
        });
      } else {
        Meteor.call('getInheritanceByMsgId', item.userId, item.inheritorId, item.msgId, function(error, result) {
          if (result.length === 0) {
            // insert
            var path = item.inhPath.split(',');
            path.push(item.inheritorId);
            var insert = {
              userId: item.userId,
              inheritorId: item.inheritorId,
              msgId: item.msgId,
              parentInhId: item._id,
              asset: [],
              contents: [],
              instContents: [],
              inhPath: path,
              instDate: global.utilGetDate().default,
              updateDate: global.utilGetDate().default,
              regDate: global.utilGetDate().default,
            };
            Meteor.call('setInheritanceMsgId', insert);
          } else {
            // update
            var updateCondition = {
              userId: item.userId,
              inheritorId: item.inheritorId,
              msgId: item.msgId
            };
            var update = {
              $set: {
                instDate: global.utilGetDate().default,
                updateDate: global.utilGetDate().default
              }
            };
            Meteor.call('updateInheritor', updateCondition, update);
          }

        });
      }
    });
    if(isTitleExist){
      var data = {
        $set: {
          isDeleted: false,
          instDate: global.utilGetDate().default,
          contents: listData,
          instContents: listData
        }
      };
      Meteor.call('updateInheritor', condition, data);
    }

    Meteor.call('setLog', '', '', condition.userId ,condition.inheritorId ,  global.pageType.inHeritance, '', 'directInhContent','' );

    var options = {
      userId : condition.userId
    };
    Meteor.call('setNoti', condition.inheritorId, 'IH', '(postId)상속받은내역으로 간다는데', 'inherit', options);


    // var fields = ['profile.name', 'profile.email'];
    //받는사람의 이름을 알아내고 이메일을 전송함
    // Meteor.call('getUserInfo', condition.inheritorId, fields, function(error, result){
    //   if(error){
    //     return console.log(error);
    //   } else {
    //     //이메일 전송
    //     var email_info = {
    //       title : "[It's my story]"+ condition.userId + "님으로부터 디지털 컨텐츠 상속을 받았습니다.",
    //       email : result[0].profile.email,
    //       inhDate : global.utilGetDate().defaultYMDdot,
    //       senderName : global.fn_getName(condition.userId),
    //       receiverName : result[0].profile.name,
    //       contentsCnt : instanceData.length
    //     };
    //     var htmlContext = export_email_inheritance(email_info, 'inheritance');
    //     var emailSend = global.fn_sendEmail('cert', email_info.email, email_info.title, htmlContext, '');
    //     Meteor.call('sendEmail', emailSend);
    //   }
    // });





    global.utilAlert('지금상속 되었습니다.');
    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  },
  'click [name="cancel"]': function(e, t) {
    e.preventDefault();
    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  },
  // 컨텐츠 상속변경 이벤트
  'click [name="contchangeBtn"]': function(e, t) {
    e.preventDefault();
    var templateData = {};
    templateData.contentTmp = 'inheritanceContents';
    templateData.data = {
      _id: this._id,
      inheritorId: this.inheritorId,
      data: t.inheritData.get()
    };
    Session.set('inheritanceMain templateData', templateData);
  },
  // 컨텐츠 상세
  'click [name="contentsDetail"]': function(e, t) {
    e.preventDefault();

    var _id = e.target.getAttribute('value');
    var type = e.target.getAttribute('type');
    var modalObj = {
      template: 'inheritanceListContentsDetailPopup',
      size : 'modal-mdmodal-lg',
      fade : true,
      data: {
        _id: _id,
        title : '컨텐츠 상세보기',
        pageType: type,
        parentViewId: Blaze.currentView.name,
        isUsePreNext: false,
        unableGoList: true
      }
    };
    // t.choiceContent.set(_id);
    global.utilModalOpen(e, modalObj);
  }
});

Template[templateName].helpers({
  // to
  hpToInheritorId: function() {
    return Template.instance().inheritorId.get();
  },
  hpImList: function() {
    return Template.instance().imList.get();
  },
  hpMeList: function() {
    return Template.instance().meList.get();
  },
  hpImLifeList: function() {
    return Template.instance().imLifeList.get();
  },
  hpBkList: function() {
    return Template.instance().bkList.get();
  },
  hpTcList: function() {
    return Template.instance().tcList.get();
  },
  hpItList: function() {
    return Template.instance().itList.get();
  },
  hpInstant: function(instant) {
    return instant ? '상속': '✔︎';
  },
  // im 더보기
  hpImplus: function(index) {
    return Template.instance().implus.get() < index;
  },
  // 버킷 더보기
  hpBkplus: function(index) {
    return Template.instance().bkplus.get() < index;
  },
  // 타임캡슐 더보기
  hpTcplus: function(index) {
    return Template.instance().tcplus.get() < index;
  },
  // 상속받은내역 더보기
  hpItplus: function(index) {
    return Template.instance().itplus.get() < index;
  }
});
