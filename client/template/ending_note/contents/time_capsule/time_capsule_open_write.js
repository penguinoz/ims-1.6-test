import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 타임캡슐 상세
var templateName = "timeCapsuleOpenWrite";
var dynamicTemplateData = {};
var _id = null;
var map = null;
var defaultLat = 37.537798;
var defaultLng = 127.001216;
var markers;
var imgOriginRe = {};

Template[templateName].onCreated(function(){
  markers = [];
  imgOriginRe = {};
  Session.set('timeCapsuleDetail collection', null);
  Session.set('timeCapsuleDetail msgCollection', null);
  var instance = this;
  _id = null; // imContent의 글ID


  if(this.data){
    dynamicTemplateData = this.data;
    _id = dynamicTemplateData._id;  //isRelease 가 true 이면 _id 는 가짜
  }

  var subscription = instance.subscribe("getTimeCapsuleByUid", _id);
  instance.autorun(function () {
    if(subscription.ready()){
      var timeCapsule = {};
      timeCapsule = CLT.EnTimeCapsule.findOne();

      if (timeCapsule) {

        var isStatusOpened = CLT.EnTimeCapsule.find(
          {
            status : 'BR',
            groupMember: {$elemMatch: {userId : global.login.userId, openedDate :{$exists:true}}}
          }
        ).count() > 0 ? true : false;

        if(isStatusOpened) {
          timeCapsule.status = 'US';
        }

        var messageCount = CLT.EnCapsuleMessage.find({capsuleId: _id}, {sort: {regDate:1}}).count();
        var otherUsersMessageCount = CLT.EnCapsuleMessage.find({capsuleId: _id}, {sort: {regDate:1}}).count();


        timeCapsule.regDate = global.utilGetDate(timeCapsule.regDate).default;
        timeCapsule.userId = timeCapsule.userId;
        timeCapsule.messageCount = messageCount;
        timeCapsule.otherUsersMessageCount = otherUsersMessageCount;


        var messages = CLT.EnCapsuleMessage.find({capsuleId: _id}, {sort: {regDate:1}}).fetch();
        CLT.LocalCollection.remove(/^/);
        messages.forEach(item => CLT.LocalCollection.insert(item));

        //각 메시지 사용자별 갯수(index) 처리
        //p : previousValue, c: currentValue, i: index
        messages.reduce(function(p, c, i){
        if (p.userId !== undefined && c.userId in p) {
          p[c.userId]++;
          p.userId = c.userId;
          messages[i].index = p[c.userId];
          //lll.push({userId: c.userId, cnt:p[c.userId]})
        } else {
          p[c.userId] = 1;
          p.userId = c.userId;
          messages[i].index = p[c.userId];
          //lll.push({userId: c.userId, cnt:p[c.userId]})
        }
        return p;
        }, {});



        Session.set('timeCapsuleDetail collection', timeCapsule);
        Session.set('timeCapsuleDetail msgCollection', messages);
        var latLng = new google.maps.LatLng(timeCapsule.buryLat,timeCapsule.buryLng);
        setMarker(latLng);
      }
    }
  });
});

Template[templateName].onRendered(function(){
});

