/* 
 * Name: SContact View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Contact View, Display Single Contact 
 * Dependency: SCONTACT HTML
 */

define(['text!reports/summary/html/scontact.html','moment','app'],
function (template,moment,app) {
        'use strict';
        return Backbone.View.extend({
            className: 'erow',
            tagName:'tr',
            events: {
              'click .view-profile':"openContact",
              'click .page-view':'loadPageViewsDialog',
              'click .metericon':'showProgressMeter',
              'click .closebtn':'closeProgressMeter',
              'click .click-detail':'loadClickViewDialog',
              'click .contact-name':'singleContact'
            },
            initialize: function () {
                _.bindAll(this, 'getRightText', 'pageClicked');
                 this.app = app;
                 this.template = _.template(template);	
                 this.viewCount = 0;                 
                 this.type = this.options.type;
                 this.firstOpenDate = ""
                 this.botId = this.options.botId || null;
                 this.trackId = this.options.trackId || null;
                 this.bounceType = "";
                 this.articleTitle = "";
                 this.articleUrl = "";
                 this.clickCount = 0;
                 this.isNurtureTrack = false;
                 this.logTime = "";
                 this.isVisitcontactClick = false;
                 this.render();
            },
            render: function () {
              
                 if((this.type == "C" || this.type == "P") && !this.botId && !this.trackId){
                        this.clickCount =   this.model.get('activityData')[0].totalClickCount; 
                 this.data = this.model.get('activityData')[0];   
                  this.bounceType = this.model.get('activityData')[0].bounceCategory;
                  this.logTime = this.model.get('activityData')[0].logTime;
                  this.viewCount =   this.model.get('activityData')[0].pageViewCount;
                
                }else if(this.botId && (this.type == "C" || this.type == "P")){
                        this.bounceType =   this.model.get('autobotData')[0].bounceCategory;  
                        this.viewCount =   this.model.get('autobotData')[0].totalPageViewsCount;  
                        this.logTime =this.model.get('autobotData')[0].execDate; 
                        this.recurCount = this.model.get('autobotData')[0].recurCount;
                        this.totalClickCount = this.model.get('autobotData')[0].totalClickCount;
                        this.clickCount = this.model.get('autobotData')[0].totalClickCount;
                        this.data = this.model.get('autobotData')[0];
                }else if(this.trackId && (this.type == "C" || this.type == "P")){
                   this.isNurtureTrack = true;
                  this.bounceType =   this.model.get('nurtureData')[0].bounceCategory;  
                  this.viewCount =   this.model.get('nurtureData')[0].pageViewsCount; 
                   this.clickCount =   this.model.get('nurtureData')[0].totalClickCount; 
                  this.logTime =this.model.get('nurtureData')[0].execDate; 
                  this.data = this.model.get('nurtureData')[0];
                }else{
                  this.clickCount =   this.model.get('activityData')[0].totalClickCount; 
                  this.data = this.model.get('activityData')[0];   
                  this.bounceType = this.model.get('activityData')[0].bounceCategory;
                  this.logTime = this.model.get('activityData')[0].logTime;
                  this.viewCount =   this.model.get('activityData')[0].pageViewCount;
                }
                this.$el.html(this.template(this.model.toJSON())); 
               
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            },
            openContact:function(){
                this.$el.parents('.modal').find('.close').click();
                this.options.app.mainContainer.openSubscriber(this.model.get('subNum.encode'));
            },
            getRightText:function(){
                var text = "";
                switch(this.options.type){
                    case "UN":
                      text = this.unsubscribe("Unsubscribed on");
                       break;
                    case "SP":
                      text = this.unsubscribe("Suppressed on");
                       break;
                    case "CB":
                      text = this.unsubscribe("Bounced on");
                       break;
                    case "OP":
                        text = this.pageOpened("First opened on");
                        break; 
                    case "CK":
                        if(this.options.article)
                            text = this.pageClicked("First clicked on");
                        else
                            text = this.pageClicked("Clicked on");
                        break;
                    case "CT":
                      text = this.unsubscribe("Converted on");
                       break;
                    case "C":
                        if(this.botId)
                          text = this.unsubscribe("Last sent on")
                        else
                          text = this.unsubscribe("Sent on")  
                          break;
                    case "P":
                          text = this.unsubscribe("Schedule to go on");
                          break;
                       
                }
                return text; 
               
            },
            
            unsubscribe:function(text){
                 var str = "";
                 if(this.options.type == "CB"){
                     str = str +  "<td width='5%'><div><div class='bounce-type colico' style='width:155px'><strong><span><em>Bounce Type</em>"+this.bounceType+"</span></strong></div></div></td>";;
                 }
                 if(text== "Schedule to go on"){
                     str = str +  "<td width='5%'><div><div class='time show' style='width:155px'><strong><span class='showtooltip' data-original-title='"+this.dateSettingFull(this.logTime,"/")+"'><em>"+text+"</em>"+this.dateSetting(this.logTime,"/")+"</span></strong></div></div></td>";;
                 }else{
                    str = str +  "<td width='5%'><div><div class='time show' style='width:155px'><strong><span class='showtooltip' data-original-title='"+this.dateSettingFull(this.logTime,"/")+"'><em>"+text+"</em>"+this.dateSetting(this.logTime,"/")+"</span></strong></div></div></td>";;
                 }
                    return str;
            },
            pageViews:function(text){
               
                if(this.viewCount !="0"){
                    return "<strong><span><em>"+text+"</em><a class='page-views-modal'><b>"+this.viewCount +"</b></a></span></strong>";
                }else{
                      return "<strong><span><em>"+text+"</em> <b>"+this.viewCount +"</b> </span></strong>";
                    }
            },
            pageOpened:function(text){
                return "<td><div><div class='time show' width='10%'><strong><span class='showtooltip' data-original-title='"+this.dateSettingFull(this.logTime,"/")+"'><em>"+text+"</em> "+this.dateSetting(this.logTime,"/")+" </span></strong></div></div></td>";
            },
            pageClicked:function(text){
                      if(text == "Clicked on"){
                        if(this.clickCount !="0"){
                          var aClick = "<a class='click-detail showtooltip' data-original-title='Click to view detail'><b>"+this.options.app.addCommas(this.clickCount)+"</b></a> ";
                        }else{
                           var aClick = "0";
                        }
                            var html ="<td width='10%'><div><div class='colico click'>";
                            html = html + "<strong><span><em>Click count</em><b>"+aClick+"</b></span></strong></div></div>";
                            return html;
                      }else{
                        return  "<td width='10%'><div><div class='time show' ><strong><span class='showtooltip' data-original-title='"+this.dateSettingFull(this.logTime,"/")+"'><em>"+text+"</em> "+this.dateSetting(this.logTime, "/")+" </span></strong></div></div></td>";
                      }
                  
                     
            },
            linkTd:function(){
                if(this.type == "C" || this.type == "P") return;
             if(this.model.get('activityData')[0].articleTitle && !this.options.article){               
                   var html ="<td width='30%'><div><div class='colico link'>";
                   html = html + "<strong><span><em>Link URL</em><a class='showtooltip' data-original-title='"+this.model.get('activityData')[0].articleURL+"' href='"+this.model.get('activityData')[0].articleURL+"' target='_blank'>"+this.truncateURL(this.model.get('activityData')[0].articleTitle)+"</a></span></strong></div></div>";
                   return html;
                 }
            },
            repeatCounts:function(){
                var str;
                if(this.botId && (this.type == "C")){
                var str ='<td width="120px">';
                    str +='<div class="colico   recur showtooltip " data-original-title="How many time action repeated">';
                    str +="<strong><span><em>Recur Count</em>"+this.options.app.addCommas(this.model.get('autobotData')[0].recurCount)+"</span></strong>";
                    str +='</div>';
                    str +='</td>';
                }
                return str;
            },
            truncateURL:function(url){
                if(url.length > 30) 
                return url = url.substring(0,40);
                else return url;
            },
            pageViewsTd:function(){
                if(this.type == "C" || this.type == "P") return;
                if(this.viewCount){
                    if(this.viewCount !="0"){
                        var encode =this.model.get('subNum.encode');
                    var  html ="<td width='10%'><div><div class='colico pgview'>";
                    html = html + "<strong><span><em>Page Views</em><a><b class='page-view' data-id='"+encode+"'>"+this.viewCount+"</b></a></span></strong></div></div></td>";
                    return html;
                    }else{
                                            var encode =this.model.get('subNum.encode');
                  var  html ="<td width='10%'><div><div class='colico pgview'>";
                   html = html + "<strong><span><em>Page Views</em> <b class='page-view' data-id='"+encode+"'>"+this.viewCount+"</b> </span></strong></div></div></td>";
                   return html;   
                    }
                }
            },
            getFullName:function(){
                var name = this.model.get('firstName') + " " + this.model.get('lastName');
                if(!this.model.get('firstName') || !this.model.get('lastName'))
                    return this.model.get('email');
                else 
                    return name;
            },
            loadPageViewsDialog:function(ev){
                    
                     var dialog_width = 80;
                     var encode = 0;
                     if($(ev.target).data('id')){
                         encode = $(ev.target).data('id')
                     }else{
                         encode = this.model.get('subNum.encode');
                     }
                     var that = this;
                     var url = "";
                     if(!this.options.url && this.type != "C"){
                        var url = this.model.get('activityData')[0].articleURL;
                        var title = this.model.get('activityData')[0].articleTitle;
                        url = title+'|-.-|'+url;
                     }else{
                         url = this.options.url;
                     }
                     
                     if($(ev.target).html() == "0")return;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog(
                           {           
                                       title:'Page Views',
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'preview3',
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                     that.options.app.showLoading('Loading Page Views....',dialog.getBody());
                        var name = that.model.get('firstName');
                        if(!name){
                          name = that.model.get('email'); 
                        }else{
                            name = name + "  " + this.model.get('lastName') ;
                        }
                                 
                        require(["reports/summary/views/pageviews",],function(Views){
                                var mPage = new Views({campNum:that.options.campNum,subNum:encode,encode:that.model.get('subNum.encode'),app:that.options.app,email:name,salestatus:that.model.get('salesStatus'),url:url});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        });
                        
                
            },
            showProgressMeter:function(ev){
                 var that = this;
                 if($('.percent_stats').find(".ocp_stats").length > 0)
                       $('.percent_stats').find(".ocp_stats").remove();
                    
                var nurtureData;
                 if((this.type == "C" || this.type=="P") && !this.trackId && !this.botId){
                   nurtureData  = this.model.get('activityData')[0];
                 }else if(this.botId && (this.type == "C" || this.type=="P")){
                     nurtureData =  this.model.get('autobotData')[0];
                 }else if(this.trackId && (this.type == "C" || this.type=="P")){
                   nurtureData =  this.model.get('nurtureData')[0];
                 }else{
                     nurtureData  = this.model.get('activityData')[0];
                 }
                 var pageViews = nurtureData.totalPageViewsCount;
                 var click = nurtureData.totalClickCount;
                 var aPageViews = "<b>0</b>";
                 var aClick = "<b>0</b>";
                 var converted =  "-";
                 var open =  "-";
                 var position = "-560px";
                 var className='open';
                 if(nurtureData.conversionDate !=""){
                     position = "-420px";
                     className='conversion';
                     converted = this.dateSetting(nurtureData.conversionDate,"/");
                     open = this.dateSetting(nurtureData.firstOpenDate ,"/")
                     aClick = "<a><b>"+this.options.app.addCommas(click)+"</b></a> ";
                     aPageViews = "<a><b>"+this.options.app.addCommas(pageViews)+"</b></a> ";
                }else if(pageViews !="0"){
                     position = "-280px";
                     className='pageview';
                    aClick = "<a><b>"+this.options.app.addCommas(click)+"</b></a> ";
                    open = this.dateSetting(nurtureData.firstOpenDate ,"/") 
                    aPageViews = "<a><b>"+this.options.app.addCommas(pageViews)+"</b></a> ";
                 }else if(click !="0"){
                     aClick = "<a><b>"+this.options.app.addCommas(click)+"</b></a> ";
                     open = this.dateSetting(nurtureData.firstOpenDate ,"/")
                     position = "-140px"
                     className='click';
                 }else if(nurtureData.firstOpenDate  !=""){
                     open = this.dateSetting(nurtureData.firstOpenDate ,"/")
                     position = "0px";
                     className='open';
                 }
                 var encode =this.model.get('subNum.encode')
                 var str = "<div style='display:block;' class='ocp_stats left-side'><a class='closebtn'></a>"
                           +"<div class='elevel'>"
                           +"<h4>Engagement level</h4>"
                           +"<ul>"
                           +"<li class='open showtooltip' data-original-title='First opened on'><i class='icon'></i> "+open+" </li>"
                           +"<li class='click showtooltip click-detail' data-original-title='Unique click count' data-click='"+aClick+"'><i class='icon'></i> "+aClick+"</li>"
                           +"<li class='pageview showtooltip page-view' data-id='"+encode+"' data-original-title='Page Views' data-view='"+aPageViews+"'><i class='icon'></i>"+aPageViews+"</li>"
                           +"<li class='conversion showtooltip' data-original-title='Converted on'><i class='icon'></i>"+converted+" </li>"
                           +"</ul>"
                           +"</div>"
                           +"<div class='meterdd pageview' style='background-position: "+position+" 0px !important;'>"
                           +"<span data-original-title='Opened ' class='open showtooltip'></span>"
                           +"<span data-original-title='Clicked' class='click showtooltip'></span>"
                           +"<span data-original-title='Page Viewed' class='pageview showtooltip'></span>"
                           +"<span data-original-title='Conversion' class='conversion showtooltip'></span>"
                           +"</div>"
                          +"</div>";
                      $(ev.target).parents(".percent_stats").append(str);
                      $(ev.target).parents(".percent_stats").find('.page-view').on('click',function(ev){
                         if($(ev.target).data("view") == "0") return false;
                         that.loadPageViewsDialog(ev);
                         return false;
                      })
                      $(ev.target).parents(".percent_stats").find('.click-detail').on('click',function(ev){
                          if($(ev.target).data("click") == "0") return false;
                         that.loadClickViewDialog(ev);
                         return false;
                      })
                       
                   this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            },
            closeProgressMeter:function(){
                $('.percent_stats').find(".ocp_stats").remove();
            },
            firstLetterUpperCase:function(){
             return this.model.get('salesStatus').toLowerCase().replace(/\b[a-z]/g, function(letter) {
                   return letter.toUpperCase();
              });
             },
             getMeterIconClass:function(){
                 var nurtureData;
                  if((this.type == "C" || this.type=="P") && !this.trackId && !this.botId){
                   nurtureData  = this.model.get('activityData')[0];
                 }else if(this.botId && (this.type == "C" || this.type=="P")){
                     nurtureData =  this.model.get('autobotData')[0];
                 }else if(this.trackId && (this.type == "C" || this.type=="P")){
                   nurtureData =  this.model.get('nurtureData')[0];
                 }else{
                     nurtureData  = this.model.get('activityData')[0];
                 }
                 
                 var pageViews = nurtureData.totalPageViewsCount;
                 var click = nurtureData.totalClickCount;
                 var converted =  "-";
                 var open =  "-";
                 var className='';
                 if(nurtureData.conversionDate !=""){
                     className='conversion';
                 }else if(pageViews !="0"){
                     className='pageview';
                 }else if(click !="0"){
                     className='click';
                 }else if(nurtureData.firstOpenDate  !=""){
                     className='open';
                 }
                 return className;
             },
             dateSetting:function(sentDate, sep){
               if(sentDate)
               sentDate = this.options.app.decodeHTML(sentDate);
           
               if(sep =="/") 
                    var _date =  moment(sentDate,'MM/DD/YYYY');
                if(sep =="-")
                    var _date =  moment(sentDate,'YYYY-MM-DD');
                
                return _date.format("DD MMM YYYY");
             },
               dateSettingFull:function(sentDate, sep){
                if(sentDate)
                sentDate = this.options.app.decodeHTML(sentDate);
               
                   return moment(sentDate).format('DD MMM YYYY, h:mm a');
                    
                 
             },
             loadClickViewDialog:function(ev){
                    
                     var dialog_width = 80;
                     var encode = 0;
                     if($(ev.target).data('id')){
                         encode = $(ev.target).data('id')
                     }else{
                         encode = this.model.get('subNum.encode');
                     }
                     var that = this;
                     var url = "";
                     if(!this.options.url && this.type != "C"){
                        var url = this.model.get('activityData')[0].articleURL;
                        var title = this.model.get('activityData')[0].articleTitle;
                        url = title+'|-.-|'+url;
                     }else{
                         url = this.options.url;
                     }
                     
                     if($(ev.target).html() == "0")return;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog(
                           {           
                                       title:'Clicks',
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'preview3',
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                     that.options.app.showLoading('Loading Clicks....',dialog.getBody());
                        var name = that.model.get('firstName');
                        if(!name){
                          name = that.model.get('email'); 
                        }else{
                            name = name + "  " + this.model.get('lastName') ;
                        }
                                 
                        require(["reports/summary/views/clicks",],function(Clicks){
                               // console.log(new Clicks());
                                var mPage = new Clicks({campNum:that.options.campNum,subNum:encode,encode:that.model.get('subNum.encode'),app:that.options.app,email:name,salestatus:that.model.get('salesStatus'),url:url});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        });
                       return false;
                
            },
            singleContact : function(obj){
                 obj.stopPropagation();
                             obj.preventDefault();
               var vicon = $.getObj(obj, "i");
                var ele_offset = vicon.offset();
            var ele_width = vicon.width();
            var ele_height = vicon.height();
             var top = '';
             $('body').find('#contact-vcard').remove();
             var vcontact = $('<div id="contact-vcard" class="custom_popup activities_tbl contact_dd"></div>');
             $('body').append(vcontact);
             top = ele_offset.top + ele_height + 11;
             var left = ele_offset.left - 13;
             left = Math.round(left);
             $(vcontact).css({'top':top,'left':left,'z-index':'100','min-height': '170px'});
             this.app.showLoading("Loading Contact Details...", vcontact);
             vcontact.click(function(event){ event.stopPropagation();event.preventDefault();});
               require(["common/vcontact"],_.bind(function(page){                                     
                        var visitcontact = new page({parent:this,app:this.app,campNum:this.camp_id,subNum:this.model.get('subNum.encode')});
                         vcontact.html(visitcontact.$el);
                         
                         this.isVisitcontactClick =true;
                    },this));
                
            }
        });    
});