define(['text!reports/html/campaign_pie_chart.html','goog!visualization,1,packages:[corechart]'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Campaign Reports page 
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
               this.vAxisLogScale = false;
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.page.app;   
               this.legend = this.options.legend;
               this.chartArea = this.options.chartArea;
               this.vAxisLogScale = this.options.vAxisLogScale;
               this.isStacked = this.options.isStacked?true:false;
               this.noColor = this.options.randomColor ? true:false;
               this.colors = this.options.colors?this.options.colors:['#454F88','#2F93E5','#62ABE6','#0C73C2','#3b5998','#bb0000'];
               this.title = this.title?this.title:'';
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,                       
            createChart:function(_data){
              if(this.chart){
                  this.chart.clearChart();
              }  
              var data = google.visualization.arrayToDataTable(_data);
              var options = {
                title: this.title,                        
                legend:this.legend,                         
                chartArea:this.chartArea,    
                fontSize:12,                                
                bar: { groupWidth: '45%' },
                fontName:"'PT Sans',sans-serif",
                backgroundColor: 'transparent',
               'backgroundColor.stroke':'#ccc',
                vAxis: this.vAxisLogScale ? {logScale:this.vAxisLogScale}:{},
               isStacked : this.isStacked 
              };
              if(!this.noColor){
                  options["colors"]=this.colors ;
              }
              var formatter = new google.visualization.NumberFormat(
                        {pattern:'#,###'}
                );
              formatter.format(data, 1);      
              this.chart = new google.visualization.ColumnChart(this.el);
              this.chart.draw(data, options);
             
            }
        });
});