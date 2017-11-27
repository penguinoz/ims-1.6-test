// 마이페이지 > 초대하기 > 초대 (팝업)
var templateName = 'myPageInvitePopup';

Template[templateName].events({
  "click #save": function(e, t){
    Modal.hide();
  }
});
