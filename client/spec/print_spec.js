Screw.Unit(function(c) { with(c) {
  describe("Print", function() {
    describe('when given undefined', function() {
      it("returns 'undefined'", function() {
        expect(Screw.$.print(undefined)).to(equal, 'undefined');
      });
    });
    
    describe('when given null', function() {
      it("returns 'null'", function() {
        expect(Screw.$.print(null)).to(equal, 'null');
      });
    });
    
    describe('when given a number', function() {
      it("returns the string representation of the number", function() {
        expect(Screw.$.print(1)).to(equal, '1');
        expect(Screw.$.print(1.01)).to(equal, '1.01');
        expect(Screw.$.print(-1)).to(equal, '-1');
      });
    });
    
    describe('when given a boolean', function() {
      it("returns the string representation of the boolean", function() {
        expect(Screw.$.print(true)).to(equal, 'true');
        expect(Screw.$.print(false)).to(equal, 'false');
      });
    });
    
    describe('when given a string', function() {
      it("returns the string, quoted", function() {
        expect(Screw.$.print('asdf')).to(equal, '"asdf"');
      });
      
      describe('when the string is longer than the [maxString] option', function() {
        it("returns the string, truncated", function() {
          expect(Screw.$.print('asdf', { maxString: 3 })).to(equal, '"asd..."');
        });        
      });
      
      describe('when the strings has quotes or escaped characters', function() {
        it("returns the string, with quotes and escaped characters escaped", function() {
          expect(Screw.$.print('as"df')).to(equal, '"as\\"df"');
          expect(Screw.$.print('as\tdf')).to(equal, '"as\\tdf"');
        });        
      });
    });
    
    describe('when given a function', function() {
      it("returns the function's signature", function() {
        expect(Screw.$.print(function() {})).to(equal, 'function ()');
        expect(Screw.$.print(function foo() {})).to(equal, 'function foo()');
        expect(Screw.$.print(function foo(bar) {})).to(equal, 'function foo(bar)');
      });        
    });

    describe('when given a RegExp', function() {
      it('should print the regexp', function() {
        expect(Screw.$.print(/abc/i)).to(equal, '/abc/i');
      });
    });

    describe('when given NaN', function() {
      it('should print the string "NaN"', function() {
        expect(Screw.$.print(NaN)).to(equal, 'NaN');
      });
    });

    describe('when given 0', function() {
      it('should print the string "0"', function() {
        expect(Screw.$.print(0)).to(equal, '0');
      });
    });
    
    describe('when given an element', function() {
      it("returns the string representation of the element", function() {
        expect(Screw.$.print(Screw.$('<div>').get(0))).to(equal, '<div>');
        expect(Screw.$.print(Screw.$('<div foo="bar">').get(0))).to(equal, '<div>');
        expect(Screw.$.print(Screw.$('<div class="foo" id="bar">').get(0))).to(equal, '<div class="foo" id="bar">');
      });

      describe('when the element is an img', function() {
        it('prints out the img src attribute', function() {
          expect(Screw.$.print(Screw.$('<img src="test.png">'))).to(match, /<img src=".+?test.png">/);
        })
      });
    });

    describe('when given an array', function() {
      it("returns the printed elements, comma separated, encircled by square brackets", function() {
        expect(Screw.$.print([])).to(equal, '[]');
        expect(Screw.$.print([1])).to(equal, '[ 1 ]');
        expect(Screw.$.print([1, 2, 3])).to(equal, '[ 1, 2, 3 ]');
      });
      
      describe('when the array is longer than the [maxArray] option', function() {
        it("returns the printed array, truncated", function() {
          expect(Screw.$.print([1, 2, 3, 4], { maxArray: 2 })).to(equal, '[ 1, 2, 2 more... ]');
        });
      });
      
      describe('when the array has arrays as its elements', function() {
        it("returns the recursively printed array", function() {
          expect(Screw.$.print([[]])).to(equal, '[ [] ]');
          expect(Screw.$.print([ [1, 2, 3], 4 ])).to(equal, '[ [ 1, 2, 3 ], 4 ]');
        });
      });

      describe('when the array has objects as its elements', function() {
        it("returns recursively printed array", function() {
          expect(Screw.$.print([{}])).to(equal, '[ {} ]');
          expect(Screw.$.print([ { foo: 'bar' }, 'baz' ])).to(equal, '[ { foo: "bar" }, "baz" ]');
        });
      });
    });

    describe('when given arguments', function() {
      it("returns the printed array of elements ", function() {
        var args = null;
        (function(){ args = arguments })(1,2,3);
        expect(Screw.$.print(args)).to(equal, '[ 1, 2, 3 ]');
      });
    });
    
    describe('when given a NodeList', function() {
      it("returns the printed array of elements in the list", function() {
        expect(Screw.$.print(document.getElementsByTagName('body'))).to(equal, '[ <body> ]');
      });
    });

    describe('when given an object', function() {
      it("returns the keys and values of the object, enraptured with curly braces", function() {
        expect(Screw.$.print({})).to(equal, '{}');
        expect(Screw.$.print({ foo: 1, bar: 2 })).to(equal, '{ foo: 1, bar: 2 }');
      });
      
      describe('when the values of the object are non-primitive', function() {
        it("recursively prints the keys and values", function() {
          expect(Screw.$.print({ foo: [1, 2] })).to(equal, '{ foo: [ 1, 2 ] }');
        });
        
        describe('when the object has circular references', function() {
          it("returns elipses for circularities", function() {
            var circular = {};
            circular[0] = circular;
            expect(Screw.$.print(circular)).to(equal, '{ 0: ... }');
          });
        });
      });
    });
  });
}});