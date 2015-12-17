define(['text!account/html/changepassword.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'changepassword setting-section',                
                events: {                    
                    'click .change-password':'changePassword'
                },
                initialize: function () {
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
                   setTimeout(_.bind(function(){this.$(".current-password").val('').focus();},this),100);
                   
                },
                changePassword:function(e){
                    var btn = $.getObj(e,"a");
                    if(btn.hasClass("saving")==false && this.validateForm()){
                        btn.addClass("saving");
                        this.$("#changepassword-form input").prop("readonly",true);
                        var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');                    
                        $.post(URL, this.$("#changepassword-form").serialize())
                          .done(_.bind(function(data) {               
                              btn.removeClass("saving");
                              this.$("#changepassword-form input").prop("readonly",false).val("");
                              var _json = jQuery.parseJSON(data);                              
                              if(_json[0]!=="err"){                                                                         
                                   this.app.showMessge("Password changed Successfully!");                                                                                                                                     
                              }
                              else{                                  
                                  this.app.showAlert(_json[1],this.$el);
                              }							                            
                         },this));
                    }
                },
                validateForm: function(){
                    var isValid = true;
                    var cur_password = $.trim(this.$(".current-password").val());
                    var new_password = $.trim(this.$(".new-password").val());
                    var confirm_password = $.trim(this.$(".confirm-password").val());
                    
                    if(cur_password==""){
                        this.app.showError({
                            control:this.$('.current-password').parents(".input-append"),
                            message: "Please provide current password."
                        });
                        isValid = false;
                    }                    
                    else{
                        this.app.hideError({control:this.$('.current-password').parents(".input-append")}); 
                    }
                    
                    if(new_password==""){
                        this.app.showError({
                            control:this.$('.new-password').parents(".input-append"),
                            message: "Please enter new password."
                        });
                        isValid = false;
                    }
                    else if(new_password.length<8){
                        this.app.showError({
                            control:this.$('.new-password').parents(".input-append"),
                            message: "Password should be 8 character long."
                        });
                        isValid = false;
                    }
                    else{
                        this.app.hideError({control:this.$('.new-password').parents(".input-append")}); 
                    }
                    
                    if(confirm_password==""){
                        this.app.showError({
                            control:this.$('.confirm-password').parents(".input-append"),
                            message: "Please enter new password again."
                        });
                        isValid = false;
                    }
                    else{
                        this.app.hideError({control:this.$('.confirm-password').parents(".input-append")}); 
                    }
                    
                    if(confirm_password!=="" && new_password!==""){
                        if(confirm_password!==new_password){
                            this.app.showError({
                                control:this.$('.confirm-password').parents(".input-append"),
                                message: "Passwords are not matching."
                            });
                            isValid = false;
                        }
                        else{
                            this.app.hideError({control:this.$('.confirm-password').parents(".input-append")}); 
                        }
                        
                    }
                    return isValid ;
                }            
                
            });
        });
