import {global} from '/imports/global/global_things.js';

var templateName = 'timelineQna';

Template[templateName].onCreated(function(){
  enQuestionFind(null);
});

Template[templateName].events({
  // 입력 이벤트
  "click #txtQna2, keypress #txtQna": function(e, t) {
    // e.preventDefault();
    var userId = global.login.userId;
    if (e.type === 'click' || e.keyCode === 13) {
      if (global.utilValidation(t)) {
        var text = t.find('input[id="txtQna"]').value;
        var _id = t.find('input[id="txtQna"]').getAttribute('_id');
        var questionId = t.find('input[id="txtQna"]').getAttribute('questionId');
        var questType = t.find('input[id="txtQna"]').getAttribute('questType');
        var templateData = {};

        switch(questType){
          case 'ME':
            Meteor.call('imMeQuestionIdFind', userId, questionId, function(error, result) {
              if (error) {
                return alert(error);
              } else {
                var callMethod = '';
                var objData = {};
                var answer = {
                  uid : new Meteor.Collection.ObjectID().valueOf(),
                  value: text,
                  regDate: global.utilGetDate().default,
                  updateDate: global.utilGetDate().default
                };
                if (result.length === 0) {
                  callMethod = 'imMeInsert';
                  objData = {
                    userId: userId,
                    questionId: questionId,
                    type: questType,
                    answer: [answer]
                  };
                } else {
                  callMethod = 'imMeAddUpdate';
                  objData = {
                    _id: result[0]._id,
                    answer: answer
                  };
                }

                Meteor.call(callMethod, objData, function(error, result) {
                  if (error) {
                    return alert(error);
                  } else {
                    if (callMethod !== 'imMeAddUpdate') {
                      global.utilTimelineRegister(result, userId, 'ME', global.utilGetDate().defaultYMD);
                    }

                    templateData = {
                      headerTmp: 'endingNoteListHeaderIm',
                      contentTmp: 'imMe'
                    };
                    $('#txtQna').blur().val('');
                    Session.set('endingNoteListHeaderIm selectedMenu', 'talkToMeEnding');
                    global.utilTemplateMove(templateData.headerTmp, templateData.contentTmp);
                  }
                });
              }
            });
            break;

          case 'IM':
            templateData = {
              headerTmp: 'endingNoteListHeaderIm',
              contentTmp: 'imWriting',
              data: {
                title: text
              }
            };

            $('#txtQna').blur().val('');
            Session.set('endingNoteListHeaderIm selectedMenu', 'writeEnding');
            global.utilTemplateMove(templateData.headerTmp, templateData.contentTmp, templateData.data);
            break;

          case 'WM':
            var wmObj = {
              userId: userId,
              questionId: questionId,
              content: text
            };

            Meteor.call('imWithMeQuestionInsert', wmObj, function(error, result) {
              if (!error) {
                $('#txtQna').blur().val('');
                global.utilTimelineRegister(result, userId, 'WM', global.utilGetDate().defaultYMD);

                var data = {};
                data._id = result;
                data.searchOption = {
                  filter : 'tag',
                  searchText : ''
                };
                Session.set('endingNoteListHeaderIm selectedMenu', 'feelEnding');
                global.utilTemplateMove('endingNoteListHeaderIm', 'imWithMeDetail', data);
              }
            });
          break;
        }

        Meteor.call('saveQuestionList', questionId, userId);

        // 다음질문으로 넘어가기
        enQuestionFind(questionId);
      }
    }
  },
  // 다음질문 이벤트
  "click #nextQna": function(e, t) {
    e.preventDefault();
    var questionId = e.target.getAttribute('value');
    //현재 질문 저장
    Meteor.call('saveQuestionList', questionId, global.login.userId);

    enQuestionFind(questionId);
  },
  // 더보기 이벤트
  "click #nextView": function(e, t) {
    e.preventDefault();
    var type = e.target.getAttribute('qnaType');
    var templateData = {};
    switch(type) {
      // 나
      case 'IM':
        templateData.headerTmp = 'endingNoteListHeaderIm';
        templateData.contentTmp = 'imContent';
        templateData.data = {
          selectedMenu: 'all'
        };
      break;
      // 버킷
      case 'BL':
        templateData.headerTmp = 'endingNoteListHeaderBucketList';
        templateData.contentTmp = 'bucketContent';
        templateData.data = {
          selectedMenu: 'all'
        };
      break;

      //타임캡슐
      // case 'time':
      //   templateData.headerTmp = 'endingNoteListHeaderTimeCapsule';
      //   templateData.contentTmp = 'timeCapsuleContent';
      // break;
    }
    Session.set('endingNoteList templateData', templateData);
  },
  // text open
  "click #textOpen": function(e, t) {
    e.preventDefault();

    var questionId = e.target.getAttribute('value');
    //현재 질문 저장
    Meteor.call('saveQuestionList', questionId, global.login.userId);

    enQuestionFind(questionId);
  },
  "mouseenter #overQna,.qna-popContainer": function(e, t) {
    e.preventDefault();
    $('.qna-popContainer').show();
  },
  "mouseleave #overQna,.qna-popContainer": function(e, t) {
    e.preventDefault();
    $('.qna-popContainer').hide();
  }
});

Template[templateName].helpers({
  hpCollection: function() {
    return Session.get('timelineQna data');
  },
  // 더보기 버튼
  hpQnaNext: function(type) {
    return type !== 'TK';
  },
  // content
  hpContentImage: function(data, limit) {
    var result = null;
    if (data.type === 'IM') {
      result = ReactiveMethod.call('endingNoteStoryRandom', data.type, [data.keyword], global.login.userId, limit);
    }
    return result;
  }
});

function enQuestionFind(qId) {
  Meteor.call('enQuestionFind', qId, function(error, result) {
    if (error) {
      return alert(error);
    } else {
      Session.set('timelineQna data', result);
    }
  });
}

// function randomItem(data, _id) {
//   if (_id) {
//     // 랜덤으로 선택된 데이터가 있을때 그 데이터를 제외하고 랜덤을 돌린다
//     data = data.filter(function(e) {
//       return e._id !== _id;
//     });
//   }
//   return data[Math.floor(Math.random() * data.length)];
// }
