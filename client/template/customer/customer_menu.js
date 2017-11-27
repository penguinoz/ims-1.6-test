// 마이페이지 메뉴(왼쪽)
var templateName = 'customerMenu';

Template[templateName].onCreated(function(){
  var instance = this;
  Session.set('customerMain templateData', null);
  Session.set('customerMenu selectedMenu', null);

  instance.autorun(function() {
    var templateData = {};
    templateData.contentTmp = 'customerNotice';
    Session.set('customerMenu selectedMenu', 'notice');
    Session.set('customerMain templateData', templateData);
  });
});

Template[templateName].events({
  "click li": function(e, t){
    var templateData = {};
    switch($(e.currentTarget).find('a')[0].name){
      case "notice":
        templateData.contentTmp = 'customerNotice';
        break;
      case "faq":
        templateData.contentTmp = 'customerFaq';
        break;
      case "qna":
        templateData.contentTmp = 'customerQna';
        break;
      // case "qnaWrite":
      //   templateData.contentTmp = 'customerWrite';
      //   break;
      case "writeNotice":
        templateData.contentTmp = 'customerWriteNotice';
        break;
      case "writeFaq":
        templateData.contentTmp = 'customerWriteFaq';
        break;
      case 'passAway':
        templateData.contentTmp = 'customerPassaway';
        break;
    }
    Session.set('customerMenu selectedMenu',  $(e.currentTarget).find('a')[0].name);
    Session.set('customerMain templateData', templateData);
  }
});

Template[templateName].helpers({
  hpActive: function(name){
    if(name === Session.get('customerMenu selectedMenu')){
      return 'active';
    } else {
      return '';
    }
  }
});
