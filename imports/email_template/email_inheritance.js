//상속
import {global} from '/imports/global/global_things.js';

export default function export_email_inheritance(_data, type) {

  var contentsInfo = {
    inhDate : _data.receiverName,
    receiverName : _data.receiverName,
    senderName : _data.senderName,
    inhContext : _data.senderName+'님의 소중한 디지털 자산 '+_data.contentsCnt+'건',
    title : _data.title,
    code : _data.code,
  };

  var htmlContext = '';
  switch(type) {
    case 'inheritance':
      htmlContext = "<!doctype html> \
      <html lang='en'><head><meta charset='UTF-8'><link rel='stylesheet' type='text/css' href='http://fonts.googleapis.com/earlyaccess/notosanskr.css'></head> \
      <body> \
      <div class='container' style='background-color: #eaeff2; width: 730px; font-family: \"Noto Sans KR\", sans-serif; font-size: 12px; color: #000000; margin-left:auto; margin-right:auto;'> \
      <div class='send-email-body' style='border-top: 7px solid #ff6c5c; letter-spacing: -0.02em;'> \
      <div class='title' style='text-align: center; font-size: 32px; font-weight: bold; color: #1f1f1f; line-height: 2.4em; margin-top: 82px;'>Erbgang!</div> \
      <div class='context' style='text-align: center; font-size: 24px; color: #3f3f3f; line-height: 1.9em; font-weight: 300;'> \
      안녕하세요, <span class='username' style='font-weight: bold; color: #4bbc75;'> "+contentsInfo.receiverName+"님</span> 친구 "+contentsInfo.senderName+"님께서<br/> 소중한 디지털 자산을 상속했습니다.</div> \
      <div class='info-box' style='background-color: #ffffff; text-align: center; margin: 26px 72px 104px; line-height: 2.3em; border-radius: 4px;'> \
      <img src='" + global.s3.bucketPath + "ims_common/img_Erbgang.png' alt='' style='width: 198px; margin: 2px 0px 0px 0px;'> \
      <div class='subtitle' style='font-weight: bold; font-size: 24px; color: #3f3f3f; margin: 0px 0px 17px 0px;'>상속정보</div> \
      <div class='table' style='display:table; font-family: \"Dotum\"; margin-left:auto; margin-right:auto; width:529px; line-height:2.45em;'> \
      <div class='tr odd' style='display: table-row; background-color:#fafafa;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>상속일자</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.inhDate+"</div> \
      </div> \
      <div class='tr' style='display: table-row;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>피상속인</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.receiverName+"</div> \
      </div> \
      <div class='tr odd' style='display: table-row; background-color:#fafafa;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>상속인</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.senderName+"</div> \
      </div> \
      <div class='tr' style='display: table-row;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>상속대상</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.inhContext+"</div> \
      </div></div> \
      <div class='button-container'  style='margin-left: auto; margin-right: auto; padding-top: 21px; padding-bottom: 71px; width: 394px;'> \
      <div class='button1' style='width: 195px; background-color: #ff6c5c; font-size: 13px; border-radius: 3px; padding: 5px 0px; float:left;'> \
      <a href='"+global.siteUrl+"' target='_blank' style='color: #ffffff; text-decoration: unset;'>로그인 하기</a> \
      </div> \
      <div class='button2' style='margin-left: auto; width: 195px; background-color: #82b63a; font-size: 13px; border-radius: 3px; padding: 5px 0px;'> \
      <a href='"+global.siteUrl+"' target='_blank' style='color: #ffffff; text-decoration: unset;'>회원가입 하기</a> \
      </div></div></div></div> \
      <div class='send-email-footer' style='font-family: \"Dotum\"; background-color: #e0e5e8;'> \
      <div class='footer-content' style='padding: 20px 40px 27px 40px;'> \
      <div class='footer-site-title' style='float: left; margin: 55px 103px 36px 48px; color: #969595;'>It's My Story</div> \
      <div class='footer-site-info' style='letter-spacing: 0.04em;'> \
      <p class='footer-info-text' style='color: #707476; font-weight: bold;'>본 메일은 발신전용입니다. <br />문의사항은 help@itsmystory.com으로 보내주시기 바랍니다.</p> \
      <p class='footer-official-info' style='color: #969595;'><strong>주소</strong> : 서울시 성동구 독서당로 173 상가동 301-1호 | <strong>우편번호</strong> 14732<br /><strong>홈페이지</strong> : www.itsmystory.com | <strong>전화번호</strong> : 02-2282-73774<br /><strong>고객상담</strong> : AM10 - PM06 (점심시간 PM12 - PM01) \
      </p></div></div></div></div></body></html>";
    break;

    case 'death':
      htmlContext = "<!doctype html> \
      <html lang='en'><head><meta charset='UTF-8'><link rel='stylesheet' type='text/css' href='http://fonts.googleapis.com/earlyaccess/notosanskr.css'></head> \
      <body> \
      <div class='container' style='background-color: #eaeff2; width: 730px; font-family: \"Noto Sans KR\", sans-serif; font-size: 12px; color: #000000; margin-left:auto; margin-right:auto;'> \
      <div class='send-email-body' style='border-top: 7px solid #ff6c5c; letter-spacing: -0.02em;'> \
      <div class='title' style='text-align: center; font-size: 32px; font-weight: bold; color: #1f1f1f; line-height: 2.4em; margin-top: 82px;'>삼가고인의 명복을 빕니다.</div> \
      <div class='context' style='text-align: center; font-size: 24px; color: #3f3f3f; line-height: 1.9em; font-weight: 300;'> \
      안녕하세요, <span class='username' style='font-weight: bold; color: #4bbc75;'> "+contentsInfo.receiverName+"님</span> 고인이 되신 친구 "+contentsInfo.senderName+"님께서<br/> 소중한 디지털 자산을 상속했습니다.</div> \
      <div class='info-box' style='background-color: #ffffff; text-align: center; margin: 26px 72px 104px; line-height: 2.3em; border-radius: 4px;'> \
      <img src='" + global.s3.bucketPath + "ims_common/img_Erbgang.png' alt='' style='width: 198px; margin: 2px 0px 0px 0px;'> \
      <div class='subtitle' style='font-weight: bold; font-size: 24px; color: #3f3f3f; margin: 0px 0px 17px 0px;'>상속내용</div> \
      <div class='table' style='display:table; font-family: \"Dotum\"; margin-left:auto; margin-right:auto; width:529px; line-height:2.45em;'> \
      <div class='tr odd' style='display: table-row; background-color:#fafafa;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>상속일자</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.inhDate+"</div> \
      </div> \
      <div class='tr' style='display: table-row;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>피상속인</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.receiverName+"</div> \
      </div> \
      <div class='tr odd' style='display: table-row; background-color:#fafafa;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>상속인</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.senderName+"</div> \
      </div> \
      <div class='tr' style='display: table-row;'> \
      <div class='td attr' style='text-align:left; display: table-cell; color: #b5b5b5; font-weight: bold; width: 72px; padding-left: 145px; line-height:2.45em;'>상속대상</div> \
      <div class='td' style='text-align:left; display: table-cell; color:#000000;'>"+contentsInfo.inhContext+"</div> \
      </div></div> \
      <div class='email-code' style='margin: 26px;background-color: #eaeff2; padding: 12px 0 17px 0; border-radius: 4px;'> \
      <div class='' style='margin-bottom: 11px;'>회원가입 후 아래 코드를 입력하세요</div> \
      <div class='code' style='width: 411px;word-break: break-all;margin-left: auto;margin-right: auto;padding: 15px;background-color: #ffffff;border-radius: 4px;line-height: 1.5em;'>"+contentsInfo.code+"</div> \
      <div class='' style='margin-top: 11px;'> 입력방법 : '마이페이지' > '수신정보 확인' > 코드입력 후 타임캡슐 확인</div></div> \
      <div class='button-container'  style='margin-left: auto; margin-right: auto; padding-top: 21px; padding-bottom: 71px; width: 394px;'> \
      <div class='button1' style='width: 195px; background-color: #ff6c5c; font-size: 13px; border-radius: 3px; padding: 5px 0px; float:left;'> \
      <a href='"+global.siteUrl+"' target='_blank' style='color: #ffffff; text-decoration: unset;'>로그인 하기</a> \
      </div> \
      <div class='button2' style='margin-left: auto; width: 195px; background-color: #82b63a; font-size: 13px; border-radius: 3px; padding: 5px 0px;'> \
      <a href='"+global.siteUrl+"' target='_blank' style='color: #ffffff; text-decoration: unset;'>회원가입 하기</a> \
      </div></div></div></div> \
      <div class='send-email-footer' style='font-family: \"Dotum\"; background-color: #e0e5e8;'> \
      <div class='footer-content' style='padding: 20px 40px 27px 40px;'> \
      <div class='footer-site-title' style='float: left; margin: 55px 103px 36px 48px; color: #969595;'>It's My Story</div> \
      <div class='footer-site-info' style='letter-spacing: 0.04em;'> \
      <p class='footer-info-text' style='color: #707476; font-weight: bold;'>본 메일은 발신전용입니다. <br />문의사항은 help@itsmystory.com으로 보내주시기 바랍니다.</p> \
      <p class='footer-official-info' style='color: #969595;'><strong>주소</strong> : 서울시 성동구 독서당로 173 상가동 301-1호 | <strong>우편번호</strong> 14732<br /><strong>홈페이지</strong> : www.itsmystory.com | <strong>전화번호</strong> : 02-2282-73774<br /><strong>고객상담</strong> : AM10 - PM06 (점심시간 PM12 - PM01) \
      </p></div></div></div></div></body></html>";
    break;
  }
  return htmlContext;
}