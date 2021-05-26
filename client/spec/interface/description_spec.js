Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Description", function() {
    var description, view;
    before(function() {
      var parentDescription = new Screw.Description("parent description");
      description = new Screw.Description("description");
      parentDescription.addDescription(description);
    });

    describe("#focus", function() {
      it("sets window.location to match the path of the view's Description", function() {
        view = Screw.Interface.Description.toView({description: description, buildImmediately: true});
        mock(Screw.Interface, 'getLocation', function() {
          return { href: "http://localhost:8080/specs?[[0]]"};
        });

        mock(Screw.Interface, 'setLocation');
        view.focus();
        expect(Screw.Interface.setLocation).to(haveBeenCalled, withArgs("http://localhost:8080/specs?" + JSON.stringify([description.path()])));
      });
    });

    describe("#content", function() {
      context("when the view is instantiated without the buildImmediately option", function() {
        var example1, example2, setTimeoutCallback;
        before(function() {
          example1 = new Screw.Example("example 1", function() { });
          example2 = new Screw.Example("example 2", function() { });
          description.addExample(example1);
          description.addExample(example2);
        });

        it("renders the outline of the Description's view immediately", function() {
          view = Screw.Interface.Description.toView({description: description});

          var examples = view.find('ul.examples');
          expect(examples.length).to(equal, 1);
          expect(examples.find('li').length).to(equal, 0);
        });

        it("renders the Description's descendents in a setTimeout context", function() {
          mock(window, "setTimeout", function(callback, delay) { callback.call(window); });
          view = Screw.Interface.Description.toView({description: description});

          var examples = view.find('ul.examples');
          expect(examples.length).to(equal, 1);
          expect(examples.find('li').length).to(equal, 2);
          expect(examples.html()).to(match, Screw.Interface.Example.toView({example: example1}).html());
          expect(examples.html()).to(match, Screw.Interface.Example.toView({example: example2}).html());
        });
      });

      context("when the view's Description has #examples", function() {
        var example1, example2;
        before(function() {
          example1 = new Screw.Example("example 1", function() {
            if (shouldFail) throw(new Error(failureMessage));
          });
          example2 = new Screw.Example("example 2", function() {
            if (shouldFail) throw(new Error(failureMessage));
          });
          description.addExample(example1);
          description.addExample(example2);
          view = Screw.Interface.Description.toView({description: description, buildImmediately: true});
        });

        it("renders all examples within a ul.examples", function() {
          var examples = view.find('ul.examples');
          expect(examples.length).to(equal, 1);
          expect(examples.find('li').length).to(equal, 2);
          expect(examples.html()).to(match, Screw.Interface.Example.toView({example: example1}).html());
          expect(examples.html()).to(match, Screw.Interface.Example.toView({example: example2}).html());
        });
      });

      context("when the view's Description has no #examples", function() {
        before(function() {
          view = Screw.Interface.Description.toView({description: description, buildImmediately: true});
        });

        it("does not render a ul.examples", function() {
          expect(view.find('ul.examples')).to(beEmpty);
        });
      });

      context("when the view's Description has #childDescriptions", function() {
        var childDescription1, childDescription2;
        before(function() {
          childDescription1 = new Screw.Description("child description 1");
          childDescription2 = new Screw.Description("child description 2");
          description.addDescription(childDescription1);
          description.addDescription(childDescription2);
          view = Screw.Interface.Description.toView({description: description, buildImmediately: true});
        });

        it("renders all child descriptions within a ul.childDescriptions", function() {
          var childDescriptions = view.find('ul.childDescriptions');
          expect(childDescriptions.length).to(equal, 1);
          expect(childDescriptions.find('li').length).to(equal, 2);
          expect(childDescriptions.html()).to(match, Screw.Interface.Description.toView({description: childDescription1, buildImmediately: true}).html());
          expect(childDescriptions.html()).to(match, Screw.Interface.Description.toView({description: childDescription2, buildImmediately: true}).html());
        });

      });

      context("when the view's Description has no #childDescriptions", function() {
        before(function() {
          view = Screw.Interface.Description.toView({description: description, buildImmediately: true});
        });

        it("does not render a ul.childDescriptions", function() {
          expect(view.find('ul.childDescriptions')).to(beEmpty);
        });
      });
    });

    describe("when span.name is clicked", function() {
      before(function() {
        view = Screw.Interface.Description.toView({description: description, buildImmediately: true});
      });

      it("calls #focus on the view", function() {
        mock(view, 'focus');
        view.find("span.name").click();
        expect(view.focus).to(haveBeenCalled);
      });
    });

    describe("when an Example nested within the associated Description is completed", function() {
      var grandchildExample, shouldFail;
      before(function() {
        view = Screw.Interface.Description.toView({description: description, buildImmediately: true});
        var childDescription = new Screw.Description("child description");
        grandchildExample = new Screw.Example("grandchild example", function() {
          if (shouldFail) throw(new Error("fails intentionally"));
        })
        childDescription.addExample(grandchildExample);
        description.addDescription(childDescription);
      });

      context("when the Example passes", function() {
        before(function() {
          shouldFail = false;
        });

        it("applies the 'passed' class to its content", function() {
          expect(view.hasClass('failed')).to(beFalse);
          expect(view.hasClass('passed')).to(beFalse);

          grandchildExample.run();

          expect(view.hasClass('failed')).to(beFalse);
          expect(view.hasClass('passed')).to(beTrue);
        });
      });

      context("when the Example fails", function() {
        before(function() {
          shouldFail = true;
        });

        it("applies the 'failed' class to its content", function() {
          expect(view.hasClass('failed')).to(beFalse);
          expect(view.hasClass('passed')).to(beFalse);
          grandchildExample.run();
          expect(view.hasClass('failed')).to(beTrue);
          expect(view.hasClass('passed')).to(beFalse);
        });
      });
    });
  });
}});
