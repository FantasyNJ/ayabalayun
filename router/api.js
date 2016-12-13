var express = require('express');
//创建express的路由功能，可以根据需要创建多个路由，需要多少，创建多少。
var router = express.Router();
//user数据库
var User = require('../models/User');
var Data = require('../models/Data');
var Tree = require('../tools/Tree');
//上传
var multer  = require('multer');
var fs = require('fs');
//文件路径
var path = require('path');

//上传初始化
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var saveDir = './data/' + req.userInfo._id;
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir);
        }
        cb(null, saveDir);
    },
    filename: function (req, file, cb) {
        var dotIndex = file.originalname.lastIndexOf('.');
        var filename = file.originalname.substring(0, dotIndex);
        var suffix = file.originalname.substring( dotIndex );
        file.suffix = suffix;
        cb(null, filename + '_' +Date.now() + suffix);
    }
});

var upload = multer({ storage: storage });

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

    //用户名验证
    if ( username.length < 3 || username.length > 16 ) {
        res.responseData.code = 3;
        res.responseData.message = '用户名长度必须在6-16个字符之间';
        res.sendJSON();
        return;
    }
    if(! (/^[a-zA-Z][a-zA-Z\d]{5,15}$/).test(username) ){
        res.responseData.code = 4;
        res.responseData.message = '用户名必须字母开头，由字母数字组成';
        res.sendJSON();
        return;
    }

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
    if(! (/^[a-zA-Z][a-zA-Z\d]{5,15}$/).test(username) ){
        res.responseData.code = 4;
        res.responseData.message = '用户名必须字母开头，由字母数字组成';
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
            var data = new Data({
                pid: null,
                name: '测试文件夹',
                user_id: usersave,
                createDate: Date.now()
            });
            data.save();

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
router.post('/user/login', function(req, res){
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

//获取用户名
router.get('/data/getUserName', checkAuth, function(req, res){
    res.responseData.code = 0;
    res.responseData.username = req.userInfo.username;
    res.responseData.message = '获取用户名成功';
    res.sendJSON();
})

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
    if(upId === 'null' || upId === undefined){
        upId = null;
    }
    if(upId !== null && req.filesTree.get(upId).type !== 'folder' ){
        res.responseData.message = '只能移入文件夹';
        res.responseData.code = 1;
        res.sendJSON();
        return;
    }
    
    for(var i = 0;i < selectId.length;i++){
        var data = req.filesTree.get(selectId[i]);
        var name = data.name;
        if(req.filesTree.isNameRepeat(upId, name)){
            res.responseData.message = '有重名文件，不能移入！';
            res.responseData.code = 2;
            res.sendJSON();
            return;
        }
    }

    for(var i = 0;i < selectId.length;i++){
        if(req.filesTree.isChild(selectId[i], upId)){
            res.responseData.code = 3;
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
*  文件移动到回收站
* */
router.post('/data/recylebin', checkAuth, function(req, res){
    var removeIds = JSON.parse(req.body.removeIds);
    var allRemoveIds = [];
    //被删除的元素
    Data.update({
        _id: {$in: removeIds}
    },{
        isRemoveElem: true
    }, {
        multi: true
    }).then(function(){

    })
    for(var i = 0; i < removeIds.length;i++){
        var arr = req.filesTree.getSonsId(removeIds[i]);
        allRemoveIds = removeIds.concat(arr)
    }
    //被删除的元素和子孙元素
    Data.update({
        _id: {$in: allRemoveIds}
    },{
        isRemove: true
    }, {
        multi: true
    }).then(function(){
        res.responseData.message = '移入回收站成功';
        res.sendJSON();
    })
})

/*
 *  文件还原
 * */
router.post('/data/restore', checkAuth, function(req, res){
    var restoreIds = JSON.parse(req.body.restoreIds);
    console.log(restoreIds)
    var allIds = [];
    for(var i = 0; i < restoreIds.length;i++){
        var arr = req.filesTree.getSonsId(restoreIds[i]);
        allIds = restoreIds.concat(arr);
    }
    //修改被删除的元素
    Data.update({
        _id: {$in: restoreIds}
    },{
        isRemoveElem: false,
        pid: null
    }, {
        multi: true
    }).then(function(){

    })
    //修改被删除的元素和子孙元素
    Data.update({
        _id: {$in: allIds}
    },{
        isRemove: false
    }, {
        multi: true
    }).then(function(){
        res.responseData.message = '还原成功';
        res.sendJSON();
    })
})

/*
* 文件彻底删除
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

        //删除实体文件
        for (var i=0; i<removeIds.length; i++) {
            try {
                fs.unlinkSync('./' + req.filesTree.get(removeIds[i]).path);
            } catch(e) {}
        }

        res.responseData.message = '文件夹删除成功';
        res.sendJSON();
    })
})

//上传文件
router.post('/upload', checkAuth, upload.single('file'), function(req, res) {

    var pid = req.body.pid;
    if(pid === 'null' || pid === undefined){
        pid = null;
    }

    if ( pid !== null ) {
        var parentInfo = req.filesTree.get(pid);
        if ( !parentInfo ) {
            res.responseData.code = 1;
            res.responseData.message = '所在父级不存在';
            res.sendJSON();
            return;
        }
        if ( parentInfo.type !== 'folder' ) {
            res.responseData.code = 2;
            res.responseData.message = '目标父级不是一个文件夹';
            res.sendJSON();
            return;
        }
    }

    //获取文件夹下的一级子文件
    var list = req.filesTree.getChildren(pid);
    req.file.name = req.file.originalname;
    for (var i=0; i<list.length; i++) {
        if ( list[i].name == req.file.originalname ) {
            req.file.name = Date.now() + req.file.originalname;
            break;
        }
    }

    //var typeArr = req.file.mimetype.split('/');
    //req.file.type = typeArr[typeArr.length - 1];
    req.file.type = req.file.suffix.substring(1);


    //保存文件
    var data = new Data({
        pid: pid,
        name: req.file.name,
        user_id: req.userInfo._id,
        type: req.file.type,
        createDate: Date.now(),
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        path: req.file.path,
        size: req.file.size,
        suffix: req.file.suffix
    });
    data.save().then(function( dataInfo ) {
        res.responseData.message = '上传成功';
        res.sendJSON();
    });

});

//获取mp3音乐
router.get('/data/getMusic', checkAuth, function(req, res){
    var data = req.filesTree.getMusic();
    res.responseData.message = '获取文件成功';
    res.responseData.data = data;
    res.sendJSON();
});

//获取mp4视频
router.get('/data/getVideo', checkAuth, function(req, res){
    var data = req.filesTree.getVideo();
    res.responseData.message = '获取文件成功';
    res.responseData.data = data;
    res.sendJSON();
});
//获取回收站中的文件和文件夹
router.get('/data/getRecycleBin', checkAuth, function(req, res){
    var data = req.filesTree.getRecycleBin();
    res.responseData.message = '获取文件成功';
    res.responseData.data = data;
    res.sendJSON();
})
//获取下载
router.get('/data/getDownload', checkAuth, function(req, res){
    var _id = req.query._id;
    console.log(_id)
    var dataInfo = req.filesTree.get(_id);
    console.log(dataInfo)
    var pathName = dataInfo.path;
    var fileName = dataInfo.name;

    console.log( fileName )
    res.download( pathName, fileName, function(err){
        if (err) {
            // 处理错误，请牢记可能只有部分内容被传输，所以
            // 检查一下res.headerSent
            console.log(err)
        } else {
            // 减少下载的积分值之类的
            console.log('ok')
        }
    });

    //res.responseData.message = 'nihao';
    //res.sendJSON();
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