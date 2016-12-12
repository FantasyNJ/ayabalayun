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

/*
* AJAX 封装
* 格式
* url默认没有window.location.origin
* ajax({
	*		method : 'post',
	*		url : 'demo.php',
	*		data : {
		*			'name' : 'JR',
		*			'age' : 22
		*		},
	*		success : function (message) {
	*			alert(message);
	*		},
	*		async : true
	*	});
*/
function createXHR() {
	if (window.XMLHttpRequest) {	//IE7+、Firefox、Opera、Chrome 和Safari
		 return new XMLHttpRequest();
	} else if (window.ActiveXObject) {   //IE6 及以下
		var versions = ['MSXML2.XMLHttp','Microsoft.XMLHTTP'];
		for (var i = 0,len = versions.length; i<len; i++) {
			try {
				return new ActiveXObject(version[i]);
				break;
			} catch (e) {
				//跳过
			}	
		}
	} else {
		throw new Error('浏览器不支持XHR对象！');
	}
}
//封装ajax，参数为一个对象
function ajax(obj) {
	if(!obj.async){ //没有设置是否异步，默认设置异步
		obj.async = true;
	}
    console.log(obj.url)
	var xhr = createXHR();	//创建XHR对象
	//通过使用JS随机字符串解决IE浏览器第二次默认获取缓存的问题
	//obj.url = obj.url + '?rand=' + Math.random();

	obj.data = params(obj.data);  //通过params()将名值对转换成字符串
	//若是GET请求，则将数据加到url后面
	if (obj.method === 'get') {
		obj.url += obj.url.indexOf('?') == -1 ? '?' + obj.data : '&' + obj.data; 
	}
	if (obj.async === true) {   //true表示异步，false表示同步
		//使用异步调用的时候，需要触发readystatechange 事件
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {   //判断对象的状态是否交互完成
				callback();		 //回调
			}
		};
	}
	//在使用XHR对象时，必须先调用open()方法，
	//它接受三个参数：请求类型(get、post)、请求的URL和表示是否异步。
	xhr.open(obj.method, obj.url, obj.async);
	if (obj.method === 'post') {
		//post方式需要自己设置http的请求头，来模仿表单提交。
		//放在open方法之后，send方法之前。
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(obj.data);		//post方式将数据放在send()方法里
	} else {
		xhr.send(null);		//get方式则填null
	}
	//如果有回调函数执行，否则只发送请求
    if (obj.async === false) {  //同步
        callback();
    }
    function callback() {
        if (xhr.status == 200) {  //判断http的交互是否成功，200表示成功
            obj.success(JSON.parse(xhr.responseText));	//回调传递参数,解析JSON
        } else {
            //alert('获取数据错误！错误代号：' + xhr.status + '，错误信息：' + xhr.statusText);
        }
    }
}
//名值对转换为字符串
function params(data) {
	var arr = [];
	for (var i in data) {
		//特殊字符传参产生的问题可以使用encodeURIComponent()进行编码处理
		arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
	}
	return arr.join('&');
}

