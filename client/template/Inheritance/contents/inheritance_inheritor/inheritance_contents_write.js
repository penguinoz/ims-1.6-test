import {global} from '/imports/global/global_things.js';

//컨텐츠 상속 등록
var templateName = 'inheritanceContentsWrite';

Template[templateName].onCreated(function(){
  $(".treeContainer ul.nav li.parent.active > a > span.sign").find('i:first').addClass("icon-minus");
  $(".treeContainer ul.nav li.current").parents('ul.children').addClass("in");

  var instance = this;
  this.imList = new ReactiveVar();
  this.meList = new ReactiveVar();
  this.imLifeList = new ReactiveVar();
  this.bucketList = new ReactiveVar();
  this.timeCapsuleList = new ReactiveVar();
  this.inheritHistory = new ReactiveVar();
  this.myInheritList = new ReactiveVar();
  this.inheritData = new ReactiveVar(this.data.data);
  this.addInheritorId = new ReactiveVar([]);
  this.addName = new ReactiveVar([]);
  this.implus = new ReactiveVar(9);
  this.bkplus = new ReactiveVar(9);
  this.tcplus = new ReactiveVar(9);
  this.itplus = new ReactiveVar(9);
  this.pageType = new ReactiveVar(this.data.pageType);

  // 체크선택한거갯수
  this.imCount = new ReactiveVar(0);
  this.meCount = new ReactiveVar(0);
  this.imLifeCount = new ReactiveVar(0);
  this.bkCount = new ReactiveVar(0);
  this.tcCount = new ReactiveVar(0);
  this.itCount = new ReactiveVar(0);

  this.choiceContent = new ReactiveVar();

  if (this.data.pageType) {
    var nameArr = [];
    var tempArr = [];
    if (this.data.name) {
      nameArr.push(this.data.name);
    } else {
      nameArr.push(this.data.inheritorId);
    }
    tempArr.push(this.data.inheritorId);
    this.addInheritorId.set(tempArr);
    this.addName.set(nameArr);
  }

  getInheritContentData(this, '', ''); // 상속의 각각 데이터 셋팅
});

