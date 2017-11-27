import {global} from '/imports/global/global_things.js';

var templateName = 'bucketwriting';
var removeImageList=[];
var _id = null; // meContent의 글ID
var execPlanId = null;
var execPlanArray = null;
var deletePlanList = null;
var isSavedData = {}; //수정시 로드데이터 저장
var isfollower = false;
var friendsListParam = [];
var userId = null;
var isPageOwner = false;
var imageListTemp = [];
var originFriendList = [];
var followParantsId = '';
var followParantsUserId = '';
var defaultPlan = null;
var newPlanCount = 0;
var isDeleteExecPlan = false;
var completedOrginData = false;
var imageDataArray = [];
var imgOrigin = {};
var imgThumb = {};
var imgOriginRe = {};
var orientation = 1;


Template[templateName].onCreated(function(){
  var instance = this;
  removeImageList=[];
  _id = null; // meContent의 글ID
  execPlanId = null;
  execPlanArray = [];
  deletePlanList = [];
  isSavedData = {}; //수정시 로드데이터 저장
  isfollower = false;
  friendsListParam = [];
  isPageOwner = false;
  imageListTemp = [];
  originFriendList = [];
  followParantsId = "";
  followParantsUserId = '';
  newPlanCount = 0;
  isDeleteExecPlan = false;
  completedOrginData = false;

  orientation = 1;
  imageDataArray = [];
  imgOrigin = {};
  imgThumb = {};
  imgOriginRe = {};

  this.groupUsers = new ReactiveVar();
  if (this.data) {
    var obj = {
      _id: this.data._id
    };
    Meteor.call('bucketTimelineGetList', obj, function(error, result) {
      instance.groupUsers.set(result[0].groupUsers);
    });
  }

  this.author = new ReactiveVar();
  this.categoryReact = new ReactiveVar();
  this.pubOptionReact = new ReactiveVar();

  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    userId = global.login.userId;
  } else {
    userId = global.login.pageOwner;
  }

  global.fn_setS3UploadInfo(global.s3.folder.bucketList);
  Session.set('bucketWriting defaultData', null);
  Session.set("bucketWriting exePlanList", null);
  Session.set('endingNoteList selectData', null);
  //Session.set('bucketWriting friendsList', friends);

  var defaultData = {
    regDate : global.utilGetDate().korYMD
  };
  defaultPlan = [{
    _id:"",
    planStartDate:"",
    planCompleteDate:"",
    planContent:"",
  }];
  Session.set('bucketWriting defaultData', defaultData);
  Session.set("bucketWriting exePlanList", defaultPlan);
});

// 1. 글쓰기 OK
// 2. 수정(notFollow)
//
Template[templateName].onRendered(function(){
  isfollower = false;

  // $("#fList").attr("hidden", true);
  // $("#gName").attr("hidden", true);
  // console.log('followData',Session.get('endingNoteList templateData').followData);
  if(Session.get('endingNoteList templateData').followData){
    // console.log('followData true');
    var receiveData = Session.get('endingNoteList templateData').followData;
    if(receiveData._id){
      _id = receiveData._id;
      isfollower = receiveData.follow;
      if(_.isEqual(receiveData.groupType, 'group')) {
        // $("#groupName").val(receiveData.groupName);
        $('input:radio[name=groupRadio]:input[value='+ receiveData.groupType +']').attr("checked", true);
        friendsListParam = receiveData.groupUsers;
        originFriendList = receiveData.groupUsers;

        var searchOption = ['profile.nickName'];
        // global.utilGetUsersInfo(receiveData.groupUsers, searchOption);
        setNickName ();
      }
    } else {
      //id가 없을경우 따라하기
      isfollower = true;
      followParantsId = receiveData.postId;
      followParantsUserId = receiveData.userId;

    }

    $("#meTitle").val(receiveData.title);
    $("#categoryOp").val(receiveData.category);
    this.categoryReact.set(receiveData.category);
    $("#lockOp").val(receiveData.lock+"");
    this.pubOptionReact.set(receiveData.lock+"");
    this.author.set(receiveData.Author);
    // this.groupUsers.set(receiveData.groupUsers);
    $("#isComplete").attr("checked",receiveData.isCompleted);
    completedOrginData = receiveData.isCompleted;
    $("#exePlace").val(receiveData.exePlace);
    $("#lat").val(receiveData.lat);
    $("#lng").val(receiveData.lng);

    if(receiveData.groupType === "group"){
      $("#fList").removeClass("hidden");
      $("#gName").removeClass("hidden");
    } else {
      $("#fList").addClass("hidden");
      $("#gName").addClass("hidden");
    }

    this.$('div.froala-reactive-meteorized').froalaEditor('html.set',receiveData.content);

    defaultPlan = receiveData.exePlanList;
    Session.set("bucketWriting exePlanList",receiveData.exePlanList);

    if(receiveData.tagList){
      receiveData.tagList.forEach(function(tag){
        $("#inputTag").before("<li><a href=\"javascript:void(0)\"><strong>#</strong>"+tag+"</a><a class=\"btn-tagDelete\"></a></li>");
      });
    }
  }

});

