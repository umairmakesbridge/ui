/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobots_tile.html', 'moment', 'jquery.chosen','common/tags_row'],
        function(template, moment, chosen,tagView) {
            'use strict';
            return Backbone.View.extend({
                tagName: "li",
                className: "span3",
                events: {
                    "click .percent": "showPercentage",
                    "mouseover .thumbnail": "showImageH",
                    "mouseout .thumbnail": "hideImageH",
                 
                    "click .deletebtn": "deleteAutobot",
                    "click .playbtn": "playAutobot",
                    "click .pausebtn": "pauseAutobot",
                    "click .previewbtn": "previewCampaign",
                    "click .edit-autobot": "editAutobot",
                    "click .copybtn": "cloneAutobot"
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.model.on('change', this.render, this);
                    this.render();
                    $(this.el).attr('id', 'row_' + this.model.get('botId.encode'));
                },
                render: function() {
                    this.$el.html(this.template(this.model.toJSON()));

                    this.$el.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.showTagsTemplate();
                },
                showTagsTemplate:function(){
                 this.tmPr =  new tagView(
                                   {parent:this,
                                    app:this.options.app,
                                    parents:this.options.page,
                                    type:'NT',
                                    helpText : 'Autobots',
                                   //tagSearchCall:_.bind(this.tagSearch,this),
                                    rowElement: this.$el,
                                    tags:this.model.get('tags')});
                      this.$el.find('.t-scroll').append(this.tmPr.$el);
                      
                } ,
                getStatus: function() {
                    if (this.model.get('status') == "D")
                        return "<a class='cstatus pclr1'> Paused </a>";
                    else if (this.model.get("status") == "R")
                        return "<a class='cstatus pclr18'> Playing </a>";
                    else if (this.model.get('status') == "P")
                        return "<a class='cstatus pclr6'> Pending </a>";
                },
                getAutobotImage: function() {
                    var label = "";
                    switch (this.model.get('actionType')) {
                        case "SC":
                            label = "<img class='img-replaced' src='img/scorebot.png'>";
                            break;
                        case "A":
                            label = "<img class='img-replaced' src='img/alertbot.png'>";
                            break;
                        case "E":
                            label = "<img class='img-replaced' src='img/mailbot.png'>";
                            break;
                        case "TG":
                            label = "<img class='img-replaced' src='img/tagbot.png'>";
                            break;
                    }
                    if (this.model.get('botType') == "B" && this.model.get('actionType') == "E")
                        label = "<img class='img-replaced' src='img/bdaybot.png'>"

                    return label;//+"botType" + this.model.get('actionType');
                },
                showImageH: function(ev) {
                    var src = this.$el.find('.img-replaced').attr('src');
                    if (typeof src != "undefined") {
                        src = src.replace(".", "-h.");
                        this.$el.find('.img-replaced').attr('src', src);
                    }

                },
                hideImageH: function(ev) {
                    var src = this.$el.find('.img-replaced').attr('src');
                    if (typeof src != "undefined") {
                        src = src.replace("-h.", ".");
                        this.$el.find('.img-replaced').attr('src', src);
                    }

                },
                showPercentage: function(ev) {
                    this.current_ws = this.$el.parents(".ws-content");
                    this.current_ws.find(".pstats").remove();
                    var str = "<div class='pstats' style='display:block;'>";
                    str = str + "<ul>";
                    if (this.model.get('sentCount') == "0") {
                        str = str + "<li class='sent'><strong>" + this.options.app.addCommas(this.model.get('sentCount')) + "</strong><span>Sent</span></li>";
                    } else {
                        str = str + "<li class='sent  '><a class='showtooltip show-sent' data-original-title='Click to view contacts'><strong >" + this.options.app.addCommas(this.model.get('sentCount')) + "</strong><span >Sent</span></a></li>";
                    }
                    if (this.model.get('pendingCount') == "0") {
                        str = str + "<li  class='pending'><strong>" + this.options.app.addCommas(this.model.get('pendingCount')) + "</strong><span>Pending</span></li>";
                    } else {
                        str = str + "<li class='pending'><a class='showtooltip  show-pending'  data-original-title='Click to view contacts'><strong  >" + this.options.app.addCommas(this.model.get('pendingCount')) + "</strong><span>Pending</span></a></li>";
                    }
                    str = str + "</ul>";
                    str = str + "</div>";
                    str = $(str);
                    var that = this;
                    $(ev.target).parents(".percent_stats").append(str);
                    this.current_ws.find(".pstats ul a.show-pending").on('click',function (e) {
                        that.showPendingPopulation();
                    });
                    this.current_ws.find(".pstats ul a.show-sent").on('click',function (e) {
                        that.showSentPopulation();
                    });
                },
                isRecurring: function() {
                    if (this.model.get('isRecur') == "Y") {
                        var label = "";
                        switch (this.model.get('recurType')) {
                            case"M":
                                label = "Repeat after every " + this.model.get('recurPeriod') + " months";
                                break;
                            case"Y":
                                label = "Repeat after every " + this.model.get('recurPeriod') + " years";
                                break;
                            case"D":
                                label = "Repeat after every " + this.model.get('recurPeriod') + " days";
                                break;
                        }
                        var label2 = label;
                        if (this.model.get('recurTimes') != "undefined" && this.model.get('recurTimes') != "0") {
                            var label2 = " , not more than " + this.model.get('recurTimes') + " time";
                            label2 = label + label2;
                            label = label + "...";
                        }
                        return "<span class='icon-b reoccure showtooltip'  style='width:15px;margin-top: -2px;margin-left: 60px;'  data-original-title='" + label2 + "'></span>";
                    } else {

                    }
                },
                getDate: function() {
                    var playedOn = this.model.get('lastPlayedTime');
                    if (playedOn && this.model.get('status') != "D") {
                        return "<em data-original-title='Played on' class='showtooltip'>" + this.dateSetting(playedOn) + "</em>";
                    } else {

                        return "<em data-original-title='Last edited on' class='showtooltip'>" + this.dateSetting(this.model.get('updationTime')) + "</e,=m>";
                    }
                },
                dateSetting: function(sentDate) {
                    var _date = moment(sentDate, 'MM-DD-YY');
                    return _date.format("DD MMM YYYY");
                },
                showSentPopulation: function(ev) {
                    var that = this;
                    var sentAt = "Sent at";
                        var status = "C";
                        var dialog_title = this.model.get("label") + " - Sent Population" ;
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
                        var objContacts = new Contacts({sentAt:sentAt,status:status,app: that.options.app, botId: botId, type: 'autobots',dialogHeight:dialog_height});
                        dialog.getBody().html(objContacts.$el);
                        that.options.app.showLoading(false, dialog.getBody());

                    });
                },
                showPendingPopulation:function(){
                    var that = this;
                      var status = "P";
                        var sentAt = "Scheduled on";
                        var dialog_title = this.model.get("label") + " - Pending Population" ;
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
                        var objContacts = new Contacts({sentAt:sentAt,status:status,app: that.options.app, botId: botId, type: 'autobots',dialogHeight:dialog_height});
                        dialog.getBody().html(objContacts.$el);
                        that.options.app.showLoading(false, dialog.getBody());

                    });  
                } ,
               
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
                        }, $('body'))},
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
                                    that.getAutobotById(where, botId);
                                    that.options.page.topCounts();

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
                    //that.options.app.showLoading("Pause Autobots...",tile);
                    $.post(URL, {type: 'pause', botId: botId})
                            .done(function(data) {
                                // that.options.app.showLoading(false,tile);   
                                var _json = jQuery.parseJSON(data);
                                if (_json.err) {
                                    that.options.app.showAlert(_json.err1, $("body"), {fixed: true});
                                } else if (_json[0] == "err") {
                                    that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                } else {
                                    that.options.app.showMessge("Autobot paused.");
                                    that.getAutobotById(where, botId);
                                    that.options.page.topCounts();
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
                        //console.log(that.model);
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
                previewCampaign: function(e) {
                    var camp_name = this.model.get('label');
                    var that = this;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = that.options.app.showDialog({title: 'Campaign Preview of &quot;' + camp_name + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"},
                        //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                    });
                    //var preview_url = "https://"+that.options.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+that.campNum+"&html=Y&original=N";    
                    var preview_url = "https://" + that.options.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + that.model.get('actionData')[0]['campNum.encode'];
                    require(["common/templatePreview"], _.bind(function(templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: that.options.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: that.model.get('actionData')[0]['campNum.encode']});
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
//                        var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\""+preview_url+"\"></iframe>");                            
//                        dialog.getBody().html(preview_iframe);               
//                        dialog.saveCallBack(_.bind(that.sendTextPreview,that,that.campNum));                        
                    e.stopPropagation();
                },
                editAutobot: function(where, id) {
                    var that = this;
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.model.get('botId.encode');
                    }
                    this.botId = botId;
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
                        title: this.model.get('label'),
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.dialog = dialog;
                    that.options.app.showLoading('Loading Autobots....', dialog.getBody());
                    require([files], function(Alert) {
                        var mPage = new Alert({refer: that, dialog: dialog, type: "edit", botId: that.model.get('botId.encode'), botType: that.model.get('botType'), app: that.options.app, model: that.model});
                        dialog.getBody().html(mPage.$el);
                        switch (that.model.get('actionType')) {
                            case "E":
                                if (that.model.get('botType') == "B") {
                                    dialog.saveCallBack(_.bind(mPage.saveBirthDayAutobot, mPage));
                                } else {
                                    dialog.saveCallBack(_.bind(mPage.saveEmailAutobot, mPage));
                                }
                                break;
                            case "SC":
                                dialog.saveCallBack(_.bind(mPage.saveScoreAutobot, mPage));
                                break;
                            case "A":
                                dialog.saveCallBack(_.bind(mPage.saveAlertAutobot, mPage));
                                break;
                            case "TG":
                                dialog.saveCallBack(_.bind(mPage.saveTagAutobot, mPage));
                                break;
                        }
                            var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                            dialog.getFooter().append(btn);
                            //dialog.getFooter().prepend("<span style='display:inline-block; padding-top:5px; padding-right:10px'> <em>When you done with the changes, please don't forget to press save button.</em> </span>")
                        that.options.app.showLoading(false, dialog.getBody());

                    });
                },
                getTags: function() {
                    ///if(typeof this.model.get('actionData')[0].actionTags != "undefined" && this.model.get('actionData')[0].actionTags !="")
                    return  this.model.get('tags').split(",");//this.model.get('actionData')[0].actionTags.split(",");


                },
                autoLoadBotImages:function(){
                 var preLoadArray = ['img/trans_gray.png','img/recurring.gif','img/loading.gif','img/spinner-medium.gif','img/greenloader.gif','img/loader.gif']
                 $(preLoadArray).each(function() {
                    var image = $('<img />').attr('src', this);                    
                 });
             }
            });
        });
 