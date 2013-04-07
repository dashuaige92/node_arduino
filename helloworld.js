var express = require('express'),
    five = require('johnny-five');

var sys = require('sys'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    sio = require('socket.io'),
    fs = require('fs'),
    json = JSON.stringify;

var controller = {};
var input = {
    greenPressed: false
};


server.listen(8080);
var io = sio.listen(server);

io.configure(function(){
    io.set('log level', 1);
    io.set('heartbeat', true);
    io.set('transports', ['websocket']);
});

app.configure(function() {
    app.use(express.static(__dirname));
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    socket.send(json({ analog: 150 }));
});


var board = new five.Board();

board.on('ready', function() {
    console.log('Connected to arduino!');
    var joystick = new five.Joystick({
        pins: ['A0', 'A1'],
        freq: 100
    });
    var greenButton = new five.Button(12);
    var whiteButton = new five.Button(13);
    //this.digitalWrite(8, 1);

    joystick.on('axismove', function( err, timestamp ) {
        console.log( "LR:", this.fixed.x );
        console.log( "UD:", this.fixed.y );
    });

    greenButton.on('up', function() {
        console.log("Green button pressed!");
    })
    whiteButton.on('up', function() {
        console.log("White button pressed!");
    })
})
