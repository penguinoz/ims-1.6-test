import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsLog = new Mongo.Collection("imsLog");

Meteor.methods({
  getLog: function(_postId){
    var result = CLT.ImsLog.find({postId:_postId},{sort:{regDate:-1}}).fetch();
    _.each(result, function(item){
      if(item && item.subPostId && item.type === 'BL'){
        var bsTitle = CLT.EnStory.findOne({_id:item.subPostId},{fields:{title:1}});
        if(bsTitle){
          item.title = bsTitle.title;
        }
      }
    });
    return result;
  },
  setLog: function(postId, subPostId, userId, contextUserId, type, logContext, logType, title){
    CLT.ImsLog.insert({
      postId:postId,
      subPostId:subPostId,
      userId:userId,
      contextUserId:contextUserId,
      type:type,
      logType:logType,
      // context:logContext,
      regDate:global.utilGetDate().default,
      // title: title
    });
  },
  //비유져 수정 로그insert
  setModifyNonUserLog : function(userId ,editData, originData){
    CLT.ImsLog.insert({
      userId : userId,
      type : 'CHNM',
      oriName : originData.name,
      oriEmail : originData.eMail,
      newName : editData.name,
      newEmail : editData.eMail,
      regDate:global.utilGetDate().default,
    });
  },
  deleteLog: function(userId, postId, subPostId, pageType, logType){
    if(!userId && !postId && !pageType && !logType){ //Meteor.call('deleteLog', null, postId, subPost, null, null); 호출
      CLT.ImsLog.remove({
        subPostId : subPostId
      });
    } else {
      CLT.ImsLog.remove({
        userId : userId,
        postId : postId,
        type : pageType,
        logType : logType
      });
    }
  }
});