Template[templateName].helpers({
  hpCollection: function(){
    if (Session.get('timeCapsuleDetail collection')) {
      return Session.get('timeCapsuleDetail collection');
    }
  },
  hpIsExistGroupMemger: function(groupMember){
    var result = false;
    var postUserId = this.userId;
    var groupMemberExceptMe = _.reject(groupMember, function(userInfo){
      return userInfo.userId === postUserId;
    });

    if(global.fn_isExist(groupMemberExceptMe) && groupMemberExceptMe.length > 0){
      result = true;
    }
    return result;
  },
  hpMessageCollection: function(){
    var result = {};
    // <!-- 작성중일때는 내 메시지만 보여야 한다. -->
    // <!-- 개봉일때는 모든 메시지가 보여진다.-->
    // <!-- 매립시에는 메시지를 출력하지 않는다.-->
    // console.log('hpMessageCollection status', status, _id);

    condition = {
      capsuleId: _id
    };

    result = CLT.EnCapsuleMessage.find(condition, {sort: {regDate:1}}).fetch();

    //각 메시지 사용자별 갯수(index) 처리
    //p : previousValue, c: currentValue, i: index
    result.reduce(function(p, c, i){
    if (p.userId !== undefined && c.userId in p) {
       p[c.userId]++;
      p.userId = c.userId;
      result[i].index = p[c.userId];
      //lll.push({userId: c.userId, cnt:p[c.userId]})
    } else {
       p[c.userId] = 1;
      p.userId = c.userId;
      result[i].index = p[c.userId];
      //lll.push({userId: c.userId, cnt:p[c.userId]})
    }
    return p;
    }, {});

    return Session.get('timeCapsuleDetail msgCollection');
  },
  // hpMessageBackgroundImage: function(backgroundImage){
  //   // backgroundImage : ex) time_capsule_images/imageName.jpeg OR http://website/imageName.jepg
  //   var result = null;
  //   if(backgroundImage && backgroundImage.indexOf(".//.")!= -1){
  //     backgroundImage = backgroundImage.split(".//.")[1];
  //   }
  //   if(backgroundImage){
  //     var isExistS3 = backgroundImage.indexOf(global.s3.folder.timeCapsule);
  //     if(isExistS3 >= 0){
  //       result = global.s3.bucketPath + backgroundImage;
  //     }else{
  //       result = backgroundImage;
  //     }
  //   }
  //   return result;
  // },
  hpLocationInfo: function(){
    var result = null;
    var data = {
      class : 'content-map',
      location : {},
      placeName : this.buryPlace,
      scrollSet : true, //렌더에서 커스텀 스크롤이 설정되지 않는 문제가 있어서 설정함 true일경우 maptemplate에서 이 화면의 스크롤을 정의한다.
      templateName : 'timeCapsuleOpenWrite'
    };
    data.location.lat = parseFloat(this.buryLat);
    data.location.lng = parseFloat(this.buryLng);
    result = data;
    return result;
  },
  hpMapDataCallBack: function(callbackData){
    var sessionParam = Session.get('timeCapsuleDetail collection');
    sessionParam.buryPlace = callbackData.placeName;
    sessionParam.buryLat = callbackData.location.lat;
    sessionParam.buryLng = callbackData.location.lng;

    $("#landPlace").val(callbackData.placeName);
    $("#lat").val(callbackData.location.lat);
    $("#lng").val(callbackData.location.lng);

    Session.set('timeCapsuleDetail collection',sessionParam);
    $("#capsuleImageViewer").attr("hidden", true);
    $("#map-canvas").attr("hidden", false);
    $('#abucketMap').addClass('active');
    $('#abucketImage').removeClass('active');
  }
});

