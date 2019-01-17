define(['text!crm/salesloft/html/login.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    "click #btnTestLogin":function(){						                        
                        var isValid = this.validateLoginFields(true);
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
                    },
                    "click .setEmail":function(obj){
                        if($(obj.target).hasClass('saving'))
                                return false;
                        else
                        {                                                        
                            var isValid = this.validateEmail();
                            if(isValid){							
                                this.saveEmail();							
                            }
                        }
                    },
                    "keyup #sf_pwd":function(){
                        this.passwordChange = true;
                    }
                 },
                testCredentials: function() {
                        var curview = this;                        
                        var app = curview.app;                        
                        curview.$el.find('#sf_pwd,#sf_userid').attr('readonly','readonly');
                        var URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=testCred";
                        var postData = { sfUserID: curview.$el.find('#sf_userid').val(),sfEmail:curview.$el.find('#sf_email').val()}
                        var salesforce_setting = this.app.getAppData("salesfocre");
                        var salesforceLoggedIn = salesforce_setting && salesforce_setting[0] !== "err" && salesforce_setting.isSalesforceUser=="Y";
                        if(salesforceLoggedIn && this.passwordChange==true){
                            postData['sfPass']= curview.$el.find('#sf_pwd').val();
                        }
                        this.$("#btnTestLogin").addClass("saving");
                        $.post(URL, postData)
                        .done(function(data) { 
                               curview.$("#btnTestLogin").removeClass("saving"); 
                               curview.$el.find('#sf_pwd,#sf_userid').removeAttr('readonly');
                                var creds = jQuery.parseJSON(data);                            
                                if(creds.err)							
                                        app.showAlert(creds.err.replace('&#58;',':'),curview.$el);
                                else						
                                        app.showMessge(creds.success,$("body"),{fixed:true});						
                        });                        
                },
                saveEmail: function() {
                        var curview = this;                        
                        var app = curview.app;
                        app.showLoading(true,curview.$el);
                        var URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setEmail";
                        curview.$el.find('#sf_email').attr('readonly','readonly');
                        this.$('.setEmail').addClass('saving');
                        $.post(URL, { sfEmail:curview.$el.find('#sf_email').val()})
                        .done(function(data) { 
                                var creds = jQuery.parseJSON(data);                            
                                curview.$el.find('#sf_email').removeAttr('readonly')
                                curview.$('.setEmail').removeClass('saving');
                                if(creds.err)							
                                    app.showAlert(creds.err.replace('&#58;',':'),curview.$el);
                                else						
                                   app.showMessge(creds.success,$("body"),{fixed:true});						
                        });
                        app.showLoading(false,curview.$el);
                }
                ,
                saveCredentials: function() {
                        var curview = this;
                        var logindialog = this.dialog;
                        var app = this.app;
                        var el = this.$el;
                        el.find('#sf_userid,#sf_pwd').attr('readonly','readonly');
                        el.find('.btnSaveLogin').addClass('saving');
                        var URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setCred";
                        $.post(URL, { sfUserID: curview.$el.find('#sf_userid').val(),sfPass: curview.$el.find('#sf_pwd').val(),sfEmail:curview.$el.find('#sf_email').val()})
                        .done(function(data) { 
                                var creds = jQuery.parseJSON(data);        
                                el.find('#sf_userid,#sf_pwd').removeAttr('readonly');
                                el.find('.btnSaveLogin').removeClass('saving');
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
                                     else{
                                         curview.$("#btnTestLogin").show();
                                         curview.parent.loadMapping();
                                         curview.parent.loadSyncArea();
                                         app.setAppData("salesfocre", {"isLoggedIn":"Y","isSalesforceUser":"Y"});
                                         app.showMessge(creds.success,$("body"),{fixed:true});						
                                     }
                                }
                        });
                },
                validateLoginFields: function(isTest) {
                        var el = this.$el;
                        var isValid = true;
                        var app = this.app;                        
                        if((el.find('#sf_userid').val() == ''))
                        {						
                            app.showError({
                                control:el.find('.uid-container'),
                                message:"User ID cannot be empty"
                            });
                            isValid = false;
                        }
                        else if(!app.validateEmail(el.find('#sf_userid').val()))
                        {						
                            app.showError({
                                control:el.find('.uid-container'),
                                message:"Invalid User ID. Hint: IDs are in an email format"
                            });
                            isValid = false;
                        }
                        else
                        {						
                            app.hideError({control:el.find(".uid-container")});
                        }
                        var salesforce_setting = this.app.getAppData("salesfocre");
                        var salesforceLoggedIn = salesforce_setting && salesforce_setting[0] !== "err" && salesforce_setting.isSalesforceUser=="Y";
                        if(!isTest || (salesforceLoggedIn && this.passwordChange==true)){
                            isValid = this.validatePassword();  
                        }
                        
                        return isValid;
                },
                validatePassword:function(){
                    var el = this.$el;
                    var isValid = true;
                    var app = this.app;                    
                    if(el.find('#sf_pwd').val() == '')
                        {						
                        app.showError({
                                control:el.find('.pwd-container'),
                                message:"Enter password"
                        });
                        isValid = false;
                    }
                    else
                    {						
                         app.hideError({control:el.find(".pwd-container")});
                    }
                    return isValid;
                },
                validateEmail:function(){
                    var el = this.$el;
                    var isValid = true;
                    var app = this.app;                    
                    if(el.find('#sf_email').val() == ''){
                        app.showError({
                                control:el.find('.email-container'),
                                message:'Email can\'t be empty'
                        });
                        isValid = false;
                    }
                    else if(el.find('#sf_email').val() != '' && !app.validateEmail(el.find('#sf_email').val()))
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
                        //app.showLoading('Loading Credentials',el);					
                        /*var salesforce_setting = this.app.getAppData("salesfocre");
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
                        }*/
                        //app.showLoading(false,el);
                },

                render: function () {                        
                     this.$el.html(this.template({layout:this.layout}));                        
                }
        });
});