import {global} from '/imports/global/global_things.js';
var templateName = 'imPrivacyPolicyPopup';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){
  var targetElement = this.$('.h-scroll');
  global.fn_customerScrollBarInit(targetElement, "dark");
});