import {global} from '/imports/global/global_things.js';
// 마이페이지 > 댓글
var templateName = 'customerNotice';

Template[templateName].onCreated(function(){
  this.noticeReact = new ReactiveVar();
  this.pageReact = new ReactiveVar();
  this.pageReact.set(1);
  this.selectPage = new ReactiveVar();
  var instance = this;
  Meteor.call('getNoticeData',function(err,res){
    if(err){console.log(err); }
    if(res){
      instance.noticeReact.set(res);
    }
  });
});

Template[templateName].onRendered(function(){
  var targetElement = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElement, "dark", scrollCallbackOptions);
  global.fn_selectPicker('.selectpicker', null);
});

Template[templateName].helpers({
  hpGetNoticeData: function(){
    var listData = Template.instance().noticeReact.get();
    if(!listData){
      return 0;
    }
    var returnList = [];
    var pageDatas = [];
    for(var i=0 ; i<listData.length; i++){
      listData[i].rowIndex = i+1;
      pageDatas.push(listData[i]);
      if((i+1)%10 === 0 || i === listData.length-1){
        var indexNum = parseInt(i/10)+1;
        returnList.push({index:indexNum,data:pageDatas});
        pageDatas = [];
      }
    }
    return returnList;
  },
  hpGetIndex: function(index){
    return index+1;
  },
  hpGetPrePath:function(filePath){
    return +global.s3.bucketPath+filePath;
  },
  hpGetPageIndex:function(){
    return Template.instance().pageReact.get();
  },
  hpGetLength:function(){
    if(Template.instance().noticeReact.get()){
      return Template.instance().noticeReact.get().length;
    }else{
      return 0;
    }
  },
  hpGetContext: function () {
    return {
      key: global.editorSettings.key,
      //_value: this.question,
      toolbarInline: true,
      // imageResize: false,
      // imageUploadToS3: global.editorSettings.imageUploadToS3,
      placeholderText: null,
      // initOnClick: false,
      charCounterCount: false,
      pluginsEnabled: ['image','codeView','fontSize','link','url'],
      // dragInline: false,
      // imageMove: false,
      "_oninitialized": function(e, editior){
        Template.instance().$('div.froala-reactive-meteorized').froalaEditor('edit.off');
      }
    };
  },

});



Template[templateName].events({
  "click #noticetr": function(e, t){
    $("#noticDetail").removeClass("hidden");
    $("#noticeTitle").html(this.title);
    var date = global.utilGetDate(this.regDate).kor;
    $("#noticeRegDate").html(date);
    $('div.froala-reactive-meteorized').froalaEditor('html.set',this.content);
    var selectedDataObj = {
      _id : this._id,
      title : this.title,
      content : this.content,
      regData : this.regDate,
      userId : this.userId,
      images : this.images
    };
    t.selectPage.set(selectedDataObj);
  },
  "click button[name='searchBtReceive']":function(e, t){
    var type = $("#keywordTypeSend").val();
    var serchtext = $("#keywordTextSend").val();
    Meteor.call('getSerchOpNotice',type, serchtext ,function(err, res){
      if(err){console.log(err);}
      if(res){
        t.noticeReact.set(res);
      }
    });
  },
  "click #pageBt":function(e, t){
    t.pageReact.set( this.index);
  },
  "click #editNotice":function(e, t){
    var templateData = {};
    templateData.contentTmp = 'customerWriteNotice';
    templateData.data = t.selectPage.get();
    Session.set('customerMain templateData', templateData);
  },
  //삭제
  "click #deleteNotice":function(e, t){
    e.preventDefault();
    dleDataobj =t.selectPage.get();
    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
        if(global.fn_isExist(dleDataobj.images)){
          global.fn_DeleteS3Images(dleDataobj.images);
        }
        var userId = global.login.userId;
        Meteor.call('deleteNotice', dleDataobj._id, userId, function(error) {
          if (error) {
            return console.log(error);
          }else{
            var templateData = {};
            Session.set('customerMain templateData', null);
            setTimeout(function(){
              templateData.contentTmp = 'customerNotice';
              Session.set('customerMain templateData', templateData);
            }, 100);

          }
        });
      }
      dleDataobj = undefined;
    }).catch(swal.noop);
  }

});
