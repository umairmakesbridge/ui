define(['jquery.bmsgrid','jquery.highlight','jquery.searchcontrol','text!html/campaigns.html','bms-filters','daterangepicker'],
function (bmsgrid,jqhighlight,jsearchcontrol,template,bmsfilters,_daterangepicker) {
        'use strict';
        return Backbone.View.extend({
			id: 'campaigns_list',
			tags : 'div',
			events: {				
				"click #addnew_campaign":function(){             		
					this.createCampaign();
				},
				"click #camps_grid .btn-gray":function(obj){
					var camp_obj = this;
					var target = $.getObj(obj,"a");
					if(target.attr("id")){
						camp_obj.app.mainContainer.openCampaign(target.attr("id"));
					}
				},
				"click #camps_grid .btn-red":function(obj){
					var camp_obj = this;
					var target = $.getObj(obj,"a");
					if(target.attr("id")){
						camp_obj.app.showAlertDetail({heading:'Confirm',
                                                detail:'Are you sure you want to delete this campaign?',
                                                login:'<div class="confalert-buttons"><a class="btn-green left btn-ok">Ok</a><a class="btn-gray left btn-cancel">Cancel</a></div>'},
                                                camp_obj.$el.parents(".ws-content.active"));
						$(".overlay .btn-ok").click(function(){
							$(".overlay").remove();
						   camp_obj.deleteCampaign(target.attr("id"));
						});
					}
				},
				"click #camps_grid .btn-preview":function(obj){
					var camp_obj = this;
					var target = $.getObj(obj,"a");
					if(target.attr("id")){
						camp_obj.previewCampaign(target.attr("id"));
					}
				},
				"click .stattype":function(obj){
					var camp_obj = this;
					var target = $.getObj(obj,"a");
					camp_obj.$el.find('.stattype').parent().removeClass('active');
					target.parent().addClass('active');
					var type = target.attr("search");
					var schDates = this.$('#daterange').val().split(' - ');
					var dateURL = ""
					if(schDates)
					{
						var fromDateParts = schDates[0].split('/');
						var fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2,4);
						var toDateParts = schDates[1].split('/');
						var toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2,4);
						var dateURL = "fromDate="+fromDate+"&toDate="+toDate;
					}
					camp_obj.app.removeCache("campaigns");
					camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#target-camps"));
					camp_obj.app.getData({
						"URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&"+dateURL,
						"key":"campaigns",
						"callback":_.bind(camp_obj.createListTable,camp_obj)
					});					
				},
				"click .btn-draft":function(obj){
					var camp_obj = this;
					var target = $.getObj(obj,"a");
					var camp_id = target.attr("id");
					var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
					camp_obj.app.showLoading("Changing Campaign to Draft...",camp_obj.$el.parents(".ws-content.active"));
					var camp_json = '';
					$.post(URL, {type:'saveStep4',campNum:camp_id,status:'D'})
					.done(function(data) {
						camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));
						camp_json = jQuery.parseJSON(data);
						if(camp_json[0] == 'err')
						{
							camp_obj.app.showAlert(camp_json[1],camp_obj.$el.parents(".ws-content.active"));
						}
						else
						{
							camp_obj.app.mainContainer.openCampaign(camp_id);
						}
					});					
				},
				"click .btnDone,.calendericon":function(obj)
				{
					var camp_obj = this;
					var schDates = this.$('#daterange').val().split(' - ');
					var fromDateParts = schDates[0].split('/');
					var fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2,4);
					var toDateParts = schDates[1].split('/');
					var toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2,4);
					var type = camp_obj.$('ul#template_search_menu li.active a').attr('search');
					if(!type)
						type = 'A';
					camp_obj.app.removeCache("campaigns");
					camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#target-camps"));
					camp_obj.app.getData({
						"URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&fromDate="+fromDate+"&toDate="+toDate,
						"key":"campaigns",
						"callback":_.bind(camp_obj.createListTable,camp_obj)
					});
				}
			},
			previewCampaign: function(camp_id)
			{
				var camp_obj = this;
				var URL = '/pms/io/campaign/getCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');				
				var camps_json = '';
				$.post(URL, {type:'basic',campNum:camp_id})
				.done(function(data) {      
					camps_json = jQuery.parseJSON(data); 					
					//if(camps_json.htmlText!==""){                           
						var dialog_width = $(document.documentElement).width()-60;
						var dialog_height = $(document.documentElement).height()-182;
						var dialog = camp_obj.app.showDialog({title:'Campaign Preview',
								  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
								  headerEditable:false,
								  bodyCss:{"min-height":dialog_height+"px"}                                                                          
						});						
						var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\"about:blank\"></iframe>");                            
						dialog.getBody().html(preview_iframe);
						camp_obj.app.showLoading("Loading Campaign HTML...",dialog.getBody());
						preview_iframe[0].contentWindow.document.open('text/html', 'replace');
						preview_iframe[0].contentWindow.document.write(camp_obj.app.decodeHTML(camps_json.htmlText,true));
						preview_iframe[0].contentWindow.document.close();
						camp_obj.app.showLoading(false,dialog.getBody());
					//}
				});							   	
			},
			deleteCampaign: function(camp_id)
			{
				var camp_obj = this;				
				var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
				camp_obj.app.showLoading("Deleting Campaign...",camp_obj.$el.parents(".ws-content.active"));
				$.post(URL, {type:'delete',campNum:camp_id})
				.done(function(data) {                                 
					   var del_camp_json = jQuery.parseJSON(data);  
					   /*if(camp_obj.app.checkError(del_camp_json)){
							  return false;
					   }*/
					   if(del_camp_json[0]!=="err"){
						   camp_obj.app.showMessge("Campaign Deleted");
						   camp_obj.$el.find("#area_copy_campaign .bmsgrid").remove();
						   camp_obj.app.removeCache("campaigns");
						   camp_obj.getallcampaigns();
					   }
					   else
					   {
							camp_obj.app.showAlert(del_camp_json[1],camp_obj.$el.parents(".ws-content.active"));							
					   }
					   camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));					   
			   	});
			},
			createCampaign: function()
			{
				var camp_obj = this;
				var dialog_title = "New Campaign";
				var dialog = this.app.showDialog({title:dialog_title,
						  css:{"width":"650px","margin-left":"-325px"},
						  bodyCss:{"min-height":"100px"},							   
						  buttons: {saveBtn:{text:'Create Campaign'} }                                                                           
				});
				this.app.showLoading("Loading...",dialog.getBody());
				require(["newcampaign"],function(newcampPage){                                     
						 var mPage = new newcampPage({camp:camp_obj,app:camp_obj.app,newcampdialog:dialog});
						 dialog.getBody().html(mPage.$el);
						 dialog.saveCallBack(_.bind(mPage.createCampaign,mPage));
				});
			},
			initialize:function(){
			   this.template = _.template(template);
			   $('.tagscont').hide();
			   this.render();
			},
			render: function () {
				this.$el.html(this.template({}));
                this.app = this.options.app;
				var camp_obj = this;
				camp_obj.getallcampaigns();
				camp_obj.$el.find('div#campslistsearch').searchcontrol({
					id:'list-search',
					width:'300px',
					height:'22px',
					placeholder: 'Search Campaigns',
					gridcontainer: 'camps_grid',
					showicon: 'yes',
                                        iconsource: 'campaigns',
					countcontainer: 'no_of_camps'
				 });
				 
				 camp_obj.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});				 
			}
			,
			init:function(){
				this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));
				this.$el.find('#daterange').daterangepicker();				
				 var camp_obj = this;
				 var active_ws = this.$el.parents(".ws-content");
				 var header_title = active_ws.find(".camp_header .edited  h2");                 
				 active_ws.find("#addnew_action").attr("data-original-title","Add new Campaign").click(_.bind(this.createCampaign,this));
				 var URL = '/pms/io/campaign/getCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');				  
				  $.post(URL, {type:'allStats'})
				  .done(function(data) {
						 var allStats = jQuery.parseJSON(data);  
						 if(camp_obj.app.checkError(allStats)){
								return false;
						 }
						 var header_title = active_ws.find(".camp_header .edited");
						 var stats = '<ul class="c-current-status">';
						 stats += '<li><span class="badge pclr24">'+ allStats['sent'] +'</span>Sent</li>';
						  stats += '<li><span class="badge pclr20">'+ allStats['pending'] +'</span>Pending</li>';
						   stats += '<li><span class="badge pclr9">'+ allStats['scheduled'] +'</span>Scheduled</li>';
						    stats += '<li><span class="badge pclr8">'+ allStats['draft'] +'</span>Draft</li>';
							stats += '</ul>';
						 header_title.append(stats);
				 });
			}
			,
			getallcampaigns: function () {				                               				
				if(!this.app.getAppData("campaigns")){
					this.app.showLoading("Loading Campaigns...",this.$("#target-camps"));                                    
					this.app.getData({
						"URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset=0",
						"key":"campaigns",
						"callback":_.bind(this.createListTable,this)
					});
				 }
				 else{
					 this.app.showLoading("Loading Campaigns...",this.$("#target-camps"));                                       
					 window.setTimeout(_.bind(this.createListTable,this),500);
				 }
			},
			createListTable: function () {
				var camp_obj = this;				
				var camp_list_json = this.app.getAppData("campaigns");
				var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="camps_grid"><tbody>';				
				if(camp_list_json.count!=="0"){
					$.each(camp_list_json.campaigns[0], function(index, val) {
							list_html += camp_obj.makecamprows(val);					
					});	

					list_html += '</tbody></table>';
					this.app.showLoading(false,camp_obj.$el.find("#target-camps"));
					this.$el.find("#target-camps").html(list_html);

					this.$("#camps_grid").bmsgrid({
									useRp : false,
									resizable:false,
									colresize:false,
									lazyLoading:_.bind(this.appendCampaigns,this),
									height:this.app.get('wp_height')-122,
									usepager : false,
									colWidth : ['100%','70px','140px']
					});                                                                
					this.$("#camps_grid tr td:nth-child(1)").attr("width","100%");
					this.$("#camps_grid tr td:nth-child(2)").attr("width","90px");
					this.$("#camps_grid tr td:nth-child(3)").attr("width","140px");                                    
				}
				else
					this.$("#area_copy_campaign .bmsgrid").remove();
				var camp_count_lable = '';                                
				/*if(camp_list_json.totalCount > 1)
                                    camp_count_lable = 'Campaigns found';
				else
                                    camp_count_lable = 'Campaign found';	*/			
				if(parseInt(camp_list_json.count)==parseInt(camp_list_json.totalCount)){
					this.$("#camps_grid tr:last-child").removeAttr("data-load");
				}
				this.$el.find("#total_templates .badge").html(camp_list_json.totalCount);
                this.app.showLoading(false,this.$("#target-camps"));
				this.$el.find(".taglink").click(_.bind(function(obj){
                            camp_obj.app.initSearch(obj,this.$el.find("#list-search"));
                        },this));
			}
			,			
			makecamprows: function (val,extraDiv){				
                                var start_div ="", end_div = "";
                                if(extraDiv){
                                    start_div = "<div>";
                                    end_div = "</div>";
                                }
				var flag_class = '';
				if(val[0].status == 'D')
					flag_class = 'pclr8';
				else if(val[0].status == 'P')
					flag_class = 'pclr20';
				else if(val[0].status == 'S')
					flag_class = 'pclr9';
				else if(val[0].status == 'C')
					flag_class = 'pclr24';
				var row_html = '<tr id="row_'+val[0]['campNum.encode']+'">';
				row_html += '<td class="firstcol">'+start_div+'<div class="name-type"><h3><a>'+ val[0].name +'</a><a class="cstatus '+flag_class+'">'+this.app.getCampStatus(val[0].status)+'</a><div class="campaign_stats"><a class="icon report"></a></div></h3>   <div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div>'+end_div+'</td>';
				var datetime = val[0].scheduledDate;
				if(datetime)
				{
					var date = datetime.split(' ');
					var dateparts = date[0].split('-');					
					var month = this.app.getMMM(dateparts[1].replace('0','')-1);
					var dateFormat = dateparts[2] + ' ' + month + ', ' + dateparts[0];
				}
				else{
					dateFormat = '';					
                                     }   
                                //row_html += '<td>'+start_div+'<div class="time show" style="min-width:90px">'+this.app.getCampStatus(val[0].status)+'</div>'+end_div+'</td>';     
				row_html += '<td>'+start_div+'<div class="subscribers show" style="min-width:60px"><strong><span><em>Sent</em>'+val[0].sentCount+'</span></strong></div>'+end_div+'</td>';
				var action_button = '<a id="'+ val[0]['campNum.encode'] +'" class="btn-blue btn-preview"><span>Preview</span><i class="icon preview3"></i></a>';
				switch(val[0].status)
				{					
					case 'D':
						action_button += '<a id="'+ val[0]['campNum.encode'] +'" class="btn-gray"><span>Edit</span><i class="icon preview3"></i></a><a id="'+ val[0]['campNum.encode'] +'" class="btn-red"><i class="icon delete"></i></a>';
						break;					
					case 'S':
						action_button += '<a id="'+ val[0]['campNum.encode'] +'" class="btn-green"><span>Reschedule</span><i class="icon time2"></i></a><a id="'+ val[0]['campNum.encode'] +'" class="btn-blue btn-draft"><span>Draft</span><i class="icon time2"></i></a><a id="'+ val[0]['campNum.encode'] +'" class="btn-red"><i class="icon delete"></i></a>';
						break;
					case 'C':
						action_button += '<a id="'+ val[0]['campNum.encode'] +'" class="btn-red"><i class="icon delete"></i></a>';
						break;
				} 
				var timeshow = '';
				if(dateFormat != '')
					timeshow = '<div class="time show" style="width:105px"><strong><span><em>Schedule Date</em>'+ dateFormat +'</span></strong></div>';
				row_html += '<td>'+start_div+ timeshow +'<div id="'+ val[0]['campNum.encode'] +'" class="action">'+ action_button +'</div>'+end_div+'</td>';					
				row_html += '</tr>';
				return row_html;
			},
			appendCampaigns:function(){
				var camp_list_json = this.app.getAppData("campaigns");                            
				if(camp_list_json){
					var camp_obj = this;
					var new_offset = camp_list_json.offset ? (camp_list_json.offset + 50): 50 ;
					
					var list_html = "";
					var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset="+new_offset;
					jQuery.getJSON(URL,  function(tsv, state, xhr){
					if(xhr && xhr.responseText){
						 var campaigns = jQuery.parseJSON(xhr.responseText);                                
						 if(camp_obj.app.checkError(campaigns)){
							 return false;
						 }               
						 var row_no =1;
						 camp_obj.$("#target-camps .footer-loading").remove();
						 camp_list_json.offset = new_offset;
						 $.each(campaigns.campaigns[0], function(index, val) {
								list_html = $(camp_obj.makecamprows(val,true));					                                            
								if(row_no==50 && camp_list_json.offset+parseInt(campaigns.count)<parseInt(campaigns.totalCount)){
									list_html.attr("data-load","true")
								}
								camp_list_json["campaigns"][0]["campaign"+(new_offset+row_no)] = val;
								camp_obj.$("#camps_grid tbody").append(list_html);
								row_no = row_no +1;
								});                                    
							   camp_list_json.count = parseInt(camp_list_json.count) + parseInt(campaigns.count);
							   camp_obj.$el.find(".taglink").click(_.bind(function(obj){
							   camp_obj.app.initSearch(obj,camp_obj.$el.find("#list-search"));
						},camp_obj));
						
					}
					}).fail(function() { console.log( "error in campaign lazy loading fields" ); }); 
				}
				else{
					this.getallcampaigns();
				}
			}                       
		});
});