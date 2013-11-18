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
			 'click a.nextbtn':function(obj){
				  alert('clicked');
			  },
			 'click .fubackbtn':function(){
				 var curview = this.camp_obj;
				 curview.csvupload.$el.show();
				 curview.mapdataview.$el.hide();
				 $('.loading').hide();
			 },			 
		},	
		mapAndImport: function(){
			var curview = this.camp_obj;
		   var el = this.camp_obj.mapdataview.$el;
		   var actid = el.find('.lt-toggle .active').attr('id');
		   var newlist = '';
		   var listid = '';
		   var isValid = false;
		   var layout_map = '';
		   if(actid == 'new')
		   {
			   if(el.find('#newlist').val() == '')
			   {
				  alert('Please supply list');
				  isValid = false;
			   }
			   else
			   {
				  newlist = el.find('#newlist').val();
				  isValid = true;
			   }
		   }
		   else if(actid == 'old')
		   {
			  if(el.find('#existing_lists').val() == '')
			  {	 
				  alert('Please supply list');
				  isValid = false;
			  }
			  else
			  {
				  listid = el.find('#existing_lists').val();
				  isValid = true;
			  }
		   }				
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
			if(layout_map == "")
			{
			  isValid = false;
			  alert('Please supply mapping fields');
			}
			else
			{
				var $maps = layout_map.split(',');
				if( $maps[0] ==  $maps[1] ||
				   $maps[0] ==  $maps[2] ||
				   $maps[2] ==  $maps[3]) {
					  alert('Please supply correct mapping fields');
					  isValid = false;
				}
				else
				{
				  isValid = true;
				}
			}				 				  
			  
		   if(isValid)
		   {					 
			   var alertemail = el.find('#alertemail').val();
			   app.showLoading("Uploading file",curview.mapdataview.$el);
			   var importURL = 'https://test.bridgemailsystem.com/pms/io/subscriber/uploadCSV/?BMS_REQ_TK='+app.get('bms_token')+'&stepType=two';
			   $.post(importURL, { type: "import",listNumber:listid,optionalEmail:alertemail,newListName:newlist,fileName:this.camp_obj.csvupload.fileName,layout:layout_map })
			   .done(function(data) {
				   var list_json = jQuery.parseJSON(data);						 
				   if(list_json[0] == 'success')
				   {
					   curview.mapdataview.savecampaign(list_json[2],list_json[1]);
				   }
				   else
				   {
					  alert(list_json[1]);
					  return false;
				   }
				   $('.loading').hide();
			   });
		   }
		   else
		   	return false;
		},
		savecampaign: function(listNumber,alertMsg){
			var campview = this.camp_obj;
			var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+app.get('bms_token')+"&campNum="+campview.camp_id+"&type=recipientType";
            $.post(URL, { recipientType: "List",listNum:listNumber })
			.done(function(data) {
				var camp_json = jQuery.parseJSON(data);
				if(camp_json[0] == "success"){
					campview.csvupload.removeFile();
					app.showMessge(alertMsg);
					/*alert(alertMsg);
					campview.csvupload.$el.show();
					campview.mapdataview.$el.hide();*/
					return 1;
				}
				else
				{
					alert(list_json[1]);
					return false;
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
		}
		,
		init:function(){
			this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));			
		}
	});
});