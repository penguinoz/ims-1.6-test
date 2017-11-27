import {global} from '/imports/global/global_things.js';

// 컨텐츠 상속 리스트
var templateName = 'inheritanceContents';

var imCount = 0;
var meCount = 0;
var ltCount = 0;
var bkCount = 0;
var tcCount = 0;
var itCount = 0;
var insImCount = 0;
var insMeCount = 0;
var insLtCount = 0;
var insBkCount = 0;
var insTcCount = 0;
var insItcount = 0;

Template[templateName].onCreated(function(){
  var instance = this;

  this._id = new ReactiveVar(this.data._id);
  this.inheritorId = new ReactiveVar(this.data.inheritorId);
  this.name = new ReactiveVar(this.data.name);
  this.imList = new ReactiveVar();
  this.meList = new ReactiveVar();
  this.imLifeList = new ReactiveVar();
  this.bucketList = new ReactiveVar();
  this.timeCapsuleList = new ReactiveVar();
  this.inheritHistory = new ReactiveVar();
  this.inheritData = new ReactiveVar(this.data.data);
  this.myInheritData = new ReactiveVar();
  this.choiceInheritData = new ReactiveVar();
  this.implus = new ReactiveVar(9);
  this.bkplus = new ReactiveVar(9);
  this.tcplus = new ReactiveVar(9);
  this.itplus = new ReactiveVar(9);

  // 체크선택한거갯수
  this.imCount = new ReactiveVar(0);
  this.meCount = new ReactiveVar(0);
  this.imLifeCount = new ReactiveVar(0);
  this.bkCount = new ReactiveVar(0);
  this.tcCount = new ReactiveVar(0);
  this.itCount = new ReactiveVar(0);

  // 상속된거 갯수
  this.inheritImCount = 0;
  this.inheritMeCount = 0;
  this.inheritImLifeCount = 0;
  this.inheritBkCount = 0;
  this.inheritTcCount = 0;
  this.inheritItCount = 0;

  // 상속받은내역 즉시상속된것
  this.inheritanceList = [];

  this.choiceContent = new ReactiveVar();

  getInheritContentData(this, '', '');
  Meteor.call('getInheritanceById', this.data._id, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      instance.myInheritData.set(result);
    }
  });
  getChoiceInheritData(this.data._id, this);
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].onDestroyed(function(){
  imCount = 0;
  meCount = 0;
  ltCount = 0;
  bkCount = 0;
  tcCount = 0;
  itCount = 0;
  insImCount = 0;
  insMeCount = 0;
  insLtCount = 0;
  insBkCount = 0;
  insTcCount = 0;
  insItcount = 0;
});

