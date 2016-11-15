'use strict';

/*
 * 创建单个文件夹(创建新文件夹的时候)
 * */
function createFile() {
    isCreateFile = true; //正在创建文件夹
    var file = document.createElement('div');
    file.className = 'm-cfile';
    file.innerHTML = '\n        <span class="checkbox"></span>\n        <div class="img"><span class="img-file f-inbl"></span></div>\n        <div class="name">\n            <input type="text">\n        </div>\n    ';
    filecon.insertBefore(file, aFile[0]);
    var inp = $('input', file)[0];
    inp.focus();
}
/*
 * 生成单个文件夹(渲染页面的时候)
 * */
function fileHtml(data) {
    var fileHtml = '\n        <div class="m-file" data-file-id="' + data.id + '">\n            <span class="checkbox"></span>\n            <div class="img"><span class="img-' + data.type + ' f-inbl"></span></div>\n            <div class="name">\n                <span style="display: block;">' + data.name + '</span>\n                <input style="display: none;" type="text">\n            </div>\n        </div>\n    ';
    return fileHtml;
}
/*
 * 文件列表
 * id:需要渲染的文件夹的id
 * */
function fileList(datas, id) {
    var children = getSon(id);
    var listHtml = '<ul style="display: none;">';

    children.forEach(function (item, index) {
        var level = getLevelById(item.id);
        var className = hasSon(item.id) ? "tree-contro" : "tree-contro-none";
        var c = hasSon(item.id) ? "" : "tree-contro-none";

        var pl = level * 14 + 'px';

        listHtml += '\n            <li>\n                <div class="tree-title ' + c + '" data-file-id=' + item.id + ' data-file-class=' + className + ' style="padding-left:' + pl + '">\n                    <span>\n                        <strong class="ellipsis">' + item.name + '</strong>\n                        <i class="ico"></i>\n                    </span>\n                </div>\n                ' + fileList(datas, item.id) + '\n            </li>\n        ';
    });
    listHtml += '</ul>';
    return listHtml;
}
/*
 * 文件列表定位文件夹并展开对应的子文件夹列表
 * id:需要渲染的文件夹的id,要清除全选按钮的状态
 * */
function positionTree(id) {
    var posElem = document.querySelector(".tree-title[data-file-id='" + id + "']");
    var className = posElem.dataset.fileClass;
    var elements = $('.tree-title');
    elements = Array.from(elements);

    elements.forEach(function (item) {
        removeClass(item, 'tree-nav');
    });
    posElem.on = true;
    addClass(posElem, 'tree-nav');
    addClass(posElem, className);
    next(posElem).style.display = 'block';
    removeClass(all, 'checked'); //要清除全选按钮的状态
}
/*
 * 文件列表添加文件夹
 * */
function createFileList(id, data) {
    var posElem = document.querySelector(".tree-title[data-file-id='" + id + "']");
    var oUl = next(posElem);
    var level = getLevelById(data.id);
    var pl = level * 14 + 'px';
    var oLi = document.createElement('li');
    oLi.innerHTML = '\n    <li>\n        <div class="tree-title tree-contro-none" data-file-id=' + data.id + ' data-file-class="tree-contro-none" style="padding-left:' + pl + '">\n            <span>\n                <strong class="ellipsis">' + data.name + '</strong>\n                <i class="ico"></i>\n            </span>\n        </div>\n        <ul style="display: none;"></ul>\n    </li>\n    ';
    oUl.insertBefore(oLi, oUl.children[0]); //添加元素
    posElem.setAttribute('data-file-class', 'tree-contro');
    removeClass(posElem, 'tree-contro-none');
    addClass(posElem, 'tree-contro'); //添加箭头
}
/*
 * 设置列表是否展开开关
 * */
function isShowTree() {
    var treeMenu = $('.tree-menu')[0];
    var elements = $('.tree-title', treeMenu);
    elements = Array.from(elements);

    elements.forEach(function (item) {
        item.on = false;
    });
}
/*
 * 检测是否有class，有删除,没有添加
 * */
function toggleClass(ele, classNames) {
    if (hasClass(ele, classNames)) {
        removeClass(ele, classNames);
        return false;
    } else {
        addClass(ele, classNames);
        return true;
    }
}
/*
 * 找到被选中的元素
 * */
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
/*
 * 检测是否全选
 * */
function isAll() {
    var arr = whoSelect();
    if (arr.length === aFile.length && aFile.length !== 0) {
        return true;
    } else {
        return false;
    }
}
/*
 * 全选状态
 * */
function allSelect() {
    addClass(all, 'checked');
    for (var i = 0; i < aFile.length; i++) {
        addClass(aFile[i], 'checked');
    }
}
/*
 * 非全选状态(全部不选中)
 * */
function allNotSelect() {
    removeClass(all, 'checked');
    for (var i = 0; i < aFile.length; i++) {
        removeClass(aFile[i], 'checked');
    }
}
/*
 * 检查是否重名(检测id目录下的文件名是否和value重复)
 * */
function isNameRepeat(value, id) {
    var arr = getSon(id);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].name === value) {
            return true;
        }
    }
    return false;
}
/*
 * 封装小提醒 err ok warn
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

/*
 * 鼠标抬起检测函数
 * mObj 移动的元素
 * */
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
//检测文件名是否重复  ,  true是重名 false：没有重名
function isNameRepeat(v, id) {
    var id = id || currentId;
    for (var i = 0; i < datas.length; i++) {
        if (datas[i].pid === id && v === datas[i].name) {
            return true;
        }
    }
    return false;
}