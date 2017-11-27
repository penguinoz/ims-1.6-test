import {global} from '/imports/global/global_things.js';

// 타임캡슐 작성/수정
var templateName = 'timeCapsuleWriting';
var friendsListParam = [];
var friendsprivateParam = [];
var nonUserprivateList;
var nonUserFriendsList;
var underbarId = "";
var insertReqId = "";
var map;
var markers;
var deletedMSG = [];
var receiveMb;
var dynamicTemplateData;
var userId = null;
var imageDataArray = [];
var imgOriginRe = {};
var imgMessage = {};
var orientation = 1;

Template[templateName].onCreated(function(){
  imageDataArray = [];
  imgOriginRe = {};
  imgMessage = {};
  orientation = 1;

  markers = [];
  dynamicTemplateData = {};
  friendsListParam = [];
  nonUserFriendsList = [];
  friendsprivateParam = [];
  nonUserprivateList = [];
  deletedMSG = [];
  underbarId = "";
  insertReqId = "";
  receiveMb = {};
  groupMember = [];


  this.getMessUsers = [];
  var inst = this;
  inst.groupMember = new ReactiveVar();
  inst.messages = new ReactiveVar();

  if(this.data && this.data._id){
    Meteor.call('getMessageUsers',this.data._id,function(err,res){
      if(err){console.log(err);}
      if(res){
        inst.getMessUsers = res.map(function(item){
          return item.userId;
        });
      }
    });
    Meteor.call('getTimeCapsuleById', this.data._id, function(error, res) {
      if (error) {
        return console.log(error);
      } else {
        inst.groupMember = res.groupMember.map(function(item) {
          return item.userId;
        });
      }
    });
  }
  userId = global.login.userId;
  // Session.set("timeCapsule message",null);
  Session.set('capsuleMessageTemp imageDataArray', null);
  Session.set('timeCapsuleWrite loadedData', null);


  // var getMsgList = Session.get("timeCapsule message")||[];
  var getMsgList = [];
  getMsgList.push({
    _id : null,
    content:"",
    backgroundImage:"",
    backgroundImagePath:"",
    userId:global.login.userId,
  });
  inst.messages.set(getMsgList);
  // Session.set("timeCapsule message", getMsgList);
});

