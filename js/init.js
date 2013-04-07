var general = {
    HOST_URI: 'http://localhost:8080/',
    CONN_OPTIONS: {'transports':['websocket']},
    FRAME_INTERVAL: 16
}

var world = {
    WORLD_H: 300,
    WORLD_W: 300,
    BALL_RADIUS: 5,
    HOLE_RADIUS: 5
};

var spheres = {};

function init(name) {
    socket = io.connect(general.HOST_URI, general.CONN_OPTIONS);

    socket.on('connect', function() {
        console.log('Connected!');
    });

    socket.on('step', function(data) {
        for (var key in data) {
            var s = spheres[key.id];
            if (s !== undefined) {
                s.position.x = data[key].x;
                s.position.y = data[key].y;
            }
            else {
                spheres[key.id] = addSphere(data[key].x, data[key].y);
            }
        }
    })

    socket.on('disconnect', function() {
        console.log('Disconnected!');
    });
}

$(document).ready(function() {
    init();
    animate(0);

    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
})
