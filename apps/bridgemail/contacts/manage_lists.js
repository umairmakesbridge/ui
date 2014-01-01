define(['text!contacts/html/manage_lists.html'],
function (template,jqueryui) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber subscribed lists View
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'model_form',
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
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.render();
            },
            /**
             * Render view on page.
            */
            render: function () {
                    this.$el.html(this.template({}));
                    this.initControls();                   
            },
            initControls:function(){
               
            }
            
        });
});