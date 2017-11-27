import {global} from '/imports/global/global_things.js';

// 톡투미 > meQna
var templateName = 'imWithMeDetail';


Template[templateName].onCreated(function(){
  var instance = this;
  this._id = new ReactiveVar(this.data._id);
  this.searchOption = new ReactiveVar(this.data.searchOption);
  this.collection = new ReactiveVar();

  Meteor.call('imWithMeQuestionFindOne', this.data._id, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      instance.collection.set(result);
    }
  });
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');

  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].events({
  // 수정
  'click #imwithmeDetailEdit': function(e, t) {
    e.preventDefault();
    var data = {
      _id: this._id,
      questionId: this.questionId,
      title: this.title
    };
    global.utilTemplateMove('endingNoteListHeaderIm', 'imWithMeWriting', data);
  },
  // 삭제
  'click #imwithmeDetailDelete': function(e, t) {
    e.preventDefault();

    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
        Meteor.call('imWithMeQuestionRemove', t._id.get(), true, function(error, result) {
          if (result > 0) {
            var data = {
              questionId: t.collection.get().questionId
            };
            global.fn_DeleteS3ImagesByType(t.collection.get().images, global.s3.folder.withMe);
            global.utilTemplateMove('endingNoteListHeaderIm', 'imWithMe', data);
          }
        });
      }
    }).catch(swal.noop);
  },
  // 목록
  'click #btnToList': function(e, t) {
    e.preventDefault();

    var data = {
      questionId: t.collection.get().questionId
    };
    global.utilTemplateMove('endingNoteListHeaderIm', 'imWithMe', data);
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

Template[templateName].helpers({
  hpCollection: function() {
    return Template.instance().collection.get();
  },
  hpGetContext: function() {
    if (Template.instance().collection.get()) {
      return {
        key: global.editorSettings.key,
        _value: Template.instance().collection.get().content,
        toolbarInline: true,
        // imageResize: false,
        // imageUploadToS3: global.editorSettings.imageUploadToS3,
        // initOnClick: false,
        // dragInline: false,
        // imageMove: false,
        placeholderText: null,
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
