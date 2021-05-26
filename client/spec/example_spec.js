Screw.Unit(function(c) { with(c) {  
  describe("Screw.Example", function() {
    var example, name, fn, shouldFail, parentDescription, events, originalResetMocks, exampleContexts;

    before(function() {
      events = [];
      exampleContexts = [];

      name = "example"
      shouldFail = false;
      fn = function() {
        events.push("example function called");
        exampleContexts.push(this);
        if (shouldFail) throw(new Error("sad times"));
      };
      example = new Screw.Example(name, fn);
      parentDescription = new Screw.Description("parent description")
      parentDescription.runBefores = function(exampleContext) {
        events.push("runBefores called");
        exampleContexts.push(exampleContext);
      }
      parentDescription.runAfters = function(exampleContext) {
        events.push("runAfters called");
        exampleContexts.push(exampleContext);
      }

      example.parentDescription = parentDescription;

      originalResetMocks = Screw.resetMocks;
      Screw.resetMocks = function() {
        events.push("resetMocks called");
      }
    });

    after(function() {
      Screw.resetMocks = originalResetMocks;
    });

    describe("#initialize", function() {
      it("assigns #name and #fn", function() {
        expect(example.name).to(equal, name);
        expect(example.fn).to(equal, fn);
      });
      
      it("sets #failed and #passed to false", function() {
        expect(example.passed).to(beFalse);
        expect(example.failed).to(beFalse);
      });
    });

    describe("#clone", function() {
      it("makes a copy of the Example, with fresh SubscriptionNodes", function() {
        var originalPassCallback = mockFunction("original pass callback");
        var originalFailCallback = mockFunction("original fail callback");
        var originalCompletedCallback = mockFunction("original completed callback");
        var clonePassCallback = mockFunction("clone pass callback");
        var cloneFailCallback = mockFunction("clone fail callback");
        var cloneCompletedCallback = mockFunction("clone completed callback");


        example.onPass(originalPassCallback);
        example.onFail(originalFailCallback);
        example.onExampleCompleted(originalCompletedCallback);

        var clone = example.clone();

        expect(clone.name).to(equal, example.name);
        expect(clone.fn).to(equal, example.fn);

        clone.onPass(clonePassCallback);
        clone.onFail(cloneFailCallback);
        clone.onExampleCompleted(cloneCompletedCallback);

        clone.run();
        expect(clonePassCallback).to(haveBeenCalled, once);
        expect(originalPassCallback).toNot(haveBeenCalled);
        expect(cloneCompletedCallback).to(haveBeenCalled, once);
        expect(originalCompletedCallback).toNot(haveBeenCalled);

        shouldFail = true;
        clone.run();
        expect(cloneFailCallback).to(haveBeenCalled, once);
        expect(originalFailCallback).toNot(haveBeenCalled);
      });
    });

    describe("#run", function() {
      it("with the same example context, calls parentDescription.runBefores, invokes the example function, calls parentDescription.runAfters, then calls Screw.resetMocks", function() {
        example.run();
        expect(events).to(equal, ["runBefores called", "example function called", "runAfters called", "resetMocks called"]);
        expect(exampleContexts.length).to(equal, 3);
        expect(exampleContexts[0]).to(equal, exampleContexts[1]);
        expect(exampleContexts[0]).to(equal, exampleContexts[2]);
      });

      context("if the example fails", function() {
        before(function() {
          shouldFail = true;
        });
        
        it("invokes callbacks registered with #onFail", function() {
          var callbackInvoked = false;
          example.onFail(function() {
            callbackInvoked = true;
          })
          example.run();
          expect(callbackInvoked).to(beTrue);
        });

        it("assigns #failed to true and #passed to false", function() {
          expect(example.passed).to(beFalse);
          expect(example.failed).to(beFalse);
          example.run();
          expect(example.passed).to(beFalse);
          expect(example.failed).to(beTrue);
        });
      });

      context("if the example passes", function() {
        before(function() {
          expect(shouldFail).to(beFalse);
        });

        it("invokes callbacks registered with #onPass", function() {
          var callbackInvoked = false;
          example.onPass(function() {
            callbackInvoked = true;
          })
          example.run();
          expect(callbackInvoked).to(beTrue);
        });

        it("assigns #passed to true and #failed to false", function() {
          expect(example.passed).to(beFalse);
          expect(example.failed).to(beFalse);
          example.run();
          expect(example.passed).to(beTrue);
          expect(example.failed).to(beFalse);
        });
      });
    });

    describe("#totalExamples", function() {
      it("always returns 1", function() {
        expect(example.totalExamples()).to(equal, 1);
      });
    });

    describe("#path", function() {
      it("returns #index concatenated to the #path of the #parentDescription", function() {
        expect(example.path()).to(equal, parentDescription.path() + [example.index]);
      });
    });

    describe("#failureMessage", function() {
      describe("when the example passes", function() {
        it("returns null", function() {
          example.run();
          expect(example.failureMessage).to(equal, null);
        });
      });

      describe("when the example fails", function() {
        before(function() {
          shouldFail = true;
        });

        it("returns the a message including the example's name and the error message", function() {
          example.run();
          expect(example.failureMessage).to(match, "sad times");
        });
      });
    });
  });
}});
