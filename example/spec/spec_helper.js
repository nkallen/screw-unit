//= require <example>;

Screw.Unit(function(c) { with(c) {
  before(function() {
    Screw.$('dom_test').empty(); // Screw comes with its own version of jQuery, located Screw.$ to keep out of your version's way if you have one
  });
}});
