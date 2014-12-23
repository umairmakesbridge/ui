define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!landingpages/html/landingpages.html', 'bms-filters', 'moment', 'landingpages/collections/landingpages', 'landingpages/landingpage_row', 'landingpages/landingpage_template_row'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template, bmsfilters, moment, pagesCollection, pageRowView, tplPageRowView) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {
                    "click .refresh_mypages": 'refreshListing',
                    "click .refresh_templates":'refreshTemplateListing',
                    "click .sortoption_expand": "toggleSortOption",
                    "click li.stattype": 'filterListing'                    
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.pagesCollection = new pagesCollection();
                    this.pagesTemplateCollection = new pagesCollection();     
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                    this.offset = 0;
                    this.template_offset = 0;
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    this.total_template_fetch = 0;
                    this.loadingpages_request = null;
                    this.loadingpages_template_request = null;
                    this.templateSearchTxt = "";
                    this.status = "";
                    this.actionType = "";
                    this.taglinkVal = false;
                    this.timeout = false;
                    this.templateLoaded = false;
                    
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
                    this.$('div#pagestemplatelistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchTemplatePages, this),
                        clearFunc: _.bind(this.clearSearchTemplatePages, this),
                        placeholder: 'Search Template Landing Pages',
                        showicon: 'yes',
                        iconsource: 'lpage',
                        countcontainer: 'no_of_camps'
                    });
                    
                    this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
                    
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                    
                    $(window).scroll(_.bind(this.liveLoadingTemplate, this));
                    $(window).resize(_.bind(this.liveLoadingTemplate, this));
                },
                liveLoading: function () {
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$("#landingpages_grid tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$("#area_mylandingpages").height() > 0) {
                        inview.removeAttr("data-load");
                        this.getLandingPages(20);
                    }
                }, 
                liveLoadingTemplate: function(){
                   var $w = $(window);
                    var th = 200;
                    var inview = this.$("#templates_landingpages_grid tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$("#area_templatelandingpages").height() > 0) {
                        inview.removeAttr("data-load");
                        this.getTemplatesLandingPages(20);
                    } 
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
                createLandingPage: function (  ) {
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
                refreshTemplateListing: function(){                    
                    this.getTemplatesLandingPages();
                    this.headBadge();  
                },
                getLandingPages: function ( fcount, filterObj ) {
                    if (!fcount) {
                        this.offset = 0;
                        this.total_fetch = 0;
                        this.app.showLoading("Loading Landing Pages...", this.$("#target-camps"));
                        this.$el.find('#landingpages_grid tbody').html('');
                        this.$("#area_mylandingpages .notfound").remove();
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
                        _data['searchType'] = this.actionType;                        
                    }
                    else {
                        delete  _data['searchType'];
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
                                var lpRow = new pageRowView({model: model, sub: this});
                                this.$el.find('#landingpages_grid tbody').append(lpRow.el);
                                lpRow.on('categorySearch',_.bind(this.searchByCategory,this));
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
                        this.actionType = "";
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
                        if(li.attr("data-search")!=="T"){
                            this.actionType = "";
                            this.status = li.attr("data-search");                                                                                                                      
                            this.$("#area_mylandingpages").show();
                            this.$("#area_templatelandingpages").hide();
                            this.getLandingPages();                            
                            this.$("#template_search_menu li").removeClass("active");
                            var selectSort = this.$("#template_search_menu li[data-search='"+this.status+"']");
                            selectSort.addClass("active");
                            this.$(".sortoption_expand .spntext").html(selectSort.text());
                            
                        }
                        else{
                            this.$("#area_templatelandingpages").show();
                            this.$("#area_mylandingpages").hide();
                            if(this.templateLoaded==false){
                                this.templateLoaded = true;
                                this.getTemplatesLandingPages();                                
                            }
                        }
                        
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
                        var typeText = "<u>text</u>";
                        if(this.actionType=="C"){
                            typeText = "<u>category</u>";
                        }
                        else if(this.actionType=="T"){
                            typeText = "<u>tag</u>";
                        }
                        this.$("#total_templates").html(text_count + _text + " found containing "+typeText+" '<b>" + this.searchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_templates").html(text_count + _text);
                    }
                },
                showTotalCountTemplate: function ( count ){
                    
                    var _text = parseInt(count) <= "1" ? "Template Landing page" : "Template Landing pages";
                   
                    var text_count = '<strong class="badge">' + this.app.addCommas(count) + '</strong>';

                    if (this.templateSearchTxt) {
                        var typeText = "<u>text</u>";
                        if(this.actionTypeTemplate=="C"){
                            typeText = "<u>category</u>";
                        }
                        else if(this.actionTypeTemplate=="T"){
                            typeText = "<u>tag</u>";
                        }
                        this.$("#total_templates_pages").html(text_count + _text + " found containing "+typeText+" '<b>" + this.templateSearchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_templates_pages").html(text_count + _text);
                    }
                },
                getTemplatesLandingPages: function(fcount){
                    if (!fcount) {
                        this.template_offset = 0;
                        this.total_template_fetch = 0;
                        this.app.showLoading("Loading Templates...", this.$("#template_landing_pages"));
                        this.$el.find('#templates_landingpages_grid tbody').html('');
                        this.$("#area_templatelandingpages .notfound").remove();
                    }
                    else {
                        this.offset = parseInt(this.offset) + fcount;
                        this.$("#templates_landingpages_grid tbody").append('<tr class="loading-campagins"><td colspan="3"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading more template landing pages..</p></div></td></tr>');
                    }
                    if (this.loadingpages_template_request)
                    {
                        this.loadingpages_template_request.abort();
                    }
                    var _data = {offset: this.template_offset,type:'search',isAdmin:'Y'};                    
                                        
                    if (this.templateSearchTxt) {
                        _data['searchText'] = this.templateSearchTxt;
                    }              
                    if(this.actionTypeTemplate){
                        _data['searchType'] = this.actionTypeTemplate;                        
                    }
                    else {
                        delete  _data['searchType'];
                    }
                    _data['bucket'] = 20;

                    this.loadingpages_template_request = this.pagesTemplateCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$("#templates_landingpages_grid tbody").find('.loading-campagins').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }                            
                            this.total_template_fetch = this.total_template_fetch + data1.length;                            

                            this.app.showLoading(false, this.$("#template_landing_pages"));
                            
                            this.$("#total_templates_pages .badge").html(collection.totalCount);

                            this.showTotalCountTemplate(collection.totalCount);                            

                            _.each(data1.models, _.bind(function (model) {
                                var lpRow = new tplPageRowView({model: model, sub: this});
                                this.$el.find('#templates_landingpages_grid tbody').append(lpRow.el);
                                lpRow.on('categoryTemplateSearch',_.bind(this.searchTemplateByCategory,this));
                            }, this));
                                                      
                            
                            if (this.total_template_fetch < parseInt(collection.totalCount)) {
                                this.$(".landingpage-template-box").last().attr("data-load", "true");
                            }

                            if (parseInt(collection.totalCount) == 0) {
                                var search_message = "";
                                if (this.templateSearchTxt) {
                                    search_message += " containing '" + this.templateSearchTxt + "'";
                                }
                                this.$('#total_templates_pages').html('<p class="notfound nf_overwrite">No Template Landing page found' + search_message + '</p>');
                                this.$('#templates_landingpages_grid tbody').before('<p class="notfound">No Templates Landing page found' + search_message + '</p>');
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    }); 
                },
                searchPages:function(o, txt){                    
                    this.searchTxt = txt;                    
                    this.total_fetch = 0;                    
                    if (this.taglinkVal) {
                        this.getLandingPages();
                        this.taglinkVal = false;
                    } else {
                        this.actionType = "";
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
                    this.actionType = "";
                    this.getLandingPages();
                },               
                searchTemplatePages:function(o, txt){                    
                    this.templateSearchTxt = txt;
                    this.total_template_fetch = 0;                    
                    if (this.taglinkVal) {
                        this.getTemplatesLandingPages();
                        this.taglinkVal = false;
                    } else {
                        this.actionTypeTemplate = "";
                        var keyCode = this.app.validkeysearch(o);
                        if (keyCode) {
                            if ($.trim(this.templateSearchTxt).length > 0) {
                                this.timeout2 = setTimeout(_.bind(function () {
                                    clearTimeout(this.timeout2);
                                    this.getTemplatesLandingPages();
                                }, this), 500);
                            }
                            this.$('#pagestemplatelistsearch input').keydown(_.bind(function () {
                                clearTimeout(this.timeout2);
                            }, this));
                        } else {
                            return false;
                        }

                    }
                },
                clearSearchTemplatePages: function(){
                    this.templateSearchTxt = '';
                    this.actionTypeTemplate = "";
                    this.total_template_fetch = 0;                    
                    this.getTemplatesLandingPages();
                },
                searchByCategory:function(text){                    
                    this.actionType = "C";
                    this.searchTxt = $.trim(text);
                    this.total_fetch = 0; 
                    this.$("#pageslistsearch input").val(this.searchTxt);
                    this.$("#pageslistsearch #clearsearch").show();
                    this.getLandingPages();
                },
                searchTemplateByCategory : function(text){
                    this.actionTypeTemplate = "C";
                    this.templateSearchTxt = $.trim(text);
                    this.total_template_fetch = 0; 
                    this.$("#pagestemplatelistsearch input").val(this.templateSearchTxt);
                    this.$("#pagestemplatelistsearch #clearsearch").show();
                    this.getTemplatesLandingPages();
                }

            });
        });
