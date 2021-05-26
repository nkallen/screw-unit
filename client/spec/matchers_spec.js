Screw.Unit(function(c) { with(c) {
  describe("Matchers", function() {
    describe("#eq", function() {
      it("compares the expected to the actual with the === operator (exact object equality)", function() {
        var a = {};
        var b = {};

        expect(a).to(eq, a);
        expect(a).toNot(eq, b);
      });
    });

    describe('#equal', function() {
      it("invokes the provided matcher on a call to expect", function() {
        expect(true).to(equal, true);
        expect(true).toNot(equal, false);
      });
      
      describe('when actual is an object', function() {
        describe("when expected has the same keys and values", function() {
          it("matches successfully", function() {
            expect({a: 'b', c: 'd'}).to(equal, {a: 'b', c: 'd'});
          });
        });
        
        describe("when expected has different keys and values", function() {
          it("does not match", function() {
            expect({a: 'b', c: 'd', e: 'f'}).toNot(equal, {a: 'b', c: 'd', e: 'G'});
          });
        });
        
        describe("when expected is undefined", function() {
          it("does not match", function() {
            expect({}).toNot(equal, undefined);
          });
        });
      });
      
      describe("when actual is undefined", function() {
        describe("when expected is undefined", function() {
          it("matches successfully", function() {
            expect(undefined).to(equal, undefined);
          });
        });
        
        describe("when expected is an empty object", function() {
          it("does not match", function() {
            expect(undefined).toNot(equal, {});
          });
        });
      });
      
      describe('when actual is an Array', function() {
        it("matches Arrays with the same elements", function() {
          expect([1, 2, 4]).to(equal, [1, 2, 4]);
          expect([1, 2, 3]).toNot(equal, [3, 2, 1]);
        });
        
        it("recursively applies equality to complex elements", function() {
          expect([{a: 'b'}, {c: 'd'}]).to(equal, [{a: 'b'}, {c: 'd'}]);
          expect([{a: 'b'}, {c: 'd'}]).toNot(equal, [{a: 'b'}, {c: 'E'}]);
        });
      });

      describe('when actual is an iterable Object', function() {
        
      });

      describe("when actual is a String", function() {
        it("does not match an Array with the same characters", function() {
          expect("123").toNot(equal, ["1", "2", "3"]);
        });
      });

      describe("when actual is a hash", function() {
        it("matches hashes with the same key-value pairs", function() {
          expect({"a":"b", "c":"d"}).to(equal, {"a":"b", "c":"d"});
          expect({"a":"b", "c":"e"}).toNot(equal, {"a":"b", "c":"d"});
          expect({"a":"b", "d":"d"}).toNot(equal, {"a":"b", "c":"d"});
        });

        it("recursively applies equality to complex hashes", function() {
          expect({"a":"b", "c": {"e":"f", "g":"h"}}).to(equal, {"a":"b", "c": {"e":"f", "g":"h"}});
          expect({"a":"b", "c": {"e":"f", "g":"i"}}).toNot(equal, {"a":"b", "c": {"e":"f", "g":"h"}});
          expect({"a":"b", "c": {"e":"f", "h":"h"}}).toNot(equal, {"a":"b", "c": {"e":"f", "g":"h"}});
        });
      });

      describe(".failureMessage", function() {
        it('prints "expected [expected] to (not) be equal [actual]"', function() {
          var message = null;
          try { expect(1).to(equal, 2) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to equal 2');
          
          try { expect(1).toNot(equal, 1) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to not equal 1');
        });
      });
    });
    
    describe('#match', function() {
      describe('when actual is a regular expression', function() {
        it("matches Strings produced by the grammar", function() {
          expect("The wheels of the bus").to(match, /bus/);
          expect("The wheels of the bus").toNot(match, /boat/);
        });
      });
      
      describe('when actual is a string', function() {
        it("matches [expected]s containing [actual]s", function() {
          expect("The wheels of the bus").to(match, "wheels");
          expect("The wheels of the bus").toNot(match, "oars");
        });
      });

      describe('when actual is an integer', function() {
        it("matches [expected]s containing [actual]s", function() {
          expect("1 time").to(match, 1);
          expect("2 times").toNot(match, 3);
        });
      });
      
      describe(".failureMessage", function() {
        it('prints "expected [actual] to (not) match [expected]', function() {
          var message = null;
          try { expect("hello").to(match, "schmello") } catch(e) { message = e.message }
          expect(message).to(equal, 'expected "hello" to match "schmello"');
          
          try { expect("hello").toNot(match, "ello") } catch(e) { message = e.message }
          expect(message).to(equal, 'expected "hello" to not match "ello"');
        });
      });
    });
    
    describe('#beEmpty', function() {
      it("matches Arrays with no elements", function() {
        expect([]).to(beEmpty);
        expect([1]).toNot(beEmpty);
      });
      
      describe(".failureMessage", function() {
        it("prints 'expected [actual] to (not) be empty", function() {
          var message = null;
          try { expect([1]).to(beEmpty) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected [ 1 ] to be empty');
          
          try { expect([]).toNot(beEmpty) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected [] to not be empty');
        });
      });
    });

    describe('#haveLength', function() {
      it("matches Arrays of the expected length", function() {
        expect([]).to(haveLength, 0);
        expect([1]).to(haveLength, 1);
        expect([1, 2, 3]).toNot(haveLength, 4);
      });

      describe(".failureMessage", function() {
        it("prints 'expected [actual] to (not) have length [expected]", function() {
          var message = null;
          try { expect([1, 2]).to(haveLength, 4) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected [ 1, 2 ] to have length 4');
          
          try { expect([1]).toNot(haveLength, 1) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected [ 1 ] to not have length 1');
        });
      });
    });

    describe('#beNull', function() {
      it("matches null", function() {
        expect(null).to(beNull);
        expect(1).toNot(beNull);
      });

      describe(".failureMessage", function() {
        it("prints 'expected [actual] to (not) be null", function() {
          var message = null;
          try { expect(1).to(beNull) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to be null');

          try { expect(null).toNot(beNull) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected null to not be null');
        });
      });
    });

    describe('#beUndefined', function() {
      it("matches undefined", function() {
        expect(undefined).to(beUndefined);
        expect(1).toNot(beUndefined);
      });

      describe(".failureMessage", function() {
        it("prints 'expected [actual] to (not) be undefined", function() {
          var message = undefined;
          try { expect(1).to(beUndefined) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to be undefined');

          try { expect(undefined).toNot(beUndefined) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected undefined to not be undefined');
        });
      });
    });

    describe('#beTrue', function() {
      it("matches values that are considered true conditions", function() {
        expect(true).to(beTrue);
        expect(1).to(beTrue);
        expect(false).toNot(beTrue);
        expect(undefined).toNot(beTrue);
        expect(null).toNot(beTrue);
      });

      describe(".failureMessage", function() {
        it("prints 'expected [actual] to (not) be true", function() {
          var message = true;
          try { expect(false).to(beTrue) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected false to be true');

          try { expect(true).toNot(beTrue) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected true to not be true');
        });
      });
    });

    describe('#beFalse', function() {
      it("matches values that are considered false conditions", function() {
        expect(false).to(beFalse);
        expect(undefined).to(beFalse);
        expect(null).to(beFalse);
        expect(true).toNot(beFalse);
        expect(1).toNot(beFalse);
      });

      describe(".failureMessage", function() {
        it("prints 'expected [actual] to (not) be false", function() {
          var message = false;
          try { expect(true).to(beFalse) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected true to be false');

          try { expect(false).toNot(beFalse) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected false to not be false');
        });
      });
    });
    
    describe('#beGt', function() {
      it('matches integers greater than the expected value', function() {
        expect(2).to(beGt, 1);
        expect(1).to(beGt, 0);
        expect(0).to(beGt, -1);
        expect(0).toNot(beGt, 0);
        expect(-1).toNot(beGt, 0);
        expect(0).toNot(beGt, 1);
        expect(1).toNot(beGt, 5);
      });

      describe(".failureMessage", function() {
        it('prints "expected [expected] to (not) be greater than [actual]"', function() {
          var message = null;
          try { expect(1).to(beGt, 2) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to be greater than 2');
          
          try { expect(2).toNot(beGt, 1) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 2 to not be greater than 1');
        });
      });
    });

    describe('#beGte', function() {
      it('matches integers greater than or equal to the expected value', function() {
        expect(2).to(beGte, 1);
        expect(1).to(beGte, 0);
        expect(0).to(beGte, -1);
        expect(-1).to(beGte, -1);
        expect(0).to(beGte, 0);
        expect(1).to(beGte, 1);
        expect(-1).toNot(beGte, 0);
        expect(0).toNot(beGte, 1);
        expect(1).toNot(beGte, 5);
      });

      describe(".failureMessage", function() {
        it('prints "expected [expected] to (not) be greater than or equal to [actual]"', function() {
          var message = null;
          try { expect(1).to(beGte, 2) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to be greater than or equal to 2');
          
          try { expect(2).toNot(beGte, 1) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 2 to not be greater than or equal to 1');
        });
      });
    });

    describe('#beLt', function() {
      it('matches integers less than the expected value', function() {
        expect(1).to(beLt, 2);
        expect(0).to(beLt, 1);
        expect(-1).to(beLt, 0);
        expect(0).toNot(beLt, 0);
        expect(0).toNot(beLt, -1);
        expect(1).toNot(beLt, 0);
        expect(5).toNot(beLt, 1);
      });

      describe(".failureMessage", function() {
        it('prints "expected [expected] to (not) be less than [actual]"', function() {
          var message = null;
          try { expect(2).to(beLt, 1) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 2 to be less than 1');
          
          try { expect(1).toNot(beLt, 2) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to not be less than 2');
        });
      });
    });

    describe('#beLte', function() {
      it('matches integers less than or equal to the expected value', function() {
        expect(1).to(beLte, 2);
        expect(0).to(beLte, 1);
        expect(-1).to(beLte, 0);
        expect(-1).to(beLte, -1);
        expect(0).to(beLte, 0);
        expect(1).to(beLte, 1);
        expect(0).toNot(beLte, -1);
        expect(1).toNot(beLte, 0);
        expect(5).toNot(beLte, 1);
      });

      describe(".failureMessage", function() {
        it('prints "expected [expected] to (not) be less than or equal to [actual]"', function() {
          var message = null;
          try { expect(2).to(beLte, 1) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 2 to be less than or equal to 1');
          
          try { expect(1).toNot(beLte, 2) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected 1 to not be less than or equal to 2');
        });
      });
    });

    describe("#haveBeenCalled", function() {
      var mockFn;
      before(function() {
        mockFn = mockFunction();
      });

      context("when matching a mock function with no expected argument", function() {
        it("matches if the function's #callCount is > 0", function() {
          expect(mockFn).toNot(haveBeenCalled)
          mockFn();
          expect(mockFn).to(haveBeenCalled)
        });
      });

      context("when matching a mock function with the number of times called", function() {
        it("matches if the function's #callCount matches the expectation", function() {
          mockFn();
          expect(mockFn).to(haveBeenCalled, once);
          mockFn();
          expect(mockFn).to(haveBeenCalled, twice);
          mockFn();
          expect(mockFn).to(haveBeenCalled, thrice);
          mockFn();
          expect(mockFn).to(haveBeenCalled, 4);
        });
      });

      context("when matching a mock function with the expected arguments", function() {
        it("matches if the function's #mostRecentArgs match the expectation", function() {
          mockFn("foo", "bar");
          expect(mockFn).to(haveBeenCalled, withArgs("foo", "bar"));
        });
      });

      context("when matching a mock function with the expected this value", function() {
        it("matches if the function's #mostRecentThisValue match the expectation", function() {
          var a = { mockFn: mockFn };
          a.mockFn();
          expect(mockFn).to(haveBeenCalled, onObject(a));
        });
      });
    });

    describe("#contain", function() {
      it("matches arrays containing the expected value", function() {
        expect([1,2,3]).to(contain, 2);
        expect([1,2,3]).toNot(contain, 7);
      });

      describe(".failure message", function() {
        it('prints "expected [expected] to (not) contain [actual]"', function() {
          var message = null;
          try { expect([1,2]).to(contain, 3) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected [ 1, 2 ] to contain 3, but it did not');


          try { expect([1,2]).toNot(contain, 2) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected [ 1, 2 ] to not contain 2, but it did');
        });

      });
    });

    describe("#throwException", function() {
      var throws, doesNotThrow;

      before(function() {
        throws = function() { throw new Error("intentional"); };
        doesNotThrow = function() { };
      });

      it("matches functions that throw exceptions when called", function() {
        expect(throws).to(throwException);
        expect(doesNotThrow).toNot(throwException);
      });

      describe(".failureMessage", function() {
        it("prints a message about the expected throwing", function() {
          var message = true;

          try { expect(doesNotThrow).to(throwException) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected function to throw an exception, but it did not');

          try { expect(throws).toNot(throwException) } catch(e) { message = e.message }
          expect(message).to(equal, 'expected function to not throw an exception, but it did');
        });
      });

    });
  });
}});