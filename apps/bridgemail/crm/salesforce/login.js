define(['text!crm/salesforce/html/login.html'],
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
                        this.app = this.options.app; 
                        this.$el.html(this.template({}));                        
                }
        });
});