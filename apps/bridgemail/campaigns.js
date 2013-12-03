define(['jquery.bmsgrid','jquery.highlight','jquery.searchcontrol','text!html/campaigns.html'],
function (bmsgrid,jqhighlight,jsearchcontrol,template) {
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
                                        "URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns",
                                        "key":"campaigns",
                                        "callback":_.bind(this.createListTable,this)
                                    });
                                 }
                                 else{
                                     this.createListTable()
                                 }
				
			}
			,
			createListTable: function () {
				var camp_obj = this;				
				var camp_list_json = this.app.getAppData("campaigns");
				var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="camps_grid"><tbody>';				
                                if(camp_list_json.count!=="0"){
                                    $.each(camp_list_json.lists[0], function(index, val) {
                                            list_html += camp_obj.makecamprows(val);					
                                    });	

                                    list_html += '</tbody></table>';
                                    this.app.showLoading(false,camp_obj.$el.find("#target-camps"));
                                    this.$el.find("#target-camps").html(list_html);

                                    this.$el.find("#camps_grid").bmsgrid({
                                                    useRp : false,
                                                    resizable:false,
                                                    colresize:false,
                                                    height:this.app.get('wp_height')-122,
                                                    usepager : false,
                                                    colWidth : ['100%','90px','66px','132px']
                                    });                                                                
                                    this.$("#camps_grid tr td:nth-child(1)").attr("width","100%");
                                    this.$("#camps_grid tr td:nth-child(2)").attr("width","90px");
                                    this.$("#camps_grid tr td:nth-child(4)").attr("width","132px");
                                }
				var camp_count_lable = '';                                
				if(camp_list_json.count > 1)
                                    camp_count_lable = 'Campaigns found';
				else
                                    camp_count_lable = 'Campaign found';				
				this.$el.find("span#no_of_camps").html(camp_list_json.count+' '+camp_count_lable);				
                                this.app.showLoading(false,this.$("#target-camps"));
			}
			,
			makecamprows: function (val){
				var camp_obj = this;
				var row_html = '<tr id="row_'+val[0].campNum+'">';
				row_html += '<td class="firstcol"><div class="name-type"><h3>'+ val[0].name +'</h3>   <div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div></td>';
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
				row_html += '<td><div class="subscribers show" style="width:60px"><span class=""></span>0</div></td>';
				row_html += '<td><div class="time show" style="width:105px"><span class=""></span>'+ dateFormat +'</div><div id="'+ val[0].campNum +'" class="action"><a id="'+ val[0].campNum +'" class="btn-green"><span>Select</span></a></div></td>';					
				row_html += '</tr>';
				return row_html;
			}
                       
		});
});