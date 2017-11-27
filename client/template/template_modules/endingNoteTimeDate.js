import {global} from '/imports/global/global_things.js';

var templateName = 'endingNoteTimeDate';
var container, timeline;
var items = new vis.DataSet();
var instance;

Template[templateName].onRendered(function(){

  instance = this;
  instance.birthDay = global.fn_getUserInfo(global.login.userId).birthday.date;
  instance.userYear = global.utilGetPastAge(instance.birthDay, new Date().format("yyyy-MM-dd"))-1;
  if(instance.userYear > 100){
    instance.userYear = 100;
  }
  Meteor.call('getExpectYear', instance.userYear ,function(err,res){
    if(err)console.log(err);
    if(res){
      // var hopeYear = new Date (Math.ceil(res.expectYear) + instance.userYear, 0,1);
      // hopeYear = hopeYear.format("yyyy-MM-dd");
      //초기 기대수명을 등록하는 부분
      // var expLifeTemp = global.fn_getCalDateByYear(instance.birthDay,hopeYear,'SUM');
      var expLifeTemp = parseInt(instance.birthDay.substr(0,4)) + Math.round(res.expectYear) + instance.userYear-1;
      expLifeTemp = expLifeTemp+"-01-01";

      if(global.fn_getUserInfo(global.login.userId).expectYear){
        instance.expLifeDate = global.fn_getUserInfo(global.login.userId).expectYear;
      }else{
        instance.expLifeDate = global.utilGetDate(expLifeTemp).defaultYMD;
      }

      initDrawTimeLine(instance.birthDay, instance.expLifeDate);
    }
  });

});

Template[templateName].events({
  "click #findTimelineSetNum": function(e,t){
    setHopeYearsFnc(e,t);
  },
  "keyup #timelineSetNum": function(e,t){
    if (e.which === 13) {
      setHopeYearsFnc(e,t);
    }
    // if (e.which === 13) {
    //   var reg = new RegExp('([^0-9])','g');
    //   var stVal = $('#timelineSetNum').val();
    //   if(stVal === "" || reg.exec(stVal) !== null){
    //     global.utilAlert('숫자를 입력해 주세요');
    //     return;
    //   }
    //   if(parseInt(stVal) >= 150){
    //     global.utilAlert('150세 이상 입력 할수 없습니다.');
    //     return;
    //   }
    //   var targetday = todayChange(global.fn_getUserInfo(global.login.userId).birthday.date ,  parseInt(stVal));
    //   var countdate = new Date(targetday) - new Date();
    //   countdate = parseInt(countdate/(1000*60*60*24));
    //   if(countdate < 0){
    //     global.utilAlert('기대수명이 지났습니다.');
    //     initDrawTimeLine(global.fn_getUserInfo(global.login.userId).birthday.date, global.fn_getUserInfo(global.login.userId).expectYear );
    //     return;
    //   }
    //    e.preventDefault();
    //    Meteor.call('setExpectYear',global.login.userId,stVal,function(err,res){
    //      if(err){
    //        console.log(err);
    //      }
    //    });
    //    reflashDrawTimeLine();
    //    //마우스커서 빼기
    //    $('#timelineSetNum').blur();
    // }
  }
});

Template[templateName].helpers({
});

