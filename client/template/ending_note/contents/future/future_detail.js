import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 나는 > 리스트 상세
var templateName = 'futureDetail';
var dynamicTemplateData = {};


Template[templateName].onCreated(function(){
  var instance = this;
  this.collection = new ReactiveVar();
  var openCountFlag = true;
  var _id = null; // imContent의 글ID

  if(this.data){
    dynamicTemplateData =  this.data;
    _id = dynamicTemplateData._id;
  }

  instance.autorun(function(){
    var subscription = instance.subscribe("futureStory_id", _id);

    if (subscription.ready()) {
      var futureStory = {};
      futureStory = CLT.EnFutureStory.find().fetch()[0];
      if (futureStory) {
        var comments = CLT.ImsComment.find({postId: _id}, {sort: {regDate: -1}}).fetch();
        var likeList = CLT.ImsLike.find({postId: _id}).fetch();
        futureStory.comments = comments;
        futureStory.like = likeList;

        if (openCountFlag) {
          // 글의 조회수를 1 카운터한다
          var updateData = {
            open: futureStory.open + 1
          };
          Meteor.call('futureStoryUpsert', _id, updateData, function(error) {
            if (error) {
              return alert(error);
            }
          });
          openCountFlag = false;
        }
        instance.collection.set(futureStory);
        Session.set('endingNoteComment collection', futureStory);
      }
    }
  });
});

Template[templateName].onRendered(function(){
// 에디터를 readonly 상태로 만들어 놓음
  this.$('.fr-view').attr('contenteditable','false');
  global.fn_customerScrollBarInit(this.$('.hr-scroll'), "dark");
});

Template[templateName].events({
  'click #btnToList' : function(e, t){
    e.preventDefault();

    var templateData = {};
    templateData.headerTmp = 'endingNoteListHeaderFuture';
    templateData.contentTmp = 'futureContent';
    templateData.data = {
      searchOption : dynamicTemplateData.searchOption
    };

    Session.set('endingNoteList templateData', templateData);
  },
  // //스토리 수정화면 이동t
  // "click #imDetailEdit": function(e, t){
  //   e.preventDefault();
  //   var templateData = Session.get('endingNoteList templateData');
  //   templateData.contentTmp = 'imModification';
  //   Session.set('endingNoteList templateData', templateData);
  // },
  // //스토리 삭제
  // "click #imDetailDelete": function(e, t){
  //   e.preventDefault();
  //   var conf = confirm("삭제 하시겠습니까??");
  //   if(conf === true){
  //     //함수호출 (S3에서 image삭제하는 함수)
  //     var bucketName = S3.config.bucket;
  //     AWS.config.region = S3.config.region;
  //     AWS.config.update({
  //       accessKeyId: S3.config.key,
  //       secretAccessKey: S3.config.secret
  //     });
  //     var imDetailfotDel = Session.get('imDetail collection');
  //     if(imDetailfotDel.image !== undefined){
  //       var urlPreText = global.s3.bucketPath;
  //       for(var i = 0 ; i < imDetailfotDel.image.length ; i++){
  //         var enUrl = imDetailfotDel.image[i].replace(/\+/gi, ' '); // '+' to ' '(space)
  //         var decodeUrl = decodeURIComponent(enUrl);  //url decode  예) console.log('decode', decodeURIComponent($(img[0]).attr("src")));
  //         var path = decodeUrl.replace(urlPreText,''); //decodeUrl; //bucketName/ 이후부터 잘라서 넣는부분
  //
  //         var params = {
  //           Bucket: bucketName,
  //           Key: path
  //         };
  //
  //         var bucket = new AWS.S3();
  //         bucket.deleteObject(params, function (err, data) {
  //           if (err) {
  //             console.log("Check if you have sufficient permissions : "+err);
  //           } else {
  //             console.log("File deleted successfully");
  //           }
  //         });
  //       }
  //     }
  //
  //     Meteor.call('futureStoryDelete',imDetailfotDel._id, function(error) {
  //       if (error) {
  //         return alert(error);
  //       } else {
  //         var templateData = {};
  //         templateData.headerTmp = 'endingNoteListHeaderIm';
  //         templateData.contentTmp = 'futureContent';
  //         Session.set('endingNoteList templateData', templateData);
  //       }
  //
  //     });
  //
  //   }
  // },
  // 좋아요 유저리스트
  "click #btnLikeList": function(e, t) {
    e.preventDefault();
    var postId = e.target.getAttribute('postId');
    Session.set('endingNoteLikeList postId', postId);
  }
});

Template[templateName].helpers({
  hpCollection: function() {
    return Template.instance().collection.get();
  },
  hpLikeFlag: function(likeList) {
    var flag = false;
    if (_.findWhere(likeList, {userId:global.login.userId})) {
      // 현재 글에서 좋아요를 했는지 않했는지 체크
      flag = true;
    }

    return flag;
  },
  hpGetContext: function () {
    if (Template.instance().collection.get()) {
      return {
        key: global.editorSettings.key,
        _value: Template.instance().collection.get().content,
        toolbarInline: true,
        // imageResize: false,
        // imageUploadToS3: global.editorSettings.imageUploadToS3,
        placeholderText: null,
        initOnClick: false,
        charCounterCount: false,
        pluginsEnabled: ['image','codeView','fontSize','link','url'],
        dragInline: false,
        imageMove: false,
        "_onmousedown": function (e, editor, img) {

          $('.fr-view').attr('contenteditable','false');
        }, //end _onmousedown
        "_onclick": function (e, editor, img) {
          // console.log(e, editor, img);
          if(img.target.src){
            // console.log('이미지 확대 보기');
            $(img.target).colorbox({
              href:img.target.src,
              maxWidth : '80%',
              maxHeight : '80%',
              opacity : 0.8,
              transition : 'elastic',
              current : ''
            });
          }
        }, //end _onclick
      };
    }
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

Template[templateName].onDestroyed(function(){
  Session.set('endingNoteComment collection',null);
});