Template[templateName].onRendered(function(){
  // //jquery 스크롤 적용
  // var scrollCallbackOptions = {
  //   whileScrolling: function() {
  //     //return showMoreVisibleImContent(this);
  //   }
  // };
  // global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark", scrollCallbackOptions);

  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    whileScrolling: function() {
      //return showMoreVisibleImContent(this);
    },
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

  var mapOptions = {
    zoom: global.mapDefault.zoom,
    center: {
      lat : global.mapDefault.lat,
      lng : global.mapDefault.lng
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var geocoder = new google.maps.Geocoder();
  var infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  if(this.data){
    underbarId = this.data._id;
    dynamicTemplateData = this.data;
  } else {
    dynamicTemplateData = {
      selectedMenu : 'my',
      statusMenu : 'process',
      contentTmp : 'timeCapsuleContentProcess'
      // searchOption : dynamicTemplateData.searchOption,
    };
  }
  if(underbarId){
    editCapsuleSeting();
    editCapsuleMessageSeting();
  } else {
    // $("#groupName").attr("hidden", true);
  }
});
//end render

Template.capsuleMessageTemp.onRendered(function(){
  $('.imgSlider').slick({
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    variableWidth: true,
    draggable: false,
    focusOnSelect: false
  });

});

Template[templateName].helpers({
  hpMessageList: function(){
    return Template.instance().messages.get();
    //return Session.get('timeCapsule message');
  },
  hpAddUsersCallBack: function(nonParma,noneParam,userList){
    var callbackFriends = [];

    for(var i=0; i<userList.users.length ; i++){
      callbackFriends.push(userList.users[i].userId);
    }

    for(var j=0; j<userList.preSelecter.length ; j++){
      callbackFriends.push(userList.preSelecter[j]);
    }

    var nonUserList = userList.nonUsers.map(function(item){
      var reObj = {};
      reObj.nonUserName = item.name;
      reObj.nonUserEmail = item.eMail;
      // reObj.emailCode = global.utilAES(Meteor.uuid(), 'encrypt');
      // reObj.emailCode = 'tc'+Meteor.uuid();
      return reObj;
    });

    buildNickName(callbackFriends,nonUserList);

    //nonUserFriendsList
    //nonUserprivateList
  },
  //비회원 수정시
  hpEditUsersCallBack:function(nonUserEditedList){

    nonUserprivateList = nonUserEditedList;
    buildNickName(friendsprivateParam,[]);
  },

  hpGoogleMapCallBack: function(callbackData){
    $("#landPlace").val(callbackData.address);
    $("#lat").val(callbackData.lat);
    $("#lng").val(callbackData.lng);
    var latLng = new google.maps.LatLng(callbackData.lat,callbackData.lng);
    setMarker(latLng);
    // $("#capsuleImageViewer").attr("hidden", true);
    // $("#mapViewDiv").attr("hidden", false);
  },
  hpgetUserId : function(){
    return global.login.userId;
  }

});

Template[templateName].events({
  "click #btnOpenContainer": function(e, t){
    e.preventDefault();
    var slideTarget = $('.input-container');
    slideTarget.slideToggle( "fast", function() {
      if(slideTarget.hasClass("on")){
        slideTarget.removeClass("on");
        t.$(e.target).html("<span class='glyphicon glyphicon-chevron-top'></span>접기");
        t.$(e.target).parents('.detail-foot').css('border-top', '1px solid #f1e6cc');
      }else{
        slideTarget.addClass("on");
        t.$(e.target).html("<span class='glyphicon glyphicon-chevron-bottom'></span>펼치기");
        t.$(e.target).parents('.detail-foot').css('border-top', '0px');
      }
    });
  },

  "change input[name='capsuleGroupRadio']": function(){
    var selectedType = $("input[name=capsuleGroupRadio]:checked").val();
    if(selectedType === "group"){
      $("#groupRespon").attr("hidden", false);
      // $("#groupName").attr("hidden", false);
      $("#soloRespon").attr("hidden", true);
    } else {
      $("#groupRespon").attr("hidden", true);
      // $("#groupName").attr("hidden", true);
      $("#soloRespon").attr("hidden", false);
    }
  },
  //다음버튼 클릭
  "click #next": function(e, t){

    var titleText = t.find('input[id="timeCapTitle"]').value;
    var openDate = $('#openDate').val();
    var buryConText = t.find('input[id="buryPlace"]').value;

    if(!titleText){
      global.utilAlert('타임캡슐명을 작성해 주세요');
      return;
    }

    var authorType = $("input[name=capsuleGroupRadio]:checked").val();
    // var groupName = "";
    var receivers = [];
    var pushObj = {};
    if(authorType === 'group'){
      // groupName = t.find('input[id="groupName"]').value;
      for(var i=0; i<friendsListParam.length ; i++){
        var param = {};
        param.userId = friendsListParam[i];
        receivers.push(param);
      }
      if(!_.findWhere(receivers,{userId:global.login.userId})){
        pushObj = {userId : global.login.userId};
        receivers.push(pushObj);
      }
      nonUserReciver = nonUserFriendsList;
      if(receivers.length <= 1 && !nonUserReciver.length){
        global.utilAlert('참여자를 선택해 주세요');
        return;
      }
    } else {
      for(var r=0; r<friendsprivateParam.length ; r++){
        var secParam = {};
        secParam.userId = friendsprivateParam[r];
        receivers.push(secParam);
      }
      if(!_.findWhere(receivers,{userId:global.login.userId})){
        pushObj = {userId : global.login.userId};
        receivers.push(pushObj);
      }
      nonUserReciver = nonUserprivateList;
      if(!$("#forMe").is(":checked")){
        if(receivers.length <= 1 && !nonUserReciver.length ){
          global.utilAlert('수신자를 선택해 주세요');
          return;
        }

      }
    }


    if(!buryConText){
      global.utilAlert('매립위치를 작성해 주세요');
      return;
    }
    if(!openDate){
      global.utilAlert('개봉일을 선택해 주세요');
      return;
    }

    $("#stepOne").addClass("hidden");
    $("#stepTwo").removeClass("hidden");
    var slideTarget = $('.input-container');
    $("#pageOnOff").removeClass("hidden");
    $("#writeMessageArea").removeClass("hidden");
    slideTarget.slideToggle( "fast", function() {
      slideTarget.addClass("on");
      $('#btnOpenContainer').html("<span class='glyphicon glyphicon-chevron-top'></span>펼치기");
      $('#btnOpenContainer').parents('.detail-foot').css('border-top', '0px');
    });
  },
  //나에게
  "click #forMe": function(){
    if($("#forMe").is(":checked")){
      $("#forMeFriendList").addClass("hidden");
      // $("#tagFrForMeUlList").addClass("hidden");
    }else{
      $("#forMeFriendList").removeClass("hidden");
      // $("#tagFrForMeUlList").removeClass("hidden");
    }
  },
  //메세지 추가
  "click #addRow": function(e, t){
    var getMsgList = messageSetSession()||[];
    getMsgList.unshift({
      _id : null,
      content:"",
      backgroundImage:"",
      backgroundImagePath:"",
      userId:global.login.userId
    });
    t.messages.set(null);

    var template = t;
    setTimeout(function(){
      template.messages.set(getMsgList);
    }, 100);

  },
  //체크리스트 삭제
  "click #delChecked": function(e, t){
    var msgDataList = messageSetSession();
    imageDataArray = Session.get('capsuleMessageTemp imageDataArray');
    for(var i=msgDataList.length-1; i>=0 ; i--){
      if($("#delCheck"+i).is(":checked")){
        if(global.fn_isExist(msgDataList[i]._id)){
          deletedMSG.push(msgDataList[i]);
        }
        imageDataArray = _.reject(imageDataArray, function(imageInfo){
          return imageInfo.filePath === msgDataList[i].backgroundImagePath;
        });
        msgDataList.splice(i,1);
        $('#delCheck'+i).attr('checked',false);
      }
    }

    // Session.set("timeCapsule message",null);
    t.messages.set(null);
    // setTimeout(function(){
      // Session.set("timeCapsule message",msgDataList);
      t.messages.set(msgDataList);
    // }, 100);

  },
  "click #findFriend": function(e, t){
    e.preventDefault();
    var modalobj = {};
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-md timecapsule';
    modalobj.fade = false;    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '친구선택',
      parentViewId: Blaze.currentView.name,
    };
    if($("input[name=capsuleGroupRadio]:checked").val() === 'group'){
      modalobj.data.preSelectedUsers = friendsListParam;
      modalobj.data.type = 'group';
      // modalobj.data.unUserFriends = nonUserFriendsList;
    }else{
      modalobj.data.preSelectedUsers = friendsprivateParam;
      modalobj.data.type = 'private';
      modalobj.data.unUserFriends = nonUserprivateList;
    }
    global.utilModalOpen(e, modalobj);
  },
  "click #mapSearch,#landPlace": function(e, t){
    e.preventDefault();

    var addrValue = $('#landPlace').val();
    var latValue =  $('#lat').val();
    var lngValue =  $('#lng').val();
    var buryPlace = $('#buryPlace').val();

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg timecapsule';
    modalobj.fade = true;    modalobj.backdrop = 'static';
    modalobj.data = {
      title : buryPlace ? buryPlace : '매립위치',
      parentViewId: Blaze.currentView.name,
      location : {
        lat : parseFloat(latValue), //template.$(e.target).data('lat'),
        lng : parseFloat(lngValue) //template.$(e.target).data('lng')
      }
    };

    global.utilModalOpen(e, modalobj);
  },
  //사진첨부
  "change #capsuleImage": function(e, t){
    var imageObj = e.target.files[0];

    var reader = new FileReader();
    reader.readAsDataURL(imageObj);

    // var fName = imageObj.name.substring(0, imageObj.name.lastIndexOf('.'));
    var extension = imageObj.name.substring(imageObj.name.lastIndexOf('.')+1);

    $("[name=fileName]").val(imageObj.name);
    reader.onload = function  () {
      var tempImage = new Image();
      tempImage.src = reader.result;

      tempImage.onload = function () {
        targetImage = this;
        var width = targetImage.width;
        var height = targetImage.height;
        var orientation = 1;
        EXIF.getData(imageObj, function(e,r) {

          if(targetImage.width >= targetImage.height){
            if(targetImage.width > 1024){
              width = 1024;
              height = targetImage.height * (1024/targetImage.width);
            }
          } else {
            if(targetImage.height > 800){
              height = 800;
              width = targetImage.width * (800/targetImage.height);
            }
          }

          var canvas = document.createElement('canvas');
          var canvasContext = canvas.getContext("2d");

          orientation = EXIF.getTag(this, "Orientation");
          if ([5,6,7,8].indexOf(orientation) > -1) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          switch (orientation) {
                case 2: canvasContext.transform(-1, 0, 0, 1, width, 0); break;
                case 3: canvasContext.transform(-1, 0, 0, -1, width, height ); break;
                case 4: canvasContext.transform(1, 0, 0, -1, 0, height ); break;
                case 5: canvasContext.transform(0, 1, 1, 0, 0, 0); break;
                case 6: canvasContext.transform(0, 1, -1, 0, height , 0); break;
                case 7: canvasContext.transform(0, -1, -1, 0, height , width); break;
                case 8: canvasContext.transform(0, -1, 1, 0, 0, width); break;
                default: canvasContext.transform(1, 0, 0, 1, 0, 0);
          }

          canvasContext.drawImage(targetImage, 0, 0, width, height);
          var dataURI = canvas.toDataURL("image/jpeg");
          document.querySelector('#capsuleImageViewer').src = dataURI;
          // var newFileName = Meteor.uuid()  + '-' + fName;
          var newFileName = Meteor.uuid();
          var newFilePath = global.s3.bucketPath + global.s3.folder.timeCapsule + '/' + newFileName + '_originRe.' + extension;

          //위치정보 저장
          var latitued = EXIF.getTag(this, "GPSLatitude");
          var longitude = EXIF.getTag(this, "GPSLongitude");

          //원본파일 줄인것
          imgOriginRe = {
            filePath : newFilePath,
            fileName : newFileName,
            type : 'originRe',
            extension : extension,
            data : dataURI,
            lat : latitued ? global.toDecimal(latitued) : null,
            lng : longitude ? global.toDecimal(longitude) : null
          };

          // $("#capsuleImageViewer").attr("hidden", false);
          // $("#mapViewDiv").attr("hidden", true);
        });
      };
    };
  },
  "click #changeTapButton": function(){
    // $("#mapViewDiv").attr("hidden", !$("#mapViewDiv").attr("hidden"));
    // $("#capsuleImageViewer").attr("hidden",!$("#capsuleImageViewer").attr("hidden") );
  },
  // 저장버튼 클릭
  "click #save": function(e, t){
    e.preventDefault();

    var titleText = t.find('input[id="timeCapTitle"]').value;
    var authorType = $("input[name=capsuleGroupRadio]:checked").val();
    // var groupName = "";
    var receivers = [];

    if(authorType === 'group'){
      // groupName = t.find('input[id="groupName"]').value;
      for(var i=0; i<friendsListParam.length ; i++){
        var param = {};
        param.userId = friendsListParam[i];
        receivers.push(param);
      }
      if(!_.findWhere(receivers,{userId:global.login.userId})){
        var pushObj = {userId : global.login.userId};
        receivers.push(pushObj);
      }
      nonUserReciver = nonUserFriendsList;
      if(receivers.length <= 1 && !nonUserReciver.length){
        global.utilAlert('친구를 선택해 주세요');
        return;
      }
    } else {
      for(var r=0; r<friendsprivateParam.length ; r++){
        var secParam = {};
        secParam.userId = friendsprivateParam[r];
        receivers.push(secParam);
      }
      if(!_.findWhere(receivers,{userId:global.login.userId})){
        var pushObj = {userId : global.login.userId};
        receivers.push(pushObj);
      }
      nonUserReciver = nonUserprivateList;
      if(!$("#forMe").is(":checked")){
        if(receivers.length <= 1 && !nonUserReciver.length ){
          global.utilAlert('친구를 선택해 주세요');
          return;
        }
      }
    }

    var openDate = $('#openDate').val();
    var buryConText = t.find('input[id="buryPlace"]').value;
    var buryLat = t.find('input[id="lat"]').value;
    var buryLng = t.find('input[id="lng"]').value;
    var landPlace = t.find('input[id="landPlace"]').value;
    var capMessage = messageSetSession();

    if(!titleText){
      global.utilAlert('타임캡슐명을 작성해 주세요');
      return;
    }
    if(!buryConText){
      global.utilAlert('매립위치를 작성해 주세요');
      return;
    }
    if(!openDate){
      global.utilAlert('개봉일을 선택해 주세요');
      return;
    }


    //메시지 등록할 데이터 정의(내용없으면 등록X);
    for(var k=0; k<capMessage.length; k++){
      capMessage[k].content = $("#messgeContent"+k).val().replace(/\n/g, "<br>");
      if(capMessage[k].content){
        capMessage[k].backgroundImage = capMessage[k].backgroundImagePath;
      }else{
        if(capMessage[k].backgroundImagePath){
          imageDataArray = _.reject(imageDataArray, function(imageInfo){
            return imageInfo.filePath === capMessage[k].backgroundImagePath;
          });
        }
        capMessage.splice(k,1);
      }
    }

    //캡슐 메인 이미지 s3등록
    var capsuleimg = {};
    if(global.fn_isExist(imgOriginRe)){
      capsuleimg.path = imgOriginRe.filePath;
      capsuleimg.lat = imgOriginRe.lat;
      capsuleimg.lng = imgOriginRe.lng;

      global.fn_upLoadeS3Image(imgOriginRe, global.s3.folder.timeCapsule);
    }

    //캡슐 메시지 배경이미지 등록
    if(global.fn_isExist(imageDataArray)){
      global.fn_upLoadeS3Image(imageDataArray, global.s3.folder.timeCapsule);
    }

    var publiccon = "";
    var tagArray = [];
    var isPublicParam = false;
    var sessionData = {};
    if(Session.get('timeCapsuleWrite loadedData')){
      sessionData = Session.get('timeCapsuleWrite loadedData').isPublic;
    }

    if(dynamicTemplateData.isRelease || sessionData===true){
      isPublicParam = true;
      publiccon = $("#publicContent").val();
      $('#tagUlList').find('li').each(function(index){
        if($(this).text()!== ""){
          var splitTage = $( this ).text().replace('#','');
          tagArray.push(splitTage);
        }
      });
    }

    var saveWriteData = {
      userId : global.login.userId,
      title : titleText,
      // groupName : groupName,
      authorType : authorType,
      buryLocationName : buryConText,
      buryPlace : landPlace,
      buryLat : buryLat,
      buryLng : buryLng,
      unsealDate : openDate,
      updateDate : global.utilGetDate().defaultYMD,
      isPublic : isPublicParam,
      publicContent : publiccon,
      tagList : tagArray,
      lock : true,
      image : capsuleimg ? capsuleimg : '',
      isEverOpened : false
    };
    // if($("#forMe").is(":checked")===false){
    if ($("input[name=capsuleGroupRadio]:checked").val() === 'group') {
      saveWriteData.nonUserGroupMember = nonUserReciver;
      saveWriteData.groupMember = receivers;
    }else{
      saveWriteData.nonUserGroupMember = [];
      saveWriteData.groupMember = [{userId:global.login.userId}];
      if (!$('#forMe:checked').val()) {
        saveWriteData.nonUserGroupMember = nonUserReciver;
        saveWriteData.groupMember = receivers;
      }
    }


    if(!underbarId || dynamicTemplateData.isRelease){
      saveWriteData.status = "PR";
      saveWriteData.open = 0;
    }
    if(isPublicParam){
      saveWriteData.status = "PB";
    }
    // //공개 하면서 이미지 선택없음
    // if(!capsuleimg && dynamicTemplateData.isRelease){
    //   var imagePathParam = $("#capsuleImageViewer").attr("src");
    //   //imagePathParam = imagePathParam.replace(global.s3.bucketPath,"");
    //   imagePathParam = imagePathParam.replace(global.s3.bucketPath,"");
    //   saveWriteData.image  = imagePathParam;
    // }

    if(deletedMSG.length){
      for(var f = 0; f < deletedMSG.length; f++){
        Meteor.call('setLog', underbarId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.deleteMessage, 'deleteMessage');
        Meteor.call('deleteCapsuleMessage',deletedMSG[f]._id, function(error,result){
          if(error){
            return console.log(error);
          } else {
            if(result){
              if(!dynamicTemplateData.isRelease){
                var deleteArray = [];
                if(result.backgroundImage && result.backgroundImage.indexOf(global.s3.bucketPath) > -1){
                  deleteArray.push(result.backgroundImage);
                  global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                }
              }
            }
            var historyObj = {
              postId: underbarId,
              typeKey: deletedMSG[f]._id
            };
            // 메시지 히스토리 삭제
            global.utilHistoryDelete(historyObj);
          }
        });
      }
    }
    var capuselKey = underbarId;
    if(dynamicTemplateData.isRelease){
      capuselKey = "";
    }

    Meteor.call('upsertTimeCapsule',capuselKey, saveWriteData, function(err, result){
      if(err){ console.log(err); }
      if(result){
        var timecapsulPostId = result.res.insertedId;
        insertReqId = result.res.insertedId;
        if(result.oldImg && result.oldImg.image && result.oldImg.image.path){
          var deleteArray = [];
          deleteArray.push(result.oldImg.image.path);
          global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
        }

        //최초생성일 경우 타임캡슐 생성 로그 등록
        if(!underbarId){
          Meteor.call('setLog', timecapsulPostId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.write, 'write');
        }
        if(!underbarId){
          templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
          templateData.contentTmp = 'timeCapsuleDetail';//dynamicTemplateData.parentViewId;
          templateData.data = {
            _id : timecapsulPostId,
            selectedMenu : dynamicTemplateData.selectedMenu,
            statusMenu : dynamicTemplateData.statusMenu,
            contentTmp : dynamicTemplateData.contentTmp,
            searchOption : dynamicTemplateData.searchOption,
          };

          setTimeout(function(){
            Session.set('endingNoteList templateData', templateData);
          }, 100);
        }

        for(var post in capMessage){
          if(!underbarId){
            capMessage[post].capsuleId = result.res.insertedId;
          }else{
            capMessage[post].capsuleId = underbarId;
          }
          var messageId = capMessage[post]._id;

          if(dynamicTemplateData.isRelease){
            capMessage[post].capsuleId = result.res.insertedId;
            messageId = "";
          }
          if(!messageId){
            Meteor.call('setLog', capMessage[post].capsuleId, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.writeMessage, 'writeMessage');
          }


          Meteor.call('upsertCapsuleMessage',messageId ,capMessage[post] ,function(err,res){
            if(err){
              return console.log(err);
            }
            if(res){
              if ('messageId' in res) {
                for (var g = 0; g < saveWriteData.groupMember.length; g++) {
                  var MessageObj = {
                    postId: timecapsulPostId,
                    typeKey: res.messageId,
                    userId: saveWriteData.groupMember[g].userId,
                    postType: 'TC',
                    type: 'MS',
                    user: global.login.userId,
                    timelineDate: global.utilGetDate().defaultYMD,
                    regDate: global.utilGetDate().default,
                    updateDate: global.utilGetDate().default
                  };
                  // 메시지등록 히스토리 추가
                  global.utilHistoryInsert(MessageObj);
                }
              }

              if ('backgroundImage' in res && 'backgroundImage' in res) {
                for(var i=0; i<capMessage.length; i++){
                  if(res._id === capMessage[i]._id && res.backgroundImage !== capMessage[i].backgroundImage && res.backgroundImage !== ""){
                    if(!dynamicTemplateData.isRelease){
                      var deleteArray = [];
                      deleteArray.push(res.backgroundImage);
                      global.fn_DeleteS3ImagesByType(deleteArray, global.s3.folder.timeCapsule);
                    }
                  }
                }
              }
            }
          });
        }


        var modifyMember = receivers.map(function(item) {
          return item.userId;
        });
        var addMember = _.difference(modifyMember, t.groupMember); // 새로 추가된 그룹원
        // 신규 등록
        if (!underbarId) {
          if (authorType === 'group') {
            for (var i = 0; i < saveWriteData.groupMember.length; i++) {
              // 타임라인 등록 및 히스토리 등록
              // global.utilTimelineRegister(timecapsulPostId, saveWriteData.groupMember[i].userId, 'TC', '', '');
              if (global.login.userId !== saveWriteData.groupMember[i].userId) {
                var options ={
                  title: saveWriteData.title,
                  userId: global.login.userId
                }
                Meteor.call('setNoti', saveWriteData.groupMember[i].userId, 'TC', timecapsulPostId, 'write', options);
              }
            }
          } else {
            // global.utilTimelineRegister(timecapsulPostId, userId, 'TC', '', '');
          }
        } else {
          // 수정
          // if (addMember.length !== 0 && authorType === 'group') {
          //   for (var m = 0; m < addMember.length; m++) {
          //     global.utilTimelineRegister(underbarId, addMember[m], 'TC', '', '');
          //   }
          // }
        }
       }
    });
    var removeGropMember = [];
    if (authorType === 'group') {
      removeGropMember = _.difference(t.groupMember, friendsListParam); // 삭제된 그룹원
    } else {
      removeGropMember = _.without(t.groupMember, global.login.userId); // 삭제된 그룹원(그룹에서 -> 나에게 수정할때는 생성자 빼고 다 삭제함)
    }
    if (removeGropMember.length !== 0) {
      // 제외된 그룹원 타임라인, 히스토리 삭제
      removeGropMember.map(function(item) {
        Meteor.call('enTimelineDalete', underbarId, item);
      });
    }
    var templateData = {};
    //상세에서 수정일 경우
    if(underbarId){
      templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      templateData.contentTmp = 'timeCapsuleDetail';//dynamicTemplateData.parentViewId;
      templateData.data = {
        _id : underbarId,
        selectedMenu : dynamicTemplateData.selectedMenu,
        statusMenu : dynamicTemplateData.statusMenu,
        contentTmp : dynamicTemplateData.contentTmp,
        searchOption : dynamicTemplateData.searchOption,
      };
      setTimeout(function(){
        Session.set('endingNoteList templateData', templateData);
      }, 100);

    }
    Session.set('endingNoteListHeaderTimeCapsule selectedMenu', null);
  },
  "click #cancel": function(){
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
    templateData.contentTmp = 'timeCapsuleContent';
    Session.set('endingNoteList templateData', templateData);
    Session.set('endingNoteListHeaderTimeCapsule selectedMenu', null);
  },
  //추가된 그룹유저 삭제
  "click .btn-tagDelete": function(e, t){
    if(t.getMessUsers.indexOf(e.target.name) !== -1){
      global.utilAlert('메세지 작성자는 삭제할 수 없습니다.');
      return;
    }
    if(e.target.id === 'frListTag'){
      if(friendsListParam.indexOf(e.target.name) !== -1){
        friendsListParam.splice(friendsListParam.indexOf(e.target.name),1);
      }else{
        nonUserFriendsList.map(function(item,i){
          if(item.nonUserEmail === e.target.name){
            nonUserFriendsList.splice(i,1);
          }
        });
      }
    }
    if(e.target.id === 'frMeListTag'){
      if(friendsprivateParam.indexOf(e.target.name) !== -1){
        friendsprivateParam.splice(friendsprivateParam.indexOf(e.target.name),1);
      }else{
        nonUserprivateList.map(function(item,i){
          if(item.nonUserEmail === e.target.name){
            nonUserprivateList.splice(i,1);
          }
        });
      }
    }
    $(e.target.parentElement).remove();
  },
  "click .addFriend" : function(e, t){
    e.preventDefault();
    var modalobj = {};
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-md timecapsule';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '직접 입력한 수신인 정보 수정',
      parentViewId: Blaze.currentView.name,
      _id : this._id,
    };
    if($("input[name=capsuleGroupRadio]:checked").val() === 'group'){
      modalobj.data.preSelectedUsers = friendsListParam;
      modalobj.data.type = 'group';
      // modalobj.data.unUserFriends = nonUserFriendsList;
    }else{
      modalobj.data.preSelectedUsers = friendsprivateParam;
      modalobj.data.type = 'private';
      modalobj.data.nonUsersInfo = nonUserprivateList;
    }
    global.utilModalOpen(e, modalobj);
  }
});


