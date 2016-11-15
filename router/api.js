var express = require('express');
//创建express的路由功能，可以根据需要创建多个路由，需要多少，创建多少。
var router = express.Router();
//user数据库
var User = require('../models/User');

router.use(function(req, res, next){
    res.responseData = {
        code: 0,    //状态码0表示成功
        message: ''
    }

    res.sendJSON = function(){
        this.json( this.responseData );
    }

    next();
})
/*
 * 检测用户名是否注册
 * method GET
 * <string>username : 用户要注册的用户名
 * */
router.get('/user/checkusername', function(req, res){
    var username = req.query.username || '';

    User.findOne({
        username: username
    }).then(function(userInfo){

        //已存在用户名
        if(userInfo){
            res.responseData.code = 1;
            res.responseData.message = '用户名已被注册';
        }else{
            res.responseData.code = 0;
            res.responseData.message = '用户名可以使用';
        }
        res.sendJSON();

    })
})

/*
 * 注册api
 * method POST
 * <string>username : 用户要注册的用户名
 * <string>password : 用户要注册的密码
 * <string>repassword : 重复密码
 * */
router.post('/user/register', function(req, res, next){
    var username = req.body.username || '';
    var password = req.body.password || '';
    var repassword = req.body.repassword || '';

    //用户名验证
    if ( username.length < 3 || username.length > 16 ) {
        res.responseData.code = 1;
        res.responseData.message = '用户名长度必须在3-16个字符之间';
        res.sendJSON();
        return;
    }
    //密码验证
    if (password.length < 6 || password.length > 16) {
        res.responseData.code = 2;
        res.responseData.message = '密码长度必须在6-16个字符之间';
        res.sendJSON();
        return;
    }
    //重复密码验证
    if ( password !== repassword ) {
        res.responseData.code = 3;
        res.responseData.message = '两次输入密码不一致';
        res.sendJSON();
        return;
    }

    User.findOne({
        username: username
    }).then(function(result){
        //用户名重复
        if(result){
            res.responseData.code = 4;
            res.responseData.message = '用户名已经被注册';
            res.sendJSON();
            return;
        }

        var user = new User({
            username: username,
            password: password
        })

        return user.save();
    }).then(function(usersave){
        if(usersave){
            res.responseData.code = 0;
            res.responseData.message = '用户注册成功';
            res.sendJSON();

            console.log(usersave)
        }
    }).catch(function(){
        res.responseData.code = 5;
        res.responseData.message = '用户注册失败';
        res.sendJSON();
    })
})

/*
 * 登录api
 * method POST
 * <string>username : 用户要注册的用户名
 * <string>password : 用户要注册的密码
 * */
router.post('/user/login', function(req, res, next){
    var username = req.body.username || '';
    var password = req.body.password || '';

    User.findOne({
        username: username
    }).then(function(userInfo){
        //如果用户数据不存在
        if(!userInfo){
            res.responseData.code = 1;
            res.responseData.message = '用户不存在';
            res.sendJSON();
            return;
        }
        if(userInfo.password != password){
            res.responseData.code = 2;
            res.responseData.message = '密码不正确';
            res.sendJSON();
            return;
        }

        res.responseData.code = 0;
        res.responseData.message = '登陆成功';
        res.responseData._id = userInfo._id;  //用户的数据库id
        res.responseData.username = userInfo.username;  //用户的用户名
        res.sendJSON();
    })
})


module.exports = router;