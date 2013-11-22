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
				this.$("#list_file_upload").css({'background' : '#e9ebee', 'color' : '#7a7a7a'});
			},
			'mouseout #file_control':function(obj){
				this.$("#list_file_upload").css({'background' : '#DCDEE1', 'color' : '#7A7A7A'});
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
			},
		},
		removeFile:function(){
			this.$("#dropped-files").children().remove();
			this.$("#drop-files .middle").css("display","block");
			this.dataArray = [];
			this.$("#drop-files").css({'box-shadow' : 'none', 'border' : '1px dashed #CCCCCC'});
			this.camp_obj.mapdataview.$el.hide(); 
			$('.loading').hide();
			this.fileuploaded=false;
			this.camp_obj.$el.find('#upload_csv').removeClass('selected');
		},
		showSelectedfile:function(files){
			var z = -40;
			var maxFiles = 1;
			var errMessage = 0;			
		    var curview = this.camp_obj;
				this.$el.find('#uploaded-holder').show();
				app.showLoading("Uploading file",curview.csvupload.$el);
				$.each(files, function(index, file) {
						if (!(files[index].type=="application/vnd.ms-excel" || files[index].type.indexOf("csv")>-1)) {
	
								if(errMessage == 0) {
										$('#dropped-files').html('Please select CSV file only');
										++errMessage
								}
								else if(errMessage == 1) {
										$('#dropped-files').html('Stop it! CSV only!');
										++errMessage
								}
								else if(errMessage == 2) {
										$('#dropped-files').html("Can't you read?! CSV only!");
										++errMessage
								}
								else if(errMessage == 3) {
										$('#dropped-files').html("Fine! Keep selecting non-CSV.");
										errMessage = 0;
								}
								$('.loading').hide();
								return false;
						}
						else
						{
							var fileReader = new FileReader();
							fileReader.onload = (function(file) {
	
							return function(e) { 
									curview.csvupload.dataArray.push({name : file.name, value : this.result});
									curview.csvupload.fileName=file.name;
									z = z+40;
									var image = "/pms/img/newui/csv.png";
									if(curview.csvupload.dataArray.length == 1) {
										curview.csvupload.$el.find("#drop-files .middle").css("display","none");
										curview.csvupload.fileuploaded=true;
									} 
									else {
										curview.csvupload.$el.find("#drop-files .middle").css("display","block");									
									}
									if($('#dropped-files > .image').length < maxFiles) { 
											$('#dropped-files').html('<div class="filename">'+file.name+'</div><div class="image" style="background: url('+image+'); background-size: cover;"> </div><div  id="remove-file-upload" class="btn btn-small"><i class="icon-trash"></i> Remove</div>'); 
											curview.csvupload.$el.find("#remove-file-upload").click(function(){
												curview.csvupload.removeFile();
												errMessage =0;
											});
									}
									curview.csvupload.$el.find("#drop-files").css({'box-shadow' : 'none', 'border' : '1px dashed #CCCCCC'});
									var formData = curview.csvupload.formdata ? new FormData() : null;																
									if (curview.csvupload.formdata) formData.append("file", files[index]);
									var xhr = new XMLHttpRequest();
									URL = "/pms/io/subscriber/uploadCSV/?BMS_REQ_TK="+app.get('bms_token')+"&stepType=one";
									xhr.open('POST', URL);
									xhr.send(formData);
									xhr.onreadystatechange = function() {
										if (xhr.readyState == 4 && xhr.status == 200) {
											var jsonResult = eval(xhr.responseText);						  
											if(jsonResult[0] != 'err'){
											  var rows = jsonResult;							
											  var trs = '<thead><tr><th width="4%">. </th><th class="leftalign">Col 1</th><th>Col 2</th><th>Col 3</th><th></th></tr></thead><tbody>';
											  for(var i=0;i<rows.length;i++)
											  {
												  trs += '<tr><td>'+ i +'</td><td>'+ rows[i][0] +'</td><td>'+ rows[i][1] +'</td><td>'+ rows[i][2] +'</td><td></td></tr>';								
											  }
											  curview.csvupload.createmaplists(trs);					
											}
											else
											{												
												app.showAlert(jsonResult[1],campview.csvupload.$el);
												curview.csvupload.removeFile();
											}
										}
									}
							}; 
							})(files[index]);
							fileReader.readAsDataURL(file);
						}
				});
		},
		uploadfile:function()
		{
			var curview = this.camp_obj;			
			URL = "/pms/io/subscriber/uploadCSV/?BMS_REQ_TK="+app.get('bms_token')+"&stepType=one";
			curview.csvupload.$el.find("#listupload_form").attr('action',URL);					
			curview.csvupload.$el.find("#listupload_form").ajaxSubmit({
			  beforeSerialize: function($form, options) { 
				  // return false to cancel submit                  
			  },
			  beforeSubmit: function(a,f,o) {
				 app.showLoading("Uploading file",curview.csvupload.$el);
				 o.dataType = 'json';
				 //a.value = curview.csvupload.$el.find("#dropped-files").data('file');
				 //console.log(a.value);
			  },
			  complete: function(XMLHttpRequest, textStatus) {
				  var jsonResult = eval(XMLHttpRequest.responseText);						  
				  if(jsonResult[0] != 'err'){
					var rows = jsonResult;							
					var trs = '<thead><tr><th width="4%">. </th><th class="leftalign">Col 1</th><th>Col 2</th><th>Col 3</th><th></th></tr></thead><tbody>';
					for(var i=0;i<rows.length;i++)
					{
						trs += '<tr><td>'+ i +'</td><td>'+ rows[i][0] +'</td><td>'+ rows[i][1] +'</td><td>'+ rows[i][2] +'</td><td></td></tr>';								
					}
					curview.csvupload.createmaplists(trs);					
				  }
				  else
				  {
					  app.showAlert(jsonResult[1],campview.csvupload.$el);
					  curview.csvupload.removeFile();
				  }
			  }
			});			
		},
		initialize:function(){
		   this.template = _.template(template);			   	   
		   this.render();
		},
		render: function () {
			this.$el.html(this.template({}));
			this.app = this.options.app;
			this.camp_obj = this.options.camp;
			jQuery.event.props.push('dataTransfer');
		},
		createmaplists: function(trs) {
			var curview = this.camp_obj;
			var mapURL = this.url_getMapping+"?BMS_REQ_TK="+app.get('bms_token')+"&type=upload_map_fields";
			
			jQuery.getJSON(mapURL,function(tsv, state, xhr){
				if(xhr && xhr.responseText){
					curview.csvupload.map_feilds = jQuery.parseJSON(xhr.responseText);
					var chtml="<select class='mapfields'>";
					chtml +="<option value='0'>---Select Field---</option>";
					var optgroupbasic ="<optgroup class='select_group' label='Select Basic Fields'>", optgroupcustom ="<optgroup class='select_group' label='Select Custom Fields'>";
					if(curview.csvupload.map_feilds)
					{
						for(var x=0;x<curview.csvupload.map_feilds.length;x++){
							var sel ="";
							if(curview.csvupload.map_feilds[x][2]=='true'){
								optgroupbasic += "<option class='select_option' value='"+curview.csvupload.map_feilds[x][0]+"' "+sel+">"+curview.csvupload.map_feilds[x][1]+"</option>";
							}
							else{
							   optgroupcustom += "<option class='select_option' value='"+curview.csvupload.map_feilds[x][0]+"' "+sel+">"+curview.csvupload.map_feilds[x][1]+"</option>";
							}
						}
					}
					optgroupbasic +="</optgroup>";
					optgroupcustom +="</optgroup>";
					chtml += optgroupbasic + optgroupcustom;
					chtml +="</select>";
					if(chtml)
					{
						trs += '<tr><td></td><td>'+ chtml +'</td>><td>'+ chtml +'</td><td>'+ chtml +'</td><td></td></tr></tbody>';
						curview.mapdataview.$el.find('#uploadslist').children().remove();							
						curview.mapdataview.$el.find('#uploadslist').append(trs);
						curview.csvupload.fileuploaded=true;
						curview.csvupload.filllistsdropdown();
					}					
				}
			}).fail(function() { console.log( "error fetching map fields" ); });                   		
		},
		init:function(){
			this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));
		},
		filllistsdropdown:function(){
			var list_array = '';
			var list_html = '';
			var campview = this.camp_obj;
			if(app.getAppData("lists"))
			{
				var list_array = app.getAppData("lists");
				if(list_array != '')
				{
					list_html = "<option value=''>Select Existing List</option>";
					$.each(list_array.lists[0], function(index, val) { 
						list_html +="<option value='"+val[0].listNum+"'>"+val[0].name+"</option>";
					})
					campview.mapdataview.$el.find("#existing_lists").html(list_html);
					campview.csvupload.$el.hide();
					campview.mapdataview.$el.show();
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
							list_html = "<option value=''>Select Existing List</option>";
							$.each(list_array.lists[0], function(index, val) { 
								list_html +="<option value='"+val[0].listNum+"'>"+val[0].name+"</option>";
							})
							campview.mapdataview.$el.find("#existing_lists").html(list_html);							
							campview.mapdataview.$el.find(".mapfields").chosen({no_results_text:'Oops, nothing found!', width: "200px"});
							campview.mapdataview.$el.find("#existing_lists").chosen({no_results_text:'Oops, nothing found!', width: "288px"});
							campview.csvupload.$el.hide();
							campview.mapdataview.$el.show();
						}
					}
				}).fail(function() { console.log( "error lists listing" ); });				
			}			
		},
	});
});