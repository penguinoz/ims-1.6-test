import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsCustomQna = new Mongo.Collection('imsCustomQna');

Meteor.methods({
  getQnaData:function(userId){
    return CLT.ImsCustomQna.find({userId:userId},{sort:{regDate:-1}}).fetch();
  },
  insertQna:function(_id, insertObj){
    return CLT.ImsCustomQna.upsert(
      {'_id':_id},
      {$set: insertObj,
       $setOnInsert: {'regDate': global.utilGetDate().default}
      }
    );
  },
  //답변 작성 및 수정
  upsertAnswer:function(_id, ansParam, images){
    return CLT.ImsCustomQna.update(
      {'_id':_id},
      {$set: {'answer':ansParam,
        'ansfile':images}
      }
    );
  },
  deleteQna:function( _id, userId){
    return CLT.ImsCustomQna.remove({userId:userId,_id:_id});
  },
  getSerchOpQna:function(type, _searchTxt){
    var regex = [];
    var searchText = _searchTxt ? _searchTxt.split(',') : [];
    var srchTextTemp = [];
    for (var t = 0; t < searchText.length; t++) {
      srchTextTemp.push(searchText[t].trim()); // 앞뒤 공백 제거
    }
    searchText = srchTextTemp;

    if(searchText[0]){
      for (var s = 0; s < searchText.length; s++) {
        var titleRegexStr = new RegExp(["^.*", searchText[s], ".*"].join(""), "gi");
        regex.push(titleRegexStr);
      }
    } else {
      var regexStr = new RegExp(["^.*.*"].join(""), "gi");
      regex.push(regexStr);
    }
    if(type === "title"){
      return CLT.ImsCustomQna.find({title:{$in:regex}},{sort:{regDate:-1}}).fetch();
    }else{
      return CLT.ImsCustomQna.find({$or:[{question:{$in:regex}},{answer:{$in:regex}}]},{sort:{regDate:-1}}).fetch();
    }
  }
});
