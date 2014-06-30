/* 
 * Name: AutoBots Grid/Listing
 * Date: 18 June 2014
 * Author: Pir Abdul Wakeel
 * Description: 
 */

define(['text!autobots/html/autobots.html','autobots/collections/autobots','autobots/autobot','autobots/autobots_tile','app','autobots/choose_bot'],
function (template,Autobots,Autobot,AutobotTile,app,Choosebot) {
        'use strict';
        return Backbone.View.extend({
            events: {
                "click .sortoption_expand":"toggleSortOption",
                "click .tile-list .view-tiles":"showTiles",
                "click .tile-list .view-listing": "showListing",
                "keyup #txtAutobotSearch":'searchAutobots',
                "click  #clearsearch":"clearSearch",
                "click #autobots_search_menu li a":'sortByoptions',
                "click #refresh_autobots":"render",
                "click .closebtn":"closeContactsListing",
                
            },
            initialize: function () {
               this.template = _.template(template);
               this.objAutobots = new Autobots();
               this.type = "search";
               this.current_ws = "";
               this.ws_header = "";
               this.sortText = "";
               this.app = app;
               this.render();
            },
            render: function () {
                this.$el.html(this.template());
                this.fetchBots();
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            sortByoptions:function(ev){
                
               var sort = $(ev.target).data('text');
               $(this.el).find("#autobots_search_menu li").removeClass('active');
               $(ev.target).parents('li').addClass('active');
               $(this.el).find("#autobots_search_menu").slideToggle();
               $(this.el).find(".sortoption_expand").find('.spntext').html($(ev.target).html());
               this.sortBy = sort;
               this.sortText = $(ev.target).html();
               this.fetchBots();
            },
            fetchBots:function(offset){
                var _data = {};
                _data['type'] = this.type;
                var that = this;
                if(!offset){
                     that.$el.find(".thumbnails").html('');
                     that.$el.find("#tblAutobots tbody").html('');
                }
                if(this.sortBy){
                    _data['status'] = this.sortBy;
                }
                if(this.searchText){
                    _data['searchText'] = this.searchText;
                }
                this.app.showLoading("Loading Autobots...",that.$el);
                this.objAutobots.fetch({data:_data,success:function(data){
                        that.total = that.objAutobots.total;
                        if(data.length < 1){
                                that.$el.find("#tblAutobots tbody").append('<tr><td><p class="notfound" style="margin-top:-8px">No Autobots found</p></td>');
                                that.$el.find(".thumbnails").append('<li style="width:100%;"><p style="margin-top:-8px" class="notfound">No Autobots found</p></li>');
                        }
                       _.each(data.models,function(model){
                            that.$el.find("#tblAutobots tbody").append(new Autobot({model:model,app:that.options.app}).el)
                            that.$el.find(".thumbnails").append(new AutobotTile({model:model,app:that.options.app}).el)
                        })
                        that.$el.find('.tag').on('click',function(){
                            var html = $(this).html();
                            that.searchText = $.trim(html);
                            $(that.el).find("#txtAutobotSearch").val(that.searchText);
                            that.$el.find('#clearsearch').show();
                            that.fetchBots();
                        });
                        
                        that.updateCount();
                        if(!that.searchText && !that.sortBy)
                            that.topCounts();
                        
                 that.app.showLoading(false,that.$el);     
                }})
            },
            searchAutobots:function(ev){
              this.searchText = '';
              this.searchTags = '';
              var text = $(ev.target).val();
              var that = this;
              var code = ev.keyCode ? ev.keyCode : ev.which;
              var nonKey =[17, 40 , 38 , 37 , 39 , 16];
              if ((ev.ctrlKey==true)&& (code == '65' || code == '97')) {
                    return;
              }
              if($.inArray(code, nonKey)!==-1) return;
               if (code == 13 || code == 8){
                 that.$el.find('#clearsearch').show();
                 this.searchText = text;
                 that.fetchBots();
               }else if(code == 8 || code == 46){
                   if(!text){
                    that.$el.find('#clearsearch').hide();
                    this.searchText = text;
                    that.fetchBots();
                   }
               }else{ 
                     that.$el.find('#clearsearch').show();
                     
                     clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                     that.timer = setTimeout(function() { // assign timer a new timeout 
                         if (text.length < 2) return;
                         that.searchText = text;
                         that.fetchBots();
                    }, 500); // 2000ms delay, tweak for faster/slower
               }
            },
            clearSearch:function(ev){
                   $(ev.target).hide();
                   $(".search-control").val('');
                   this.total = 0;
                   this.searchText = '';
                   this.searchTags = '';
                   this.total_fetch = 0; 
                  // this.$el.find("#total_subscriber span").html("contacts found");
                   this.fetchBots();
           },
            updateCount:function(){
                $(this.el).find('#total_autobots').find('.badge').html(this.objAutobots.total);
                if(this.searchText){
                    $(this.el).find('#total_autobots').find('.search-text').html(' for <b>  &quot;' + this.searchText + '&quot;<b/>');
                }else{
                    $(this.el).find('#total_autobots').find('.search-text').html('');
                }
                if(this.sortBy && this.sortText !="All"){
                    $(this.el).find('#total_autobots').find('.sort-text').html(this.sortText);
                }else{
                    $(this.el).find('#total_autobots').find('.sort-text').html('');
                }
            },
            toggleSortOption:function(ev){
                console.log(ev);
                $(this.el).find("#autobots_search_menu").slideToggle();
            },
            topCounts:function(){
                   var that = this;
                   this.current_ws = this.$el.parents(".ws-content");
                   this.ws_header = this.current_ws.find(".camp_header .edited"); 
                   this.ws_header.find("#campaign_tags").remove();
                  // if(that.ws_header.find('.c-current-status').length > 0){
                       that.ws_header.find('.c-current-status').remove();
                   //}
                   this.ws_header.find("#addnew_action").attr('data-original-title',"Add new autobot");
                   this.ws_header.find("#addnew_action").on('click',function(){
                       that.addNewAutobot();
                   })
                   var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=counts";
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        var header_part = "<ul class='c-current-status'>";
                            header_part = header_part + "<li> <a data-text='D'> <span class='badge pclr2 '>"+that.options.app.addCommas(data.pauseCount)+"</span> Paused </a> </li>";
                            header_part = header_part + "<li> <a data-text='R'><span class='badge pclr18'>"+that.options.app.addCommas(data.playCount)+"</span> Playing </a> </li>";
                            header_part = header_part + "<li> <a data-text='P'><span class='badge pclr6'>"+that.options.app.addCommas(data.pendingCount)+"</span> Pending </a> </li>";
                            header_part = header_part + "</ul>";
                        var $header_part = $(header_part);                        
                        that.ws_header.append($header_part);
                        that.ws_header.find(".c-current-status li a").on('click',function(ev){
                                that.sortBy = $(this).data('text');
                                this.sortText = $(this).text();
                                that.fetchBots();
                                that.updateCount();
                        })
                        // this.ws_header.find("#workspace-header").after($('<a class="cstatus pclr18" style="margin:6px 4px 0px -7px">Playing </a>'));
                   }); 
                 },
            addNewAutobot:function(){
                
                $(this.el).find("#new_autobot").html(new Choosebot({app:this.app}).el);
                $(this.el).find("#new_autobot").parents('.campaign-content').append('<div class="modal-backdrop  in autobots-modal-in"></div>');
            },
            showTiles:function(ev){
                console.log(ev);
                $(ev.target).addClass('active');
                $(this.el).find(".view-listing").removeClass('active');
                $(this.el).find("#autobots_listing").hide();
                $(this.el).find("#autobots_tiles").show();
            },
            showListing:function(ev){
                console.log(ev);
                $(ev.target).addClass('active');
                $(this.el).find(".view-tiles").removeClass('active');
                $(this.el).find("#autobots_listing").show();
                $(this.el).find("#autobots_tiles").hide();
            },
            closeContactsListing: function() {
                $("#div_pageviews").empty('');
                $("#div_pageviews").hide();
            },
        });    
});