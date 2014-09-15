define(['text!nurturetrack/html/nurturetracks.html','nurturetrack/collections/tracks','nurturetrack/track_row','nurturetrack/track_row_tile','nurturetrack/track_row_makesbridge','nurturetrack/track_row_makesbridge_tile','jquery.bmsgrid','jquery.searchcontrol','jquery.highlight'],
function (template,tracksCollection,trackRow,trackRowTile,trackRowMakesbrdige,trackRowMakesbrdigeTile) {
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
                'click .tile-list button' : 'toggleView',
                'click #report_close':'closeReport',
                'click .nurture_msgslist':function(e){
                    e.stopPropagation();
                },
                'click .user_tracks .refresh_btn':function(){
                    this.fetchTracks();
                },
                'click .bms_tracks .refresh_btn':function(){
                    this.fetchBmsTracks();
                }
                
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){             
               this.template = _.template(template);		
               //
               this.tracksRequest = new tracksCollection();                              
               this.tracksRequestBMS = new tracksCollection();     
               this.offset = 0;               
               this.searchTxt = '';
               this.tagTxt = '';
               this.tracks_request = null;
               this.tracks_bms_request = null;
               this.app = this.options.app;  
               this.makesbridge_tracks = false;
               this.render();               
               this.checkStatus = [];
               this.dispenseTimeout = null;
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));                                       
               this.$tracksArea = this.$(".template-container");     
               this.$trackTileArea =  this.$(".user_tracks ul.thumbnails");
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
               this.addNewButton = this.current_ws.find(".show-add");
               this.addNewButton.attr("title","Add Nuture Track").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
               this.addCountHeader();               
               this.addNewButton.click(_.bind(this.addNurtureTrack,this));
               this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
               this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            },
            addCountHeader:function(){
                this.ws_header.find(".c-current-status,.savedmsg").remove();
                this.tracksRequest.fetch({data:{type:'counts'},
                    success: _.bind(function (collection, response) {  
                        var header_part = $('<div><ul class="c-current-status">\n\
                        <li class="bmstrackcount"><a><span class="badge pclr2">'+response.systemCount+'</span>Templates</a></li>\n\
                        <li class="usertrackcount"><a class="font-bold"><span class="badge pclr18">'+response.userCount+'</span>My Nurture Tracks</a></li>\n\
                        </ul>\n\
                        <div class="savedmsg" style="margin:2px 0 0;cursor:pointer"> <span class="playingicon"></span> '+response.playCount+' Playing </div></div>');
                        var $header_part = $(header_part);                        
                        $header_part.find(".bmstrackcount").click(_.bind(this.showBmsTracks,this));
                        $header_part.find(".usertrackcount").click(_.bind(this.showUserTracks,this));
                        $header_part.find(".savedmsg").click(_.bind(function(){                            
                                this.$(".bms_tracks").hide();
                                this.$(".user_tracks").fadeIn();                                
                                this.ws_header.find(".usertrackcount a").addClass("font-bold");
                                this.ws_header.find(".bmstrackcount a").removeClass("font-bold");                             
                        },this));
                        this.ws_header.append($header_part);
                }, this),
                  error: function (collection, resp) {

                  }
              });
              this.$(".bms_tracks").hide();
              this.$(".user_tracks").fadeIn();  
                                            
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
                     gridcontainer: this.$('#nurturetrack_grid'),
                     placeholder: 'Search nurture tracks',                     
                     showicon: 'yes',
                     iconsource: 'campaigns',
                     searchCountEl : this.$(".total-count"),
                     searchTextEl : this.$(".total-text"),
                     searchText : 'My Nurture Tracks'
                     
              });
               this.$(".user_tracks .nuture-search-tile").searchcontrol({
                     id:'nuture-search',
                     width:'320px',
                     height:'22px',
                     gridcontainer: this.$('.user_tracks #content-1'),
                     placeholder: 'Search nurture tracks',                     
                     showicon: 'yes',
                     iconsource: 'campaigns',
                     movingElement: 'li',
                     query:'div.nurture-caption',
                     emptyMsgContainer:this.$('.user_tracks #content-1'),
                     searchCountEl : this.$(".total-count"),
                     searchTextEl : this.$(".total-text"),
                     searchText : 'My Nurture Tracks'
              });
              
              this.$("#nurturetrack_grid").bmsgrid({
                    useRp : false,
                    resizable:false,
                    colresize:false,
                    height:'100%',
                    usepager : false,
                    colWidth : ['100%','90px','90px','132px']
                });
                this.$tracksContainer = this.$("#nurturetrack_grid tbody");             
                
                this.$(".bms-nurture-search").searchcontrol({
                     id:'bms-nurture-search',
                     width:'320px',
                     height:'22px',                     
                     gridcontainer: this.$('#bms_nurturetrack_grid'),
                     placeholder: 'Search nurture track templates',                     
                     showicon: 'yes',
                     tdNo:2,
                     iconsource: 'campaigns',
                     searchCountEl : this.$(".total-bms-count"),
                     searchTextEl : this.$(".total-bms-text"),
                     searchText : 'Nurture Track Templates'
              });
              this.$(".bms_tracks .bms-nuture-search-tile").searchcontrol({
                     id:'nuture-search',
                     width:'320px',
                     height:'22px',
                     gridcontainer: this.$('.bms_tracks #content-1'),
                     placeholder: 'Search nurture track templates',                     
                     showicon: 'yes',
                     iconsource: 'campaigns',
                     movingElement: 'li',
                     query:'a.edit-track',
                     emptyMsgContainer:this.$('.bms_tracks #content-1'),
                     searchCountEl : this.$(".total-bms-count"),
                     searchTextEl : this.$(".total-bms-text"),
                     searchText : 'Nurture Track Templates'
              });
             
              this.$(".message-search").searchcontrol({
                     id:'message-search',
                     width:'190px',
                     height:'22px',
                     gridcontainer: 'nt_report_table',
                     placeholder: 'Search messages',                     
                     showicon: 'yes',
                     iconsource: 'campaigns'
              });
              
              this.$("#bms_nurturetrack_grid").bmsgrid({
                    useRp : false,
                    resizable:false,
                    colresize:false,
                    height:'100%',
                    usepager : false,
                    colWidth : ['90px','100%','90px','132px']
                });
                this.$tracksBmsContainer = this.$("#bms_nurturetrack_grid tbody");                      
                this.$trackTileBmsArea = this.$(".bms_tracks ul.thumbnails");
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
                    this.$tracksContainer.children().remove();
                    this.$trackTileArea.children().remove();
                    this.app.showLoading("Loading Nurture Tracks...",this.$tracksArea);             
                    this.$(".user_tracks .notfound").remove();
                    this.$(".scroll-content .notfound").remove();
                }
                else{
                    this.offset = this.offset + 20;
                }
                var _data = {offset:this.offset,type:'list'};
                
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
                            trackView.on('tagclick',_.bind(this.searchByTag,this));
                            this.$tracksContainer.append(trackView.$el);
                            
                            var trackViewTile = new trackRowTile({ model: collection.at(s),sub:this });                                                            
                            trackViewTile.on('tagclicktile',_.bind(this.searchByTagTile,this));
                            this.$trackTileArea.append(trackViewTile.$el);
                            trackViewTile.tmPr.trimTags();
                            var _model = collection.at(s);
                            if(_model.get("status")=="P" || _model.get("status")=="Q"){                                
                                this.callDispenseStats(_model.get("trackId.encode"),_model.get("trackId.checksum"),true);
                            }
                        }                        
                        
                        if(collection.length<parseInt(response.totalCount)){
                            this.$tracksContainer.last().attr("data-load","true");
                        } 
                        if(collection.length==0){
                            var search_message  ="";
                            if(this.searchTxt){
                              search_message +=" containing '"+this.searchTxt+"'" ;
                            }
                            if(this.$(".user_tracks .notfound").length==0){
                                this.$(".user_tracks .bDiv").append('<p class="notfound">No nurture tracks found'+search_message+'</p>');
                            }
                            else{
                                this.$(".user_tracks .notfound").show();
                            }                            
                            
                            if(this.$("scroll-content .notfound").length==0){                               
                                this.$(".scroll-content").append('<p class="notfound">No nurture tracks found'+search_message+'</p>');
                            }
                            else{                                
                                this.$(".scroll-content .notfound").show();
                            }
                        }    
                        else{
                            this.$(".user_tracks .notfound").hide();
                            this.$(".scroll-content .notfound").hide();
                        }
                        
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
            },
            /**
             * Fetching contacts list from server.
            */
            fetchBmsTracks:function(fcount){
                // Fetch invite requests from server
                var remove_cache = false;
                if(!fcount){
                    remove_cache = true;
                    this.offset = 0;
                    this.$tracksBmsContainer.children().remove();
                    this.$trackTileBmsArea.children().remove();
                    this.app.showLoading("Loading nurture track templates...",this.$tracksArea);             
                    this.$(".bms_tracks .notfound").remove();
                }
                else{
                    this.offset = this.offset + 20;
                }
                var _data = {offset:this.offset,type:'list',isAdmin:'Y'};
                
                if(this.tracks_bms_request){
                    this.tracks_bms_request.abort();
                }                
                this.$("#total_bms_tracks").hide();
                this.makesbridge_tracks = true;
                this.tracks_bms_request = this.tracksRequestBMS.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items
                        if(this.app.checkError(response)){
                            return false;
                        }
                        this.app.showLoading(false,this.$tracksArea);                                                                         
                        this.showBmsTotalCount(response.count);
                        
                        //this.$contactLoading.hide();
                        
                        for(var s=this.offset;s<collection.length;s++){
                            var trackView = new trackRowMakesbrdige({ model: collection.at(s),sub:this });                                                            
                            trackView.on('tagbmsclick',_.bind(this.searchByTagBms,this));
                            this.$tracksBmsContainer.append(trackView.$el);
                            
                            var trackViewTile = new trackRowMakesbrdigeTile({ model: collection.at(s),sub:this });                                                            
                            trackViewTile.on('tagbmsclicktile',_.bind(this.searchByTagTileBms,this));
                            this.$trackTileBmsArea.append(trackViewTile.$el);
                            trackViewTile.tmPr.trimTags();
                            
                            
                        }                        
                        
                        if(collection.length<parseInt(response.totalCount)){
                            this.$tracksBmsContainer.last().attr("data-load","true");
                        } 
                        if(collection.length==0){
                            var search_message  ="";
                            if(this.searchTxt){
                              search_message +=" containing '"+this.searchTxt+"'" ;
                            }
                            if(this.$(".bms_tracks .notfound").length==0){
                                this.$(".bms_tracks .bDiv").append('<p class="notfound">No nurture track templates found'+search_message+'</p>');                                
                            }
                            else{
                                this.$(".bms_tracks .notfound").show();                                
                            }                            
                                                                                    
                        }    
                        else{
                            this.$(".bms_tracks .notfound").hide();                            
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
            * Search nurture track tile binded with search control
            *
            * @param {o} textfield simple object.             
            * 
            * @param {txt} search text, passed from search control.
            * 
            * @returns .
            */
            searchNurtureTrackTile:function(o,txt){
               
            },
             /**
            * Clear Search Results
            * 
            * @returns .
            */
            clearSearchNurtureTrackTile:function(){
                
                
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
            showBmsTotalCount:function(count){                
                this.$("#total_bms_tracks").show();
                this.$(".total-bms-count").html(this.app.addCommas(count));                                       
                var _text = count=="1"?"Nurture Track Template":"Nurture Track Templates";                
                this.$(".total-bms-text").html(_text)
                                     
            },
            searchByTag:function(tag){                              
               this.$(".user_tracks #nuture-search").val("Tag: "+tag);
               this.$(".user_tracks .nuture-search #clearsearch").show();
               this.$("#nurturetrack_grid tr").hide();
               var count = 0;
               this.$("#nurturetrack_grid tr").filter(function() {
                    var tagExist = false;
                    $(this).find(".tagscont li").each(function(i){
                        $(this).removeHighlight();
                        if($.trim($(this).text()).toLowerCase() == $.trim(tag).toLowerCase()){
                            $(this).highlight(tag);	
                            tagExist = true;
                        }
                    });                    
                    if(tagExist){
                        count++;
                        return $(this);
                    }
               }).show();
               this.$(".total-count").html(count);
               this.$(".total-text").html('My Nurture Tracks <b>found for tag &lsquo;' + tag + '&rsquo;</b>');
            },
            searchByTagBms:function(tag){                              
               this.$(".bms_tracks #bms-nurture-search").val("Tag: "+tag);
               this.$(".bms_tracks .bms-nurture-search #clearsearch").show();
               this.$("#bms_nurturetrack_grid tr").hide();
               var count = 0;
               this.$("#bms_nurturetrack_grid tr").filter(function() {
                    var tagExist = false;
                    $(this).find(".tagscont li").each(function(i){
                        $(this).removeHighlight();
                        if($.trim($(this).text()).toLowerCase() == $.trim(tag).toLowerCase()){
                            $(this).highlight(tag);	
                            tagExist = true;
                        }
                    });                    
                    if(tagExist){
                        count++;
                        return $(this);
                    }
               }).show();
               this.$(".total-bms-count").html(count);
               this.$(".total-bms-text").html('Nurture Track Templates <b>found for tag &lsquo;' + tag + '&rsquo;</b>');
            },
            searchByTagTile:function(tag){
               this.$(".nuture-search-tile #nuture-search").val("Tag: "+tag);
               this.$(".nuture-search-tile #clearsearch").show(); 
               this.$(".user_tracks .thumbnails li").hide();
               var count = 0;
               this.$(".user_tracks .thumbnails li").filter(function() {
                    var tagExist = false;
                    $(this).find(".t-scroll a").each(function(i){
                        $(this).removeHighlight();
                        if($.trim($(this).text()).toLowerCase() == $.trim(tag).toLowerCase()){
                            $(this).highlight(tag);	
                            tagExist = true;
                        }
                    });                    
                    if(tagExist){
                         count++;
                        return $(this);
                    }
               }).show();
               this.$(".total-count").html(count);
               this.$(".total-text").html('My Nurture Tracks <b>found for tag &lsquo;' + tag + '&rsquo;</b>');
            },
            searchByTagTileBms:function(tag){
               this.$(".bms-nuture-search-tile #nuture-search").val("Tag: "+tag);
               this.$(".bms-nuture-search-tile #clearsearch").show(); 
               this.$(".bms_tracks .thumbnails li").hide();
               var count = 0;
               this.$(".bms_tracks .thumbnails li").filter(function() {
                    var tagExist = false;
                    $(this).find(".t-scroll a").each(function(i){
                        $(this).removeHighlight();
                        if($.trim($(this).text()).toLowerCase() == $.trim(tag).toLowerCase()){
                            $(this).highlight(tag);	
                            tagExist = true;
                        }
                    });                    
                    if(tagExist){
                         count++;
                        return $(this);
                    }
               }).show();
               this.$(".total-bms-count").html(count);
               this.$(".total-bms-text").html('Nurture Track Templates <b>found for tag &lsquo;' + tag + '&rsquo;</b>');
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
            },
            addNurtureTrack:function(){                                            
                var dialog = this.app.showDialog({title:'New Nurture Track',
                    css:{"width":"650px","margin-left":"-325px"},
                    bodyCss:{"min-height":"100px"},							   
                    headerIcon : 'new_headicon',
                    buttons: {saveBtn:{text:'Create'} }                                                                           
                });
                this.app.showLoading("Loading...",dialog.getBody());
                require(["nurturetrack/newnurturetrack"],_.bind(function(trackPage){                                     
                    var mPage = new trackPage({page:this,newdialog:dialog});
                    dialog.getBody().html(mPage.$el);
                    mPage.$("input").focus();
                    dialog.saveCallBack(_.bind(mPage.createNurtureTrack,mPage));
                },this));
            },
            showBmsTracks:function(e){
                var target = $.getObj(e,"li");
                this.$(".user_tracks").hide();
                this.$(".bms_tracks").fadeIn();               
                target.find("a").addClass("font-bold");
                this.ws_header.find(".usertrackcount a").removeClass("font-bold");
                //this.ws_header.find(".bmstrackcount").hide();
                //this.ws_header.find(".usertrackcount").show();                
                if(this.makesbridge_tracks ===false){
                    this.fetchBmsTracks();
                }
            },
            showUserTracks:function(e){
                var target = $.getObj(e,"li");
                this.$(".bms_tracks").hide();
                this.$(".user_tracks").fadeIn();                                
                target.find("a").addClass("font-bold");
                this.ws_header.find(".bmstrackcount a").removeClass("font-bold");
             //  this.ws_header.find(".bmstrackcount").show();
             //  this.ws_header.find(".usertrackcount").hide();
            },
            toggleView:function(e){
                var obj = $.getObj(e,"button");
                if(obj.hasClass("btn-tiles")){
                    this.$(".btn-tiles").hide();
                    this.$(".btn-listing").show();
                }
                else{
                    this.$(".btn-listing").hide();
                    this.$(".btn-tiles").show();
                }                    
                if(obj.hasClass("btn-listing")){
                    this.$(".nuture-search-tile,.bms-nuture-search-tile").hide();
                    this.$(".nuture-search,.bms-nurture-search").show();
                    this.$(".nt_listing").show();
                    this.$(".tileview").hide();
                }
                else{
                    this.$(".nuture-search-tile,.bms-nuture-search-tile").show();
                    this.$(".nuture-search,.bms-nurture-search").hide();
                    this.$(".nt_listing").hide();
                    this.$(".tileview").show();
                }
                this.$(".search-control").val('');
                this.$(".search-control").keyup();
                
            },
            showStates:function(obj,model,leftMinus){
                var _ele = $.getObj(obj,"div");
                var _stateDiv = this.$(".nurture_msgslist");
                var left_minus = leftMinus? leftMinus:92;
                var ele_offset = _ele.offset();                    
                var ele_height =  _ele.height();
                var top = ele_offset.top + ele_height - 134;
                var left = ele_offset.left-left_minus;    
                if((left + 770) > $(window).width()){
                    left = left - 755;
                    _stateDiv.addClass("right-corner");
                }                
                else{
                    _stateDiv.removeClass("right-corner");
                }
                this.app.showLoading("Loading stats...",_stateDiv.find(".states-area"));         
                require(["nurturetrack/report"],_.bind(function(report){                                    
                    var report_table = new report({page:this,stateDiv:_stateDiv,model:model});
                    _stateDiv.find(".states-area").html(report_table.$el);                    
                    report_table.init();
                    
                },this));                                   
                _stateDiv.find(".message-count").html('Loading...');
                _stateDiv.find(".search-control").val('');
                _stateDiv.find("#clearsearch").hide();
                _stateDiv.css({"left":left+"px","top":top+"px"}).show();  
                obj.stopPropagation();
                return false;
            },
            closeReport:function(){
                this.$(".nurture_msgslist").hide();
            },
            dispenseStats:function(){
                if(this.checkStatus.length){
                    for(var i=0;i<this.checkStatus.length;i++){
                        var URL = '/pms/io/trigger/getNurtureData/?type=dispenseStats&trackId='+this.checkStatus[i].id+'&BMS_REQ_TK='+this.app.get('bms_token')
                         jQuery.getJSON(URL,  _.bind(function(_i, state, xhr){                                                        
                            var _json = state;   
                            if(this.app.checkError(_json)){
                                return false;
                            }
                            if(this.$("."+this.checkStatus[_i].checksum).length){
                                this.$("."+this.checkStatus[_i].checksum).css("width",_json.percentageDone+"%");
                                if( _json[0]=='err' || _json.percentageDone=="100"){
                                    this.fetchTracks();
                                    this.checkStatus[_i].splice(i,1);
                                }
                            }
                            else{
                                clearTimeout(this.dispenseTimeout);
                            }
                         },this,i));
                    }
                }
                this.dispenseTimeout = setTimeout(_.bind(this.dispenseStats,this),1000*30);
            },
            callDispenseStats:function(id,checksum,immediate){
                this.checkStatus.push({"checksum":checksum,"id":id});
                clearTimeout(this.dispenseTimeout);                
                if(immediate){
                    this.dispenseStats();
                }
                else{
                    this.dispenseTimeout = setTimeout(_.bind(this.dispenseStats,this),1000*30);
                }
            },
            closeCallBack:function(){
                clearTimeout(this.dispenseTimeout);            
            }
        });
});