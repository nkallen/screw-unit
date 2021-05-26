(function(Screw, Monarch) {

Monarch.constructor("Screw.Interface.Description", Monarch.View.Template, {
  content: function(initialAttributes) { with (this.builder) {
    var description = initialAttributes.description;
    li({'class': 'description'}, function() {
      span({'class': 'name'}, description.name).click(function(view) {
        view.focus();
      });

      if (description.examples.length > 0) {
        ul({'class': 'examples'});
      }

      if (description.childDescriptions.length > 0) {
        ul({'class': 'childDescriptions'});
      }
    });
  }},

  viewProperties: {
    initialize: function() {
      this.buildExamples();
      this.buildChildDescriptions();
      
      var self = this;
      this.description.onExampleCompleted(function(example) {
        if (example.failed) {
          self.addClass('failed')
        } else {
          self.addClass('passed');
        }
      })
    },

    buildExamples: function() {
      var self = this;
      var examplesContainer = this.find("ul.examples").eq(0);
      Screw.each(this.description.examples, function() {
        var subview = Screw.Interface.Example.toView({example: this});
        self.buildSubview(examplesContainer, subview);
      });
    },

    buildChildDescriptions: function() {
      var self = this;
      var childDescriptionsContainer = this.find("ul.childDescriptions").eq(0);
      Screw.each(this.description.childDescriptions, function() {
        var subview = Screw.Interface.Description.toView({description: this, buildImmediately: self.buildImmediately});
        self.buildSubview(childDescriptionsContainer, subview);
      });
    },

    buildSubview: function(container, subview) {
      if (this.buildImmediately) {
        container.append(subview);
      } else {
        setTimeout(function() { container.append(subview); }, 0);
      }
    },

    focus: function() {
      Screw.Interface.setLocation(Screw.Interface.baseLocation() + "?" + JSON.stringify([this.description.path()]));
    }
  }
});

})(Screw, Monarch);
