//获取样式
function getStyle(obj,attr){
	if(obj.currentStyle){
		return obj.currentStyle[attr];    //低版本IE
	}else{
		return getComputedStyle(obj)[attr];  //标准浏览器
	}
}
/*
* 事件版运动框架(依赖tween.js)
*
* obj 对象
* attr 要改变的属性 string
* target 目标值 number
* duration 持续时间 ms
* method 运动形式，详情参考tween.js
* callback 回调函数
* obj.style[attr] = begin + speed * time
* */
function move(obj, attr , target, duration, method, callback){
	method = method || 'linear';
	clearInterval(obj[attr + 'Timer']);
	//起始值
	var begin = parseFloat(getStyle(obj, attr));
	//总运动值
	var count = target - begin;
	//当前时间
	var startTime = new Date().getTime();
	//速度
	var speed = count / duration;
	//引入tween函数
	var tween = Tween();

	obj[attr + 'Timer'] = setInterval(function(){
		//已过时间
		var time = new Date().getTime() - startTime;
		if(time > duration){
			time = duration;
			clearInterval(obj[attr + 'Timer']);
            obj[attr + 'Timer'] = null;
			//回调函数不能放在这，否则回调函数里如果改obj.style的话会被后面的覆盖掉
		}
		if(attr == 'opacity'){
			obj.style.opacity = tween[method](time, begin, count, duration);
			obj.style.filter = 'alpha(opacity='+tween[method](time, begin, count, duration)*100+')';
		}else{
			obj.style[attr] = tween[method](time, begin, count, duration) +'px';
		}

		//一定要放在这边判断
		//callback && callback();
		if(time == duration && typeof callback == 'function'){
			clearInterval(obj[attr + 'Timer']);
            obj[attr + 'Timer'] = null;
			callback();
		}

	},30);
}

/*
* 拖拽函数
* */
function drag(obj){
	obj.onmousedown = function(e){
		var disX = e.clientX - this.offsetLeft;
		var disY = e.clientY - this.offsetTop;

		document.onmousemove = function(e){
			obj.style.left = e.clientX - disX + 'px';
			obj.style.top = e.clientY - disY + 'px';
		}

		document.onmousedown = function(){
			return false;
		}

		document.onmouseup = function(){
			document.onmousemove = document.onkeydown = document.onkeyup = null;
		}
	}
}

/*
* 获取元素函数
* */
function $S(ele, obj){
	var obj = obj || document;
	if(ele.charAt() === '#'){
		return document.getElementById(ele.slice(1));
	}else if(ele.charAt() === '.'){
		return getElementsByClassName(obj, ele.slice(1));
	}else{
		return obj.getElementsByTagName(ele);
	}
}
//检测元素有没有对应的class名
function hasClass(obj, name){
    var classname = ' ' + obj.className + ' ';
    var name = ' ' + name + ' ';
    if( classname.indexOf(name) !== -1){
        return true;
    }else{
        return false;
    }
}
//getElementsByClassName
function getElementsByClassName(element, names) {
	if (element.getElementsByClassName) {
		return element.getElementsByClassName(names);
	} else {
		var aEls=element.getElementsByTagName('*');
		var arr=[];
		for(var i=0;i<aEls.length;i++){
			var aClass=aEls[i].className.split(' ');
			for(var j=0;j<aClass.length;j++){
				if(aClass[j]==names){
					arr.push(aEls[i]);
					break;
				}
			}
		}
		return arr;
	}
}

//添加className
function addClass(obj,className){
	//如果原来没有class
	if(obj.className==''){
		obj.className=className;
	}else{
		var arrClassName=obj.className.split(' ');
		var _index=arrIndexOf(arrClassName,className);
		if(_index == -1){
			//如果要添加的class在原来的class不存在
			obj.className+=' '+className;
		}
	}
	function arrIndexOf(arr ,v){
		for(var i=0;i<arr.length;i++){
			if(arr[i]==v){
				return i;
			}
		}
		return -1;
	}
}
//删除className
function removeClass(obj,className){
	if(obj.className!=''){
		var arrClassName=obj.className.split(' ');
		var _index=arrIndexOf(arrClassName,className);
		//如果有要移除的class
		if(_index != -1){
			arrClassName.splice(_index,1);
			obj.className=arrClassName.join(' ');
		}
	}
	function arrIndexOf(arr ,v){
		for(var i=0;i<arr.length;i++){
			if(arr[i]==v){
				return i;
			}
		}
		return -1;
	}
}
//事件绑定
function addEvent(obj,evname,fn){
	if(obj.addEventListener){
		obj.addEventListener(evname,fn,false);
	}else{
		obj.attachEvent('on'+evname, function(){
			fn.call(obj);
		});
	}
}
//事件取消
function removeEvent(obj,evname,fn){
	if(obj.removeEventListener){
		obj.removeEventListener(evname,fn,false);
	}else{
		obj.detachEvent('on'+evname, fn);
	}
}
//事件捕获查找符合条件的元素
function getSelector(obj, sele){
    if( sele.charAt(0) === "#" ){
        while(obj.id !== sele.slice(1)){
            obj = obj.parentNode;
        }
    }else if( sele.charAt(0) === "." ){
        while((obj && obj.nodeType !== 9) && !hasClass(obj,sele.slice(1))){
            obj = obj.parentNode;
        }
    }else{
        while(obj && obj.nodeType !== 9 && obj.nodeName.toLowerCase() !== sele){
            obj = obj.parentNode;
        }
    }

    return obj && obj.nodeType === 9  ? null : obj;
}
//查找下一元素
function next(obj){
    if(obj.nextElementSibling){
        return obj.nextElementSibling;
    }else{
        return obj.nextSibling;
    }
}
//cookie
function setCookie(key,value,t){
	var oDate=new Date();
	oDate.setDate(oDate.getDate()+t);
	document.cookie=key+'='+encodeURI(value)+';expires='+oDate.toUTCString();
}


function getCookie(key){
	var arr1=document.cookie.split('; ');
	for(var i=0;i<arr1.length;i++){
		var arr2=arr1[i].split('=');
		if(arr2[0]==key){
			return decodeURI(arr2[1]);
		}
	}
}

function removeCookie(key){
	setCookie(key,'',-1);
}
/*
 * 碰撞检测函数
 * mObj 移动的元素
 * */
function pz(mObj,sObj){
    var m = mObj.getBoundingClientRect();
    var s = sObj.getBoundingClientRect();
    var l1 = m.left;
    var r1 = m.left + m.width;
    var t1 = m.top;
    var b1 = m.top + m.height;

    var l2 = s.left;
    var r2 = s.left + s.width;
    var t2 = s.top;
    var b2 = s.top + s.height;

    if(r1 > l2 && l1 < r2 && b1 > t2 && t1 < b2){
        return true;
    }else {
        return false;
    }
}