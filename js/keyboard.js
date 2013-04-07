function onKeyDown(evt) {
    if (evt.which == 39 || evt.which == 68)
        socket.emit('keydown', { key: 'right' });
    if (evt.which == 37 || evt.which == 65)
        socket.emit('keydown', { key: 'left' });
    if (evt.which == 38 || evt.which == 87)
        socket.emit('keydown', { key: 'up' });
    if (evt.which == 40 || evt.which == 83)
        socket.emit('keydown', { key: 'down' });
}

function onKeyUp(evt) {
    if (evt.which == 39 || evt.which == 68)
        socket.emit('keyup', { key: 'right' });
    if (evt.which == 37 || evt.which == 65)
        socket.emit('keyup', { key: 'left' });
    if (evt.which == 38 || evt.which == 87)
        socket.emit('keyup', { key: 'up' });
    if (evt.which == 40 || evt.which == 83)
        socket.emit('keyup', { key: 'down' });
}
