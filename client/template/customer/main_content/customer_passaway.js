import {global} from '/imports/global/global_things.js';

var templateName = 'customerPassaway';

Template[templateName].onRendered(function(){
  $('input:radio[name=passaway]:input[value=true]').attr("checked", true);
});

Template[templateName].events({
  "click #save": function(e, t){
    e.preventDefault();

    var userId = t.find('#userId').value;
    var passaway = Boolean(t.find('input:radio[name=passaway]:checked').value);

    Meteor.call('setPassAway', userId, passaway);
    if (passaway) {
      // 비유저에게 이메일 보내기
      Meteor.call('getInheritorNonUserList', userId, function(error, result) {
        if (!error && result.length !== 0) {
          Meteor.call('sendInheritanceEmail', result);
        }
      });
    }
    return global.utilAlert('죽음이 설정 되었습니다.', 'success');
  }
});