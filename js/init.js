var general = {
    HOST_URI: document.location.hostname === 'localhost' ? 'http://localhost:8080' : 'http://pawns.jit.su',
    CONN_OPTIONS: {'transports':['websocket']},
    FRAME_INTERVAL: 16
}
var world;

var spheres = {};

function init(name) {
    socket = io.connect(general.HOST_URI, general.CONN_OPTIONS);

    socket.on('connect', function() {
        console.log('Connected!');
    });

    socket.on('step', function(data) {
        for (var key in data) {
            if (spheres[data[key].id] !== undefined) {
                spheres[data[key].id].position.x = data[key].x;
                spheres[data[key].id].position.y = data[key].y;
            }
            else {
                spheres[data[key].id] = addSphere(data[key].x, data[key].y);
            }
        }
        for (var key in spheres) {
            if (data[key] === undefined) {
                group.remove(spheres[key]);
                delete spheres[key];
            }
        }
    });

    socket.on('world', function(data) {
        world = data;
        rotatePlane(world.TILT_Y, world.TILT_X);
    })

    socket.on('disconnect', function() {
        console.log('Disconnected!');
    });
}

$(document).ready(function() {
    init();
    renderInit();
    renderer.render(scene, camera);
    animate(0);

    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
})
