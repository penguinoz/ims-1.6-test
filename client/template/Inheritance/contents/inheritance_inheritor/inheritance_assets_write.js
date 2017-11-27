import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 자산등록/수정
var templateName = 'inheritanceAssetsWrite';

var content = {
  'asset001': '소유자:\n위치:\n시가:\n근저당유무:\n비고:\n',
  'asset002': '은행명:\n계좌번호:\n금액:\n비고:\n',
  'asset003': '주식명:\n주식수:\n예탁기관:\n시가:\n비고:\n',
  'asset004': '권리자격:\n취득일자:\n시가:\n비고:\n',
  'asset005': '채권자:\n연락처:\n금액:\n상환기일:\n비고:\n',
  'asset006': '채무자:\n연락처:\n금액:\n반환기일:\n비고:\n',
  'asset007': '보험회사:\n계약자:\n피보험자:\n보험금수익자:\n보험기간:\n가입금액:\n비고:\n'
};

Template[templateName].onCreated(function(){
  var instance = this;
  var inheritorId = null;

  if (this.data.pageType) {
    this.data.data.map(function(item) {
      if (instance.data._id === item._id) {
        inheritorId = item.inheritorId;
      }
    });
  }

  this._id = new ReactiveVar(this.data._id);
  this.addCount = new ReactiveVar(1);                 // row 추가시 _id값에 주는 count값
  this.code = new ReactiveVar();                      // code데이터
  this.inheritData = new ReactiveVar(this.data.data); // 나의상속인들의 데이터
  this.asset = new ReactiveVar([]);                   // 자산데이터
  this.originAsset = 0;                              // 에셋의 처음상태
  this.inheritorId = new ReactiveVar(inheritorId);    // 현재 설정된 상속인
  this.pageType = new ReactiveVar(this.data.pageType);

  var code = CLT.ImsCode.find({type: {$in: ['asset', 'assetType']}});
  this.code.set(code);

  getAssetData(this.inheritorId.get(), this.inheritData.get());
  if(this.asset.get()[0]._id !== 0){
    this.originAsset = this.asset.get().length;
  }else{
    this.originAsset = 0;
  }
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

});

Template[templateName].events({
  // To 변경이벤트
  'change [name="inheritUserId"]': function(e, t){
    e.preventDefault();

    var _id = $('select[name="inheritUserId"]').find(':selected').val();
    var inheritorId = $('select[name="inheritUserId"]').find(':selected').attr('inheritorId');
    t._id.set(_id);
    t.inheritorId.set(inheritorId);
    getAssetData(inheritorId, t.inheritData.get());
  },
  // parentCode 변경이벤트
  'change [name="parentCode"]': function(e, t) {
    e.preventDefault();

    var index = e.target.getAttribute('index');
    var value = e.target.value;

    t.asset.get()[index].parentCode = value;
    t.asset.get()[index].childCode = '';
    t.asset.get()[index].content = content[value];

    t.asset.set(t.asset.get());
  },
  // + (row 추가)이벤트
  'click [name="add"]': function(e, t) {
    e.preventDefault();

    var temp = t.asset.get();
    var count = t.addCount.get() + 1;
    t.addCount.set(count);
    temp.push({
      _id: count,
      parentCode: 'asset001',
      content: content['asset001']
    });
    t.asset.set(temp);
  },
  // - (row 삭제)이벤트
  'click [name="remove"]': function(e, t) {
    e.preventDefault();

    var index = e.target.getAttribute('index');
    var temp = t.asset.get();

    temp.splice(Number(index), 1);
    t.asset.set(temp);
  },
  // 저장 이벤트
  'click [name="save"]': function(e, t) {
    e.preventDefault();

    var inheritorId = t.inheritorId.get();
    if (!global.fn_isExist(inheritorId)) {
      return global.utilAlert('상속인을 선택해주세요.');
    }

    var assetObj = global.utilGetFormDataArray(t);
    var tempData = assetObj.map(function(item, i) {
      delete item._id;
      delete item.inheritUserId;
      // delete item.regDate;
      return item;
    });

    var assetData = [];
    // 빈 object 검사하기
    if (tempData.length <= 1) {
      tempData.map(function(item) {
        if (_.has(item, "title")) {
          assetData.push(item);
        }
      });
    } else {
      assetData = tempData;
    }

    if (assetData.length !== 0) {
      if (!global.utilValidation(t)) {
        return;
      }
    }

    var condition = {
      userId: global.login.userId,
      inheritorId: inheritorId
    };
    var inheritObj = {
      $set: {
        asset: assetData,
        assetRegDate: global.utilGetDate(assetObj[0].regDate).default
      }
    };
    var instanceParam = t;
    Meteor.call('updateInheritor', condition, inheritObj, function(error) {
      if (error) {
        return alert(error);
      } else {
        var logtype = "";
        global.utilAlert('저장되었습니다.');
        if(instanceParam.originAsset === 0){
          if(instanceParam.asset.get().length !== 0){
            //신규작성
            logtype = 'assetWrite';
          }else{
            logtype = false;
          }
        }else{
          if(instanceParam.asset.get().length === 0){
            //전부삭제
            logtype = 'assetDelete';
          }else{
            logtype = 'assetEdit';
          }
        }
        var targetUser = instanceParam.inheritorId.get();
        Meteor.call('setLog', null, '', global.login.userId, targetUser, global.pageType.inHeritance, '', logtype,'' );
        var templateData = {};
        templateData.contentTmp = 'inheritanceAssets';
        templateData.data = {
          _id: t._id.get()
        };
        Session.set('inheritanceMain templateData', templateData);
      }
    });
  },
  // 취소 이벤트
  'click [name="cancel"]': function(e, t) {
    e.preventDefault();
    var templateData = {};
    templateData.contentTmp = 'inheritanceInheritor';
    Session.set('inheritanceMain templateData', templateData);
  },
  // 숫자만입력받기 이벤트
  'keyup [name="share"]': function(e, t) {
    e.preventDefault();

    var target = e.target;
    var numPattern = /([^0-9])/;

    var pattern = target.value.match(numPattern);
    if (pattern !== null) {
      target.value = '';
      return global.utilAlert('숫자만 입력해주세요.');
    } else {
      if (target.value < 1 || target.value > 100) {
        target.value = '';
        return global.utilAlert('상속지분은 1~100 사이에서 입력해주세요.');
      }
    }
  }
});