Template[templateName].events({
  //메시지 열고 닫기
  "click .msgTitle": function(e, t) {
    e.preventDefault();
    var targetId = this._id;
    // console.log($('#msg' + targetId).attr('class'));
    var isActive = $('#msg' + targetId).attr('class').indexOf('active') >= 0 ? true : false;
    if(isActive) {
      $('#msg' + targetId).removeClass('active');
    } else {
      $('#msg' + targetId).addClass('active');
    }
  },
  //지도, 이미지 선택
  "click #abucketImage,#abucketMap": function(e,t){
    e.preventDefault();
    if(_.isEqual(e.currentTarget.id,"abucketImage")){
      $("#capsuleImageViewer").attr("hidden", false);
      $("#map-canvas").attr("hidden", true);
      $('#abucketMap').removeClass('active');
      $('#abucketImage').addClass('active');
    } else {
      $("#capsuleImageViewer").attr("hidden", true);
      $("#map-canvas").attr("hidden", false);
      $('#abucketMap').addClass('active');
      $('#abucketImage').removeClass('active');
    }
  },
  //메시지 수정 버튼 클릭
  "click #aMessageEdit": function(e, t){
    e.preventDefault();

    var modalobj = {};
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-sm timecapsule';
    modalobj.fade = false;      modalobj.backdrop = 'static';
    modalobj.data = {
      capsuleId : _id,
      messageId : this._id,
      backgroundImage : this.backgroundImage,
      content : this.content,
      requestStatus : 'edit',
      isRelease : true

    };

    global.utilModalOpen(e, modalobj);
  },
  //메시지 삭제 버튼 클릭
  "click #aMessageDelete": function(e,t){
    e.preventDefault();

    var self = this;
    global.utilConfirm('메시지를 삭제 하시겠습니까?').then(function(val) {
      if (val) {
        var sessData = Session.get('timeCapsuleDetail msgCollection');
        for(var i=0; i<sessData.length ; i++){
          if(sessData[i]._id == self._id){
            sessData.splice(i,1);
          }
        }
        Session.set('timeCapsuleDetail msgCollection',sessData);
      }
    }).catch(swal.noop);
  },
  //저장버튼 클릭
  "click #saveWrite": function(e, t){
    if(!$('#publicContent').val().replace(/\n/g, "<br>").trim()){
      global.utilAlert("사연 내용을 작성해 주세요.");
      return;
    }
    var postData = Session.get('timeCapsuleDetail collection');
    var buryLat = t.find('input[id="lat"]').value;
    var buryLng = t.find('input[id="lng"]').value;
    var tagArray = [];

    $('#tagUlList').find('li').each(function(index){
      if($(this).text()!== ""){
        var splitTage = $( this ).text().replace('#','');
        tagArray.push(splitTage);
      }
    });

    //s3에 이미지 저장
    var capsuleimg = {};
    if(global.fn_isExist(imgOriginRe)){
      capsuleimg.path = imgOriginRe.filePath;
      capsuleimg.lat = imgOriginRe.lat;
      capsuleimg.lng = imgOriginRe.lng;
      global.fn_upLoadeS3Image(imgOriginRe, global.s3.folder.timeCapsule);
    } else if(global.fn_isExist(postData.image)) {
      capsuleimg.path = postData.image.path;
      capsuleimg.lat = postData.image.lat;
      capsuleimg.lng = postData.image.lng;
    }

    var saveWriteData = {
      userId : global.login.userId,
      title : $('#timeCapTitle').val(),
      groupName : "",
      groupMember : [{userId : global.login.userId}],
      authorType : postData.authorType,
      buryLocationName : postData.buryLocationName,
      buryPlace : postData.buryPlace,
      buryLat : buryLat,
      buryLng : buryLng,
      unsealDate : postData.unsealDate,
      updateDate : global.utilGetDate().defaultYMD,
      isPublic : true,
      publicContent : $('#publicContent').val().replace(/\n/g, "<br>"),
      nonUserGroupMember : [],
      image : capsuleimg,
      tagList : tagArray,
      buryDate : postData.buryDate,
      lock : false,
      isEverOpened : true
    };

    var getCapsuleId = _id;
    //처음일때
    if(dynamicTemplateData.isRelease){
      saveWriteData.status = "PB";
      // saveWriteData.like = [];
      saveWriteData.open = 0;
      saveWriteData.postCapId = _id;
      getCapsuleId = "";
    }
    Meteor.call("upsertTimeCapsule", getCapsuleId, saveWriteData, function(err,result){
      if(err){console.error(err);}
      if(result){
        // if(dynamicTemplateData.isRelease ){
          var msgList = [];
          var editerNames = [];
          msgList = Session.get('timeCapsuleDetail msgCollection')||[];
          //삭제 로직 들어간이유 뭔지 확인필요
          // Meteor.call("deletetForReInsertMsg", msgList[0].capsuleId, function(err,resutl){
          //   if(err){
          //     return console.log(err);
          //   }
          // });
          for(var i=0; i<msgList.length; i++){
            if(msgList[i].imageFlag !== undefined){
              if(msgList[i].imageFlag && msgList[i].backgroundImageData){

                global.fn_upLoadeS3Image(msgList[i].backgroundImageData, global.s3.folder.timeCapsule);
                msgList[i].backgroundImage = msgList[i].backgroundImageData.filePath;
                //upLoadeS3Image(msgList[i].backgroundImage);
              }
              delete msgList[i].imageFlag;
            }
            if(result.res.insertedId){
              msgList[i].capsuleId = result.res.insertedId;
            }

            if( editerNames.indexOf(msgList[i].userId) == -1 ){
              editerNames.push(msgList[i].userId);
              msgList[i].userId = '익명'+editerNames.length;
            }else{
              var index = editerNames.indexOf(msgList[i].userId)+1;
              msgList[i].userId = '익명'+index;
            }
            Meteor.call("insertOpenCapMsgs", msgList[i].capsuleId, msgList[i], function(err,resutl){
              if(err){
                return console.log(err);
              }
            });
          }
          //공개등록됐음을 부모 타임캡슐 로그에 기록
          Meteor.call('setLog', _id, null, global.login.userId, global.login.userId, global.pageType.timeCapsule, global.utilGetNickName(global.login.userId) + global.Message.timeCapsule.public, 'public');
        // }
        var templateData = {};
        templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
        templateData.contentTmp = 'timeCapsuleDetail';
        templateData.data = {
          _id : result.res.insertedId,
          status : "public"
        };
        if(!templateData.data._id){
          templateData.data._id = _id;
        }
        setTimeout(function(){
          Session.set('endingNoteList templateData', templateData);
        }, 100);
      }
    });

  },
  "click #cancelWrite": function(e, t){
    moveToDetail();
  },
  "keyup #inputTag": function(e, t){
    var tag = t.find('input[id="inputTag"]').value;
    if(e.keyCode === 13 && tag !== ""){
      $("#inputTag").before("<li><a href=\"javascript:void(0)\"><strong>#</strong>"+tag+"</a><a href=\"javascript:void(0)\" class=\"btn-tagDelete\"></a></li>");
      t.find('input[id="inputTag"]').value = "";
    }
    //inputbox width리사이징을 위한 function global
    global.fn_inputResizing(e.target);
  },
  "click .btn-tagDelete": function(e, t){
    $(e.target.parentElement).remove();
  },
  "change #capsuleImage": function(e, t){
    var imageObj = e.target.files[0];

    var reader = new FileReader();
    reader.readAsDataURL(imageObj);

    // var fName = imageObj.name.substring(0, imageObj.name.lastIndexOf('.'));
    var extension = imageObj.name.substring(imageObj.name.lastIndexOf('.')+1);

    $("[name=fileName]").val(imageObj.name);
    reader.onload = function  () {
      $("#capsuleImageViewer").attr("src",reader.result);
      t.$("#casuleImagePath").val(e.target.files[0].type.split("/")[1]+".//."+reader.result);
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

          $("#capsuleImageViewer").attr("hidden", false);
          $("#map-canvas").attr("hidden", true);
          $('#abucketMap').removeClass('active');
          $('#abucketImage').addClass('active');
        });
      };
    };
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
    modalobj.fade = true;      modalobj.backdrop = 'static';
    modalobj.data = {
      title : buryPlace ? buryPlace : '매립위치',
      parentViewId: 'googleMapTemplate',
      location : {
        lat : parseFloat(latValue), //template.$(e.target).data('lat'),
        lng : parseFloat(lngValue) //template.$(e.target).data('lng')
      }
    };

    global.utilModalOpen(e, modalobj);
  },
});

