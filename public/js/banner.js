;(function($){
    $.fn.extend({
        //�������
        "banner":function(options){
            
            //����Ĭ�ϲ���
            var defaluts={
                eml:'.page,.prev,.next,.title', //Ԫ��
                direction:'lr', //�˶����� ud lr
                mode:'slide', //������ʽ fade(��������) / slide ���һ���
                pages:true,  //�Ƿ���Ҫpages true/false
                btns:true,  //�Ƿ���Ҫbtns true/false
                title:true, //�Ƿ���Ҫtitle true/false
                autoanimate:true, //�Ƿ���Ҫ�Զ� true/false
                ease:'easeInOutElastic',//ease���
                cycle:true,//�Ƿ�ѭ����ʽ
                cycleType:true,//������Լ���֮�� ���Ǵӵ�������ص���һ�� Щ���Ա������� cycle=true ������Ч
                auto:2000,//�Զ�ʱ��
                animation:1000//����ʱ��
            };          
            var options = $.extend(defaluts,options);
            return this.each(function(){
                var op = options,obj = $(this),objLi = obj.find('li'),objSpan = obj.find('.page span'),lenB = obj.find('li').length,prev = obj.find('.prev'),next = obj.find('.next'),title = obj.find('.title'),f=true;
                if(op.direction=='ud' && op.mode=='slide'){
                    var Scr = obj.find('ul');//�������Ԫ��
                    var Scrw = Scr.find("li").outerWidth();//ȡ��ͼƬ�Ŀ��
                    var Scrh = Scr.find("li").outerHeight();//ȡ��ͼƬ�Ŀ��
                        Scr.find("li").height(Scrh)//LI���
                        Scr.height(Scrw*lenB);//�������Ԫ�ؿ��
                        Scr.height(Scrh);//�������Ԫ�ظ߶�                     
                }
                if(op.direction=='lr' && op.mode=='slide'){
                    var Scr = obj.find('ul');//�������Ԫ��
                    var Scrw = Scr.find("li").outerWidth();//ȡ��ͼƬ�Ŀ��
                    var Scrh = Scr.find("li").outerHeight();//ȡ��ͼƬ�Ŀ��
                        Scr.find("li").width(Scrw)//LI���
                        Scr.width(Scrw*lenB);//�������Ԫ�ؿ��
                        Scr.height(Scrh);//�������Ԫ�ظ߶�                     
                }
                obj.find('.cont').text(lenB);
                var page = "<div class='page'>";
                    for(i=1;i<=lenB;i++){
                        page += "<span>"+" "+"</span>";    
                    }
                    page+= "</div>";//Page ��������
                obj.append(page);//��Page ���뵽ĳ��Ԫ�غ���                
                var page = obj.find(".page span");//����ԭ�����
                page.eq(0).addClass("current");
                var imgAlt = objLi.eq(0).find('img').attr('alt');
                obj.find('.alt').text(imgAlt);
                if(op.pages==false){
                    obj.find('.page').hide();
                }
                if(op.btns==false){
                    prev.hide();
                    next.hide();
                }
                if(op.title==false){
                    title.hide();
                }
                if(op.mode=='slide'){
                    objLi.css({'float':'left'});
                }else if(op.mode=='fade'){
                    objLi.css({'position':'absolute','top':0,'left':0,'display':'none'});
                    objLi.eq(0).show();
                }
                if(op.unlimited==true){
                    var n=0;
                    objLi.each(function(){
                        $(this).attr('indexNum',n++);
                    });
                }
                if(op.cycle==true && op.cycleType==true){
                    if(op.direction=='ud' && op.mode=='slide'){
                        objLi.closest('ul').css({'position':'relative','top':-Scrh});
                        objLi.css({'position':'absolute','left':0,'display':'none','top':Scrh,'z-index':1});
                        objLi.eq(0).css({'display':'block','z-index':5})
                    }else if(op.direction=='lr' && op.mode=='slide'){
                        objLi.closest('ul').css({'position':'relative','left':-Scrw});
                        objLi.css({'position':'absolute','top':0,'display':'none','left':Scrw,'z-index':1});
                        objLi.eq(0).css({'display':'block','z-index':5})
                    }
                }
                page.live("click",function(){
                    if(!$(this).hasClass('current')){
                        var curr = page.index(this)+1;
                        imgAlt = objLi.eq(page.index(this)).find('img').attr('alt');
                        obj.find('.curr').text(curr);
                        obj.find('.alt').text(imgAlt);
                        if(op.direction=='ud' && op.mode=='slide' && !Scr.is(":animated")){
                            if(op.cycle==true && op.cycleType==true){
                                var ui = obj.find(".page span.current").index();
                                var ut = $(this).index();
                                if(ut==lenB-1 && ui==0){
                                    f=false
                                }else if(ut==0 && ui==lenB-1){
                                    f=true
                                }else if(ut>ui){
                                    f=true
                                }else{
                                    f=false
                                }
                                if(f){
                                    Scr.css('top',-Scrh);
                                    Scr.find('li').eq($(this).index()).css({'top':Scrh*2,'display':'block'});
                                    Scr.stop(true,true).animate({'top':-Scrh*2},op.animation,op.ease,function(){
                                        Scr.css('top',-Scrh);
                                        Scr.find('li').eq(ui).hide();
                                        Scr.find('li').eq(ui).css({'z-index':1});
                                        Scr.find('li').eq(ut).css({'z-index':5,'top':Scrh});
                                    });
                                }else{
                                    Scr.css('top',-Scrh);
                                    Scr.find('li').eq($(this).index()).css({'top':0,'display':'block'});
                                    Scr.stop(true,true).animate({'top':0},op.animation,op.ease,function(){
                                        Scr.css('top',-Scrh);
                                        Scr.find('li').eq(ui).hide();
                                        Scr.find('li').eq(ui).css({'z-index':1});
                                        Scr.find('li').eq(ut).css({'z-index':5,'top':Scrh});
                                    });
                                }
                            }
                            else{
                                Scr.stop(true,true).animate({marginTop:-Scrh*($(this).index())},op.animation,op.ease);
                            }
                            $(this).addClass("current").siblings().removeClass("current");
                        }else if(op.direction=='lr' && op.mode=='slide' && !Scr.is(":animated")){
                            if(op.cycle==true && op.cycleType==true){
                                var i = obj.find(".page span.current").index();
                                var t = $(this).index();
                                if(t==lenB-1 && i==0){
                                    f=false
                                }else if(t==0 && i==lenB-1){
                                    f=true
                                }else if(t>i){
                                    f=true
                                }else{
                                    f=false
                                }
                                if(f){
                                    Scr.css('left',-Scrw);
                                    Scr.find('li').eq($(this).index()).css({'left':Scrw*2,'display':'block'});
                                    Scr.stop(true,true).animate({'left':-Scrw*2},op.animation,op.ease,function(){
                                        Scr.css('left',-Scrw);
                                        Scr.find('li').eq(i).hide();
                                        Scr.find('li').eq(i).css({'z-index':1});
                                        Scr.find('li').eq(t).css({'z-index':5,'left':Scrw});
                                    });
                                }else{
                                    Scr.css('left',-Scrw);
                                    Scr.find('li').eq($(this).index()).css({'left':0,'display':'block'});
                                    Scr.stop(true,true).animate({'left':0},op.animation,op.ease,function(){
                                        Scr.css('left',-Scrw);
                                        Scr.find('li').eq(i).hide();
                                        Scr.find('li').eq(i).css({'z-index':1});
                                        Scr.find('li').eq(t).css({'z-index':5,'left':Scrw});
                                    });
                                }
                            }
                            else{
                                Scr.stop(true,true).animate({marginLeft:-Scrw*($(this).index())},op.animation,op.ease);
                            }
                            $(this).addClass("current").siblings().removeClass("current");
                        }else if(op.mode=='fade'){
                            if(objLi.eq(page.index(this)).is(":hidden")){
                                objLi.stop(true,true).fadeOut(op.animation).eq(page.removeClass("current").index($(this).addClass("current"))).fadeIn(op.animation);
                            }
                        }
                    }
                })//���Pageʱ���ж���
                if(op.autoanimate==true){
                    var index = 1;
                    var time = setInterval(function(){
                        page.eq(index).click();
                        index++;
                        if(index==lenB){
                            index=0;
                        }
                    },op.auto);//�Զ����ж���
                    obj.find(op.eml).hover(
                        function(){
                            clearInterval(time);
                        },
                        function(){
                            index = obj.find(".page span.current").index()+1;//��ȡ��ǰPage����
                            if(index==lenB){
                                index=0;
                            }
                            time = setInterval(function(){
                                page.eq(index).click();
                                index++;
                                if(index==lenB){
                                    index=0;
                                }
                            },op.auto);
                        }
                    );//��ͣ��Page��ֹͣ�������뿪�ָ�����
                }
                prev.click(function(){
                    index = obj.find(".page span.current").index()-1;//��ȡ��ǰPage����
                    prev.removeClass('disabled');
                    next.removeClass('disabled');
                    if(op.cycle!=true){
                        if(index==-1 || index== 0){prev.addClass('disabled');};
                        if(index==-1){return false};
                    }
                    page.eq(index).click();
                })//��һ��
                next.click(function(){
                    prev.removeClass('disabled');
                    next.removeClass('disabled');
                    index = obj.find(".page span.current").index()+1;//��ȡ��ǰPage����
                    if(op.cycle!=true){
                        if(index==lenB || index==lenB-1){
                            index=lenB-1;
                            if(index==lenB-1 || index==lenB){next.addClass('disabled'); }
                        }
                    }else{
                        if(index==lenB){
                            if(op.cycle!=true){
                                index=lenB-1;
                            }else{
                                index=0;
                            }
                        }
                    }
                    page.eq(index).click();
                })//��һ��
            });
        }       
    });
})(jQuery)