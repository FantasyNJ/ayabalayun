'use strict';

//根据数据生成文件列表
var filecon = $S('.g-filecon')[0]; //文件夹容器
var filewrap = $S('.g-filewrap')[0];
var all = $S('#all');

var aFile = filecon.children; //获取文件夹

var toolBar = $S('.g-toolbar')[0];
var toolBarLeft = $S('.g-btn-left')[0];
var toolBtn = $S('.u-btn', toolBarLeft); //功能按钮
var path = $S('.g-path')[0]; //路径
var pathTree = $S('.g-path-tree', path)[0]; //路径渲染
var currentPid = null; //当前文件夹的id(当前所展示的文件夹的pid)
var isCreateFile = false; //没有正在创建的文件夹
var isRename = false; //没有正在重命名的文件夹
var ele = []; //当前选中的元素
var dragEle = null; //拖拽时移入到哪个元素
var isMove = false; //是否在元素上移动，否的话是false
//拖拽时显示的元素
var dragmove = $S('.drag-move')[0];
var dragmoveIcon = $S('.icons', dragmove)[0];
var sum = $S('.sum', dragmove)[0];


//右键菜单
var context = $S('.contextmenu')[0];
var contextBtn = $S('a', context);
//左侧文件列表
var gFileTree = $S('.g-file-tree')[0];
var treeMenu = $S('.tree-menu', gFileTree)[0];
var treeWrap = $S('.tree-wrap', treeMenu)[0];
var listOn = {};   //保存左侧列表文件夹的打开状态


//展开、收起文件列表
(function () {
    var toolBtnList = $S('.u-btn-list', toolBar)[0]; //功能按钮
    var fileShow = $S('.g-file-show')[0];
    toolBtnList.isShow = false; //是否展开？展开true

    addEvent(toolBtnList, 'click', show);

    function show() {
        if (!toolBtnList.isShow) {
            fileShow.style.left = 0;
        } else {
            fileShow.style.left = '165px';
        }
        toolBtnList.isShow = !toolBtnList.isShow;
    }
})();

//新建文件夹点击事件和键盘事件
(function(){
    var mkdir = $S('.mkdir', toolBarLeft)[0];
    //var fileShow = $S('g-file-show')[0];

    //进入页面先渲染文件
    render();
    addEvent(mkdir, 'mouseup', function () {
        if (!isRename) {
            //如果没有正在重命名的文件夹
            createFile(); //创建文件夹的时候已经设置正在创建文件夹开关
            allNotSelect();
        } else {
             tipsFn('err', '有文件正在重命名');
        }
    });
     //鼠标按下时，删除正在创建的文件夹或者生成文件夹
     addEvent(document, 'mousedown', function () {
         if (isCreateFile) {
             //如果正在创建文件夹
             createFileEvent();
         }
     });
     //新建文件夹键盘事件
     addEvent(document, 'keydown', function (ev) {
         if (isCreateFile && ev.keyCode === 13) {
             //如果正在创建文件夹
             createFileEvent();
         }
     });

     //键盘事件和点击事件公用函数
     function createFileEvent() {
         var cFile = $S('.m-cfile', filecon)[0];
         var value = $S('input', cFile)[0].value.trim();
         if (cFile !== undefined && value === '') {
             //如果存在创建的文件夹并且文件夹名称为空(不是正在重命名的情况)
             filecon.removeChild(cFile);
         }
         isCreateFile = false; //创建成不成功都设置为false
         if (value !== '') {  //如果文件夹名不为空
             //filecon.innerHTML = '';
             ajax({
                 method : 'post',
                 url : '/api/data/createFile',
                 data : {
                     name: value,
                     pid: currentPid
                 },
                 success : function (result) {
                    if( !result.code ){
                        tipsFn('ok', result.message);
                    }else{
                        tipsFn('err', result.message);
                    }
                    render();
                 },
             })
         }
    }
})();

//全选按钮点击事件
addEvent(all, 'click', function () {
    if (aFile.length !== 0) {
        toggleClass(this, 'checked');
        if (hasClass(this, 'checked')) {
            allSelect();
        } else {
            allNotSelect();
        }
    }
});

