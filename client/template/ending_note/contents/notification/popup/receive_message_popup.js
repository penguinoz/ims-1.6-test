import {global} from '/imports/global/global_things.js';

// 상속인/가디언 추가(팝업)
var templateName = 'notifyReceiveMessagePopup';
var totalArray = [];

Template[templateName].onCreated(function(){
});

Template[templateName].onRendered(function(){
});

Template[templateName].helpers({
  hpChangeTextForm: function(){
    var context = this.context.replace(/ /g, '\u00a0');
    context = context.replace(/\n/gi, '<br />');
    return context;
  }
});

Template[templateName].events({
  //확인
  "click #confirm": function(e, t){
    e.preventDefault();

    Modal.hide();
  },
  //답장(팝업)
  "click #reply": function(e, t){
    e.preventDefault();
    Modal.hide();
    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-md';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      content : this.context,
      receiver : this.sender
    };
    setTimeout(function(){
      global.utilModalOpen(e, modalobj);
    }, 400);
  }
});