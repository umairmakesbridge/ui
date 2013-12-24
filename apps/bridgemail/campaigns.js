define(['jquery.bmsgrid','jquery.highlight','jquery.searchcontrol','text!html/campaigns.html','bms-filters'],
function (bmsgrid,jqhighlight,jsearchcontrol,template,bmsfilters) {
        'use strict';
        return Backbone.View.extend({
			id: 'campaigns_list',
			tags : 'div',
			events: {				
				"click #addnew_campaign":function(){					
                                    this.app.mainContainer.openCampaign();
				},
				"click #camps_grid .btn-green":function(obj){
					var target = $.getObj(obj,"a");
					if(target.attr("id")){
						this.app.mainContainer.openCampaign(target.attr("id"));
					}
				}
			},
			initialize:function(){
			   this.template = _.template(template);
			   $('.tagscont').hide();
			   this.render();
			},
			render: function () {
				this.$el.html(this.template({}));
                                this.app = this.options.app;
				this.getallcampaigns();
				this.$el.find('div#campslistsearch').searchcontrol({
					id:'list-search',
					width:'300px',
					height:'22px',
					placeholder: 'Search Campaigns',
					gridcontainer: 'camps_grid',
					showicon: 'yes',
                                        iconsource: 'campaigns',
					countcontainer: 'no_of_camps'
				 });
				 
				 this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
			}
			,
			init:function(){
				this.$(".template-container").css("min-height",(this.app.get('wp_height')-178));
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
				
			}
			,
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
                                                    colWidth : ['100%','70px','90ox','132px']
                                    });                                                                
                                    this.$("#camps_grid tr td:nth-child(1)").attr("width","100%");
                                    this.$("#camps_grid tr td:nth-child(2)").attr("width","90px");
                                    this.$("#camps_grid tr td:nth-child(3)").attr("width","90px");
                                    this.$("#camps_grid tr td:nth-child(4)").attr("width","132px");
                                }
				var camp_count_lable = '';                                
				if(camp_list_json.totalCount > 1)
                                    camp_count_lable = 'Campaigns found';
				else
                                    camp_count_lable = 'Campaign found';				
				if(parseInt(camp_list_json.count)==parseInt(camp_list_json.totalCount)){
					this.$("#camps_grid tr:last-child").removeAttr("data-load");
				}
				this.$el.find("span#no_of_camps").html(camp_list_json.totalCount+' '+camp_count_lable);				
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
				var row_html = '<tr id="row_'+val[0]['campNum.encode']+'">';
				row_html += '<td class="firstcol">'+start_div+'<div class="name-type"><h3>'+ val[0].name +'</h3>   <div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div>'+end_div+'</td>';
				var datetime = val[0].scheduledDate;
				if(datetime)
				{
					var date = datetime.split(' ');
					var dateparts = date[0].split('-');
					 var monthNames = [
					  "Jan", "Feb", "Mar",
					  "Apr", "May", "Jun",
					  "Jul", "Aug", "Sep",
					  "Oct", "Nov", "Dec"
					  ];
					var month = monthNames[dateparts[1].replace('0','')-1];
					var dateFormat = dateparts[2] + ' ' + month + ', ' + dateparts[0];
				}
				else{
					dateFormat = '';					
                                     }   
                                row_html += '<td>'+start_div+'<div class="time show" style="min-width:90px">'+this.app.getCampStatus(val[0].status)+'</div>'+end_div+'</td>';     
				row_html += '<td>'+start_div+'<div class="subscribers show" style="min-width:60px"><span class=""></span>'+val[0].sentCount+'</div>'+end_div+'</td>';
                                var action_button = (val[0].status=="D" || val[0].status=="S")?'<div id="'+ val[0]['campNum.encode'] +'" class="action"><a id="'+ val[0]['campNum.encode'] +'" class="btn-green"><span>Select</span></a></div>':'';
				row_html += '<td>'+start_div+'<div class="time show" style="width:105px"><span class=""></span>'+ dateFormat +'</div>'+action_button+end_div+'</td>';					
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