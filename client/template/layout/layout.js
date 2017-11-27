import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js'


Template.layout.onCreated(function(){
  var instance = this;
  instance.setYield = new ReactiveVar(false);
  var subscription = Meteor.subscribe('pubCodeOption');

  instance.autorun(function(){
    if(subscription.ready()){
      var result = CLT.ImsCodeOption.findOne();
      Object.keys(result).map(function(key,index){
        global[key] = result[key];
      });

      instance.setYield.set(true);
    }
});

// console.log('layout');

});

Template.layout.helpers({
  hpLayout: function(){
    return Template.instance().setYield.get();
  }
});


Template.layout2.onCreated(function(){
  var instance = this;
  instance.setYield = new ReactiveVar(false);

  var subscription = Meteor.subscribe('pubCodeOption');
  instance.autorun(function(){
    if(subscription.ready()){
      var result = CLT.ImsCodeOption.findOne();
      Object.keys(result).map(function(key,index){
        global[key] = result[key];
      });

      instance.setYield.set(true);
    }
  });

// console.log('layout2');
});

Template.layout2.helpers({
  hpLayout2: function(){
    return Template.instance().setYield.get();
  }
});

Template.layout3.onCreated(function(){
  var instance = this;
  instance.setYield = new ReactiveVar(false);

  var subscription = Meteor.subscribe('pubCodeOption');
  instance.autorun(function(){
    if(subscription.ready()){
      var result = CLT.ImsCodeOption.findOne();
      Object.keys(result).map(function(key,index){
        global[key] = result[key];
      });

      instance.setYield.set(true);
    }
  });

// console.log('layout3');
});

Template.layout3.helpers({
  hpLayout3: function(){
    return Template.instance().setYield.get();
  }
});

//backspace unable
$(document).on("keydown", function (e) {
  if (e.which === 8 && !$(e.target).is("input, textarea")) {
    e.preventDefault();
  }
});

//뒤로가기 버튼 unable
window.addEventListener('popstate', function () {
  history.pushState(null, null, document.location.pathname);
});
