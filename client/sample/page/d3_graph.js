var templateName = 'd3Graph';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){
  var chart = c3.generate({
    bindto: "#linechart",
    data: {
        columns: [
            ['data1', 30, 200, 100, 300, 150, 250],
            ['data2', 130, 100, 140, 200, 150, 50]
        ],
        type: 'bar',

    },
    axis: {
        x: {
            type: 'category',
            categories: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
        }
    }
  });
});