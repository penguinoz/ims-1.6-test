import {global} from '/imports/global/global_things.js';
import {collections as CLT} from '/imports/global/collections.js';

// 텍스트 에디터
var templateName = 'testTemple';
var param = [{content:'testtestcontent',regDate:'2015-12-12',userId:'test'}];
var openParam = [];
var labelParam = [];
Template[templateName].onCreated(function(){


  var instance = this;
  var userId = global.login.userId;
  instance.autorun(function(){
    var subscribe = instance.subscribe("storyAll");
    if(subscribe.ready()){
      var currentData = CLT.EnStory.find({},{sort:{open:-1},limit:5}).fetch();
      for(var i=0; i<currentData.length ; i++){
        openParam.push(currentData[i].open);
        labelParam.push(currentData[i].title);
      }

    }

  });
});





Template[templateName].onRendered(function(){
  var bar_ctx = document.getElementById('myChart').getContext('2d');
  var ring_ctx = document.getElementById('myRingChart').getContext('2d');
  var db_ctx = document.getElementById('myDbChart').getContext('2d');
  Tracker.autorun(function(){

    var db_chart = new Chart(db_ctx, {
      type: 'bar',
      data: {
          labels: labelParam,
          datasets: [
          {
              label: 'Bowser',
              data: openParam,
              backgroundColor: "rgba(55, 160, 225, 0.7)",
              hoverBackgroundColor: "rgba(55, 160, 225, 0.7)",
              hoverBorderWidth: 2,
              hoverBorderColor: 'lightgrey'
          }],
        },
        options: {
            animation: {
              duration: 1000,
            },
            // tooltips: {
            // 	mode: 'label',
            //   callbacks: {
            //   label: function(tooltipItem, data) {
            //   	return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel);
            //   }
            //   }
            //  },
            scales: {
              xAxes: [{
                categoryPercentage: 0.8
                }],
              yAxes: [{
                // ticks: {
                // 	callback: function(value) { return numberWithCommas(value); },
              // 	},
                }],
            }, // scales
            // legend: {display: true}
            legend: {
                labels: {

                    fontColor: 'rgb(255, 99, 132)'
                }
            },
            maintainAspectRatio: false,
            responsive: false,
        }
    });


//Return with commas in between
// Return with commas in between
var numberWithCommas = function(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var dataPack1 = [21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000];
var dataPack2 = [1000, 1200, 1300, 1400, 1060, 2030, 2070, 4000, 4100, 4020, 4030, 4050];
var dates = ["May 1", "May 2", "May 3", "May 4", "May 5", "May 6",
  				 "May 7", "May 8", "May 9", "May 10", "May 11", "May 12"];

// Chart.defaults.global.elements.rectangle.backgroundColor = '#FF0000';



bar_ctx.canvas.height = 400;
bar_ctx.canvas.width = 400;
var bar_chart = new Chart(bar_ctx, {
    type: 'bar',
    data: {
        labels: dates,
        datasets: [
        {
            label: 'Bowser',
            data: dataPack1,
						backgroundColor: "rgba(55, 160, 225, 0.7)",
						hoverBackgroundColor: "rgba(55, 160, 225, 0.7)",
						hoverBorderWidth: 2,
						hoverBorderColor: 'lightgrey'
        },
        {
            label: 'Mario',
            data: dataPack2,
						backgroundColor: "rgba(225, 58, 55, 0.7)",
						hoverBackgroundColor: "rgba(225, 58, 55, 0.7)",
						hoverBorderWidth: 2,
						hoverBorderColor: 'lightgrey'
        },
        ]
    },
    options: {
     		animation: {
        	duration: 1000,
        },
        // tooltips: {
				// 	mode: 'label',
        //   callbacks: {
        //   label: function(tooltipItem, data) {
        //   	return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel);
        //   }
        //   }
        //  },
        scales: {
          xAxes: [{
          	stacked: true,
            gridLines: { display: false },
            // barPercentage: 0.5,
            categoryPercentage: 0.8
            }],
          yAxes: [{
          	stacked: true,
            // ticks: {
        		// 	callback: function(value) { return numberWithCommas(value); },
     			// 	},
            }],
        }, // scales
        // legend: {display: true}
        legend: {
            display: true,
            position : "right",
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        },
        maintainAspectRatio: false,
        responsive: false,
    } // options
  }); //barchart End

  var myDoughnutChart = new Chart(ring_ctx, {
      type: 'doughnut',
      data: {
        labels: [
            "Red",
            "Blue",
            "Yellow"
        ],
        datasets: [
            {
                data: [300, 50, 100],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }]
          },
      options: {

        maintainAspectRatio: false,
        responsive: false,

        // scales: {
        //   xAxes: [{
        //     // barPercentage: 0.5,
        //     // categoryPercentage: 0.8
        //     }],
        //   yAxes: [{
        //     // ticks: {
        //     // 	callback: function(value) { return numberWithCommas(value); },
        //   // 	},
        //     }],
        // }, // scales}
      }
  });
document.getElementById('labels').innerHTML = myDoughnutChart.generateLegend();
});
});
