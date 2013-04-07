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


/* WORLD SIMULATION */

var sids = new Array();
var players = new Array();
var world = {
    TIME_STEP: 50,
    WORLD_W: 300,
    WORLD_H: 300,
    TILT_X: 0,
    TILT_Y: 0,
    BALL_RADIUS: 5,
    HOLE_RADIUS: 5,
};
var physics = {
    acceleration: 100 * (world.TIME_STEP/1000),
    friction: 5 * (world.TIME_STEP/1000),
    restitution: 0.6
};

function acceleration(state, t) {
    // should actually be a force, but there is no mass
    var ax = 0, ay = 0;

    if ( (control.rightDown ? !control.leftDown : control.leftDown) && 
        (control.upDown ? !control.downDown : control.downDown)) {
        // Diagonal movement

        var diagaccel = physics.accel * (1 / Math.sqrt(2));
        if (control.rightDown) ax += diagaccel;
        if (control.leftDown) ax -= diagaccel;
        if (control.upDown) ay -= diagaccel;
        if (control.downDown) ay += diagaccel;
    } else {
        if (control.rightDown) ax += physics.accel;
        if (control.leftDown) ax -= physics.accel;
        if (control.upDown) ay -= physics.accel;
        if (control.downDown) ay += physics.accel;
    }

    return {
        vx: - Math.pow(world.BALL_RADIUS, .5) * physics.fric * state.vx + ax,
        vy: - Math.pow(world.BALL_RADIUS, .5) * physics.fric * state.vy + ay
    };
}

function evaluate(initial, t, dt, d) {
    var state = {
        x: initial.x + d.dx * dt,
        y: initial.y + d.dy * dt,
        vx: initial.vx + d.dvx * dt,
        vy: initial.vy + d.dvy * dt
    };

    var a = acceleration(state, t + dt);

    return {
        dx: state.vx,
        dy: state.vy,
        dvx: a.vx,
        dvy: a.vy
    };
}

function integrate(state, t, dt) {
    var a = evaluate(state, t, 0, {dx: 0, dy: 0, dvx: 0, dvy: 0});
    var b = evaluate(state, t, dt*.5, a);
    var c = evaluate(state, t, dt*.5, b);
    var d = evaluate(state, t, dt, c);

    var dxdt = 1/6 * (a.dx + 2*(b.dx + c.dx) + d.dx);
    var dydt = 1/6 * (a.dy + 2*(b.dy + c.dy) + d.dy);
    var dvxdt = 1/6 * (a.dvx + 2*(b.dvx + c.dvx) + d.dvx);
    var dvydt = 1/6 * (a.dvy + 2*(b.dvy + c.dvy) + d.dvy);

    return {
        x: state.x + dxdt * dt,
        y: state.y + dydt * dt,
        vx: state.vx + dvxdt * dt,
        vy: state.vy + dvydt * dt
    }
}

function move(ball)
{
    var curr = {
        x: ball.x,
        y: ball.y,
        vx: ball.vx,
        vy: ball.vy
    };

    var next = integrate(curr, 0, 1);

    ball.x = next.x;
    ball.y = next.y;
    ball.vx = next.vx;
    ball.vy = next.vy;
}

function step() {
    for (var i in sids) {
        move(players[sids[i]]);
    }
    io.sockets.emit('step', players);
}

setInterval(step, world.TIME_STEP);


/* SOCKET.IO CONNECTION HANDLERS */

io.sockets.on('connection', function(socket) {
    socket.on('connect', function() {
        console.log(socket.id + ' connected!');
        players[socket.id] = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            keyDown: {
                right: false,
                left: false,
                up: false,
                down: false,
            }
        };
    });

    socket.on('keydown', function(data) {
        console.log(socket.id + ' pressed key ' + data.key);
        players[socket.id].keyDown[data.key] = true;
    });
    socket.on('keyup', function(data) {
        console.log(socket.id + ' released key ' + data.key);
        players[socket.id].keyDown[data.key] = false;
    });
    socket.on('disconnect', function() {
        console.log(socket.id + ' disconnected!');
    })
});


/* ARDUINO INPUT HANDLERS */

var board = new five.Board();

board.on('ready', function() {
    var self = this;
    console.log('Connected to arduino!');
    var joystick = new five.Joystick({
        pins: ['A0', 'A1'],
        freq: 100
    });
    var greenButton = new five.Button(12);
    var whiteButton = new five.Button(13);
    var joystickButton = new five.Button(7);
    var rumble = 9;

    joystick.on('axismove', function( err, timestamp ) {
        world.TILT_X = (this.fixed.x - .5) / 2;
        world.TILT_Y = (this.fixed.y - .5) / 2;
    });
    joystickButton.on('up', function() {
        self.firmata.digitalWrite(rumble, self.firmata.HIGH);
    });
    joystickButton.on('down', function() {
        self.firmata.digitalWrite(rumble, self.firmata.LOW);
    });

    greenButton.on('up', function() {
        console.log("Green button pressed!");
    });
    whiteButton.on('up', function() {
        console.log("White button pressed!");
    });
});
