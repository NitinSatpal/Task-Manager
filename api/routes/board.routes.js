var _ = require('lodash');
var Board = require('../models/board.js');
var Task = require('../models/task.js');
var List = require('../models/list.js');
var log = require('../../logger.js');

module.exports = function(app) {
    log('starting board routes');
    /* Create */
    app.post('/board', function (req, res) {
        log('POST /board', req.body);
        var newBoard = new Board(req.body);
        newBoard.save(function(err, newBoard) {
            if (err) {
                res.json({info: 'error during board create', error: err});
            };
            res.json({info: 'board created successfully', data: newBoard});
        });
    });

    /* Read */
    app.get('/board', function (req, res) {
        log('GET /board');
        Board.find(function(err, boards) {
            if (err) {
                res.json({info: 'error during find boards', error: err});
            };
            res.json({info: 'boards found successfully', data: boards});
        });
    });

    app.get('/board/:id', function (req, res) {
        Board.findById(req.params.id, function(err, board) {
            if (err) {
                res.json({info: 'error during find board', error: err});
            };
            if (board) {
                res.json({info: 'board found successfully', data: board});    
            } else {
                res.json({info: 'board not found'});
            }
        });
    });

    app.get('/board/:id/lists', function (req, res) {
        Board.findById(req.params.id, function(err, board) {
            if (err) {
                res.json({info: 'error while finding board', error: err});
            };
            if (board) {
                List.find({boardId: req.params.id}).sort({order: 1}).exec({ boardId: req.params.id }, function (err, lists) {
                    res.json({info: 'Lists found successfully', data: lists});    
                })
            } else {
                res.json({info: 'board not found'});
            }
        });
    });

    app.get('/board/:id/tasks', function (req, res) {
        Board.findById(req.params.id, function(err, board) {
            if (err) {
                res.json({info: 'error while finding board', error: err});
            };
            if (board) {
                Task.find({ boardId: req.params.id }).sort({order: 1}).exec(function (err, tasks){
                    res.json({info: 'Tasks found successfully', data: tasks});
                });
            } else {
                res.json({info: 'board not found'});
            }
        });
    });

    /* Update */
    app.put('/board/:id', function (req, res) {
        Board.findById(req.params.id, function(err, board) {
            if (err) {
                res.json({info: 'error while finding board', error: err});
            };
            if (board) {
                _.merge(board, req.body);
                board.save(function(err) {
                    if (err) {
                        res.json({info: 'error during board update', error: err});
                    };
                    res.json({info: 'board updated successfully', data: board});
                });
            } else {
                res.json({info: 'board not found'});
            }

        });
    });

    /* Delete */
    app.delete('/board/:id', function (req, res) {
        Board.findByIdAndRemove(req.params.id, function(err, board) {
            if (err) {
                res.json({info: 'error during remove board', error: err});
            };
            res.json({info: 'board removed successfully', data: board});
        });
    });
};