//文件夹添加点击事件,事件委托
addEvent(filecon, 'mouseup', function (ev) {
    var target = ev.target;
    if (getSelector(ev.target, '.m-file') && !isMove && ev.button === 0) {
        //如果不是移动时在文件夹上抬起并且是鼠标左键
        //console.log('up')
        target = getSelector(ev.target, '.m-file');
        currentPid = target.dataset.fileId;
        render(currentPid);
        listOn[currentPid] = true;
        document.onmousemove = document.onmouseup = null;
    }
    isMove = false;
});

//拖拽框选择文件夹
addEvent(filewrap, 'mousedown', function (ev) {
    if (ev.button === 0) {
        //如果不是鼠标左键，不执行
        var disX = ev.pageX;
        var disY = ev.pageY;
        var div = document.createElement('div');
        div.className = 'dragselect';
        document.body.appendChild(div);
        document.onmousemove = function (ev) {
            if (disX === ev.pageX && disY === ev.pageY) {
                return;
            }
            var ev = ev || event;
            div.style.left = Math.min(ev.pageX, disX) + 'px';
            div.style.top = Math.min(ev.pageY, disY) + 'px';
            div.style.width = Math.abs(ev.pageX - disX) + 'px';
            div.style.height = Math.abs(ev.pageY - disY) + 'px';
            for (var i = 0; i < aFile.length; i++) {
                //碰撞检测
                if (pz(div, aFile[i])) {
                    addClass(aFile[i], 'checked');
                } else {
                    removeClass(aFile[i], 'checked');
                }
            }
            changeAllBtnStatus();
        };
        document.onmouseup = function () {
            document.body.removeChild(div);
            document.onmousemove = document.onmouseup = null;
        };
        ev.preventDefault();
    }
})
//事件委托、点击文件列表渲染
addEvent(treeMenu, 'click', function (ev) {
    var target = getSelector(ev.target, '.tree-title');
    if (target !== null) {
        //找到 tree-title 元素
        var fileId = target.dataset.fileId; //target.dataset.fileId是字符串
        if (ev.target.className.indexOf('ico') !== -1) {
            if (!target.on) {   //true表示当前列表为展开状态
                //展开列表
                removeClass(target, 'tree-contro'); 
                addClass(target, 'tree-contro-list');
                next(target).style.display = 'block';
            } else {
                //隐藏
                if (hasChildren(fileId)) {
                    removeClass(target, 'tree-contro-list'); 
                    addClass(target, 'tree-contro');
                }
                next(target).style.display = 'none';
            }
            target.on = !target.on;
            listOn[fileId] = target.on;  //改变左侧文件夹展开状态
            //return;   //不渲染右侧文件，只展开文件列表
        } else {
            currentPid = fileId;
            render(currentPid);
            listOn[fileId] = true;   //改变左侧文件夹展开状态
        }
    }
});

/* =============================
 * 功能性函数
 * =============================
 */
//渲染整个页面所有模块的文件列表
function render(pid){
    var pid = pid || currentPid;
    removeClass(all, 'checked');

    renderFile();
    renderNav();
    renderTree();
}

