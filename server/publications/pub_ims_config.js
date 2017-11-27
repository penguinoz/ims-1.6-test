import {collections as CLT} from '/imports/global/collections.js';

//코드성 데이터를 Publication함

// ex) 코드 데이터
// Meteor.publish('code', function() {
//   return Code.find();
// });


Meteor.publish('pubCodeOption', function() {
  return CLT.ImsCodeOption.find();
});