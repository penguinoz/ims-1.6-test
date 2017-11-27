// 컨텐츠 상속 상세 (팝업)
var templateName = 'inheritanceListContentsDetailPopup';

Template[templateName].onCreated(function(){
  this.pageReact = new ReactiveVar();
  this.pageReact.set(this.data.pageType);
  this.isUsePreNext = this.data.isUsePreNext;
});

Template[templateName].helpers({
  hpTemplateSelecter: function(tempOp){
    if(tempOp === Template.instance().pageReact.get()){
      return true;
    }else{
      return false;
    }
  },
  hpPreContent: function(){
    var instan = Template.instance().pageReact.get();
    var id = Template.instance().data._id;
    var contents = Template.instance().data.contentsList;
    var positionIndex = 0;
    for(var i in contents){
      if(contents[i].contentId === id ){
        positionIndex = i;
      }
    }
    var returnCont = [];
    if(positionIndex === 0){
      return [];
    }else{
      return [contents[positionIndex-1]];
    }
  },
  hpNextContent: function(){
    var instan =Template.instance().pageReact.get();
    var id = Template.instance().data._id;
    var contents = Template.instance().data.contentsList;
    var positionIndex = 0;
    for(var i in contents){
      if(contents[i].contentId === id ){
        positionIndex = i;
      }
    }
    var returnCont = [];
    if(positionIndex === contents.length){
      return [];
    }else{
      return [contents[Number(positionIndex)+1]];
    }
  }
});

Template[templateName].events({
  "click div[name='nextOrPreContent']": function(e, t){
    Template.instance().data._id = this.contentId;
    Template.instance().pageReact.set(null);
    var tempInstans = Template.instance();
    var type = this.type;
    setTimeout(function(){
      tempInstans.pageReact.set(type);
    }, 200);
  }
});