//渲染pid下所有的文件和文件夹
function renderFile(pid) {
    var pid = pid || currentPid;
    ajax({
        method : 'get',
        url : '/api/data/getChildren',
        data : {
            pid: pid
        },
        success : function (result) {
            var datas = result.data;
            var sHtml = '';
            datas.forEach(function (item) {
                sHtml += fileHtml(item);
            });
            filecon.innerHTML = sHtml;
            //checkbox点击事件
            var checkbox = $S('.checkbox', filecon);

            function checkboxEvent(i) {
                addEvent(checkbox[i], 'mouseup', function (ev) {
                    ev.stopPropagation();
                    var p = aFile[i];
                    toggleClass(p, 'checked');
                    //改变全选按钮状态
                    changeAllBtnStatus();
                    document.onmousemove = document.onmouseup = null;
                });
            };

            for (var i = 0; i < checkbox.length; i++) {
                checkboxEvent(i);
            }
        },
    })
    
}
//渲染文件导航条
function renderNav(pid){
    var pid = pid || currentPid;
    ajax({
        method: 'get',
        url : '/api/data/getNav',
        data : {
            pid: pid
        },
        success : function (result) {
            var data = result.data;
            path.querySelector('a').style.backgroundPosition = '';
            var sHtml = '';
            var index = 999;
            for(var i = 0;i < data.length;i++){
                index--;
                var bk = '';
                if(i === data.length-1){
                    bk = 'background-position: right -200px;'
                }
                sHtml += `<a href="javascript:;" data-file-id="${data[i]._id}" style="z-index:${index};${bk}">${data[i].name}</a>`;
            }
            pathTree.innerHTML = sHtml;
            if(data.length === 0){
                path.querySelector('a').style.backgroundPosition = 'right -200px';
            }
            var aBtn = $S('a', path);
            for(var i = 0;i < aBtn.length;i++){
                //addEvent(aBtn[i], 'click', function(){
                //    用addEventListener用匿名函数会绑定多次事件
                //})
                aBtn[i].onclick = function(){
                    currentPid = this.dataset.fileId;
                    listOn[currentPid] = true;  //改变左侧列表文件夹展开状态
                    render();
                }
            }
        },
    })
}

//渲染左侧文件列表
function renderTree(){
    var pid = pid || currentPid;
    ajax({
        method: 'get',
        url: '/api/data/getTree',
        data: {
            pid: pid
        },
        success: function(result){
            var data = result.data;
            var treeTitle = $S('.tree-title', treeMenu)[0];
            if(data.length === 0){
                $S('.ico', treeTitle)[0].style.display = 'none';
                removeClass(treeTitle, 'tree-contro-list');
                treeWrap.innerHTML = treeFileHtml(data);  //渲染列表
            }else{
                $S('.ico', treeTitle)[0].style.display = 'inline';
                if(treeTitle.on || treeTitle.on === undefined){
                    addClass(treeTitle, 'tree-contro-list');
                }else{
                    addClass(treeTitle, 'tree-contro');
                }
                treeWrap.innerHTML = treeFileHtml(data);  //渲染列表
                treeWrap.querySelector('ul').style.display = 'block';
                $S('.tree-title', treeMenu)[0].on = true;
                //根据listOn展开相应列表
                var treeTitles = $S('.tree-title', treeMenu);
                for(var id in listOn){
                    var str = '.tree-title[data-file-id="'+id+'"]';
                    if(listOn[id]){
                        try{
                            var elem = treeMenu.querySelector(str);
                            elem.on = true;
                            removeClass(elem, 'tree-contro');
                            addClass(elem, 'tree-contro-list');
                            next(elem).style.display = 'block';
                        }catch(e){}
                    }else{
                        try{
                            var elem = treeMenu.querySelector(str);
                            elem.on = false;
                        }catch(e){}
                    }
                }
            }
        }
    })
    function treeFileHtml(data, id){
        var id = id || null;
        var children = getChildren(data, id);
        var sHtml = '<ul style="display: none;">';
        children.forEach(function(item){
            var level = getLevelById(data, item._id)
            var pl = level*14 + 'px';
            var activeClass = '';
            if(item._id === currentPid){
                activeClass = 'tree-nav';
                removeClass($S('.tree-title', treeMenu)[0], 'tree-nav');
            }
            if(currentPid === 'null'){
                addClass($S('.tree-title', treeMenu)[0], 'tree-nav');
            }
            var triangleClass = '';
            var displayStyle = 'display:none';
            if(hasChildren(data, item._id)){
                triangleClass = 'tree-contro';
                displayStyle = 'display:inline'
            }
            sHtml += `
                <li>
                    <div class="tree-title ${triangleClass} ${activeClass}" data-file-id=${item._id}  style="padding-left:${pl}">
                        <span>
                            <strong class="ellipsis">${item.name}</strong>
                            <i class="ico" style="${displayStyle}"></i>
                        </span>
                    </div>
                    ${treeFileHtml(data, item._id)}
                </li>
            `;
        })
        sHtml += '</ul>';
        return sHtml;
    }
}

