import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';
// CLT.EnFutureStory.remove({});
// if (CLT.EnFutureStory.find().count() === 0) {
//   for(var i=0; i <100; i++)
//   {
//     CLT.EnFutureStory.insert({
//       userId: 'admin',
//       open: 0,
//       title: '과거 이벤트' + i,
//       content: '<p>테스트</p>',
//       like:[],
//       startDate: global.utilGetDate('2015-05-01 01:01:01').default,
//       images:[],
//       tagList:['독서', '카드','수영'],
//       updateDate: global.utilGetDate('2015-05-01 01:01:01').default,
//       lock: false,
//       regDate: global.utilGetDate('2015-05-01 01:01:01').default,
//     });
//   }
//
//   for(var j=0; j <100; j++)
//   {
//     CLT.EnFutureStory.insert({
//       userId: '1',
//       open: 0,
//       title: '미래 이벤트' + j,
//       content: '<p>테스트</p>',
//       like:[],
//       startDate: global.utilGetDate('2017-07-07 07:07:07').default,
//       images:[],
//       tagList:['독서', '카드','수영'],
//       updateDate: global.utilGetDate('2017-07-07 07:07:07').default,
//       lock: false,
//       regDate: global.utilGetDate('2017-07-07 07:07:07').default,
//     });
//   }
// }

//고객센터 샘플데이터 추가
// CLT.ImsNotice.insert({title:"공지사항 제목 1",content:"공지사항 1번 내용 공지사항 1번 내용 공지사항 1번 내용 공지사항 1번 내용",file:[],regDate:global.utilGetDate().default});
// CLT.ImsNotice.insert({title:"공지사항 제목 2",content:"공지사항 2번 내용 공지사항 2번 내용 공지사항 2번 내용 공지사항 2번 내용",file:[],regDate:global.utilGetDate().default});
// CLT.ImsNotice.insert({title:"공지사항 제목 3",content:"공지사항 3번 내용 공지사항 3번 내용 공지사항 3번 내용 공지사항 3번 내용",file:[],regDate:global.utilGetDate().default});
// CLT.ImsNotice.insert({title:"공지사항 제목 4",content:"공지사항 4번 내용 공지사항 4번 내용 공지사항 4번 내용 공지사항 4번 내용",file:[],regDate:global.utilGetDate().default});
// CLT.ImsNotice.insert({title:"공지사항 제목 5",content:"공지사항 5번 내용 공지사항 5번 내용 공지사항 5번 내용 공지사항 5번 내용",file:[],regDate:global.utilGetDate().default});
// CLT.ImsCustomFaq.insert({category:"로그인",title:"첫번째 제목",question:"질문사항 입력란1",answer:"질문1 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,file:[]});
// CLT.ImsCustomFaq.insert({category:"로그인",title:"두번째 제목",question:"질문사항 입력란1",answer:"질문1 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,file:[]});
// CLT.ImsCustomFaq.insert({category:"시스템",title:"세번째 제목",question:"질문사항 입력란1",answer:"질문1 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,file:[]});
// CLT.ImsCustomFaq.insert({category:"시스템",title:"네번째 제목",question:"질문사항 입력란1",answer:"질문1 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,file:[]});
// CLT.ImsCustomFaq.insert({category:"로그인",title:"다섯번째 제목",question:"질문사항 입력란1",answer:"질문1 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,file:[]});
// CLT.ImsCustomQna.insert({title:"첫번째 제목",question:"질문사항 입력란1",answer:"질문1 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,qsfile:[],ansfile:[]},userId:"",adminId:"imsadmin");
// CLT.ImsCustomQna.insert({title:"두섯번째 제목",question:"질문사항 입력란2",answer:"질문2 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,qsfile:[],ansfile:[],userId:"",adminId:"imsadmin"});
// CLT.ImsCustomQna.insert({title:"세번째 제목",question:"질문사항 입력란3",answer:"질문3 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,qsfile:[],ansfile:[],userId:"",adminId:"imsadmin"});
// CLT.ImsCustomQna.insert({title:"네번째 제목",question:"질문사항 입력란4",answer:"질문4 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,qsfile:[],ansfile:[],userId:"",adminId:"imsadmin"});
// CLT.ImsCustomQna.insert({title:"시스템정기 점검 안내 (2016년 12월 31일 04:00~05:00)",question:"질문사항 입력란5",answer:"질문5 대답내용이 입력됩니다.",regDate:global.utilGetDate().default,qsfile:[],ansfile:[],userId:"",adminId:"imsadmin"});



//신규유져  imsmessage 컬랙션 추가
// CLT.ImsMessage.insert({userId:'scshin', denial:[], receiveMsg:[{
//     "content" : "메시지입니다.;\n\n      ",
//     "sender" : "test4",
//     "check" : false,
//     "regDate" : "2017-07-03T11:28:58.957Z",
//     "refuse" : false
// }], sendMsg:[]});
// CLT.ImsMessage.insert({userId:'ktkim', denial:[], receiveMsg:[], sendMsg:[]});
// CLT.ImsMessage.insert({userId:'ymkim', denial:[], receiveMsg:[], sendMsg:[]});
// CLT.ImsMessage.insert({userId:'test', denial:[], receiveMsg:[], sendMsg:[]});


