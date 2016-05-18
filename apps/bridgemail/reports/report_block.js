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
                    "click .show-detail": "previewObject",
                    "click .rp-detail-report": "reportShow",
                    "click .rpclose": "removeFromReport",
                    "click #triangle-bottomleft": "addRemoveRow",
                    "click .submissionview": "showformSubmits",
                    "click .rp-ntdetail-report": "ntReportShow",
                    "click .showresponsivesstag":"showPercentDiv"
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.page
                    this.app = this.sub.app;
                    this.type = this.options.type;
                    this.hideCheckbox = this.options.hideCheckbox ? this.options.hideCheckbox : false;
                    this.subType = this.options.subType ? this.options.subType : '';
                    this.addClass = this.options.addClass ? this.options.addClass : '';
                    this.expandedView = this.options.expandedView ? true : false;
                    this.isAddRemove = this.options.isAddRemove ? true : false;
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
                    if (this.expandedView) {
                        this.$el[0].className = "rpt-campign-listing rpt-campaign-blocks";
                    }
                    if (this.type == "nurturetrack" && this.expandedView === false) {
                        this.$el.addClass("rept-data-nt");
                    } else if (this.type == "funnel") {
                        this.$el.addClass("rept-data-tagbox");
                    }

                    this.initControls();
                },
                removeFromReport: function () {
                    if (this.isAddRemove) {
                        this.addRemoveRow();
                        return false;
                    }
                    var delIndex = -1;
                    if (this.type == "campaign") {
                        _.each(this.sub.modelArray, function (val, index) {
                            if (val.get("campNum.checksum") == this.model.get("campNum.checksum")) {
                                delIndex = index;
                            }
                        }, this);
                        this.sub.modelArray.splice(delIndex, 1);
                        if (this.expandedView) {
                            this.sub.loadCampaignsSummary();
                        } else {
                            this.sub.createCampaigns();
                        }
                    } else if (this.type == "page") {
                        _.each(this.sub.modelArray, function (val, index) {
                            if (val.get("pageId.checksum") == this.model.get("pageId.checksum")) {
                                delIndex = index;
                            }
                        }, this);
                        this.sub.modelArray.splice(delIndex, 1);
                        if (this.expandedView) {
                            this.sub.loadPagesSummary();
                        } else {
                            this.sub.createPages();
                        }
                    } else if (this.type == "form") {
                        _.each(this.sub.modelArray, function (val, index) {
                            if (val.get("formId.checksum") == this.model.get("formId.checksum")) {
                                delIndex = index;
                            }
                        }, this);
                        this.sub.modelArray.splice(delIndex, 1);
                        if (this.expandedView) {
                            this.sub.loadSignupformsSummary();
                        } else {
                            this.sub.createSignupForms();
                        }
                    } else if (this.type == "autobot") {
                        _.each(this.sub.modelArray, function (val, index) {
                            if (val.get("botId.checksum") == this.model.get("botId.checksum")) {
                                delIndex = index;
                            }
                        }, this);
                        this.sub.modelArray.splice(delIndex, 1);
                        if (this.expandedView) {
                            this.sub.loadAutobotsSummary();
                        } else {
                            this.sub.createAutobots();
                        }
                    } else if (this.type == "tag") {
                        _.each(this.sub.modelArray, function (val, index) {
                            if (val.get("tag") == this.model.get("tag")) {
                                delIndex = index;
                            }
                        }, this);
                        this.sub.modelArray.splice(delIndex, 1);
                        if (this.expandedView) {
                            this.sub.loadTagsSummary();
                        } else {
                            this.sub.createTags();
                        }
                    } else if (this.type == "funnel") {
                        var selectedLevel = this.sub.$(".funnel-tabs-btns .active").attr("data-tab");
                        selectedLevel = parseInt(selectedLevel) - 1;
                        _.each(this.sub.modelArray[selectedLevel], function (val, index) {
                            if (val.get("tag") == this.model.get("tag")) {
                                delIndex = index;
                            }
                        }, this);
                        if (delIndex > -1) {
                            this.sub.modelArray[selectedLevel].splice(delIndex, 1);
                            this.sub.createFunnel();
                        }
                    } else if (this.type == "ocampaign") {
                        var oCampaigns = this.sub.modelArray[0].id.split(",");
                        _.each(oCampaigns, function (val, index) {
                            if (val == this.model.get("campNum")) {
                                delIndex = index;
                            }
                        }, this);
                        if (delIndex > -1) {
                            oCampaigns.splice(delIndex, 1);
                            delete this.sub.modelArray[0].campMapping[this.model.get("campNum")];
                            this.sub.modelArray[0].id = oCampaigns.join(",");
                            this.sub.saveSettings();
                            this.$el.remove();
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
                    } else
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
                    } else if (this.model.get('status') == 'C')
                    {
                        dtHead = 'Sent Date';
                        datetime = this.model.get('scheduledDate');
                    } else if (this.model.get('status') == 'D')
                    {
                        dtHead = 'Last Edited';
                        if (this.model.get('updationDate'))
                            datetime = this.model.get('updationDate');
                        else
                            datetime = this.model.get('creationDate');
                    } else {
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
                    } else {
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
                    } else {
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
                    } else {
                        dateFormat = '';
                    }
                    return {dtHead: dtHead, dateTime: dateFormat}
                },
                /*
                 * 
                 * @returns Time Show for signup forms
                 */
                getFormsDate: function () {
                    var datetime = this.model.get('updationDate') ? this.model.get('updationDate') : this.model.get('creationDate');
                    var date = moment(this.app.decodeHTML(datetime), 'MM-DD-YY');
                    return date.format("DD MMM, YYYY") == "Invalid date" ? "&nbsp;" : date.format("DD MMM, YYYY");
                },
                getPlayedOn: function () {
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
                    this.$(".check-obj").on('ifChecked', _.bind(this.refreshReport, this));
                    this.$(".check-obj").on('ifUnchecked', _.bind(this.refreshReport, this));

                },
                refreshReport: function () {
                    if (this.type == "campaign") {
                        this.sub.createCampaignChart();
                    } else if (this.type == "autobot") {
                        this.sub.createAutobotChart();
                    } else if (this.type == "page") {
                        this.sub.createPageChart();
                    } else if (this.type == "form") {
                        this.sub.createSignupFormChart();
                    } else if (this.type == "tag") {
                        this.sub.createTagsChart();
                    } else if (this.type == "nurturetrack") {
                        this.sub.createNurtureTrackChart();
                    }
                },
                previewObject: function () {
                    if (this.type == "campaign" || this.type == "autobot" || this.type == "nurturetrack") {
                        this.previewCampaign();
                    } else if (this.type == "page") {
                        this.previewPage();
                    } else if (this.type == "form") {
                        this.previewForm();
                    }
                },
                previewCampaign: function () {
                    var camp_id = this.model.get('campNum.encode');
                    var camp_obj = this.sub;
                    var isTextOnly = this.model.get('isTextOnly');
                    //var appMsgs = this.app.messages[0];				
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialogTitle = "Preview";
                    if (this.type == "campaign") {
                        dialogTitle = 'Campaign Preview of &quot;' + this.model.get('name') + '&quot;';
                    } else if (this.type == "nurturetrack") {
                        dialogTitle = 'Message Preview of &quot;' + this.model.get('subject') + '&quot;';
                    } else if (this.type == "autobot") {
                        var label = "";
                        if (this.model.get('isPreset') == "Y") {
                            label = this.model.get('presetLabel');
                        } else {
                            label = this.model.get('label');
                        }
                        dialogTitle = 'Autobot Preview of &quot;' + label + '&quot;';
                        camp_id = this.model.get('actionData')[0]['campNum.encode'];
                    }
                    var dialog = camp_obj.app.showDialog({title: dialogTitle,
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
                previewPage: function () {
                    var camp_obj = this.sub;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = camp_obj.app.showDialog({title: 'Preview of landing page &quot;' + this.model.get('name') + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading Page...", dialog.getBody());
                    var preview_url = this.app.decodeHTML(this.model.get('previewURL')).replace("http", "https");
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height}); // isText to Dynamic
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                    dialog.$el.find(".pointy").remove();
                    if (this.model.get("status") == "D") {
                        var publishButton = $(' <div class="pointy" style="display:inline-block !important;opacity:1;position:absolute;margin-left:10px"> <a class="icon play24 showtooltip" title="Publish Landing Page" ></a> </div>');
                        dialog.$el.find("#dialog-title").append(publishButton);
                        publishButton.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                        publishButton.find(".play24").click(_.bind(this.publishPage, this, dialog));
                    }
                },
                previewForm: function () {
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Preview of form &quot;' + this.model.get('name') + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading Form...", dialog.getBody());
                    var preview_url = this.app.decodeHTML(this.model.get('formPreviewURL')) + "?preview=Y";
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height}); // isText to Dynamic
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
                    } else if (this.model.get('status') == 'C' || this.model.get('status') == 'P')
                    {
                        this.previewCampaign();
                    } else {
                        this.openCampaign();
                    }
                },
                reportShow: function () {
                    var camp_id = this.model.get('campNum.encode');
                    if (camp_id) {
                        this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id}, type: '', title: 'Loading...', url: 'reports/summary/summary', workspace_id: 'summary_' + this.model.get('campNum.checksum'), tab_icon: 'campaign-summary-icon'});
                    }
                },
                ntReportShow: function () {
                    var camp_id = this.model.get('campNum.encode');
                    this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id, messageNo: this.model.get("order"), trackName: this.options.page.modelArray[0].get("name"), trackId: this.options.page.modelArray[0].get("trackId.encode")}, type: '', title: 'Loading...', url: 'reports/summary/summary', workspace_id: 'summary_' + this.model.get('campNum.checksum'), tab_icon: 'campaign-summary-icon'});
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
                    } else {
                        addBtn.removeClass("checkedadded").addClass("unchecked");
                    }
                    if (this.sub.createCampaignChart) {
                        this.sub.createCampaignChart();
                    }
                },
                addRemoveRow: function () {
                    if (!this.isAddRemove) {
                        return false;
                    }
                    if (this.addClass) {
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.sub.addToCol2(this.model);
                            this.$el.hide();
                        }, this));
                    } else {
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.sub.adToCol1(this.model);
                            this.$el.remove();
                        }, this));
                    }
                }
                ,
                showformSubmits: function (ev) {
                    var that = this;
                    var formName = this.model.get("name") ? this.model.get("name") : this.model.get("tag");
                    var dialog_title = "Submissions of '" + formName + "'";
                    var formId = this.model.get('formId.encode') ? this.model.get('formId.encode') : this.model.get('id');
                    var formCheckSum = this.model.get('formId.checksum') ? this.model.get('formId.encode') : this.model.get('checkSum');
                    this.app.mainContainer.openPopulation({formId: formId, ws_title: dialog_title, formCheckSum: formCheckSum});
                    /*var dialog_width = $(document.documentElement).width()-60;
                     var dialog_height = $(document.documentElement).height()-182;
                     var dialog = that.app.showDialog({
                     title:dialog_title,
                     css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                     headerEditable:false,
                     headerIcon : 'population',
                     wrapDiv : 'rcontacts-view',
                     bodyCss:{"min-height":dialog_height+"px"},
                     //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                     });     
                     this.app.showLoading("Loading...",dialog.getBody());
                     require(["recipientscontacts/rcontacts"],function(Contacts){
                     var objContacts = new Contacts({app:that.app,listNum:formId,type:'webform',dialogHeight:dialog_height});
                     var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                     dialog.getBody().append(objContacts.$el);
                     that.app.showLoading(false, objContacts.$el.parent());
                     objContacts.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                     objContacts.$el.find('#contacts_close').remove();
                     objContacts.$el.find('.temp-filters').removeAttr('style');
                     //Autobots
                     if(that.options.type == "autobots_listing"){
                     dialog.$el.find('.modal-header .cstatus').remove();
                     dialog.$el.find('.modal-footer').find('.btn-play').hide();
                     }
                     });*/
                },
                showPercentDiv: function (ev) {
                    ev.stopPropagation();
                    var target = $(ev.target);

                    var tag = this.model.get("tag");
                    if ($('body > .percent_stats').length > 0){                        
                        $('body > .percent_stats').remove();
                    }
                    
                    $("body").append('<div class="percent_stats" style="position:absolute;z-index:101"></div>');
                    var that = this;
                    var offset = target.offset();
                    if ((offset.left + 350) > $(window).width()) {
                        $('body > .percent_stats').find('.pstats').addClass('right-side')
                        $('body > .percent_stats').css({left: offset.left-307, top: offset.top});
                    } else {
                        $('body > .percent_stats').find('.pstats').addClass('left-side')
                        $('body > .percent_stats').css({left: offset.left-11, top: offset.top});
                    }


                    that.showLoadingWheel(true, $('body > .percent_stats'));

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
                        that.showLoadingWheel(false, $('body > .percent_stats'));
                        $('body > .percent_stats').append(percentDiv);
                        if ((offset.left + 350) > $(window).width()) {
                            $('body > .percent_stats .pstats').addClass('right-side')
                        } else {
                            $('body > .percent_stats .pstats').addClass('left-side')
                        }
                    });
                    that.app.showLoading(false, $('body > .percent_stats'));
                },
                showLoadingWheel: function (isShow, target) {
                    if (isShow)
                        target.append("<div class='pstats' style='display:block; background:#01AEEE;'><div class='loading-wheel right' style='margin-left:-10px;margin-top: -5px;position: inherit!important;'></div></div></div>")
                    else {
                        var ele = target.find(".loading-wheel");
                        ele.remove();
                    }
                }

            });
        });