//创建单个文件夹(创建新文件夹的时候)
function createFile(){
    isCreateFile = true;   //正在创建文件夹
    var file = document.createElement('div');
    file.className = 'm-cfile';
    file.innerHTML = `
        <span class="checkbox"></span>
        <div class="img"><span class="img-file f-inbl"></span></div>
        <div class="name">
            <input type="text">
        </div>
    `;
    filecon.insertBefore(file, aFile[0]);
    var inp = $('input', file)[0];
    inp.focus();
    addEvent(file, 'mousedown', function(ev){
        ev.cancelBubble = true;
    })
}
//单个文件夹的DOM结构(页面渲染时使用)
function fileHtml(data){
    var fileHtml = `
        <div class="m-file" data-file-id="${data._id}" data-file-type="${data.type}">
            <span class="checkbox"></span>
            <div class="img"><span class="img-${data.type} f-inbl"></span></div>
            <div class="name">
                <span style="display: block;">${data.name}</span>
                <input style="display: none;" type="text">
            </div>
        </div>
    `;
    return fileHtml;
}

/*
 *  上方提示信息框
 *  封装小提醒 err ok warn
 * */
var fullTipBox = $(".full-tip-box")[0];
var tipText = $(".text", fullTipBox)[0];

function tipsFn(cls, title) {
    tipText.innerHTML = title;
    fullTipBox.className = 'full-tip-box';

    //每次调用的时候，都要从-32px开始向0的位置运动

    fullTipBox.style.top = '-32px';
    fullTipBox.style.transition = 'none';

    setTimeout(function () {
        fullTipBox.className = 'full-tip-box';
        fullTipBox.style.top = 0;
        fullTipBox.style.transition = '.3s';
        addClass(fullTipBox, cls);
    }, 0);
    clearInterval(fullTipBox.timer);
    fullTipBox.timer = setTimeout(function () {
        fullTipBox.style.top = '-32px';
    }, 2000);
}
 //改变全选按钮状态
 function changeAllBtnStatus() {
     if (isAll()) {
         //如果全选
         addClass(all, 'checked');
     } else {
         //没有全选
         removeClass(all, 'checked');
     }
 }

//全选状态
function allSelect() {
    addClass(all, 'checked');
    for (var i = 0; i < aFile.length; i++) {
        addClass(aFile[i], 'checked');
    }
}
//非全选状态(全部不选中)
function allNotSelect() {
    removeClass(all, 'checked');
    for (var i = 0; i < aFile.length; i++) {
        removeClass(aFile[i], 'checked');
    }
}
//检测是否有class，有删除,没有添加
function toggleClass(ele, classNames) {
    if (hasClass(ele, classNames)) {
        removeClass(ele, classNames);
        return false;
    } else {
        addClass(ele, classNames);
        return true;
    }
}
//找到被选中的元素
function whoSelect() {
    var checkbox = $('.checkbox', filecon);
    var arr = [];
    for (var i = 0; i < checkbox.length; i++) {
        var item = checkbox[i];
        if (hasClass(aFile[i], 'checked')) {
            arr.push(aFile[i]);
        }
    }
    return arr;
}
//检测是否全选
function isAll() {
    var arr = whoSelect();
    if (arr.length === aFile.length && aFile.length !== 0) {
        return true;
    } else {
        return false;
    }
}
/*
 * 左侧列表渲染数据所用方法
 */

//通过id获得信息
function getInfo(datas, id){
    for(var i = 0;i < datas.length;i++){
        if(datas[i]._id === id){
            return datas[i];
        }
    }
}
//获取所有一级子节点
function getChildren(datas, id){
    var arr = [];
    for(var i = 0;i < datas.length;i++){
        if(datas[i].pid === id){
            arr.push(datas[i]);
        }
    }
    return arr;
}
//获取父级
function getParent(datas, id) {
    var info = getInfo(datas, id);
    if (info) {
        return getInfo(datas, info.pid);
    }
}
//获取所有父级
function getParents(datas, id){
    var arr = [];
    var p = getParent(datas, id);
    if(p){
        arr.push(p);
        arr = arr.concat(getParents(datas, p._id));
    }
    return arr;
}
//通过id获取在数据中是第几层(从1开始)
function getLevelById(datas, id){
    var arr = getParents(datas, id);
    return arr.length+2;
}
//通过id得到是否有子节点
function hasChildren(datas, id){
    var len = getChildren(datas, id).length;
    return len === 0?false : true;
}

