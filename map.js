/**
 * @note:
 * http://www.sgtconker.com/2010/01/article-grid-based-isometric-renderer-tutorial/
 */


/**
 * TODO:
 * - Implement support for object height
 * - Add event system for collision detection and movement registration
 * - Add  support for moving objects
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
    this.ScreenLocation = new Point(0,0);
    this.sprite = new Sprite(texture);
}
MapGrid.prototype.setTexture = function(texture){
    this.sprite.setTexture(texture);
}

// An object on the map
function MapObject(w, h, texture) {
    this.Map = false;
    this.MapLocation = false;
    this.ScreenLocation = new Point(0, 0);
    this.Offset = new Point(0, 0); // Object displacement
    this.Center = new Point(texture.Width / 2, texture.Height);    // Object center point
    this.Width = w;               // Width in map grids
    this.Height = h;              // Height in map grids
    this.Texture = texture;
    this.sprite = new Sprite(texture);
}
MapObject.prototype.setLocation = function(x, y, map) {
    if(map) {
        map.setObjectLocation(this, new Point(x, y));
    }
}
MapObject.prototype.move = function(points, speed) {
    var self = this;
    var fps =50;
    var steps = (speed || 1000) / fps;
    var timer = false;
    var cLoc = new Point(0,0);

    function moveStep () {
        var point = points.pop();
        // Are we done?
        if(!point) {
            return;
        }
        // Get grid pixel location
        var start = Map.gridToScreen(self.MapLocation.x, self.MapLocation.y, self);
        var end   = Map.gridToScreen(point.x, point.y, self);
        // Calculate step size
        var dx = (end.x - start.x) / steps;
        var dy = (end.y - start.y) / steps;

        // Animation
        function next() {
            if(steps-- === 0) {
                // Reset offset
                self.Offset.x = 0;
                self.Offset.y = 0;

                self.setLocation(point.x, point.y, Map);
                setTimeout(moveStep, 1);
                return;
            }
            // Need to fetch everytime since user might change map location
            var start = Map.gridToScreen(self.MapLocation.x, self.MapLocation.y);
            self.Offset.x += dx;
            self.Offset.y += dy;

            cLoc.x = start.x + self.Offset.x - self.Center.x;
            cLoc.y = start.y + self.Offset.y - self.Center.y;
            // Draw object and advance to next
            self.sprite.render(cLoc);
            self.timer = setTimeout(next, fps);
        }
        next();
    }
    moveStep();
}

var Map = (function() {
    var self = this;
    var center = new Point(0,0);
    var x_org_sprite, y_org_sprite;
    var x_org, y_org;
    var grid = [],
        width  = false,
        height = false,
        tile_width_half,
        tile_height_half;

    var api = {};

    api.getGrid = function (arg1, arg2) {
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

    // Translate screen pixels to map grid
    api.getGridLocation = function(x, y) {
        console.log(x + ", " + y);
    }

    api.render = function(cnt, w_disp, h_disp, w_screen, h_screen) {
        center = cnt;
        var x_cur, y_cur,
        x_lim, y_lim,
        x_str, y_str,
        x_end, y_end;
        var x_edge, y_edge;
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

        // TODO: Snap to tile properly
        x_org_sprite = Math.round(w_screen / (2*tile_width_half)) * tile_width_half;
        y_org_sprite = Math.round(h_screen / (tile_width_half)) * tile_height_half + 2;  //TODO:
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
                    current_grid.ScreenLocation.x = x_org_sprite + (x_cur - x_org) * tile_width_half - (y_cur - y_org) * tile_width_half - current_grid.Texture.Width /2;
                    current_grid.ScreenLocation.y = y_org_sprite + (x_cur - x_org) * tile_height_half + (y_cur - y_org) * (tile_height_half) - current_grid.Texture.Height / 2;

                    sprite.render(current_grid.ScreenLocation);

                    // XXX: Ugly. ScreenLocation should be center of tile
                    current_grid.ScreenLocation.x += current_grid.Texture.Width / 2;
                    current_grid.ScreenLocation.y += current_grid.Texture.Height / 2;

                    // Check if there's an object to render
                    if(current_grid.Object) {
                        var obj = current_grid.Object;
                        obj.ScreenLocation.x = current_grid.ScreenLocation.x -
                            obj.Center.x + obj.Offset.x;
                        obj.ScreenLocation.y = current_grid.ScreenLocation.y -
                            obj.Center.y + obj.Offset.y;

                        obj.sprite.render(obj.ScreenLocation);
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

    api.gridToScreen = function(x, y) {
        if(grid[x] && grid[x][y]) {
            return grid[x][y].ScreenLocation;
        }
        return false;
    }

    api.clearObjectLocation = function(object) {
        for (var x = object.MapLocation.x; x < object.MapLocation.x + object.Width; x++) {
            for(var y = object.MapLocation.y; y < object.MapLocation.y + object.Height; y++) {
                var g = api.getGrid(x, y);
                if(g.Object) {
                    g.Object = false;
                }
            }
        }
    }

    api.setObjectLocation = function(object, point) {
        if(object.Map !== self) {
            if(object.Map) {
                object.Map.clearObjectLocation(object);
            }
            object.Map = self;
        }
        else {
            api.clearObjectLocation(object);
        }

        object.MapLocation = point;
        for (var x = point.x; x < point.x + object.Width; x++) {
            for(var y = point.y; y < point.y + object.Height; y++) {
                var g = api.getGrid(x, y);
                if(!g.Object) {
                    g.Object = object;
                }
            }
        }
    }
    api.init = function(w, h, texture) {
        width  = w;
        height = h;
        grid = [];
        // 2px overlap on width (left + right)
        // 1px overlap on height (bottom)
        tile_width_half = Math.round(texture.Width / 2, 0) - 2;
        tile_height_half = Math.floor(texture.Height / 2, 0) - 1;
        for(var i = 0; i < w; i++) {
            grid[i] = [];
            for(var j = 0; j < h; j++) {
                grid[i][j] = new MapGrid(i, j, texture);
            }
        }
        return true;
    }
    return api;
})();

