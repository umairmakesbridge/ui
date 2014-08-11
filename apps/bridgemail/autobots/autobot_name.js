/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobot_name.html', 'jquery.searchcontrol', 'jquery.icheck', 'jquery.chosen'],
        function(template, searchcontrol, iCheck, choosen) {
            'use strict';
            return Backbone.View.extend({
                events: {
                    'click .close-autobot': 'closeAutobot',
                    'click .next-action': 'nextAction',
                    'keyup #txtAutobotName': 'captureEnterKey'
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.autobotName = "";
                    this.model = null;
                    this.campNum = null;
                    this.render();
                    var that = this;
                    setTimeout(function() {
                        $(that.el).find('#txtAutobotName').focus();
                    }, 100);

                },
                render: function() {
                    this.$el.html(this.template());
                },
                closeAutobot: function() {
                    $(this.el).remove();
                    $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove();
                    $('.autobots-modal-in').remove();
                },
                captureEnterKey: function(e) {
                    var key = e.keyCode || e.which;
                    if (key == 13) {
                        this.nextAction();
                    }
                },
                getCaption:function(){
                    var caption = ""; 
                    switch (this.options.actionType) {
                       case "E":
                           if (this.options.botType == "B") {
                                caption =  "Enter name for birthday bot";
                            } else {
                                caption = "Enter name for email bot";
                            }
                            break;
                        case "SC":
                            caption = "Enter name for score bot";
                            break;
                        case "A":
                            caption = "Enter name for alert bot";
                            break;
                        case "TG":
                            caption = "Enter name for tag bot";
                            break;
                    }
                    return caption;
                },
                nextAction: function(ev) {
                    var that = this;
                    this.autobotName = $(this.el).find('#txtAutobotName').val();
                    if (!this.autobotName) {
                        this.options.app.showError({
                            control: $(this.el).find('.uid-container'),
                            message: "Autobot Name can not be empty!"
                        });
                          if (that.msieversion()){ //test for MSIE x.x;
                                      $(that.el).find('.errortext').css({'right': '6px'});
                                    }else{
                                        $(that.el).find('.errortext').css({'right': '5px'});
                                    }
                        $(this.el).find('#txtAutobotName').focus();
                        return;
                    }
                    that.options.app.showLoading('Saving bot....', $("#new_autobot"));
                    this.saveAutobotData(this.options.actionType, this.options.botType);                    

                },
                chooseAutobotType: function(botId) {
                    this.botId = botId;
                    this.options.listing.fetchBots(0,botId);
                    //this.getAutobotModel(botId) ;
                    return;
                    switch (this.options.actionType) {
                        case "E":
                            $(this.el).remove();
                            //this.getAutobotById('dialog', this.botId);
                            if (this.options.botType == "B") {
                                this.openBirthDayAutobot();
                            } else {
                                this.openEmailAutobot();
                            }
                            break;
                        case "SC":
                            $(this.el).remove();

                            this.openScoreAutobot();
                            break;
                        case "A":
                            $(this.el).remove();
                            this.openAlertAutobot();
                            break;
                        case "TG":
                            $(this.el).remove();
                            this.openTagAutobot();
                            break;
                    }

                    $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove();

                },
             msieversion:function() {
                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");

                if (msie > 0)      // If Internet Explorer, return version number
                    return true;
                else                 // If another browser, return 0
                    return false;
             },
                saveAutobotData: function(actionType, bType) {
                    var post_data = {label: this.autobotName, actionType: actionType, botType: bType};
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.options.app.get('bms_token') + "&type=create";
                    var result = false;
                    var that = this;
                    $.post(URL, post_data)
                            .done(function(data) {
                                var _json = jQuery.parseJSON(data);
                                that.options.app.showLoading(false, $("#new_autobot"));
                                if (_json[0] !== "err") {
                                    that.chooseAutobotType(_json[2]);
                                    that.closeAutobot();
                                }
                                else {
                                    that.options.app.showError({
                                        control: $(that.el).find('.uid-container'),
                                        message: _json[1]
                                    });
                                    if (that.msieversion()){ //test for MSIE x.x;
                                      $(that.el).find('.errortext').css({'right': '6px'});
                                    }else{
                                        $(that.el).find('.errortext').css({'right': '5px'});
                                    }
                                    
                                    $(that.el).find('#txtAutobotName').focus();
                                    return;
                                }
                                return result;
                            });


                },
                //1
                openAlertAutobot: function() {
                    var that = this;
                    var dialog_width = 80;
                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.options.app.showDialog({
                        title: this.autobotName,
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    that.options.app.showLoading('Loading Alert Autobots....', dialog.getBody());
                    require(["autobots/alert", ], function(Alert) {
                        var mPage = new Alert({refer: that, dialog: dialog, botId: that.botId, name: that.autobotName, botType: that.options.botType, app: that.options.app});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.saveAlertAutobot, mPage));
                        that.options.app.showLoading(false, dialog.getBody());
                        var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                        dialog.getFooter().append(btn);
                        //dialog.getFooter().prepend("<span style='display:inline-block; padding-top:5px; padding-right:10px'> <em>When you done with the changes, please don't forget to press save button.</em> </span>")
                    });
                },
                //2
                openEmailAutobot: function(campNum) {
                    var that = this;
                    var dialog_width = 80;

                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.options.app.showDialog({
                        title: this.autobotName,
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    that.options.app.showLoading('Loading Email Autobots....', dialog.getBody());
                    require(["autobots/email", ], function(Alert) {
                        var mPage = new Alert({refer: that, dialog: dialog, botId: that.botId, name: that.autobotName, botType: that.options.botType, app: that.options.app, campNum: that.campNum, model: that.model});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.saveEmailAutobot, mPage));
                        that.options.app.showLoading(false, dialog.getBody());
                        var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                        dialog.getFooter().append(btn);
                        //dialog.getFooter().prepend("<span style='display:inline-block; padding-top:5px; padding-right:10px'> <em>When you done with the changes, please don't forget to press save button.</em> </span>")
                    });
                },
                //3
                openTagAutobot: function() {
                    var that = this;
                    var dialog_width = 80;
                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.options.app.showDialog({
                        title: this.autobotName,
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: true,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    that.options.app.showLoading('Loading Tag Autobots....', dialog.getBody());
                    require(["autobots/tag", ], function(Alert) {
                        var mPage = new Alert({refer: that, dialog: dialog, botId: that.botId, name: that.autobotName, botType: that.options.botType, app: that.options.app});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.saveTagAutobot, mPage));
                        that.options.app.showLoading(false, dialog.getBody());
                        var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                        dialog.getFooter().append(btn);
                       // dialog.getFooter().prepend("<span style='display:inline-block; padding-top:5px; padding-right:10px'> <em>When you done with the changes, please don't forget to press save button.</em> </span>")
                    });
                },
                //4
                openScoreAutobot: function() {
                    var that = this;
                    var dialog_width = 80;
                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.options.app.showDialog({
                        title: this.autobotName,
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    that.options.app.showLoading('Loading Score Autobots....', dialog.getBody());
                    require(["autobots/score", ], function(Alert) {
                        var mPage = new Alert({dialog: dialog, refer: that, botId: that.botId, name: that.autobotName, botType: that.options.botType, app: that.options.app});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.saveScoreAutobot, mPage));
                        that.options.app.showLoading(false, dialog.getBody());
                        var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                        dialog.getFooter().append(btn);
                    });
                }, //5
                openBirthDayAutobot: function() {
                    var that = this;
                    var dialog_width = 80;
                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.options.app.showDialog({
                        title: this.autobotName,
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                         bodyCss: {"min-height": dialog_height + "px"}
                    });
                    that.options.app.showLoading('Loading Birthday Autobots....', dialog.getBody());
                    require(["autobots/birthday", ], function(Alert) {
                        var mPage = new Alert({refer: that, dialog: dialog, botId: that.botId, name: that.autobotName, botType: that.options.botType, app: that.options.app, campNum: that.campNum, model: that.model});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.saveBirthDayAutobot, mPage));
                        that.options.app.showLoading(false, dialog.getBody());
                        var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                        dialog.getFooter().append(btn);
                    });
                },
                deleteAutobot: function(where, id, loc) {
                    var that = this;
                    var botId, location;
                    if (where == "dialog") {
                        botId = id;
                        location = loc;
                    } else {
                        location = this.$el;
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
                                            that.options.page.topCounts();
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
                                    // that.getAutobotById(where,botId);
                                    // that.options.page.topCounts();

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
                                    //  that.getAutobotById(where,botId);
                                    //  that.options.page.topCounts();
                                }
                            });
                },
                cloneAutobot: function(where, id) {
                    var that = this;
                    if (where == "dialog") {
                        var botId = id;
                    }
                    this.getAutobotById('dialog', id);
                    var dialog = this.options.app.showDialog({title: 'Copy Autobot',
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Create Autobot'}}
                    });
                    this.options.app.showLoading("Loading...", dialog.getBody());
                    require(["autobots/clone_autobot"], _.bind(function(autobot) {
                        var mPage = new autobot({page: that, model: that.model, copydialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        mPage.init();
                        dialog.saveCallBack(_.bind(mPage.copyAutobot, mPage));
                    }, this));
                },
                getAutobotById: function(where, id) {
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.botId;
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
                        return m;


                    });
                },
                 getAutobotModel: function(botId) {
                    
                    var that = this;
                    var bms_token = that.options.app.get('bms_token');
                    var url = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + bms_token + "&type=get&botId=" + botId;
                    jQuery.getJSON(url, function(tsv, state, xhr) {
                        var autobot = jQuery.parseJSON(xhr.responseText);
                        if (that.options.app.checkError(autobot)) {
                            return false;
                        }
                        var m = new Backbone.Model(autobot);
                         
                          require(["autobots/autobots_tile", ], function(Tile) {
                          var mPage = new Tile({model: m, app: that.options.app, page: that});;
                          mPage.editAutobot(botId);
                        });

                    });
                },
            });
        });
