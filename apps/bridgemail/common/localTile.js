define(['text!common/html/localTile.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Template Preview
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                /**
                 * Attach events on elements in view.
                 */
                tag:'div',
                className:'box sepia local local-adds',
                events: {
                    //'click .contact-remove-prev': 'removeContact'
                },
                /**
                 * Initialize view - backbone .
                 */
                initialize: function () {
                    this.app = this.options.app;
                    this.template = _.template(template);                    
                    this.userid = this.options.userId;
                    if(this.userid==='bayshoresolutions'){
                        this.$el.removeClass('local-adds');
                        this.$el.addClass('local-bayshore');
                    }
                    this.render();
                },
                /**
                 * Initialize view .
                 */
                render: function () {
                    this.$el.html(this.template());                                       
                },
                init: function () {

                    
                },
               
            });

        });

