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
                        this.app = this.options.camp.app;
                        this.$el.html(this.template({}));
                        this.savedObject = this.options.savedObject;
                        this.$(".customer-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N',object:'customer'});
                        this.$(".contact-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N',object:'contact'});
                        this.$(".partner-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N',object:'partner'});
                        this.loadSavedData();
                },
                loadSavedData:function(){
                     if(this.savedObject){
                         if(this.savedObject.nsObject.indexOf("customer")>-1){
                            this.$(".customer-accordion").show();                            
                            this.$(".contact-accordion,.partner-accordion").hide();                            
                            this.$(".customer-filter").data("crmfilters").loadFilters(this.savedObject);
                        }
                        else if(this.savedObject.nsObject=="contact"){
                            this.$(".contact-accordion").show();
                            this.$(".customer-accordion,.partner-accordion").hide();                            
                            this.$(".contact-filter").data("crmfilters").loadFilters(this.savedObject);
                        }
                        else if(this.savedObject.nsObject=="partner"){
                            this.$(".partner-accordion").show();
                            this.$(".customer-accordion,.contact-accordion").hide();                            
                            this.$(".partner-filter").data("crmfilters").loadFilters(this.savedObject);
                        }
                     }
                }
        });
});