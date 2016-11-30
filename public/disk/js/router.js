//var listWrap = $S('g-list')[0];
(function(){
    var list = document.querySelectorAll('.m-list');

    var gBtnLeft = document.querySelector('.g-btn-left');
    var gBtnRight = document.querySelector('.g-btn-right');
    var gPath = document.querySelector('.g-path');
    var mkdir = document.querySelector('.u-btn.mkdir');

    var toolBtnList = $S('.u-btn-list', toolBar)[0]; //功能按钮
    var fileShow = $S('.g-file-show')[0];

    hashChange();
    window.onhashchange = hashChange;

    function hashChange(){
        var hash = window.location.hash.substring(1);
        //目录
        if(hash === '' || hash === 'all'){
            var listItem = document.querySelector('.m-list.list-all');
            render();
            clearClass();
            showElem();
            addClass(listItem, 'list-current');

            return;
        }
        //音乐
        if(hash === 'music'){
            var listItem = document.querySelector('.m-list.list-music');
            renderMediaFile('/api/data/getMusic');
            clearClass();
            hideElem();
            addClass(listItem, 'list-current');

            return;
        }
        //视频
        if(hash === 'video'){
            var listItem = document.querySelector('.m-list.list-video');
            renderMediaFile('/api/data/getVideo');
            clearClass();
            hideElem();
            addClass(listItem, 'list-current');

            return;
        }
    }

    function clearClass(){
        list.forEach(function(item){
            removeClass(item, 'list-current')
        })
    }

    function hideElem(){
        var hiddenElem = document.querySelectorAll('a[data-hidden=hidden]');
        hiddenElem.forEach(function(item){
            item.style.display = 'none';
        })
        fileShow.style.left = 0;
        toolBtnList.isShow = false;
    }
    function showElem(){
        //gBtnLeft.style.visibility = gBtnRight.style.visibility = gPath.style.visibility = 'visible';
        var hiddenElem = document.querySelectorAll('a[data-hidden=hidden]');
        hiddenElem.forEach(function(item){
            item.style.display = '';
        })
        fileShow.style.left = '165px';
        toolBtnList.isShow = true;
    }

})()

function renderMediaFile(url) {
    filecon.innerHTML = '';
    ajax({
        method : 'get',
        url : url,
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
            //改变全选按钮状态
            changeAllBtnStatus();
            for (var i = 0; i < checkbox.length; i++) {
                checkboxEvent(i);
            }
        },
    })
}
