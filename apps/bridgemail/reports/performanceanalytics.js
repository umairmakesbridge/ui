define(['text!reports/html/performanceanalytics.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {                    
                        "click .refresh_btn": function () {
                           this.showLoadingMask();                           
                        }
                },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
                    this.render();
                },
                render: function ()
                {                     
                  this.$el.html(this.template({}));                    
                  this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.showLoadingMask();
                    this.current_ws = this.$el.parents(".ws-content");                                        
                    this.ws_header = this.current_ws.find(".camp_header .edited"); 
                    this.current_ws.find("#campaign_tags").remove();
                                      
// this.current_ws.find("#addnew_action").attr("data-original-title", "Add Chart").click(_.bind(this.addChart, this));
                    this.$(".customreportsiframe").load(_.bind(function () {
                        this.app.showLoading(false,this.$el);    
                        this.app.removeSpinner(this.$el);  
                    },this))
                },
                resizeHeight:function(height){
                    this.$(".customreportsiframe").css("height",height+"px");
                },
                showLoadingMask:function(msg,reduceHeight){
                    if(reduceHeight){
                        this.$(".customreportsiframe").attr("src","about:blank").css("height","400px");
                    }
                    this.app.showLoading(msg?msg:"Loading Email Send Analytics...",this.$el);    
                }
            });
        });
