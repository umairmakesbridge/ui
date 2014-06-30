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
                },
                render: function() {
                    this.$el.html(this.template());
                },
                closeAutobot:function(){
                    $(this.el).remove();
                    this.remove();
                    $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove(); 
                },
                selectAutobot:function(ev){
                    var botType = $(ev.target).parents('li').data('bot');
                    $(this.el).parents('#new_autobot').html(new AutobotName({botType:botType,app:this.options.app}).el);
                    $(this.el).parents('#new_autobot').parents('.campaign-content').append('<div class="modal-backdrop  in autobots-modal-in"></div>');
                }
            });
        });
