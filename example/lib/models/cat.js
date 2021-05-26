function Cat(options) {
  this.cross_path = function(man) {
    if (options.color == 'black') man.decrement_luck(5);
  };
}