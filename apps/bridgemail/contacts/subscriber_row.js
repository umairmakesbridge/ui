define(['text!contacts/html/subscriber_row.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'contactbox',
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
                this.$el.html(this.template({
                    model: this.model                            
                }));
                this.initControls();                    
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$('input.checkpanel').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                 });
            }
            
        });
});