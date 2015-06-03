define(['text!reports/html/reportflow.html','reports/report_row'],
        function (template,reportRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'content-inner',
                events: {                    
                     'click .addbar li':'addReport'
                },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
                    this.render();
                },
                render: function ()
                {                     
                  this.$el.html(this.template({}));                    
                  this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.app.removeSpinner(this.$el);
                },
                addReport:function(event){
                    var rType = $.getObj(event, "li").attr("data-type");
                    var row_view = new reportRow({app:this.app,reportType:rType});
                    row_view.$el.insertBefore(this.$(".addbar"));
                }

            });
        });
