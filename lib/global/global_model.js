// //#####################################################################################
// // 글로벌 object
// //#####################################################################################
// // 추가할 리스트 갯수 정보
// global.itemsIncrement = 10; //defualt 10
// global.timeLineItemsIncrement = 5; //defualt 5
// global.commentIncrement = 5;
//
// global.join = {
//   aggrement: {},
//   membership: {},
//   profile:{}
// };
//
// //로그인한 사용자 정보
// global.login = {
//   userId : '', // 로그인 UserId
//   nickName : '', // test용 별명
//   pageOwner : '' // 페이지 권한(내 페이지와, 다른사람의 페이지 구분)
// };
//
// global.timeCapsuleEggImg = {
//   default :"/images/icon/icon_map_marker.png",
//   open : "/images/icon/icon_map_marker_open.png"
// };
//
// //화면별 코드타입
// global.pageType = {
//   en : 'EN',              //엔딩노트
//   im : 'IM',              // 나는
//   me : 'ME',              // me
//   bucketList : 'BL',      // 버킷리스트
//   bucketStory: 'BS',      // 버키스토리
//   bucketPlan: 'BP',       // 실행계획
//   timeCapsule : 'TC',     // 타임캡슐
//   lifeMap : 'LM',         // 라이프맵
//   inHeritance : 'IH',     // 상속
//   lifeTrace : 'LT',        // 나는 > 보금자리
//   myGuardian : 'MG',
//   imGuardian : 'IG',
//   future: 'FT'            // 미래
// };
//
// global.pageTypeName = {
//   EN : '엔딩노트',
//   IM : '나는',
//   ME : 'Me',
//   BL : '버킷리스트',
//   BS : '버키스토리',
//   TC : '타임캡슐',
//   LT : '발자취',
//   MG : '나의 가디언',
//   IG : '내가 가디언',
//   IH : '상속'
// };
//
// global.lifeTraceType = {
//   home : 'home',
//   school : 'school',
//   social : 'social'
// };
//
// global.Message = {
//   comment : '댓글을 썼습니다.',
//   bucketList : {
//       write : '버킷을 등록했습니다.',
//       // delete : ' 삭제했습니다.',
//       execPlanWrite : function(count){
//         if(count > 0){
//           return '실행계획을 ' + count + '개 등록했습니다.';
//         } else {
//           return '실행계획을 등록했습니다.';
//         }
//       },
//       execPlanDelete : '실행계획을 삭제했습니다.',
//       like : '좋아합니다.',
//       favorite : '즐겨찾기 했습니다.',
//       follow : '따라하기 시작했습니다.',
//       followMe : '따라하기 시작했습니다.',
//       bucketStoryWrite : '을 등록했습니다.',
//       bucketStoryDelete : '을 추억으로 이동했습니다.',
//       bucketStoryComment : '에 댓글을 썼습니다.',
//       bucketStoryLike : '을 좋아합니다.',
//       complete : '버킷을 완료했습니다.',
//       leaveBucket : '그룹에서 나갔습니다'
//   },
//   timeCapsule: {
//     write : '타임캡슐을 등록했습니다.',
//     delete : '타임캡슐을 삭제했습니다.',
//     bury : '타임캡슐이 매립되었습니다.',
//     unseal : '타임캡슐을 개봉했습니다.',
//     like : '을 좋아합니다.',
//     writeMessage : '메세지를 등록했습니다.',
//     deleteMessage : '메세지를 삭제했습니다.',
//     editMessage : '메세지를 수정했습니다.',
//     leaveCapsule : '타임캡슐을 나갔습니다.',
//     public :  '타임캡슐을 공개(익명)로 등록했습니다.'
//   },
//   inheritance: {
//     addInheritor : '님을 상속인으로 추가했습니다.',
//     delInheritor : '님을 상속인에서 제외했습니다.',
//     setInhContent : '님께 컨텐츠를 상속 설정했습니다.',
//     editInhContent : '님의 컨텐츠 상속 내용을 변경했습니다.',
//     canselInhContent : '님의 컨텐츠 상속 설정을 취소했습니다.',
//     letterwrite : '님께 마지막편지를 상속 설정했습니다.',
//     letterwriteAll : '전체에게 마지막편지를 상속 설정했습니다.',
//     letterEdit : '님의 마지막편지 상속 내용을 변경했습니다.',
//     letterDelete : '님의 마지막편지 상속 설정을 취소했습니다.',
//     assetWrite : '님께 자산 상속 설정했습니다.',
//     assetEdit : '님의 자산 상속 내용을 변경했습니다.',
//     assetDelete : '님의 자산 상속 설정을 취소했습니다.',
//     directInhContent : '님께 컨텐츠를 지금상속 했습니다.',
//     requestDelInh : '님의 상속 내용을 삭제요청 했습니다.',
//     deletedInh : '님의 상속 내용이 삭제되었습니다.',
//     restoreDelInh : '님의 상속 삭제 요청을 취소 하였습니다.',
//     refuseInh : '님으로부터의 상속을 거부 설정했습니다.',
//     restoreInh : '님으로부터의 상속을 거부를 철회했습니다.',
//     funeralInvitation : '장례식 초대장을 작성했습니다.',
//     // '님께 상속을 받았습니다.',
//     requestedGuadian : '님이 가디언을 요청했습니다.',
//     acceptGuadian : '님의 가디언이 되었습니다.',
//     requestGuad : '님께 가디언을 요청했습니다.',
//     acceptedGuadian : '님이 가디언이 되었습니다.',
//     delGuardian : '님을 가디언에서 삭제했습니다.',
//     // '님의 부고 알림이 접수되었습니다.',
//     refuseGuadian : '님의 가디언 요청을 거절 하였습니다.',
//
//   }
// };
//
// global.notification = {
//   subComment : '님이 회원님의 댓글에 답글을 달았습니다.',
//   bucketList : {
//       manyWrite : '회원님이 최고의 꿈쟁이 순위에 진입했습니다.',
//       manyComplete : '회원님이 최고의 꿈실현가 순위에 진입했습니다',
//       // delete : ' 삭제했습니다.',
//       manyWriteVIP : function(num){
//         if(num > 0){
//           return '회원님은 현재 상위 ' + num + '%의 꿈쟁이 입니다.';
//         }
//       },
//       manyCompleteVIP : function(num){
//         if(num > 0){
//           return '회원님은 현재 상위 ' + num + '%의 꿈실현가 입니다.';
//         }
//       },
//   },
//   timeCapsule: {
//     receive : '회원님이 받으신 타임캡슐이 있습니다.',
//     openPlz : '타임캡슐을 열어주세요',
//     deleted : '타임캡슐이 삭제되었습니다.',
//   },
//   inheritance: {
//     inherit : '님으로부터 상속받은 내역이 있습니다.'
//   },
//   guardian: {
//     receive : '님이 가디언 등록을 요청했습니다.',
//     accept : '님이 가디언 요청을 수락했습니다.',
//     refusal : '님이 가디언 요청을 거절했습니다.',
//   },
//   message: {
//     msgReceive : '님에게 쪽지를 받았습니다.',
//     recommend : '1:1문의에 답변이 등록되었습니다.',
//     signUp : "It's my story 회원이 되신 것을 환영합니다.",
//     payment : "서비스 이용료 결제가 완료되었습니다.",
//     paymentError: function(cnt){
//       if(cnt){
//         return '[중요] 3차 결제 오류로 멤버십이 변경됩니다.';
//       } else {
//         return '[중요] 결제 오류가 발생했습니다. 확인 바랍니다.';
//       }
//     },
//     changePassword : '[중요] 비밀번호를 변경해주세요'
//   },
//   friends: {
//     receive : '님이 친구 등록을 요청했습니다.',
//     accept : '님이 친구 요청을 수락했습니다.',
//     refusal : '님이 친구 요청을 거절했습니다.'
//   },
//   /*jshint multistr: true */ //멀티라인 사용하기 위함
//   messageContext: {
//     deletedTC : "안녕하세요, 회원님.<br/><br/> \
//       index[0]에 생성된 'index[1]' 타임캡슐이<br/> \
//       아래와 같은 사유로 삭제되었습니다.<br/><br/> \
//         index[2]님이 타임캡슐을 삭제<br/><br/>  \
//       삭제된 타임캡슐은 엔딩노트 타임라인이나  타임캡슐<br/> \
//       목록에서 보이지 않습니다.<br/><br/> \
//       서비스 이용에 문의사항이 있으시면 고객센터로<br/> \
//       연락주시기 바랍니다.<br/><br/> \
//       감사합니다.",
//     signUp : '안녕하세요, 회원님.<br/><br/> \
//       It’s my Story 회원이 되신 것을 진심으로<br/> \
//       축하드립니다.<br/><br/> \
//       It’s my Story를 통해 삶을 기록하고 계획하며,<br/> \
//       긍정적으로 변화하는 자신의 모습을 발견하시면<br/> \
//       좋겠습니다.<br/><br/> \
//       서비스 이용에 궁금하신 사항이 있으시면 아래<br/>\
//       메뉴를 이용해주세요.<br/><br/> \
//       <div class="indent" style="text-indent: 11px; color: blue;"> \
//       ● 고객센터 : <a herf="javascript.void(0)" name="notice">공지사항</a>, <a herf="javascript.void(0)" name="faq">FAQ</a>, <a herf="javascript.void(0)" name="qna">1:1문의</a>, <a herf="javascript.void(0)" name="help">도움말</a> \
//       </div><br/> \
//       감사합니다.<br/> \
//       YOLO!!',
//     paymentError1st : '안녕하세요, 회원님. \
//       index[0]에 서비스 이용료 결제 예정이었으나, 아래와 같은 사유로 결제에 실패했습니다. \
//         오류내용 : 폐기된 카드번호(index[1]) \
//       index[2]에 2차 결제 예정이오니, 위 사항을 참고하시기 바랍니다. \
//       결제 오류 발생 시 공지 후 3차까지 재결제가 시도되며, 3차 결제 시도에도 오류가 발생하는 경우 멤버십이 일시 정지되오니, 이 점 유의하세요 \
//       만약, 결제 정보에 변동사항 및 이상이 없는데 오류가 계속되는 경우, 고객센터(1:!문의)로 연락주시기 바랍니다. \
//       감사합니다.',
//     paymentError2st : '안녕하세요, 회원님. \
//       안내드린 바와 같이 index[0]에 2차 결제를 시도하였으나, 아래 사유로 결제에 실패했습니다. \
//         오류내용 : 폐기된 카드번호(index[0]) \
//       index[0]에 3차 결제 예정이오니, 위 사항을 참고하시기 바랍니다. \
//       결제 오류 발생 시 공지 후 3차까지 재결제가 시도되며, 3차 결제 시도에도 오류가 발생하는 경우 멤버십이 일시 정지되오니, 이 점 유의하세요. \
//       만약, 결제 정보에 변동사항 및 이상이 없는데 오류가 계속되는 경우, 고객센터(1:!문의)로 연락주시기 바랍니다. \
//       감사합니다.',
//     paymentError3st : '안녕하세요, 회원님. \
//       안내드린 바와 같이 index[0]에 3차 결제를 시도하였으나, 아래 사유로 결제에 실패했습니다. \
//         오류내용 : 폐기된 카드번호(index[1]) \
//       3차 재결제도 실패했기 때문에, 공지드린 바와 같이 index[2]부터 index[3]멤버십이 일시 정지됩니다. \
//       작성하신 컨텐츠는 보존되나 기존의 유료 멤버십의 혜택은 제공되지 않으며, 무료 멤버십으로 전환됩니다. \
//       멤버십 원복을 원하시는 경우, 유료 멤버십 서비스를 결제하시면 됩니다. 멤버십 변경 바로가기 \
//       문의 사항이 있으신 경우 고객센터(1:!문의)로 연락주세요. \
//       감사합니다.',
//     payment : '안녕하세요, 회원님. \
//       index[0], ㅇㅇ멤버십에 대한 서비스 이용료 결제가 완료되었습니다. \
//       멤버십 적용 기간은 아래와 같습니다. \
//         index[1]멤버십 (index[2] ~ index[3]) \
//       서비스 이용에 문의사항이 있으시면 고객센터로 연락주시기 바랍니다. \
//       감사합니다.'
//   }
// };
//
// global.TimeLinelifeTraceFixedText = {
//   lifeTraceFromHome : '시작',
//   lifeTraceToHome : '종료',
//   lifeTraceFromSchool : '입학',
//   lifeTraceToSchool : '졸업',
//   lifeTraceFromSocial : '시작',
//   lifeTraceToSocial : '종료'
// };
//
// // 카테고리 코드
// global.category = {
//   // 버킷카테고리
//   CA001: '[먹고싶은] keyword',
//   CA002: '[가고싶은] keyword',
//   CA003: '[하고싶은] keyword',
//   CA004: '[갖고싶은] keyword',
//   CA005: '[되고싶은] keyword',
//   CA006: '[보고싶은] keyword',
//
//   // 오늘의 질문 title1
//   NM0001: '좋아하는 keyword',
//   NM0002: '가고 싶은 keyword',
//   NM0003: '나를 돌아보기 좋은 장소 keyword',
//   NM0004: '편안한 장소 keyword',
//   NM0005: '좋아하는 색은 keyword',
//   NM0006: '연중 가장 기다려지는 keyword',
//   NM0007: '즐겨듣는 keyword',
//   NM0008: '하루 중 가장 기다려지는 keyword',
//   NM0009: '좋아하는 별자리는 keyword',
//   NM0010: '지금 가장 생각나는 분은 keyword',
//   NM0011: '좋아하는 영화 종류는 keyword',
//   NM0012: '좋아하는 스포츠는 keyword',
//   NM0013: '지금 가장 중요한 분은 keyword',
//   NM0014: '좋아하는 음식은 keyword',
//   // NM0015: 'keyword은/는 나를 편하게 한다',
//   NM0015: 'keyword|postPositionD 나를 편하게 한다',
//   NM0016: 'keyword에 행복함을 느낀다',
//   NM0017: 'keyword|postPositionB 있으면 힘이 솟는다',
//   NM0018: '나는 keyword|postPositionB 싫다',
//   NM0019: '나는 keyword|postPositionB 무섭다',
//   NM0020: '내 별명은 keyword',
//   NM0021: '지금 가장 친한 분은 keyword',
//   NM0022: 'keyword|postPositionB 지금 가장 열심히 활동하는 모임이다',
//   NM0023: '좋아하는 TV 프로그램은 keyword',
//   NM0024: '내가 좋아하는 옷 keyword',
//   NM0025: '나는 keyword 때문에 고생이다',
//   NM0026: '지금 keyword|postPositionB 가장 걱정이다',
//   NM0027: '노래 keyword|postPositionD 추억을 떠오르게 한다'
// };
//
// // 타임라인 왼쪽바디 타이틀
// global.timelineLeftTitle = {
//   IM: '다른 분들의 관련 추억..',
//   BL: '다른 분들의 관련 버킷리스트..',
//
//   // 오늘의 질문 title2
//   // |postPositionA : 을/를
//   // |postPositionB : 이/가
//   // |postPositionC : 으로/로
//   // |postPositionD : 은/는
//   // NM0001: 'keyword|postPositionA 좋아하는분 count명',
//   // NM0002: 'keyword|postPositionA 가고 싶어하는분 count명',
//   // NM0003: 'keyword에서 스스로 생각하는 분 count명',
//   // NM0004: 'keyword|postPositionA 편안한 장소로 생각하는 분 count명',
//   // NM0005: 'keyword|postPositionA 좋아하는 분 count명',
//   // NM0006: '연중 keyword|postPositionA 가장 기다리는 분 count명',
//   // NM0007: 'keyword|postPositionA 즐겨듣는 count분의 글은...',
//   // NM0008: '하루 중 keyword|postPositionA 가장 기다리는 분 count명',
//   // NM0009: 'keyword|postPositionA 좋아하는 분 count명',
//   // NM0010: '',
//   // NM0011: 'keyword|postPositionA 좋아하는 분 count명',
//   // NM0012: 'keyword|postPositionA 좋아하는 분 count명의 추억은',
//   // NM0013: '',
//   // NM0014: 'keyword|postPositionA 좋아하는 분 count명',
//   // NM0015: 'keyword|postPositionB 있으면 편하게 느끼는 분 count명',
//   // NM0016: 'keyword에 행복함을 느끼는 분 count명',
//   // NM0017: '동기부여애 keyword|postPositionB 도움이 되는 분 count명',
//   // NM0018: 'keyword|postPositionA 싫어하는 분 count명',
//   // NM0019: 'keyword|postPositionA 무서워하는 분 count명',
//   // NM0020: 'keyword이 별명인 분 count명',
//   // NM0021: '',
//   // NM0022: '',
//   // NM0023: 'TV 프로그램 keyword|postPositionA 좋아하는 분 count명',
//   // NM0024: 'keyword|postPositionA 좋아하는 분 count명',
//   // NM0025: 'keyword|postPositionD 불편한 분 count명',
//   // NM0026: 'keyword|postPositionA 걱정하는 분 count명',
//   // NM0027: '노래 keyword에 추억을 느끼는 분 count명'
//   NM0001: 'keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0002: 'keyword|postPositionA 가고 싶어하는 분들의 추억은..',
//   NM0003: 'keyword에서 스스로 생각하는 분들의 추억은..',
//   NM0004: 'keyword|postPositionA 편안한 장소로 생각하는 분들의 추억은..',
//   NM0005: 'keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0006: '연중 keyword|postPositionA 가장 기다리는 분들의 추억은..',
//   NM0007: 'keyword|postPositionA 즐겨듣는 분들의 추억은..',
//   NM0008: '하루 중 keyword|postPositionA 가장 기다리는 분들의 추억은..',
//   NM0009: 'keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0010: '',
//   NM0011: 'keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0012: 'keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0013: '',
//   NM0014: 'keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0015: 'keyword|postPositionB 있으면 편하게 느끼는 분들의 추억은..',
//   NM0016: 'keyword에 행복함을 느끼는 분들의 추억은..',
//   NM0017: '동기부여애 keyword|postPositionB 도움이 되는 분들의 추억은..',
//   NM0018: 'keyword|postPositionA 싫어하는 분들의 추억은..',
//   NM0019: 'keyword|postPositionA 무서워하는 분들의 추억은..',
//   NM0020: 'keyword이 별명인 분들의 추억은..',
//   NM0021: '',
//   NM0022: '',
//   NM0023: 'TV 프로그램 keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0024: 'keyword|postPositionA 좋아하는 분들의 추억은..',
//   NM0025: 'keyword|postPositionD 불편한 분들의 추억은..',
//   NM0026: 'keyword|postPositionA 걱정하는 분들의 추억은..',
//   NM0027: '노래 keyword에 추억을 느끼는 분들의 추억은..'
// };
//
//
//
// AWS.config.region = S3.config.region;
// AWS.config.update({
//   accessKeyId: S3.config.key,
//   secretAccessKey: S3.config.secret
// });
//
//
//
// global.s3 = {
//   bucketPath : 'https://s3-ap-northeast-2.amazonaws.com/iml-images/',
//   folder : {
//     im : 'im_story_images',
//     bucketList:'bucketlist_images',
//     bucketStory:'bucket_story_images',
//     timeCapsule:'time_capsule_images',
//     withMe:'im_with_me',
//     inheritance:'inheritance_images',
//     profile:'profile_images',
//     future:'future_images',
//     customer:'customer_desk'
//   }
// };
//
// // froalaEditor 설정
// global.editorSettings = {
//   heightMin : 150,
//   key : 'Rxfb1ylecwkcI2C-21rs=='
// };
// global.editorSettings.toolbarButtons = [
//       // 'fullscreen',
//       'bold',
//       'italic',
//       'underline',
//       // 'strikeThrough',
//       // 'subscript',
//       // 'superscript',
//       // 'fontFamily',
//       'fontSize',
//       '|',
//       // 'paragraphFormat',
//       // 'align',
//       // 'formatOL',
//       // 'formatUL',
//       // 'outdent',
//       // 'indent',
//       // 'quote',
//       // 'insertHR',
//       // '-',
//       // 'insertLink',
//       'insertImage',
//       // 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'selectAll',
//       'html'
//     ];
// global.editorSettings.imageEditButtons = [
//   	//'imageReplace',
//      'imageAlign',
//      'imageRemove',
//      //'|', 'imageLink',
//      //'linkOpen',
//      //'linkEdit',
//      //'linkRemove',
//      //'-',
//      'imageDisplay',
//      //'imageStyle',
//      //'imageAlt',
//      'imageSize'
//    ];
//
//    global.pageInterval = {
//      timeCapsuleMessage : {
//        limit: 3,
//        skip: 0
//      },
//      inheritanceContentsList : {
//        limit: 4,
//        skip: 0
//      }
//    };
//
// global.profileDefaultImg = '/images/bg/avata_big.png';//'/images/bg/avata_big.png'
//
// global.imageRatio = {
//   timelineLeft61 : {
//     ratio : 61,
//     width : 49,
//     height : 30
//   },
//   timelineLeft55 : {
//     ratio : 55,
//     width : 54,
//     height : 30
//   },
//   timelineRight64 : {
//     ratio : 64,
//     width : 73,
//     height : 47
//   },
//   contentsList59 : {
//     ratio : 59,
//     width : 84,
//     height : 50
//   },
//   imgSlider56 : {
//     ratio : 56,
//     width : 79,
//     height : 45
//   }
// };
//
// global.mapDefault = {
//   zoom : 8,
//   lat : 37.537798,
//   lng : 127.001216
// };
