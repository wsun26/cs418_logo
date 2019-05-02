function terrain(detail){
  this.size = Math.pow(2, detail)+1; 
  this.max = this.size-1; 
  this.map = new Float32Array(this.size*this.size); 
  this.getpos = position; 
  this.map.set([this.max/2], this.getpos(0, 0)); 
  this.map.set([this.max/2], this.getpos(this.max, 0)); 
  this.map.set([this.max/2], this.getpos(this.max, this.max)); 
  this.map.set([this.max/2], this.getpos(0, this.max));   
  divide(this.max, this);
}
function position(x, y){
  if(x < 0 || y < 0 || x > this.max || y > this.max) {return 0; }
  return x+y*this.size; 
}
function average(a, b, c, d){
    return (a+b+c+d)/4; 
}
function divide(size, self) {
  var x, y, half = size / 2;
  var scale = 6 * size;
  if (half < 1) return;

  for (y = half; y < self.max; y += size) {
    for (x = half; x < self.max; x += size) {
      square(x, y, half, Math.random() * scale * 2 - scale, self);
    }
  }
  for (y = 0; y <= self.max; y += half) {
    for (x = (y + half) % size; x <= self.max; x += size) {
      diamond(x, y, half, Math.random() * scale * 2 - scale, self);
    }
  }
  divide(size / 2, self);
}
function diamond(x, y, size, offset, self) {
    var ave = average(
    self.map[self.getpos(x, y-size)],      // top
    self.map[self.getpos(x+size, y)],      // right
    self.map[self.getpos(x, y+size)],      // bottom
    self.map[self.getpos(x-size, y)]       // left
  );
  self.map.set([ave+offset], self.getpos(x, y));
    
}
function square(x, y, size, offset, self) {
  var avg = average(
    self.map[self.getpos(x - size, y - size)],   // upper left
    self.map[self.getpos(x + size, y - size)],   // upper right
    self.map[self.getpos(x + size, y + size)],   // lower right
    self.map[self.getpos(x - size, y + size)]    // lower left
  );

  self.map.set([avg + offset], self.getpos(x, y));
}