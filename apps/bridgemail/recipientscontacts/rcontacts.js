/* Name: R Contact / Recipients Contact.. the name is different because there is already many contacts
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!recipientscontacts/html/rcontacts.html', 'recipientscontacts/rcontact', 'recipientscontacts/collections/rcontacts'],
        function(template, rContact, rContacts) {
            'use strict';
            return Backbone.View.extend({
                className: 'rcontacts-view',
                events: {
                    "keyup #contacts_search": "search",
                    "click  #clearsearchcontact": "clearSearch",
                    'click .stats-scroll': 'scrollToTop',
                    'click .sortoption': 'openSortDiv',
                    "click .refresh_autobots": "render",
                    "click #template_search_menu": "changeSortBy",
                    "keyup #daterange": 'showDatePicker',                    
                    "click #clearcal": 'hideDatePicker',
                    "click .calendericon": 'showDatePickerFromClick',
                },
                initialize: function() {                    
                    if (this.options.params) {
                        _.each(this.options.params,function(val,key){
                            this.options[key]=val;
                        },this)                        
                        this.$scrollElement = $(window);
                        this.inWorkSpace = true;
                    }
                    this.app = this.options.app;
                    this.template = _.template(template);
                    this.status = "S",
                    this.searchText = "";
                    this.toDate =null;
                    this.fromDate = null;
                    this.offset = 0;
                    this.listNum = this.options.listNum;
                    this.isRequestRunning = null;
                    this.objRContacts = new rContacts();
                    this.type = 'get';
                    this.offsetLength = 0;
                    this.tagText = '';
                    this.total_fetch = 0;
                    this.total = 0;
                    this.timer = 0;
                    this.dialogHeight = this.options.dialogHeight;
                    this.disableCalender = false;
                    
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template());
                    if(this.options.fromDate){
                        this.fromDate =this.options.fromDate;
                        this.toDate = this.options.fromDate;
                        var fromDate = moment($.trim(this.fromDate), 'MM-DD-YY');
                        var toDate = moment($.trim(this.toDate), 'MM-DD-YY');
                        this.$("#daterange").val(fromDate.format("M/D/YYYY")+" - "+toDate.format("M/D/YYYY"));
                        this.$("#daterange").prop("disabled",true);
                        this.disableCalender = true;
                    }
                    if(this.options.params && this.options.params.toDate && this.options.params.toDate){
                        this.fromDate = this.options.params.fromDate;
                        this.toDate = this.options.params.toDate;
                        var fromDate = moment($.trim(this.fromDate), 'MM-DD-YY');
                        var toDate = moment($.trim(this.toDate), 'MM-DD-YY');
                        this.$("#daterange").val(fromDate.format("M/D/YYYY")+" - "+toDate.format("M/D/YYYY"));                        
                    }
                    this.loadRContacts();
                    if(!this.inWorkSpace){
                        this.$scrollElement = this.$(".stats_listing");
                    }
                    this.$scrollElement.scroll(_.bind(this.liveLoading, this));
                    this.$scrollElement.resize(_.bind(this.liveLoading, this));
                    if (typeof this.options.sentAt != "undefined") {
                        this.$el.find("#contacts_close").remove();
                        this.$el.find(".input-append").css("margin-right", "-45px");
                        this.$el.parents('.modal').find('#dialog-title .cstatus').remove();
                        this.$el.parents('.modal').find('#dialog-title .percent_stats').remove();
                    }
                    
                    if(this.$('#daterange').length){
                        this.dateRangeControl = this.$('#daterange').daterangepicker();
                        this.dateRangeControl.panel.find(".btnDone").click(_.bind(this.setDateRange, this));
                        this.dateRangeControl.panel.find("ul.ui-widget-content li").click(_.bind(this.setDateRangeLi, this));
                    }
                    
                    
                    

                },
                init:function(){
                  if (this.options.type == "workflow") {
                        this.active_ws = this.$el.parents(".ws-content");
                        this.active_ws.find(".camp_header").find("#campaign_tags").css("width","auto").append("<ul><li style='color:#fff'><span class='workflow-header'></span>&nbsp;"+this.options.params.wfName+" </li></ul>");
                        this.active_ws.find("#workspace-header").append("<strong class='cstatus pclr18' style='margin-left:10px; float:right'> Option <b>"+ this.options.params.optionNumber +"</b>  </strong>")
                    }
                },
                loadRContacts: function(offset) {
                    if (typeof this.options.sentAt != "undefined") {
                        this.$el.parents('.modal').find('#dialog-title .cstatus').remove();
                        this.$el.parents('.modal').find('#dialog-title .percent_stats').remove();
                    }
                    var that = this;
                    if (this.isRequestRunning)
                        this.isRequestRunning.abort();
                    if (!offset) {
                        this.offset = 0;
                    }
                    else {
                        this.offset = this.offset + this.offsetLength;
                    }
                    if (this.offset == 0) {
                        this.$el.find('#table_pageviews tbody').empty();
                        this.objRContacts.reset();
                    }
                    var _data = {};
                    _data['type'] = this.type;
                    if (this.options.type == "tag") {
                        _data['tag'] = this.listNum;
                        this.objRContacts.url = '/pms/io/user/getTagPopulation/?BMS_REQ_TK=' + this.options.app.get('bms_token');                        
                    } else if (this.options.type == "target") {
                        _data['filterNumber'] = this.listNum;
                        this.objRContacts.url = '/pms/io/filters/getTargetPopulation/?BMS_REQ_TK=' + this.options.app.get('bms_token');                        
                    } else if (this.options.type == "autobots") {
                        this.objRContacts.url = '/pms/io/trigger/getAutobotPopulation/?BMS_REQ_TK=' + this.options.app.get('bms_token');
                        _data['botId'] = this.options.botId;
                        _data['status'] = this.options.status;                        
                    } else if (this.options.type == "webform") {
                        this.objRContacts.url = '/pms/io/form/getSignUpFormData/?BMS_REQ_TK=' + this.options.app.get('bms_token');
                        _data['formId'] = this.options.listNum;
                        if(this.options.params && this.options.params.pageId){
                            _data['pageId'] = this.options.params.pageId;
                        }
                        _data['type'] = "getSubmissions";                           
                    }else if (this.options.type == "workflow") {
                        this.objRContacts.url = this.options.params.url+'?BMS_REQ_TK=' + this.options.app.get('bms_token');
                        _data['workflowId'] = this.options.listNum;   
                        _.each(this.options.params,function(val,key){
                            if(key!="url"){
                                _data[key]=val;
                            }
                        },this);  
                        if(!this.options.params.viewType){ //handling date form for web visits
                            var fromDate = moment($.trim(this.fromDate), 'MM-DD-YYYY');
                            var toDate = moment($.trim(this.toDate), 'MM-DD-YYYY');
                            this.fromDate = fromDate.format("MM-DD-YY");
                            this.toDate = toDate.format("MM-DD-YY");
                        }
                        
                    } else {
                        _data['listNum'] = this.listNum;
                        _data['status'] = this.status;
                                                
                    }
                    if(this.toDate && this.fromDate){
                        _data['toDate'] = this.toDate;
                        _data['fromDate'] = this.fromDate;
                    }
                    _data['offset'] = this.offset;
                    _data['searchText'] = this.searchText;
                    
                    this.$el.find('#table_pageviews tbody .load-tr').remove();
                    this.$el.find('#table_pageviews tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:20px;padding-left:43%;'>No contacts founds!</div><div class='loading-contacts' style='margin-top:45px'></div></td></tr>");
                    this.options.app.showLoading("&nbsp;", this.$el.find('#table_pageviews tbody').find('.loading-contacts'));
                    this.objRContacts.fetch({data: _data, success: function(contacts) {
                            that.app.removeSpinner(that.$el);
                            that.offsetLength = contacts.length;
                            that.total_fetch = that.total_fetch + contacts.length;
                            _.each(contacts.models, function(model) {
                                that.$el.find('#table_pageviews tbody').append(new rContact({model: model, app: that.options.app,parent: that ,isSubscriber:that.options.isSubscriber, listNum: that.options.listNum, type: that.options.type, sentAt: that.options.sentAt}).el);
                            });
                            if (that.searchText != '') {
                                that.showSearchFilters(that.searchText, that.options.app.addCommas(that.objRContacts.total), that.searchText);
                            } else {
                                that.$("#total_contacts span").html("Contact(s) found");
                                that.$("#total_contacts .badge").html(that.options.app.addCommas(that.objRContacts.total));
                            }
                            if (contacts.models.length == 0) {
                                that.$el.find('.no-contacts').show();
                                that.$el.find('#table_pageviews tbody').find('.loading-contacts').remove();
                            } else {
                                $('#table_pageviews tbody').find('.loading-contacts').remove();
                                that.$el.find('#table_pageviews tbody #loading-tr').remove();
                            }
                            if (that.total_fetch < parseInt(that.objRContacts.total)) {
                                that.$el.find("#table_pageviews tbody tr:last").attr("data-load", "true");
                            }

                            var height = that.$el.find(".stats_listing").outerHeight(true);
                            if(!that.inWorkSpace){
                                if (height < 360) {
                                    that.$el.find(".stats_listing").css({"height": "300px", "overflow-y": "auto"});
                                } else {
                                    if (that.objRContacts.models.length != 0)
                                        if (that.dialogHeight) {
                                            that.$el.find(".stats_listing").css({"height": that.dialogHeight - 70 + "px", "overflow-y": "auto"});
                                        } else {
                                            that.$el.find(".stats_listing").css({"height": "357px", "overflow-y": "auto"});
                                        }
                                    if (height > 375) {
                                        that.$el.find(".stats_listing").find('.stats-scroll').remove();
                                        that.$el.find(".stats_listing").append("<button class='stats-scroll ScrollToTop' type='button' style='display: none; position:absolute;bottom:5px;right:20px;'></button>");
                                    }
                                }
                            }
                            that.$el.find('#table_pageviews tbody').find('.tag').on('click', function() {
                                if(that.options.type=="webform"){
                                    return false;
                                }
                                var html = $(this).html();
                                that.searchText = $.trim(html);
                                that.$el.find(".search-control").val(that.searchText);
                                that.$el.find('#clearsearchcontact').show();
                                that.loadRContacts();
                            });
                            that.$el.find('#table_pageviews tbody').find('.salestatus').on('click', function() {
                                var html = $(this).html();
                                that.searchText = $.trim(html);
                                that.$el.find(".search-control").val(that.searchText);
                                that.$el.find('#clearsearchcontact').show();
                                that.loadRContacts();
                            });
                        }})

                },
                showSearchFilters: function(text, total) {
                    this.$el.find("#total_contacts .badge").html(total);
                    this.$el.find("#total_contacts span").html("Contact(s) found for <b>\"" + text + "\" </b> ");
                },
                showLoadingWheel: function(isShow, target) {
                    if (isShow)
                        target.append("<div class='pstats' style='display:block; background:#01AEEE;'><div class='loading-wheel right' style='margin-left:0px;margin-top: 0px;position: inherit!important;'></div></div>")
                    else {
                        var ele = target.find(".loading-wheel");
                        ele.remove();
                    }
                },
                search: function(ev) {
                    this.searchText = '';
                    this.searchTags = '';
                    var that = this;
                    var code = ev.keyCode ? ev.keyCode : ev.which;
                    var nonKey = [17, 40, 38, 37, 39, 16];
                    if ((ev.ctrlKey == true) && (code == '65' || code == '97')) {
                        return;
                    }
                    if ($.inArray(code, nonKey) !== -1)
                        return;
                    var text = $(ev.target).val();
                    if (code == 13 || code == 8) {
                        that.$el.find('#clearsearchcontact').show();
                        this.searchText = text;
                        that.loadRContacts();
                    } else if (code == 8 || code == 46) {
                        if (!text) {
                            that.$el.find('#clearsearchcontact').hide();
                            this.searchText = text;
                            that.loadRContacts();
                        }
                    } else {
                        that.$el.find('#clearsearchcontact').show();
                        clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                        that.timer = setTimeout(function() { // assign timer a new timeout 
                            if (text.length < 2)
                                return;
                            that.searchText = text;
                            that.loadRContacts();
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
                    this.loadRContacts();
                }, badgeText: function(margin_left) {
                    var search = "<div class='temp-filters clearfix' style='display:inline-block;padding:4px 0px;" + margin_left + "'>";
                    search = search + "<h2 id='total_subscriber'><strong class='badge'>Loading...</strong>  <span>contacts found</span></h2></div>";
                    return search;
                },
                scrollToTop: function() {
                    this.$el.find(".stats_listing").animate({scrollTop: 0}, 600);
                },
                liveLoading: function(where) {
                    var $w = $(window);
                    var th = 200;
                    if (this.$el.find(".stats_listing").scrollTop() > 70) {
                        this.$el.find(".stats-scroll").fadeIn('slow');
                    } else {
                        this.$el.find(".stats-scroll").fadeOut('slow');
                    }
                    var inview = this.$el.find('table tbody tr:last').filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.loadRContacts(this.offsetLength);
                    }
                },
                openSortDiv: function() {
                    this.$el.find("#template_search_menu").slideToggle('');
                },
                changeSortBy: function(ev) {
                    this.$el.find("#template_search_menu").slideUp();
                    this.$el.find(".sortoption span").html($(ev.target).html());
                }, /*---------- Calender functions---------------*/
                showDatePicker: function () {
                    this.$('#clearcal').show();
                    return false;
                },
                hideDatePicker: function () {
                    this.$('#clearcal').hide();
                    this.fromDate = "";
                    this.toDate = "";                                          
                    this.total_fetch = 0;
                    this.$('#daterange').val('');                    
                    this.loadRContacts();
                },
                showDatePickerFromClick: function () {
                    if(this.disableCalender){
                        return false;
                    }
                    this.$('#daterange').click();
                    return false;
                },
                setDateRange: function () {
                    var val = this.$("#daterange").val();
                    if ($.trim(val)) {
                        this.$('#clearcal').show();
                        var _dateRange = val.split("-");
                        var toDate = "", fromDate = "";
                        if (_dateRange[0]) {
                            fromDate = moment($.trim(_dateRange[0]), 'M/D/YYYY');
                        }
                        if ($.trim(_dateRange[1])) {
                            toDate = moment($.trim(_dateRange[1]), 'M/D/YYYY');
                        }
                        if (fromDate) {
                            this.fromDate = fromDate.format("MM-DD-YY");
                        }
                        if (toDate) {
                            this.toDate = toDate.format("MM-DD-YY");
                        } else {
                            this.toDate = fromDate.format("MM-DD-YY");
                        }
                        
                        this.loadRContacts();
                    }
                },
                setDateRangeLi: function (obj) {
                    var target = $.getObj(obj, "li");
                    if (!target.hasClass("ui-daterangepicker-dateRange")) {                        
                        this.setDateRange();
                    }
                }

            });
        });