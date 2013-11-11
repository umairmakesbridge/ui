define(['text!crm/netsuite/html/after_filter.html','bms-crm_filters'],
function (template,crm_filters) {
        'use strict';
        return Backbone.View.extend({
                id: 'accordion2',
                className:'accordion lc-accord',                
                events: {

                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.render();
                },

                render: function () {
                        this.app = this.options.app; 
                        this.$el.html(this.template({}));
                        this.$(".customer-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N'});
                        this.$(".contact-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N'});
                        this.$(".partner-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N'});
                }
        });
});