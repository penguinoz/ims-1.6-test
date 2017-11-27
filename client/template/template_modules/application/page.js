import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

var templateName = 'page';

Template[templateName].onCreated(function(){
  this._id = new ReactiveVar(this.data._id);
  this.status = new ReactiveVar(this.data.status);
  this.totalData = new ReactiveVar();
  this.limit = new ReactiveVar(this.data.limit);
  this.active = new ReactiveVar(1); // page 버튼active
  this.pageMin = new ReactiveVar(1); // 최소페이지
  this.pageMax = new ReactiveVar(5); // 최대페이지
  this.quotient = new ReactiveVar(0); // 마지막페이지
  this.findName = new ReactiveVar(this.data.findName);
});

Template[templateName].onDestroyed(function(){
  // Session.set('page interval', null);
});

Template[templateName].events({
  'click li[name="pageNum"]': function(e, t){
    e.preventDefault();

    var pageNum = Number(e.target.text);
    var skip = (pageNum - 1) * Number(t.limit.get());
    var result = {
      limit: t.limit.get(),
      skip: skip
    };
    t.active.set(pageNum);
    Session.set('page interval', result);
  },
  // page Next버튼
  'click li[name="next"]': function(e, t) {
    e.preventDefault();

    var min = t.pageMin.get() + 5;
    var max = t.pageMax.get() + 5;

    if (t.quotient.get() + 5 >= max) {
      t.pageMin.set(min);
      t.pageMax.set(max);
    }
  },
  // page previous버튼
  'click li[name="previous"]': function(e, t) {
    e.preventDefault();

    var min = t.pageMin.get() - 5;
    var max = t.pageMax.get() - 5;

    if (min > -1) {
      t.pageMin.set(min);
      t.pageMax.set(max);
    }
  }
});

Template[templateName].helpers({
  // 페이지 갯수
  hpPageList: function(){
    var result = [];
    var Remainder = 0;

    switch(Template.instance().findName.get()) {
      case 'timecapsuleMessage':
      var condition = {};
      switch(Template.instance().status.get()) {
        case 'PR':
        condition = {
          userId:global.login.userId,
          capsuleId: Template.instance()._id.get()
        };
        break;
        case 'US':
        condition = {capsuleId: Template.instance()._id.get()};
        break;
        case 'PB':
        condition = {capsuleId: Template.instance()._id.get()};
        break;
        case 'BR':
        return result;
      }

        Template.instance().totalData.set(CLT.EnCapsuleMessage.find(condition, {sort: {regDate:1}}).fetch());
      break;
      case 'inheritanceContentsList': {
        // this.totalData.set(CLT.LcInhContentsList.find(Session.get(this.condition.get()).fetch());
        Template.instance().totalData.set(CLT.LcInhContentsList.find(Session.get('page condition')).fetch());
      break;
      }
    }

    Template.instance().quotient.set(Math.ceil(Template.instance().totalData.get().length / Template.instance().limit.get())); // 몫

    for (var i = 1; i <= Template.instance().quotient.get(); i++) {
      if (i >= Template.instance().pageMin.get() && i <= Template.instance().pageMax.get()) {
        result.push(i);
      }
    }
    return result;
  },
  // 페이지 active
  hpPageActive: function(pageNum) {
    return Template.instance().active.get() === pageNum;
  }
});