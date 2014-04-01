/* 
 * Name: Google Chart Model
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Chart Model to populate Chart
 * 
 */
define(['text!reports/html/campaign_pie_chart.html','goog!visualization,1,packages:[corechart]','reports/summary/views/scontacts'],
function (template,googles, contactsView) {
               'use strict';
        return Backbone.View.extend({                        
            events: {				              
            },
            initialize:function(){
               this.template = _.template(template);
               this.render();
               
           },
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.page.app;   
               this.legend = this.options.legend;
               this.chartArea = this.options.chartArea;
               this.image = this.options.url;
               this.active_ws = $(document).find(".ws-content.active");
               
            },                       
            createChart:function(_data){
              if(this.chart){
                  this.chart.clearChart();
              }  
              var data = google.visualization.arrayToDataTable(_data);
              var options = {
                title: '',
                height:'280',
               
                 colors:['#454F88','#2F93E5','#62ABE6','#0C73C2','#B6CBDB'],
                chartArea:this.chartArea,    
                fontSize:12,
                pieSliceText: "none",
                tooltip: {
                    text: 'value'
                },
                legend:{
                        position: 'right',
                        alignment:'center'
                    },
                fontName:"'PT Sans',sans-serif",
                backgroundColor: 'transparent',
                'backgroundColor.stroke':'#ccc',
                'backgroundColor.strokeWidth':2 
                              
              };
              var formatter = new google.visualization.NumberFormat(
                        {pattern:'#,###'}
                );
              formatter.format(data, 1);      
              this.chart = new google.visualization.PieChart(this.el);
              var that = this;
                 google.visualization.events.addListener(this.chart, 'ready', function () {
                  that.image.append('<img style="display:none" src="' + that.chart.getImageURI() + '" id="img_download"/>');
                  });
                google.visualization.events.addListener(that.chart, 'select',function(){
                  var selectedItem = that.chart.getSelection()[0];
                        if (selectedItem) {
                          var topping = data.getValue(selectedItem.row, 0);
                          switch(topping){
                              case"Opens":
                                that.openViews();
                                break;
                              case"Clicks":
                                that.clickViews();
                                break;
                              case"Conversions":
                                that.convertViews();
                                break;
                              case"Page Views":
                                that.pageViews();
                                break;
                             }
                         }
                         
                    
                }); 
              this.chart.draw(data, options);
            },
             pageViews:function(ev){
                
                if(this.active_ws.find(".page-views").parents('li').hasClass('active')) return;
                this.clearHTML(); 
                this.active_ws.find(".page-views").parents('li').addClass('active');
                this.active_ws.find(".contacts_listing").html(new contactsView({type:"WV",app:this.options.app,campNum:this.options.campNum,listing:'page'}).el)
                this.active_ws.find(".contacts_listing").find(".closebtn").remove();
            },
            convertViews:function(ev){
               if(this.active_ws.find(".convert-views").parents('li').hasClass('active')) return;
               this.clearHTML();
               this.active_ws.find(".convert-views").parents('li').addClass('active');
               this.active_ws.find(".contacts_listing").html(new contactsView({type:"CT",app:this.options.app,campNum:this.options.campNum,listing:'page'}).el)
               this.active_ws.find(".contacts_listing").find(".closebtn").remove();
             },
            clickViews:function(ev){
                
                if(this.active_ws.find(".click-views").parents('li').hasClass('active')) return;
                this.clearHTML();  
                this.active_ws.find(".click-views").parents('li').addClass('active');
                 this.active_ws.find(".contacts_listing").html(new contactsView({type:"CK",app:this.options.app,campNum:this.options.campNum,listing:'page'}).el)
                 this.active_ws.find(".contacts_listing").find(".closebtn").remove();
            },
            openViews:function(ev){
                  if(this.active_ws.find(".open-views").parents('li').hasClass('active')) return;
                  this.clearHTML();
                  this.active_ws.find(".open-views").parents('li').addClass('active');
                  this.active_ws.find(".contacts_listing").html(new contactsView({type:"OP",app:this.options.app,campNum:this.options.campNum,listing:'page'}).el)
                 this.active_ws.find(".contacts_listing").find(".closebtn").remove();
              
            },
            clearHTML:function(self){
               this.closeContactsListing();
              this.active_ws.find(".contacts_listing").empty();
               this.active_ws.find(".contacts_listing").hide();
               this.active_ws.find(".contacts_listing").show();
               this.active_ws.find(".contacts_listing").find("#tblcontacts tbody #loading-tr").remove();
            },
            closeContactsListing:function(){
             this.active_ws.find(".page-views").parents('li').parents('ul').find('li').removeClass('active');
             this.active_ws.find(".campaign-clickers").empty('');
             this.active_ws.find(".campaign-clickers").hide();
            }
            
        });
});