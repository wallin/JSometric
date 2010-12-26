// Method for interpolating a path of points
// TODO: Bresenhams line algo.
Array.prototype.interpolate = function() {
    var points = this;
    if(points.length > 1 &&
       points[0] instanceof Point) {
        var rv = [];
        var x_end, y_end;
        for(var idx = 1; idx < points.length; idx++) {
            var x_str = points[idx-1].x;
            var y_str = points[idx-1].y;
            var x_end = points[idx].x;
            var y_end = points[idx].y;

            var x_step = (x_end - x_str) < 0 ? -1 : 1;
            var y_step = (y_end - y_str) < 0 ? -1 : 1;
            var x_bnd = false;
            var y_bnd = false;

            while(true) {
                if(x_str === x_end) {
                    x_bnd = true;
                }
                if(!x_bnd) {
                    x_str += x_step;
                }

                if(y_str === y_end) {
                    y_bnd = true;
                }
                if(!y_bnd) {
                    y_str += y_step;
                }

                if(x_bnd && y_bnd) {
                    break;
                }
                rv.push(new Point(x_str, y_str));
            }
        }
        return rv;
    }
    return this;
};

// Describe X/Y-coordinate
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
    this.Objects = [];
    this.Texture = texture;
    this.ScreenLocation = new Point(0,0);
    this.sprite = new Sprite(texture);
}
MapGrid.prototype.setTexture = function(texture){
    this.sprite.setTexture(texture);
}

// TODO: re-think this mess
MapGrid.prototype.renderObject = function(obj) {
    obj.ScreenLocation.x = this.ScreenLocation.x -
        obj.Center.x + obj.Offset.x;
    obj.ScreenLocation.y = this.ScreenLocation.y -
        obj.Center.y + obj.Offset.y;

    obj.sprite.render(obj.ScreenLocation);
}

// A simple object on the map
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
};

MapObject.prototype.move = function(points, speed) {
    var self = this;
    if(!self.Map) {
        throw "Can't move an object that is not on a map"
    }
    var fps = 50;              // Time in ms between animation steps
    var steps = (speed || 1000) / fps; // Speed is ms per mapgrid
    var timer = false;         // Maybe not needed

    // Add own position
    points.unshift(self.MapLocation);
    // Get complete path
    points = points.interpolate();

    function moveStep () {
        // Are we done?
        if(points.length === 0) {
            return;
        }
        var stp = steps;
        var point = points.shift();

        // Get grid pixel location
        var cGrid = self.Map.getGrid(self.MapLocation.x, self.MapLocation.y);
        var start = Map.gridToScreen(self.MapLocation.x, self.MapLocation.y, self);
        var end   = Map.gridToScreen(point.x, point.y, self);
        // Calculate step size
        var dx = (end.x - start.x) / steps;
        var dy = (end.y - start.y) / steps;

        // Animation
        function next() {
            if(stp-- <= 0) {
                // Reset offset
                self.Offset.x = 0;
                self.Offset.y = 0;
                self.setLocation(point.x, point.y, self.Map);
                setTimeout(moveStep, 1);
                return;
            }

            self.Offset.x += dx;
            self.Offset.y += dy;

            // Draw object and advance to next
            cGrid.renderObject(self);
            self.timer = setTimeout(next, fps);
        }
        next();
    }
    moveStep();
};
