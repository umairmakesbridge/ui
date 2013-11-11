define(['jquery','backbone', 'underscore','app','text!listupload/html/mapdata.html','jquery.chosen'],
function ($,Backbone,_,app,template,chosen) {
	'use strict';
	return Backbone.View.extend({
		id: 'mapdata',
		tags : 'div',
		events: {				
			'click .lt-toggle .btn':function(obj){		
				  var el = this.camp_obj.mapdataview.$el;
				  var actid = $(obj.target).attr('id');
				  if(actid == 'old')
				  {
					  el.find('#existing_lists_chosen').show();
					  el.find('#newlist').hide();
				  }
				  else if(actid == 'new')
				  {
					  el.find('#existing_lists_chosen').hide();
					  el.find('#newlist').show();
				  }
				  el.find('.lt-toggle .btn').removeClass('active');
				  $(obj.target).addClass('active');
			 },
			 'click .fubackbtn':function(){
				 var curview = this.camp_obj;
				 curview.csvupload.$el.show();
				 curview.mapdataview.$el.hide();
				 $('.loading').hide();
			 },
			 'click #import':function(){			 	
			 	var curview = this.camp_obj;
				 var el = this.camp_obj.mapdataview.$el;
				 app.showLoading("Uploading file",el);
				 var layout_map="";
				 var sel_lenght = el.find(".mapfields").length;
				  el.find(".mapfields").each(function(i,e){
					  if($(e).val()==0){
						  layout_map="";
					  }
					  else{
						 layout_map+= $(e).val();
						 if(i<sel_lenght-1){
							 layout_map+=",";
						 }
					  }
				  });
				 var actid = el.find('.lt-toggle .active').attr('id');
				 var newlist = '';
				 var listid = '';
				 if(actid == 'new')
				 	newlist = el.find('#newlist').val();
				 if(actid == 'old')				 
					listid = el.find('#existing_lists').val();
				 var alertemail = el.find('#alertemail').val();
				 var importURL = 'https://test.bridgemailsystem.com/pms/io/subscriber/uploadCSV/?BMS_REQ_TK='+app.get('bms_token')+'&stepType=two';
				 
				 $.post(importURL, { type: "import",listNumber:listid,optionalEmail:alertemail,newListName:newlist,fileName:this.camp_obj.csvupload.fileName,layout:layout_map })
				 .done(function(data) {
					 var list_json = jQuery.parseJSON(data);
					 alert(list_json[1]);
					 if(list_json[0] == 'success')
					 {					 
					 	curview.csvupload.removeFile();
					 	curview.csvupload.$el.show();
				 	 	curview.mapdataview.$el.hide();
					 }					 
					 $('.loading').hide();
				 });
			 },
		},		
		initialize:function(){
		   this.template = _.template(template);
		   this.render();		   
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