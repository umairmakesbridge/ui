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
             
          
            
        });
});