function moveToList(){
  var templateData = {};

  templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
  templateData.contentTmp = 'timeCapsuleContent';
  templateData.data = {
    selectedMenu : dynamicTemplateData.selectedMenu,
    statusMenu : dynamicTemplateData.statusMenu,
    contentTmp : dynamicTemplateData.contentTmp,
    searchOption : dynamicTemplateData.searchOption,
  };
  Session.set('endingNoteList templateData', templateData);
}

function setMarker(latLng){
  var iconImg = "/images/icon/icon_egg_line_on.png";
  var iconOption = {
    url: iconImg, // url
    scaledSize: new google.maps.Size(43, 48), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(21, 49) // anchor
  };
  var marker = new google.maps.Marker({
    position: latLng,
    map: map,
    icon: iconOption
  });
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  markers.push(marker);
}

function moveToDetail(){
  var templateData = {};
  templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
  templateData.contentTmp = 'timeCapsuleDetail';
  templateData.data = {
    '_id' : _id,
    selectedMenu : dynamicTemplateData.selectedMenu,
    statusMenu : dynamicTemplateData.statusMenu,
    contentTmp : dynamicTemplateData.contentTmp,
    searchOption : dynamicTemplateData.searchOption,
  };

  Session.set('endingNoteList templateData', templateData);
}

// function upLoadeS3Image (imagePath){
//   var extension = imagePath.substring(0,imagePath.indexOf(".//."));
//   var newFileName = Meteor.uuid() +'.' + extension;
//   var realPath = imagePath.substring(imagePath.indexOf("data"));
//   var path = global.s3.folder.timeCapsule +'/' + newFileName;
//   var s3Bucket = new AWS.S3();
//   buf = new Buffer(realPath.replace(/^data:image\/\w+;base64,/, ""),'base64');
//   var data = {
//     Bucket: S3.config.bucket,
//     Key: path,
//     Body: buf,
//     ContentEncoding: 'base64',
//     ContentType: 'image/jpeg'
//   };
//   //위에서 설정한 파일명과, 서버정보를 이용하여, DB에 데이터를 저장한다.
//   s3Bucket.putObject(data, function(err, data){
//     if (err) {
//       console.log(err);
//       console.log('Error uploading data: ', data);
//     } else {
//       console.log('succesfully uploaded the image!',data);
//     }
//   });
//   return path;
// }
