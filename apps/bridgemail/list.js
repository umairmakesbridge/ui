define(['text!html/list.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
                id: 'step_container',
                events: { 

                 },

                initialize: function () {
                        this.template = _.template(template);				
                        this.render();
                },

                render: function () {
                        this.$el.html(this.template({}));

                },
                stepsCall:function(){
                    
                }
        });
});