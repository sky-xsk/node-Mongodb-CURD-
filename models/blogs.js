var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var obj = new Schema({
    title: String,
    eg: String,
    content: String,
    author: String,
    data: Date,
})

var Blogs = mongoose.model('Blogs', obj);
module.exports = Blogs;