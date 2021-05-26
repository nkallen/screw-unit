Screw.Unit(function(c) { with(c) {
  var globalBeforeInvoked = false, globalAfterInvoked = false;
  before(function() { globalBeforeInvoked = true });
  after(function() { globalAfterInvoked = true });

  describe("a simple [describe]", function() {
    it("invokes the global [before] before an [it]", function() {
      expect(globalBeforeInvoked).to(equal, true);
      globalBeforeInvoked = false;
    });

    it("invokes the global [before] before each [it]", function() {
      expect(globalBeforeInvoked).to(equal, true);
      globalAfterInvoked = false;
    });

    it("invokes the global [after] after an [it]", function() {
      expect(globalAfterInvoked).to(equal, true);
    });
  });

  describe("a [describe] with a [before] and [after] block", function() {
    var beforeInvoked = false, afterInvoked = false;
    before(function() { beforeInvoked = true });
    after(function() { afterInvoked = true });

    describe('[after] blocks', function() {
      it("does not invoke the [after] until after the first [it]", function() {
        expect(afterInvoked).to(equal, false);
      });

      it("invokes the [after] after the first [it]", function() {
        expect(afterInvoked).to(equal, true);
        afterInvoked = false;
      });

      it("invokes the [after] after each [it]", function() {
        expect(afterInvoked).to(equal, true);
      });
    });

    describe('[before] blocks', function() {
      it("invokes the [before] before an it", function() {
        expect(beforeInvoked).to(equal, true);
        beforeInvoked = false;
      });

      it("invokes the [before] before each it", function() {
        expect(beforeInvoked).to(equal, true);
      });
    });
  });

  describe("A [describe] with two [before] and two [after] blocks", function() {
    var beforeInvocations = [], afterInvocations = [];
    before(function() { beforeInvocations.push('before 1') });
    before(function() { beforeInvocations.push('before 2') });

    after(function() { afterInvocations.push('after 1') });
    after(function() { afterInvocations.push('after 2') });

    it("invokes the [before]s in lexical order before each [it]", function() {
      expect(beforeInvocations).to(equal, ['before 1', 'before 2']);
    });

    it("invokes the [afters]s in lexical order after each [it]", function() {
      expect(afterInvocations).to(equal, ['after 1', 'after 2']);
    });
  });

  describe("A describe with a nested describe", function() {
    var beforeInvocations = [], afterInvocations = [], clearAfterInvocations, expectedThisInvocations;
    before(function() {
      clearAfterInvocations = true;
      beforeInvocations = [];
      beforeInvocations.push("outermost before");

      expectedThisInvocations = undefined;
      this.invocations = [];
      this.invocations.push("outermost before");
    });

    after(function() {
      afterInvocations.push("outermost after");
      this.invocations.push("outermost after");
      if (clearAfterInvocations) afterInvocations = [];
      if (expectedThisInvocations) {
        expect(this.invocations).to(equal, expectedThisInvocations);
      }
    });

    it("outside a nested [describe], does not invoke any of the nested's [before]s", function() {
      expect(beforeInvocations).to(equal, ["outermost before"]);
      clearAfterInvocations = false;
    });

    it("outside a nested [describe], does not invoke any of the nested's [after]s", function() {
      expect(afterInvocations).to(equal, ["outermost after"]);
    });

    describe("a nested [describe]", function() {
      before(function() {
        beforeInvocations.push("inner before");
        this.invocations.push("inner before");
      });

      after(function() {
        afterInvocations.push("inner after");
        this.invocations.push("inner after");
      });

      it("runs [before]s in the parent [describe] before each [it]", function() {
        expect(beforeInvocations).to(equal, ["outermost before", "inner before"]);
        clearAfterInvocations = false;
      });

      it("runs [after]s in the parent [describe] after each [it]", function() {
        expect(afterInvocations).to(equal, ["inner after", "outermost after"]);
      });

      describe("a doubly nested [describe]", function() {
        before(function() {
          beforeInvocations.push('innermost before');
          this.invocations.push('innermost before');
        });

        after(function() {
          afterInvocations = [];
          afterInvocations.push('innermost after');
          this.invocations.push('innermost after');
        });

        it("runs all befores and afters in the context of the same object", function() {
          this.invocations.push("example");
          expectedThisInvocations = ["outermost before", "inner before", "innermost before", "example", "innermost after", "inner after", "outermost after"];
        });

        describe('[before] blocks', function() {
          it("runs [before]s in all ancestors before an [it]", function() {
            expect(beforeInvocations).to(equal, ["outermost before", "inner before", "innermost before"]);
          });

          it("runs [before]s in all ancestors before each [it]", function() {
            expect(beforeInvocations).to(equal, ["outermost before", "inner before", "innermost before"]);
            clearAfterInvocations = false;
          });
        });

        describe('[after] blocks', function() {
          it("runs [after]s in all ancestors after each [it]", function() {
            expect(afterInvocations).to(equal, ["innermost after", "inner after", "outermost after"]);
          });
        });
      });
    });
  });

  describe("A describe block with exceptions", function() {
    var afterInvoked = false;
    after(function() {
      afterInvoked = true;
    });

    describe("an exception in a test", function() {
      it("fails because it throws an exception (NOTE: deliberate failure required to exercise the next example)", function() {
        throw(new Error('an exception'));
      });

      it("invokes [after]s even if the previous [it] raised an exception", function() {
        expect(afterInvoked).to(equal, true);
      });
    });
  });

  describe("A describe with init blocks and before blocks", function() {
    var initAndBeforeInvocations;

    init(function() {
      initAndBeforeInvocations = ["outer init"];
    });

    before(function() {
      initAndBeforeInvocations.push("outer before");
    });

    describe("a nested describe with init and before blocks", function() {
      init(function() {
        initAndBeforeInvocations.push("inner init");
      });

      before(function() {
        initAndBeforeInvocations.push("inner before");
      });

      it("invokes all the init blocks, then all the before blocks, then this example", function() {
        expect(initAndBeforeInvocations).to(equal, ["outer init", "inner init", "outer before", "inner before"]);
      });
    });
  });

  describe("A describe with scenarios", function() {
    var exampleRunCount = 0;
    var nestedDescribeBeforeRunCount = 0;
    var scenarioNumber;

    scenario("1, defined before example", function() {
      before(function() {
        scenarioNumber = 1;
      });
    });

    it("runs this example within every scenario", function() {
      exampleRunCount++;
      expect(scenarioNumber).to(equal, exampleRunCount);
    });

    scenario("2, defined after example", function() {
      before(function() {
        scenarioNumber = 2;
      });
    });

    scenario("3, defined after example", function() {
      before(function() {
        scenarioNumber = 3;
      });
    });

    describe("should be copied within each scenario", function() {
      before(function() {
        nestedDescribeBeforeRunCount++;
        expect(scenarioNumber).to(equal, nestedDescribeBeforeRunCount);
      })

      it("runs this example within its describe in every scenario", function() {
        expect(scenarioNumber).to(equal, nestedDescribeBeforeRunCount);
      });
    });
  });
}});
