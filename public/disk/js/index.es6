//根据数据生成文件列表
var filecon = $('.g-filecon')[0]; //文件夹容器
var filewrap = $('.g-filewrap')[0];
var all = $('#all');

//var aFile = filecon.children; //获取文件夹

var toolBar = $('.g-toolbar')[0];
var toolBarLeft = $('.g-btn-left')[0];
var toolBtn = $('.u-btn', toolBarLeft);  //功能按钮
var path = $('.g-path')[0];  //路径
var currentId = 0;   //当前文件夹的id(当前所展示的文件夹的pid)
var isCreateFile = false;   //没有正在创建的文件夹
var isRename = false;  //没有正在重命名的文件夹
var ele = [];  //当前选中的元素
var dragEle = null;   //拖拽时移入到哪个元素
var isMove = false;   //是否在元素上移动，否的话是false
//拖拽时显示的元素
var dragmove = $('.drag-move')[0];
var dragmoveIcon = $('.icons', dragmove)[0];
var sum = $('.sum', dragmove)[0];
//弹出提示框
var bk = $('.g-bk')[0];
var confirm = $('.g-confirm')[0];
var okBtn = $('.ok', confirm)[0];
var cancelBtn = $('.cancel', confirm)[0];
var closeBtn = $('.g-confirm-close', confirm)[0];
//右键菜单
var context = $('.contextmenu')[0];
var contextBtn = $('a', context);



/*
* 文件列表
* */
//展开、收起文件列表
(function(){
    var toolBtnList = $('.u-btn-list', toolBar)[0];  //功能按钮
    var fileShow = $('.g-file-show')[0];
    toolBtnList.isShow = true;  //是否展开？展开true

    addEvent(toolBtnList, 'click', show);

    show();  //展开、收起文件列表
    function show(){
        if(!toolBtnList.isShow){
            fileShow.style.left = 0;
        }else{
            fileShow.style.left = '165px';
        }
        toolBtnList.isShow = !toolBtnList.isShow;
    }
})();
//渲染文件树列表
var treeMenu = $('.tree-menu')[0];
renderTree(currentId);
function renderTree(id){
    var id = id || currentId;
    treeMenu.innerHTML = fileList(datas, -1);
    $('ul', treeMenu)[0].style.display = 'block';
    positionTree(id);
}
//事件委托、点击文件列表渲染
addEvent(treeMenu, 'click', function(ev){
    var target = getSelector(ev.target, '.tree-title');
    if(target !== null){   //找到 tree-title 元素
        var fileId = parseInt(target.dataset.fileId);   //target.dataset.fileId是字符串
        var className = target.dataset.fileClass;
        if(ev.target.className.indexOf('ico') !== -1){
            if(!target.on){   //展开列表
                addClass(target, className);
                next(target).style.display = 'block';
            }else{   //隐藏
                if(hasSon(fileId)){   //如果有子元素,删除class
                    removeClass(target, className);
                }
                next(target).style.display = 'none';
            }
            target.on = !target.on;
            //return;   //不渲染右侧文件，只展开文件列表
        }else{
            currentId = fileId;
            positionTree(currentId);
            renderFile(currentId);
        }
    }
    renderNav(currentId);
})



/*
 * 渲染面包屑导航
 * */
function renderNav(id){
    var pList = getParents(id);     //获取到所有父级信息
    if(getInfo(id)){
        pList.unshift(getInfo(id));
    }
    path.innerHTML = '';
    var index = 10;
    for(var i=pList.length-1; i>=0; i--){
        var a = document.createElement('a');
        a.href = 'javascript:;';
        a.fileId = pList[i].id;
        a.innerHTML = pList[i].name;
        a.style.zIndex = index--;
        a.onclick = function(){
            currentId = this.fileId;
            positionTree(currentId);  //定位文件列表
            render(currentId);  //渲染文件
        }
        path.appendChild(a);
    }
    a.style.backgroundPosition = 'right -200px';
}
/*
* 文件夹
* */
//渲染文件夹
var aFile = $('.m-file', filecon); //获取文件夹
function renderFile(id){
    var sHtml = '';
    datas.forEach(function(item, index){
        if(item.pid === id)
            sHtml += fileHtml( item );
    })
    filecon.innerHTML = sHtml;
    //if($('.dragselect')[0]){   //小概率事件，非常小的几率出现拖拽选择框不消失的情况，渲染时删除
    //    document.body.removeChild($('.dragselect')[0]);
    //}
}
//文件夹添加点击事件,事件委托
addEvent(filecon, 'mouseup', function(ev){
    var target = ev.target;
    if(getSelector(ev.target, '.m-file') && !isMove && ev.button === 0){   //如果不是移动时在文件夹上抬起并且是鼠标左键
        //console.log('up')
        target = getSelector(ev.target, '.m-file');
        currentId = parseInt(target.dataset.fileId);
        render(currentId);  //渲染右侧文件
        positionTree(currentId);  //定位文件列表
        document.onmousemove = document.onmouseup = null;
    }
    isMove = false;
});

