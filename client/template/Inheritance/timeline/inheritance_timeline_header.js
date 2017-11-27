var templateName = "inheritanceTimelineHeader";

Template[templateName].onCreated(function(){
  var instance = this;
  instance.selectedMenu = new ReactiveVar('endingNote');
});

Template[templateName].events({
  "click li":function(e, t){
    e.preventDefault();
    t.selectedMenu.set(e.currentTarget.getAttribute('name'));

    var templateData = {};
    switch(e.currentTarget.getAttribute('name')){
      case 'endingNote':
          templateData.contentTmp = 'ihTimeLine';
          templateData.data = {
            _id: this._id,
            isNote: this.isNote
          };
      break;
      case 'lifeView':
        templateData.contentTmp = 'ihLifeView';
        templateData.data = {
          _id: this._id,
          isNote: this.isNote,
          selectedMenu: 'album',
          selectedBody: 'ihLifeViewAlum'
        };
      break;
      default :
        templateData.contentTmp = 'ihTimeLine';
        templateData.data = {
          _id: this._id,
          isNote: this.isNote
        };
    }

    Session.set('ihTimeLine templateList', templateData);
  }
});

Template[templateName].helpers({
  hpIsSelected: function(menuName){
    return Template.instance().selectedMenu.get() === menuName ? 'active' : '';
  }
});