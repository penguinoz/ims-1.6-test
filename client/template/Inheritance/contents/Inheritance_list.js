import {collections as CLT} from '/imports/global/collections.js';
import {global} from '/imports/global/global_things.js';

//상속받은 내역 main
var templateName = 'inheritanceList';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.inheritanceList = new ReactiveVar();
  instance.inheritanceRefuseList = new ReactiveVar();
  instance.inheritanceDeleteList = new ReactiveVar();

  // instance.selectedList = new ReactiveVar();
  // instance.selectedMenu = new ReactiveVar();
  Session.set('inheritanceList selectedList', null);
  Session.set('inheritanceList selectedMenu', null);

  var subscription = instance.subscribe('inheritanceList_inheritorId', global.login.userId);

  instance.autorun(function(){
    instance.inheritanceItem = [];
    instance.inheritanceRefuseItem = [];
    instance.inheritanceDeleteItem = [];

    if(subscription.ready()){
      var result = CLT.Inh.find().fetch();
      _.each(result, function(inhInfo){
        var inhContentsCount = 0;
        var inheritanceDate = '';


        if(inhInfo.parentInhId){ //상속의 상속 컨텐츠 확인
          var parentInherit = CLT.Inh.findOne({_id:inhInfo.parentInhId});
          if(parentInherit && parentInherit.instContents){
            inheritanceDate = inhInfo.instDate;
            inhContentsCount =  parentInherit.instContents.length;

            //즉시상속이 아닐경우 (고인의 상속)
            if(inheritanceDate && parentInherit.inheritanceDate){
              inheritanceDate = parentInherit.inheritanceDate;
              inhContentsCount =  parentInherit.contents.length;
            }
          }
        } else { //일반 상속
          if(inhInfo.instContents){
            inheritanceDate = inhInfo.instDate;
            inhContentsCount = inhInfo.instContents.length;

            //즉시상속이 아닐경우 (고인의 상속)
            if(inhInfo.inheritanceDate){
              inheritanceDate = inhInfo.inheritanceDate;
              inhContentsCount = inhInfo.contents.length;
            }
          }
        }

        //
        // if(_.isEqual(global.login.userId, inhInfo.inheritorId) && CLT.Inh.findOne({_id:inhInfo.parentInhId}).inheritanceDate && inhInfo.instDate){
        var resultSet= {};
        if(_.isEqual(global.login.userId, inhInfo.inheritorId) && inheritanceDate){
          //삭제된 컨텐츠 dDay계산
            resultSet = {
            _id : inhInfo._id,
            userId : inhInfo.userId,
            inheritorId : inhInfo.inheritorId,
            parentInhId : inhInfo.parentInhId ? inhInfo.parentInhId : '',
            msgId : inhInfo.msgId,
            inhContentsCount : inhContentsCount,
            isExistlastLetter : (inhInfo.lastLetter && !_.isEmpty(inhInfo.lastLetter) && inhInfo.inheritanceDate) ? true : false,
            isExistAsset : (inhInfo.asset && !_.isEmpty(inhInfo.asset[0]) && inhInfo.inheritanceDate) ? true : false,
            isExistContents : inhContentsCount > 0 ? true : false,
            inheritanceDate : inheritanceDate, // inheritanceDate or instDate
            inhPath : inhInfo.inhPath,
            deleteRegDate : inhInfo.deleteRegDate,
            refuseDate : inhInfo.refuseDate,
          };


          if(inhInfo.deleteRegDate && !inhInfo.isDeleted){
            var deleteRegDate = '';
            deleteRegDate = new Date(global.utilGetDate(inhInfo.deleteRegDate).default);
            deleteRegDate.setDate(deleteRegDate.getDate()+90);
            resultSet.deletedDate = new Date(deleteRegDate).format('yyyy/MM/dd HH:mm:ss');
            //삭제 대기 목록
            instance.inheritanceDeleteItem.push(resultSet);
          } else if(inhInfo.refuseDate){
            //상속거부 목록
            instance.inheritanceRefuseItem.push(resultSet);
          } else {
            //상속리스트
            instance.inheritanceItem.push(resultSet);
          }
          // if(inhInfo.deleteRegDate && inhInfo.deleteRegDate > )
          // result.push(resultSet);
        }
        //  else if(!_.isEqual(global.login.userId, inhInfo.inheritorId) && inheritanceDate){
        //   //삭제된 컨텐츠 dDay계산
        //     resultSet = {
        //     _id : inhInfo._id,
        //     userId : inhInfo.userId,
        //     inheritorId : inhInfo.inheritorId,
        //     parentInhId : inhInfo.parentInhId ? inhInfo.parentInhId : '',
        //     msgId : inhInfo.msgId,
        //     inhContentsCount : inhContentsCount,
        //     isExistlastLetter : (inhInfo.lastLetter && !_.isEmpty(inhInfo.lastLetter) && inhInfo.inheritanceDate) ? true : false,
        //     isExistAsset : (inhInfo.asset && !_.isEmpty(inhInfo.asset[0]) && inhInfo.inheritanceDate) ? true : false,
        //     isExistContents : inhContentsCount > 0 ? true : false,
        //     inheritanceDate : inheritanceDate, // inheritanceDate or instDate
        //     inhPath : inhInfo.inhPath,
        //     deleteRegDate : inhInfo.deleteRegDate,
        //     refuseDate : inhInfo.refuseDate,
        //   };
        //
        //
        //   if(inhInfo.deleteRegDate && !inhInfo.isDeleted){
        //     var deleteRegDate = '';
        //     deleteRegDate = new Date(global.utilGetDate(inhInfo.deleteRegDate).default);
        //     deleteRegDate.setDate(deleteRegDate.getDate()+90);
        //     resultSet.deletedDate = new Date(deleteRegDate).format('yyyy/MM/dd HH:mm:ss');
        //     //삭제 대기 목록
        //     instance.inheritanceDeleteItem.push(resultSet);
        //   } else if(inhInfo.refuseDate){
        //     //상속거부 목록
        //     instance.inheritanceRefuseItem.push(resultSet);
        //   } else {
        //     //상속리스트
        //     instance.inheritanceItem.push(resultSet);
        //   }
        //   // if(inhInfo.deleteRegDate && inhInfo.deleteRegDate > )
        //   // result.push(resultSet);
        // }

      });

      instance.inheritanceList.set(instance.inheritanceItem);
      instance.inheritanceDeleteList.set(instance.inheritanceDeleteItem);
      instance.inheritanceRefuseList.set(instance.inheritanceRefuseItem);
    }
  });
});

