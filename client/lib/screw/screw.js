Screw = {};
(function(Screw, Monarch) {

Monarch.module("Screw", {
  Unit: function(specification) {
    if (!this.sharedContext) this.sharedContext = new Screw.Context();
    specification(this.sharedContext);
  },

  clear: function() {
    this.RootDescription.clearChildren();
  },

  rootDescription: function() {
    return this.RootDescription = this.RootDescription || new Screw.Description("All specs");
  },

  mocks: [],

  resetMocks: function() {
    Screw.each(Screw.mocks, function() {
      this.mockedObject[this.functionName] = this.originalFunction;
    })
    Screw.mocks = [];
  },

  currentDescription: function() {
    return this.descriptionStack()[this.descriptionStack().length - 1];
  },

  pushDescription: function(description) {
    this.descriptionStack().push(description);
  },

  popDescription: function() {
    var description = this.descriptionStack().pop();
    this.currentDescription().addDescription(description)
  },

  pushScenario: function(scenarioDescription) {
    this.descriptionStack().push(scenarioDescription);
  },

  popScenario: function() {
    var scenarioDescription = this.descriptionStack().pop();
    this.currentDescription().addScenario(scenarioDescription);
  },

  descriptionStack: function() {
    if (!this.DescriptionStack) {
      this.DescriptionStack = [this.rootDescription()];
    }
    return this.DescriptionStack;
  },

  map: function(array, fn) {
    var results = [];
    Screw.each(array, function() {
      results.push(fn.call(this));
    });
    return results;
  },

  each: function(array, fn) {
    for (var i = 0; i < array.length; i++) {
      fn.call(array[i]);
    }
  },

  reverseEach: function(array, fn) {
    for (var i = array.length - 1; i >= 0; i--) {
      fn.call(array[i]);
    }
  }
});

})(Screw, Monarch);
