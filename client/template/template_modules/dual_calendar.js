var templateName = 'dualCalendar';

Template[templateName].onRendered(function(){
  var $dualCalendar = $('input[ref="dualCalendar"]');
  $dualCalendar.daterangepicker({
    singleDatePicker: false,
    showDropdowns: true,
    locale: {
      separator: '~',
      format: "YYYY-MM-DD",
      daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
      monthNames: ['1 월','2 월','3 월','4 월','5 월','6 월','7 월','8 월','9 월','10 월','11 월','12 월'],
    }
  });
});

Template[templateName].helpers({
  id: function() {
    return this.id;
  },
  name: function() {
    return this.name;
  },
  value: function() {
    return this.value;
  }
});