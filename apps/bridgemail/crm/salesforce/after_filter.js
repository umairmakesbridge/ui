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
                        this.$(".contactbyopp-filter").crmfilters({app:this.app,object:'opportunity'});
                        this.$(".checkpanel")
                        this.$(".checkpanel").iCheck({
                                checkboxClass: 'checkinput'
                          })
                        this.loadSavedData();
                        this.$("#refresh_list").hide();
                        if(this.filter_type=="lead"){
                           this.$(".lead-accordion").show();
                           this.$(".contact-accordion,.contactbyopp-accordion").hide();
                        }
                        else if(this.filter_type=="contact"){
                            this.$(".contact-accordion").show();
                            this.$(".lead-accordion,.contactbyopp-accordion").hide();
                        }
                        else if(this.filter_type=="opportunity"){
                            this.$("#refresh_list").show();
                            this.$(".contact-accordion").hide();
                            this.$(".lead-accordion").hide();
                             this.$(".contactbyopp-accordion").show();                             
                        }
                        else{
                           this.$(".lead-accordion,.contact-accordion").show();                           
                           this.$(".contactbyopp-accordion").hide();
                        }
                        if(this.camp.refreshList){
                            this.$(".refresh-block").show();
                            this.$(".contactbyopp-filter").css("margin-top","17px")
                        }
                        else{
                            this.$(".refresh-block").hide();
                            this.$(".contactbyopp-filter").css("margin-top","0px")
                        }
                        
                },
                loadSavedData:function(){
                    if(this.savedObject){                       
                                                
                        if(this.savedObject.filterType=="opportunity"){
                            this.$(".contact-accordion,.lead-accordion").hide();                            
                            this.$(".contactbyopp-filter").data("crmfilters").loadFilters(this.savedObject);
                            if(this.savedObject.isRefresh=="Y"){
                                this.$(".checkpanel").iCheck("check");
                            }
                        }
                        else{
                             if(this.savedObject.sfObject=="lead"){
                                this.$(".lead-accordion").show();
                                this.$(".contact-accordion").hide();
                                this.$(".contactbyopp-accordion").hide();
                                this.$(".lead-filter").data("crmfilters").loadFilters(this.savedObject);
                            }
                            else if(this.savedObject.sfObject=="contact"){
                                this.$(".contact-accordion").show();
                                this.$(".lead-accordion").hide();
                                this.$(".contactbyopp-accordion").hide();
                                this.$(".contact-filter").data("crmfilters").loadFilters(this.savedObject);
                            }                        
                            else if(this.savedObject.sfObject=="both" && this.savedObject.filterFields){
                                this.$(".lead-accordion").show();
                                this.$(".contact-accordion").show();
                                this.$(".contactbyopp-accordion").hide();
                                this.$(".contact-filter").data("crmfilters").loadFilters(this.savedObject);
                                this.$(".lead-filter").data("crmfilters").loadFilters(this.savedObject);
                            }
                        }
                        
                    }
                },
                saveFilter:function(dialog,callBack){
                    if(this.camp.states){
                        this.camp.states.step3.sf_filters.contact = this.$(".contact-filter").data("crmfilters").saveFilters('contact');
                        this.camp.states.step3.sf_filters.lead =  this.$(".lead-filter").data("crmfilters").saveFilters('lead');
                        this.camp.states.step3.sf_filters.opportunity =  this.$(".contactbyopp-filter").data("crmfilters").saveFilters('contact');
                    }
                    else{
                        this.camp.contactFilter = this.$(".contact-filter").data("crmfilters").saveFilters('contact');
                        this.camp.leadFilter =  this.$(".lead-filter").data("crmfilters").saveFilters('lead');
                        this.camp.opportunityFilter =  this.$(".contactbyopp-filter").data("crmfilters").saveFilters('contact');
                        this.camp.refreshList = this.$("#refresh_contacts").prop("checked")?"Y":"N";
                    }
                    if(this.camp.refreshList){
                    dialog.showPrevious();
                    }
                    else{
                        dialog.hide();
                    }
                    callBack("Salesforce");
                }
        });
});