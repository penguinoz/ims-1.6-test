// 사전장례의향서
var templateName = 'inheritanceAdvanceFuneralForm';

Template[templateName].events({
  "click #downinhFuneralPdf": function(e, t){

    // document.getElementById('inhAdvaneFuneralFormDiv').parentNode.style.overflow = 'visible'; //might need to do this to grandparent nodes as well, possibly.
    // html2canvas( [ document.getElementById('diagram') ], {
    //     onrendered: function(canvas) {
    //         document.getElementById('diagram').parentNode.style.overflow = 'hidden';
    //         var dataUrl = canvas.toDataURL();
    //         window.open(dataUrl, "toDataURL() image", "width=800, height=800");
    //         //Canvas2Image.saveAsPNG(canvas);
    //     }
    //  });

    // $("#container").parents().each(function(ind,elem){
    //     $(elem).addClass("overflowVisible");
    // });

    // html2canvas($("#container"), {
    //     onrendered: function(canvas) {
    //         var img =canvas.toDataURL("image/png");
    //         $('body').append(img);
    //         $("#container").parents().each(function(ind,elem){
    //             $(elem).removeClass("overflowVisible");
    //         });
    //     }
    // });

    // var offScreen = document.getElementById("inhAdvaneFuneralFormDiv");
    // document.getElementById('inhAdvaneFuneralFormDiv').parentNode.style.overflow = 'visible'; //might need to do this to grandparent nodes as well, possibly.

    // window.print();


    html2canvas($(document.getElementById('inhAdvaneFuneralFormDiv')).parent()[0],{
      onrendered:function(canvas){
        // document.getElementById('inhAdvaneFuneralFormDiv').parentNode.style.overflow = 'hidden';
        var dataUrl = canvas.toDataURL();
        // window.open(dataUrl, "toDataURL() image", "width=800, height=800");
        // var imageData = canvas.toDataURL('image/png');
        // var doc = new jsPDF('landscape');
        // doc.addImage(imageData,'PNG',0,0,canvas.width,canvas.height);

        var imgData = canvas.toDataURL('image/png');

        var imgWidth = 210;
        var pageHeight = 310;
        var imgHeight = canvas.height * imgWidth / canvas.width;
        var heightLeft = imgHeight;

        var doc = new jsPDF('p', 'mm');
        var position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        doc.save('sample.pdf');
      }
    });
  }
});
