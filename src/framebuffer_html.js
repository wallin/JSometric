

// TODO: handle when sprites aren't rendered
var FrameBuffer = (function() {
    var canvas = document.createElement('div');
    canvas.style.backgroundColor = "#BBB";
    canvas.style.backgroundRepeat = "repeat"
    canvas.style.position = "fixed";
    canvas.style.overflow = "hidden";
    canvas.style.top = "0";
    canvas.style.bottom = "0";
    canvas.style.left = "0";
    canvas.style.right = "0";
    document.body.appendChild(canvas);
    var api = {};

    api.addSprite = function(sprite) {
        canvas.appendChild(sprite.img);
    }
    api.getHeight = function() {
        return canvas.offsetHeight;
    }
    api.getWidth = function() {
        return canvas.offsetWidth;
    }

    api.fill = function(fill) {
        // Background image
        if(fill instanceof Texture) {
            canvas.style.backgroundImage = "url('"+fill.path+"')"
        }
        // Background color
        else {
            canvas.style.backgroundImage = "none";
            canvas.style.backgroundColor = fill;
        }
    }

    return api;
})();

function Sprite(texture) {
    this.img = new Image(texture.Width, texture.Height);
    this.img.src = texture.path;
    this.img.style.position = "absolute";

    FrameBuffer.addSprite(this);
}
Sprite.prototype.setTexture = function(texture) {
    this.img.src = texture.path;
}

Sprite.prototype.render = function(point) {
    this.img.style.top = point.y + "px";
    this.img.style.left = point.x + "px";
};
