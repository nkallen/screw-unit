(function(Screw, Monarch) {

Monarch.constructor("Screw.Interface.Example", Monarch.View.Template, {
  content: function(initialAttributes) { with(this.builder) {
    li({'class': 'example'}, function() {
      span(initialAttributes.example.name, {'class': 'name'}).click(function(view) {
        view.focus();
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      var self = this;
      this.example.onPass(function() {
        self.addClass("passed");
      })
      this.example.onFail(function(e) {
        self.addClass("failed");

        var message = Screw.$("<div class='failureMessage'/>");
        message.text(e.message);

        var trace = Screw.$("<pre class='failureTrace'/>");
        if (e.stack) {
          var enhancedStack = e.stack.replace(/http:\/\/(.*_spec)\.js/g, '<a href="http://$1" target="Blank">http://$1.js</a>')
          trace.html(enhancedStack);
        }

        self.append(message);
        self.append(trace);
      });
    },

    focus: function() {
      Screw.Interface.setLocation(Screw.Interface.baseLocation() + "?" + JSON.stringify([this.example.path()]));
    }
  }
});

})(Screw, Monarch);
