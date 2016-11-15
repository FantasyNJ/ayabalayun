// express 模块
var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    res.render('index');
})

router.get('/disk', function(req, res){
    res.render('disk');
})

module.exports = router;