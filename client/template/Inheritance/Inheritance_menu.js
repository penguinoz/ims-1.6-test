import {global} from '/imports/global/global_things.js';

//상속 화면 좌측 메뉴
var templateName = 'inheritanceMenu';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.inheritanceCount = new ReactiveVar(0);

  var templateData = {};
  templateData.contentTmp = 'inheritanceInheritor';
  Session.set('inheritanceMenu selectedMenu', 'aMyInheritor');
  Session.set('inheritanceMain templateData', templateData);
  // Session.set('myPageMenu trigger', true);


  instance.autorun(function(){
    Meteor.call('getInheritanceAllKindCount', global.login.userId, function(error, result){
      if(error){
        return console.log(error);
      } else {
        instance.inheritanceCount.set(result); //상속받은 내역
      }
    });
  });
});

Template[templateName].helpers({
  hpInheritanceCount: function(){
    return Template.instance().inheritanceCount.get();
  },
  hpActive: function(name){
    if(name === Session.get('inheritanceMenu selectedMenu')){
      return 'active';
    } else {
      return '';
    }
  }
});

Template[templateName].events({
  'click #aMyInheritor,#aInheritanceList,#aMyGuardians,#aImGuardian,#aInviteFuneral,#aAdvanceDirectives,#aAdvanceFuneral,#aPreviewWill': function(e, t){
    e.preventDefault();

    var templateData = {};
    var modalobj = {};
    Session.set('inheritanceMenu selectedMenu', e.currentTarget.id);
    switch(e.currentTarget.id){
      case 'aMyInheritor': //나의 상속인
        templateData.contentTmp = 'inheritanceInheritor';
        Session.set('inheritanceMain templateData', templateData);
      break;
      case 'aInheritanceList': //상속받은 내역
        templateData = {};
        templateData.contentTmp = 'inheritanceList';
        Session.set('inheritanceMain templateData', templateData);
      break;
      case 'aMyGuardians': //나의 가디언
        templateData.contentTmp = 'inheritanceGuardians';
        templateData.data = {
          //옵션으로 구분(나의 가디언)
          pageType : global.pageType.myGuardian
        };
        Session.set('inheritanceMain templateData', templateData);
      break;
      case 'aImGuardian': //내가 가디언
        templateData = {};
        templateData.contentTmp = 'inheritanceGuardians';
        templateData.data = {
          //옵션으로 구분(내가 가디언)
          pageType : global.pageType.imGuardian
        };
        Session.set('inheritanceMain templateData', templateData);
      break;
      case 'aInviteFuneral': //장례식 초대
        templateData = {};
        templateData.contentTmp = 'inheritanceInviteFuneral';
        Session.set('inheritanceMain templateData', templateData);
      break;
      case 'aAdvanceDirectives':
        modalobj.template = t.$(e.currentTarget).data('modal-template');
        modalobj.size = 'inh-paperform modal-xl inheritance';
        modalobj.fade = 'true';
        modalobj.data = {
          title : '사전의료 의향서',
        };

        global.utilModalOpen(e, modalobj);

      break;
      case 'aAdvanceFuneral':
        modalobj.template = t.$(e.currentTarget).data('modal-template');
        modalobj.size = 'inh-paperform modal-xl inheritance';
        modalobj.fade = 'true';
        modalobj.data = {
          title : '사전장례 의향서',
        };

        global.utilModalOpen(e, modalobj);

      break;
      case 'aPreviewWill':
        modalobj.template = t.$(e.currentTarget).data('modal-template');
        modalobj.size = 'inh-paperform modal-xl inheritance';
        modalobj.fade = 'true';
        modalobj.data = {
          title : '유언장 양식',
        };

        global.utilModalOpen(e, modalobj);

      break;
    }
  }
});
