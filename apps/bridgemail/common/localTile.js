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
                    //this.url = '';
                    //this.bms_token = null;
                    //this.tempNum = null;
                    //this.original = 'N';
                    //this.html = 'Y';
                   // this.subNum = null;                    
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
                    
                    //this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {

                    //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
               
            });

        });

