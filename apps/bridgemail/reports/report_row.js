define(['text!reports/html/report_row.html', 'moment', 'jquery.searchcontrol', 'daterangepicker', 'jquery.icheck'],
        function (template, moment) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className: 'act_row',
                events: {
                    'click .delete': 'removeReport',
                    'click .add-msg-report': 'openSelectionDialog',
                    'click .edit': 'openSelectionDialog',
                    "keyup #daterange": 'showDatePicker',
                    "mouseup #daterange" : 'showSelected',
                    "click #clearcal": 'hideDatePicker',
                    "click .calendericon": 'showDatePickerFromClick',
                    "click .percent": 'showPercentDiv',
                    "click .icons-bar-chart .icons":'changeChart',
                    "click .tagsexpand":"expandCollapseTags"
                },
                initialize: function () {
                    this.mapping = {campaigns: {label: 'Campaigns', colorClass: 'darkblue', iconClass: 'open'},
                        landingpages: {label: 'Landing Pages', colorClass: 'yellow', iconClass: 'form2'},
                        nurturetracks: {label: 'Nurture Tracks', colorClass: 'blue', iconClass: 'track'},
                        autobots: {label: 'Autobots', colorClass: 'grey', iconClass: 'autobot'},
                        tags: {label: 'Tags', colorClass: 'green', iconClass: 'tags'},
                        webforms: {label: 'Signup Forms', colorClass: '', iconClass: 'form'},
                        targets: {label: 'Targets', colorClass: 'red', iconClass: 'target'},
                        webstats: {label: 'Web Stats', colorClass: 'yellow', iconClass: 'webstats'}

                    };
                    this.webstats = {
                        "uv": {title: "Unique Visitors", subtitle: "", yAxisText: "Unique Visits", xAxisText: "", barColor: "#93be4c"},
                        "pv": {title: "Page Views", subtitle: "", yAxisText: "Page Views", xAxisText: "", barColor: "#2f93e5"},
                        "rv": {title: "Return Visitors", subtitle: "", yAxisText: "Return Visitor Count", xAxisText: "", barColor: "#dfaa2c"},
                        "seo": {title: "Top Keywords", subtitle: "", yAxisText: "Keywords count", xAxisText: "Top Keywords", xAxisLabelDisabled: true, multipColrs: true},
                        "lcdetail": {title: "Top Companies", subtitle: "", yAxisText: "Views Count", xAxisText: "Top Companies Visited", xAxisLabelDisabled: true, multipColrs: true},
                        "ref": {title: "Top Referral Links", subtitle: "", yAxisText: "Count", xAxisText: "Top Referral Links", xAxisLabelDisabled: true, multipColrs: true},
                        "pp": {title: "Popular Pages", subtitle: "", yAxisText: "Pages View Count", xAxisText: "Top Pages", xAxisLabelDisabled: true, multipColrs: true}
                    }
                    this.sub = this.options.sub;
                    this.app = this.sub.app;
                    this.objects = this.options.objects ? this.options.objects : [];
                    this.modelArray = [];
                    this.dataArray = [];
                    this.fromDate = null;
                    this.toDate = null;
                    this.dateRange = 0;
                    this.loadReport = this.options.loadReport;
                    this.fromClick=false;
                    this.row_obj = this.options.row_obj;
                    this.reportType = this.options.reportType;
                    this.template = _.template(template);          
                                        
                    Highcharts.setOptions({
                        lang: {
                            thousandsSep: ',',
                            contextButtonTitle:'Choose an output format'
                        }
                    });
                    
                    
                    this.render();
                },
                render: function ()
                {

                    var mapObj = this.mapping[this.reportType];
                    this.$el.html(this.template({
                        rType: mapObj.label,
                        rIcon: mapObj.iconClass
                    }));
                    this.$el.addClass(mapObj.colorClass);

                    this.current_ws = this.$el.parents(".ws-content");
                    this.$('.listsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        placeholder: 'Search ' + mapObj.label,
                        showicon: 'yes',
                        iconsource: 'campaigns'
                    });
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.dateRangeControl = this.$('#daterange').daterangepicker();
                    this.dateRangeControl.panel.find(".btnDone").click(_.bind(this.setDateRange, this));
                    this.dateRangeControl.panel.find("ul.ui-widget-content li").click(_.bind(this.setDateRangeLi, this));
                    this.$('input.checkinput').iCheck({
                        checkboxClass: 'checkinput'
                    });
                    this.$('input.checkinput').on('ifChecked', _.bind(function(event){
                        if(this.fromClick){
                            var selectedStates = $.map( this.$("input.checkinput:checked"), function( val, i ) {
                                return val.value;
                           }).join();
                           this.modelArray[0].id = selectedStates;
                           this.drawMultiCharts();
                      }
                    },this));
                     this.$('input.checkinput').on('ifUnchecked', _.bind(function(event){
                        if(this.fromClick){ 
                            var selectedStates = $.map( this.$("input.checkinput:checked"), function( val, i ) {
                                return val.value;
                           }).join();
                           this.modelArray[0].id = selectedStates;
                           this.drawMultiCharts();
                       }
                    },this));
                    if(this.row_obj && this.row_obj.toDate && this.row_obj.fromDate){
                        this.fromDate = this.row_obj.fromDate;
                        this.toDate = this.row_obj.toDate;
                        this.dateRange = this.row_obj.dateRange;
                        if(!this.dateRange){
                            var fromDate = moment($.trim(this.fromDate), 'MM-DD-YYYY');
                            var toDate = moment($.trim(this.toDate), 'MM-DD-YYYY');
                            this.$("#daterange").val(fromDate.format("M/D/YYYY")+" - "+toDate.format("M/D/YYYY"));
                        }
                        else {
                            var currentDate =  moment(new Date());
                            var fromDate =  null;
                            var toDate = moment(new Date());
                            if(this.dateRange==1){
                                fromDate = currentDate;                                                                                               
                            }
                            else if(this.dateRange==2){                               
                                fromDate = currentDate.subtract(1, 'days');                                                                
                            }
                            else if(this.dateRange==7){                                
                                fromDate = currentDate.subtract(7, 'days');                                                                
                            }
                            else if(this.dateRange==30){                                
                                fromDate = currentDate.subtract(30, 'days');                                                         
                            }                            
                            this.$("#daterange").val(fromDate.format("M/D/YYYY")+" - "+toDate.format("M/D/YYYY"));
                        }
                    }
                    this.loadRows();

                }, /*---------- Calender functions---------------*/
                showDatePicker: function () {
                    this.$('#clearcal').show();
                    return false;
                },
                hideDatePicker: function () {
                    this.$('#clearcal').hide();
                    this.fromDate = "";
                    this.toDate = "";
                    this.dateRange =0;
                    this.$('#daterange').val('');
                    this.showHideChartArea(false);
                    this.loadReports();
                },
                showDatePickerFromClick: function () {
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
                            this.fromDate = fromDate.format("MM-DD-YYYY");
                        }
                        if (toDate) {
                            this.toDate = toDate.format("MM-DD-YYYY");
                        } else {
                            this.toDate = fromDate.format("MM-DD-YYYY");
                        }
                        this.loadSummaryReports();
                    }
                },
                showSelected: function(setSelected){                    
                    if(typeof(setSelected)=="boolean"){
                        if(this.dateRange==1){                        
                           this.dateRangeControl.panel.find("ul.ui-widget-content .ui-daterangepicker-Today").addClass("ui-state-active");
                        }
                        else if(this.dateRange==2){                                                       
                            this.dateRangeControl.panel.find("ul.ui-widget-content .ui-daterangepicker-Yesterday").addClass("ui-state-active");
                        }
                        else if(this.dateRange==7){                                                                             
                            this.dateRangeControl.panel.find("ul.ui-widget-content .ui-daterangepicker-Last7days").addClass("ui-state-active");
                        }
                        else if(this.dateRange==30){                                                                      
                            this.dateRangeControl.panel.find("ul.ui-widget-content .ui-daterangepicker-Last30Days").addClass("ui-state-active");
                        }               
                    }
                    else{
                        setTimeout(_.bind(this.showSelected,this,true),100);
                    }
                    
                },
                setDateRangeLi: function (obj) {
                    var target = $.getObj(obj, "li");
                    if (!target.hasClass("ui-daterangepicker-dateRange")) {
                        var anchorTag = target.find("a");
                        if(anchorTag.attr("datestart")=="yesterday"){
                            this.dateRange = 2;
                        } else if(anchorTag.attr("datestart")=="today"){
                            this.dateRange = 1;
                        }
                        else if(anchorTag.attr("datestart")=="today-7days"){
                            this.dateRange = 7;
                        }
                        else if(anchorTag.attr("datestart")=="Today-30"){
                            this.dateRange = 30;
                        }
                        else{
                            this.dateRange = 0;
                        }
                        this.setDateRange();
                    }
                }, /*---------- End Calender functions---------------*/
                saveSettings: function () {
                    if (this.loadReport) {
                        this.loadReport = false;
                    }
                    else {
                        this.sub.saveSettings();
                    }
                },
                removeReport: function () {
                    this.$el.remove();
                    this.sub.removeMode(this.orderNo);
                    this.saveSettings();
                },
                loadRows: function () {
                    if (this.reportType == "landingpages") {
                        this.app.showLoading('Loading...', this.$el);
                        require(["landingpages/landingpage_row"], _.bind(function (lpRow) {
                            this.lpRow = lpRow;
                            this.app.showLoading(false, this.$el);
                            if (this.objects.length) {
                                this.loadLandingPages();
                            }
                        }, this));
                    } else if (this.reportType == "campaigns") {
                        this.app.showLoading('Loading...', this.$el);
                        require(["campaigns/campaign_row"], _.bind(function (campRow) {
                            this.campRow = campRow;
                            this.app.showLoading(false, this.$el);
                            if (this.objects.length) {
                                this.loadCampaigns();
                            }
                        }, this));
                    } else if (this.reportType == "autobots") {
                        this.app.showLoading('Loading...', this.$el);
                        require(["autobots/autobot"], _.bind(function (botRow) {
                            this.botRow = botRow;
                            this.app.showLoading(false, this.$el);
                            if (this.objects.length) {
                                this.loadAutobots();
                            }
                        }, this));
                    } else if (this.reportType == "webforms") {
                        this.app.showLoading('Loading...', this.$el);
                        require(["forms/formlistings_row"], _.bind(function (formRow) {
                            this.formRow = formRow;
                            this.app.showLoading(false, this.$el);
                            if (this.objects.length) {
                                this.loadSignupforms();
                            }
                        }, this));
                    } else if (this.reportType == "nurturetracks") {
                        this.app.showLoading('Loading...', this.$el);
                        require(["nurturetrack/track_row"], _.bind(function (trackRow) {
                            this.trackRow = trackRow;
                            //this.campRow = campRow;
                            this.app.showLoading(false, this.$el);
                            if (this.objects.length) {
                                this.loadNurtureTracks();
                            }
                        }, this));
                    }
                    else if (this.reportType == "targets") {
                        this.app.showLoading('Loading...', this.$el);
                        require(["target/views/recipients_target"], _.bind(function (targetRow) {
                            this.targetRow = targetRow;
                            this.app.showLoading(false, this.$el);
                            if (this.objects.length) {
                                this.loadTargets();
                            }
                        }, this));
                    }
                    else if (this.reportType == "tags") {
                        if (this.objects.length) {
                            this.loadTags();
                        }
                    } else if (this.reportType == "webstats") {
                        if (this.objects.length) {
                            this.loadWebStats();
                        }
                    }


                },
                openSelectionDialog: function () {
                    if (this.reportType == "landingpages") {
                        this.openLandingPagesDialog();
                    } else if (this.reportType == "campaigns") {
                        this.openCampaignsDialog();
                    } else if (this.reportType == "autobots") {
                        this.openAutobotsDialog();
                    } else if (this.reportType == "webforms") {
                        this.openSignupFormsDialog();
                    } else if (this.reportType == "nurturetracks") {
                        this.openNurtureTracksDialog();
                    } else if (this.reportType == "targets") {
                        this.openTargetsDialog();
                    } else if (this.reportType == "tags") {
                        this.openTagsDialog();
                    } else if (this.reportType == "webstats") {
                        this.openWebStatsDialog();
                    }

                },
                loadReports: function () {
                    this.$(".target-listing").removeClass("summary-chart");
                    if (this.reportType == "landingpages") {
                        //this.openLandingPagesDialog();
                    } else if (this.reportType == "campaigns") {
                        this.loadCampaigns();
                    } else if (this.reportType == "autobots") {
                        this.loadAutobots();
                    } else if (this.reportType == "webforms") {
                        //this.openSignupFormsDialog();
                    } else if (this.reportType == "nurturetracks") {
                        this.loadNurtureTracks();
                    } else if (this.reportType == "tags") {
                        this.loadTags();
                    } else if (this.reportType == "webstats") {
                        this.loadWebStats();
                    }

                },
                loadSummaryReports: function () {
                    this.$(".target-listing").addClass("summary-chart");
                    if (this.reportType == "landingpages") {
                        //this.openLandingPagesDialog();
                    } else if (this.reportType == "campaigns") {
                        this.loadCampaignsSummary();
                    } else if (this.reportType == "autobots") {
                        this.loadAutobotsSummary();
                    } else if (this.reportType == "webforms") {
                        //this.openSignupFormsDialog();
                    } else if (this.reportType == "nurturetracks") {
                        this.loadNurtureTrackSummary();
                    } else if (this.reportType == "tags") {
                        this.drawTagsInOne();
                    } else if (this.reportType == "webstats") {
                        this.createWebstats();
                    }
                    
                    this.saveSettings();

                },
                //////********************* Landing pages *****************************************//////
                loadLandingPages: function () {
                    this.app.showLoading("Loading selection...", this.$el);
                    var pageIds = this.objects.map(function (index) {
                        return index.id
                    }).join()
                    var URL = "/pms/io/publish/getLandingPages/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=get_csv";
                    var post_data = {pageId_csv: pageIds}
                    this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(data);
                        _.each(_json.pages[0], function (val) {
                            this.modelArray.push(new Backbone.Model(val[0]));
                        }, this);
                        this.createPages();
                    }, this))
                },
                openLandingPagesDialog: function () {
                    this.targetsModelArray = [];
                    var dialog_object = {title: 'Select Landing Pages',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        saveCall: '',
                        headerIcon: 'lppage'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Landing pages...", dialog.getBody());
                    require(["landingpages/selectpage"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, editable: this.editable});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.$el.find('#targets_grid').addClass('targets_grid_table');
                        _page.$el.find('.col-2 .template-container').addClass('targets_grid_table_right');
                        _page.$el.find('.step2-lists').css({'top': '0'});
                        _page.$el.find('.step2-lists span').css({'left': '70px'});
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                        _page.createRecipients(this.targetsModelArray);
                    }, this));
                },
                createPages: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width() * .5;
                        _grid.children().remove();
                        _.each(this.modelArray, function (val, index) {
                            var pageRow = new this.lpRow({model: val, sub: this, showCheckbox: true, maxWidth: _maxWidth});
                            _grid.append(pageRow.$el);
                        }, this);
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                            this.chartPage = new chart({page: this, legend: {position: 'none'}, chartArea: {width: "100%", height: "80%", left: '10%', top: '10%'}});
                            this.$(".col-2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width": "100%", "height": "280px"});
                            this.createPageChart();
                            this.app.showLoading(false, this.$(".cstats"));
                        }, this));
                    }
                },
                createPageChart: function () {
                    if (this.$(".checkedadded").length) {
                        this.$(".start-message").hide();
                        this.$(".col-2 .campaign-chart").show(this.$(".checkedadded").length);
                        var total_pages_selected = this.$(".checkedadded").length;
                        if (total_pages_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> landing pages selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> landing page selected');
                        }
                        this.chart_data = {submitCount: 0, viewCount: 0};
                        _.each(this.modelArray, function (val, index) {
                            if (this.$("[id='" + val.get("pageId.encode") + "']").hasClass("checkedadded")) {
                                this.chart_data['submitCount'] = this.chart_data['submitCount'] + parseFloat(val.get("submitCount"));
                                this.chart_data['viewCount'] = this.chart_data['viewCount'] + parseFloat(val.get("viewCount"));
                            }
                        }, this);

                        var _data = [
                            ['Action', 'Count'],
                            ['Page Views', this.chart_data["viewCount"]],
                            ['Submission', this.chart_data["submitCount"]]
                        ];
                        this.chartPage.createChart(_data);
                        _.each(this.chart_data, function (val, key) {
                            this.$(".col-2 ." + key).html(this.app.addCommas(val));
                        }, this);
                    }
                    else {
                        this.$(".start-message").show();
                        this.$(".col-2 .campaign-chart").hide();
                        this.$(".total-count").html('<strong class="badge">' + 0 + '</strong> landing pages selected');
                    }

                    this.saveSettings();
                },
                //////********************* Campaigns *****************************************//////
                loadCampaigns: function () {
                    this.app.showLoading("Loading selection...", this.$el);
                    var campNums = this.objects.map(function (index) {
                        return index.id
                    }).join()
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=list_csv";
                    var post_data = {campNum_csv: campNums};
                    this.modelArray = [];
                    this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(data);
                        _.each(_json.campaigns[0], function (val) {
                            this.modelArray.push(new Backbone.Model(val[0]));
                        }, this);
                        if(this.toDate && this.fromDate){
                            this.setDateRange();
                        }
                        else{
                            this.createCampaigns();
                        }
                    }, this))
                },
                openCampaignsDialog: function () {
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object = {title: 'Select Campaigns',
                        css: {"width": _width + "px", "margin-left": -(_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": _height + "px"},
                        saveCall: '',
                        headerIcon: 'campaigndlg'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Campaigns...", dialog.getBody());
                    require(["campaigns/selectcampaign"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, editable: this.editable, dialogHeight: _height - 103});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                    }, this));
                },
                createCampaigns: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width() * .5;
                        _grid.children().remove();
                        _.each(this.modelArray, function (val, index) {
                            var campRow = new this.campRow({model: val, sub: this, showCheckbox: true, maxWidth: _maxWidth});
                            _grid.append(campRow.$el);
                        }, this);
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                            this.chartPage = new chart({page: this, xAxis: {label: 'category'}, yAxis: {label: 'Count'},colors: ['#f6e408', '#27316a', '#559cd6', '#03d9a4']});
                            this.$(".col-2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width": "100%", "height": "280px"});
                            this.createCampaignChart();
                        }, this));
                    }
                },
                createCampaignChart: function () {
                    if (this.$(".checkedadded").length) {
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        this.$(".start-message").hide();
                        this.$(".col-2 .campaign-chart").show(this.$(".checkedadded").length);
                        var total_pages_selected = this.$(".checkedadded").length;
                        if (total_pages_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> campaigns selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> campaign selected');
                        }
                        var _campaigns = $.map(this.$(".checkedadded"), function (el) {
                            return el.id;
                        }).join(",");
                        this.chart_data = {bounceCount: 0, clickCount: 0, conversionCount: 0, facebookCount: 0, googlePlusCount: 0, linkedInCount: 0
                            , openCount: 0, pageViewsCount: 0, pendingCount: 0, pinterestCount: 0, sentCount: 0, supressCount: 0,
                            twitterCount: 0, unSubscribeCount: 0};
                        var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=stats";
                        var post_data = {campNums: _campaigns}
                        this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                            var camp_json = jQuery.parseJSON(data);
                            _.each(camp_json.campaigns[0], function (val) {
                                this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(val[0].bounceCount);
                                this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                                this.chart_data["conversionCount"] = this.chart_data["conversionCount"] + parseInt(val[0].conversionCount);
                                this.chart_data["facebookCount"] = this.chart_data["facebookCount"] + parseInt(val[0].facebookCount);
                                this.chart_data["googlePlusCount"] = this.chart_data["googlePlusCount"] + parseInt(val[0].googlePlusCount);
                                this.chart_data["linkedInCount"] = this.chart_data["linkedInCount"] + parseInt(val[0].linkedInCount);
                                this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                                this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);
                                this.chart_data["pendingCount"] = this.chart_data["pendingCount"] + parseInt(val[0].pendingCount);
                                this.chart_data["pinterestCount"] = this.chart_data["pinterestCount"] + parseInt(val[0].pinterestCount);
                                this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);
                                this.chart_data["supressCount"] = this.chart_data["supressCount"] + parseInt(val[0].supressCount);
                                this.chart_data["twitterCount"] = this.chart_data["twitterCount"] + parseInt(val[0].twitterCount);
                                this.chart_data["unSubscribeCount"] = this.chart_data["unSubscribeCount"] + parseInt(val[0].unSubscribeCount);
                            }, this);
                            var _data = [
                                ['Opens', this.chart_data["openCount"]],
                                ['Clicks', this.chart_data["clickCount"]],
                                ['Page Views', this.chart_data["pageViewsCount"]],
                                ['Conversions', this.chart_data["conversionCount"]]
                            ];

                            this.chartPage.createChart(_data);
                            this.app.showLoading(false, this.$(".cstats"));
                            _.each(this.chart_data, function (val, key) {
                                this.$(".col-2 ." + key).html(this.app.addCommas(val));
                            }, this);

                        }, this));
                    }
                    else {
                        this.$(".start-message").show();
                        this.$(".col-2 .campaign-chart").hide();
                        this.$(".total-count").html('<strong class="badge">' + 0 + '</strong> campaigns selected');
                    }
                    this.saveSettings();

                },
                loadCampaignsSummary: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        this.showHideChartArea(true);
                        var _grid = this.$("#_grid tbody");
                        _grid.children().remove();
                        var total_pages_selected = this.modelArray.length;
                        if (total_pages_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> campaigns selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> campaign selected');
                        }
                        _.each(this.modelArray, function (val, index) {
                            var campRow = new this.campRow({model: val, sub: this, showSummaryChart: true});
                            _grid.append(campRow.$el);
                            this.app.showLoading("Loading Summary Chart...", this.$("#chart-" + val.get("campNum.checksum")));
                            var URL = "/pms/io/campaign/getCampaignSummaryStats/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=summaryDailyBreakUp";
                            var campNum = val.get("campNum.encode");
                            var post_data = {campNum: campNum, toDate: this.toDate, fromDate: this.fromDate}
                            $.post(URL, post_data).done(_.bind(function (sJson) {
                                var summary_json = jQuery.parseJSON(sJson);
                                if (summary_json[0] == "err") {
                                    this.app.showAlert(summary_json[1], this.$el.parents(".ws-content.active"));
                                    return false;
                                }
                                if (summary_json.count !== "0") {
                                    require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                                        var sentData = [], openData = [], viewData = [], clickCount = [], socialData = [], bounceData = [];

                                        var categories = [];
                                        this.chart_data = {bounceCount: 0, clickCount: 0, pageViewsCount: 0
                                            , openCount: 0, sentCount: 0, socialCount: 0};
                                        _.each(summary_json.summaries[0], function (sVal) {
                                            categories.push(moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"));
                                            sentData.push(parseInt(sVal[0].sentCount));
                                            openData.push(parseInt(sVal[0].openCount));
                                            viewData.push(parseInt(sVal[0].pageViewsCount));
                                            clickCount.push(parseInt(sVal[0].clickCount));
                                            socialData.push(parseInt(sVal[0].socialCount));
                                            bounceData.push(parseInt(sVal[0].bounceCount));

                                            this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(sVal[0].bounceCount);
                                            this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(sVal[0].clickCount);
                                            this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(sVal[0].sentCount);
                                            this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(sVal[0].openCount);
                                            this.chart_data["socialCount"] = this.chart_data["socialCount"] + parseInt(sVal[0].socialCount);
                                            this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(sVal[0].pageViewsCount);
                                        }, this);
                                        var _data = [{"name": "Bounce", "data": bounceData}, {"name": "Social", "data": socialData}, {"name": "Click", "data": clickCount}, {"name": "View", "data": viewData}, {"name": "Open", "data": openData}, {"name": "Sent", "data": sentData}];
                                        this.chartPage = new chart({page: this, isStacked: true, xAxis: {label: 'category', categories: categories}, yAxis: {label: 'Count'}, colors: ['#f71a1a', '#03d9a4', '#27316a', '#559cd6', '#f6e408', '#dfdfdf']});
                                        this.$("#chart-" + val.get("campNum.checksum")).html(this.chartPage.$el);
                                        this.chartPage.$el.css({"width": "100%", "height": "250px"});
                                        this.chartPage.createChart(_data);
                                        _.each(this.chart_data, function (v, key) {
                                            this.$("#stats-" + val.get("campNum.checksum") + " .stats-panel ." + key).html(this.app.addCommas(v));
                                            this.$("#stats-" + val.get("campNum.checksum") + " .stats-panel ." + key+"Per").html((parseInt(v)/parseInt(val.get("sentCount")) * 100).toFixed(2) + "%");
                                        }, this);

                                    }, this));
                                }
                                else {
                                    this.$("#chart-" + val.get("campNum.checksum")).html('<div class="loading nodata"><p style="background:none">No data found for campaign <i>"' + val.get("name") + '"</i> </p></div>');
                                }
                            }, this));

                        }, this);

                    }                    
                },
                showHideChartArea: function (flag) {
                    if (this.reportType == "webstats") {
                        return false;
                    }
                    if (flag) {
                        this.$(".cols").removeClass("col1");
                        this.$(".col-2").hide();
                        this.$(".template-container").css({"overflow-y": 'hidden', height: 'auto'});
                    }
                    else {
                        this.$(".cols").addClass("col1");
                        this.$(".col-2").show();
                        this.$(".template-container").css({"overflow-y": 'auto', height: '420px'});
                        this.$(".parent-container").removeAttr("style");
                    }
                }
                ,
                //////********************* Autobots *****************************************//////
                loadAutobots: function () {
                    this.app.showLoading("Loading selection...", this.$el);
                    var botNums = this.objects.map(function (index) {
                        return index.id
                    }).join();
                    this.modelArray = [];
                    var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=get_csv";
                    var post_data = {botId_csv: botNums}
                    this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(data);
                        _.each(_json.autobots[0], function (val) {
                            this.modelArray.push(new Backbone.Model(val[0]));
                        }, this);
                        if(this.toDate && this.fromDate){
                            this.setDateRange();
                        }
                        else{
                            this.createAutobots();
                        }
                        
                    }, this))
                },
                openAutobotsDialog: function () {
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object = {title: 'Select Autobots',
                        css: {"width": _width + "px", "margin-left": -(_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": _height + "px"},
                        saveCall: '',
                        headerIcon: 'bot'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Autobots...", dialog.getBody());
                    require(["autobots/selectautobot"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, editable: this.editable, dialogHeight: _height - 103});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                    }, this));
                },
                createAutobots: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width() * .5;
                        _grid.children().remove();
                        _.each(this.modelArray, function (val, index) {
                            var botRow = new this.botRow({model: val, sub: this, page: this, showCheckbox: true, maxWidth: _maxWidth});
                            _grid.append(botRow.$el);
                        }, this);
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                            this.chartPage = new chart({page: this, xAxis: {label: 'category'}, yAxis: {label: 'Count'},colors: ['#f6e408', '#27316a', '#559cd6', '#03d9a4']});
                            this.$(".col-2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width": "100%", "height": "280px"});
                            this.createAutobotChart();
                        }, this));
                    }
                },
                createAutobotChart: function () {
                    if (this.$(".checkedadded").length) {
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        this.$(".start-message").hide();
                        this.$(".col-2 .campaign-chart").show(this.$(".checkedadded").length);
                        var total_pages_selected = this.$(".checkedadded").length;
                        if (total_pages_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> autobots selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> autobots selected');
                        }
                        var _bots = $.map(this.$(".checkedadded"), function (el) {
                            return el.id;
                        }).join(",");
                        this.chart_data = {bounceCount: 0, clickCount: 0, conversionCount: 0, facebookCount: 0, googlePlusCount: 0, linkedInCount: 0
                            , openCount: 0, pageViewsCount: 0, pendingCount: 0, pinterestCount: 0, sentCount: 0, supressCount: 0,
                            twitterCount: 0, unSubscribeCount: 0};
                        var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=mailBotStats_csv";
                        var post_data = {botId_csv: _bots}
                        this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                            var camp_json = jQuery.parseJSON(data);
                            _.each(camp_json.autobots[0], function (val) {
                                this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(val[0].bounceCount);
                                this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                                this.chart_data["conversionCount"] = this.chart_data["conversionCount"] + parseInt(val[0].conversionCount);
                                this.chart_data["facebookCount"] = this.chart_data["facebookCount"] + parseInt(val[0].facebookCount);
                                this.chart_data["googlePlusCount"] = this.chart_data["googlePlusCount"] + parseInt(val[0].googlePlusCount);
                                this.chart_data["linkedInCount"] = this.chart_data["linkedInCount"] + parseInt(val[0].linkedInCount);
                                this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                                this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);
                                this.chart_data["pendingCount"] = this.chart_data["pendingCount"] + parseInt(val[0].pendingCount);
                                this.chart_data["pinterestCount"] = this.chart_data["pinterestCount"] + parseInt(val[0].pinterestCount);
                                this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);
                                this.chart_data["supressCount"] = this.chart_data["supressCount"] + parseInt(val[0].supressCount);
                                this.chart_data["twitterCount"] = this.chart_data["twitterCount"] + parseInt(val[0].twitterCount);
                                this.chart_data["unSubscribeCount"] = this.chart_data["unSubscribeCount"] + parseInt(val[0].unSubscribeCount);
                            }, this);
                            var _data = [
                                ['Opens', this.chart_data["openCount"]],
                                ['Clicks', this.chart_data["clickCount"]],
                                ['Page Views', this.chart_data["pageViewsCount"]],
                                ['Conversions', this.chart_data["conversionCount"]]
                            ];

                            this.chartPage.createChart(_data);
                            this.app.showLoading(false, this.$(".cstats"));
                            _.each(this.chart_data, function (val, key) {
                                this.$(".col-2 ." + key).html(this.app.addCommas(val));                                
                            }, this);

                        }, this));
                    }
                    else {
                        this.$(".start-message").show();
                        this.$(".col-2 .campaign-chart").hide();
                        this.$(".total-count").html('<strong class="badge">' + 0 + '</strong> campaigns selected');
                    }
                    this.saveSettings();

                },
                loadAutobotsSummary: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        this.showHideChartArea(true);
                        var total_pages_selected = this.modelArray.length;
                        if (total_pages_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> autobots selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> autobots selected');
                        }
                        var _grid = this.$("#_grid tbody");
                        _grid.children().remove();
                        _.each(this.modelArray, function (val, index) {
                            var autobotRow = new this.botRow({model: val, page: this, sub: this, showSummaryChart: true});
                            _grid.append(autobotRow.$el);
                            this.app.showLoading("Loading Summary Chart...", this.$("#chart-" + val.get("botId.checksum")));
                            var URL = "/pms/io/campaign/getCampaignSummaryStats/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=summaryDailyBreakUp";
                            var campNum = val.get("actionData")[0]["campNum.encode"];
                            var post_data = {campNum: campNum, toDate: this.toDate, fromDate: this.fromDate}
                            $.post(URL, post_data).done(_.bind(function (sJson) {
                                var summary_json = jQuery.parseJSON(sJson);
                                if (summary_json[0] == "err") {
                                    this.app.showAlert(summary_json[1], this.$el.parents(".ws-content.active"));
                                    return false;
                                }
                                if (summary_json.count !== "0") {
                                    require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                                        var sentData = [], openData = [], viewData = [], clickCount = [], socialData = [], bounceData = [];
                                        var categories = [];
                                        this.chart_data = {bounceCount: 0, clickCount: 0, pageViewsCount: 0
                                            , openCount: 0, sentCount: 0, socialCount: 0};

                                        _.each(summary_json.summaries[0], function (sVal) {
                                            categories.push(moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"));
                                            sentData.push(parseInt(sVal[0].sentCount));
                                            openData.push(parseInt(sVal[0].openCount));
                                            viewData.push(parseInt(sVal[0].pageViewsCount));
                                            clickCount.push(parseInt(sVal[0].clickCount));
                                            socialData.push(parseInt(sVal[0].socialCount));
                                            bounceData.push(parseInt(sVal[0].bounceCount));
                                            //_data.push([moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"), parseInt(sVal[0].sentCount), parseInt(sVal[0].openCount), parseInt(sVal[0].pageViewsCount), parseInt(sVal[0].clickCount), parseInt(sVal[0].socialCount), parseInt(sVal[0].bounceCount), ''])
                                            this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(sVal[0].bounceCount);
                                            this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(sVal[0].clickCount);
                                            this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(sVal[0].sentCount);
                                            this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(sVal[0].openCount);
                                            this.chart_data["socialCount"] = this.chart_data["socialCount"] + parseInt(sVal[0].socialCount);
                                            this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(sVal[0].pageViewsCount);
                                        }, this);

                                        var _data = [{"name": "Bounce", "data": bounceData}, {"name": "Social", "data": socialData}, {"name": "Click", "data": clickCount}, {"name": "View", "data": viewData}, {"name": "Open", "data": openData}, {"name": "Sent", "data": sentData}];
                                        this.chartPage = new chart({page: this, isStacked: true, xAxis: {label: 'category', categories: categories}, yAxis: {label: 'Count'}, colors: ['#f71a1a', '#03d9a4', '#27316a', '#559cd6', '#f6e408', '#dfdfdf']});

                                        this.$("#chart-" + val.get("botId.checksum")).html(this.chartPage.$el);
                                        this.chartPage.$el.css({"width": "100%", "height": "250px"});
                                        this.chartPage.createChart(_data);
                                        _.each(this.chart_data, function (v, key) {
                                            this.$("#stats-" + val.get("botId.checksum") + " .stats-panel ." + key).html(this.app.addCommas(v));
                                            this.$("#stats-" + val.get("botId.checksum") + " .stats-panel ." + key+"Per").html((parseInt(v)/parseInt(val.get("sentCount")) * 100).toFixed(2) + "%");
                                        }, this);
                                    }, this));
                                }
                                else {
                                    this.$("#chart-" + val.get("botId.checksum")).html('<div class="loading nodata"><p style="background:none">No data found for autobot <i>"' + val.get("label") + '"</i> </p></div>');
                                }
                            }, this));

                        }, this);

                    }
                },
                //////********************* Signup Forms  *****************************************//////
                loadSignupforms: function () {

                },
                openSignupFormsDialog: function () {
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object = {title: 'Select Signup Froms',
                        css: {"width": _width + "px", "margin-left": -(_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": _height + "px"},
                        saveCall: '',
                        headerIcon: 'dlgformwizard'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Signup Forms...", dialog.getBody());
                    require(["forms/selectform"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, editable: this.editable, dialogHeight: _height - 103});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                    }, this));
                },
                createSignupForms: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width() * .5;
                        _grid.children().remove();
                        _.each(this.modelArray, function (val, index) {
                            var formRow = new this.formRow({model: val, sub: this, page: this, showCheckbox: true, maxWidth: _maxWidth});
                            _grid.append(formRow.$el);
                        }, this);
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                            this.chartPage = new chart({page: this, legend: {position: 'none'}, chartArea: {width: "100%", height: "80%", left: '10%', top: '10%'}});
                            this.$(".col-2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width": "100%", "height": "280px"});
                            this.createSignupFormChart();
                            this.app.showLoading(false, this.$(".cstats"));
                        }, this));
                    }
                },
                createSignupFormChart: function () {
                    if (this.$(".checkedadded").length) {
                        this.$(".start-message").hide();
                        this.$(".col-2 .campaign-chart").show(this.$(".checkedadded").length);
                        var total_pages_selected = this.$(".checkedadded").length;
                        if (total_pages_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> signup forms selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_pages_selected + '</strong> signup form selected');
                        }
                        this.chart_data = {submitCount: 0};
                        _.each(this.modelArray, function (val, index) {
                            if (this.$("[id='" + val.get("formId.encode") + "']").hasClass("checkedadded")) {
                                this.chart_data['submitCount'] = this.chart_data['submitCount'] + parseFloat(val.get("submitCount"));
                            }
                        }, this);

                        var _data = [
                            ['Action', 'Count'],
                            ['Submission', this.chart_data["submitCount"]]
                        ];
                        this.chartPage.createChart(_data);
                        _.each(this.chart_data, function (val, key) {
                            this.$(".col-2 ." + key).html(this.app.addCommas(val));
                        }, this);
                    }
                    else {
                        this.$(".start-message").show();
                        this.$(".col-2 .campaign-chart").hide();
                        this.$(".total-count").html('<strong class="badge">' + 0 + '</strong> signup forms selected');
                    }
                    this.saveSettings();

                },
                //////********************* Nurture Tracks  *****************************************//////
                loadNurtureTracks: function () {
                    this.app.showLoading("Loading selection...", this.$el);
                    this.modelArray = [];
                    this.app.showLoading("Loading Nurture Track...", this.$el);
                    var URL = "/pms/io/trigger/getNurtureData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&trackId=" + this.objects[0].id + "&type=get";
                    jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        var _json = jQuery.parseJSON(xhr.responseText);
                        this.app.showLoading(false, this.$el);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.modelArray.push(new Backbone.Model(_json));                        
                        if(this.toDate && this.fromDate){
                            this.setDateRange();
                        }
                        else{
                            this.createNurtureTrack();
                        }
                    }, this))
                },
                openNurtureTracksDialog: function () {
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object = {title: 'Select Nurture Tracks',
                        css: {"width": _width + "px", "margin-left": -(_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": _height + "px"},
                        saveCall: '',
                        headerIcon: 'nurturedlg'
                    }
                    //dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;                      
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Nurture Tracks...", dialog.getBody());
                    require(["nurturetrack/select_single_track"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, editable: this.editable, dialogHeight: _height - 103});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                    }, this));
                },
                createNurtureTrack: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        if (this.modelArray.length == 1) {
                            var msgCountText = this.modelArray[0].get("msgCount") == "1" ? "message" : "messages";
                            this.$(".total-count").html('<strong class="badge">' + this.modelArray[0].get("name") + '</strong> nurture track selected having <b>' + this.modelArray[0].get("msgCount") + ' ' + msgCountText + '</b>');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">0</strong> nurture tracks selected');
                        }
                        if (this.modelArray[0].get("messages")) {
                            this.getCampaignsFromNurtureTrack(this.modelArray[0].get("messages")[0]);
                        }
                        else {
                            this.app.showLoading("Loading Nurture Track Messages...", this.$(".parent-container"));
                            var URL = "/pms/io/trigger/getNurtureData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&trackId=" + this.modelArray[0].get("trackId.encode") + "&type=get";
                            jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                                var _json = jQuery.parseJSON(xhr.responseText);
                                this.app.showLoading(false, this.$(".parent-container"));
                                if (this.app.checkError(_json)) {
                                    return false;
                                }
                                if (_json.messages) {
                                    this.getCampaignsFromNurtureTrack(_json.messages[0]);
                                }
                            }, this))
                        }
                    }
                },
                getCampaignsFromNurtureTrack: function (messages, loadCampaigns) {
                    var _grid = this.$("#_grid tbody");
                    _grid.children().remove();
                    var _maxWidth = this.$(".col1 .template-container").width() * .5;
                    this.checkSumArray = [];                    
                    var campNums = $.map(messages, _.bind(function (el) {
                        this.checkSumArray.push(el[0]["campNum.checksum"]);
                        return el[0]["campNum.encode"];
                    },this)).join(",");
                    this.app.showLoading("Loading Messages...", this.$(".parent-container"));
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=list_csv";
                    var post_data = {campNum_csv: campNums};
                    this.campArray = [];
                    this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(data);
                        this.app.showLoading(false, this.$(".parent-container"));
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        _.each(_json.campaigns[0], function (val) {
                            this.campArray.push(new Backbone.Model(val[0]));
                        }, this);
                        var order_no = 1;
                        for(var i=0;i<this.checkSumArray.length;i++){
                            _.each(this.campArray, function (val, index) {
                                if(this.checkSumArray[i]==val.get("campNum.checksum")){
                                    val.set("trackId.encode", this.modelArray[0].get("trackId.encode"));
                                    val.set("order", order_no);
                                    order_no = order_no + 1;
                                    var msgRow = new this.trackRow({model: val, sub: this, showMessage: true, maxWidth: _maxWidth});
                                    _grid.append(msgRow.$el);
                                }                                
                            }, this);
                        }
                        if(loadCampaigns){
                            this.loadNTSummary();
                        }
                        else{
                            this.app.showLoading("Creating Chart...", this.$(".cstats"));
                            require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                                this.chartPage = new chart({page: this, xAxis: {label: 'category'}, yAxis: {label: 'Count'},colors: ['#f6e408', '#27316a', '#559cd6', '#03d9a4']});
                                this.$(".col-2 .campaign-chart").html(this.chartPage.$el);
                                this.chartPage.$el.css({"width": "100%", "height": "280px"});
                                this.createNurtureTrackChart();
                            }, this));
                        }

                    }, this));
                },
                createNurtureTrackChart: function () {
                    if (this.$(".checkedadded").length) {
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        this.$(".start-message").hide();
                        this.$(".col-2 .campaign-chart").show(this.$(".checkedadded").length);
                        var _campaigns = $.map(this.$(".checkedadded"), function (el) {
                            return el.id;
                        }).join(",");
                        this.chart_data = {bounceCount: 0, clickCount: 0, conversionCount: 0, facebookCount: 0, googlePlusCount: 0, linkedInCount: 0
                            , openCount: 0, pageViewsCount: 0, pendingCount: 0, pinterestCount: 0, sentCount: 0, supressCount: 0,
                            twitterCount: 0, unSubscribeCount: 0};
                        var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=stats";
                        var post_data = {campNums: _campaigns}
                        this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                            var camp_json = jQuery.parseJSON(data);
                            _.each(camp_json.campaigns[0], function (val) {
                                this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(val[0].bounceCount);
                                this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                                this.chart_data["conversionCount"] = this.chart_data["conversionCount"] + parseInt(val[0].conversionCount);
                                this.chart_data["facebookCount"] = this.chart_data["facebookCount"] + parseInt(val[0].facebookCount);
                                this.chart_data["googlePlusCount"] = this.chart_data["googlePlusCount"] + parseInt(val[0].googlePlusCount);
                                this.chart_data["linkedInCount"] = this.chart_data["linkedInCount"] + parseInt(val[0].linkedInCount);
                                this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                                this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);
                                this.chart_data["pendingCount"] = this.chart_data["pendingCount"] + parseInt(val[0].pendingCount);
                                this.chart_data["pinterestCount"] = this.chart_data["pinterestCount"] + parseInt(val[0].pinterestCount);
                                this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);
                                this.chart_data["supressCount"] = this.chart_data["supressCount"] + parseInt(val[0].supressCount);
                                this.chart_data["twitterCount"] = this.chart_data["twitterCount"] + parseInt(val[0].twitterCount);
                                this.chart_data["unSubscribeCount"] = this.chart_data["unSubscribeCount"] + parseInt(val[0].unSubscribeCount);
                            }, this);
                            var _data = [
                                ['Opens', this.chart_data["openCount"]],
                                ['Clicks', this.chart_data["clickCount"]],
                                ['Page Views', this.chart_data["pageViewsCount"]],
                                ['Conversions', this.chart_data["conversionCount"]]
                            ];

                            this.chartPage.createChart(_data);
                            this.app.showLoading(false, this.$(".cstats"));
                            _.each(this.chart_data, function (val, key) {
                                this.$(".col-2 ." + key).html(this.app.addCommas(val));
                            }, this);

                        }, this));
                    }
                    else {
                        this.$(".start-message").show();
                        this.$(".col-2 .campaign-chart").hide();
                        this.$(".total-count").html('<strong class="badge">' + 0 + '</strong> message selected');
                    }
                    this.saveSettings();
                },                
                loadNurtureTrackSummary:function(){
                    if (this.campArray){
                        this.loadNTSummary();
                    }
                    else{
                        if (this.modelArray[0].get("messages")) {
                            this.getCampaignsFromNurtureTrack(this.modelArray[0].get("messages")[0],true);
                        }
                    }
                },
                loadNTSummary: function () {
                    if (this.campArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        this.showHideChartArea(true);
                        if (this.modelArray.length == 1) {
                            var msgCountText = this.modelArray[0].get("msgCount") == "1" ? "message" : "messages";
                            this.$(".total-count").html('<strong class="badge">' + this.modelArray[0].get("name") + '</strong> nurture track selected having <b>' + this.modelArray[0].get("msgCount") + ' ' + msgCountText + '</b>');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">0</strong> nurture tracks selected');
                        }
                        var _grid = this.$("#_grid tbody");
                        _grid.children().remove();
                        var order_no = 1;
                        for(var i=0;i<this.checkSumArray.length;i++){
                        _.each(this.campArray, function (val, index) {
                            if(this.checkSumArray[i]==val.get("campNum.checksum")){
                                var msgRow = new this.trackRow({model: val, sub: this, showSummaryChart: true});
                                _grid.append(msgRow.$el);
                                this.app.showLoading("Loading Summary Chart...", this.$("#chart-" + val.get("campNum.checksum")));
                                var URL = "/pms/io/campaign/getCampaignSummaryStats/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=summaryDailyBreakUp";
                                var campNum = val.get("campNum.encode");
                                var post_data = {campNum: campNum, toDate: this.toDate, fromDate: this.fromDate}
                                $.post(URL, post_data).done(_.bind(function (sJson) {
                                    var summary_json = jQuery.parseJSON(sJson);
                                    if (summary_json[0] == "err") {
                                        this.app.showAlert(summary_json[1], this.$el.parents(".ws-content.active"));
                                        return false;
                                    }
                                    if (summary_json.count !== "0") {
                                        require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                                            var sentData = [], openData = [], viewData = [], clickCount = [], socialData = [], bounceData = [];
                                            var categories = [];

                                            this.chart_data = {bounceCount: 0, clickCount: 0, pageViewsCount: 0
                                                , openCount: 0, sentCount: 0, socialCount: 0};

                                            _.each(summary_json.summaries[0], function (sVal) {
                                                categories.push(moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"));
                                                sentData.push(parseInt(sVal[0].sentCount));
                                                openData.push(parseInt(sVal[0].openCount));
                                                viewData.push(parseInt(sVal[0].pageViewsCount));
                                                clickCount.push(parseInt(sVal[0].clickCount));
                                                socialData.push(parseInt(sVal[0].socialCount));
                                                bounceData.push(parseInt(sVal[0].bounceCount));
                                                //_data.push([moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"), parseInt(sVal[0].sentCount), parseInt(sVal[0].openCount), parseInt(sVal[0].pageViewsCount), parseInt(sVal[0].clickCount), parseInt(sVal[0].socialCount), parseInt(sVal[0].bounceCount), '']);
                                                this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(sVal[0].bounceCount);
                                                this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(sVal[0].clickCount);
                                                this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(sVal[0].sentCount);
                                                this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(sVal[0].openCount);
                                                this.chart_data["socialCount"] = this.chart_data["socialCount"] + parseInt(sVal[0].socialCount);
                                                this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(sVal[0].pageViewsCount);
                                            }, this);
                                            var _data = [{"name": "Bounce", "data": bounceData}, {"name": "Social", "data": socialData}, {"name": "Click", "data": clickCount}, {"name": "View", "data": viewData}, {"name": "Open", "data": openData}, {"name": "Sent", "data": sentData}];
                                            this.chartPage = new chart({page: this, isStacked: true, xAxis: {label: 'category', categories: categories}, yAxis: {label: 'Count'}, colors: ['#f71a1a', '#03d9a4', '#27316a', '#559cd6', '#f6e408', '#dfdfdf']});

                                            //this.chartPage = new chart({page: this, legend: {position: "none"}, isStacked: true, vAxisLogScale: vAxisLogScale,colors:['#dfdfdf','#f6e408','#559cd6','#27316a','#03d9a4','#f71a1a']});
                                            this.$("#chart-" + val.get("campNum.checksum")).html(this.chartPage.$el);
                                            this.chartPage.$el.css({"width": "100%", "height": "250px"});
                                            this.chartPage.createChart(_data);
                                            _.each(this.chart_data, function (v, key) {
                                                this.$("#stats-" + val.get("campNum.checksum") + " .stats-panel ." + key).html(this.app.addCommas(v));
                                                this.$("#stats-" + val.get("campNum.checksum") + " .stats-panel ." + key+"Per").html((parseInt(v)/parseInt(val.get("sentCount")) * 100).toFixed(2) + "%");
                                            }, this);
                                        }, this));
                                    }
                                    else {
                                        this.$("#chart-" + val.get("campNum.checksum")).html('<div class="loading nodata"><p style="background:none">No data found for <i>Message ' + val.get("order") + '</i></p></div>');
                                    }
                                    order_no = order_no + 1;
                                }, this));
                             }
                        }, this);
                       }   
                    }

                },
                //////********************* Targets  *****************************************//////
                loadTargets: function () {
                    this.app.showLoading("Loading selection...", this.$el);
                    var targetsNums = this.objects.map(function (index) {
                        return index.id
                    }).join()
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=list_csv";
                    var post_data = {filterNumber_csv: targetsNums}
                    this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(data);
                        _.each(_json.filters[0], function (val) {
                            this.modelArray.push(new Backbone.Model(val[0]));
                        }, this);
                        this.createTargets();
                    }, this))
                },
                openTargetsDialog: function () {
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object = {title: 'Select Targets',
                        css: {"width": _width + "px", "margin-left": -(_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": _height + "px"},
                        saveCall: '',
                        headerIcon: 'targetw'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Targets...", dialog.getBody());
                    require(["target/select_target"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, editable: this.editable, dialogHeight: _height - 103});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                    }, this));
                },
                createTargets: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width() * .5;
                        _grid.children().remove();
                        _.each(this.modelArray, function (val, index) {
                            var targetRow = new this.targetRow({model: val, sub: this, showCheckbox: true, maxWidth: _maxWidth});
                            _grid.append(targetRow.$el);
                        }, this);
                        //this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/"], _.bind(function (chart) {
                            this.chartPage = new chart({page: this, legend: {position: 'none'}, chartArea: {width: "100%", height: "80%", left: '10%', top: '10%'}});
                            this.$(".col-2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width": "100%", "height": "280px"});
                            //this.createCampaignChart();                                                        
                        }, this));
                    }
                    this.saveSettings();
                }
                //////********************* Tags  *****************************************//////
                ,
                loadTags: function () {
                    if (this.modelArray.length && this.$(".tagslist ul").children().length) {
                        this.$("#copy-camp-listing").show();
                        this.$(".tags-charts").remove();
                        this.createTags();
                    } else {                        
                        this.$("#copy-camp-listing").show();
                        this.$(".tags-charts").remove();
                        this.$(".table-area .template-container").css("height","");
                        this.app.showLoading("Loading selection...", this.$el);
                        var tags_array = this.objects.map(function (index) {
                            return index.id
                        });
                        this.modelArray = [];
                        var post_data = {};
                        var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=subscriberTagCountList";
                        this.states_call = $.post(URL, post_data).done(_.bind(function (data) {
                            this.app.showLoading(false, this.$el);
                            var _json = jQuery.parseJSON(data);
                            _.each(_json.tagList[0], function (val) {
                                if (tags_array.indexOf(val[0].tag) > -1) {
                                    this.modelArray.push(new Backbone.Model(val[0]));
                                }
                            }, this);             
                            this.createTags();
                            /*if(this.toDate && this.fromDate){
                                this.setDateRange();
                            }
                            else{
                                this.createTags();
                            }*/
                            
                        }, this))
                    }
                },
                openTagsDialog: function () {
                    var _width = 1200;
                    var _height = 425;
                    var dialog_object = {title: 'Select Tags',
                        css: {"width": _width + "px", "margin-left": -(_width / 2) + "px", "top": "10%"},
                        bodyCss: {"min-height": _height + "px"},
                        saveCall: '',
                        headerIcon: 'tagw'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Tags...", dialog.getBody());
                    require(["tags/select_tags"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, dialogHeight: _height - 103});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                    }, this));
                },
                createTags: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$(".tagslist").show().parent().parent().css("background", "#eaf4f9");
                        this.$(".tags-charts").remove();
                        var _grid = this.$(".tagslist ul");

                        _grid.children().remove();
                        _.each(this.modelArray, function (val, key) {
                            var tagLi = $('<li class="action" id="row_' + key + '" checksum="' + this.app.encodeHTML(val.get("tag")) + '"><a class="tag"><span>' + this.app.encodeHTML(val.get("tag")) + '</span><i  class="icon percent showtooltip" data-name ="' + this.app.encodeHTML(val.get("tag")) + '" title="Click to see responsiveness of this tag" ></i><strong class="badge">' + val.get("subCount") + '</strong></a> </li>');
                            _grid.append(tagLi);
                        }, this);
                        _grid.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                                                
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                            this.chartPage = new chart({page: this, xAxis: {label: 'category'}, yAxis: {label: 'Count'}});
                            this.$(".col-2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width": "100%", "height": "280px"});
                            var loadFirstTime = this.loadReport;
                            this.createTagsChart();
                            if (this.toDate && this.fromDate) {
                                this.loadReport = loadFirstTime;
                                this.setDateRange();                                
                            }
                            else{
                                this.$(".chart-types,.tagsexpand").hide();
                                this.$(".tagsexpand").attr("data-expand","0").html("View Growth Stats").remove("stats-hide");
                            }
                        }, this));
                        
                    }
                },
                showPercentDiv: function (ev) {
                    var target = $(ev.target);
                    var tag = target.data('name');

                    if ($('.percent_stats').length > 0)
                        this.$('.percent_stats .pstats').remove();
                    var that = this;
                    var offset = target.offset();

                    if (!$('body > .percent_stats').length) {
                        $("body").append('<div class="percent_stats" style="position:absolute"></div>');
                    }
                    $('.percent_stats').css({left: offset.left - 4, top: offset.top + 10, "z-index": 999});

                    that.showLoadingWheel(true, $('.percent_stats'));
                    var bms_token = that.app.get('bms_token');
                    var URL = "/pms/io/user/getTagPopulation/?BMS_REQ_TK=" + bms_token + "&tag=" + tag + "&type=stats";

                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (that.app.checkError(data)) {
                            return false;
                        }
                        var percentDiv = " <div class='pstats' style='display:block'><ul><li class='openers'><strong>" + that.app.addCommas(data.openers) + "<sup>%</sup></strong><span>Openers</span></li>";
                        percentDiv = percentDiv + "<li class='clickers'><strong>" + that.app.addCommas(data.clickers) + "<sup>%</sup></strong><span>Clickers</span></li>";
                        percentDiv = percentDiv + "<li class='visitors'><strong>" + that.app.addCommas(data.pageviewers) + "<sup>%</sup></strong><span>Visitors</span></li></ul></div>";
                        that.showLoadingWheel(false, target);


                        $('.percent_stats').append(percentDiv);
                        $('.percent_stats .pstats').addClass('left-side');

                    });
                },
                showLoadingWheel: function (isShow, target) {
                    if (isShow)
                        target.append("<div class='pstats' style='display:block; background:#01AEEE;'><div class='loading-wheel right' style='margin-left:-10px;margin-top: -5px;position: inherit!important;'></div></div></div>")
                    else {
                        var ele = target.find(".loading-wheel");
                        ele.remove();
                    }
                },
                createTagsChart: function () {
                    if (this.modelArray.length) {
                        this.app.showLoading("Creating Chart...", this.$(".cstats"));
                        this.$(".start-message").hide();
                        this.$(".col-2 .campaign-chart").show(this.$(".checkedadded").length);
                        var total_selected = this.modelArray.length;
                        if (total_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_selected + '</strong> tags selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_selected + '</strong> tag selected');
                        }
                        this.chart_data = {subCount: 0};
                        var _data = [
                        ];
                        var liWidth = 100 / this.modelArray.length;
                        this.$("ul.socpc li").remove();
                        _.each(this.modelArray, function (val) {
                            _data.push([val.get("tag"), parseInt(val.get("subCount"))]);
                            this.$("ul.socpc").append($('<li class="clr3" style="width:' + liWidth + '%"><span>' + this.app.encodeHTML(val.get("tag")) + ' <strong class="tagCount">' + val.get("subCount") + '</strong></span></li>'))
                        }, this);
                        this.chartPage.createChart(_data);
                        this.app.showLoading(false, this.$(".cstats"));
                    }
                    else {
                        this.$(".start-message").show();
                        this.$(".col-2 .campaign-chart").hide();
                        this.$(".total-count").html('<strong class="badge">' + 0 + '</strong> campaigns selected');
                    }
                    this.saveSettings();
                },
                expandCollapseTags:function(obj){
                    var linkObj = $.getObj(obj, "a");
                    if(linkObj.attr("data-expand")=="0"){
                        this.loadTagsSummary();
                        linkObj.attr("data-expand","1");
                        linkObj.html("Hide Growth Stats").attr("data-original-title","Click to hide growth details").addClass("stats-hide");
                    }
                    else{
                        this.drawTagsInOne();
                        linkObj.attr("data-expand","0");
                        linkObj.html("View Growth Stats").attr("data-original-title","Click to view growth details").removeClass("stats-hide");
                    }
                },
                loadTagsSummary: function () {
                    if (this.modelArray.length) {
                        this.$(".add-msg-report").hide();
                        this.$("#copy-camp-listing").hide();
                        var chartsDiv = $("<div class='tags-charts summary-chart'> </div>");
                        if (this.$(".tags-charts").length) {
                            this.$(".tags-charts").remove();
                        }
                        this.$(".parent-container").append(chartsDiv);
                        var total_selected = this.modelArray.length;
                        if (total_selected > 1) {
                            this.$(".total-count").html('<strong class="badge">' + total_selected + '</strong> tags selected');
                        }
                        else {
                            this.$(".total-count").html('<strong class="badge">' + total_selected + '</strong> tag selected');
                        }
                        _.each(this.modelArray, function (val, index) {

                            var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=subscriberTagStatDayByDay";
                            var tag = val.get("tag");
                            var post_data = {tag: tag, toDate: this.toDate, fromDate: this.fromDate}

                            var tagClass = tag.replace(/ /g, "_").replace(/</g, "_").replace(/>/g, "_").replace(/\//g, "_").replace(/\\/g, "_");
                            chartsDiv.append("<div class='tag-chart'><div class='tag-header'>" + tag + "</div><div class='tag-area " + tagClass + "'></div><div class=\"stats-panel\"><div><ul class=\"socpc\"></ul><div class=\"clearfix\"></div></div></div></div>");
                            this.app.showLoading("Loading Summary Chart...", this.$("." + tagClass));
                            $.post(URL, post_data).done(_.bind(function (sJson) {
                                var summary_json = jQuery.parseJSON(sJson);
                                if (summary_json[0] == "err") {
                                    this.app.showAlert(summary_json[1], this.$el.parents(".ws-content.active"));
                                    return false;
                                }
                                if (summary_json.count && summary_json.count !== "0") {
                                    require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                                        var _data = [
                                            ['Genre', 'Decrease', 'Increase', {role: 'annotation'}]
                                        ];

                                        var increaseCount = [], decreaseCount = [];
                                        var categories = [];

                                        this.chart_data = {addCount: 0, removeCount: 0};
                                        _.each(summary_json.stats[0], function (sVal) {
                                            categories.push(moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"));
                                            increaseCount.push(parseInt(sVal[0].addCount));
                                            decreaseCount.push(parseInt(sVal[0].removeCount));
                                            //_data.push([moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"), parseInt(sVal[0].removeCount), parseInt(sVal[0].addCount), ''])
                                            this.chart_data['addCount'] = this.chart_data['addCount'] + parseInt(sVal[0].addCount);
                                            this.chart_data['removeCount'] = this.chart_data['removeCount'] + parseInt(sVal[0].removeCount);
                                        }, this);
                                        var _data = [{"name": "Decrease", "data": decreaseCount}, {"name": "Increase", "data": increaseCount}];
                                        this.chartPage = new chart({page: this, isStacked: true, xAxis: {label: 'category', categories: categories}, yAxis: {label: 'Count'}, colors: ['#f71a1a', '#97d61d']});
                                        this.$("." + tagClass).html(this.chartPage.$el);
                                        var liHTML = '<li class="clr6" style="width:33.33%"><span>Increase <strong class="Increase">' + this.app.addCommas(this.chart_data['addCount']) + '</strong></span></li>';
                                        liHTML += '<li class="clr7" style="width:33.33%"><span>Decrease <strong class="Decrease">' + this.app.addCommas(this.chart_data['removeCount']) + '</strong></span></li>';
                                        liHTML += '<li class="clr1" style="width:33.33%"><span>Net Growth <strong class="growth">' + this.app.addCommas(this.chart_data['addCount'] - this.chart_data['removeCount']) + '</strong></span></li>';
                                        this.$(".tag-area." + tagClass).next().find(".socpc").html(liHTML);
                                        this.chartPage.$el.css({"width": "100%", "height": "250px"});
                                        this.chartPage.createChart(_data);
                                    }, this));
                                }
                                else {
                                    this.$("." + tagClass).html('<div class="loading nodata"><p style="background:none">No data found for <i>Tag "' + tag + '"</i></p></div>');
                                }

                            }, this));

                        }, this);

                    }
                },
                drawTagsInOne: function(){
                     this.dataArray = [];                    
                     this.callsData  = this.modelArray.map(function (val) {
                            return val.get("tag");
                     });
                     for (var c = 0; c < this.callsData.length; c++) {                        
                        this.callTagStats(this.callsData[c]);
                     }                     
                },
                callTagStats: function(tag){
                    var bms_token = this.app.get('bms_token');
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + bms_token + "&type=subscriberTagStatDayByDay";
                    var post_data = {tag: tag, toDate: this.toDate, fromDate: this.fromDate}
                    this.app.showLoading("Loading Data...", this.$el);
                     $.post(URL, post_data).done(_.bind(function (sJson) {                         
                        var tagsData = jQuery.parseJSON(sJson);
                        if (this.app.checkError(tagsData)) {
                            return false;
                        }                        
                        var data = [];
                        if(tagsData && tagsData.stats){
                            $.each(tagsData.stats[0],function(key,val){
                                    var dateValues = val[0].reportDate.split('-');                                                                                                
                                    data.push([Date.UTC(parseInt(dateValues[0]), parseInt(dateValues[1])-1, parseInt(dateValues[2])), parseInt(val[0].addCount, 10)]);	
                            })
                        }
                        this.dataArray.push([tag,data]);
                        if(this.callsData.length==this.dataArray.length){
                            this.app.showLoading(false, this.$el);  
                            this.combineTagsChart();
                        }
                        
                    }, this));
                },
                combineTagsChart: function(chartType){
                   var dateLabelObject = this.getDateText(this.fromDate, this.toDate);
                   this.$(".add-msg-report").hide();
                   this.$(".tagslist").show().parent().parent().css("background", "#eaf4f9");
                   this.$("#copy-camp-listing").show();
                   this.showHideChartArea(false);                   
                   this.$(".tags-charts").remove();
                   this.$(".target-listing").removeClass("summary-chart");
                   this.$(".table-area .template-container").css("height","");
                   this.$(".chart-types,.tagsexpand").show();
                   
                   var chart_type = chartType ? chartType:'column';
                   this.app.showLoading("Loading Chart...", this.$el);
                   var that = this;
                   require(["reports/webstats"], _.bind(function (chart) {
                       this.chartPage = new chart({page: this});
                       this.app.showLoading(false, this.$el);                       
                       var options ={
                                    chart: {                                                  
                                        backgroundColor: "#f4f9fc"
                                    },                                            
                                    title: {
                                        text: '',
                                        style: {
                                            "color": "#02afef",
                                            "fontSize": "20px"
                                        }
                                    },
                                    subtitle: {                                                
                                        text: dateLabelObject.label,
                                        style: {
                                            "color": "#999"
                                        }
                                    },
                                    xAxis: {
                                        type: 'datetime',
                                        tickInterval:  dateLabelObject.days<=10?24 * 3600 * 1000 : 7 * 24 * 3600 * 1000,
                                        tickLength:0,
                                        dateTimeLabelFormats: {
                                            week :'%e %b',
                                            day :'%e %b'
                                        },
                                        title: {
                                            text: '',  
                                            margin:30,
                                            style: {
                                                "color": "#4d759e"
                                            }
                                        },
                                        labels: {                                                                                                       
                                            style: {
                                                fontSize: '12px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    },
                                    yAxis: [],
                                    legend: {
                                        align:'center',
                                        verticalAlign: 'top',
                                        y:20
                                    },
                                    tooltip: {
                                        backgroundColor:"#2f93e5",
                                        style: {color: "#fff"},
                                        formatter: function () {
                                            var tooltip_rect = that.$('.highcharts-tooltip path:nth-child(4)');
                                            tooltip_rect.attr("fill",this.series.color);
                                            return '<b>' + that.app.addCommas(this.y) + ' added</b> for <i>"' + this.series.name + '"</i> <br/>' +
                                                        'on ' + moment(this.key).format("DD MMM YYYY");
                                        }
                                    },
                                    series: []
                                };
                        _.each(this.dataArray,function(val,key){
                                var color = this.newRandomColor();
                                options.series.push({
                                    name: val[0],
                                    data: val[1],
                                    id: val[0],
                                    lineWidth: 4, 
                                    color:  color, 
                                    type: chart_type, 
                                    yAxis: 0 
                                });
                                options.yAxis.push({                                                                                  
                                    lineWidth:key==0?1:0,
                                    min: 0,
                                    title: {                                                    
                                        enabled: false,
                                        style: {
                                            "color": color
                                        },
                                        text:val[0]
                                    }                                             
                                });
                        },this)        
                       this.$(".campaign-chart > div").children().remove();
                       var chartDiv = this.$(".campaign-chart > div");                                              
                       this.chartPage.createChart(options, chartDiv);

                   },this)) 
                    
                },
                newRandomColor:function(){
                    var color = [];
                    color.push((Math.random() * 255).toFixed());
                    color.push((Math.random() * 255).toFixed());
                    color.push((Math.random() * 255).toFixed());
                    color.push(1);
                    var text = 'rgba(' + color.join(',') + ')';                    
                    return text;
                }
                //////************************** Web Stats  *****************************************//////
                ,
                openWebStatsDialog: function () {
                    var _width = 480;
                    var _height = 290;
                    var dialog_object = {title: 'Select Source',
                        css: {"width": _width + "px", "margin-left": -(_width / 2) + "px", "top": "10%"},
                        bodyCss: {"min-height": _height + "px"},
                        saveCall: '',
                        headerIcon: 'setting2'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["reports/select_stats"], _.bind(function (page) {
                        var _page = new page({page: this, dialog: dialog, dialogHeight: _height - 103});
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        dialog.getBody().html(_page.$el);
                        _page.init();
                        _page.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(_page.saveCall, _page); // New Dialog
                        dialog.saveCallBack(_.bind(_page.saveCall, _page));
                    }, this));
                },
                loadWebStats: function () {
                    if(this.objects[0].subtype){
                        this.modelArray.push({id:this.objects[0].id,subtype:this.objects[0].subtype,campMapping:this.objects[0].campMapping});
                    }
                    else{
                        this.modelArray.push(this.objects[0].id);
                    }
                    this.createWebstats();
                },
                createWebstats: function (fromLoadData) {
                    if (this.modelArray.length) {                        
                        var _type = this.modelArray[0].id?this.modelArray[0].id:this.modelArray[0];
                        if(this.modelArray[0].id){
                            var _subtype = this.modelArray[0].subtype;
                            if (_subtype == "top-charts") {
                                this.$(".total-count").html("Top Charts");
                                this.drawMixChart();
                            }
                            else if (_subtype == "general-stats") {
                                this.drawMultiCharts();
                            }
                            else if (_subtype == "online-campaigns") {
                                this.$(".total-count").html("Online Campaigns");
                                this.drawOnlineCampaigns();
                            }
                        }
                        else{
                            if (_type == "seo" || _type == "lcdetail" || _type == "ref" || _type == "pp") {
                                this.drawMixChart();
                            }
                            else {
                                this.drawMultiCharts();
                            }
                        }

                        if (!fromLoadData) {
                            this.saveSettings();
                        }
                    }
                },
                drawMultiCharts: function () {
                    this.dataArray = [];                    
                    this.callsData = this.modelArray[0].id?this.modelArray[0].id.split(","):this.modelArray[0].split(",");
                    this.$(".parent-container .template-container").css({"background": "#f4f9fc", "height": "420px"} );
                    this.$(".add-msg-report,.total-count").hide();
                    this.$(".stats-selection,.icons-bar-chart").show();
                    
                    this.$(".webstats-chart,.webstats-table").remove();
                    for (var c = 0; c < this.callsData.length; c++) {
                        this.$("[value='"+this.callsData[c]+"']").iCheck('check');
                        this.callGeneralStats(this.callsData[c]);
                    }
                    
                    if(!this.fromClick){
                        this.fromClick = true;
                    }

                },
                callGeneralStats: function (_type) {
                    var bms_token = this.app.get('bms_token');
                    var queryString = (this.fromDate && this.toDate) ? "&daterange=y&fromDate=" + moment(this.fromDate, 'M/D/YYYY').format("MM/DD/YYYY") + "&toDate=" + moment(this.toDate, 'M/D/YYYY').format("MM/DD/YYYY") : "&span=7"
                    var URL = "/pms/io/user/getWebStats/?BMS_REQ_TK=" + bms_token + "&type=" + _type + queryString;
                    this.app.showLoading("Loading Data...", this.$el);
                    jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        var webStatData = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(webStatData)) {
                            return false;
                        }
                        this.app.showLoading(false, this.$el);  
                        var data = [];
                        $.each(webStatData,function(key,line){
                                var dateValues = line[0].split('-');                                                                                                
                                data.push([Date.UTC(parseInt(dateValues[0]), parseInt(dateValues[1])-1, parseInt(dateValues[2])), parseInt(line[1], 10)]);	
                        })
                        this.dataArray.push([_type,data]);
                        if(this.callsData.length==this.dataArray.length){
                            this.drawGeneralStats();
                        }
                        
                    }, this));
                },
                changeChart:function(obj){
                    var iconDiv = $.getObj(obj, "div");
                    if(!iconDiv.hasClass("active")){
                        this.$(".icons-bar-chart .icons").removeClass("active");
                        iconDiv.addClass("active");
                        var chartType = 'column';
                        if(iconDiv.hasClass("barchart")){
                            chartType = 'column';
                        }
                        else if(iconDiv.hasClass("linechart")){
                            chartType = 'spline'
                        }
                        if(this.reportType=="webstats"){
                            this.drawGeneralStats(chartType);
                        }
                        else if(this.reportType=="tags"){
                            this.combineTagsChart(chartType);
                        }
                    }
                },
                drawGeneralStats:function(chartType){
                   var dateLabelObject = this.getDateText(this.fromDate, this.toDate);
                   this.$(".webstats-chart,.webstats-table").remove();
                   var chart_type = chartType ? chartType:'column';
                   this.app.showLoading("Loading Chart...", this.$el);
                   var that = this;
                   require(["reports/webstats"], _.bind(function (chart) {
                       this.chartPage = new chart({page: this});
                       this.app.showLoading(false, this.$el);                       
                       var options ={
                                    chart: {                                                  
                                        backgroundColor: "#f4f9fc"
                                    },                                            
                                    title: {
                                        text: '',
                                        style: {
                                            "color": "#02afef",
                                            "fontSize": "20px"
                                        }
                                    },
                                    subtitle: {                                                
                                        text: dateLabelObject.label,
                                        style: {
                                            "color": "#999"
                                        }
                                    },
                                    xAxis: {
                                        type: 'datetime',
                                        tickInterval:  dateLabelObject.days<=10?24 * 3600 * 1000 : 7 * 24 * 3600 * 1000,
                                        tickLength:0,
                                        dateTimeLabelFormats: {
                                            week :'%e %b',
                                            day :'%e %b'
                                        },
                                        title: {
                                            text: '',  
                                            margin:30,
                                            style: {
                                                "color": "#4d759e"
                                            }
                                        },
                                        labels: {                                                                                                       
                                            style: {
                                                fontSize: '12px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    },
                                    yAxis: [],
                                    legend: {

                                    },
                                    tooltip: {
                                        backgroundColor:"#2f93e5",
                                        style: {color: "#fff"},
                                        formatter: function () {
                                            var tooltip_rect = that.$('.highcharts-tooltip path:nth-child(4)');
                                            tooltip_rect.attr("fill",this.series.color);
                                            return '<b>' + that.app.addCommas(this.y) + '</b> ' + this.series.name + ' <br/>' +
                                                        'on ' + moment(this.key).format("DD MMM YYYY");
                                        }
                                    },
                                    series: []
                                };
                        _.each(this.dataArray,function(val,key){
                                options.series.push({
                                    name: this.webstats[val[0]].title,
                                    data: val[1],
                                    id: val[0],
                                    lineWidth: 4, 
                                    color:  this.webstats[val[0]].barColor, 
                                    type: chart_type, 
                                    yAxis: 0 
                                });
                                options.yAxis.push({                                                                                  
                                    lineWidth:key==0?1:0,
                                    min: 0,
                                    title: {                                                    
                                        style: {
                                            "color": this.webstats[val[0]].barColor
                                        },
                                        text:this.webstats[val[0]].title
                                    }                                             
                                });
                        },this)        
                       var chartDiv = $("<div style='height:420;width:100%' class='webstats-chart'></div>");
                       this.$(".camp_reports").append(chartDiv);
                       this.chartPage.createChart(options, chartDiv);

                   },this)) 
                },
                drawMixChart: function () {                   
                    var _type = this.modelArray[0].id?this.modelArray[0].id:this.modelArray[0];
                    var bms_token = this.app.get('bms_token');
                    var queryString = (this.fromDate && this.toDate) ? "&daterange=y&fromDate=" + moment(this.fromDate, 'M/D/YYYY').format("MM/DD/YYYY") + "&toDate=" + moment(this.toDate, 'M/D/YYYY').format("MM/DD/YYYY") : "&span=7"
                    var URL = "/pms/io/user/getWebStats/?BMS_REQ_TK=" + bms_token + "&type=" + _type + queryString;
                    this.app.showLoading("Loading Data...", this.$el);
                    jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        this.webStatData = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(this.webStatData)) {
                            return false;
                        }
                        this.app.showLoading(false, this.$el);
                        this.$(".parent-container .template-container").css("background", "#f4f9fc");
                        var dateLabelObject = this.getDateText(this.fromDate, this.toDate);
                        if (this.webStatData.length !== 0) {
                            this.app.showLoading("Loading Chart...", this.$el);
                            this.$(".add-msg-report").hide();
                            this.$(".webstats-chart,.webstats-table").remove();
                            require(["reports/webstats"], _.bind(function (chart) {
                                this.chartPage = new chart({page: this});
                                this.app.showLoading(false, this.$el);
                                var _data = [];
                                var chart_Type = "bar";
                                _.each(this.webStatData, function (val, index) {
                                    if (index < 10) {
                                        if (_type == "seo") {
                                            _data.push([val[0], parseInt(val[1])])
                                        } else if (_type == "lcdetail") {
                                            _data.push([val[0], parseInt(val[1])])
                                        } else if (_type == "ref") {
                                            _data.push([val[0], parseInt(val[1])])
                                        } else if (_type == "pp") {
                                            _data.push([val[0], parseInt(val[1])])
                                        }
                                    }
                                }, this)
                                var that = this;
                                var options = {
                                    chart: {
                                        type: chart_Type,
                                        backgroundColor: "#f4f9fc"
                                    },
                                    plotOptions: {
                                        series: {colorByPoint: this.webstats[_type].multipColrs}
                                    },
                                    title: {
                                        text: this.webstats[_type].title,
                                        style: {
                                            "color": "#02afef",
                                            "fontSize": "20px"
                                        }
                                    },
                                    subtitle: {
                                        text: dateLabelObject.label,
                                        style: {
                                            "color": "#999"
                                        }
                                    },
                                    xAxis: {
                                        type: 'category',
                                        tickLength: 0,
                                        title: {
                                            text: this.webstats[_type].xAxisText,
                                            margin: 30,
                                            style: {
                                                "color": "#4d759e"
                                            }
                                        },
                                        labels: {
                                            enabled: !this.webstats[_type].xAxisLabelDisabled,
                                            rotation: -45,
                                            style: {
                                                fontSize: '12px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    },
                                    yAxis: {
                                        lineWidth: 1,
                                        min: 0,
                                        title: {
                                            text: this.webstats[_type].yAxisText,
                                            style: {
                                                "color": "#4d759e"
                                            }
                                        }
                                    },
                                    legend: {
                                        enabled: false
                                    },
                                    tooltip: {                                        
                                        style: {color: "#fff"},
                                        formatter: function () {
                                            var tooltip_rect = that.$('.highcharts-tooltip path:nth-child(4)');
                                            tooltip_rect.attr("fill",this.point.color);
                                            if (_type == "uv" || _type == "pv" || _type == "rv") {
                                                return '<b>' + this.y + '</b> ' + this.webstats[_type].title + ' <br/>' +
                                                        'on ' + this.key;
                                            }
                                            else if (_type == "seo") {
                                                return '<b>Keyword </b><br/>' + _data[this.x][0]
                                            }
                                            else if (_type == "lcdetail") {
                                                return '<b>Company </b><br/>' + _data[this.x][0]
                                            } else if (_type == "ref") {
                                                return '<b>URL </b><br/>' + _data[this.x][0]
                                            } else if (_type == "pp") {
                                                return '<b>Page Name </b><br/>' + _data[this.x][0]
                                            }
                                        }
                                    },
                                    series: [{
                                            name: 'Count',
                                            data: _data,
                                            color: this.webstats[_type].barColor,
                                            dataLabels: {
                                                enabled: (dateLabelObject.days > 40 || this.webstats[_type].xAxisLabelDisabled) ? false : true,
                                                rotation: -90,
                                                color: '#FFFFFF',
                                                format: '{point.y:.0f}', // one decimal
                                                y: 20, // 10 pixels down from the top
                                                style: {
                                                    fontSize: '12px',
                                                    fontFamily: 'Verdana, sans-serif'
                                                }
                                            }
                                        }]
                                }
                                var chartDiv = $("<div style='height:420;width:100%' class='webstats-chart'></div>");
                                this.$(".camp_reports").append(chartDiv);
                                this.chartPage.createChart(options, chartDiv)

                                if (_type == "seo" || _type == "lcdetail" || _type == "ref" || _type == "pp") {
                                    this.$(".parent-container .template-container").css({"background": "#fff", "height": "auto"});
                                    this.$(".table-area .template-container").css({"max-height": "none"});
                                    var _dataTable = [];
                                    if (_type == "seo") {
                                        _dataTable.push(['Keyword Text', 'Count', 'Source']);
                                        _.each(this.webStatData, function (val, index) {
                                            _dataTable.push([val[0], parseInt(val[1]), val[2]]);
                                        }, this)

                                    } else if (_type == "lcdetail") {
                                        _dataTable.push(['Company', 'Page Views', 'Date', 'Traffic Source', 'Country', 'Telephone']);
                                        _.each(this.webStatData, function (val, index) {
                                            _dataTable.push([val[0], parseInt(val[1]), val[2], val[3], val[7], val[8]]);
                                        }, this)
                                    } else if (_type == "ref") {
                                        _dataTable.push(['Referral Link', 'Count']);
                                        _.each(this.webStatData, function (val, index) {
                                            _dataTable.push([val[0], parseInt(val[1])]);
                                        }, this)

                                    } else if (_type == "pp") {
                                        _dataTable.push(['Page Name', 'Page Views', 'Unique Views', 'Page URL']);
                                        _.each(this.webStatData, function (val, index) {
                                            _dataTable.push([val[0], parseInt(val[1]), parseInt(val[2]), val[3]]);
                                        }, this)

                                    }

                                    var tabletDiv = $("<div style='height:420;width:100%;margin-top:20px;' class='webstats-table'></div>");
                                    this.$(".camp_reports").append(tabletDiv);
                                    this.chartPage.createTable(_dataTable, tabletDiv[0]);
                                }
                            }, this));
                        }
                        else {
                            this.app.showAlert("No data found for '" + this.webstats[_type].title + "'", $("body"));
                        }
                    }, this));
                },
                getDateText: function (fromDate, toDate) {
                    var textDate = "Last 7 Days";
                    var _days = 0;
                    if (fromDate && toDate) {
                        var fromDateObject = moment(fromDate, 'M/D/YYYY');
                        var currentDateObject = moment(new Date());
                        var toDateObject = moment(toDate, 'M/D/YYYY');
                        if (currentDateObject.format("DD MMM YYYY") == toDateObject.format("DD MMM YYYY")) {
                            _days = currentDateObject.diff(fromDateObject, 'days');
                            if (_days == 0) {
                                textDate = "Today"
                            } else if (_days == 1) {
                                textDate = "Yesterday"
                            } else if (_days == 7) {
                                textDate = "Last 7 Days"
                            } else if (_days == 10) {
                                textDate = "Last 10 Days"
                            } else if (_days == 30) {
                                textDate = "Last 30 Days"
                            }
                            else {
                                textDate = fromDateObject.format("DD MMM YYYY") + " to " + currentDateObject.format("DD MMM YYYY");
                            }
                        } else {
                            _days = toDateObject.diff(fromDateObject, 'days');
                            textDate = fromDateObject.format("DD MMM YYYY") + " to " + toDateObject.format("DD MMM YYYY");
                        }
                    }
                    return {label: textDate, days: _days};
                },
                drawOnlineCampaigns:function(){
                    var campArray = this.modelArray[0].id.split(",");                    
                    this.$(".add-msg-report").hide();      
                    this.$(".online-campaign-area").remove();
                    this.$(".template-container").css({"overflow-y": 'hidden', height: 'auto'});
                    _.each(campArray, function (val, index) {
                            var campId = val;        
                            var chartTitle = this.modelArray[0].campMapping?this.modelArray[0].campMapping[campId]:"" 
                            this.$(".camp_reports").append($("<div class='online-campaign-area' id='"+campId+"'></div>"))
                            this.app.showLoading("Loading Data...", this.$("#" + campId));
                            var bms_token = this.app.get('bms_token');
                            var queryString = (this.fromDate && this.toDate) ? "&daterange=y&fromDate=" + moment(this.fromDate, 'M/D/YYYY').format("MM/DD/YYYY") + "&toDate=" + moment(this.toDate, 'M/D/YYYY').format("MM/DD/YYYY") : "&span=7"
                            var URL = "/pms/io/user/getWebStats/?BMS_REQ_TK=" + bms_token + "&type=one_adcam&code=" + campId + queryString;                            
                            var post_data = {};
                            $.post(URL, post_data).done(_.bind(function (sJson) {
                                var summary_json = jQuery.parseJSON(sJson);
                                if (summary_json[0] == "err") {
                                    this.app.showAlert(summary_json[1], this.$el.parents(".ws-content.active"));
                                    return false;
                                }
                                if (summary_json.count !== "0") {
                                    require(["reports/campaign_bar_chart"], _.bind(function (chart) {
                                        var  viewData = [], clickCount = [], conversionData = [], bounceData = [];

                                        var categories = [];
                                        this.chart_data = {bounceCount: 0, clickCount: 0, pageViewsCount: 0
                                            , openCount: 0, sentCount: 0, socialCount: 0};
                                        _.each(summary_json, function (sVal) {
                                            categories.push(moment(sVal[0], 'YYYY-M-D').format("DD MMM"));                                            
                                            clickCount.push(parseInt(sVal[3]));
                                            viewData.push(parseInt(sVal[4]));                                                                                        
                                            bounceData.push(parseInt(sVal[5]));
                                            conversionData.push(parseInt(sVal[6]));

                                            this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(sVal[5]);
                                            this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(sVal[3]);
                                            this.chart_data["conversionCount"] = this.chart_data["conversionCount"] + parseInt(sVal[6]);                                                                                        
                                            this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(sVal[5]);
                                        }, this);
                                        var _data = [{"name": "Bounce", "data": bounceData}, {"name": "Conversion", "data": conversionData}, {"name": "View", "data": viewData}, {"name": "Click", "data": clickCount}];
                                        this.chartPage = new chart({page: this, isStacked: true,title:chartTitle, xAxis: {label: 'category', categories: categories}, yAxis: {label: 'Count'}, colors: ['#f71a1a', '#03d9a4', '#27316a', '#559cd6']});
                                        this.$("#" + campId).html(this.chartPage.$el);
                                        this.chartPage.$el.css({"width": "100%", "height": "420px"});
                                        this.chartPage.createChart(_data);
                                        

                                    }, this));
                                }
                                else {
                                    this.$("#" + campId).html('<div class="loading nodata"><p style="background:none">No data found for this campaign </p></div>');
                                }
                            }, this));

                        }, this);
                }
            });
        });
