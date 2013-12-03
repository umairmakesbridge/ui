define(['text!target/html/copytarget.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.render();
                },

                render: function () {
                        this.app = this.options.app; 
                        this.target_id = this.options.target_id;
                        this.$el.html(this.template({}));                        
                },
				copyTarget:function(){
					var curview = this;
					var campview = this.options.camp;
					var editview = this.options.editview;
                   var target_id = this.target_id;
				   var el = this.$el;
				   var app = this.app;
				   var appMsgs = this.app.messages[0];
				   var copydialog = this.options.copydialog;
				   var source = this.options.source;
				   if(el.find('#copy_name').val() == '')
					{
						var options = {'control':el.find('#copy_name'),
										'valid_icon':el.find('#copyname_erroricon'),
										'controlcss':'border:solid 1px #ff0000; float:left; margin-left:15px; width:65%;',
										'message':appMsgs.CT_copyname_empty_error};
						app.enableValidation(options);						
					}
					else
					{
						var options = {'control':el.find('#copy_name'),'valid_icon':el.find('#copyname_erroricon')};
						app.disableValidation(options);
						var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK="+app.get('bms_token')+"&type=clone";
						app.showLoading("Creating copy of target...",curview.$el);
						$.post(URL, { filterName: el.find('#copy_name').val(),filterNumber: target_id})
						.done(function(data) { 
							app.showLoading(false,curview.$el);
							var res = jQuery.parseJSON(data);
							if(res[0] == 'err')
								app.showAlert(res[1].replace('&#58;',':'),el);
							else
							{								
								if(source == 'edit')
								{									
									 var URL = '/pms/io/filters/getTargetInfo/?BMS_REQ_TK='+app.get('bms_token')+'&type=get&filterNumber='+res[1];
									 app.showLoading("Loading Target...",curview.$el);
									 jQuery.getJSON(URL,  function(tsv, state, xhr){
										  app.showLoading(false,curview.$el);
										  var selected_target = jQuery.parseJSON(xhr.responseText);
										  if(app.checkError(selected_target)){
											return false;
										  }
										  if(selected_target){											  
											editview.$el.find(".targt #target_name_text span").html(selected_target.name);
											campview.states.step3.targetDialog.target_id = selected_target["filterNumber.encode"];											   
										  }
                    				 });									
								}
								copydialog.hide();
								campview.loadTargets();
							}
						});
					}
				}
        });
});