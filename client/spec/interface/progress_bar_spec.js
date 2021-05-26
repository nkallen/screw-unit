Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.ProgressBar", function() {
    var description1, description2, example1, example2, example3, example4, view, shouldFail;
    before(function() {
      shouldFail = false;
      description1 = new Screw.Description("description");
      example1 = new Screw.Example("example 1", function() {
        if (shouldFail) throw "flunk";
      });
      example2 = new Screw.Example("example 1", function() {
        if (shouldFail) throw "flunk";
      });
      description1.addExample(example1);
      description1.addExample(example2);

      description2 = new Screw.Description("description");
      example3 = new Screw.Example("example 3", function() {
        if (shouldFail) throw "flunk";
      });
      example4 = new Screw.Example("example 4", function() {
        if (shouldFail) throw "flunk";
      });
      description2.addExample(example3);
      description2.addExample(example4);

      root = new Screw.Description('root');
      root.addDescription(description1);
      root.addDescription(description2);

      view = Screw.Interface.ProgressBar.toView({root: root});
    });

    describe("when an example within the given root is completed", function() {
      it("updates the width of the progress bar to the proportion of completed examples and updates the 'n of m completed' text", function() {
        expect(view.find('div#screwUnitProgress').css('width')).to(equal, '0%');
        expect(view.html()).to(match, "0 of 4");
        example1.run();
        expect(view.find('div#screwUnitProgress').css('width')).to(equal, '25%');
        expect(view.html()).to(match, "1 of 4");
        example2.run();
        expect(view.find('div#screwUnitProgress').css('width')).to(equal, '50%');
        expect(view.html()).to(match, "2 of 4");
      });
    });

    describe("when an example within the given root fails", function() {
      before(function() {
        shouldFail = true;
      });

      it("adds the 'failed' class to its content", function() {
        expect(view.hasClass('failed')).to(beFalse);
        example1.run();
        expect(view.hasClass('failed')).to(beTrue);
      });

      it("updates the 'n failed' text to the number of failing examples", function() {
        expect(view.html()).to(match, "0 failed");
        example1.run();
        expect(view.html()).to(match, "1 failed");
        example2.run();
        expect(view.html()).to(match, "2 failed");
      });
    });
  });
}});
