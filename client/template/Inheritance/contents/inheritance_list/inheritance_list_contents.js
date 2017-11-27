import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 상속받은 내역 상세보기
var templateName = 'inheritanceListContents';

Template[templateName].onCreated(function(){
  Session.set('page interval', global.pageInterval.inheritanceContentsList);

  var instance = this;
  instance.inheritanceContents = new ReactiveVar();
  instance.searchType = new ReactiveVar('AL');
  instance.typeChanged = new ReactiveVar(true);

  var inheritanceUserId = instance.data.userId; //상속해준 사용자ID
  var parentInhId = instance.data.parentInhId;
  var messengerId = null; //상속의 상속시 실제 contents주인 userId
  if(instance.data.msgId){
    messengerId = instance.data.msgId;
  }

  instance.autorun(function(){
    Meteor.call('getInheritanceContents', inheritanceUserId, global.login.userId, messengerId, parentInhId, function(error, result){
      if(error){
        return console.log(error);
      } else {
        _.each(result, function(contentInfo, index){
          contentInfo.index = index;
          contentInfo.isOpened = _.has(_.invert(contentInfo.openedUser), global.login.userId);
          //페이징을 위해 method로 불러온 데이터를 local collection으로 설정함
          CLT.LcInhContentsList.insert(contentInfo);
        });
        instance.inheritanceContents.set(result);
      }
    });
  });
});

Template[templateName].onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);
  var instance = Template.instance();//.searchType.get();
  $('#type').on('change', function(e, t) {
    var searchBy = $('#type option:selected').val();
    instance.searchType.set(searchBy);
    Session.set('page interval', null);
    if(instance.typeChanged.get()){
      instance.typeChanged.set(false);
    }else{
      instance.typeChanged.set(true);
    }

  });
});

Template[templateName].helpers({
  hpInhertanceAllContents: function(){
    return Template.instance().inheritanceContents.get();
  },
  hpInhertanceLimitContents: function(){
    var condition = {};
    if (!Session.get('page interval')) {
      Session.set('page interval', global.pageInterval.inheritanceContentsList);
    }

    if(!_.isEqual(Template.instance().searchType.get(), 'AL')){
      condition = {type : Template.instance().searchType.get()};
    }

    Session.set('page condition', condition);

    return CLT.LcInhContentsList.find(
      condition,{skip: Session.get('page interval').skip, limit: Session.get('page interval').limit}
    ).fetch();
  },
  hpConditionChange: function(type){
    return Template.instance().typeChanged.get();
  },
});

Template[templateName].events({
  //컨텐츠 상속 상세보기 추가
  "click .detail": function(e, t){
    e.preventDefault();

    //열람한 컨텐츠에 기록남기기
    if(!this.isOpened){
      var condition = {
        _id: this.postId,
        'instContents.contentId' : this.contentId,
      };
      var data={
        $push:{'instContents.$.openedUser' : global.login.userId},
        $set:{updateDate : global.utilGetDate().default}
      };

      //서버 데이터 업데이트 (즉시상속 데이터)
      Meteor.call('updateInheritor', condition, data, function(error, result){
        if(error){
          return console.log(error);
        }
      });

      condition = {
        _id: this.postId,
        'contents.contentId' : this.contentId
      };
      data={
        $push:{'contents.$.openedUser' : global.login.userId},
        $set:{updateDate : global.utilGetDate().default}
      };

      //서버 데이터 업데이트 (즉시상속 데이터X)
      Meteor.call('updateInheritor', condition, data, function(error, result){
        if(error){
          return console.log(error);
        }
      });

      //client collection 데이터 업데이트 (페이징을 위해 method로 불러온 데이터를 local collection으로 설정했음)
      CLT.LcInhContentsList.update({_id: this._id},
      {$set:{
        isOpened : true
      }});
    }

    // var preContentindex = this.index > 0 ? (this.index-1) : '';
    // var nextContetIndex = this.index + 1;
    //
    // var preContent =  CLT.LcInhContentsList.findOne({index : preContentindex});
    // var nextContent =  CLT.LcInhContentsList.findOne({index : nextContetIndex});

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'modal-md2 inheritance';
    modalobj.fade = true;    modalobj.backdrop = 'static';
    modalobj.data = {
      _id: this.contentId,
      pageType : this.type,
      title : '컨텐츠상속 상세보기',
      parentViewId: Blaze.currentView.name,
      content:this,
      contentsList : t.inheritanceContents.get(),
      isUsePreNext: true
    };

    global.utilModalOpen(e, modalobj);
  }
});

Template[templateName].onDestroyed(function(){
  Session.set('page interval', null);
  Session.set('page condition', null);
  initList();
});

//로컬 컬렉션을 초기화 해준다.
function initList(){
  CLT.LcInhContentsList.remove({});
}
