Screw.Unit is a Behavior-Driven Testing Framework for Javascript. It features nested describes. Its goals are to provide:

* a DSL for elegant, readable, organized specs;
* an interactive runner that can execute focused specs and describes; 
* and brief, extensible source-code.

# What it is

![Test Runner](http://s3.amazonaws.com/assets.pivotallabs.com/87/original/runner.png)

The testing language is closure-based. Consider,

    describe("Matchers", function() {
      it("invokes the provided matcher on a call to expect", function() {
        expect(true).to(equal, true);
        expect(true).to_not(equal, false);
      });
    });

A key feature of Screw.Unit are nested `describes` and the cascading `before` (and `after`) behavior that entails:

    describe("a nested describe", function() {
      var invocations = [];
      
      before(function() {
        invocations.push("before");
      });

      describe("a doubly nested describe", function() {
        before(function() {
          invocations.push('inner before');
        });

        it("runs befores in all ancestors prior to an it", function() {
          expect(invocations).to(equal, ["before", "inner before"]);
        });
      });
    });

# The Runner

The Screw.Unit runner is pretty fancy, supporting focused `describes` and focused `its`:

![Focused Runner](http://s3.amazonaws.com/assets.pivotallabs.com/86/original/focused.png)

Click on a `describe` or `it` to run just those tests.

# Global Befores and Afters

A global `before` is a `before` block run before all tests in a test suite, regardless of their nesting. This is often useful to reset global variables, or blank-out DOM nodes before each test is run. Put this at the top of the your suite file or in your spec helper.

    Screw.Unit(function(c) { with(c) {
      before(function() { ... });
    }});
    
Note that you can have any number of `Screw.Unit(...)` blocks in one file. Thus, you can have multiple global `befores` and `afters`.

# Custom Matchers

A custom matcher is a custom assertion specifically tailored to your application. These are helpful in increasing the readability and declarativity of your tests. To create a custom matcher, fill in the blanks for this code:

    Screw.Matchers["be_even"] = {
      match: function(expected, actual) {
        return actual % 2 == 0;
      },
      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' not' : '') + ' to be even';
      }
    }

You can invoke this matcher as follows: `expect(2).to(be_even)`.

# The Anatomy of Test Infrastructure

Typical test infrastructure spans multiple files:

* A `suite.html` file that has the necessary html, script tags, and link tags, to include your source code as well as the test infrastructure.
* A `spec_helper.js` file with global `before` and `after` blocks.
* A set of custom matchers.
* Your individual tests.

The file structure will typically look like:

    spec/
      suite.html
      spec_helper.js
      matchers/
        a_matcher.js
        another_matcher.js
      models/
        a_spec.js
        another_spec.js
      views/
        yet_another_spec.js

The `models` and `views` directories are here only for comparison. As a general rule, mirror the file structure of your source code in your spec directory. For example, if you have an MVC application and you organize your source code into `models`, `views`, and `controllers` directories, have parallel directories in your spec/ directory, with tests for your models, views, and controllers in their respective directories.

# Writing Good Tests

A great test maximizes these features:

* it provides **documentation**, explaining the intended functioning of the system as well as how the source code works;
* it supports **ongoing development**, as you bit-by-bit write a failing test and make it pass;
* it supports later **refactoring** and **prevents regression** as you add other features;
* and it **requires little modification** as the implementation of the system changes, especially changes to unrelated code.

This section focuses principally on tests as documentation. **To provide documentation, as well as support future modification, a test should be readable and well organized.** Here are some recommendations on how to do just that.

## Use Nested Describes to Express Context

Often, when you test a system (a function, an object), it behaves differently in different contexts. Use **nested** describes liberally to express the context under which you make an assertion.

    describe("Caller#prioritize", function() {
      describe("when there are two callers in the queue", function() {
        describe("and one caller has been waiting longer than another", function() {
          ...
        });
      });
    });

In addition to using nested describes to express context, use them to organize tests by the structural properties of your source code and programming language. In Javascript this is typically prototype and function. A parent describe for a prototype contains nested describes for each of its methods. If you have cross-cutting concerns (e.g., related behavior that spans across methods or prototypes), use a describe to group them conceptually.

    describe("Car", function() {
      describe("#start", function() {
      });
      
      describe("#stop", function() {
      });
      
      describe("callbacks", function() {
        describe("after_purchase", function() {
        });
      });
      
      describe("logging", function() {
      });
    });

In this example, one parent `describe` is used for all `Car` behavior. There is a describe for each method. Finally, cross-cutting concerns like callbacks and logging are grouped because of their conceptual affinity.

# Test Size

Individual tests should be short and sweet. It is sometimes recommended to make only one assertion per test:

    it("chooses the caller who has been waiting the longest", function() {
      expect(Caller.prioritize()).to(equal, caller_waiting_the_longest);
    });

According to some, the ideal test is one line of code. In practice, it may be excessive to divide your tests to be this small. At ten lines of code (or more), a test is difficult to read quickly. Be pragmatic, bearing in mind the aims of testing.

Although one assertion per test is a good rule of thumb, feel free to violate the rule if equal clarity and better terseness is achievable:

    it("returns the string representation of the boolean", function() {
      expect($.print(true)).to(equal, 'true');
      expect($.print(false)).to(equal, 'false');
    });

