var templateName = 'endingNoteLikeList';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.likeList = new ReactiveVar();
  instance.autorun(function() {
    Meteor.call('getLikeList', Session.get('endingNoteLikeList postId'), function(error, result) {
      if (!error) {
        var likeList = [];

        var resultData = result;
        var userIds = _.uniq(_.pluck(result, 'userId'));
        //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
        Meteor.call('getNickAndImg', userIds, function(error, result){
          if(error){
            console.log(error);
          } else {
            var userInfo = result;

            _.map(resultData, function(info){
              var extend = _.findWhere(userInfo, {userId : info.userId});
              info.nickName = extend.nickName;
              info.profileImg = extend.profileImg;
            });

            if (resultData.length !== 0) {
              instance.likeList.set(
                {
                  likeList: resultData,
                  max: likeList.length - 20
                }
              );
            } else {
              instance.likeList.set();
            }
          }
        });
      }
    });
  });

});

Template[templateName].helpers({
  hpLikeList: function() {
    return Template.instance().likeList.get();
  }
});

Template[templateName].events({
  "click .dropdown-menu.like-container": function(e, t){
    e.stopPropagation();

    console.log('click,click');
  }
});
