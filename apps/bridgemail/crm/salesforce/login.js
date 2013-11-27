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
					if((el.find('#sf_userid').val() == ''))
					{						
						//el.find('#sf_userid').css('border','solid 1px #ff0000');
						this.enableValidation('sf_userid','sfuid_erroricon','Please supply user id');
						isValid = false;
					}					
					else if(el.find('#sf_userid').val().indexOf('.') == -1 || el.find('#sf_userid').val().indexOf('@') == -1)
					{						
						//el.find('#sf_userid').css('border','solid 1px #ff0000');
						this.enableValidation('sf_userid','sfuid_erroricon','Please supply correct user id');
						isValid = false;
					}
					else
					{
						this.disableValidation('sf_userid','sfuid_erroricon');
						//el.find('#sf_userid').attr('style','');						
					}
					if(el.find('#sf_pwd').val() == '')
					{
						//el.find('#sf_pwd').css('border','solid 1px #ff0000');
						this.enableValidation('sf_pwd','sfpwd_erroricon','Please supply password');
						isValid = false;
					}
					else
					{
						//el.find('#sf_pwd').attr('style','');
						this.disableValidation('sf_pwd','sfpwd_erroricon');
					}
					if(el.find('#sf_email').val() != '' && 
							(el.find('#sf_email').val().indexOf('.') == -1 || el.find('#sf_email').val().indexOf('@') == -1))
					{						
						//el.find('#sf_email').css('border','solid 1px #ff0000');
						this.enableValidation('sf_email','sfemail_erroricon','Please supply correct email');
						isValid = false;
					}
					else
					{
						//el.find('#sf_email').attr('style','');
						this.disableValidation('sf_email','sfemail_erroricon');
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