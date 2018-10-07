var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var listSchema = mongoose.Schema({
  title: String,
  boardId: String,
  order: Number
});

module.exports = mongoose.model('List', listSchema);