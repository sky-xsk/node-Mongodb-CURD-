var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var obj = new Schema({
    name: String,
    password: String,
    admin: Boolean
    
})
//添加的实例方法
obj.method('says', function () {
    console.log('添加的实例方法');
})

//添加静态方法
obj.static('findByName', function (name, callback) {
    return this.find({ name: name }, callback);
});

var Users = mongoose.model('User', obj);

module.exports = Users;

