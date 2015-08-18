/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['jquery', 'backbone', 'underscore', 'app', 'text!contacts/html/multipleadd.html','fileuploader','bms-dragfile','bms-tags','scrollbox'],
	function ($, Backbone, _, app, template,fileuploader,dragfile,bmstags,scrollbox) {
		'use strict';
		return Backbone.View.extend({
                    
                id: '',
                tags : 'div',
                initialize: function () {
                          this.template = _.template(template);
                          this.app = app;
                          this.parent = this.options.sub; 
                          this.uploaded = 0;
                          this.render();
			},
                        events:{
                         'click .close-choose-bot':'closeDialog',
                         'click .single-sub':'addSubscriber',
                         'click .opencsv':'opeCSV',
                         'click .multisub-email':'multiEmails',
                        },
                        render : function(){
                            this.$el.html(this.template({}));
                        },
                        closeDialog : function(){
                             $(this.el).remove();
                             this.remove();
                             $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove();
                             $('.autobots-modal-in').remove();
                        },
                        addSubscriber: function(){
                            this.closeDialog();
                            var _this = this;
                            var dialog_width = 1000;
                            this.editable = true;
                    
                                var dialog_height = $(document.documentElement).height() - 182;
                                var btn_prp = {title: this.editable?'Add Contact':'View Profile',
                                    css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                                    headerEditable: false,
                                    headerIcon: 'account',
                                    bodyCss: {"min-height": dialog_height + "px"}

                                }
                                if(this.editable){
                                    btn_prp['buttons']= {saveBtn: {text: 'Save', btnicon: 'save'}};
                                   // if (this.sub_fields["conLeadId"]) {
                                   //     btn_prp['newButtons'] = [{'btn_name': 'Update at Salesforce'}];
                                   // }
                                }
                                var dialog = this.app.showDialog(btn_prp);
                                this.app.showLoading("Loading...", dialog.getBody());
                                require(["contacts/subscriber_fields"], function(sub_detail) {
                                    var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                                    var page = new sub_detail({sub: _this.parent,isSalesforceUser:false,isAddFlag:true});
                                    dialog.getBody().html(page.$el);
                                     page.$el.addClass('dialogWrap-' + dialogArrayLength);
                                    _this.app.showLoading(false, page.$el.parent());
                                    /*if (_this.sub_fields["conLeadId"]) {
                                        dialog.saveCallBack2(_.bind(page.updateSubscriberDetailAtSalesForce, page, dialog));
                                    }*/
                                    dialog.saveCallBack(_.bind(page.createSubscriber, page, dialog));
                                     
                                    _this.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                                    _this.app.dialogArray[dialogArrayLength - 1].currentView = page; // New Dialog
                                    
                                });
                        },
                        opeCSV : function(){
                                this.closeDialog();
                                this.app.mainContainer.csvUpload();
                        },
                        multiEmails : function(){
                             this.closeDialog();
                            var _this = this;
                            var dialog_width = 642;
                            this.editable = true;
                    
                                var dialog_height = $(document.documentElement).height() - 582;
                                var btn_prp = {title: this.editable?'Add Contact By Emails':'View Profile',
                                    css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "70px"},
                                    headerEditable: false,
                                    headerIcon: 'account',
                                    bodyCss: {"min-height": dialog_height + "px"}

                                }
                                if(this.editable){
                                    btn_prp['buttons']= {saveBtn: {text: 'Save', btnicon: 'save'}};
                                   // if (this.sub_fields["conLeadId"]) {
                                   //     btn_prp['newButtons'] = [{'btn_name': 'Update at Salesforce'}];
                                   // }
                                }
                                var dialog = this.app.showDialog(btn_prp);
                                this.app.showLoading("Loading...", dialog.getBody());
                                require(["contacts/subscriber_fields"], function(sub_detail) {
                                    var page = new sub_detail({sub: _this.parent,isSalesforceUser:false,isAddFlag:true,emailsFlag:true});
                                    dialog.getBody().html(page.$el);
                                    dialog.$el.find('.contactsEmails').focus();
                                    /*if (_this.sub_fields["conLeadId"]) {
                                        dialog.saveCallBack2(_.bind(page.updateSubscriberDetailAtSalesForce, page, dialog));
                                    }*/
                                    dialog.saveCallBack(_.bind(page.createSubscriberViaEmail, page, dialog));
                                   
                                });
                        }
                })
        })
