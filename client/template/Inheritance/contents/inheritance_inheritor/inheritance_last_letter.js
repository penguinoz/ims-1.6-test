import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

//마지막 편지
var templateName = 'inheritanceLastLetter';

Template[templateName].onCreated(function(){
  var instance = this;
  if(this.data){
    instance.lastLetterId = this.data._id;
    instance.alltype = this.data.property === "all";
  }
  instance.lastLetterInfo = new ReactiveVar();

  var subscribe = instance.subscribe("inheritance_inheritanceId", instance.lastLetterId);
  instance.autorun(function(){
    if(subscribe.ready()){
      if(CLT.Inh.findOne({_id:instance.lastLetterId}) && CLT.Inh.findOne({_id:instance.lastLetterId}).lastLetter){
        var resVal = CLT.Inh.findOne({_id:instance.lastLetterId});
        if(instance.alltype){
          $('#ihnModify').addClass("hidden");
          $('#ihnDelete').addClass("hidden");
          resVal.name = "상속인 모두";
        }
        Template.instance().lastLetterInfo.set(resVal);
      }
    }
  });

});

Template[templateName].onRendered(function(){
  this.$('.fr-view').attr('contenteditable','false');
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
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
    if (Template.instance().lastLetterInfo.get()) {
      var lastLetterInfo = Template.instance().lastLetterInfo.get();
      return {
        key: global.editorSettings.key,
        _value: lastLetterInfo.lastLetter.context,
        toolbarInline: true,
        placeholderText: null,
        // imageUploadToS3: global.editorSettings.imageUploadToS3,
        // imageResize: false,
        // initOnClick: false,
        // dragInline: false,
        // imageMove: false,
        charCounterCount: false,
        pluginsEnabled: ['image','codeView','fontSize'],

        "_oninitialized": function(e, editior){
          Template.instance().$('div.froala-reactive-meteorized').froalaEditor('edit.off');
        },
        // "_onclick": function (e, editor, img) {
        //   // console.log(e, editor, img);
        //   if(img.target.src){
        //     // console.log('이미지 확대 보기');
        //     $(img.target).colorbox({
        //       href:img.target.src,
        //       maxWidth : '80%',
        //       maxHeight : '80%',
        //       opacity : 0.8,
        //       transition : 'elastic',
        //       current : ''
        //     });
        //   }
        // }, //end _onclick
      };
    }
  }
});

Template[templateName].events({
  "click #ihnModify": function(e, t){
    e.preventDefault();
    var templateData = {};
    templateData.contentTmp = 'inheritanceLastLetterWrite';
    templateData.data = {
      _id : t.lastLetterInfo.get()._id,
      inheritorId : t.lastLetterInfo.get().inheritorId
    };
    if( t.lastLetterInfo.get().name){
      templateData.data.nonUsername = t.lastLetterInfo.get().name;
    }
    Session.set('inheritanceMain templateData', templateData);
  },
  "click #goToList": function(e, t){
    e.preventDefault();

    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  },
  "click #ihnDelete": function(e, t){
    e.preventDefault();
    global.utilConfirm('편지를 삭제 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('deleteLastLetter', t.lastLetterInfo.get()._id, function(error, result){
          if(error){
            return console.log(error);
          } else {
            if(result && result.lastLetter && result.lastLetter.image){
              global.fn_DeleteS3ImagesByType(result.lastLetter.image, global.s3.folder.inheritance);
            }
            Meteor.call('setLog', result._id, '', result.userId, result.userId, global.pageType.inHeritance, '', 'letterDelete','');
            var templateData = {};
            templateData.contentTmp = 'inheritanceInheritor';
            Session.set('inheritanceMain templateData', templateData);
          }
        });
      }
    }).catch(swal.noop);
  },
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
