define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!landingpages/html/landingpages.html', 'bms-filters', 'moment', 'landingpages/collections/landingpages', 'landingpages/landingpage_row'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template, bmsfilters, moment, pagesCollection, pageRowView) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {
                    "click .refresh_btn": 'refreshListing'
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
                    this.status = "A";
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
                        var stats = '<ul class="c-current-status">';                                                                    
                            stats += '<li search="S"><span class="badge pclr2 showtooltip stattype topbadges" tabindex="-1" search="R" data-original-title="Click to view published pages">' + allStats['publishCount'] + '</span>Published</li>';
                            stats += '<li search="D"><span class="badge pclr1 showtooltip stattype topbadges" tabindex="-1" search="D" data-original-title="Click to view draft pages">' + allStats['draftCount'] + '</span>Draft</li>';
                            stats += '<li search="T"><span class="badge pclr6 showtooltip stattype topbadges" tabindex="-1" search="T" data-original-title="Click to view templates">' + allStats['templateCount'] + '</span>Templates</li>';
                        stats += '</ul>';
                        header_title.append(stats);
                        //$(".c-current-status li").click(_.bind(this.findPages, this));
                        header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                    }, this));
                },
                createLandingPage: function ( ) {
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Start with choosing a name for your Landing Page',
                      buttnText: 'Create',
                      plHolderText : 'Enter landing page name here',
                      emptyError : 'Landing page name cann\'t be empty',
                      createURL : '',
                      postData : {type:'create'},
                      saveCallBack :  _.bind(this.createPage,this)
                    });
                },
                createPage: function(txt,json){
                    
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
                    if (filterObj) {                        
                        _data['status'] = this.status;                        
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
                showTotalCount: function ( count ){
                    var statusType = 'All';
                    var _text = parseInt(count) <= "1" ? "Landing page" : "Landing pages";
                    if (this.status == 'D')
                        statusType = 'Draft';
                    else if (this.status === 'C')
                        statusType = 'Sent';
                    else if (this.status === 'P')
                        statusType = 'Pending';
                    
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