Template[templateName].events({
  'click #addInheritorCopyBtn':function(e, t){
    e.preventDefault();
    $('.addInheritor-copyCheckContainer').toggleClass('active');
  },
  'change .treeContainer .parent .lbl .checkbox input': function(e, t){
    e.preventDefault();
    var _checked = e.target.checked;
    var id = e.target.id;
    switch (id) {
      case 'parentCheck1':
        $('input:checkbox[name="imCheck"]').prop('checked', _checked);
        if (_checked) {
          t.imCount.set(t.imList.get().length);
        } else {
          t.imCount.set(t.inheritImCount);
        }
      break;
      case 'parentCheck2':
        $('input:checkbox[name="bkCheck"]').prop('checked', _checked);
        if (_checked) {
          t.bkCount.set(t.bucketList.get().length);
        } else {
          t.bkCount.set(t.inheritBkCount);
        }
      break;
      case 'parentCheck3':
        $('input:checkbox[name="tcCheck"]').prop('checked', _checked);
        if (_checked) {
          t.tcCount.set(t.timeCapsuleList.get().length);
        } else {
          t.tcCount.set(t.inheritTcCount);
        }
      break;
      case 'parentCheck6':
        $('input:checkbox[name="meCheck"]').prop('checked', _checked);
        if (_checked) {
          t.meCount.set(t.meList.get().length);
        } else {
          t.meCount.set(t.inheritMeCount);
        }
      break;
      case 'parentCheck7':
        $('input:checkbox[name="imLifeCheck"]').prop('checked', _checked);
        if (_checked) {
          t.imLifeCount.set(t.imLifeList.get().length);
        } else {
          t.imLifeCount.set(t.inheritImLifeCount);
        }
      break;
      case 'parentCheck5':
        $('input:checkbox[name="itCheck"]').prop('checked', _checked);
        if (_checked) {
          t.itCount.set(t.inheritHistory.get().length);
        } else {
          t.itCount.set(t.inheritItCount);
        }
      break;
    }
  },
  // 상속복사 대상 이벤트
  'change [name="inheritUserId"]':function(e, t) {
    e.preventDefault();

    var inheritorId = $('select[name="inheritUserId"]').find(':selected').attr('inheritorId');
    var _id = e.target.value;
    if (!inheritorId) {
      _id = t._id.get();
    }
    getChoiceInheritData(_id, t);
  },
  // 저장이벤트
  'click [name="save"]':function(e, t) {
    e.preventDefault();

    var imList = t.findAll('input[name="imCheck"]:checked');
    imList = imList.map(function(item) {
      return {
        contentId: item.value,
        type: 'IM',
        isInstant: false,
        regDate: global.utilGetDate().default
      };
    });
    var meList = t.findAll('input[name="meCheck"]:checked');
    meList = meList.map(function(item) {
      return {
        contentId: 'ME',
        type: 'ME',
        isInstant: false,
        regDate: global.utilGetDate().default
      };
    });
    var imLifeList = t.findAll('input[name="imLifeCheck"]:checked');
    imLifeList = imLifeList.map(function(item) {
      return {
        contentId: 'LT',
        type: 'LT',
        isInstant: false,
        regDate: global.utilGetDate().default
      };
    });
    var bkList = t.findAll('input[name="bkCheck"]:checked');
    bkList = bkList.map(function(item) {
      return {
        contentId: item.value,
        type: 'BL',
        isInstant: false,
        regDate: global.utilGetDate().default
      };
    });
    var tcList = t.findAll('input[name="tcCheck"]:checked');
    tcList = tcList.map(function(item) {
      return {
        contentId: item.value,
        type: 'TC',
        isInstant: false,
        regDate: global.utilGetDate().default
      };
    });

    var condition = {
      userId: global.login.userId,
      inheritorId: t.inheritorId.get(),
      msgId: ''
    };

    var myDefaultData = [];
    // 지금상속된 데이터
    t.myInheritData.get().contents.map(function(item) {
      if (item.isInstant) {
        myDefaultData.push(item);
      }
    });

    var listData = _.union(imList, meList, imLifeList, bkList, tcList, myDefaultData);

    var data = {
      $set: {
        contents: listData
      }
    };
    Meteor.call('updateInheritorcheckSt', condition, data,function(err, res){
      if(err){console.error(err);}
      if(res){
        if(listData.length !== 0 && res.contents.length === 0){
          Meteor.call('setLog', '', '', global.login.userId ,t.inheritorId.get() ,  global.pageType.inHeritance, '', 'setInhContent','' );
        }else if(listData.length !== 0 && res.contents.length !== 0){
          Meteor.call('setLog', '', '', global.login.userId ,t.inheritorId.get() ,  global.pageType.inHeritance, '', 'editInhContent','' );
        }else if(listData.length === 0 && res.contents.length !== 0){
          Meteor.call('setLog', '', '', global.login.userId ,t.inheritorId.get() ,  global.pageType.inHeritance, '', 'canselInhContent','' );
        }
      }
    });

    var itList = t.findAll('input[name="itCheck"]:checked');
    itList = itList.map(function(item) {
      return {
        _id: item.getAttribute('_id'),
        userId: global.login.userId,
        inheritorId: t.inheritorId.get(),
        msgId: item.value,
        inhPath: item.getAttribute('inhPath')
      };
    });

    if (itList.length !== 0) {
      _.each(itList, function(item) {
        Meteor.call('getInheritanceByMsgId', item.userId, item.inheritorId, item.msgId, function(error, result) {
          if (result.length === 0) {
            // insert
            var path = item.inhPath.split(',');
            path.push(item.inheritorId);
            var insert = {
              userId: item.userId,
              inheritorId: item.inheritorId,
              msgId: item.msgId,
              parentInhId: item._id,
              asset: [],
              contents: [],
              instContents: [],
              inhPath: path,
              updateDate: global.utilGetDate().default,
              regDate: global.utilGetDate().default,
            };
            Meteor.call('setInheritanceMsgId', insert);
          } else {
            // update && delete
            var condition = {
              userId: item.userId,
              inheritorId: item.inheritorId,
              msgId: item.msgId
            };
            var update = {
              $set: {
                updateDate: global.utilGetDate().default
              }
            };
            Meteor.call('updateInheritor', condition, update);
          }
        });
      });
    }

    var inheritHistory = t.inheritHistory.get().map(function(item) {
      return item._id;
    });
    var deleteInherit = itList.map(function(item) {
      return item._id;
    });

    var diffData = _.difference(inheritHistory, deleteInherit, t.inheritanceList);

    // 상속내역에 삭제 데이터 있을때
    if (diffData.length !== 0) {
      _.each(diffData, function(item) {
        Meteor.call('getInheritanceById', item, function(error, result) {
          if (error) {
            return alert(error);
          } else {
            Meteor.call('deleteinheritor', result.inheritorId, t.inheritorId.get(), result.userId);
          }
        });
      });

    }
    global.utilAlert('저장 되었습니다.');
    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  },
  'click [name="cancel"]': function(e, t) {
    e.preventDefault();
    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  },
  // 검색 이벤트
  'click [name="search"]': function(e, t) {
    e.preventDefault();

    var searchCondition = $('select[name="keywordCondition"]').find(':selected').val();
    var searchText = t.find('input[name="keywordText"]').value;
    getInheritContentData(t, searchCondition, searchText);
  },
  // 더보기 이벤트
  'click [name="plus"]': function(e, t) {
    e.preventDefault();

    var type = e.target.getAttribute('type');
    var count = 0;
    switch(type) {
      case 'IM': case 'BS': count = t.implus.get() + 10; t.implus.set(count); break;
      case 'BL': count = t.bkplus.get() + 10; t.bkplus.set(count); break;
      case 'TC': count = t.tcplus.get() + 10; t.tcplus.set(count); break;
      case 'IT': count = t.itplus.get() + 10; t.itplus.set(count); break;
    }
  },
  // 컨텐츠 상세
  'click [name="contentsDetail"]': function(e, t) {
    e.preventDefault();

    var _id = e.target.getAttribute('value');
    var type = e.target.getAttribute('type');
    var modalObj = {
      template: 'inheritanceListContentsDetailPopup',
      size : 'modal-mdmodal-lg',
      fade : true,
      data: {
        _id: _id,
        title : '컨텐츠 상세보기',
        pageType: type,
        parentViewId: Blaze.currentView.name,
        isUsePreNext: false,
        unableGoList: true
      }
    };
    t.choiceContent.set(_id);
    global.utilModalOpen(e, modalObj);
  },
  // sort 이벤트1
  'change [name="selectSortChoice"]': function(e, t) {
    e.preventDefault();

    var subSort = $('select[name="selectSort"]').find(':selected').val();
    switch (e.target.value) {
      case 'all':
      break;
      case 'check':
      break;
      case 'noCheck':
      break;
      case 'inst':
      break;
    }
  },
  // sort 이벤트2
  'change [name="selectSort"]': function(e, t) {
    e.preventDefault();

    switch (e.target.value) {
      case 'regDateDesc':
        t.imList.set(_.chain(t.imList.get()).sortBy('regDate').value().reverse());
        t.bucketList.set(_.chain(t.bucketList.get()).sortBy('regDate').value().reverse());
        t.timeCapsuleList.set(_.chain(t.timeCapsuleList.get()).sortBy('regDate').value().reverse());
      break;
      case 'regDateAsc':
        t.imList.set(_.sortBy(t.imList.get(), 'regDate'));
        t.bucketList.set(_.sortBy(t.bucketList.get(), 'regDate'));
        t.timeCapsuleList.set(_.sortBy(t.timeCapsuleList.get(), 'regDate'));
      break;
      case 'startDateDesc':
        t.imList.set(_.chain(t.imList.get()).sortBy('startDate').value().reverse());
        t.bucketList.set(_.chain(t.bucketList.get()).sortBy('startDate').value().reverse());
      break;
      case 'startDateAsc':
        t.imList.set(_.sortBy(t.imList.get(), 'startDate'));
        t.bucketList.set(_.sortBy(t.bucketList.get(), 'startDate'));
      break;
    }
  },
  'click [name="imCheck"],[name="meCheck"],[name="imLifeCheck"],[name="bkCheck"],[name="tcCheck"],[name="itCheck"]': function(e, t) {
    // e.preventDefault();

    var checked = $(e.target).is(":checked");
    var count = 0;
    if (checked) {
      count = 1;
    } else {
      count = -1;
    }
    var type = e.target.name;
    switch(type) {
      case 'imCheck': t.imCount.set(t.imCount.get() + count); break;
      case 'meCheck': t.meCount.set(t.meCount.get() + count); break;
      case 'imLifeCheck': t.imLifeCount.set(t.imLifeCount.get() + count); break;
      case 'bkCheck': t.bkCount.set(t.bkCount.get() + count); break;
      case 'tcCheck': t.tcCount.set(t.tcCount.get() + count); break;
      case 'itCheck': t.itCount.set(t.itCount.get() + count); break;
    }
  }
});