/*
* 通过指定的id渲染文件区域，文件导航区域，树形菜单
* */
render(currentId);  //渲染右侧文件
function render(id){
    var id = id || currentId;
    renderFile(id);  //渲染文件夹
    renderNav(id);   //渲染面包屑导航
    //checkbox点击事件
    var checkbox = $('.checkbox', filecon);
    for(let i = 0;i < checkbox.length;i++){
        addEvent(checkbox[i], 'mouseup', function(ev){
            ev.stopPropagation();
            var p = aFile[i];
            toggleClass(p, 'checked');
            //改变全选按钮状态
            changeAllBtnStatus();
            document.onmousemove = document.onmouseup = null;
        });
    }
}
//改变全选按钮状态
function changeAllBtnStatus(){
    if(isAll()){   //如果全选
        addClass(all, 'checked');
    }else{   //没有全选
        removeClass(all, 'checked');
    }
}
/*
* 全选按钮点击事件
* */
addEvent(all, 'click', function(){
    if(aFile.length !== 0){
        toggleClass(this, 'checked');
        if(hasClass(this, 'checked')){
            allSelect();
        }else{
            allNotSelect();
        }
    }
})
/*
* 新建文件夹点击事件和键盘事件
* */
var mkdir = $('.mkdir', toolBarLeft)[0];
//var fileShow = $('g-file-show')[0];
addEvent(mkdir, 'mouseup', function(){
    if(!isRename){   //如果没有正在重命名的文件夹
        createFile();    //创建文件夹的时候已经设置正在创建文件夹开关
        allNotSelect();
    }else {
        tipsFn('err', '有文件正在重命名');
    }
})
//鼠标按下时，删除正在创建的文件夹或者生成文件夹
addEvent(document, 'mousedown', function(){
    if(isCreateFile) {   //如果正在创建文件夹
        createFileEvent()
    }
})
// 新建文件夹键盘事件
addEvent(document, 'keydown', function(ev){
    if(isCreateFile && ev.keyCode === 13) {   //如果正在创建文件夹
        createFileEvent()
    }
})
//键盘事件和点击事件公用函数
function createFileEvent(){
    var cFile = $('.m-cfile', filecon)[0];
    var value = $('input', cFile)[0].value.trim();
    if(cFile !== undefined){  //如果存在创建的文件夹(不是正在重命名的情况)
        filecon.removeChild(cFile);
    }
    isCreateFile = false;   //创建成不成功都设置为false
    if (value !== '') {  //输入框有内容,创建文件夹
        if(isNameRepeat(value, currentId)){
            tipsFn('err', '文件夹命名冲突');
        }else{
            var obj = {
                id: getMaxId() + 1,
                pid: currentId,
                name: value,
                type: 'folder'
            }
            datas.unshift(obj);
            render(currentId);
            createFileList(currentId, obj);
            tipsFn('ok', '创建文件夹成功');
        }
    }
}
/*
* 删除文件夹点击事件
* */

/*
* 拖拽框选择文件夹
* */
addEvent(filewrap, 'mousedown', function(ev){
    if(ev.button === 0){     //如果不是鼠标左键，不执行
        var disX = ev.pageX;
        var disY = ev.pageY;
        var div = document.createElement('div');
        div.className = 'dragselect';
        document.body.appendChild(div);
        document.onmousemove = function(ev){
            if(disX === ev.pageX && disY === ev.pageY){return;}
            var ev = ev || event;
            div.style.left = Math.min(ev.pageX, disX) + 'px';
            div.style.top = Math.min(ev.pageY, disY) + 'px';
            div.style.width = Math.abs(ev.pageX - disX) + 'px';
            div.style.height = Math.abs(ev.pageY - disY) + 'px';
            for(var i = 0;i < aFile.length;i++){   //碰撞检测
                if(pz(div, aFile[i])){
                    addClass(aFile[i], 'checked');
                }else{
                    removeClass(aFile[i], 'checked');
                }
            }
            changeAllBtnStatus();
        }
        document.onmouseup = function(){
            document.body.removeChild(div);
            document.onmousemove = document.onmouseup = null;
        }
        ev.preventDefault();
    }
});

