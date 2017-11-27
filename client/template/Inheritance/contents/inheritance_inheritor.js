import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

//나의 상속인
templateName = 'inheritanceInheritor';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.inheritorList = new ReactiveVar();
  instance.deleteImg = [];
  var subscription = instance.subscribe('inheritance_userid', global.login.userId);
  instance.autorun(function(){
    if(subscription.ready()){
      var inhParent = CLT.Inh.find({
        $and : [
          {parentInhId : {$exists : true}},
          {parentInhId : {$ne:''}},
        ]
      }).fetch();

      var inheritance = CLT.Inh.find({
        $and : [
          {$or : [
            {parentInhId : {$exists : false}},
            {parentInhId : {$eq:''}},
          ]},
          {$or : [
            {inheritorDelete : {$exists : false}},
            {inheritorDelete : false}
          ]},
        ]
      }).fetch();

      _.each(inheritance, function(inhInfo){
        var isParentDataExist = _.findWhere(inhParent, {userId : inhInfo.userId, inheritorId : inhInfo.inheritorId});
        if(isParentDataExist){
          inhInfo.isParentDataExist = true;
        } else {
          inhInfo.isParentDataExist = false;
        }
      });
        // console.log('inheritanceInheritor');
      instance.inheritorList.set(inheritance);
    }
  });
});

Template[templateName].onRendered(function(){
  // // 스크롤 페이징 구현
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});


Template[templateName].helpers({
  hpInheritors: function(){
    if(Template.instance().inheritorList.get()){
      return Template.instance().inheritorList.get();
    }
  },
  hpIsInhDataExist: function(contents){
    var result = false;
    if(!_.isEmpty(contents)){
      result = true;
    }
    return result;
  },
  hpIsInhContentsExist: function(contents, isParentDataExist){
    var result = false;
    if(!_.isEmpty(contents) || isParentDataExist){
      result = true;
    }
    return result;
  },
  hpAddUsersCallBack: function(inheritors, imagesInfo){
    if(inheritors){
      upLoadeS3Image(imagesInfo);

      setTimeout(function(){
        Meteor.call('setInheritors', global.login.userId, inheritors, function(error, result){
          if(error){
            return console.log(error);
          }else{
            for(var i in inheritors){
              Meteor.call('setLog', '', '', global.login.userId ,inheritors[i].userId ,  global.pageType.inHeritance, '', 'addInheritor','' );
            }
          }
        });
      }, 100);
    }
  },
});

