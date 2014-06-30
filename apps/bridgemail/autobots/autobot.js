/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobot.html', 'moment','jquery.chosen'],
        function(template, moment,chosen) {
            'use strict';
            return Backbone.View.extend({
                tagName: "tr",
                className: "erow",
                events: {
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
                            label = "<img src='img/scorebot-icon.png'>";
                            break;
                        case "A":
                            label = "<img src='img/alertbot-icon.png'>";
                            break;
                        case "E":
                            label = "<img src='img/mailbot-icon.png'>";
                     }
                      return label;
                },
                getPlayedOn:function(){
                   var playedOn = this.model.get('lastPlayedTime');
                   if(playedOn){
                     return "<em>Played on</em>"+this.dateSetting(playedOn)+"</span>";
                   }else{
                        
                     return "<em>Last edited on</em>"+this.dateSetting(this.model.get('updationTime'))+"</span>";   
                   }
                },
                 dateSetting: function(sentDate) {
                    var _date = moment(sentDate, 'MM-DD-YY');
                    return _date.format("DD MMM YYYY");
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
                        if(this.model.get('recurTimes') !="0"){
                            label = label + " , not more than "+this.model.get('recurTimes')+" time"
                        }
                        return "<a class='icon-b reoccure showtooltip' data-original-title='"+label+"'></a>";
                    }else{
                        return "";
                    }
                },
                showPageViews:function(ev){
                    var that = this;
                    var offset = $(ev.target).offset();
                    var botId = this.model.get('botId.encode');
                    $('#div_pageviews').show();
                    $('#div_pageviews').empty();
                    $('#div_pageviews').append("<div class='loading-contacts' style='margin-top:15px; font-weight:bold; text-align:center; margin-left:auto; margin-right:auto;'>Loading...</div> ");

                    $('#div_pageviews').css({top:offset.top-90});
                    require(["recipientscontacts/rcontacts"],function(Contacts){
                       var objContacts = new Contacts({app:that.options.app,botId:botId,type:'autobots'});
                        $('#div_pageviews').css('padding-top','0');
                        $('#div_pageviews').html(objContacts.$el);
                    });
                }
               
            });
        });
