templateName ='photo_exif';

Template[templateName].onCreated(function(){

  var instance = this;
  instance.deg = 0;
});

Template[templateName].onRendered(function(){
});

Template[templateName].events({
  "change #fileTs": function(e, t){
    t.deg = 0;
    var imageObj = e.target.files[0];

    var reader = new FileReader();
    reader.readAsDataURL(imageObj);
    var files = e.target.files;
    reader.onload = function  () {

      //썸네일 이미지 생성
      var tempImage = new Image(); //drawImage 메서드에 넣기 위해 이미지 객체화
      tempImage.src = reader.result; //data-uri를 이미지 객체에 주입
      tempImage.onload = function() {

        targetImage = this;
        var width = targetImage.width;
        var height = targetImage.height;


        var orientation = 1;
        EXIF.getData(files[0], function(e,r) {

          if(targetImage.width >= targetImage.height){
            if(targetImage.width > 84){
              width = 84;
              height = targetImage.height * (84/targetImage.width);
            }
          } else {
            if(targetImage.height > 50){
              height = 50;
              width = targetImage.width * (50/targetImage.height);
            }
          }

          var canvas = document.createElement('canvas');
          var canvasContext = canvas.getContext("2d");

          orientation = EXIF.getTag(this, "Orientation");
          if ([5,6,7,8].indexOf(orientation) > -1) {
                canvas.width = height;
                canvas.height = width;
              } else {
                canvas.width = width;
                canvas.height = height;
              }

          switch (orientation) {
                case 2: canvasContext.transform(-1, 0, 0, 1, width, 0); break;
                case 3: canvasContext.transform(-1, 0, 0, -1, width, height ); break;
                case 4: canvasContext.transform(1, 0, 0, -1, 0, height ); break;
                case 5: canvasContext.transform(0, 1, 1, 0, 0, 0); break;
                case 6: canvasContext.transform(0, 1, -1, 0, height , 0); break;
                case 7: canvasContext.transform(0, -1, -1, 0, height , width); break;
                case 8: canvasContext.transform(0, -1, 1, 0, 0, width); break;
                default: canvasContext.transform(1, 0, 0, 1, 0, 0);
          }

          //  canvas.width = width;
          //  canvas.height = height;
          canvasContext.drawImage(targetImage, 0, 0, width, height);
          var dataURI = canvas.toDataURL("image/jpeg");



          width = targetImage.width;
          height = targetImage.height;

          if(targetImage.width >= targetImage.height){
            if(targetImage.width > 1024){
              width = 1024;
              height = targetImage.height * (1024/targetImage.width);
            }
          } else {
            if(targetImage.height > 800){
              height = 800;
              width = targetImage.width * (800/targetImage.height);
            }
          }
          var canvasOriginRe = document.createElement('canvas');
          var canvasContextOriginRe = canvasOriginRe.getContext("2d");

          if ([5,6,7,8].indexOf(orientation) > -1) {
                canvasOriginRe.width = height;
                canvasOriginRe.height = width;
              } else {
                canvasOriginRe.width = width;
                canvasOriginRe.height = height;
              }

              alert(orientation);
          switch (orientation) {
                case 2: canvasContextOriginRe.transform(-1, 0, 0, 1, width, 0); break;
                case 3: canvasContextOriginRe.transform(-1, 0, 0, -1, width, height ); break; //180(우)
                case 4: canvasContextOriginRe.transform(1, 0, 0, -1, 0, height ); break;
                case 3: canvasContextOriginRe.transform(0, 1, 1, 0, 0, 0); break;
                case 6: canvasContextOriginRe.transform(0, 1, -1, 0, height , 0); break; //90(우)
                case 7: canvasContextOriginRe.transform(0, -1, -1, 0, height , width); break;
                case 8: canvasContextOriginRe.transform(0, -1, 1, 0, 0, width); break;//270(우)
                default: canvasContextOriginRe.transform(1, 0, 0, 1, 0, 0); //기본(1)
              }

          // canvasOriginRe.width = width;
          // canvasOriginRe.height = height;
          canvasContextOriginRe.drawImage(targetImage, 0, 0, width, height);
          var dataURIOriginRe = canvasOriginRe.toDataURL("image/jpeg");
          document.querySelector('#thumbnail').src = dataURI;
          document.querySelector('#thumbnail2').src = dataURIOriginRe;
        });
      };

    };

  },
  "click button.upload2": function(e, t){
    var files = $("input.fileItem")[0].files;
    console.log('files',files);
    test1(files);

  },
  "click #rotate": function(e, t){
    t.deg += 90;
    var rotate = 'rotate('+ t.deg +'deg)';
    $('#thumbnail').css({
        '-webkit-transform': rotate,
        '-moz-transform': rotate,
        '-o-transform': rotate,
        '-ms-transform': rotate,
        'transform': rotate
    });

  }
});


function imageRotate(files){
  EXIF.getData(files[0], function() {
    return EXIF.getTag(this, "Orientation");
  });
}

function test1(files){
  // var img1 = document.getElementById("fileTs");
  // EXIF.getData(files[0], function() {
  //       alert(EXIF.pretty(this));
  //   });
  EXIF.getData(files[0], function() {
    var make = EXIF.getTag(this, "Make"),
    model = EXIF.getTag(this, "Model");
    alert("I was taken by a " + make + " " + model);



    var latVal = EXIF.getTag(this, 'GPSLongitude');
    var logVal = EXIF.getTag(this, 'GPSLatitude');

    var toDecimal = function (number) {
      return number[0].numerator + number[1].numerator /
      (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
    };
    alert('lat : '+toDecimal(latVal)+' log : '+toDecimal(logVal) );


  });
}