/*
 * 文件夹拖拽移动到
 * */
addEvent(filecon, 'mousedown', function (ev) {
    if (ev.button !== 0) {
        return;
    } //如果不是鼠标左键按下，不运行
    var target = getSelector(ev.target, '.m-file');
    if (target !== null) {
        //如果鼠标点击的是文件夹
        ev.stopPropagation(); //防止点击文件时产生拖拽选择框
        var disX = ev.pageX;
        var disY = ev.pageY;
        //if(isMove){return;}
        document.onmousemove = function (ev) {
            if (disX === ev.pageX && disY === ev.pageY) {
                return;
            }
            //console.log('move')
            isMove = true; //触发了拖拽移动
            if (Math.abs(ev.pageX - disX) > 15 || Math.abs(ev.pageY - disY) > 15) {
                if (!hasClass(target, 'checked')) {
                    //如果元素没有被选中，只选中元素本身
                    allNotSelect();
                    addClass(target, 'checked');
                }
                var aEle = whoSelect();
                dragmove.style.left = ev.pageX + 15 + 'px';
                dragmove.style.top = ev.pageY + 15 + 'px';
                dragmove.style.display = 'block';
                sum.innerHTML = aEle.length;
                var len = aEle.length > 4 ? 4 : aEle.length;
                for (var i = 0; i < len; i++) {
                    var span = document.createElement('span');
                    span.className = 'icon';
                    span.style.left = i * 5 + 'px';
                    span.style.top = i * 3 + 'px';
                    dragmoveIcon.appendChild(span);
                }
                document.onmousemove = function (ev) {
                    dragmove.style.left = ev.pageX + 15 + 'px';
                    dragmove.style.top = ev.pageY + 15 + 'px';
                };
            }
        };
        document.onmouseup = function (ev) {
            console.log(disX, ev.pageX, disY, ev.pageY);
            if (Math.abs(ev.pageX - disX) < 5 && Math.abs(ev.pageY - disY) < 5) {
                console.log(disX - ev.pageX, disY - ev.pageY);
                // currentId = parseInt(target.dataset.fileId);
                // render();
                document.onmousemove = document.onmouseup = null;
                return;
            }
            dragmove.style.display = 'none';
            dragmoveIcon.innerHTML = '';
            for (var i = 0; i < aFile.length; i++) {
                if (up(ev, aFile[i])) {
                    var upEle = aFile[i];
                    break;
                }
            }
            var seleEle = whoSelect();
            if (upEle && seleEle.indexOf(upEle) === -1) {
                //如果有移入的元素并且移入的元素不是选中的元素
                var upId = upEle.dataset.fileId;
                var selectId = [];
                for (var i = 0; i < seleEle.length; i++) {
                    var item = seleEle[i];
                    var id = item.dataset.fileId;
                    selectId.push(id);
                }
                ajax({
                    method: 'post',
                    url: '/api/data/move',
                    data: {
                        upId: upId,
                        selectId: JSON.stringify(selectId)
                    },
                    success: function(result){
                        if( !result.code ){
                            tipsFn('ok', result.message);
                        }else{
                            tipsFn('err', result.message);
                        }
                        render();
                    }
                })
                console.log(selectId, upId);
            }
            document.onmousemove = document.onmouseup = null;
            isMove = false;
        };
        ev.preventDefault();
    }
});

//鼠标抬起检测函数
//mObj 移动的元素
function up(ev, sObj) {
    var s = sObj.getBoundingClientRect();
    var l1 = ev.clientX;
    var r1 = ev.clientX;
    var t1 = ev.clientY;
    var b1 = ev.clientY;

    var l2 = s.left;
    var r2 = s.left + s.width;
    var t2 = s.top;
    var b2 = s.top + s.height;

    if (r1 > l2 && l1 < r2 && b1 > t2 && t1 < b2) {
        return true;
    } else {
        return false;
    }
}



/*
 * 重命名
 * */
