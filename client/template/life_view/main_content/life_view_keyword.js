import {global} from '/imports/global/global_things.js';

// 라이프뷰 키워드로 보기
var templateName = 'lifeViewKeyword';
var isPageOwner = false;

Template[templateName].onCreated(function(){
  this.userId = new ReactiveVar();
  this.choiceTag = new ReactiveVar();
  this.notTagList = new ReactiveVar();

  // reactiveUserId(this);
  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    this.userId.set(global.login.userId);
  } else {
    this.userId.set(global.login.pageOwner);
  }
});

Template[templateName].onRendered(function(){
  keyword(this);
  // // 스크롤 페이징 구현
  var targetElementLeft = $('.hl-scroll');
  var scrollCallbackOptions = {
    onUpdate: function(){
      $('.mCSB_container').css({"height":""});
    },
  };

  global.fn_customerScrollBarInit(targetElementLeft, "dark", scrollCallbackOptions);
});

Template[templateName].onDestroyed(function(){
  Session.set('endingNoteList templateData', null);
});

Template[templateName].events({
  'click [name="addTag"]': function(e, t){
    e.preventDefault();

    if (global.utilValidation(t)) {
      var tagText = t.find('input[name="tagText"]').value;
      if (!global.fn_isExist(t.choiceTag.get())) {
        global.utilAlert('태그를 삽입할 글을 선택해주세요.');
      } else {
        var data = {
          $push: {tagList: tagText}
        };
        var _id = t.choiceTag.get()._id;
        var type = t.choiceTag.get().type;
        var meteorCall = 'storyUpdate';
        if (type === 'BL') {
          meteorCall = 'bucketUpdate';
        }
        var self = t;
        Meteor.call(meteorCall, _id, data, function(error, result) {
          if (!error) {
            d3.select("#viz").selectAll('*').remove();
            keyword(self);
            return global.utilAlert('선택한글에 태그가 추가 되었습니다.', 'success');
          }
        });
      }
    }
  },

  'click [name="keywordSlider"]':function(e, t) {
    e.preventDefault();

    var postId = e.target.getAttribute('postId');
    var type = e.target.getAttribute('postType');

    t.choiceTag.set({
      _id: postId,
      type: type
    });
    var selectObj = {
      postId: postId,
      type: type
    };
    global.fn_replaceLifeViewDetail(selectObj);
  },
  "click [name=imgCount]": function(){
    var slideTarget = $('.hideTarget');

    if(slideTarget.hasClass("on")){
      slideTarget.removeClass("on");
      $('.over').animate({"top": '+=85'});
    }else{
      slideTarget.addClass("on");
      $('.over').animate({"top": '-=85'});
    }

    slideTarget.slideToggle( 400, function() {});
  },
  "click .slick-slide.slick-active": function(e,t){
    e.preventDefault();

    $(e.target).siblings().removeClass('active');
    $(e.target).addClass('active');
  }
});

Template[templateName].helpers({
  hpNotTagList: function(){
    return Template.instance().notTagList.get();
  },
  hpIsPageOwner: function(){
    return isPageOwner;
  }
});

Template.keywordSlider.onRendered(function(){
  // 태그없는 글 리스트 슬라이드
  $('#lifeviewKeywordSlider').slick({
    // centerMode:true,
    // initialSlide : 0,
    infinite: false,
    slidesToShow: 7,
    slidesToScroll: 1,
    variableWidth: true,
    draggable: false
  });

  $('#lifeviewSlider .slick-slide').removeClass('active');
  $('.hideTarget').hide(); //초기에 타겟을 숨김;
});

Template.keywordSlider.helpers({
  hpNotTagList: function(){
    return this.data;
  }
});


Template.keywordSlider.events({
  "click .slick-prev": function(e, t){
    var selectedImageIndex = $('#lifeviewSlider .slick-slide.slick-active.active').attr('index');
    $('#lifeviewSlider .slick-slide').removeClass('active');
    if(selectedImageIndex){
      $('#lifeviewSlider .slick-slide.slick-active[index='+selectedImageIndex+']').addClass('active');
    }

  },
  "click .slick-next": function(e, t){
    var selectedImageIndex = $('#lifeviewSlider .slick-slide.slick-active.active').attr('index');
    $('#lifeviewSlider .slick-slide').removeClass('active');
    if(selectedImageIndex){
      $('#lifeviewSlider .slick-slide.slick-active[index='+selectedImageIndex+']').addClass('active');
    }
  }
});