Template[templateName].helpers({
  hpGetContext: function () {
    var self = this;
    return {
      key: global.editorSettings.key,
      heightMin : global.editorSettings.heightMin,
      toolbarButtons: global.editorSettings.toolbarButtons,
      toolbarButtonsMD: global.editorSettings.toolbarButtons,
      toolbarButtonsSM: global.editorSettings.toolbarButtons,
      toolbarButtonsXS: global.editorSettings.toolbarButtons,
      imageUploadToS3: global.editorSettings.imageUploadToS3,
      imageEditButtons: global.editorSettings.imageEditButtons,
      imageDefaultAlign: 'left',
      imagePaste: false,
      pasteAllowLocalImages: true,
      pluginsEnabled: ['image','codeView','draggable','fontSize','url'],
      initOnClick: false,
      placeholderText: null,
      charCounterCount: false,
      dragInline: true,
      toolbarSticky: false,
      // linkEditButtons: null,
      // linkAlwaysBlank: true,


      "_onblur": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
      }, //end _onimage.loaded
      "_onmousedown": function (e, editor, img) {
        $('.mCS_img_loaded').removeClass('fr-dragging');
      }, //end _onimage.loaded
      "_onimage.uploadedToS3": function(e, editor, link, key, response){
        imageListTemp.push(global.fn_makeImageString(link, 'originRe'));

        var storeFolder = global.s3.folder.bucketList+'/';
        var imageName = key.substring(key.indexOf(storeFolder) + storeFolder.length, key.lastIndexOf('.'));

        imgThumb.fileName = imgThumb.fileName.replace('fileName', imageName);
        imgOriginRe.fileName = imgOriginRe.fileName.replace('fileName', imageName);
        imgOriginRe.filePath = global.fn_makeImageString(link, 'originRe');

        imageDataArray.push(imgThumb);
        imageDataArray.push(imgOriginRe);

        //에디터 등록 화면에 등록될 이미지를 보여주기 위해서 originRe를 선 Upload한다
        global.fn_upLoadeS3Image(imageDataArray, global.s3.folder.bucketList);

        imgFirstTimeUpload = true;
      },
      "_onimage.loaded": function (e, editor, img) {
        //originRe이미지로 에디터에 이미지를 교체
        setTimeout(function(){
          if(imgFirstTimeUpload){
            editor.image.get()[0].src = imgOriginRe.filePath;
            imgFirstTimeUpload = false;
          }
        },100);
      }, //end _onimage.loaded
      "_onimage.beforeUpload": function (e, editor, img) {
        var imageObj = img[0];

        var reader = new FileReader();
        reader.readAsDataURL(imageObj);
        var extension = imageObj.name.substring(imageObj.name.lastIndexOf('.')+1);

        reader.onload = function  () {
          var tempImage = new Image();
          tempImage.src = reader.result;
          tempImage.onload = function () {
            var targetImage = this;

            //원본수정(thumbnail)용 canvas생성
            //휴대전화 rotate된 사진 똑바로 보이게 수정
            EXIF.getData(imageObj, function(e,r) {
              var width = targetImage.width;
              var height = targetImage.height;

              //이미지 사이즈 조정
              if(targetImage.width >= targetImage.height){
                if(targetImage.width > 84){
                  width = 84;
                  height = targetImage.height * (84/targetImage.width);
                }
              } else {
                if(targetImage.height > 50){
                  height = 50;
                  width = targetImage.width * (50/targetImage.height);
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

              // canvas.width = 47;
              // canvas.height = 47;
              canvasContext.drawImage(targetImage, 0, 0, width, height);
              var dataURI = canvas.toDataURL("image/jpeg");

              //썸네일
              imgThumb = {
                fileName : 'fileName',
                type : 'thumb',
                extension : extension,
                data : dataURI
              };

              //원본수정(originRe)용 canvas생성
              width = targetImage.width;
              height = targetImage.height;

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

              var canvasOriginRe = document.createElement('canvas');
              var canvasContextOriginRe = canvasOriginRe.getContext("2d");

              if ([5,6,7,8].indexOf(orientation) > -1) {
                canvasOriginRe.width = height;
                canvasOriginRe.height = width;
              } else {
                canvasOriginRe.width = width;
                canvasOriginRe.height = height;
              }

              switch (orientation) {
                case 2: canvasContextOriginRe.transform(-1, 0, 0, 1, width, 0); break;
                case 3: canvasContextOriginRe.transform(-1, 0, 0, -1, width, height ); break;
                case 4: canvasContextOriginRe.transform(1, 0, 0, -1, 0, height ); break;
                case 5: canvasContextOriginRe.transform(0, 1, 1, 0, 0, 0); break;
                case 6: canvasContextOriginRe.transform(0, 1, -1, 0, height , 0); break;
                case 7: canvasContextOriginRe.transform(0, -1, -1, 0, height , width); break;
                case 8: canvasContextOriginRe.transform(0, -1, 1, 0, 0, width); break;
                default: canvasContextOriginRe.transform(1, 0, 0, 1, 0, 0);
              }

              // canvasOriginRe.width = width;
              // canvasOriginRe.height = height;
              canvasContextOriginRe.drawImage(targetImage, 0, 0, width, height);
              var dataURIOriginRe = canvasOriginRe.toDataURL("image/jpeg");

              //위치정보 저장
              var latitued = EXIF.getTag(this, "GPSLatitude");
              var longitude = EXIF.getTag(this, "GPSLongitude");

              //원본파일 줄인것
              imgOriginRe = {
                fileName : 'fileName',
                type : 'originRe',
                extension : extension,
                data : dataURIOriginRe,
                lat : latitued ? global.toDecimal(latitued) : null,
                lng : longitude ? global.toDecimal(longitude) : null
              };
            });
          };
        };
      },

      "_onimage.beforeRemove": function (e, editor, img) {
        //removeImageList.push($(img[0]).attr("src"));
        removeImageList.push(global.fn_makeImageString($(img[0]).attr("src"), 'originRe'));
      } // end _onimage.beforeRemove
    };
  },
  hpSetDateTime: function() {
    if(Session.get('endingNoteList templateData').followData){
      var followData = Session.get('endingNoteList templateData').followData;
      // Session.set('endingNoteList selectData', followData.privFollow);
      return followData;
    }
    return true;
  },
  // 타임라인에서 질문등록햇을때 기본으로 입력시켜주는 데이터
  hpDefaultData: function() {
    return Session.get('bucketWriting defaultData');
  },
  //실행계획화면
  hpExePlanList: function() {
    return Session.get("bucketWriting exePlanList");
  },
  hpGoogleMapCallBack: function(data){
    $("#exePlace").val(data.address);
    $("#lat").val(data.lat);
    $("#lng").val(data.lng);
  },
  //그룹추가 콜백
  hpAddUsersCallBack: function(callbackData){
    var friendNickParam = "";
    var friList = friendsListParam;
    for(var i=0; i<callbackData.length ; i++){
      friendsListParam.push(callbackData[i].userId);
    }
    setNickName ();

  },
  hpGroupOrSolo: function(typeparam){
    return $("input[name=groupRadio]:checked").val() === 'group';
  },
  hpSelectType: function(){
    var result = null;

    if(_.isEqual(Session.get('endingNoteList selectData'),null)){
      result = true;
    } else {
      result = Session.get('endingNoteList selectData');
    }

    return result;
  },
  hpSelectPickersibal : function(){
    return Template.instance().categoryReact.get();
  },
  hpSelectPickerLock : function(){
    return Template.instance().pubOptionReact.get();
  }

});

Template[templateName].events({
  "click #saveWriteMe": function(e, t){
    e.preventDefault();
    $('.mCS_img_loaded').removeClass('fr-dragging');

    var fn_execPlanWrite = new Function("count", global.Message.bucketList.execPlanWrite);

    var self = this;
    var insertedId = "";
    var postId = null;
    if (global.utilValidation(t)) {
      setTimeout(function(){
        var titleText = t.find('input[id="meTitle"]').value;
        var categoryText = t.find('select[id="categoryOp"]').value;
        var lock = (t.find('select[id=lockOp]').value === 'true');
        var privFollowParam = (t.find('select[id=followOp]').value === 'true');
        var startDateParam = t.find('input[id="startDate"]').value;
        var completeDateParam = t.find('input[id="completeDate"]').value;
        var isCompletedParam = $("#isComplete").is(":checked");
        var exePlace = t.find('input[id="exePlace"]').value;
        var exelat = t.find('input[id="lat"]').value;
        var exelng = t.find('input[id="lng"]').value;
        // var groupNameParam = t.find('input[id="groupName"]').value;
        var groupUsersParam = friendsListParam;
        var groupTypeParam = $("input[name=groupRadio]:checked").val();
        var tagArray = [];
        var contentImag = t.$('.editor-content').find('img');

        // 시작일 종료일 체크하기
        if (global.utilCalendarBetween(startDateParam, completeDateParam)) {
          return global.utilAlert('버킷리리스트 완료일이 시작일보다 빠릅니다.\n날짜를 확인해주세요.');
        }

        $('#tagUlList').find('li').each(function(index){
          if($(this).text()!== ""){
            var splitTage = $( this ).text().replace('#','');
            tagArray.push(splitTage);
          }
        });

        //리사이징된 이미지를 화면에서 사용하도록 수정
        var image = [];
        _.each(contentImag, function(item) {
          var src = item.src;
          if(src.indexOf('_originRe') < 0){
            item.src = src.substring(0, src.lastIndexOf('.'))+ '_originRe' + src.substring(src.lastIndexOf('.'));
          }

          var imageInfo = {};
          var lat = null;
          var lng = null;
          if(imageDataArray) {
            var imageData = _.findWhere(imageDataArray, {filePath : item.src});
            if(imageData){
              lat = imageData.lat ? imageData.lat : null;
              lng = imageData.lng ? imageData.lng : null;
            } else {
              var preSavedImageData = _.findWhere(Session.get('endingNoteList templateData').followData.images, {path : item.src});
              lat = preSavedImageData.lat;
              lng = preSavedImageData.lng;
            }
          }

          imageInfo.path = item.src;
          imageInfo.lat = lat;
          imageInfo.lng = lng;

          image.push(imageInfo);
        });


        var getPlanList = Session.get("bucketWriting exePlanList");
        // var addPlanList = [];
        for(var i = 0; i < getPlanList.length ; i++){
          if(!_.isEqual($("#planList"+i).find("#exePlanContent").val(),"") ){
            if(!getPlanList[i]._id){ //신규 등록된 플렌일 경우
              newPlanCount++;
            } else {

            }
            //기 실행계획 중 수정된 내용 다시 설정
            getPlanList[i].userId = global.login.userId;
            getPlanList[i].planStartDate = $("#planList"+i).find("#planStartDate_"+i).val();
            getPlanList[i].planCompleteDate = $("#planList"+i).find("#planCompleteDate_"+i).val();
            getPlanList[i].planContent = $("#planList"+i).find("#exePlanContent").val();

            if (global.utilCalendarBetween(getPlanList[i].planStartDate, getPlanList[i].planCompleteDate)) {
              return global.utilAlert('실행계획 종료일이 시작일보다 빠릅니다. 날짜를 확인해주세요.');
            }

            execPlanArray.push(getPlanList[i]); //수정일 경만 진행
          }
        }

        if(groupTypeParam === 'solo'){
          groupUsersParam = [];
          // groupNameParam = "";
        }else{
          if(groupUsersParam.length === 0){
            return global.utilAlert("그룹원을 선택해 주세요.");
          }
        }

        if(titleText!== ""){
          var saveWriteMeData = {
            userId : userId,								//임시 아이디
            lock : lock,			// 공개여부
            title : titleText,					//제목
            content : t.$('div.froala-reactive-meteorized').froalaEditor('html.get', true),
            type: 'BL',
            images : image,											// 업로드 이미지
            startDate : startDateParam ? global.utilGetDate(startDateParam).defaultYMD : '',
            completeDate : completeDateParam ? global.utilGetDate(completeDateParam).defaultYMD : '',
            updateDate: global.utilGetDate().default,
            tagList : tagArray,
            follow : isfollower,                       //따라하기인지 아닌지 (미구현 false)
            privFollow : privFollowParam,
            category : categoryText,
            exePlace : exePlace,
            lat : exelat,
            lng : exelng,
            isCompleted : isCompletedParam,
            groupUsers : groupUsersParam,
            // groupName : groupNameParam,
            groupType : groupTypeParam
          };
          if(!_id){
            saveWriteMeData.open = 0;
          }
          if(followParantsId){
            saveWriteMeData.postId = followParantsId;
            saveWriteMeData.postUserId = followParantsUserId;
          }
          if(isCompletedParam && saveWriteMeData.completeDate===""){
            saveWriteMeData.completeDate = global.utilGetDate().defaultYMD;
          }

          var groupUsers = t.groupUsers.get(); // 기존에 있는 그룹멤버
          Meteor.call('bucketUpsert', _id, saveWriteMeData, function(error, result) {
            if (error) {
              return alert(error);
            } else {
              var type = global.pageType.bucketList;
              var isGroup = saveWriteMeData.groupType === 'group' ? true : false;

              if(!_id){
                //신규일 경우
                postId = result.insertedId;

                groupUsersParam.unshift(userId);  // 그룹멤버에서 자기자신을 추가
                //실행계획 등록
                if (execPlanArray.length !== 0) {
                  setBucketExecPlan(postId, execPlanArray, groupUsersParam, [], isGroup);
                }

                groupUsersParam.map(function(item) {
                  var options = {
                    userId: userId,
                    title: titleText
                  };
                  // 등록한 사람은 알림을 보내지 않음
                  if (userId !== item) {
                    Meteor.call('setNoti', item, type, postId, 'write', options);
                  }

                  global.utilTimelineRegister(postId, item, type, startDateParam, completeDateParam, isGroup);
                });

                if(_.isEqual(isCompletedParam, true)){
                  if(!completedOrginData){
                    Meteor.call('setLog', postId, null, userId, userId, global.pageType.bucketList, global.Message.bucketList.complete, 'complete');
                  }
                } else {
                  Meteor.call('deleteLog', global.login.userId, postId, null, global.pageType.bucketList, 'complete');
                }

                if(isfollower){ //따라쟁이로 등록
                  // 따라하기를 당한 유저의 히스토리에 따라한사람의 이력을 남긴다
                  var historyObj = {
                    commentKey: '',
                    postType: type,
                    timelineDate: global.utilGetDate().defaultYMD,
                    updateDate: global.utilGetDate().default,
                    regDate: global.utilGetDate().default
                  };
                  for (var i = 0; i < 2; i++) {
                    if (i === 0) { // 따라가기 당한버킷
                      historyObj.postId = self._id;
                      historyObj.typeKey = postId;
                      historyObj.type = 'FW';
                      historyObj.userId = t.author.get();
                      historyObj.user = global.login.userId;

                      var options = {
                        userId : global.login.userId,
                        title: titleText
                      };
                      if (groupUsersParam.length === 0) {
                        global.utilHistoryInsert(historyObj);
                        Meteor.call('setNoti', t.author.get(), 'BL', self._id, 'follow', options);
                      } else {
                        var groupArray = [];
                        groupArray = _.clone(t.groupUsers.get());
                        groupArray.unshift(t.author.get());
                        for (var j = 0; j < groupArray.length; j++) {
                          historyObj.userId = groupArray[j];
                          global.utilHistoryInsert(historyObj);
                          Meteor.call('setNoti', groupArray[j], 'BL', self._id, 'follow', options);
                        }
                      }
                    } else {  // 따라가기 한 버킷
                      historyObj.postId = postId;
                      historyObj.typeKey = self._id;
                      historyObj.type = 'CP';
                      historyObj.userId = global.login.userId;
                      historyObj.user = t.author.get();
                      global.utilHistoryInsert(historyObj);
                    }
                  }

                  //상대방의 로그에 내 정보를 남김
                  Meteor.call('setLog', followParantsId ,null, followParantsUserId, userId, global.pageType.bucketList, global.utilGetNickName(global.login.userId) + global.Message.bucketList.followMe, 'followMe');

                  //내 로그에 따라하기 정보를 남김 (postID : 내꺼 , followParantsUserId: 상대방 아이디)
                  Meteor.call('setLog', postId, null, userId, followParantsUserId, global.pageType.bucketList, global.utilGetNickName(followParantsUserId) + global.Message.bucketList.follow, 'follow');

                  if(newPlanCount > 0){
                    Meteor.call('setLog', postId, null, userId, userId, global.pageType.bucketList, fn_execPlanWrite(newPlanCount), 'execPlanWrite|'+newPlanCount);
                  }
                } else { //일반 등록
                  Meteor.call('setLog', postId, null, userId, userId, global.pageType.bucketList, global.Message.bucketList.write, 'write');

                  if(newPlanCount > 0){
                    Meteor.call('setLog', postId, null, userId, userId, global.pageType.bucketList, fn_execPlanWrite(newPlanCount), 'execPlanWrite|'+newPlanCount);
                  }
                }
              }
              else { //수정일경우
                postId = _id;

                var addGroupUser = [];
                var removeGroupUser = [];

                if (groupUsersParam.length === 0) {
                  // 그룹이 없어졌을때
                  // groupUsers의 사람들의 타임라인, 히스토리, 버킷을 모두 삭제한다
                  removeGroupUser = _.clone(groupUsers);
                } else {
                  // 그룹이 새로 생성됬거나 있을때
                  groupUsersParam.map(function(item) {
                    if (_.indexOf(groupUsers, item) === -1) {
                      // 새로 추가된 그룹원
                      addGroupUser.push(item); // 추가된 유저들
                    }
                  });
                  groupUsers.map(function(item) {
                    if (_.indexOf(groupUsersParam, item) === -1) {
                      // 삭제된 그룹원
                      removeGroupUser.push(item);
                    }
                  });
                }

                if (addGroupUser.length !== 0) {
                  // 버킷그룹에서 새로 추가된사람들 (타임라인,히스토리 추가)
                  addGroupUser.map(function(item) {
                    global.utilTimelineRegister(postId, item, type, startDateParam, completeDateParam, isGroup);
                  });
                }

                if (removeGroupUser.length !== 0) {
                  // 버킷그룹에서 제외된사람들 (타임라인, 히스토리삭제, 버키스토리자기꺼는 추억으로 이동)
                  removeGroupUser.map(function(item) {
                    Meteor.call('enTimelineDalete', postId, item);
                  });
                  // 타임라인의 플랜삭제
                  if (execPlanArray.length !== 0) {
                    var removePlanArr = [];
                    execPlanArray.map(function(item) {
                      removePlanArr.push(item._id);
                    });
                    Meteor.call('deleteTimelineBucketExecPlan', removePlanArr, removeGroupUser);
                  }

                  Meteor.call('removeUsersBStory',postId, global.login.userId);
                }

                //실행계획 등록
                // if (addPlanList.length !== 0) {
                //   var planGroupUsers = [];
                //   planGroupUsers = _.clone(groupUsers);
                //   planGroupUsers.unshift(userId);
                //   planGroupUsers = _.union(planGroupUsers, addGroupUser);
                //   setBucketExecPlan(postId, addPlanList, planGroupUsers, addGroupUser);
                // }
                if (execPlanArray.length !== 0) {
                  var planGroupUsers = [];
                  planGroupUsers = _.clone(groupUsers);
                  planGroupUsers.unshift(userId);
                  planGroupUsers = _.union(planGroupUsers, addGroupUser);
                  setBucketExecPlan(postId, execPlanArray, planGroupUsers, addGroupUser, isGroup);
                }

                if(isCompletedParam){
                  if(!completedOrginData){
                    Meteor.call('setLog', postId, null, userId, userId, global.pageType.bucketList, global.Message.bucketList.complete, 'complete');
                  }
                } else {
                  Meteor.call('deleteLog', global.login.userId, postId, null, global.pageType.bucketList, 'complete');
                }

                if(newPlanCount > 0){
                  Meteor.call('setLog', postId, null, userId, userId, global.pageType.bucketList, fn_execPlanWrite(newPlanCount), 'execPlanWrite|'+newPlanCount);
                }

                if(isDeleteExecPlan){
                  Meteor.call('setLog', postId, null, userId, userId, global.pageType.bucketList, global.Message.bucketList.execPlanDelete, 'execPlanDelete');
                }

                var obj = [];
                var groupArray = [];
                groupArray = _.clone(groupUsersParam);
                groupArray.unshift(userId);
                groupArray.map(function(item) {
                  obj.push(
                    {
                      userId: item,
                      timeClass: 'start',
                      contentType: 'E',
                      timelineDate: startDateParam,
                      updateDate: global.utilGetDate().default,
                      isGroup : isGroup
                    },
                    {
                      userId: item,
                      timeClass: 'end',
                      contentType: 'E',
                      timelineDate: completeDateParam,
                      updateDate: global.utilGetDate().default,
                      isGroup : isGroup
                    }
                  );
                });

                Meteor.call('enTimelineUpdate', _id, obj);
              }

              //실행계획 삭제
              Meteor.call('deleteBucketExecPlan', deletePlanList);
              moveDetailFunc(postId);
            }
          });
        }
      }, 500);
    }
    Session.set('endingNoteListHeaderBucketList selectedMenu', null);
  },
  "click #cancelWriteMe": function(e, t){
    global.utilConfirm('취소 하시겠습니까?').then(function(val) {
      if (val) {
        //sessioin set 이용 화면이동
        e.preventDefault();

        var templateData = {};

        templateData.headerTmp = 'endingNoteListHeaderBucketList';
        templateData.contentTmp = 'bucketContent';

        if(Session.get('endingNoteList templateData').data && Session.get('endingNoteList templateData').data){
          templateData.data = {
            selectedMenu : Session.get('endingNoteList templateData').data.selectedMenu,
            searchOption : Session.get('endingNoteList templateData').data.searchOption,
          };
        }
        Session.set('endingNoteList templateData', templateData);
        Session.set('endingNoteListHeaderBucketList selectedMenu', null);
      }
    }).catch(swal.noop);
  },
  // "click .btn-tagDelete": function(e, t){
  //   $(e.target.parentElement).remove();
  // },
  "change #lockOp": function(e, t){

    if($("#lockOp").val() === "true"){
      Session.set('endingNoteList selectData', false);
    }else{
      Session.set('endingNoteList selectData', true);
    }

    // console.log('lockOp',Session.get('endingNoteList selectData'));
  },
  "keyup #inputTag": function(e, t){
    var tag = t.find('input[id="inputTag"]').value;
    if(e.keyCode === 13 && tag !== ""){
      $("#inputTag").before("<li><a href=\"javascript:void(0)\"><strong>#</strong>"+tag+"</a><a href=\"javascript:void(0)\" class=\"btn-tagDelete\"></a></li>");
      t.find('input[id="inputTag"]').value = "";
    }
  },
  "click #addRow": function(e, t){
    var getPlanList = Session.get("bucketWriting exePlanList");

    for(var i = 0; i < getPlanList.length ; i++){
      getPlanList[i].planStartDate = $("#planList"+i).find("#planStartDate_"+i).val();
      getPlanList[i].planCompleteDate = $("#planList"+i).find("#planCompleteDate_"+i).val();
      getPlanList[i].planContent = $("#planList"+i).find("#exePlanContent").val();

    }

    getPlanList.unshift({
      planStartDate:"",
      planCompleteDate:"",
      planContent:"",
    });
    Session.set("bucketWriting exePlanList", null);
    setTimeout(function(){
      Session.set("bucketWriting exePlanList", getPlanList);
    }, 200);
  },
  //실행계획 체크리스트 삭제
  "click #delChecked": function(e, t){
    var getPlanList = Session.get("bucketWriting exePlanList");
    for(var i=getPlanList.length-1; i>=0 ; i--){

      if($("#delCheck"+i).is(":checked")) {
        //_id 가 있어야 수정
        if(getPlanList[i]._id && _id ){
          isDeleteExecPlan = true;
          deletePlanList.push(getPlanList[i]);
        }

        getPlanList.splice(i,1);
        $('#delCheck'+i).attr('checked',false);
      } else {
        getPlanList[i].planStartDate = $("#planList"+i).find("#planStartDate_"+i).val();
        getPlanList[i].planCompleteDate = $("#planList"+i).find("#planCompleteDate_"+i).val();
        getPlanList[i].planContent = $("#planList"+i).find("#exePlanContent").val();
      }

      $("#planList"+i).find("exePlanContent").val("");
    }
    Session.set("bucketWriting exePlanList",getPlanList);
  },
  "click #mapSearch": function(e, t){
    e.preventDefault();

    var addrValue = $('#exePlace').val();
    var latValue =  $('#lat').val();
    var lngValue =  $('#lng').val();

    var modalobj = {};
    modalobj.template = t.$(e.currentTarget).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg bucket';
    modalobj.fade = true;
    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '실행장소',
      parentViewId: Blaze.currentView.name,
      location : {
        lat : parseFloat(latValue), //template.$(e.target).data('lat'),
        lng : parseFloat(lngValue) //template.$(e.target).data('lng')
      }
    };

    global.utilModalOpen(e, modalobj);
  },
  "click #findFriend": function(e, t){
    e.preventDefault();
    var modalobj = {};
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-lg bucket';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '친구선택',
      parentViewId: Blaze.currentView.name,
    };
    modalobj.data.preSelectedUsers = friendsListParam;
    global.utilModalOpen(e, modalobj);
  },
  "change input[name='groupRadio']": function(){
    var selectedType = $("input[name=groupRadio]:checked").val();
    if(selectedType === "group"){
      $("#fList").removeClass("hidden");
      $("#gName").removeClass("hidden");
    } else {
      $("#fList").addClass("hidden");
      $("#gName").addClass("hidden");
    }
  },
  "keyup #exePlanContent":function(e, t){
    e.target.style.height = "1px";
    e.target.style.height = (12+e.target.scrollHeight)+"px";
  },
  "click .btn-tagDelete": function(e, t){
    friendsListParam.splice(friendsListParam.indexOf(e.target.name),1);
    $(e.target.parentElement).remove();
  },

});

