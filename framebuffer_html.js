var FrameBuffer = (function() {
    var canvas = document.createElement('div');
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
        return canvas.style.height;
    }
    api.getWidth = function() {
        return canvas.style.width;
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

Sprite.prototype.render = function(x, y) {
    this.img.style.top = y + "px";
    this.img.style.left = x + "px";
};