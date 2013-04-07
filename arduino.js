var five = require('johnny-five');

var client = require("socket.io-client", {
    reconnect: true
});
var socket = client.connect("http://pawns.jit.su");


/* ARDUINO INPUT HANDLERS */

var board = new five.Board();

board.on('ready', function() {
    var self = this;
    console.log('Connected to arduino!');
    var joystick = new five.Joystick({
        pins: ['A0', 'A1'],
        freq: 50
    });
    var greenButton = new five.Button(12);
    var whiteButton = new five.Button(13);
    var joystickButton = new five.Button(7);
    var rumble = new five.Motor(9);

    joystick.on('axismove', function( err, timestamp ) {
        socket.emit('tilt', {
            x: this.fixed.x,
            y: this.fixed.y
        });
    });

    greenButton.on('up', function() {
        console.log("Green button pressed!");
        socket.emit('reset');
    });
    whiteButton.on('up', function() {
        console.log("White button pressed!");
    });

    socket.on('death', function() {
        rumble.start();
        board.wait(1000, function() {
            rumble.stop();
        })
    })
});
