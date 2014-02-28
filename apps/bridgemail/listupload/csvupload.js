define(['app','text!listupload/html/csvupload.html','fileuploader','jquery.chosen','bms-addbox'],
function (app,template,fileuploader,chosen,addbox) {
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
                        var campview = this.camp_obj;
			var curview = this;
                        var errMessage = this.errMessage;
			var app = this.app?this.app:app;
			var el = this.$el;
			var appMsgs = app.messages[0];
			//el.find('#uploaded-holder').show();
                        if(campview){
                            campview.states.step3.change=true;
                        }
			app.showLoading("Uploading file",el);
			$.each(files, function(index, file) {
                                var extension = files[index].name.split(".")[files[index].name.split(".").length - 1].toLowerCase();
				if (extension!=="csv") 
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
										if(xhr && xhr.responseText)
										{
											curview.map_feilds = jQuery.parseJSON(xhr.responseText);
											//curview.createMappingTable(rows);											
											curview.fileuploaded=true;
                                                                                        if(campview){
                                                                                            curview.$el.hide();
                                                                                        }
                                                                                        else{
                                                                                            curview.$el.find("div:first-child").hide();
                                                                                        }
											var mapPage;
											require(["listupload/mapdata"],function(mapdataPage){	
                                                                                                if(campview){
                                                                                                    app.showLoading("Getting mapping fields...",campview.$el.find('.step3 #area_upload_csv'));
                                                                                                    mapPage = new mapdataPage({camp:campview,app:app,rows:rows});
                                                                                                    campview.states.step3.mapdataview=mapPage;
                                                                                                }
                                                                                                else{
                                                                                                    app.showLoading("Getting mapping fields...",curview.$el);
                                                                                                    mapPage = new mapdataPage({csv:curview,app:app,rows:rows});
                                                                                                }
												
												
											});
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
		initialize:function(){
		   this.template = _.template(template);			   	   
		   this.render();                   
                   if(this.camp_obj){
                    var campview = this.camp_obj;
                    this.app.showLoading(false,campview.$el.find('.step3 #area_upload_csv'));
                   }
		},
		render: function () {
			this.$el.html(this.template({}));
			this.app = this.options.app;
                        this.errMessage = 0;
			this.camp_obj = this.options.camp;
			jQuery.event.props.push('dataTransfer');
		},		
		init:function(){
                    this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));			
		}
	});
});