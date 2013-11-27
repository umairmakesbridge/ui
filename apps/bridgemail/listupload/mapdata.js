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
				  el.find('.lt-toggle .btn').removeClass('active');
				  $(obj.target).addClass('active');
			 },			
			 'click .fubackbtn':function(){
				 var curview = this.camp_obj;
				 curview.csvupload.$el.show();
				 curview.mapdataview.$el.hide();
				 app.showLoading(false,curview.mapdataview.$el);
			 }			 
		},	
		mapAndImport: function(){
                   var curview = this.camp_obj;
		   var el = this.camp_obj.mapdataview.$el;
		   var actid = el.find('.lt-toggle .active').attr('id');
		   var newlist = '';
		   var listid = '';
		   var isValid = true;
		   var layout_map = '';
		   if(actid == 'new')
		   {
			   if(el.find('#newlist').val() == '')
			   {				  
				  //app.showAlert('Please supply list',curview.mapdataview.$el);
				  el.find('#list_erroricon').css('display','block');
				  el.find('#newlist').attr('style','border:solid 1px #ff0000; float:left;margin-right:5px; width:300px;');				  
				  el.find("#list_erroricon").popover({'placement':'right','trigger':'hover',delay: { show: 0, hide:0 },animation:false});
				  isValid = false;				  
			   }
			   else
			   {
				  newlist = el.find('#newlist').val();
				  el.find('#list_erroricon').css('display','none');
				  el.find('#newlist').removeAttr('style');
				  //isValid = true;
			   }
		   }
		   else if(actid == 'old')
		   {
			  if(el.find('#existing_lists').val() == '')
			  {	 
				  //app.showAlert('Please supply list',curview.mapdataview.$el);
				  el.find('#list_erroricon').css('display','block');
				  el.find('#existing_lists_chosen').attr('style','float:left;margin-right:5px; width:288px;');
				  el.find('#existing_lists_chosen a').attr('style','border:solid 1px #ff0000;');				  
				  el.find("#list_erroricon").popover({'placement':'right','trigger':'hover',delay: { show: 0, hide:0 },animation:false});
				  isValid = false;
			  }
			  else
			  {
				  listid = el.find('#existing_lists').val();
				  el.find('#list_erroricon').css('display','none');
				  el.find('#existing_lists_chosen').removeAttr('style');
				  el.find('#existing_lists_chosen a').removeAttr('style');
				  el.find('#existing_lists_chosen').attr('style','width:288px;');
				  //isValid = true;
			  }
		   }
		   var email_addr = el.find('#alertemail').val();
		   if(email_addr != '' && (email_addr.indexOf('.') == -1 || email_addr.indexOf('@') == -1))
			{
				el.find('#alertemail').attr('style','border:solid 1px #ff0000; float:left; margin-right:5px;');
				el.find('#email_erroricon').css('display','block');
				el.find("#email_erroricon").popover({'placement':'right','trigger':'hover',delay: { show: 0, hide:0 },animation:false});
				isValid = false;
			}
			else
			{
				el.find('#alertemail').removeAttr('style');
				el.find('#email_erroricon').css('display','none');
				//isValid = true;
			}		   
		   	var sel_lenght = el.find(".mapfields").length;
			el.find(".mapfields").each(function(i,e){
				var id = $(e).parent().find('.erroricon').attr('id');
				if($(e).val()==0){
					layout_map="";
					//$(e).attr('style','border:solid 1px #ff0000;');					
					$(e).parent().find('.erroricon').attr('style','display:block; float:left; margin-left:5px;');
					//el.find("#" + id).tooltip({'placement':'right','container': el,'trigger':'click',delay: { show: 0, hide:0 },animation:false});
					el.find("#" + id).popover({'placement':'right','container': el,'trigger':'hover',delay: { show: 0, hide:0 },animation:false});
					el.find("#" + $(e).attr('id')+"_chosen").attr('style','width:200px; float:left;');
					el.find("#" + $(e).attr('id')+"_chosen a").attr('style','border:solid 1px #ff0000;');
				}
				else
				{
					//$(e).removeAttr('style');
					el.find("#" + id).removeAttr('style');
					el.find("#" + $(e).attr('id')+"_chosen").removeAttr('style');
					el.find("#" + $(e).attr('id')+"_chosen a").removeAttr('style');
					$(e).hide();
					el.find("#" + $(e).attr('id')+"_chosen").attr('style','width:200px;');
					//$(e).removeAttr('style');
					 layout_map+= $(e).val();
					 if(i<sel_lenght-1){
						 layout_map+=",";
					 }
				}
			});
			if(layout_map == "")
			{
			  isValid = false;
			  /*el.find('#mf1_erroricon').css('display','block');
			  el.find('#mf2_erroricon').css('display','block');
			  el.find('#mf3_erroricon').css('display','block');*/
			  //app.showAlert('Please supply mapping fields',curview.mapdataview.$el);
			}
			else
			{
				var $maps = layout_map.split(',');
				if( $maps[0] ==  $maps[1] ||
				   $maps[0] ==  $maps[2] ||
				   $maps[2] ==  $maps[3]) {					  
					  //app.showAlert('Please supply correct mapping fields',curview.mapdataview.$el);
					  isValid = false;
					  /*el.find('#mf1_erroricon').css('display','block');
					  el.find('#mf2_erroricon').css('display','block');
					  el.find('#mf3_erroricon').css('display','block');*/
				}
				else
				{
				  //isValid = true;
				  		/*el.find('#mf1_erroricon').css('display','none');
					  el.find('#mf2_erroricon').css('display','none');
					  el.find('#mf3_erroricon').css('display','none');*/
				}
			}
			  
		   if(isValid)
		   {					 
			   var alertemail = el.find('#alertemail').val();
			   app.showLoading("Uploading file",curview.mapdataview.$el);
			   var importURL = '/pms/io/subscriber/uploadCSV/?BMS_REQ_TK='+app.get('bms_token')+'&stepType=two';
			   $.post(importURL, { type: "import",listNumber:listid,optionalEmail:alertemail,newListName:newlist,fileName:this.camp_obj.csvupload.fileName,layout:layout_map })
			   .done(function(data) {
				   var list_json = jQuery.parseJSON(data);						 
				   if(list_json[0] == 'success')
				   {

					   //return curview.mapdataview.savecampaign(list_json[2],list_json[1]);
					   curview.csvupload.removeFile();
					   curview.step3SaveCall({'recipientType':'List',"listNum":list_json[2]});
					   //return true;
				   }
				   else
				   {					  
					  app.showAlert(list_json[1],curview.mapdataview.$el);
					  return false;
				   }
				   app.showLoading(false,curview.mapdataview.$el);
			   });
		   }
		   else
		   	return false;
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