import {global} from '/imports/global/global_things.js';

// 라이프뷰 우측 리스트 화면
var templateName = 'lifeViewDetailList';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  hpListData: function(){
    return Session.get('endingNoteList templateData');
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

Template[templateName].events({
  "click #search": function(e, t) {
    e.preventDefault();
    var sessionData = Session.get('endingNoteList templateData');
    if(!sessionData.originDataList){
      sessionData.originDataList = sessionData.data;
    }
    //검색 조건 설정
    srchCondition = t.find('#keywordCondition').value;
    srchText = t.find('#keywordText').value;
    sortBy = t.find('#sort').value;

    //데이터 검색
    lifeMapSortFunc(sessionData.originDataList, srchCondition, srchText, sortBy);
  },
  "click .clickDetail": function(e, t) {
    e.preventDefault();
    // if(e.currentTarget.id === 'mapListCard'){
    //   return;
    // }
    var sessionData = Session.get('endingNoteList templateData');
    var templateData = {};
    templateData.postId = this._id;
    templateData.type = this.type;
    templateData.lifeViewDataList = sessionData.data;
    templateData.lifeViewOriginData = sessionData.originDataList;
    templateData.fromView = "lifeViewDetailList";

    global.fn_replaceLifeViewDetail(templateData);
  },

});

Template.lifeContentSearchTmp.onRendered(function(){

  $('#sort').val('startDateDesc'); //초기설정
  var searchOption = Session.get('endingNoteList templateData');

  $('#sort').on('change', function(e, t) {
    //e.preventDefault();
    var srchCondition = $('#keywordCondition').val();
    var srchText = $('#keywordText').val();
    var sortBy = $('#sort').val();
    if(Session.get('endingNoteList templateData') && Session.get('endingNoteList templateData').originDataList){
      var sessionData = Session.get('endingNoteList templateData').originDataList;
    }else{
      var sessionData = Session.get('endingNoteList templateData').data;
    }
    lifeMapSortFunc(sessionData, srchCondition, srchText, sortBy);
  });

  global.fn_selectPicker('.selectpicker.viewDetail', null);
});

Template.lifeContentSearchTmp.helpers({
  hpgetCount: function(){
    if(Session.get('endingNoteList templateData') && Session.get('endingNoteList templateData').data){
      return Session.get('endingNoteList templateData').data.length;
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
  var templateData = Session.get('endingNoteList templateData');
  if(schText==="" && templateData.originDataList){
    templateData.data = templateData.originDataList;
    Session.set('endingNoteList templateData',templateData);
    // return;
  }else if(schText===""){
    templateData.data = templateData.data;
    Session.set('endingNoteList templateData',templateData);
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
  var templateData = Session.get('endingNoteList templateData');
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
  Session.set('endingNoteList templateData',templateData);  //lifeviewimageMap

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