Template[templateName].onDestroyed(function(){
  Session.set('capsuleMessageTemp imageDataArray', null);
  // Session.set("timeCapsule message", null);
});

function setMarker(latLng){
  var iconOption = {
    url: global.timeCapsuleEggImg.default, // url
    size: new google.maps.Size(40, 49),
    scaledSize: new google.maps.Size(40, 49), // scaled size
    origin: new google.maps.Point(0,0), // origin
    labelOrigin: new google.maps.Point(20,27), //(left, top)
    anchor: new google.maps.Point(21, 49) // anchor
  };
  var marker = new google.maps.Marker({
    position: latLng,
    map: map,
    icon: iconOption,
    label: {
      text: "TIME",
      fontSize : '12px',
      fontWeight : 'bolder',
      fontFamily: 'Roboto, Arial, sans-serif'
    },
  });
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  markers.push(marker);
}

//타임캡슐 메시지 탬플릿 구분 ======================================================================

Template.capsuleMessageTemp.onCreated(function(){

});

Template.capsuleMessageTemp.onRendered(function(){
  $('.imgSlider').slick({
    infinite: false,
    slidesToShow: 5,
    slidesToScroll: 1,
    variableWidth: true,
    draggable: false
  });
});


Template.capsuleMessageTemp.helpers({
  // hpMessages: function(){
  //   return Template.instance().messages.get();
  // },
  hpBackgroundPath: function(imagePath){
    if(imagePath){
      imagePath.substring(imagePath.indexOf(".//."));
      if(imagePath.indexOf("time_capsule_images/") === 0){
        imagePath = "url('" + global.s3.bucketPath + imagePath+"')";
      } else {
        imagePath = "url("+imagePath+")";
      }
      return imagePath;
    }else{
      return "url('/images/bg/time_capsule_message/letter_02.jpg')";
    }
  },
  checkTF: function(flag){
    return flag === true;
  },
  hpSetContent: function(message){
    result = message ? message.replace(/<br>/gi, "\r\n") : null;
    return result;
  }
});


