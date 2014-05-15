define(['text!nurturetrack/html/buttons_row.html'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Target li view for nurture track 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'placeholder',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click .add-wait-r':'addWait',
                'click .add-message-r':'addMessage'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page
                    this.app = this.parent.app;    
                    this.showWait = typeof(this.options.showWait)!="undefined"?this.options.showWait:true;
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
            addWait:function(){                
                this.parent.addRowWait(this.$el);
            },
            addMessage:function(){
                this.parent.addRowMessage(this.$el);
            }
            
            
        });
});