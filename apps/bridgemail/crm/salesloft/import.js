define(['text!crm/salesloft/html/import.html','jquery.icheck'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'cont-box row-fluid',
                events: {

                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	                                        
                    this.render();                            
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));      	                    
                    this.$el.css({"position":"static","margin":"0px"});
                    this.initControl();   
                    
                },
                initControl:function(){
                    this.$("#import_time").chosen({no_results_text: 'Oops, nothing found!', width: "100%"});
                    this.$('input.checkinput').iCheck({
                        checkboxClass: 'checkinput'
                    });
                    //this.setUpSalesforceFields();                                                                                     
                }
        });
});