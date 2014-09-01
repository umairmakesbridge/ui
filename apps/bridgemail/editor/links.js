define(['text!editor/html/links.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Link Dialog view for MEE
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'content_containerLinkGUI',
            /**
             * Attach events on elements in view.
            */
            events: {
                
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
                    model: this.model,
                    showWait: this.showWait
                }));                
                
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            insertLink:function(dialog){
                
            }
            
            
        });
});