import {global} from '/imports/global/global_things.js';

var templateName = 'timeCapsuleContent';
var selectedMenu = null;
var statusMenu = null;
var templateDataBackup = null;
var userId = null;
var isPageOwner = false;

Template[templateName].onCreated(function(){
  isPageOwner = false;
  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    userId = global.login.userId;
  } else {
    userId = global.login.pageOwner;
  }
  this.pageType = new ReactiveVar();

  statusMenu = null;
  selectedMenu = null;

  templateDataBackup = {};
  var templateData = {};

  Session.set('timeCapsuleContent templateData', null);
  Session.set('timeCapsuleContent hpIsMyMenu', null);
  Session.set('timeCapsuleContent ContentsCount', null);
  Session.set('timeCapsuleContent reflash', null);

  if (this.data) {
    templateData.data = {};
    if (this.data.pageType === 'inheritance') {
      // 상속화면일때는 개봉만 보여준다
      templateData.data.inheritanceKey = this.data.inheritanceKey;
      templateData.data.pageType = this.data.pageType;
      this.pageType.set(this.data.pageType);
      templateData.contentTmp = 'timeCapsuleContentUnseal';
    } else {
      templateData.contentTmp = this.data.contentTmp;
    }
    templateData.data.selectedMenu = this.data.selectedMenu;
    templateData.data.statusMenu = this.data.statusMenu;
    templateData.data.searchOption = this.data.searchOption;

    Session.set('timeCapsuleContent templateData', templateData);
    Session.set('timeCapsuleContent selectedStatusMenu', this.data.statusMenu);
    Session.set('timeCapsuleContent hpIsMyMenu', this.data.selectedMenu);
  } else {
    selectedMenu = 'my';
    templateData.contentTmp = 'timeCapsuleContentAll';
    templateData.data = {
      // _id : _id,
      selectedMenu : selectedMenu,
      statusMenu : 'all',
    };

    Session.set('timeCapsuleContent templateData', templateData);
    Session.set('timeCapsuleContent selectedStatusMenu', 'all');
    Session.set('timeCapsuleContent hpIsMyMenu', selectedMenu);
  }

  templateDataBackup = templateData;

  var instance = this;
  instance.autorun(function(){
    Session.get('timeCapsuleContent reflash');
    Meteor.call('getTimeCapsuleContentsCount', userId, function(error, result){
      if(error) {

      } else {
        if (instance.pageType.get() === 'inheritance') {
          Meteor.call('getInheritanceById', instance.data.inheritanceKey, function(error, inheritanceData) {
            if (!error) {
              result.unsealStatusCount = 0;
              inheritanceData.contents.map(function(item) {
                if (item.type === 'TC') {
                  result.unsealStatusCount ++;
                }
              });
              Session.set('timeCapsuleContent ContentsCount', result);
            }
          });
        } else {
          Session.set('timeCapsuleContent ContentsCount', result);
        }
      }
    });
  });
});

Template[templateName].helpers({
  hpCapsuleListTemplate: function() {
    return Session.get('timeCapsuleContent templateData');
  },
  hpSelectedStatusMenu: function(){
    return Session.get('timeCapsuleContent selectedStatusMenu');
  },
  hpIsMyMenu: function(type){
    return type === Session.get('timeCapsuleContent hpIsMyMenu');
  },
  hpContentCount: function(){
    return Session.get('timeCapsuleContent ContentsCount');
  },
  hpInheritance: function() {
    return Template.instance().pageType.get() === 'inheritance' ? true : false;
  }
});


Template[templateName].onRendered(function(){
  //jquery 스크롤 적용
  // var scrollCallbackOptions = {
  //   whileScrolling: function() {
  //     //return showMoreVisibleImContent(this);
  //   }
  // };
  // global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark", scrollCallbackOptions);
  //
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
});

Template[templateName].events({
  "click #tabMe,#tabAll": function(e, t) {
    e.preventDefault();

    var searchOptionParam = {};
    searchOptionParam.filter = $('#keywordCondition option:selected').val();
    searchOptionParam.searchText = $('#keywordText').val();

    var templateData ={};
    var target = e.currentTarget.getAttribute('value');
    if (target === 'my') {
      templateData.contentTmp = templateDataBackup.contentTmp;
      templateData.data = {
        selectedMenu : 'my',
        statusMenu : templateDataBackup.data.statusMenu,
        searchOption : searchOptionParam
      };
      // if(templateDataBackup.data && templateDataBackup.data.statusMenu && templateDataBackup.data.statusMenu === 'public'){
      //   Session.set('timeCapsuleContent selectedStatusMenu', 'all');
      //   templateData.contentTmp = 'timeCapsuleContentAll';
      //
      // }
      Session.set('timeCapsuleContent selectedStatusMenu', 'all');
      templateData.contentTmp = 'timeCapsuleContentAll';
      Session.set('timeCapsuleContent hpIsMyMenu', 'my');
    } else {
      templateData.contentTmp = 'timeCapsuleContentPublic';
      templateData.data = {
        selectedMenu : 'all',
        statusMenu : 'public',
        searchOption : searchOptionParam
      };
      Session.set('timeCapsuleContent hpIsMyMenu', 'all');
      // Session.set('timeCapsuleContent selectedStatusMenu', 'public');
    }
    Session.set('timeCapsuleContent templateData', templateData);
  },
  // 상세 이벤트
  "click #all,#bury,#unseal,#process": function(e, t) {
    e.preventDefault();

    var searchOptionParam = {};
    searchOptionParam.filter = $('#keywordCondition option:selected').val();
    searchOptionParam.searchText = $('#keywordText').val() ? $('#keywordText').val() : "";

    Session.set('timeCapsuleContent selectedStatusMenu', e.currentTarget.id);
    statusMenu = e.currentTarget.id;
    var templateData = {};
    switch(statusMenu) {
      case 'all':
      templateData.contentTmp = 'timeCapsuleContentAll';
      templateData.data = {
        // _id : _id,
        selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
        statusMenu : statusMenu,
        searchOption : searchOptionParam
      };

      break;

      case 'bury':
      templateData.contentTmp = 'timeCapsuleContentBury';
      templateData.data = {
        // _id : _id,
        selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
        statusMenu : statusMenu,
        searchOption : searchOptionParam
      };
      break;

      case 'unseal':
      templateData.contentTmp = 'timeCapsuleContentUnseal';
      templateData.data = {
        // _id : _id,
        selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
        statusMenu : statusMenu,
        searchOption : searchOptionParam
      };
      break;

      case 'process':
      templateData.contentTmp = 'timeCapsuleContentProcess';
      templateData.data = {
        // _id : _id,
        selectedMenu : _.isEmpty(selectedMenu)?'my':selectedMenu,
        statusMenu : statusMenu,
        searchOption : searchOptionParam
      };
      break;
    }

    templateDataBackup = templateData;
    Session.set('timeCapsuleContent templateData', templateData);
  },

});
