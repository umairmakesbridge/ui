define(['jquery', 'backbone', 'underscore', 'app', 'views/common/wizard','text!templates/workspace.html'],
function ($,Backbone, _,app,Wizard, template) {
        'use strict';
        return Backbone.View.extend({
                id: 'workspace_',
                className :'ws-content',
                html_path : "text!html/",
                events: {
                    'click .close-wp':function(obj){
                        var cur_wp = $(obj.target).parents(".ws-content");
                        var wp_id = cur_wp.attr("id").split("_")[1];
                        var close_wp = $("#wp_li_"+wp_id).data('viewObj');
                        if(close_wp && close_wp.closeCallBack){
                            close_wp.closeCallBack();
                        }
                        $("#wp_li_"+wp_id+",#workspace_"+wp_id).remove();                        
                        if($("#wstabs li").length==1){                           
                            $(".tw-toggle button").removeClass("active");
                            $(".tw-toggle button:first").addClass("active");
                            $("#tiles").show();                      
                            $('#workspace').animate({left:'150%'},function(){
                                $(this).hide();
                            });    
                        }
                        else{
                           //$("#wstabs li:first").click();
                           //$("#"+app.mainContainer.lastActiveWorkSpace).click();
                           app.tabsArray.pop();
                           app.popWKSTabs();
                           
                        }
                        $("body").css("overflow","auto");                                                    
                        $("#activities,#search,.icons-bar").show();                        
                    },
                    'click .toolbar .more':function(){                       
                    },                    
                    'click .workspace-field':function(obj){                                                
                        obj.stopPropagation();
                    },
                    'mouseover .fav':function(){                			
			//$(".fav").parent().addClass('active');
                    },
                    'mouseout .fav':function(){                			
			//$(".fav").parent().removeClass('active');
                    },
                    'mouseover .toolbar .icon':function(obj){                			
                        var obj = $.getObj(obj,"a");
			//obj.parent().addClass('active');
                    },
                    'mouseout .toolbar .icon':function(obj){                			
                        var obj = $.getObj(obj,"a");
			//obj.parent().removeClass('active');
                    }
                    
                },
                initialize: function () {
                        this.template = _.template(template);				                                
                        this.render();
                        this.$(".camp_header .showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});	
                },
                render: function () {
                        this.$el.html(this.template({}));
                        var page_container = null;
                        //Render workspace title
                        if(this.options.title){
                           this.$el.find("#workspace-header").html(this.options.title);
                        }

                        //Render workspace as wizard
                        if(this.options.type && this.options.type=="wizard"){
                            var mk_wizard = new Wizard(this.options.wizard);  
                            this.$el.find(".campaign-content").append(mk_wizard.$el);
                            page_container = mk_wizard;
                        }
                        
                        if(this.options.noTags){
                            this.$el.addClass("ws-notags");
                        }
                        if(this.options.single_row){
                            this.$("#workspace-header").addClass("single");
                        }
                        if(this.options.addAction){
                            this.$el.find(".add-action").addClass("show-add");
                        }
                        //Load a page 
                        if(this.options.url){                            
                            this.loadPage(this.options.url,page_container,this.options.params);
                        }
                        
                        if(this.options.actions){
                            var wp_header_shortcuts = this.$(".shortcuts ul");
                            var shortcuts_li = this.options.actions;
                            wp_header_shortcuts.children().remove();
                            _.each(shortcuts_li, function(li,i){
                                wp_header_shortcuts.append($('<li><a><span class="icon '+li.iconCls+'"></span>'+li.text+'</a></li>'))
                            }, this)
                            
                        }

                        this.$el.css("min-height",app.get("wp_height"));
                },
                loadPage:function(_url,container,params){                       
                    app.showLoading(true,this.$el);
                    var _this = this;
                    var wsp = this.$el;
                    require(
                            [_url],function(pageView){
                                app.showLoading(false,wsp);
                                var page_view = new pageView({'app':app,params:params,wizard:container});
                                if(container){
                                    //giving access to wizard 
                                    container.page = page_view; 
                                    container.$el.find(".step-contents").append(page_view.$el);
                                    if(page_view.init){
                                        page_view.init();      //This will initilize any controls that are in page.
                                    }
                                    container.initStep();                                                                                   
                                }
                                else{
                                    wsp.find(".campaign-content").append(page_view.$el);
                                    if(page_view.init){
                                        page_view.init();      //This will initilize any controls that are in page.
                                    }
                                }
                                _this.attachView(wsp,page_view);
                            }
                     );
                },   
                attachView:function(ws,pageView){
                    var workspace_id = ws.attr("id").split("_")[1]; 
                    $("#wp_li_"+workspace_id).data('viewObj',pageView);
                },
                initScroll:function(el){
            
                this.$win=$(window)
                ,this.$nav = this.$('.camp_header')
                ,this.$tabs = $('.ws-tabs')
                ,this.$tray = $('.icons-bar')
                ,this.container = $("#container")
                , this.navTop = el.find('.camp_header').length && el.find('.camp_header').offset().top                
                , this.isFixed = 0;
                
                this.processScroll=_.bind(function(){
                 // fix sub nav on scroll                
                  var i, scrollTop = this.$win.scrollTop();
                  if (scrollTop >= this.navTop && !this.isFixed && this.container.height()>803) {
                    this.isFixed = 1
                    this.$nav.addClass('workspace-fixed');
                    this.$nav.css("width",this.$(".campaign-content").width());
                    this.$tabs.addClass('tab-fixed');
                    this.$tray.addClass('tray-fixed');
                  } else if (scrollTop <= this.navTop && this.isFixed) {
                    this.isFixed = 0
                    this.$nav.removeClass('workspace-fixed');
                    this.$nav.css("width","auto");
                    this.$tabs.removeClass('tab-fixed');
                    this.$tray.removeClass('tray-fixed');
                  }
                
                 
                },this);
                this.processScroll();
                this.$win.on('scroll', this.processScroll);                                
             }
        });
});
