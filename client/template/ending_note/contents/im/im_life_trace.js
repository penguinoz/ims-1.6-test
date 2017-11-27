import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

// 나는 > 발자취
var templateName = 'imLifeTrace';

var currentData = [];
var domData = [];
var inOrUpdateDate = [];
var collection = [];
var saveAndEditCol = [];
var unSavedList = [];
var unSavedDbList = [];
var unloadData = false;
var userId = null;
Template[templateName].onCreated(function(){
	var instance = this;
	userId = global.login.userId;
	Blaze._allowJavascriptUrls();
	Session.set('imLifeTrace Collection', null);
	Session.set('imLifeTrace reset', true);

	instance.autorun(function (){
		var subscription =  instance.subscribe("endingNoteImLifeTrace", userId);

		domData = [];
		var defualt = [];
		//임시
		if (subscription.ready()) {
			var fetchData = CLT.EnImLifeTrace.find().fetch();

			if(unSavedDbList !== undefined){
				for(var i=0; i<unSavedDbList.length; i++){
					if(fetchData.indexOf(unSavedDbList[i]._id) !== -1){
						var curIndex = fetchData.indexOf(unSavedDbList[i]._id);
						//수정버튼 보이기
						$('#'+targetIndex).find('#saveBt').removeClass("hidden");
						fetchData[curIndex].title = unSavedDbList[i].title;
						fetchData[curIndex].fromDate = unSavedDbList[i].fromDate;
						fetchData[curIndex].toDate = unSavedDbList[i].toDate;
						fetchData[curIndex].lat = unSavedDbList[i].lat;
						fetchData[curIndex].lng = unSavedDbList[i].lng;
					}
				}
			}
			fetchData.forEach(function(data){

				//동일한 태그를 가진 사용자의 수 정보 가져오기
				var sameAnswerUserCount = CLT.EnStory.find({'userId': {$ne:userId}, 'tagList': { $in: [data.title] }}).count();
				data.sameAnswerUserCount = sameAnswerUserCount;

				//tag에 연결된 내 추억글 개수 정보 가져오기
				var memoryListCount = CLT.EnStory.find({'userId': userId, 'tagList': { $in: [data.title] }}).count();
				data.memoryListCount = memoryListCount;
				defualt.push(data);
			});
			unloadData = true;	//추가된 로우 삭제시 ussave 파일 추가 방지 토글
			// if(defualt.length){
			Session.set('imLifeTrace Collection' , defualt);
			// }
		}

	});
});

Template[templateName].onRendered(function(){
	var targetElementLeft = $('.hr-scroll');

  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    }
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].onDestroyed(function(){
	Session.set('imLifeTrace Collection' , null);
});