/*
* @ 기대수명 입력 시 reflash
* ex)reflashDrawTimeLine()
*/
var reflashDrawTimeLine = function() {
  // var birth = Template.instance().birthDay;
  // var setYears    = parseInt($('#timelineSetNum').val());
  // var changeDate  = todayChange(birth, setYears);
  // changeDate = new Date(changeDate);
  // var startDate = new Date(birth);
  // var hopeDay =  startDate.setFullYear(startDate.getFullYear()+setYears);
  // var contentsStr = '';
  // contentsStr += '기대수명';
  //
  // var countdate = new Date(hopeDay) - new Date();
  // countdate = parseInt(countdate/(1000*60*60*24)).toString();
  // countdate = countdate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //
  // var buildString='';
  // for(var i=0; i < countdate.length; i++){
  // if(countdate.charAt(i) === ','){
  //  buildString += countdate.charAt(i);
  // } else {
  //  buildString += '<span class="count-length">'+ countdate.charAt(i) +'</span>';
  // }
  //
  // // console.log(a.charAt(i), b);
  // }
  //
  // var contentCount = '<span id="clockbox">' + buildString + '</span>일 남았습니다.';
  // // contentCount += '<a href="javascript:void(0)" id="inheritance">상속</a>';
  // var data = [
  // 	{
	//     id: 2,
	//     content: contentsStr,
	//     start: changeDate
  // 	},
  //   {
	//     id: 3,
	//     content: contentCount,
	//     start: new Date().format('yyyy-MM-dd')
  // 	}
  // ];
  // items.update(data);
  // timeline.moveTo(changeDate);
  // timeline.removeCustomTime('endingDay');
  // timeline.addCustomTime(changeDate, "endingDay");
  // var dateForm = new Date(changeDate);
  // // timeline.range.options.max = dateForm.setFullYear(dateForm.getFullYear()+10);
  // var options = {
  //   showCurrentTime: false,
  //   clickToUse:false,
  //   // timeAxis: {scale: 'year', step: 10},
  //   zoomable : false,
  //   // margin: {axis : 5},
  //   // moveable:false, //zoom desable
  //   // editable: {
  //   //   //updateTime: true,  // drag items horizontally
  //   //   // updateGroup: true, // drag items from one group to another
  //   //   //remove: true,       // delete an item by tapping the delete button top right
  //   //   //overrideItems: false  // allow these options to override item.editable
  //   // },
  //   width: '90%',
  //   height: '75px',
  //   min: new Date((new Date(birth).getFullYear()),1,1),                // lower limit of visible range
  //   max: new Date((changeDate.getFullYear()),1,1),                // upper limit of visible range
  //   // zoomMin: 3000 * 60 * 60 * 24 * 31 * 12 * 20,             // one day in milliseconds
  //   // zoomMax: 5000 * 60 * 60 * 24 * 31 * 12 * 20,     // about three months in milliseconds
  // };
  // timeline.range.options = options;
  // // new Date((new Date(exLifeDate).getFullYear()),1,1)

  // var birth = Template.instance().birthDay; //생일자
  // var setYears    = parseInt($('#timelineSetNum').val()); //입력받은 기대수명
  // var changeDate  = todayChange(birth, setYears); //기대수명일자
  // timeline.destroy();
  // initDrawTimeLine(birth, todayChange(birth, setYears));


  var birth = Template.instance().birthDay; //생일자
  var setYears    = parseInt($('#timelineSetNum').val()); //입력받은 기대수명

  var myOld = global.utilGetPastAge(birth,global.utilGetDate().defaultYMD);
  var restYear = setYears - myOld;
  // var changeDate  =   new Date(global.fn_getCalDateByYear(global.utilGetDate().defaultYMD,restYear,'SUM')); //기대수명일자
  var changeDate  =   new Date(global.fn_getCalDateByYear(global.utilGetDate().defaultYMD,restYear,'SUM').substr(0,4),"0","1") //기대수명일자

  timeline.destroy();
  initDrawTimeLine(birth, changeDate);
};

