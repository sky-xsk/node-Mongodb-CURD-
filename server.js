var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var sha1 = require('sha1');
var config = require('./config');

var User = require('./models/user');
var Blogs = require('./models/blogs');


var apiRoutes = express.Router();

var port = process.env.PORT || 8080;

mongoose.connect(config.database);

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(morgan('dev'));

//添加文章模型
apiRoutes.post('/blogs', function(req, res) {
    console.log(res.body)
    var nick = new Blogs({
        title: '我的测试数据',
        eg: '备注信息',
        content: '文章的主体内容，文章的主体内容文章的主体内容文章的主体内容；',
        author: '殖民',
        data: new Date()
    });

    nick.save(function(err) {
        if (err) {
            throw err;
        }
        console.log('文章保存成功');
        res.json({ success: true })
    })
});


//向数据库添加数据
apiRoutes.post('/setup', function(req, res) {

    var nick = new User({
        name: 'xsk',
        password: sha1('test'),
        admin: true
    });

    nick.save(function(err) {
        if (err) {
            throw err;
        }
        console.log('用户保存成功');
        res.json({ success: true })
    })
});


//显示所有数据
apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    })
});

//根据id查找一条数据
apiRoutes.get('/users/:userid', function(req, res) {
    User.findById(req.params.userid, function(err, users) {
        if (err) {
            res.json(err);
        }
        res.json(users);
    })
});

//根据条件查询  "name": "xsk123"
apiRoutes.get('/usersQuery', function(req, res) {
    User.find({ "name": "xsk123" }, function(err, users) {
        if (err) {
            res.json(err);
        }
        res.json(users);
    })
});


//根据id删除一条数据
apiRoutes.delete('/users/:userid', function(req, res) {
    User.remove({ _id: req.params.userid }, function(err, users) {
        if (err) {
            res.json(err);
        }
        res.json({ message: '删除成功' });
    })
});

//通过id更新指定一条数据
apiRoutes.put('/users/:userid', function(req, res) {
    User.findById({ _id: req.params.userid }, function(err, users) {
        if (err) {
            res.json(err);
        }
        //更新指令，姓名
        //users.name = req.body.name;
        users.name = req.body.name;
        users.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: '更新成功' });
        });
    })
});

//接口认证
apiRoutes.post('/auth', function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            res.json({ success: false, message: '认证失败,用户找不到' })
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({ success: false, message: '认证失败,用户密码错误' })
            } else {
                //创建token
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresInMinutes: 1440 //设置过期时间
                });

                //json格式返回token
                res.json({
                    success: true,
                    message: 'token成功',
                    token: token
                })
            }
        }
    });
});
//中间件保护路由
apiRoutes.use(function(req, res, next) {
    //检查post的信息或者url查询参数或者头信息
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // 解析 token
    if (token) {
        // 确认token
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'token信息错误.' });
            } else {
                // 如果没问题就把解码后的信息保存到请求中，供后面的路由使用
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // 如果没有token，则返回错误
        return res.status(403).send({
            success: false,
            message: '没有提供token！'
        });

    }
});

app.listen(port);
app.use('/api', apiRoutes);
console.log('运行端口' + port)