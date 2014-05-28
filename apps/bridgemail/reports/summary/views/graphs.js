/* 
 * Name: Graph View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Displaying Graph on Main Summary Page.
 * Dependency: Graph HTML, Chart, SContacts 
 */

define(['text!reports/summary/html/graphs.html','reports/summary/views/chart','reports/summary/views/scontacts',  "reports/summary/vendors/jspdf"],
function (template,chart,contactsView,jsPDF) {
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
                 this.data = [];
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
                // $("html,body").css('height','100%').animate({scrollTop:0},600).css("height","");  
                 var offset = $(ev.target).parents('li').offset();
                 var count = $(ev.target).parents('li').data("count");
                 var active_ws = this.$el.parents(".ws-content");
                 if(!count){
                     active_ws.find(".campaign-clickers").hide();
                     return;
                 }
                 var type = $(ev.target).parents('li').data('type');
                  active_ws.find(".campaign-clickers").removeAttr('style');
                  active_ws.find(".campaign-clickers").css({top:offset.top-90, left:offset.left-530});
                  active_ws.find(".campaign-clickers").show();
                  active_ws.find(".campaign-clickers").html(new contactsView({type:type,app:this.options.app,campNum:this.campNum}).el);
            },
            getStatus:function(){
                if(this.options.campaignType == "T") 
                     return "";
                 
                var status = this.options.app.getCampStatus(this.options.status);
                if(status == "Sent"){
                    return "<span class='pclr18' style='width:auto;'>Sent <strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong></span>";
                }else if(status == "Pending"){
                    var html = "<span class='pclr18' style='width:auto;'>Sent <strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong></span>";
                    
                    html = html + "<span class='pclr6 pdf-pending' style='width:auto;'>Pending <strong>"+this.options.app.addCommas(this.model.get('pendingCount'))+"</strong></span>";
                    return html;
                }
                
                
            } ,
            getBase64FromImageUrl:function(url,logo){
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext('2d');
                var img = new Image;
                img.src = url;
                if(logo)
                ctx.drawImage(img,0,0,140,65); // Or at whatever offset you like
                else
                ctx.drawImage(img,0,0,180,50); // Or at whatever offset you like
                return canvas.toDataURL("image/png");
                
            },
            generatePDF:function(){
                
                var doc =   new jsPDF();
               console.log(this.data);
                var y =  5;
                _.each(this.data,function(image){
                    console.log(y);
                   doc.addImage(image, 'PNG', 6, y,150,50);
                    y = y + 80;
                
                })
                doc.save('datauri');  
                          
            },
            getImgData:function() {
                 var that = this;
                require(['reports/summary/collections/links'],function(Links){
                    /*
                   * that.$el.find(".div_pdf").remove();
                    var active_ws = that.$el.parents(".ws-content");
                    var name = active_ws.find("#workspace-header").html();  
                    var tags = active_ws.find("#campaign_tags").html();
                     var tag = active_ws.find("#campaign_tags").find("ul li .tag").html();
                    var sentAt = active_ws.find("#campaign_tags").find('.sentat strong').html();
                     
                    //that.$el.append(new pdfConversionView({clickCount:that.model.get('clickCount'),app:that.options.app,campNum:that.campNum,campName:name,sentAt:sentAt, tags:tags,tag:tag}).el);
                    
                   *   html2canvas(that.$el.find("#report_chart"),{
                        onrendered: function(canvas) {
                          
                      d = canvas.toDataURL('image/png');
                       
                       that.data.push(d);
                       var imgData = that.$el.find("#img_download").attr('src');
                        that.data.push(imgData);
                       html2canvas(that.$el.find(".links_pdf"),{
                        onrendered: function(c) {
                           
                       d = c.toDataURL('image/png');
                       
                      
                       that.data.push(d);
                      
                        that.generatePDF();
                 
                      }
                   });
                      }
                   });
                    
                   console.log($(".links_pdf"));
                   var d;
                    */
                   
                   //  that.$el.find(".div_pdf").remove();
                     
                    var doc =  new jsPDF( );
                   var active_ws = that.$el.parents(".ws-content");
                    var name = active_ws.find("#workspace-header").html();    
                    doc.setProperties({
                        title: name,
                        subject: name,     
                        author: 'Makesbridge',
                        keywords: 'pdf, javascript,geenerated',
                        creator: 'Makesbridge'
                    });
                     var logo = that.getBase64FromImageUrl(that.$el.find('#imgLogo')[0].src,true);
                    
                     if(logo){
                      doc.addImage(logo, 'PNG', 10, 1,70,18);
                     }
                     var conn =   that.getBase64FromImageUrl(that.$el.find('#imgCon')[0].src,false);
                    if(conn){
                       doc.addImage(conn, 'PNG', 140, 1,80,18);
                     }
                      
                    var imgData = that.$el.find("#img_download").attr('src');
                    doc.setFontSize(20);
                    doc.text(20, 20, name);
                    var tags = that.options.tags;
                    
                    if(tags){
                     doc.setFontSize(8);
                     doc.text(20, 25, "Tags: "+ tags);     
                    }
                    var date = active_ws.find("#campaign_tags").find('.sentat em').html() +" " + active_ws.find("#campaign_tags").find('.sentat strong').html();
                    doc.setFontSize(11);
                    doc.text(20, 32, date);
                    doc.setFontSize(11);
                    var sent = that.$el.parents(".ws-content").find(".sent-pending span:first strong").html();
                     doc.text(80, 32, "Sent: " + sent);
                     var pending = that.$el.parents(".ws-content").find(".sent-pending .pdf-pending strong").html();
                     if(pending)doc.text(100, 32, "Pending: " + pending);
                    if(imgData){
                      doc.addImage(imgData, 'PNG', 35, 30,130,90);
                    }
                    var counter = 20;
                    
                    
                    that.$el.parents(".ws-content").find(".chartstatdetail li").each(function(){
                      var text = $(this).find('span').html();
                      var percent = $(this).find('em').html();
                      var count = $(this).find('strong').html();
                       doc.setFontSize(10);
                       doc.text(counter, 115,text );
                       doc.setFontSize(7);
                       doc.text(counter + 1, 120,percent );
                       doc.setFontSize(9);
                       doc.text(counter +10, 120,count );
                       counter = counter + 40;
                    });
                     
                    
                     doc.setFontSize(10);
                            
                     doc.text(20, 131, "Top Links");
                     doc.text(150, 131, "Unique Clickers");
                    var _data = {}
                    _data['type'] = "topLinks";
                    _data['campNum'] = that.options.campNum;
                    var objLinks = new Links();
                    objLinks.fetch({data:_data,success:function(data){
                            var y = 140;
                             doc.setFontSize(7);
                         _.each(data.models,function(m){
                             doc.text(20, y, that.truncateURL(that.options.app.decodeHTML(m.get('articleURL')))+ "   ("+that.calculateProgress(m.get('clickCount'))+")");
                             doc.text(165, y, that.options.app.addCommas(m.get('clickCount')));
                             y = y + 7;
                         });
                       doc.save('datauri');       
                    }});
                    
                     //that.$el.append("<div style='display:none' id='links'></div>");
                     //that.$el.find("#links").html(new ViewLinks({clickCount:that.model.get('clickCount'),app:that.options.app,campNum:that.campNum}).el);  
                    //var source = that.$el.find("#links").html();
                    //console.log(source);
                    
                   
                     
                    //var string = doc.output('datauristring');
                    //var x = window.open();
                    //x.document.open();
                    //x.document.location=string;
                });
                   
                }, 
                truncateURL:function(url){
                if(url.length > 120) 
                    return url = url.substring(0,120);
                else return url;
            } ,
                calculateProgress:function(click){
                     var percent =  (parseInt(click)/parseInt(this.options.clicks) * 100);
                    percent = Math.ceil(percent);
                    percent = (isNaN(percent = parseInt(percent, 10)) ? 0 : percent)
                    return percent + "%";
            },
             });
});

