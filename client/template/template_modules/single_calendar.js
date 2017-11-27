import {global} from '/imports/global/global_things.js';

var templateName = 'singleCalendar';

Template[templateName].onRendered(function(){
  // this.readOnly = true, undefine >>>>  autoUpdateInput: true;
  // this.readOnly = false >>>>  autoUpdateInput: false;
  var autoUpdateInputValue = true;
  if(!this.data.setDefaultDate && !_.isUndefined(this.data.setDefaultDate)) {
    autoUpdateInputValue = false;
  }
  var maxDate = '2500/12/31';
  if (this.data.maxDate === 'true') {
    maxDate = new Date().format('yyyy/MM/dd');
  }

  var $singleCalendar = $('#'+ this.data.id);
  // var $singleCalendar = $('.single-calendar');
  var parentElm = $(this)[0].firstNode.parentNode;
  $singleCalendar.daterangepicker({
    parentEl:parentElm,
    singleDatePicker: true,
    showDropdowns: true,
    autoUpdateInput: autoUpdateInputValue,
    // drops : this.data.drop ? this.data.drop : 'up',
    drops : 'down',
    // minDate: moment().subtract(110, 'years'),
    // maxDate: moment().add(100, 'years'),
    minDate: '1800/12/31',
    maxDate: maxDate,
    locale: {
      cancelLabel: 'Clear',
      format: "YYYY-MM-DD",
      daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
      monthNames: ['1 월','2 월','3 월','4 월','5 월','6 월','7 월','8 월','9 월','10 월','11 월','12 월'],
    }
  }).on("apply.daterangepicker", function(e, picker) {
    //x버튼 숨기기
    $("a[name='"+this.id+"delBt']").removeClass('hidden');
    // console.log('click');
    if(this.id === 'timelineDate'){
      var standardDate = new Date(picker.startDate._d).format('yyyy-MM-dd');

      if(_.isEqual(standardDate, Session.get('timelineMain standardDate'))){
        return;
      }

      Session.set('timelineMain data', null);
      Session.set('timelineMain standardDate', standardDate);
      Session.set('timelineMain topLimit', 0);
      Session.set('timelineMain isSelectedCarendar', true);
      isStopIncrement = false;

      if(Session.get('timelineMain standardDate') > global.utilGetDate().defaultYMD){
        Session.set('timelineMain isFutureSelected', true);
      } else {
        Session.set('timelineMain isFutureSelected', false);
      }
    }

    if(this.id.indexOf('lifeTraceFromDate') >= 0 || this.id.indexOf('lifeTraceToDate_') >= 0){
      Template.imLifeTrace.__helpers.get('hpRemoveClass')(this.name);
    }

    var chosenDate = new Date(picker.startDate._d).format('yyyy-MM-dd');
    $singleCalendar.val(chosenDate);
    $(this).blur();
  }) .on("hide.daterangepicker", function(e, picker){
    // var chosenDate = new Date(picker.startDate._d).format('yyyy-MM-dd');
    // $singleCalendar.val(chosenDate);
    // $(this).blur();
    //
    // if(this.id.indexOf('fromDate') >= 0 ){
    //   console.log('hide', e, picker);
    // }
  });
});

Template[templateName].onDestroyed(function(){
  // $('.daterangepicker.dropdown-menu.single.opensright').remove();
});

Template[templateName].events({
  "click .deleteDate": function(e,t){
    $('#' + e.target.id).val('');
     $("a[name='"+e.target.id+"delBt']").addClass('hidden');
    var tempData = Template.instance().data;
    if(tempData.id.indexOf('lifeTraceFromDate') >= 0 || tempData.id.indexOf('lifeTraceToDate_') >= 0){
      Template.imLifeTrace.__helpers.get('hpRemoveClass')(tempData.name);
    }
  },
});

Template[templateName].helpers({
  id: function() {
    return this.id;
  },
  name: function() {
    return this.name;
  },
  class: function(){
    return this.class;
  },
  value: function() {
    return this.value;
  },
  title: function() {
    return this.title;
  },
  required: function() {
    return this.required;
  },
  hpNotUseIcon: function() {
    return this.notUseIcon;
  },
  hpNotUseText : function() {
    return this.notUseText;
  },
  hpCustomIcon : function() {
    return this.customIcon;
  },
  hpInlineStyle : function() {
    return this.inlineStyle;
  },
  hpDeleteDateBtn : function() {
    if(_.isUndefined(this.setDeleteDateBtn))
    {
      return false;
    }
    return this.setDeleteDateBtn;
  }
});
