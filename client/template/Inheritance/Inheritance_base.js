//main, menu, history항목을 얹을 템플릿
import {global} from '/imports/global/global_things.js';
var templateName = 'inheritanceBase';

Template[templateName].onRendered(function(){
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template[templateName].events({
  "click #closeInh": function(e, t){
    e.preventDefault();
    $(".inh-container").animate(
      {
        left: 1300
       },
       {
         easing: 'swing',
         duration: 500,
         complete: function(){
            $(this).hide();
            var templateData = {};
            templateData.contentTmp = 'inheritanceInheritor';
            Session.set('inheritanceMain templateData', templateData);
            Session.set('inheritanceMenu selectedMenu', 'aMyInheritor');
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
