var templateName = 'lifeViewMain';

Template[templateName].onCreated(function(){
  Blaze._allowJavascriptUrls();
  var instance = this;
  instance.selectedMenu = new ReactiveVar('album');
  Session.set('lifeViewMain templateData', null);
  Session.set('endingNoteList templateData', null);

  //초기 앨범화면으로 정의
  var mainTemplateData = {};
  var dtailTemplateData = {};
  mainTemplateData.contentTmp = 'lifeViewImageAlbum';
  // dtailTemplateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)
  Session.set('lifeViewMain templateData', mainTemplateData);
  // Session.set('endingNoteList templateData', dtailTemplateData);
});

Template[templateName].onRendered(function(){

});

Template[templateName].helpers({
  hpTemplate: function(){
    return Session.get('lifeViewMain templateData');
  },
  hpSelectedMenu: function(){
    return Template.instance().selectedMenu.get();
  }
});

Template[templateName].events({
  "click [name=album],[name=map],[name=keyword],[name=keyword_all]": function(e, t){
    e.preventDefault();

    var mainTemplateData = {};
    var dtailTemplateData = {};

    switch (e.currentTarget.name) {
      case 'album':
        mainTemplateData.contentTmp = 'lifeViewImageAlbum';
        // dtailTemplateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)
        t.selectedMenu.set('album');
        break;
      case 'map':
        mainTemplateData.contentTmp = 'lifeViewImageMap';
        // dtailTemplateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)
        t.selectedMenu.set('map');
        break;
      case 'keyword':
        mainTemplateData.contentTmp = 'lifeViewKeyword';
        // dtailTemplateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)
        t.selectedMenu.set('keyword');
        break;
      case 'keyword_all':
        mainTemplateData.contentTmp = 'lifeViewKeywordAll';
        // dtailTemplateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)
        t.selectedMenu.set('keyword_all');
        break;
      default:
        break;
    }

    Session.set('lifeViewMain templateData', mainTemplateData);
    // Session.set('endingNoteList templateData', dtailTemplateData);
  }
});

Template[templateName].onDestroyed(function(){
  Session.set('lifeViewMain templateData', null);
  Session.set('endingNoteList templateData', null);
});
