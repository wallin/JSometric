(function() {
    var view = document.createElement('div');
    view.id = "console";
    document.body.appendChild(view);
    var mouseCoords = document.createTextNode('');
    view.appendChild(mouseCoords);
    view.appendChild(document.createElement('br'));

    var mouseClick = document.createTextNode('');
    view.appendChild(mouseClick);


    // Print mouse coords
    document.addEventListener('mousemove', function(e) {
        mouseCoords.nodeValue = e.clientX + ", " + e.clientY;
    }, false);

    // Print clicked grid
    document.addEventListener('click', function(e) {
        mouseClick.nodeValue = e.clientX + ", " + e.clientY;
    });

})();