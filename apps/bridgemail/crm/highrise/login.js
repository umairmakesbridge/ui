define(['text!crm/highrise/html/login.html'],
    function (template) {
        'use strict';
        return Backbone.View.extend({                
            events: {
                "click #btnTestLogin":function(){						
                    var el = this.$el;
                    var app = this.app;
                    var isValid = this.validateLoginFields(true);
                    if(isValid)						
                        this.testCredentials();
                },
                "click .btnSaveLogin":function(obj){						
                    if($(obj.target).hasClass('saving'))
                        return false;
                    else
                    {
                        var el = this.$el;
                        var app = this.app;
                        var isValid = this.validateLoginFields();
                        if(isValid)
                            this.saveCredentials();
                    }
                },
                "click .setEmail": 'checkEmptyEmail'
            },
            initialize: function () {
                this.template = _.template(template);				
                this.render();
                var el = this.$el;
                var app = this.app;
                this.passwordChange = false;
                var highrise_setting = this.app.getAppData("highrise");
                
                app.showLoading('Loading Credentials',el);
                if(highrise_setting && highrise_setting.isHighriseUser=="Y")
                {
                    el.find('#hrAccount,#hrApiToken,#hrEmail').attr('readonly','readonly');
                    var URL = "/pms/io/highrise/setup/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getCred";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){							
                        var creds = jQuery.parseJSON(xhr.responseText);
                        if(creds)
                        {				
                            el.find('#hrAccount').removeAttr('readonly').val(creds["hrAccount"]);
                            el.find('#hrApiToken').removeAttr('readonly').val(creds["hrApiToken"]);
                            el.find('#hrEmail').removeAttr('readonly').val(creds["hrEmail"]);								
                        }
                    });
                }
                app.showLoading(false,el);
            },

            render: function () {
                this.app = this.options.app?this.options.app:this.options.page.app;
                this.dialog = this.options.dialog;
                this.parent = this.options.page ? this.options.page : null;
                this.layout = this.options.layout?this.options.layout:'';
                this.$el.html(this.template({layout:this.layout}));
            },
            testCredentials: function() {
                var logindialog = this.dialog;
                var that = this;
                var app = this.app;
                app.showLoading(true,that.$el);
                var postData = {
                    hrAccount: this.$el.find('#hrAccount').val(),                    
                    hrApiToken: this.$el.find('#hrApiToken').val(),
                    hrEmail:this.$el.find('#hrEmail').val()
                    };
                that.$el.find('#hrAccount,#hrEmail,#hrApiToken').attr('readonly','readonly');
                var highrise_setting = this.app.getAppData("highrise");
                that.$el.find('#btnTestLogin').addClass('saving');
               
                var highriseLoggedIn = highrise_setting && highrise_setting[0] !== "err" && highrise_setting.isHighriseUser=="Y";
                   
                var URL = "/pms/io/highrise/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=testCred";
                $.post(URL,postData )
                .done(function(data) { 
                    that.$el.find('#hrAccount,#hrEmail,#hrApiToken').removeAttr('readonly');
                   that.$el.find('#btnTestLogin').removeClass('saving');
                    var creds = jQuery.parseJSON(data);                            
                    if(creds.err)							
                        app.showAlert(creds.err.replace('&#58;',':'),this.$el);
                    else
                        app.showMessge(creds.success,that.$el);
                });
                app.showLoading(false,that.$el);
            },
            checkEmptyEmail:function(obj){
                var that = this;                        
                var app = this.app; 
                var el = this.$el;
              if($(obj.target).hasClass('saving')){
                        return false;
                    }else{
                        var el = this.$el;                        
                        var isValid = this.validateEmail();
                        // check email if its empty
                         if(!el.find('#hrEmail').val()) {						
                                 that.app.showError({
                                 control:el.find('.email-container'),
                                message:"Email can't be empty"
                                });
                            isValid = false;
                         }
                        
                        if(isValid)
                            this.saveEmail();
                    }
                 
            },
            
            saveEmail:function() {
                var that = this;                        
                var app = this.app; 
                var el = this.$el;
                if(!this.$el.find('#hrEmail').val())
                {						
                    app.showError({
                        control:el.find('.email-container'),
                        message:"Email can't be empty"
                    });
                    return;
                }
                var URL = "/pms/io/highrise/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setEmail";
                that.$el.find('#hrEmail').attr('readonly','readonly');
                that.$el.find('.setEmail').addClass('saving');
                 app.showLoading(true,that.$el);
                $.post(URL, { hrEmail:that.$el.find('#hrEmail').val()})
                .done(function(data) { 
                        var creds = jQuery.parseJSON(data);                            
                        that.$el.find('#hrEmail').removeAttr('readonly')
                        that.$el.find('.setEmail').removeClass('saving');
                        if(creds.err)							
                            app.showAlert(creds.err.replace('&#58;',':'),that.$el);
                        else						
                           app.showMessge(creds.success,$("body"),{fixed:true});						
                });
                app.showLoading(false,that.$el);
                
            },
            saveCredentials: function(url) {
                var that = this;
                var logindialog = this.dialog;
                var app = this.app;
                var el = this.$el;
                el.find('#hrAccount,#hrApiToken').attr('readonly','readonly');
                el.find('.btnSaveLogin').addClass('saving');
                app.showLoading(true,that.$el);
                var URL = "/pms/io/highrise/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setCred";				
                $.post(URL, {
                    hrAccount: that.$el.find('#hrAccount').val(),
                    hrApiToken: that.$el.find('#hrApiToken').val(),
                    hrEmail:that.$el.find('#hrEmail').val()
                    })
                .done(function(data) { 
                    var creds = jQuery.parseJSON(data);     
                    el.find('#hrAccount,#hrApiToken').removeAttr('readonly');                                                
                    el.find('.btnSaveLogin').removeClass('saving');
                    if(creds.err)
                    {							
                        app.showAlert(creds.err.replace('&#58;',':'),that.$el);							
                    }
                    else
                    {
                        if(that.parent){
                            that.parent.loadMapping();
                            app.showMessge(creds.success,$("body"),{fixed:true});
                        }
                        else{
                            logindialog.hide();						
                            that.options.camp.checkHighriseStatus();
                        }
                    }
                                                
                });
                app.showLoading(false,that.$el);
            },
            validateLoginFields: function(isTest) {
                var campview = this;
                var el = this.$el;
                var isValid = true;
                var app = this.app;
                var appMsgs = campview.app.messages[0];
                if((el.find('#hrAccount').val() == ''))
                {						
                    app.showError({
                        control:el.find('.uid-container'),
                        message:"Account can't be empty"
                    });
                    isValid = false;
                }					
                else if(!el.find('#hrApiToken').val())
                {						
                    app.showError({
                        control:el.find('.accid-container'),
                        message:"Api Token can't be empty"
                    });
                    isValid = false;
                }
                else
                {						
                    app.hideError({
                        control:el.find(".uid-container")
                        });
                }
                console.log(isValid);
                var highrise_setting = this.app.getAppData("highrise");
                var highriseLoggedIn = highrise_setting && highrise_setting[0] !== "err" && highrise_setting.isHighriseUser=="Y";
               
               
                return isValid;
            },	
            validateEmail:function(){
                var campview = this;
                var el = this.$el;
                var isValid = true;
                var app = this.app;
                var appMsgs = campview.app.messages[0];
                if(el.find('#hrEmail').val() != '' && !app.validateEmail(el.find('#hrEmail').val()))
                {						
                    app.showError({
                        control:el.find('.email-container'),
                        message:appMsgs.SF_email_format_error
                    });
                    isValid = false;
                }
                else
                {						
                    app.hideError({
                        control:el.find(".email-container")
                        });
                }
                return isValid;
            }
            
        });
    });