Template[templateName].helpers({
  // 현재지정된 상속인
  hpInheritorId: function() {
    return Template.instance().inheritorId.get();
  },
  // 상속인들
  hpInheritUserId: function(){
    return Template.instance().inheritData.get();
  },
  // 자산데이터
  hpAsset: function() {
    return Template.instance().asset.get();
  },
  // 부모코드
  hpCodeParent: function() {
    var data = [];
    Template.instance().code.get().map(function(item) {
      if (item.type === 'asset') {
        data.push(item);
      }
    });
    return data;
  },
  // 자식코드
  hpCodeChild: function(index) {
    var parentCode = 'asset001';
    if (Template.instance().asset.get()[index]) {
      parentCode = Template.instance().asset.get()[index].parentCode;
    }
    var data = [];
    Template.instance().code.get().map(function(item) {
      if (item.type === 'assetType' && item.pacode === parentCode) {
        data.push(item);
      }
    });
    return data;
  },
  // 작성일
  hpRegDate: function() {
    var regDate = null;
    Template.instance().inheritData.get().map(function(item) {
      if (Template.instance().inheritorId.get() === item.inheritorId) {
        regDate = item.assetRegDate;
      }
    });
    return global.utilGetDate(regDate).defaultYMD;
  },
  // 작성자
  hpWrite: function() {
    return Template.instance().inheritData.get()[0];
  },
  // 페이지 타입
  hpPageType: function() {
    return Template.instance().pageType.get();
  }
});

var getAssetData = function(inheritorId, data) {
  var tempArray = [];
  if (inheritorId) {
    data.map(function(item) {
      if (inheritorId === item.inheritorId) {
        if (item.asset.length === 0) {
          tempArray.push({
            _id: 0,
            title: '',
            parentCode: 'asset001',
            childCode: '',
            content: content['asset001']
          });
        } else {
          tempArray.push(item.asset);
          tempArray = _.flatten(tempArray);
        }
      }
    });
    // console.log('tempArray', tempArray);
  } else {
    tempArray.push({
      _id: 0,
      title: '',
      parentCode: 'asset001',
      childCode: '',
      content: content['asset001']
    });
  }
  Template.instance().asset.set(tempArray);
};
