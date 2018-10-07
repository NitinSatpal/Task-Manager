var log = require('./dev-logger.js');

module.exports = function(server, origins) {
    log("Running socket.io server");
    var io = require('socket.io').listen(server);

    /*if (origins) {
        io.set("origins", "*:*");
    }*/

    io.on('connection', function(socket) {
        log('connected');

        socket.on('joinBoard', function(boardId) {
            log('joined board: ' + boardId);
            socket.join(boardId);
        });

        socket.on('leaveBoard', function(boardId) {
            log('left board: ' + boardId);
            socket.leave(boardId);
        });

        socket.on('addList', function(data) {
            log('addList: ', data);
            socket.broadcast.to(data.boardId)
                .emit("addList", data);
        });

        socket.on('addTask', function(data) {
            log('addTask: ', data);
            socket.broadcast.to(data.boardId)
                .emit("addTask", data);
        });

        socket.on('updateList', function(data) {
            log('updateList: ', data);
            socket.broadcast.to(data.boardId)
                .emit("updateList", data);
        });

        socket.on('updateTask', function(data) {
            log('updateTask: ', data);
            socket.broadcast.to(data.boardId)
                .emit("updateTask", data);
        });

        socket.on('disconnect', function() {
            log('disconnecting');
        });
    });
};