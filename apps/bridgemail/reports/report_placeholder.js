define(['text!reports/html/report_placeholder.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className: 'report-placeholder',
                events: {
                    
                },
                initialize: function () {
                    this.template = _.template(template);                    
                    this.sub = this.options.sub;
                    this.app = this.sub.app;                    
                    this.render();
                },
                render: function ()
                {   
                    var showWebStats = false;
                    if(this.app.get("bridgestatz") && this.app.get("bridgestatz").id){
                            showWebStats = true;                   
                    }
                    this.$el.html(this.template({showWebStats:showWebStats}));                    
                    
                },
                init: function () {
                    
                }
            });
        });