Template[templateName].events({
  "click a[name='alastLetter'],a[name='aInheritanceAsset'],a[name='aInheritanceContents']": function(e, t){
    var templateData = {};

    if(!_.isEmpty(t.inheritorList.get())){
      switch(e.currentTarget.name){
        case 'alastLetter': //마지막편지 작성
          templateData.contentTmp = 'inheritanceLastLetterWrite';
          Session.set('inheritanceMain templateData', templateData);
          break;
        case 'aInheritanceAsset': //자산상속 작성
          templateData.contentTmp = 'inheritanceAssetsWrite';
          templateData.data = {
            _id: t.inheritorList.get()[0]._id,
            data: t.inheritorList.get()
          };
          Session.set('inheritanceMain templateData', templateData);
          break;
        case 'aInheritanceContents': //컨텐츠 상속 작성
          templateData.contentTmp = 'inheritanceContentsWrite';
          templateData.data = {
            data: t.inheritorList.get()
          };
          Session.set('inheritanceMain templateData', templateData);
          break;
      }
    } else {
      global.utilAlert('상속인이 없습니다.\r\n상속인을 먼저 등록해요.');
    }

  },
  //상속자 추가
  "click .addInheritor": function(e, t){
    e.preventDefault();

    var modalobj = {};

    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-md inheritance';
    modalobj.fade = false;    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '상속인 추가',
      parentViewId: Blaze.currentView.name,
    };

    var inheritors = Template.instance().inheritorList.get();
    var usersId = [];
    inheritors.map(function(inheritor){
      usersId.push(inheritor.inheritorId.trim());
      // console.log(inheritor.inheritorId, usersId);
    });
    modalobj.data.preSelectedUsers = usersId;

    global.utilModalOpen(e, modalobj);
  },

  //상속인 삭제
  "click .close-btn": function(e, t){
    // console.log('삭제 > 상속인ID', this.inheritorId);
    var self = this;
    global.utilConfirm('상속인을 삭제하면, 해당 상속인에게 상속된 정보가 모두 삭제됩니다.\r\n상속인을 삭제하시겠습니까?').then(function(val) {
      if (val) {
        if(self.image){
          var deleteImg = [];
          deleteImg.push(global.fn_concat_imageString_type(self.image, 'origin')); // profile_images/231012012932fj293e01j.jpeg --> profile_images/231012012932fj293e01j_origin.jpeg로 변환
          deleteImg.push(global.fn_concat_imageString_type(self.image, 'thumb')); // profile_images/231012012932fj293e01j.jpeg --> profile_images/231012012932fj293e01j_thumb.jpeg로 변환
          deleteImg.push(self.image); //profile_images/231012012932fj293e01j.jpeg

          global.fn_DeleteS3Images(deleteImg);
        }

        var condition={
          _id: self._id,
        };

        var data={
          $set:{
            lastLetter: {},
            asset : [],
            contents : [],
            inheritorDelete : true,
            updateDate : global.utilGetDate().default
          }
        };

        // 삭제등록일자 업데이트
        var inheritParam = self.inheritorId;
        if (_.has(self, 'eMail')) {
          // 비유저인경우 데이터 삭제
          Meteor.call('deleteinheritor', global.login.userId, inheritParam, function(error, result){
            if(error){
              return console.log(error);
            }
          });
        } else {
          Meteor.call('updateInheritor', condition, data, function(error, result){
            if(error){
              return console.log(error);
            }else{
              Meteor.call('setLog', '', '', global.login.userId ,inheritParam ,  global.pageType.inHeritance, '', 'delInheritor','' );
            }
          });
        }
      }
    }).catch(swal.noop);
  },
  //상속인 사진에 마우스올렸을때
  "mouseenter .inheritorImg": function(e, t){
    e.preventDefault();
    var _target = $(e.currentTarget).parents('.thumbnail').find('.thumb-over');
    _target.show();
  },
  //상속인 카드에서 마우스 뻈을때
  "mouseleave .thumb-over": function(e, t){
    e.preventDefault();
    var _target = $(e.currentTarget).parents('.thumbnail').find('.thumb-over');
    _target.hide();
  },
  //마지막 편지 상세 화면
  "click [name='lastLetter']": function(e, t){
    e.preventDefault();
    var templateData = {};
    if(_.isEmpty(this.data.lastLetter)){
      //신규 마지막 편지 화면으로 이동
      templateData.contentTmp = 'inheritanceLastLetterWrite';
      templateData.data = {
        inheritorId : this.data.inheritorId,
      };
      if(this.data.name){
        templateData.data.nonUsername = this.data.name;
      }
      Session.set('inheritanceMain templateData', templateData);
    } else {
      //마지막 편지 상세 화면으로 이동
      templateData.contentTmp = 'inheritanceLastLetter';
      templateData.data = {
        _id : this.data._id,
        userId : this.data.userId,
        inheritorId : this.data.inheritorId,
        name : this.data.name,
        lastLetter : this.data.lastLetter
      };
      Session.set('inheritanceMain templateData', templateData);
    }
  },
  // 자산상속 상세화면
  'click [name="assetDetail"]': function(e, t) {
    e.preventDefault();

    var templateData = {};
    if (_.isEmpty(this.data.asset)) {
      // asset데이터가 없으면
      templateData.contentTmp = 'inheritanceAssetsWrite';
    } else {
      // asset데이터가 있으면
      templateData.contentTmp = 'inheritanceAssets';
    }
    templateData.data = {
      _id : this.data._id,
      data: [this.data],
      pageType: true
    };
    Session.set('inheritanceMain templateData', templateData);
  },
  // 컨텐츠상속 상세화면
  'click [name="inheritContent"]': function(e, t) {
    e.preventDefault();

    var self = this.data;

    Meteor.call('getPassAwayInfo', self.inheritorId , function(error, result){
      if(error){
        return console.log(error);
      } else {
        if(result){
          global.utilAlert('고인이된 사용자에게는 컨텐츠상속 설정을 할 수 없습니다.');
        } else {
          var templateData = {};
          // var pageType = false;
          // if (_.isEmpty(self.contents) && !self.isParentDataExist) {
          //   // 데이터가 없으면
          //   templateData.contentTmp = 'inheritanceContentsWrite';
          // } else {
          //   // 데이터가 있으면
          //   templateData.contentTmp = 'inheritanceContents';
          //   pageType = true;
          // }
          templateData.contentTmp = 'inheritanceContents';
          templateData.data = {
            _id: self._id,
            inheritorId: self.inheritorId,
            name: self.name,
            data: t.inheritorList.get(),
            pageType: true
          };
          Session.set('inheritanceMain templateData', templateData);
        }
      }
    });
  },
  //상속인 정보 수정(비회원 정보수정)
  "click #edit": function(e, t){
    e.preventDefault();

    var modalobj = {};

    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-md inheritance';
    modalobj.fade = false;    modalobj.backdrop = 'static';
    modalobj.data = {
      title : '친구정보 수정',
      parentViewId: Blaze.currentView.name,
      data : this
    };

    var inheritors = Template.instance().inheritorList.get();
    var usersId = [];

    var inheritorId = this.inheritorId;
    inheritors.map(function(inheritor){
      // console.log(inheritorId);
      if(!_.isEqual(inheritorId, inheritor.inheritorId.trim())){
        usersId.push(inheritor.inheritorId.trim());
      }
    });
    modalobj.data.preSelectedUsers = usersId;

    global.utilModalOpen(e, modalobj);

  },
  //지금상속(지금상속)
  "click #instInheritance": function(e, t){
    e.preventDefault();

    var _id = e.target.dataset.id;
    var inheritorId = e.target.getAttribute('inheritorId');
    var templateData = {};
    templateData.contentTmp = 'inheritanceInstant';
    templateData.data = {
      _id: _id,
      inheritorId: inheritorId,
      data: t.inheritorList.get()
    };
    Session.set('inheritanceMain templateData', templateData);
  },
  //상속엔딩노트
  // "click #endingNote": function(e, t){
  //   e.preventDefault();
  //
  //   Router.go('inheritanceTimeline');
  //   // window.open(global.siteUrl + '/inheritanceTimeline', '_blank');
  //
  //   // var templateData = {};
  //   // templateData.contentTmp = 'inheritanceContentsWrite';
  //   // templateData.data = {
  //   //   data: t.inheritorList.get()
  //   // };
  //   // Session.set('inheritanceMain templateData', templateData);
  // }
});

