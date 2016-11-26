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

//退出登录
router.get('/logout', function(req, res) {
    req.cookies.set('userInfo', null);
    res.redirect('/');
})

module.exports = router;