Template.capsuleMessageTemp.events({
  "click .image": function(e, t) {
    // t.$("#upimageFlag").attr('value', 'false');
  	$(e.target).parent().siblings().removeClass('active');
  	$(e.target).parent().addClass('active');
    var agent = navigator.userAgent.toLowerCase();
    if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
      t.$("#messageContentBg"+this.index).css("background-image","url('"+e.target.children[0].childNodes[0].value+"')");
      t.$('#messageContentBg'+this.index).attr('value', e.target.children[0].childNodes[0].value);
    }else{
      t.$("#messageContentBg"+this.index).css("background-image","url('"+$(e.target.childNodes[0]).attr('value')+"')");
      t.$('#messageContentBg'+this.index).attr('value', $(e.target.childNodes[0]).attr('value'));
    }
  },
  "change .txtImageFile": function(e, t){
    var imageObj = e.target.files[0];
    var selectedIndex = this.index;

    var reader = new FileReader();
    reader.readAsDataURL(imageObj);
    // var fName = imageObj.name.substring(0, imageObj.name.lastIndexOf('.'));
    var extension = imageObj.name.substring(imageObj.name.lastIndexOf('.')+1);

    reader.onload = function  () {
      var tempImage = new Image();
      tempImage.src = reader.result;
      tempImage.onload = function () {
        var targetImage = this;
        EXIF.getData(imageObj, function(e,r) {
          var width = targetImage.width;
          var height = targetImage.height;

          //이미지 사이즈 조정
          if(targetImage.width >= targetImage.height){
            if(targetImage.width > 1024){
              width = 1024;
              height = targetImage.height * (1024/targetImage.width);
            }
          } else {
            if(targetImage.height > 800){
              height = 800;
              width = targetImage.width * (800/targetImage.height);
            }
          }

          //보기용 canvas생성 (thumbnail용)
          var canvas = document.createElement('canvas');
          var canvasContext = canvas.getContext("2d");

          orientation = EXIF.getTag(this, "Orientation");
          if ([5,6,7,8].indexOf(orientation) > -1) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          switch (orientation) {
            case 2: canvasContext.transform(-1, 0, 0, 1, width, 0); break;
            case 3: canvasContext.transform(-1, 0, 0, -1, width, height ); break;
            case 4: canvasContext.transform(1, 0, 0, -1, 0, height ); break;
            case 5: canvasContext.transform(0, 1, 1, 0, 0, 0); break;
            case 6: canvasContext.transform(0, 1, -1, 0, height , 0); break;
            case 7: canvasContext.transform(0, -1, -1, 0, height , width); break;
            case 8: canvasContext.transform(0, -1, 1, 0, 0, width); break;
            default: canvasContext.transform(1, 0, 0, 1, 0, 0);
          }

          canvasContext.drawImage(targetImage, 0, 0, width, height);
          var dataURI = canvas.toDataURL("image/jpeg");

          // var newFileName =  Meteor.uuid()  + '-' + fName;
          var newFileName =  Meteor.uuid();
          //썸네일 이미지 보여주기
          t.$("#messageContentBg" + selectedIndex).css("background-image","url('"+dataURI+"')");

          //실제 파일명 저장
          var newFilePath = global.s3.bucketPath + global.s3.folder.timeCapsule + '/' + newFileName + '_originRe.' + extension;
          t.$('#messageContentBg' + selectedIndex).attr('value', newFilePath);
          // t.$("#messgeContent"+selectedIndex).val(newFilePath);

          //원본파일 줄인것
          imgMessage = {
            filePath : newFilePath,
            fileName : newFileName,
            type : 'originRe',
            extension : extension,
            data : dataURI
          };

          imageDataArray.push(imgMessage);
          Session.set('capsuleMessageTemp imageDataArray', imageDataArray);
        });
      };
    };
  },
});

