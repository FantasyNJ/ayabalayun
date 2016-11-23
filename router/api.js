var express = require('express');
//创建express的路由功能，可以根据需要创建多个路由，需要多少，创建多少。
var router = express.Router();
//user数据库
var User = require('../models/User');
var Data = require('../models/Data');
var Tree = require('../tools/Tree')

/*
* user部分
*/
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

        //把登录用户的信息记录到cookie中，发送给客户端
        var cookieUserInfo = {
            _id: userInfo._id.toString(),
            username: userInfo.username
        };

        req.cookies.set('userInfo', JSON.stringify(cookieUserInfo));

        res.responseData.code = 0;
        res.responseData.message = '登陆成功';
        res.sendJSON();
    })
})




/*
* data部分
* _id
* name
* (pid)
*/

router.post('/data/createFile', checkAuth,function(req, res){
    var name = req.body.name || '';
    var pid = req.body.pid;
    if(pid === 'null' || pid === undefined){
        pid = null;
    }

    if(name === ''){
        res.responseData.code = 1;
        res.responseData.message = '文件名不能为空';
        res.sendJSON();
    }

    if(pid !== null){
        var parentInfo = req.filesTree.get(pid);
        if ( !parentInfo ) {
            res.responseData.code = 2;
            res.responseData.message = '所在父级不存在';
            res.sendJSON();
            return;
        }
        if ( parentInfo.type !== 'folder' ) {
            res.responseData.code = 3;
            res.responseData.message = '目标父级不是一个文件夹';
            res.sendJSON();
            return;
        }
    }

    if(req.filesTree.isNameRepeat(pid, name)){
        res.responseData.code = 2;
        res.responseData.message = '目录下已存在同名文件夹';
        res.sendJSON();
        return;
    }


    //保存文件夹
    var data = new Data({
        pid: pid,
        name: name,
        user_id: req.userInfo._id,
        createDate: Date.now()
    });
    data.save().then(function(dataInfo) {
        if(dataInfo){
            res.responseData.code = 0;
            res.responseData.message = '文件夹创建成功';
            res.sendJSON();
        }
    });
})

//获取文件夹下文件夹和文件
router.get('/data/getChildren', checkAuth, function(req, res) {
    var pid = req.query.pid;
    if(pid === 'null' || pid === undefined){
        pid = null;
    }
    res.responseData.data = req.filesTree.getChildren(pid);
    res.sendJSON();
});

router.get('/data/getNav', checkAuth, function(req, res){
    var pid = req.query.pid;
    if(pid === 'null' || pid === undefined){   //渲染的是云盘根目录，直接返回空数组
        pid = null;
        res.responseData.data = [];
        res.sendJSON();
        return;
    }
    var item = req.filesTree.get(pid);
    res.responseData.data = req.filesTree.getParents(pid).concat(item);
    res.sendJSON();
})

router.get('/data/getTree', checkAuth, function(req, res){
    var pid = req.query.pid;
    if(pid === 'null' || pid === undefined){
        pid = null;
    }
    res.responseData.data = req.filesTree.getFolderSons(null);
    res.sendJSON();
})
/*
* 文件夹移动到接口
* upId     string
* selectId array
 */
router.post('/data/move', checkAuth, function(req, res){
    var upId = req.body.upId;
    var selectId = JSON.parse(req.body.selectId);
    for(var i = 0;i < selectId.length;i++){
        var data = req.filesTree.get(selectId[i]);
        var name = data.name;
        if(req.filesTree.isNameRepeat(upId, name)){
            res.responseData.message = '有重名文件，不能移入！';
            res.responseData.code = 1;
            res.sendJSON();
            return;
        }
    }

    for(var i = 0;i < selectId.length;i++){
        if(req.filesTree.isChild(selectId[i], upId)){
            res.responseData.code = 1;
            res.responseData.message = '目标是子级，不能移动';
            res.sendJSON();
            return;
        }
    }

    selectId.forEach(function(item){
        Data.update({
            _id: item
        },{
            pid: upId
        }).then(function(dataInfo){
            res.responseData.message = '移入文件夹成功';
            res.sendJSON();
        })
    })
    
})
/*
* 文件夹重命名
* _id  改名的文件夹id   string
* name 要更改的文件夹名  string
* pid  父级文件夹的id string
 */
router.post('/data/rename', checkAuth, function(req, res){
    var _id = req.body._id;
    var name = req.body.name;
    var pid = req.body.pid;
    if(pid === 'null' || pid === undefined){
        pid = null;
    }

    if(req.filesTree.isNameRepeatNotSelf(pid, _id, name)){
        res.responseData.message = '有重名文件，不能重命名！';
        res.responseData.code = 1;
        res.sendJSON();
        return;
    }
    Data.update({
        _id: _id
    },{
        name: name
    }).then(function(dataInfo){
        res.responseData.message = '文件夹改名成功';
        res.sendJSON();
    })
})

/*
* 文件夹重命名
* removeIds 要删除的文件夹_id  array
 */
router.post('/data/remove', checkAuth, function(req, res){
    var removeIds = JSON.parse(req.body.removeIds);
    for(var i = 0; i < removeIds.length;i++){
        var arr = req.filesTree.getSonsId(removeIds[i]);
        removeIds = removeIds.concat(arr)
    }
    Data.remove({
        _id: {$in: removeIds}
    }).then(function(){
        res.responseData.message = '文件夹删除成功';
        res.sendJSON();
    })
})

//检测用户权限以及获取用户数据
function checkAuth(req, res, next) {
    if (!req.userInfo._id) {
        res.responseData.code = -1;
        res.responseData.message = '你没有访问该接口的权限';
        res.sendJSON();
    } else {
        //数据初始化
        Data.find({
            user_id: req.userInfo._id
        }).sort(
            {createDate: -1}
        ).then(function(result) {
            req.filesTree = new Tree(result);
            next();
        });
    }
}

module.exports = router;