Template[templateName].helpers({
  // to
  hpToInheritorId: function() {
    var inheritorId = Template.instance().inheritorId.get();
    if (Template.instance().name.get()) {
      inheritorId = Template.instance().name.get();
    }
    return inheritorId;
  },
  // 상속자들
  hpInheritUserId: function(){
    return Template.instance().inheritData.get();
  },
  // 나는 데이터
  hpImList: function() {
    return Template.instance().imList.get();
  },
  // me 데이터
  hpMeList: function() {
    return Template.instance().meList.get();
  },
  // imList 데이터
  hpImLifeList: function() {
    return Template.instance().imLifeList.get();
  },
  // 버킷리스트 데이터
  hpBucketList: function() {
    return Template.instance().bucketList.get();
  },
  // 타임캡슐 데이터
  hpTimeCapsuelList: function() {
    return Template.instance().timeCapsuleList.get();
  },
  // 상속받은 내역
  hpMyInheritList: function() {
    return Template.instance().inheritHistory.get();
  },
  // default 체크
  hpChecked: function(_id, type) {
    if (Template.instance().choiceInheritData.get()) {
      var contents = Template.instance().choiceInheritData.get().contents;
      for (var data in contents) {
        if (contents[data].contentId === _id) {
          switch(type) {
            case 'IM': case 'BS': imCount ++; break;
            case 'ME': meCount ++; break;
            case 'LT': ltCount ++; break;
            case 'BL': bkCount ++; break;
            case 'TC': tcCount ++; break;
          }
          Template.instance().imCount.set(imCount);
          Template.instance().meCount.set(meCount);
          Template.instance().imLifeCount.set(ltCount);
          Template.instance().bkCount.set(bkCount);
          Template.instance().tcCount.set(tcCount);
          return 'checked';
        }
      }
    }
  },
  // 즉시 체크
  hpIsInstant: function(_id, type) {
    if (Template.instance().choiceInheritData.get()) {
      var contents = Template.instance().choiceInheritData.get().contents;
      for (var data in contents) {
        if (contents[data].contentId === _id && contents[data].isInstant) {
          switch(type) {
            case 'IM': case 'BS': imCount ++; insImCount ++; break;
            case 'ME': meCount ++; insMeCount ++; break;
            case 'LT': ltCount ++; insLtCount ++; break;
            case 'BL': bkCount ++; insBkCount ++; break;
            case 'TC': tcCount ++; insTcCount ++; break;
          }
          Template.instance().inheritImCount = insImCount;
          Template.instance().inheritMeCount = insMeCount;
          Template.instance().inheritImLifeCount = insLtCount;
          Template.instance().inheritBkCount = insBkCount;
          Template.instance().inheritTcCount = insTcCount;
          Template.instance().imCount.set(imCount);
          Template.instance().meCount.set(meCount);
          Template.instance().imLifeCount.set(ltCount);
          Template.instance().bkCount.set(bkCount);
          Template.instance().tcCount.set(tcCount);
          return true;
        }
      }
    }
  },
  // 상속받은내역 default체크
  hpCheckedInherit: function(data) {
    var result = [];
    result = ReactiveMethod.call('getInheritanceByMsgId', global.login.userId, Template.instance().inheritorId.get(), data.userId);
    if (result && result.length !== 0) {
      itCount ++;
      Template.instance().itCount.set(itCount);
      return 'checked';
    }
  },
  // 상속받은내역 즉시 체크
  hpIsInstantInherit: function(data) {
    var result = [];
    result = ReactiveMethod.call('getInheritanceByMsgId', global.login.userId, Template.instance().inheritorId.get(), data.userId);
    if (result && result.length !== 0) {
      if (result[0].instDate) {
        itCount ++;
        insItcount ++;
        Template.instance().itCount.set(itCount);
        Template.instance().inheritItCount = insItcount;
        Template.instance().inheritanceList.push(result[0].parentInhId);
        return true;
      }
    }
  },
  // total Data갯수
  hpTotalData: function() {
    var imLen = Template.instance().imList.get() ? Template.instance().imList.get().length : 0;
    var bkLen = Template.instance().bucketList.get() ? Template.instance().bucketList.get().length : 0;
    var tcLen = Template.instance().timeCapsuleList.get() ? Template.instance().timeCapsuleList.get().length : 0;
    var itLen = Template.instance().inheritHistory.get() ? Template.instance().inheritHistory.get().length : 0;
    return imLen + bkLen + tcLen + itLen;
  },
  // me 더보기
  hpImplus: function(index) {
    return Template.instance().implus.get() < index;
  },
  // 버킷 더보기
  hpBkplus: function(index) {
    return Template.instance().bkplus.get() < index;
  },
  // 타임캡슐 더보기
  hpTcplus: function(index) {
    return Template.instance().tcplus.get() < index;
  },
  // 상속받은내역 더보기
  hpItplus: function(index) {
    return Template.instance().itplus.get() < index;
  },
  // * 체크한거 카운트 * //
  hpImCount: function() {
    return Template.instance().imCount.get();
  },
  hpMeCount: function() {
    return Template.instance().meCount.get();
  },
  hpImLifeCount: function() {
    return Template.instance().imLifeCount.get();
  },
  hpBkCount: function() {
    return Template.instance().bkCount.get();
  },
  hpTcCount: function() {
    return Template.instance().tcCount.get();
  },
  hpItCount: function() {
    return Template.instance().itCount.get();
  },
  // 현재 페이지에 있는 유저는 select박스에서 제외시킴
  hpUserExcept: function(userId) {
    return  Template.instance().inheritorId.get() !== userId;
  },
  hpContentSelected: function(_id) {
    return Template.instance().choiceContent.get() === _id;
  }
});

var getChoiceInheritData = function(_id, instance) {
  Meteor.call('getInheritanceById', _id, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      instance.choiceInheritData.set(result);
    }
  });
};
