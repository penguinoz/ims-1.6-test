// 라이프뷰 상세 베이스
var templateName = 'lifeViewDetail';

Template[templateName].onCreated(function(){
  var templateName = {
    headerTmp : null,
    contentTmp: null
  };

  // if (!global.fn_isExist(Session.get('endingNoteList templateData'))) {
  //   templateName.headerTmp = 'endingNoteListHeaderIm';
  //   templateName.contentTmp = 'imContent';
  //   Session.set('endingNoteList templateData', templateName);
  // }
});

Template[templateName].onRendered(function(){
    //global.fn_customerScrollBarInit(".h-scroll", "dark");
});

// Template[templateName].events({
//   // "click #im,#bucket,#time": function(e, t){
//   //   Session.set('endingNoteListHearder headerKey', e.target.id);
//   // },
//
//   'click .ui-tabs ul li': function(e){
//     e.preventDefault();
//     $(e.currentTarget).addClass('active').siblings().removeClass('active');
//     //var _tabContent = $(e.currentTarget).find('a').attr('href');
//     //$('.tabs-container').find(_tabContent).show().siblings().hide();
//   }
// });

Template[templateName].helpers({
  contentList: function(){
    return Session.get('endingNoteList templateData');
  },

  // endingHeader: function() {
  //   return dynamicTemplateName;
  //   //return this.data.headerTmp;
  // },
});

Template[templateName].onDestroyed(function(){
  Session.set('endingNoteList templateData', null);
});
