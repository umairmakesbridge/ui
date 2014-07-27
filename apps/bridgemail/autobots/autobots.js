/* 
 * Name: AutoBots Grid/Listing
 * Date: 18 June 2014
 * Author: Pir Abdul Wakeel
 * Description: 
 */

define(['text!autobots/html/autobots.html', 'autobots/collections/autobots', 'autobots/autobot', 'autobots/autobots_tile', 'app', 'autobots/choose_bot', 'jquery.highlight', 'bms-mergefields', 'jquery.chosen'],
        function(template, Autobots, Autobot, AutobotTile, app, Choosebot, highlight, mrgfield, choosen) {
            'use strict';
            return Backbone.View.extend({
                events: {
                    "click .sortoption_expand": "toggleSortOption",
                    "click .sortoption_expand .spntext": "toggleSortOption",
                    "click .tile-list .view-tiles": "showTiles",
                    "click .scrollautobots": "scrollToTop",
                    "click .tile-list .view-listing": "showListing",
                    "keyup #txtAutobotSearch": 'searchAutobots',
                    "click  #clearsearch": "clearSearch",
                    "click #autobots_search_menu li a": 'sortByoptions',
                    "click #refresh_autobots": "render",
                    "click .closebtn": "closeContactsListing",
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.objAutobots = new Autobots();
                    this.type = "search";
                    this.current_ws = "";
                    this.isTiles = true;
                    this.searchText = "";
                    this.sortBy = "";
                    this.ws_header = "";
                    this.total_fetch = 0;
                    this.total = 0;
                    this.offsetLength = 0;
                    this.actionType = "";
                    this.sortText = "";
                    this.topClickEvent = false;
                    this.request = null;
                    this.app = app;
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template());
                    this.fetchBots();
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                    this.autoLoadBotImages();
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                sortByoptions: function(ev) {
                    this.actionType = "";
                    this.sort = "";
                    var sort = $(ev.target).data('text');
                    $(this.el).find("#autobots_search_menu li").removeClass('active');
                    $(ev.target).parents('li').addClass('active');
                    $(this.el).find("#autobots_search_menu").slideToggle();
                    var html = $(ev.target).clone();
                    html.find('i').remove();
                    $(this.el).find(".sortoption_expand").find('.spntext').html(html.html());
                    if (sort != "R" && sort != "D") {
                        this.actionType = sort;
                    } else {
                        this.sortBy = sort;
                    }
                    this.sortText = html.html();
                    this.fetchBots();
                },
                fetchBots: function(offset) {
                    var _data = {};
                    _data['type'] = this.type;
                    var that = this;
                    if (!offset) {
                        this.offset = 0;
                        this.total_fetch = 0;
                        that.$el.find(".thumbnails").html('');
                        that.$el.find("#tblAutobots tbody").html('');
                        this.app.showLoading("Loading Autobots...", that.$el);
                    } else {
                        this.offset = this.offset + this.offsetLength;
                    }
                    if (this.request)
                        this.request.abort();
                    var that = this;
                    _data['offset'] = this.offset;
                    if (this.sortBy && !this.actionType) {
                        _data['status'] = this.sortBy;
                    } else {
                        _data['actionType'] = this.actionType;
                    }
                    if (this.searchText) {
                        _data['searchText'] = this.searchText;
                    }

                    this.request = this.objAutobots.fetch({data: _data, success: function(data) {
                            that.total = that.objAutobots.total;
                            if (data.length < 1) {
                                that.$el.find("#tblAutobots tbody").append('<tr><td><p class="notfound" style="margin-top:-8px">No Autobots found</p></td>');
                                that.$el.find(".thumbnails").append('<li style="width:100%;"><p style="margin-top:-8px" class="notfound">No Autobots found</p></li>');
                            }
                            _.each(data.models, function(model) {
                                that.$el.find("#tblAutobots tbody").append(new Autobot({model: model, app: that.options.app, page: that}).el)
                                var autoBotTiles = new AutobotTile({model: model, app: that.options.app, page: that});
                                that.$el.find(".thumbnails").append(autoBotTiles.el)
                                autoBotTiles.tmPr.trimTags();
                            })
                            that.$el.find('.tag').on('click', function() {
                                var html = $(this).html();
                                that.searchText = $.trim(html);
                                $(that.el).find("#txtAutobotSearch").val(that.searchText);
                                that.$el.find('#clearsearch').show();
                                that.fetchBots();
                            });
                            that.offsetLength = data.length;
                            that.total_fetch = that.total_fetch + data.length;
                            if (that.total_fetch < parseInt(that.objAutobots.total)) {
                                that.$el.find("#tblAutobots tbody tr:last").attr("data-load", "true");
                                that.$el.find(".thumbnails li:last").attr("data-load", "true");
                                that.$el.find("#tblAutobots tbody").append("<tr id='tr_loading'><td colspan='6'><div class='gridLoading' style='text-align:center; margin-left:auto;'><img src='img/loading.gif'></div></td>");
                                 
                            }
                            that.app.showLoading(false, that.$el);
                            
                                if (!offset) {
                                    if (that.searchText == "" && that.sortBy == "") {
                                     that.topCounts();
                                    }
                                     that.updateCount();
                                  } else {
                                     that.$el.find("#tblAutobots tbody").find('#tr_loading').remove();
                                     that.$el.find(".footer-loading").hide();
                                }
                        }})
                    

                },
                searchAutobots: function(ev) {
                    this.searchText = '';
                    this.searchTags = '';
                    var text = $(ev.target).val();
                    var that = this;
                    var code = ev.keyCode ? ev.keyCode : ev.which;
                    var nonKey = [17, 40, 38, 37, 39, 16];
                    if ((ev.ctrlKey == true) && (code == '65' || code == '97')) {
                        return;
                    }
                    if ($.inArray(code, nonKey) !== -1)
                        return;
                    if (code == 13 || code == 8) {
                        that.$el.find('#clearsearch').show();
                        this.searchText = text;
                        that.fetchBots();
                    } else if (code == 8 || code == 46) {
                        if (!text) {
                            that.$el.find('#clearsearch').hide();
                            this.searchText = text;
                            that.fetchBots();
                        }
                    } else {
                        that.$el.find('#clearsearch').show();

                        clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                        that.timer = setTimeout(function() { // assign timer a new timeout 
                            if (text.length < 2)
                                return;
                            that.searchText = text;
                            that.fetchBots();
                        }, 500); // 2000ms delay, tweak for faster/slower
                    }
                },
                clearSearch: function(ev) {
                    $(ev.target).hide();
                    $(".search-control").val('');
                    this.total = 0;
                    this.searchText = '';
                    this.searchTags = '';
                    this.total_fetch = 0;
                    // this.$el.find("#total_subscriber span").html("contacts found");
                    this.fetchBots();
                },
                updateCount: function() {
                    $(this.el).find('#total_autobots').find('.sort-text').html('');
                    $(this.el).find('#total_autobots').find('.badge').html(this.objAutobots.total);
                    if (this.searchText) {
                        $(this.el).find('#total_autobots').find('.search-text').html(' for <b>  &quot;' + this.searchText + '&quot;<b/>');
                    } else {
                        $(this.el).find('#total_autobots').find('.search-text').html('');
                    }

                    if ((this.sortBy || this.actionType)) {
                        this.sortText = $.trim(this.sortText);
                        if (this.sortText != "All") {
                            $(this.el).find('#total_autobots').find('.sort-text').html(this.sortText);
                            $(this.el).find(".sortoption_expand").find('.spntext').html(this.sortText);
                            if(this.topClickEvent){
                                 $(this.el).find("#autobots_search_menu").find('li').removeClass('active');
                                    if(this.sortText == "Playing")
                                        $(this.el).find("#autobots_search_menu").find('#li_playing').addClass('active');
                                    else
                                         $(this.el).find("#autobots_search_menu").find('#li_paused').addClass('active');

                            }
                        } else {
                            $(this.el).find('#total_autobots').find('.sort-text').html('');
                        }
                    } else {
                        $(this.el).find('#total_autobots').find('.sort-text').html('');
                    }
                },
                toggleSortOption: function(ev) {
                    $(this.el).find("#autobots_search_menu").slideToggle();
                },
                topCounts: function(isDelete) {

                    var that = this;
                    this.current_ws = this.$el.parents(".ws-content");
                    this.ws_header = this.current_ws.find(".camp_header .edited");
                    this.ws_header.find("#campaign_tags").remove();
                    // if(that.ws_header.find('.c-current-status').length > 0){
                    that.ws_header.find('.c-current-status').remove();
                    //}
                    this.ws_header.find("#addnew_action").attr('data-original-title', "Add new autobot");
                    this.ws_header.find("#addnew_action").on('click', function() {
                        that.addNewAutobot();
                    }) 
                    var progress  = $("<ul class='c-current-status' id='top_count'><li style='margin-left:5px;'><a><img src='img/greenloader.gif'></a></li></ul>");
                    that.ws_header.append(progress);
                    var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=counts";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        var header_part = "<li> <a data-text='D'><span class='badge pclr2'>" + that.options.app.addCommas(data.pauseCount) + "</span> Paused </a> </li>";
                        header_part = header_part + "<li> <a data-text='R'><span class='badge pclr18'>" + that.options.app.addCommas(data.playCount) + "</span> Playing </a> </li>";
                        header_part = header_part + "<li> <a data-text='P'><span class='badge pclr6'>" + that.options.app.addCommas(data.pendingCount) + "</span> Pending </a> </li>";
                        var $header_part = $(header_part);
                        that.ws_header.find(".c-current-status").html($header_part);
                        that.ws_header.find(".c-current-status li a").on('click', function(ev) {
                            if ($(this).text().split(" ")[0] == "0")
                                return;
                            that.sortBy = $(this).data('text');
                            that.sortText = $(this).text().split(" ")[1];
                            that.topClickEvent = true;
                            that.fetchBots();
                             
                        })
                        if (isDelete) {
                            that.objAutobots.total = that.objAutobots.total - 1;
                            $(that.el).find('#total_autobots').find('.badge').html(that.objAutobots.total);
                        }
                        // this.ws_header.find("#workspace-header").after($('<a class="cstatus pclr18" style="margin:6px 4px 0px -7px">Playing </a>'));
                    });
                },
                addNewAutobot: function() {
                    $("body #new_autobot").remove();
                    $("body .autobots-modal-in").remove();
                    $('body').append('<div class="modal-backdrop  in autobots-modal-in"></div>');
                    $("body").append("<div id='new_autobot' style='width: 950px;  top: 120px;left:50%' class='modal in'></div>");
                    $("body #new_autobot").html(new Choosebot({app: this.app, listing: this}).el);
                    $("body #new_autobot").css("margin-left","-"+$("#new_autobot").width() / 2+"px");
                },
                showTiles: function(ev) {
                    this.isTiles = true;
                    $(this.el).find('.btn-default').find('i').addClass('listing').removeClass('tiles');                    
                    $(this.el).find(".view-tiles").hide();
                    $(this.el).find(".view-listing").show();
                    $(this.el).find("#autobots_listing").hide();
                    $(this.el).find("#autobots_tiles").show();
                },
                showListing: function(ev) {
                    this.isTiles = false;
                    $(this.el).find('.btn-default').find('i').addClass('tiles').removeClass('listing');
                    $(this.el).find(".view-listing").hide();
                    $(this.el).find(".view-tiles").show();
                    $(this.el).find("#autobots_listing").show();
                    $(this.el).find("#autobots_tiles").hide();
                },
                closeContactsListing: function() {
                    $("#div_pageviews").empty('');
                    $("#div_pageviews").hide();
                },
                liveLoading: function(where) {
                    var $w = $(window);
                    var th = 200;
                    this.scrollTop();
                    if (this.isTiles == true) {
                        var filters = this.$el.find('.thumbnails li:last');
                    } else {
                        var filters = this.$el.find('table tbody tr:last').prev();
                    }
                    var inview = filters.filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.$el.find(".footer-loading").show();
                        this.fetchBots(this.offsetLength);
                    }
                },
                scrollTop: function() {
                    if ($(window).scrollTop() > 50) {
                        this.$el.find(".ScrollToTop").fadeIn('slow');
                    } else {
                        this.$el.find(".ScrollToTop").fadeOut('slow');
                    }
                },
                scrollToTop: function() {
                    $("html,body").css('height', '100%').animate({scrollTop: 0}, 600).css("height", "");
                },
             
                autoLoadBotImages:function(){
                 var preLoadArray = ['img/scorebot-h.png','img/alertbot-h.png','img/mailbot-h.png','img/tagbot-h.png','img/bdaybot-h.png']
                 $(preLoadArray).each(function() {
                    var image = $('<img />').attr('src', this);                    
                 });
                }
               
            });
        });