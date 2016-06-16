define(['text!crm/netsuite/html/login.html'],
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
                "click .setEmail":function(obj){
                   if($(obj.target).hasClass('saving'))
                        return false;
                    else
                    {
                        var el = this.$el;                        
                        var isValid = this.validateEmail();
                        if(isValid)
                            this.saveEmail();
                    }
                },
                "keyup #n_pwd":function(){
                    this.passwordChange = true;
                }
            },
            testCredentials: function() {
                var curview = this;
                var logindialog = this.dialog;
                var app = this.app;
                app.showLoading(true,curview.$el);
                var postData = {
                    nsUserID: curview.$el.find('#ns_userid').val(),                    
                    nsAccountID: curview.$el.find('#ns_accid').val(),
                    nsEmail:curview.$el.find('#ns_email').val()
                    };
                var netsuite_setting = this.app.getAppData("netsuite");
                var netsuiteLoggedIn = netsuite_setting && netsuite_setting[0] !== "err" && netsuite_setting.isNetsuiteUser=="Y";
                if(netsuiteLoggedIn && this.passwordChange==true){
                    postData['nsPass']= curview.$el.find('#ns_pwd').val();
                }    
                this.$("#btnTestLogin").addClass("saving");
                var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=testCred";
                $.post(URL,postData )
                .done(function(data) { 
                    var creds = jQuery.parseJSON(data);                            
                    curview.$("#btnTestLogin").removeClass("saving");
                    if(creds.err)							
                        app.showAlert(creds.err.replace('&#58;',':'),curview.$el);
                    else
                        app.showMessge(creds.success,curview.$el);
                });
                app.showLoading(false,curview.$el);
            },
            saveEmail: function() {
                var curview = this;                        
                var app = curview.app;                
                var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setEmail";
                curview.$el.find('#ns_email').attr('readonly','readonly');
                this.$(".setEmail").addClass("saving");
                $.post(URL, { nsEmail:curview.$el.find('#ns_email').val()})
                .done(function(data) { 
                        var creds = jQuery.parseJSON(data);                            
                        curview.$el.find('#ns_email').removeAttr('readonly');
                        curview.$(".setEmail").removeClass("saving");
                        if(creds.err)							
                            app.showAlert(creds.err.replace('&#58;',':'),curview.$el);
                        else						
                           app.showMessge(creds.success,$("body"),{fixed:true});						
                });
                
            },
            saveCredentials: function(url) {
                var curview = this;
                var logindialog = this.dialog;
                var app = this.app;
                var el = this.$el;
                el.find('#ns_userid,#ns_pwd,#ns_email,#ns_accid').attr('readonly','readonly');
                el.find('.btnSaveLogin').addClass('saving');
                var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setCred";				
                $.post(URL, {
                    nsUserID: curview.$el.find('#ns_userid').val(),
                    nsPass: curview.$el.find('#ns_pwd').val(),
                    nsAccountID: curview.$el.find('#ns_accid').val(),
                    nsEmail:curview.$el.find('#ns_email').val()
                    })
                .done(function(data) { 
                    var creds = jQuery.parseJSON(data);     
                    el.find('#ns_userid,#ns_pwd,#ns_email,#ns_accid').removeAttr('readonly');                                                
                    el.find('.btnSaveLogin').removeClass('saving');
                    if(creds.err)
                    {							
                        app.showAlert(creds.err.replace('&#58;',':'),curview.$el);							
                    }
                    else
                    {
                        if(curview.parent){
                            curview.parent.loadMapping();
                            app.showMessge(creds.success,$("body"),{fixed:true});
                        }
                        else{
                            logindialog.hide();						
                            curview.options.camp.checkNetSuiteStatus();
                        }
                    }
                                                
                });
            },
            validateLoginFields: function(isTest) {
                var campview = this;
                var el = this.$el;
                var isValid = true;
                var app = this.app;                
                if((el.find('#ns_userid').val() == ''))
                {						
                    app.showError({
                        control:el.find('.uid-container'),
                        message:"User ID cannot be empty"
                    });
                    isValid = false;
                }					
                else if(!app.validateEmail(el.find('#ns_userid').val()))
                {						
                    app.showError({
                        control:el.find('.uid-container'),
                        message:"Invalid User ID. Hint: IDs are in an email format"
                    });
                    isValid = false;
                }
                else
                {						
                    app.hideError({
                        control:el.find(".uid-container")
                        });
                }
                var netsuite_setting = this.app.getAppData("netsuite");
                var netsuiteLoggedIn = netsuite_setting && netsuite_setting[0] !== "err" && netsuite_setting.isNetsuiteUser=="Y";
                if(!isTest || (netsuiteLoggedIn && this.passwordChange==true)){
                    if(el.find('#ns_pwd').val() == '')
                    {						
                        app.showError({
                            control:el.find('.pwd-container'),
                            message:"Enter password"
                        });
                        isValid = false;
                    }
                    else
                    {						
                        app.hideError({
                            control:el.find(".pwd-container")
                            });
                    }
                }
                if(el.find('#ns_accid').val() == '')
                {						
                    app.showError({
                        control:el.find('.accid-container'),
                        message:"Please enter correct email address format"
                    });
                    isValid = false;
                }
                else
                {						
                    app.hideError({
                        control:el.find(".accid-container")
                        });
                }
                
                return isValid;
            },	
            validateEmail:function(){
                var campview = this;
                var el = this.$el;
                var isValid = true;
                var app = this.app;                
                if(el.find('#ns_email').val() == ''){
                    app.showError({
                            control:el.find('.email-container'),
                            message:'Email cann\'t be empty'
                    });
                    isValid = false;
                }
                else if(el.find('#ns_email').val() != '' && !app.validateEmail(el.find('#ns_email').val()))
                {						
                    app.showError({
                        control:el.find('.email-container'),
                        message:"Please enter correct email address format"
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
            },
            initialize: function () {
                this.template = _.template(template);				
                this.render();
                var el = this.$el;
                var app = this.app;
                this.passwordChange = false;
                var netsuite_setting = this.app.getAppData("netsuite");
                app.showLoading('Loading Credentials',el);
                if(netsuite_setting && netsuite_setting.isNetsuiteUser=="Y")
                {
                    el.find('#ns_userid,#ns_pwd,#ns_email,#ns_accid').attr('readonly','readonly');
                    var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getCred";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){							
                        var creds = jQuery.parseJSON(xhr.responseText);
                        if(creds)
                        {				
                            el.find('#ns_pwd').removeAttr('readonly');
                            el.find('#ns_userid').removeAttr('readonly').val(creds["nsUserID"]);
                            el.find('#ns_accid').removeAttr('readonly').val(creds["nsAccountID"]);
                            el.find('#ns_email').removeAttr('readonly').val(creds["nsEmail"]);								
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
            }
        });
    });