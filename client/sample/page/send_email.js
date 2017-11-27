import {global} from '/imports/global/global_things.js';

Template.send_email.onCreated(function(){
  var instance = this;
  instance.userData = new ReactiveVar();
});

Template.send_email.helpers({
  hpData: function(){
    return Template.instance().userData.get();
  }
});

Template.send_email.events({
  'submit form': function (e, t) {
    e.preventDefault();

    var userName ="신승철";
    var contentsInfo = {
      userName : userName,
      userId : 'scshin',
      nickName : 'penguinoz',
      membership : '그린',
      paymentInfo : '신용카드 ****_****_****_1234'
    };
    var imageSrc = "https://s3.ap-northeast-2.amazonaws.com/iml-images/ims_common/img_joind.png";

    var htmlContext = "<!doctype html> \
    <html lang='en'> \
    <head><meta charset='UTF-8'><link rel='stylesheet' type='text/css' href='http://fonts.googleapis.com/earlyaccess/notosanskr.css'></head> \
    <body> \
    <div class='container' style='background-color: #eaeff2; width: 730px; font-family: \"Noto Sans KR\", sans-serif; font-size: 12px; color: #000000; margin-left:auto; margin-right:auto;'> \
    <div class='send-email-body' style='border-top: 7px solid #ff6c5c; letter-spacing: -0.02em;'> \
    <div class='title' style='text-align: center; font-size: 32px; font-weight: bold; color: #1f1f1f; line-height: 2.4em; margin-top: 82px;'>Welcome!</div> \
    <div class='context' style='text-align: center; font-size: 24px; color: #3f3f3f; line-height: 1.9em; font-weight: 300;'> \
    안녕하세요, <span class='username' style='color: #ff6c5c;'>"+userName+"님</span> It's My Stroy의 회원이 되신 것을<br/>진심으로축하드립니다!</div> \
    <div class='info-box' style='background-color: #ffffff; text-align: center; margin: 26px 72px 104px; line-height: 2.3em; border-radius: 4px;'> \
    <img src='"+imageSrc+"' alt='' style='width: 198px; margin: 2px 50px 0px 0px;'> \
    <div class='subtitle' style='font-weight: bold; font-size: 24px; color: #3f3f3f; margin: 0px 0px 17px 0px;'>가입정보</div> \
    <div class='table' style='display:table; font-family: \"Dotum\"; margin-left:auto; margin-right:auto; width:529px; line-height:2.45em;'> \
    <div class='tr odd' style='display: table-row; background-color:#fafafa;'> \
    <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>이름</div> \
    <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.userName+"</div> \
    </div> \
    <div class='tr' style='display: table-row;'> \
    <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>아이디</div> \
    <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.userId+"</div> \
    </div> \
    <div class='tr odd' style='display: table-row; background-color:#fafafa;'> \
    <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>닉네임</div> \
    <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.nickName+"</div> \
    </div> \
    <div class='tr' style='display: table-row;'> \
    <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>맴버십</div> \
    <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.membership+"</div> \
    </div> \
    <div class='tr odd' style='display: table-row; background-color:#fafafa;'> \
    <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>결제정보</div> \
    <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.paymentInfo+"</div> \
    </div></div> \
    <div class='button-container' style='margin-left: auto; margin-right: auto; padding-top: 21px; padding-bottom: 71px; width: 222px;'> \
    <div class='button1' style='margin-left: auto; margin-right: auto; width: 195px; background-color: #ff6c5c; font-size: 13px; border-radius: 3px; padding: 5px 0px;'> \
    <a href='"+global.siteUrl+"' target='_blank' style='color: #ffffff; text-decoration: unset;'>로그인 하기</a> \
    </div></div></div></div> \
    <div class='send-email-footer' style='font-family: \"Dotum\"; background-color: #e0e5e8;'> \
    <div class='footer-content' style='padding: 20px 40px 27px 40px;'> \
    <div class='footer-site-title' style='float: left; margin: 55px 103px 36px 48px; color: #969595;'>It's My Story</div> \
    <div class='footer-site-info' style='letter-spacing: 0.04em;'> \
    <p class='footer-info-text' style='color: #707476; font-weight: bold;'>본 메일은 발신전용입니다. <br />문의사항은 help@itsmystory.com으로 보내주시기 바랍니다.</p> \
    <p class='footer-official-info' style='color: #969595;'> \
    <strong>주소</strong> : 서울시 성동구 독서당로 173 상가동 301-1호 | <strong>우편번호</strong> 14732<br /><strong>홈페이지</strong> : www.itsmystory.com | <strong>전화번호</strong> : 02-2282-73774<br /><strong>고객상담</strong> : AM10 - PM06 (점심시간 PM12 - PM01) \
    </p></div></div></div></div></body></html>";

    var emailTo = {
      email: $(e.target).find('[name=email]').val(),
      // context : $(e.target).find('[name=context]').val()
      context : htmlContext
    };

    var emailSend = global.fn_sendEmail('cert', emailTo.email, '더푸르츠 테스트 메일 발송(Hello from admin)', emailTo.context, '');
    console.log(emailSend);
    Meteor.call('sendEmail', emailSend);
    alert('인증번호를 발송했습니다. 인증번호가 오지 않으면 입력하신 정보가 회원정보와 일치하는지 확인해 주세요.');
  },
  'click [name=button]': function(e,t){
    var txt = $('[name=text]').val();

    Meteor.call('getNickAndImg',txt, function(error, result){
      return t.userData.set(result.username);
    });
  },
  'click .popup_alert': function(e,t){
    global.utilAlert("팝업테스트 입니다.");
  },
  'click .popup_confirm': function(e,t){
    global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
      if (val) {
          console.log('yes');
        }
      dleDataId = undefined;
    }).catch(swal.noop);
  }
});

// In your client code: asynchronously send an email
//'from에 사용할 Mail 정보
//  - '더푸르츠 인증 <noreply@itsmystory.com>', --메일인증 시 사용
//  - '잇츠마이스토리 <support@itsmystory.com>', --지원팀에 문의남길때 사용