function editCapsuleSeting(){
  Meteor.call('getTimeCapsuleById', underbarId, function(err, resval){
    if(err){ console.log(err); }
    if(resval){
      Session.set('timeCapsuleWrite loadedData',resval);
      $("#timeCapTitle").val(resval.title);
      $('input:radio[name="capsuleGroupRadio"]:input[value='+resval.authorType+']').attr("checked", true);
      if(resval.authorType === 'private'){
        if(resval.groupMember.length === 1 && resval.nonUserGroupMember.length === 0){  //그룹원이 없으면
          $("#forMe").attr("checked", true);
          $("#forMeFriendList").addClass("hidden");
        }
        // $("#groupName").attr("hidden", true);
      }else{
        $("#groupRespon").attr("hidden", false);
        $("#soloRespon").attr("hidden", true);
        // $("#groupName").val(resval.groupName);
      }
      var userIdArr = [];
      for(var i=0; i<resval.groupMember.length ; i++){
        userIdArr.push(resval.groupMember[i].userId);
      }
      buildNickName(userIdArr,resval.nonUserGroupMember);

      $('#openDate').val(resval.unsealDate);
      $('#buryPlace').val(resval.buryLocationName);
      $('#lat').val(resval.buryLat);
      $('#lng').val(resval.buryLng);
      $('#landPlace').val(resval.buryPlace);
      var latLng = new google.maps.LatLng(resval.buryLat,resval.buryLng);
      setMarker(latLng);
      // $("#capsuleImageViewer").attr("src",global.s3.bucketPath+resval.image);
      $("#capsuleImageViewer").attr("src",resval.image.path);
      if(dynamicTemplateData.isRelease || resval.isPublic){
        $("#publicEditer").attr('hidden',false);
      }
    }
  });
  $("#stepOne").addClass("hidden");
  $("#stepTwo").removeClass("hidden");
  var slideTarget = $('.input-container');
  $("#pageOnOff").removeClass("hidden");
  $("#writeMessageArea").removeClass("hidden");
}

