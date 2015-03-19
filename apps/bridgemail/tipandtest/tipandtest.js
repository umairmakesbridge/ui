define(['text!tipandtest/html/tipandtest.html'],
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
                className:'tip_test',
                events: {
                    'click .csvupload': 'uploadCSV',
                    'click .open-campaigns':'openCampaigns'
                },
                /**
                 * Initialize view - backbone .
                 */
                initialize: function () {
                    this.app = this.options.app;
                    this.template = _.template(template);
                    
                    this.render();
                },
                /**
                 * Initialize view .
                 */
                render: function () {

                    this.$el.html(this.template());
                    
                   this.init();
                },
                init: function () {
                        //this.$el.parents('.ws-content').find('.camp_header').remove();
                        this.app.removeSpinner(this.$el);
                },
                uploadCSV : function(){
                    this.app.mainContainer.csvUpload();
                },
                openCampaigns : function(){
                    this.app.mainContainer.campaignListing();
                }
               
            });

        });

