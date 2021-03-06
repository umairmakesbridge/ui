define(['text!campaigns/html/campaign_row.html', 'campaigns/copycampaign', 'common/shareObject','reports/summary/views/settings'],
        function (template, copycampaignPage, shareCommonPage,settingsPage) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber Record View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'campaign-box',
                tagName: 'tr',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .copy-camp': 'copyCampaign',
                    'click .edit-camp': 'openCampaign',
                    'click .preview-camp,.scheduleOpn-camp': 'previewCampaign',
                    'click  a.campname': 'campaignStateOpen',
                    'click .schedule-camp': 'schOpenCampaign',
                    'click .reschedule-camp': 'reschOpenCampaign',
                    'click .share-camp': 'shareCampaign',
                    'click .shared-camp':'sharedCampaigns',
                    'click .setting-camp':'openSettingsCampaigns',
                    'click .delete-camp': 'deleteCampaginDialoge',
                    'click .taglink': 'tagClick',
                    'click .report': 'reportShow',
                    'click .draft-camp': 'draftBtnClick',
                    'click .cflag': 'classFlagClick',
                    'click .row-move': 'addRowToCol2',
                    'click .row-remove': 'removeRowToCol2',
                    'click .check-box': 'checkUncheck'
                            /*'click .tag':'tagSearch'*/
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.showUseButton = this.options.showUse;
                    this.showRemoveButton = this.options.showRemove;
                    this.showCheckbox = this.options.showCheckbox;
                    this.showSummaryChart = this.options.showSummaryChart;
                    this.maxWidth = this.options.maxWidth?this.options.maxWidth:'auto';
                    this.tagTxt = '';
                    this.render();
                    this.model.on('change',this.renderRow,this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        model: this.model
                    }));

                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    if(this.showUseButton || this.showSummaryChart){
                        this.$el.attr("data-checksum",this.model.get("campNum.checksum"))
                    }
                    this.initControls();

                },
                renderRow:function(){
                    this.render();
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


                },
                openCampaign: function () {
                    var camp_id = this.model.get('campNum.encode');
                    var camp_wsid = this.model.get('campNum.checksum');
                    this.app.mainContainer.openCampaign({campid:camp_id, camp_wsid:camp_wsid,parent:this.sub});

                },
                copyCampaign: function ()
                {
                    var camp_id = this.model.get('campNum.encode');

                    var dialog_title = "Copy Campaign";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Create Campaign'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    this.sub.total_fetch = 0;
                    //require(["campaigns/copycampaign"], _.bind(function (copycampaignPage) {
                        var mPage = new copycampaignPage({camp: this.sub, camp_id: camp_id, app: this.app, copycampsdialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.copyCampaign, mPage));
                    //}, this));
                },
                shareCampaign: function(){                    
                    var dialog = this.app.showDialog({title: "Share Campaign",
                        css: {"width": "750px", "margin-left": "-375px"},
                        bodyCss: {"min-height": "350px"},
                        headerIcon: 'sharecamp',
                        buttons: {saveBtn: {text: 'Share Campaign',btnicon:'shareicon'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());                  
                    var mPage = new shareCommonPage({parent: this.sub, obj_model: this.model, app: this.app, dialog: dialog,itemNum:2});
                    dialog.getBody().html(mPage.$el);
                    dialog.saveCallBack(_.bind(mPage.shareObject, mPage));
                    
                },
                previewCampaign: function () {
                    var camp_id = this.model.get('campNum.encode');
                    var camp_obj = this.sub;
                    var isTextOnly = this.model.get('isTextOnly');                    			
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 146;
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
                deleteCampaginDialoge: function () {
                    var camp_obj = this.sub;                    
                    var camp_id = this.model.get('campNum.encode')
                    if (camp_id) {
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete?",
                            callback: _.bind(function () {
                                camp_obj.$el.parents(".ws-content.active").find(".overlay").remove();
                                this.deleteCampaign();
                            }, this)},
                        $('body'));
                        /*$(".overlay .btn-ok").click(function(){
                         $(".overlay").remove();
                         camp_obj.deleteCampaign(target.attr("id"));
                         });*/
                    }
                },
                deleteCampaign: function ()
                {
                    var camp_obj = this.sub;
                    var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=' + camp_obj.app.get('bms_token');
                    camp_obj.app.showLoading("Deleting Campaign...", camp_obj.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                    $.post(URL, {type: 'delete', campNum: this.model.get('campNum.encode')})
                            .done(_.bind(function (data) {
                                this.app.showLoading(false, camp_obj.$el.parents(".ws-content.active"));
                                var del_camp_json = jQuery.parseJSON(data);
                                /*if(camp_obj.app.checkError(del_camp_json)){
                                 return false;
                                 }*/
                                if (del_camp_json[0] !== "err") {
                                    this.app.showMessge("Campaign deleted");
                                    //camp_obj.$el.find("#area_copy_campaign .bmsgrid").remove();
                                    this.app.removeCache("campaigns");
                                    camp_obj.total_fetch = 0;
                                    //camp_obj.getallcampaigns();
                                    this.$el.fadeOut(_.bind(function () {
                                        this.$el.remove();
                                    }, this));
                                    camp_obj.headBadge();
                                    camp_obj.$el.find("#total_templates .badge").html(parseInt(camp_obj.total_Count) - 1);
                                    if ($("#wstabs li[workspace_id=campaign_" + this.model.get('campNum.encode') + "]").length) {
                                        var wp_id = $("#wstabs li[workspace_id=campaign_" + this.model.get('campNum.encode') + "]").attr('id').split("_")[2];
                                        $("#wp_li_" + wp_id + ",#workspace_" + wp_id).remove();
                                    }
                                }
                                else {
                                    camp_obj.app.showAlert(del_camp_json[1], camp_obj.$el.parents(".ws-content.active"));
                                }

                            }, this));
                },
                tagClick: function (obj) {
                    this.sub.taglinkVal = true;
                    this.tagTxt = $(obj.currentTarget).text();
                    this.app.initSearch(obj, this.sub.$el.find("#list-search"));
                },
                reportShow: function () {
                    var camp_id = this.model.get('campNum.encode');
                    this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id}, type: '', title: 'Loading...', url: 'reports/summary/summary', workspace_id: 'summary_' + this.model.get('campNum.checksum'), tab_icon: 'campaign-summary-icon'});
                },
                draftBtnClick: function () {
                    var camp_obj = this.sub;

                    var camp_id = this.model.get('campNum.encode');
                    var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    this.app.showLoading("Changing Campaign to Draft...", camp_obj.$el.parents(".ws-content.active"));
                    var camp_json = '';
                    $.post(URL, {type: 'saveStep4', campNum: camp_id, status: 'D'})
                            .done(_.bind(function (data) {
                                this.app.showLoading(false, camp_obj.$el.parents(".ws-content.active"));
                                camp_json = jQuery.parseJSON(data);
                                if (camp_json[0] == 'err')
                                {
                                    this.app.showAlert(camp_json[1], camp_obj.$el.parents(".ws-content.active"));
                                }
                                else
                                {                                    
                                    this.app.showMessge("Campaign status is Draft");
                                    camp_obj.total_fetch;
                                    camp_obj.getallcampaigns();
                                    camp_obj.headBadge();
                                    this.app.mainContainer.openCampaign({campid:camp_id});
                                }
                            }, this));
                },
                classFlagClick: function () {
                    var camp_status = this.model.get('status');
                    var camp_obj = this.sub;
                    camp_obj.$el.find('.stattype').parent().removeClass('active');
                    ;
                    switch (camp_status)
                    {
                        case "C":
                            camp_obj.$el.find('.sent').parent().addClass('active');
                            break;
                        case "P":
                            camp_obj.$el.find('.pending').parent().addClass('active');
                            break;
                        case "S":
                            camp_obj.$el.find('.scheduled').parent().addClass('active');
                            break;
                        case "D":
                            camp_obj.$el.find('.draft').parent().addClass('active');
                            break;
                    }
                    var flagMapping = {"C":"Sent","P":"Pending","S":"Scheduled","D":"Draft"}
                    camp_obj.status = camp_status;
                    camp_obj.total_fetch = 0;
                    camp_obj.searchTxt = '';
                    camp_obj.$el.find('#list-search').val('');
                    camp_obj.$el.find('#clearsearch').hide();
                    camp_obj.type = 'listNormalCampaigns';
                    camp_obj.$el.find('.stattype').parent().removeClass('active');
                    camp_obj.$el.find(".sortoption_expand").find('.spntext').html(flagMapping[camp_status]);
                    camp_obj.$el.find('[search="'+camp_status+'"]').parent().addClass('active');
                    camp_obj.getallcampaigns();
                },
                sharedCampaigns: function(){
                    var camp_obj = this.sub;
                    camp_obj.status = "F";
                    camp_obj.total_fetch = 0;
                    camp_obj.searchTxt = '';
                    camp_obj.$el.find('#list-search').val('');
                    camp_obj.$el.find('#clearsearch').hide();
                    camp_obj.type = 'myAllSharedCampaign';
                    camp_obj.$el.find('.stattype').parent().removeClass('active');
                    camp_obj.$el.find(".sortoption_expand").find('.spntext').html("My Shared");
                    camp_obj.$el.find('.myshare').parent().addClass('active');
                    camp_obj.getallcampaigns();
                },
                schOpenCampaign: function (ev) {                   
                    this.$el.parents('body').append('<div class="overlay sch-overlay"><div class="reschedule-dialog-wrap modal-body" ></div></div>');
                    this.$el.parents('body').find('.reschedule-dialog-wrap').css({'margin-left': '-170px', 'margin-top': '-223px', 'max-height': '455px'});
                    this.app.showLoading("Loading Calender...",this.$el.parents('body').find(".reschedule-dialog-wrap"));
                    var camp_id = this.model.get('campNum.encode');
                    console.log(this.model);
                    var campstates = {"init": true, datetime: {day: 0, month: 0, year: 0, hour: 0, min: 0, sec: 0}, cal: null, camp_status: 'D', sch_date: ''};
                    require(["campaigns/schedule_campaign"], _.bind(function (reschedulePage) {
                        var mPage = new reschedulePage({app: this.app, parent: this, currentStates: campstates, campNum: camp_id, rescheduled: false, hidecalender: this.hidecalender, scheduleFlag: 'schedule'});
                        this.$el.parents('body').find('.reschedule-dialog-wrap').html(mPage.$el);
                    }, this));

                },
                reschOpenCampaign: function (ev) {
                    this.$el.parents('body').append('<div class="overlay sch-overlay"><div class="reschedule-dialog-wrap modal-body"></div></div>');
                    this.$el.parents('body').find('.reschedule-dialog-wrap').css({'margin-left': '-170px', 'margin-top': '-223px', 'max-height': '455px'});

                    var camp_id = this.model.get('campNum.encode');
                    var campstates = {"init": true, datetime: {day: 0, month: 0, year: 0, hour: 0, min: 0, sec: 0}, cal: null, camp_status: 'D', sch_date: ''};
                    require(["campaigns/schedule_campaign"], _.bind(function (reschedulePage) {
                        var mPage = new reschedulePage({app: this.app, parent: this, currentStates: campstates, campNum: camp_id, rescheduled: true, hidecalender: this.hidecalender, scheduleFlag: 'reschedule'});
                        this.$el.parents('body').find('.reschedule-dialog-wrap').html(mPage.$el);
                    }, this));
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
                },
                addRowToCol2: function () {
                    if (this.showUseButton) {
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.sub.addToCol2(this.model);
                            this.$el.hide();
                        }, this));
                    }
                },
                removeRowToCol2: function () {
                    if (this.showRemoveButton) {
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.sub.adToCol1(this.model);
                            this.$el.remove();
                        }, this));
                    }
                },
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
                openSettingsCampaigns : function(obj){
                  var dialog_width = 800;
                  
                  var title = 'Settings';
                  var loading = "Loading Settings...";
                  var height = 250;
                  //console.log(this.model);
                  var dialog_height = $(document.documentElement).height()-height;
                  var dialog = this.app.showDialog(
                        {           
                                    title:this.model.get('name'),
                                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                    headerEditable:false,
                                    headerIcon : 'setting2',
                                    bodyCss:{"min-height":dialog_height+"px"}                                                                          
                         });
                         
                        var mPage = new settingsPage({model:this.model,dialog:dialog,app:this.app,campId:this.model.get('campNum.encode')});
                        dialog.getBody().append(mPage.$el);
                       
                   
                }

            });
        });