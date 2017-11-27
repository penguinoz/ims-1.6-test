var templateName = 'endingNoteFollowList';

Template[templateName].onCreated(function(){
  var instance = this;
  instance.followList = new ReactiveVar();
  instance.autorun(function() {
    Meteor.call('bucketGetFollowUserList', Session.get('endingNoteLikeList postId'), function(error, result) {
      if (!error) {
        var followList = [];

        var resultData = result;
        var userIds = _.uniq(_.pluck(result, 'userId'));
        //2. userIds이용 userInfo = [{userId, profileImg, userNick},{}...] 정보 수집
        Meteor.call('getNickAndImg', userIds, function(error, result){
          if(error){
            console.log(error);
          } else {

            if (result.length !== 0) {
              instance.followList.set(
                {
                  followList: result,
                  max: followList.length - 20
                }
              );
            } else {
              instance.followList.set();
            }
          }
        });
      }
    });
  });

});

Template[templateName].helpers({
  hpFollowList: function() {
    return Template.instance().followList.get();
  }
});

Template[templateName].events({
  "click .dropdown-menu.like-container": function(e, t){
    e.stopPropagation();

    console.log('click,click');
  }
});
