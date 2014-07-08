/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobot_name.html','jquery.searchcontrol'],
        function(template,searchcontrol) {
            'use strict';
            return Backbone.View.extend({
                events: {
                    'click .close-autobot':'closeAutobot',
                    'click .next-action':'nextAction',
                    'keyup #txtAutobotName':'captureEnterKey'
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.autobotName = "";
                    this.render();
                    var that = this;
                    setTimeout(function(){
                        $(that.el).find('#txtAutobotName').focus();
                    },100);
                    
                },
                render: function() {
                    this.$el.html(this.template());
                },
                closeAutobot:function(){
                    $(this.el).remove();
                    $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove(); 
                    this.remove();
                },
                captureEnterKey:function(e){
                    var key = e.keyCode || e.which;
                    if(key==13){
                        this.nextAction();
                    }
                },
                nextAction:function(ev){
                    
                  this.autobotName = $(this.el).find('#txtAutobotName').val();
                  if(!this.autobotName){
                    this.options.app.showError({
                        control:$(this.el).find('.uid-container'),
                        message:"Autobot Name can not be empty!"
                    });
                    $(this.el).find('#txtAutobotName').focus();
                    return;
                  }
                   this.saveAutobotData(this.options.actionType,this.options.botType);
                  
                  
                },
                chooseAutobotType:function(){
                    
                     switch(this.options.actionType){
                      case "E":
                          $(this.el).remove();
                          if(this.options.botType == "B"){
                            this.openBirthDayAutobot();
                          }else{
                              this.openEmailAutobot();
                          }
                         break;
                      case "SC":
                          $(this.el).remove();
                        
                          this.openScoreAutobot();
                          break;
                      case "A":
                          $(this.el).remove();
                          this.openAlertAutobot();
                          break;
                      case "TG":
                          $(this.el).remove();
                          this.openTagAutobot();
                          break;
                  }
                         
                 $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove();
                 
                },
                saveAutobotData:function(actionType,bType){
                    console.log(actionType + 'bot' + bType);
                        var post_data = {label:this.autobotName,actionType:actionType,botType:bType};             
                        var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=create";
                        var result = false;
                        var that = this;
                        $.post(URL, post_data)
                        .done(function(data) { 
                             var _json = jQuery.parseJSON(data);
                              if(_json[0]!=="err"){
                                   that.chooseAutobotType();
                               }
                               else{
                                    that.options.app.showError({
                                        control:$(that.el).find('.uid-container'),
                                        message:_json[1]
                                    });
                                    $(that.el).find('#txtAutobotName').focus();
                                    return;
                               }
                             return result;
                       });
                  
                    
                },
                //1
                openAlertAutobot:function(){
                     var that = this;
                       var dialog_width = 80;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog({
                                       title:this.autobotName,
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'bot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Alert Autobots....',dialog.getBody());
                        require(["autobots/alert",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType,app:that.options.app});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        }); 
                },
                //2
                 openEmailAutobot:function(){
                     var that = this;
                       var dialog_width = 80;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog({
                                       title:this.autobotName,
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'bot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Email Autobots....',dialog.getBody());
                        require(["autobots/email",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType,app:that.options.app});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        }); 
                },
                //3
                 openTagAutobot:function(){
                     var that = this;
                       var dialog_width = 80;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog({
                                       title:this.autobotName,
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'bot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Tag Autobots....',dialog.getBody());
                        require(["autobots/tag",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType,app:that.options.app});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        }); 
                },
                //4
                 openScoreAutobot:function(){
                     var that = this;
                       var dialog_width = 80;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog({
                                       title:this.autobotName,
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'bot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Score Autobots....',dialog.getBody());
                        require(["autobots/score",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType,app:that.options.app});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        }); 
                },//5
                 openBirthDayAutobot:function(){
                     var that = this;
                     console.log('I am inside function');
                       var dialog_width = 80;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog({
                                       title:this.autobotName,
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'bot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Birthday Autobots....',dialog.getBody());
                        require(["autobots/birthday",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType,app:that.options.app});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        }); 
                }
            });
        });
