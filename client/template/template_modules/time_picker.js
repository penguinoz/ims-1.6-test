var templateName = 'timePicker';

Template[templateName].onRendered(function(){
  $('#timepicker1').timepicker({
      // interval: 60,
      // minTime: '10',
      // maxTime: '6:00pm',
      // defaultTime: 'current',
      // startTime: '10:00',
      // dynamic: false,
      // dropdown: true,
      // scrollbar: true,
      // showMeridian: true,
      // minuteStep: 1,
      //           template: 'dropdown',
      //           appendWidgetTo: 'body',
      //           showSeconds: true,
      //           showMeridian: true,
      //           defaultTime: false,
      //           maxHours:24,
      //           showInputs:true
      minuteStep: 1,
// appendWidgetTo: 'body',
showSeconds: false,
showMeridian: false,
defaultTime: 'current'
  });
});