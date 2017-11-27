import {global} from '/imports/global/global_things.js';

var templateName = 'bucketChartMy';

Template[templateName].onCreated(function(){
  Session.set('bucketChart countItem',null);
});

Template[templateName].onRendered(function(){
  Meteor.call('getMybucketCountInfo', global.login.userId, function(err, result){
    if(err){ console.error(err); }
    if(result){
      Session.set('bucketChart countItem',result);
    }
  });

  Meteor.call('bucketChartMyCount', global.login.userId, global.category, function(err, result){
    if(err){ console.error(err); }
    if(result){
      var resKeys = Object.keys(result[0]);
      var ingDatas = [];
      var completeDatas = [];
      var labelParam = [];
      for(var i=0; i<resKeys.length ; i++){
        if(resKeys[i].substr(0,3) === "CA0"){
          var startSt = global.category[resKeys[0]].indexOf("[");
          var endStr = global.category[resKeys[0]].indexOf("]");
          labelParam.push(global.category[resKeys[i]].substr(startSt+1,endStr-1));
          ingDatas.push(result[0][resKeys[i]]);
          completeDatas.push(result[1][resKeys[i]]);
        }
      }
      chartRender(labelParam, ingDatas, completeDatas);
    }
  });
  var targetElementLeft = $('.hr-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].helpers({
  countItems: function(){
    if(Session.get('bucketChart countItem')){
      return Session.get('bucketChart countItem');
    }
  }
});

function chartRender(labels, ingCount, completeCount){
  var bucketChart = document.getElementById('myBucketChart').getContext('2d');
  var bar_ctx = new Chart(bucketChart, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [
        {
            label: '진행중버킷',
            data: ingCount,
            backgroundColor: "#01cbcd",
            hoverBackgroundColor: "rgba(55, 160, 225, 0.7)",
            hoverBorderWidth: 2,
            hoverBorderColor: 'lightgrey'
        },
        {
            label: '완료버킷',
            data: completeCount,
						backgroundColor: "#eb7573",
						hoverBackgroundColor: "rgba(225, 58, 55, 0.7)",
						hoverBorderWidth: 2,
						hoverBorderColor: 'lightgrey'
        }
      ],
      },
      options: {
          animation: {
            duration: 1000,
          },
          scales: {
            xAxes: [{
            	stacked: true,
              gridLines: { display: false },
              categoryPercentage: 1.0,
              barPercentage: 0.3,
              }],
            yAxes: [{
            	stacked: true,
              }],
          }, // scales
          legend: {
              labels: {
                  fontColor: 'rgb(255, 99, 132)'
              }
          },
          // maintainAspectRatio: false,
          responsive: false,
      }
  });
}