//addEvent(filecon, 'mousedown', function(ev){
//
//});


/*
* 重命名
* */
var rename = $('.rename', toolBarLeft)[0];
addEvent(rename, 'mouseup', renameEvent);
function renameEvent(ev){
    isRename = true;   //有文件夹正在改名
    var aEle = whoSelect();
    if(aEle.length !== 1){
        if(aEle.length === 0){
            tipsFn('err', '请选择文件');
        }else{
            tipsFn('err', '只能对单个文件夹重命名');
        }
        isRename = false;   //没有文件夹正在改名
    }else{
        var item = aEle[0];
        var box = $('.name', item)[0];
        var span = $('span', box)[0];
        var inp = $('input', box)[0];
        span.style.display = 'none';
        inp.style.display = 'block';
        inp.value = span.innerHTML;
        inp.focus();
    }
    ev.cancelBubble = true;
}
//鼠标按下时，正在重命名的情况
addEvent(document, 'mousedown', function(){
    if(isRename) {   //如果正在重命名
        renameFileEvent();
    }
});
//按下回车键
addEvent(document, 'keydown', function(ev){
   if(isRename && ev.keyCode === 13){
       renameFileEvent();
   }
});
//重命名公用函数
function renameFileEvent(){
    var ele = whoSelect()[0];
    var id = parseInt(ele.dataset.fileId);  //注意转成数字
    var box = $('.name', ele)[0];
    var span = $('span', box)[0];
    var inp = $('input', box)[0];
    var v = inp.value.trim();
    if(v.length === 0 || v === span.innerHTML){
        inp.style.display = 'none';
        span.style.display = 'inline';
        render();
    }else if (isNameRepeat(v)) {
        tipsFn('err', '文件夹命名冲突');
        render();
    }else{
        var data = getInfo(id);
        data.name = v;
        render();
        var posElem = document.querySelector(".tree-title[data-file-id='"+id+"']");
        var strong = posElem.getElementsByTagName('strong')[0];
        strong.innerHTML = v;
        tipsFn('ok', '更名成功');
    }
    isRename = false;
}
/*
* 文件夹删除
* */
var dele = $('.dele', toolBarLeft)[0];
addEvent(dele, 'mouseup', function(){
    var aEle = whoSelect();
    if(aEle.length === 0){
        tipsFn('err', '请选择文件');
    }else{
        showConfirm();
    }
});
//显示删除提示框和遮罩层
function showConfirm(){
    bk.style.display = 'block';
    confirm.style.display = 'block';
    confirm.style.left = (window.innerWidth - confirm.offsetWidth) / 2 + 'px';
    confirm.style.top = (window.innerHeight - confirm.offsetHeight) / 2 + 'px';
}
//确定 按钮删除选中的文件夹
addEvent(okBtn, 'click', removeDoc);
//确定按钮删除文件
function removeDoc(ev){
    var aEle = whoSelect();
    for(var i = 0;i < aEle.length;i++){
        var id = parseInt(aEle[i].dataset.fileId);
        removeChild(getChild(id));  //删除元素和所有子孙信息
        var posElem = document.querySelector(".tree-title[data-file-id='"+id+"']");
        var oLi = posElem.parentNode;
        oLi.parentNode.removeChild(oLi);
    }
    render();
    hideConfirm(ev);
    changeAllBtnStatus();
    ev.cancelBubble = true;
}
//隐藏删除提示框和遮罩层
function hideConfirm(ev){
    confirm.style.display = 'none';
    bk.style.display = 'none';
    ev.cancelBubble = true;
}

