import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 나는 > 리스트 상세
var templateName = 'imDetail';
var dynamicTemplateData = {};


Template[templateName].onCreated(function(){
  Blaze._allowJavascriptUrls();
  var instance = this;
  instance.friendsStatus = new ReactiveVar();
  instance.comments = new ReactiveVar();
  var _id = null; // imContent의 글ID

  if(this.data){
    dynamicTemplateData = this.data;
    _id = dynamicTemplateData._id;
  }

  Session.set('imDetail collection', null);

  var openCountFlag = true;
  var subscription = instance.subscribe("story_id", _id);
  instance.autorun(function () {
    if(subscription.ready()){
      var im = {};
      im = CLT.EnStory.find({_id:_id}).fetch()[0];

      if (im) {
        var commentCount = CLT.ImsComment.find({postId: _id}).count();
        var likeList = CLT.ImsLike.find({postId: _id}).fetch();
        im.like = likeList;
        im.commentCount = commentCount;

        if (openCountFlag) {
          // 글의 조회수를 1 카운터한다
          var updateData = {
            open: im.open + 1
          };
          Meteor.call('storyUpsert', _id, updateData, function(error) {
            if (error) {
              return alert(error);
            }
          });
          openCountFlag = false;
        }

        //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
        Meteor.call('getNickAndImg', im.userId, function(error, result){
          if(error){
            console.log(error);
          } else {
            var userInfo = result[0];
            im.nickName  = userInfo.nickName;
            im.profileImg  = userInfo.profileImg;

            Session.set('imDetail collection', im);
          }
        });

      }
    }
  });
});

Template[templateName].onRendered(function(){
  // 에디터를 readonly 상태로 만들어 놓음
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].events({
  'click #btnToList' : function(e, t){
    e.preventDefault();

    var templateData = {};
    var getSessionData = Session.get('endingNoteList templateData');
    templateData.headerTmp = 'endingNoteListHeaderIm';
    templateData.contentTmp = 'imContent';
    if(getSessionData && getSessionData.data.lifeViewDataList){
      templateData.headerTmp = 'endingNoteListHeaderSearch';
      templateData.contentTmp = getSessionData.data.fromView;
      templateData.data = getSessionData.data.lifeViewDataList;
      if(getSessionData.data.lifeViewOriginData){
        templateData.data = getSessionData.data.lifeViewOriginData;
      }
      Session.set('endingNoteList templateData', templateData);
      return;
    }

    templateData.data = {
      selectedMenu : dynamicTemplateData.selectedMenu,
      searchOption : dynamicTemplateData.searchOption,
    };

    Session.set('endingNoteList templateData', templateData);
  },
  "click a[name='tagButton']" : function(e, t){
    e.preventDefault();
    var templateData = {};

    templateData.headerTmp = 'endingNoteListHeaderIm';
    templateData.contentTmp = 'imContent';
    var textVal = this.valueOf();
    if(textVal.indexOf("<strong>") !== -1 && textVal.indexOf("</strong>") !== -1){
      textVal = textVal.replace("<strong>","");
      textVal = textVal.replace("</strong>","");
    }
    templateData.data = {
      selectedMenu : 'all',
      searchOption :
      {
        filter:"tag",
        searchText:textVal,
        sortParam:"startDateDesc",
      }
    };
    Session.set('endingNoteList templateData', templateData);
  },
  //스토리 수정화면 이동t
  "click #imDetailEdit": function(e, t){
    e.preventDefault();
    var templateData = Session.get('endingNoteList templateData');
    templateData.contentTmp = 'imModification';
    Session.set('endingNoteList templateData', templateData);
  },
  //스토리 삭제
  "click #imDetailDelete": function(e, t){
    e.preventDefault();

    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
        var imDetailfotDel = Session.get('imDetail collection');
        if(global.fn_isExist(imDetailfotDel.images)){
          global.fn_DeleteS3Images(imDetailfotDel.images);
        }
        Meteor.call('storyDelete',imDetailfotDel._id, global.login.userId, function(error) {
          if (error) {
            return alert(error);
          } else {
            Meteor.call('enTimelineDaleteBuketStory', imDetailfotDel._id, imDetailfotDel.postId, function(error) {
              if (error) {
                return alert(error);
              } else {
                var templateData = {};
                templateData.headerTmp = 'endingNoteListHeaderIm';
                templateData.contentTmp = 'imContent';
                Session.set('endingNoteList templateData', templateData);
              }
            });
          }
        });
      }
    }).catch(swal.noop);
  },
  // 좋아요 유저리스트
  "click #btnLikeList": function(e, t) {
    e.preventDefault();
    var postId = e.target.getAttribute('postId');
    Session.set('endingNoteLikeList postId', postId);
  },
  "click .dropdown-toggle" : function(e, t){
    // console.log('dropdown-toggle click', global.login.userId, e.target.getAttribute('value'));
    // Meteor.call('getFriendRequestStatus', global.login.userId, e.currentTarget.id, function(error, result){
    Meteor.call('getFriendRequestStatus', global.login.userId, global.login.pageOwner, function(error, result){
      if(error){
        console.log(error);
      } else {
        t.friendsStatus.set(result);
        // Session.set('imContent friendsStatus', result);
      }
    });
  },
  "click [name=froalaEditor] img": function(e, t){
    e.preventDefault();
    $(e.currentTarget).colorbox({
      href : e.currentTarget.src,
      maxWidth : '80%',
      maxHeight : '80%',
      opacity : 0.8,
      transition : 'elastic',
      current : ''
    });
  },
  "click #moveBucketBt" : function(e, t){
    e.preventDefault();
    // var _id = e.target.getAttribute('value');
    var _id = this._id;
    if(!_id){
      _id = e.target.getAttribute('value');
    }

    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderBucketList';
    templateData.contentTmp = 'bucketDetail';
    templateData.data = {
      _id : _id,
      fromView : 'imdetail'
    };

    Session.set('endingNoteList templateData', templateData);
  }
});

