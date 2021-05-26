Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Example", function() {
    var example, description, view, failureMessage, shouldFail;
    before(function() {
      failureMessage = "sharon ly says die!";
      example = new Screw.Example("passes or fails", function() {
        if (shouldFail) throw(new Error(failureMessage));
      });

      description = new Screw.Description("parent description");
      description.addExample(example);
      view = Screw.Interface.Example.toView({example: example, buildImmediately: true});
    });

    describe("#content", function() {
      it("renders the associated Example's #name", function() {
        expect(view.html()).to(match, example.name);
      });
    });

    describe("#focus", function() {
      it("sets window.location to match the path of the view's Example", function() {
        mock(Screw.Interface, 'getLocation', function() {
          return { href: "http://localhost:8080/specs?[[0]]"};
        });

        mock(Screw.Interface, 'setLocation');
        view.focus();
        expect(Screw.Interface.setLocation).to(haveBeenCalled, withArgs("http://localhost:8080/specs?" + JSON.stringify([example.path()])));
      });
    });

    describe("when span.name is clicked", function() {
      it("calls #focus on the view", function() {
        mock(view, 'focus');
        view.find('span.name').click();
        expect(view.focus).to(haveBeenCalled);
      });
    });

    describe("when its associated Example fails", function() {
      before(function() {
        shouldFail = true;
      });

      it("applies the 'failed' class to its content", function() {
        expect(view.hasClass('failed')).to(beFalse);
        example.run();
        expect(view.hasClass('failed')).to(beTrue);
      });

      it("appends the failure message", function() {
        example.run();
        expect(view.html()).to(match, failureMessage);
      });

      it("appends the stacktrace", function() {
        var stack;
        example.onFail(function(e) {
          stack = e.stack;
        })
        example.run();
        var stackWithoutLinks = view.html().replace(/<a[^>]+>/g, "").replace(/<\/a>/g, "");
        expect(stackWithoutLinks).to(match, stack);
      });

      it("includes links to spec files within the stack trace", function() {
        var stack;
        example.onFail(function(e) {
          stack = e.stack;
        });
        example.run();

        var matches = stack.match(/(http:\/\/.*_spec).js/);
				console.debug(matches);
				console.debug(view.html());
				
        expect(matches.length).to(beGt, 1);
        expect(view.find("a[href="+matches[1]+"]")).toNot(beEmpty);
      });
    });

    describe("when its associated Example passes", function() {
      before(function() {
        shouldFail = false;
      });

      it("applies the 'passed' class to its content", function() {
        expect(view.hasClass('passed')).to(beFalse);
        example.run();
        expect(view.hasClass('passed')).to(beTrue);
      });
    });

    describe("#focus", function() {
      var originalScrewOptions;
      before(function() {
        originalScrewOptions = Screw.Interface.options;
        Screw.Interface.options = {};
      });

      after(function() {
        Screw.Interface.options = originalScrewOptions;
      });
    });
  });
}});
