(function(Screw, Monarch) {

Monarch.constructor("Screw.Example", Screw.RunnableMethods, {
  initialize: function(name, fn) {
    this.name = name;
    this.fn = fn;
    this.failSubscriptionNode = new Monarch.SubscriptionNode();
    this.passSubscriptionNode = new Monarch.SubscriptionNode();
    this.exampleCompletedSubscriptionNode = new Monarch.SubscriptionNode();
    this.passed = false;
    this.failed = false;
    this.failureMessage = null;
  },

  clone: function() {
    var clone = Screw.$.extend(new Screw.Example(), this);
    clone.initialize(this.name, this.fn);
    return clone;
  },
  
  addToQueue: function(queue) {
    var self = this;
    queue.add(function() {
      self.run();
    });
  },

  run: function() {
    try {
      try {
        var exampleContext = {};
        this.parentDescription.runInits(exampleContext);
        this.parentDescription.runBefores(exampleContext);
        this.fn.call(exampleContext);
      } finally {
        this.parentDescription.runAfters(exampleContext);
        Screw.resetMocks();
      }
      this.passed = true;
      this.passSubscriptionNode.publish();
      this.exampleCompletedSubscriptionNode.publish(this);
    } catch(e) {
      this.failed = true;

      if (!e.stack) {
        e.stack = e.message + " (" + e.sourceURL + ":" + e.line + ")";
      }

      this.failureMessage = e.message;
      this.stack = e.stack;
      this.failSubscriptionNode.publish(e);
      this.exampleCompletedSubscriptionNode.publish(this);
    }
  },

  onFail: function(callback) {
    this.failSubscriptionNode.subscribe(callback);
  },

  onPass: function(callback) {
    this.passSubscriptionNode.subscribe(callback);
  },

  totalExamples: function() {
    return 1;
  },

  fullName: function() {
    return this.parentDescription.fullName() + this.name;
  }
});

})(Screw, Monarch);
