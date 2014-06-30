/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobots_tile.html', 'moment','jquery.chosen'],
        function(template, moment,chosen) {
            'use strict';
            return Backbone.View.extend({
                tagName: "li",
                className: "span3",
                events: {
                   "click .percent":"showPercentage" ,
                   "mouseover .img":"showImageH",
                   "mouseout .img":"hideImageH",
                   'click .show-sent-views':'showPageViews'
                   
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.model.on('change', this.render, this);
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template(this.model.toJSON()));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                getStatus:function(){
                    if(this.model.get('status') == "D")
                     return "<a class='cstatus pclr1'> Pause </a>";
                    if(this.model.get('status') == "R")
                     return "<a class='cstatus pclr18'> Playing </a>";
                },
                getAutobotImage:function(){
                     var label = "";
                     switch(this.model.get('actionType')){
                         case "SC":
                            label = "<img src='img/scorebot.png'>";
                            break;
                        case "A":
                            label = "<img src='img/alertbot.png'>";
                            break;
                        case "E":
                            label = "<img src='img/mailbot.png'>";
                     }
                      return label;
                },
                showImageH:function(ev){
                    var src = $(ev.target).attr('src');
                    src = src.replace(".", "-h.");
                    $(ev.target).attr('src',src);
                    
                },
                hideImageH:function(ev){
                    var src = $(ev.target).attr('src');
                    src = src.replace("-h.", ".");
                    $(ev.target).attr('src',src);
                    
                },
                
                showPercentage:function(ev){
                   this.current_ws = this.$el.parents(".ws-content");
                   this.current_ws.find(".pstats").remove();
                   var str = "<div class='pstats' style='display:block;'>";
                   str = str + "<ul>";
                   if(this.model.get('sentCount') == "0"){
                       str = str + "<li class='sent'><strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong><span>Sent</span></li>";
                   }else{
                    str = str + "<li class='sent'><a class='show-sent-views showtooltip' data-original-title='Click to view contacts'><strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong><span>Sent</span></a></li>";
                   }
                   if(this.model.get('pendingCount') == "0"){
                       str = str + "<li class='pending'><strong>"+this.options.app.addCommas(this.model.get('pendingCount'))+"</strong><span>Pending</span></li>";
                   }else{
                    str = str + "<li class='pending '><a class='show-sent-views' data-original-title='Click to view contacts'><strong>"+this.options.app.addCommas(this.model.get('pendingCount'))+"</strong><span>Sent</span></a></li>";
                   }
                   str = str + "</ul>";
                   str = str + "</div>";   
                   $(ev.target).parents(".percent_stats").append(str);
                },
                 isRecurring:function(){
                    if(this.model.get('isRecur') == "Y"){
                        var label = "";
                        switch(this.model.get('recurType')){
                            case"M":
                              label ="Recur after every " + this.model.get('recurPeriod')+ " months";
                                break;
                            case"Y":
                                label ="Recur after every " + this.model.get('recurPeriod')+ " years";
                                break;
                            case"D":
                                label ="Recur after every " + this.model.get('recurPeriod')+ " days";
                                break;
                        }
                        var label2 = label;
                        if(this.model.get('recurTimes') !="undefined" && this.model.get('recurTimes') !="0"){
                           var label2 = " , not more than "+this.model.get('recurTimes')+" time";
                           label2 = label+label2;
                           label = label + "...";
                        }
                        return "<span class='icon-b reoccure showtooltip'  data-original-title='"+label2+"'>"+label+"</span>";
                    }else{
                        return "<span>&nbsp;</span>";
                    }
                },
                getDate:function(){
                     var playedOn = this.model.get('lastPlayedTime');
                   if(playedOn){
                     return "<em data-original-title='Played on' class='showtooltip'>"+this.dateSetting(playedOn)+"</em>";
                   }else{
                        
                     return "<em data-original-title='Last edited on' class='showtooltip'>"+this.dateSetting(this.model.get('updationTime'))+"</e,=m>";   
                   }
                },
                 dateSetting: function(sentDate) {
                    var _date = moment(sentDate, 'MM-DD-YY');
                    return _date.format("DD MMM YYYY");
                },
                 showPageViews:function(ev){
                    var that = this;
                    var offset = $(ev.target).offset();
                    var botId = this.model.get('botId.encode');
                    $('#div_pageviews').show();
                    $('#div_pageviews').empty();
                    $('#div_pageviews').append("<div class='loading-contacts' style='margin-top:15px; font-weight:bold; text-align:center; margin-left:auto; margin-right:auto;'>Loading...</div> ");

                    $('#div_pageviews').css({top:offset.top-190});
                    require(["recipientscontacts/rcontacts"],function(Contacts){
                       var objContacts = new Contacts({app:that.options.app,botId:botId,type:'autobots'});
                        $('#div_pageviews').css('padding-top','0');
                        $('#div_pageviews').html(objContacts.$el);
                    });
                }
            });
        });
 