Template[templateName].onRendered(function(){

  // // 스크롤 페이징 구현
  var targetElementLeft = $('.hi-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);

  //툴팁 위치 정의
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
});

Template[templateName].helpers({
  hpInhertanceAllCount: function(){
    var result = 0;
    var inheritanceListCount =  Template.instance().inheritanceList.get() ? Template.instance().inheritanceList.get() : [];
    var inheritanceDeleteListCount = Template.instance().inheritanceDeleteList.get() ? Template.instance().inheritanceDeleteList.get() : [];
    var inheritanceRefuseListCount = Template.instance().inheritanceRefuseList.get() ? Template.instance().inheritanceRefuseList.get() : [];
    result = inheritanceListCount.length + inheritanceDeleteListCount.length + inheritanceRefuseListCount.length;
    return result;
  },
  hpInheritanceList: function(){
    return Template.instance().inheritanceList.get();
  },
  hpInheritanceDeleteList: function(){
    return Template.instance().inheritanceDeleteList.get();
  },
  hpInheritanceRefuseList: function(){
    return Template.instance().inheritanceRefuseList.get();
  },
  hpSelectedList: function(){
    // return _.isEqual(this._id, Template.instance().selectedList.get()) ? 'active' : '';
    return _.isEqual(this._id, Session.get('inheritanceList selectedList')) ? 'active' : '';
  },
  hpSelectedTemplate: function(menuName){
    var concat = menuName + this._id;
    // return _.isEqual(concat, Template.instance().selectedMenu.get());
    return _.isEqual(concat, Session.get('inheritanceList selectedMenu'));
  },
  // hpCheckDday: function(checkDate){
  //   // console.log(global.fn_diffDate(checkDate).flag, global.fn_diffDate(checkDate).diffDay);
  //   if(global.fn_diffDate(checkDate).flag === '+' || global.fn_diffDate(checkDate).diffDay === 'day'){
  //     return true;
  //   }
  //   return false;
  // },
  // hpIsDataExist: function(isExist){
  //   var result = '';
  //   if(isExist) result = 'active';
  //   return result;
  // },
  // hpSelectedButton: function(menuName){
  //   var concat = menuName + this._id;
  //   return _.isEqual(concat, Template.instance().selectedMenu.get()) ? 'hold' : '';
  // },
});

Template[templateName].events({
  "click #passAway,#revival,#delInherit,#delStatus,#delReadyStatus": function(e, t){
    e.preventDefault();
    var loginUser = global.login.userId;
    var condition={};
    var data ={};

    switch(e.currentTarget.id){
      case 'revival':
        userId= t.$('[name=userId]').val();
        if(userId){
          Meteor.call('setPassAway', userId, false, function(error, result){
            if(error){
              return console.log(error);
            }
          });
        } else {
          return global.utilAlert('사용자ID를 입력해주세요');
        }
      break;

      case 'passAway':
        userId= $('[name=userId]').val();
        if(userId){
          Meteor.call('setPassAway', userId, true, function(error, result){
            if(error){
              return console.log(error);
            }
          });
        } else {
          return global.utilAlert('사용자ID를 입력해주세요');
        }
      break;

      case 'delStatus':
        condition={
          inheritorId : loginUser,
          $and : [
            {deleteRegDate : {$ne : ''}},
            {deleteRegDate : {$exists:true}}
          ]
        };
        data={
          $set:{
            deleteRegDate : '2016/03/27 11:11:11',
            updateDate : global.utilGetDate().default
          }
        };

        // 삭제등록일자 업데이트
        Meteor.call('updateInheritor', condition, data, function(error, result){
          if(error){
            return console.log(error);
          }
        });
      break;

      case 'delReadyStatus':
        condition={
          inheritorId : loginUser,
          $and : [
            {deleteRegDate : {$ne : ''}},
            {deleteRegDate : {$exists:true}}
          ]
        };

        data={
          $set:{
            deleteRegDate : global.utilGetDate().default,
            updateDate : global.utilGetDate().default
          }
        };

        // 삭제등록일자 업데이트
        Meteor.call('updateInheritor', condition, data, function(error, result){
          if(error){
            return console.log(error);
          }
        });
      break;
      default :
      // var inheritType = 'inherit';
      // if(e.currentTarget.id === 'addInheritInstant'){
      //   inheritType = 'instant';
      // }
      // preSavedData = CLT.Inh.find({inheritorId: loginUser}).fetch();
      //
      // var searchOp = ['profile.friends.accept'];
      // var friendsList = global.utilGetUsersInfo([loginUser],searchOp)[0].profile.friends.accept;
      // console.log(friendsList, preSavedData);
      // if(friendsList){
      //   _.each(friendsList, function(friendInfo){
      //     var isSaved = false;
      //     _.each(preSavedData, function(preSavedUser){
      //       if(friendInfo.userId === preSavedUser.userId){
      //         isSaved = true;
      //       }
      //     });
      //
      //     if(!isSaved){
      //     console.log(friendInfo.userId, isSaved, loginUser);
      //       Meteor.call('setInheritorExample', friendInfo.userId, loginUser, inheritType, function(error, reulst){
      //         if(error){
      //           return console.log(error);
      //         }
      //       });
      //     }
      //   });
      // } else {
      //   return alert('등록된 친구가 없으면 임시 상속 데이터를 추가할 수 없습니다.');
      // }
      break;
    }
  },

  //삭제 대기상태로 만들기
  "click #deleteInh": function(e, t){
    e.preventDefault();
    var targetUser = this.userId;
    var self = this;
    global.utilConfirm('삭제를 선택하면 90일 뒤 삭제됩니다.\r\n삭제 전까지는 삭제를 취소할 수 있으나, 삭제 상태에서는 내용을 볼 수 없습니다.').then(function(val) {
      if (val) {
        var condition={
          _id: self._id,
        };

        var data={
          $set:{
            deleteRegDate : global.utilGetDate().default,
            updateDate : global.utilGetDate().default
          }
        };

        // 삭제등록일자 업데이트
        Meteor.call('updateInheritor', condition, data, function(error, result){
          if(error){
            return console.log(error);
          }else{
            Meteor.call('setLog', null, '', global.login.userId, targetUser, global.pageType.inHeritance, '', 'requestDelInh','' );
          }
        });
      }
    }).catch(swal.noop);
  },
  //상속 삭제, 삭제복구
  "click #delDeleteInh,#delRestoreInh": function(e, t){
    e.preventDefault();

    var self = this;
    var condition = {_id: this._id};
    var data = {};
    var targetUser = this.userId;
    if(_.isEqual(e.currentTarget.id, 'delDeleteInh')){//삭속대기 내용 삭제
      global.utilConfirm('완전 삭제까지 ' + global.fn_diffDate(self.deletedDate).diffDay +'일 남았습니다.\r\n상속내역을 삭제하면 상속받은 내역을 더이상 볼 수 없습니다.\r\n삭제하시겠습니까?').then(function(val) {
        if (val) {
          data={
            $set:{
              instContents : [],
              instDate : '',
              isDeleted : true,
              updateDate : global.utilGetDate().default
            }
          };

          // 삭제등록일자 업데이트
          Meteor.call('updateInheritor', condition, data, function(error, result){
            if(error){
              return console.log(error);
            }else{
              Meteor.call('setLog', null, '', global.login.userId, targetUser, global.pageType.inHeritance, '', 'deletedInh','' );
            }
          });
        }
      }).catch(swal.noop);
    } else { //삭제대기 내역 원복
      global.utilConfirm('완전 삭제까지 ' + global.fn_diffDate(self.deletedDate).diffDay +'일 남았습니다.\r\n삭제를 취소하면 상속받은 내역을 계속 유지할 수 있습니다.').then(function(val) {
        if (val) {
          data={
            $set:{
              deleteRegDate : '',
              updateDate : global.utilGetDate().default
            }
          };

          // 삭제등록일자 업데이트
          Meteor.call('updateInheritor', condition, data, function(error, result){
            if(error){
              return console.log(error);
            }else{
              Meteor.call('setLog', null, '', global.login.userId, targetUser, global.pageType.inHeritance, '', 'restoreDelInh','' );
            }
          });
        }
      }).catch(swal.noop);
    }
  },
  //상속 거부
  "click #refuseInh": function(e, t){
    e.preventDefault();

    var self = this;
    var condition = {_id: this._id};
    global.utilConfirm(global.fn_getNickName(self.userId) + '님의 상속을 거부하겠습니까?\r\n상속 거부하면 '+global.fn_getNickName(self.userId)+'님이 더이상 회원님에게 상속을 할 수 없게 됩니다.').then(function(val) {
      if (val) {
        data={
          $set:{
            refuseDate : global.utilGetDate().default,
            updateDate : global.utilGetDate().default
          }
        };

        // 삭제등록일자 업데이트
        var targetUser = self.userId;
        Meteor.call('updateInheritor', condition, data, function(error, result){
          if(error){
            return console.log(error);
          }else{
            Meteor.call('setLog', null, '', global.login.userId, targetUser, global.pageType.inHeritance, '', 'refuseInh','' );
          }
        });
      }
    }).catch(swal.noop);
  },
  //상속 거부 취소
  "click #refRestoreInh": function(e, t){
    e.preventDefault();

    var self = this;
    var condition = {_id: this._id};
    global.utilConfirm(global.fn_getNickName(self.userId) + '님의 상속거부를 취소하겠습니까?\r\n상속 거부를 취소 더라도 기존 상속 시도한 내용은 보이지 않습니다.').then(function(val) {
      if (val) {
        data={
          $set:{
            refuseDate : '',
            updateDate : global.utilGetDate().default
          }
        };
        var targetUser = self.userId;
        // 삭제등록일자 업데이트
        Meteor.call('updateInheritor', condition, data, function(error, result){
          if(error){
            return console.log(error);
          }else{
            Meteor.call('setLog', null, '', global.login.userId, targetUser, global.pageType.inHeritance, '', 'restoreInh','' );
          }
        });
      }
    }).catch(swal.noop);
  },
  //내용 접기 /펼치기
  "click [name=deleteSlideToggle],[name=refuseSlideToggle]": function(e, t){
    e.preventDefault();

    var slideTarget;
    switch(e.currentTarget.name){
      case 'deleteSlideToggle':
        slideTarget = $('.ihn-inheritanced-list.deleteList');
        break;
      case 'refuseSlideToggle':
        slideTarget = $('.ihn-inheritanced-list.deleteList');
        break;
    }

    slideTarget.slideToggle( "fast", function() {
      e.stopPropagation();
      if(slideTarget.hasClass("on")){
        slideTarget.removeClass("on");
        $(e.currentTarget).find('i').removeClass('ion-chevron-up');
        $(e.currentTarget).find('i').addClass('ion-chevron-down');
      }else{
        slideTarget.addClass("on");
        $(e.currentTarget).find('i').removeClass('ion-chevron-down');
        $(e.currentTarget).find('i').addClass('ion-chevron-up');
      }
    });
  }
});
//==============================================================================================
//버튼 생성 템플릿
Template.inheritanceListButtons.onRendered(function(){
  // this.$('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});
  this.$('.imsr-tooltip.top').tooltip({placement: 'top'});
  this.$('.imsr-tooltip.bottom').tooltip({placement: 'bottom'});
});

Template.inheritanceListButtons.events({
  //메시지 열고 닫기
  "click .lastletter,.asset,.contents": function(e, t) {
    e.preventDefault();

    if(_.isEqual(e.currentTarget.name, 'false') || !e.currentTarget.name){
      return;
    }

    if( Session.get('inheritanceList selectedList') === this.data._id){
       Session.set('inheritanceList selectedList', null);
       Session.set('inheritanceList selectedMenu', null);
    } else {
      Session.set('inheritanceList selectedList', this.data._id);
      Session.set('inheritanceList selectedMenu', e.currentTarget.id);
    }
  }
});

Template.inheritanceListButtons.helpers({
  hpCheckDday: function(checkDate){
    // console.log(global.fn_diffDate(checkDate).flag, global.fn_diffDate(checkDate).diffDay);
    if(global.fn_diffDate(checkDate).flag === '+' || global.fn_diffDate(checkDate).diffDay === 'day'){
      return true;
    }
    return false;
  },
  hpIsDataExist: function(isExist){
    var result = '';
    if(isExist) result = 'active';
    return result;
  },
  hpSelectedButton: function(menuName){
    var concat = menuName + this._id;
    // return _.isEqual(concat, Template.instance().selectedMenu.get()) ? 'hold' : '';
    return _.isEqual(concat, Session.get('inheritanceList selectedMenu')) ? 'hold' : '';
  }
});
