import {global} from '/imports/global/global_things.js';

// 부고알림(팝업)
var templateName = 'inheritanceNoticeObituaryPopup';

Template[templateName].events({
  "click a[name='cancleObituary']": function(e, t){
    Modal.hide();
  },
  "click a[name='sendObituary']" : function(e, t){
    var dieDate = $('#obituaryDate').val();
    Meteor.call('setObituaryData',global.login.userId ,Template.instance().data.userId, dieDate,function(err,res){
      if(err){
        console.log(err);
      }else{
        global.utilAlert('부고 알림이 설정되었습니다.');
      }
    });
    Modal.hide();
  }
});
