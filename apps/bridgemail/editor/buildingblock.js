define(['text!editor/html/building.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Building Block Dialog view for MEE
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click #cssmenuLinkGUI li':'_changeTab'               
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {                                        
                    this.template = _.template(template);	                    
                    this.render();                             
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                }));                   
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            }       
            
        });
});