define(['text!crm/salesloft/html/login.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {                   
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
                 }
                ,
                saveCredentials: function() {
                        var curview = this;
                        var logindialog = this.dialog;
                        var app = this.app;
                        var el = this.$el;
                        el.find('#sl_userid').attr('readonly','readonly');
                        el.find('.btnSaveLogin').addClass('saving');
                        var URL = "/pms/io/salesloft/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setCred";
                        $.post(URL, { apiKey: curview.$el.find('#sl_userid').val(),email:curview.$el.find('#sl_email').val()})
                        .done(function(data) { 
                                var creds = jQuery.parseJSON(data);        
                                el.find('#sl_userid').removeAttr('readonly');
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
                                         curview.setAccordion();
                                         app.setAppData("salesloft", {"slEmail":curview.$el.find('#sl_email').val(),"apiKey":curview.$el.find('#sl_userid').val()});
                                         app.showMessge(creds.success,$("body"),{fixed:true});						
                                         if(curview.parent.exportAccordion){
                                           curview.parent.exportAccordion.getExportBot();
                                        }
                                     }
                                }
                        });
                },
                validateLoginFields: function(isTest) {
                        var el = this.$el;
                        var isValid = true;
                        var app = this.app;                        
                        if((el.find('#sl_userid').val() == ''))
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
                        //var salesforce_setting = this.app.getAppData("salesfocre");
                        var salesforceLoggedIn = true; //salesforce_setting && salesforce_setting[0] !== "err" && salesforce_setting.isSalesforceUser=="Y";
                        if(salesforceLoggedIn){
                            isValid = this.validateEmail();  
                        }
                        
                        return isValid;
                },
                validateEmail:function(){
                    var el = this.$el;
                    var isValid = true;
                    var app = this.app;                    
                    if(el.find('#sl_email').val() == ''){
                        app.showError({
                                control:el.find('.email-container'),
                                message:'Email can\'t be empty'
                        });
                        isValid = false;
                    }
                    else if(el.find('#sl_email').val() != '' && !app.validateEmail(el.find('#sl_email').val()))
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
                        this.app.showLoading('Loading Credentials',el);					
                        var salesloft_setting = this.app.getAppData("salesloft");
                        if(!salesloft_setting)
                        {
                            el.find('#sl_userid#sl_email').attr('readonly','readonly');
                            var URL = "/pms/io/salesloft/setup/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getCred";
                            jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                                var creds = jQuery.parseJSON(xhr.responseText);
                                this.setAPIKey(creds)
                            },this));
                        }
                        else{
                            this.setAPIKey(salesloft_setting)
                        }
                        
                        this.app.showLoading(false,el);
                },
                setAPIKey:function(creds){
                    if(creds && creds.apiKey!="")
                    {								                                    
                        this.$('#sl_userid').removeAttr('readonly').val(creds["apiKey"]);
                        this.$('#sl_email').removeAttr('readonly').val(creds["slEmail"]);
                        this.setAccordion();
                        
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