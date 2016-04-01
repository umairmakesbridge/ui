define(['text!reports/html/report_block.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Report blocks 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'rept-data-box',
                tagName: 'div',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                  "click .show-detail" : "previewCampaign",
                  "click .rp-detail-report" : "reportShow",
                  "click .rpclose" : "removeFromReport",
                  "click #triangle-bottomleft": "addRemoveRow"
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.page
                    this.app = this.sub.app;
                    this.type = this.options.type;
                    this.subType = this.options.subType ? this.options.subType :'';
                    this.addClass= this.options.addClass ? this.options.addClass :'';
                    this.expandedView = this.options.expandedView ? true : false;    
                    this.isAddRemove = this.options.isAddRemove?true:false;
                    this.render();                  
                },
                /**
                 * Render view on page.
                 */
                render: function () {
                    this.$el.html(this.template({
                        model: this.model
                    }));
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    
                    if(this.expandedView){
                        this.$el[0].className = "rpt-campign-listing rpt-campaign-blocks";
                    }
                    if(this.type=="nurturetrack" && this.expandedView===false){
                        this.$el.addClass("rept-data-nt");
                    }
                    else if(this.type=="funnel"){
                        this.$el.addClass("rept-data-tagbox");
                    }
                    
                    this.initControls();
                },
                removeFromReport: function(){
                   if(this.isAddRemove){
                       this.addRemoveRow();
                       return false;
                   } 
                   var delIndex = -1; 
                   if(this.type=="campaign"){
                    _.each(this.sub.modelArray, function (val, index) {
                        if(val.get("campNum.checksum")==this.model.get("campNum.checksum")){
                            delIndex = index;                                                      
                        }                       
                    },this);                                     
                    this.sub.modelArray.splice(delIndex,1);
                    if(this.expandedView) {    
                        this.sub.loadCampaignsSummary();
                    }
                    else{
                        this.sub.createCampaigns();
                    }
                  }
                  else if(this.type=="page"){
                     _.each(this.sub.modelArray, function (val, index) {
                        if(val.get("pageId.checksum")==this.model.get("pageId.checksum")){
                            delIndex = index;                                                      
                        }                       
                    },this);                                     
                    this.sub.modelArray.splice(delIndex,1);                    
                    if(this.expandedView) {    
                        this.sub.loadPagesSummary();
                    }
                    else{
                        this.sub.createPages();
                    }
                  }
                  else if(this.type=="form"){
                     _.each(this.sub.modelArray, function (val, index) {
                        if(val.get("formId.checksum")==this.model.get("formId.checksum")){
                            delIndex = index;                                                      
                        }                       
                    },this);                                     
                    this.sub.modelArray.splice(delIndex,1);                    
                    if(this.expandedView) {    
                        this.sub.loadSignupformsSummary();
                    }
                    else{
                        this.sub.createSignupForms();
                    }
                  }
                  else if(this.type=="autobot"){
                     _.each(this.sub.modelArray, function (val, index) {
                        if(val.get("botId.checksum")==this.model.get("botId.checksum")){
                            delIndex = index;                                                      
                        }                       
                    },this);                                     
                    this.sub.modelArray.splice(delIndex,1);                    
                    if(this.expandedView) {    
                        this.sub.loadAutobotsSummary();
                    }
                    else{
                        this.sub.createAutobots();
                    }
                  }
                  else if(this.type=="tag"){
                     _.each(this.sub.modelArray, function (val, index) {
                        if(val.get("tag")==this.model.get("tag")){
                            delIndex = index;                                                      
                        }                       
                    },this);                                     
                    this.sub.modelArray.splice(delIndex,1);                    
                    if(this.expandedView) {    
                        this.sub.loadTagsSummary();
                    }
                    else{
                        this.sub.createTags();
                    }
                  }else if(this.type=="funnel"){
                     var selectedLevel = this.sub.$(".funnel-tabs-btns .active").attr("data-tab");
                     selectedLevel = parseInt(selectedLevel) - 1;
                     _.each(this.sub.modelArray[selectedLevel], function (val, index) {
                        if(val.get("tag")==this.model.get("tag")){
                            delIndex = index;                                                      
                        }                       
                    },this);                     
                    if(delIndex>-1){
                        this.sub.modelArray[selectedLevel].splice(delIndex,1);                                        
                        this.sub.createFunnel();                    
                    }
                  }
                },
                /*
                 * 
                 * @returns Campaign Status
                 */
                getCampStatus: function () {

                    var value = this.app.getCampStatus(this.model.get('status'));
                    var tooltipMsg = '';
                    if (this.model.get('status') == 'D' || this.model.get('status') == 'S')
                    {
                        tooltipMsg = "Click to edit";
                    }
                    else
                    {
                        tooltipMsg = "Click to preview";
                    }
                    return {status: value, tooltip: tooltipMsg}
                },
                /*
                 * 
                 * @returns Time Show
                 */
                getTimeShow: function () {
                    var datetime = '';
                    var dtHead = '';
                    var dateFormat = '';
                    if (this.model.get('status') == 'P' || this.model.get('status') == 'S')
                    {
                        dtHead = 'Schedule Date';
                        datetime = this.model.get('scheduledDate');
                    }
                    else if (this.model.get('status') == 'C')
                    {
                        dtHead = 'Sent Date';
                        datetime = this.model.get('scheduledDate');
                    }
                    else if (this.model.get('status') == 'D')
                    {
                        dtHead = 'Last Edited';
                        if (this.model.get('updationDate'))
                            datetime = this.model.get('updationDate');
                        else
                            datetime = this.model.get('creationDate');
                    }
                    else {
                        dtHead = 'Last Edited';
                        if (this.model.get('updationDate'))
                            datetime = this.model.get('updationDate');
                        else
                            datetime = this.model.get('creationDate');
                    }
                    if (datetime)
                    {
                        var date = moment(this.app.decodeHTML(datetime), 'YYYY-M-D H:m');
                        dateFormat = date.format("DD MMM, YYYY");
                        if (this.model.get('status') == 'S' || this.model.get('status') == 'P') {
                            dateFormat = date.format("DD MMM, YYYY<br/>hh:mm A");
                        }
                    }
                    else {
                        dateFormat = '';
                    }
                    return {dtHead: dtHead, dateTime: dateFormat}
                },
                /*
                 * 
                 * @returns Time Show for landing pages
                 */
                getPageTimeShow: function () {
                    var datetime = '';
                    var dtHead = '';
                    var dateFormat = '';
                    if (this.model.get('status') == 'P' || this.model.get('status') == 'R')
                    {
                        dtHead = 'Publish Date';
                        datetime = this.model.get('updationDate');
                    }                                      
                    else {
                        dtHead = 'Last Edited';
                        if (this.model.get('updationDate'))
                            datetime = this.model.get('updationDate');
                        else
                            datetime = this.model.get('creationDate');
                    }
                    if (datetime)
                    {
                        var date = moment(this.app.decodeHTML(datetime), 'M-D-YY');
                        dateFormat = date.format("DD MMM, YYYY");
                        if (this.model.get('status') == 'S' || this.model.get('status') == 'P') {
                            dateFormat = date.format("DD MMM, YYYY");
                        }
                    }
                    else {
                        dateFormat = '';
                    }
                    return {dtHead: dtHead, dateTime: dateFormat}
                },
                /*
                 * 
                 * @returns Time Show for signup forms
                 */
                getFormsDate:function(){
                  var datetime = this.model.get('updationDate') ? this.model.get('updationDate') : this.model.get('creationDate');
                  var date = moment(this.app.decodeHTML(datetime), 'MM-DD-YY');
                  return date.format("DD MMM, YYYY") == "Invalid date" ? "&nbsp;" : date.format("DD MMM, YYYY");  
                },
                getPlayedOn: function() {
                    var playedOn = this.model.get('lastPlayedTime');                    
                    if (playedOn && this.model.get('status') != "D") {
                        var _date = moment(playedOn, 'MM-DD-YY');                        
                        return _date.format("DD MMM YYYY");
                    } else {
                        var _date = moment(this.model.get('updationTime'), 'MM-DD-YY');
                        return _date.format("DD MMM YYYY");
                    }
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    if (this.sub.searchTxt) {
                        this.$(".show-detail").highlight($.trim(this.sub.searchTxt));
                        this.$(".taglink").highlight($.trim(this.sub.searchTxt));
                    } else {
                        this.$(".taglink").highlight($.trim(this.sub.tagTxt));
                    }
                    
                    this.$(".check-obj").iCheck({
                          checkboxClass: 'checkpanelinput reportcheck',
                          insert: '<div class="icheck_line-icon" style="margin: 25px 0 0 10px;"></div>'
                    });                    
                    this.$(".check-obj").on('ifChecked', _.bind(this.refreshReport,this));
                    this.$(".check-obj").on('ifUnchecked', _.bind(this.refreshReport,this));

                },
                refreshReport:function(){                    
                    if(this.type=="campaign"){                                        
                        this.sub.createCampaignChart();                    
                    }
                    else if(this.type=="autobot"){
                        this.sub.createAutobotChart();
                    }
                    else if(this.type=="page"){
                        this.sub.createPageChart();
                    }else if(this.type=="form"){
                        this.sub.createSignupFormChart();
                    }
                    else if(this.type=="tag"){
                        this.sub.createTagsChart();
                    }
                },
                previewCampaign: function () {
                    var camp_id = this.model.get('campNum.encode');
                    var camp_obj = this.sub;
                    var isTextOnly = this.model.get('isTextOnly');
                    //var appMsgs = this.app.messages[0];				
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = camp_obj.app.showDialog({title: 'Campaign Preview of &quot;' + this.model.get('name') + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading Campaign HTML...", dialog.getBody());
                    var preview_url = "https://" + this.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + camp_id;
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: camp_id, isText: isTextOnly}); // isText to Dynamic
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                },
                getFlagClass: function () {
                    var flag_class = '';
                    var chartIcon = '';

                    if (this.model.get('status') == 'D')
                        flag_class = 'pclr1';
                    else if (this.model.get('status') == 'P')
                        flag_class = 'pclr6';
                    else if (this.model.get('status') == 'S')
                        flag_class = 'pclr2';
                    else if (this.model.get('status') == 'C')
                        flag_class = 'pclr18';
                    else
                        flag_class = 'pclr1';
                    if (this.model.get('status') == 'P' || this.model.get('status') == 'C')
                    {
                        chartIcon = '<div class="campaign_stats showtooltip" title="Click to View Chart"><a class="icon report"></a></div>';
                    }

                    return {flag_class: flag_class, chartIcon: chartIcon};

                },
                campaignStateOpen: function () {
                    if (this.model.get('status') == 'D' || this.model.get('status') == 'S')
                    {
                        this.openCampaign();
                    }
                    else if (this.model.get('status') == 'C' || this.model.get('status') == 'P')
                    {
                        this.previewCampaign();
                    }
                    else {
                        this.openCampaign();
                    }
                },
                reportShow: function () {
                    var camp_id = this.model.get('campNum.encode');
                    if(camp_id){
                        this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id}, type: '', title: 'Loading...', url: 'reports/summary/summary', workspace_id: 'summary_' + this.model.get('campNum.checksum'), tab_icon: 'campaign-summary-icon'});
                    }
                },
                showEllipsis: function () {
                    var totalTagsWidth = 0;
                    var isElipsis = true;
                    $.each(this.$el.find("#campaign_tag_camp li a"), _.bind(function (k, val) {
                        totalTagsWidth = $(val).outerWidth() + parseInt(totalTagsWidth);
                        if (totalTagsWidth > 284) {
                            if (isElipsis) {
                                var eplisis = $('<i class="ellipsis">...</i><div class="clearfix"></div>');
                                $(val).parent().before(eplisis);
                                //eplisis.click(_.bind(this.expandTags,this));
                                isElipsis = false;
                                this.$el.find("#campaign_tag_camp ul").addClass('overflow');
                            }
                        }
                    }, this));
                    console.log(totalTagsWidth);
                }
                ,
                checkUncheck: function (obj) {
                    var addBtn = $.getObj(obj, "a");
                    if (addBtn.hasClass("unchecked")) {
                        addBtn.removeClass("unchecked").addClass("checkedadded");
                    }
                    else {
                        addBtn.removeClass("checkedadded").addClass("unchecked");
                    }
                    if (this.sub.createCampaignChart) {
                        this.sub.createCampaignChart();
                    }
                },
                addRemoveRow: function(){
                    if(!this.isAddRemove){ return false;}
                    if (this.addClass) {
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.sub.addToCol2(this.model);
                            this.$el.hide();
                        }, this));
                    }
                    else{
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.sub.adToCol1(this.model);
                            this.$el.remove();
                        }, this));
                    }
                }

            });
        });