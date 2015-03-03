define(['text!account/html/salesforcesettings.html','jquery.icheck'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'salesforcesettings setting-section',                
                events: {                    
                    'click .save-settings': 'saveSettings'
                },
                initialize: function () {
                    this.postObject = this.options.postObj;
                    this.template = _.template(template);                    
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                                        
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {          
                    this.$('.salesforce-sync').iCheck({
                        checkboxClass: 'checkinput'
                    });
                },
                saveSettings: function(e){
                    var btn = $.getObj(e,"a");
                    if(btn.hasClass("saving")==false){
                        btn.addClass("saving");
                        this.$(".boxinner input").prop("readonly",true);
                        var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');                               
                        $.post(URL, {"type":"set","email":this.postObject['email'],"firstName":this.postObject['firstName'],"lastName":this.postObject['lastName'],
                                    "phone":this.postObject['phone'],"url":this.postObject['url'],"customerName":this.postObject['customerName']
                                    ,"customerLogo":this.postObject['customerLogo'],"address1":this.postObject['address1'],"address2":this.postObject['address2'],
                                    "senderName":this.postObject['senderName'],"replyToEmail":this.postObject['replyToEmail'],"webAddress":this.postObject['webAddress'],"hasSFDataSyncAccess":this.$(".salesforce-sync")[0].checked?"Y":"N"
                                })
                          .done(_.bind(function(data) {               
                              btn.removeClass("saving");
                              this.$(".boxinner input").prop("readonly",false);
                              var _json = jQuery.parseJSON(data);                              
                              if(_json[0]!=="err"){                                                                         
                                   this.app.showMessge("Salesforce settings updated Successfully!");               
                                   this.postObject['hasSFDataSyncAccess'] = this.$(".salesforce-sync")[0].checked?"Y":"N";                                   
                              }
                              else{                                  
                                  this.app.showAlert(_json[1],this.$el);
                              }							                            
                         },this));
                    }
                }
            });
        });
