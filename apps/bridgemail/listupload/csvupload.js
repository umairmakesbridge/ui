define(['app','text!listupload/html/csvupload.html','fileuploader','jquery.chosen'],
function (app,template,fileuploader,chosen) {
	'use strict';
	return Backbone.View.extend({
		id: 'csvupload',
		tags : 'div',
		url_getMapping:"/pms/output/workflow/getMetaData.jsp",
		url:"/pms/input/subscriber/uploadSubscribers.jsp",
		dataArray:[],
		map_feilds:[],
		fileuploaded:false,
		fileName:"",
		formdata: !!window.FormData,
		events: {			
			'change #file_control':function(obj){
				var input_obj = obj.target;
			   	var files = input_obj.files; 
			   	this.fileuploaded=false;				
			   	this.showSelectedfile(files);
			},
			'mouseover #file_control':function(obj){
				this.$("#list_file_upload").css({'background' : '#7996a8', 'color' : '#ffffff'});
			},
			'mouseout #file_control':function(obj){
				this.$("#list_file_upload").css({'background' : '#91ABBC', 'color' : '#ffffff'});
			},
			'drop #drop-files': function(e) {
				if(this.$("#dropped-files .image").length!==0) return false;
				var files = e.dataTransfer.files;
				this.showSelectedfile(files);				
				return false;				
			},
			'dragenter #drop-files': function(obj) {
				if(this.$("#dropped-files .image").length!==0) return false;
                                this.$("#drop-files").css({'box-shadow' : 'inset 0px 0px 20px rgba(0, 0, 0, 0.1)', 'border' : '1px dashed #bb2b2b'});
				return false;
			}
		},
		removeFile:function(){
			this.$("#dropped-files").children().remove();
			this.$("#drop-files .middle").css("display","block");
			this.dataArray = [];
			this.$("#drop-files").css({'box-shadow' : 'none', 'border' : '1px dashed #CCCCCC'});
			this.camp_obj.states.step3.mapdataview.$el.hide(); 
			$('.loading').hide();
			this.fileuploaded=false;
			this.camp_obj.$el.find('#upload_csv').removeClass('selected');
		},
		showSelectedfile:function(files){
			var z = -40;
			var maxFiles = 1;
			var errMessage = 0;
		    var campview = this.camp_obj;
			var curview = this;
			var app = this.app;
			var el = this.$el;
			var appMsgs = app.messages[0];
			//el.find('#uploaded-holder').show();
			campview.states.step3.change=true;
			app.showLoading("Uploading file",el);
			$.each(files, function(index, file) {
				if (!(files[index].type=="application/vnd.ms-excel" || files[index].type.indexOf("csv")>-1)) 
				{
					if(errMessage == 0) {
							el.find('#dropped-files').html(appMsgs.CSVUpload_wrong_filetype_error);
							++errMessage
					}
					else if(errMessage == 1) {
							el.find('#dropped-files').html('Stop it! CSV only!');
							++errMessage
					}
					else if(errMessage == 2) {
							el.find('#dropped-files').html("Can't you read?! CSV only!");
							++errMessage
					}
					else if(errMessage == 3) {
							el.find('#dropped-files').html("Fine! Keep selecting non-CSV.");
							errMessage = 0;
					}
					app.showLoading(false,el);
					return false;
				}
				else
				{
					var fileReader = new FileReader();
					fileReader.onload = (function(file) {
					el.find('#dropped-files').hide();
					return function(e) { 
						curview.dataArray.push({name : file.name, value : this.result});
						curview.fileName=file.name;
						z = z+40;
						var image = "/pms/img/newui/csv.png";
						if(curview.dataArray.length == 1) {
							el.find("#drop-files .middle").css("display","none");
							curview.fileuploaded=true;
						} 
						else {
							el.find("#drop-files .middle").css("display","block");									
						}
						/*if(el.find('#dropped-files > .image').length < maxFiles) { 
								el.find('#dropped-files').html('<div class="filename">'+file.name+'</div><div class="image" style="background: url('+image+'); background-size: cover;"> </div><div  id="remove-file-upload" class="btn btn-small"><i class="icon-trash"></i> Remove</div>'); 
								el.find("#remove-file-upload").click(function(){
									curview.removeFile();
									errMessage =0;
								});
						}*/
						el.find("#drop-files").css({'box-shadow' : 'none', 'border' : '1px dashed #CCCCCC'});
						var formData = curview.formdata ? new FormData() : null;																
						if (curview.formdata) formData.append("file", files[index]);
						var xhr = new XMLHttpRequest();
						URL = "/pms/io/subscriber/uploadCSV/?BMS_REQ_TK="+app.get('bms_token')+"&stepType=one";
						xhr.open('POST', URL);
						xhr.send(formData);
						xhr.onreadystatechange = function() {
							if (xhr.readyState == 4 && xhr.status == 200) {
								var jsonResult = eval(xhr.responseText);						  
								if(jsonResult[0] != 'err'){									
									var rows = jsonResult;									
									var mapURL = curview.url_getMapping+"?BMS_REQ_TK="+app.get('bms_token')+"&type=upload_map_fields";			
									jQuery.getJSON(mapURL,function(tsv, state, xhr){
										if(xhr && xhr.responseText){
											curview.map_feilds = jQuery.parseJSON(xhr.responseText);
											curview.createMappingTable(rows);
										}
									});									
								}
								else
								{												
									app.showAlert(jsonResult[1],el);
									curview.removeFile();
								}
							}
						}
					}; 
					})(files[index]);
					fileReader.readAsDataURL(file);
				}
			});
		},
		createMappingTable:function(rows){
			var campview = this.camp_obj;
			var curview = this;
			var app = this.app;
			
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
									var cbox = (f<=cols)?curview.mapCombo():"&nbsp;";
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
									var tdText = rows[r-2][c-1] ? rows[r-2][c-1] : "&nbsp;";
									
									mappingHTML +="<td "+oddRow+">"+tdText+"</td>";
								}
							}
						mappingHTML +="</tr>";
					   }
					}
				mappingHTML +="</table>";				
			}						
			curview.$el.find('.tabel-div').children().remove();
			curview.fileuploaded=true;
			curview.$el.hide();
			var mapPage;
			require(["listupload/mapdata"],function(mapdataPage){				
				app.showLoading("Getting mapping fields...",campview.$el.find('.step3 #area_upload_csv'));
				mapPage = new mapdataPage({camp:campview,app:app});
				mapPage.$el.find('.tabel-div').append(mappingHTML);
				campview.$el.find('.step3 #area_upload_csv').html(mapPage.$el);
				mapPage.$el.find(".mapfields").chosen({no_results_text:'Oops, nothing found!', width: "200px", 'data-placeholder':"---Select Field---"});
				campview.states.step3.mapdataview=mapPage;
			});
		},		
		initialize:function(){
		   this.template = _.template(template);			   	   
		   this.render();
		   var campview = this.camp_obj;
		   this.app.showLoading(false,campview.$el.find('.step3 #area_upload_csv'));
		},
		render: function () {
			this.$el.html(this.template({}));
			this.app = this.options.app;
			this.camp_obj = this.options.camp;
			jQuery.event.props.push('dataTransfer');
		},
		mapCombo: function() {
			var campview = this.camp_obj;
			var curview = this;
			var app = this.app;
			
			var chtml="";
			chtml +="<select class='mapfields'>";
			var optgroupbasic ="<optgroup class='select_group' label='Select Basic Fields'>", optgroupcustom ="<optgroup class='select_group' label='Select Custom Fields'>";
			if(curview.map_feilds)
			{
				for(var x=0;x<curview.map_feilds.length;x++){
					var sel ="";
					if(curview.map_feilds[x][2]=='true'){
						optgroupbasic += "<option class='select_option' value='"+curview.map_feilds[x][0]+"' "+sel+">"+curview.map_feilds[x][1]+"</option>";
					}
					else{
					   optgroupcustom += "<option class='select_option' value='"+curview.map_feilds[x][0]+"' "+sel+">"+curview.map_feilds[x][1]+"</option>";
					}
				}
			}
			optgroupbasic +="</optgroup>";
			optgroupcustom +="</optgroup>";
			chtml += optgroupbasic + optgroupcustom;
			chtml +="</select>";
			return chtml;
		},
		init:function(){
			this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));
		},		
	});
});