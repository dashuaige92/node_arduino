var express = require('express');

var sys = require('sys'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    sio = require('socket.io'),
    fs = require('fs'),
    json = JSON.stringify;


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


var serialport = require("serialport");
var SerialPort = serialport.SerialPort
var sp = new SerialPort("/dev/tty.usbmodemfd121", {
    parser: serialport.parsers.readline("\n") 
}); // this is the openImmediately flag [default is true]

sp.open(function () {
    console.log('Serial port opened!');
    sp.on('data', function(data) {
        io.sockets.send(json({ analog: parseInt(data) }));
    });  
});
