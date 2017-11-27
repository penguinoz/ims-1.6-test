import {collections as CLT} from '/imports/global/collections.js';

Meteor.methods({
  getBucketBatchData: function() {
    if(Meteor.isServer){
      return CLT.BucketChart.find({},{sort : {'regDate': -1}, limit:1}).fetch();
    }
  },
});
