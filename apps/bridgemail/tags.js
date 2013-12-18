define(['text!html/tags.html','bms-mapping','jquery.searchcontrol'],
function (template,Mapping,bmsSearch) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    
                },
				saveTags: function () {
					var curview = this;
					var tags = '';
					curview.$el.find(".col2 .rightcol li").each(function(i) {
						tags += $(this).find("a:nth-child(1) span").text() + ',';
					});
					return tags.substring(0,tags.length-1);
				},
				loadTags: function(){
					var app = this.app;
					var curview = this;
					var campview = this.campview;
					app.showLoading("Loading Tags...",curview.$el.find('.leftcol'));
					URL = "/pms/io/user/getData/?BMS_REQ_TK="+app.get('bms_token')+"&type=subscriberTagCountList";
					jQuery.getJSON(URL,  function(tsv, state, xhr){				
						app.showLoading(false,curview.$el.find('.leftcol'));
						if(xhr && xhr.responseText){
							var tags_array = jQuery.parseJSON(xhr.responseText);
							var tags_html = '';
							if(tags_array[0] != 'err')
							{
								$.each(tags_array.tagList[0],function(key,val){
									tags_html += '<li class="action" id="row_'+key+'" checksum="'+val[0].tag+'"><a class="tag"><span>'+ val[0].tag +'</span><strong class="badge">'+ val[0].subCount +'</strong></a> <a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a></li>';
								});
								curview.$el.find('.leftcol .tagslist ul').children().remove();
								curview.$el.find('.leftcol .tagslist ul').html(tags_html);
								campview.$el.find("#area_choose_tags").removeData("mapping");
								campview.$el.find("#area_choose_tags").mapping({
										sumColumn: 'a.tag .badge',
										sumTarget: 'tags_total_recps .badge',
										template:'',
										movingElement:'li'
								});
								
								if(campview.states.step3.recipientType.toLowerCase()=="tags")
									campview.setRecipients();
							}
						}
					});
					this.$el.find('div#tagssearch').searchcontrol({
							id:'tag-search',
							width:'210px',
							height:'25px',
							placeholder: 'Search Tags',
							gridcontainer: 'tagslist ul',
							showicon: 'yes',
							movingElement: 'li',
							iconsource: 'tags',
					});
					this.$el.find('div#tagsrecpssearch').searchcontrol({
							id:'tag-recps-search',
							width:'210px',
							height:'25px',
							placeholder: 'Search Recipients',
							gridcontainer: 'tagsrecpslist ul',
							showicon: 'yes',
							movingElement: 'li',
							iconsource: 'tags',
					});
					if(this.$el.find('#tagsrecpslist ul li').length == 0)
						this.$el.find('#tag-recps-search').attr('disabled','disabled');
					else
						this.$el.find('#tag-recps-search').attr('disabled','');					
				},
                initialize: function () {
					this.template = _.template(template);				
					this.render();
					this.app.showLoading(false,this.campview.$el.find('#area_choose_tags'));
					this.loadTags();
                },
                render: function () {
					this.app = this.options.app; 
					this.campview = this.options.camp;
					this.$el.html(this.template({}));					
                },
        });
});