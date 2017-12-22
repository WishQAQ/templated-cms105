
$(function(){
	$(".anPic ul li ").hover(function(){
		$(this).find('.pt').stop(true,true).animate({"bottom":"0px"},500);
	},function(){
		$(this).find('.pt').stop(true,true).animate({"bottom":"-70px"},300);
	});
})





/*滚屏*/
$(function(){
	var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body'); //operaFix
	var sec1_top=0;
	var sec2_top=$('.AboutUs').offset().top;
	var sec3_top=$('.CaseCon').offset().top;
	var sec4_top=$('.Service').offset().top;
	var sec5_top=$('.Contact').offset().top;
	$('.RightNav ul li').eq(0).click(function(){
		$body.animate( { scrollTop: sec1_top}, "normal");
		$(this).find("img").attr("src","/sh/Public/images/yuanCur.png").end().siblings().find("img").attr("src","/sh/Public/images/yuan.png");
	});
	$('.RightNav ul li').eq(1).click(function(){
		$body.animate( { scrollTop: sec2_top}, "normal");
		$(this).find("img").attr("src","/sh/Public/images/yuanCur.png").end().siblings().find("img").attr("src","/sh/Public/images/yuan.png");
	});
	$('.RightNav ul li').eq(2).click(function(){
		$body.animate( { scrollTop: sec4_top}, "normal");
		$(this).find("img").attr("src","/sh/Public/images/yuanCur.png").end().siblings().find("img").attr("src","/sh/Public/images/yuan.png");
	});
	$('.RightNav ul li').eq(3).click(function(){
		$body.animate( { scrollTop: sec3_top}, "normal");
		$(this).find("img").attr("src","/sh/Public/images/yuanCur.png").end().siblings().find("img").attr("src","/sh/Public/images/yuan.png");
	});
	$('.RightNav ul li').eq(4).click(function(){
		$body.animate( { scrollTop: sec5_top}, "normal");
		$(this).find("img").attr("src","/sh/Public/images/yuanCur.png").end().siblings().find("img").attr("src","/sh/Public/images/yuan.png");
	});

	$(window).scroll(function(){
		wintop=$(document).scrollTop();
		if(wintop>=(sec2_top)-200){
			$('.AboutCon .gyUs').animate({"left":"0px","opacity":"1"},900);
			$('.AboutCon .gyQiTa').animate({"right":"0px","opacity":"1"},900)	
		}
		if(wintop>=(sec3_top)-200){
			$(".anPic ul li").each(function(i){
				$(this).delay(i*100).animate({"top":"0px","opacity":"1"},1200);
			});
		}
		if(wintop>=(sec4_top)-200){
			$('.Service .SerCon').animate({"top":"0px","opacity":"1"},900)	
		}
		if(wintop>=(sec5_top)-200){
			$('.Contact .lxCon').animate({"top":"30%","opacity":"1"},900)	
		}

	});
});





















































