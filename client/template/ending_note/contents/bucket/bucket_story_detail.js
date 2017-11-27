import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 나는 > 리스트 상세
var templateName = 'bucketStoryDetail';
var dynamicTemplateData = {};


Template[templateName].onCreated(function(){
  var instance = this;
  instance.isDropup = new ReactiveVar();
  var _id = null; // imContent의 글ID

  if(instance.data){
     _id = Session.get('bucketStory templateList').data.bucketStoryId;
    dynamicTemplateData = instance.data;
  }
  var openCountFlag = true;
  instance.autorun(function(){
    var subscription = instance.subscribe("story_id", _id);

    if (subscription.ready()) {
      var bucketStory = {};
      bucketStory = CLT.EnStory.find({_id: _id}).fetch()[0];
      if (bucketStory) {
        var commentCount = CLT.ImsComment.find({postId: _id,replyKey: ""}).count();
        var like = CLT.ImsLike.find({postId: _id}).fetch();

        bucketStory.commentCount = commentCount;
        bucketStory.like = like;
        bucketStory.groupUsers = dynamicTemplateData.groupUsers ? dynamicTemplateData.groupUsers : null;
        bucketStory.bucketListUserId = dynamicTemplateData.bucketListUserId;

        if (openCountFlag) {
          // 글의 조회수를 1 카운터한다
          var updateData = {
            open: bucketStory.open + 1
          };
          Meteor.call('storyUpsert', _id, updateData, function(error) {
            if (error) {
              return alert(error);
            }
          });
          openCountFlag = false;
        }


        Meteor.call('getNickAndImg', bucketStory.userId, function(error, result){
          if(error){
            console.log(error);
          } else {
            var userInfo = result[0];

            bucketStory.nickName = userInfo.nickName;
            bucketStory.profileImg = userInfo.profileImg;

            Session.set('bucketStoryDetail collection', bucketStory);
          }
        });

      }
    }
  });
});

