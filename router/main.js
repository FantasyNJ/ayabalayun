// express 模块
var express = require('express');
var router = express.Router();

router.get('/', function(req, res){

    if (req.userInfo._id) {
        //已经登录了
        res.redirect('/disk');
    } else {
        res.render('index');
    }
})

router.get('/disk', function(req, res){

    if (!req.userInfo._id) {  //用户没有登录
        res.redirect('/');
    } else {
        res.render('disk');
    }

})

module.exports = router;