(function(Screw, Monarch, jQuery) {
  Monarch.constructor("Screw.Interface.StreamingRunner", Monarch.View.Template, {
    constructorProperties: {
      runSpecsOnPageLoad: function(params) {
        jQuery(function() {
          jQuery('body').html(Screw.Interface.StreamingRunner.toView(params));
        });
      }
    },

    content: function() { with(this.builder) {
      div(function() {
        div(function() {
          span("Total Examples: ");
          span("0").ref('numCompletedExamplesSpan');
        });
        
        div(function() {
          span("Failed Examples: ");
          span("0").ref('numFailedExamplesSpan');
        });

        div(function() {
          span("Files: ")
          span("0").ref('numCompletedFilesSpan');
          span(" / ");
          span().ref('totalFilesSpan');
        });

        div(function() {
          span("Current File Path: ");
          span().ref('currentFileSpan');
        })

        div(function() {
          span("Examples In Current File: ")
          span("0").ref('completedExamplesInCurrentFileSpan');
          span(" / ")
          span().ref('totalExamplesInCurrentFileSpan');
        });

        ul(function() {

        }).ref("failuresList");

        div({id: "testContent"});
      });
    }},

    viewProperties: {
      initialize: function() {
        this.numCompletedExamples = 0;
        this.numFailedExamples = 0;
        this.numCompletedFiles = 0;
        this.totalFilesSpan.html(this.specPaths.length);

        var self = this;
        Screw.rootDescription().onExampleCompleted(function(example) {
          self.numCompletedExamples++;
          self.numCompletedExamplesSpan.html(self.numCompletedExamples);
          self.numCompletedExamplesInCurrentFile++;
          self.completedExamplesInCurrentFileSpan.html(self.numCompletedExamplesInCurrentFile);
          if (!example.passed) self.handleFailedExample(example);
          if (self.numCompletedExamplesInCurrentFile == self.numExamplesInCurrentFile) self.examplesCompletedForCurrentSpecFile();
        });

        this.loadNextSpecPath();
      },

      loadNextSpecPath: function() {
        if (this.specPaths.length == 0) return;
        var self = this;
        var path = this.specPaths.shift();
        this.currentFileSpan.html(path);

        setTimeout(function() {
          var scriptTag = document.createElement('script');
          scriptTag.type = 'text/javascript';
          scriptTag.src = path;
          scriptTag.onload = function() {
            self.runExamplesForCurrentSpecFile()
          };
          jQuery('head')[0].appendChild(scriptTag);
        }, 1);
      },

      runExamplesForCurrentSpecFile: function() {
        this.numExamplesInCurrentFile = Screw.rootDescription().totalExamples();
        this.numCompletedExamplesInCurrentFile = 0;
        this.completedExamplesInCurrentFileSpan.html("0");
        this.totalExamplesInCurrentFileSpan.html(this.numExamplesInCurrentFile);

        if (this.numExamplesInCurrentFile > 0) {
          Screw.rootDescription().run()
        } else {
          this.examplesCompletedForCurrentSpecFile();
        }
      },

      handleFailedExample: function(example) {
        this.numFailedExamples++;
        this.numFailedExamplesSpan.html(this.numFailedExamples);
        this.failuresList.appendView(function(b) {
          b.li(function() {
            b.div(example.fullName());
            b.div(example.failureMessage);
            b.pre(example.stack);
          });
        });
      },

      examplesCompletedForCurrentSpecFile: function() {
        Screw.clear();
        this.numCompletedFiles++;
        this.numCompletedFilesSpan.html(this.numCompletedFiles);
        this.loadNextSpecPath();
      }
    }
  });
})(Screw, Monarch, jQuery);
