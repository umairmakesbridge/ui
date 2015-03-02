define(['text!account/html/campaignemailsettings.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'campaignemailsettings setting-section',                
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
                   this.loadData();                   
                },
                loadData:function(){
                   
                },
                saveSettings: function(e){
                    var btn = $.getObj(e,"a");
                    if(btn.hasClass("saving")==false && this.validateForm()){
                        btn.addClass("saving");
                        this.$(".boxinner input").prop("readonly",true);
                        var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');                               
                        $.post(URL, {"type":"set","email":this.postObject['email'],"firstName":this.postObject['firstName'],"lastName":this.postObject['lastName'],
                                    "phone":this.postObject['phone'],"url":this.postObject['url'],"customerName":this.postObject['customerName']
                                    ,"customerLogo":this.postObject['customerLogo'],"address1":this.postObject['address1'],"address2":this.postObject['address2'],
                                    "senderName":this.$(".sender-name").val(),"replyToEmail":this.$(".reply-to").val(),"webAddress":this.postObject['webAddress'],"hasSFDataSyncAccess":this.postObject['hasSFDataSyncAccess']
                                })
                          .done(_.bind(function(data) {               
                              btn.removeClass("saving");
                              this.$(".boxinner input").prop("readonly",false);
                              var _json = jQuery.parseJSON(data);                              
                              if(_json[0]!=="err"){                                                                         
                                   this.app.showMessge("Email settings for campaign updated Successfully!");               
                                   this.postObject['senderName'] = this.$(".sender-name").val();
                                   this.postObject['replyToEmail'] = this.$(".reply-to").val();                                                                      
                              }
                              else{                                  
                                  this.app.showAlert(_json[1],this.$el);
                              }							                            
                         },this));
                    }
                },
                validateForm: function(){
                    var isValid = true;
                    var senderName = $.trim(this.$(".sender-name").val());                    
                    
                    if(senderName==""){
                        this.app.showError({
                            control:this.$('.sender-name').parents(".input-append"),
                            message: "Sender name can't be empty."
                        });
                        isValid = false;
                    }
                    
                    else{
                        this.app.hideError({control:this.$('.sender-name').parents(".input-append")}); 
                    }
                    
                    
                    return isValid ;
                }  
            });
        });
