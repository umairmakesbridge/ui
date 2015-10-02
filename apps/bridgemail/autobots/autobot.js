/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobot.html', 'moment', 'jquery.chosen', 'bms-addbox'],
        function(template, moment, chosen, bms) {
            'use strict';
            return Backbone.View.extend({
                tagName: "tr",
                className: "erow",
                events: {
                    'click .show-sent-views': 'showPageViews',
                    'click .show-pending-views': 'showPageViews',
                    "click .delete": "deleteAutobot",
                    "click .play": "playAutobot",
                    "click .pause": "pauseAutobot",
                    "click .preview": "previewCampaign",
                    "click .edit-autobot": "editAutobot",
                    "click .copy": "cloneAutobot",
                    "click .report":"reportShow",
                    'click .row-move': 'addRowToCol2',
                    'click .row-remove': 'removeRowToCol2',                   
                    'click .check-box': 'checkUncheck'
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.parent = this.options.page;                    
                    this.app = this.parent.app;
                    this.icon = "";
                     if (this.model.get('isPreset') == "Y") {
                        this.label = this.model.get('presetLabel');
                    }else{
                        this.label = this.model.get('label');
                    }
                    this.showUseButton = this.options.showUse;
                    this.showRemoveButton = this.options.showRemove;
                    this.showCheckbox = this.options.showCheckbox;
                    this.maxWidth = this.options.maxWidth?this.options.maxWidth:'auto';
                    this.showSummaryChart = this.options.showSummaryChart;
                    this.model.on('change', this.render, this);
                    this.render();
                    $(this.el).attr('id', 'row_' + this.model.get('botId.encode'));
                },
                render: function() {
                    this.$el.html(this.template(this.model.toJSON()));
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    if(this.showUseButton){
                        this.$el.attr("data-checksum",this.model.get("botId.checksum"))
                    }
                },
                getStatus: function() {
                    if (this.model.get('status') == "D")
                        return "<a class='cstatus pclr1'> Paused </a>";
                    else if (this.model.get("status") == "R")
                        return "<a class='cstatus pclr18'> Playing </a>";
                    else if (this.model.get('status') == "P")
                        return "<a class='cstatus pclr6'> Pending </a>";
                },
                getReport:function(){
                       if(this.model.get('actionType') == "E" || this.model.get('botType') == "B")
                           return '<div class="campaign_stats showtooltip" style="width:20px;display:inline-block;float:none;" title="Click to View Chart"><a class="icon report"></a></div>';
                },
                getAutobotImage: function() {
                    var label = "";
                    switch (this.model.get('actionType')) {
                        case "SC":
                            label = "<img src='"+this.options.app.get("path")+"img/scorebot-icon.png' style='max-width:none!important;'>";
                            break;
                        case "A":
                            label = "<img src='"+this.options.app.get("path")+"img/alertbot-icon.png' style='max-width:none!important;'>";
                            break;
                        case "E":
                            this.icon = 'mailbotc18';
                            label = "<img src='"+this.options.app.get("path")+"img/mailbot-icon.png' style='max-width:none!important;'>";
                            break;
                        case "TG":
                            label = "<img src='"+this.options.app.get("path")+"img/tagbot-icon.png' style='max-width:none!important;'>";
                            break;
                    }
                     switch (this.model.get('presetType')) {
                        case "PRE.1":
                            this.icon = 'bdaybotc18g';
                            break;
                        case "PRE.2":
                            this.icon = 'meetingbotc18';
                            break;
                        case "PRE.3":
                            this.icon = 'autorespbotbotc18';
                            break;
                        case "PRE.4":
                            this.icon = 'salesalertbotc18';
                            label = "<img src='"+this.options.app.get("path")+"img/salesalertbot-icon.png' style='max-width:none!important;'>";
                            break;
                    }
                    if (this.model.get('botType') == "B" && this.model.get('actionType') == "E")
                        label = "<img src='"+this.options.app.get("path")+"img/bdaybot-icon.png' style='max-width:none!important;'>"
                    return label;
                } ,
                getPlayedOn: function() {
                    var playedOn = this.model.get('lastPlayedTime');
                    if (playedOn && this.model.get('status') != "D") {
                        return "<em>Played on</em>" + this.dateSetting(playedOn) + "</span>";
                    } else {

                        return "<em>Last edited on</em>" + this.dateSetting(this.model.get('updationTime')) + "</span>";
                    }
                },
                reportShow:function(){
                       var camp_id=this.model.get('actionData')[0]['campNum.encode'];
                       var app = this.options.app ? this.options.app : this.app;
                       app.mainContainer.addWorkSpace({params: {camp_id: camp_id,autobotId:this.model.get('botId.encode'),icon:this.icon,label:this.label},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('actionData')[0]['campNum.checksum'],tab_icon:'campaign-summary-icon'});
                  },
                dateSetting: function(sentDate) {
                    var _date = moment(sentDate, 'MM-DD-YY');
                    return _date.format("DD MMM YYYY");
                },
                isRecurring: function() {
                    if (this.model.get('isRecur') == "Y") {
                        var label = "";
                        var add_s = this.model.get('recurPeriod')=="1"?"":"s";
                        switch (this.model.get('recurType')) {
                            case"H":
                                label = "Repeat after every " + this.model.get('recurPeriod') + " hour"+add_s;
                                break;
                            case"M":
                                label = "Repeat after every " + this.model.get('recurPeriod') + " month"+add_s;
                                break;
                            case"Y":
                                label = "Repeat after every " + this.model.get('recurPeriod') + " year"+add_s;
                                break;
                            case"D":
                                label = "Repeat after every " + this.model.get('recurPeriod') + " day"+add_s;
                                break;
                            case"N":
                                if(this.model.get('recurPeriod')=="0" && this.model.get("recurTimes")=="0"){
                                    label = "Instantly";
                                }
                                else{
                                    label = "Repeat after every " + this.model.get('recurPeriod') + " minute"+add_s;
                                }
                                break;
                        }
                        add_s = this.model.get('recurTimes') =="1"?"":"s";
                        if (this.model.get('recurTimes') != "0") {
                            label = label + " , not more than " + this.model.get('recurTimes') + " time"+add_s
                        }
                        return "<a class='icon-b reoccure showtooltip' data-original-title='" + label + "'></a>";
                    } else {
                        return "";
                    }
                },
                showPageViews: function(ev) {
                    var that = this;
                    var sentAt ='';
                    var clickType;
                   if($(ev.target).hasClass('show-sent-views')){
                        clickType = "sent";
                        var status = "S";
                        sentAt = "Sent at";
                        var dialog_title = this.model.get("label") + " - Sent Population" ;
                    }else{
                        var status = "P";
                        clickType = "pending";
                        sentAt = "Scheduled for";
                        var dialog_title = this.model.get("label") + " - Pending Population" ;
                    } 
                    
                    if(this.model.get('actionType') == "E" || this.model.get('botType') == "B"){
                           var camp_id=this.model.get('actionData')[0]['campNum.encode'];
                                        var _app = this.options.app ? this.options.app: this.app;
                                        _app.mainContainer.addWorkSpace({params: {clickType:clickType,camp_id: camp_id,autobotId:this.model.get('botId.encode'),icon:this.icon,label:this.label},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('actionData')[0]['campNum.checksum'],tab_icon:'campaign-summary-icon'});
                                    }
                    //return;
                    else{
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialog = that.options.app.showDialog({
                                title:dialog_title,
                                css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                headerEditable:false,
                                headerIcon : 'population',
                                wrapDiv : 'rcontacts-view',
                                bodyCss:{"min-height":dialog_height+"px"},
                                //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                      });  
                    var botId = this.model.get('botId.encode');
                    that.options.app.showLoading('Loading Contacts....', dialog.getBody());
                    require(["recipientscontacts/rcontacts"], function(Contacts) {
                        var objContacts = new Contacts({sentAt:sentAt,app: that.options.app,status:status, botId: botId, type: 'autobots',dialogHeight:dialog_height});
                        dialog.getBody().html(objContacts.$el);
                        that.options.app.showLoading(false, dialog.getBody());
                    });
                   }
                },
                deleteAutobot: function(where, id, loc) {
                    var that = this;
                    var botId, location;
                    if (where == "dialog") {
                        botId = id;
                        location = loc;
                    } else {
                        location = $('body');
                        botId = this.model.get('botId.encode');
                    }
                    var tile = this.$el;
                    var bms_token = that.options.app.get('bms_token');
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + bms_token;
                    that.options.app.showAlertDetail({heading: 'Confirm Deletion',
                        detail: "Are you sure you want to delete this Autobot?",
                        callback: _.bind(function() {
                            that.options.app.showLoading("Deleting Autobot...", tile);
                            $.post(URL, {type: 'delete', botId: botId})
                                    .done(function(data) {
                                        that.options.app.showLoading(false, tile);
                                        var _json = jQuery.parseJSON(data);
                                        if (that.options.app.checkError(_json)) {
                                            return false;
                                        }
                                        if (_json.err) {
                                            that.options.app.showAlert(_json.err1, $("body"), {fixed: true});
                                        } else if (_json[0] == "err") {
                                            that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                        } else {
                                            that.options.app.showMessge("Autobot Deleted.");
                                            that.options.page.topCounts(true);
                                            tile.fadeOut('slow');
                                            if (where == "dialog") {
                                                that.dialog.hide();
                                            }
                                        }
                                    });
                        }, that)},
                    location);
                },
                playAutobot: function(where, id) {
                    var that = this;
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.model.get('botId.encode');
                    }
                    var tile = this.$el.find("row_" + botId);
                       var bms_token = that.options.app.get('bms_token');
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + bms_token;
                    that.options.app.showLoading("Playing Autobots...", tile);
                    $.post(URL, {type: 'play', botId: botId})
                            .done(function(data) {
                                that.options.app.showLoading(false, tile);
                                var _json = jQuery.parseJSON(data);
                                if (that.options.app.checkError(_json)) {
                                    return false;
                                }

                                if (_json.err) {
                                    that.options.app.showAlert(_json.err1, $("body"), {fixed: true});
                                } else if (_json[0] == "err") {
                                    that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                } else {
                                    that.options.app.showMessge("Autobot played.");
                                    
                                         that.parent.fetchBots();
                                     if (where == "dialog") { that.getAutobotById(where, botId);}

                                }
                            });
                },
                pauseAutobot: function(where, id) {
                    var that = this;
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.model.get('botId.encode');
                    }
                    var tile = this.$el.find("row_" + botId);
                    var bms_token = that.options.app.get('bms_token');
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + bms_token;
                    that.options.app.showLoading("Pause Autobots...", tile);
                    $.post(URL, {type: 'pause', botId: botId})
                            .done(function(data) {
                                that.options.app.showLoading(false, tile);
                                var _json = jQuery.parseJSON(data);
                                if (that.options.app.checkError(_json)) {
                                    return false;
                                }
                                if (_json.err) {
                                    that.options.app.showAlert(_json.err1, $("body"), {fixed: true});
                                } else if (_json[0] == "err") {
                                    that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                } else {
                                    that.options.app.showMessge("Autobot paused.");
                                     
                                         that.parent.fetchBots();
                                       if (where == "dialog") { that.getAutobotById(where, botId);}
                                    
                                }
                            });
                },
                cloneAutobot: function(where, id) {
                    var that = this;
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.model.get('botId.encode');
                    }
                    var dialog = this.options.app.showDialog({title: 'Copy Autobot',
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Create Autobot'}}
                    });
                    this.options.app.showLoading("Loading...", dialog.getBody());
                    require(["autobots/clone_autobot"], _.bind(function(autobot) {
                        var mPage = new autobot({page: this, copydialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        mPage.init();
                        dialog.saveCallBack(_.bind(mPage.copyAutobot, mPage));
                    }, this));
                },
                getAutobotById: function(where, id) {
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.model.get('botId.encode');
                    }
                    var that = this;
                    var bms_token = that.options.app.get('bms_token');
                    var url = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + bms_token + "&type=get&botId=" + botId;
                    jQuery.getJSON(url, function(tsv, state, xhr) {
                        var autobot = jQuery.parseJSON(xhr.responseText);
                        if (that.options.app.checkError(autobot)) {
                            return false;
                        }
                        var m = new Backbone.Model(autobot);
                        that.model = m;
                        that.render();
                        if (where == "dialog") {
                            that.dialog.hide();
                            that.editAutobot('dialog', botId);
                        }
                    });
                },
                getModel: function() {
                    return this.model;
                },
                editAutobot: function(where, id) {
                    var that = this;
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.model.get('botId.encode');
                    }
                    this.botId = botId;
                     if(this.model.get('isPreset') == "Y"){
                        if(this.model.get('presetType') == "PRE.1")
                        this.chooseBotToEdit('autobots/birthday');
                        else    
                        this.chooseBotToEdit('autobots/preset');
                        
                    return;
                    }
                    switch (this.model.get('actionType')) {
                        case "E":
                            if (this.model.get('botType') == "B") {
                                this.chooseBotToEdit('autobots/birthday');
                            } else {
                                this.chooseBotToEdit('autobots/email');
                            }
                            break;
                        case "SC":
                            this.chooseBotToEdit('autobots/score');
                            break;
                        case "A":
                            this.chooseBotToEdit('autobots/alert');
                            break;
                        case "TG":
                            this.chooseBotToEdit('autobots/tag');
                            break;
                    }
                },
                chooseBotToEdit: function(files) {
                    var that = this;
                    var dialog_width = 80;
                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.options.app.showDialog({
                        title: this.label,
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: true,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.dialog = dialog;
                    that.options.app.showLoading('Loading Autobots....', dialog.getBody());
                    require([files], function(Alert) {
                        var mPage = new Alert({origin:that.parent,refer: that, dialog: dialog, type: "edit", botId: that.model.get('botId.encode'), botType: that.model.get('botType'), app: that.options.app, model: that.model});
                        dialog.getBody().html(mPage.$el);
                        //console.log('Ok start From here for bot : ' + that.model.get('actionType'));
                        var dialogArrayLength = that.options.app.dialogArray.length; // New Dialog
                        mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                          if(that.model.get('isPreset') == "Y"){
                            if(that.model.get('presetType') == "PRE.1"){
                                 dialog.saveCallBack(_.bind(mPage.saveBirthDayAutobot, mPage));
                                    that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveBirthDayAutobot, mPage); // New Dialog
                            }else{    
                                dialog.saveCallBack(_.bind(mPage.saveFilters, mPage));
                                that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveTagAutobot, mPage); // New Dialog
                            }
                                var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                                dialog.getFooter().append(btn);
                            //dialog.getFooter().prepend("<span style='display:inline-block; padding-top:5px; padding-right:10px'> <em>When you done with the changes, please don't forget to press save button.</em> </span>")
                                that.options.app.showLoading(false, dialog.getBody());
                                that.options.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                                that.options.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                                return;

                        }
                        switch (that.model.get('actionType')) {
                            case "E":
                                if (that.model.get('botType') == "B") {
                                    dialog.saveCallBack(_.bind(mPage.saveBirthDayAutobot, mPage));
                                    that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveBirthDayAutobot, mPage); // New Dialog
                                } else {
                                    dialog.saveCallBack(_.bind(mPage.saveEmailAutobot, mPage));
                                    that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveEmailAutobot, mPage); // New Dialog
                                }
                                break;
                            case "SC":
                                dialog.saveCallBack(_.bind(mPage.saveScoreAutobot, mPage));
                                that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveScoreAutobot, mPage); // New Dialog
                                break;
                            case "A":
                                dialog.saveCallBack(_.bind(mPage.saveAlertAutobot, mPage));
                                that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveAlertAutobot, mPage); // New Dialog
                                break;
                            case "TG":
                                dialog.saveCallBack(_.bind(mPage.saveTagAutobot, mPage));
                                that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveTagAutobot, mPage); // New Dialog
                                break;
                        }
                        that.options.app.showLoading(false, dialog.getBody());
                        var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                        dialog.getFooter().append(btn);
                        that.options.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                        that.options.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                       //if (that.model.get('status') == "D")
                            //dialog.getFooter().prepend("<span style='display:inline-block; padding-top:5px; padding-right:10px'> <em>When you done with the changes, please don't forget to press save button.</em> </span>")
                    });
                },
                getTags: function() {
                    return  this.model.get('tags').split(",");
                },
                previewCampaign: function(e) {
                    var camp_name = this.label;
                    var that = this;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var app = that.options.app ? that.options.app : this.app;
                    var dialog = app.showDialog({title: 'Preview of &quot;' + camp_name + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"},                       
                    });                        
                    var preview_url = "https://" + app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + that.model.get('actionData')[0]['campNum.encode'];
                    require(["common/templatePreview"], _.bind(function(templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: that.options.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: that.model.get('actionData')[0]['campNum.encode']});
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));                     
                    e.stopPropagation();
                },
                addRowToCol2: function () {
                    if (this.showUseButton) {
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.parent.addToCol2(this.model);
                            this.$el.hide();
                        }, this));
                    }
                },
                removeRowToCol2: function () {
                    if (this.showRemoveButton) {
                        this.$el.fadeOut("fast", _.bind(function () {
                            this.parent.adToCol1(this.model);
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
                    if (this.parent.createAutobotChart) {
                        this.parent.createAutobotChart();
                    }
                }
            });
        });
