/**
 * @note:
 * http://www.sgtconker.com/2010/01/article-grid-based-isometric-renderer-tutorial/
 */


// Ad point in map-space
function Point (x, y) {
    this.x = x;
    this.y = y;
}

// Meta data for an image
function Texture(path, w, h) {
    this.path = path;
    this.Width = w;
    this.Height = h;
}

function MapGrid (x, y, texture) {
    this.Coordinate = new Point(x, y);
    this.Object = false; //TODO: Only one object per tile
    this.Texture = texture;
    this.sprite = new Sprite(texture);
    this.sprite.src = texture.path;
}
MapGrid.prototype.setTexture = function(texture){
  this.sprite.setTexture(texture);
}

// An object on the map
function MapObject(w, h, texture) {
  this.Map = false;
  this.Location = false;
  this.Width = w;
  this.Height = h;
  this.Texture = texture;
  this.sprite = new Sprite(texture);
  this.sprite.src = texture.path;
}
MapObject.prototype.setLocation = function(x, y, map) {
  if(map) {
    map.setObjectLocation(this, new Point(x, y));
  }
}

var Map = (function() {
    var self = this;
    var grid = [],
        width  = false,
        height = false,
        tile_width_half,
        tile_height_half;

    function getGrid (arg1, arg2) {
        var x, y;
        if(typeof(arg1) === 'object' && arg1 instanceof 'Point') {
            x = arg1.x;
            y = arg1.y;
        }
        else {
            x = arg1;
            y = arg2;
        }

        if(x < 0 || y < 0 || x >= width || y >=height) {
            return false;
        }
        return grid[x][y];
    }


    function render (center, w_disp, h_disp, w_screen, h_screen) {
        var x_cur, y_cur,
        x_lim, y_lim,
        x_org, y_org,
        x_str, y_str,
        x_end, y_end;
        var x_edge, y_edge;
        var x_org_sprite, y_org_sprite;
        x_org = x_str = x_lim = center.x - (w_disp / 2);
        y_org = y_str = y_lim = center.y - (h_disp / 2);

        if(x_lim < 0) {
            x_org = x_str = x_lim = 0;
        }

        if(y_lim < 0) {
            y_org = y_str = y_lim = 0;
        }

        x_end = x_str + w_disp - 1;
        y_end = y_str + h_disp - 1;

        if(x_end >= width) {
            x_end = width - 1;
        }

        if(y_end >= height) {
            y_end = height - 1;
        }

        x_org_sprite = (w_screen / 2) + (w_screen % 2) - tile_width_half;
        y_org_sprite = (h_screen / 2) + (h_screen % 2) + tile_height_half;
        x_org_sprite -= (center.x - x_str) * tile_width_half - (center.y - y_str) * tile_width_half;
        y_org_sprite -= (center.x - x_str) * tile_height_half + (center.y - y_str) * tile_height_half;


        while(true) {
            x_cur = x_str;
            y_cur = y_lim;

            x_edge = y_edge = false;

            while((x_cur <= x_lim) && (y_cur >= y_str)) {
                if(grid[x_cur] && grid[x_cur][y_cur]) {
                    var current_grid = grid[x_cur][y_cur];
                    var sprite = current_grid.sprite;
                    var x = x_org_sprite + (x_cur - x_org) * tile_width_half - (y_cur - y_org) * tile_width_half + tile_width_half - current_grid.Texture.Width / 2;
                    var y = y_org_sprite + (x_cur - x_org) * tile_height_half + (y_cur - y_org) * tile_height_half - current_grid.Texture.Height;
                    sprite.render(x,y);

                    // Check if there's an object to render
                    if(current_grid.Object) {
                      current_grid.Object.sprite.render(x,y);
                    }
                }

                x_cur++;
                y_cur--;
            }

            if(++x_lim > x_end) {
                x_lim = x_end;
                if(++y_str > y_end) {
                    y_str = y_end;
                    y_edge = true;
                }
            }

            if(++y_lim > y_end) {
                y_lim = y_end;
                if(++x_str > y_end) {
                    x_str = x_end;
                    x_edge = true;
                }
            }

            if(x_edge && y_edge) {
                break;
            }
        }
    }

    function clearObjectLocation(object) {
      for (var x = object.Location.x; x < object.Location.x + object.Width; x++) {
        for(var y = object.Location.y; y < object.Location.y + object.Height; y++) {
          var g = getGrid(x, y);
          if(g.Object) {
            g.Object = false;
          }
        }
      }
    }

    function setObjectLocation(object, point) {
      if(object.Map !== self) {
          if(object.Map) {
            object.Map.clearObjectLocation(object);
          }
          object.Map = self;
      }
      else {
        clearObjectLocation(object);
      }

      object.Location = point;
      for (var x = point.x; x < point.x + object.Width; x++) {
        for(var y = point.y; y < point.y + object.Height; y++) {
          var g = getGrid(x, y);
          if(!g.Object) {
            g.Object = object;
          }
        }
      }
    }

    return {
        init: function(w, h, texture) {
            width  = w;
            height = h;
            grid = [];
            tile_width_half = Math.round(texture.Width / 2, 0);
            tile_height_half = Math.round(texture.Height / 2, 0);
            for(var i = 0; i < w; i++) {
                grid[i] = [];
                for(var j = 0; j < h; j++) {
                    grid[i][j] = new MapGrid(i, j, texture);
                }
            }
            return true;
        },
        getWith: function() {
            return width;
        },
        getHeight: function() {
            return height;
        },
        getGrid: getGrid,
        render: render,
        setObjectLocation: setObjectLocation
    }
})();

