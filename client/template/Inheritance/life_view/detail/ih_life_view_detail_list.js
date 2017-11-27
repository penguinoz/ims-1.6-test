import {global} from '/imports/global/global_things.js';

var templateName = 'ihLifeViewDetailList';

Template[templateName].events({
  'click #search': function(e, t){
    e.preventDefault();

    var sessionData = Session.get('ihLifeView templateData');
    if(!sessionData.originDataList){
      sessionData.originDataList = sessionData.data;
    }
    var searchCondition = t.find('#keywordCondition').value;
    var searchText = t.find('#keywordText').value;
    var sortBy = t.find('#sort').value;

    lifeMapSortFunc(sessionData.originDataList, searchCondition, searchText, sortBy);
  },
  "click #mapListCard": function(e, t) {
    e.preventDefault();
    // if(e.currentTarget.id === 'mapListCard'){
    //   return;
    // }
    var sessionData = Session.get('ihLifeView templateData');
    var templateData = {};
    templateData.postId = this._id;
    templateData.type = this.type;
    templateData.lifeViewDataList = sessionData.data;
    templateData.lifeViewOriginData = sessionData.originDataList;
    templateData.fromView = "ihLifeViewDetailList";

    global.fn_replaceLifeViewDetail(templateData, 'ihLifeView');
  }
});

Template[templateName].helpers({
  hpListData: function(){
    return Session.get('ihLifeView templateData');
  },
  hpMemoryDate: function (startDate) {
    return global.utilGetDate(startDate).defaultYMD;
  },
  hpContentType: function(dataType,type){
    if(dataType === type){
      return true;
    }else{
      return false;
    }
  }
});

Template.ihLifeContentSearchTmp.onRendered(function(){

  $('#sort').val('startDateDesc'); //초기설정
  var searchOption = Session.get('ihLifeView templateData');

  $('#sort').on('change', function(e, t) {
    //e.preventDefault();
    var srchCondition = $('#keywordCondition').val();
    var srchText = $('#keywordText').val();
    var sortBy = $('#sort').val();
    var sessionData = null;
    if(Session.get('ihLifeView templateData') && Session.get('ihLifeView templateData').originDataList){
      sessionData = Session.get('ihLifeView templateData').originDataList;
    }else{
      sessionData = Session.get('ihLifeView templateData').data;
    }
    lifeMapSortFunc(sessionData, srchCondition, srchText, sortBy);
  });

  global.fn_selectPicker('.selectpicker.viewDetail', null);
});

Template.ihLifeContentSearchTmp.helpers({
  hpgetCount: function(){
    if(Session.get('ihLifeView templateData') && Session.get('ihLifeView templateData').data){
      return Session.get('ihLifeView templateData').data.length;
    }
    return 0;
  }
});

function lifeMapSortFunc(datas, type, schText, sortOption){
  if(!datas[0].editedContent){
    for(var i in datas){
      datas[i].editedContent = removeTagFunc(datas[i].content);
    }
  }
  var templateData = Session.get('ihLifeView templateData');
  if(schText==="" && templateData.originDataList){
    templateData.data = templateData.originDataList;
    Session.set('ihLifeView templateData',templateData);
    // return;
  }else if(schText===""){
    templateData.data = templateData.data;
    Session.set('ihLifeView templateData',templateData);
    // return;
  }
  var clipboard = [];
  var clipboardIndex = [];
  switch(type){
    case 'all' : case 'userNick':
    for(var i in datas){
      if(datas[i].userNick ){
        if(datas[i].userNick.indexOf(schText) !== -1){
          // datas[i].userNick[k] = datas[i].userNick[k].replace(schText, '<strong>' + schText + '</strong>');
          clipboardIndex.push(i);
        }
      }
    }
    if(type === 'userNick'){
      break;
    }

    case 'all': case 'title':
      for(var i in datas){
        if(datas[i].title){
          if(datas[i].title.indexOf(schText) !== -1){
            datas[i].title = datas[i].title.replace(schText, '<strong>' + schText + '</strong>');
            clipboardIndex.push(i);
          }
        }
      }
      if(type === 'title'){
        break;
      }

    case 'all': case 'tag':
      for(var i in datas){
        if(datas[i].tagList.length !== 0 ){
          for(var k in datas[i].tagList){
            if(datas[i].tagList[k].indexOf(schText) !== -1){
              datas[i].tagList[k] = datas[i].tagList[k].replace(schText, '<strong>' + schText + '</strong>');
              clipboardIndex.push(i);
            }
          }
        }
      }
      if(type === 'tag'){
        break;
      }

  }
  clipboardIndex = _.uniq(clipboardIndex);
  for(var i in clipboardIndex){
    clipboard.push(datas[clipboardIndex[i]]);
  }
  var templateData = Session.get('ihLifeView templateData');
  if(!templateData.originDataList){
    templateData.originDataList = templateData.data;
  }
  if(sortOption){
    switch(sortOption){
      case 'regDateDesc' :
        clipboard = _.chain(_.compact(clipboard)).sortBy('open').sortBy('like').sortBy('regDate').value().reverse();
      break;
      case 'regDateAsc' :
        clipboard = _.chain(_.compact(clipboard)).sortBy('open').sortBy('like').sortBy('regDate').value();
      break;
      case 'openDesc' :
        clipboard = _.chain(_.compact(clipboard)).sortBy('regDate').sortBy('like').sortBy('open').value().reverse();
      break;
      case 'openAsc' :
        clipboard = _.chain(_.compact(clipboard)).sortBy('regDate').sortBy('like').sortBy('open').value();
      break;
      case 'like' :
        clipboard = _.chain(_.compact(clipboard)).sortBy('open').sortBy('regDate').sortBy('like').value().reverse();
      break;
    }
  // clipboard = _.chain(_.compact(clipboard)).sortBy('open').sortBy('like').sortBy('regDate').value().reverse();
  //  var res = _.sortBy(result,function(re){return re.regDate.substr(0,10)});
  }
  templateData.data = clipboard;
  Session.set('ihLifeView templateData',templateData);  //lifeviewimageMap

}

function removeTagFunc(content){
  var result = '';
  if (content) {
    var str = content.replace(/<\/p>/gi, "\n");
    str = str.replace(/<br\/>/gi, "\n");
    str = str.replace(/(<([^>]+)>)/gi, "");
    // var str = content.replace(/<img(.*?)>/gi, "");
    // str = str.replace(/<p>/gi, "");
    // str = str.replace(/<br>/gi, "");
    // str = str.replace(/<\/p>/gi, "<br/>");
    // return str;
    // str = str.split('</p>');
    str = str.split('\n');

    for (var i = 0; i < str.length; i++) {
      if (str[i] !== "") {
        result += str[i];
        if (i !== str.length-1) {
          result += '<br/>';
        }
      }
    }
    return result;
  }
}