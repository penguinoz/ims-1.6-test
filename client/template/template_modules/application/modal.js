var templateName = "modal";
var modalObj = {};


Template[templateName].onRendered(function(){
//   $('.modal-dialog').draggable({
//     // cursor: 'move',
//     handle: '.modal-header'
// });
});

Template[templateName].helpers({
  modalRequest: function (e, obj) {
    modalObj = obj;

    if (modalObj.template) {
        Modal.show('modal', modalObj);
    }
  },
  modalTemplate: function() {
    return modalObj;
  }
});

