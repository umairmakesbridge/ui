define(['text!crm/google/html/google_data.html','jquery.chosen','bms-addbox'],
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
                        },
                        'click .videobar': function(e) {
                        var _a  = $.getObj(e,"a");
                        if (_a.length){
                                var video_id = _a.attr("rel");
                                var dialog_title = "Help Video";
                                var dialog = this.app.showDialog({title: dialog_title,
                                    css: {"width": "720px", "margin-left": "-360px"},
                                    bodyCss: {"min-height": "410px"}
                                });
                                dialog.getBody().html('<iframe src="//player.vimeo.com/video/'+video_id+'" width="700" height="400" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe> ');
                        }
                        e.stopPropagation();
                        e.preventDefault();
                    }
		},	
		mapAndImport: function(){
		   var campview = this.camp_obj;
		   var curview = campview?campview.states.step3.csvupload:this.csv;
		   var app = this.options.app;
		   var mapview = this;		   
		   var el = this.$el;
		   var actid = el.find('.map-toggle .active').attr('id');
		   var newlist = '';
		   var listid = '';
		   var isValid = true;
		   var layout_map = '';
		   var list_array = ''; 
		   	var sel_lenght = el.find(".mapfields").length;
			var prevVal = '';
			var j=0;
			var dup=0;
                        var cols = '';
			el.find(".mapfields").each(function(i,e){
				var id = $(e).parent().find('.erroricon').attr('id');
                                if($(e).val()=='' && j == 0){
					layout_map="";
                                        var col = $(e).val();
                                        if($(e).val() == "" )
                                              col = 0;
                                        cols+='col_'+(i+1)+'='+col+'&';
				}
				else
				{
					if($(e).val() == "" || layout_map.indexOf($(e).val()) == -1)
					{
                                             	layout_map+= $(e).val();
                                                var col = $(e).val();
                                                if($(e).val() == "" )
                                                     col = 0;
                                                 
                                                cols+='col_'+(i+1)+'='+col+'&';
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
				app.showAlert("Please select atleast Email address as a mapping column",el);
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
                                 app.showAlert("Please select atleast Email address as a mapping column",el);
                                isValid = false;
                            }
                            layout_map = layout_map.join();
                        }
			if(dup > 0)			
			{
                            app.showAlert("Please select atleast Email address as a mapping column",el);
                            isValid = false;						
			}
			   if(isValid == false)
                            return isValid;
                        else
                            return cols;
		   
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
		   var app = this.options.app;
		   var campview = this.options.camp;		   
		   this.filllistsdropdown();
		   curview.$el.find('.tabel-div').children().remove();
		   var mappingHTML = curview.createMappingTable(curview.options.rows);
                   curview.$el.find('.tabel-div').append(mappingHTML);
                   if(campview){
                    campview.$el.find('.step3 #area_upload_csv').html(curview.$el);
                   }
                    
		   curview.$el.find(".mapfields").chosen({no_results_text:'Oops, nothing found!', width: "200px"});
		   curview.$el.find(".add-custom-field").addbox({app:app,
                        addCallBack:_.bind(curview.addCustomField,curview),
                        placeholder_text:"New custom field"
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
									var cbox = (f<=cols)?curview.mapCombo(f,this.options.mappingFields):"&nbsp;";
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
		mapCombo: function(num,fields) {
                    fields = fields.split(',');
                    var col = "col_"+num; 
                    var item = "";
                    _.each(fields,function(key,value){
                        var ar = key.split(":");
                        if(ar[0] == col)
                            item = ar[1];
                    })
                    	var campview = this.options.camp;						
			var csvupload = campview?campview.states.step3.csvupload:this.csv;
			var map_feilds = csvupload.map_feilds;
			
			var chtml="";
			chtml +="<select class='mapfields "+ num +"' data-placeholder='Choose Field'>";
			chtml +="<option value=''>Choose Field</option>";
                        chtml +="<option value=''></option>";
			var optgroupbasic ="<optgroup class='select_group' label='Select Basic Fields'>", optgroupcustom ="<optgroup class='select_group' label='Select Custom Fields'>";
			if(map_feilds)
			{
				for(var x=0;x<map_feilds.length;x++){
					var sel ="";
                                        var selected = "";
                                        if(item !="" && item !="0"){
                                            if(map_feilds[x][0] == item)
                                               selected = "selected = selected";
                                        }
					if(map_feilds[x][2]=='true'){
						optgroupbasic += "<option class='select_option' value='"+map_feilds[x][0]+"' "+sel+" "+selected+">"+map_feilds[x][1]+"</option>";
					}
					else{
					   optgroupcustom += "<option class='select_option' value='"+map_feilds[x][0]+"' "+sel+" "+selected+">"+map_feilds[x][1]+"</option>";
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