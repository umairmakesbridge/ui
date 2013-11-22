define(['text!crm/netsuite/html/login.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
					"click #btnTestLogin":function(){						
						var el = this.$el;
						var app = this.options.app;
						var isValid = this.validateLoginFields();
						if(!isValid)
						{							
							app.showAlert("Please correct validation errors.",el);
						}
						else
						{							
							this.testCredentials();							
						}
                    },
					"click #btnSaveLogin":function(obj){						
						if($(obj.target).hasClass('saving'))
							return false;
						else
						{
							var el = this.$el;
							var app = this.options.app;
							var isValid = this.validateLoginFields();
							if(!isValid)
							{
								app.showAlert("Please correct validation errors.",el);
							}
							else
							{							
								this.saveCredentials();
							}
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
					el.find('#ns_userid').attr('readonly','readonly');
					el.find('#ns_pwd').attr('readonly','readonly');
					el.find('#ns_email').attr('readonly','readonly');
					el.find('#ns_accid').attr('readonly','readonly');
					el.find('#btnSaveLogin').addClass('saving');
					var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+app.get('bms_token')+"&type=setCred";				
					$.post(URL, { nsUserID: curview.$el.find('#ns_userid').val(),nsPass: curview.$el.find('#ns_pwd').val(),nsAccountID: curview.$el.find('#ns_accid').val(),nsEmail:curview.$el.find('#ns_email').val()})
					.done(function(data) { 
						var creds = jQuery.parseJSON(data);                            
						if(creds.err)
						{							
							app.showAlert(creds.err.replace('&#58;',':'),curview.$el);
							el.find('#ns_userid').removeAttr('readonly');
							el.find('#ns_pwd').removeAttr('readonly');
							el.find('#ns_accid').removeAttr('readonly');
							el.find('#ns_email').removeAttr('readonly');
							el.find('#btnSaveLogin').removeClass('saving');
						}
						else
						{
							logindialog.hide();
							el.find('#ns_userid').removeAttr('readonly');
							el.find('#ns_pwd').removeAttr('readonly');
							el.find('#ns_accid').removeAttr('readonly');
							el.find('#ns_email').removeAttr('readonly');
							el.find('#btnSaveLogin').removeClass('saving');
							curview.options.camp.checkNetSuiteStatus();
						}
					});
				},
				validateLoginFields: function() {
					var el = this.$el;
					var isValid = true;
					if((el.find('#ns_userid').val() == ''))
					{						
						el.find('#ns_userid').css('border','solid 1px #ff0000');
						isValid = false;
					}					
					else if(el.find('#ns_userid').val().indexOf('.') == -1 || el.find('#ns_userid').val().indexOf('@') == -1)
					{						
						el.find('#ns_userid').css('border','solid 1px #ff0000');
						isValid = false;
					}
					else
						el.find('#ns_userid').attr('style','');
					if(el.find('#ns_pwd').val() == '')
					{
						el.find('#ns_pwd').css('border','solid 1px #ff0000');
						isValid = false;
					}
					else
						el.find('#ns_pwd').attr('style','');
					if(el.find('#ns_accid').val() == '')
					{
						el.find('#ns_accid').css('border','solid 1px #ff0000');
						isValid = false;
					}
					else
						el.find('#ns_accid').attr('style','');
					if(el.find('#ns_email').val() != '' && 
							(el.find('#ns_email').val().indexOf('.') == -1 || el.find('#ns_email').val().indexOf('@') == -1))
					{						
						el.find('#ns_email').css('border','solid 1px #ff0000');
						isValid = false;
					}
					else
						el.find('#ns_email').attr('style','');
					return isValid;
				},
                initialize: function () {
					this.template = _.template(template);				
					this.render();
					var el = this.$el;
					var app = this.options.app;
					el.find('#ns_userid').attr('readonly','readonly');
					el.find('#ns_pwd').attr('readonly','readonly');
					el.find('#ns_email').attr('readonly','readonly');
					el.find('#ns_accid').attr('readonly','readonly');
					var netsuite_setting = this.app.getAppData("netsuite");
					app.showLoading('Loading Credentials',el);
					if(netsuite_setting && netsuite_setting.isNetsuiteUser=="Y")
					{
						var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getCred";
						jQuery.getJSON(URL,  function(tsv, state, xhr){							
							var creds = jQuery.parseJSON(xhr.responseText);
							if(creds)
							{
								el.find('#ns_userid').removeAttr('readonly');
								el.find('#ns_pwd').removeAttr('readonly');
								el.find('#ns_accid').removeAttr('readonly');
								el.find('#ns_email').removeAttr('readonly');
								el.find('#ns_userid').val(creds["nsUserID"]);
								el.find('#ns_accid').val(creds["nsAccountID"]);
								el.find('#ns_email').val(creds["nsEmail"]);								
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