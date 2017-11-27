var templateName = 'emoticon';

Template[templateName].onCreated(function(){
  this.type = this.data; // main인지 sub인지
  this.emoticon1 = new ReactiveVar(Emojis.find({},{skip:0, limit:100}).fetch());
  this.emoticon2 = new ReactiveVar(Emojis.find({},{skip:100, limit:100}).fetch());
  this.emoticon3 = new ReactiveVar(Emojis.find({},{skip:200, limit:100}).fetch());
});

Template[templateName].onRendered(function(){

});

Template[templateName].events({
  "click #emoji": function(e, t) {
    e.preventDefault();
    var emoji = e.target.getAttribute('value');
    var comment = null;
    if (t.type === 'main') {
      comment = $('#txtComment').val();
      $('#txtComment').val(comment + emoji);
    } else {
      comment = $('#txtCommentSub').val();
      $('#txtCommentSub').val(comment + emoji);
    }
  },
    "click #popClose": function(e, t) {
      e.preventDefault();
      $(e.target).parents('.comment-pop').hide();
    }
});

Template[templateName].helpers({
  hpEmoji1: function() {
    return Template.instance().emoticon1.get();
  },
  hpEmoji2: function() {
    return Template.instance().emoticon2.get();
  },
  hpEmoji3: function() {
    return Template.instance().emoticon3.get();
  }
});
