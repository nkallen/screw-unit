(function(Screw, Monarch) {

Monarch.module("Screw.RunnableMethods", {
  path: function() {
    if (!this.parentDescription) {
      return [];
    }
    return this.parentDescription.path().concat([this.index]);
  },

  onExampleCompleted: function(callback) {
    return this.exampleCompletedSubscriptionNode.subscribe(callback);
  }
});

})(Screw, Monarch);

