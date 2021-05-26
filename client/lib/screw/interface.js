//= require "interface/description"
//= require "interface/example"
//= require "interface/progress_bar"
//= require "interface/runner"
//= require "interface/streaming_runner"

(function(Screw, Monarch, jQuery) {

Monarch.module("Screw.Interface", {
  refresh: function() {
    this.setLocation(this.getLocation());
  },

  setLocation: function(location) {
    window.location = location;
  },

  getLocation: function() {
    return window.location;
  },

  baseLocation: function() {
    return this.getLocation().href.split('?')[0];
  },

  examplesToRun: function() {
    return [Screw.rootDescription()];
  }
});

})(Screw, Monarch, jQuery);
