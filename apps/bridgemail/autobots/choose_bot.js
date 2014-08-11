/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/choose_bot.html','autobots/autobot_name'],
        function(template,AutobotName) {
            'use strict';
            return Backbone.View.extend({
                events: {
                    'click .close-choose-bot':'closeAutobot',
                    'click .choosebot ul li a':'selectAutobot'
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.render();
                    var that = this;
                    if(this.options.type !==false){
                      setTimeout(function(){
                          that.selectAutobot();
                      },200)
                      
                    } 
                    
                },
                render: function() {
                    this.$el.html(this.template());
                },
                closeAutobot:function(){
                    $(this.el).remove();
                    this.remove();
                    $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove();
                    $('.autobots-modal-in').remove();
                },
                selectAutobot:function(ev){
                    var actionType = "";
                    var botType = "";
                    
                    if(this.options.type !== false){
                          actionType =   this.options.type == "EB"?"E":this.options.type;
                          botType = this.options.type == "EB"?"B":"N";
                    }else{    
                          actionType = $(ev.target).parents('li').data('bot');
                          botType = $(ev.target).parents('li').data('type');
                    }
                    
                    $('#new_autobot').html(new AutobotName({actionType:actionType,botType:botType,app:this.options.app,listing:this.options.listing}).el);

                }
            });
        });
