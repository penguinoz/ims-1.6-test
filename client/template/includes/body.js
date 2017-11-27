import {global} from '/imports/global/global_things.js';

Template.topMenu1.onCreated(function(){
  if(this.data.isNewWindow){
    global.login.pageOwner = this.data.pageOwner;
    global.login.userId = this.data.loginUser.username;
    if(this.data.authority){
      global.fn_setLoginAuth(this.data.authority);
    }else{
      global.fn_setLoginAuth('user');
    }
    Session.set('endingNoteList templateData', this.data.templateData);
  } else {
    loginCheck(this.data.loginUser);
  }
  Session.set('refresh', Session.get('refresh') ? false : true);
});

Template.topMenu2.onCreated(function(){
  if(this.data.isNewWindow){
    global.login.pageOwner = this.data.pageOwner;
    global.login.userId = this.data.loginUser.username;
    if(this.data.authority){
      global.fn_setLoginAuth(this.data.authority);
    }else{
      global.fn_setLoginAuth('user');
    }
    Session.set('endingNoteList templateData', this.data.templateData);
  } else {
    loginCheck(this.data.loginUser);
  }
  Session.set('refresh', Session.get('refresh') ? false : true);
});

Template.topMenu3.onCreated(function(){
  if(this.data.isNewWindow){
    global.login.pageOwner = this.data.pageOwner;
    global.login.userId = this.data.loginUser.username;
    if(this.data.authority){
      global.fn_setLoginAuth(this.data.authority);
    }else{
      global.fn_setLoginAuth('user');
    }
    Session.set('endingNoteList templateData', this.data.templateData);
  } else {
    loginCheck(this.data.loginUser);
  }
  Session.set('refresh', Session.get('refresh') ? false : true);
});

var loginCheck = function(_loginUser) {
  if (_loginUser) {
    if(!global.login.pageOwner){
      global.fn_setLoginId(_loginUser.username);
      global.fn_setLoginAuth(_loginUser.authority);
    }
  } else {
    Router.go('/');
  }
};
