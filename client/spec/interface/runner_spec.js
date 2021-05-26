Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Runner", function() {
    var root, childDescription1, childDescription1Example, childDescription2, view, show;

    before(function() {
      Screw.Monarch.Queue.synchronous = true;

      root = new Screw.Description("all specs");
      childDescription1 = new Screw.Description("child description 1");
      childDescription2 = new Screw.Description("child description 2");
      childDescription1Example = new Screw.Example("child description 1 example", function() {  });
      childDescription1.addExample(childDescription1Example);

      root.addDescription(childDescription1);
      root.addDescription(childDescription2);

      view = Screw.Interface.Runner.toView({root: root, buildImmediately: true, show: show});
      mock(Screw.jQuery, 'cookie');
      mock(Screw.jQuery, 'ajax');
    });
    
    after(function() {
      Screw.Monarch.Queue.synchronous = false;
    });

    init(function() {
      show = 'all'
    });


    describe(".runPaths", function() {
      it("returns the string following # parsed as JSON", function() {
        mock(Screw.Interface, 'getLocation', function() {
          return {
            href: "http://localhost:8080/specs?[[1], [2,0,0]]"
          }
        });
        expect(Screw.Interface.Runner.runPaths()).to(equal, [[1], [2,0,0]]);
      });
    });

    describe(".toView", function() {
      context("when passed the show: 'all' option", function() {
        it("renders itself with the 'showAll' class and not the 'showFailed' class", function() {
          expect(view.hasClass("showAll")).to(beTrue);
          expect(view.hasClass("showFailed")).to(beFalse);
        });
      });

      context("when passed the show: 'failed' option'", function() {
        init(function() {
          show = 'failed';
        });

        it("renders itself with the 'showFailed' class and not the 'showAll' class", function() {
          expect(view.hasClass("showFailed")).to(beTrue);
          expect(view.hasClass("showAll")).to(beFalse);
        });
      });
    });


    describe("#run", function() {
      context("when passed an array of paths as the runPaths: option", function() {
        it("calls addToQueue on the examples or descriptions corresponding to the paths, then starts the queue", function() {
          mock(childDescription1, 'addToQueue');
          mock(childDescription1Example, 'addToQueue');
          mock(childDescription2, 'addToQueue');

          view.run([[0, 0], [1]]);

          expect(childDescription1.addToQueue).toNot(haveBeenCalled);
          expect(childDescription1Example.addToQueue).to(haveBeenCalled, once);
          expect(childDescription2.addToQueue).to(haveBeenCalled, once);
        });
      });

      context("when passed no runPaths", function() {
        it("calls #addToQueue on root", function() {
          mock(root, 'addToQueue');
          view.run();
          expect(root.addToQueue).to(haveBeenCalled);
        });
      });
    });

    describe("buttons", function() {
      var passingExample, failingExample1, failingExample2, example1;
      before(function() {

        passingExample = new Screw.Example("passing example 1", function() {
        });
        failingExample1 = new Screw.Example("failing example 1", function() {
          throw new Error();
        });
        failingExample2 = new Screw.Example("failing example 1", function() {
          throw new Error();
        });
        childDescription1.addExample(passingExample);
        childDescription1.addExample(failingExample1);
        childDescription1.addExample(failingExample2);
        view = Screw.Interface.Runner.toView({root: root, buildImmediately: true});
      });

      describe("when the 'Show Failed' button is clicked", function() {
        before(function() {
          Screw.$('div#testContent').html(view);
        });

        after(function() {
          Screw.$("div#testContent").html("");
        });

        it("applies the 'showFailed' class to the root element of the view", function() {
          expect(view.hasClass('showFailed')).to(beFalse);
          view.find("button#showFailed").click();
          expect(view.hasClass('showFailed')).to(beTrue);
        });

        it("removes the 'showAll' class from the root element of the view", function() {
          view.addClass("showAll");
          view.find("button#showFailed").click();
          expect(view.hasClass('showAll')).to(beFalse);
        });

        it("stores a cookie to retain the setting across refreshes", function() {
          view.find("button#showFailed").click();
          expect(Screw.jQuery.cookie).to(haveBeenCalled, withArgs("_screwUnit_show", "failed", {path: "/"}));
        });
      });

      describe("when the 'Show All' button is clicked", function() {
        before(function() {
          Screw.$('div#testContent').html(view);
        });

        after(function() {
          Screw.$("div#testContent").html("");
        });

        it("applies the 'showAll' class to the root element of the view", function() {
          view.removeClass("showAll");
          expect(view.hasClass('showAll')).to(beFalse);
          view.find("button#showAll").click();
          expect(view.hasClass('showAll')).to(beTrue);
        });

        it("removes the 'showAll' class from the root element of the view", function() {
          view.addClass("showFailed");
          view.find("button#showAll").click();
          expect(view.hasClass('showFailed')).to(beFalse);
        });

        it("stores a cookie to retain the setting across refreshes", function() {
          view.find("button#showAll").click();
          expect(Screw.jQuery.cookie).to(haveBeenCalled, withArgs("_screwUnit_show", "all", {path: "/"}));
        });
      });

      describe("when the Rerun All button is clicked", function() {
        it("sets window.location to the current path, without any path specifier", function() {
          mock(Screw.Interface, 'getLocation', function() {
            return { href: "http://localhost:8080/specs?[[0]]"};
          });

          mock(Screw.Interface, 'setLocation');
          view.find("button#rerunAll").click();
          expect(Screw.Interface.setLocation).to(haveBeenCalled, withArgs("http://localhost:8080/specs"));
        });
      });

      describe("when the Rerun Failed button is clicked", function() {
        it("sets window.location to the paths of all currently failing examples", function() {
          view.run();
          mock(Screw.Interface, 'getLocation', function() {
            return { href: "http://localhost:8080/specs?[[0]]"};
          });
          mock(Screw.Interface, 'setLocation');

          view.find("button#rerunFailed").click();

          expect(Screw.Interface.setLocation).to(haveBeenCalled);
          expect(Screw.Interface.setLocation).to(haveBeenCalled, withArgs("http://localhost:8080/specs?" + JSON.stringify([failingExample1.path(), failingExample2.path()])));
        });
      });
    });

    describe("#exampleCompleted", function() {
      describe("when the examples are completed", function() {
        before(function() {
          view.completedExampleCount = 0;
          view.totalExamples = 1;
        });

        describe("when there were failures", function() {
          before(function() {
            mock(Screw.rootDescription(), "failedExamples", function() { return [1]; });
          });

          it("adds the .failed class to the root description", function() {
            view.exampleCompleted();

            expect(Screw.rootDescription().failedExamples).to(haveBeenCalled, once);
            expect(view.find("ul.descriptions").hasClass("failed")).to(beTrue);
          });
        });

        describe("when all examples passed", function() {
          before(function() {
            mock(Screw.rootDescription(), "failedExamples", function() { return []; });
          });

          it("adds the .passed class to the root description", function() {
            view.exampleCompleted();
            expect(Screw.rootDescription().failedExamples).to(haveBeenCalled, once);
            expect(view.find("ul.descriptions").hasClass("passed")).to(beTrue);
          });
        });
      });
    });
  });
}});
