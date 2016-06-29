/* 
 * Name: Single Page View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Page View, TO Display Page Visits
 * Dependency: Page View HTML
 */
 
define(['text!reports/summary/html/pageview.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
            tagName:"tr",
            className:"erow",
            events: {
                
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
                if(!this.model.get('logTime')) return;
                var logTime = this.options.app.decodeHTML(this.model.get('logTime'));
                if(logTime){
                    var arr = logTime.split(" ");
                    return arr[1] + " "+ arr[2] ;
                }
            },
            getScoreChange:function(){
                var score = this.model.get('scoreChange');
                 if(score < 0){
                    return "-"+score;
                }else if(score == 0){
                    return score;
                }else if(score > 0){
                    return "+"+score;;
                }
                
            },
            scoreColor:function(){
                if(this.model.get('scoreChange') < 0){
                    return " #cc0000";
                }else if(this.model.get('scoreChange') == 0){
                    return " #000";
                }else if(this.model.get('scoreChange') > 0){
                    return " #57b916";
                }
            }
            
        });
});
