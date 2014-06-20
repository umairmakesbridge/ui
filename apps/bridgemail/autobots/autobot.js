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
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.model.on('change', this.render, this);
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template(this.model.toJSON()));
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
                }
               
            });
        });
