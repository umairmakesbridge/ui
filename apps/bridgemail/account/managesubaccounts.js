define(['text!account/html/managesubaccounts.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'managesubaccounts setting-section',                
                events: {                    
                },
                initialize: function () {
                    this.template = _.template(template);                    
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                                        
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {                   
                   this.loadData();                   
                },
                loadData:function(){
                   
                }
            });
        });