Template[templateName].onRendered(function(){
  global.fn_selectPicker('.selectpicker', null);
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].events({
  // To 변경이벤트
  'click ul.nav li.parent > a > span.sign': function(e, t){
    e.preventDefault();
    $(e.target).find('i:first').toggleClass("icon-minus");
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
          t.imCount.set(0);
        }
      break;
      case 'parentCheck2':
        $('input:checkbox[name="bkCheck"]').prop('checked', _checked);
        if (_checked) {
          t.bkCount.set(t.bucketList.get().length);
        } else {
          t.bkCount.set(0);
        }
      break;
      case 'parentCheck3':
        $('input:checkbox[name="tcCheck"]').prop('checked', _checked);
        if (_checked) {
          t.tcCount.set(t.timeCapsuleList.get().length);
        } else {
          t.tcCount.set(0);
        }
      break;
      case 'parentCheck6':
        $('input:checkbox[name="meCheck"]').prop('checked', _checked);
        if (_checked) {
          t.meCount.set(t.meList.get().length);
        } else {
          t.meCount.set(0);
        }
      break;
      case 'parentCheck7':
        $('input:checkbox[name="imLifeCheck"]').prop('checked', _checked);
        if (_checked) {
          t.imLifeCount.set(t.imLifeList.get().length);
        } else {
          t.imLifeCount.set(0);
        }
      break;
      case 'parentCheck5':
        $('input:checkbox[name="itCheck"]').prop('checked', _checked);
        if (_checked) {
          t.itCount.set(t.inheritHistory.get().length);
        } else {
          t.itCount.set(0);
        }
      break;
    }
  },
  'change .treeContainer .current .checkbox input': function(e, t){
    e.preventDefault();
    $(e.target).parents('.current').toggleClass("active");
  },
  'click #addInheritorAddBtn1,#checkListAdd1,#addInheritorAddBtn2,#checkListAdd2':function(e, t){
    e.preventDefault();
    switch (e.currentTarget.id) {
      case 'addInheritorAddBtn1':
        var _height = $('#addInheritorCheckList1 .checkbox-section').innerHeight() + 15;
        if($('#addInheritorCheckList1').hasClass('active')){
          $('#addInheritorCheckList1').removeClass('active').animate( { height:0 }, 500 );
        }else{
          $('#addInheritorCheckList1').addClass('active').animate( { height:_height }, 500 );
        }
        break;
      case 'checkListAdd1':
        $('#addInheritorCheckList1').removeClass('active').animate( { height: 0 }, 500 );
        break;
      case 'addInheritorAddBtn2':
        var _height = $('#addInheritorCheckList2 .checkbox-section').innerHeight() + 15;
        if($('#addInheritorCheckList2').hasClass('active')){
          $('#addInheritorCheckList2').removeClass('active').animate( { height:0 }, 500 );
        }else{
          $('#addInheritorCheckList2').addClass('active').animate( { height:_height }, 500 );
        }
        break;
      case 'checkListAdd2':
        $('#addInheritorCheckList2').removeClass('active').animate( { height: 0 }, 500 );
        break;
      default:
    }
  },
  'click #addInheritorCopyBtn':function(e, t){
    e.preventDefault();
    $('.addInheritor-copyCheckContainer').toggleClass('active');
  },
  // 상속대상자 체크 이벤트
  'click [name="inheritorId"]': function(e, t) {
    var refuseDate = e.target.getAttribute('refuseDate');
    if (global.fn_isExist(refuseDate)) {
      e.preventDefault();
      global.utilAlert('상속거부 상태중입니다.');
    } else {
      var value = e.target.getAttribute('value');
      var value1 = e.target.getAttribute('value');
      var name = e.target.getAttribute('nonuser');
      var inheritorArr = t.addInheritorId.get();
      var inheritorName = t.addName.get();

      if (name) {
        value1 = name;
      }
      if (e.target.checked) {
        inheritorArr.push(value);
        inheritorName.push(value1);
      } else {
        inheritorArr = _.without(inheritorArr, value);
        inheritorName = _.without(inheritorName, value1);
      }
      t.addInheritorId.set(inheritorArr);
      t.addName.set(inheritorName);
    }
  },
  // 저장 이벤트
  'click [name="save"]': function(e, t) {
    e.preventDefault();

    var defaultData = t.inheritData.get();
    // var inheritorIdList = t.findAll('input[name="inheritorId"]:checked');
    var inheritorIdList = t.addInheritorId.get();
    var newArr = [];
    inheritorIdList.map(function(item) {
      defaultData.map(function(subItem) {
        if (item === subItem.inheritorId || item === subItem.name) {
          newArr.push({
            inheritorId: item,
            contents: subItem.contents
          });
        }
      });
    });

    if (newArr.length === 0) {
      return global.utilAlert('상속인을 선택해주세요.');
    }

    var imList = t.findAll('input[name="imCheck"]:checked');
    imList = imList.map(function(item) {
      return {
        contentId: item.value,
        type: 'IM'
      };
    });
    var meList = t.findAll('input[name="meCheck"]:checked');
    meList = meList.map(function(item) {
      return {
        contentId: 'ME',
        type: 'ME'
      };
    });
    var imLifeList = t.findAll('input[name="imLifeCheck"]:checked');
    imLifeList = imLifeList.map(function(item) {
      return {
        contentId: 'LT',
        type: 'LT'
      };
    });
    var bkList = t.findAll('input[name="bkCheck"]:checked');
    bkList = bkList.map(function(item) {
      return {
        contentId: item.value,
        type: 'BL'
      };
    });
    var tcList = t.findAll('input[name="tcCheck"]:checked');
    tcList = tcList.map(function(item) {
      return {
        contentId: item.value,
        type: 'TC'
      };
    });

    var condition = {
      userId: global.login.userId,
    };
    var data = {};

    var listData = _.union(imList, meList, imLifeList, bkList, tcList);

    for (var i = 0; i < newArr.length; i++) {
      condition.inheritorId = newArr[i].inheritorId;
      condition.msgId = '';
      var pushData = [];
      if (newArr[i].contents.length === 0) {
        for(var j = 0; j < listData.length; j++) {
          listData[j].isInstant = false;
          listData[j].regDate = global.utilGetDate().default;
          pushData.push(listData[j]);
        }
        Meteor.call('setLog', '', '', global.login.userId ,newArr[i].inheritorId ,  global.pageType.inHeritance, '', 'setInhContent','' );
      } else {
        var result = [];
        result = _.reject(listData, function(obj) { return _.findWhere(newArr[i].contents, obj); });
        for (var r = 0; r < result.length; r++) {
          result[r].isInstant = false;
          result[r].regDate = global.utilGetDate().default;
          pushData.push(result[r]);
        }
      }
      data = {
        $push: {
          contents: {$each: pushData}
        }
      };
      Meteor.call('updateInheritor', condition, data);
    }

    // 상속받은내역을 체크했을때
    var itList = t.findAll('input[name="itCheck"]:checked');
    itList = itList.map(function(item) {
      var data = {};
      t.inheritHistory.get().map(function(subItem) {
        if (item.value === subItem._id) {
          data = subItem;
        }
      });
      return data;
    });
    if (itList.length !== 0) {
      _.each(newArr, function(item) {
        _.each(itList, function(subItem) {
          var userId = global.login.userId;
          var inheritorId = item.inheritorId;
          var msgId = subItem.userId;
          // userId, inheritorId, msgId 값있는지 찾기
          Meteor.call('getInheritanceByMsgId', userId, inheritorId, msgId, function(error, result) {
            if (result.length === 0) {
              // row insert
              var path = subItem.inhPath;
              path.push(subItem.inheritorId);
              var insert = {
                userId: userId,
                inheritorId: inheritorId,
                msgId: msgId,
                parentInhId: subItem._id,
                asset: [],
                contents: [],
                instContents: [],
                inhPath: path,
                updateDate: global.utilGetDate().default,
                regDate: global.utilGetDate().default,
              };
              Meteor.call('setInheritanceMsgId', insert);
            } else {
              var condition = {
                userId: userId,
                inheritorId: inheritorId,
                msgId: msgId
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
      });
    }
    global.utilAlert('저장되었습니다.');
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
      case 'IM': count = t.implus.get() + 10; t.implus.set(count); break;
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
  // sort 이벤트
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
  'click [name="testNow"]': function(e, t) {
    e.preventDefault();
    var templateData = {};
    templateData.contentTmp = 'inheritanceInstant';
    Session.set('inheritanceMain templateData', templateData);
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
  // 상속자들 데이터
  hpInheritors: function(){
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
  // 추가상속인
  hpAddInheritorId: function() {
    return Template.instance().addName.get();
  },
  // 페이지타입
  hpPageType: function() {
    return Template.instance().pageType.get();
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
  hpContentSelected: function(_id) {
    return Template.instance().choiceContent.get() === _id;
  }
});

getInheritContentData = function(instance, searchCondition, searchText) {
  Meteor.call('storySearchFind', global.login.userId, searchCondition, searchText, function(error, result) {
    instance.imList.set(result);
  });
  Meteor.call('imMeFindList', global.login.userId, function(error, result) {
    var array = [];
    if (result.length !== 0) {
      array.push(result[0]);
    }
    instance.meList.set(array);
  });
  Meteor.call('lifeFindList', global.login.userId, function(error, result) {
    var array = [];
    if (result.length !== 0) {
      array.push(result[0]);
    }
    instance.imLifeList.set(array);
  });
  Meteor.call('bucketSearchFind', global.login.userId, searchCondition, searchText, function(error, result) {
    instance.bucketList.set(result);
  });
  Meteor.call('timeCapsuleSearchFind', global.login.userId, searchCondition, searchText, function(error, result) {
    instance.timeCapsuleList.set(result);
  });
  // 상속받은 내역
  Meteor.call('getInheritanceByInheritId', global.login.userId, function(error, result) {
    instance.inheritHistory.set(result);
  });
};

UI.registerHelper('instnace_icon_plus', function(len) {
  return len > 10;
});
