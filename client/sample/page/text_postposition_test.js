var templateName = 'text_postposition_test';

Template[templateName].onCreated(function(){

});


Template[templateName].events({
  "click [name=btnPostPosition]": function(e, t){
    var context = $('[name=txtPostPosition]').val();
    var lastText = context.slice(0,-1);
    var textCode = lastText.charCodeAt(0);
    if((textCode-44032)%28 === 0){
      console.log(context + '는/를');
      alert(context + '는/를');
    } else {
      console.log(context + '은/을');
      alert(context + '은/을');
    }
  }
});

// ㅇ 은/는/이/가 수정
// 수식 : (글-44032)%28 나머지 값 확인
// var 나머지 = (마지막글자코드-44032)%28
// if(나머지 ===0){
// 나머지 없음 : 받침없음 > 는/를
// } else {
// 나머지 있음 : 받침있음 > 은/을
// }
