/**
 * @note:
 * http://www.sgtconker.com/2010/01/article-grid-based-isometric-renderer-tutorial/
 */


/**
 * TODO:
 * - Implement support for object height
 * - Add event system for collision detection and movement registration
 */

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

var Map = (function() {
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
            object.Map = api;
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

