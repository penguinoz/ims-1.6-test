import {global} from '/imports/global/global_things.js';

// 마이페이지 > 댓글
var templateName = 'customerQna';

Template[templateName].onCreated(function(){
  var instance = this;
  this.displayedId = "";
  instance.pageReact = new ReactiveVar();
  instance.pageReact.set(1);
  instance.QnaReact = new ReactiveVar();
  instance.fileList = new ReactiveVar();
  Meteor.call('getQnaData',global.login.userId,function(err,res){
    if(err){console.log(err);}
    if(res){
      instance.QnaReact.set(res);
    }
  });
  instance.editer = new ReactiveVar(false);
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

  if(this.data && this.data.selectedId){
    this.displayedId = this.data.selectedId;
  }

});

Template[templateName].helpers({
  hpGetQnaData: function(){
    var listData = Template.instance().QnaReact.get();
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
  hpisSeleted:function(){
    return this._id === Template.instance().displayedId;
  },
  hpGetFileName:function(path){
    var fileName = path.split("custImg-Path");
    return fileName[1];
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
    var str = global.s3.bucketPath.substr(0,global.s3.bucketPath.length-1);
    return str+"/"+filePath;
  },
  hpGetPageIndex:function(){
    return Template.instance().pageReact.get();
  },
  hpGetLength:function(){
    if(Template.instance().QnaReact.get()){
      return Template.instance().QnaReact.get().length;
    }else{
      return 0;
    }
  },
  //답변대기상태 helper
  hpIsUndefined:function(pathParam){
    if(pathParam){
      //undefined
      return "답변완료";
    }else{
      return "답변대기";
    }
  },
  hpEditer: function() {
    return Template.instance().editer.get();
  },
  hpFileList: function(){
    // return instance.fileList.get();
    return ['customer_desk/27c16fc2-d0ce-4c52-8ed0-218d541b422ecustImg-Path200937431.jpg'];
  },
  hpGetContext: function () {

    var valueText = "";
    if(this.question){
      valueText = this.question;
    }

    return {
      key: global.editorSettings.key,
      _value: valueText,
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
    var valueText = "";
    if(this.answer){
      valueText = this.answer;
    }
    return {
      key: global.editorSettings.key,
      _value: valueText ,
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
    if (t.editer.get()) {
      t.editer.set(false);
    }
  },
  "click button[name='searchBtReceive']":function(e, t){
    var type = $("#keywordTypeSend").val();
    var serchtext = $("#keywordTextSend").val();
    Meteor.call('getSerchOpQna',type, serchtext ,function(err, res){
      if(err){console.log(err);}
      if(res){
        t.QnaReact.set(res);
      }
    });
  },
  "click #pageBt":function(e, t){
    t.pageReact.set( this.index);
  },
  "click #filedropdown":function(e, t){
    if($(e.currentTarget).find("#atatchfileDiv").hasClass("showDropdown")){
      $(e.currentTarget).find("#atatchfileDiv").removeClass("showDropdown");
    }else{
      $(e.currentTarget).find("#atatchfileDiv").addClass("showDropdown");
    }
  },
  //문의하기
  "click #qnaWritebt":function(e,t){

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg bucket';
    modalobj.fade = true;
    modalobj.backdrop = 'static';

    global.utilModalOpen(e, modalobj);


    // var templateData = {};
    // templateData.contentTmp = 'customerWrite';
    // Session.set('customerMain templateData', templateData);
  },
  //답변달기
  "click #writeQnaAnswer":function(e,t){

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg bucket';
    modalobj.fade = true;
    modalobj.backdrop = 'static';
    modalobj.data = this;

    global.utilModalOpen(e, modalobj);
  },
  //답변수정
  "click #editQnaAnswer":function(e,t){

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg bucket';
    modalobj.fade = true;
    modalobj.backdrop = 'static';
    modalobj.data = this;

    global.utilModalOpen(e, modalobj);
  },
  // 질문 수정
  "click #updateQna": function(e, t) {

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg bucket';
    modalobj.fade = true;
    modalobj.backdrop = 'static';
    modalobj.data = this;

    global.utilModalOpen(e, modalobj);


    // e.preventDefault();
    // var templateData = {};
    // templateData.contentTmp = 'customerWrite';
    // templateData.data = this;
    // Session.set('customerMain templateData', templateData);

    // t.editer.set(true);
  },
  // 질문 삭제
  "click #deleteQna": function(e, t) {
    e.preventDefault();
    dleDataId = this;
    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
        if(global.fn_isExist(dleDataId.images)){
          global.fn_DeleteS3Images(dleDataId.images);
        }
        var userId = global.login.userId;
        Meteor.call('deleteQna', dleDataId._id, userId, function(error) {
          if (error) {
            return console.log(error);
          }else{
            var templateData = {};
            Session.set('customerMain templateData', null);
            setTimeout(function(){
              templateData.contentTmp = 'customerQna';
              Session.set('customerMain templateData', templateData);
            }, 100);

          }
        });
      }
      dleDataId = undefined;
    }).catch(swal.noop);

  },
  // 질문 수정
  "click #confirmQna": function(e, t) {
    e.preventDefault();
  },
  // 질문 수정 취소
  "click #cancelQna": function(e, t) {
    e.preventDefault();

    t.editer.set(false);
  },
  //첨부파일 다운로드
  "click #atchedFileAtage" : function(e, t){
    var url = e.target.getAttribute("value");
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        var link = document.createElement("a");
        link.download = "etst";
        link.href = reader.result;
        link.click();
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }


});
