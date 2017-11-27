// Meteor.publish('timeline_main', function(userId, userArray, standardDate, type, limit) {
//   if (type === 'ALL') {
//     type = /^/;
//   }
//   var friendsDate = global.fn_getCalDate(standardDate, 1, 'SUM');
//   friendsDate = global.utilGetDate(friendsDate).defaultYMD;
//   var data = CLT.EnTimeline.find(
//     {
//       userId: {$in: userArray}, type: type, contentType: 'E',
//       // 친구데이터는 타임라인날짜에서 등록일짜로 바꾸기때문에 제외 시킨다
//       $or: [
//         {userId: userId, timelineDate: {$lte: standardDate, $ne: ''}},
//         {userId: {$ne: userId}, timelineDate: {$lte: standardDate, $ne: ''}, regDate: {$lte: friendsDate, $ne: ''}}
//       ]
//     },
//     {sort: {timelineDate: -1, regDate: -1}, limit: limit}
//   );
//
//   // 해당 날짜에 데이터가 없으면 선택한 날짜 기준으로 데이터가 있는 최신날짜를 가져온다
//   if (data.count() === 0) {
//     var myFristDay = null;
//     var frFristDay = null;
//     var getDate = null;
//     var myData = CLT.EnTimeline.find(
//       {
//         userId: userId, timelineDate: {$gte: standardDate}, type: type, contentType: 'E',
//       },
//       {sort: {timelineDate: 1}, limit: 1}
//     );
//     if (myData.count() !== 0) {
//       myFristDay = myData.map(function(item) {
//         return global.utilGetDate(item.timelineDate).defaultYMD;
//       });
//     }
//     var frData = CLT.EnTimeline.find(
//       {
//         userId: {$in: userArray}, regDate: {$gte: standardDate}, type: type, contentType: 'E',
//       },
//       {sort: {regDate: 1}, limit: 1}
//     );
//     if (frData.count() !== 0) {
//       frFristDay = frData.map(function(item) {
//         return global.utilGetDate(item.regDate).defaultYMD;
//       });
//     }
//     if (myFristDay.toString() < frFristDay.toString()) {
//       getDate = myFristDay.toString();
//     } else {
//       getDate = frFristDay.toString();
//     }
//     if (myFristDay === null) getDate = frFristDay.toString();
//     if (frFristDay === null) getDate = myFristDay.toString();
//
//     friendsDate = global.fn_getCalDate(getDate, 1, 'SUM');
//     friendsDate = global.utilGetDate(friendsDate).defaultYMD;
//     data = CLT.EnTimeline.find(
//       {
//         userId: {$in: userArray}, type: type, contentType: 'E',
//         // 친구데이터는 타임라인날짜에서 등록일짜로 바꾸기때문에 제외 시킨다
//         $or: [
//           {userId: userId, timelineDate: {$lte: getDate, $ne: ''}},
//           {userId: {$ne: userId}, timelineDate: {$lte: getDate, $ne: ''}, regDate: {$lte: friendsDate, $ne: ''}}
//         ]
//       },
//       {sort: {timelineDate: -1, regDate: -1}, limit: limit}
//     );
//   }
//   return data;
// });
//
//
// Meteor.publish('timeline_id_upward', function(userArray, filter, isFutureSelected, topLimit, standardDate, callIndex) {
//   var maxDate = new Date(standardDate);
//   var dayOfMonth = maxDate.getDate();
//   maxDate.setDate(dayOfMonth + topLimit);
//   maxDate = global.utilGetDate(maxDate.toISOString()).defaultYMD;
//
//   var range ={};
//   if(isFutureSelected){
//     range = {$gt:standardDate, $lte:maxDate};
//   } else {
//     if(standardDate === global.utilGetDate().defaultYMD){
//       range = standardDate;
//     } else if(standardDate > global.utilGetDate().defaultYMD){
//       range = {$gt:standardDate, $lte:maxDate};
//     } else {
//       if(maxDate > standardDate){
//         range = {$gt:global.utilGetDate().defaultYMD, $lte:standardDate};
//       } else {
//         range = {$gt:global.utilGetDate().defaultYMD, $lte:maxDate};
//       }
//     }
//   }
//
//   //일자정보 가져오기
//   var getDistinctDate = _.uniq(CLT.EnTimeline.find(
//     {userId: {$in: userArray}, timelineDate: range},
//     {sort: {timelineDate: 1}, fields: {timelineDate: true}
//   }).fetch().map(function(x) {
//     return x.timelineDate;
//   }), true);
//
//   // console.log('g',getDistinctDate);
//   // getDistinctDate =_.first(getDistinctDate, topLimit);
//
//   //필터를 통해 데이터 구분조건 설정
//   var filterValue={};
//   switch(filter) {
//     case 'fAll':
//     filterValue = /^/;
//     break;
//     case 'fIm':
//     filterValue = {$in: [global.pageType.im, global.pageType.lifeTrace]};
//     break;
//     case 'fBucket':
//     filterValue = {$in: [global.pageType.bucketList, global.pageType.bucketStory, global.pageType.bucketPlan]};
//     break;
//     case 'fTime':
//     filterValue = global.pageType.timeCapsule;
//     break;
//   }
//
//   return CLT.EnTimeline.find(
//     {userId: {$in: userArray}, timelineDate:{$in: getDistinctDate}, 'type':filterValue},
//     {sort: {timelineDate: 1}}
//   );
// });
//
// Meteor.publish('timeline_id_downward', function(_userId, _userArray, _filter, bottomLimit, _standardDate, callIndex) {
//   var getDistinctDate = [];
//   var filterValue={};
//
//
//   switch(_filter) {
//     case 'fAll':
//     filterValue = /^/;
//     break;
//     case 'fIm':
//     filterValue = {$in: [global.pageType.im, global.pageType.lifeTrace]};
//     break;
//     case 'fBucket':
//     filterValue = {$in: [global.pageType.bucketList, global.pageType.bucketStory, global.pageType.bucketPlan]};
//     break;
//     case 'fTime':
//     filterValue = global.pageType.timeCapsule;
//     break;
//   }
//
//   var standardDate = new Date(_standardDate).toISOString();
//   var limitDate = global.fn_getCalDate(standardDate,bottomLimit,'SUB');
//   var standardChangeDate = global.fn_getCalDate(standardDate,1,'SUM'); //등록일시와의 비교를 위해 기본일자에 하루를 더한다.
//   limitDate = global.utilGetDate(limitDate).defaultYMD;
//
//   //친구정보 limit걸어서 가져오기
//   var friendsTimeLine = CLT.EnTimeline.find(
//     {
//       $and:[
//         {
//           userId: {$in: _userArray},
//           $and:[
//             {type: {$ne: 'FT'}},
//             {type : filterValue}
//           ]
//
//         },
//         {
//           $or:[
//             {$and:[
//               {'userId':{$ne:_userId}},
//               {'regDate':{$lte:standardChangeDate}},
//               {'regDate':{$gt:global.utilGetDate().defaultYMD}}
//             ]},
//           ]
//         }
//       ]
//     },{fields:{postId:1}}
//   ).fetch();
//
//   //내정보 limit걸어서 가져오기
//   //(리미트 걸어서 5개만 가져오도록 수정해야함)
//   var myTimeLine = CLT.EnTimeline.find(
//     {
//       $and:[
//         {
//           $and:[
//             {userId: {$in: _userArray}},
//             {type: {$ne: 'FT'}},
//             {type : filterValue},
//             {contentType : 'E'}
//           ]
//         },
//         {
//           $or:[
//             {$and:[
//               {'userId':_userId},
//               {'timelineDate':{$lte:standardDate}},
//             ]}
//           ]
//         }
//       ]
//     },{sort: {timelineDate: -1}, fields:{postId:1}, limit:bottomLimit}
//   ).fetch();
//
//   //두가지 정보 union해서 postId만 가지고 timeLine 재 검색 return
//   var postIds = _.chain(friendsTimeLine).union(myTimeLine).pluck('postId').uniq().value();
//   return CLT.EnTimeline.find({postId:{$in:postIds}});
//
//
//
//   // console.log('userid:',_userId, 'standardDate:',standardDate, 'limitDtate:',limitDate, 'standardChangeDate:',standardChangeDate);
//   // return CLT.EnTimeline.find(
//   //   {
//   //     $and:[
//   //       {
//   //         userId: {$in: _userArray},
//   //         $and:[
//   //           {type: {$ne: 'FT'}},
//   //           {type : filterValue}
//   //         ]
//   //
//   //       },
//   //       {
//   //         $or:[
//   //           {$and:[
//   //             {'userId':_userId},
//   //             {'timelineDate':{$lte:standardDate}},
//   //             {'timelineDate':{$gt:limitDate}}
//   //           ]},
//   //           {$and:[
//   //             // {'regDate':{$lte:standardChangeDate}},
//   //             // {'timelineDate':{$gt:global.utilGetDate().defaultYMD}}
//   //             {'userId':{$ne:_userId}},
//   //             {'regDate':{$lte:standardChangeDate}},
//   //             {'regDate':{$gt:global.utilGetDate().defaultYMD}}
//   //           ]},
//   //           {$and:[
//   //             {'userId':_userId},
//   //             {'userId':_userId},
//   //           ]}
//   //         ]
//   //       }
//   //     ]
//   //   }
//     // ,
//     // {sort: {timelineDate: -1}, fields: {timelineDate: 1}}
//   // );
//   // .fetch().map(function(x) {
//   //   return x.postId;
//   // }), true);
//
//   // getDistinctDate =_.first(getDistinctDate, bottomLimit);
//   // return CLT.EnTimeline.find(
//   //   {userId: {$in: userArray}, timelineDate:{$in: getDistinctDate}, 'type':filterValue},
//   //   {sort: {timelineDate: -1}}
//   // );
// });