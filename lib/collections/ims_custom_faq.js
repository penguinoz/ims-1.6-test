import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsCustomFaq = new Mongo.Collection('imsCustomFaq');

Meteor.methods({
  getFaqData:function(){
    return CLT.ImsCustomFaq.find({},{sort:{regDate:-1}}).fetch();
  },
  getSerchOpFaq:function(type, _searchTxt){
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
      return CLT.ImsCustomFaq.find({title:{$in:regex}},{sort:{regDate:-1}}).fetch();
    }else if(type === "category"){
      return CLT.ImsCustomFaq.find({category:{$in:regex}},{sort:{regDate:-1}}).fetch();
    }else{
      return CLT.ImsCustomFaq.find({$or:[{question:{$in:regex}},{answer:{$in:regex}}]},{sort:{regDate:-1}}).fetch();
    }
  },
  upsertFaq:function(_id, insertObj){
    return CLT.ImsCustomFaq.upsert(
      {'_id':_id},
      {$set: insertObj}
    );
  },
  deleteFaq:function(_id, userId){
    CLT.ImsCustomFaq.remove({'_id':_id, 'userId':userId});
  }
});