//질문리스트
if (CLT.EnQuestionList.find().count() === 0) {
  CLT.EnQuestionList.insert({
    questionId: 'NM0001',
    question: '무엇을 좋아하나요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0002',
    question: '가장 가고 싶은 곳은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0003',
    question: '나를 돌아보기 좋은 장소는?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0004',
    question: '편하게 느끼는 장소는?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0005',
    question: '좋아하는 색깔은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0006',
    question: '연중 가장 기다려지는 날은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0007',
    question: '어떤 음악을 즐기나요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0008',
    question: '하루중 가장 기다려지는 때는?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0009',
    question: '좋아하는 별자리는?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0010',
    question: '지금 가장 생각나는 분은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0011',
    question: '어떤 종류의 영화를 좋아하나요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0012',
    question: '어떤 스포츠를 좋아하나요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0013',
    question: '지금 나에게 가장 중요한 사람은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0014',
    question: '좋아하는 음식은 무엇인가요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0015',
    question: '나를 편하게 하는 것은 무엇인가요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0016',
    question: '나는 언제 행복을 느끼나요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0017',
    question: '나의 동기부여에 가장 도움되는 것은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0018',
    question: '가장 싫어 하는 것은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0019',
    question: '가장 무서워 하는 것은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0020',
    question: '사람들이 부르는 별명은 무엇인가요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0021',
    question: '현재 가장 친한 분은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0022',
    question: '현재 가장 열심히 활동하는 모임은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0023',
    question: '좋아하는 TV 프로그램이 있다면?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0024',
    question: '좋아하는 옷은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0025',
    question: '나의 오랜 병이 있다면?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0026',
    question: '현재 가장 걱정하는 것은?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM0027',
    question: '추억을 떠오르게 하는 노래가 있나요?',
    type: 'ME',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM1001',
    question: '즐거웠던 추억은 어떤 것이 있나요?',
    type: 'IM',
    keyword: '즐거',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM1002',
    question: '행복했던 추억은 어떤 것이 있나요?',
    type: 'IM',
    keyword: '행복',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM1003',
    question: '가족과 함께한 추억은 어떤 것이 있나요?',
    type: 'IM',
    keyword: '가족',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM1004',
    question: '보람있는 일은 어떤 것이 있나요?',
    type: 'IM',
    keyword: '보람',
    regDate: global.utilGetDate().default
  });
  CLT.EnQuestionList.insert({
    questionId: 'NM1005',
    question: '우리집에 얽힌 이야기가 있다면?',
    type: 'IM',
    keyword: '우리집',
    regDate: global.utilGetDate().default
  });
  // CLT.EnQuestionList.insert({
  //   questionId: 'NM1100',
  //   question: '오늘하루 우울하지 않았니?',
  //   type: 'WM',
  //   regDate: global.utilGetDate().default
  // });
  // CLT.EnQuestionList.insert({
  //   questionId: 'NM1101',
  //   question: '오늘기분어때?',
  //   type: 'WM',
  //   regDate: global.utilGetDate().default
  // });
  // CLT.EnQuestionList.insert({
  //   questionId: 'NM1102',
  //   question: '답답한가요?',
  //   type: 'WM',
  //   regDate: global.utilGetDate().default
  // });
  // CLT.EnQuestionList.insert({
  //   questionId: 'NM1103',
  //   question: '즐거운 하루를 위해 한마디!',
  //   type: 'WM',
  //   regDate: global.utilGetDate().default
  // });
}

if (CLT.ImsCode.find().count() === 0) {
  CLT.ImsCode.insert({
    type: 'asset',
    code: 'asset001',
    name: '자산종류',
    value: '부동산',
    pacode: '',
    order: 1,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'asset',
    code: 'asset002',
    name: '자산종류',
    value: '예적금',
    pacode: '',
    order: 2,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'asset',
    code: 'asset003',
    name: '자산종류',
    value: '유가증권',
    pacode: '',
    order: 3,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'asset',
    code: 'asset004',
    name: '자산종류',
    value: '권리중',
    pacode: '',
    order: 4,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'asset',
    code: 'asset005',
    name: '자산종류',
    value: '채무',
    pacode: '',
    order: 5,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'asset',
    code: 'asset006',
    name: '자산종류',
    value: '채권',
    pacode: '',
    order: 6,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'asset',
    code: 'asset007',
    name: '자산종류',
    value: '보험',
    pacode: '',
    order: 7,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType001',
    name: '자산구분',
    value: '아파트',
    pacode: 'asset001',
    order: 1,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType002',
    name: '자산구분',
    value: '건물',
    pacode: 'asset001',
    order: 2,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType003',
    name: '자산구분',
    value: '토지',
    pacode: 'asset001',
    order: 3,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType004',
    name: '자산구분',
    value: '단독주택',
    pacode: 'asset001',
    order: 4,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType005',
    name: '자산구분',
    value: '상가',
    pacode: 'asset001',
    order: 5,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType006',
    name: '자산구분',
    value: '전세금',
    pacode: 'asset001',
    order: 6,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType007',
    name: '자산구분',
    value: '보증금',
    pacode: 'asset001',
    order: 7,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType008',
    name: '자산구분',
    value: '예금',
    pacode: 'asset002',
    order: 8,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType009',
    name: '자산구분',
    value: '적금',
    pacode: 'asset002',
    order: 9,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType010',
    name: '자산구분',
    value: '주식',
    pacode: 'asset003',
    order: 10,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType011',
    name: '자산구분',
    value: '채권',
    pacode: 'asset003',
    order: 11,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType012',
    name: '자산구분',
    value: '회원권',
    pacode: 'asset004',
    order: 12,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type: 'assetType',
    code: 'assetType013',
    name: '자산구분',
    value: '저작권',
    pacode: 'asset004',
    order: 13,
    regDate: global.utilGetDate().default
  });
  CLT.ImsCode.insert({
    type : 'inviteFuneralType',
    code : 'family',
    name : '장례식초대자구분',
    value : '가족',
    order : 1,
    regDate : global.utilGetDate().default,
  });
  CLT.ImsCode.insert({
    type : 'inviteFuneralType',
    code : 'relative',
    name : '장례식초대자구분',
    value : '친척',
    order : 2,
    regDate : global.utilGetDate().default,
  });
  CLT.ImsCode.insert({
    type : 'inviteFuneralType',
    code : 'friend',
    name : '장례식초대자구분',
    value : '친구',
    order : 3,
    regDate : global.utilGetDate().default,
  });
  CLT.ImsCode.insert({
    type : 'inviteFuneralType',
    code : 'colleague',
    name : '장례식초대자구분',
    value : '동료',
    order : 4,
    regDate : global.utilGetDate().default,
  });
  CLT.ImsCode.insert({
    type : 'inviteFuneralType',
    code : 'acquaintance',
    name : '장례식초대자구분',
    value : '지인',
    order : 5,
    regDate : global.utilGetDate().default,
  });
  CLT.ImsCode.insert({
    type : 'inviteFuneralType',
    code : 'etc',
    name : '장례식초대자구분',
    value : '기타',
    order : 6,
    regDate : global.utilGetDate().default,
  });
}