Two tests would be overkill in this example.

## Variable Naming

Name variables descriptively, especially ones that will become expected values in assertions. `caller_waiting_the_longest` is better than `c1`.

## Dividing code between tests and `befores`

If there is only one line of setup and it is used in only one test, it may be better to include the setup in the test itself:

    it("decrements the man's luck by 5", function() {
      var man = new Man({luck: 5});
      
      cat.cross_path(man);
      expect(man.luck()).to(equal, 0);
    });

But in general, it's nice to keep setup code in `before` blocks, especially if the setup can be shared across tests.

    describe('Man', function() {
      var man;
      before(function() {
        man = new Man({luck: 5});
      });
  
      describe('#decrement_luck', function() {
        it("decrements the luck field by the given amount", function() {
          man.decrement_luck(3);
          expect(man.luck()).to(equal, 2)
        });
      });
      ...
    });

## Preconditions

It is ideal, if there is any chance that your preconditions are non-obvious, to make precondition asserts in your test. The last example, were it more complicated, might be better written:

    it("decrements the luck field by the given amount", function() {
      expect(man.luck()).to(equal, 5);

      man.decrement_luck(3);
      expect(man.luck()).to(equal, 2)
    });

Whitespace, as seen here, can be helpful in distinguishing setup and preconditions from the system under test (SUT) and its assertions. It is nice to be consistent in your use of whitespace (e.g., "always follow a group of preconditions by a newline"). But it is better to use whitespace as makes the most sense given the context. As with everything in life, do it consciously and deliberately, but change your mind frequently.

## Behavioral Testing

Behavioral testing, that is, asserting that certain functions are called rather than certain values returned, is best done with closures. The dynamic nature of JavaScript makes mocking frameworks mostly unnecessary.

    it("invokes #decrement_luck", function() {
      var decrement_luck_was_called = false;
      man.decrement_luck = function(amount) {
        decrement_luck_was_called = true;
      });
      
      cat.cross_path(man);
      expect(decrement_luck_was_called).to(equal, true);
    });

# How to Test the DOM

The simplest way to test the DOM is to have a special DOM node in your `suite.html` file. Have all tests insert nodes into this node; have a global `before` reset the node between tests.

In `suite.html`:

    <div id="dom_test"></div>

In `spec_helper.js`:

    Screw.Unit(function() {
      before(function() {
        document.getElementById('dom_test').innerHTML = ''; // but use your favorite JS library here.
      });
    });
    
In `some_spec.js`:

    describe("something that manipulates the DOM", function() {
      it("is effortless to test!", function() {
        var dom_test = document.getElementById('dom_test');
        dom_test.innerHTML = 'awesome';
        expect(dom_test.innerHTML).to(equal, 'awesome');
      });
    });

A Javascript library like jQuery, Prototype, or YUI is a essential for testing events.

# Implementation Details

Screw.Unit is implemented using some fancy metaprogramming learned from the formidable Yehuda Katz. This allows the `describe` and `it` functions to not pollute the global namespace. Essentially, we take the source code of your test and wrap it in a with block which provides a new scope:

    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var fn = new Function("matchers", "specifications",
      "with (specifications) { with (matchers) { " + contents + " } }"
    );

    fn.call(this, Screw.Matchers, Screw.Specifications);

Furthermore, Screw.Unit is implemented using the **Concrete Javascript** style, which is made possible by the [Effen plugin](http://github.com/nkallen/effen/tree/master) and jQuery. Concrete Javascript is an alternative to MVC. In Concrete Javascript, DOM objects serve as the model and view simultaneously. The DOM is constructed using semantic (and visual) markup, and behaviors are attached directly to DOM elements. For example,

    $('.describe').fn({
      parent: function() {
        return $(this).parent('.describes').parent('.describe');
      },
      run: function() {
        $(this).children('.its').children('.it').fn('run');
        $(this).children('.describes').children('.describe').fn('run');
      },
    });

Here two methods (`#parent` and `#run`) are attached directly to DOM elements that have class `describe`. To invoke one of these methods, simply:

    $('.describe').fn('run');

Bind behaviors by passing a hash (see the previous example). Using CSS3 selectors and cascading to attach behaviors provides interesting kind of multiple inheritance and polymorphism:

    $('.describe, .it').fn({...}); // applies to both describe and its
    $('.describe .describe').fn({...}); // applies to nested describes only

# Extensibility

Screw.Unit is designed from the ground-up to be extensible. For example, to add custom logging, simply subscribe to certain events:

    $('.it')
      .bind('enqueued', function() {...})
      .bind('running', function() {...})
      .bind('passed', function() {...})
      .bind('failed', function(e, reason) {...})

There are also events for the `loading` and `loaded` test code code, as well as just `before` and just `after` all tests are run:

    $(Screw)
      .bind('loading', function() {...})
      .bind('loaded', function() {...})
      .bind('before', function() {...})
      .bind('after', function() {...})

# Download

You can [download the source](http://github.com/nkallen/screw-unit/tree/master) from Github. There is are plenty of examples in the distribution.

# Thanks to

* Nathan Sobo
* Yehuda Katz
* Brian Takita
* Aman Gupta
* Tim Connor