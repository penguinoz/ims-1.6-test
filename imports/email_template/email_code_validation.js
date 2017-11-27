//이메일 본인인증
import {global} from '/imports/global/global_things.js';

export default function export_email_code_validation(_data) {

var contentsInfo = {
  receiverName : _data.receiverName,
  code : _data.code,
};

var htmlContext ="<!doctype html> \
<html lang='en'><head><meta charset='UTF-8'><link rel='stylesheet' type='text/css' href='http://fonts.googleapis.com/earlyaccess/notosanskr.css'><title>[It's my story] 이메일 본인인증</title></head> \
<body> \
<div class='container' style='background-color: #eaeff2;width: 600px;margin-left:auto;margin-right:auto;font-family:\"Noto Sans KR\", sans-serif;font-size: 12px;color: #000000;'> \
<div class='send-email-body' style='letter-spacing: -0.02em;border-top: 7px solid #ff6c5c; padding:43px;'> \
<div class='title' style='text-align: center;font-size: 32px;font-weight: bold;line-height: 2.4em;margin-top: 12px; text-decoration: unset;'> \
<a href='"+global.siteUrl+"' target='_blank' style='color: #686868;text-decoration: unset;'>It's my story</a></div> \
<div class='context' style='font-size: 16px;color: #3f3f3f;line-height: 1.9em;font-weight: 300; border-top:1px solid #afabab; padding:25px 0 0 0; margin:20px 0 0 0'>안녕하세요,  \
<span class='username' style='font-weight: bold; color: #4bbc75;'>"+contentsInfo.receiverName+"님</span><br/>It's my story 계정 본인 확인 메일입니다.</br>아래 인증번호를 입력하고, 본인 인증을 완료하여 주십시오.</div> \
<div class='info-box' style='text-align:center; background-color: #ffffff;margin: 30px 72px 50px 72px;line-height: 2.3em;border-radius: 4px; padding:20px;'> \
<div class='subtitle' style='font-weight: bold;font-size: 24px;color: #3f3f3f;'>인증번호:<div class='code' style='color: #ff6c5c; margin-top: 14px;'>"+contentsInfo.code+"</div></div> \
</div></div> \
<div class='send-email-footer' style='font-family: \"Dotum\";background-color: #e0e5e8;'> \
<div class='footer-content' style='padding: 20px 40px 27px 40px;'> \
<div class='footer-site-title' style='float: left;	margin: 55px 39px 36px 8px;color: #969595;'>It's My Story</div> \
<div class='footer-site-info' style='letter-spacing: 0.04em;'> \
<p class='footer-info-text' style='color: #707476;font-weight: bold;'>본 메일은 발신전용입니다. <br /> \
문의사항은 help@itsmystory.com으로 보내주시기 바랍니다.</p> \
<p class='footer-official-info' style='color: #969595;'> \
<strong>주소</strong> : 서울시 성동구 독서당로 173 상가동 301-1호 | <strong>우편번호</strong> 14732<br /> \
<strong>홈페이지</strong> : www.itsmystory.com | <strong>전화번호</strong> : 02-2282-73774<br /> \
<strong>고객상담</strong> : AM10 - PM06 (점심시간 PM12 - PM01)</p> \
</div></div></div></div></body></html>";
return htmlContext;
}