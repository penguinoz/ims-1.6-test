// 상속인/가디언 추가(팝업)
var templateName = 'noticePopup';
var totalArray = [];

Template[templateName].onCreated(function(){
});

Template[templateName].onRendered(function(){
});

Template[templateName].events({
  //확인
  "click #confirm": function(e, t){
    Modal.hide();
  },
  "click [name=notice],[name=faq],[name=qna],[name=qnaWrite]": function(e, t){
    e.preventDefault();
    Modal.hide();

    $(".customer-container").show().animate( { left: 0 }, 500 );
    Session.set('customerMenu selectedMenu', e.currentTarget.name);

    var templateData = {};
    switch(e.currentTarget.name){
      case 'notice':
      templateData.contentTmp = 'customerNotice';
      break;
      case 'faq':
      templateData.contentTmp = 'customerFaq';
      break;
      case 'qna':
      templateData.contentTmp = 'customerQna';
      break;
      case 'qnaWrite':
      templateData.contentTmp = 'customerWrite';
      break;

    }
    Session.set('customerMain templateData', templateData);
  }
  // //취소
  // "click #cancel": function(e, t){
  //   Modal.hide();
  // }
});