var rename = $S('.rename', toolBarLeft)[0];
addEvent(rename, 'mouseup', renameEvent);
function renameEvent(ev) {
    isRename = true; //有文件夹正在改名
    var aEle = whoSelect();
    if (aEle.length !== 1) {
        if (aEle.length === 0) {
            tipsFn('err', '请选择文件');
        } else {
            tipsFn('err', '只能对单个文件夹重命名');
        }
        isRename = false; //没有文件夹正在改名
    } else {
        var item = aEle[0];
        var box = $S('.name', item)[0];
        var span = $S('span', box)[0];
        var inp = $S('input', box)[0];
        span.style.display = 'none';
        inp.style.display = 'block';
        inp.value = span.innerHTML;
        inp.focus();
    }
    ev.cancelBubble = true;
}
//鼠标按下时，正在重命名的情况
addEvent(document, 'mousedown', function () {
    if (isRename) {
        //如果正在重命名
        renameFileEvent();
    }
});
//按下回车键
addEvent(document, 'keydown', function (ev) {
    if (isRename && ev.keyCode === 13) {
        renameFileEvent();
    }
});
//重命名公用函数
function renameFileEvent() {
    var ele = whoSelect()[0];
    var _id = ele.dataset.fileId; //注意转成数字
    var box = $S('.name', ele)[0];
    var span = $S('span', box)[0];
    var inp = $S('input', box)[0];
    var v = inp.value.trim();
    if (v.length === 0 || v === span.innerHTML) {
        inp.style.display = 'none';
        span.style.display = 'inline';
        render();
    }else {
        ajax({
            method: 'post',
            url: '/api/data/rename',
            data: {
                name: v,
                _id: _id,
                pid: currentPid
            },
            success: function(result){
                if( !result.code ){
                    tipsFn('ok', result.message);
                }else{
                    tipsFn('err', result.message);
                }
                render();
            }
        })
    }
    isRename = false;
}


(function(){
    /*
     * 文件夹删除
     * */
    var dele = $S('.dele', toolBarLeft)[0];
    addEvent(dele, 'mouseup', function () {
        var aEle = whoSelect();
        if (aEle.length === 0) {
            tipsFn('err', '请选择文件');
        } else {
            showConfirm();
        }
    });
    //显示删除提示框和遮罩层

    //弹出提示框元素
    var bk = $S('.g-bk')[0];
    var confirm = $S('.g-confirm')[0];
    var okBtn = $S('.ok', confirm)[0];
    var cancelBtn = $S('.cancel', confirm)[0];
    var closeBtn = $S('.g-confirm-close', confirm)[0];

    function showConfirm() {
        bk.style.display = 'block';
        confirm.style.display = 'block';
        confirm.style.left = (window.innerWidth - confirm.offsetWidth) / 2 + 'px';
        confirm.style.top = (window.innerHeight - confirm.offsetHeight) / 2 + 'px';
        window.onresize = function(){
            confirm.style.left = (window.innerWidth - confirm.offsetWidth) / 2 + 'px';
            confirm.style.top = (window.innerHeight - confirm.offsetHeight) / 2 + 'px';
        }
    }
    //确定 按钮删除选中的文件夹
    addEvent(okBtn, 'click', removeDoc);
    addEvent(cancelBtn, 'click', hideConfirm);
    addEvent(closeBtn, 'click', hideConfirm);
    //确定按钮删除文件
    function removeDoc(ev) {
        var aEle = whoSelect();
        var removeIds = [];
        for (var i = 0; i < aEle.length; i++) {
            var id = aEle[i].dataset.fileId;
            removeIds.push(id);
        }
        ajax({
            method: 'post',
            url: '/api/data/remove',
            data: {
                removeIds: JSON.stringify(removeIds)
            },
            success: function(result){
                success(result);
            }
        })
        render();
        hideConfirm(ev);
        changeAllBtnStatus();
        window.onresize = null;
        ev.cancelBubble = true;
    }
    //隐藏删除提示框和遮罩层
    function hideConfirm(ev) {
        confirm.style.display = 'none';
        bk.style.display = 'none';
        window.onresize = null;
        ev.cancelBubble = true;
    } 
})();


