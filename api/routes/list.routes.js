var _ = require('lodash');
var List = require('../models/list.js');
var Task = require('../models/task.js');
var log = require('../../dev-logger.js');

module.exports = function(app) {
    log('starting list routes');
    /* Create */
    app.post('/list', function (req, res) {
        log('POST /list');
        var newList = new List(req.body);
        newList.save(function(err, newList) {
            if (err) {
                res.json({info: 'error during list create', error: err});
            };
            res.json({info: 'list created successfully', data: newList});
        });
    });

    /* Read */
    app.get('/list', function (req, res) {
        log('GET /list');
        List.find(function(err, lists) {
            if (err) {
                res.json({info: 'error during find lists', error: err});
            };
            res.json({info: 'lists found successfully', data: lists});
        });
    });

    app.get('/list/:id', function (req, res) {
        log('GET /list/:id');
        List.findById(req.params.id, function(err, list) {
            if (err) {
                res.json({info: 'error during find list', error: err});
            };
            if (list) {
                res.json({info: 'list found successfully', data: list});
            } else {
                res.json({info: 'list not found'});
            }
        });
    });


    app.get('/list/:id/tasks', function (req, res) {
        log('GET /list/:id');
        List.findById(req.params.id, function(err, list) {
            if (err) {
                res.json({info: 'error during find list', error: err});
            };
            if (list) {
                Task.find({ listId: req.params.id }).sort({order: 1}).exec(function (err, tasks){
                    res.json({info: 'tasks found successfully', data: tasks});
                });
            } else {
                res.json({info: 'list not found'});
            }
        });
    });

    /* Update */
    app.put('/list/:id', function (req, res) {
        log('PUT /list/:id');
        List.findById(req.params.id, function(err, list) {
            if (err) {
                res.json({info: 'error during find list', error: err});
            };
            if (list) {
                _.merge(list, req.body);
                list.save(function(err) {
                    if (err) {
                        res.json({info: 'error during list update', error: err});
                    };
                    res.json({info: 'list updated successfully'});
                });
            } else {
                res.json({info: 'list not found'});
            }

        });
    });

    /* Delete */
    app.delete('/list/:id', function (req, res) {
        log('DELETE /list/:id');
        List.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.json({info: 'error during remove list', error: err});
            };
            res.json({info: 'list removed successfully'});
        });
    });
};
