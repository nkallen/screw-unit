Screw.Unit(function(c) { with(c) {
  describe("#mock", function() {
    context("when passed an object and the name of a function on that object", function() {
      var object;
      before(function() {
        object = {
          foo: function() {
            return "originalFooValue";
          },
          bar: function() {
            this.barArguments = arguments;
            return "originalBarValue";
          }
        };
        mock(object, 'foo');
      });

      it("records the #callCount on that function", function() {
        expect(object.foo.callCount).to(equal, 0);
        object.foo();
        expect(object.foo.callCount).to(equal, 1);
        object.foo();
        expect(object.foo.callCount).to(equal, 2);
      });

      it("pushes the arguments of the call to a #callArgs array on that function", function() {
        expect(object.foo.callArgs).to(equal, []);
        object.foo("bar", "baz");
        expect(object.foo.callArgs).to(equal, [["bar", "baz"]]);
        object.foo("quux");
        expect(object.foo.callArgs).to(equal, [["bar", "baz"], ["quux"]]);
      });

      it("sets #mostRecentArgs on the function", function() {
        expect(object.foo.mostRecentArgs).to(equal, null);
        object.foo("bar", "baz");
        expect(object.foo.mostRecentArgs).to(equal, ["bar", "baz"]);
        object.foo("quux");
        expect(object.foo.mostRecentArgs).to(equal, ["quux"]);
      });
      
      context("when passed a function as its third argument", function() {
        var callArgs;
        before(function() {
          callArgs = [];
          mock(object, "bar", function() {
            callArgs.push(Array.prototype.slice.call(arguments));
          });
        });

        it("calls the function", function() {
          object.bar("bar", "baz");
          expect(callArgs).to(equal, [["bar", "baz"]]);
          object.bar("quux");
          expect(callArgs).to(equal, [["bar", "baz"], ["quux"]]);
        });
      });

      context("when passed 'proxy' as its third argument", function() {
        before(function() {
          mock(object, "bar", "proxy");
        });

        it("still invokes the original function from the wrapper, but records the call for verification", function() {
          expect(object.bar("bar", "baz")).to(equal, "originalBarValue");
          expect(object.bar.mostRecentArgs).to(equal, ["bar", "baz"]);
          expect(object.barArguments[0]).to(equal, "bar");
          expect(object.barArguments[1]).to(equal, "baz");
        });
      });
    });
  })

  describe("#mockFunction", function() {
    var mockFn;
    before(function() {
      mockFn = mockFunction();
    });

    it("records the #callCount on that function", function() {
      expect(mockFn.callCount).to(equal, 0);
      mockFn();
      expect(mockFn.callCount).to(equal, 1);
      mockFn();
      expect(mockFn.callCount).to(equal, 2);
    });

    it("pushes the arguments of the call to a #callArgs array on that function", function() {
      expect(mockFn.callArgs).to(equal, []);
      mockFn("bar", "baz");
      expect(mockFn.callArgs).to(equal, [["bar", "baz"]]);
      mockFn("quux");
      expect(mockFn.callArgs).to(equal, [["bar", "baz"], ["quux"]]);
    });

    it("sets #mostRecent args on the function", function() {
      expect(mockFn.mostRecentArgs).to(equal, null);
      mockFn("bar", "baz");
      expect(mockFn.mostRecentArgs).to(equal, ["bar", "baz"]);
      mockFn("quux");
      expect(mockFn.mostRecentArgs).to(equal, ["quux"]);
    });

    it("pushes the 'this' value of the call to a #thisValues array and sets #mostRecentThisVaule", function() {
      var a = { mockFn: mockFn };
      var b = { mockFn: mockFn };

      expect(mockFn.thisValues).to(equal, []);
      expect(mockFn.mostRecentThisValue).to(beNull);
      a.mockFn();
      expect(mockFn.thisValues).to(equal, [a]);
      expect(mockFn.mostRecentThisValue).to(equal, a);

      b.mockFn();
      expect(mockFn.thisValues).to(equal, [a, b]);
      expect(mockFn.mostRecentThisValue).to(equal, b);
    });

    context("when passed a functionName as its only argument", function() {
      it("assigns functionName to the given name", function() {
        var mockFn = mockFunction("function name");
        expect(mockFn.functionName).to(equal, "function name");
      });
    });

    context("when passed a function as its only argument", function() {
      var thisValue, callArgs;
      before(function() {
        callArgs = [];
        mockFn = mockFunction(function() {
          thisValue = this;
          callArgs.push(Array.prototype.slice.call(arguments));
        });
      });

      it("calls the function with the same 'this'", function() {
        var a = { mockFn: mockFn };
        var b = { mockFn: mockFn };
        a.mockFn("bar", "baz");
        expect(thisValue).to(equal, a);
        expect(callArgs).to(equal, [["bar", "baz"]]);

        b.mockFn("quux");
        expect(thisValue).to(equal, b);
        expect(callArgs).to(equal, [["bar", "baz"], ["quux"]]);
      });
    });

    context("when passed a functionName and a function as its arguments", function() {
      it("assigns functionName to the given name and calls the function when it is called", function() {
        var functionToCall = mockFunction("function to call");
        var mockFn = mockFunction("function name", functionToCall);
        expect(mockFn.functionName).to(equal, "function name");
        
        mockFn();

        expect(functionToCall).to(haveBeenCalled);
      });
    });

    describe("#clear on the results of #mockFunction", function() {
      it("resets all recorded call data", function() {
        var a = { mockFn: mockFn };
        a.mockFn("foo");

        expect(mockFn.thisValues).to(equal, [a]);
        expect(mockFn.mostRecentThisValue).to(equal, a);
        expect(mockFn.callCount).to(equal, 1);
        expect(mockFn.callArgs).to(equal, [["foo"]]);
        expect(mockFn.mostRecentArgs).to(equal, ["foo"]);

        mockFn.clear();

        expect(mockFn.thisValues).to(equal, []);
        expect(mockFn.mostRecentThisValue).to(equal, null);
        expect(mockFn.callCount).to(equal, 0);
        expect(mockFn.callArgs).to(equal, []);
        expect(mockFn.mostRecentArgs).to(equal, null);
      });
    });

  });
}});