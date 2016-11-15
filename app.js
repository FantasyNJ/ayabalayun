'use strict'
// express 模块
var express = require('express');
//文件模块
var fs = require('fs');
//文件路径
var path = require('path');
// 数据库模块
var mongoose = require('mongoose');
// 模板引擎模块
var swig = require('swig');
// post数据处理模块
var bodyParser = require('body-parser');
// 创建一个app
var app = express();


// 静态资源托管设置
app.use( '/bower_components', express.static( path.join(__dirname, '/bower_components') ) );
app.use( express.static( path.join(__dirname, '/public') ) );

// 创建一个模板引擎，并设置解析方法
app.engine('html', swig.renderFile);
// 设置模板文件存放目录
app.set('views', './views');
// 设置app使用的模板引擎
app.set('view engine', 'html');
// 这是模板引擎的配置参数，不缓存模板，每次访问都重新解析模板，开发中设置为false，上线设置为true
swig.setDefaults({cache: false});


//解析处理post提交过来的数据:urlencoded。返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(bodyParser.urlencoded({ extended: false }));

//api模块路由
app.use('/api', require('./router/api.js'));
//主模块路由
app.use('/', require('./router/main.js'));



//开启服务（监听）
//数据库连接地址
var url = 'mongodb://localhost:27017/weiyun';

mongoose.connection.on('connected', function(){
    console.log('Connection success!');
});
mongoose.connection.on('error', function(err){
    console.log('Connection error: ' + err);
});
mongoose.connection.on('disconnected', function(){
    console.log('Connection disconnected');
});


//当app启动的时候，连接数据库
mongoose.connect(url).then(function(d) {
    // 当数据库连接成功以后，开始监听用户请求
    app.listen(9999, 'localhost');
    console.log('服务器已经开启成功');
});




