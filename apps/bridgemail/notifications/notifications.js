/* 
 * Name: Notifications
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification show all
 * Dependency: Notifications
 */

define(['text!notifications/html/notifications.html','app', 'notifications/notification', 'notifications/collections/notifications'],
        function(template, app,Notification,Notifications) {
            'use strict';
            return Backbone.View.extend({
                events: {
                    "click .sortoption_expand":"toggleMenu",
                    "click .closebtn": "closeContactsListing",
                    "click #template_search_menu_expand li a":"sortNotifications",
                    "click #refresh_notification":"updateNotfication",
                    "click .markread":"markedRead",
                    "click .markunread":"markedUnRead"
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    this.total = 0;
                    this.app = app;
                    this.notifyType = "";
                    this.loop = 0;
                    this.eventType= "";
                    this.offsetLength = 0;
                    this.notificationData = [];
                    this.notificationText = '';
                    this.render();
                },
                render: function() {
                    var that = this;
                    this.notificationMetaData();
                    this.$el.html(this.template());
                    this.fetchNotifications();
                    this.$el.find(".all-notification").scroll(_.bind(this.liveLoading, this));
                    this.$el.find(".all-notification").resize(_.bind(this.liveLoading, this));
                     this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                sortNotifications:function(ev){
                  if($(ev.target).parents('li').hasClass('active')){ return;}
                    $(ev.target).parents('ul').find('li').removeClass('active');
                    var sort = $(ev.target).data('search');
                    if ( sort.indexOf('_notify') !== -1 ){
                        this.notifyType = sort.split("_")[0];
                        this.eventType = null;
                    }else{
                            
                        if(sort == ""){
                            this.eventType = null;
                        }else{
                             this.eventType = sort;
                        }
                        
                        this.notifyType = null;
                    }
                    var html = $(ev.target).data('warn');
                    this.notificationText = html;
                     $(this.el).find(".sortoption_expand").html(html+'<b style="position:absolute; top:11px; right:70px" class="caret right"> </b>');
                    $(ev.target).parents('li').addClass('active');
                    this.toggleMenu();
                     
                     this.total_fetch = 0;
                    this.fetchNotifications();
                },
                fetchNotifications: function(count) {
                    var container = this.$el.find(".notification-container");
                    var _data = {};
                    var that = this;
                    if (!count) {
                        container.html('');
                        that.total_fetch = 0;
                         this.loop = 0;
                        this.offset = 0;
                        this.app.showLoading("&nbsp;",container);
                       } else {
                           if(that.$el.find(".div-load-more").length > 0)
                               that.$el.find(".div-load-more").remove();
                            container.append("<div style='margin-right:50%; margin-top:10px; width:100% ; text-align:center' class='div-load-more'><img src='"+this.app.get("path")+"img/loading.gif'></div>"); 
                            this.offset = this.offset + this.offsetLength;
                    }
                    
                    
                    _data['type'] = "get";
                    _data['notifyType'] =this.notifyType;
                    _data['eventType'] = this.eventType;
                    _data['offset'] = this.offset;
                    var objNotifications = new Notifications();
                   
                    objNotifications.fetch({data: _data, success: function(data) {
                            that.offsetLength = data.length;
                            that.total_fetch = that.total_fetch + data.length;
                            
                            if(objNotifications.unreadCount != "0"){
                                if(that.notificationText === 'All'){
                                    $(that.el).find('h4').find('span').html('new messages');
                                }else{
                                     $(that.el).find('h4').find('span').html(that.notificationText+' messages');
                                }
                                $(that.el).find('h4').find('.badge').html(objNotifications.unreadCount);
                                $('.messagesbtn sup').show().html(objNotifications.unreadCount);
                            }else{
                                $(that.el).find('h4').find('span').html(that.notificationText+' messages');
                                $(that.el).find('h4').find('.badge').html(objNotifications.total);
                                $('.messagesbtn sup').hide();
                            }
                            
                            if(data.length == 0){
                              var noRecordHTML="<div class='alertmsg' style='height: auto;'><div class='info-p'><span style='margin-left:35%; margin-top:20%; color:#000;'> No message(s) found </span></div>";
                              container.html(noRecordHTML);
                              container.parents('.messages_dialogue').find('.viewallmsgs').hide();
                            }else{
                               
                                if(that.options.isModel == false && data.length > 4)
                                    container.parents('.messages_dialogue').find('.viewallmsgs').show()
                            }
                            _.each(data.models, function(model) {
                                
                                container.append(new Notification({metaData:that.notificationData,model: model, app: that.app, attr: that.options}).el);
                            });
                            if (that.total_fetch < parseInt(data.total) && that.options.isModel == true) {
                                 container.find(".alertmsg:last").attr("data-load","true");
                                 if($(".popmodel").scrollTop() < 1){ that.loop = that.loop + 1};
                                
                                 that.$el.find(".all-notification").css("height",$(window).height() - 230 + "px");
                                    // container.append("<div style='margin-right:50%; width:100% ; text-align:center' class='div-load-more'></div>");
                             // that.$el.find('.load-more').on('click',function(){
                                //that.$el.find('.div-load-more').remove();
                                //that.fetchNotifications(that.offsetLength);
                             // });
                            }
                            if (!count) {
                                 that.app.showLoading(false,container);
                             
                            }else{
                              that.$el.find(".div-load-more").remove();
                            }
                            if ($(".popmodel").scrollTop() < 1){
                                var $w = that.$el.find(".all-notification");
                                var th = 200;
                                    var inview = that.$el.find('.all-notification .alertmsg:last').filter(function() {
                                 var $e = $(this),
                                     wt = $w.scrollTop(),
                                     wb = wt + $w.height(),
                                     et = $e.offset().top,
                                     eb = et + $e.height();
                                 return eb >= wt - th && et <= wb + th;
                                 });
                                if (inview.length && inview.attr("data-load") && that.$el.height() > 0) {
                                    inview.removeAttr("data-load");
                                    that.fetchNotifications(that.offsetLength);
                                }  
                            }
                        }});
                     

                },
                toggleMenu:function(){
                     $(this.el).find("#template_search_menu_expand").slideToggle();   
                },
                capitalizeLetter: function() {

                    return this.options.salestatus.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                        return letter.toUpperCase();
                    });
                },
                liveLoading: function() {
                    var $w = $(window);
                    if ($(".all-notification").scrollTop() > 70) {
                        if($(".all-notification").find(".notify-scroll").length < 1){
                            $(".all-notification").append("<button class='ScrollToTop notify-scroll' type='button' style='position:absolute;bottom:2px;right:18px;'></button>");
                            $(".all-notification").find('.notify-scroll').on('click', function() {
                                $(".all-notification").animate({scrollTop: 0}, 600);
                            })
                        }
                    } else {
                        $(".all-notification").find(".notify-scroll").remove();
                    }
                    var th = 200;
                    var inview = this.$el.find('.all-notification .alertmsg:last').filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.fetchNotifications(this.offsetLength);
                    }  
                   
                },
                notificationMetaData:function(){
                    var URL = "/pms/io/user/notification/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=metadata";
                    var that = this;
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                            _.each(data.types[0].event[0], function(key, value){
                                that.notificationData[key] = value;
                                var cld = "";
                                if(key === "CMP_C")
                                    cld = "icon campaign";
                                else if(key ==="TG_PCT")
                                    cld="icon target";                              
                                else if(key === "CSV")
                                    cld= "icon csvicon";
                                else 
                                    cld = "icon campaign";
                                
                                $("#template_search_menu_expand").append("<li data-search='"+key+"' ><a data-warn='"+value+"'  data-search='"+key+"'>"+value+"<i class='"+cld+"'></i></a></li>");                  
                            });
                     
                    });
                } ,
                 closeContactsListing: function() {
                    $("#div_pageviews").empty('');
                    $("#div_pageviews").hide();
                },
                markedRead:function(){
                    var URL = "/pms/io/user/notification/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=markRead&markAll=read";
                    var that = this;
                    this.app.showLoading("Marking all messages as read",this.$el.find(".notification-container"));
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(app.checkError(data)){return false;}
                        console.log(data);
                        that.app.showLoading(false,that.$el.find(".notification-container"));
                        if(data[0]=="success"){
                            that.$el.find('.notification-container div.alertmsg').removeClass("new");
                            that.$el.parents('body').find('#dashnav .messagesbtn sup').html('0').hide();
                            that.$el.find('.mr-mur-notify').fadeOut('slow');
                        }
                    });
                },
                markedUnRead:function(){
                    alert('Hit Marked Unread');
                },
                updateNotfication:function(){
                     var URL = "/pms/io/user/notification/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=unReadCount";
                    var that = this;
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(app.checkError(data)){return false;}
                         if(that.options.newMessages < data[1]){
                            $('.messagesbtn').addClass('swing');
                              $('.messagesbtn sup').css({"top":"-4px",left:"22px"});
                            setTimeout(function(){
                                 $('.messagesbtn').removeClass('swing');
                                 $('.messagesbtn sup').css({"top":"5px",left:"70px"});
                            },5000);
                          
                            
                        }else{
                            $('.messagesbtn').removeClass('swing');
                            $('.messagesbtn sup').css({"top":"5px",left:"70px"});
                        }
                        that.options.newMessages = data[1];
                        $('.messagesbtn sup').show();
                        $('.messagesbtn sup').html(data[1]);
                        if(data[1] == "0" || data[1] == 0){
                            $('.messagesbtn sup').hide();
                        }
                        
                    });
                    this.initialize();
               }

            });

        });