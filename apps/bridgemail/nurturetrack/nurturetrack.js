define(['text!nurturetrack/html/nurturetrack.html','nurturetrack/collections/tracks','nurturetrack/track_row','jquery.bmsgrid','jquery.searchcontrol'],
function (template,tracksCollection,trackRow) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nutrue Track listing view, depends on search control, chosen control, icheck control
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            id: 'nuturetrack_list',
            /**
             * Attach events on elements in view.
            */            
            events: {				
                
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){             
               this.template = _.template(template);		
               //
               this.tracksRequest = new tracksCollection();                              
               this.offset = 0;               
               this.searchTxt = '';
               this.tagTxt = '';
               this.tracks_request = null;
               this.app = this.options.app;  
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));                        
               
               this.$tracksArea = this.$(".template-container");               
                               
               this.initControls();               
               this.fetchTracks();               
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){
               this.current_ws = this.$el.parents(".ws-content");
               this.current_ws.find("#campaign_tags").hide();
               this.ws_header = this.current_ws.find(".camp_header .edited"); 
               this.current_ws.find(".show-add").attr("title","Add Nuture Track").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
               this.addCountHeader();
               this.fetchCount();
            },
            addCountHeader:function(){
                var header_part = $('<ul class="c-current-status">\n\
                <li><a href=""><span class="badge pclr23">0</span>Makesbridge Nurture Tracks</a></li>\n\
                </ul>\n\
                <div class="savedmsg" style="margin:2px 0 0;"> <span class="playingicon"></span> 0 Playing </div>');
                var $header_part = $(header_part);
                this.ws_header.append($header_part);
                
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
               //Init Controls on page 
               this.$(".nuture-search").searchcontrol({
                     id:'nuture-search',
                     width:'320px',
                     height:'22px',
                     searchFunc:_.bind(this.searchContacts,this),
                     clearFunc:_.bind(this.clearSearchContacts,this),
                     placeholder: 'Search nuture tracks',                     
                     showicon: 'yes',
                     iconsource: 'campaigns'
              });
              this.$("#nurturetrack_grid").bmsgrid({
                    useRp : false,
                    resizable:false,
                    colresize:false,
                    height:'100%',
                    usepager : false,
                    colWidth : ['100%','90px','132px']
                });
                this.$tracksContainer = this.$("#nurturetrack_grid tbody");
              //$(window).scroll(_.bind(this.liveLoading,this));
              //$(window).resize(_.bind(this.liveLoading,this));
              //this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
            },
            /**
             * Fetching contacts list from server.
            */
            fetchCount:function(){
                var bms_token =this.app.get('bms_token');
                
            },
            /**
             * Fetching contacts list from server.
            */
            fetchTracks:function(fcount){
                // Fetch invite requests from server
                var remove_cache = false;
                if(!fcount){
                    remove_cache = true;
                    this.offset = 0;
                    this.$tracksContainer.children(".contactbox").remove();
                    this.app.showLoading("Loading Nurture Tracks...",this.$tracksArea);             
                    this.$(".notfound").remove();
                }
                else{
                    this.offset = this.offset + 20;
                }
                var _data = {offset:this.offset};
                
                if(this.tracks_request){
                    this.tracks_request.abort();
                }                
                this.$("#total_templates").hide();
                this.tracks_request = this.tracksRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items
                        if(this.app.checkError(response)){
                            return false;
                        }
                        this.app.showLoading(false,this.$tracksArea);                                                                         
                        this.showTotalCount(response.count);
                        
                        //this.$contactLoading.hide();
                        
                        for(var s=this.offset;s<collection.length;s++){
                            var trackView = new trackRow({ model: collection.at(s),sub:this });                                                            
                            this.$tracksContainer.append(trackView.$el);
                        }                        
                        
                        if(collection.length<parseInt(response.totalCount)){
                            this.$tracksContainer.last().attr("data-load","true");
                        } 
                        if(collection.length==0){
                            var search_message  ="";
                            if(this.searchTxt){
                              search_message +=" containing '"+this.searchTxt+"'" ;
                            }
                            //this.$contactLoading.before('<p class="notfound">No Contacts found'+search_message+'</p>');
                        }                               
                        
                    }, this),
                    error: function (collection, resp) {
                            
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
                var inview = this.$(".contactbox").last().filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                   this.$contactLoading.show();                         
                   this.fetchContacts(20);
                }  
            },
             /**
            * Search contacts function binded with search control
            *
            * @param {o} textfield simple object.             
            * 
            * @param {txt} search text, passed from search control.
            * 
            * @returns .
            */
            searchContacts:function(o,txt){
                this.tagTxt = '';
                this.searchTxt = txt;                                
                if(o.keyCode==13 && this.searchTxt){
                    if(this.searchTxt.indexOf("Tag: ")>-1){
                       var tagName = this.searchTxt.split(": ");
                       this.searchByTag(tagName[1]);
                    }
                    else{
                        this.fetchContacts();
                    }
                   
                }                
            },
             /**
            * Clear Search Results
            * 
            * @returns .
            */
            clearSearchContacts:function(){
                this.tagTxt = '';
                this.searchTxt = '';                
                this.fetchContacts();                
            },
            /**
            * Sort contacts by selected sort type from selectbox
            * 
            * @returns .
            */
            sortContacts:function(){                                
                this.sortBy = this.$(".recent-activities").val();
                this.fetchContacts();
            }
            ,
            showTotalCount:function(count){                
                this.$("#total_templates").show();
                this.$(".total-count").html(this.app.addCommas(count));                                       
                var _text = count=="1"?"My Nurture Tracks":"My Nurture Tracks";                
                this.$(".total-text").html(_text)
                                     
            },
            searchByTag:function(tag){
               this.searchTxt = '';
               this.$("#contact-search").val("Tag: "+tag);
               this.$("#clearsearch").show();
               this.tagTxt = tag;
               this.fetchContacts();
            },
            updateRefreshCount:function(){                
               var checked_count = this.$(".contact-row-check:checked").length;                
               if(checked_count>0){
                   this.$("#total_templates").hide();
                   this.$("#total_selected").show();
                   this.$(".total-selected-count").html(checked_count);
                   var _text = checked_count>1 ?"contacts":"contact";
                   this.$(".total-selected-text").html(_text+" selected");
               }
               else{
                   this.$("#total_templates").show();
                   this.$("#total_selected").hide();
               }
            }
        });
});