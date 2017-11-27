import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnHistory = new Mongo.Collection('endingNoteHistory');

Meteor.methods({
  enHistoryFind: function(obj) {
    return CLT.EnHistory.find(obj, {sort: {regDate: -1}}).fetch()[0];
  },
  historyGetList: function(obj) {
    return CLT.EnHistory.find(obj, {sort: {regDate: -1}}).fetch();
  },
  enHistoryInsert: function(postId, obj) {
    CLT.EnHistory.insert(obj);
  },
  enHistoryUpsert: function(_id, obj) {
    CLT.EnHistory.upsert(
      {_id: _id},
      {$set: obj,
        // $setOnInsert: {'regDate': global.utilGetDate().default}
        $setOnInsert: {'regDate': global.utilGetDate().default}
      }
    );
  },
  enHistoryUpdate: function(postId, obj) {
    CLT.EnHistory.update(
      {postId: postId},
      {$set : obj}
    );
  },
  enHistoryDelete: function(postId, obj) {
    CLT.EnHistory.remove(obj);
  },
  // 추억 -> 버킷리스트 이동
  enHistoryMoveBucket: function(postId, obj) {
    // history WR type변경
    CLT.EnHistory.update(
      {postId: postId, type: 'WR'},
      {$set: {postType: 'BS'}}
    );
    // history이동
    CLT.EnHistory.update(
      {postId: postId},
      {$set : obj},
      {multi: true}
    );
    // 타임라인 히스토리 삭제
    CLT.EnTimeline.remove(
      {postId: postId, contentType: 'H'}
    );
  },
  // 버킷스토리 -> 추억이동 타임라인변경
  enHistoryMoveStoryTimeline: function(postId, postIdParam, timelineObj) {
    // history WR type변경
    CLT.EnHistory.update(
      {postId: postIdParam, typeKey: postId, userId: timelineObj.userId, type: 'WR'},
      {$set: {postType: 'IM'}}
    );
    // 타임라인 히스토리 생성
    CLT.EnTimeline.insert(timelineObj);
  },
  // 버킷스토리 -> 추억이동 히스토리 변경
  enHistoryMoveStoryHistory: function(postId, postIdParam, historyObj) {
    // 히스토리 이동
    CLT.EnHistory.update(
      {typeKey: postId, userId: historyObj.userId},
      {$set: historyObj},
      {multi: true}
    );
    // 타임라인 히스토리 변경
    CLT.EnTimeline.update(
      {postId: postId, contentType: 'E'},
      {$set: {type: 'IM'}, }
    );
  }
});