/*
* 文件夹拖拽移动到
* */
addEvent(filecon, 'mousedown', function(ev){
    if(ev.button !== 0){return;}  //如果不是鼠标左键按下，不运行
    var target = getSelector(ev.target, '.m-file');
    if(target !== null){    //如果鼠标点击的是文件夹
        ev.stopPropagation();  //防止点击文件时产生拖拽选择框
        var disX = ev.pageX;
        var disY = ev.pageY;
        //if(isMove){return;}
        document.onmousemove = function(ev){
            if(disX === ev.pageX && disY === ev.pageY){return;}
            //console.log('move')
            isMove = true;         //触发了拖拽移动
            if(Math.abs(ev.pageX - disX) >15 || Math.abs(ev.pageY - disY) > 15){
                if(!hasClass(target, 'checked')){     //如果元素没有被选中，只选中元素本身
                    allNotSelect();
                    addClass(target, 'checked');
                }
                var aEle = whoSelect();
                dragmove.style.left = ev.pageX + 15 + 'px';
                dragmove.style.top = ev.pageY + 15 + 'px';
                dragmove.style.display = 'block';
                sum.innerHTML = aEle.length;
                var len = aEle.length > 4 ? 4 : aEle.length;
                for(var i = 0;i < len;i++){
                    var span = document.createElement('span');
                    span.className = 'icon';
                    span.style.left = i * 5 + 'px';
                    span.style.top = i * 3 + 'px';
                    dragmoveIcon.appendChild(span);
                }
                document.onmousemove = function(ev){
                    dragmove.style.left = ev.pageX + 15 + 'px';
                    dragmove.style.top = ev.pageY + 15 + 'px';
                }
            }
        }
        document.onmouseup = function(ev){
            //if(!isMove){return;}
            console.log(disX,ev.pageX,disY,ev.pageY)
            if(Math.abs(ev.pageX - disX) < 5 && Math.abs(ev.pageY - disY) < 5){
                console.log(disX - ev.pageX, disY - ev.pageY)
                currentId = parseInt(target.dataset.fileId);
                render();
                renderTree();
                document.onmousemove = document.onmouseup = null;
                return;
            }
            dragmove.style.display = 'none';
            dragmoveIcon.innerHTML = '';
            for(var i = 0;i < aFile.length;i++){
                if(up(ev, aFile[i])){
                    var upEle = aFile[i];
                    break;
                }
            }
            var seleEle = whoSelect();
            if(upEle && seleEle.indexOf(upEle) === -1){     //如果有移入的元素并且移入的元素不是选中的元素
                var upId = parseInt(upEle.dataset.fileId);
                for(var i = 0;i < seleEle.length;i++){
                    var item = seleEle[i];
                    var id = parseInt(item.dataset.fileId);
                    var box = $('.name', item)[0];
                    var span = $('span', box)[0];
                    var v = span.innerHTML;
                    if(isNameRepeat(v, upId)){
                        tipsFn('err', '有重名文件，不能移入');
                        continue;
                    }else{
                        var data = getInfo(id);
                        data.pid = upId;
                        tipsFn('ok', '文件移入成功');
                    }
                }
                //isMove = false;
                render();
                renderTree();
            }
            document.onmousemove = document.onmouseup = null;
            //console.log('document-up')
            isMove = false;
        }
        ev.preventDefault();
    }
});
/*
* 右键菜单
* */
addEvent(filecon, 'contextmenu', function(ev){
    var target = getSelector(ev.target, '.m-file');
    if(target){
        var seleEle = whoSelect();
        if(seleEle.indexOf(target)){   //如果之前选中的文件中没有右键选中的文件
            allNotSelect();
            addClass(target, 'checked');
        }
        context.style.display = 'block';
        context.style.left = ev.pageX + 'px';
        context.style.top = ev.pageY + 'px';
    }
});
//右键菜单删除按钮
addEvent(contextBtn[1], 'click', function(ev){
    var aEle = whoSelect();
    if(aEle.length === 0){
        tipsFn('err', '请选择文件');
    }else{
        showConfirm();
    }
});
//右键菜单重命名按钮
addEvent(contextBtn[3], 'click', function(ev){
    renameEvent(ev);
    context.style.display = 'none';
});
//点击页面隐藏右键菜单
addEvent(document, 'click',function(){
    context.style.display = 'none';
});

/*
* document mousedown 阻止默认行为
* */
addEvent(document, 'mousedown', function(ev){
    ev.preventDefault();
});

/*
* 阻止右键菜单
* */
addEvent(document, 'contextmenu', function(ev){
   ev.preventDefault();
});
/*
* 退出登录
* */
var logOut = $('.g-info')[0];
var logOutBtn = $('a', logOut)[0];
addEvent(logOutBtn, 'click', function(){
    removeCookie('userInfo');
})