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
               this.$el.html(this.template({}));
               this.app = this.options.app;           
               
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){                
                this.app.showLoading("Loading Templates...",this.$el);  
                var _this = this;
                require(["bmstemplates/templates"],function(templatesPage){  								                                    
                    var page = new templatesPage({page:_this,app:_this.app,selectCallback:_.bind(_this.editTemplate,_this),selectAction:'Edit Template'});								
                    _this.$el.html(page.$el);                            
                    page.init();
                })
            }
            ,
            editTemplate:function(){
                var self = this;
                var t_id = this.template_id;
                var dialog_title = this.template_id ? "Edit Target" : "";
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-219;
                var dialog = this.app.showDialog({title:dialog_title,
                          css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                          headerEditable:true,
                          bodyCss:{"min-height":dialog_height+"px"},
                          buttons: {saveBtn:{text:'Save Target'} }                                                                           
                    });
                this.app.showLoading("Loading...",dialog.getBody());                                  
                  require(["target/target"],function(targetPage){                                     
                       var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog});
                       self.states.step3.targetDialog =  mPage;
                       dialog.getBody().html(mPage.$el);
                       dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                  });
            }
            
            
        });
});