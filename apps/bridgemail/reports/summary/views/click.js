/* 
 * Name:  Click View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Click View, TO Display Page Visits
 * Dependency: Page Click HTML
 */
 
define(['text!reports/summary/html/click.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
            tagName:"tr",
            className:"erow",
            events: {
                "click .page-view":"openPageViewsDialog",
            },
            initialize: function () {
                 this.template = _.template(template);				
                 this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            },
            truncateURL:function(url){
                if(url.length > 45) 
                    return url = url.substring(0,45);
                else return url;
            },
            checkTitle:function(title){
                if(!title) return this.model.get('pageURL');
                else return title;
            },
            getLogTime:function(){

                var logTime = this.options.app.decodeHTML(this.model.get('logTime'));
                if(logTime){
                    var arr = logTime.split(" ");
                    return   arr[2] ;
                }
            },dateSetting:function(sentDate, sep){
               if(sep =="/") 
                    var _date =  moment(sentDate,'MM/DD/YYYY');
                if(sep =="-")
                    var _date =  moment(sentDate,'YYYY-MM-DD');
                
                return _date.format("DD MMM YYYY");
             },
             openPageViewsDialog:function(){
                 var dialog_width = 80;
                     var articleNum = this.model.get('articleNum.encode')
                     var that = this;
                      var url = "";
                    
                      var url = this.model.get('articleURL');
                        var title = this.model.get('articleTitle');
                        url = title+'|-.-|'+url;
                   
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog(
                           {           
                                       title:'Page Views',
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'preview3',
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                     that.options.app.showLoading('Loading Page Views....',dialog.getBody());
                        var name = that.options.attr.email;
                        
                                 
                        require(["reports/summary/views/pageviews",],function(Views){
                                var mPage = new Views({article:articleNum,campNum:that.options.attr.campNum,subNum:that.options.attr.subNum,encode:that.model.get('articleNum.encode'),app:that.options.app,email:name,salestatus:that.options.attr.salestatus,url:url});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        });
                        return false;
             }
          
            
        });
});