Template[templateName].helpers({
	hptraceCollection: function(){
		if (Session.get('imLifeTrace Collection') !== null) {
			currentData = Session.get('imLifeTrace Collection');
			if(unSavedList !== undefined && unloadData === true){
				for(var i = 0 ; i < unSavedList.length ; i++){
					unSavedList[i].index = currentData.length;
					currentData.push(unSavedList[i]);
				}
			}
			onStartSetRow();

			return currentData;
		}

	},
	//위치serch에서 가져온 위치정보
	setAddressInfo: function(data, targetId){

		currentData[index].address = data.address;
		currentData[index].lat = data.lat;
		currentData[index].lng = data.lng;
		$('#'+index).find('#saveBt').show();
		if(Session.get('imLifeTrace Collection')) {
			domData = Session.get('imLifeTrace Collection');
		}


		for (var i = 0; i < currentData.length; i++) {
			if (currentData[i]._id === undefined) {
				domData.push({
					userId : userId,
					title : '새 위치',
					address : currentData[i].address,
					type:currentData[i].type,
					lat : currentData[i].lat,
					lng : currentData[i].lng,
					fromDate : global.utilGetDate().defaultYMD,//.substring(0,11).replace(/. /g,'-'),
					toDate : global.utilGetDate().defaultYMD//.substring(0,11).replace(/. /g,'-')
				});

			} else {
				for (var j = 0; j < domData.length; j++) {
					if (currentData[i]._id === domData[j]._id) {
						domData[j].address = currentData[i].address;
						domData[j].lat = currentData[i].lat;
						domData[j].lng = currentData[i].lng;
					}
				}
			}
		}

		Template.imLifeTraceViewer.__helpers.get('collection')(domData);
		setMapCenter(data.lat,data.lng);

		unloadData = false;	//추가된 로우 삭제시 ussave 파일 추가 방지 토글
		Session.set('imLifeTrace Collection', currentData);
	},
	hpCheckTypeHome: function(type){
		return _.isEqual("home",type);
	},
	hpCheckTypeSchool: function(type){
		return _.isEqual("school",type);
	},
	hpCheckTypeSocial: function(type){
		return _.isEqual("social",type);
	},
	hpVisibleSave: function(vis){
		if(vis === undefined){
			vis = true;
		}
		return vis;
	},
	//수정정보를 기존 list에 저장또는 push
	hpRemoveClass: function(targetIndex){
		$('#'+targetIndex).parent().find('#saveBt').removeClass("hidden");

		if(_.isUndefined(unSavedDbList)){
			//데이터가 리스트에 있을시 업댓하고 아니면 push
			for(var i=0; i<unSavedDbList.length ; i++ ){
				if(_.isEqual(unSavedDbList[i]._id,currentData[targetIndex]._id)){
					unSavedDbList[i]._id = $('#'+targetIndex).find('#_id')[0].value;
					unSavedDbList[i].title = $('#'+targetIndex).find('#title')[0].value;
					unSavedDbList[i].fromDate = $('#'+targetIndex).find('.fromDate')[0].value;
					unSavedDbList[i].toDate = $('#'+targetIndex).find('.toDate')[0].value;
					unSavedDbList[i].address = $('#'+targetIndex).find('#address')[0].value;
					unSavedDbList[i].lat = $('#'+targetIndex).find('#lat')[0].value;
					unSavedDbList[i].lng = $('#'+targetIndex).find('#lng')[0].value;
					unSavedDbList[i].visibleOp = false;
				}else{
					unSavedDbList.push(currentData[targetIndex]);
				}
			}
		}else{
			var pushData = {_id: "",
			title: "",
			fromDate: "",
			toDate: "",
			lat:"",
			lng:"",
			visibleOp:false};
			pushData._id = $('#'+targetIndex).find('#_id')[0].value;
			pushData.title = $('#'+targetIndex).find('#title')[0].value;
			pushData.fromDate = $('#'+targetIndex).find('.fromDate')[0].value;
			pushData.toDate = $('#'+targetIndex).find('.toDate')[0].value;
			if($('#'+targetIndex).find('#address')[0] != undefined){
				pushData.address = $('#'+targetIndex).find('#address')[0].value;
				pushData.lat = $('#'+targetIndex).find('#lat')[0].value;
				pushData.lng = $('#'+targetIndex).find('#lng')[0].value;
			}
			unSavedDbList.push(pushData);
		}
	},
	hpReset: function(){
		return Session.get('imLifeTrace reset');
	}

});