// if (CLT.EnImWithMe.find().count() === 0) {
//   CLT.EnImWithMe.insert({
//     questionId: 'NM1100',
//     type:'WM',
//     userId:'scshin',
//     regDate: global.utilGetDate().default,
//     updateDate: global.utilGetDate().default,
//     title:'오늘하루 우울하지 않았니?',
//     content:'1) 괜찮은 하루였던것 같아11',
//     lock:true,
//     questionRegDate:global.utilGetDate.default
//   });
//   CLT.EnImWithMe.insert({
//     questionId: 'NM1100',
//     type:'WM',
//     userId:'scshin',
//     regDate: global.utilGetDate().default,
//     updateDate: global.utilGetDate().default,
//     title:'오늘하루 우울하지 않았니?',
//     content:'2) 괜찮은 하루였던것 같아22',
//     lock:true,
//     questionRegDate:global.utilGetDate.default
//   });
//   CLT.EnImWithMe.insert({
//     questionId: 'NM1100',
//     type:'WM',
//     userId:'scshin',
//     regDate: global.utilGetDate().default,
//     updateDate: global.utilGetDate().default,
//     title:'오늘하루 우울하지 않았니?',
//     content:'3) 괜찮은 하루였던것 같아33',
//     lock:true,
//     questionRegDate:global.utilGetDate.default
//   });
//   CLT.EnImWithMe.insert({
//     questionId: 'NM1103',
//     type:'WM',
//     userId:'scshin',
//     regDate: global.utilGetDate().default,
//     updateDate: global.utilGetDate().default,
//     title:'즐거운 하루를 위해 한마디!',
//     content:'1) 행복해서 웃는게 아니라 웃어서 행복한겁니다!!1',
//     lock:true,
//     questionRegDate:global.utilGetDate.default
//   });
//   CLT.EnImWithMe.insert({
//     questionId: 'NM1103',
//     type:'WM',
//     userId:'scshin',
//     regDate: global.utilGetDate().default,
//     updateDate: global.utilGetDate().default,
//     title:'즐거운 하루를 위해 한마디!',
//     content:'2) 행복해서 웃는게 아니라 웃어서 행복한겁니다!!2',
//     lock:true,
//     questionRegDate:global.utilGetDate.default
//   });
// }

