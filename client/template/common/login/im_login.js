import {global} from '/imports/global/global_things.js';

var templateName = 'imLogin';
var userId = '';
var password = '';
var accessCode = '';

const onWindowResize = function() {
  var width = $(window).width();
  var height = $(window).height();
  if(height > 730){
    var maxHeight = $('.mCustomScrollBox').height();
    $('.mCSB_inside > .mCSB_container').height(maxHeight);
  }
};

const throttledOnWindowResize = _.throttle(onWindowResize, 200, {
  leading: false
});

Template[templateName].onCreated(function(){
  Session.set('main registerJoinData', null);
});

Template[templateName].onRendered(function(){
  // global.fn_customerScrollBarInit(this.$('.h-scroll'), "dark");
  global.fn_selectPicker('.selectpicker', null);
  //첫화면시 height조절
  onWindowResize();
  $('#userId').focus();
  //리사이즈 시 height 조절
  $(window).resize(throttledOnWindowResize);
  if(getCookie('imsUserId')){
    $('#userId').val(getCookie('imsUserId'));
  }
});

Template[templateName].events({
  "click #btnJoin": function(e,t){
    e.preventDefault();
    if($("#joininpass").val() === "A050812"){
      Session.set('main template', 'register');
    }else{
      global.utilAlert('회원가입에 임시 검증비밀번호가 필요합니다.');
    }
  },
  "keyup #password, keyup #userId": function(e, t){

    if(e.currentTarget.value === ""){
      if(e.currentTarget.id === "userId"){
        $('#userId').css({'color':'#8c8c8c'});
        $('.login-id').css({'color':'#8c8c8c'});
        $('.login-id .imsr-icon.icon-lg0003').css({'color':'#8c8c8c'});
      } else {
        $('#password').css({'color':'#8c8c8c'});
        $('.login-passwd').css({'color':'#8c8c8c'});
        $('.login-passwd .imsr-icon.icon-lg0003').css({'color':'#8c8c8c'});
      }
    } else {
      if(e.currentTarget.id === "userId"){
        $('#userId').css({'color':'#ff6c5c'});
        $('.login-id').css({'color':'#ff6c5c'});
        $('.login-id .imsr-icon.icon-lg0003').css({'color':'#ff6c5c'});
      } else {
        $('#password').css({'color':'#ff6c5c'});
        $('.login-passwd').css({'color':'#ff6c5c'});
        $('.login-passwd .imsr-icon.icon-lg0003').css({'color':'#ff6c5c'});
      }
    }
  },
  "click #btnLogin, keypress #password, keypress #userId": function(e, t){
    userId = $('#userId').val();
    password = $('#password').val();

    if (e.type === 'click' || e.keyCode === 13) {
      if(_.isEmpty(userId) || _.isEmpty(password)) {
        global.utilAlert('로그인정보를 입력해주세요');
        return;
      }

      Meteor.loginWithPassword(userId, password, function(error) {
        // console.log('login error', error);
        if (error) {
          if (error.reason === 'User not found') {
            global.utilAlert('등록되지않은 아이디 입니다.');
            //console.log('유저아이디를 찾을수 없습니다');
          } else if (error.reason === 'Incorrect password') {
            global.utilAlert('잘못된 패스워드 입니다.');
            // console.log('잘못된 패스워드 입니다');
          }
        } else {
          // global.utilAlert('로그인되었습니다.', 'success');
          // global.fn_setLoginId(userId);
          // 비밀번호 변경날짜 체크
          Meteor.call('getUserInfo', userId, ['profile.isPassAway', 'pwchange'], function(error, result) {
            if (!error) {
              if (result[0].profile.isPassAway) {
                return global.utilAlert('사용할수 없는 아이디 입니다.');
              } else {
                if($("#loginIdSaveCheck").is(":checked")){
                  setCookie("imsUserId",userId,7 );
                }else{
                  setCookie("imsUserId","",7 );
                }

                //알림 6개월 지난 데이터 삭제
                Meteor.call('removeOldNotification', userId);

                //D-Day인 타임캡슐 알림
                Meteor.call('getDdayTimeCapsule', userId, function(error, result){
                  if(error){
                    return console.log(error);
                  } else {
                    _.each(result, function(data){
                      Meteor.call('setNoti', userId, 'TC', data._id, 'openPlz', data);
                    });
                  }
                });

                var isChange = result[0].pwchange.isChange;
                var addMonth = 1;
                if (isChange) {
                  // 3개월 뒤 검사
                  addMonth = 3;
                }
                var pwDate = global.fn_getCalDateByMonth(result[0].pwchange.updateDate, addMonth, 'SUM');
                if (new Date(pwDate).getTime() <= new Date().getTime()) {
                  // 오늘날짜보다 작으면 비밀번호 설정창을 띄움
                  var modalobj = {};
                  modalobj.template = 'imChangePasswordPopup';
                  modalobj.size = 'imsr-pop chg-pwd modal-md3';
                  modalobj.fade = false;
                  modalobj.backdrop = 'static';
                  modalobj.data = {
                    userId: userId,
                  };
                  global.utilModalOpen(e, modalobj);
                } else {
                  // Session.set('isLogin', !_.isNull(Meteor.userId())); //헤더 매뉴정보를 표시/비표시
                  Session.set('myPageMain profileLogin', false); // 최초 로그인시 마이피에지회원관리 접속세션 제거
                  Router.go('/endingNote');
                }
              }
            }
          });
        }
      });
    }
  },
  'click [name=findId]': function(e, t) {
    e.preventDefault();

    Session.set('findAuth type', 'id');
    Session.set('main template', 'findAuth');
  },
  'click [name=findPw]': function(e, t) {
    e.preventDefault();

    Session.set('main template', 'findPassword');
  },
  'click .privacy-policy': function(e, t){
    e.preventDefault();
    var modalobj = {};

    modalobj.template = t.$(e.target).data('modal-template');
    modalobj.size = 'modal-lg';
    modalobj.fade = false;
    modalobj.backdrop = 'static';
    modalobj.data = {
    };
    global.utilModalOpen(e, modalobj);
  }
});

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
