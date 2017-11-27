import {global} from '/imports/global/global_things.js';
var templateName = 'bucketChart';

Template[templateName].onCreated(function(){
  Session.set('bucketChart tappage', 'bucketChartMy');
});

Template[templateName].onRendered(function(){
  // targetElement = this.$('.hr-scroll');
  // global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark");
});

Template[templateName].helpers({
  hpMeOrAllTab: function(){
    return Session.get('bucketChart tappage');
  }
});

Template[templateName].events({
  "click #liTabMe,#liTabAll": function(e, t){
    if(e.currentTarget.id === 'liTabMe'){
      Session.set('bucketChart tappage', 'bucketChartMy');
    }else{
      Session.set('bucketChart tappage', 'bucketChartAll');
    }
  }
});

Template[templateName].onDestroyed(function(){
  Session.set('bucketChart tappage', null);
});
