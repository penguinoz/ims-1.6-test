templateName ='sample_slider';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){
  $('#carousel').slick({
    initialSlide : 5,
      slidesToShow: 5,
      slidesToScroll: 1,

  });
});

Template[templateName].events({
  "change #txtImageFile": function(e, t){
    var reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);

  reader.onload = function  () {
      var tempImage = new Image();
      tempImage.src = reader.result;
      tempImage.onload = function () {
           var canvas = document.createElement('canvas');
           var canvasContext = canvas.getContext("2d");

           canvas.width = 47;
           canvas.height = 47;

           canvasContext.drawImage(this, 0, 0, 47, 47);

           var dataURI = canvas.toDataURL("image/jpeg");

           //썸네일 이미지 보여주기
           document.querySelector('#thumbnail').src = dataURI;

           //썸네일 이미지를 다운로드할 수 있도록 링크 설정
           document.querySelector('#download').href = dataURI;
          //  console.log (dataURI);

           var imgTag = "<img id='PREVIEW_IMG' style='width: 35%;' src='"+dataURI+"'/>";
           $("#PREVIEW_IMG_DIV").append(imgTag);
       };
   };
  }
});

Template[templateName].helpers({
  helper: function(){

  }
});
