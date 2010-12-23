var center = new Point(5,5);

var Textures = {
  grass: new Texture('tile_grass.png', 66, 34),
  dirt:  new Texture('tile_dirt.png', 66, 34),
  road_n:  new Texture('tile_road_north.png', 66, 34),
  tree:  new Texture('obj_tree.png', 9, 32)
}

window.random = function(max) {
  return Math.floor(Math.random()*max+1);
}

window.onload = function() {
    var nTiles = 20;
    Map.init(nTiles, nTiles, Textures.grass);
       
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
    // Place a tree
    var obj = new MapObject(1, 1, Textures.tree);
    obj.setLocation(5, 5, Map);
    Map.render(center,  20, 20, 800, 600);
}


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
    Map.render(center,  20, 20, 800, 600);
}, false);