//移动文件夹提示框
(function(){
    var gMoveConfirm = $S('.g-move-confirm')[0];
    var treeTitle = $S('.tree-title', gMoveConfirm)[0];
    var treeWrap = $S('.tree-wrap', gMoveConfirm)[0];
    var treeMenu = $S('.tree-menu', gMoveConfirm)[0];
    var moveId = '';
    /*
     * 文件夹移动
     * */
    var move = $S('.move', toolBarLeft)[0];
    addEvent(move, 'mouseup', function () {
        var aEle = whoSelect();
        if (aEle.length === 0) {
            tipsFn('err', '请选择文件');
        } else {
            showConfirm();
            //渲染弹窗文件列表
            renderConfirmTree();
        }
    });
    //显示移动文件夹提示框和遮罩层

    //弹出提示框元素
    var bk = $S('.g-bk')[0];
    var confirm = $S('.g-move-confirm')[0];
    var okBtn = $S('.ok', confirm)[0];
    var cancelBtn = $S('.cancel', confirm)[0];
    var closeBtn = $S('.g-move-confirm-close', confirm)[0];

    function showConfirm() {
        bk.style.display = 'block';
        confirm.style.display = 'block';
        confirm.style.left = (window.innerWidth - confirm.offsetWidth) / 2 + 'px';
        confirm.style.top = (window.innerHeight - confirm.offsetHeight) / 2 + 'px';
        window.onresize = function(){
            confirm.style.left = (window.innerWidth - confirm.offsetWidth) / 2 + 'px';
            confirm.style.top = (window.innerHeight - confirm.offsetHeight) / 2 + 'px';
        }
    }
    //确定 按钮删除选中的文件夹
    addEvent(okBtn, 'click', moveDoc);
    addEvent(cancelBtn, 'click', hideConfirm);
    addEvent(closeBtn, 'click', hideConfirm);
    //确定按钮删除文件
    function moveDoc(ev) {
        var seleEle = whoSelect();
        var selectIds = [];
        //如果没有选中要移入的文件夹
        if(moveId === ''){
            hideConfirm(ev);
        }else{
            // seleEle.forEach(function(item){
                // var id = item.dataset.fileId;
                // if(id === moveId){
                //     hideConfirm(ev);
                //     tipsFn('err', '文件不能移入到本身')
                //     return;
                // }
                // selectIds.push(id);
            // })
            for(var i = 0;i < seleEle.length;i++){
                var item = seleEle[i];
                var id = item.dataset.fileId;
                if(id === moveId){
                    hideConfirm(ev);
                    tipsFn('err', '文件不能移入到本身')
                    return;
                }
                selectIds.push(id);
            }
            console.log(selectIds)
            ajax({
                method: 'post',
                url: '/api/data/move',
                data: {
                    upId: moveId,
                    selectId: JSON.stringify(selectIds)
                },
                success: function(result){
                    success(result);
                }
            })
        }
    }
    //隐藏删除提示框和遮罩层
    function hideConfirm(ev) {
        confirm.style.display = 'none';
        bk.style.display = 'none';
        window.onresize = null;
        ev.cancelBubble = true;
    } 
    //渲染列表树
    
    function renderConfirmTree(){
        var pid = pid || currentPid;
        ajax({
            method: 'get',
            url: '/api/data/getTree',
            data: {
                pid: pid
            },
            success: function(result){
                var data = result.data;
                if(data.length === 0){
                    $S('.ico', treeTitle)[0].style.display = 'none';
                    removeClass(treeTitle, 'tree-contro-list');
                    treeWrap.innerHTML = treeFileHtml(data);  //渲染列表
                }else{
                    $S('.ico', treeTitle)[0].style.display = 'inline';
                    if(treeTitle.on || treeTitle.on === undefined){
                        addClass(treeTitle, 'tree-contro-list');
                    }else{
                        addClass(treeTitle, 'tree-contro');
                    }
                    treeWrap.innerHTML = treeFileHtml(data);  //渲染列表
                    treeWrap.querySelector('ul').style.display = 'block';
                    $S('.tree-title', treeMenu)[0].on = true;
                    var treeTitles = $S('.tree-title', treeMenu);
                }
                console.log(treeWrap)
            }
        })
        function treeFileHtml(data, id){
            var id = id || null;
            var children = getChildren(data, id);
            var sHtml = '<ul style="display: none;">';
            children.forEach(function(item){
                var level = getLevelById(data, item._id)
                var pl = level*14 + 'px';
                if(item._id === currentPid){
                    removeClass($S('.tree-title', treeMenu)[0], 'tree-nav');
                }
                if(currentPid === 'null'){
                    addClass($S('.tree-title', treeMenu)[0], 'tree-nav');
                }
                var triangleClass = '';
                var displayStyle = 'display:none';
                if(hasChildren(data, item._id)){
                    triangleClass = 'tree-contro';
                    displayStyle = 'display:inline'
                }
                sHtml += `
                    <li>
                        <div class="tree-title ${triangleClass}" data-file-id=${item._id}  style="padding-left:${pl}">
                            <span>
                                <strong class="ellipsis">${item.name}</strong>
                                <i class="ico" style="${displayStyle}"></i>
                            </span>
                        </div>
                        ${treeFileHtml(data, item._id)}
                    </li>
                `;
            })
            sHtml += '</ul>';
            return sHtml;
        }
    }
    //事件委托、点击文件列表渲染
    addEvent(treeMenu, 'click', function (ev) {
        var target = getSelector(ev.target, '.tree-title');
        if (target !== null) {
            //找到 tree-title 元素
            var fileId = target.dataset.fileId; //target.dataset.fileId是字符串
            if (ev.target.className.indexOf('ico') !== -1) {
                if (!target.on) {   //true表示当前列表为展开状态
                    //展开列表
                    removeClass(target, 'tree-contro'); 
                    addClass(target, 'tree-contro-list');
                    next(target).style.display = 'block';
                } else {
                    //隐藏
                    if (hasChildren(fileId)) {
                        removeClass(target, 'tree-contro-list'); 
                        addClass(target, 'tree-contro');
                    }
                    next(target).style.display = 'none';
                }
                target.on = !target.on;
            } else {
                var treeList = Array.from($S('.tree-title', treeMenu));
                treeList.forEach(function(item){
                    removeClass(item, 'tree-nav');
                })
                addClass(target, 'tree-nav');
                moveId = fileId;
            }
        }
});
})()


