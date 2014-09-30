/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/preset.html','jquery.icheck','bms-tags'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                className: "botpanel",
                tagName: "div",
                events: {
                    "click .add-targets": "loadTargets",
                    "click .add-tag": "chooseTags",
                    "change #ddlIsRecur": "changeSetting",
                    "change #ddlendless": "showRecurInput",
                    "mouseover .sumry": 'showButtons',
                    "mouseout .sumry": "hideButtons",
                    "click .small-edit": "editMessage",
                    "click #preivew_bot": "previewCampaign"
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.model = null;
                    this.botType = null;
                    this.triggers = null;
                    this.dialog = this.options.dialog;
                    this.getAutobotById();
                },
                getAutobotById: function() {
                    var that = this;
                    var name = this.dialog.$("#dialog-title span").html();
                    that.options.app.showLoading("Loading "+name+"...", that.$el);
                    var bms_token = that.options.app.get('bms_token');
                    var url = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + bms_token + "&type=get&botId=" + this.options.botId;
                    jQuery.getJSON(url, function(tsv, state, xhr) {
                        var autobot = jQuery.parseJSON(xhr.responseText);
                        if (that.options.app.checkError(autobot)) {
                            return false;
                        }
                        var m = new Backbone.Model(autobot);
                        that.model = m;
                        that.template = _.template(template);
                        that.app = that.options.app;
                        that.dialog = that.options.dialog;
                        that.targetsModel = null;
                        that.filterNumber = null;
                         that.alertMessage = that.model.get('actionData')[0].alertMessage;
                        that.alertEmails = that.model.get('actionData')[0].alertEmails;
                        that.status = that.model.get('status');
                        that.botId = that.model.get('botId.encode');
                        that.messageLabel = that.model.get("subject");
                        that.triggerOrder = "";
                        if (!that.messageLabel) {
                            that.messageLabel = 'Subject line goes here ...';
                        }
                        that.object = that.model.get('actionData');    
                        that.campNum = that.model.get('actionData')[0]['campNum.encode'];
                        that.filterNumber = that.model.get('filterNumber.encode');
                        if (that.status == "D"){
                            that.editable = false;
                            $('.modal').find('.modal-footer').find('.btn-save').addClass('btn-green').removeClass('btn-blue');
                        }else{
                            that.editable = true;
                            
                        }
                        that.mainTags = "";
                        that.render();
                        
                       
                    });
                },
                 checkMailMessages: function() {
                    var text = "<a class='btn-blue left edit-message' style='margin-right:10px;'><span class='right'>   Edit Message</span><i class='icon edit left'></i></a>";
                    text = text + "<a class='btn-blue left preview-message'><span class='right'>   Preview</span><i class='icon preview24 left'></i></a>";
                    this.$el.find(".sumry .last-row").append("<div class='btns btn-show' style='float: right;position: absolute;right: 1px;bottom:  0px;'>" + text + "</div>");
                    var that = this;
                    this.$el.find(".sumry .last-row").find(".preview-message").on('click', function() {
                        that.previewCampaign();
                    });
                    this.$el.find(".sumry .last-row").find(".edit-message").on('click', function() {
                        that.editMessage();
                    });
                },
                render: function() {
                    this.$el.html(this.template());
                    if(this.botType == "SR"){
                        this.$el.find('#alert').show();
                    }else if(this.botType == "MT"){
                        this.$el.find('#meetingmessage').show();
                    }else if(this.botType == "AR"){
                        this.$el.find('#responsemessage').show();
                    }
                     this.showTags();
                    this.getFiltersById();
                    this.loadCampaign();
                     if(this.alertEmails)
                     this.$el.find("#alertemails").val(this.options.app.decodeHTML(this.alertEmails));
                    if(this.alertMessage)
                        this.$el.find("#alertmessage").val(this.options.app.decodeHTML(this.alertMessage));
                    this.$el.find("#ddlclickdays").chosen({no_results_text: 'Oops, nothing found!', style: "float:none!important", width: "120px", disable_search: "true"});
                    this.$el.find("#ddlpagedays").chosen({no_results_text: 'Oops, nothing found!', style: "float:none!important", width: "120px", disable_search: "true"});
                    this.$el.find("#ddlformsubmission").chosen({no_results_text: 'Oops, nothing found!', style: "float:none!important", width: "220px", disable_search: "true"});
                    this.$el.find("#ddlsalestatus").chosen({no_results_text: 'Oops, nothing found!', style: "float:none!important", width: "220px", disable_search: "true"});
                    this.$el.find('#wrap_email').mergefields({autobot: true, app: this.app, config: {emailType: true, state: 'dialog'}, elementID: 'merge_field_plugin', placeholder_text: '{{LASTNAME}}', class: "show-top"});
                    
                    this.checkMailMessages();
                      this.dialog.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                     this.options.app.showLoading(false, this.$el);
                 }, 
                  showButtons: function() { 
                    this.$el.find(".btn-show").show();
                },
                hideButtons: function() {
                    this.$el.find(".btn-show").hide();
                },
                 getFiltersById:function(){
                    var that = this;
                      that.pageViews = {};
                                that.clickViews = {};
                                that.forms = {};
                                that.saleStatus = {};
                    var URL = '/pms/io/filters/getTargetInfo/?BMS_REQ_TK=' + this.options.app.get('bms_token') + '&type=get&filterNumber=' + this.model.get('filterNumber.encode');
                     jQuery.getJSON(URL, function(tsv, state, xhr) {
                         var targets = jQuery.parseJSON(xhr.responseText); 
                            that.triggers = targets.triggers; 
                               
                                        if(that.triggers && that.triggers != null){
                                        _.each(that.triggers[0],function(elem,idx){
                                            if(elem[0].type == "W")
                                            that.pageViews = elem[0];
                                            if(elem[0].type == "E")
                                            that.clickViews = elem[0];
                                            if(elem[0].type == "F")
                                            that.forms = elem[0];
                                            if(elem[0].type == "P")
                                            that.saleStatus = elem[0];
                                            })
                                     }
                            if(that.model.get('presetType') == "PRE.3"){
                                that.$el.find('.emailclicks-submit').hide();
                                that.$el.find('.pageviews-submit').hide();
                                that.$el.find('.form-score').hide();
                                that.$el.find('.ifs').hide();
                                that.$el.find('#ddlif').val('A');
                                that.$el.find('#ddlif_chosen').hide();
                                
                                that.addFormFilter();
                            }else{
                                
                                that.addPageViwes();
                                that.addEmailClicks();
                                that.addFormFilter();   
                                that.addLeadScoreFilter();
                            }

                            
                            that.$('input:checkbox').iCheck({
                                checkboxClass: 'checkinput'
                            });
                            that.$('input.checkpanel').iCheck({
                                checkboxClass: 'checkpanelinput',
                                insert: '<div class="icheck_line-icon" style="margin: 20px 0px 0px 7px!important;"></div>'
                            });
                            that.$el.find("#ddlif").val(targets.applyRuleCount); 
                            that.$el.find("#ddlif").chosen({no_results_text: 'Oops, nothing found!', style: "float:none!important", width: "80px", disable_search: "true"});
                            if(that.model.get('presetType') == "PRE.3"){that.$el.find('#ddlif_chosen').hide();}
                    }, this);
                    
                 },
                 getPresetTitle:function(info){
                     var label = "";
                     var information = "I will keep updating score <em>everyday</em> to contacts matched in the filter.";
                      switch (this.model.get('presetType')) {
                        case "PRE.1":
                            label = "Alert my <span>sales reps</span> ";
                            information = "I will keep updating score everyday to contacts matched in the filter to every contact matched in the filter.";
                            break;
                        case "PRE.2":
                            this.botType = "MT";
                            label = "<span>Send a meeting request </span> ";
                            information = "I will send meeting request message <em>once</em> for every contact matched in the filter.";
                            break;
                        case "PRE.3":
                            this.botType = "AR";
                            label = "Choose a form to send an <span>auto responder message</span>";
                            information = "I will send auto responder message <em>once</em> for every contact that submitted against this form."
                            break;
                        case "PRE.4":
                            this.botType = "SR";
                            label = "Alert my <span>sales reps</span> ";
                            information = "I will keep updating sales reps once to contacts matched in the filter to every contact matched in the filter.";
                            break;
                        case "PRE.5":
                            label = label ="Score will be updated by <span>+10</span>  ";
                            break;
                        case "PRE.6":
                            label = "Score will be updated by <span>+50</span>  ";
                            break;
                         case "PRE.7":
                            label ="Score will be updated by <span>+100</span>  ";
                            break;
                    }
                    if(info == 1)
                        return information;
                    else
                        return label;
                 },
                 getPresetImage:function(){
                     var label = "";
                        switch (this.model.get('presetType')) {
                        case "PRE.1":
                            label = "<img class='img-replaced' src='"+this.options.app.get("path")+"img/bdaybot-h.png'>";
                            break;
                        case "PRE.2":
                            label = "<img class='img-replaced' src='"+this.options.app.get("path")+"img/meetingalertbot-h.png'>";
                            break;
                        case "PRE.3":
                            label = "<img class='img-replaced' src='"+this.options.app.get("path")+"img/autorespbot-h.png'>";
                            break;
                        case "PRE.4":
                            label = "<img class='img-replaced' src='"+this.options.app.get("path")+"img/salesalertbot-h.png'>";
                            break;
                        case "PRE.5":
                            label = "<img class='img-replaced' src='"+this.options.app.get("path")+"img/score10bot-h.png'>";
                            break;
                        case "PRE.6":
                            label = "<img class='img-replaced' src='"+this.options.app.get("path")+"img/score50bot-h.png'>";
                            break;
                         case "PRE.7":
                            label = "<img class='img-replaced' src='"+this.options.app.get("path")+"img/score100bot-h.png'>";
                            break;
                    }
                    return label;
                 },
                changeSetting: function(ev) {
                    var selected = $(ev.target).val();
                    if (selected == "N") {
                        this.$el.find("#show_other").hide();
                        this.$el.find("#spnhelptext").show();
                    } else {
                        this.$el.find("#show_other").show();
                        this.$el.find("#spnhelptext").hide();
                    }
                },
                showRecurInput: function(ev) {
                    var selected = $(ev.target).val();
                    if (selected == "0") {
                        this.$el.find(".show-recur-period").hide();
                    } else {
                        this.$el.find(".show-recur-period").css('display', 'inline-block');
                    }
                },
                loadTargets: function() {
                    var dialog_object = {title: 'Select Targets',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                    var dialog = this.options.app.showDialog(dialog_object);

                    this.options.app.showLoading("Loading Targets...", dialog.getBody());
                    var that = this;
                    require(["target/recipients_targets"], _.bind(function(page) {
                        var targetsPage = new page({page: this, dialog: dialog, editable: that.editable, type: "autobots", showUseButton: true});
                        dialog.getBody().append(targetsPage.$el);
                        this.app.showLoading(false, targetsPage.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        targetsPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        dialog.$el.find('.modal-header .cstatus').remove();
                        dialog.$el.find('.modal-footer').find('.btn-play').hide();

                    }, this));

                },
                getStatus: function() {
                    if (this.status == "D")
                      return ["Paused", "pclr1"];
                    else if (this.status == "R")
                      return ["Playing", "pclr18"];
                    else if (this.status == "P")
                      return ["Pending", "pclr6"];
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
                    var preview_url = "https://" + that.options.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + this.campNum;
                    require(["common/templatePreview"], _.bind(function(templatePreview) {

                        var tmPr = new templatePreview({frameSrc: preview_url, app: that.options.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: this.campNum,isText:this.camp_json.isTextOnly});
                        dialog.getBody().append(tmPr.$el);
                        tmPr.app.showLoading(false, tmPr.$el.parent());
                        tmPr.init();
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        tmPr.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         dialog.$el.find('.modal-header .cstatus').remove();
                         dialog.$el.find('.modal-footer').find('.btn-play').hide();
                         dialog.$el.find('.modal-footer').find('.btn-save').removeClass('btn-green').addClass('btn-blue');
                    }, this));
//                        var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\""+preview_url+"\"></iframe>");                            
//                        dialog.getBody().html(preview_iframe);               
//                        dialog.saveCallBack(_.bind(that.sendTextPreview,that,that.campNum));                        
                    //e.stopPropagation();
                },
                loadCampaign: function() {
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.campNum + "&type=basic";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        var camp_json = jQuery.parseJSON(xhr.responseText);
                        this.camp_json = camp_json;
                        this.$(".camp-subject").html(this.app.encodeHTML(camp_json.subject));
                        if (camp_json.subject) {
                            this.$(".title").html(this.app.encodeHTML(camp_json.subject));
                            this.messageLabel = this.app.encodeHTML(camp_json.subject);
                        }
                        else {
                            this.messageLabel = 'Subject line goes here ...';
                            this.$(".title").html('Subject line goes here ...');
                            this.$(".camp-subject").html('Subject line goes here ...');
                        }
                        this.$(".camp-fromemail").html(this.app.encodeHTML(camp_json.fromEmail));
                        var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        if (merge_field_patt.test(this.app.decodeHTML(camp_json.fromEmail)) && camp_json.defaultFromEmail) {
                            this.$(".camp-fromemail").append($('<em >Default Value: <i >' + this.app.encodeHTML(camp_json.defaultFromEmail) + '</i></em>'));
                        }
                        if (camp_json.senderName) {
                            this.$(".camp-fromname").html(this.app.encodeHTML(camp_json.senderName));
                        }
                        else {
                            this.$(".camp-fromname").html('MakesBridge Technology');
                        }
                        if (camp_json.defaultSenderName) {
                            this.$(".camp-fromname").append($('<em >Default Value: <i >' + this.app.encodeHTML(camp_json.defaultSenderName) + '</i></em>'));
                        }

                        this.$(".camp-replyto").html(this.app.encodeHTML(camp_json.replyTo));
                        if (camp_json.defaultReplyTo) {
                            this.$(".camp-replyto").append($('<em >Default Value: <i >' + this.app.encodeHTML(camp_json.defaultReplyTo) + '</i></em>'))
                        }

                    }, this));
                },
                 editMessage: function(e) {
                    //if(!this.object[0]['campNum.encode']){
                    //   this.app.showAlert('Message doesn\'t not exists',$("body"),{fixed:true});                    
                    //}
                    //else{\
                    var that = this;
                    var isEdit = true;
                        if (that.status == "D"){
                           isEdit = true;
                       }else{
                           isEdit = false;
                       }
                    var dialog_width = $(document.documentElement).width() - 50;
                    var dialog_height = $(document.documentElement).height() - 162;
                    var dialog_object = {title: this.messageLabel,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        bodyCss: {"min-height": dialog_height + "px"}
                    };

                    dialog_object["buttons"] = {saveBtn: {text: 'Save'}}

                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Settings...", dialog.getBody());
                    var that = this;
                    require(["nurturetrack/message_setting"], _.bind(function(settingPage) {
                        var sPage = new settingPage({page: this, dialog: dialog, editable: isEdit, type: "autobots", campNum: this.campNum});
                        dialog.getBody().append(sPage.$el);
                        this.app.showLoading(false, sPage.$el.parent());
                        dialog.saveCallBack(_.bind(sPage.saveCall, sPage));
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        sPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                        this.app.dialogArray[dialogArrayLength-1].currentView = sPage; // New Dialog
                        this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(sPage.saveCall,sPage); // New Dialog
                         dialog.$el.find('.modal-header .cstatus').remove();
                         dialog.$el.find('.modal-footer').find('.btn-save').addClass('btn-green').removeClass('btn-blue');
                         dialog.$el.find('.modal-footer').find('.btn-blue').hide();
                        sPage.init();
                    }, this));
                    // }

                },
                showTags: function() {
                    var tags = "";
                    if (typeof this.model != "undefined")
                        tags = this.model.get('tags');
                    this.modal = $('.modal');
                    this.modal.find('.modal-header').removeClass('ws-notags');
                    this.tagDiv = this.modal.find('.modal-header').find(".tagscont");
                    var labels = this.getStatus();
                    this.head_action_bar = this.modal.find(".modal-header .edited  h2");
                    this.head_action_bar.append("<a style='margin-top: 10px; margin-left: -10px;' class='cstatus " + labels[1] + "'>" + labels[0] + "</a>");
                    this.head_action_bar.find(".pointy").css({'padding-left': '10px', 'margin-top': '4px'});
                    if (this.status == "D") {
                         this.head_action_bar.find(".edit").addClass('play24').addClass('change-status').removeClass('edit').addClass('showtooltip').attr('data-original-title', "Click to Play").css('cursor', 'pointer');
                    } else {
                      this.head_action_bar.find(".edit").addClass('pause24').addClass('change-status').removeClass('edit').addClass('showtooltip').attr('data-original-title', "Click to Pause").css('cursor', 'pointer');
                    }
                    var that = this;
                    if (this.status != "D") {
                       // this.head_action_bar.find(".delete").hide();
                    }
                     this.head_action_bar.find(".copy").remove();//addClass('showtooltip').attr('data-original-title', "Click to Copy").css('cursor', 'pointer');
                     this.head_action_bar.find(".delete").remove();//addClass('showtooltip').attr('data-original-title', "Click to Delete").css('cursor', 'pointer');
                    this.head_action_bar.append("<div class='percent_stats'><a class='icon percent showtooltip' data-original-title='Click to see responsiveness of this target' style='margin:3px 0px 0px 0px!important;'></a></div>");
                    this.head_action_bar.find(".percent").on('click', function(ev) {
                        that.showPercentage(ev);
                    });  
                    this.head_action_bar.find(".change-status").on('click', function() {
                        var res = false; 
                        if (that.status == "D") {
                            if(that.saveTagAutobot() !=false){
                                res = that.options.refer.playAutobot('dialog', that.botId);
                            }
                        } else {
                            res = that.options.refer.pauseAutobot('dialog', that.botId);
                        }
                    })
                    this.modal = $(".modal");
                    this.modal.find('.modal-footer').find(".btn-play").on('click', function() {
                         if(that.saveTagAutobot() !=false){
                                that.options.refer.playAutobot('dialog', that.botId);
                         }
                     })
                   // this.head_action_bar.find(".copy").on('click', function() {
                      //  that.options.refer.cloneAutobot('dialog', that.botId);
                   // });
                    //this.head_action_bar.find(".delete").on('click', function() {
                      //  if (that.options.refer.deleteAutobot('dialog', that.botId, that.$el)) {
                       //     that.options.dialog.hide();
                        //}
                   // });
                    this.tagDiv.addClass("template-tag").show();
                    this.tagDiv.tags({app: this.options.app,
                        url: '/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=' + this.options.app.get('bms_token'),
                        params: {type: 'tags', botId: this.botId, tags: ''}
                        , showAddButton: false,
                        tags: tags,
                        fromDialog:this.dialog.$el,
                        callBack: _.bind(this.newTags, this),
                       // typeAheadURL: "/pms/io/user/getData/?BMS_REQ_TK=" + this.options.app.get('bms_token') + "&type=allTemplateTags"
                    });
                    
                    this.tagDiv.find('.cross').remove();
                    if (this.status != "D") {
                        this.tagDiv.addClass("not-editable");
                        this.disableAllEvents();
                    }
                },
                newTags: function(tags) {
                    if (typeof this.model != "undefined") {
                        this.model.set('tags', tags);
                    } else {
                        this.mainTags = tags;
                    }
                    this.options.refer.getAutobotById(this.botId);
                },
                saveTagAutobot: function(close) {
                    var btnSave = this.modal.find('.modal-footer').find('.btn-save');
                    btnSave.addClass('saving');
                    if (this.status != "D") {
                        this.options.refer.pauseAutobot(('dialog', this.botId));
                        this.options.app.showLoading(false, this.$el);
                        btnSave.removeClass('saving');
                        return false;
                    }
                    if(this.saveFilters()  == false){
                         this.options.app.showLoading(false, this.$el.find('.modal-body'));
                        this.options.app.showAlert('Please select atleast one filter.', $("body"), {fixed: true});
                        btnSave.removeClass('saving');
                        return false;
                    }
                    var that = this;
                    var post_data = {tags: this.mainTags, botId: this.options.botId, type: "update"};
                    if(this.botType == "SR"){
                        var alertemails = this.$el.find("#alertemails").val();
                        var alertmessages = this.$el.find("#alertmessage").val();
                        post_data['alertEmails'] = alertemails;
                        post_data['alertMessage'] = alertmessages;
                    }
                     
                    
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.options.app.get('bms_token');
                    var result = false;
                    var that = this;
                    $.post(URL, post_data)
                            .done(function(data) {
                                that.options.app.showLoading(false, that.$el.find('.modal-body'));
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    that.app.showMessge(_json[1]);
                                    result = true;
                                    if (!close) {
                                        that.options.refer.getAutobotById(that.botId);
                                        //that.options.dialog.hide();
                                        result = true;
                                    }
                                }
                                else {
                                    that.app.showAlert(_json[1], $("body"), {fixed: true});
                                    result = false;

                                }
                                btnSave.removeClass('saving');
                                return result;
                            });
                            this.options.app.showLoading(false, this.$el.find('.modal-body'));
                },
                loadTagTargets: function() {
                    var remove_cache = true;
                    var offset = 0;
                    var that = this;
                    var _data = {offset: offset, type: 'list_csv', filterNumber_csv: this.model.get('filterNumber.encode')};
                    this.tracks_bms_request = this.targetsRequest.fetch({data: _data, remove: remove_cache,
                        success: _.bind(function(collection, response) {
                            // Display items
                            if (that.app.checkError(response)) {
                                return false;
                            }

                            for (var s = offset; s < collection.length; s++) {
                                this.targetsModel = collection.at(s);
                            }
                            that.createTargets();
                        }, this),
                        error: function(collection, resp) {

                        }
                    });
                },
                createTargets: function(save) {
                    var that = this;
                    if (this.targetsModel.get('filterNumber.encode')) {
                        this.$el.find("#autobot_targets_grid tbody").children().remove();
                        that.$el.find('#autobot_targets_grid tbody').append(new recipientView({type: 'autobots_listing', model: this.targetsModel, app: that.options.app, editable: that.editable}).el);
                        if (that.status != "D") {
                            if (that.$el.find('#autobot_targets_grid tbody tr td .slide-btns .preview-target').length > 0)
                                that.$el.find('#autobot_targets_grid tbody tr td .slide-btns').addClass('one').removeClass('three');
                            else
                                that.$el.find('#autobot_targets_grid tbody tr td .slide-btns').addClass('two').removeClass('three');

                            that.$el.find('#autobot_targets_grid tbody tr td .remove-target').remove();
                        }
                        that.$el.find('#autobot_targets_grid tbody tr td .remove-target').on('click', function() {
                            that.targetsModel = null;
                            that.changeTargetText();
                            that.$el.find('#autobot_targets_grid tbody').html('');
                            that.loadTargets();
                        });

                    }
                    if (save) {
                        this.saveTargets()
                    }
                    this.changeTargetText();
                },
                addToCol2: function(model) {
                    this.targetsModel = model;
                    this.createTargets(true);

                },
                saveTargets: function() {
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    var filterNumbers = this.targetsModel.get('filterNumber.encode');
                    var that = this;
                    $.post(URL, {type: 'targets', botId: this.options.botId, filterNumber: filterNumbers})
                            .done(_.bind(function(data) {
                                that.app.showLoading(false, that.$el);
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== 'err') {
                                    that.app.showMessge(_json[1]);
                                }
                                else {
                                    that.app.showAlert(_json[0], $("body"), {fixed: true});
                                }
                            }, this));
                },
                getTargets: function() {
                    var that = this;
                    var bms_token = that.options.app.get('bms_token');
                    this.filterNumber = this.model.get('filterNumber.encode');
                    if (this.filterNumber == "") {
                        return;
                    }
                    var URL = "/pms/io/filters/getTargetInfo/?BMS_REQ_TK=" + bms_token + "&filterNumber=" + this.filterNumber + "&type=get";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (that.app.checkError(data)) {
                            return false;
                        }
                        var objRecipients = new ModelRecipient(data);
                        that.targetsModel = objRecipients;
                        that.targets = data;
                        that.changeTargetText();
                        that.createTargets();

                    });
                },
                chooseTags: function() {

                    var dialog_object = {title: 'Select Tags',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog1 = this.options.app.showDialog(dialog_object);
                    var that = this;
                    that.tags = that.tags.toString().split(',');
                    this.options.app.showLoading("Loading Tags...", dialog1.getBody());
                    require(["tags/tags"], _.bind(function(page) {
                        var Tags = new page({tags: that.tags, app: that.options.app, camp: that, dialog: dialog1, editable: true, type: "autobots",botId:that.botId});
                        dialog1.getBody().append(Tags.$el);
                        this.app.showLoading(false, Tags.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        Tags.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog,
                        this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(Tags.saveTags, Tags); // New Dialog
                        dialog1.$el.find('.modal-footer').find('.btn-save').removeClass('btn-green').addClass('btn-blue');
                        dialog1.$el.find('.modal-footer').find('.btn-play').hide();
                        dialog1.$el.find('.modal-header .cstatus').remove();
                        // Tags.init();                         
                        dialog1.saveCallBack(_.bind(Tags.saveTags, Tags));
                        //  targetsPage.createRecipients(this.targetsModelArray);
                    }, this));



                },
                updateTags: function(firstTime) {
                    
                    var str = "<div id='tagslist' class='tagscont tagslist'>";
                    str = str + "<ul>";
                    var tags = this.tags; 
                    if (tags != '' && !$.isArray(tags)) {
                        tags = tags.toString().split(',');
                    } 
                    var editTags = tags;
                    var that = this;
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=subscriberTagCountList";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            var tags_array = jQuery.parseJSON(xhr.responseText);
                            var tags_html = '';
                            if (tags_array[0] != 'err'){
                                that.app.setAppData('tags', tags_array);
                                     
                                $.each(tags_array.tagList[0], function(key, val) { 
                                    if ($.inArray(val[0].tag, editTags) != -1){
                                            editTags = jQuery.grep(editTags, function(value) {
                                            return value != val[0].tag;
                                        });
                                            
                                        str = str + "<li id='li_" + key + "' class='action' checksum='" + val[0].tag + "'>";
                                        str = str + "<a style='min-width: 120px;' class='tag'><span>" + val[0].tag  + "</span>";
                                         str = str + "<strong class='badge' style='line-height:35px!important;'>"+val[0].subCount+"</strong></a>";
                                        str = str + "<a class='btn-red move-row dont-use showtooltip' data-original-title='Click to remove this tag'>";
                                        str = str + "<span>Remove</span><i class='icon cross'></i></a>";
                                        str = str + "</li>";
                                    }
                                        
                                });
                                _.each(editTags,function(elem, idx){
                                    if(elem !=""){
                                        str = str + "<li id='li_" + elem + "' class='action' checksum='" + elem + "'>";
                                        str = str + "<a style='min-width: 120px;' class='tag'><span>" + elem  + "</span>";
                                        str = str + "<strong class='badge' style='line-height:35px!important;'>0</strong></a>";
                                        str = str + "<a class='btn-red move-row dont-use showtooltip' data-original-title='Click to remove this tag'>";
                                        str = str + "<span>Remove</span><i class='icon cross'></i></a>";
                                        str = str + "</li>";
                                    }
                                })
                                  
                                    str = str + "</ul>";

                                    str = str + "  <a  class='addtag add btn-green add-tag '  style='margin:4px 10px 0px;'>";
                                    str = str + "<span class='right'>Add Tag</span><i class='icon plus left'></i></a> ";
                                    str = str + "</div>";
                                     that.$el.find("#divtags").html(str);
                                    that.$el.find("#divtags .dont-use").on('click', function() {
                                        if (that.options.model.get('status') != "D")
                                            return false;
                                        $(this).parents("li.action").remove();
                                    });

                                    if (!firstTime && tags != "") {
                                        that.tags = tags.join(",");
                                        that.saveTagAutobot(true);
                                    }
                            }
                        }});
                  
                },
                changeTargetText: function() {
                    if (this.targetsModel) {
                        $(this.el).find("#hrfchangetarget").show();
                        $(this.el).find(".no-target-defined").hide();
                    } else {
                        $(this.el).find(".no-target-defined").show();
                        $(this.el).find("#hrfchangetarget").hide("");
                    }
                    if (this.status != "D")
                        $(this.el).find("#hrfchangetarget").hide();
                },
                recurTimes: function() {
                    var options = "";
                    for (var i = 1; i < 31; i++) {
                        options = options + "<option value='" + i + "'>" + i + "</option>";
                    }
                    var recurTimes
                    if (typeof this.model != "undefined") {
                        var recurTimes = this.model.get('recurTimes');
                    }
                    if (i == recurTimes)
                        options = options + "<option value='0' selected='selected'> Unlimited </option>";
                    else
                        options = options + "<option value='0'> Unlimited </option>";

                    return options;
                },
                saveTemplateName: function(obj) {
                    var _this = this;
                    var name = $(obj.target).parents(".edited").find("input");
                    var dailog_head = this.dialog;
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    $(obj.target).addClass("saving");
                    $.post(URL, {type: "rename", label: name.val(), botId: this.botId})
                            .done(function(data) {
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    dailog_head.$("#dialog-title span").html(_this.app.encodeHTML(name.val()));
                                    _this.showHideTargetTitle();
                                    _this.app.showMessge("Autobot Renamed");
                                    //_this.page.$("#template_search_menu li:first-child").removeClass("active").click();
                                    _this.model.set("name", name.val());
                                }
                                else {
                                    _this.app.showAlert(_json[1], _this.$el);

                                }
                                $(obj.target).removeClass("saving");
                            });
                },
                showHideTargetTitle: function(show, isNew) {
                    if (show) {
                        this.dialog.$("#dialog-title").hide();
                        this.dialog.$("#dialog-title-input").show();
                        this.dialog.$(".template-tag").hide();
                        this.dialog.$("#dialog-title-input input").val(this.app.decodeHTML(this.dialog.$("#dialog-title span").html())).focus();
                    }
                    else {
                        this.dialog.$("#dialog-title").show();
                        this.dialog.$("#dialog-title-input").hide();
                        this.dialog.$(".tagscont").show();
                    }
                },
                disableAllEvents: function() {

                    this.$el.find("#hrfchangetarget").on('click', function() {
                        return false;
                    });
                    this.$el.find(".add-tag").on('click', function() {
                        return false;
                    });
                    this.$el.find(".add-targets").on('click', function() {
                        return false;
                    });
                    //that.$el.find('#autobot_targets_grid tbody tr td .remove-target');('click',function(){return false;});
                    this.$el.find(".addtag").hide();
                    this.modal = $('.modal');
                    this.modal.find('.modal-header').find("#dialog-title span").on('click', function() {
                        return false;
                    });
                    this.modal.find('.modal-header').find(".addtag").on('click', function() {
                        return false;
                    });
                    var btnSave = this.modal.find('.modal-footer').find('.btn-save');
                     this.modal.find('.modal-footer').find('.btn-play').remove();
                    //btnSave.removeClass('btn-save');
                    btnSave.find('.save').addClass('pause').removeClass('save');
                    btnSave.addClass('btn-gray').removeClass('btn-blue');
                    var that = this;
                    btnSave.on('click', function() {
                        that.options.refer.getAutobotById('dialog', that.botId);
                        //that.options.refer.pauseAutobot('dialog',that.botId);
                    });
                    btnSave.find('span').html("Pause");
                },
                ReattachEvents: function(){
                   this.$el.parents('.modal').find('.modal-footer').find('.btn-save').addClass('btn-green').removeClass('btn-blue');
                   this.$el.parents('.modal').find('.modal-footer').find('.btn-play').show();
                   this.$el.parents('.modal').find('.modal-header .preview,.cstatus').remove();
                   this.dialog.$("#dialog-title span").attr('data-original-title','Click here to name');
                   var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                   this.$el.parents('.modal').find('.modal-footer').append(btn);
                   this.dialog.$("#dialog-title span").click(_.bind(function(obj) {
                        if (this.status != "D")
                            return false;
                        this.showHideTargetTitle(true);
                    }, this));
                   this.showTags();
                    if (this.status != "D"){
                            this.disableAllEvents();
                            this.$el.parents('.modal').find('.modal-footer').find('.btn-save').removeClass('btn-green')
                        }
               },
                showPercentage: function(ev) {
                    this.modal = $('.modal');
                    this.head_action_bar = this.modal.find(".modal-header .edited");
                    this.head_action_bar.find(".pstats").remove();
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
                    this.head_action_bar.find(".pstats ul a.show-pending").on('click', function(e) {
                        that.showPendingPopulation();
                    });
                    this.head_action_bar.find(".pstats ul a.show-sent").on('click', function(e) {
                        that.showSentPopulation();
                    });
                },
                showSentPopulation: function(ev) {
                    var that = this;
                    var sentAt = "Sent at";
                    var status = "C";
                    var dialog_title = this.model.get("presetLabel") + " - Sent Population";
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = that.options.app.showDialog({
                        title: dialog_title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'population',
                        wrapDiv: 'rcontacts-view',
                        bodyCss: {"min-height": dialog_height + "px"},
                        //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                    });

                    var botId = this.model.get('botId.encode');
                    that.options.app.showLoading('Loading Contacts....', dialog.getBody());
                    require(["recipientscontacts/rcontacts"], function(Contacts) {
                        var objContacts = new Contacts({sentAt: sentAt, status: status, app: that.options.app, botId: botId, type: 'autobots', dialogHeight: dialog_height});
                        dialog.getBody().append(objContacts.$el);
                        that.app.showLoading(false, objContacts.$el.parent())
                        var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                        objContacts.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog

                    });
                },
                showPendingPopulation: function() {
                    var that = this;
                    var status = "P";
                    var sentAt = "Scheduled for";
                    var dialog_title = this.model.get("presetLabel") + " - Pending Population";
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = that.options.app.showDialog({
                        title: dialog_title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'population',
                        wrapDiv: 'rcontacts-view',
                        bodyCss: {"min-height": dialog_height + "px"},
                        //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                    });

                    var botId = this.model.get('botId.encode');
                    that.options.app.showLoading('Loading Contacts....', dialog.getBody());
                    require(["recipientscontacts/rcontacts"], function(Contacts) {
                        var objContacts = new Contacts({sentAt: sentAt, status: status, app: that.options.app, botId: botId, type: 'autobots', dialogHeight: dialog_height});
                        dialog.getBody().append(objContacts.$el);
                        that.app.showLoading(false, objContacts.$el.parent())
                        var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                        objContacts.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog

                    });
                }, validate:function(total_rows){
      var isError = false
      for(var i=0;i<total_rows.length;i++){
          var filter = $(total_rows[i])
          if(filter.hasClass("filter")){
            if(filter.find(".fields").val()==""){
                this.options.app.showError({
                    control:filter.find(".field-container"),
                    message:this.options.app.messages[0].TRG_basic_no_field
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".field-container")})
            }
            
            if(filter.find(".value-container").css("display")=="block" && filter.find(".matchValue").val()==""){
                 this.options.app.showError({
                    control:filter.find(".value-container"),
                    message:this.options.app.messages[0].TRG_basic_no_matchvalue
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".value-container")})
            }
            //End of basic filter
          }
          else if(filter.hasClass("score")){
              if(filter.find(".scoreValue").val()==""){
                this.options.app.showError({
                    control:filter.find(".scoreValue-container"),
                    message:this.options.app.messages[0].TRG_score_novalue
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".scoreValue-container")})
            }
            //End of score filter
          }
          else if(filter.hasClass("form")){
             if(filter.find(".forms-box").val()==""){
                this.options.app.showError({
                    control:filter.find(".forms-box-container"),
                    message:this.options.app.messages[0].TRG_form_noform
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".forms-box-container")})
            }
          }
      }
      return isError
  },
  getTimeSpan:function(val){
      var spanHTML = ""
      var selected_val = ""
      val = 30;
      spanHTML +=''
      for(var i=1;i<=30;i++){         
         selected_val = (i==val) ?"selected":""
         spanHTML +='<option value="'+i+'" '+selected_val+'>'+i+'</option>'
      }
      return spanHTML
  },
  
  addEmailClicks:function(){
      var filter = this.$el.find('.emailclicks-submit');
      filter.addClass('emailclick-panel');
      var filter_html = ''
       filter_html += '<div><input type="checkbox" id="chkemailclicks" class="checkpanel" value="" style="position: absolute; opacity: 0;"><span class="filt">Email Clicks</span>';
      filter_html += '<input type="text" style="width: 50px;" value="250" id="txtEmailFrequency">  <em class="text">times or more</em><em class="text">in last</em><select  class=" chosen-select" id="ddlemailclicks">';
      filter_html += this.getTimeSpan(30)+'</select>'        
              
      filter_html += ' <em class="text">days</em></div>'
     // filter_html += '<div class="match row days-container" style="display:none;clear:both"> in last '
            //filter_html += '<div class="btn-group "><select class="timespan scoreRange">'+this.getTimeSpan(30)+'</select></div> days'                  
    //  filter_html += '</div>'
     // filter.find(".filter-cont").append('<span class="timelinelabel">Lead Score</span>');            
      filter.find(".filt_cont").append(filter_html);
      if(this.clickViews.type=="E"){
       filter.find(".filt_cont").find('#chkemailclicks').iCheck("check");
       filter.find(".filt_cont").find('#txtEmailFrequency').val(this.clickViews.frequency);
       filter.find(".filt_cont").find('#ddlemailclicks').val(this.clickViews.timeSpanInDays);
      }
      filter.find("#ddlemailclicks").chosen({disable_search: "true",width:"100px"}).change(function(){
         
      })
       this.$el.find('#merge_field_plugin').css('width', '71%!important');
                    
  },
  addPageViwes:function(){
      // varclickViews = {}
      var that = this;
      var filter = this.$el.find('.pageviews-submit');
      filter.addClass('pageviews-panel');
      var filter_html = ''
       filter_html += '<div><input type="checkbox" id="chkpageviews" class="checkpanel" value="" style="position: absolute; opacity: 0;"><span class="filt">Page Viewed</span>';
      filter_html += '<input type="text" style="width: 50px;" value="250" id="txtfrequency">  <em class="text">times or more</em><em class="text">in last</em><select  class="chosen-select" id="ddlpageviews">';
      filter_html +=  this.getTimeSpan(30)+'</select>'        
              
      filter_html += ' <em class="text">days</em></div>'
      filter.find(".filt_cont").append(filter_html);
      if(this.pageViews.type == "W"){
       filter.find(".filt_cont").find('#chkpageviews').iCheck("check");
       filter.find('.filt_cont').find('#txtfrequency').val(this.pageViews.frequency);
       filter.find('.filt_cont').find('#ddlpageviews').val(this.pageViews.timeSpanInDays);
       
      }
      filter.find("#ddlpageviews").chosen({disable_search: "true",width:"100px"}).change(function(){
         
      })
    
                    
  },
  addLeadScoreFilter:function(obj,e,params){
       var selected_field = "",selected_rule="",selected_formats="", matchValue="",gapValue = "0",list_html='<div class="btn-group sub-date-container" style="display:none"><a class="icon add-list"></a></div>',
          format_display="none",value_display="inline-block",gap_display="none"

      var filter = this.$el.find('.form-score');
      filter.addClass("lead-score");
      var filter_html = ''
       filter_html += '<div><input type="checkbox" id="chksalesstatus" class="checkpanel" value="" style="position: absolute; opacity: 0;"><span class="filt">Sales Status</span>';
      filter_html += '<div class="btn-group rules-container"> <select id="ddlsalestatus"  class="selectbox rules" disabled="disabled"><option value="">Loading...</option></select></div>';
          filter_html += '<div class="btn-group days-container" style="display:'+gap_display+'"><div class="inputcont"><input id="timespandays" type="text" value="'+gapValue+'" name="" class="gap" style="width:30px;" /></div></div>'
          filter_html +='<div class="btn-group formats-container" style="display:'+format_display+'"><div class="inputcont"><select class="selectbox formats"><option>Loading...</option>'                    
          filter_html +='</select></div></div>'
          filter_html += '<div class="btn-group value-container" style="display:'+value_display+'"><div class="inputcont"><input type="text" value="'+matchValue+'" name="" class="matchValue" style="width:240px;" /></div></div></div>'
   
     // filter_html += '<div class="match row days-container" style="display:none;clear:both"> in last '
            //filter_html += '<div class="btn-group "><select class="timespan scoreRange">'+this.getTimeSpan(30)+'</select></div> days'                  
    //  filter_html += '</div>'
     // filter.find(".filter-cont").append('<span class="timelinelabel">Lead Score</span>');            
      filter.find(".filt_cont").append(filter_html);
      filter.find(".filt_cont").find('.matchValue').val(this.saleStatus.matchValue);
      filter.find(".filt_cont").find('#timespandays').val(this.saleStatus.spanInDays);
      var selected_rule = "";
      var that = this;
      var  URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=rules";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
              if(xhr && xhr.responseText){                        
                   var rules_json = jQuery.parseJSON(xhr.responseText);                                
                   if(that.options.app.checkError(rules_json)){
                       return false;
                   }                                     
                   var filter_html =''
                     if(typeof that.saleStatus.rule !="undefined" && that.saleStatus.rule !='')
                        var selectedr = that.options.app.decodeHTML(that.saleStatus.rule);
                  var i = 0;
                   $.each(rules_json,function(k,val){
                          i = i + 1;
                          if(i < 7){
                            var selected_rule = (that.saleStatus && selectedr==val[0]) ? "selected" : ""
                            filter_html +='<option value="'+val[0]+'" '+selected_rule+'>'+val[1]+'</option>';
                            //that.rules.push(val){
                          }
                   });                   
                    filter.find("#ddlsalestatus").html(filter_html).prop("disabled",false).trigger("chosen:updated");
                    filter.find("#ddlsalestatus").chosen({disable_search: "true",width:"200px"}) 
                    if(that.saleStatus.type  == "P")
                      filter.find(".filt_cont").find('#chksalesstatus').iCheck("check");
                  }
          });
          var URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=formats";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
              if(xhr && xhr.responseText){                        
                   var formats_json = jQuery.parseJSON(xhr.responseText);                                
                   if(that.options.app.checkError(formats_json)){
                       return false;
                   }
                   
                   var filter_html =''
                   var selected_format ;
                     if(typeof that.saleStatus.dateFormat !="undefined" && that.saleStatus.dateFormat !='')
                     var data_format = that.options.app.decodeHTML(that.saleStatus.dateFormat);
                 
                   $.each(formats_json,function(k,val){
                          selected_format = (params && data_format==val[0]) ? "selected" : ""
                        filter_html +='<option value="'+val[0]+'" '+selected_format+'>'+val[1]+'</option>'
                        ///that.formats.push(val)
                   });      
                     filter.find(".selectbox.formats").html(filter_html).prop("disabled",false).trigger("chosen:updated")
                   filter.find(".formats").chosen({disable_search: "true",width:"200px"}) 
              }
        }).fail(function() { console.log( "error in loading formats" ); });
         filter.find("#ddlsalestatus").change(function(){             
             if((filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}") && ($(this).val()=="ct" || $(this).val()=="!ct" || $(this).val()=="nr") ){
                 that.options.app.showAlert("'Subscribe Date' OR 'Birth Date' field can not have rules like: contains, not contains & within numeric range.",$("body"),{fixed:true});
                 $(this).val('=').trigger("chosen:updated").change()
                 return false
             }
             if($(this).val()=="dr" || $(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="dayof" || $(this).val()=="birthday" || $(this).val()=="pbday"){
                
                if(filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}"){
                    filter.find(".formats-container").hide()
                }
                else{
                    filter.find(".formats-container").show()
                }
                
                if($(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="pbday"){
                    filter.find(".days-container").show().val('0')
                }
                else{
                    filter.find(".days-container").hide()
                }
                
                if($(this).val()=="dr"){
                    filter.find(".value-container").css('display','inline-block');
                    filter.find(".formats-container").show()
                }
                else{
                    filter.find(".value-container").hide()
                }
             }
             else{
                filter.find(".days-container").hide()
                if((filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}")){
                    filter.find(".formats-container").show()
                }
                else{
                    filter.find(".formats-container").hide()
                }
                filter.find(".value-container").css('display','inline-block');
             }
              if($(this).val()=="empty" || $(this).val()=="notempty"){
                   filter.find(".days-container").hide()  
                  filter.find(".formats-container").hide()
                  filter.find(".value-container").hide()
             }
             
             
      });
       
    },
     
  addFormFilter:function(obj,e,params){
      var filter = this.$el.find('.form-submit');
      var select_form = ""
      filter.addClass("form");
      var self = this
      if(this.botType == "AR"){
          var filter_html = '<div><span class="filt">Form Submitted</span>'
      }  else{ 
            var filter_html = '<div><input type="checkbox" id="chkformsubmission" class="checkpanel" value="" style="position: absolute; opacity: 0;"><span class="filt">Form Submitted</span>'
        }    
        filter_html += '  <select class=" chosen-select" id="ddlformsubmission" data-placeholder="Select Webform" disabled="disabled"><option value="-1">Loading Web Forms...</option></select> '
         filter_html += '</div> '          
            
        //  filter_html += '<div> Happened in last '
             //   filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan formTimeSpan">'+this.getTimeSpan(30)+'</select></div> days'                  
       ///   filter_html += '</div>'
     // filter.find(".filter-cont").append('<span class="timelinelabel">Form Submission</span>');                
      filter.find(".filt_cont").append(filter_html)
       if(self.forms.type == "F" && this.botType != "AR"){
            filter.find(".filt_cont").find('#chkformsubmission').iCheck("check");
            //filter.find("#ddlformsubmission").val(this.forms.formNumber);
        }
       filter.find("#ddlformsubmission").chosen({width:"300px",disable_search: false})      
      
     
     //filter.find(".timespan").chosen({disable_search: "true",width:"80px"}).change(function(){
        //  $(this).val($(this).val())
        //  $(this).trigger("chosen:updated")
       //})

      //this.addActionBar(filter)
      ///this.$el.append(filter)
      //this.showTooltips(filter)
     // if(this.webforms.length===0){
     var that = this;
      var URL = "/pms/io/form/getSignUpFormData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=list"                  
            jQuery.getJSON(URL,  function(tsv, state, xhr){
              if(xhr && xhr.responseText){
                  var _json = jQuery.parseJSON(xhr.responseText);
                  if(self.options.app.checkError(_json)){
                        return false
                   } 
                   var select_html = '<option value=""></option>'                     
                   if(_json.count!=="0"){
                       var i = 0;
                      $.each(_json.forms[0], function(index, val) {    
                          i  = i + 1;
                          var _value = val[0]["formId.encode"] 
                          select_form = (that.forms['formNumber.checksum']==val[0]["formId.checksum"]) ? "selected" : ""
                           if((!that.forms['formNumber.checksum'] || typeof that.forms['formNumber.checksum'] == "undefined") && i == 1){
                                select_form = "selected";
                            }
                          select_html += '<option value="'+_value+'" '+select_form+' webform_checksum="'+val[0]["formId.checksum"] +'">'+val[0].name+'</option>'
                          select_form = "";
                          //self.webforms.push({"id":_value,"name":val[0].name,checksum:val[0]["formId.checksum"]})
                      
                      })
                       
                   }                   
                   filter.find("#ddlformsubmission").html(select_html).prop("disabled",false).trigger("chosen:updated")
                   
              }
              
          }).fail(function() { console.log( "error campaign listing" ); })
        
      
    }, 
  saveFilters:function(){
       var filters_post = {}
      var _target = this.$el;
      var self = this;
       self.options.app.showLoading("Saving bot...", this.$el.find('.modal-body'));
      _target.find(".pre_row").each(function(){
          if($(this).find(".checkpanelinput.checked").length > 0);
             $(this).addClass('_row_checked');
      })
      var total_rows = _target.find("._row_checked");
      filters_post["applyRuleCount"]= _target.find("#ddlif").val();
      var total = 0;
      var N = 0;
      for(var i=0;i<total_rows.length;i++){
          var filter = $(total_rows[i])
          if($(total_rows[i]).hasClass("emailclicks-submit")){
                if(filter.find("#chkemailclicks").parents('.checkpanelinput').hasClass('checked')){  
                      N = N+1
                    total = total + 1;
                        filters_post[N+".filterType"]="E"
                        filters_post[N+".emailCampType"]= "-1";
                        filters_post[N+".emailFilterBy"]="-1";
                        filters_post[N+".campaignNumber"]="-1";
                        if(filter.find(".campaign-list").val()!=="-1" && filter.find(".filter-by").val()=="CK"){
                          filters_post[N+".articleNumber"]="-1";
                        }
                        var emailTimeSpan = filter.find("#ddlemailclicks").val()
                        filters_post[N+".isEmailTimeSpan"]= ((emailTimeSpan!=="-1") ?"Y":"N")
                        if(emailTimeSpan!=="-1"){
                            filters_post[N+".emailTimeSpan"]=emailTimeSpan
                        }
                        var emailFreq = filter.find("#txtEmailFrequency").val()
                        filters_post[N+".isEmailFreq"]=((emailFreq!=="-1") ?"Y":"N")
                        if(emailTimeSpan!=="-1"){
                            filters_post[N+".emailFreq"]=emailFreq
                        }
                }
          }
          else if($(total_rows[i]).hasClass("pageviews-submit")){
             if(filter.find("#chkpageviews").parents('.checkpanelinput').hasClass('checked')){  
                total = total + 1; 
                  N =N+1
                filters_post[N+".filterType"]="W"
                 
                var webTimeSpan = filter.find("#ddlpageviews").val()
                filters_post[N+".isWebTimeSpan"]= ((webTimeSpan!=="-1")?"Y":"N")
                if(webTimeSpan!=="-1"){
                    filters_post[N+".webTimeSpan"]=webTimeSpan
                }              
                var webFreq = filter.find("#txtfrequency").val()
                filters_post[N+".isWebFreq"]= ((webFreq!=="-1")?"Y":"N")
                if(webFreq!=="-1"){
                    filters_post[N+".webFreq"]= webFreq
                }
            }
          }
          else if($(total_rows[i]).hasClass("form-submit")){
            if(filter.find("#chkformsubmission").parents('.checkpanelinput').hasClass('checked') || this.botType == "AR"){
              total = total + 1; 
               N = N+1
              filters_post[N+".filterType"]="F"
              filters_post[N+".formId"]= filter.find("#ddlformsubmission").val()
              var formTimeSpan = filter.find(".formTimeSpan").val()
              filters_post[N+".isFormTimeSpan"]= ((formTimeSpan!=="-1")?"Y":"N")
              if(formTimeSpan!=="-1"){
                  filters_post[N+".formTimeSpan"]= formTimeSpan
              }
          }
          }
          else if($(total_rows[i]).hasClass("form-score")){
              if(filter.find("#chksalesstatus").parents('.checkpanelinput').hasClass('checked')){
                    total = total + 1;
                      N = N+1
                    filters_post[N+".filterType"]="P"                              
                    filters_post[N+".fieldName"]= "{{SALESSTATUS}}";
                    filters_post[N+".rule"]= filter.find(".selectbox.rules").val()
                    var rule_val = filter.find(".selectbox.rules").val()
                    if(rule_val=="dr" || rule_val=="prior" || rule_val=="after" || rule_val=="dayof" || rule_val=="birthday" || rule_val=="pbday"){
                      filters_post[N+".dateFormat"]= filter.find(".selectbox.formats").val()
                      if(rule_val=="prior" || rule_val=="after" || rule_val=="pbday"){
                          filters_post[N+".gap"]= filter.find(".gap").val()
                      }
                      if(rule_val=="dr"){
                        filters_post[N+".matchValue"]= filter.find(".matchValue").val()   
                      }
                    }
                    else{
                        filters_post[N+".matchValue"]= filter.find(".matchValue").val()              
                    }

                    if(filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}"){
                         filters_post[N+".listNum"]=filter.find(".sub-date-container").attr("list_id")
                    }
                }
          }
      } 
      if(total == 0){
          return false;
      }
      filters_post["count"] = total;
                         var that = this; 
                        var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=' + this.options.app.get('bms_token');
                        filters_post["type"]="update";
                        filters_post["filterNumber"]=that.model.get('filterNumber.encode');
                        $.post(URL, filters_post)
                                .done(function(data) {
                                    var target_json = jQuery.parseJSON(data);
                                    if (that.app.checkError(target_json)) {
                                        return false;
                                    }

                                    if (target_json[0] !== "err") {
                                    }
                                    else {
                                        that.app.showAlert(false, that.$el);
                                    }
                                      
                                });
                   
                     
                }

            });
        });


