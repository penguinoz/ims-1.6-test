var templateName = 'scrollTest';


function ScrollPosition(node) {
    this.node = node;
    this.previousScrollHeightMinusTop = 0;
    this.readyFor = 'up';
}

ScrollPosition.prototype.restore = function () {
    if (this.readyFor === 'up') {
        this.node.scrollTop = this.node.scrollHeight - this.previousScrollHeightMinusTop;
    }

    // 'down' doesn't need to be special cased unless the
    // content was flowing upwards, which would only happen
    // if the container is position: absolute, bottom: 0 for
    // a Facebook messages effect
};

ScrollPosition.prototype.prepareFor = function (direction) {
    this.readyFor = direction || 'up';
    this.previousScrollHeightMinusTop = this.node.scrollHeight - this.node.scrollTop;
};

Template[templateName].onRendered(function(){
  var self = this;

  var elViewport = document.querySelector('.viewport');

  // self.things = ko.observableArray([
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor(),
  //     randBackColor()
  // ]);



  self.scrollPosition = new ScrollPosition(elViewport);
  self.scrollPosition.prepareFor('top');

  self.unshift = function () {
    console.log('unshift');
      self.scrollPosition.prepareFor('up');
      setTimeout(function () {
          self.things.unshift(randBackColor());
          self.scrollPosition.restore();
      }, 1000);
  };

  self.push = function () {
    console.log('push');
      self.scrollPosition.prepareFor('down');
      setTimeout(function () {
          self.things.push(randBackColor());
          self.scrollPosition.restore();
      }, 1000);
  };

  // self.addOnScroll = ko.observable(false);

  self.onScroll = function() {
      if (!self.addOnScroll()) return;
      if (elViewport.scrollTop === 0) {
          self.unshift();
      }
      if (elViewport.scrollTop + elViewport.clientHeight === elViewport.scrollHeight) {
          self.push();
      }
  };

  function randBackColor() {
      return {
          backgroundColor: 'hsl( 0, 100%, ' + (Math.random() * 100) + '% )'
      };
  }
});

Template[templateName].events({
  "click #unshift": function(e, t){
    e.preventDefault();

    console.log('unshift', prepareFor());

    var self = this;
    console.log('this', this);
    self.scrollPosition.prepareFor('up');
    setTimeout(function () {
        self.things.unshift(randBackColor());
        self.scrollPosition.restore();
    }, 1000);
  },
  "click #push": function(e, t){
    e.preventDefault();

    console.log('push');

    var self = this;
    self.scrollPosition.prepareFor('down');
    setTimeout(function () {
        self.things.push(randBackColor());
        self.scrollPosition.restore();
    }, 1000);
  }
});

// var restore = function () {
//     if (this.readyFor === 'up') {
//         this.node.scrollTop = this.node.scrollHeight - this.previousScrollHeightMinusTop;
//     }
//
//     // 'down' doesn't need to be special cased unless the
//     // content was flowing upwards, which would only happen
//     // if the container is position: absolute, bottom: 0 for
//     // a Facebook messages effect
// };
//
// var prepareFor = function (direction) {
//     this.readyFor = direction || 'up';
//     this.previousScrollHeightMinusTop = this.node.scrollHeight - this.node.scrollTop;
// };


