define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!landingpages/html/landingpages.html', 'bms-filters', 'moment', 'landingpages/collections/landingpages', 'landingpages/landingpage_row'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template, bmsfilters, moment, pagesCollection, pageRowView) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {
                    "click .refresh_btn": 'refreshListing',
                    "click .sortoption_expand": "toggleSortOption",
                    "click li.stattype": 'filterListing'
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.pagesCollection = new pagesCollection();
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                    this.offset = 0;
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    this.loadingpages_request = null;
                    this.status = "";
                    this.actionType = "";
                    this.taglinkVal = false;
                    this.timeout = false;
                    
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.addLandingPage();
                    this.headBadge();
                    this.getLandingPages();
                    this.$('div#pageslistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchPages, this),
                        clearFunc: _.bind(this.clearSearchPages, this),
                        placeholder: 'Search Landing Pages',
                        showicon: 'yes',
                        iconsource: 'lpage',
                        countcontainer: 'no_of_camps'
                    });
                }, 
                toggleSortOption: function(e) {
                     this.$("#template_search_menu").slideToggle();
                     e.stopPropagation();
                },
                addLandingPage: function( ) {
                   var active_ws = this.$el.parents(".ws-content");   
                   this.ws_header = active_ws.find(".camp_header .edited"); 
                   this.ws_header.find('.workspace-field').remove();
                   active_ws.find("#campaign_tags").remove();
                   active_ws.find("#addnew_action").attr("data-original-title", "Add Landing Page").click(_.bind(this.createLandingPage, this));
                   active_ws.find("div.create_new").click(_.bind(this.createLandingPage, this));  
                },
                headBadge: function ( ) {
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");                                     
                    if (active_ws.find('ul.c-current-status').length) {
                        var header_title = active_ws.find(".camp_header .edited");
                        header_title.find('ul').remove();                        
                        var progress = $("<ul class='c-current-status'><li style='margin-left:5px;'><a><img src='" + this.options.app.get("path") + "img/greenloader.gif'></a></li></ul>");
                        header_title.append(progress)
                    }
                    var URL = '/pms/io/publish/getLandingPages/?BMS_REQ_TK=' + this.app.get('bms_token');
                    $.post(URL, {type: 'counts'})
                    .done(_.bind(function (data) {
                        var allStats = jQuery.parseJSON(data);
                        if (this.app.checkError(allStats)) {
                            return false;
                        }
                        var header_title = active_ws.find(".camp_header .edited");
                        header_title.find('ul').remove();
                        var pendingClass = (parseInt(allStats['publishCount']) > 0) ? "showtooltip showhand" : "defaulthand";
                        var draftClass =  (parseInt(allStats['draftCount']) > 0) ? "showtooltip showhand" : "defaulthand";
                        var templateClass = (parseInt(allStats['templateCount']) > 0) ? "showtooltip showhand" : "defaulthand" ;
                        var stats = '<ul class="c-current-status">';                                
                            stats += '<li data-search="P" class="' + pendingClass + '" title="Click to view published pages"><span class="badge pclr2 topbadges" tabindex="-1">' + allStats['publishCount'] + '</span>Published</li>';
                            stats += '<li data-search="D" class="' + draftClass + '" title="Click to view draft pages"><span class="badge pclr1 topbadges" tabindex="-1">' + allStats['draftCount'] + '</span>Draft</li>';
                            stats += '<li data-search="T" class="' + templateClass + '" title="Click to view templates"><span class="badge pclr6 topbadges" tabindex="-1">' + allStats['templateCount'] + '</span>Templates</li>';
                        stats += '</ul>';
                        header_title.append(stats);
                        this.ws_header.find(".c-current-status li").click(_.bind(this.topBadgesClick, this));
                        header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                    }, this));
                },
                createLandingPage: function ( ) {
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Start with choosing a name for your Landing Page',
                      buttnText: 'Create',
                      bgClass :'landingpage-tilt',
                      plHolderText : 'Enter landing page name here',
                      emptyError : 'Landing page name can\'t be empty',
                      createURL : '/pms/io/publish/saveLandingPages/',
                      fieldKey : "name",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token'),category:"Marketing"},
                      saveCallBack :  _.bind(this.createPage,this)
                    });
                },
                createPage: function(txt,json){
                    if(json[0]=="success"){
                        this.app.mainContainer.openLandingPage({"id":json[1],"checksum":json[2],"parent":this,editable:true});        
                        this.headBadge();
                        this.getLandingPages();
                    }
                },
                refreshListing: function(){
                    this.app.addSpinner(this.$el);
                    this.getLandingPages();
                    this.headBadge();  
                },
                getLandingPages: function ( fcount, filterObj ) {
                    if (!fcount) {
                        this.offset = 0;
                        this.app.showLoading("Loading Landing Pages...", this.$("#target-camps"));
                        this.$el.find('#landingpages_grid tbody').html('');
                        this.$(".notfound").remove();
                    }
                    else {
                        this.offset = parseInt(this.offset) + this.offsetLength;
                        this.$("#landingpages_grid tbody").append('<tr class="loading-campagins"><td colspan="3"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading more landing pages..</p></div></td></tr>');
                    }
                    if (this.loadingpages_request)
                    {
                        this.loadingpages_request.abort();
                    }
                    var _data = {offset: this.offset,type:'search'};                    
                    if (this.status) {                        
                        _data['status'] = this.status;                        
                    }
                    else {
                        delete  _data['status'];
                    }
                    if(this.actionType){
                        _data['actionType'] = this.actionType;                        
                    }
                    if (this.searchTxt) {
                        _data['searchText'] = this.searchTxt;
                    }                    
                    _data['bucket'] = 20;

                    this.loadingpages_request = this.pagesCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$("#landingpages_grid tbody").find('.loading-campagins').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;                            

                            this.app.showLoading(false, this.$("#target-camps"));
                            
                            this.$("#total_templates .badge").html(collection.totalCount);

                            this.showTotalCount(collection.totalCount);                            

                            _.each(data1.models, _.bind(function (model) {
                                this.$el.find('#landingpages_grid tbody').append(new pageRowView({model: model, sub: this}).el);
                            }, this));
                            
                            /*-----Remove loading------*/
                            this.app.removeSpinner(this.$el);
                            /*------------*/
                            
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$(".landingpage-box").last().attr("data-load", "true");
                            }

                            if (this.offsetLength == 0) {
                                var search_message = "";
                                if (this.searchTxt) {
                                    search_message += " containing '" + this.searchTxt + "'";
                                }
                                this.$('#total_templates').html('<p class="notfound nf_overwrite">No Landing page found' + search_message + '</p>');
                                this.$('#landingpages_grid tbody').before('<p class="notfound">No Landing page found' + search_message + '</p>');
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    });   
                },
                filterListing: function(e){                    
                    var li = $.getObj(e,"li");                                        
                    if(li.hasClass("active")==false){
                        this.status = li.attr("data-search");                        
                        this.$("#template_search_menu li").removeClass("active");
                        li.addClass("active");                                                
                        
                        this.$(".sortoption_expand .spntext").html(li.text());
                        this.getLandingPages();
                        
                        this.ws_header.find(".c-current-status li").removeClass("active");
                        this.ws_header.find(".c-current-status li[data-search='"+this.status+"']").addClass("active");
                    }
                },
                topBadgesClick : function(e){
                    var li = $.getObj(e,"li");           
                    if(li.hasClass("active")==false && li.hasClass("showhand")){
                        this.ws_header.find(".c-current-status li").removeClass("active");
                        li.addClass("active");                        
                        this.status = li.attr("data-search");                                                                                                                      
                        this.getLandingPages();
                        
                        this.$("#template_search_menu li").removeClass("active");
                        var selectSort = this.$("#template_search_menu li[data-search='"+this.status+"']");
                        selectSort.addClass("active");
                        this.$(".sortoption_expand .spntext").html(selectSort.text());
                    }
                },
                showTotalCount: function ( count ){
                    var statusType = '';
                    var _text = parseInt(count) <= "1" ? "Landing page" : "Landing pages";
                    if (this.status == 'D')
                        statusType = 'Draft';                   
                    else if (this.status === 'P')
                        statusType = 'Published';
                    
                    var text_count = '<strong class="badge">' + this.app.addCommas(count) + '</strong><b>' + statusType + ' </b>';

                    if (this.searchTxt) {
                        this.$("#total_templates").html(text_count + _text + " found containing text '<b>" + this.searchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_templates").html(text_count + _text);
                    }
                },
                searchPages:function(o, txt){
                    this.type = '';
                    this.searchTxt = txt;
                    this.total_fetch = 0;                    
                    if (this.taglinkVal) {
                        this.getLandingPages();
                        this.taglinkVal = false;
                    } else {
                        var keyCode = this.app.validkeysearch(o);
                        if (keyCode) {
                            if ($.trim(this.searchTxt).length > 0) {
                                this.timeout = setTimeout(_.bind(function () {
                                    clearTimeout(this.timeout);
                                    this.getLandingPages();
                                }, this), 500);
                            }
                            this.$('#pageslistsearch input').keydown(_.bind(function () {
                                clearTimeout(this.timeout);
                            }, this));
                        } else {
                            return false;
                        }

                    }
                },
                clearSearchPages: function(){
                    this.searchTxt = '';
                    this.total_fetch = 0;                    
                    this.getLandingPages();
                }

            });
        });