function upLoadeS3Image (imgInfo){
  var imgsInfo = [];
  if(_.isArray(imgInfo)){
    imgsInfo = imgInfo;
  } else {
    imgsInfo.push(imgInfo);
  }

  _.each(imgsInfo, function(item){
    // var extension = item.extension;
    // var newFileName = item.fileName +item.type + '.' + extension;
    var realPath = item.data.substring(item.data.indexOf("data"));//imagePath.substring(imagePath.indexOf("data"));

    var path = global.s3.folder.profile +'/' + item.fileName;
    var s3Bucket = new AWS.S3();

    buf = new Buffer(realPath.replace(/^data:image\/\w+;base64,/, ""),'base64');
    var data = {
      Bucket: S3.config.bucket,
      Key: path,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg'
    };
    //위에서 설정한 파일명과, 서버정보를 이용하여, DB에 데이터를 저장한다.
    s3Bucket.putObject(data, function(err, data){
      if (err) {
        console.log(err);
        console.log('Error uploading data: ', data);
      } else {
        console.log('succesfully uploaded the image!',data);
      }
    });
  });

  // return path;
}

//===============================================================================
Template.inheritorButtons.onRendered(function(){
  //툴팁 위치 정의
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template.inheritorButtons.helpers({
  hpIsInhDataExist: function(contents){
    var result = false;
    if(!_.isEmpty(contents)){
      result = true;
    }
    return result;
  },
  hpIsInhContentsExist: function(contents, isParentDataExist){
    var result = false;
    if(!_.isEmpty(contents) || isParentDataExist){
      result = true;
    }
    return result;
  }
});
