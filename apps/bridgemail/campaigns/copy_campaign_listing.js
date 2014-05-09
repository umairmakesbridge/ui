define(['jquery.bmsgrid','jquery.highlight','text!campaigns/html/copy_campaign_listing.html','jquery.searchcontrol','bms-filters','campaigns/collections/campaigns','campaigns/campaign_row_copy','moment'],
function (bmsgrid,jqhighlight,template,jsearchcontrol,bmsfilters,campaignCollection,campaignRowView,moment) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Copy Campaign dashboard view, depends on search control,
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            id: 'copy_campaign_list',
            /**
             * Attach events on elements in view.
            */            
            events: {				
                
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){
                    //_.bindAll(this, 'searchByTag','updateRefreshCount');  	
                    this.template = _.template(template);
                    this.campaignCollection = new campaignCollection();
                    this.offset = 0;
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    this.scrollElement = this.options.scrollElement ? this.options.scrollElement :$(window);
                    this.taglinkVal = false;
                    this.type = 'listNormalCampaigns';
                    this.searchTxt = '';
                    this.existCamp = false;
                    this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));  
               this.app = this.options.app;           
               this.sub = this.options.sub; 
               this.$el.find('div#copycampsearch').searchcontrol({
                            id:'copy-camp-search',
                            width:'300px',
                            height:'22px',
                            searchFunc:_.bind(this.searchCampaigns,this),
                            clearFunc:_.bind(this.clearSearchCampaigns,this),
                            placeholder: 'Search Campaigns',
                            showicon: 'yes',
                            iconsource: 'campaigns',
                            countcontainer: 'no_of_camps'
                     });
               this.initControls();               
               this.fetchCampaigns();               
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
               //Init Controls on page 
                this.$("#copy_camps_grid").bmsgrid({
                    useRp : false,
                    resizable:false,
                    colresize:false,
                    height:'100%',
                    usepager : false
                });
               this.$copyCampaignContainer = this.$("#copy_camps_grid tbody");
               this.scrollElement.scroll(_.bind(this.liveLoading,this));
               this.scrollElement.resize(_.bind(this.liveLoading,this));
               this.app.scrollingTop({scrollDiv:'window',appendto:this.$el,scrollElement:this.scrollElement});
            },
            /**
             * Fetching contacts list from server.
            */
            fetchCampaigns:function(fcount){
                // Fetch invite requests frothis.$(".notfound").m server
               
                 if(!fcount){
                            this.offset = 0;
                            this.app.showLoading("Loading Campaigns...",this.$("#copy-camp-listing"));
                            this.$copyCampaignContainer.html('');           
                            this.$(".notfound").remove();
                            }
                            else{
                                this.offset = parseInt(this.offset) + this.offsetLength;
                                this.$copyCampaignContainer.append('<tr class="loading-campagins"><td colspan="3"><div class="loadmore"><img src="img/loading.gif" alt=""/></div></td></tr>');
                                
                                }
                              
                              if(this.campaigns_request)
                              {
                                this.campaigns_request.abort();
                              }
                            var _data = {type : this.type}; 
                            _data['offset'] = this.offset;
                          
                            if(this.searchTxt){
                                _data['searchText'] = this.searchTxt;
                                this.$(".notfound").remove();
                            }
                            _data['bucket'] = 20;
                            this.campaigns_request = this.campaignCollection.fetch({data: _data,
                                success: _.bind(function(data1,collection) {
                                // Display items
                                this.$copyCampaignContainer.find('.loading-campagins').remove();
                                  if (this.app.checkError(data1)) {
                                    return false;
                                }
                                this.offsetLength = data1.length;
                                this.total_fetch = this.total_fetch + data1.length;
                                //console.log('offsetLength = '+ this.offsetLength + ' & total Fetch = ' + this.total_fetch);
                                this.app.showLoading(false, this.$("#copy-camp-listing"));
                                
                                    this.sub.$el.find("#copy_no_of_camps .badge").html(collection.totalCount);
                                    this.showTotalCount(collection.totalCount);
                                
                                 _.each(data1.models, _.bind(function(model){
                                     if(this.options.checksum !== model.get('campNum.checksum')){
                                        this.$copyCampaignContainer.append(new campaignRowView({model:model,sub:this.sub,parent:this,checksum:this.options.checksum}).el);
                                     }else{
                                         if(this.offsetLength == 1){
                                             this.sub.$el.find("#copy_no_of_camps .badge").html(parseInt(collection.totalCount)-1);
                                             this.$copyCampaignContainer.before('<p class="notfound">Same Campaign is searched</p>');
                                         }
                                     }
                                     },this));
                                
                                if (this.total_fetch < parseInt(collection.totalCount)) {
                                    this.$(".copy-campaign-box").last().attr("data-load", "true");
                                }
                                
                                if (this.offsetLength  == 0) {
                                    var search_message = "";
                                    if (this.searchTxt) {
                                        search_message += " containing '" + this.searchTxt + "'";
                                    }
                                    this.$copyCampaignContainer.before('<p class="notfound">No Campaigns found' + search_message + '</p>');
                                }

                            }, this),
                            error: function(collection, resp) {

                                }
                            });
            },
             /**
            * Fetch next records on scroll and resize.
            *
            * @returns .
            */
            liveLoading:function(){
                var $w = $(window);
                var th = 200;
                var inview = this.$(".copy-campaign-box").last().filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                   //this.$contactLoading.show();                         
                   this.fetchCampaigns(this.offsetLength);
                }  
            },
            searchCampaigns:function(o,txt){
                        
                    this.type = '';
                    this.searchTxt = txt;
                    this.total_fetch = 0;
                    this.type = 'searchNormalCampaigns';
                    if (this.taglinkVal) {
                        this.fetchCampaigns();
                        this.taglinkVal = false;
                    } else {
                        var keyCode = this.keyvalid(o);
                        if(keyCode){
                            if ($.trim(this.searchTxt).length > 0) {
                                this.timeout = setTimeout(_.bind(function() {
                                    clearTimeout(this.timeout);
                                    this.fetchCampaigns();
                                }, this), 500);
                            }
                            this.$('#copy-camp-search').keydown(_.bind(function() {
                                clearTimeout(this.timeout);
                            }, this));
                        }else{
                            return false;
                        }
                        
                    }
                    
            },
             /**
            * Clear Search Results
            * 
            * @returns .
            */
            clearSearchCampaigns:function(){
               
                this.searchTxt = '';
                this.total_fetch = 0;
                this.type = 'listNormalCampaigns';
                this.fetchCampaigns();                
            },
             showTotalCount:function(count){
                              
                var _text = parseInt(count)<="1"?"Campaign":"Campaigns";
                var text_count = '<strong class="badge">'+this.app.addCommas(count)+'</strong>';
               
                if(this.searchTxt){
                    this.$("#copy_no_of_camps").html(text_count+_text+" found containing text '<b>"+this.searchTxt+"</b>'");
                }
                else{
                    this.$("#copy_no_of_camps").html(text_count+_text);
                }     
                
            },
            keyvalid:function(event){
                        var regex = new RegExp("^[A-Z,a-z,0-9]+$");
                        var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
                         if (event.keyCode == 8 || event.keyCode == 32 || event.keyCode == 37 || event.keyCode == 39) {
                            return true;
                        }
                        else if (regex.test(str)) {
                            return true;
                        }
                       else{
                            return false;
                        }
                        event.preventDefault();
                   }
        });
    
})