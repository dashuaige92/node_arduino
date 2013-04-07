var express = require('express');

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
var players = {};
var world = {
    TIME_STEP: 16,
    WORLD_W: 300,
    WORLD_H: 300,
    TILT_X: 0,
    TILT_Y: 0,
    BALL_RADIUS: 5,
    HOLE_RADIUS: 5,
};
var physics = {
    tilt_acceleration: 100 * (world.TIME_STEP/1000),
    acceleration: 120 * (world.TIME_STEP/1000),
    friction: 5 * (world.TIME_STEP/1000),
    restitution: 0.6
};

function acceleration(state, t) {
    // should actually be a force, but there is no mass
    var ax = 0, ay = 0;
    var control = state.keyDown;

    ax += physics.tilt_acceleration * world.TILT_X;
    ay -= physics.tilt_acceleration * world.TILT_Y;

    if ( (control.right ? !control.left : control.left) && 
        (control.up ? !control.down : control.down)) {
        // Diagonal movement

        var diagaccel = physics.acceleration * (1 / Math.sqrt(2));
        if (control.right) ax += diagaccel;
        if (control.left) ax -= diagaccel;
        if (control.up) ay += diagaccel;
        if (control.down) ay -= diagaccel;
    } else {
        if (control.right) ax += physics.acceleration;
        if (control.left) ax -= physics.acceleration;
        if (control.up) ay += physics.acceleration;
        if (control.down) ay -= physics.acceleration;
    }

    return {
        vx: - Math.pow(world.BALL_RADIUS, .5) * physics.friction * state.vx + ax,
        vy: - Math.pow(world.BALL_RADIUS, .5) * physics.friction * state.vy + ay
    };
}

function evaluate(initial, t, dt, d) {
    var state = {
        x: initial.x + d.dx * dt,
        y: initial.y + d.dy * dt,
        vx: initial.vx + d.dvx * dt,
        vy: initial.vy + d.dvy * dt,
        keyDown: initial.keyDown
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
    var next = integrate(ball, 0, 1);

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
    console.log(socket.id + ' connected!');
    players[socket.id] = {
        id: socket.id,
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
    sids.push(socket.id);

    socket.on('tilt', function(data) {
        world.TILT_X = (data.x - .5) / 2;
        world.TILT_Y = (data.y - .5) / 2;
        io.sockets.emit('world', world);
    })

    socket.on('keydown', function(data) {
        console.log(socket.id + ' key down!');
        players[socket.id].keyDown[data.key] = true;
    });
    socket.on('keyup', function(data) {
        players[socket.id].keyDown[data.key] = false;
    });
    socket.on('disconnect', function() {
        console.log(socket.id + ' disconnected!');
        var id = sids.indexOf(socket.id);
        if (id != -1) {
            sids.splice(sids.indexOf(id),1);
            delete players[socket.id];
        }
    })
});

