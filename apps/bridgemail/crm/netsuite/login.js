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
					var el = this.$el;
					var isValid = true;
					if((el.find('#ns_userid').val() == ''))
					{						
						//el.find('#ns_userid').css('border','solid 1px #ff0000');
						this.enableValidation('ns_userid','nsuid_erroricon','Please supply user id');
						isValid = false;
					}					
					else if(el.find('#ns_userid').val().indexOf('.') == -1 || el.find('#ns_userid').val().indexOf('@') == -1)
					{						
						//el.find('#ns_userid').css('border','solid 1px #ff0000');
						this.enableValidation('ns_userid','nsuid_erroricon','Please supply correct user id');
						isValid = false;
					}
					else
					{
						this.disableValidation('ns_userid','nsuid_erroricon');
						//el.find('#ns_userid').attr('style','');
					}
					if(el.find('#ns_pwd').val() == '')
					{
						//el.find('#ns_pwd').css('border','solid 1px #ff0000');
						this.enableValidation('ns_pwd','nspwd_erroricon','Please supply password');
						isValid = false;
					}
					else
					{
						//el.find('#ns_pwd').attr('style','');
						this.disableValidation('ns_pwd','nspwd_erroricon');
					}
					if(el.find('#ns_accid').val() == '')
					{
						//el.find('#ns_accid').css('border','solid 1px #ff0000');
						this.enableValidation('ns_accid','nsaccid_erroricon','Please supply account id');
						isValid = false;
					}
					else
					{
						//el.find('#ns_accid').attr('style','');
						this.disableValidation('ns_accid','nsaccid_erroricon');
					}
					if(el.find('#ns_email').val() != '' && 
							(el.find('#ns_email').val().indexOf('.') == -1 || el.find('#ns_email').val().indexOf('@') == -1))
					{						
						//el.find('#ns_email').css('border','solid 1px #ff0000');
						this.enableValidation('ns_email','nsemail_erroricon','Please supply correct email');
						isValid = false;
					}
					else
					{
						this.disableValidation('ns_email','nsemail_erroricon');
						//el.find('#ns_email').attr('style','');
					}
					return isValid;
				},
				enableValidation:function(control,valid_icon,message)
				{
					var el = this.$el;
					el.find('#'+control).attr('style','border:solid 1px #ff0000; float:left; margin-left:15px; width:65%;');				  
					el.find('#'+valid_icon).css('display','block');
					el.find('#'+valid_icon).attr('data-content',message);
					el.find('#'+valid_icon).popover({'placement':'right','trigger':'hover',delay: { show: 0, hide:0 },animation:false});
				},
				disableValidation:function(control,valid_icon)
				{
					var el = this.$el;
					el.find('#'+valid_icon).css('display','none');
				  	el.find('#'+control).removeAttr('style');
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