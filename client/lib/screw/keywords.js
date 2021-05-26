(function(Screw, Monarch) {

Monarch.module("Screw.Keywords", {
  describe: function(name, fn) {
    Screw.pushDescription(new Screw.Description(name));
    fn();
    Screw.popDescription();
  },

  context: function(name, fn) {
    this.describe(name, fn);
  },

  scenario: function(name, fn) {
    Screw.pushScenario(new Screw.Description(name));
    fn();
    Screw.popScenario();
  },

  it: function(name, fn) {
    Screw.currentDescription().addExample(new Screw.Example(name, fn));
  },

  specify: function(name, fn) {
    this.it(name, fn);
  },

  they: function(name, fn) {
    this.it(name, fn);
  },

  before: function(fn) {
    Screw.currentDescription().addBefore(fn);
  },

  init: function(fn) {
    Screw.currentDescription().addInit(fn);
  },

  after: function(fn) {
    Screw.currentDescription().addAfter(fn);
  },

  expect: function(actual) {
    var funcname = function(f) {
      var s = f.toString().match(/function (\w*)/)[1];
      if ((s == null) || (s.length == 0)) return "anonymous";
      return s;
    };

    var stacktrace = function() {
      var s = "";
      for(var a = arguments.caller; a != null; a = a.caller) {
        s += funcname(a.callee) + "\n";
        if (a.caller == a) break;
      }
      return s;
    };

    return {
      to: function(matcher, expected, not) {
        var matched = matcher.match(expected, actual);
        if (not ? matched : !matched) {
          if (Screw.debugOnFail) debugger;
          throw(new Error(matcher.failureMessage(expected, actual, not)));
        }
      },

      toNot: function(matcher, expected) {
        this.to(matcher, expected, true);
      }
    }
  },

  mock: function(object, methodName, standInFunctionOrProxyFlag) {
    if (!object[methodName]) {
      throw new Error("in mockFunction: " + methodName + " is not a function that can be mocked");
    }

    var standInFunction = null;
    if (standInFunctionOrProxyFlag === 'proxy') {
      standInFunction = function() {
        return Screw.Keywords.original(arguments);
      }
    } else {
      standInFunction = standInFunctionOrProxyFlag;
    }


    var mockFunction = this.mockFunction(standInFunction);
    mockFunction.mockedObject = object;
    mockFunction.functionName = methodName;
    mockFunction.originalFunction = object[methodName];
    mockFunction.boundOriginalFunction = function() {
      return mockFunction.originalFunction.apply(object, arguments);
    };

    Screw.mocks.push(mockFunction);
    object[methodName] = mockFunction;

    return object;
  },

  mockProxy: function(object, methodName) {
    return Screw.Keywords.mock(object, methodName, 'proxy');
  },

  mockFunction: function() {
    var fnToCall, functionName;

    if (arguments.length == 2) {
      functionName = arguments[0];
      fnToCall = arguments[1];
    } else if (arguments.length == 1) {
      if (typeof arguments[0] == "function") {
        fnToCall = arguments[0];
      } else {
        functionName = arguments[0];
      }
    }

    functionName = functionName || "mock function";

    var mockFunction = function() {
      var argsArray = Array.prototype.slice.call(arguments)
      mockFunction.callCount += 1;
      mockFunction.thisValues.push(this);
      mockFunction.mostRecentThisValue =  this;
      mockFunction.callArgs.push(argsArray);
      mockFunction.mostRecentArgs = argsArray;

      if (fnToCall) {
        return fnToCall.apply(this, argsArray);
      }
    };

    mockFunction.functionName = functionName;
    mockFunction.clear = function() {
      this.callCount = 0;
      this.callArgs = [];
      this.thisValues = [];
      this.mostRecentArgs = null;
      this.mostRecentThisValue = null;
    }
    mockFunction.clear();
    return mockFunction;
  },

  original: function() {
    var mockFunction = arguments.callee.caller.caller; 
    return mockFunction.boundOriginalFunction.apply(null, mockFunction.arguments);
  }
});

})(Screw, Monarch);
