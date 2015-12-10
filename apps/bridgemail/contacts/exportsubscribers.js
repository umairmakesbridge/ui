define(['text!contacts/html/exportsubscribers.html'],
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
                    this.app.removeSpinner(this.$el);                    
                    
                    this.$(".subscriberiframe").load(_.bind(function () {
                        this.app.showLoading(false,this.$el);
                        // this.$("#workflowlistsearch #clearsearch").click();
                        
                    },this))
                },
                resizeHeight:function(height){
                    this.$(".subscriberiframe").css("height",height+"px");
                },
                showLoadingMask:function(msg,reduceHeight){
                    if(reduceHeight){
                        this.$(".subscriberiframe").attr("src","about:blank").css("height","400px");
                    }
                    this.app.showLoading(msg?msg:"Loading Subscribers...",this.$el);    
                }
                

            });
        });
