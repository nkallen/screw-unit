(function(Screw, Monarch) {

Monarch.constructor("Screw.Description", Screw.RunnableMethods, {
  initialize: function(name) {
    this.name = name;
    this.children = [];
    this.childDescriptions = [];
    this.examples = [];
    this.inits = [];
    this.befores = [];
    this.afters = [];
    this.childSubscriptions = new Monarch.SubscriptionBundle();
    this.exampleCompletedSubscriptionNode = new Monarch.SubscriptionNode();
    this.hasScenario = false;
  },

  clone: function() {
    var clone = Screw.$.extend(new Screw.Description(), this);
    clone.exampleCompletedSubscriptionNode = new Monarch.SubscriptionNode();
    clone.childSubscriptions = new Monarch.SubscriptionBundle();
    clone.children = [];
    clone.childDescriptions = [];
    clone.examples = [];

    Screw.each(this.children, function() {
      var childClone = this.clone();
      if (childClone.constructor == Screw.Description) {
        clone.addDescription(childClone);
      } else {
        clone.addExample(childClone);
        }
    });

    return clone;
  },

  clearChildren: function() {
    this.childSubscriptions.destroyAll();
    this.children = [];
    this.childDescriptions = [];
    this.examples = [];
  },

  totalExamples: function() {
    var totalExamples = this.examples.length;
    Screw.each(this.childDescriptions, function() {
      totalExamples += this.totalExamples();
    })
    return totalExamples;
  },

  failedExamples: function() {
    var failedExamples = [];
    Screw.each(this.examples, function() {
      if (this.failed) {
        failedExamples.push(this);
      }
    });
    Screw.each(this.childDescriptions, function() {
      failedExamples = failedExamples.concat(this.failedExamples());
    });
    return failedExamples;
  },

  failureMessages: function() {
    var messages = [];
    Screw.each(this.failedExamples(), function() {
      messages.push(this.failureMessage);
    });
    return messages;
  },

  runnableAtPath: function(path) {
    var currentRunnable = this;
    Screw.each(path, function() {
      currentRunnable = currentRunnable.children[this];
    });
    return currentRunnable;
  },

  addDescription: function(description) {
    if (this.hasScenarios) {
      this.addDescriptionToScenarios(description);
    } else {
      this.addChildDescriptionOrScenario(description)
    }
  },

  addDescriptionToScenarios: function(description) {
    this.scenarioChildDescriptions.push(description);
    Screw.each(this.childDescriptions, function() {
      this.addDescription(description.clone());
    });
  },

  addScenario: function(scenarioDescription) {
    if (!this.hasScenarios) {
      this.scenarioExamples = this.examples;
      this.scenarioChildDescriptions = this.childDescriptions;
      this.children = [];
      this.childDescriptions = [];
      this.examples = [];
      this.hasScenarios = true;
    }

    Screw.each(this.scenarioExamples, function() {
      scenarioDescription.addExample(this.clone());
    });
    Screw.each(this.scenarioChildDescriptions, function() {
      scenarioDescription.addDescription(this.clone());
    });

    this.addChildDescriptionOrScenario(scenarioDescription);
  },

  addChildDescriptionOrScenario: function(description) {
    var self = this;
    description.parentDescription = this;
    description.index = this.children.length;
    this.children.push(description);
    this.childDescriptions.push(description);

    this.childSubscriptions.add(description.onExampleCompleted(function(example) {
      self.exampleCompletedSubscriptionNode.publish(example);
    }));
  },

  addExample: function(example) {
    if (this.hasScenarios) {
      this.addExampleToScenarios(example);
    } else {
      var self = this;
      example.parentDescription = this;
      example.index = this.children.length;
      this.children.push(example);
      this.examples.push(example);

      this.childSubscriptions.add(example.onExampleCompleted(function(example) {
        self.exampleCompletedSubscriptionNode.publish(example);
      }));
    }
  },

  addExampleToScenarios: function(example) {
    this.scenarioExamples.push(example);
    Screw.each(this.childDescriptions, function() {
      this.addExample(example.clone());
    });
  },

  addInit: function(fn) {
    this.inits.push(fn);
  },

  addBefore: function(fn) {
    this.befores.push(fn);
  },

  addAfter: function(fn) {
    this.afters.push(fn);
  },

  addToQueue: function(queue) {
    Monarch.Util.each(this.examples, function(example) {
      example.addToQueue(queue);
    });

    Monarch.Util.each(this.childDescriptions, function(description) {
      description.addToQueue(queue);
    });
  },

  run: function() {
    var queue = new Monarch.Queue();
    Monarch.Util.each(this.examples, function(example) {
      queue.add(function() {
        example.run();
      })
    });

    Monarch.Util.each(this.childDescriptions, function(description) {
       queue.add(function() {
         description.run();
       });
    });
    
    queue.start();
  },

  runInits: function(exampleContext) {
    if (this.parentDescription) {
      this.parentDescription.runInits(exampleContext);
    }

    Screw.each(this.inits, function() {
      this.call(exampleContext);
    });
  },

  runBefores: function(exampleContext) {
    if (this.parentDescription) {
      this.parentDescription.runBefores(exampleContext);
    }

    Screw.each(this.befores, function() {
      this.call(exampleContext);
    });
  },

  runAfters: function(exampleContext) {
    Screw.each(this.afters, function() {
      this.call(exampleContext);
    });

    if (this.parentDescription) {
      this.parentDescription.runAfters(exampleContext);
    }
  },


  fullName: function() {
    if (this.parentDescription) {
      return this.parentDescription.fullName() + this.name + " :: ";
    } else {
      return "";
    }
  }

});

})(Screw, Monarch);
