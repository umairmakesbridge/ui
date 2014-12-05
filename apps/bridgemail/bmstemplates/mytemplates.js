define(['text!bmstemplates/html/mytemplates.html'],
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
                this.addNewTemplateBtn.attr("data-original-title","Add Template")
                this.tempCount = null;
                this.app.showLoading("Loading Templates...",this.$el);  
                var _this = this;
                this.current_ws.find('.workspace-field').remove();
                require(["bmstemplates/templates"],function(templatesPage){  								                                    
                    _this.page = new templatesPage({page:_this,app:_this.app,selectAction:'Create Campaign',hideCreateButton:true,selectTextClass:'createcamp',selectCallback:_.bind(_this.createCampaign,_this)});								
                    _this.page.on('updatecount',_.bind(_this.addCountHeader,_this));
                    _this.$el.html(_this.page.$el);                            
                    _this.page.init();
                    _this.addNewTemplateBtn.click(_.bind(_this.page.createTemplate,_this.page));
                    
                    if(_this.action){
                        _this.page.createTemplate();
                        $("#create-template-container .loading").remove();
                    }
                })
                
            },
            addCountHeader:function(){
               this.ws_header = this.current_ws.find(".camp_header .edited");   
               var count_header =  '<ul class="c-current-status">';
                 count_header += '<li class="'+this.app.getClickableClass(this.total_count)+'"><span class="badge pclr18 tcount showtooltip temp-count ttval" search="all" data-original-title="View All Templates">'+this.total_count+'</span>Total Templates</li>';             
                 count_header += '</ul>';  
                 var $countHeader = $(count_header);                                                        
                 this.ws_header.append($countHeader); 
                 this.tempCount = this.ws_header.find('.temp-count').parent().addClass('font-bold');
                 this.tempCount.click(_.bind(this.page.triggerAll,this.page));
                 this.ws_header.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false}); 
            },
            createCampaign: function(obj)
            {
                    var templateId =  $.getObj(obj,"a").attr("id").split("_")[1];
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Create a new Campaign using Template',
                      buttnText: 'Create',
                      bgClass :'campaign-tilt',
                      plHolderText : 'Enter campaign name here',
                      emptyError : 'Campaign name can\'t be empty',
                      createURL : '/pms/io/campaign/saveCampaignData/',
                      fieldKey : "campName",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token'),templateNumber:templateId},
                      saveCallBack :  _.bind(this.app.mainContainer.createCampaign,this.app.mainContainer) // Calling same view for refresh headBadge
                    });
                    
                    /*var camp_obj = this;
                    var dialog_title = "New Campaign";
                    var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"650px","margin-left":"-325px"},
                        bodyCss:{"min-height":"100px"},							   
                        buttons: {saveBtn:{text:'Create Campaign'} }                                                                           
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["campaigns/newcampaign"],function(newcampPage){                                     
                            var mPage = new newcampPage({camp:camp_obj,app:camp_obj.app,newcampdialog:dialog,templateID:templateId});
                            dialog.getBody().html(mPage.$el);
                            dialog.saveCallBack(_.bind(mPage.createCampaign,mPage,templateId));
                    });*/
            }            
            
        });
});