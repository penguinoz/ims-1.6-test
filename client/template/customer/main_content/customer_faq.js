import {global} from '/imports/global/global_things.js';

// 마이페이지 > 댓글
var templateName = 'customerFaq';

Template[templateName].onCreated(function(){
  var instance = this;
  this.displayedId = "";
  instance.pageReact = new ReactiveVar();
  instance.pageReact.set(1);
  instance.faqReact = new ReactiveVar();
  Meteor.call('getFaqData',function(err,res){
    if(err){console.log(err);}
    if(res){
      instance.faqReact.set(res);
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
  global.fn_tableParse();

});

Template[templateName].helpers({
  hpGetFaqData: function(){
    var listData = Template.instance().faqReact.get();
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
  hpgetIndex:function(index){
    return index+1;
  },
  hpGetEmptyParam:function(param){
    if(param === undefined){
      return false;
    }else{
      if(param.length === 0){
        return false;
      }else{
        return true;
      }
    }
  },
  hpGetPrePath:function(filePath){
    return +global.s3.bucketPath+filePath;
  },
  hpGetPageIndex:function(){
    return Template.instance().pageReact.get();
  },
  hpGetLength:function(arr){
    if(Template.instance().faqReact.get()){
      return Template.instance().faqReact.get().length;
    }else{
      return 0;
    }
  },
  hpGetContext: function () {
    var queText = "";
    if(this.question){
      queText = this.question;
    }
    return {
      key: global.editorSettings.key,
      _value: queText,
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
  hpGetAnswerContext: function () {
    var ansText = "";
    if(this.answer){
      ansText = this.answer;
    }
    return {
      key: global.editorSettings.key,
      _value: ansText,
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
  "click #faqRow": function(e, t){
    if(t.displayedId){
      $("#faqDetail"+t.displayedId).css("display","none");
    }
    t.displayedId = this._id;
    $("#faqDetail"+this._id).css("display","block");
  },
  "click button[name='searchBtReceive']":function(e, t){
    var type = $("#keywordTypeSend").val();
    var serchtext = $("#keywordTextSend").val();
    Meteor.call('getSerchOpFaq',type, serchtext ,function(err, res){
      if(err){console.log(err);}
      if(res){
        t.faqReact.set(res);
      }
    });
  },
  "click #pageBt":function(e, t){
    t.pageReact.set( this.index);
  },
  "click #editFaqCon":function(e, t){
    e.preventDefault();
    var templateData = {};
    templateData.contentTmp = 'customerWriteFaq';
    templateData.data = this;
    Session.set('customerMain templateData', templateData);
  },
  "click #deleteFaqCon":function(e, t){
    e.preventDefault();
    dleDataobj =this;
    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
        if(global.fn_isExist(dleDataobj.images)){
          global.fn_DeleteS3Images(dleDataobj.images);
        }
        var userId = global.login.userId;
        Meteor.call('deleteFaq', dleDataobj._id, userId, function(error) {
          if (error) {
            return console.log(error);
          }else{
            var templateData = {};
            Session.set('customerMain templateData', null);
            setTimeout(function(){
              templateData.contentTmp = 'customerFaq';
              Session.set('customerMain templateData', templateData);
            }, 100);

          }
        });
      }
      dleDataobj = undefined;
    }).catch(swal.noop);
  }


});
