define(['text!crm/salesforce/html/export.html','jquery.chosen','daterangepicker'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                              
                events: {

                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.render();
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.$el.html(this.template({}));      	
                                       
                    this.initControl();                                                              
                },
                initControl:function(){
                    this.$(".nosearch").chosen({disable_search_threshold: 10,width:'300px'});                       
                    this.$('#daterange').daterangepicker();
                }
        });
});