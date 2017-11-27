import {collections as CLT} from '/imports/global/collections.js';
// CLT.ImsNotice = new Mongo.Collection('imsNotice');

Meteor.methods({
//전체조회
getNoticeData:function(){
  return CLT.ImsNotice.find({},{sort:{regDate:-1}}).fetch();
},
getNoticeById:function(_contentId){
  return CLT.ImsNotice.findOne({_id:_contentId});
},
// 검색조건 검색
getSerchOpNotice:function(type, _searchTxt){
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
    return CLT.ImsNotice.find({title:{$in:regex}},{sort:{regDate:-1}}).fetch();
  }else{
    return CLT.ImsNotice.find({content:{$in:regex}},{sort:{regDate:-1}}).fetch();
  }
},
upsertNotice:function(_id,insertObj){

  return CLT.ImsNotice.upsert(
    {'_id':_id},
    {$set: insertObj}
  );
},

deleteNotice:function(_id,userId){
  CLT.ImsNotice.remove({'_id':_id, 'userId':userId});
}

});
