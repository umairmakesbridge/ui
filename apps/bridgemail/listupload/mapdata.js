define(['text!listupload/html/mapdata.html','jquery.chosen'],
function (template,chosen) {
	'use strict';
	return Backbone.View.extend({
		id: 'mapdata',
		tags : 'div',
		events: {				
			'click .map-toggle .btn':function(obj){		
				  var el = this.$el;
				  var actid = $(obj.target).attr('id');
				  if(actid == 'old')
				  {					  					  
					   el.find('#list_erroricon').css('display','none');
				  		el.find('#newlist').removeAttr('style');
						el.find('#newlist').hide();						
						el.find('#existing_lists_chosen').attr('style','width:288px; display:block;');
				  }
				  else if(actid == 'new')
				  {					  					  
					  el.find('#list_erroricon').css('display','none');
				  		el.find('#existing_lists_chosen').removeAttr('style');
						el.find('#existing_lists_chosen').hide();
						el.find('#newlist').show();
				  }
				  el.find('.map-toggle .btn').removeClass('active');
				  $(obj.target).addClass('active');
			 },			
			 'click .fubackbtn':function(){
				 var curview = this;
				 var app = this.app;
				 this.campview.csvupload.$el.show();
				 curview.$el.hide();
				 app.showLoading(false,curview.$el);
			 }			 
		},	
		mapAndImport: function(){
		   var campview = this.camp_obj;
		   var curview = campview.states.step3.csvupload;
		   var app = this.app;
		   var appMsgs = app.messages[0];
		   var el = this.$el;
		   var actid = el.find('.map-toggle .active').attr('id');
		   var newlist = '';
		   var listid = '';
		   var isValid = true;
		   var layout_map = '';
		   if(actid == 'new')
		   {
			   if(el.find('#newlist').val() == '')
			   {				  
				  var options = {'control':el.find('#newlist'),
								  'valid_icon':el.find('#list_erroricon'),
								  'controlcss':'border:solid 1px #ff0000; float:left; margin-right:5px; width:300px;',
								  'message':appMsgs.MAPDATA_newlist_empty_error};
				  app.enableValidation(options);
				  isValid = false;				  
			   }
			   else
			   {
				  newlist = el.find('#newlist').val();				  
				  var options = {'control':el.find('#newlist'),'valid_icon':el.find('#list_erroricon')};
					app.disableValidation(options);				  
			   }
		   }
		   else if(actid == 'old')
		   {
			  if(el.find('#existing_lists').val() == '')
			  {				  
				  var options = {'control':el.find('#existing_lists_chosen'),
								  'valid_icon':el.find('#list_erroricon'),
								  'controlcss':'float:left;margin-right:5px; width:288px;',
								  'customfield':el.find('#existing_lists_chosen a'),
								  'customfieldcss':'border:solid 1px #ff0000;',
								  'message':appMsgs.MAPDATA_extlist_empty_error};
				  app.enableValidation(options);				 
				  isValid = false;
			  }
			  else
			  {				  
				  listid = el.find('#existing_lists').val();
				  var options = {'control':el.find('#existing_lists_chosen'),
								  'valid_icon':el.find('#list_erroricon'),
								  'customfield':el.find('#existing_lists_chosen a'),
								  'customfieldcss':'border:inherit;'};					
				  app.disableValidation(options);
				  el.find('#existing_lists_chosen').attr('style','width: 288px;');
			  }
		   }
		   var email_addr = el.find('#alertemail').val();
		   if(email_addr != '' && !app.validateEmail(email_addr))
			{				
				var options = {'control':el.find('#alertemail'),
								'valid_icon':el.find('#email_erroricon'),
								'controlcss':'border:solid 1px #ff0000; float:left; margin-right:5px;',
								'message':appMsgs.MAPDATA_email_format_error};
				app.enableValidation(options);
				isValid = false;
			}
			else
			{				
				var options = {'control':el.find('#alertemail'),'valid_icon':el.find('#email_erroricon')};
				app.disableValidation(options);
			}		   
		   	var sel_lenght = el.find(".mapfields").length;
			el.find(".mapfields").each(function(i,e){
				var id = $(e).parent().find('.erroricon').attr('id');
				if($(e).val()==0){
					layout_map="";					
					/*$(e).parent().find('.erroricon').attr('style','display:block; float:left; margin-left:5px;');					
					el.find("#" + id).popover({'placement':'right','container': el,'trigger':'hover',delay: { show: 0, hide:0 },animation:false});
					el.find("#" + $(e).attr('id')+"_chosen").attr('style','width:200px; float:left;');
					el.find("#" + $(e).attr('id')+"_chosen a").attr('style','border:solid 1px #ff0000;');*/
				}
				else
				{					
					/*el.find("#" + id).removeAttr('style');
					el.find("#" + $(e).attr('id')+"_chosen").removeAttr('style');
					el.find("#" + $(e).attr('id')+"_chosen a").removeAttr('style');
					$(e).hide();
					el.find("#" + $(e).attr('id')+"_chosen").attr('style','width:200px;');*/					
					 layout_map+= $(e).val();
					 if(i<sel_lenght-1){
						 layout_map+=",";
					 }
				}
			});
			if(layout_map == "")
			{
				app.showAlert('Please provide BMS fields against each column to fetch data in correct format',el);
				isValid = false;
			}
			/*else
			{
				var $maps = layout_map.split(',');
				if( $maps[0] ==  $maps[1] ||
				   $maps[0] ==  $maps[2] ||
				   $maps[2] ==  $maps[3]) 
				{					  
					  isValid = false;					  
				}
			}*/
			  
		   if(isValid)
		   {					 
			   var alertemail = el.find('#alertemail').val();
			   app.showLoading("Uploading file",curview.$el);
			   var importURL = '/pms/io/subscriber/uploadCSV/?BMS_REQ_TK='+app.get('bms_token')+'&stepType=two';
			   $.post(importURL, { type: "import",listNumber:listid,optionalEmail:alertemail,newListName:newlist,fileName:campview.states.step3.csvupload.fileName,layout:layout_map })
			   .done(function(data) {
				   var list_json = jQuery.parseJSON(data);						 
				   if(list_json[0] == 'success')
				   {

					   //return curview.mapdataview.savecampaign(list_json[2],list_json[1]);
					   curview.removeFile();
                                           app.removeCache("lists");
					   campview.step3SaveCall({'recipientType':'List',"listNum":list_json[2]});

					   //return true;
				   }
				   else
				   {					  
					  app.showAlert(list_json[1],curview.$el);
					  return false;
				   }
				   app.showLoading(false,curview.$el);
			   });
		   }
		   else
		   	return false;
		},
		filllistsdropdown:function(){
			var list_array = '';
			var list_html = "<option value=''>Select Existing List</option>";
			var campview = this.camp_obj;
			var app = this.app;
			var curview = this;
			if(app.getAppData("lists"))
			{
				list_array = app.getAppData("lists");
				if(list_array != '')
				{					
					$.each(list_array.lists[0], function(index, val) { 
						list_html +="<option value='"+val[0]["listNumber.encode"]+"'>"+val[0].name+"</option>";
					})					
				}
			}
			else
			{				
				URL = "/pms/io/list/getListData/?BMS_REQ_TK="+app.get('bms_token')+"&type=all";				
				jQuery.getJSON(URL,  function(tsv, state, xhr){				
					if(xhr && xhr.responseText){
						list_array = jQuery.parseJSON(xhr.responseText);
						if(list_array != '')
						{							
							$.each(list_array.lists[0], function(index, val) { 
								list_html +="<option value='"+val[0]["listNumber.encode"]+"'>"+val[0].name+"</option>";
							})							
						}
					}
				}).fail(function() { console.log( "error lists listing" ); });				
			}
			curview.$el.find("#existing_lists").html(list_html);			
			curview.$el.find("#existing_lists").chosen({no_results_text:'Oops, nothing found!', width: "288px"});
			app.showLoading(false,campview.$el.find('.step3 #area_upload_csv'));
		},
		initialize:function(){                    
		   this.template = _.template(template);
		   this.render();
		   this.filllistsdropdown();
		},
		render: function () {
			this.$el.html(this.template({}));
			this.app = this.options.app;                        
			this.camp_obj = this.options.camp;			
		}
		,
		init:function(){
			this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));			
		}
	});
});