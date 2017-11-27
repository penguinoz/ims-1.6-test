// 마이페이지 메뉴(왼쪽)
var templateName = 'myPageMenu';

Template[templateName].onCreated(function(){
  var instance = this;
  Session.set('myPageMain templateData', null);
  Session.set('myPageMenu selectedMenu', null);
  // Session.set('myPageMenu trigger', true);


  instance.autorun(function() {
    var templateData = {};
    templateData.contentTmp = 'myPageLike';
    Session.set('myPageMenu selectedMenu', 'like');
    Session.set('myPageMain templateData', templateData);
  });
});

Template[templateName].events({
  "click li": function(e, t){
    e.preventDefault();

    var templateData = {};
    switch($(e.currentTarget).find('a')[0].name){
      case "like":
        templateData.contentTmp = 'myPageLike';
        break;
      case "comment":
        templateData.contentTmp = 'myPageComment';
        break;
      case "favorite":
        templateData.contentTmp = 'myPageFavorite';
        break;
      case "follow":
        templateData.contentTmp = 'myPageFollow';
        break;
      case "message":
        templateData.contentTmp = 'myPageMessage';
        break;
      case "profileVerify":
        templateData.contentTmp = 'myPageProfileVerify';
        break;
      case "profile":
        templateData.contentTmp = 'myPageProfile';
        break;
      case "friend":
      templateData.contentTmp = 'myPageFriend';
        break;
      case "invite":
        templateData.contentTmp = 'myPageInvite';
        break;
      case "insertCode":
        templateData.contentTmp = 'insertCode';
        break;
      default :
        templateData.contentTmp = 'myPageLike';
    }
    Session.set('myPageMenu selectedMenu', $(e.currentTarget).find('a')[0].name);
    Session.set('myPageMain templateData', templateData);
  },
  "click .mypage-setting": function(e, t){
    e.preventDefault();

    var templateData = {};
    templateData.contentTmp = 'myPageProfile';
    Session.set('myPageMenu selectedMenu', 'profile');
    Session.set('myPageMain templateData', templateData);
  }
});

Template[templateName].helpers({
  hpActive: function(name){
    if(name === Session.get('myPageMenu selectedMenu')){
      return 'active';
    } else {
      return '';
    }
  }
});
