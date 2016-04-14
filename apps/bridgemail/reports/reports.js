define([ 'text!reports/html/reports.html', 'bms-filters', 'reports/collections/reports', 'reports/report','highcharts'],
        function (template, bmsfilters, reportsCollection, reportRowView) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {
                    "click .refresh_reports": 'refreshListing'                                                          
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.reportsCollection = new reportsCollection();                    
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                    this.offset = 0;                    
                    this.offsetLength = 0;
                    this.total_fetch = 0;                    
                    this.reports_request = null;                                        
                    this.status = "";
                    this.actionType = "";
                    this.taglinkVal = false;
                    this.timeout = false;                                        
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.addReports();                    
                    this.getReports();
                    this.$('div#reportslistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchReports, this),
                        clearFunc: _.bind(this.clearsearchReports, this),
                        placeholder: 'Search business intelligence dashboards',
                        showicon: 'yes',
                        iconsource: 'reports'
                    });
                                       
                    this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});                    
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                                       
                },
                liveLoading: function () {
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$("#reports_grid tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$("#area_myreports").height() > 0) {
                        inview.removeAttr("data-load");
                        this.getReports(20);
                    }
                },
                addReports: function( ) {
                   var active_ws = this.$el.parents(".ws-content");   
                   this.ws_header = active_ws.find(".camp_header .edited"); 
                   this.ws_header.find('.workspace-field').remove();
                   active_ws.find("#campaign_tags").remove();
                   active_ws.find("#addnew_action").attr("data-original-title", "Add Report").click(_.bind(this.createReportDialog, this));
                   active_ws.find("div.create_new").click(_.bind(this.createReportDialog, this));  
                },
                createReportDialog: function (  ) {
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Start with choosing a name for business intelligence dashboard',
                      buttnText: 'Create',
                      bgClass :'no-tilt',
                      plHolderText : 'Enter dashboard name here',
                      emptyError : 'Dashboard name can\'t be empty',
                      createURL : '/pms/io/user/customReports/',
                      fieldKey : "reportName",
                      postData : {type:'add',BMS_REQ_TK:this.app.get('bms_token')},
                      saveCallBack :  _.bind(this.createReport,this)
                    });
                },
                createReport: function(txt,json){
                    if(json[0]=="success"){
                        this.app.mainContainer.openReport({"id":json[1],"checksum":json[2],"parent":this,editable:true});                                
                        this.getReports();
                    }
                },
                refreshListing: function(){
                    this.app.addSpinner(this.$el);
                    this.getReports();                      
                },
                getReports: function ( fcount, filterObj ) {
                    if (!fcount) {
                        this.offset = 0;
                        this.total_fetch = 0;
                        this.app.showLoading("Loading Your Reports...", this.$("#custom-reports"));
                        this.$el.find('#reports_grid tbody').html('');
                        this.$("#area_myreports .notfound").remove();
                    }
                    else {
                        this.offset = parseInt(this.offset) + this.offsetLength;
                        this.$("#reports_grid tbody").append('<tr class="loading-reports"><td colspan="4"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading more dashboards..</p></div></td></tr>');
                    }
                    if (this.reports_request)
                    {
                        this.reports_request.abort();
                    }
                    var _data = {offset: this.offset,type:'get'};                    
                                        
                    if (this.searchTxt) {
                        _data['searchText'] = this.searchTxt;
                    }                    
                    _data['bucket'] = 20;
                    this.reports_request = this.reportsCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$("#reports_grid tbody").find('.loading-reports').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;                            

                            this.app.showLoading(false, this.$("#custom-reports"));
                            
                            this.$("#total_reports .badge").html(collection.totalCount);

                            this.showTotalCount(collection.totalCount);                            

                            _.each(data1.models, _.bind(function (model) {
                                var reportRow = new reportRowView({model: model, sub: this});
                                this.$el.find('#reports_grid tbody').append(reportRow.el);                                
                            }, this));
                            
                            /*-----Remove loading------*/
                            this.app.removeSpinner(this.$el);
                            /*------------*/
                            
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$(".report-box").last().attr("data-load", "true");
                            }

                            if (this.offsetLength == 0) {
                                var search_message = "";
                                if (this.searchTxt) {
                                    search_message += " containing '" + this.searchTxt + "'";
                                }
                                this.$('#total_reports').html('<p class="notfound nf_overwrite">No dashboards found' + search_message + '</p>');
                                this.$('#reports_grid tbody').before('<p class="notfound">No dashboards found' + search_message + '</p>');
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    });   
                },
                showTotalCount: function ( count ){                    
                    var _text = parseInt(count) <= "1" ? "Business Intelligence Dashboard" : "Business Intelligence Dashboards";                    
                    
                    var text_count = '<strong class="badge">' + this.app.addCommas(count) + '</strong>';

                    if (this.searchTxt) {
                        var typeText = "<u>text</u>";
                        if(this.actionType=="T"){
                            typeText = "<u>tag</u>";
                        }
                        this.$("#total_reports").html(text_count + _text + " found containing "+typeText+" '<b>" + this.searchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_reports").html(text_count + _text);
                    }
                },
                searchReports:function(o, txt){                    
                    this.searchTxt = txt;                    
                    this.total_fetch = 0;                    
                    if (this.taglinkVal) {
                        this.getReports();
                        this.taglinkVal = false;
                    } else {
                        this.actionType = "";
                        var keyCode = this.app.validkeysearch(o);
                        if (keyCode) {
                            if ($.trim(this.searchTxt).length > 0) {
                                this.timeout = setTimeout(_.bind(function () {
                                    clearTimeout(this.timeout);
                                    this.getReports();
                                }, this), 500);
                            }
                            this.$('#reportslistsearch input').keydown(_.bind(function () {
                                clearTimeout(this.timeout);
                            }, this));
                        } else {
                            return false;
                        }

                    }
                },
                clearsearchReports: function(){
                    this.searchTxt = '';
                    this.total_fetch = 0;  
                    this.actionType = "";
                    this.getReports();
                }

            });
        });
