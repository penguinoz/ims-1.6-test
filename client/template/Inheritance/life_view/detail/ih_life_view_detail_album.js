var templateName = 'ihLifeViewDetailAlbum';

var instance;
Template[templateName].onCreated(function(){
  instance = this;
  this.images = new ReactiveVar();
  this.postId = [];

  this.postId = this.data.map(function(item) {
    return item.postId;
  });

  var imageDatas = {images : this.data, imagesCount : this.data.length};
  this.images.set(imageDatas);
});

Template[templateName].events({
  'click [name=lifeViewImg]': function(e, t){
    e.preventDefault();

    if(e.target.name === 'btnExcludeImg'){
      return;
    }
    var templateData = {};
    //상셰영역에 템플릿 확인

    switch($(e.currentTarget).attr('typeData')) {
      // 나
      case 'IM':
      templateData.contentTmp = 'imDetail';
      templateData.data = {
        _id : this.postId
      };
      break;
      // 버킷
      case 'BL':
      templateData.contentTmp = 'bucketDetail';
      templateData.data = {
        _id : this.postId
      };
      break;

      // 버키스토리
      case 'BS':
      templateData.contentTmp = 'bucketDetail';
      templateData.data = {
        _id : this.parentPostId,
        subId : this.postId
      };
      break;

      //타임캡슐
      case 'TC':
      templateData.contentTmp = 'timeCapsuleDetail';
      templateData.data = {
        _id : this.postId
      };
      break;
    }
    // templateData.contentTmp = 'lifeViewDetailList'; //우측 리스트 화면 (확정된 사항 아님)

    templateData.data.parentViewId = 'inheritanceContents';
    Session.set('ihLifeView templateData', null);
    setTimeout(function(){
      Session.set('ihLifeView templateData', templateData);
    }, 100);
  },
  // 검색
  'click #searchAlbum': function(e, t) {
    e.preventDefault();

    var searchCondition = t.find('#keywordCondition').value;
    var searchText = t.find('#keywordText').value;

    Meteor.call('getAllIhImages', t.postId, true, 100, searchCondition, searchText, '', function(error, result) {
      if (!error) {
        instance.images.set(result);
      }
    });
  }
});

Template[templateName].helpers({
  hpImages: function(){
    return Template.instance().images.get();
  }
});