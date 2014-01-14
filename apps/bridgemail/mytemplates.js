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
                this.current_ws = this.$el.parents(".ws-content");
                                
                this.app.showLoading("Loading Templates...",this.$el);  
                var _this = this;
                require(["bmstemplates/templates"],function(templatesPage){  								                                    
                    var page = new templatesPage({page:_this,app:_this.app,selectAction:'Edit Template'});								
                    _this.$el.html(page.$el);                            
                    page.init();
                    _this.current_ws.find(".camp_header #addnew_action").click(_.bind(page.createTemplate,page));
                })
            }
            
            
            
        });
});