Template[templateName].events({
	"click .mapImg,#address": function(e, t) {
		e.preventDefault();

		if(e.target.id === "address"){
			index = e.target.name;
		}else{
			index = e.target.id;
		}
		var _id = this._id;
		var titleValue = this.title;
		// if(this.address != undefined){
		// 	var addrValue = $('#'+index).find('#address')[0].value;
		// 	var latValue =  $('#'+index).find('#lat')[0].value;
		// 	var lngValue =  $('#'+index).find('#lng')[0].value;
		// }
		var indexId = index;

		var modalobj = {};
		modalobj.template = t.$(e.target).data('modal-template');
		modalobj.size = 'imsr-pop modal-lg im';
		modalobj.fade = true;      modalobj.backdrop = 'static';
		modalobj.data = {
			title : titleValue,
			index : indexId,
			parentViewId: Blaze.currentView.name,
			location : {
				lat : parseFloat(this.lat), //template.$(e.target).data('lat'),
				lng : parseFloat(this.lng) //template.$(e.target).data('lng')
			},
			targetId : _id,
		};

		global.utilModalOpen(e, modalobj);
	},
	"click #fullScreenView": function(e, t){
		var modalobj = {};
		modalobj.template = t.$(e.target).data('modal-template');
		modalobj.size = 'imsr-pop modal-xxl im';
		modalobj.fade = true;      modalobj.backdrop = 'static';
		modalobj.data = {
			screenId:'bigScreen',
			rangeId:'bigScreenRange'
		};

		global.utilModalOpen(e, modalobj);
	},
	"click #saveBt": function(e, t){
		e.preventDefault();
		var isModification = false;
		var saveIndex = $(e.currentTarget).data("name");
		//var imLifeTraceCol = Session.get('imLifeTrace Collection');
		//var id = imLifeTraceCol[saveIndex]._id;
		var title = $('#'+saveIndex).find('#title')[0];
		var fromDate = $('#'+saveIndex).find('.fromDate')[0];
		var toDate = $('#'+saveIndex).find('.toDate')[0];



		if(title.value === "" || title.value === undefined){
			global.utilAlert("제목을 작성해 주셔야 합니다.");
			title.focus();
			return;
		}
		if(currentData[saveIndex].address === "" || currentData[saveIndex].address === undefined){
			global.utilAlert("주소를 작성해 주셔야 합니다.");
			return;
		}
		if(!fromDate.value){
			global.utilAlert("시작일자를 작성해주셔야 합니다.");
			fromDate.focus();
			return;
		}

		// if(toDate.value &&fromDate.value > toDate.value){
		// 	alert("from 일자가 to 일자보다 클수 없습니다.");
		// 	toDate.focus();
		// 	return;
		// }

		// 시작일 종료일 체크하기
		if (global.utilCalendarBetween(fromDate.value, toDate.value)) {
			toDate.focus();
			return global.utilAlert('종료일이 시작일보다 빠릅니다. 날짜를 확인해주세요.');
		}

		$('#'+saveIndex).parent().find('#saveBt').addClass("hidden");
		if(global.fn_isExist(currentData[saveIndex]._id)){
			//save일경우 usSavedDblist 에서 삭제
			delSavedDbData(currentData[saveIndex]._id);
			isModification = true;
		}

		currentData[saveIndex].userId = userId;
		currentData[saveIndex].title = title.value;
		currentData[saveIndex].fromDate = fromDate.value;
		currentData[saveIndex].toDate = toDate.value;

		getUnSavedList(saveIndex);		//db에 업되지 않은 작성중 리스트 저장
		Meteor.call('lifeTraceUpsert', currentData[saveIndex]._id, currentData[saveIndex], function(error, result){
			if(error) {
				return alert(error);
			} else {
				var postId = result.insertedId;
				var type = global.pageType.lifeTrace;
				if(!isModification){
					global.utilTimelineRegister(postId, userId, type, fromDate.value, toDate.value);
				}
				Session.set('imLifeTrace reset',false);
				setTimeout(function(){
					 Session.set('imLifeTrace reset',true);
				}, 100);
			}
		});

		//타임라인 갱신때문에 수정은 밖으로 뺌
		if(isModification){
			var obj = [{
				userId: userId,
				timeClass: 'start',
				contentType: 'E',
				timelineDate: global.utilGetDate(fromDate.value).defaultYMD,
				updateDate: global.utilGetDate().default
			}, {
				userId: userId,
				timeClass: 'end',
				contentType: 'E',
				timelineDate: global.utilGetDate(toDate.value).defaultYMD,
				updateDate: global.utilGetDate().default
			}];
			Meteor.call('enTimelineUpdate', currentData[saveIndex]._id, obj, function(error) {
				if (error) {
					return alert(error);
				}
			});
		}
	},

	"click #addBtHome": function(e, t){
		addRow('home');
	},
	"click #addBtSocial": function(e, t){
		addRow('social');
	},

	"click #addBtSchool": function(e, t){
		addRow('school');
	},
	//row 추가 사용 안함
	// "click #title,#address,.fromDate,.toDate": function(e, t){
		// var targetIndex = e.target.name;
		// var maxIndex = "";
		// var type = currentData[targetIndex].type;
		// for(var i = 0; i < currentData.length; i++){
		//
		// 	if(_.isEqual(type,currentData[i].type)){
		// 		maxIndex = i;
		// 	}
		// }
		//
		// if(_.isEqual(parseInt(targetIndex),maxIndex) && !_.isUndefined(currentData[targetIndex]._id)){
		// 	addRow(type);
		// }
		//
		// // if(currentData[targetIndex].visibleOp === undefined || currentData[targetIndex].visibleOp === true){
		// //currentData[targetIndex].visibleOp = false;
		// // }
	// },

	"click #delRowBt": function(e, t){
		var selectedIndex = $(e.currentTarget).data("name");
		getUnSavedList();		//db에 업되지 않은 작성중 리스트 저장
		//var imLifeTraceCol = Session.get('imLifeTrace Collection');
		var postId = currentData[selectedIndex]._id;

		if(global.fn_isExist(postId)){
			global.utilConfirm('삭제 하시겠습니까?').then(function(val) {
				if (val) {
					Meteor.call('lifeTraceDelete', postId, function(error){
						if(error) {
							return alert(error);
						}else{
							//del인경우 usSavedDblist 에서 삭제
							delSavedDbData(postId);

							//타임라인에서 삭제
							Meteor.call('enTimelineDalete', postId, function(error) {
								if (error) {
									return alert(error);
								}
							});
						}
					});
				} else {
					return;
				}
			}).catch(swal.noop);
		} else {
			var parsingIndex =parseInt(selectedIndex);
			for(var i = 0; i < unSavedList.length; i++){
				if(unSavedList[i].index === parsingIndex){
					currentData.splice(parsingIndex,1);
					unSavedList.splice(i,1);
				}
			}
			for(var k=0; k < currentData.length ; k++){
				if(currentData[k]._id === undefined){
					currentData[k].index = k;
				}
			}

			$('#'+parsingIndex).find('#title')[0].value = "";
			$('#'+parsingIndex).find('#address')[0].value = "";
			$('#'+parsingIndex).find('.fromDate')[0].value = moment().format('YYYY-MM-DD');
			$('#'+parsingIndex).find('.toDate')[0].value = moment().format('YYYY-MM-DD');
			onStartSetRow();
			unloadData = false;
			Session.set('imLifeTrace Collection', currentData);
		}
	},
	'click #lnkMemListCnt': function(e, t){
		e.preventDefault();

		var templateData = {};

		templateData.headerTmp = 'endingNoteListHeader';
		templateData.contentTmp = 'imContent';
		templateData.data = {
			searchOption : {
				filter : 'tag',
				searchText : this.title
			}
		};
		Session.set('endingNoteList templateData', templateData);
	},
	"change #title,#address,.fromDate,.toDate": function(e, t){
		var targetIndex = e.target.name;
		// $('#'+targetIndex).find('#saveBt').removeClass("hidden");
		Template.imLifeTrace.__helpers.get('hpRemoveClass')(targetIndex);
	},

});

