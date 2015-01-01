define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!onetooneemails/html/singlelistings.html', 'bms-filters', 'daterangepicker', 'moment', 'onetooneemails/collections/singlelistings', 'onetooneemails/singlelisting_row'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template, bmsfilters, _daterangepicker, moment, singlelistingCollection, singlelistingRowView) {
            'use strict';
            return Backbone.View.extend({
                id: 'campaigns_list',
                tags: 'div',
                events: {
                    "click #addnew_campaign": function () {
                        // this.createCampaign();
                    },
                    "keyup #daterange": function () {
                        this.$el.find('#clearcal').show();
                    },
                    "click #clearcal": function (obj) {
                        this.$el.find('#clearcal').hide();
                        this.$el.find('#daterange').val('');
                        this.findEmails(obj);
                    },
                    "click .refresh_btn": function () {
                        this.app.addSpinner(this.$el);
                        this.getallemails();
                        this.headBadge();
                    },
                    "click .stattype": function (obj) {
                        var camp_obj = this;
                        var appMsgs = this.app.messages[0];
                        var target = $.getObj(obj, "a");
                        var prevStatus = this.searchTxt;
                        if (target.parent().hasClass('active')) {
                            return false;
                        }
                        camp_obj.$el.find('.stattype').parent().removeClass('active');
                        target.parent().addClass('active');
                        var html = target.clone();
                        $(this.el).find(".sortoption_expand").find('.spntext').html(html.html());
                        //var type = target.attr("search");
                        var fromDate = "";
                        var toDate = "";
                        var schDates = '';
                        if (this.$('#daterange').val() != '')
                        {
                            schDates = this.$('#daterange').val().split(' - ');
                            if (schDates != '' && schDates.length == 1)
                            {
                                schDates[1] = schDates[0];
                            }
                        }
                        var dateURL = false;
                        if (schDates)
                        {
                            var fromDateParts = schDates[0].split('/');
                            fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2, 4);
                            var toDateParts = schDates[1].split('/');
                            toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2, 4);
                            dateURL = true;
                        }
                        //camp_obj.$el.find("#target-camps .bmsgrid").remove();

                        camp_obj.app.showLoading("Loading Emails...", camp_obj.$("#target-camps"));
                        //this.status = type;
                        this.fromDate = fromDate;
                        this.toDate = toDate;
                        /*if (this.status !== prevStatus) {
                            this.$el.find('#list-search').val('');
                            this.$el.find('#clearsearch').hide();
                            this.type = 'listNormalCampaigns';
                            this.searchTxt = '';
                        }*/
                        //var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&"+dateURL;				
                        //console.log(URL);

                        var filterObj = {status: type, fromDate: fromDate, toDate: toDate, date: dateURL};
                        this.total_fetch = 0;
                        this.getallemails(0, filterObj);

                    },
                    "click .calendericon": function (obj)
                    {
                        this.$el.find('#daterange').click();
                        return false;
                    },
                    "click .cstats .closebtn": "closeChart",
                    "click .sortoption_expand": "toggleSortOption",
             },
             
             /*
              * 
              * @Load Template view from 1:1 email
              */
                loadTemplatesView:function(){
                        var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-182;
                        var dialog = this.app.showDialog({title:'Templates',
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                        headerEditable:false,
                        headerIcon : 'template',
                        bodyCss:{"min-height":dialog_height+"px"},
                        tagRegen:false,
                        reattach : false
                        });
                        this.app.showLoading("Loading Templates...",dialog.getBody());
                        var _this = this;
                        require(["bmstemplates/templates"],function(templatesPage){                                                     
                            var mPage = new templatesPage({page:_this,app:_this.app,scrollElement:dialog.getBody(),dialog:dialog,selectCallback:_.bind(_this.selectTemplate,_this),isOTO : true});               
                           var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                           dialog.getBody().append(mPage.$el);
                           mPage.$el.addClass('dialogWrap-'+dialogArrayLength); 
                           _this.app.showLoading(false, mPage.$el.parent());                     
                            mPage.init();
                            mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                            _this.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                        })
                 
                },
                selectTemplate:function(obj){
                    this.setEditor();
                    var target = $.getObj(obj,"a");
                    var bms_token =this.app.get('bms_token');
                    this.app.showLoading('Loading HTML...',this.$el);
                    this.states.editor_change = true;
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+target.attr("id").split("_")[1];                              
                    jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));                    

                },
                findEmails: function (obj)
                {
                    var olist_obj = this;
                    var appMsgs = this.app.messages[0];
                    var target = $.getObj(obj, "a");
                    var prevStatus = this.status;
                    if (target.html() != 'Date Range')
                    {
                        if (target.prevObject && (target.prevObject[0].localName == 'span' || target.prevObject[0].localName == 'li'))
                        {
                            if (target.prevObject[0].localName === 'li')
                            {
                                target = $(obj.currentTarget);
                                target.parents('ul').find('li.font-bold').removeClass('font-bold');
                                target.addClass('font-bold');
                            }
                            else {
                                target = $.getObj(obj, "span");
                                target.parents('ul').find('span.font-bold').removeClass('font-bold');
                                target.parent().addClass('font-bold');
                                target = target.parent();
                            }
                                if(!target.hasClass('clickable_badge')){
                                  target.removeClass('font-bold');
                                  return false;
                              }
                            olist_obj.$el.find('.stattype').parent().removeClass('active');
                            
                            /*switch (target.attr("search"))
                            {
                                case "C":
                                    olist_obj.$el.find('.sent').parent().addClass('active');
                                    olist_obj.$el.find(".sortoption_expand").find('.spntext').html(olist_obj.$el.find('.sent').text());
                                    break;
                                case "P":
                                    olist_obj.$el.find('.pending').parent().addClass('active');
                                    olist_obj.$el.find(".sortoption_expand").find('.spntext').html(olist_obj.$el.find('.pending').text());
                                    break;
                                case "S":
                                    olist_obj.$el.find('.scheduled').parent().addClass('active');
                                    olist_obj.$el.find(".sortoption_expand").find('.spntext').html(olist_obj.$el.find('.scheduled').text());
                                    break;
                                case "D":
                                    olist_obj.$el.find('.draft').parent().addClass('active');
                                    olist_obj.$el.find(".sortoption_expand").find('.spntext').html(olist_obj.$el.find('.draft').text());
                                    break;
                            }*/
                          
                        }
                        var dateStart = target.attr('dateStart');
                        var dateEnd = target.attr('dateEnd');
                        var schDates = [];
                        if (dateStart)
                        {
                            schDates[0] = $.datepicker.formatDate('m/d/yy', Date.parse(dateStart));
                            schDates[1] = $.datepicker.formatDate('m/d/yy', Date.parse(dateEnd));
                        }
                        else
                        {
                            schDates = this.$('#daterange').val().split(' - ');
                            if (schDates != '' && schDates.length == 1)
                            {
                                schDates[1] = schDates[0];
                            }
                        }
                        if (schDates != '')
                        {
                            var fromDateParts = schDates[0].split('/');
                            var fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2, 4);
                            var toDateParts = schDates[1].split('/');
                            var toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2, 4);
                        }
                       /* var type = target.attr("search");
                        if (!type)
                            type = $('#template_search_menu li.active a').attr('search');
                        this.status = type;
                        if (target.attr('class') == 'stattype topbadges')
                        {
                            camp_obj.$el.find('#template_search_menu li').removeClass('active');
                            $('#template_search_menu').find("li").each(function (i) {
                                if ($(this).find('a').attr('search') == type)
                                    $(this).addClass('active');
                            });
                        }*/

                        olist_obj.app.showLoading("Loading Emails...", olist_obj.$("#target-camps"));
                        if (schDates != '') {
                            this.toDate = toDate;
                            this.fromDate = fromDate;
                        }
                        else {
                            this.toDate = toDate;
                            this.fromDate = fromDate;

                        }
                        /*if (this.status !== prevStatus) {
                            this.$el.find('#list-search').val('');
                            this.$el.find('#clearsearch').hide();
                            this.type = 'listNormalCampaigns';
                            this.searchTxt = '';
                        }*/
                        this.total_fetch = 0;
                       
                        this.getallemails();
                    }
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.singlelistingCollection = new singlelistingCollection();
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
                    this.$campaginLoading = this.$(".loadmore");
                    this.offset = 0;
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    //this.status = "A";
                    this.toDate = '';
                    this.type = 'getMessageList';
                    this.fromDate = '';
                    this.searchTxt = '';
                    this.subjectlinkVal = false;
                    this.subjectText = '';
                    this.isSubjectText = false;
                    this.timeout = null;
                    this.total_Count = null;
                    var camp_obj = this;
                    camp_obj.getallemails();
                    camp_obj.$el.find('div#campslistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchEmails, this),
                        clearFunc: _.bind(this.clearSearchEmails, this),
                        placeholder: 'Search Emails',
                        showicon: 'yes',
                        iconsource: 'campaigns',
                        countcontainer: 'no_of_camps'
                    });

                    camp_obj.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.$el.find('#daterange').daterangepicker();
                    $(".btnDone").click(_.bind(this.findEmails, this));
                    $(".ui-daterangepicker li a").click(_.bind(function (obj) {
                        this.$el.find('#clearcal').show();
                        this.findEmails(obj);
                    }, this));
                    $("#daterange").keyup(_.bind(function (obj) {
                        this.findEmails(obj);
                    }, this));
                    // var camp_obj = this;
                    this.addEmail();
                    this.headBadge();
                    this.current_ws = this.$el.parents(".ws-content");
                    this.tagDiv = this.current_ws.find("#campaign_tags");
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                    this.app.scrollingTop({scrollDiv: 'window', appendto: this.$el});
                    this.tagDiv.hide();
                },
                getallemails: function (fcount, filterObj) {
                    this.$el.find("#template_search_menu").hide();
                    if (!fcount) {
                        this.offset = 0;
                        this.app.showLoading("Loading Emails...", this.$("#target-camps"));
                        this.$el.find('#camp_list_grid tbody').html('');
                        this.$(".notfound").remove();

                    }
                    else {
                        this.offset = parseInt(this.offset) + this.offsetLength;
                        this.$("#camp_list_grid tbody").append('<tr class="loading-campagins"><td colspan="6"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading more emails.</p></div></td></tr>');
                    }
                    if (this.campaigns_request)
                    {
                        this.campaigns_request.abort();
                    }
                    var _data = {type: this.type};
                    _data['offset'] = this.offset;
                    if (filterObj) {
                        //console.log(filterObj);
                       // _data['status'] = this.status;
                        if (filterObj.date) {
                            _data['fromDate'] = filterObj.fromDate;
                            _data['toDate'] = filterObj.toDate;
                        }
                    }
                    if (this.toDate && this.fromDate) {
                        _data['fromDate'] = this.fromDate;
                        _data['toDate'] = this.toDate;
                    }
                    if (this.searchTxt) {
                        _data['searchText'] = this.searchTxt;

                    }
                   // _data['status'] = this.status;
                    _data['bucket'] = 20;

                    this.campaigns_request = this.singlelistingCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$("#camp_list_grid tbody").find('.loading-campagins').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;
                            //console.log('offsetLength = '+ this.offsetLength + ' & total Fetch = ' + this.total_fetch);

                            this.app.showLoading(false, this.$("#target-camps"));
                            //this.showTotalCount(response.totalCount);
                            this.$el.find("#total_templates .badge").html(collection.totalCount);
                            this.total_Count = collection.totalCount;
                            this.showTotalCount(collection.totalCount);
                            //this.$campaginLoading.hide();

                            _.each(data1.models, _.bind(function (model) {
                                this.$el.find('#camp_list_grid tbody').append(new singlelistingRowView({model: model, sub: this}).el);
                            }, this));
                            /*-----Remove loading------*/
                            this.app.removeSpinner(this.$el);
                            /*------------*/
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$(".campaign-box").last().attr("data-load", "true");
                            }

                            if (this.offsetLength == 0) {
                                var search_message = "";
                                if (this.searchTxt) {
                                    search_message += " containing '" + this.searchTxt + "'";
                                }
                                this.$('#total_templates').html('<p class="notfound nf_overwrite">No Emails found' + search_message + '</p>');
                                this.$el.find('#camp_list_grid tbody').before('<p class="notfound">No Emails found' + search_message + '</p>');
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    });

                },
                showChart: function (obj) {
                    var _ele = $.getObj(obj.evobj, "div");
                    var left_minus = 96;
                    var ele_offset = _ele.offset();
                    var ele_height = _ele.height();
                    var top = ele_offset.top + ele_height - 134;
                    var left = ele_offset.left - left_minus;
                    var _this = this;
                    var camp_id = obj.camp_id;
                    this.$(".campaign-name").html(obj.camp_name); //Setting name of Campaign in Chart
                    this.app.showLoading("Loading Chart...", this.$(".cstats .chart-area"));
                    if (!this.chartPage) {
                        require(["reports/campaign_pie_chart"], function (chart) {
                            _this.chartPage = new chart({page: _this, legend: 'none', chartArea: {width: "95%", height: "95%", left: '0px', top: '0px'}});
                            _this.$(".campaign-chart").html(_this.chartPage.$el);
                            _this.chartPage.$el.css({"width": "280px", "height": "280px"});
                            _this.loadChart(camp_id);
                        });
                    }
                    else {
                        this.loadChart(camp_id);
                    }


                    this.$(".cstats").css({"left": left + "px", "top": top + "px"}).show();
                },
                closeChart: function () {
                    this.$(".cstats").hide();
                },
                loadChart: function (camp_id) {
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=stats";
                    URL += "&campNums=" + camp_id;
                    if (this.states_call) {
                        this.states_call.abort();
                        this.states_call = null;
                    }
                    this.chart_data = {clickCount: 0, conversionCount: 0, openCount: 0, pageViewsCount: 0, sentCount: 0};
                    this.states_call = jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        var camp_json = jQuery.parseJSON(xhr.responseText);
                        this.app.showLoading(false, this.$(".cstats .chart-area"));
                        _.each(camp_json.campaigns[0], function (val) {
                            this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                            this.chart_data["conversionCount"] = this.chart_data["conversionCount"] + parseInt(val[0].conversionCount);
                            this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                            this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);
                            this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);
                        }, this);
                        var _data = [
                            ['Action', 'Count'],
                            ['Opens', this.chart_data["openCount"]],
                            ['Page Views', this.chart_data["pageViewsCount"]],
                            ['Conversions', this.chart_data["conversionCount"]],
                            ['Clicks', this.chart_data["clickCount"]]
                        ];

                        this.chartPage.createChart(_data);
                        _.each(this.chart_data, function (val, key) {
                            this.$("." + key).html(this.app.addCommas(val));
                        }, this);

                    }, this));
                },
                liveLoading: function () {
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$("#camp_list_grid tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.getallemails(this.offsetLength);
                    }
                },
                searchEmails: function (o, txt) {

                    this.type = '';
                    this.searchTxt = txt;
                    this.total_fetch = 0;
                    this.type = 'searchMessage';
                    if (this.subjectlinkVal) {
                        this.isSubjectText=true;
                        this.getallemails();
                        this.subjectlinkVal = false;
                    } else {
                        var keyCode = this.app.validkeysearch(o);
                        if (keyCode) {
                            if ($.trim(this.searchTxt).length > 0) {

                                this.timeout = setTimeout(_.bind(function () {
                                    clearTimeout(this.timeout);
                                    this.getallemails();
                                }, this), 500);
                            }
                            this.$('#campslistsearch input').keydown(_.bind(function () {
                                clearTimeout(this.timeout);
                            }, this));
                        } else {
                            return false;
                        }

                    }

                },
                /**
                 * Clear Search Results
                 * 
                 * @returns .
                 */
                clearSearchEmails: function () {

                    this.searchTxt = '';
                    this.total_fetch = 0;
                    this.type = 'getMessageList';
                    this.getallemails();
                },
                showTotalCount: function (count) {

                 
                    var _text = parseInt(count) <= "1" ? "Email" : "Emails";
                    var text_count = '<strong class="badge">' + this.app.addCommas(count) + '</strong>';
                    if (this.fromDate && this.toDate) {
                        var toDate = moment(this.app.decodeHTML(this.toDate),'M/D/YYYY');														
                        var toDateFormat = toDate.format("DD MMM, YYYY");
                        var fromDate = moment(this.app.decodeHTML(this.fromDate),'M/D/YYYY');														
                        var fromDateFormat = fromDate.format("DD MMM, YYYY");
                        this.$("#total_templates").html(text_count + _text + " sent from '<b>" + fromDateFormat + ' - ' + toDateFormat  +"</b>'");
                    }
                    else if (this.searchTxt && this.isSubjectText) {
                        this.$("#total_templates").html(text_count + _text + " found containing Subject '<b>" + this.searchTxt + "</b>'");
                        this.isSubjectText = false;
                    }else if(this.searchTxt){
                        this.$("#total_templates").html(text_count + _text + " found containing text '<b>" + this.searchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_templates").html(text_count + _text);
                    }

                },
                addEmail:function(){
                   var active_ws = this.$el.parents(".ws-content");                
                   active_ws.find("#addnew_action").attr("data-original-title", "Add Email").click(_.bind(this.loadTemplatesView, this));
                   active_ws.find("div.create_new").click(_.bind(this.loadTemplatesView, this));  
                },
                headBadge: function () {
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");                                     
                    if (active_ws.find('ul.c-current-status').length) {
                        var header_title = active_ws.find(".camp_header .edited");
                        header_title.find('ul').remove();
                        // this.$('.c-current-status').remove();
                        var progress = $("<ul class='c-current-status progress-loading'><li style='margin-left:5px;'><a><img src='" + this.options.app.get("path") + "img/greenloader.gif'></a></li></ul>");
                        header_title.append(progress)
                    }
                    var URL = '/pms/io/subscriber/getSingleEmailData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    $.post(URL, {type: 'getSummary'})
                            .done(_.bind(function (data) {
                                var allStats = jQuery.parseJSON(data);
                                if (this.app.checkError(allStats)) {
                                    return false;
                                }
                                var header_title = active_ws.find(".camp_header .edited");
                                header_title.find('div.workspace-field').remove();
                                
                                var sentClass = (parseInt(allStats['sentCount']) > 0) ? "showtooltip showhand" : "defaulthand";
                                
                                var openCount = (parseInt(allStats['openCount']) > 0) ? "showtooltip showhand" : "defaulthand" ;
                               
                                var stats = '<ul class="c-current-status">';
                                
                                stats += '<li search="C" class="'+sentClass+' '+ this.app.getClickableClass(allStats['sentCount']) +'" data-original-title="Click to view sent campaigns"><span class="badge pclr18  stattype topbadges" tabindex="-1" search="C" >' + allStats['sentCount'] + '</span>Sent</li>';
                                stats += '<li search="S" class="'+openCount+' '+ this.app.getClickableClass(allStats['openCount']) +'" data-original-title="Click to view scheduled campaigns"><span class="badge pclr2 showtooltip stattype topbadges" tabindex="-1" search="S" >' + allStats['openCount'] + '</span>Open</li>';
                                stats += '</ul>';
                                header_title.find('ul.progress-loading').remove();
                                header_title.append(stats);
                                
                                $(".c-current-status li").click(_.bind(this.findEmails, this));
                                header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                                //header_title.find(".c-current-status li a").click(_.bind(camp_obj.$el.find('.stattype').click(),camp_obj));
                            }, this));
                },
                toggleSortOption: function (ev) {               
                    $(this.el).find("#template_search_menu").slideToggle();
                    ev.stopPropagation();
                },
                createCampaign:function(fieldText, _json){                                 
                    if(this.headBadge){
                        this.headBadge();
                       this.total_fetch = 0;
                       this.getallemails();
                    }
                    this.app.mainContainer.createCampaign(fieldText, _json);
               }

            });
        });
