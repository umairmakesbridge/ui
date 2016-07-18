define(['text!reports/html/customreports.html'],
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
                                      
                    this.current_ws.find("#addnew_action").attr("data-original-title", "Add Chart").click(_.bind(this.addChart, this));
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
                    this.app.showLoading(msg?msg:"Loading Custom Reports...",this.$el);    
                },
                addChart:function(){
                    var addChartButton = this.$(".customreportsiframe")[0].contentWindow;
                    if(addChartButton.showChartWindow){
                        addChartButton.showChartWindow();
                    }
                },
                openChart:function(url){
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialog = this.app.showDialog({title:'Custom Charts',
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:false,                              
                              bodyCss:{"min-height":dialog_height+"px"}
                              
                    });                    
                    var iframHTML = "<iframe src=\""+url+"\"  width=\"100%\" class=\"customChartIframe\" frameborder=\"0\" style=\"height:"+(dialog_height-7)+"px\"></iframe>"
                    dialog.getBody().html(iframHTML);
                    this.app.showLoading("Loading Custom Chart...",dialog.getBody());
                         dialog.getBody().find('.customChartIframe').load(_.bind(function () {
                                this.app.showLoading(false,dialog.getBody());
                                // this.$("#workflowlistsearch #clearsearch").click();

                         },this))
                    dialog.saveCallBack(function(){
                        //dialog.$(".customChartIframe")[0].contentWindow.saveUpdateData();
                    });
                }

            });
        });
