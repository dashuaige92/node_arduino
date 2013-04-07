var general = {
    HOST_URI: 'http://localhost:8080/',
    CONN_OPTIONS: {'transports':['websocket']}
    FRAME_INTERVAL: 16,
}

var world = {
    WORLD_H: 300,
    WORLD_W: 300,
    BALL_RADIUS: 5,
    HOLE_RADIUS: 5,
};

function init(name) {
    socket = io.connect(general.HOST_URI, general.CONN_OPTIONS);

    socket.on('connect', function() {
        console.log('Connected!');
    });

    socket.on('message', function(data) {
        data = JSON.parse(data);
        $('.message')[0].innerHTML = data.analog;
    })

    socket.on('disconnect', function() {
        console.log('Disconnected!');
    });
}

$(document).ready(function() {
    init();

    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
})
