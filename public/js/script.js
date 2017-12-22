$(function() {
    var _body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html');//operaFix
    if($.browser.msie&&($.browser.version == "9.0") || $.browser.msie&&($.browser.version == "10.0")){
        $("object").attr("classid","clsid:D27CDB6E-AE6D-11cf-96B8-444553540000");
    }

	$(".HeadNav ul li:last").find('a').css("background","none");
	$(".btn-nav-bar").toggle(function(){
		$(this).stop(true,true).animate({"right":"126px"},150);
		$(".mobile-nav").stop(true,true).animate({"right":"0px"},300);
		$(".mobile-nav").css("display","block");
	},function(){
		$(this).stop(true,true).animate({"right":"0px"},150);
		$(".mobile-nav").stop(true,true).animate({"right":"-126px"},300);
		$(".mobile-nav").css("display","none");
	});

	$('.Banner').banner({
        direction:'lr',//运动方向 ud lr
        mode:'slide', //动画方式 fade(渐隐渐现) / slide 左右滑入
        pages:true,  //是否需要pages true/false
        btns:true,  //是否需要btns true/false
       // title:true, //是否需要title true/false
        autoanimate:true, //是否需要自动 true/false
        ease:'easeInOutQuart',//ease插件
        cycle:true,//是否循环方式
        cycleType:true,//这个属性加了之后 不是从第五个返回到第一个 些属性必须设置 cycle=true 才能生效
        auto:9000,  //停留时间
        animation:1000 //动画时间
    }); 

	var gao1 = $(".nyBanner").width();
	var gao2 = gao1*0.24+30;
	$(".nyBanner img").css({height:gao1*0.24});
	$(".nyBanner").css({height:gao2});

	var gao11 = $(".caseBanner").width();
	var gao21 = gao11*0.3+30;
	$(".caseBanner img").css({height:gao11*0.3});
	$(".caseBanner").css({height:gao21});
});
