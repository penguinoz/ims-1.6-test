var templateName = 'inheritanceTimelineBody';

var instance;
Template[templateName].onCreated(function(){
  var templateData = {};
  templateData.contentTmp = 'ihTimeLine';
  templateData.data = {
    _id: this.data._id,
    isNote: this.data.isNote
  };

  Session.set('ihTimeLine templateList', templateData);
});

Template[templateName].events({
  "click [name=album],[name=map],[name=keyword]": function(e, t){
    e.preventDefault();

    var mainTemplateData = {};
    mainTemplateData.contentTmp = 'ihLifeView';
    switch (e.currentTarget.name) {
      case 'album':
        mainTemplateData.data = {
          _id: this._id,
          isNote: this.isNote,
          selectedMenu: 'album',
          selectedBody: 'ihLifeViewAlum'
        };
        break;
      case 'map':
        mainTemplateData.data = {
          _id: this._id,
          isNote: this.isNote,
          selectedMenu: 'map',
          selectedBody: 'ihLifeViewMap'
        };
        break;
      case 'keyword':
        mainTemplateData.data = {
          _id: this._id,
          isNote: this.isNote,
          selectedMenu: 'keyword',
          selectedBody: 'ihLifeViewKeyword'
        };
        break;
    }
    Session.set('ihTimeLine templateList', mainTemplateData);
  }
});

Template[templateName].helpers({
  ihDynamicTemplate: function(){
    return Session.get('ihTimeLine templateList');
  }
});

Template.ihLifeView.helpers({
  contentList: function(){
    return Session.get('ihLifeView templateData');
  }
});

