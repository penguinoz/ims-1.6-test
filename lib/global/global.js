// //글로벌 변수, 함수, 헬퍼를 선언하여 사용함
// global = {};
//
// //#####################################################################################
// // 글로벌 object
// //#####################################################################################
// // 추가할 리스트 갯수 정보
// global.itemsIncrement = 5; //defualt 10
//
// global.join = {
//   aggrement: {},
//   membership: {},
//   profile:{}
// };
// //로그인한 사용자 정보
// global.login = {
//   userId : '', // 로그인 UserId
//   nickName : '' // test용 별명
// };
//
// // froalaEditor 설정
// //  > client>config>application_config.js에 상세 설정되어 있음
// global.editorSettings = {
//   toolbarButtons : [],
//   keepMarkers : true,
//   imageUploadToS3: {},
//   heightMin : null,
// };
//
// //화면별 코드타입
// global.pageType = {
//   en : 'EN',              //엔딩노트
//   im : 'IM',              // 나는
//   bucketList : 'BL',      // 버킥리스트
//   timeCapsule : 'TC',     // 타임캡슐
//   lifeMap : 'LM',         // 라이프맵
//   inHeritance : 'IH',     // 상속
// };
//
// // 히스토리 메세지코드
// global.historyMessage = {
//   write: '신규등록 하였습니다.',
//   like: '좋아요 하였습니다.',
//   comment: '댓글을 달았습니다.',
//   look: '댓글을 달았습니다.',
//   bookmark: '즐겨찾기를 하였습니다.',
//   copy: '따라 하였습니다.',
//   move: '이동 하였습니다.',
//   remove: '삭제 하였습니다.'
// }

// //#####################################################################################
// // 글로벌 함수
// //#####################################################################################
// /**
// * @ 스크롤바를 사용자 스타일로 변환한다.
// * param1 : <Selector> id or class selector
// * param2 : <Sring> type
// * ex)global.customerScrollBarInit(id)
// */
// global.customerScrollBarInit = function(id, type, callbacksOption){
//     //customer scroll
//     id.mCustomScrollbar({
//       theme : type,
//       alwaysShowScrollbar : 2,
//       live : true,
//       scrollInertia : 1,
//       mouseWheel : {
//         enable : true,
//         scrollAmount : 50,
//         axis : "y",
//         preventDefault : true,
//         deltaFactor : "auto",
//         normalizeDelta : false,
//         invert : false,
//         disableOver : ["select","option","keygen","datalist","textarea"]
//       },
//       callbacks : callbacksOption
//     });
// };
//
// /*
// * @ inputbox width리사이징을 위한 function
// * param1 : <Event> selector
// * ex)global.inputResizing(e.target)
// */
// global.fn_inputResizing = function(target){
//   $('body').append('<span class="new_width">'+$(target).val()+'</span>');
//   var textWidth = $('.new_width').width();
//   $(target).width(textWidth);
//   $('.new_width').remove();
// };
//
// /*
// * @ textarea height 리사이징을 위한 function
// * param1 : <Event> selector
// * ex)global.fn_textareaResizing(e.target)
// */
// global.fn_textareaResizing = function(target){
//   var tagetWidth = $(target).width()+45;
//   $('body').append('<div class="new_height" style="position:absolute; top:0; width:'+tagetWidth+'px; min-height:26px; padding-right:48px; line-height:26px;">'+$(target).val()+'</div>');
//   var textHeight = $('.new_height').height();
//   $(target).height(textHeight);
//   $('.new_height').remove();
// };
// /*
// * @ timeline textarea height 리사이징을 위한 function
// * param1 : <Event> selector
// * ex)global.fn_timeLineInputResizing(e.target)
// */
// global.fn_timeLineInputResizing = function(target){
//   $('body').append('<div class="new_timeline" style="position:absolute; top:0; min-width:40px; max-width:200px; min-height:17px; line-height:20px;">'+$(target).val()+'</div>');
//   var textWidth = $('.new_timeline').width()+8;
//   var textHeight = $('.new_timeline').height();
//   $(target).width(textWidth);
//   $(target).height(textHeight);
//   $('.new_timeline').remove();
// };
//
// /*
// * @ custom select function
// * param1 : <Event> selector
// * param2 : <String> type class
// * ex)global.fn_selectPicker('.selectpicker', 'btn-info', '100px')
// */
// global.fn_selectPicker = function(_target, _type){
//   $(_target).selectpicker({
//     style: _type
//   });
//
// };
// //#####################################################################################
// // 글로벌 헬퍼
// //#####################################################################################
// // 현재 접속한 유저와 해당글에 대한 유저에 대한 매칭
// // params: userId(작성자 유저아이디)
// UI.registerHelper('g_userAuth', function(userId) {
//   return global.login.userId === userId;
// });
//
// UI.registerHelper('g_isLogin', function(userId) {
//     return Session.get('isLogin');
// });
//
// // 오늘날짜이면 시간만, 오늘날짜가 아니면 날짜만 표기
// UI.registerHelper('g_dateCheck', function(date) {
//   var toDay = global.utilGetDate().defaultYMD;
//   var day = global.utilGetDate(date).defaultYMD;
//
//   if (toDay === day) {
//     // 오늘날짜라면 시간만 보여준다
//     day = global.utilGetDate(date).hm;
//   }
//   return day;
// });
//
// // 글자수 자르기
// UI.registerHelper('g_stringLength', function(len, str) {
//   if (str && len < str.length) {
//     str = str.substring(0, len) + '...';
//   }
//   return str;
// });
//
// // 이미지태그 제거
// UI.registerHelper('g_imageTagRemove', function(content) {
//   var str = content.replace(/<img(.*?)>/gi, "");
//   return str;
// });
//
// // array의 each문 갯수제한
// UI.registerHelper('g_limitIndex', function(index, count) {
//   return index < count;
// });
