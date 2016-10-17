define(['text!common/html/bouncereport.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {                    },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
                    this.render();
                },
                render: function ()
                {                     
                   this.$el.html(this.template({})); 
                   
                },
                init: function () {
                    this.showLoadingMask();
                    this.current_ws = this.$el.parents(".ws-content");                                        
                    this.ws_header = this.current_ws.find(".camp_header .edited"); 
                    this.current_ws.find("#campaign_tags").remove();
                                   
                    
                    this.$(".bouncereports").load(_.bind(function () {
                        this.app.showLoading(false,this.$el);
                        this.app.removeSpinner(this.$el);
                        // this.$("#workflowlistsearch #clearsearch").click();
                        
                    },this))
                },
                resizeHeight:function(height){
                    this.$(".bouncereports").css("height",height+"px");
                },
                showLoadingMask:function(msg,reduceHeight){
                    if(reduceHeight){
                        this.$(".bouncereports").attr("src","about:blank").css("height","400px");
                    }
                    this.app.showLoading(msg?msg:"Loading Bounce Campaign Report...",this.$el);    
                }
                

            });
        });
