import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';
// CLT.EnImLifeTrace = new Mongo.Collection('endingNoteImLifeTrace');

Meteor.methods({
  lifeFindList: function(userId) {
    return CLT.EnImLifeTrace.find({userId: userId}).fetch();
  },
  lifeTraceUpsert: function(id, data){
    return CLT.EnImLifeTrace.upsert(
      {'_id': data._id},
      {$set: {address : data.address,
              title : data.title,
              lat : data.lat ,
              lng : data.lng,
              userId : data.userId,
              fromDate : data.fromDate,
              toDate : data.toDate,
              updateDate: global.utilGetDate().default,
              type : data.type,
              lock : true
            },
        //$setOnInsert: {'regDate': global.utilGetDate().default}
        $setOnInsert: {'regDate': global.utilGetDate().default}
      }
    );
    // CLT.EnImLifeTrace.update(
    //   { _id: 1 },
    //   {
    //      $set: { item: "apple" },
    //      $setOnInsert: { defaultQty: 100 }
    //   },
    //   { upsert: true }
    // },

  },
  lifeTraceDelete: function( _id ){
    CLT.EnImLifeTrace.remove(_id);
  }
});
