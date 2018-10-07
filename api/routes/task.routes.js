var _ = require('lodash');
var Task = require('../models/task.js');
var log = require('../../dev-logger.js');

module.exports = function(app) {
    log('starting task routes');
    /* Create */
    app.post('/task', function (req, res) {
        log('POST /task');
        var newTask = new Task(req.body);
        newTask.save(function(err, newTask) {
            if (err) {
                res.json({info: 'error during task create', error: err});
            };
            res.json({info: 'task created successfully', data: newTask});
        });
    });

    /* Read */
    app.get('/task', function (req, res) {
        log('GET /task');
        Task.find(function(err, tasks) {
            if (err) {
                res.json({info: 'error during find tasks', error: err});
            };
            res.json({info: 'tasks found successfully', data: tasks});
        });
    });

    app.get('/task/:id', function (req, res) {
        log('GET /task/:id');
        Task.findById(req.params.id, function(err, task) {
            if (err) {
                res.json({info: 'error during find task', error: err});
            };
            if (task) {
                res.json({info: 'task found successfully', data: task});
            } else {
                res.json({info: 'task not found'});
            }
        });
    });

    /* Update */
    app.put('/task/:id', function (req, res) {
        log('PUT /task/:id');
        Task.findById(req.params.id, function(err, task) {
            if (err) {
                res.json({info: 'error during find task', error: err});
            };
            if (task) {
                _.merge(task, req.body);
                task.save(function(err) {
                    if (err) {
                        res.json({info: 'error during task update', error: err});
                    };
                    res.json({info: 'task updated successfully'});
                });
            } else {
                res.json({info: 'task not found'});
            }

        });
    });

    /* Delete */
    app.delete('/task/:id', function (req, res) {
        log('DELETE /task/:id');
        Task.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.json({info: 'error during remove task', error: err});
            };
            res.json({info: 'task removed successfully'});
        });
    });
};
