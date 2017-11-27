import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 상속받은 내역 상세보기
var templateName = 'inheritanceListLastLetter';

Template[templateName].onCreated(function(){
  var instance = this;
  if(this.data){
    instance.lastLetterId = this.data._id;
  }
  instance.lastLetterInfo = new ReactiveVar();

  var subscribe = instance.subscribe("inheritance_inheritanceId", instance.lastLetterId);
  this.autorun(function(){
    if(subscribe.ready()){
      if(CLT.Inh.findOne({_id:instance.lastLetterId}).lastLetter){
        instance.lastLetterInfo.set(CLT.Inh.findOne({_id:instance.lastLetterId}));
      }
    }
  });

});

Template[templateName].helpers({
  hpLastLetter: function(){
    return Template.instance().lastLetterInfo.get();
  },
  hpIsImsUser: function(name){
    var result = false;
    if(name){
      //이름항목이 있으면 비유저로 판단한다.
      result = true;
    } else {
      result = false;
    }
    return result;
  },
  hpGetContext: function(){
    if (Template.instance().lastLetterInfo.get().lastLetter) {
      var lastLetterInfo = Template.instance().lastLetterInfo.get();
      return {
        key: global.editorSettings.key,
        _value: lastLetterInfo.lastLetter.context,
        toolbarInline: true,
        imageResize: false,
        imageUploadToS3: global.editorSettings.imageUploadToS3,
        placeholderText: null,
        initOnClick: false,
        charCounterCount: false,
        pluginsEnabled: ['image', 'codeView','draggable','fontSize'],
        "_oninitialized": function(e, editior){
          Template.instance().$('div.froala-reactive-meteorized').froalaEditor('edit.off');
        },
      };
    }
  }
});

Template[templateName].events({
  "click [name=froalaEditor] img": function(e, t){
    e.preventDefault();
    $(e.currentTarget).colorbox({
      href : e.currentTarget.src,
      maxWidth : '80%',
      maxHeight : '80%',
      opacity : 0.8,
      transition : 'elastic',
      current : ''
    });
  }
});
