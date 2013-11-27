define(['text!crm/salesforce/html/after_filter.html','bms-crm_filters'],
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
                        this.app = this.options.camp.app;                         
                        this.$el.html(this.template({}));
                        this.savedObject = this.options.savedObject;
                        this.$(".lead-filter").crmfilters({app:this.app,object:'lead'});
                        this.$(".contact-filter").crmfilters({app:this.app,object:'contact'});
                        this.loadSavedData();
                },
                loadSavedData:function(){
                    if(this.savedObject){
                        if(this.savedObject.sfObject=="lead"){
                            this.$(".lead-accordion").show();
                            this.$(".contact-accordion").hide();
                            this.$(".lead-filter").data("crmfilters").loadFilters(this.savedObject);
                        }
                        else if(this.savedObject.sfObject=="contact"){
                            this.$(".contact-accordion").show();
                            this.$(".lead-accordion").hide();
                            this.$(".contact-filter").data("crmfilters").loadFilters(this.savedObject);
                        }
                        else if(this.savedObject.sfObject=="both"){
                            this.$(".lead-accordion").show();
                            this.$(".contact-accordion").show();
                            this.$(".contact-filter").data("crmfilters").loadFilters(this.savedObject);
                            this.$(".lead-filter").data("crmfilters").loadFilters(this.savedObject);
                        }
                    }
                }
        });
});