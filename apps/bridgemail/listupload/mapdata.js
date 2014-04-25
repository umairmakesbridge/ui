define(['text!listupload/html/mapdata.html','jquery.chosen','bms-addbox'],
function (template,chosen,addbox) {
	'use strict';
	return Backbone.View.extend({
		id: 'mapdata',
		tags : 'div',
		isCampRunning : 'Y',
		newFieldName:"",
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
                                 if(this.campview){
                                    this.campview.csvupload.$el.show();                                    
                                 }
                                 else{
                                     this.csv.$el.find("div:first-child").show(); 
                                 }
                                 curview.$el.hide();
				 app.showLoading(false,curview.$el);
			 }		
                         ,
                         'click .save-contacts':function(){
                           var csvupload = this.csv;
                           if(csvupload && csvupload.fileuploaded == true)
                            {                                                             
                                var isValid = this.mapAndImport();
                                if(isValid)
                                {
                                        this.$el.hide();                                        
                                }
                                return isValid;
                            }
                            else{                        
                                this.app.showAlert('Please supply csv file to upload',this.$el.parents(".ws-content"));                        
                            }
                        }
		},	
		mapAndImport: function(){
		   var campview = this.camp_obj;
		   var curview = campview?campview.states.step3.csvupload:this.csv;
		   var app = this.app;
		   var mapview = this;
		   var appMsgs = app.messages[0];
		   var el = this.$el;
		   var actid = el.find('.map-toggle .active').attr('id');
		   var newlist = '';
		   var listid = '';
		   var isValid = true;
		   var layout_map = '';
		   var list_array = '';
		   if(app.getAppData("lists"))			
				list_array = app.getAppData("lists");
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
                        if(list_array != '')
                        {
                                var exists = false;					
                                $.each(list_array.lists[0], function(index, val) { 
                                        if(val[0].name == el.find('#newlist').val())
                                        {
                                                exists = true;
                                                return;
                                        }
                                });
                                if(exists)
                                {
                                        app.showError({
                                                control:el.find('.list-container'),
                                                message:appMsgs.MAPDATA_newlist_exists_error
                                        });
                                        isValid = false;
                                }
                                else
                                {
                                        newlist = el.find('#newlist').val();				  
                                        app.hideError({control:el.find(".list-container")});
                                }
                        }					
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
			var j=0;
			var dup=0;
			el.find(".mapfields").each(function(i,e){
				var id = $(e).parent().find('.erroricon').attr('id');
				if($(e).val()=='' && j == 0){
					layout_map="";
				}
				else
				{
					if($(e).val() == "" || layout_map.indexOf($(e).val()) == -1)
					{
						layout_map+= $(e).val();
					 	if(i<sel_lenght-1){
							layout_map+=",";
					 	}
						j++;
					}
					else if($(e).val() != "" && layout_map.indexOf($(e).val()) != -1)
					{					
						dup++;
					}					
				}
			});
                        /* Check if map data exists in Layout map */
			if(layout_map == '' || layout_map.split(',').length < 1)
			{
				app.showAlert(appMsgs.MAPDATA_bmsfields_empty_error,el);
				isValid = false;
			}
                        else{
                            var layout_map = layout_map.split(',');
                            var email_flag = null; 
                            for(var i=0;i<layout_map.length;i++){
                                if(layout_map[i]==='EMAIL_ADDR'){
                                   email_flag = 1;
                                }
                            }
                            if(email_flag!==1){
                                 app.showAlert(appMsgs.MAPDATA_bmsfields_email_error,el);
                                isValid = false;
                            }
                            layout_map = layout_map.join();
                        }
			if(dup > 0)			
			{
                            app.showAlert(appMsgs.MAPDATA_bmsfields_duplicate_error,el);
                            isValid = false;						
			}
			  
		   if(isValid)
		   {					 
			   var alertemail = el.find('#alertemail').val();
			   app.showLoading("Uploading file",curview.$el);
			   var importURL = '/pms/io/subscriber/uploadCSV/?BMS_REQ_TK='+app.get('bms_token')+'&stepType=two';                           
			   $.post(importURL, { type: "import",listNumber:listid,optionalEmail:alertemail,newListName:newlist,fileName:curview.fileName,layout:layout_map })
			   .done(function(data) {
				   var list_json = jQuery.parseJSON(data);						 
				   if(list_json[0] == 'success')
				   {					   
					   
                                           app.removeCache("lists");	
                                           if(campview){
                                                curview.removeFile();
                                                campview.states.step3.recipientType = 'List';
                                                campview.states.step3.recipientDetial = null;
                                                campview.step3SaveCall({'recipientType':'List',"listNum":list_json[2],"csvflag":true});
                                                 app.showLoading(false,mapview.$el);
                                           }
                                           else{
                                               app.showLoading(false,curview.$el);
                                               mapview.$el.hide();
                                               mapview.$el.parents(".ws-content").find(".camp_header .close-wp").click();
                                               app.showMessge("Your contacts in CSV file updated successfully");
                                           }
					  
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
			var list_html = "";
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
					});
					curview.$el.find("#existing_lists").html(list_html);								
				}
				curview.$el.find("#existing_lists").chosen({no_results_text:'Oops, nothing found!', width: "288px"});
                                if(curview.csv){
                                    app.showLoading(false,curview.csv.$el);
                                }
			}
			else
			{				
                            URL = "/pms/io/list/getListData/?BMS_REQ_TK="+app.get('bms_token')+"&type=all";				
                            jQuery.getJSON(URL,  function(tsv, state, xhr){				
                                    if(xhr && xhr.responseText){
                                            if(campview){
                                                app.showLoading(false,campview.$el.find('.step3 #area_upload_csv'));
                                            }
                                            else{
                                                app.showLoading(false,curview.csv.$el);
                                            }
                                            list_array = jQuery.parseJSON(xhr.responseText);
                                            if(list_array != '')
                                            {							
                                                    $.each(list_array.lists[0], function(index, val) { 
                                                            list_html +="<option value='"+val[0]["listNumber.encode"]+"'>"+val[0].name+"</option>";
                                                    })
                                                    curview.$el.find("#existing_lists").html(list_html);							
                                            }
                                            app.setAppData('lists',list_array);
                                            curview.$el.find("#existing_lists").chosen({no_results_text:'Oops, nothing found!', width: "288px"});
                                    }
                            }).fail(function() { console.log( "error lists listing" ); });
			}			
		},
		initialize:function(){                    
		   this.template = _.template(template);
		   this.render();
		   var curview = this;
		   var app = this.app;
		   var campview = this.options.camp;
		   var appMsgs = app.messages[0];
		   this.filllistsdropdown();
		   curview.$el.find('.tabel-div').children().remove();
		   var mappingHTML = curview.createMappingTable(curview.options.rows);
		   curview.$el.find('.tabel-div').append(mappingHTML);
                   if(campview){
                    campview.$el.find('.step3 #area_upload_csv').html(curview.$el);
                   }
                   else{
                       this.csv.$el.append(curview.$el);                       
                   }
		   curview.$el.find(".mapfields").chosen({no_results_text:'Oops, nothing found!', width: "200px"});
		   curview.$el.find(".add-custom-field").addbox({app:app,
                        addCallBack:_.bind(curview.addCustomField,curview),
                        placeholder_text:appMsgs.MAPDATA_customfield_placeholder
		   });
		   var curview = this;
		   curview.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
		},
		render: function () {
			this.$el.html(this.template({}));
			this.app = this.options.app;                        
			this.camp_obj = this.options.camp;
                        this.csv = this.options.csv;
                        if(this.csv){
                            this.$(".save-contacts").show();
                        }
                        if(this.app.get("user")){
                            var alertEmail = this.app.get("user").alertEmail?this.app.get("user").alertEmail:this.app.get("user").userEmail;
                            this.$("#alertemail").val(alertEmail);
                        }
		}
		,
		init:function(){
                    this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));			
		},
		createMappingTable:function(rows){			
			var curview = this;						
			var tcols = 4;
			var cols = rows[0].length;
			var tables_count = Math.ceil(cols/tcols);
			var mappingHTML = "";
			for(var t=0;t<tables_count;t++){
				var oc = t*tcols;
				mappingHTML +="<table id='uploadslist' class='table'>";
					for(var r=0;r<5;r++){
					   if(r==0){
						   mappingHTML +="<tr>";
							for(var h=oc;h<(oc+tcols+1);h++){
								if(h==oc){
									mappingHTML +="<th width='30px' class='leftalign'>&nbsp;</th>";
								}
								else{
									var hcol = (h<=cols)?"col"+h:"&nbsp;";
									mappingHTML +="<th width='25%'>"+hcol+"</th>";
								}
							}
						   mappingHTML +="</tr>";
					   }
					   else if(r==1){
						   mappingHTML +="<tr>";
							for(var f=oc;f<(oc+tcols+1);f++){
								if(f==oc){
									mappingHTML +="<td width='30px' class='td_footer lastrow'>&nbsp;</td>";
								}
								else{
									var cbox = (f<=cols)?curview.mapCombo(f):"&nbsp;";
									mappingHTML +="<td width='25%' class='td_footer lastrow'>"+cbox+"</td>";
								}
							}
						   mappingHTML +="</tr>"; 
					   }
					   else{
						var oddRow = (r%2==0)?"class='colorTd'":"";   
						mappingHTML +="<tr>";
							for(var c=oc;c<(oc+tcols+1);c++){
								if(c==oc){
									mappingHTML +="<td>"+(r-1)+"</td>";
								}
								else{
                                                                        if(rows[r-2]){
                                                                            var tdText = rows[r-2][c-1] ? rows[r-2][c-1] : "&nbsp;";									
                                                                            mappingHTML +="<td "+oddRow+">"+tdText+"</td>";
                                                                        }
								}
							}
						mappingHTML +="</tr>";
					   }
					}
				mappingHTML +="</table>";				
			}
			return mappingHTML;			
		},
		addCustomField: function(val,obj)
		{
			var curview = this;			
			curview.$el.find('.mapfields').append("<option value='"+val+"'>"+val+"</option>");
			var elemId = obj.attr('id');
			curview.$el.find('.mapfields.'+elemId).val(val);
			curview.$el.find('.mapfields').trigger("chosen:updated");
                        return true;
                    //curview.$el.find('.btn-close').click();
            },
		mapCombo: function(num) {
			var campview = this.options.camp;						
			var csvupload = campview?campview.states.step3.csvupload:this.csv;
			var map_feilds = csvupload.map_feilds;
			
			var chtml="";
			chtml +="<select class='mapfields "+ num +"' data-placeholder='Choose Field'>";
			chtml +="<option value=''></option>";
			var optgroupbasic ="<optgroup class='select_group' label='Select Basic Fields'>", optgroupcustom ="<optgroup class='select_group' label='Select Custom Fields'>";
			if(map_feilds)
			{
				for(var x=0;x<map_feilds.length;x++){
					var sel ="";
					if(map_feilds[x][2]=='true'){
						optgroupbasic += "<option class='select_option' value='"+map_feilds[x][0]+"' "+sel+">"+map_feilds[x][1]+"</option>";
					}
					else{
					   optgroupcustom += "<option class='select_option' value='"+map_feilds[x][0]+"' "+sel+">"+map_feilds[x][1]+"</option>";
					}
				}
			}
			optgroupbasic +="</optgroup>";
			optgroupcustom +="</optgroup>";
			chtml += optgroupbasic + optgroupcustom;
			chtml +="</select>";
			chtml +='<div class="iconpointy"><a class="btn-green showtooltip" data-original-title="Add custom field"><i class="icon plus left add-custom-field showtooltip" data-original-title="Add custom field" id="'+ num +'"></i></a></div>';
			return chtml;
		}				
	});
});