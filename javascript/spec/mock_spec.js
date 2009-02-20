Screw.Unit(function(c) { with(c) {
  describe("#mock", function() {
    context("when passed an object and the name of a function on that object", function() {
      var object;
      before(function() {
        object = {
          foo: function() {
            return "original_foo_value";
          }
        };
        mock(object, 'foo');
      });

      it("records the #call_count on that function", function() {
        expect(object.foo.call_count).to(equal, 0);
        object.foo();
        expect(object.foo.call_count).to(equal, 1);
        object.foo();
        expect(object.foo.call_count).to(equal, 2);
      });

      it("pushes the arguments of the call to a #call_args array on that function", function() {
        expect(object.foo.call_args).to(equal, []);
        object.foo("bar", "baz");
        expect(object.foo.call_args).to(equal, [["bar", "baz"]]);
        object.foo("quux");
        expect(object.foo.call_args).to(equal, [["bar", "baz"], ["quux"]]);
      });

      it("sets #most_recent args on the function", function() {
        expect(object.foo.most_recent_args).to(equal, null);
        object.foo("bar", "baz");
        expect(object.foo.most_recent_args).to(equal, ["bar", "baz"]);
        object.foo("quux");
        expect(object.foo.most_recent_args).to(equal, ["quux"]);
      });
      
      context("when passed a function as its third argument", function() {
        var call_args;
        before(function() {
          call_args = [];
          mock(object, "foo", function() {
            call_args.push(Array.prototype.slice.call(arguments));
          });
        });

        it("calls the function", function() {
          object.foo("bar", "baz");
          expect(call_args).to(equal, [["bar", "baz"]]);
          object.foo("quux");
          expect(call_args).to(equal, [["bar", "baz"], ["quux"]]);
        });
      });
    });
  })
}});