/*
* 获取数据中最大的id
* */
function getMaxId(){
    var maxId = 0;
    for (var i=0; i<datas.length; i++) {
        if ( datas[i].id > maxId ) {
            maxId = datas[i].id;
        }
    }
    return maxId;
}
/*
* 通过id获得信息
* */
function getInfo(id){
    for(var i = 0;i < datas.length;i++){
        if(datas[i].id === id){
            return datas[i];
        }
    }
}
/*
* 获取所有子节点
* */
function getSon(id){
    var arr = [];
    for(var i = 0;i < datas.length;i++){
        if(datas[i].pid === id){
            arr.push(datas[i]);
        }
    }
    return arr;
}
/*
* 获得包括id和所有子孙id
* */
function getChild(id){
    var arr = [id];
    getChildSin(id);
    return arr;
    function getChildSin(id){    //获得所有子孙id
        for(var i = 0;i < datas.length;i++){
            if(datas[i].pid === id){
                arr.push(datas[i].id);
                getChildSin(datas[i].id);
            }
        }
    }
}

//function getChild(id){
//    var arr = [];
//    for(var i = 0;i < datas.length;i++){
//        if(datas[i].pid === id){
//            arr.push(datas[i].id);
//            arr = arr.concat(getChild(datas[i].id));
//        }
//    }
//    return arr;
//}

/*
* 删除id对应项以及所有子孙
* */
function removeChild(arr){
    for(var i = 0;i < arr.length;i++){
        for(var j = 0;j < datas.length;j++){
            if(datas[j].id === arr[i]){
                datas.splice(j, 1);
            }
        }
    }
}
/*
 * 获取父级
 * */
function getParent(id) {
    var info = getInfo(id);
    if (info) {
        return getInfo(info.pid);
    }
}
/*
* 获取所有父级
* */
function getParents(id){
    var arr = [];
    var p = getParent(id);
    if(p){
        arr.push(p);
        arr = arr.concat(getParents(p.id));
    }
    return arr;
}
/*
* 更改元素父节点
* */
function changeParent(currentId, pid){
    var data = getInfo(currentId);
    var arr = getSon(pid);   //获取所有子节点
    for(var i = 0;i < arr.length;i++){     //检测有没有重名
        if(arr[i].name === data.name){
            return false;
        }
    }
    data.pid = pid;
    return true;
}
/*
* 通过id获取在数据中是第几层(从1开始)
* */
function getLevelById(id){
    var arr = getParents(id);
    return getParents(id).length+1;
}
/*
 * 通过id得到是否有子节点
 * */
function hasSon(id){
    var len = getSon(id).length;
    return len === 0?false : true;
}
