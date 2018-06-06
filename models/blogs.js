var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Blogs', new Schema({
    title: String,
    eg: String,
    content: String,
    author: String,
    data: Date
}));