//ajax获取完数据执行函数
function success(result){
    if( !result.code ){
        tipsFn('ok', result.message);
    }else{
        tipsFn('err', result.message);
    }
    render();
}


/*
 * 右键菜单
 * */
var contextmenu = $S('contextmenu')[0];
var ctxRemove = $S('.ctx-remove', contextmenu)[0];
var ctxMove = $S('.ctx-move', contextmenu)[0];
var ctxRename = $S('.ctx-rename', contextmenu)[0];

addEvent(filecon, 'contextmenu', function (ev) {
    var target = getSelector(ev.target, '.m-file');
    if (target) {
        var seleEle = whoSelect();
        if (seleEle.indexOf(target)) {
            //如果之前选中的文件中没有右键选中的文件
            allNotSelect();
            addClass(target, 'checked');
        }
        context.style.display = 'block';
        context.style.left = ev.pageX + 'px';
        context.style.top = ev.pageY + 'px';
    }
});
//右键菜单删除按钮
addEvent(ctxRemove, 'click', function (ev) {
    var aEle = whoSelect();
    if (aEle.length === 0) {
        tipsFn('err', '请选择文件');
    } else {
        showConfirm();
    }
});
//右键菜单重命名按钮
addEvent(ctxRename, 'click', function (ev) {
    renameEvent(ev);
    context.style.display = 'none';
});
//点击页面隐藏右键菜单
addEvent(document, 'click', function () {
    context.style.display = 'none';
});

/*
 * document mousedown 阻止默认行为
 * */
addEvent(document, 'mousedown', function (ev) {
    ev.preventDefault();
});

/*
 * 阻止右键菜单
 * */
addEvent(document, 'contextmenu', function (ev) {
    ev.preventDefault();
});
// /*
//  * 退出登录
//  * */
// var logOut = $S('.g-info')[0];
// var logOutBtn = $S('a', logOut)[0];
// addEvent(logOutBtn, 'click', function () {
//     location.href = '/';
// });
