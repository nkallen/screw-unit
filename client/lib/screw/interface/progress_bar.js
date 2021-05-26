(function(Screw, Monarch) {

Monarch.constructor("Screw.Interface.ProgressBar", Monarch.View.Template, {
  content: function(initialAttributes) { with(this.builder) {
    div({'id': 'screwUnitProgressBar'}, function() {
      div({'id': 'screwUnitProgress'});
      div({'id': 'screwUnitProgressText'});
    });
  }},

  viewProperties: {
    initialize: function() {
      var self = this;
      this.totalExamples = this.root.totalExamples();
      this.root.onExampleCompleted(function(example) {
        self.updateProgress(example);
      });


      this.completedExamples = 0;
      this.failedExamples = 0;

      this.progressDiv = this.find('div#screwUnitProgress');
      this.progressTextDiv = this.find('div#screwUnitProgressText');

      this.resizeProgressDiv();
      this.refreshProgressText();
    },

    updateProgress: function(example) {
      this.completedExamples++;
      if (example.failed) {
        this.failedExamples++;
        this.addClass('failed');
      }

      this.resizeProgressDiv();
      this.refreshProgressText();
    },

    resizeProgressDiv: function() {
      var percentComplete = (this.totalExamples == 0) ? 0 : (this.completedExamples / this.totalExamples * 100);
      this.progressDiv.css("width", percentComplete + "%");
    },

    refreshProgressText: function() {
      this.progressTextDiv.html(this.completedExamples + " of " + this.totalExamples + " completed. " + this.failedExamples + " failed.");
    }
  }
});

})(Screw, Monarch);