Template[templateName].helpers({
  hpCollection: function() {
    if (Session.get('imDetail collection')) {
      return Session.get('imDetail collection');
    }
  },
  hpLikeFlag: function(likeList) {
    var flag = false;
    if (likeList) {
      if (_.findWhere(likeList, {userId:global.login.userId})) {
        // 현재 글에서 좋아요를 했는지 않했는지 체크
        flag = true;
      }
    }
    return flag;
  },
  hpGetContext: function () {
    if (Session.get('imDetail collection')) {
      // $('.panel-body').froalaEditor('edit.off');

      return {
        key: global.editorSettings.key,
        _value: Session.get('imDetail collection').content,
        toolbarInline: true,
        // imageResize: false,
        // imageUploadToS3: global.editorSettings.imageUploadToS3,
        placeholderText: null,
        // initOnClick: false,
        charCounterCount: false,
        pluginsEnabled: ['image','codeView','fontSize'],
        // dragInline: false,
        // imageMove: false,
        "_oninitialized": function(e, editior){
          Template.instance().$('div.froala-reactive-meteorized').froalaEditor('edit.off');
        }
      };
    }
  },
  hpisFromPopup: function(){
    var fromView = "";
    if(dynamicTemplateData.parentViewId){
      fromView = dynamicTemplateData.parentViewId;
      fromView = fromView.replace("Template.","");
    }
    if(dynamicTemplateData && dynamicTemplateData.unableGoList){
      //상속화면 접근시
      return false;
    }else{
      return true;
    }
  },
  hpBucketStoryCategory: function(postId) {
    if (postId) {
      var obj = {
        _id: postId
      };
      var result = ReactiveMethod.call('bucketTimelineGetList', obj);
      if (result) {
        return result[0];
      }
    }
  },
  hpFriendStatus: function() {
    return Template.instance().friendsStatus.get();
    // return Session.get('imContent friendsStatus');
  }
});

function commentUpsert(objData, _id, message) {
  Meteor.call('commentUpsert', objData, _id, function(error) {
    if (error) {
      return alert(error);
    } else {
      Session.set('imDetail cmtUpdate', null);
      alert(message);
    }
  });
}
