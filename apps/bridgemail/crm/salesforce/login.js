define(['text!crm/salesforce/html/login.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    "click #btnTestLogin":function(){						                        
                        var isValid = this.validateLoginFields();
                        if(isValid){						
                          this.testCredentials();						
                        }        
                    },
                    "click .btnSaveLogin":function(obj){
                        if($(obj.target).hasClass('saving'))
                                return false;
                        else
                        {                                                        
                            var isValid = this.validateLoginFields();
                            if(isValid){							
                                this.saveCredentials();							
                            }
                        }
                    }
                 },
                testCredentials: function() {
                        var curview = this;                        
                        var app = curview.app;
                        app.showLoading(true,curview.$el);
                        var URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=testCred";
                        $.post(URL, { sfUserID: curview.$el.find('#sf_userid').val(),sfPass: curview.$el.find('#sf_pwd').val(),sfEmail:curview.$el.find('#sf_email').val()})
                        .done(function(data) { 
                                var creds = jQuery.parseJSON(data);                            
                                if(creds.err)							
                                        app.showAlert(creds.err.replace('&#58;',':'),curview.$el);
                                else						
                                        app.showAlert(creds.success,curview.$el);						
                        });
                        app.showLoading(false,curview.$el);
                },
                saveCredentials: function() {
                        var curview = this;
                        var logindialog = this.dialog;
                        var app = this.app;
                        var el = this.$el;
                        el.find('#sf_userid,#sf_pwd,#sf_email').attr('readonly','readonly');
                        el.find('#btnSaveLogin').addClass('saving');
                        var URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setCred";
                        $.post(URL, { sfUserID: curview.$el.find('#sf_userid').val(),sfPass: curview.$el.find('#sf_pwd').val(),sfEmail:curview.$el.find('#sf_email').val()})
                        .done(function(data) { 
                                var creds = jQuery.parseJSON(data);        
                                el.find('#sf_userid,#sf_pwd,#sf_email').removeAttr('readonly');
                                el.find('#btnSaveLogin').removeClass('saving');
                                if(creds.err)
                                {							
                                    app.showAlert(creds.err.replace('&#58;',':'),curview.$el);							
                                }
                                else
                                {
                                     if(logindialog){
                                        logindialog.hide();														
                                        curview.options.camp.checkSalesForceStatus();
                                     }
                                }
                        });
                },
                validateLoginFields: function() {
                        var el = this.$el;
                        var isValid = true;
                        var app = this.app;
                        var appMsgs = this.app.messages[0];
                        if((el.find('#sf_userid').val() == ''))
                        {						
                            app.showError({
                                control:el.find('.uid-container'),
                                message:appMsgs.SF_userid_empty_error
                            });
                            isValid = false;
                        }
                        else if(!app.validateEmail(el.find('#sf_userid').val()))
                        {						
                            app.showError({
                                control:el.find('.uid-container'),
                                message:appMsgs.SF_userid_format_error
                            });
                            isValid = false;
                        }
                        else
                        {						
                            app.hideError({control:el.find(".uid-container")});
                        }
                        if(el.find('#sf_pwd').val() == '')
                        {						
                            app.showError({
                                    control:el.find('.pwd-container'),
                                    message:appMsgs.SF_pwd_empty_error
                            });
                            isValid = false;
                        }
                        else
                        {						
                             app.hideError({control:el.find(".pwd-container")});
                        }
                        if(el.find('#sf_email').val() != '' && !app.validateEmail(el.find('#sf_email').val()))
                        {						
                            app.showError({
                                    control:el.find('.email-container'),
                                    message:appMsgs.SF_email_format_error
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
                        var el = this.$el;
                        var app = this.app;
                        app.showLoading('Loading Credentials',el);					
                        var salesforce_setting = this.app.getAppData("salesfocre");
                        if(salesforce_setting && salesforce_setting.isSalesforceUser=="Y")
                        {
                            el.find('#sf_userid,#sf_pwd,#sf_email').attr('readonly','readonly');
                            var URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getCred";
                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                var creds = jQuery.parseJSON(xhr.responseText);
                                if(creds)
                                {								
                                    el.find('#sf_pwd').removeAttr('readonly');								
                                    el.find('#sf_userid').removeAttr('readonly').val(creds["sfUserID"]);
                                    el.find('#sf_email').removeAttr('readonly').val(creds["sfEmail"]);								
                                }
                            });
                        }
                        app.showLoading(false,el);
                },

                render: function () {
                        this.app = this.options.app?this.options.app:this.options.page.app;
                        this.dialog = this.options.dialog;
                        this.layout = this.options.layout?this.options.layout:'';
                        this.$el.html(this.template({layout:this.layout}));
                }
        });
});