//수정 화면 내 message 조회
function editCapsuleMessageSeting(){
  var templateInstance = Template.instance();
  var userParam = global.login.userId;
  if(dynamicTemplateData.isRelease){
    userParam = " ";
  }
  Meteor.call('findForEditMessage',underbarId,userParam,function(err,result){
    if(err){console.log(err);}
    if(result){
      _.each(result, function(res){
        res.backgroundImagePath = res.backgroundImage ? res.backgroundImage : "";
      });

      templateInstance.messages.set(result);
    }
  });
}

function buildNickName(userIds,nonUsers){
  var searchOption = ['profile.nickName','username'];
  var usersImNotThere = userIds;
  if(userIds.indexOf(global.login.userId) !== -1){
    userIds.splice(userIds.indexOf(global.login.userId),1);
  }

  Meteor.call('getNickAndImg', userIds, function(error, result){
    if(error){
      console.log(error);
    } else {
      var userInfo = result;

      if(userIds.indexOf(global.login.userId) === -1){
        userIds.push(global.login.userId);
      }

      var selectedType = $("input[name=capsuleGroupRadio]:checked").val();

      if(selectedType === 'group'){ //그룹
        nonUserFriendsList = _.values(_.extend(_.indexBy(nonUsers, 'nonUserEmail'), _.indexBy(nonUserFriendsList, 'nonUserEmail')));
        friendsListParam = userIds;

        $("#tagFrUlList").find('li').remove();
        _.each(userInfo, function(friendInfo, idx){
          $("#tagFrUlList").append("<li><a class=\"defaultmouse\">"+friendInfo.nickName+"</a><a class=\"btn-tagDelete\"  name="+ friendInfo.userId+" id='frListTag'></a></li>");
        });

        _.each(nonUserFriendsList, function(nonUserFriendsInfo){
          $("#tagFrUlList").append("<li><a  class=\"addFriend\" data-modal-template=\"timeCapsuleEditNoneuserPopup\">"+nonUserFriendsInfo.nonUserName+"</a><a class=\"btn-tagDelete\" name="+ nonUserFriendsInfo.nonUserEmail+" id='frListTag'></a></li>");
        });

      } else { //개별
        nonUserprivateList = _.values(_.extend(_.indexBy(nonUsers, 'nonUserEmail'), _.indexBy(nonUserprivateList, 'nonUserEmail')));
        friendsprivateParam = userIds;

        $("#tagFrForMeUlList").find('li').remove();

        _.each(userInfo, function(friendInfo){
          $("#tagFrForMeUlList").append("<li><a class=\"defaultmouse\">"+friendInfo.nickName+"</a><a class=\"btn-tagDelete\"  name="+ friendInfo.userId+" id='frMeListTag'></a></li>");
        });

        _.each(nonUserprivateList, function(nonUserprivateInfo){
          $("#tagFrForMeUlList").append("<li><a class=\"addFriend\" data-modal-template=\"timeCapsuleEditNoneuserPopup\">"+nonUserprivateInfo.nonUserName+"</a><a class=\"btn-tagDelete\" name="+ nonUserprivateInfo.nonUserEmail+" id='frMeListTag'></a></li>");
        });
      }
    }
  });
}
// 메세지 session 싱크
function messageSetSession(){
  // var messages = Session.get("timeCapsule message");
  var messages = Template.instance().messages.get();
  for(var k=0; k<messages.length; k++){
    messages[k]._id = $("#messageContentBg" + k).attr('name') ? $("#messageContentBg" + k).attr('name') : '';
    messages[k].content = $("#messgeContent" + k).val();
    var imageURI = $("#messageContentBg" + k).css("background-image");
    messages[k].backgroundImage = imageURI ? imageURI.substring(imageURI.indexOf('url(')+5,imageURI.lastIndexOf('")')) : '';//$("#messageContentBg" + k).css("background-image");//$("#messageContentBg"+k).val();
    messages[k].backgroundImagePath = $("#messageContentBg"+k).attr('value');//$("#messageContentBg" + k).css("background-image");//$("#messageContentBg"+k).val();
    messages[k].userId = global.login.userId;
  }
  if(!messages.length){
    return[]; //0일 경우
  }
  return messages;
}
