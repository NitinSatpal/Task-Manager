var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var taskSchema = mongoose.Schema({
    title: String,
    listId: String,
    boardId: String,
    order: Number
});

module.exports = mongoose.model('Task', taskSchema);
