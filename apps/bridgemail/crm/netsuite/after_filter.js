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
                        this.camp = this.options.camp;
                        this.$el.html(this.template({}));
                        this.filter_type = this.options.type;
                        this.savedObject = this.options.savedObject;
                        this.$(".customer-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N',object:'customer'});
                        this.$(".contact-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N',object:'contact'});
                        this.$(".partner-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'N',object:'partner'});
                        this.loadSavedData();
                        
                        if(this.filter_type=="customer"){
                           this.$(".customer-accordion").show();
                           this.$(".contact-accordion,.partner-accordion").hide();
                        }
                        else if(this.filter_type=="contact"){
                            this.$(".contact-accordion").show();
                            this.$(".partner-accordion,.customer-accordion").hide();
                        }
                        else if(this.filter_type=="partner"){
                           this.$(".partner-accordion").show();
                           this.$(".contact-accordion,.customer-accordion").hide();
                        }
                        this.$('input').iCheck({
                                checkboxClass: 'checkinput'
                        })
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
                },
                saveFilter:function(dialog,callBack){
                    if(this.camp.states){
                        this.camp.states.step3.ns_filters.customer = this.$(".customer-filter").data("crmfilters").saveFilters('customer');
                        this.camp.states.step3.ns_filters.contact =  this.$(".contact-filter").data("crmfilters").saveFilters('contact');
                        this.camp.states.step3.ns_filters.partner =  this.$(".partner-filter").data("crmfilters").saveFilters('partner');
                        if(this.filter_type!=="customer"){
                            this.camp.states.step3.ns_filters.nsObject = this.filter_type;
                        }
                        else{                        
                            var cust_val = this.$(".customer-type input:checked").map(function(){
                                return $(this).val()
                            }).toArray().join();
                            if(cust_val){
                                   this.camp.states.step3.ns_filters.nsObject = cust_val;
                            }          
                            else{
                              this.app.showAlert('Please at least on option from Customer, Lead, Or Prospect',$("body"),{fixed:true});  
                              return false;
                            }
                        }
                    }
                    else{
                        this.camp.customerFilter = this.$(".customer-filter").data("crmfilters").saveFilters('customer');
                        this.camp.contactFilter =  this.$(".contact-filter").data("crmfilters").saveFilters('contact');
                        this.camp.partnerFilter =  this.$(".partner-filter").data("crmfilters").saveFilters('partner');
                        if(this.filter_type!=="customer"){
                            this.camp.nsObject = this.filter_type;
                        }
                        else{                        
                            var cust_val = this.$(".customer-type input:checked").map(function(){
                                return $(this).val()
                            }).toArray().join();
                            if(cust_val){
                                   this.camp.nsObject = cust_val;
                            }          
                            else{
                              this.app.showAlert('Please at least on option from Customer, Lead, Or Prospect',$("body"),{fixed:true});  
                              return false;
                            }
                        }
                    }
                    dialog.hide();
                    callBack("Netsuite");
                }
        });
});