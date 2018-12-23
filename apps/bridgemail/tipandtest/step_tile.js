define(['text!tipandtest/html/step_tile.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track preview view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'li',
            className:'span3',
            /**
             * Attach events on elements in view.
            */
            events: {
             
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                this.parent = this.options.page       
                this.app = this.parent.app; 
                this.template = _.template(template);				                                 
                this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                                    
                this.$el.html(this.template({
                    model: this.model
                }));                
                this.initControls();                 
            },
            initControls:function(){
              this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            },
            messagePreview:function(defaults_json){
               
            },
            reportShow:function(){                
               
            }
            
        });
});