import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';

if(Meteor.isServer){
  Meteor.methods({
    getExpectYear : function(nowYear){
      return CLT.collectionExDay.findOne({ 'exNowYear':nowYear});
    }
  });

}
