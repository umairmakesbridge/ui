/* 
 * Name: Graph View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Displaying Graph on Main Summary Page.
 * Dependency: Graph HTML, Chart, SContacts 
 */

define(['text!reports/summary/html/graphs.html','reports/summary/views/chart','reports/summary/views/scontacts'],
function (template,chart,contactsView) {
        'use strict';
        return Backbone.View.extend({
            className: 'cstats',
            events: {
                "click .bounce-class li":"openContacts",
                'click .download':'getImgData'
            },
            initialize: function () {
                 this.template = _.template(template);	
                 this.campNum = this.options.campNum;
                 this.chart_data = "";
                 this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.loadChart();
            },
            loadChart:function(){

                    this.chartPage = new chart({ws:this.$el.parents(".ws-content.active"),url:this.$el.find(".download"),app:this.options.app,campNum:this.campNum,page:this,legend:{"true":true},chartArea:{width:"90%",height:"90%"}});
                    this.$("#chart").html(this.chartPage.$el).css({"width":"50%","margin-top": "2%","text-align":"center","vertical-align": "middle","line-height": "320px"});
                    this.chart_data = {clickCount:0,conversionCount:0,openCount:0,pageViewsCount:0,sentCount:0};
                    this.chartPage.$el.css({"width":"100%","height":"100%"});                                   
                    this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(this.model.get('clickCount'));
                    this.chart_data["conversionCount"] = this.chart_data["conversionCount"] +parseInt(this.model.get('conversionCount'));
                    this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(this.model.get('openCount'));
                    this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(this.model.get('pageViewsCount'));
                    this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(this.model.get('sentCount'));
                    var _data =[
                     ['Action', 'Count'],
                       ['Opens',   this.chart_data["openCount"]],
                       ['Page Views',       this.chart_data["pageViewsCount"]],
                       ['Conversions',  this.chart_data["conversionCount"]],
                       ['Clicks',    this.chart_data["clickCount"]]
                   ];

                    this.chartPage.createChart(_data);  
                    
                    
                    _.each(this.chart_data,function(val,key){
                        this.$("."+key).html(this.options.app.addCommas(val));
                    },this);
                                
            },
            openContacts:function(ev){
                 var offset = $(ev.target).offset();
                 var count = $(ev.target).parents('li').data("count");
                 var active_ws = this.$el.parents(".ws-content");
                 if(!count){
                     active_ws.find(".campaign-clickers").hide();
                     return;
                 }
                 var type = $(ev.target).parents('li').data('type');
                  active_ws.find(".campaign-clickers").removeAttr('style');
                  active_ws.find(".campaign-clickers").css({top:offset.top-120, left:offset.left-570});
                  active_ws.find(".campaign-clickers").show();
                  active_ws.find(".campaign-clickers").html(new contactsView({type:type,app:this.options.app,campNum:this.campNum}).el);
            },
            getStatus:function(){
                var status = this.options.app.getCampStatus(this.options.status);
                if(status == "Sent"){
                    return "<span class='pclr18' style='width:auto;'>Sent <strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong></span>";
                }else if(status == "Pending"){
                    var html = "<span class='pclr18' style='width:auto;'>Sent <strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong></span>";
                    
                    html = html + "<span class='pclr6' style='width:auto;'>Pending <strong>"+this.options.app.addCommas(this.model.get('pendingCount'))+"</strong></span>";
                    return html;
                }
                
                
            },
             getImgData:function() {
               var that = this;
                require(["reports/summary/vendors/jspdf"],function(jsPDF){
                   var doc = new jsPDF();
                   var active_ws = that.$el.parents(".ws-content");
                    var name = active_ws.find("#workspace-header").html();      
                    var imgData = that.$el.find("#img_download").attr('src');
                    doc.setFontSize(20);
                    doc.text(20, 20, name);
                    var date = active_ws.find("#campaign_tags").find('.sentat em').html() +" " + active_ws.find("#campaign_tags").find('.sentat strong').html();
                    doc.setFontSize(11);
                    doc.text(20, 28, date);
                    
                    doc.setFontSize(13);
                     var html =   'Opens = '+that.options.app.addCommas(that.chart_data["openCount"]);
                     html = html+ '  Clicks = '+that.options.app.addCommas(that.chart_data["clickCount"]);
                     html = html+ '  Conversions = '+that.options.app.addCommas(that.chart_data["conversionCount"]);
                     html = html+ '   Page Views = '+that.options.app.addCommas(that.chart_data["pageViewsCount"]);
                     doc.text(20, 35, html);
                  
                    doc.addImage(imgData, 'PNG', 35, 30,130,90);
                    doc.save('datauri');
                    //var string = doc.output('datauristring');
                    //var x = window.open();
                    //x.document.open();
                    //x.document.location=string;
                });
      
                }  
             });
});

