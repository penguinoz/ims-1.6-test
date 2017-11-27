import {global} from '/imports/global/global_things.js';

Template.editor_option_check.onRendered(function(){
  global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark");
});

Template.editor_option_check.helpers({
  hpGetContext: function () {
    var self = this;
    return {
      key: global.editorSettings.key,
      heightMin : global.editorSettings.heightMin,
      toolbarButtons: global.editorSettings.toolbarButtons,
      toolbarButtonsMD: global.editorSettings.toolbarButtons,
      toolbarButtonsSM: global.editorSettings.toolbarButtons,
      toolbarButtonsXS: global.editorSettings.toolbarButtons,
      imageUploadToS3: global.editorSettings.imageUploadToS3,
      imageEditButtons: global.editorSettings.imageEditButtons,
      imageDefaultAlign: 'left',
      imagePaste: false,
      pasteAllowLocalImages: true,
      pluginsEnabled: ['image','codeView','draggable','fontSize'],
      initOnClick: false,
      placeholderText: null,
      charCounterCount: false,
      dragInline: true,
      toolbarSticky: false,
      theme : 'gray'
  };
}
});