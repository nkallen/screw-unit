//= require "../spec_helper"

Screw.Unit(function(c) { with(c) {
  describe('Cat', function() {
    var cat;
    
    describe('#cross_path', function() {
      describe('when the cat has black fur', function() {
        before(function() {
          cat = new Cat({color: 'black'});
        });
        
        it("decrements the man's luck by 5", function() {
          var man = new Man({luck: 5});
          cat.cross_path(man);
          expect(man.luck()).to(equal, 0);
        });
      });
      
      describe('when the cat has non-black fur', function() {
        before(function() {
          cat = new Cat({color: 'white'});
        });
        
        it("does not change the man's luck", function() {
          var man = new Man({luck: 5});          
          cat.cross_path(man);
          expect(man.luck()).to(equal, 5);
        });
      });
    });
  });
}});