Template[templateName].onRendered(function(){
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].onDestroyed(function(){
  if(global.fn_isExist(imageListTemp)) {
    global.fn_DeleteS3ImagesByType(imageListTemp, global.s3.folder.bucketList);
    imageListTemp=[];
  }
});

function setBucketExecPlan(postId, execPlanArray, groupUsers, addGroupUser, isGroup) {
  //실행계획 등록
  if(isfollower){
    for(var i=0; i< execPlanArray.length; i++){
      execPlanArray[i]._id = "";
    }
  }

  Meteor.call('setBucketExecPlan', postId, execPlanArray, function(error, result){
    if(error){
      console.log(error);
    } else {

      groupUsers.map(function(gItem) {
        execPlanArray.map(function(item, i) {
          var startDay = null;
          var endDay = null;
          if (!item._id) {
            startDay = item.planStartDate;
            endDay = item.planCompleteDate;
            global.utilTimelineRegister(result[i].insertedId, gItem, 'BP', startDay, endDay, isGroup);
          } else {
            if (_.indexOf(addGroupUser, gItem) > -1) {
              startDay = item.planStartDate;
              endDay = item.planCompleteDate;
              global.utilTimelineRegister(item._id, gItem, 'BP', startDay, endDay, isGroup);
            } else {
              var timelineObj = {
                userId: gItem,
                timeClass: 'start',
                contentType: 'E',
                timelineDate: item.planStartDate,
                isGroup: isGroup
              };
              // 실행계획 업데이트시
              Meteor.call('enTimelineUpdateOne', item._id, timelineObj);
            }
          }
        });
      });
    }
  });
}

function setNickName (){
  if(friendsListParam){
    Meteor.call('getNickAndImg', friendsListParam, function(error, result){
      if(error){
        console.log(error);
      } else {
        var usersNick = result;
        $("#tagFrUlList").find('li').remove();
        _.each(result, function(userInfo){
          $("#tagFrUlList").append("<li><a >"+userInfo.nickName+"</a><a class=\"btn-tagDelete\" name="+ userInfo.userId+" id='frListTag'></a></li>");
        });
      }
    });
  }
}

function moveDetailFunc(moveId){
  var templateData = {};
  templateData.headerTmp = 'endingNoteListHeaderBucketList';
  templateData.contentTmp = 'bucketDetail';
    templateData.data = {
      _id : moveId,
    };


  if(Session.get('endingNoteList templateData').data && Session.get('endingNoteList templateData').data){
    templateData.data.selectedMenu = Session.get('endingNoteList templateData').data.selectedMenu;
    templateData.data.searchOption = Session.get('endingNoteList templateData').data.searchOption;
  }
  imageListTemp = [];    //imageListTemp clear
  global.fn_DeleteS3ImagesByType(removeImageList, global.s3.folder.bucketList);
  //친구 추방 스토리 추방
  var outUserList = _.difference(originFriendList,friendsListParam);
  Meteor.call('moveStory', outUserList, moveId, null, global.pageType.im, function(error){
    if(error) {
      console.log('moveStory_error', error);
    }
  });

  Session.set('endingNoteList templateData', templateData);
}

Template.selectFollowTemplate.onCreated(function(){
  if(this.data.followType !== true && this.data.followType !== false){
    this.data.followType = true;
  }
  $('.selectFollowPicker').selectpicker().remove();
});

Template.selectFollowTemplate.onRendered(function(){
  var data = Session.get('endingNoteList templateData').followData;
  if(data){
    $('#followOp').val(data.privFollow+"");
  }


  global.fn_selectPicker('.selectpicker', null);
  global.fn_selectPicker('.selectFollowPicker', null);
});
//
Template.selectFollowTemplate.onDestroyed(function(){
  $('.selectFollowPicker').selectpicker().remove();
});

Template.selectFollowTemplate.helpers({
  hpFollowType: function(){
    return Template.instance().data.followType;
  },
  hpSelected: function(param){
    if(param){
      return {
      value: "false",
      };
    } else {
      return {
      value: "false",
      selected : true
      };
    }
  },
  hpDisabled: function(param){
    if(param){
      return "";
    } else {
      return "disabled";
    }
  }
});

Template.exePlanTemplate.onCreated(function(){

});

Template.exePlanTemplate.onRendered(function(){
  var planSession = Session.get("bucketWriting exePlanList");
  for(var i=0; i<planSession.length ; i++){
    $("#planList"+i).find("#exePlanContent")[0].style.height = "1px";
    $("#planList"+i).find("#exePlanContent")[0].style.height = (12+$("#planList"+i).find("#exePlanContent")[0].scrollHeight)+"px";
  }

});

Template.selectCategoryTemplate.onCreated(function(){

});
Template.selectCategoryTemplate.onRendered(function(){
  if(Session.get('endingNoteList templateData') && Session.get('endingNoteList templateData').followData){
    var data = Session.get('endingNoteList templateData').followData;
    $('#categoryOp').val(data.category);
  }
});

Template.selectprivTemplate.onCreated(function(){

});
Template.selectprivTemplate.onRendered(function(){
  if(Session.get('endingNoteList templateData') && Session.get('endingNoteList templateData').followData){
    var data = Session.get('endingNoteList templateData').followData;
    $('#lockOp').val(data.lock+"");
  }
});

Template[templateName].onDestroyed(function(){
  Session.set("bucketWriting exePlanList", null);
});
