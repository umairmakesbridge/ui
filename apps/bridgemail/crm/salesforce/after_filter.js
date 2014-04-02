define(['text!crm/salesforce/html/after_filter.html','bms-crm_filters','jquery.chosen'],
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
                        this.camp = this.options.camp;
                        this.$el.html(this.template({}));
                        this.savedObject = this.options.savedObject;
                        this.filter_type = this.options.type;
                        this.$(".lead-filter").crmfilters({app:this.app,object:'lead'});
                        this.$(".contact-filter").crmfilters({app:this.app,object:'contact'});
                        this.loadSavedData();
                        
                        if(this.filter_type=="lead"){
                           this.$(".lead-accordion").show();
                           this.$(".contact-accordion").hide();
                        }
                        else if(this.filter_type=="contact"){
                            this.$(".contact-accordion").show();
                            this.$(".lead-accordion").hide();
                        }
                        else{
                           this.$(".lead-accordion").show();
                           this.$(".contact-accordion").show();
                        }
                        
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
                        else if(this.savedObject.sfObject=="both" && this.savedObject.filterFields){
                            this.$(".lead-accordion").show();
                            this.$(".contact-accordion").show();
                            this.$(".contact-filter").data("crmfilters").loadFilters(this.savedObject);
                            this.$(".lead-filter").data("crmfilters").loadFilters(this.savedObject);
                        }
                    }
                },
                saveFilter:function(dialog,callBack){
                    if(this.camp.states){
                        this.camp.states.step3.sf_filters.contact = this.$(".contact-filter").data("crmfilters").saveFilters('contact');
                        this.camp.states.step3.sf_filters.lead =  this.$(".lead-filter").data("crmfilters").saveFilters('lead');
                    }
                    else{
                        this.camp.contactFilter = this.$(".contact-filter").data("crmfilters").saveFilters('contact');
                        this.camp.leadFilter =  this.$(".lead-filter").data("crmfilters").saveFilters('lead');
                    }
                    dialog.hide();
                    callBack("Salesforce");
                }
        });
});