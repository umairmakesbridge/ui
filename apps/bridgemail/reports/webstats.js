define(['text!reports/html/campaign_pie_chart.html','highcharts','goog!visualization,1,packages:[corechart]'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Webstats Reports page 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({                        
            /**
             * Attach events on elements in view.
            */            
            events: {				              
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){
              // _.bindAll(this, 'searchByTag','updateRefreshCount');  
               this.template = _.template(template);		               
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.page.app;                  
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,                       
            createChart:function(_data,ele){
               ele.highcharts(_data);
            },
            createTable: function (_data,ele){                
                var data = google.visualization.arrayToDataTable(_data);
                var table = new google.visualization.Table(ele);
                table.draw(data, {showRowNumber: true, width: '100%', height: '100%',
                                    cssClassNames:{headerRow:'tableHeadRow',
                                                   oddTableRow: 'oddRowCss' 
                                        }
                                    }
                        );
            }
        });
});