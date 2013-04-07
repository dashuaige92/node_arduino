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

    socket.on('effecton', function() {
        plane.material.color.setHex(0xf8f8f8);
        renderer.render(scene, camera);
    });
    socket.on('effectoff', function() {
        plane.material.color.setHex(0xbbbbbb);
        renderer.render(scene, camera);
    });

    socket.on('reset', function() {
        plane.material.color.setHex(0xFFFFFF);
        renderer.render(scene, camera);
        console.log('reset');

        setTimeout(function() {
            plane.material.color.setHex(0xbbbbbb);
            renderer.render(scene, camera);
        }, 100);
    });

    socket.on('step', function(data) {
        for (var key in data) {
            if (spheres[data[key].id] !== undefined) {
                spheres[data[key].id].position.x = data[key].x;
                spheres[data[key].id].position.y = data[key].y;
                spheres[data[key].id].position.z = data[key].z;
            }
            else {
                spheres[data[key].id] = addSphere(data[key].x, data[key].y, data[key].z, data[key].color);
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
