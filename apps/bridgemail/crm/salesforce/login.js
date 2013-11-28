define(['text!crm/salesforce/html/login.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
					"click #btnTestLogin":function(){						
						var el = this.$el;
						var app = this.options.app;
						var isValid = this.validateLoginFields();
						if(isValid)						
							this.testCredentials();						
                    },
					"click #btnSaveLogin":function(obj){
						if($(obj.target).hasClass('saving'))
							return false;
						else
						{
							var el = this.$el;
							var app = this.options.app;
							var isValid = this.validateLoginFields();
							if(isValid)							
								this.saveCredentials();							
						}
                    },
                 },
				testCredentials: function() {
					var curview = this;
					var logindialog = this.dialog;
					var app = curview.options.app;
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
					var app = this.options.app;
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
							logindialog.hide();														
							curview.options.camp.checkSalesForceStatus();
						}
					});
				},
				validateLoginFields: function() {
					var el = this.$el;
					var isValid = true;
					var app = this.options.app;
					var appMsgs = this.app.messages[0];
					if((el.find('#sf_userid').val() == ''))
					{						
						var options = {'control':el.find('#sf_userid'),
										'valid_icon':el.find('#sfuid_erroricon'),
										'controlcss':'border:solid 1px #ff0000; float:left; margin-left:15px; width:65%;',
										'message':appMsgs.SF_userid_empty_error};
						app.enableValidation(options);
						isValid = false;
					}					
					else if(!app.validateEmail(el.find('#sf_userid').val()))
					{						
						var options = {'control':el.find('#sf_userid'),
										'valid_icon':el.find('#sfuid_erroricon'),
										'controlcss':'border:solid 1px #ff0000; float:left; margin-left:15px; width:65%;',
										'message':appMsgs.SF_userid_format_error};
						app.enableValidation(options);
						isValid = false;
					}
					else
					{
						var options = {'control':el.find('#sf_userid'),'valid_icon':el.find('#sfuid_erroricon')};
						app.disableValidation(options);						
					}
					if(el.find('#sf_pwd').val() == '')
					{
						var options = {'control':el.find('#sf_pwd'),
										'valid_icon':el.find('#sfpwd_erroricon'),
										'controlcss':'border:solid 1px #ff0000; float:left; margin-left:15px; width:65%;',
										'message':appMsgs.SF_pwd_empty_error};
						app.enableValidation(options);
						isValid = false;
					}
					else
					{
						var options = {'control':el.find('#sf_pwd'),'valid_icon':el.find('#sfpwd_erroricon')};
						app.disableValidation(options);
					}
					if(el.find('#sf_email').val() != '' && !app.validateEmail(el.find('#sf_email').val()))
					{						
						var options = {'control':el.find('#sf_email'),
										'valid_icon':el.find('#sfemail_erroricon'),
										'controlcss':'border:solid 1px #ff0000; float:left; margin-left:15px; width:65%;',
										'message':appMsgs.SF_email_format_error};
						app.enableValidation(options);
						isValid = false;
					}
					else
					{
						var options = {'control':el.find('#sf_email'),'valid_icon':el.find('#sfemail_erroricon')};
						app.disableValidation(options);
					}
					return isValid;
				},				
                initialize: function () {
					this.template = _.template(template);				
					this.render();
					var el = this.$el;
					var app = this.options.app;
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
                        this.app = this.options.app;
						this.dialog = this.options.dialog;
                        this.$el.html(this.template({}));
                }
        });
});