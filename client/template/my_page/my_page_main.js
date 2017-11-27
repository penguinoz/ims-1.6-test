// 마이페이지 메인
import {global} from '/imports/global/global_things.js';
var templateName = 'myPageMain';

Template[templateName].onCreated(function(){
  Session.set('myPageMain templateData', null);

  var templateData = {};
  templateData.contentTmp = 'myPageLike';
  Session.set('myPageMain templateData', templateData);
});

Template[templateName].onRendered(function(){
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template[templateName].helpers({
  hpTemplate: function(){
    return Session.get('myPageMain templateData');
  }
});

Template[templateName].events({
  "click #closeInh": function(e, t){
    e.preventDefault();
    $(".mypage-container").animate(
      {
        left: 1300
       },
       {
         easing: 'swing',
         duration: 500,
         complete: function(){
            $(this).hide();
            var templateData = {};
            templateData.contentTmp = 'myPageLike';
            Session.set('myPageMain templateData', templateData);
            Session.set('myPageMenu selectedMenu', 'like');

            $("#toTab").addClass('active');
            $("#fromTab").removeClass('active');
            $("#to").addClass('in active');
            $("#from").removeClass('in active');
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
