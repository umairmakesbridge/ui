define(['text!nurturetrack/html/nurturetrack.html'],
        function(template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Nurture Track detail page view depends on 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({               
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {                    
                    this.template = _.template(template);
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function() {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
                    if (this.options.params && this.options.params.sub_id) {
                        this.sub_id = this.options.params.sub_id;
                    }
                    this.initControls();
                    
                }
                ,
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                init: function() {
                   

                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function() {

                   

                }

            });
        });