import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

var templateName = 'inheritanceLastLetterPopup';

Template[templateName].onCreated(function(){
  var instance = this;
  this.collection = new ReactiveVar();

  Meteor.call('getInheritanceById', this.data._id, function(error, result) {
    if (!error) {
      instance.collection.set(result);
    }
  });
});

Template[templateName].events({
  "click #cancel": function(e, t){
    e.preventDefault();

    Modal.hide();
  }
});

Template[templateName].helpers({
  hpCollection: function(){
    return Template.instance().collection.get();
  },
  hpGetContext: function(){
    if (Template.instance().collection.get()) {
      var lastLetterInfo = Template.instance().collection.get();
      return {
        key: global.editorSettings.key,
        _value: lastLetterInfo.lastLetter.context,
        toolbarInline: true,
        placeholderText: null,
        charCounterCount: false,
        pluginsEnabled: ['image','codeView','fontSize'],

        "_oninitialized": function(e, editior){
          Template.instance().$('div.froala-reactive-meteorized').froalaEditor('edit.off');
        },
      };
    }
  }
});