define(['text!listupload/html/mapdata.html','jquery.chosen'],
function (template,chosen) {
	'use strict';
	return Backbone.View.extend({
		id: 'mapdata',
		tags : 'div',
		isCampRunning : 'Y',
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
		   var mapview = this;
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
				  app.showError({
					  control:el.find('.list-container'),
					  message:appMsgs.MAPDATA_newlist_empty_error
				  });
				  isValid = false;				  
			   }
			   else
			   {
				  newlist = el.find('#newlist').val();				  
					app.hideError({control:el.find(".list-container")});
			   }
		   }
		   else if(actid == 'old')
		   {
			  if(el.find('#existing_lists').val() == '')
			  {				  
				  app.showError({
					  control:el.find('.list-container'),
					  message:appMsgs.MAPDATA_extlist_empty_error
				  });
				  isValid = false;
			  }
			  else
			  {				  
				  listid = el.find('#existing_lists').val();				  
				  app.hideError({control:el.find(".list-container")});
			  }
		   }
		   var email_addr = el.find('#alertemail').val();
		   if(email_addr != '' && !app.validateEmail(email_addr))
			{				
				app.showError({
					  control:el.find('.email-container'),
					  message:appMsgs.MAPDATA_email_format_error
				  });
				isValid = false;
			}
			else
			{				
				app.hideError({control:el.find(".email-container")});
			}		   
		   	var sel_lenght = el.find(".mapfields").length;
			var prevVal = '';
			el.find(".mapfields").each(function(i,e){
				var id = $(e).parent().find('.erroricon').attr('id');
				if($(e).val()==0){
					layout_map="";					
				}
				else
				{
					if(layout_map.indexOf($(e).val()) == -1)
					{
						layout_map+= $(e).val();
					 	if(i<sel_lenght-1){
							layout_map+=",";
					 	}
					}
					else
					{					
						app.showAlert('BMS fields should be unique',el);
						isValid = false;
						return;
					}					
				}
			});
			if(layout_map == "")
			{
				app.showAlert('Please provide BMS fields against each column to fetch data in correct format',el);
				isValid = false;
			}			
			  
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
					   setTimeout(function(){ mapview.checkCampStatus() },30000);
					   //mapview.checkCampStatus();
					   campview.step3SaveCall({'recipientType':'List',"listNum":list_json[2]});
					   app.showLoading(false,mapview.$el);
				   }
				   else
				   {					  
					  app.showAlert(list_json[1],mapview.$el);
					  return false;
				   }				   
			   });
		   }
		   else
		   	return false;
		},
		checkCampStatus:function(){
			var mapview = this;
			var campview = this.camp_obj;
			var importURL = '/pms/io/campaign/getCampaignData/?BMS_REQ_TK='+this.app.get('bms_token');
			$.post(importURL, { type: "csvUploadRunning",campNum:campview.camp_id })
			.done(function(data) {
				var list_json = jQuery.parseJSON(data);
				if(list_json.csvUploadRunning == 'Y')
				{
					setTimeout(function(){ mapview.checkCampStatus() },30000);
					mapview.isCampRunning = 'Y';
				}
				else
					mapview.isCampRunning = 'N';
			});
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