if (CLT.ImsCodeOption.find().count() === 0) {
  var s3bucket = "";
  var s3bucketPath = "";
  var s3region = "";
  var siteUrl = "";

  if(Meteor.settings.public.serverType === "prod"){
    s3bucket = "s3-ims-contents";
    s3bucketPath = "https://s3.ap-northeast-2.amazonaws.com/s3-ims-contents";
    s3region = "s3-ap-northeast-2";
    siteUrl = "http://itsmystory.com";
  } else {
    s3bucket = "iml-images";
    s3bucketPath = "https://s3.ap-northeast-2.amazonaws.com/iml-images/";
    s3region = "s3-ap-northeast-2";
    siteUrl = "http://dev.itsmystory.com";
  }

  CLT.ImsCodeOption.insert({
    "serverType": Meteor.settings.public.serverType,
    "siteUrl": siteUrl,
    "itemsIncrement" : 10,
    "timeLineItemsIncrement" : 5,
    "commentIncrement" : 5,
    "join" : {
      "aggrement" : {

      },
      "membership" : {

      },
      "profile" : {

      }
    },
    "timeCapsuleEggImg" : {
      "default" : "/images/icon/icon_map_marker.png",
      "open" : "/images/icon/icon_map_marker_open.png"
    },
    "pageType" : {
      "en" : "EN",
      "im" : "IM",
      "me" : "ME",
      "bucketList" : "BL",
      "bucketStory" : "BS",
      "bucketPlan" : "BP",
      "timeCapsule" : "TC",
      "lifeMap" : "LM",
      "inHeritance" : "IH",
      "lifeTrace" : "LT",
      "myGuardian" : "MG",
      "imGuardian" : "IG",
      "future" : "FT"
    },
    "pageTypeName" : {
      "EN" : "엔딩노트",
      "IM" : "나는",
      "ME" : "Me",
      "BL" : "버킷리스트",
      "BS" : "버키스토리",
      "TC" : "타임캡슐",
      "LT" : "발자취",
      "MG" : "나의 가디언",
      "IG" : "내가 가디언",
      "IH" : "상속"
    },
    "lifeTraceType" : {
      "home" : "home",
      "school" : "school",
      "social" : "social"
    },
    "Message" : {
      "comment" : "댓글을 썼습니다.",
      "bucketList" : {
        "write" : "버킷을 등록했습니다.",
        // "execPlanWrite" : function(count){if(count > 0){return '실행계획을 ' + count + '개 등록했습니다.';} else {return '실행계획을 등록했습니다.';}},
        execPlanWrite : "if(count > 0){return '실행계획을 ' + count + '개 등록했습니다.';} else {return '실행계획을 등록했습니다.';}",
        "like" : "좋아합니다.",
        "favorite" : "즐겨찾기 했습니다.",
        "follow" : "따라하기 시작했습니다.",
        "followMe" : "따라하기 시작했습니다.",
        "bucketStoryWrite" : "을 등록했습니다.",
        "bucketStoryDelete" : "을 추억으로 이동했습니다.",
        "bucketStoryComment" : "에 댓글을 썼습니다.",
        "bucketStoryLike" : "을 좋아합니다.",
        "complete" : "버킷을 완료했습니다.",
        "leaveBucket" : "그룹에서 나갔습니다"
      },
      "timeCapsule" : {
        "write" : "타임캡슐을 등록했습니다.",
        "delete" : "타임캡슐을 삭제했습니다.",
        "bury" : "타임캡슐이 매립되었습니다.",
        "unseal" : "타임캡슐을 개봉했습니다.",
        "like" : "을 좋아합니다.",
        "writeMessage" : "메세지를 등록했습니다.",
        "deleteMessage" : "메세지를 삭제했습니다.",
        "editMessage" : "메세지를 수정했습니다.",
        "leaveCapsule" : "타임캡슐을 나갔습니다.",
        "public" : "타임캡슐을 공개(익명)로 등록했습니다."
      },
      "inheritance" : {
        "addInheritor" : "님을 상속인으로 추가했습니다.",
        "delInheritor" : "님을 상속인에서 제외했습니다.",
        "setInhContent" : "님께 컨텐츠를 상속 설정했습니다.",
        "editInhContent" : "님의 컨텐츠 상속 내용을 변경했습니다.",
        "canselInhContent" : "님의 컨텐츠 상속 설정을 취소했습니다.",
        "letterwrite" : "님께 마지막편지를 상속 설정했습니다.",
        "letterwriteAll" : "전체에게 마지막편지를 상속 설정했습니다.",
        "letterEdit" : "님의 마지막편지 상속 내용을 변경했습니다.",
        "letterDelete" : "님의 마지막편지 상속 설정을 취소했습니다.",
        "assetWrite" : "님께 자산 상속 설정했습니다.",
        "assetEdit" : "님의 자산 상속 내용을 변경했습니다.",
        "assetDelete" : "님의 자산 상속 설정을 취소했습니다.",
        "directInhContent" : "님께 컨텐츠를 지금상속 했습니다.",
        "requestDelInh" : "님의 상속 내용을 삭제요청 했습니다.",
        "deletedInh" : "님의 상속 내용이 삭제되었습니다.",
        "restoreDelInh" : "님의 상속 삭제 요청을 취소 하였습니다.",
        "refuseInh" : "님으로부터의 상속을 거부 설정했습니다.",
        "restoreInh" : "님으로부터의 상속을 거부를 철회했습니다.",
        "funeralInvitation" : "장례식 초대장을 작성했습니다.",
        "requestedGuadian" : "님이 가디언을 요청했습니다.",
        "acceptGuadian" : "님의 가디언이 되었습니다.",
        "requestGuad" : "님께 가디언을 요청했습니다.",
        "acceptedGuadian" : "님이 가디언이 되었습니다.",
        "delGuardian" : "님을 가디언에서 삭제했습니다.",
        "refuseGuadian" : "님의 가디언 요청을 거절 하였습니다."
      }
    },
    "notification" : {
      "comment" : " 댓글을 달았습니다.",
      "subComment" : " 댓글에 답글을 달았습니다.",
      "like" : " 좋아요 했습니다.",
      "follow" : " 따라하기 했습니다.",
      "bucketStory" : {
        "write" : " 생성했습니다."
      },
      "bucketList" : {
        "write" : " 생성했습니다.",
        "delete" : " 그룹에서 빠졌습니다.",
        "manyWrite" : "회원님이 최고의 꿈쟁이 순위에 진입했습니다.",
        "manyComplete" : "회원님이 최고의 꿈실현가 순위에 진입했습니다",
        // manyWriteVIP : function(num){if(num > 0){return '회원님은 현재 상위 ' + num + '%의 꿈쟁이 입니다.';}},
        // manyCompleteVIP : function(num){if(num > 0){return '회원님은 현재 상위 ' + num + '%의 꿈실현가 입니다.';}
        manyWriteVIP : "if(num > 0){return '회원님은 현재 상위 ' + num + '%의 꿈쟁이 입니다.';}",
        manyCompleteVIP : "if(num > 0){return '회원님은 현재 상위 ' + num + '%의 꿈실현가 입니다.';}"
      },
      "timeCapsule" : {
        "write" : " 생성했습니다.",
        "receive" : "회원님이 받으신 타임캡슐이 있습니다.",
        "message" : " 메시지 작성했습니다.",
        "bury" : " 묻었습니다.",
        "open" : " 개봉했습니다.",
        "openPlz" : " 열어주세요.",
        "delete" : " 삭제했습니다."
      },
      "inheritance" : {
        "inherit" : "님으로부터 상속받은 내역이 있습니다."
      },
      "guardian" : {
        "receive" : "님이 가디언 등록을 요청했습니다.",
        "accept" : "님이 가디언 요청을 수락했습니다.",
        "refusal" : "님이 가디언 요청을 거절했습니다."
      },
      "message" : {
        "msgReceive" : "님에게 쪽지를 받았습니다.",
        "recommend" : "1:1문의에 답변이 등록되었습니다.",
        "signUp" : "It's my story 회원이 되신 것을 환영합니다.",
        "payment" : "서비스 이용료 결제가 완료되었습니다.",
        // paymentError: function(cnt){if(cnt){return '[중요] 3차 결제 오류로 멤버십이 변경됩니다.';} else {return '[중요] 결제 오류가 발생했습니다. 확인 바랍니다.';}},
        paymentError: "if(cnt){return '[중요] 3차 결제 오류로 멤버십이 변경됩니다.';} else {return '[중요] 결제 오류가 발생했습니다. 확인 바랍니다.';}",
        "changePassword" : "[중요] 비밀번호를 변경해주세요"
      },
      "friends" : {
        "receive" : "님이 친구 등록을 요청했습니다.",
        "accept" : "님이 친구 요청을 수락했습니다.",
        "refusal" : "님이 친구 요청을 거절했습니다."
      },
      "messageContext" : {
        "deletedTC" : "안녕하세요, 회원님.<br/><br/>       index[0]에 생성된 'index[1]' 타임캡슐이<br/>       아래와 같은 사유로 삭제되었습니다.<br/><br/>       index[2]님이 타임캡슐을 삭제<br/><br/>        삭제된 타임캡슐은 엔딩노트 타임라인이나  타임캡슐<br/>       목록에서 보이지 않습니다.<br/><br/>       서비스 이용에 문의사항이 있으시면 고객센터로<br/>       연락주시기 바랍니다.<br/><br/>       감사합니다.",
        "signUp" : "안녕하세요, 회원님.<br/><br/>       It’s my Story 회원이 되신 것을 진심으로<br/>       축하드립니다.<br/><br/>       It’s my Story를 통해 삶을 기록하고 계획하며,<br/>       긍정적으로 변화하는 자신의 모습을 발견하시면<br/>       좋겠습니다.<br/><br/>       서비스 이용에 궁금하신 사항이 있으시면 아래<br/>      메뉴를 이용해주세요.<br/><br/>       <div class=\"indent\" style=\"text-indent: 11px; color: blue;\">       ● 고객센터 : <a herf=\"javascript.void(0)\" name=\"notice\">공지사항</a>, <a herf=\"javascript.void(0)\" name=\"faq\">FAQ</a>, <a herf=\"javascript.void(0)\" name=\"qna\">1:1문의</a>, <a herf=\"javascript.void(0)\" name=\"help\">도움말</a>       </div><br/>       감사합니다.<br/>       YOLO!!",
        "paymentError1st" : "안녕하세요, 회원님.       index[0]에 서비스 이용료 결제 예정이었으나, 아래와 같은 사유로 결제에 실패했습니다.       오류내용 : 폐기된 카드번호(index[1])       index[2]에 2차 결제 예정이오니, 위 사항을 참고하시기 바랍니다.       결제 오류 발생 시 공지 후 3차까지 재결제가 시도되며, 3차 결제 시도에도 오류가 발생하는 경우 멤버십이 일시 정지되오니, 이 점 유의하세요       만약, 결제 정보에 변동사항 및 이상이 없는데 오류가 계속되는 경우, 고객센터(1:!문의)로 연락주시기 바랍니다.       감사합니다.",
        "paymentError2st" : "안녕하세요, 회원님.       안내드린 바와 같이 index[0]에 2차 결제를 시도하였으나, 아래 사유로 결제에 실패했습니다.       오류내용 : 폐기된 카드번호(index[0])       index[0]에 3차 결제 예정이오니, 위 사항을 참고하시기 바랍니다.       결제 오류 발생 시 공지 후 3차까지 재결제가 시도되며, 3차 결제 시도에도 오류가 발생하는 경우 멤버십이 일시 정지되오니, 이 점 유의하세요.       만약, 결제 정보에 변동사항 및 이상이 없는데 오류가 계속되는 경우, 고객센터(1:!문의)로 연락주시기 바랍니다.       감사합니다.",
        "paymentError3st" : "안녕하세요, 회원님.       안내드린 바와 같이 index[0]에 3차 결제를 시도하였으나, 아래 사유로 결제에 실패했습니다.       오류내용 : 폐기된 카드번호(index[1])       3차 재결제도 실패했기 때문에, 공지드린 바와 같이 index[2]부터 index[3]멤버십이 일시 정지됩니다.       작성하신 컨텐츠는 보존되나 기존의 유료 멤버십의 혜택은 제공되지 않으며, 무료 멤버십으로 전환됩니다.       멤버십 원복을 원하시는 경우, 유료 멤버십 서비스를 결제하시면 됩니다. 멤버십 변경 바로가기       문의 사항이 있으신 경우 고객센터(1:!문의)로 연락주세요.       감사합니다.",
        "payment" : "안녕하세요, 회원님.       index[0], ㅇㅇ멤버십에 대한 서비스 이용료 결제가 완료되었습니다.       멤버십 적용 기간은 아래와 같습니다.       index[1]멤버십 (index[2] ~ index[3])       서비스 이용에 문의사항이 있으시면 고객센터로 연락주시기 바랍니다.       감사합니다."
      }
    },
    "TimeLinelifeTraceFixedText" : {
      "lifeTraceFromHome" : "시작",
      "lifeTraceToHome" : "종료",
      "lifeTraceFromSchool" : "입학",
      "lifeTraceToSchool" : "졸업",
      "lifeTraceFromSocial" : "시작",
      "lifeTraceToSocial" : "종료"
    },
    "category" : {
      "CA001" : "[먹고싶은] keyword",
      "CA002" : "[가고싶은] keyword",
      "CA003" : "[하고싶은] keyword",
      "CA004" : "[갖고싶은] keyword",
      "CA005" : "[되고싶은] keyword",
      "CA006" : "[보고싶은] keyword",
      "NM0001" : "좋아하는 keyword",
      "NM0002" : "가고 싶은 keyword",
      "NM0003" : "나를 돌아보기 좋은 장소 keyword",
      "NM0004" : "편안한 장소 keyword",
      "NM0005" : "좋아하는 색은 keyword",
      "NM0006" : "연중 가장 기다려지는 keyword",
      "NM0007" : "즐겨듣는 keyword",
      "NM0008" : "하루 중 가장 기다려지는 keyword",
      "NM0009" : "좋아하는 별자리는 keyword",
      "NM0010" : "지금 가장 생각나는 분은 keyword",
      "NM0011" : "좋아하는 영화 종류는 keyword",
      "NM0012" : "좋아하는 스포츠는 keyword",
      "NM0013" : "지금 가장 중요한 분은 keyword",
      "NM0014" : "좋아하는 음식은 keyword",
      "NM0015" : "keyword|postPositionD 나를 편하게 한다",
      "NM0016" : "keyword에 행복함을 느낀다",
      "NM0017" : "keyword|postPositionB 있으면 힘이 솟는다",
      "NM0018" : "나는 keyword|postPositionB 싫다",
      "NM0019" : "나는 keyword|postPositionB 무섭다",
      "NM0020" : "내 별명은 keyword",
      "NM0021" : "지금 가장 친한 분은 keyword",
      "NM0022" : "keyword|postPositionB 지금 가장 열심히 활동하는 모임이다",
      "NM0023" : "좋아하는 TV 프로그램은 keyword",
      "NM0024" : "내가 좋아하는 옷 keyword",
      "NM0025" : "나는 keyword 때문에 고생이다",
      "NM0026" : "지금 keyword|postPositionB 가장 걱정이다",
      "NM0027" : "노래 keyword|postPositionD 추억을 떠오르게 한다"
    },
    "timelineLeftTitle" : {
      "IM" : "다른 분들의 관련 추억..",
      "BL" : "다른 분들의 관련 버킷리스트..",
      "NM0001" : "keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0002" : "keyword|postPositionA 가고 싶어하는 분들의 추억은..",
      "NM0003" : "keyword에서 스스로 생각하는 분들의 추억은..",
      "NM0004" : "keyword|postPositionA 편안한 장소로 생각하는 분들의 추억은..",
      "NM0005" : "keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0006" : "연중 keyword|postPositionA 가장 기다리는 분들의 추억은..",
      "NM0007" : "keyword|postPositionA 즐겨듣는 분들의 추억은..",
      "NM0008" : "하루 중 keyword|postPositionA 가장 기다리는 분들의 추억은..",
      "NM0009" : "keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0010" : "",
      "NM0011" : "keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0012" : "keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0013" : "",
      "NM0014" : "keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0015" : "keyword|postPositionB 있으면 편하게 느끼는 분들의 추억은..",
      "NM0016" : "keyword에 행복함을 느끼는 분들의 추억은..",
      "NM0017" : "동기부여애 keyword|postPositionB 도움이 되는 분들의 추억은..",
      "NM0018" : "keyword|postPositionA 싫어하는 분들의 추억은..",
      "NM0019" : "keyword|postPositionA 무서워하는 분들의 추억은..",
      "NM0020" : "keyword이 별명인 분들의 추억은..",
      "NM0021" : "",
      "NM0022" : "",
      "NM0023" : "TV 프로그램 keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0024" : "keyword|postPositionA 좋아하는 분들의 추억은..",
      "NM0025" : "keyword|postPositionD 불편한 분들의 추억은..",
      "NM0026" : "keyword|postPositionA 걱정하는 분들의 추억은..",
      "NM0027" : "노래 keyword에 추억을 느끼는 분들의 추억은.."
    },
    "s3" : {
      "bucketName": s3bucket,
      "region" : s3region,
      "bucketPath" : s3bucketPath,
      "folder" : {
        "im" : "im_story_images",
        "bucketList" : "bucketlist_images",
        "bucketStory" : "bucket_story_images",
        "timeCapsule" : "time_capsule_images",
        "withMe" : "im_with_me",
        "inheritance" : "inheritance_images",
        "profile" : "profile_images",
        "future" : "future_images",
        "customer" : "customer_desk"
      }
    },
    "editorSettings" : {
      "heightMin" : 150,
      "key" : "Rxfb1ylecwkcI2C-21rs==",
      "toolbarButtons" : [
        "bold",
        "italic",
        "underline",
        "fontSize",
        "|",
        "insertImage",
        "html"
      ],
      "imageEditButtons" : [
        "imageAlign",
        "imageRemove",
        "imageDisplay",
        "imageSize"
      ]
    },
    "pageInterval" : {
      "timeCapsuleMessage" : {
        "limit" : 3,
        "skip" : 0
      },
      "inheritanceContentsList" : {
        "limit" : 4,
        "skip" : 0
      }
    },
    "profileDefaultImg" : "/images/bg/avata_big.png",
    "imageRatio" : {
      "timelineLeft61" : {
        "ratio" : 61,
        "width" : 49,
        "height" : 30
      },
      "timelineLeft55" : {
        "ratio" : 55,
        "width" : 54,
        "height" : 30
      },
      "timelineRight64" : {
        "ratio" : 64,
        "width" : 73,
        "height" : 47
      },
      "contentsList59" : {
        "ratio" : 59,
        "width" : 84,
        "height" : 50
      },
      "imgSlider56" : {
        "ratio" : 56,
        "width" : 79,
        "height" : 45
      }
    },
    "mapDefault" : {
      "zoom" : 8,
      "lat" : 37.537798,
      "lng" : 127.001216
    },
    "smtpServerInfo" : 'smtps://support:ehdrnghl1!@smtp.itsmystory.com:465'
  });
}


