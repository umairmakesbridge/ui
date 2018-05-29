/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['text!onetooneemails/html/createmessage.html', 'common/ccontacts', 'bms-mergefields'],
        function (template, contactsView) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber Record View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                /**
                 * Attach events on elements in view.
                 */
                events: {
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.parent = this.options.page;
                    this.app = this.parent.app;
                    this.isPreviewEmail = this.options.isPreviewEmail;
                    this.subNum = (this.options.subNum) ? this.options.subNum : '';
                    this.msgID = (this.options.msg_id) ? this.options.msg_id : '';
                    this.isSendEmail = (this.options.isSendEmail) ? this.options.isSendEmail : '';
                    this.emailHTML = '';
                    this.tagTxt = '';
                    this.sub_name = '';
                    this.subEmailDetails = '';
                    this.dialog = this.options.dialog;
                    this.tinymceEditor = false;
                    this.meeEditor = false;
                    this.isloadMeeEditor = false;
                    this.otoTemplateFlag = this.options.otoTemplateFlag;
                    this.template_id = (this.options.template_id) ? this.options.template_id : '';
                    this.directContactFlag = (this.options.directContactFlag) ? this.options.directContactFlag : false;

                    this.render();
                    //this.model.on('change',this.renderRow,this);
                },
                render: function () {

                    this.$el.html(this.template());
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                    this.initControls();

                },
                initControls: function () {

                },
                init: function () {
                    this.setFromNameField();

                    if (this.isPreviewEmail) {
                        this.initPreviewEmail();
                    } else if (this.isSendEmail) {
                        this.initSendEmail();
                    } else {
                        this.initCreateEmail();
                    }


                },
                initPreviewEmail: function () {
                    this.loadVContact(); // Call when subNum is available
                    this.getEmailSubDetail();
                    this.showIframe();
                },
                initCreateEmail: function () {
                    this.loadContact();
                    this.loadData();
                    if (this.subNum) {
                        this.loadVContact();
                    }
                    //this.$('#myTab li:nth-child(2) a').click();
                    if (this.otoTemplateFlag) {
                        this.loadTemplate();
                    } else {
                        this.loadEditor();
                    }
                },
                initSendEmail: function () {
                    this.loadContact();
                    this.getEmailSubDetail();
                    this.loadVContact();
                    this.loadData();

                },
                loadData: function () {
                    this.app.showLoading("Loading Email...", this.dialog.getBody());
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=campaignDefaults";
                    jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if (this.app.checkError(defaults_json)) {
                                return false;
                            }
                            this.campDefaults = defaults_json;
                            this.$("#campaign_footer_text").val(this.app.decodeHTML(defaults_json.footerText));
                            this.$("#campaign_from_email").val(this.app.decodeHTML(defaults_json.fromEmail));
                            this.$("#campaign_from_name").val(this.app.decodeHTML(defaults_json.fromName));
                            this.$('#campaign_reply_to').val(this.app.decodeHTML(defaults_json.fromEmail));
                            var fromEmails = defaults_json.fromEmail;
                            if (defaults_json.optionalFromEmails)
                                fromEmails += ',' + defaults_json.optionalFromEmails;
                            var fromEmailsArray = fromEmails.split(',');
                            var fromOptions = '';
                            var selected_fromEmail = '';
                            //if(this.app.salesMergeAllowed){
                            //   fromOptions += '<option value="{{BMS_SALESREP.EMAIL}}">{{BMS_SALESREP.EMAIL}}</option>';
                            // }
                            for (var i = 0; i < fromEmailsArray.length; i++)
                            {
                                if (fromEmailsArray[i] == defaults_json.fromEmail) {
                                    fromOptions += '<option value="' + fromEmailsArray[i] + '" selected="selected">' + fromEmailsArray[i] + '</option>';
                                    selected_fromEmail = fromEmailsArray[i];
                                } else
                                    fromOptions += '<option value="' + fromEmailsArray[i] + '">' + fromEmailsArray[i] + '</option>';
                            }
                            this.$el.find('#campaign_from_email').append(fromOptions);
                            //if(this.app.salesMergeAllowed){
                            this.$("#campaign_from_email").chosen().change(_.bind(function (obj) {
                                if (obj.target.value === '{{BMS_SALESREP.EMAIL}}') {
                                    this.$('#campaign_from_email_default').show();
                                } else {
                                    this.$('#campaign_from_email_default').hide();
                                }
                            }, this));
                            //}
                            this.$el.find('#fromemail_default').append(fromOptions);
                            this.$el.find('#fromemail_default option:contains({{BMS_SALESREP.EMAIL}})').remove();
                            this.$("#campaign_from_email").trigger("chosen:updated");
                            this.$('#fromemail_default').trigger("chosen:updated");
                            this.$(".flyinput").val(selected_fromEmail);
                            setTimeout(_.bind(this.setFromNameField, this), 300);

                            var subj_w = this.$el.find('#campaign_subject').innerWidth(); // Abdullah CHeck                               
                            //this.app.showLoading(false,this.dialog.getBody());  
                            //this.$el.find('#campaign_from_email_chosen').width(parseInt(subj_w+40)); // Abdullah Try


                            if (this.camp_json) {
                                // this.loadCampaign(this.camp_json);
                                console.log(this.camp_json);
                            } else {
                                this.initChosenPlug();
                                //this.parent.loadCallCampaign(); 
                            }
                        }
                    }, this)).fail(function () {
                        console.log("error in defaults");
                    });
                },
                initChosenPlug: function () {
                    this.$("#campaign_from_email").chosen({no_results_text: 'Oops, nothing found!', disable_search: "true"});
                    var message_obj = this;

                    this.$("#fromemail_default").chosen({no_results_text: 'Oops, nothing found!', width: "62%", disable_search: "true"});
                    this.$("#fromemail_default").chosen().change(function () {
                        message_obj.$("#fromemail_default_input").val($(this).val());
                    });
                    this.$("#campaign_from_email_chosen .chosen-single div").attr("title", "View More Options").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$("#fromemail_default_chosen .chosen-single div").attr("title", "View More Options").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                setFromNameField: function () {
                    var active_workspace = this.$el;
                    var subj_w = this.$('#campaign_subject').width(); // Abdullah Check
                    active_workspace.find('#campaign_from_email_chosen').css({"width": parseInt(subj_w + 82) + "px"});   // Abdullah Try
                    if (active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()) {
                        active_workspace.find("#campaign_from_email_input").css({"width": active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width() + "px", "margin-right": "61px"}); // Abdullah Check
                        active_workspace.find("#campaign_from_email_chosen .chosen-drop").css("width", (parseInt(active_workspace.find('#campaign_from_email_chosen').width())) + "px");
                    }
                    if (active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()) {
                        active_workspace.find("#fromemail_default_input").css("width", active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width() - 6 + "px");   // Abdullah Check
                    }
                },
                loadContact: function () {
                    var active_ws = $(".modal-body");
                    active_ws.find('.campaign-clickers').remove();
                    active_ws.find('#camp-prev-contact-search').append(new contactsView({page: this, searchCss: '489px', contactHeight: '274px', hideCross: true, isCamPreview: true, placeholderText: 'Search for a contact to use for sending an email', isOTOFlag: true}).el)
                    active_ws.find('#prev-closebtn').css({'top': '18px'});
                    return;
                },
                loadVContact: function () {
                    if (this.isPreviewEmail) {
                        this.$('.oto-message-contact-wrap h2').hide();
                    }

                    var vcontact = $('<div id="contact-vcard" class="activities_tbl"></div>');
                    this.$('.oto-message-contact-wrap').append(vcontact);
                    if (this.isSendEmail) {
                        $(vcontact).css({'background': 'none repeat scroll 0 0 transparent', 'z-index': '100', 'min-height': '170px', 'position': 'relative', 'top': '45px', 'left': '-5px', 'width': '390px', });
                        this.$('.oto-message-contact-wrap').css('min-height', '250px');
                        this.$('.oto-message-fields-wrap').css({'min-height': '270px', 'margin-top': '0'});
                    } else {
                        this.$('.oto-message-contact').remove();
                        $(vcontact).css({'background': 'none repeat scroll 0 0 transparent', 'z-index': '100', 'min-height': '170px', 'position': 'relative', 'top': '15px', 'left': '0', 'width': '390px', });
                    }
                    this.app.showLoading("Loading Contact Details...", vcontact);
                    // this.parent.$el.find('.stats_listing').hide();
                    require(["common/vcontact"], _.bind(function (page) {
                        var visitcontact = new page({parent: this, app: this.app, subNum: this.subNum, isOTOFlag: true, isSendEmail: this.isSendEmail});
                        $(vcontact).html(visitcontact.$el);
                        this.isVisitcontactClick = true;

                    }, this));
                },
                getEmailSubDetail: function () {
                    var _this = this;
                    var bms_token = this.app.get('bms_token');
                    //Load subscriber details, fields and tags
                    this.app.showLoading("Loading Email Details...", this.dialog.getBody());
                    var URL = "/pms/io/subscriber/getSingleEmailData/?BMS_REQ_TK=" + bms_token + "&type=getMessageDetail&subNum=" + this.subNum + "&msgId=" + this.msgID;
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (_this.app.checkError(_json)) {
                            return false;
                        } else {
                            _this.subEmailDetails = _json;
                            _this.app.showLoading(false, _this.dialog.getBody());
                            if (_json.body.indexOf("__OUTERTD") != -1 && !_this.isPreviewEmail) {
                                _this.emailHTML = _json.body;
                                _this.isloadMeeEditor = true;
                                _this.loadEditor();
                            } else {
                                _this.showIframe();
                                _this.$('#oto-easyeditor').html('<i class="icon preview left"></i>Message Preview<label style="position:absolute;top: 0px; left: 110px;" class="step2-lists"><span style="display: block;" class="fieldinfo"><i class="icon"></i><em>HTML is not compatible with the Easy Editor.</em></span></label>');

                                // _this.editorContent = _this.app.decodeHTML(_json.body, true);
                                // _this.$('#myTab li:nth-child(2) a').click();
                            }
                            if (_this.isPreviewEmail)
                            {
                                _this.populateEmailDetail(_json);
                            }
                        }
                    })
                },
                populateEmailDetail: function (_json) {
                    this.$('#oto_email_fields').hide();
                    this.$('#oto_email_preview').show();
                    this.$('#campaign_preview_subject').html(_json.subject);
                    this.$('#campaign_preview_fromEmail').html(_json.fromEmail);
                    this.$('#campaign_preview_defaultSenderName').html(_json.firstName);
                    // this.$('#campaign_preview_bcc').html(_json.senderName);
                    this.$('#campaign_preview_defaultReplyTo').html(_json.replyTo);
                    //this.$('#campaign_preview_replyto_default').html(_json.toEmail);
                },
                loadEditor: function () {

                    this.isloadMeeEditor = true;
                    if (!this.meeEditor) {
                        this.app.showLoading("Loading Makesbridge Easy Editor...", this.dialog.getBody());
                        this.meeEditor = true;
                        setTimeout(_.bind(this.setMEEView, this), 100);
                    }


                },
                setMEEView: function () {
                    var _html = "";
                    _html = this.emailHTML ? $('<div/>').html(this.emailHTML).text().replace(/&line;/g, "") : "";
                    this.app.showLoading("Loading Makesbridge Easy Editor...", this.dialog.getBody());

                    require(["editor/MEE"], _.bind(function (MEE) {
                        var MEEPage = new MEE({app: this.app, margin: {top: 373, left: 0}, _el: this.$("#mee_editor"), html: ''
                            , saveClick: _.bind(this.sendEmail, this), campNum:this.subNum,fromDialog: true, parentWindow: this.$el.parents(".modal-body"), scrollTopMinus: 410, isOTOFlag: true, isSaveHide: true, previewCallback: _.bind(this.previewCallback, this)});
                        this.$("#mee_editor").setChange(this);
                        this.setMEE(_html);
                        this.initScroll();

                    }, this));
                },
                setMEE: function (html) {
                    if (this.$("#mee_editor").setMEEHTML && this.$("#mee_editor").getIframeStatus()) {
                        this.$("#mee_editor").setMEEHTML(html);
                        this.app.showLoading(false, this.dialog.getBody());
                    } else {
                        setTimeout(_.bind(this.setMEE, this, html), 200);
                    }
                },
                initScroll: function () {
                    this.$win = this.$el.parents(".modal-body")
                            , this.$nav = this.$('.editortoolbar')
                            , this.$tools = this.$('.editortools')
                            , this.$editorarea = this.$('.editorbox')
                            , this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').position().top
                            , this.isFixed = 0, this.scrollChanged = false;

                    this.processScroll = _.bind(function () {
                        if (this.$("#area_html_editor_mee").height() > 0) {
                            if (this.$("#area_html_editor_mee").css("display") !== "none") {
                                var i, scrollTop = this.$win.scrollTop();
                                this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').position().top;

                                if (scrollTop >= (this.navTop + 12) && !this.isFixed) {
                                    this.isFixed = 1
                                    this.$nav.addClass('editor-toptoolbar-fixed editor-toptoolbar-fixed-border');
                                    this.$nav.css("width", this.$(".editorpanel").width());
                                    this.$tools.addClass('editor-lefttoolbar-fixed');
                                    this.$editorarea.addClass('editor-panel-fixed');
                                    this.$nav.css("top", "60px");
                                    this.$tools.css("top", "60px");
                                    this.scrollfixPanel();
                                } else if (scrollTop <= (this.navTop + 12) && this.isFixed) {
                                    this.isFixed = 0
                                    this.$nav.removeClass('editor-toptoolbar-fixed  editor-toptoolbar-fixed-border');
                                    this.$nav.css("top", "7px");
                                    this.$tools.css("top", "0px");
                                    this.$nav.css("width", "100%");
                                    this.$tools.removeClass('editor-lefttoolbar-fixed');
                                    this.$editorarea.removeClass('editor-panel-fixed');
                                }
                                var lessBy = this.navTop - scrollTop;
                                if (lessBy > 0) {
                                    this.$("#mee_editor").setAccordian(lessBy);
                                }
                            }
                        }
                    }, this);
                    this.processScroll();
                    this.$win.on('scroll', this.processScroll);
                },
                scrollfixPanel: function () {
                    this.$win.scroll(_.bind(function () {
                        var scrollTop = this.$win.scrollTop();
                        //var scrollPosition = scrollTop - 500;
                        var scrollTop = this.$win.scrollTop();
                        var scrollPosition = scrollTop - 410;
                        if (scrollPosition < 0) {
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', '0');
                        } else {
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', scrollPosition + 'px');
                        }

                    }, this));
                },
                sendEmail: function () {
                    var isValid = true;
                    var html = '';
                    var campaign_subject_title = $.trim(this.$('#campaign_subject').val());
                    if (campaign_subject_title !== "") {
                        var newTitle = '<title>' + campaign_subject_title + '</title>';
                        var meeElement = this.$("#mee-iframe").contents();
                        if (meeElement.find("head title").length == 1) {
                            meeElement.find("head title").html(campaign_subject_title);
                        } else {
                            meeElement.find("head").append(newTitle);
                        }
                        // meeElement.find("head meta[property='og:title']").attr("content",campaign_subject_title);
                    }
                    if (this.isloadMeeEditor) {
                        html = this.$("#mee_editor").getMEEHTML();
                    } else {
                        //  html = _tinyMCE.get('bmseditor_template').getContent()
                    }
                    var defaultSenderName = "", defaultReplyToEmail = "";
                    var msgId = this.subEmailDetails["msgId.encode"];
                    var subNum = this.subNum;
                    var replyto = this.$('#campaign_reply_to').val();
                    var email_addr = this.$('#campaign_default_reply_to').val();
                    var fromEmail = this.$('#campaign_from_email').val();
                    var fromEmailDefault = this.$('#fromemail_default_input').val();
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                    var fromNameReg = new RegExp("^[A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC0-9-'!_\.\+&x x]*$","ig");
                    var bccEmail = this.$('#campaign_bcc').val();

                    if (this.$('#campaign_subject').val() == '')
                    {
                        this.app.showError({
                            control: this.$('.subject-container'),
                            message: "Subject cannot be empty"
                        });
                        isValid = false;
                    } else if (this.$('#campaign_subject').val().length > 100)
                    {
                        this.app.showError({
                            control: this.$('.subject-container'),
                            message: "Subject cannot be empty"
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".subject-container")});
                    }
                    if (this.$('#campaign_from_name').val() == '')
                    {
                        this.app.showError({
                            control: this.$('.fname-container'),
                            message: "From name cannot be empty"
                        });
                        isValid = false;
                    } else if (this.$('#campaign_from_name').val().indexOf("{{") && !fromNameReg.test(this.$('#campaign_from_name').val()))
                    {
                        this.app.showError({
                            control: this.$('.fname-container'),
                            message: 'Name must start with alphanumeric value. Valid special characters are - _ . ! & + \''
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".fname-container")});
                    }
                    if (this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val() == "")
                    {
                        this.app.showError({
                            control: this.$('.fnamedefault-container'),
                            message: "From name cannot be empty"
                        });
                        isValid = false;
                    } else if (this.$('#campaign_from_name_default').css('display') == 'block' && !fromNameReg.test(this.$('#campaign_default_from_name').val())) {
                        this.app.showError({
                            control: this.$('.fnamedefault-container'),
                            message: 'Name must start with alphanumeric value. Valid special characters are - _ . ! & + \''
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".fnamedefault-container")});
                    }

                    if (fromEmail === '' || (!merge_field_patt.test(fromEmail) && !this.app.validateEmail(fromEmail)))
                    {
                        this.app.showError({
                            control: this.$('.fromeEmail-container'),
                            message: "Please enter correct email address format"
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".fromeEmail-container")});
                    }

                    if (this.$(".femail-default-container").css('display') == "block" && (fromEmailDefault === '' || !this.app.validateEmail(fromEmailDefault)))
                    {
                        this.app.showError({
                            control: this.$('.femail-default-container'),
                            message: "Please enter correct email address format"
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".femail-default-container")});
                    }
                    merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");

                    if (replyto !== '' && !merge_field_patt.test(replyto) && !this.app.validateEmail(replyto))
                    {
                        this.app.showError({
                            control: this.$('.replyto-container'),
                            message: "Please enter correct email address format"
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".replyto-container")});
                    }

                    if (replyto === '')
                    {
                        this.app.showError({
                            control: this.$('.replyto-container'),
                            message: "Reply field cannot be empty"
                        });
                        isValid = false;
                    } else if (replyto !== '' && !this.app.validateEmail(replyto))
                    {
                        this.app.showError({
                            control: this.$('.replyto-container'),
                            message: "Please enter correct email address format"
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".replyto-container")});
                    }

                    if (bccEmail !== '')
                    {
                        var bccEmailArray = bccEmail.split(',');
                        var validFlag = true;
                        _.each(bccEmailArray, _.bind(function (val) {
                            if (!this.app.validateEmail(val)) {
                                isValid = false;
                                validFlag = false;
                            }
                        }, this));
                        if (!validFlag) {
                            this.app.showError({
                                control: this.$('.bcc-container'),
                                message: "Please enter correct email address format"
                            });
                        } else
                        {
                            this.app.hideError({control: this.$(".bcc-container")});
                        }
                    }

                    if (!subNum)
                    {
                        this.$el.find('#contact-search').addClass('error-contact');
                        this.$el.find('#searchbtn').css('border', '2px solid #fb8080');
                        this.$el.find('#contact-search').parent().append('<span class="errortext"><i class="erroricon"></i><em>No contact selected</em></span>');
                        isValid = false;
                    } else
                    {
                        this.$el.find('#contact-search').removeClass('error-contact');
                        this.$el.find('#searchbtn').removeAttr('style');
                        this.$el.find('#contact-search').parent().find('.errortext').remove();
                    }

                    if (this.$('#campaign_reply_to_default').css('display') == 'block' && email_addr == '')
                    {
                        this.app.showError({
                            control: this.$('.replyemail-container'),
                            message: "Reply field cannot be empty"
                        });
                        isValid = false;
                    } else if (this.$('#campaign_reply_to_default').css('display') == 'block' && !this.app.validateEmail(email_addr))
                    {
                        this.app.showError({
                            control: this.$('.replyemail-container'),
                            message: "Please enter correct email address format"
                        });
                        isValid = false;
                    } else
                    {
                        this.app.hideError({control: this.$(".replyemail-container")});
                    }
                    //console.log(isValid);
                    if (isValid)
                    {
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        defaultSenderName = merge_field_patt.test(this.$('#campaign_from_name').val()) ? this.$("#campaign_default_from_name").val() : "";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        defaultReplyToEmail = merge_field_patt.test(this.$('#campaign_reply_to').val()) ? this.$("#campaign_default_reply_to").val() : "";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        var fromEmail = this.$('#campaign_from_email').val();
                        var fromEmailMF = merge_field_patt.test(fromEmail) ? this.$('#fromemail_default_input').val() : "";

                        //if( this.settingchange || this.parent.camp_id==0){
                        this.app.showLoading("Sending message...", this.dialog.getBody());
                        var URL = "/pms/io/subscriber/saveSingleEmailData/?BMS_REQ_TK=" + this.app.get('bms_token');
                        $.post(URL, {type: "sendMessage",
                            subject: this.$("#campaign_subject").val(),
                            senderName: this.$("#campaign_from_name").val(),
                            fromEmail: fromEmail,
                            defaultFromEmail: fromEmailMF,
                            defaultSenderName: defaultSenderName,
                            replyTo: this.$("#campaign_reply_to").val(),
                            defaultReplyToEmail: defaultReplyToEmail,
                            subNum: subNum,
                            bccEmail: bccEmail,
                            htmlCode: html,
                            msgId: msgId
                        })
                                .done(_.bind(function (data) {
                                    var step1_json = jQuery.parseJSON(data);
                                    this.app.showLoading(false, this.dialog.getBody());
                                    if (step1_json[0] !== "err") {
                                        if (!this.directContactFlag) {
                                            this.parent.parent.type = 'getMessageList';
                                            this.parent.parent.getallemails();
                                            this.parent.parent.headBadge();
                                        }

                                        /* if(this.parent.dialog){
                                         this.parent.dialog.$(".dialog-title").html("'"+this.$("#campaign_subject").val()+"' Settings")
                                         }
                                         else{*/
                                        this.app.showMessge("Email send successfully!");
                                        this.closeDialog();
                                        // }
                                        //camp_obj.states.step1.change=false;

                                    } else {
                                        this.app.showAlert(step1_json[1], this.$el);
                                    }
                                }, this));

                        // }
                    }
                },
                showIframe: function () {
                    if (this.isPreviewEmail) {
                        this.$('#mee-iframe-wrapper iframe').remove();
                        var transport = new easyXDM.Socket({
                            remote: window.location.protocol + '//' + this.app.get("preview_domain") + "/pms/events/viewmsg.jsp?msgId=" + this.msgID + "&subNo=" + this.subNum + "&xdm=true",
                            onReady: function () {
                                //  this._app.showLoading(false,dialog.getBody());
                            },
                            onMessage: _.bind(function (message, origin) {
                                var response = jQuery.parseJSON(message);
                                //console.log(response);
                                if (Number(response.height) < 600) {
                                    this.$el.find('#mee-iframe-wrapper iframe').height('600');
                                } else {
                                    this.$el.find('#mee-iframe-wrapper iframe').height(response.height);
                                }
                            }, this),
                            props: {style: {width: "100%", height: "600px"}, frameborder: 0},
                            container: this.$('#mee-iframe-wrapper')[0]
                        });
                    } else {
                        var iframe = '<iframe id="email-template-iframe" class="email-iframe" frameborder="0" style="height: 494px;" src="https://' + this.app.get("preview_domain") + '/pms/events/viewmsg.jsp?msgId=' + this.msgID + '&subNo=' + this.subNum + '"></iframe>'
                        this.$('.tabpanel-wrapper').hide();
                        this.$('#mee-iframe-wrapper').html(iframe);
                    }


                },
                /**
                 * Load template contents and flag doing a get Ajax call.
                 *
                 * @param {o} textfield simple object.             
                 * 
                 * @param {txt} search text, passed from search control.
                 * 
                 * @returns .
                 */
                loadTemplate: function (o, txt) {
                    var _this = this;

                    this.app.showLoading("Loading Template...", this.dialog.getBody());
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=get&templateNumber=" + this.template_id;
                    this.getTemplateCall = jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {

                            var template_json = jQuery.parseJSON(xhr.responseText);
                            if (_this.app.checkError(template_json)) {
                                return false;
                            }

                            // _this.modal.find(".dialog-title").html(template_json.name).attr("data-original-title", "Click to rename").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                            //_this.app.dialogArray[_this.app.dialogArray.length - 1].title = template_json.name;                            
                            if (template_json.isEasyEditorCompatible == "N") {
                                _this.editorContent = _this.app.decodeHTML(template_json.htmlText, true);
                                _this.$(".tinymce-editor a").click();
                            } else {
                                _this.loadEditor();
                                _this.emailHTML = template_json.htmlText;
                                _this.isloadMeeEditor = true;
                                _this.app.showLoading(false, _this.dialog.getBody());
                            }

                            if (_this.app.get("isMEETemplate")) {
                                _this.$("#bmseditor_template").val(_this.app.decodeHTML(template_json.htmlText, true));
                            }

                        }
                    }).fail(function () {
                        console.log("error in loading template");
                    });
                },
                ReattachEvents: function () {
                    var dialogArrayLength = this.app.dialogArray.length;
                    this.dialog.$(".savebtn").click(_.bind(function (obj) {
                        this.sendEmail()
                    }, this));
                },
                closeDialog: function () {
                    var arraylength = this.app.dialogArray.length;
                    for (var i = 0; i < arraylength; i++) {
                        this.dialog.hide();
                    }
                },
                previewCallback: function () {
                    var isValid = true;
                    var html = '';
                    var campaign_subject_title = $.trim(this.$('#campaign_subject').val());
                    campaign_subject_title = campaign_subject_title==""?"No Subject":campaign_subject_title;
                    if (campaign_subject_title !== "") {
                        var newTitle = '<title>' + campaign_subject_title + '</title>';
                        var meeElement = this.$("#mee-iframe").contents();
                        if (meeElement.find("head title").length == 1) {
                            meeElement.find("head title").html(campaign_subject_title);
                        } else {
                            meeElement.find("head").append(newTitle);
                        }                        
                    }
                    if (this.isloadMeeEditor) {
                        html = this.$("#mee_editor").getMEEHTML();
                    } 
                    var defaultSenderName = "", defaultReplyToEmail = "";                    
                    var subNum = this.subNum;
                    var replyto = this.$('#campaign_reply_to').val();
                    var email_addr = this.$('#campaign_default_reply_to').val();
                    var fromEmail = this.$('#campaign_from_email').val();
                    var fromEmailDefault = this.$('#fromemail_default_input').val();
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                    var fromName = this.$('#campaign_from_name').val();
                    var fromNameDefault = this.$('#campaign_from_name_default').val();
                    var bccEmail = this.$('#campaign_bcc').val();

                    
                    if (fromName == '')
                    {
                        fromName = "Makesbridge";
                    } 
                    else if (fromName.indexOf("{{") && fromName.search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/) == -1)
                    {
                        fromName = "Makesbridge";
                    } 
                    if (this.$('#campaign_from_name_default').css('display') == 'block' && fromNameDefault == "")
                    {
                        fromNameDefault="Default Value";
                    } else if (this.$('#campaign_from_name_default').css('display') == 'block' && fromNameDefault.search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/) == -1) {
                        fromNameDefault="Default Value";
                    } 

                    if (fromEmail === '' || (!merge_field_patt.test(fromEmail) && !this.app.validateEmail(fromEmail)))
                    {
                        fromEmail = "bms@bridgemailsystem.com";
                    } 

                    if (this.$(".femail-default-container").css('display') == "block" && (fromEmailDefault === '' || !this.app.validateEmail(fromEmailDefault)))
                    {
                        fromEmailDefault = "bms@bridgemailsystem.com";
  
                    }
                    merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");                
                    if (replyto === '')
                    {
                        replyto = "bms@bridgemailsystem.com";
                    } else if (replyto !== '' && !this.app.validateEmail(replyto))
                    {
                        replyto = "bms@bridgemailsystem.com";
                    } 
                    
                    if (!this.subNum)
                    {
                        this.$el.find('#contact-search').addClass('error-contact');
                        this.$el.find('#searchbtn').css('border', '2px solid #fb8080');
                        this.$el.find('#contact-search').parent().append('<span class="errortext"><i class="erroricon"></i><em>No contact selected</em></span>');
                        this.app.showAlert("Please select contact to see preview", this.$el);
                        isValid = false;
                    } else
                    {
                        this.$el.find('#contact-search').removeClass('error-contact');
                        this.$el.find('#searchbtn').removeAttr('style');
                        this.$el.find('#contact-search').parent().find('.errortext').remove();
                    }

                    if (bccEmail !== '')
                    {
                        var bccEmailArray = bccEmail.split(',');
                        var validFlag = true;
                        _.each(bccEmailArray, _.bind(function (val) {
                            if (!this.app.validateEmail(val)) {
                                isValid = false;
                                validFlag = false;
                            }
                        }, this));
                        if (!validFlag) {
                            this.app.showError({
                                control: this.$('.bcc-container'),
                                message: "Please enter correct email address format"
                            });
                        } else
                        {
                            this.app.hideError({control: this.$(".bcc-container")});
                        }
                    }
                   

                    if (this.$('#campaign_reply_to_default').css('display') == 'block' && email_addr == '')
                    {
                      email_addr = "bms@bridgemailsystem.com";
                    } else if (this.$('#campaign_reply_to_default').css('display') == 'block' && !this.app.validateEmail(email_addr))
                    {
                         email_addr = "bms@bridgemailsystem.com";
                    }
                    
                    //console.log(isValid);
                    if (isValid)
                    {
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        defaultSenderName = merge_field_patt.test(fromNameDefault) ? fromNameDefault : "";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        defaultReplyToEmail = merge_field_patt.test(email_addr) ? email_addr : "";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");                        
                        var fromEmailMF = "";

                        //if( this.settingchange || this.parent.camp_id==0){
                        this.app.showLoading("Preparing Preview...", this.dialog.getBody());
                        var URL = "/pms/io/subscriber/saveSingleEmailData/?BMS_REQ_TK=" + this.app.get('bms_token');
                        var post_data = {type: "saveMessage",                            
                            subject: campaign_subject_title,
                            senderName: fromName,
                            fromEmail: fromEmail,
                            defaultFromEmail: fromEmailMF,
                            defaultSenderName: defaultSenderName,
                            replyTo: replyto,
                            defaultReplyToEmail: defaultReplyToEmail,
                            subNum: subNum,
                            bccEmail: bccEmail,
                            htmlCode: html
                        };
                        $.post(URL, post_data)
                         .done(_.bind(function (data) {
                                    try{
                                        var step1_json = jQuery.parseJSON(data);                                                                
                                        this.app.showLoading(false, this.dialog.getBody());
                                        if (step1_json[0] !== "err") {
                                            this.msgID =   step1_json["msgId.encode"];   
                                            this.showPreview(post_data);

                                        } else {
                                            this.app.showAlert(step1_json[1], this.$el);
                                        }
                                    }
                                    catch(e){
                                        this.app.showAlert("Invalid Response From Server : <br/>"+data, this.$el);
                                    }
                                }, this));

                        // }
                    }
                    

                },
                showPreview: function (post_data) {
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Message Preview',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading Message HTML...", dialog.getBody());
                    var preview_url = "https://" + this.app.get("preview_domain") + "/pms/events/viewmsg.jsp?msgId=" + this.msgID + "&subNo=" + this.subNum;
                    post_data['type']="sendPreview";
                    var tmPrParams = {frameSrc: preview_url, app: this.app, frameHeight: dialog_height, prevFlag: 'E', tempNum: this.msgID,postParams:post_data};
                    /*if (this.msgID === '') {
                        var iframeHTML = this.$("#mee_editor").getMEEHTML();
                        preview_url = "about:blank";
                        tmPrParams = {frameSrc: preview_url, app: this.app, frameHeight: dialog_height, tempNum: this.msgID};
                    }*/

                    require(["common/templatePreview"], _.bind(function (MessagePreview) {

                        var tmPr = new MessagePreview(tmPrParams); // isText to Dynamic
                        dialog.getBody().append(tmPr.$el);
                        this.app.showLoading(false, tmPr.$el.parent());
                        tmPr.init();
                        /*if (this.msgID === '') {
                            dialog.getBody().find("iframe#email-template-iframe").load(_.bind(function () {
                                dialog.getBody().find("iframe#email-template-iframe").contents().find("html").html(iframeHTML);
                            }, this))
                        }*/
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        tmPr.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        dialog.$el.find('#dialog-title .preview').remove();
                    }, this));
                }
            });
        });