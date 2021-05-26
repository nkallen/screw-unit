(function(Screw, Monarch) {

Monarch.module("Screw.Matchers", {
  eq: {
    match: function(expected, actual) {
      return expected === actual;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not === ' : ' to === ') + Screw.$.print(expected);
    }
  },

  equal: {
    match: function(expected, actual) {
      if (_ && _.isEqual) return _.isEqual(expected, actual);

      if(expected == actual) return true;
      if(actual == undefined) return false;

      if (expected instanceof Array) {
        if (! (actual instanceof Array)) return false;
        for (var i = 0; i < actual.length; i++)
          if (!Screw.Matchers.equal.match(expected[i], actual[i])) return false;
        return actual.length == expected.length;
      } else if (expected instanceof Object) {
        for (var key in expected)
          if (!this.match(expected[key], actual[key])) return false;
        for (var key in actual)
          if (!this.match(actual[key], expected[key])) return false;
        return true;
      }
      return false;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not equal ' : ' to equal ') + Screw.$.print(expected);
    }
  },

  beGt: {
    match: function(expected, actual) {
      return actual > expected;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than ' + Screw.$.print(expected);
    }
  },

  beGte: {
    match: function(expected, actual) {
      return actual >= expected;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than or equal to ' + Screw.$.print(expected);
    }
  },

  beLt: {
    match: function(expected, actual) {
      return actual < expected;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be less than ' + Screw.$.print(expected);
    }
  },

  beLte: {
    match: function(expected, actual) {
      return actual <= expected;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be less than or equal to ' + Screw.$.print(expected);
    }
  },

  match: {
    match: function(expected, actual) {
      if (expected.constructor == RegExp)
        return expected.exec(actual.toString());
      else
        return actual.indexOf(expected) > -1;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not match ' : ' to match ') + Screw.$.print(expected);
    }
  },

  beBlank: {
    match: function(expected, actual) {
      if (actual == undefined) return true;
      if (typeof(actual) == "string") actual = actual.replace(/^\s*(.*?)\s*$/, "$1");
      return Screw.Matchers.beEmpty.match(expected, actual);
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be blank' : ' to be blank');
    }
  },

  beEmpty: {
    match: function(expected, actual) {
      if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

      return actual.length == 0;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be empty' : ' to be empty');
    }
  },

  haveLength: {
    match: function(expected, actual) {
      if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

      return actual.length == expected;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not' : ' to') + ' have length ' + expected;
    }
  },

  beAnInstanceOf: {
    match: function(expected, actual) {
      return actual instanceof eval(expected);
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + typeof actual + (not ? ' not' : '') + ' be an instance of ' + expected;
    }
  },

  beNull: {
    match: function(expected, actual) {
      return actual == null;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be null' : ' to be null');
    }
  },

  beUndefined: {
    match: function(expected, actual) {
      return actual == undefined;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be undefined' : ' to be undefined');
    }
  },

  beTrue: {
    match: function(expected, actual) {
      return actual;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be true' : ' to be true');
    }
  },

  beFalse: {
    match: function(expected, actual) {
      return !actual;
    },

    failureMessage: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be false' : ' to be false');
    }
  },

  haveBeenCalled: {
    match: function(expectation, mockFunction) {
      if (expectation) {
        return this.matchWithExpectation(expectation, mockFunction);
      } else {
        return mockFunction.callCount > 0;
      }
    },

    matchWithExpectation: function(expectation, mockFunction) {
      if (expectation._withArgs_) {
        if (mockFunction.callCount == 0 ) return false;
        return Screw.Matchers.equal.match(expectation.arguments, mockFunction.mostRecentArgs);
      } else if (expectation._onObject_) {
        return Screw.Matchers.equal.match(expectation.object, mockFunction.mostRecentThisValue);
      } else if (typeof expectation == "number") {
        return mockFunction.callCount == expectation;
      } else {
        throw new Error("unrecognized expectation argument for mock function: " + expectation);
      }
    },

    errorMessageExpectationFragment: function(expectation, not) {
      if (!expectation) {
        if (not) {
          return "";
        } else {
          return " at least once";
        }
      } else {
        if (expectation._withArgs_) {
          return " with arguments " + Screw.$.print(expectation.arguments);
        } else if (expectation._onObject_) {
          return " on object " + Screw.$.print(expectation.object);
        } else {
          return " " + expectation + " time" + ((expectation == 1) ? "" : "s");
        }
      }
    },

    errorMessageActualFragment: function(expected, actual, not) {
      if (expected && expected._withArgs_) {
        if (actual.callCount === 0) {
          return "0 times";
        } else {
          return "with arguments " + Screw.$.print(actual.mostRecentArgs);
        }
      } else if (expected && expected._onObject_) {
        return "on object " + Screw.$.print(actual.mostRecentThisValue);
      } else {
        return actual.callCount + " time" + ((actual.callCount == 1) ? "" : "s");
      }
    },

    failureMessage: function(expected, actual, not) {
      var message;
      if (not) {
        message = 'expected ' + actual.functionName + ' to have not been called' + this.errorMessageExpectationFragment(expected, not);
      } else {
        message = 'expected ' + actual.functionName + ' to have been called' + this.errorMessageExpectationFragment(expected, not);
      }
      message += ' but it was called ' + this.errorMessageActualFragment(expected, actual, not);
      return message;
    }
  },

  once: 1,
  twice: 2,
  thrice: 3,

  withArgs: function() {
    return {
      _withArgs_: true,
      arguments: Array.prototype.slice.call(arguments)
    };
  },

  onObject: function(object) {
    return {
      _onObject_: true,
      object: object
    };
  },

  contain: {
    match: function(expected, actual) {
      for(var i = 0; i < actual.length; i++) {
        if (actual[i] == expected) return true;
      }
      return false;
    },

    failureMessage: function(expected, actual, not) {
      if (not) {
        return "expected " + Screw.$.print(actual) + " to not contain " + Screw.$.print(expected) + ", but it did";
      } else {
        return "expected " + Screw.$.print(actual) + " to contain " + Screw.$.print(expected) + ", but it did not";
      }
    }
  },

  throwException: {
    match: function(expected, actual) {
      var threwException;
      try {
        actual();
        threwException = false;
      } catch(e) {
        threwException = true;
      }
      return threwException;
    },

    failureMessage: function(expected, actual, not) {
      if (not) {
        return "expected function to not throw an exception, but it did";
      } else {
        return "expected function to throw an exception, but it did not";
      }
    }
  }
});

})(Screw, Monarch);
