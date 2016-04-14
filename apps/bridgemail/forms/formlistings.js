define(['text!forms/html/formlistings.html', 'forms/collections/formlistings', 'forms/formlistings_row','bms-remote'],
        function (template, formsCollection, formsRowView) {
            'use strict';
            return Backbone.View.extend({
                id: 'forms_list',
                tags: 'div',
                events: {                    
                    "click .refresh_btn": function () {
                        this.app.addSpinner(this.$el);
                        this.type='search';
                        this.fetchForms();                        
                    },
                    "keyup #daterange": 'showDatePicker',
                    "mouseup #daterange" : 'showSelected',
                    "click #clearcal": 'hideDatePicker',
                    "click .calendericon": 'showDatePickerFromClick'
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.formsCollection = new formsCollection();
                    this.fromDate = null;
                    this.toDate = null;
                    this.dateRange = 0;
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                    this.offset = 0;
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    //this.status = "A";                    
                    this.type = 'search';                    
                    this.searchTxt = '';                    
                    this.timeout = null;
                    this.total_Count = null;                    
                                        
                    this.searchBadgeTxt = '';
                    this.taglinkVal = false;
                    this.fetchForms();
                    this.$el.find('div#formlistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchEmails, this),
                        clearFunc: _.bind(this.clearSearchEmails, this),
                        placeholder: 'Search form by name',
                        showicon: 'yes',
                        iconsource: 'sforms',
                        countcontainer: 'no_of_camps'
                    });

                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                /*---------- Calender functions---------------*/
                showDatePicker: function () {
                    this.$('#clearcal').show();
                    return false;
                },
                hideDatePicker: function () {
                    this.$('#clearcal').hide();
                    this.fromDate = "";
                    this.toDate = "";
                    this.dateRange = 0;
                    this.$('#daterange').val('');                    
                    this.fetchForms();
                },
                showDatePickerFromClick: function () {
                    this.$('#daterange').click();
                    return false;
                },
                setDateRange: function (setDateVars) {
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
                        if (typeof (setDateVars) !== "boolean") {
                            this.fetchForms();
                        }
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
                }
                /*---------- End Calender functions---------------*/
                ,
                init: function () {
                    
                    this.current_ws = this.$el.parents(".ws-content");                                        
                    this.ws_header = this.current_ws.find(".camp_header .edited"); 
                    this.current_ws.find("#campaign_tags").remove();
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                    this.app.scrollingTop({scrollDiv: 'window', appendto: this.$el});
                    this.ws_header.find(".workspace-field").remove();
                    this.current_ws.find("#addnew_action").attr("data-original-title", "Create Signup Form").click(_.bind(this.createFormDialog, this));
                    this.$("div.create_new").click(_.bind(this.createFormDialog, this));  
                    
                    this.dateRangeControl = this.$('#daterange').daterangepicker();
                    this.dateRangeControl.panel.find(".btnDone").click(_.bind(this.setDateRange, this));
                    this.dateRangeControl.panel.find("ul.ui-widget-content li").click(_.bind(this.setDateRangeLi, this));
                    
                },
                fetchForms: function (fcount, filterObj) {
                    this.$el.find("#template_search_menu").hide();
                    if (!fcount) {
                        this.offset = 0;
                        if(!this.searchTxt){
                            this.showHeadLoading();
                        }
                        this.app.showLoading("Loading Forms...", this.$("#target-camps"));
                        this.$el.find('#forms_list_grid tbody').html('');
                        this.$(".notfound").remove();

                    }
                    else {
                        this.offset = parseInt(this.offset) + this.offsetLength;
                        this.$("#forms_list_grid tbody").append('<tr class="loading-campagins"><td colspan="6"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading more forms.</p></div></td></tr>');
                    }
                    if (this.forms_request)
                    {
                        this.forms_request.abort();
                    }
                    var _data = {type: this.type};
                    _data['offset'] = this.offset;                   
                    _data['bucket'] = 20;
                    
                    if (this.toDate && this.fromDate) {
                        _data['fromDate'] = this.fromDate;
                        _data['toDate'] = this.toDate;
                    }
                    
                    if (this.searchTxt) {
                        _data['searchText'] = this.searchTxt;
                    }

                    this.forms_request = this.formsCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$("#forms_list_grid tbody").find('.loading-campagins').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;                            

                            this.app.showLoading(false, this.$("#target-camps"));                            
                            this.$el.find("#total_templates .badge").html(collection.totalCount);
                            this.total_Count = collection.totalCount;
                            this.showTotalCount(collection.totalCount);
                            if(this.offset==0 && !this.searchTxt){
                                this.headBadge(collection.totalCount);
                            }

                            _.each(data1.models, _.bind(function (model) {
                                this.$el.find('#forms_list_grid tbody').append(new formsRowView({model: model, sub: this}).el);
                            }, this));
                            /*-----Remove loading------*/
                            this.app.removeSpinner(this.$el);
                            /*------------*/
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$(".form-box").last().attr("data-load", "true");
                            }

                            if (this.offsetLength == 0) {
                                var search_message = "";
                                if (this.searchTxt) {
                                    search_message += " containing '" + this.searchTxt + "'";
                                }
                                this.$('#total_templates').html('<p class="notfound nf_overwrite">No Signup Form found' + search_message + '</p>');
                                this.$el.find('#forms_list_grid tbody').before('<p class="notfound">No Signup Forms found' + search_message + '</p>');
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    });

                },
                showHeadLoading : function(){
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");                                     
                    active_ws.find('ul.c-current-status').remove();
                    if (active_ws.find('ul.c-current-status').length) {
                        var header_title = active_ws.find(".camp_header .edited");
                        header_title.find('ul').remove();                        
                        var progress = $("<ul class='c-current-status'><li style='margin-left:5px;'><a><img src='" + this.options.app.get("path") + "img/greenloader.gif'></a></li></ul>");
                        header_title.append(progress)
                    }  
                },
                headBadge: function ( count ) {
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");                                                         
                    
                    var header_title = active_ws.find(".camp_header .edited");
                    header_title.find('ul').remove();                        
                    var stats = '<ul class="c-current-status">';                                
                        stats += '<li class="showhand showtooltip" title="Click to view all forms"><span class="badge pclr18 topbadges total_forms" tabindex="-1">'+count+'</span>Total Forms</li>';                            
                    stats += '</ul>';
                    header_title.append(stats);
                    this.ws_header.find(".c-current-status li").click(_.bind(function(){this.$("#list-search").val('');this.$("#clearsearch").hide();this.clearSearchEmails();}, this));
                    header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    
                },
                
                liveLoading: function () {
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$("#forms_list_grid tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.type = 'search';
                        this.fetchForms(this.offsetLength);
                    }
                },
                searchEmails: function (o, txt) {
                    this.type = '';
                    this.searchTxt = txt;
                    this.total_fetch = 0;
                    this.type = 'search';
                    if (this.taglinkVal) {
                        this.fetchForms();
                        this.taglinkVal = false;
                    } else {
                        var keyCode = this.app.validkeysearch(o);
                        if (keyCode) {
                            if ($.trim(this.searchTxt).length > 0) {

                                this.timeout = setTimeout(_.bind(function () {
                                    clearTimeout(this.timeout);
                                    this.fetchForms();
                                }, this), 500);
                            }
                            this.$('#formlistsearch input').keydown(_.bind(function () {
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
                    this.type = 'search';
                    this.fetchForms();
                },
                showTotalCount: function (count) {
                 
                    var _text = parseInt(count) <= "1" ? "Signup Form" : "Signup Forms";
                    var text_count = '<strong class="badge">' + this.app.addCommas(count) + '</strong>';
                                       
                    if (this.searchTxt && this.isSubjectText) {
                        this.$("#total_templates").html(text_count + _text + " found containing name '<b>" + this.searchTxt + "</b>'");
                        this.isSubjectText = false;
                    }
                    else if(this.searchTxt){
                        this.$("#total_templates").html(text_count + _text + " found containing text '<b>" + this.searchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_templates").html(text_count + _text);
                    }
                    if(this.searchBadgeTxt){
                        this.$("#total_templates").html(text_count +  this.searchBadgeTxt +" "+ _text);
                        this.searchBadgeTxt = '';
                    }

                },
                createFormDialog: function(){
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Enter name for your Signup form',
                      buttnText: 'Create',
                      bgClass :'no-tilt',
                      plHolderText : 'Enter form name here',
                      emptyError : 'Form name can\'t be empty',
                      createURL : '/pms/io/form/saveSignUpFormData/',
                      fieldKey : "name",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token')},
                      saveCallBack :  _.bind(this.createForm,this)
                    });
                },
                createForm:function(txt,json){
                    if(json[0]=="success"){
                        this.openFormDialog(json[1]);                         
                        this.fetchForms();
                    }
                },
                openFormDialog: function(formId,formName){
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-162;
                    var _this = this;
                    
                    var dialog = this.app.showDialog({title:'Form Builder',
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                              headerEditable:false,
                              headerIcon : 'dlgformwizard',                              
                              bodyCss:{"min-height":dialog_height+"px"}
                    });
                    if(formName){
                        this.app.showLoading("Loading "+formName+" ...",dialog.getBody());
                    }
                    else{
                        this.app.showLoading("Loading ...",dialog.getBody());
                    }
                    var formurl = formId ? "&formId="+formId : "";
                    dialog_height = parseFloat(dialog_height)-6 ;
                    var transport = new easyXDM.Socket({           
                        remote:  window.location.protocol+'//'+this.app.get("content_domain")+"/pms/landingpages/rformBuilderNewUI.jsp?BMS_REQ_TK=" + this.app.get("bms_token")+"&ukey="+this.app.get("user_Key")+formurl,
                        onReady: function(){
                            _this.app.showLoading(false,dialog.getBody());
                        },
                        onMessage: _.bind(function(message, origin){
                            var response = jQuery.parseJSON(message);
                            if(response.isRefresh || response.formURL){
                                if(response.isRefresh){
                                    
                                }                                
                            }
                            else if(response.showMessage){
                                this.app.showMessge(response.msg);
                            }

                        },this),
                        props:{style:{width:"100%",height:dialog_height+"px"},frameborder:0},
                        container : dialog.getBody()[0]
                    });
                }

            });
        });
