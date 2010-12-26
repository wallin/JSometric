var center = new Point(5,5);

var Textures = {
  grass: new Texture('tile_grass.png', 66, 33),
  dirt:  new Texture('tile_dirt.png', 66, 33),
  road_n:  new Texture('tile_road_north.png', 66, 33),
  tree:  new Texture('obj_tree.png', 9, 32),
  grid: new Texture('bg_grid.png', 62, 30),
  bus_s: new Texture('obj_bus_south.png', 22, 16)
}

window.random = function(max) {
  return Math.floor(Math.random()*max+1);
}

window.onload = function() {
    var nTiles = 20;
    Map.init(nTiles, nTiles, Textures.grass);
    FrameBuffer.fill(Textures.grid);
    // Place som random dirt
    var num = random(20);
    for(var i = 0; i < num; i++) {
      var g = Map.getGrid(random(nTiles-1), random(nTiles-1));
      g.setTexture(Textures.dirt);
    }

    for(var i = 0; i < nTiles; i++) {
      var g = Map.getGrid(i, 4);
      g.setTexture(Textures.road_n);
    }
    // Place trees
    for(i = 0; i < 10; i++) {
        var obj = new MapObject(1, 1, Textures.tree);
        obj.setLocation(i, 5, Map);
    }

    var bus = new MapObject(1, 1, Textures.bus_s);
    bus.setLocation(0, 4, Map);
    Map.render(center,  200, 200, FrameBuffer.getWidth(), FrameBuffer.getHeight());
    bus.move([new Point(nTiles-1, 4)], 10000);
}


document.addEventListener('click', function(e) {
    Map.getGridLocation(e.clientX, e.clientY);
}, false);

document.addEventListener('keydown',function(e){
    switch(e.keyCode) {
    case 37: //left
        center.x--;
        center.y++;
        break;
    case 38: //up
        center.x--;
        center.y--;
        break;
    case 39: //right
        center.x++;
        center.y--;
        break;
    case 40: //down
        center.x++;
        center.y++;
        break;

    }
    Map.render(center,  200, 200, FrameBuffer.getWidth(), FrameBuffer.getHeight());
}, false);