Template[templateName].onRendered(function(){
// 에디터를 readonly 상태로 만들어 놓음
  this.$('.fr-view').attr('contenteditable','false');
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].onDestroyed(function(){
  Session.set('bucketStoryDetail collection', null);
});

Template[templateName].events({
  // 'click #btnToList' : function(e, t){
  //   e.preventDefault();
  //
  //   var templateData = {};
  //
  //   templateData.headerTmp = 'endingNoteListHeaderIm';
  //   templateData.contentTmp = 'imContent';
  //
  //   templateData.data = {
  //     selectedMenu : dynamicTemplateData.selectedMenu,
  //     searchOption : dynamicTemplateData.searchOption,
  //   };
  //
  //   Session.set('bucketStory templateList', templateData);
  // },
  //스토리 수정화면 이동t
  "click #bucketStoryEdit": function(e, t){
    e.preventDefault();
    var passData = Session.get('bucketStoryDetail collection');
    var modalobj = {};
    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'imsr-pop modal-md bucket';
    modalobj.fade = false;      modalobj.backdrop = 'static';
    modalobj.data = {
      _id : passData._id,
      title : passData.title,
      lock : passData.lock,
      startDate : passData.startDate,
      images : passData.images,
      content : passData.content,
      tagList : passData.tagList,
      postId : passData.postId,
    };
    global.utilModalOpen(e, modalobj);
  },
  //스토리 삭제
  "click #bucketStoryDelete": function(e, t){
    e.preventDefault();
    global.utilConfirm("삭제 하시겠습니까??\r\n 삭제된 버키스토리는 추억으로 이동합니다.").then(function(val) {
      if (val) {
        var imDetailforDel = Session.get('bucketStoryDetail collection');

        var bucketStoryId = imDetailforDel._id;
        var bucketStoryTitle = imDetailforDel.title;
        Meteor.call('moveStory', global.login.userId, bucketStoryId, null, global.pageType.im, function(error){
          if(error) {
            console.log('moveStory_error', error);
          } else {
            var historyObj = {
              postId: bucketStoryId,
              userId: global.login.userId
            };
            var timelineObj = {
              postId: bucketStoryId,
              userId: global.login.userId,
              timeClass: 'start',
              contentType: 'H',
              type: 'IM',
              sort: 2,
              timelineDate: global.utilGetDate(imDetailforDel.memoryDay).defaultYMD,
              updateDate: global.utilGetDate().default,
              regDate: global.utilGetDate().default,
            };
            // 버킷->스토리 이동
            global.utilMoveStory(bucketStoryId, dynamicTemplateData.bucketListKey, timelineObj, historyObj, bucketStoryTitle);

            var groupUsers = dynamicTemplateData.groupUsers;
            if ( groupUsers && groupUsers.length !== 0) {
              // 스토리가 삭제시 다른그룹원의 히스토리는 삭제한다
              // groupUsers.unshift(dynamicTemplateData.bucketListUserId); // 버킷글작성자추가
              // groupUsers = _.without(groupUsers, global.login.userId); // 글삭제자는 제외시킴
              var deleteHistoryObj = {
                postId: dynamicTemplateData.bucketListKey,
                typeKey: bucketStoryId,
                postType: 'BS',
                type: 'WR',
                $or: [{userId: global.login.userId}, {user: global.login.userId}]
              };
              // groupUsers.map(function(item) {
              //   deleteHistoryObj.userId = item;
              //   global.utilHistoryDelete(deleteHistoryObj);
              // });
              global.utilHistoryDelete(deleteHistoryObj);
            }
            var templateData = {};
            templateData.template = 'bucketStoryContent';
            templateData.data = {
              _id: dynamicTemplateData.bucketListKey
            };
            Session.set('bucketStory templateList', templateData);
            Session.set('bucketDetail hpUseGolistButton', false);
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
  //사용자 프로파일 클릭
  "click .dropdown-toggle" : function(e, t){
    var nameCardHeight = 370;// 네임카드의 높이
    if((nameCardHeight + $(e.currentTarget).offset().top) > window.innerHeight){
      t.isDropup.set(true);
    } else {
      t.isDropup.set(false);
    }
  }
});

Template[templateName].helpers({
  hpCollection: function() {
    if (Session.get('bucketStoryDetail collection')) {
      return Session.get('bucketStoryDetail collection');
    }
  },
  likeFlag: function(likeList) {
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
    if (Session.get('bucketStoryDetail collection')) {
      return {
        key: global.editorSettings.key,
        _value: Session.get('bucketStoryDetail collection').content,
        toolbarInline: true,
        imageUploadToS3: global.editorSettings.imageUploadToS3,
        placeholderText: null,
        // imageResize: false,
        // initOnClick: false,
        // dragInline: false,
        // imageMove: false,
        charCounterCount: false,
        pluginsEnabled: ['image','codeView','fontSize','link','url'],


        "_oninitialized": function(e, editior){
          Template.instance().$('div.froala-reactive-meteorized').froalaEditor('edit.off');
        },
        // "_onclick": function (e, editor, img) {
        //   // console.log(e, editor, img);
        //   if(img.target.src){
        //     // console.log('이미지 확대 보기');
        //     $(img.target).colorbox({
        //       href:img.target.src,
        //       maxWidth : '80%',
        //       maxHeight : '80%',
        //       opacity : 0.8,
        //       transition : 'elastic',
        //       current : ''
        //     });
        //   }
        // }, //end _onclick
      };
    }
  },
  hpisDropup: function(){
  if(Template.instance().isDropup.get()){
    return 'dropup';
  } else {
    return '';
  }
}

});

function commentUpsert(objData, _id, message) {
  Meteor.call('commentUpsert', objData, _id, function(error) {
    if (error) {
      return alert(error);
    } else {
      Session.set('bucketStoryDetail cmtUpdate', null);
      alert(message);
    }
  });
}