function addRow(type) {
	// var imLifeTraceCol = Session.get('imLifeTrace Collection');
	currentData.push({'index': currentData.length ,
	userId:userId,
	title:'',
	fromDate:"",
	toDate:"",
	address:"",
	lat:"",
	lng:"",
	type:type,
	sameAnswerUserCount:0,
	memoryListCount:0,
	visibleOp:false
});
unloadData = false;
Session.set('imLifeTrace Collection', currentData);
}

function getUnSavedList(saveIndex){
	unSavedList = [];
	for(var i = 0; i < currentData.length ; i++){
		if( currentData[i]._id === undefined && i !== parseInt(saveIndex)){

			var saveName = $('#'+i).find('#title')[0].value;
			var saveFrom = $('#'+i).find('.fromDate')[0].value;
			var saveTo = $('#'+i).find('.toDate')[0].value;

			currentData[i].title = saveName;
			currentData[i].fromDate = saveFrom;
			currentData[i].toDate = saveTo;
			currentData[i].visibleOp = false;

			unSavedList.push( currentData[i] );
		}
	}
	//del인경우 push하지 않음
	if(!_.isUndefined(saveIndex)){
		if(_.isUndefined(currentData[saveIndex]._id)){
			setEmptyRow(currentData[parseInt(saveIndex)].type);
			unSavedList.push(currentData[currentData.length-1]);
		}
	}
}
// 화면 초기화 빈로우 추가
function setEmptyRow(type){
	if(_.isUndefined(currentData)){
		return;
	}
	currentData.push({'index': currentData.length ,
	userId:userId,
	title:'',
	fromDate:"",
	toDate:"",
	address:"",
	lat:"",
	lng:"",
	sameAnswerUserCount:0,
	memoryListCount:0,
	type:type,
	visibleOp:false
});
//$('#'+currentData.length).find('#saveBt').show();
}
// unSavedDBlist 중 대상 삭제
function delSavedDbData(id){
	var delIndex = unSavedDbList.indexOf(id);
	if(delIndex !== -1 ){
		unSavedDbList.splice(delIndex,0);
	}
}
function onStartSetRow(){
	if(!_.isUndefined(currentData)){
		if(!_.where(currentData, {type:"home" , _id:""}).length && !_.where(currentData, {type:"home" , _id:undefined}).length){
			setEmptyRow("home");
		}
		if(!_.where(currentData, {type:"school" , _id:""}).length && !_.where(currentData, {type:"school" , _id:undefined}).length){
			setEmptyRow("school");
		}
		if(!_.where(currentData, {type:"social" , _id:""}).length && !_.where(currentData, {type:"social" , _id:undefined}).length){
			setEmptyRow("social");
		}
	}
}
