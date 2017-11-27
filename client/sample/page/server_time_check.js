import {global} from '/imports/global/global_things.js';

var templateName = 'server_time_check';

Template[templateName].events({
  "click [name=serverTime]": function(e, t){
    e.preventDefault();

    $('[name=timeText]').val('');
    $('[name=timeText]').val(global.utilGetDate().default);
  },
  "click [name=clientTime]": function(e, t){
    e.preventDefault();
    Session.set('test serverTime', 'nan');
    $('[name=timeText]').val('');
    Meteor.call('getServerTime', function(error, result){
      if(error){
        console.log(error);
      } else {

        Session.set('test serverTime', global.utilGetDate(result).default);
        console.log('test serverTime',Session.get('test serverTime'));
      }
    });
    var serverTime = '<%=DateTime.Now%>';
    alert(serverTime);
    $('[name=timeText]').val(Session.get('test serverTime'));
  },
});