if(CLT.collectionExDay.find().count() === 0 ){
  CLT.collectionExDay.insert({expectYear: 82.40, exNowYear: 0});
  CLT.collectionExDay.insert({expectYear: 81.64, exNowYear: 1});
  CLT.collectionExDay.insert({expectYear: 80.66, exNowYear: 2});
  CLT.collectionExDay.insert({expectYear: 79.68, exNowYear: 3});
  CLT.collectionExDay.insert({expectYear: 78.69, exNowYear: 4});
  CLT.collectionExDay.insert({expectYear: 77.70, exNowYear: 5});
  CLT.collectionExDay.insert({expectYear: 76.70, exNowYear: 6});
  CLT.collectionExDay.insert({expectYear: 75.71, exNowYear: 7});
  CLT.collectionExDay.insert({expectYear: 74.72, exNowYear: 8});
  CLT.collectionExDay.insert({expectYear: 73.72, exNowYear: 9});
  CLT.collectionExDay.insert({expectYear: 72.73, exNowYear: 10});
  CLT.collectionExDay.insert({expectYear: 71.73, exNowYear: 11});
  CLT.collectionExDay.insert({expectYear: 70.74, exNowYear: 12});
  CLT.collectionExDay.insert({expectYear: 69.74, exNowYear: 13});
  CLT.collectionExDay.insert({expectYear: 68.75, exNowYear: 14});
  CLT.collectionExDay.insert({expectYear: 67.76, exNowYear: 15});
  CLT.collectionExDay.insert({expectYear: 66.77, exNowYear: 16});
  CLT.collectionExDay.insert({expectYear: 65.79, exNowYear: 17});
  CLT.collectionExDay.insert({expectYear: 64.80, exNowYear: 18});
  CLT.collectionExDay.insert({expectYear: 63.82, exNowYear: 19});
  CLT.collectionExDay.insert({expectYear: 62.84, exNowYear: 20});
  CLT.collectionExDay.insert({expectYear: 61.86, exNowYear: 21});
  CLT.collectionExDay.insert({expectYear: 60.88, exNowYear: 22});
  CLT.collectionExDay.insert({expectYear: 59.90, exNowYear: 23});
  CLT.collectionExDay.insert({expectYear: 58.92, exNowYear: 24});
  CLT.collectionExDay.insert({expectYear: 57.94, exNowYear: 25});
  CLT.collectionExDay.insert({expectYear: 56.97, exNowYear: 26});
  CLT.collectionExDay.insert({expectYear: 55.99, exNowYear: 27});
  CLT.collectionExDay.insert({expectYear: 55.01, exNowYear: 28});
  CLT.collectionExDay.insert({expectYear: 54.04, exNowYear: 29});
  CLT.collectionExDay.insert({expectYear: 53.07, exNowYear: 30});
  CLT.collectionExDay.insert({expectYear: 52.10, exNowYear: 31});
  CLT.collectionExDay.insert({expectYear: 51.13, exNowYear: 32});
  CLT.collectionExDay.insert({expectYear: 50.16, exNowYear: 33});
  CLT.collectionExDay.insert({expectYear: 49.20, exNowYear: 34});
  CLT.collectionExDay.insert({expectYear: 48.23, exNowYear: 35});
  CLT.collectionExDay.insert({expectYear: 47.27, exNowYear: 36});
  CLT.collectionExDay.insert({expectYear: 46.31, exNowYear: 37});
  CLT.collectionExDay.insert({expectYear: 45.35, exNowYear: 38});
  CLT.collectionExDay.insert({expectYear: 44.39, exNowYear: 39});
  CLT.collectionExDay.insert({expectYear: 43.43, exNowYear: 40});
  CLT.collectionExDay.insert({expectYear: 42.48, exNowYear: 41});
  CLT.collectionExDay.insert({expectYear: 41.53, exNowYear: 42});
  CLT.collectionExDay.insert({expectYear: 40.58, exNowYear: 43});
  CLT.collectionExDay.insert({expectYear: 39.64, exNowYear: 44});
  CLT.collectionExDay.insert({expectYear: 38.70, exNowYear: 45});
  CLT.collectionExDay.insert({expectYear: 37.76, exNowYear: 46});
  CLT.collectionExDay.insert({expectYear: 36.83, exNowYear: 47});
  CLT.collectionExDay.insert({expectYear: 35.90, exNowYear: 48});
  CLT.collectionExDay.insert({expectYear: 34.98, exNowYear: 49});
  CLT.collectionExDay.insert({expectYear: 34.06, exNowYear: 50});
  CLT.collectionExDay.insert({expectYear: 33.15, exNowYear: 51});
  CLT.collectionExDay.insert({expectYear: 32.24, exNowYear: 52});
  CLT.collectionExDay.insert({expectYear: 31.34, exNowYear: 53});
  CLT.collectionExDay.insert({expectYear: 30.44, exNowYear: 54});
  CLT.collectionExDay.insert({expectYear: 29.55, exNowYear: 55});
  CLT.collectionExDay.insert({expectYear: 28.66, exNowYear: 56});
  CLT.collectionExDay.insert({expectYear: 27.77, exNowYear: 57});
  CLT.collectionExDay.insert({expectYear: 26.89, exNowYear: 58});
  CLT.collectionExDay.insert({expectYear: 26.01, exNowYear: 59});
  CLT.collectionExDay.insert({expectYear: 25.14, exNowYear: 60});
  CLT.collectionExDay.insert({expectYear: 24.27, exNowYear: 61});
  CLT.collectionExDay.insert({expectYear: 23.41, exNowYear: 62});
  CLT.collectionExDay.insert({expectYear: 22.55, exNowYear: 63});
  CLT.collectionExDay.insert({expectYear: 21.70, exNowYear: 64});
  CLT.collectionExDay.insert({expectYear: 20.85, exNowYear: 65});
  CLT.collectionExDay.insert({expectYear: 20.02, exNowYear: 66});
  CLT.collectionExDay.insert({expectYear: 19.19, exNowYear: 67});
  CLT.collectionExDay.insert({expectYear: 18.36, exNowYear: 68});
  CLT.collectionExDay.insert({expectYear: 17.55, exNowYear: 69});
  CLT.collectionExDay.insert({expectYear: 16.75, exNowYear: 70});
  CLT.collectionExDay.insert({expectYear: 15.96, exNowYear: 71});
  CLT.collectionExDay.insert({expectYear: 15.20, exNowYear: 72});
  CLT.collectionExDay.insert({expectYear: 14.45, exNowYear: 73});
  CLT.collectionExDay.insert({expectYear: 13.72, exNowYear: 74});
  CLT.collectionExDay.insert({expectYear: 13.00, exNowYear: 75});
  CLT.collectionExDay.insert({expectYear: 12.30, exNowYear: 76});
  CLT.collectionExDay.insert({expectYear: 11.63, exNowYear: 77});
  CLT.collectionExDay.insert({expectYear: 10.97, exNowYear: 78});
  CLT.collectionExDay.insert({expectYear: 10.34, exNowYear: 79});
  CLT.collectionExDay.insert({expectYear: 9.74, exNowYear: 80});
  CLT.collectionExDay.insert({expectYear: 9.16, exNowYear: 81});
  CLT.collectionExDay.insert({expectYear: 8.60, exNowYear: 82});
  CLT.collectionExDay.insert({expectYear: 8.08, exNowYear: 83});
  CLT.collectionExDay.insert({expectYear: 7.58, exNowYear: 84});
  CLT.collectionExDay.insert({expectYear: 7.10, exNowYear: 85});
  CLT.collectionExDay.insert({expectYear: 6.65, exNowYear: 86});
  CLT.collectionExDay.insert({expectYear: 6.23, exNowYear: 87});
  CLT.collectionExDay.insert({expectYear: 5.84, exNowYear: 88});
  CLT.collectionExDay.insert({expectYear: 5.46, exNowYear: 89});
  CLT.collectionExDay.insert({expectYear: 5.12, exNowYear: 90});
  CLT.collectionExDay.insert({expectYear: 4.79, exNowYear: 91});
  CLT.collectionExDay.insert({expectYear: 4.49, exNowYear: 92});
  CLT.collectionExDay.insert({expectYear: 4.21, exNowYear: 93});
  CLT.collectionExDay.insert({expectYear: 3.95, exNowYear: 94});
  CLT.collectionExDay.insert({expectYear: 3.71, exNowYear: 95});
  CLT.collectionExDay.insert({expectYear: 3.49, exNowYear: 96});
  CLT.collectionExDay.insert({expectYear: 3.28, exNowYear: 97});
  CLT.collectionExDay.insert({expectYear: 3.09, exNowYear: 98});
  CLT.collectionExDay.insert({expectYear: 2.92, exNowYear: 99});
  CLT.collectionExDay.insert({expectYear: 2.76, exNowYear: 100});
}
