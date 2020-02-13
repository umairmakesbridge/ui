define(['text!crm/esp/mailgun/html/login.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {                   
                    "click .btnSaveLogin":function(obj){
                        if($(obj.target).hasClass('saving'))
                                return false;
                        else
                        {                                                        
                            var isValid =  true;
                            if(isValid){
                                this.saveCredentials();
                            }
                        }
                    }
                 }
                ,
                saveCredentials: function() {
                        var curview = this;
                        var logindialog = this.dialog;
                        var app = this.app;
                        var el = this.$el;
                        this.apiKeyInput.attr('readonly','readonly');
                        this.saveButton.addClass('saving');
                        var URL = "/pms/io/user/setData/?BMS_REQ_TK="+app.get('bms_token')+"&type=addMailgun";
                        var api_key =  this.apiKeyInput;
                        var emailAddress = this.emailAddressInput;
                        $.post(URL, { privateKey:api_key.val(),emailAddress:emailAddress.val()})
                        .done(function(data) {
                                curview.apiKeyInput.removeAttr('readonly');
                                curview.saveButton.removeClass('saving');
                                if(data){
                                    var creds = jQuery.parseJSON(data);
                                    if(creds[0]=="err")
                                    {
                                        app.showAlert(creds[1].replace('&#58;',':'),curview.$el);
                                    }
                                    else
                                    {
                                         app.setAppData("mailgun", {"emailAddress":emailAddress,"privateKey":emailAddress});
                                         app.showMessge(creds[1],$("body"),{fixed:true});

                                    }
                                }
                                else{
                                    app.showAlert("UnExpected response from server.",curview.$el);
                                }
                        }).fail(function() {
                               app.showAlert("Something went wrong on server. Please try again later.",curview.$el);
                            });
                },
                validateLoginFields: function(isTest) {
                        var el = this.$el;
                        var isValid = true;
                        var app = this.app;                        
                        if((this.apiKeyInput.val() == ''))
                        {						
                            app.showError({
                                control:el.find('.uid-container'),
                                message:"API Key cannot be empty"
                            });
                            isValid = false;
                        }                        
                        else
                        {						
                            app.hideError({control:el.find(".uid-container")});
                        }

                        isValid = this.validateEmail();

                        return isValid;
                },
                validateEmail:function(){
                    var el = this.$el;
                    var isValid = true;
                    var app = this.app;                    
                    if(this.emailAddressInput.val() == ''){
                        app.showError({
                            control:el.find('.email-container'),
                            message:'Email can\'t be empty'
                        });
                        isValid = false;
                    }
                    else if(this.emailAddressInput.val() != '' && !app.validateEmail(this.emailAddressInput.val()))
                    {						
                        app.showError({
                                control:el.find('.email-container'),
                                message:"Please enter correct email address format"
                        });
                        isValid = false;
                    }
                    else
                    {						
                        app.hideError({control:el.find(".email-container")});
                    }  
                    return isValid;
                },
                initialize: function () {
                        this.template = _.template(template);				
                        this.render();                        
                        this.app = this.options.app;
                        this.parent = this.options.page;
                        this.layout = this.options.layout?this.options.layout:'';
                        var el = this.$el;
                        this.passwordChange = false;
                        this.getElements();
                        this.app.showLoading('Loading Credentials',el);					
                        var mailgun_setting = this.app.getAppData("mailgun");
                        if(!mailgun_setting)
                        {
                            el.find('#sl_userid#sl_email').attr('readonly','readonly');
                            var URL = "/pms/events/getMailgun.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getMailgun";
                            jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                                var creds = jQuery.parseJSON(xhr.responseText);
                                if(creds[0]!=="err"){
                                    this.setAPIKey(creds)
                                }
                                else{
                                    this.app.showAlert(creds[1].replace('&#58;',':'),this.$el);
                                }
                            },this));
                        }
                        else{
                            this.setAPIKey(mailgun_setting)
                        }
                        
                        this.app.showLoading(false,el);
                },
                getElements: function(){
                    this.apiKeyInput = this.$("#mailgun_key");
                    this.emailAddressInput = this.$("#mailgun_email");
                    this.saveButton = this.$(".btnSaveLogin")
                },
                setAPIKey:function(creds){
                    if(creds && creds.apiKey!="")
                    {								                                    
                        this.apiKeyInput.removeAttr('readonly').val(creds["publicKey"]);
                        this.emailAddressInput.removeAttr('readonly').val(creds["email"]);
                        //this.setAccordion();
                        
                    }
                },
                setAccordion:function(){
                  this.parent.$("#accordion_export,#accordion_import,#accordion_score").show();
                  this.parent.$("#accordion_import .ui-accordion-content,#accordion_export .ui-accordion-content").css({"height":"200px","overflow":""});  
                  this.parent.$("#accordion_score .ui-accordion-content").show().css("height","400px");
                },
                render: function () {                        
                     this.$el.html(this.template({layout:this.layout}));                        
                }
        });
});