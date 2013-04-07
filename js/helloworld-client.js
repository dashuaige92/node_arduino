HOST_URI = "http://localhost:8080";
CONN_OPTIONS = { 'transports': ['websocket'] };

function init(name) {
    socket = io.connect(HOST_URI, CONN_OPTIONS);

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
})
