import {global} from '/imports/global/global_things.js';

// 마이페이지 > 댓글
var templateName = 'myPageComment';
var instance;
const onWindowResize = function() {
  // debugger;
  var width = $(window).width();
  var height = $(window).height();
    var maxHeight = $('.mCustomScrollBox').height();
    $('.mCSB_inside > .mCSB_container').height(height);
};

const throttledOnWindowResize = _.throttle(onWindowResize, 200, {
  leading: false
});

Template[templateName].onCreated(function(){
  instance = this;
  instance.dataList = new ReactiveVar();
  instance.count = new ReactiveVar(0);

  instance.searchTxt = '';
  instance.serchType = 'all';
  instance.sortBy = 'regDateDesc';
  instance.tab = new ReactiveVar('toTab');

  initialData(instance.searchTxt, instance.serchType, instance.sortBy, instance.tab.get());
});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);

  //첫화면시 height조절
  onWindowResize();
  //리사이즈 시 height 조절
  $(window).resize(throttledOnWindowResize);
});

Template[templateName].helpers({
  hpCommentData: function(){
    return Template.instance().dataList.get();
  },
  hpLatestUser: function(users){
    return users[0];
  },
  hpCount: function(){
    return Template.instance().count.get();
  }
});

Template[templateName].events({
  "click [name=title]": function(e, t){
    // global.fn_setPageOwner(this.userId);
  },
  "click #toTab,#fromTab": function(e, t){
    e.preventDefault();

    if(_.isEqual(e.currentTarget.id, 'fromFavor')){
      t.count.set(t.dataList.get().from.length);
    } else {
      t.count.set(t.dataList.get().to.length);
    }

    initialData(t.searchTxt, t.serchType, t.sortBy, t.tab.get());
  },
  "click [name=search]": function(e, t) {
    e.preventDefault();

    //검색 리미트 재설정
    // Session.set('imContent itemsLimit', global.itemsIncrement);

    //검색 조건 설정
    t.serchType = t.find('[name=keywordCondition]').value;
    t.searchTxt = t.find('[name=keywordText]').value;
    t.sortBy = t.find('[name=selectSort]').value;

    //데이터 검색
    initialData(t.searchTxt, t.serchType, t.sortBy, t.tab.get());
  },
  "change [name=selectSort]": function(e, t){
    e.preventDefault();

    t.serchType = t.find('[name=keywordCondition]').value;
    t.searchTxt = t.find('[name=keywordText]').value;
    t.sortBy = e.currentTarget.value;

    //데이터 검색
    initialData(t.searchTxt, t.serchType, t.sortBy, t.tab.get());
  }
});



function initialData(_searchTxt, _serchType, _sortBy, _tab){
  var tab = _tab;
  Meteor.call('getCommentData', Meteor.users.findOne({_id: Meteor.userId()}).username, _searchTxt, _serchType, _sortBy, _tab, function(error, result){
    if(error){
      return console.log(error);
    } else {
      instance.dataList.set(result);

      if(_.isEqual(tab, 'toTab')){
        instance.count.set(result.to.length);
      } else {
        instance.count.set(result.from.length);
      }
    }
  });
}
