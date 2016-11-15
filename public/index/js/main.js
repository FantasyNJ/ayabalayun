//图片轮播
$(function(){
    var banner = $('.m-banner');
    var len = banner.children('li').length;
    var n = 0;
    var timer = null;

    setBannerWidth();
    //改变窗口大小
    $(window).resize(function(){
        setBannerWidth();
    });

    function setBannerWidth(){
        banner.children('li').width( $(document).width() );
        banner.width( $(document).width()*len );
        banner.css('left', -n*$(document).width() );
        autoPlay();
    }

    function autoPlay(){
        clearInterval(timer);
        var width = $(document).width();
        timer = setInterval(function(){
            n++;
            n %= len;
            banner.animate({left:-n*width},500,function(){
                if(n === len-1){
                    banner.css('left', 0);
                    n = 0;
                }
            });
        },3000);
    }
})
//登录注册选项卡
$(function(){
    var loginRegL = $('.m-login-reg-list');
    var loginRegW = $('.g-login-reg-wrap');
    var aLi = loginRegL.find('li');
    var aDiv = loginRegW.children();
    var prompt = $('.g-reg-wrap .prompt');

    var wrap = $('.g-login-reg-wrap');
    var inp = wrap.find('input');

    var regUser = $('.g-reg-wrap').find('input[name="username"]');
    var regPassword = $('.g-reg-wrap').find('input[name="password"]');
    var regRePassword = $('.g-reg-wrap').find('input[name="repassword"]');

    //选项卡切换
    aLi.click(function(){
        aLi.removeClass('on');
        aDiv.hide();
        $(this).addClass('on');
        aDiv.eq($(this).index(aLi)).show();
        inp.val('').attr('class', '');
        $('.m-login-reg .prompt').text('');
    });
    //焦点

    inp.focus(function(){
        inp.removeClass('inp-focus');
        $(this).addClass('inp-focus');
    });
    inp.blur(function(){
        if( $(this).val().trim() !== ''){
            $(this).attr('class', '');
        }else{
            $(this).attr('class', 'inp-warn');
        }
    });
    //注册用户名框
    regUser.blur(function(){
        $.ajax({
            type: 'GET',
            url: '/api/user/checkUserName',
            data: {
                username : $(this).val()
            },
            success: function(result){
                prompt.text( result.message );
                if (result.code){
                    regUser.attr('class', 'inp-warn');
                    prompt.css('color', 'red');
                }else{
                    inp.attr('class', '');
                    prompt.css('color', 'green');
                }
            }
        });
    });
    //确认密码
    regRePassword.blur(function(){
        if($(this).val() !== regPassword.val()){
            $(this).attr('class', 'inp-warn');
            regPassword.attr('class', 'inp-warn');
        }
    });

})
//注册功能
$(function(){
    var userName = $('.g-reg-wrap [name="username"]');
    var passWord = $('.g-reg-wrap [name="password"]');
    var rePassWord = $('.g-reg-wrap [name="repassword"]');
    var btn = $('.g-reg-wrap .btn');
    var prompt = $('.g-reg-wrap .prompt');
    var form = $('.g-reg-wrap form');

    form.on('submit', function(){
        $.ajax({
            type: 'POST',
            url: '/api/user/register',
            data: {
                username: userName.val(),
                password: passWord.val(),
                repassword: rePassWord.val()
            },
            dataType: 'json',
            success: function(result){
                prompt.text( result.message );
                if (result.code) {
                    prompt.css('color', 'red');
                } else {
                    prompt.css('color', 'green');
                    form[0].reset();

                }
            }
        }) ;
        return false;
    });
})
//登录功能
$(function(){
    var userName = $('.g-login-wrap [name="username"]');
    var passWord = $('.g-login-wrap [name="password"]');
    var btn = $('.g-login-wrap .btn');
    var prompt = $('.g-login-wrap .prompt');
    var form = $('.g-login-wrap form');

    form.on('submit', function(){
        $.ajax({
            type: 'POST',
            url: '/api/user/login',
            data: {
                username: userName.val(),
                password: passWord.val(),
            },
            dataType: 'json',
            success: function(result){
                prompt.text( result.message );
                if (result.code) {
                    prompt.css('color', 'red');
                } else {
                    prompt.css('color', 'green');
                    window.localStorage.setItem('user', {
                        _id: result._id,
                        username: result.username
                    });
                    setTimeout(function() {
                        window.location.href = '/disk';
                    }, 1000);
                }
            }
        }) ;
        return false;
    });
})
//页面下滑显示
$(function(){
    var desc = $('.g-desc');
    var detail = $('.m-detail');

    //为动画元素添加自定义事件
    detail.on('diyShow', function(){
        $(this).find('.pl').animate({left: 0, opacity: 1}, 700);
        $(this).find('.pr').animate({top: 0, opacity: 1}, 700);
    });

    animate();

    $(window).scroll(animate);

    function animate(){
        detail.each(function(index, item){
            var h = $(window).scrollTop() + $(window).height();
            if(h > $(item).offset().top+30){
                $(item).trigger('diyShow');
                if(index === detail.length-1){
                    $(window).unbind('scroll');   //元素全部显示之后移除事件
                }
            }
        })
    }
})