Screw.Unit(function(c) { with(c) {
  describe("Screw.Description", function() {
    var description, name, examples;

    before(function() {
      Screw.Monarch.Queue.synchronous = true;
      name = "description"
      description = new Screw.Description(name);
      examples = [];
      examples.push(new Screw.Example("example 1", function() {}));
      examples.push(new Screw.Example("example 2", function() {}));
      Screw.each(examples, function() {
        description.addExample(this);
      });
    });
    
    after(function() {
      Screw.Monarch.Queue.synchronous = false;
    });

    describe("#initialize", function() {
      it("assigns #name", function() {
        expect(description.name).to(equal, name);
      });
    });

    describe("#clone", function() {
      it("makes a copy of the Description and all its children, setting up to propagate onExampleCompleted events from its children to a new node", function() {
        description.addDescription(new Screw.Description("child description"));
        description.childDescriptions[0].addExample(new Screw.Example("grandchild example", function() {}));

        var originalExampleCompletedCallback = mockFunction("original example completed callback");
        var cloneExampleCompletedCallback = mockFunction("clone example completed callback");

        description.onExampleCompleted(originalExampleCompletedCallback);
        var clone = description.clone();
        clone.onExampleCompleted(cloneExampleCompletedCallback)

        clone.examples[0].run();
        expect(originalExampleCompletedCallback).toNot(haveBeenCalled);
        expect(cloneExampleCompletedCallback).to(haveBeenCalled);

        originalExampleCompletedCallback.clear();
        cloneExampleCompletedCallback.clear();

        clone.childDescriptions[0].examples[0].run();
        expect(originalExampleCompletedCallback).toNot(haveBeenCalled);
        expect(cloneExampleCompletedCallback).to(haveBeenCalled);
      });
    });


    describe("#addScenario", function() {
      function namesOf(array) {
        return Screw.map(array, function() {
          return this.name;
        });
      }

      it("causes all current and future Examples / Descriptions defined on the current Description to be defined on all scenario Descriptions instead", function() {
        var examplesOnParentBeforeScenarioAdded = Screw.$.extend([], description.examples);
        expect(examplesOnParentBeforeScenarioAdded).toNot(beEmpty);

        description.addDescription(new Screw.Description("child description"));
        var childDescriptionsOnParentBeforeScenarioAdded = Screw.$.extend([], description.childDescriptions);
        expect(childDescriptionsOnParentBeforeScenarioAdded).toNot(beEmpty);

        // adding the first scenario moves all examples and child descriptions to that scenario
        var scenario1 = new Screw.Description("scenario 1");
        description.addScenario(scenario1);

        expect(description.examples).to(beEmpty);
        expect(description.childDescriptions).to(equal, [scenario1]);
        expect(description.scenarioExamples).to(equal, examplesOnParentBeforeScenarioAdded);
        expect(description.scenarioChildDescriptions).to(equal, childDescriptionsOnParentBeforeScenarioAdded);

        expect(namesOf(scenario1.examples)).to(equal, namesOf(examplesOnParentBeforeScenarioAdded));
        expect(namesOf(scenario1.childDescriptions)).to(equal, namesOf(childDescriptionsOnParentBeforeScenarioAdded));

        // subsequent examples and descriptions are added to scenarios, not to the description itself
        var exampleAddedAfterScenario = new Screw.Example("example added after scenario", function() {});
        description.addExample(exampleAddedAfterScenario);

        var childDescriptionAddedAfterScenario = new Screw.Description("child description added after scenario");
        childDescriptionAddedAfterScenario.addExample(new Screw.Example("example in child description added after scenario", function() {}));
        description.addDescription(childDescriptionAddedAfterScenario);

        expect(description.examples).to(beEmpty);
        expect(description.childDescriptions).to(equal, [scenario1]);

        var expectedScenarioExamples = examplesOnParentBeforeScenarioAdded.concat([exampleAddedAfterScenario]);
        var expectedScenarioChildDescriptions = childDescriptionsOnParentBeforeScenarioAdded.concat([childDescriptionAddedAfterScenario]);
        expect(description.scenarioExamples).to(equal, expectedScenarioExamples);
        expect(description.scenarioChildDescriptions).to(equal, expectedScenarioChildDescriptions);
        expect(namesOf(scenario1.examples)).to(equal, namesOf(expectedScenarioExamples));
        expect(namesOf(scenario1.childDescriptions)).to(equal, namesOf(expectedScenarioChildDescriptions));

        // subsequent scenarios are added to childDescriptions, and inherit all examples and child descriptions already on other scenarios
        var scenario2 = new Screw.Description("scenario 2");
        description.addScenario(scenario2);

        expect(description.childDescriptions).to(equal, [scenario1, scenario2]);

        expect(namesOf(scenario2.examples)).to(equal, namesOf(expectedScenarioExamples));
        expect(namesOf(scenario2.childDescriptions)).to(equal, namesOf(expectedScenarioChildDescriptions));
        expect(namesOf(scenario1.examples)).to(equal, namesOf(expectedScenarioExamples));
        expect(namesOf(scenario1.childDescriptions)).to(equal, namesOf(expectedScenarioChildDescriptions));

        // copies of examples and descriptions copied to multiple scenarios have the correct parentDescription
        expect(scenario1.examples[0].parentDescription).to(equal, scenario1);
        expect(scenario1.childDescriptions[0].parentDescription).to(equal, scenario1);
        expect(scenario2.examples[0].parentDescription).to(equal, scenario2);
        expect(scenario2.childDescriptions[0].parentDescription).to(equal, scenario2);

        // correctly wires together onExampleCompletedEvents
        var descriptionExampleCompletedCallback = mockFunction("description example completed callback")
        var scenario1ExampleCompletedCallback = mockFunction("scenario 1 example completed callback");
        var scenario2ExampleCompletedCallback = mockFunction("scenario 2 example completed callback");

        description.onExampleCompleted(descriptionExampleCompletedCallback);
        scenario1.onExampleCompleted(scenario1ExampleCompletedCallback);
        scenario2.onExampleCompleted(scenario2ExampleCompletedCallback);
        
        scenario1.examples[0].run();
        expect(descriptionExampleCompletedCallback).to(haveBeenCalled, once);
        expect(scenario1ExampleCompletedCallback).to(haveBeenCalled, once);
        expect(scenario2ExampleCompletedCallback).toNot(haveBeenCalled);

        descriptionExampleCompletedCallback.clear();
        scenario1ExampleCompletedCallback.clear();
        scenario2ExampleCompletedCallback.clear();

        scenario2.childDescriptions[1].examples[0].run();
        expect(scenario2ExampleCompletedCallback).to(haveBeenCalled, once);
        expect(scenario1ExampleCompletedCallback).toNot(haveBeenCalled);
        expect(descriptionExampleCompletedCallback).to(haveBeenCalled, once);
      });
    });

    describe("#run", function() {
      it("calls #run on all examples and child descriptions", function() {
        var childDescription = new Screw.Description("child description");
        description.addDescription(childDescription);

        Screw.each(examples, function() {
          mock(this, 'run');
        })
        mock(childDescription, 'run');

        description.run();
        
        Screw.each(examples, function() {
          expect(this.run).to(haveBeenCalled);
        })
        expect(childDescription.run).to(haveBeenCalled);
      });
    });

    describe("#totalExamples", function() {
      it("sums all examples it contains and all the examples for all descriptions nested within it", function() {
        expect(description.totalExamples()).to(equal, examples.length);

        var nestedDescription = new Screw.Description("nested description with an example");
        nestedDescription.addExample(new Screw.Example("example", function() {}));
        description.addDescription(nestedDescription);
        expect(description.totalExamples()).to(equal, examples.length + nestedDescription.totalExamples());
      });
    });

    describe("with failing examples", function() {
      var rootDescription, childDescription, passingChildExample, failingChildExample, passingGrandchildExample, failingGrandchildExample;
      before(function() {
        rootDescription = new Screw.Description("root description")
        childDescription = new Screw.Description("child description")
        passingChildExample = new Screw.Example("passing child example", function() {});
        passingGrandchildExample = new Screw.Example("passing grandchild example", function() {});
        failingChildExample = new Screw.Example("failing child example", function() {
          throw new Error("child error message");
        })
        failingGrandchildExample = new Screw.Example("failing grandchild example", function() {
          throw new Error("grandchild error message");
        })

        rootDescription.addDescription(childDescription);
        rootDescription.addExample(passingChildExample);
        rootDescription.addExample(failingChildExample);
        childDescription.addExample(passingGrandchildExample);
        childDescription.addExample(failingGrandchildExample);
      });

      describe("#failedExamples", function() {
        it("returns all failed Examples descending from this describe", function() {
          rootDescription.run();
          expect(rootDescription.failedExamples()).to(equal, [failingChildExample, failingGrandchildExample]);
        });
      });

      describe("#failureMessages", function() {
        it("returns an array of the failure messages for all failing descendent examples", function() {
          rootDescription.run();
          expect(rootDescription.failureMessages()).to(equal, [failingChildExample.failureMessage,  failingGrandchildExample.failureMessage]);
        });
      });
    });

    describe("callbacks registered via #onExampleCompleted", function() {
      var onExampleCompletedArgs;

      before(function() {
        onExampleCompletedArgs = [];
        description.onExampleCompleted(function(example) {
          onExampleCompletedArgs.push(example);
        });
      });
      
      describe("when an Example has completed", function() {
        it("invokes registered callbacks", function() {
          var example = examples[0];
          example.run();
          expect(onExampleCompletedArgs).to(equal, [example]);
        });
      });

      describe("when a descendant Example is completed", function() {
        it("invokes registered callbacks", function() {
          var childDescription = new Screw.Description("child description");
          var grandchildExample = new Screw.Example("grandchild example", function() {});
          childDescription.addExample(grandchildExample);
          description.addDescription(childDescription);
          grandchildExample.run();
          expect(onExampleCompletedArgs).to(equal, [grandchildExample]);
        });
      });
    });


    describe("methods dealing with paths", function() {
      var rootDescription, childDescription0, childDescription1, grandchildDescription10;
      before(function() {
        rootDescription = new Screw.Description("root description");
        childDescription0 = new Screw.Description("child description 0");
        childDescription1 = new Screw.Description("child description 1");
        grandchildDescription10 = new Screw.Description("grandchild description 1 0");
        rootDescription.addDescription(childDescription0)
        rootDescription.addDescription(childDescription1);
        childDescription1.addDescription(grandchildDescription10);
      });
      
      describe("#path", function() {
        context("when there is no #parentDescription", function() {
          it("returns an empty Array", function() {
            expect(description.path()).to(beEmpty);
          });
        });

        context("when there is a #parentDescription", function() {
          it("returns #index concatenated to the #path of the #parentDescription", function() {
            expect(childDescription0.path()).to(equal, [0]);
            expect(grandchildDescription10.path()).to(equal, [1, 0]);
          });
        });
      });

      describe("#runnableAtPath", function() {
        it("returns the runnable object (Example or Description) found by traversing the tree along the given path", function() {
          expect(rootDescription.runnableAtPath([1, 0])).to(equal, grandchildDescription10);
        });
      });
    });
    
    describe("#runBefores", function() {
      it("calls #runBefores on the #parentDescription if there is one, then runs all the befores in the order they were added", function() {
        var events = [];
        var exampleContexts = [];
        description.addBefore(function() {
          events.push("parent before called")
          exampleContexts.push(this);
        });
        var childDescription = new Screw.Description("child description");
        childDescription.addBefore(function() {
          events.push("child before 1 called");
          exampleContexts.push(this);
        });

        childDescription.addBefore(function() {
          events.push("child before 2 called");
          exampleContexts.push(this);
        });
        description.addDescription(childDescription);
        
        childDescription.runBefores();

        expect(events).to(equal, ["parent before called", "child before 1 called", "child before 2 called"]);
        expect(exampleContexts.length).to(equal, 3);
        expect(exampleContexts[0]).to(equal, exampleContexts[1]);
        expect(exampleContexts[0]).to(equal, exampleContexts[2]);
      });
    });

    describe("#runAfters", function() {
      it("runs all the afters in the order they were added, with the given example context, then calls #runAfters on the #parentDescription if there is one", function() {
        var events = [];
        var exampleContexts = [];
        description.addAfter(function() {
          events.push("parent after called")
          exampleContexts.push(this);
        });
        var childDescription = new Screw.Description("child description");
        childDescription.addAfter(function() {
          events.push("child after 1 called");
          exampleContexts.push(this);
        })

        childDescription.addAfter(function() {
          events.push("child after 2 called");
          exampleContexts.push(this);
        })
        description.addDescription(childDescription);

        childDescription.runAfters();

        expect(events).to(equal, ["child after 1 called", "child after 2 called", "parent after called"]);
        expect(exampleContexts.length).to(equal, 3);
        expect(exampleContexts[0]).to(equal, exampleContexts[1]);
        expect(exampleContexts[0]).to(equal, exampleContexts[2]);
      });
    });
  });
}});
