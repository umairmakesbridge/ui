define(['text!crm/highrise/html/after_filter.html','bms-crm_filters'],
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
                        this.$(".customer-filter").crmfilters({app:this.app,showAdvanceOption:false,filterFor:'H',object:'people'});
                        this.loadSavedData();
                        this.$('input').iCheck({
                                checkboxClass: 'checkinput'
                        })
                          this.$('.addfilter .btn-green').on('click',function(){
                                    $(this).parents("#panel_1").css('height','auto');
                          });           
                          this.$('.addfilter').parents('.target-listing').css('overflow','inherit');
                          
                },
                loadSavedData:function(){
                     if(this.savedObject){
                           // this.$(".customer-accordion").show();                            
                            //this.$(".contact-accordion,.partner-accordion").hide();                            
                            this.$(".customer-filter").data("crmfilters").loadFilters(this.savedObject);
                             
                     }
                } 
        });
});