/*
* @ 화면 초기 값 셋팅
* ex)initDrawTimeLine()
*/
var initDrawTimeLine = function(_birthDay, _expLifeDate){
  container = document.getElementById('endingNotetimelineDate');
  var exLifeDate = _expLifeDate;
  var birthDay = _birthDay;
  var contentsStr = '';
  var countdate = new Date(exLifeDate) - new Date();
  countdate = parseInt(countdate/(1000*60*60*24));
  countdate = countdate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  var setExYear = new Date(exLifeDate).getFullYear() - new Date(birthDay).getFullYear()+1;
  $("#timelineSetNum").val(setExYear);

  var buildString='';
  for(var i=0; i < countdate.length; i++){
    if(countdate.charAt(i) === ','){
     buildString += countdate.charAt(i);
    } else {
     buildString += '<span class="count-length">'+ countdate.charAt(i) +'</span>';
    }
  }
  // contentsStr += '<span id="clockbox"><span class="count-length">1</span><span class="count-length">0</span>,<span class="count-length">0</span><span class="count-length">0</span><span class="count-length">0</span>'+ countdate +'</span>일 남았습니다.';
  contentsStr += '<span id="clockbox" s>' + buildString + '</span>일 남았습니다.';
  // contentsStr += '<a href="javascript:void(0)" id="inheritance">상속</a>';

  // items = new vis.DataSet([
  // 	{
  // 		id: 1,
  // 		content: '태어난 날',
  // 		start: new Date(birthDay),
  //     align: 'center'
  // 	},
  // 	{
	//     id: 2,
	//     content: '기대수명',
	//     start: new Date(exLifeDate)
  // 	},
  //   {
  //     id: 3,
  //     content: contentsStr,
  //     start: new Date().format('yyyy-MM-dd')
  //   },
  // ]);
  items = new vis.DataSet([
  	{
  		id: 1,
  		content: '태어난 날',
  		start: new Date(birthDay),
      // align: 'center',
      className: 'item-right'
  	},
  	{
	    id: 2,
	    content: contentsStr,
	    start: new Date(exLifeDate)
  	},
    {
      id: 3,
      content: '오늘',
      start: new Date().format('yyyy-MM-dd'),
      className: 'item-today'
    },
  ]);


  // s, year : s/60/60/24/365, month : s/60/60/24%365, day : s/60/60%24%365, hours : s/60%60%24%365, s%60%60%24%365

  var options = {
    showCurrentTime: false,
    clickToUse:false,
    timeAxis: {scale: 'year', step: 5},
    zoomable : false,
    moveable : false, //zoom desable
    // margin: {axis : 5},
    // editable: {
    //   //updateTime: true,  // drag items horizontally
    //   // updateGroup: true, // drag items from one group to another
    //   //remove: true,       // delete an item by tapping the delete button top right
    //   //overrideItems: false  // allow these options to override item.editable
    // },
    // showMajorLabels : false,
    // showMinorLabels :false,
    // hiddenDates:{
    //   start: '1900-03-21 00:00:00',
    //   end: '2200-03-28 00:00:00',
    //   // repeat:'yearly'
    // },
    width: '90%',
    height: '75px',
    min: new Date((new Date(birthDay).getFullYear()-1),1,1),                // lower limit of visible range
    max: new Date((new Date(exLifeDate).getFullYear()+2),1,1),                // upper limit of visible range
    // zoomMin: 3000 * 60 * 60 * 24 * 31 * 12 * 20,             // one day in milliseconds
    // zoomMax: 5000 * 60 * 60 * 24 * 31 * 12 * 20,     // about three months in milliseconds
  };
  timeline = new vis.Timeline(container,items,options);
  timeline.moveTo(new Date().format("yyyy-MM-dd"));
  timeline.addCustomTime(birthDay, "startDay");
  timeline.addCustomTime(exLifeDate, "endingDay");
  timeline.addCustomTime(new Date().format('yyyy-MM-dd'), "currentDay");
  timeline.on('timechanged', function(properties){
    var coundDay = "";
    if(properties.id === "startDay"){
      return;
    }else{
      var startday = new Date();
      var endday = properties.time;
      countDay = endday - startday;
      $("#clockbox")[0].innerText = parseInt(countDay/(1000*60*60*24))+"";
    }
  });
};

/*
* @ 타겟 년도에 기대수명을 더한 년도 값을 구해 return한다.
* param1 : <String> 태어난날 "1981-05-06" 형식 준수
* param2 : <int> 기대수명 50세
* ex)todayChange("1981-05-06", 50);
*/
var todayChange = function(_targetDate,_years){
  // debugger;
  var tyear        = parseInt(_targetDate.substr(0,4));
  var tmonth       = parseInt(_targetDate.substr(5,2));
  var tday         = parseInt(_targetDate.substr(8,2));
  var today = new Date(tyear,tmonth-1,tday);

  today.setFullYear(today.getFullYear()+_years-1, today.getMonth());
  var year        = today.getFullYear();
  var month       = today.getMonth() ;
  var day         = today.getDate();
  var changeDate  = new Date(year,month,day);
  return changeDate;
};

function setHopeYearsFnc(e,t){
  var reg = new RegExp('([^0-9])','g');
  var stVal = $('#timelineSetNum').val();
  var expectYearParam = 0;
  //기대수명 셋팅
  if(global.fn_getUserInfo(global.login.userId).expectYear){
    expectYearParam = global.fn_getUserInfo(global.login.userId).expectYear;
  }else{
    expectYearParam = instance.expLifeDate;
  }
  if(stVal === "" || reg.exec(stVal) !== null){
    global.utilAlert('숫자를 입력해 주세요');
    return;
  }
  if(parseInt(stVal) >= 150){
    global.utilAlert('150세 이상 입력 할수 없습니다.');
    timeline.destroy();
    initDrawTimeLine(global.fn_getUserInfo(global.login.userId).birthday.date, expectYearParam );
    return;
  }
  var targetday = todayChange(global.fn_getUserInfo(global.login.userId).birthday.date ,  parseInt(stVal));
  var countdate = new Date(targetday).getFullYear() - new Date().getFullYear();
  countdate = parseInt(countdate/(1000*60*60*24));
  if(countdate <= 0){
    global.utilAlert('기대수명이 지났습니다.');
    timeline.destroy();

    initDrawTimeLine(global.fn_getUserInfo(global.login.userId).birthday.date, expectYearParam );
    return;
  }
   e.preventDefault();
   Meteor.call('setExpectYear',global.login.userId,stVal,function(err,res){
     if(err){
       console.log(err);
     }
   });
   reflashDrawTimeLine();
   //마우스커서 빼기
   $('#timelineSetNum').blur();
}

Template[templateName].onDestroyed(function(){
  var instance = null;
});
