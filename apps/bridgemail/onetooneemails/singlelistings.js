define([ 'text!onetooneemails/html/singlelistings.html', 'onetooneemails/collections/singlelistings', 'onetooneemails/singlelisting_row'],
        function (template, singlelistingCollection, singlelistingRowView) {
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
                         this.$('.ui-daterangepickercontain').find('li.ui-state-active').removeClass('ui-state-active')
                        this.findEmails(obj);
                    },
                    "click .refresh_btn": function () {
                        this.app.addSpinner(this.$el);
                        this.type='getMessageList';
                        this.getallemails();
                        this.headBadge();
                    },
                    "click .stattype": function (obj) {
                        var camp_obj = this;                        
                        var target = $.getObj(obj, "a");
                        var prevStatus = this.searchTxt;
                        this.searchBadgeTxt = target.attr('search');
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
                        this.type='getMessageList';
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
                        var dialog = this.app.showDialog({title:'Templates'+'<strong id="oto_total_templates" class="cstatus pclr18 right" style="margin-left:5px;display:none;"> Total <b></b> </strong>',
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
                             _this.templateView = new templatesPage({page:_this,app:_this.app,scrollElement:dialog.getBody(),dialog:dialog,selectCallback:_.bind(_this.selectTemplate,_this),isOTO : true});               
                           var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                           dialog.getBody().append( _this.templateView.$el);
                            _this.templateView.$el.addClass('dialogWrap-'+dialogArrayLength); 
                           _this.app.showLoading(false,  _this.templateView.$el.parent());                     
                             _this.templateView.init();
                             _this.templateView.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                             _this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                            _this.app.dialogArray[dialogArrayLength-1].currentView = _this.templateView; // New Dialog
                        })
                 
                },
                selectTemplate:function(obj){
                   // this.setEditor();
                    var target = $.getObj(obj,"a");
                    var bms_token =this.app.get('bms_token');
                                  
                     this.template_id = target.attr("id").split("_")[1]; 
                     this.templateView.createOTODialog();
                    
                },
              
                findEmails: function (obj)
                {
                    var olist_obj = this;                    
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
                        this.type='getMessageList';
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
                    this.subNum = '';
                    this.returnDataValue = '';
                    var camp_obj = this;
                    this.template_id='';
                    this.templateView  = '';
                    this.searchBadgeTxt = '';
                    camp_obj.getallemails();
                    camp_obj.$el.find('div#campslistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchEmails, this),
                        clearFunc: _.bind(this.clearSearchEmails, this),
                        placeholder: 'Search emails by subject',
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
                        this.type = 'getMessageList';
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
                        var toDateFormat = toDate.format("DD MMM, YY");
                         var fromDate = moment(this.app.decodeHTML(this.fromDate),'M/D/YYYY');														
                        var fromDateFormat = fromDate.format("DD MMM, YY");
                        this.$("#total_templates").html(text_count + _text + " sent from '<b>" + fromDateFormat + ' - ' + toDateFormat  +"</b>'");
                    }else if(this.fromDate){
                         var fromDate = moment(this.app.decodeHTML(this.fromDate),'M/D/YYYY');														
                        var fromDateFormat = fromDate.format("DD MMM, YY");
                        this.$("#total_templates").html(text_count + _text + " sent from '<b>" + fromDateFormat +"</b>'");
                    }
                    else if (this.searchTxt && this.isSubjectText) {
                        this.$("#total_templates").html(text_count + _text + " found containing Subject '<b>" + this.searchTxt + "</b>'");
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
                                
                                stats += '<li search="Sent" class="'+sentClass+' '+ this.app.getClickableClass(allStats['sentCount']) +'" data-original-title="Click to view sent emails"><span class="badge pclr18  stattype topbadges" tabindex="-1" search="Sent" >' + allStats['sentCount'] + '</span>Sent</li>';
                                stats += '<li search="Opened" class="'+openCount+' '+ this.app.getClickableClass(allStats['openCount']) +'" data-original-title="Click to view open emails"><span class="badge pclr2 showtooltip stattype topbadges" tabindex="-1" search="Opened" >' + allStats['openCount'] + '</span>Open</li>';
                                stats += '</ul>';
                                header_title.find('ul.progress-loading').remove();
                                header_title.append(stats);
                                
                                $(".c-current-status li:first-child").click(_.bind(this.getSendEmails, this));
                                $(".c-current-status li:last-child").click(_.bind(this.getOpenEmails, this));
                                header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                                //header_title.find(".c-current-status li a").click(_.bind(camp_obj.$el.find('.stattype').click(),camp_obj));
                            }, this));
                },
                getOpenEmails :function(obj){
                    this.type = 'getOpenMessageList';
                    var target = $.getObj(obj, "li");
                    this.searchBadgeTxt = target.attr('search');
                    this.total_fetch = 0;
                    this.getallemails();
                },
                
                getSendEmails :function(obj){
                    var target = $.getObj(obj, "li");
                    this.searchBadgeTxt = target.attr('search');
                    this.type = 'getMessageList';
                    this.total_fetch = 0;
                    this.getallemails();
                },
                
                toggleSortOption: function (ev) {               
                    $(this.el).find("#template_search_menu").slideToggle();
                    ev.stopPropagation();
                },
                getSingleSubEmails : function(fcount,childView){
                    if (!fcount) {
                        this.offset = 0;
                    }
                    else {
                        this.offset = parseInt(this.offset) + this.offsetLength;
                        //this.$("#camp_list_grid tbody").append('<tr class="loading-campagins"><td colspan="6"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading more emails.</p></div></td></tr>');
                    }
                    var _data = {type: this.type};
                    _data['offset'] = this.offset;
                    _data['bucket'] = 20;
                    _data['subNum'] = this.subNum;
                    this.campaigns_request = this.singlelistingCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$("#camp_list_grid tbody").find('.loading-campagins').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            //console.log('Data : '+data1 + ' Collection : '+ collection);
                           this.returnDataValue = {data:data1,collection:collection};
                            childView.showSingleContactMessages();
                            /*_.each(data1.models, _.bind(function (model) {
                                this.$el.find('#camp_list_grid tbody').append(new singlelistingRowView({model: model, sub: this}).el);
                            }, this));*/
                            
                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                           // console.log('from single listings : '+this.campaigns_request);
                    
                }, 

            });
        });
