define(['text!crm/netsuite/html/login.html'],
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
					var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=testCred";
					$.post(URL, { nsUserID: curview.$el.find('#ns_userid').val(),nsPass: curview.$el.find('#ns_pwd').val(),nsAccountID: curview.$el.find('#ns_accid').val(),nsEmail:curview.$el.find('#ns_email').val()})
					.done(function(data) { 
						var creds = jQuery.parseJSON(data);                            
						if(creds.err)							
							app.showAlert(creds.err.replace('&#58;',':'),curview.$el);
						else
							app.showAlert(creds.success,curview.$el);
					});
					app.showLoading(false,curview.$el);
				},
				saveCredentials: function(url) {
					var curview = this;
					var logindialog = this.dialog;
					var app = this.options.app;
					var el = this.$el;
					el.find('#ns_userid,#ns_pwd,#ns_email,#ns_accid').attr('readonly','readonly');
					el.find('#btnSaveLogin').addClass('saving');
					var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setCred";				
					$.post(URL, { nsUserID: curview.$el.find('#ns_userid').val(),nsPass: curview.$el.find('#ns_pwd').val(),nsAccountID: curview.$el.find('#ns_accid').val(),nsEmail:curview.$el.find('#ns_email').val()})
					.done(function(data) { 
						var creds = jQuery.parseJSON(data);     
                                                el.find('#ns_userid,#ns_pwd,#ns_email,#ns_accid').removeAttr('readonly');                                                
                                                el.find('#btnSaveLogin').removeClass('saving');
						if(creds.err)
						{							
							app.showAlert(creds.err.replace('&#58;',':'),curview.$el);							
						}
						else
						{
							logindialog.hide();						
							curview.options.camp.checkNetSuiteStatus();
						}
                                                
					});
				},
				validateLoginFields: function() {
					var campview = this;
					var el = this.$el;
					var isValid = true;
					var app = this.options.app;
					var appMsgs = campview.app.messages[0];
					if((el.find('#ns_userid').val() == ''))
					{						
						var options = {'control':el.find('#ns_userid'),
										'valid_icon':el.find('#nsuid_erroricon'),
										'controlcss':'border:solid 2px #FB8080;',
										'message':appMsgs.NS_userid_empty_error};
						app.enableValidation(options);
						isValid = false;
					}					
					else if(!app.validateEmail(el.find('#ns_userid').val()))
					{						
						var options = {'control':el.find('#ns_userid'),
										'valid_icon':el.find('#nsuid_erroricon'),
										'controlcss':'border:solid 2px #FB8080;',
										'message':appMsgs.NS_userid_format_error};
						app.enableValidation(options);						
						isValid = false;
					}
					else
					{
						var options = {'control':el.find('#ns_userid'),'valid_icon':el.find('#nsuid_erroricon')};
						app.disableValidation(options);
					}
					if(el.find('#ns_pwd').val() == '')
					{						
						var options = {'control':el.find('#ns_pwd'),
										'valid_icon':el.find('#nspwd_erroricon'),
										'controlcss':'border:solid 2px #FB8080;',
										'message':appMsgs.NS_pwd_empty_error};
						app.enableValidation(options);
						isValid = false;
					}
					else
					{
						var options = {'control':el.find('#ns_pwd'),'valid_icon':el.find('#nspwd_erroricon')};
						app.disableValidation(options);						
					}
					if(el.find('#ns_accid').val() == '')
					{
						var options = {'control':el.find('#ns_accid'),
										'valid_icon':el.find('#nsaccid_erroricon'),
										'controlcss':'border:solid 2px #FB8080;',
										'message':appMsgs.NS_accid_empty_error};
						app.enableValidation(options);						
						isValid = false;
					}
					else
					{
						var options = {'control':el.find('#ns_accid'),'valid_icon':el.find('#nsaccid_erroricon')};
						app.disableValidation(options);
					}
					if(el.find('#ns_email').val() != '' && !app.validateEmail(el.find('#ns_email').val()))
					{						
						var options = {'control':el.find('#ns_email'),
										'valid_icon':el.find('#nsemail_erroricon'),
										'controlcss':'border:solid 2px #FB8080;',
										'message':appMsgs.NS_email_format_error};
						app.enableValidation(options);						
						isValid = false;
					}
					else
					{						
						var options = {'control':el.find('#ns_email'),'valid_icon':el.find('#nsemail_erroricon')};
						app.disableValidation(options);
					}
					return isValid;
				},				
                initialize: function () {
					this.template = _.template(template);				
					this.render();
					var el = this.$el;
					var app = this.options.app;
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
                        this.app = this.options.app;
						this.dialog = this.options.dialog;
                        this.$el.html(this.template({}));
                }
        });
});