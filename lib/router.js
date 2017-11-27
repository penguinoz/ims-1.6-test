import {global} from '/imports/global/global_things.js';
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound' ,
  data: function() {
    return {
      loginUser: Meteor.users.find({_id: Meteor.userId()}).fetch()[0]
    };
  },
  waitOn: function() {
    return Meteor.subscribe('userOneInfo', Meteor.userId());
  }
});
// TODO : Add otherwise

// onbeforeunload = function () {
//   Meteor.logout();
// };

Router.map(function() {

  //ex)
  // this.route('탬플릿명', {path: '/표시경로'});
  // // 레이아웃의 위치에 따른 배치
  // this.route('enoteMain',{
  //       path: '/enote/main',
  //       layoutTemplate: 'layout2',
  //       yieldTemplates: {
  //         'myMenu': {to: 'menu'},
  //         'myFooter': {to: 'footer'}
  //       }
  //     });
  this.route('imsMain', {path: '/'});

  this.route('/endingNote', {
    template: 'topMenu1',
  });

  //새창에서 열기(이메일 외부접근)
  this.route('/endingNote/:_id', {
    template: 'topMenu1',
    data: function() {
      var templateData = {};

      templateData.headerTmp = 'endingNoteListHeaderIm';
      templateData.contentTmp = 'imDetail';
      templateData.data = {
        _id : this.params._id
      };

      return Session.set('endingNoteList templateData', templateData);
    }
  });


  var Ready = new Blaze.ReactiveVar(false);
  this.route('/endingNote/:_type/:_contentId',{
  data: function() {
    return Session.get('newPageData');
  },
  waitOn: function () {
    var contentId = this.params._contentId;
    var type = this.params._type;
    Meteor.call('getConentsInfo', contentId, type, function(error, result){
      if(error){
      } else {
        console.log(result);
        var info = {};
        info = {
          templateData : {
            headerTmp : result.templateHeader,
            contentTmp : result.templateName,
            data : {
              _id : contentId,
              subId : _.isEqual(type, 'BS') ? result.contentInfo._id : null //버키스토리를 열기위해 subId설정
            }
          },
          isNewWindow : true,
          pageOwner : result.contentInfo.userId,
          loginUser : {
            username : Meteor.users.find({_id: Meteor.userId()}).fetch()[0].username
          }
        };

        Session.set('newPageData', info);
        Ready.set(info);
      }
    });
    return [
      function () { return Ready.get(); }
    ];
  },
  action: function () {
  if (this.ready())
    this.render('topMenu1');
  else
    this.render('loading');
  }
  });

  this.route('/lifeView', {
    template: 'topMenu2'
  });
  this.route('/lifeMap', {
    template: 'topMenu3'
  });
  this.route('/guide', {
    template: 'topMenu4'
  });

  this.route('/myPage', {
    template: 'myPage'
  });

  this.route('/download-data', function() {
    var data = Meteor.users.find().fetch();
    var fields = [
      {
        key: 'id',
        title: 'URL',
        transform: function(val, doc) {
          return Router.url('posts.show', { _id: val });
        }
      },
      {
        key: 'message',
        title: 'Message'
      },
      {
        key: 'viewsCount',
        title: 'Views',
        type: 'number'
      }
    ];

    var title = 'Posts';
    var file = ExcelEx.export(title, fields, data);
    var headers = {
      'Content-type': 'application/vnd.openxmlformats',
      'Content-Disposition': 'attachment; filename=' + title + '.xlsx'
    };

    this.response.writeHead(200, headers);
    this.response.end(file, 'binary');
  }, { where: 'server' });

  this.route('inheritanceTimelineBody', {
    path: '/inheritanceTimelineBody/:_id/:isNote/',
    layoutTemplate: 'layout2',
    data: function() {
      return this.params;
    }
  });

  // 새창으로 남의 엔딩노트 띄울때
  this.route('topMenu1', {
    path: '/endingNote/:_id/:onwer/:type',
    data: function() {
      var username = global.utilAES(this.params._id, 'decrypted'); // 자신의 userId
      var onwer = global.utilAES(this.params.onwer, 'decrypted'); // 남의 userId
      var obj = {
        isNewWindow: true,
        pageOwner: onwer,
        loginUser: {
          username: username
        },
        type: this.params.type
      };
      return obj;
    }
  });

  // 새창 알림
  // this.route('/notification', {
  //   template: 'notification'
  // });
  this.route('notification', {
    layoutTemplate: 'layout3',
    path: '/notification'
  });
  this.route('/textEditor', {
    template: 'textEditor'
  });
  this.route('/testTemple', {
    template: 'testTemple'
  });
  this.route('/sample_slider', {
    template: 'sample_slider'
  });
  this.route('/excel_example', {
    template: 'excel_example'
  });
  this.route('/text_postposition_test', {
    template: 'text_postposition_test'
  });
  this.route('/server_time_check', {
    template: 'server_time_check'
  });
  this.route('/send_email', {
    template: 'send_email'
  });
  this.route('/photo_exif', {
    template: 'photo_exif'
  });
  this.route('/image_album', {
    template: 'image_album'
  });
  this.route('/image_album_sortable', {
    template: 'image_album_sortable'
  });
  this.route('/map_overay', {
    template: 'map_overay'
  });
  this.route('/d3Graph', {
    template: 'd3Graph'
  });
  this.route('/future', {
    template: 'futureWriting'
  });
  this.route('/scroll_test', {
    template: 'scroll_test'
  });
  this.route('/timecapsule_open_sample', {
    template: 'timecapsule_open_sample'
  });
  this.route('/lifeMap_timeline', {
    template: 'lifeMapTimeline'
  });
  this.route('/lifeMap1', {
    template: 'lifeMap1'
  });
  this.route('/editor_option_check', {
    template: 'editor_option_check'
  });
  this.route('/file_upload', {
    template: 'file_upload'
  });
  this.route('/chatScript', {
    template: 'chatScript'
  });
  this.route('/timeline', {
    template: 'timeline'
  });
  this.route('/schedule_task', {
    template: 'schedule_task'
  });
  this.route('systemUpdateMethod', {
    template: 'systemUpdateMethod'
  });
});

// Router.onBeforeAction('dataNotFound', {only: 'postPage'});
// Router.onBeforeAction(requireLogin, {only: 'myenoteMain'});
