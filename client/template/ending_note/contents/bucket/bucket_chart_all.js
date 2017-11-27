import {global} from '/imports/global/global_things.js';

var templateName = 'bucketChartAll';

Template[templateName].onCreated(function(){

});

Template[templateName].onRendered(function(){
  Session.set("bucketChartAll RankData", null);
  Session.set("bucketChartAll doughnut", null);
  Session.set('bucketChartAll totalCount', null);
  Meteor.call('getBucketBatchData', function(error,result){
    if(error)console.log(error);
    if(result[0]){
      var res = result[0];
      //////////////////////////
      //카테고리 bar chart 생성//
      //////////////////////////
      var sortedCateCount = _.sortBy(res.categoryCountIng, 'category');
      var cateIngCountIng = _.pluck(sortedCateCount,'cnt');
      var sortedCateCountEnd = _.sortBy(res.categoryCountEnd, 'category');
      var cateIngCountEnd = _.pluck(sortedCateCountEnd,'cnt');

      var categoryCode = _.pluck(sortedCateCount,'category');
      console.log(categoryCode);

      var resKeys = Object.keys(global.category);
      var ingDatas = [];
      var completeDatas = [];
      var labelParam = [];
      for(var i=0; i<resKeys.length ; i++){
        if(resKeys[i].substr(0,3) === "CA0"){
          var startSt = global.category[resKeys[0]].indexOf("[");
          var endStr = global.category[resKeys[0]].indexOf("]");
          labelParam.push(global.category[resKeys[i]].substr(startSt+1,endStr-1));
        }
      }
      ingDatas = cateIngCountIng;
      completeDatas = cateIngCountEnd;

      chartRender(labelParam, ingDatas, completeDatas);


      /////////////////////////barchart end /////////////////////////////////
      /////////////////////////doghnut chart start.//////////////////////////
      var haveCountLabel = ['10개 미만','30개 미만','50개 미만','80개 미만','100개 미만','150개 미만','200개 미만','200개 이상'];
      var makeObjetForDou = [];
      for(var item in haveCountLabel){
        var findLab = haveCountLabel[item].split("개")[0];
        var ctn = 0;
        if(res.haveSumGroupAllCnt[findLab]){
          ctn = res.haveSumGroupAllCnt[findLab];
        }
        var comCtn = 0;
        if(res.haveSumGroupEndCnt[findLab]){
          comCtn = res.haveSumGroupEndCnt[findLab];
        }

        makeObjetForDou.push({
          label : haveCountLabel[item],
          allUsCtn : ctn,
          compCtn : comCtn
        });
      }
      var doLabel = _.pluck(makeObjetForDou, 'label');
      var compCtn = _.pluck(makeObjetForDou, 'compCtn');
      var allUserCtn = _.pluck(makeObjetForDou, 'allUsCtn');


      doughnutRender(doLabel, compCtn, allUserCtn);
      /////////////////////////////doghnut chart end////////////////////////
      /////////////////탑메뉴 count session set//////////////////////////////
      var topMenuCount = {
        totalCount : res.allCnt,
        completeCount : res.completeCnt,
        ingCount : res.ingCnt
      };

      Session.set('bucketChartAll totalCount', topMenuCount);
      ////////////////탑메뉴 count set end///////////////////////////
      ////////////////////make rankdata //////////////////////////////
      var rankDataObject = {};
       rankDataObject.haveRanker = res.topFiveUserListAll;
       rankDataObject.compRanker = res.topFiveUserListEnd;

      Session.set("bucketChartAll RankData",rankDataObject);

      ////////////////////end make rankdata //////////////////////////////
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
  hpTotalCountData: function(){
    return Session.get('bucketChartAll totalCount');
  },
  getHaveBLRankList: function(){
    if(Session.get("bucketChartAll RankData")){
      return Session.get("bucketChartAll RankData").haveRanker;
    }
  },
  getCompBLRankList: function(){
    if(Session.get("bucketChartAll RankData")){
      return Session.get("bucketChartAll RankData").compRanker;
    }
  },
  hpGetIndexNumber: function(index){
    return index+1;
  }


});

function chartRender(labels, ingCount, completeCount){
  var bucketChart = document.getElementById('allBucketChart').getContext('2d');
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

function doughnutRender(labels, compData, haveData){
  var haveChart = document.getElementById('howManyGetBucket').getContext('2d');
  var compChart = document.getElementById('howManyCompleteBucket').getContext('2d');

  var myDoughnutHaveChart = new Chart(haveChart, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
            {
                data: haveData,
                backgroundColor: [
                    "#7ecc00",
                    "#ff957e",
                    "#efca31",
                    "#7do4bb",
                    "#7890d0",
                    "#bf95c3",
                    "#94549e",
                    "#13CE76",
                ],
                hoverBackgroundColor: [
                    "#7ecc00",
                    "#ff957e",
                    "#efca31",
                    "#7do4bb",
                    "#7890d0",
                    "#bf95c3",
                    "#94549e",
                    "#13CE76",
                ]
            }]
          },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        pieceLabel: {
          render: 'value',
          fontSize: 14,
          fontStyle: 'bold',
          fontColor: '#000',
          fontFamily: '"Lucida Console", Monaco, monospace'
        },
        legend: {
          position:"right",
          labels: {
              fontColor: 'rgb(255, 99, 132)'
          }
        },
      }
  });
  var myDoughnutCompChart = new Chart(compChart, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
            {
                data: compData,
                backgroundColor: [
                  "#7ecc00",
                  "#ff957e",
                  "#efca31",
                  "#7do4bb",
                  "#7890d0",
                  "#bf95c3",
                  "#94549e",
                  "#13CE76",
                ],
                hoverBackgroundColor: [
                  "#7ecc00",
                  "#ff957e",
                  "#efca31",
                  "#7do4bb",
                  "#7890d0",
                  "#bf95c3",
                  "#94549e",
                  "#13CE76",
                ]
            }]
          },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        pieceLabel: {
          render: 'value',
          fontSize: 14,
          fontStyle: 'bold',
          fontColor: '#000',
          fontFamily: '"Lucida Console", Monaco, monospace'
        },
        legend: {
          position:"right",
          labels: {
              fontColor: 'rgb(255, 99, 132)'
          }
        },
      }
  });
}

function createBarChart(res){
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
