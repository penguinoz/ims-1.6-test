import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

//상속화면 우측 상속관리 기록 화면
var templateName = 'inheritanceHistory';

Template[templateName].onCreated(function(){
  this.logListData = new ReactiveVar();
  var subscribe = this.subscribe("getInheritanceHistory", global.login.userId);
  this.autorun(function(){
    if(subscribe.ready()){
      var imsReturn = CLT.ImsLog.find({type:"IH"}).fetch();
      imsReturn = imsReturn.map(function(item){
        var inhData = CLT.Inh.find({userId:item.userId, inheritorId:item.contextUserId}).fetch()[0];
        if(inhData){
          item.name = inhData.name;
        }
        return item;
      });
      imsReturn = _.chain(imsReturn).sortBy('regDate').reverse().value();
      this.templateInstance().logListData.set(imsReturn);
    }
  });
});

Template[templateName].onRendered(function(){
  // console.log('history', this.$('.hi-scroll'));
  var targetElementLeft = $('.hih-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpGetLogList: function(){
    return Template.instance().logListData.get();
  }
});

Template[templateName].events({
  "event": function(e, t){

  }
});
