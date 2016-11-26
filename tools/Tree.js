function Tree(data){
    this.data = data;
}
//获取单个文件或文件夹信息
Tree.prototype.get = function(id) {
    var info = null;
    for (var i=0; i<this.data.length; i++) {
        if (this.data[i]._id.toString() == id) {
            info = this.data[i];
            break;
        }
    }
    return info;
};
//获取文件或文件夹的父级信息
Tree.prototype.getParent = function(id) {
    var info = this.get(id);
    var parent = null;
    if (info && info.pid) {
        parent = this.get(info.pid);
    }
    return parent;
};
//获取文件或文件夹的祖先信息
Tree.prototype.getParents = function(id){
    var parent = this.getParent(id);
    var arrParents = [];

    if(parent){
        arrParents.unshift(parent);
        arrParents = this.getParents(parent._id).concat(arrParents)
    }

    return arrParents;
}
//获取文件夹一级目录下所有子文件
Tree.prototype.getChildren = function(id) {
    var children = [];
    var data = this.data;
    for (var i=0; i<data.length; i++) {
        //data[i].pid是object
        if(data[i].pid == id && data[i].isRemove === false){
            children.push(data[i]);
        }
    }
    return children;
};
//id目录下是否有重名文件
Tree.prototype.isNameRepeat = function(id, name){
    var children = this.getChildren(id);
    for (var i=0; i<children.length; i++) {
        if(children[i].name === name){
            return true;
        }
    }
    return false;
}
//pid目录下是否有重名文件(不包含自身)
Tree.prototype.isNameRepeatNotSelf = function(pid, id, name){
    var children = this.getChildren(pid);
    for (var i=0; i<children.length; i++) {
        if(children[i].name === name && children[i]._id !== id){
            return true;
        }
    }
    return false;
}
//获取id目录下的所有子孙元素
Tree.prototype.getSons = function(id){
    var data = this.data;
    var arr = [];
    for(var i = 0;i < data.length;i++){
        //console.log(data[i].pid, id)
        //console.log(typeof data[i].pid , typeof id)
        //console.log(data[i].pid == id)
        //console.log(String(id))
        if(data[i].pid == id){  //注意是==不是===
            arr.push(data[i]);
            arr = arr.concat(this.getSons(String(data[i]._id)));
        }
    }
    return arr;
}
//获取id目录下的所有子孙元素的_id(删除)
Tree.prototype.getSonsId = function(id){
    var data = this.data;
    var arr = [];
    for(var i = 0;i < data.length;i++){
        if(data[i].pid == id){  //注意是==不是===
            //console.log(data[i]._id)
            arr.push(String(data[i]._id));
            arr = arr.concat(this.getSonsId(String(data[i]._id)));
        }
    }
    return arr;
}
//获取id目录下所有没有被删除的文件夹
Tree.prototype.getFolderSons = function(id){
    var data = this.getSons(id);
    var arr = [];
    data.forEach(function(item){
        if(item.type === 'folder' && item.isRemove === false){
            arr.push(item);
        }
    })
    return arr;
}
//获取targetId是否是moveId的子集(移动到)
//targetId 要移动到的文件夹的id
//moveId 需要被移入的文件夹的id
Tree.prototype.isChild = function(moveId, targetId){
    var arr = this.getSonsId(moveId);
    for(var i = 0;i < arr.length;i++){
        var item = arr[i];
        if(item === targetId){
            return true;
        }
    }
    return false;
}

//Tree.prototype.getList = function(pid, type) {
//    var data = [];
//    for (var i=0; i<this.data.length; i++) {
//        if ( this.data[i].pid == pid && this.data[i].isRemove == false ) {
//
//            if (type === undefined) {
//                data.push(this.data[i]);
//            } else {
//                type = Boolean(type);
//                if ( this.data[i].type === type ) {
//                    data.push(this.data[i]);
//                }
//            }
//        }
//    }
//    return data;
//};

//获取所有没有被删除的MP3音乐文件
Tree.prototype.getMusic = function(){
    var data = this.data;
    var arr = [];
    data.forEach(function(item){
        if(item.type === 'mp3' && item.isRemove === false){
            arr.push(item);
        }
    })
    return arr;
}

//获取所有没有被删除的MP4音乐文件
Tree.prototype.getVideo = function(){
    var data = this.data;
    var arr = [];
    data.forEach(function(item){
        if(item.type === 'mp4' && item.isRemove === false){
            arr.push(item);
        }
    })
    return arr;
}

module.exports = Tree;