function keyword(data) {
  var Tag = "TAG";					// csv 파일에는 column명을 TAG1,2,3...으로 사용한 관계로.. DB에서 정보를 가져오면 필요없을 것 같음.
  var tagKey = [];
  var abbTag = [];			// Tag별 작성 글 리스트
  var tmpTag = [];			// 연관된 Tag를 구하기 위한 임시 Array
  var nodeTag = [];			// 은하수의 노드 정보
  var linkTag = [];			// 은하수의 link 정보
  var chCount = 0;					// 해당 태그의 관련 글 수 계산
  var chIdLength = 7;					// 해당 태그의 관련 글 수 계산을 위한 상수. 글 ID가 6자리, csv의 "쉽표(,)" 포함하여 7을 기본 단위로 하였음
  var maxCount = 0;
  var linkWdL = [[2,1],[3,2],[3,3]]; // Link 선 두께

  var instance = data;
  Meteor.call('getTagList', instance.userId.get(), function(error, result) {
    if (error) {
      return alert(error);
    } else {
      var addTest = [];
      result.forEach(function(v,i) {					// abbTag에 태그의 node, link 정보를 저장
        tmpTag.length = 0;
        for (var prop in v) {
          if (v.hasOwnProperty(prop)) {
            var _id = v['_id'];
            if (prop === 'tagList') {
              // console.log('prop[tag]', v[prop]);
              for (var tag in v[prop]) {
                var indx = abbTag.findIndex(function(x) { return x[0] === v[prop][tag]; } );
                if (indx > -1) {
                  tmpTag.push([indx, v[prop][tag]]);
                  abbTag[indx][1] = abbTag[indx][1] + "," + _id;
                } else {
                  tmpTag.push([abbTag.length, v[prop][tag]]);
                  abbTag.push([v[prop][tag], _id]);
                  tagKey.push(v[prop][tag]);
                }
              }
            }
          }
        }

        if (tmpTag.length > 1) { // link 정보를 abbTag의 기존 태그 정보에 추가.
          tmpTag.sort();
          for (j = 0; j < tmpTag.length; j++ ) {
            for (k = j + 1; k< tmpTag.length; k++) {
              // var indxIn = abbTag[tmpTag[j][0]].findIndex(x => x == tmpTag[k][1]);
              var indxIn = abbTag[tmpTag[j][0]].findIndex(function(x) {return x === tmpTag[k][1];} );
              if (indxIn >=0) {
                abbTag[tmpTag[j][0]][indxIn+1] = abbTag[tmpTag[j][0]][indxIn+1] + "," + v['_id'];
              } else {
                abbTag[tmpTag[j][0]].push(tmpTag[k][1],v['_id']);
              }
            }
          }
        }
      });
      // console.log('tmpTag', tmpTag);
      tagKey = _.union(tagKey);
      // console.log('2', abbTag);
      // console.log('tagKey', tagKey);
      abbTag.forEach(function(v,i) {
        chCount = ( v[1].length + 1 ) / chIdLength;
        if (chCount > maxCount) { maxCount = chCount; }
        nodeTag.push([v[0],v[1],chCount]);
        if (v.length > 2)
        {
          for (j=2;j<v.length ; )
          {
            var key1 = tagKey.findIndex(function(x) {return x === v[j];} );
            chCount = ( v[j+1].length + 1 ) / chIdLength;
            linkTag.push([i,key1,v[j+1],chCount]);
            j = j + 2;
          }
        }
      });

      // console.log('2', abbTag);

      var link_max = Math.max.apply(Math, linkTag.map(function(d){return d[3];}));

			var tmpCntSort = [];
			nodeTag.forEach(function(v,i){ tmpCntSort.push(v[2]);});
			tmpCntSort.sort(function(a,b){return a-b;});
			var nodeMidPoint = tmpCntSort[Math.ceil((tmpCntSort.length * 0.6)-1)];

			tmpCntSort = [];
			linkTag.forEach(function(v,i){ tmpCntSort.push(v[3]);});
			tmpCntSort.sort(function(a,b){return a-b;});
			var linkMidPoint = tmpCntSort[Math.ceil((tmpCntSort.length * 0.6)-1)]  + 0.5;

      var nodeSize = d3.scale.linear()
        .domain([0, nodeMidPoint, maxCount])
        .range([0, 30, 100]);

      var linkThick = d3.scale.linear()
        .domain([1, linkMidPoint, link_max])
        .range([1, 2, 8]);

      nodeTag = nodeTag.map(function(d){
        return {"id": d[0], "wrts": d[1], "size":nodeSize(d[2]), "score": d[2]/maxCount, "type": "circle"};
      });
          // case "circle": return keyc;
          // case "square": return keys;
          // case "triangle-up": return keyt;
          // case "diamond": return keyr;
          // case "cross": return keyx;
          // case "triangle-down": return keyd;

      linkTag = linkTag.map(function(d){
        return {"source": d[0], "target": d[1], "wrts":d[2], "size": linkThick(d[3])};
      });
      // console.log('linkTest', linkTest);
      // console.log(abbTag);
      // console.log(tagKey);
      // console.log(nodeTag);
      // console.log('linkTag', linkTag);

      // var w = window.innerWidth;
      // var h = window.innerHeight;
      var w = $('#viz').width();
      var h = 700;

      var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true;

      var focus_node = null, highlight_node = null, focus_link = null, highlight_link = null;
      var selectedLink = 10;
      var sltdLink = [];
      var lindx = -1;
      var sltdLinkNode = [];

      var text_center = false;
      var outline = false;

      var min_score = 0;
      var max_score = 1;

      var color = d3.scale.linear()
          .domain([min_score, (min_score+max_score)/2, max_score])
          .range(["lime", "yellow", "red"]);

      var highlight_color = "blue";
      var highlight_trans = 0.1;

      var size = d3.scale.pow().exponent(1)
          .domain([1,100])
          .range([8,24]);

      var linkDist = d3.scale.linear()
  				.domain([1,100,500])
  				.range([60,50,40])
  				.clamp(true);

      var linkDistance1 = linkDist(nodeTag.length);

      var force = d3.layout.force()
          .linkDistance(linkDistance1)
          .charge(-1000)
          .gravity(0.15)
          .size([w,h]);

      var default_node_color = "#ccc";
          //var default_node_color = "rgb(3,190,100)";
      var default_link_color = "#888";
      var default_text_color = "black";
      var focus_text_color = "red";
      var mouse_down_counr = 0;
      var nominal_base_node_size = 8;
      var nominal_text_size = 10;
      var max_text_size = 24;
      var nominal_stroke = 1.5;
      var max_stroke = 30;
      var max_base_node_size = 36;
      var min_zoom = 0.1;
      var max_zoom = 7;
      var svg = d3.select("#viz").append("svg");
      var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom]);
      var g = svg.append("g");
      svg.style("cursor","move");

      var linkedByIndex = {};

      linkTag.forEach(function(d) {
        linkedByIndex[d.source + "," + d.target] = true;
      });

      function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
      }

      function hasConnections(a) {
        for (var property in linkedByIndex) {
          s = property.split(",");
          if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property])
          return true;
        }
        return false;
      }

      force
        .nodes(nodeTag)
        .links(linkTag)
        .start();

      var link = g.selectAll(".link")
          .data(linkTag)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke-width",function(d){ return d.size;})
          .style("stroke", function(d) { return default_link_color;});

      var node = g.selectAll(".node")
          .data(nodeTag)
          .enter().append("g")
          .attr("class", "node")

          .call(force.drag);

      node.on("dblclick.zoom", function(d) {
      //				focus_link = null; exit_highlight();
          d3.event.stopPropagation();
          var dcx = (w/2-d.x*zoom.scale());
          var dcy = (window.innerHeight/2-d.y*zoom.scale());
          zoom.translate([dcx,dcy]);
          g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")");
      });

      var tocolor = "fill";
      var towhite = "stroke";
      if (outline) {
        tocolor = "stroke";
        towhite = "fill";
      }

      var grads = svg.append("defs").selectAll("radialGradient")
  				.data(nodeTag)
  				.enter()
  				.append("radialGradient")
  				.attr("gradientUnits", "objectBoundingBox")
  				.attr("cx", "20%")
  				.attr("cy", "20%")
  				.attr("r", "80%")
  				.attr("id", function(d, i) { return "grad" + i; });

  		grads.append("stop")
  				.attr("offset", "0%")
  				.style("stop-color", "white");

  		grads.append("stop")
  				.attr("offset", "100%")
  				.style("stop-color",  function(d) { if (isNumber(d.score) && d.score>=0) return color(d.score);
  					else return default_node_color; });

      var circle = node.append("path")
        .attr("d", d3.svg.symbol()
          .size(function(d) { return Math.PI*Math.pow(size(d.size)||nominal_base_node_size,2); })
          .type(function(d) { return d.type; }))
          .style(tocolor, function(d, i) {
    					return "url(#grad" + i + ")";})
          //.attr("r", function(d) { return size(d.size)||nominal_base_node_size; })
        .style("stroke-width", nominal_stroke)
        .style(towhite, "white");

      var text = g.selectAll(".text")
        .data(nodeTag)
        .enter().append("text")
        .attr("dy", ".35em")
        .style("font-size", nominal_text_size + "px")
        .style("fill", default_text_color);

        if (text_center)
          text.text(function(d) { return d.id; })
            .style("text-anchor", "middle");
        else
          text.attr("dx", function(d) {return (size(d.size)||nominal_base_node_size);})
        .text(function(d) { return '\u2002'+d.id; });

      node.on("mouseover", function(d) {
          if (sltdLink.length === 0){
            set_highlight(d);
            }
          })
        .on("mousedown", function(d) { d3.event.stopPropagation();
          if (sltdLink.length === 0){
            focus_node = d;
            set_focus(d);
            if (highlight_node === null) set_highlight(d);
            }
          })
        .on("mouseout", function(d) {
          if (sltdLink.length === 0){
            exit_highlight();
            }
          })
        .on('click', function(d) {
          if (sltdLink.length === 0){
            node_detail_highlight(d);
          }
        });

      link.on("mouseover", function(d) {
          if (sltdLink.length === 0){
            set_link_highlight(d);
          } else {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              tmp_i = -1;
              if ((sltdLinkNode[i].index == d.source.index) || (sltdLinkNode[i].index == d.target.index)){
                tmp_i = 1;
                break;
              }
            }
            if (tmp_i === 1) {
              set_link_highlight(d);
            }
          }
          })
        .on("mousedown", function(d) { d3.event.stopPropagation();
          lindx = checkLink(d);
          if (lindx < 0) {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              tmp_i = -1;
              if ((sltdLinkNode[i].index == d.source.index) || (sltdLinkNode[i].index == d.target.index)){
                tmp_i = 1;
                break;
              }
            }
            if ((tmp_i === 1) || (sltdLink.length === 0)) {
              sltdLink.push(d);
              sltdLinkNode.push(d.source, d.target);
              set_link_node_focus(d);
              set_link_highlight(d);
              svg.on('.zoom', null);
            }
          } else {
      //					if (!checkDelevteLinkOK(sltdLink,lindx))
      //					{	alert("중간의 Link는 제외할 수 없습니다 !!");
      //						throw new Error("Must keep all connected!!");
      //					};
            delete sltdLink[lindx];
            sltdLink = sltdLink.filter(function(e){return e;});
            delete sltdLinkNode[lindx*2];
            delete sltdLinkNode[lindx*2+1];
            sltdLinkNode = sltdLinkNode.filter(function(e){return e;});
            if (sltdLink.length === 0){
              svg.call(zoom);
              if (highlight_trans<1){
                circle.style("opacity", 1);
                text.style("opacity", 1);
                link.style("opacity", 1);
              }
              exit_highlight();
            } else {
              d = sltdLink[0];
              set_link_node_focus(d);
              set_link_highlight(d);
      //						if (highlight_link === null) set_link_highlight(d);
            }
          }
          })
        .on("mouseout", function(d) {
            if (sltdLink.length === 0){
              exit_highlight();
            } else {
              d = sltdLink[0];
              set_link_highlight(d);
            }
          })
        .on("click", function(d) {
          link_detail_highlight(sltdLink);
        });

      d3.select(window).on("mouseup",function() {
        if (focus_node!==null){
          focus_node = null;
          focus_link = null;
          if (highlight_trans<1){
            circle.style("opacity", 1);
            text.style("opacity", 1);
            link.style("opacity", 1);
          }
        }

        if (highlight_node === null && focus_link === null) exit_highlight();

      });

      function checkLink(d) {
        var tmpIndex = -1;
        for (i=0;i<sltdLink.length ;i++ ) {						// sltdLink에 선택한 link가 포함되어 있는지 확인
          if ((sltdLink[i].source.index == d.source.index) && (sltdLink[i].target.index == d.target.index)){
            tmpIndex = i;
            break;
          }
        }
        return tmpIndex;
      }

      function checkDelevteLinkOK(v,i) {
        // console.log(v);
        var tmpArr =[];
        for (j=0;j<v.length ;j++ ){
          if (j != i) {
            tmpArr.push(v[j].source.index, v[j].target.index);}
        }

        var uniqueAfter = tmpArr.filter(function(elem, index, self) { return index == self.indexOf(elem);});
        var uniqueBefore = sltdLinkNode.filter(function(elem, index, self) { return index == self.indexOf(elem);});
        if (uniqueBefore.length == uniqueAfter.length){
          return false;
        } else {	return true;}
      }

      function exit_highlight(){
        highlight_node = null;
        highlight_link = null;

      //			if (focus_node===null || sltdLink.length == 0 ){
        if (sltdLink.length === 0 ){
          svg.style("cursor","move");
          if (highlight_color!="white"){
              circle.style(towhite, "white");
            text.style("font-weight", "normal")
              .style("fill", default_text_color);
            link.style("stroke", function(o) {return (isNumber(o.score) && o.score>=0) ? color(o.score):default_link_color;})
              .style("stroke-width", function(o) {return o.size;});
          }
        }
      }

      function set_focus(d){
        if (highlight_trans<1)  {
          circle.style("opacity", function(o) {
            return isConnected(d, o) ? 1 : highlight_trans;
          });

          text.style("opacity", function(o) {
            return isConnected(d, o) ? 1 : highlight_trans;
          });
          link.style("opacity", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
          });
        }
      }

      function set_highlight(d){
        svg.style("cursor","pointer");
        if (focus_node!==null) d = focus_node;
        highlight_node = d;

        if (highlight_color!="white"){
          circle.style(towhite, function(o) {
            return isConnected(d, o) ? highlight_color : "white";});
          text.style("font-weight", function(o) {
            return isConnected(d, o) ? "bold" : "normal";})
            .style("fill", function(o) {
            return isConnected(d, o) ? focus_text_color : default_text_color;});
          link.style("stroke", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
          });
        }
      }

      function node_detail_highlight(d) {
        var postId = d.wrts.split(',');
        Meteor.call('getStoryBucketData', postId, instance.userId.get(), function(error, result) {
          if (error) {
            return global.utilAlert(error, 'error');
          } else {
            if (result.length === 1) {
              var selectObj = {
                postId: result[0]._id,
                type: result[0].type
              };
              global.fn_replaceLifeViewDetail(selectObj);
            } else {
              var templateData = {};
              templateData.contentTmp = 'lifeViewDetailList';
              templateData.data = result;
              Session.set('endingNoteList templateData', templateData);
            }
          }
        });
      }

      function link_detail_highlight(d) {
        var postId = [];
        d.map(function(item) {
          var source = item.source.wrts.split(',');
          var target = item.target.wrts.split(',');
          var union = _.union(source, target);
          postId = _.union(union, postId);
        });
        Meteor.call('getStoryBucketData', postId, instance.userId.get(), function(error, result) {
          if (error) {
            return global.utilAlert(error, 'error');
          } else {
            if (result.length === 1) {
              var selectObj = {
                postId: result[0]._id,
                type: result[0].type
              };
              global.fn_replaceLifeViewDetail(selectObj);
            } else {
              var templateData = {};
              templateData.contentTmp = 'lifeViewDetailList';
              templateData.data = result;
              Session.set('endingNoteList templateData', templateData);
            }
          }
        });
      }

      function set_link_highlight(d){
        svg.style("cursor","pointer");
      //			if (focus_link!==null) d = focus_link;
      //			highlight_link = d;

        // console.log(sltdLink);
        // console.log(sltdLinkNode);
        // console.log(d);

        if (highlight_color!="white"){
          if (sltdLink.length === 0) {
            circle.style(towhite, function(o) {
              return d.source.index == o.index || d.target.index == o.index ? highlight_color : "white";});
            text.style("font-weight", function(o) {
              return d.source.index == o.index || d.target.index == o.index ? "bold" : "normal";})
              .style("fill", function(o) {
              return d.source.index == o.index || d.target.index == o.index ? focus_text_color : default_text_color;});
            link.style("stroke", function(o) {
              return d.source.index == o.source.index && d.target.index == o.target.index ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);})
              .style("stroke-width", function(o) {
              return d.source.index == o.source.index && d.target.index == o.target.index ? selectedLink : o.size;});
          } else {
          circle.style(towhite, function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              if (sltdLinkNode[i] == o) {
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? highlight_color : "white";
          });
          text.style("font-weight", function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              if (sltdLinkNode[i] == o) {
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? "bold" : "normal";})
            .style("fill", function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              if (sltdLinkNode[i] == o) {
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? focus_text_color : default_text_color;
            });
          link.style("stroke", function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLink.length ;i++ ) {						// sltdLink에 선택한 link가 포함되어 있는지 확인
              if (((sltdLink[i].source.index == o.source.index) && (sltdLink[i].target.index == o.target.index)) || ((d.source.index == o.source.index) && (d.target.index == o.target.index))) {
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
          })
            .style("stroke-width", function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLink.length ;i++ ) {						// sltdLink에 선택한 link가 포함되어 있는지 확인
              if (((sltdLink[i].source.index == o.source.index) && (sltdLink[i].target.index == o.target.index)) || ((d.source.index == o.source.index) && (d.target.index == o.target.index))){
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? selectedLink : o.size;});
          }
        }
      }

      function set_link_focus(d){
        if (highlight_trans<1)  {
          circle.style("opacity", function(o) {
            return d.source.index == o.index || d.target.index == o.index ? 1 : highlight_trans;
          });

          text.style("opacity", function(o) {
            return d.source.index == o.index || d.target.index == o.index ? 1 : highlight_trans;
          });
          link.style("opacity", function(o) {
            return d.source.index == o.source.index && d.target.index == o.target.index ? 1 : highlight_trans;
          });
        }
      }

      function set_link_node_focus(d){
        if (highlight_trans<1)  {
          circle.style("opacity", function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              if (isConnected(sltdLinkNode[i],o)) {
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? 1 : highlight_trans;
          });

          text.style("opacity", function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              if (isConnected(sltdLinkNode[i],o)) {
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? 1 : highlight_trans;
          });
          link.style("opacity", function(o) {
            var tmp_i = -1;
            for (i=0;i<sltdLinkNode.length ;i++ ){
              if (o.source.index == sltdLinkNode[i].index || o.target.index == sltdLinkNode[i].index) {
                tmp_i = 1;
                break;
              }
            }
            return (tmp_i == 1) ? 1 : highlight_trans;
          });
        }
      }

      zoom.on("zoom", function() {

        var stroke = nominal_stroke;
        circle.style("stroke-width",stroke);

        var base_radius = nominal_base_node_size;
        if (nominal_base_node_size*zoom.scale()>max_base_node_size) base_radius = max_base_node_size/zoom.scale();
        circle.attr("d", d3.svg.symbol()
            .size(function(d) { return Math.PI*Math.pow(size(d.size)*base_radius/nominal_base_node_size||base_radius,2); })
            .type(function(d) { return d.type; }));

        //circle.attr("r", function(d) { return (size(d.size)*base_radius/nominal_base_node_size||base_radius); })
        if (!text_center) text.attr("dx", function(d) { return (size(d.size)*base_radius/nominal_base_node_size||base_radius); });

        var text_size = nominal_text_size;
        if (nominal_text_size*zoom.scale()>max_text_size) text_size = max_text_size/zoom.scale();
        text.style("font-size",text_size + "px");
        link.style("stroke-width", function(d) {
          if (d.size*zoom.scale()>max_stroke) { return max_stroke/zoom.scale();
          } else { return d.size*zoom.scale();}});
        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      });

      svg.call(zoom);

      resize();
      //window.focus();
      d3.select(window).on("resize", resize).on("keydown", keydown);
      force.on("tick", function() {
          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      });

      function resize() {
        var width = w, height = h;
        svg.attr("width", width).attr("height", height);

        force.size([force.size()[0]+(width-w)/zoom.scale(),force.size()[1]+(height-h)/zoom.scale()]).resume();
        w = width;
        h = height;
      }

      function keydown() {
        if (d3.event.keyCode==32) {  force.stop();}
        else if (d3.event.keyCode>=48 && d3.event.keyCode<=90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey){
          switch (String.fromCharCode(d3.event.keyCode)) {
            case "C": keyc = !keyc; break;
            case "S": keys = !keys; break;
            case "T": keyt = !keyt; break;
            case "R": keyr = !keyr; break;
            case "X": keyx = !keyx; break;
            case "D": keyd = !keyd; break;
            case "L": keyl = !keyl; break;
            case "M": keym = !keym; break;
            case "H": keyh = !keyh; break;
            case "1": key1 = !key1; break;
            case "2": key2 = !key2; break;
            case "3": key3 = !key3; break;
            case "0": key0 = !key0; break;
          }

          link.style("display", function(d) {
            var flag  = vis_by_type(d.source.type)&&vis_by_type(d.target.type)&&vis_by_node_score(d.source.score)&&vis_by_node_score(d.target.score)&&vis_by_link_score(d.score);
            linkedByIndex[d.source.index + "," + d.target.index] = flag;
            return flag?"inline":"none";});
          node.style("display", function(d) {
            return (key0||hasConnections(d))&&vis_by_type(d.type)&&vis_by_node_score(d.score)?"inline":"none";});
          text.style("display", function(d) {
            return (key0||hasConnections(d))&&vis_by_type(d.type)&&vis_by_node_score(d.score)?"inline":"none";});

          if (highlight_node !== null){
            if ((key0||hasConnections(highlight_node))&&vis_by_type(highlight_node.type)&&vis_by_node_score(highlight_node.score)) {
            if (focus_node!==null) set_focus(focus_node);
            set_highlight(highlight_node);
            }
            else {exit_highlight();}
          }

        }
      }

      function vis_by_type(type){
        switch (type) {
          case "circle": return keyc;
          case "square": return keys;
          case "triangle-up": return keyt;
          case "diamond": return keyr;
          case "cross": return keyx;
          case "triangle-down": return keyd;
          default: return true;
        }
      }

      function vis_by_node_score(score){
        if (isNumber(score)){
          if (score>=0.666) return keyh;
          else if (score>=0.333) return keym;
          else if (score>=0) return keyl;
        }
        return true;
      }

      function vis_by_link_score(score){
        if (isNumber(score)){
          if (score>=0.666) return key3;
          else if (score>=0.333) return key2;
          else if (score>=0) return key1;
        }
        return true;
      }

      function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
    }
  });

  Meteor.call('getNotTagList', instance.userId.get(), function(error, result) {
    if (error) {
      return global.utilAlert(error, 'error');
    } else {
      // console.log('result', result);
      instance.notTagList.set(result);
    }
  });
}

function reactiveUserId(data) {
  var isPageOwner = false;
  isPageOwner = global.fn_checkPageOwner(global.login.pageOwner);
  if (isPageOwner) {
    data.userId.set(global.login.userId);
  } else {
    data.userId.set(global.login.pageOwner);
  }
}