// 마이페이지 메인
import {global} from '/imports/global/global_things.js';
var templateName = 'customerMain';

Template[templateName].onCreated(function(){
  Session.set('customerMain templateData', null);

  var templateData = {};
  templateData.contentTmp = 'customerNotice';
  Session.set('customerMain templateData', templateData);
});

Template[templateName].onRendered(function(){
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template[templateName].helpers({
  hpTemplate: function(){
    return Session.get('customerMain templateData');
  }
});

Template[templateName].events({
  "click #closeInh": function(e, t){
    e.preventDefault();
    $(".customer-container").animate(
      {
        left: 1300
       },
       {
         easing: 'swing',
         duration: 500,
         complete: function(){
            $(this).hide();
            var templateData = {};
            templateData.contentTmp = 'customerNotice';
            Session.set('customerMain templateData', templateData);
            Session.set('customerMenu selectedMenu', 'notice');
        }
    });
  },
  'click .privacy-policy': function(e, t){
    e.preventDefault();
    var modalobj = {};

    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'modal-lg';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
    };
    global.utilModalOpen(e, modalobj);
  }
});
