define(['text!reports/html/campaign_pie_chart.html','highcharts','export-chart','funnel-chart'],
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
              
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.page.app;         
               this.xAxis = this.options.xAxis;
               this.yAxis = this.options.yAxis;
               this.title = this.options.title ?this.options.title:'';
               this.isStacked = this.options.isStacked;
               this.colors = this.options.colors?this.options.colors:['#454F88','#2F93E5','#62ABE6','#0C73C2','#3b5998','#bb0000'];               
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,                       
            createChart:function(_data){
               var that = this;                
               var options = {
                    chart: {
                        type: 'column',
                        backgroundColor: "transparent"
                    },
                    plotOptions:{
                      series:{colorByPoint:true}  
                    },
                    title: {
                        text: this.title,
                        style: {
                            "color": "#02afef",
                            "fontSize": "20px"
                        }
                    },
                    subtitle: {
                        text: '',
                        style: {
                            "color": "#999"
                        }
                    },
                    xAxis: {
                        type: this.xAxis.label,                        
                        title: {
                            text: '',                                                    
                            margin:30,
                            style: {
                                "color": "#4d759e"
                            }
                        },
                        labels: {
                            enabled: true,                            
                            style: {
                                fontSize: '12px',
                                fontFamily: "'PT Sans', sans-serif"
                            }
                        }
                    },                    
                    colors: this.colors,
                    yAxis: {
                        lineWidth:0,
                        minorGridLineWidth:1,
                        gridLineColor:'#cbd0d3',
                        min: 0,
                        title: {
                            text: '',
                            style: {
                                "color": "#4d759e"
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {                        
                        style: {color: "#fff"},
                        formatter: function () {                          
                            var tooltip_rect = that.$('.highcharts-tooltip path:nth-child(4)');
                            
                            tooltip_rect.attr("fill",this.point.color);
                            return '<b>' + that.app.addCommas(this.y) + '</b> ' + this.key;                                                       
                        }
                    },
                    series: []
                }
                
                if (this.isStacked){
                    options.series = _data;
                    options.xAxis['categories'] = this.xAxis.categories;
                    if(this.xAxis.categories.length<20){
                        options.xAxis['labels']["rotation"] = 0;
                    }
                    else if(this.xAxis.categories.length>20 && this.xAxis.categories.length<=50){
                        options.xAxis['labels']["rotation"] = -45;
                    }
                    else{
                        options.xAxis['labels']["rotation"] = -90;
                    }
                    options.tooltip = {
                        animation:false,
                        style: {color: "#fff"},
                        formatter: function () {
                            var tooltip_rect = that.$('.highcharts-tooltip path:nth-child(4)');
                            tooltip_rect.attr("fill",this.series.color);
                            return '<b>' + this.x + '</b><br/>' +
                                this.series.name + ': ' + that.app.addCommas(this.y) + '<br/>' 
                                //'Total: ' + that.app.addCommas(this.point.stackTotal);
                        }
                    };
                    options.plotOptions = {column:{
                        stacking: 'normal',
                        dataLabels: {
                            enabled: false,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                            style: {

                            }
                        }
                    }}
                }
                else{
                  options.series = [  {
                            name: this.yAxis.label,
                            data: _data,                            
                            dataLabels: {
                                enabled: true,                                
                                color: '#FFFFFF',                                
                                format: '{point.y:,.0f}', // one decimal
                                y: 25, 
                                style: {
                                    fontSize: '12px',
                                    fontFamily: "'PT Sans', sans-serif"
                                }
                            }
                        }
                  ]    
                }
                
                Highcharts.setOptions({
                    lang: {
                        thousandsSep: ',',
                        contextButtonTitle:'Choose an output format'
                    }
                });
                
                this.$el.highcharts(options);                           
            },
            createFunnelChart:function(_data){
                            
               var options = {
                    chart: {
                        type: 'funnel',
                        marginRight: 50
                    },
                    title: {
                        text: this.title,
                        x: -50
                    },
                    colors: this.colors,
                    plotOptions: {
                        series: {
                            dataLabels: {
                                enabled: false,
                                format: '<b>{point.name}</b> ({point.y:,.0f})',
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
                                softConnector: true
                            },
                            neckWidth: '30%',
                            neckHeight: '25%'                            
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    series: _data,
                }
                
                
                Highcharts.setOptions({
                    lang: {
                        thousandsSep: ',',
                        contextButtonTitle:'Choose an output format'
                    }
                });
                
                this.$el.highcharts(options);                           
            }
        });
});