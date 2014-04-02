define(['text!html/mytemplates.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // My Templates Gallery Page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            id:'my_templates',
            className: 'template-gallry',
            /**
             * Attach events on elements in view.
            */            
            events: {				
                
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){              
               this.template = _.template(template);		
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.total_count = 0;
               this.$el.html(this.template({}));
               this.app = this.options.app;
               if(this.options.params && this.options.params.action){
                this.action = this.options.params.action;
               }
               
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){                
                this.current_ws = this.$el.parents(".ws-content");                 
                this.current_ws.find("#campaign_tags").hide();
                this.addNewTemplateBtn = this.current_ws.find(".camp_header #addnew_action");
                this.addNewTemplateBtn.attr("data-original-title","New Template")
                
                this.app.showLoading("Loading Templates...",this.$el);  
                var _this = this;
                require(["bmstemplates/templates"],function(templatesPage){  								                                    
                    var page = new templatesPage({page:_this,app:_this.app,selectAction:'Create Campaign',hideCreateButton:true,selectTextClass:'createcamp',selectCallback:_.bind(_this.createCampaign,_this)});								
                    page.on('updatecount',_.bind(_this.addCountHeader,_this));
                    _this.$el.html(page.$el);                            
                    page.init();
                    _this.addNewTemplateBtn.click(_.bind(page.createTemplate,page));
                    if(_this.action){
                        page.createTemplate();
                        $("#create-template-container .loading").remove();
                    }
                })
            },
            addCountHeader:function(){
               this.ws_header = this.current_ws.find(".camp_header .edited");   
               var count_header =  '<ul class="c-current-status">';
                 count_header += '<li><span class="badge pclr18 tcount">'+this.total_count+'</span>Total Templates</li>';             
                 count_header += '</ul>';  
                 var $countHeader = $(count_header);                                                        
                 this.ws_header.append($countHeader);                  
            },
            createCampaign: function(obj)
            {
                    var templateId =  $.getObj(obj,"a").attr("id").split("_")[1];
                    var camp_obj = this;
                    var dialog_title = "New Campaign";
                    var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"650px","margin-left":"-325px"},
                        bodyCss:{"min-height":"100px"},							   
                        buttons: {saveBtn:{text:'Create Campaign'} }                                                                           
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["newcampaign"],function(newcampPage){                                     
                            var mPage = new newcampPage({camp:camp_obj,app:camp_obj.app,newcampdialog:dialog,templateID:templateId});
                            dialog.getBody().html(mPage.$el);
                            dialog.saveCallBack(_.bind(mPage.createCampaign,mPage,templateId));
                    });
            }            
            
        });
});