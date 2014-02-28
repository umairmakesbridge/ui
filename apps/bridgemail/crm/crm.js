define(['text!crm/html/crm.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
            /**
             * Attach events on elements in view.
            */  
            events: {
             },	
             /**
             * Initialize view .
            */
             initialize: function () {
                this.template = _.template(template);				
                this.app = this.options.app;
                this.render();
            },
            /**
             * Render view .
            */
            render: function () {                        
               this.$el.html(this.template({}));
            }
        });
});