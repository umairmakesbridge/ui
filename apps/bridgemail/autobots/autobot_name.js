/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobot_name.html'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                events: {
                    'click .close-autobot':'closeAutobot',
                    'click .next-action':'nextAction'
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.autobotName = "";
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template());
                },
                closeAutobot:function(){
                    $(this.el).remove();
                    this.remove();
                },
                nextAction:function(ev){
                  this.autobotName = $(this.el).find('#txtAuotbotName').val();;
                  switch(this.options.botType){
                      case "email":
                          $(this.el).remove();
                          this.openEmailAutobot();
                          break;
                      case "bdaybot":
                          $(this.el).remove();
                          this.openBirthDayAutobot();
                          break;
                      case "scorebot":
                          $(this.el).remove();
                          this.openScoreAutobot();
                          break;
                      case "alertbot":
                          $(this.el).remove();
                          this.openAlertAutobot();
                          break;
                      case "tagbot":
                          $(this.el).remove();
                          this.openTagAutobot();
                          break;
                  }
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
                                       headerIcon : 'autobot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Alert Autobots....',dialog.getBody());
                        require(["autobots/alert",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType});
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
                                       headerIcon : 'autobot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Email Autobots....',dialog.getBody());
                        require(["autobots/email",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType});
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
                                       headerIcon : 'autobot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Tag Autobots....',dialog.getBody());
                        require(["autobots/tag",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType});
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
                                       headerIcon : 'autobot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Score Autobots....',dialog.getBody());
                        require(["autobots/score",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        }); 
                },//5
                 openBirthDayAutobot:function(){
                     var that = this;
                       var dialog_width = 80;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog({
                                       title:this.autobotName,
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'autobot',
                                       buttons: {saveBtn:{text:'Save'}},
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Birthday Autobots....',dialog.getBody());
                        require(["autobots/birthday",],function(Alert){
                                var mPage = new Alert({name:that.autobotName, botType:that.options.botType});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        }); 
                }
            });
        });
