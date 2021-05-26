(function(Screw, Monarch, jQuery) {

Monarch.constructor("Screw.Interface.Runner", Monarch.View.Template, {
  constructorProperties: {
    runSpecsOnPageLoad: function() {
      var self = this;
      jQuery(function() {
        var rootDescription = Screw.rootDescription();
        var queue = new Monarch.Queue();
        var runner;
        queue.add(function() {
          var show = jQuery.cookie("_screwUnit_show") || "all";
          runner = Screw.Interface.Runner.toView({root: Screw.rootDescription(), show: show, postOnCompletion: true});
        });
        queue.add(function() {
          Screw.$('body').html(runner);
        });
        queue.add(function() {
          runner.run(self.runPaths());
        })
        queue.start();
      });
    },

    runPaths: function() {
      var afterHash = Screw.Interface.getLocation().href.split("?")[1];
      if (afterHash) {
        return JSON.parse(afterHash);
      } else {
        return null;
      }
    }
  },

  content: function(initialAttributes) { with (this.builder) {
    div({'id': "screwUnitRunner"}, function() {
      table({'id': "screwUnitHeader"}, function() {
        tbody(function() {
          tr(function() {
            td({'id': "screwUnitControls"}, function() {
              button({'id': "showAll"}, "Show All").click(function(view) {
                view.showAll();
              });
              button({'id': "showFailed"}, "Show Failed").click(function(view) {
                view.showFailed();
              });
              button({'id': "rerunAll"}, "Rerun All").click(function(view) {
                view.rerunAll();
              });
              button({'id': "rerunFailed"}, "Rerun Failed").click(function(view) {
                view.rerunFailed();
              });
            });
            td(function() {
              subview('progressBar', Screw.Interface.ProgressBar, {root: initialAttributes.root});
            });
          })
        })
      });

      div({'id': 'testContent'});

      ul({'class': 'descriptions'}, function() {
        subview('rootDescription', Screw.Interface.Description, {description: initialAttributes.root, buildImmediately: initialAttributes.buildImmediately});
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      if (this.show == "all") this.addClass('showAll');
      if (this.show == "failed") this.addClass("showFailed");
    },

    showFailed: function() {
      jQuery.cookie("_screwUnit_show", "failed", {path: "/"});
      this.addClass('showFailed');
      this.removeClass('showAll');
    },

    showAll: function() {
      jQuery.cookie("_screwUnit_show", "all", {path: "/"});
      this.addClass('showAll');
      this.removeClass('showFailed');
    },

    rerunFailed: function() {
      var failingPaths = Monarch.Util.map(this.root.failedExamples(), function(example) { return example.path() });
      Screw.Interface.setLocation(Screw.Interface.baseLocation() + '?' + JSON.stringify(failingPaths));
    },

    rerunAll: function() {
      Screw.Interface.setLocation(Screw.Interface.baseLocation());
    },

    run: function(runPaths) {
      var self = this;
      var objectsToRun = this.determineRunnablesToRun(runPaths);
      this.completedExampleCount = 0;
      this.totalExamples = Screw.rootDescription().totalExamples();

      var queue = new Monarch.Queue();
      this.root.onExampleCompleted(function() { self.exampleCompleted() } );
      
      Monarch.Util.each(objectsToRun, function(runnable) {
        runnable.addToQueue(queue);
      });

      queue.start();
    },

    determineRunnablesToRun: function(runPaths) {
      if (!runPaths) return [this.root];

      var self = this;
      var runnablesToRun = [];
      Monarch.Util.each(runPaths, function(path) {
        var runnable = self.root.runnableAtPath(path);
        if (runnable) {
          runnablesToRun.push(runnable);
        } else {
          throw new Error("No runnable at path " + path);
        }
      });
      return runnablesToRun;
    },

    exampleCompleted: function() {
      this.completedExampleCount++;
      if (this.completedExampleCount == this.totalExamples) this.allExamplesCompleted();
    },

    allExamplesCompleted: function() {
      var isSuccess = (Screw.rootDescription().failedExamples().length == 0);
      this.find("ul.descriptions").addClass(isSuccess ? "passed" : "failed");
      if (this.postOnCompletion) {
        var outcome = (isSuccess) ? "success" : this.root.failureMessages().join("\n");
        Screw.jQuery.ajax({ type: 'POST', url: '/complete', data: outcome });
      }
    }
  }
});

})(Screw, Monarch, jQuery);
