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
                    this.app = this.options.app
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
                           this.$el.parents('body').find('#new_autobot').removeAttr('class');
                    }else{    
                          actionType = $(ev.target).parents('li').data('bot');
                          botType = $(ev.target).parents('li').data('type');
                    }
                    var plHolderText =this.getCaption(actionType);
                    this.closeAutobot();
                    this.app.showAddDialog(
                    {
                        app: this.app,
                        heading: plHolderText,
                        buttnText: 'Create',
                        bgClass: '',
                        plHolderText: 'Enter bot name here',
                        emptyError: 'Autobot name can\'t be empty',
                        createURL: '/pms/io/trigger/saveAutobotData/',
                        fieldKey: "label",
                        postData: {type: 'create', BMS_REQ_TK: this.app.get('bms_token'), actionType:actionType,botType:botType},
                        saveCallBack: _.bind(this.addAutobot, this) // Calling same view for refresh headBadge
                    });
                    //$('#new_autobot').html(new AutobotName({actionType:actionType,botType:botType,app:this.options.app,listing:this.options.listing}).el);

                },
                getCaption:function(actionType){
                    var caption = ""; 
                    switch (actionType) {
                       case "E":
                           if (this.options.botType == "B") {
                                caption =  "Enter name for birthday bot";
                            } else {
                                caption = "Enter name for email bot";
                            }
                            break;
                        case "SC":
                            caption = "Enter name for score bot";
                            break;
                        case "A":
                            caption = "Enter name for alert bot";
                            break;
                        case "TG":
                            caption = "Enter name for tag bot";
                            break;
                    }
                    return caption;
                },
                addAutobot : function(field_text,_json){
                    //console.log('field_text : '+field_text +' And Complete Json ' + _json);
                    this.options.listing.fetchBots(0,_json[2],true);
                }
            });
        });
