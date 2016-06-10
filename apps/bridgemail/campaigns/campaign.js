define([  'text!campaigns/html/campaign.html', 'editor/editor','bmstemplates/templates', "listupload/campaign_recipients_lists",'target/selecttarget', 'listupload/csvupload', 'bms-filters', 'bms-mapping', 'bms-mergefields', 'scrollbox','bms-remote'],
        function ( template, editorView,templatesPage, selectListPage, selectTarget, csvuploadPage, bmsfilters, Mapping, bms, scrollbox) {
            'use strict';
            return Backbone.View.extend({
                id: 'step_container',
                events: {
                    "click .step3 #choose_soruce li": "step3TileClick",
                    'click .step2 #choose_soruce li': 'step2TileClick',
                    'keyup .header-info': 'defaultFieldHide',
                    'click #save_conversion_filter': 'saveConversionPage',
                    'click #save_results_sf': 'saveResultToSF',
                    'paste input[type="text"]':'cleanNonPrintableCharacters',
                    'paste textarea':'cleanNonPrintableCharacters',
                    //'click .mergefields-box' :'showMergeFieldDialog',
                    'click #drop4': function (obj) {
                        this.$('.mergefields-box').click();
                    },
                    'change #campaign_isFooterText': 'setFooterArea',
                    'change .step1 input': 'step1Change',
                    'change .step1 select': 'step1Change',
                    'change .step1 textarea': 'step1Change',
                    'change .step2 #handcodedhtml': 'editorChange',
                    'change .step2 #plain-text': 'editorChange',
                    'change .step2 #htmlarea': 'editorChange',
                    'click .step3 #addnew_target': 'createTarget',
                    'change .step3 select': 'step3Change',
                    'keydown .step3 input': 'step3Change',
                    // 'click .step3 #highrise_import':'showHighrise',
                    'click .step3 a': 'step3Change',
                    'click #btnSFLogin': 'loginSalesForce',
                    'click #btnHSLogin': 'loginHighrise',
                    'click #btnNSLogin': 'loginNetSuite',
                    'keyup #campaign_from_email_input': 'fromEmailDefaultFieldHide',
                    'click .preview-camp': 'previewCampaignstep4',
                    'click .prev-iframe-campaign': 'htmlTextClick',
                    'click .save-step2': 'saveForStep2',
                    'click .dynamic-cotnent-items': 'dcItemsDialog',
                    'click .editorbtnshow': function () {
                        this.$(".textdiv").hide();
                        this.$(".editor_box").show();
                    },
                    'click #btn_image_url': "TryDialog",
                    'click #btn_image_url2': "TryDialog",
                    'click .target-fresh': function () {
                        var targetobj = this.$('.step3 #choose_soruce li.selected');
                        this.app.removeCache("targets");
                        this.step3SlectSource(targetobj);
                    },
                    'click .lists-fresh': function () {
                        var targetobj = this.$('.step3 #choose_soruce li.selected');
                        this.app.removeCache("lists");
                        this.step3SlectSource(targetobj);
                    },
                    'click .edit-fields': 'editFieldsLayout',
                    'click .opt-selection': 'optListSelection'
                },
                initialize: function () {
                    this.app = this.options.app;
                    this.template = _.template(template);
                    this.tags = '';
                    this.tag_limit = 5;
                    this.camp_id = 0;
                    this.tags_common = [];
                    this.mergeTags = {};
                    this.allMergeTags = [];
                    this.camp_istext = null;
                    this.isNextPress = false;
                    this.wp_id = this.options.params.wp_id;
                    this.rescheduled = false;
                    this.hidecalender = false;
                    this.scrollApply = false;
                    this.copyFromCampaign = false;
                    this.campobjData = null;
                    this.campDefaults = {};
                    this.allowedUser = ['admin', 'jayadams', 'demo'];
                    this.campFromName = '';
                    this.isSaveCallFromMee = false;
                    this.states = {
                        "step1": {change: false, sf_checkbox: false, ns_checkbox: false, sfCampaignID: '', nsCampaignID: '', hasResultToSalesCampaign: false, hasResultToNetsuiteCampaign: false, pageconversation_checkbox: false, hasConversionFilter: false},
                        "step2": {"templates": false, htmlText: '', plainText: '', change: false, editorType: ''},
                        "step3": {"target_id": 0, highrise: false, salesforce: false, netsuite: false, recipientType: "", recipientDetial: null, change: false, netsuitegroups: null, targetDialog: null,
                            csvupload: null, mapdataview: null, tags: null, sf_filters: {lead: "", contact: "", opportunity: ""},
                            ns_filters: {customer: "", contact: "", parnter: "", nsObject: "", isNewTarget: false, newTargetName: ''}
                        },
                        "step4": {"init": false, datetime: {day: 0, month: 0, year: 0, hour: 0, min: 0, sec: 0}, cal: null, camp_status: 'D', sch_date: ''},
                        "editor_change": false,
                        "saleforce_campaigns": null,
                        "netsuite_campaigns": null
                    };
                    this.bmseditor = new editorView({opener: this, wp_id: this.wp_id});
                    this.render();
                    this.meeView = null;
                    var appMsgs = this.app.messages[0];
                    this.app.showInfo(this.$el.find('#lblSubject'), appMsgs.CAMP_subject_info);
                    this.app.showInfo(this.$el.find('#lblFromemail'), appMsgs.CAMP_femail_info);
                    this.app.showInfo(this.$el.find('#lblFromname'), appMsgs.CAMP_fname_info);
                    this.app.showInfo(this.$el.find('#lblReplyto'), appMsgs.CAMP_replyto_info);

                },
                 cleanNonPrintableCharacters: function(obj){
                    var _input = $(obj.target);                                        
                    setTimeout(_.bind(function(){_input.val(this.app.replaceNonPrintableChar(_input.val()));}, this), 100);
                    
                },
                initMergeFields: function () {
                    this.$('#campaign_subject-wrap').mergefields({app: this.app, elementID: 'campaign_subject', config: {state: 'workspace', isrequest: true}, placeholder_text: 'Enter subject'});
                    this.$('#campaign_reply_to-wrap').mergefields({app: this.app, config: {salesForce: true, emailType: true, state: 'workspace', isrequest: true}, elementID: 'campaign_reply_to', placeholder_text: 'Enter reply to'});
                    this.$('#campaign_from_name-wrap').mergefields({app: this.app, config: {salesForce: true, state: 'workspace'}, elementID: 'campaign_from_name', placeholder_text: 'Enter from name'});
                    //this.$('#campaign_from_email-wrap').mergefields({app:this.app,config:{salesForce:true,emailType:true,state:'workspace'},elementID:'campaign_from_email',placeholder_text:'Enter from email'});                    
                    this.$('#merge_field_plugin-wrap').mergefields({app: this.app, view: this, config: {links: true, state: 'workspace'}, elementID: 'merge-field-editor', placeholder_text: 'Merge Tags'});
                    this.$('#merge_field_plugin-wrap-hand').mergefields({app: this.app, view: this, config: {links: true, state: 'workspace'}, elementID: 'merge-field-hand', placeholder_text: 'Merge Tags'});
                    this.$('#merge_field_plugin-wrap-plain').mergefields({app: this.app, view: this, config: {links: true, state: 'workspace'}, elementID: 'merge-field-plain', placeholder_text: 'Merge Tags'});
                },
                render: function () {
                    this.$el.html(this.template({}));
                    this.wizard = this.options.wizard;

                    if (this.options.params && this.options.params.camp_id) {
                        this.camp_id = this.options.params.camp_id;
                    }
                    this.loadDataAjax(); // Load intial Calls

                    this.$el.find('div#targetssearch').searchcontrol({
                        id: 'target-list-search',
                        width: '300px',
                        height: '22px',
                        placeholder: 'Search lists',
                        gridcontainer: 'target_list_grid',
                        showicon: 'no',
                        iconsource: ''
                    });
                    this.$el.find('div#targetrecpssearch').searchcontrol({
                        id: 'target-recps-search',
                        width: '300px',
                        height: '22px',
                        placeholder: 'Search recipient targets',
                        gridcontainer: 'recipients',
                        showicon: 'yes',
                        iconsource: 'target'
                    });
                    this.$el.find('div#targetsearch').searchcontrol({
                        id: 'target-search',
                        width: '300px',
                        height: '22px',
                        placeholder: 'Search targets',
                        gridcontainer: 'targets_grid',
                        showicon: 'yes',
                        iconsource: 'target'
                    });
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$("#html_editor_mee").show();

                    /*Campaign Merge Fields*/
                    //this.$('#campaign_subject-wrap').mergefields({app:this.app,elementID:'campaign_subject',config:{state:'workspace',isrequest:true},placeholder_text:'Enter subject',mergeFieldsCallback:_.bind(this.initMergeFields,this)});                    

                },
                stepsCall: function (step) {
                    var proceed = -1;
                    $(".messagebox.messagebox_").remove();
                    if (this.states.step4.camp_status === 'D') {
                        if (this.camp_id !== 0) {
                            switch (step) {
                                case 'step_1':
                                    proceed = this.saveStep1();
                                    break;
                                case 'step_2':
                                    this.isNextPress = true;
                                    proceed = this.saveStep2();
                                    break;
                                case 'step_3':
                                    proceed = this.saveStep3();
                                    break;
                                case 'step_4':
                                    proceed = this.saveStep4();
                                    break;
                                default:
                                    break;
                            }
                        }
                        else {
                            this.app.showAlert('Please save campaign first to proceed!', this.$el.parents(".ws-content.active"));
                            proceed = 0;
                        }
                    }
                    return proceed;
                },
                removeCSVUpload: function () {
                    var camp_obj = this;
                    var csvupload = camp_obj.states.step3.csvupload
                    if (csvupload && csvupload.fileuploaded == true)
                    {
                        csvupload.removeFile();
                        csvupload.$el.hide();
                        camp_obj.$el.find('#upload_csv').removeClass('selected');
                        camp_obj.states.step3.mapdataview.$el.hide();
                        camp_obj.states.step3.mapdataview.$el.find('#uploadslist').children().remove();
                        camp_obj.states.step3.mapdataview.$el.find('#newlist').val('');
                        camp_obj.states.step3.mapdataview.$el.find('#alertemail').val('');
                        camp_obj.app.showLoading(false, camp_obj.states.step3.mapdataview.$el);
                    }
                },
                init: function () {
                    this.app.showLoading("Loading...", this.$el);
                    this.initMergeFields();
                    this.app.showLoading(false, this.$el);
                    this.initHeader();
                    //
                    this.setupCampaign();
                    if (this.camp_id != "0") {
                        this.loadCampaign(this.camp_id);
                    }
                    else {
                        this.initCampaignTag('');
                        this.initCheckbox();
                    }
                    //Init Accoridions on first step
                    this.$("#campaign_add_to_salesforce_accordion").accordion({active: 0, collapsible: false, activate: _.bind(function () {
                            this.$("#campaign_add_to_salesforce").prop("checked", this.states.step1.sf_checkbox)

                        }, this)});
                    this.$("#conversion_filter_accordion").accordion({active: 0, collapsible: false, activate: _.bind(function () {
                            this.$("#conversion_filter").prop("checked", this.states.step1.pageconversation_checkbox);
                        }, this)});

                    this.$("#campaign_add_to_netsuite_accordion").accordion({active: 0, collapsible: false, activate: _.bind(function () {
                            this.$("#campaign_add_to_netsuite").prop("checked", this.states.step1.ns_checkbox);
                        }, this)});

                    //Init Edtior
                    this.$("#editorhtml").append(this.bmseditor.$el);
                    this.bmseditor.initEditor({id: this.wp_id});

                    //Init Chosen combo                    
                    this.$("#con_filter_combo").chosen({no_results_text: 'Oops, nothing found!', width: "280px", disable_search: "true"});
                    this.$("#campaign_unSubscribeType").chosen({no_results_text: 'Oops, nothing found!', width: "290px", disable_search: "true"});
                    this.$("#campaign_unSubscribeType").chosen().change(_.bind(function () {
                        this.states.step1.change = true;
                        $(this).trigger("chosen:updated");
                    }, this));
                    var camp_obj = this;
                    this.$("#fromemail_default").chosen({no_results_text: 'Oops, nothing found!', width: "67%", disable_search: "true"});
                    this.$("#sf_campaigns_combo").chosen({no_results_text: 'Oops, nothing found!', width: "280px", disable_search: "true"});
                    this.$("#ns_campaigns_combo").chosen({no_results_text: 'Oops, nothing found!', width: "280px", disable_search: "true"});
                    this.$("#fromemail_default").chosen().change(function () {
                        camp_obj.$("#fromemail_default_input").val($(this).val());
                    });
                    this.$("#campaign_from_email_chosen .chosen-single div").attr("title", "View More Options").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$("#fromemail_default_chosen .chosen-single div").attr("title", "View More Options").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                },
                setFromNameField: function () {
                    this.app.fixEmailFrom();
                },
                fromNameSelectBoxChange: function (obj) {
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                    if (merge_field_patt.test($(obj).val())) {
                        this.$("#campaign_from_email_default").show();
                    }
                    else {
                        this.$("#campaign_from_email_default").hide();
                    }
                },
                defaultFieldHide: function (obj) {
                    var input_obj = $(obj.target);
                    if (input_obj.val().indexOf("{{") == -1 && input_obj.val().indexOf("}}") == -1) {
                        this.$("#" + input_obj.attr("id") + "_default").hide();
                    }
                },
                fromEmailDefaultFieldHide: function (e) {
                    var fromEmail = $.getObj(e, "input").val();
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                    if ($.trim(fromEmail) == "" || !merge_field_patt.test(fromEmail) || this.app.validateEmail(fromEmail)) {
                        this.$("#campaign_from_email_default").hide();
                    }
                    else {
                        this.$("#campaign_from_email_default").show();
                    }
                },
                initCheckbox: function () {
                    this.$('input').iCheck({
                        checkboxClass: 'checkinput'
                    });
                    this.$('input.checkpanel').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                    });
                    this.$("ul.socialbtns li label ").click(function () {
                        //$(this).toggleClass( "btnchecked" );
                    });

                    var camp = this;
                    this.$(".iCheck-helper").click(function () {
                        var icheck = $(this).parent().find("input");
                        if (icheck.attr("type") == "checkbox") {
                            var icheck_id = icheck.attr("id");
                            if (icheck_id == "campaign_isFooterText") {
                                camp.setFooterArea();
                            }
                            else if (icheck_id == "campaign_add_to_salesforce") {
                                camp.setSalesForceStep1(icheck);
                            }
                            else if (icheck_id == "campaign_add_to_netsuite") {
                                camp.setNetSuiteStep1(icheck);
                            }
                            else if (icheck_id == "conversion_filter") {
                                camp.setCoversionPageStep1(icheck);
                            }
                            else if (icheck_id == "campaign_useCustomFooter") {
                                camp.setCustomFooterArea();
                            }

                        }
                        if (camp.wizard.active_step == 1) {
                            camp.states.step1.change = true;
                        }

                    })
                    this.initStepCall('step_' + this.wizard.active_step); // Abdullah InitStepCall Check

                },
                initTemplateListing: function () {
                    this.$el.find("#camp_list_grid").bmsgrid({
                        useRp: false,
                        resizable: false,
                        colresize: false,
                        height: this.app.get('wp_height') - 122,
                        usepager: false,
                        colWidth: ['100%', '90px', '66px', '132px']
                    });
                    this.$("#camp_list_grid tr td:nth-child(1)").attr("width", "100%");
                    this.$("#camp_list_grid tr td:nth-child(2)").attr("width", "90px");
                    this.$("#camp_list_grid tr td:nth-child(4)").attr("width", "132px");
                },
                loadCampaign: function (camp_id) {
                    if (camp_id === "0" || camp_id === 0)
                        return false;
                    var bms_token = this.app.get('bms_token');
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + bms_token + "&campNum=" + camp_id + "&type=basic";
                    var camp_obj = this;

                    //remove previous data 
                    camp_obj.$(".step1 input").val("");
                    camp_obj.$(".step1 input[type='checkbox']").prop("checked", false);
                    this.camp_id = camp_id;
                    this.setupCampaign();
                    this.app.showLoading(true, this.$el.parents(".ws-content"));
                    $("#campMenubtn").attr("disabled", true).html("Loading...");
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var camp_json = jQuery.parseJSON(xhr.responseText);
                        camp_obj.campobjData = camp_json;
                        $("#campMenubtn").attr("disabled", false).html("Load");

                        if (camp_obj.app.checkError(camp_json)) {
                            return false;
                        }
                        camp_obj.camp_istext = camp_json.isTextOnly;
                        camp_obj.checksum = camp_json['campNum.checksum'];
                        //Setting Campaign Basic Settings
                        camp_obj.$el.parents(".ws-content").find("#workspace-header").addClass('header-edible-campaign').html(camp_json.name);
                        /*-----Remove loading------*/
                        camp_obj.app.removeSpinner(camp_obj.$el);
                        /*------------*/
                        //Setting tab details
                        var workspace_id = camp_obj.$el.parents(".ws-content").attr("id");
                        camp_obj.app.mainContainer.setTabDetails({workspace_id: workspace_id, heading: camp_json.name, subheading: "Campaign Wizard"});

                        camp_obj.$("#campaign_subject").val(camp_obj.app.decodeHTML(camp_json.subject));
                        var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        if (camp_json.fromEmail != '')
                        {
                            if (merge_field_patt.test(camp_obj.app.decodeHTML(camp_json.fromEmail)))
                            {
                                var merge_field = camp_obj.app.decodeHTML(camp_json.defaultFromEmail);
                                camp_obj.$("#campaign_from_email_input").val(merge_field);
                                if (camp_obj.campDefaults.fromEmail) {
                                    camp_obj.$("#campaign_from_email").val(camp_obj.app.decodeHTML(camp_json.fromEmail)).trigger('chosen:updated');
                                }
                                else {
                                    camp_obj.$("#campaign_from_email").val(merge_field).trigger('chosen:updated');
                                }
                                camp_obj.$("#campaign_from_email_default").show();
                                camp_obj.$("#fromemail_default").val(camp_obj.app.decodeHTML(camp_json.defaultFromEmail)).trigger("chosen:updated");
                                camp_obj.$("#fromemail_default_input").val(camp_obj.app.decodeHTML(camp_json.defaultFromEmail));                                

                            }
                            else
                            {
                                camp_obj.$("#campaign_from_email").val(camp_obj.app.decodeHTML(camp_json.fromEmail)).trigger("chosen:updated");                                                       
                                camp_obj.$("#campaign_from_email_default").hide();
                            }
                        }
                        var subj_w = camp_obj.$el.find('#campaign_subject').innerWidth(); // Abdullah Check
                        var fegb_w = camp_obj.$el.find('#fecol3').width();                        
                        if (camp_obj.campFromName) {
                            camp_obj.$("#campaign_from_name").val(camp_obj.campFromName);
                        }
                        if (camp_json.senderName != '') {
                            camp_obj.$("#campaign_from_name").val(camp_obj.app.decodeHTML(camp_json.senderName));
                        }
                        else {
                            camp_obj.states.step1.change = true;
                        }
                        //states.step1.change
                        camp_obj.$("#campaign_reply_to").val(camp_obj.app.decodeHTML(camp_json.replyTo));
                        if (camp_obj.wizard.options.isCreateCamp) {
                            camp_obj.$("#campaign_reply_to").val(camp_obj.app.decodeHTML(camp_json.fromEmail));
                        }
                        if (camp_json.isFooterText == 'Y') {
                            camp_obj.$("#campaign_footer_text").val(camp_obj.app.decodeHTML(camp_json.footerText, true));
                        }
                        camp_obj.states.step2.htmlText = camp_obj.app.decodeJSON(camp_json["htmlText"]);
                        camp_obj.states.step2.plainText = camp_obj.app.decodeJSON(camp_json.plainText);
                        camp_obj.states.step2.editorType = camp_json.editorType;

                        camp_obj.states.step3.recipientType = camp_json.recipientType;
                        if (camp_json.defaultSenderName != '')
                        {
                            if (camp_json.defaultSenderName) {
                                camp_obj.$("#campaign_from_name_default").show();
                                camp_obj.$("#campaign_default_from_name").val(camp_json.defaultSenderName);
                            }
                            else {
                                camp_obj.$("#campaign_from_name_default").hide();
                            }
                        }

                        if (camp_json.defaultReplyTo) {
                            camp_obj.$("#campaign_reply_to_default").show();
                            camp_obj.$("#campaign_default_reply_to").val(camp_json.defaultReplyTo);
                        }
                        else {
                            camp_obj.$("#campaign_reply_to_default").hide();
                        }
                        camp_obj.$("#campaign_socail_networks").prop("checked", camp_json.isShareIcons == "N" ? false : true);
                        camp_obj.$("#campaign_fb").prop("checked", camp_json.facebook == "N" ? false : true);
                        camp_obj.$("#campaign_twitter").prop("checked", camp_json.twitter == "N" ? false : true);
                        camp_obj.$("#campaign_linkedin").prop("checked", camp_json.linkedin == "N" ? false : true);
                        camp_obj.$("#campaign_pintrest").prop("checked", camp_json.pinterest == "N" ? false : true);
                        camp_obj.$("#campaign_gplus").prop("checked", camp_json.googleplus == "N" ? false : true);


                        camp_obj.$("select#campaign_unSubscribeType").val(camp_json.unSubscribeType).trigger("chosen:updated");
                        camp_obj.$("#campaign_profileUpdate").prop("checked", camp_json.profileUpdate == "N" ? false : true);
                        camp_obj.$("#campaign_useCustomFooter").prop("checked", camp_json.useCustomFooter == "N" ? false : true);
                        camp_obj.$("#campaign_isFooterText").prop("checked", camp_json.isFooterText == "N" ? false : true);
                        camp_obj.$("#campaign_subscribeInfoUpdate").prop("checked", camp_json.subInfoUpdate == "N" ? false : true);
                        camp_obj.$("#campaign_tellAFriend").prop("checked", camp_json.tellAFriend == "N" ? false : true);
                        //camp_obj.$("#campaign_isTextOnly").prop("checked",camp_json.isTextOnly=="N"?false:true);
                        camp_obj.$("#campaign_isWebVersion").prop("checked", camp_json.isWebVersionLink == "N" ? false : true);

                        camp_obj.setFooterArea();
                        camp_obj.setCustomFooterArea();
                        //Load tags
                        camp_obj.tags = camp_obj.app.encodeHTML(camp_json.tags);
                        camp_obj.initCampaignTag(camp_obj.tags);

                        if (camp_json.addToSFStatus == 'Y') {
                            camp_obj.states.step1.hasResultToSalesCampaign = true;
                            camp_obj.$("#campaign_add_to_salesforce").prop("checked", true);
                            camp_obj.states.step1.sf_checkbox = true;
                            camp_obj.states.step1.sfCampaignID = camp_json.sfCampaignID;
                            if (camp_obj.states.saleforce_campaigns === null)
                                camp_obj.showSalesForceCampaigns();
                            else
                                camp_obj.$("#sf_campaigns_combo").prop("disabled", false).val(camp_json.sfCampaignID).trigger("chosen:updated");

                            camp_obj.$("#accordion").accordion({active: 0});
                        }
                        else {
                            camp_obj.states.step1.hasResultToSalesCampaign = false;
                            camp_obj.$("#campaign_add_to_salesforce").prop("checked", false);
                            camp_obj.states.step1.sf_checkbox = false;
                            camp_obj.$("#accordion").accordion({active: false});
                        }
                        //Netsuite campaign add
                        if (camp_json.addToNSStatus == 'Y') {
                            camp_obj.states.step1.hasResultToNetsuiteCampaign = true;
                            camp_obj.$("#campaign_add_to_netsuite").prop("checked", true);
                            camp_obj.states.step1.ns_checkbox = true;
                            camp_obj.states.step1.nsCampaignID = camp_json.nsCampaignID;
                            camp_obj.showNetsuiteCampaigns();
                            camp_obj.$("#accordion").accordion({active: 0});
                        }
                        else {
                            camp_obj.states.step1.hasResultToNetsuiteCampaign = false;
                            camp_obj.$("#campaign_add_to_netsuite").prop("checked", false);
                            camp_obj.states.step1.ns_checkbox = false;
                            camp_obj.$("#accordion").accordion({active: false});
                        }

                        if (camp_json.conversionFilterStatus == 'Y') {
                            camp_obj.$("#conversion_filter").prop("checked", true);
                            camp_obj.states.step1.hasConversionFilter = true;
                            camp_obj.states.step1.pageconversation_checkbox = true;
                            URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK=" + bms_token + "&type=get&campNum=" + camp_id;

                            jQuery.getJSON(URL, function (tsv, state, xhr) {
                                var conversation_filter = jQuery.parseJSON(xhr.responseText);
                                if (camp_obj.app.checkError(conversation_filter)) {
                                    return false;
                                }
                                camp_obj.setConversionPage();
                                if (conversation_filter.ruleCount > 0) {
                                    var r = conversation_filter.rules[0].rule1[0];
                                    camp_obj.$("select#con_filter_combo").val(camp_obj.app.decodeHTML(r.rule));
                                    camp_obj.$("#con_filter_field").val(camp_obj.app.decodeHTML(r.matchValue));
                                    camp_obj.setConversionPage();
                                }

                            });
                            camp_obj.$("#accordion1").accordion({active: 0});
                        }
                        else {
                            camp_obj.states.step1.hasConversionFilter = false;
                            camp_obj.states.step1.pageconversation_checkbox = false;
                            camp_obj.$("#conversion_filter").prop("checked", false);
                            camp_obj.$("#accordion1").accordion({active: false});
                            camp_obj.setConversionPage();
                        }
                        camp_obj.initCheckbox();

                        camp_obj.states.step4.camp_status = camp_json.status;
                        camp_obj.states.step4.sch_date = camp_json.scheduledDate;

                        camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));


                    });
                }
                ,
                initHeader: function () {
                    var previewIconCampaign = $('<a class="icon preview showtooltip" data-original-title="Preview Campaign"></a>');
                    var copyIconCampaign = $('<a class="icon copy showtooltip" data-original-title="Copy Campaign"></a>');
                    var deleteIconCampaign = $('<a class="icon delete showtooltip" data-original-title="Delete Campaign"></a>');
                    var active_ws = this.$el.parents(".ws-content");

                    var header_title = active_ws.find(".camp_header .edited  h2");
                    var action_icon = $('<div class="pointy"></div>")');
                    action_icon.append(copyIconCampaign);
                    action_icon.append(deleteIconCampaign);
                    header_title.append(action_icon);
                    header_title.append(previewIconCampaign);
                    active_ws.find(".camp_header #workspace-header").attr("data-original-title", "Click to rename");
                    active_ws.find(".camp_header #workspace-header").addClass('showtooltip');
                    active_ws.find(".camp_header").addClass("heighted-header");
                    active_ws.find("#header_wp_field").attr("placeholder", "Type in Campaign Name");
                    active_ws.find("#save_campaign_btn").click(_.bind(this.saveCampaign, this));
                    active_ws.find("#cancel_campaign_btn").click(_.bind(this.setupCampaign, this));
                    active_ws.find(".camp_header .addtag a").addClass('showtooltip');
                    active_ws.find("#header_wp_field").keyup(function (e) {
                        if (e.keyCode == 13) {
                            active_ws.find("#save_campaign_btn").click();
                        }
                    });
                    var camp_obj = this;
                    var appMsgs = camp_obj.app.messages[0];

                    copyIconCampaign.click(function (e) {
                        camp_obj.copyCamp();
                    });
                    active_ws.find("#workspace-header").click(function (e) {
                        active_ws.find(".camp_header .c-name h2,#campaign_tags").hide();
                        var text = active_ws.find("#workspace-header").html();
                        active_ws.find(".camp_header .c-name .edited ").show();
                        active_ws.find("#header_wp_field").focus().val(camp_obj.app.decodeHTML(text));
                        e.stopPropagation();
                    });
                    previewIconCampaign.click(function (e) {
                        //active_ws.find(".camp_header .c-name h2,#campaign_tags").hide();
                        var camp_name = active_ws.find("#workspace-header").html();
                        var dialog_width = $(document.documentElement).width() - 60;
                        var dialog_height = $(document.documentElement).height() - 182;
                        var dialog = camp_obj.app.showDialog({title: 'Campaign Preview of &quot;' + camp_name + '&quot;',
                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                            headerEditable: false,
                            headerIcon: 'dlgpreview',
                            bodyCss: {"min-height": dialog_height + "px"}
                        });
                        camp_obj.app.showLoading("Loading Campaign Preview...", dialog.getBody());
                        var preview_url = "https://" + camp_obj.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + camp_obj.camp_id;
                        require(["common/templatePreview"], _.bind(function (templatePreview) {
                            var tmPr = new templatePreview({frameSrc: preview_url, app: camp_obj.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: camp_obj.camp_id, isText: camp_obj.camp_istext}); // isText to Dynamic
                            dialog.getBody().html(tmPr.$el);
                            tmPr.init();
                        }, this));
                        e.stopPropagation();
                    })
                    var camp_obj = this;
                    deleteIconCampaign.click(function () {
                        //if(confirm('Are you sure you want to delete this campaign?')){
                        camp_obj.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: appMsgs.CAMPS_delete_confirm_error,
                            callback: _.bind(function () {
                                camp_obj.$el.parents(".ws-content.active").find(".overlay").remove();
                                camp_obj.deleteCampaign(camp_obj.camp_id);
                            }, camp_obj)},
                        $("body"));
                        //}
                    });
                    active_ws.find(".camp_header .showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                }
                ,
                sendTextPreview: function (camp_id) {
                    var camp_obj = this;
                    var dialog_width = 650;
                    var dialog_height = 100;
                    var dialog = camp_obj.app.showDialog({title: 'Email Preview',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20%"},
                        headerEditable: false,
                        headerIcon: 'copycamp',
                        bodyCss: {"min-height": dialog_height + "px"},
                        buttons: {saveBtn: {text: 'Send', btnicon: 'copycamp'}}
                    });
                    var email_preview = '<div style=" min-height:100px;"  class="clearfix template-container gray-panel" id="create-template-container">';
                    email_preview += '<div class="cont-box" style="margin-top:10px; top:0; left:56%; width:90%;">';
                    email_preview += '<div class="row campname-container">';
                    email_preview += '<label style="width:10%;">To:</label>';
                    email_preview += '<div class="inputcont" style="text-align:right;">';
                    email_preview += '<input type="text" name="_email" id="send_email" placeholder="Enter comma separated email addresses" style="width:83%;" />';
                    email_preview += '</div></div></div></div>';
                    email_preview = $(email_preview);
                    dialog.getBody().html(email_preview);
                    email_preview.find("#send_email").focus();
                    email_preview.find("#send_email").keydown(_.bind(function (e) {
                        if (e.keyCode == 13) {
                            this.sendTestCampaign(dialog, camp_id);
                        }
                    }, this))
                    dialog.saveCallBack(_.bind(this.sendTestCampaign, this, dialog, camp_id));
                },
                workspaceHeader: function (e) {
                    var active_ws = this.$el.parents('.ws-content.active');
                    active_ws.find(".camp_header .c-name h2,#campaign_tags").hide();
                    var text = active_ws.find("#workspace-header").html();
                    active_ws.find(".camp_header .c-name .edited ").show();
                    active_ws.find("#header_wp_field").focus().val(this.app.decodeHTML(text));
                    e.stopPropagation();
                },
                sendTestCampaign: function (dialog, camp_id) {
                    var _this = this;
                    var _emails = dialog.$el.find("#send_email").val();
                    if (_emails) {
                        var post_data = {toEmails: _emails};
                        this.app.showLoading("Sending Email...", dialog.$el);
                        var _this = this;
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + camp_id + "&type=email";
                        $.post(URL, post_data)
                                .done(function (data) {
                                    var _json = jQuery.parseJSON(data);
                                    _this.app.showLoading(false, dialog.$el);
                                    if (_json[0] !== "err") {
                                        dialog.hide();
                                        _this.app.showMessge("Email sent successfully!");
                                    }
                                    else {
                                        _this.app.showAlert(_json[1], $("body"), {fixed: true});
                                    }
                                });
                    }
                },
                getcampaigns: function () {
                    var camp_obj = this;
                    /*this.app.getData({
                     "URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset=0",
                     "key":"campaigns"
                     });*/
                    this.refreshCampaignList();
                    var appMsgs = camp_obj.app.messages[0];
                    camp_obj.app.showMessge(appMsgs.CAMP_copy_success_msg);
                },
                copyCamp: function ()
                {
                    var camp_obj = this;
                    var dialog_title = "Copy Campaign";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Create Campaign'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["campaigns/copycampaign"], function (copycampaignPage) {
                        var mPage = new copycampaignPage({camp: camp_obj, camp_id: camp_obj.camp_id, app: camp_obj.app, copycampdialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.copyCampaign, mPage));
                    });
                },
                deleteCampaign: function (camp_id) {
                    var camp_obj = this;
                    var active_ws = this.$el.parents(".ws-content");
                    var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=' + camp_obj.app.get('bms_token');
                    camp_obj.app.showLoading("Deleting Campaign...", camp_obj.$el.parents(".ws-content.active"));
                    $.post(URL, {type: 'delete', campNum: camp_obj.camp_id})
                            .done(function (data) {
                                var del_camp_json = jQuery.parseJSON(data);
                                if (camp_obj.app.checkError(del_camp_json)) {
                                    return false;
                                }
                                if (del_camp_json[0] !== "err") {
                                    camp_obj.app.showMessge("Campaign Deleted");
                                    active_ws.find(".camp_header  .close-wp").click();
                                    camp_obj.app.removeCache("campaigns");
                                    camp_obj.refreshCampaignList();
                                }
                                camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content.active"));
                            });
                },
                initStepCall: function (stepNo) {
                    if (this.camp_id !== 0) {
                        switch (stepNo) {
                            case 'step_2':
                                this.initStep2();
                                break;
                            case 'step_3':
                                this.initStep3();

                                break;
                            case 'step_4':
                                this.initStep4();
                                break;
                            default:
                                break;
                        }
                        if (stepNo == 'step_1') {
                            this.app.fixEmailFrom();
                        }
                    }
                },
                initStep2: function () {
                    if (this.campobjData.isTextOnly == "Y") {
                        this.$("#plain_text").click();
                        this.$("#plain-text").val(this.app.decodeHTML(this.states.step2.plainText, true));
                    }
                    else if (this.campobjData.editorType == "W") {
                        this.$("#html_editor").click();
                    }
                    else if (this.campobjData.editorType == "MEE") {
                        this.$("#html_editor_mee").click();
                    } else if (this.campobjData.editorType == "H") {
                        this.$("#html_code").click();
                        this.$("textarea#handcodedhtml").val(this.app.decodeHTML(this.states.step2.htmlText, true));
                    }
                    else if (this.campobjData.editorType == "") {
                        this.$("#use_template").click();
                    }

                    var _height = $(window).height() - 431;
                    var _width = this.$el.width() - 24;
                    this.$(".html-text,.editor-text").css({"height": _height + "px", "width": _width + "px"});
                    this.$("#htmlarea").css({"height": _height + "px", "width": (_width - 2) + "px"});

                },
                initScroll: function (el) {
                    this.app.scrollingTop({scrollDiv: 'window', appendto: this.$el});
                    this.$win = $(window)
                            , this.$nav = this.$('.editortoolbar')
                            , this.$tools = this.$('.editortools')
                            , this.container = $("#container")
                            , this.$editorarea = this.$('.editorbox')
                            , this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').offset().top
                            , this.isFixed = 0, this.scrollChanged = false;

                    this.processScroll = _.bind(function () {
                        if (this.$("#area_html_editor_mee").height() > 0) {
                            if (this.$("#area_html_editor_mee").css("display") !== "none") {
                                var i, scrollTop = this.$win.scrollTop();
                                if (scrollTop >= this.navTop && !this.isFixed) {
                                    this.isFixed = 1
                                    this.$nav.addClass('editor-toptoolbar-fixed editor-toptoolbar-fixed-border');
                                    this.$nav.css("width", this.$(".editorpanel").width());
                                    this.$tools.addClass('editor-lefttoolbar-fixed');
                                    this.$editorarea.addClass('editor-panel-fixed-camp');
                                    this.scrollfixPanel();
                                } else if (scrollTop <= this.navTop && this.isFixed) {
                                    this.isFixed = 0
                                    
                                    this.$nav.removeClass('editor-toptoolbar-fixed editor-toptoolbar-fixed-border');
                                    if(this.$nav.find('.disabled-toolbar').css('visibility')=='hidden'){
                                        this.$nav.css("margin-bottom", "0");
                                         this.$el.find('#mee-iframe').contents().find('.mainTable').css('margin-top','45px');
                                    }else{
                                        this.$nav.css("margin-bottom", "45px");
                                        this.$el.find('#mee-iframe').contents().find('.mainTable').css('margin-top','0');
                                    }
                                    this.$nav.css("width", "100%");
                                    this.$tools.removeClass('editor-lefttoolbar-fixed');
                                    this.$editorarea.removeClass('editor-panel-fixed-camp');
                                }
                                var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                                if (scrollBottom < 74) {
                                    var lessBy = 74 - scrollBottom;
                                    if (this.$("#mee_editor").setAccordian) {
                                        this.$("#mee_editor").setAccordian(lessBy);
                                        this.scrollChanged = true;
                                    }
                                }
                                else if (this.scrollChanged) {
                                    this.$("#mee_editor").setAccordian(0);
                                    this.scrollChanged = false;
                                }
                                else {                                    
                                    var lessBy =  this.navTop - $(window).scrollTop();
                                    if(lessBy>0){
                                    this.$("#mee_editor").setAccordian(lessBy);
                                        this.scrollChanged = false;                                    
                                    }
                                    else{
                                        this.scrollChanged = true;
                                    }
                                }
                            }
                        }
                    }, this);
                    this.processScroll();
                    this.$win.on('scroll', this.processScroll);
                },
                scrollfixPanel: function () {
                    $(window).scroll(_.bind(function () {
                        var scrollTop = this.$win.scrollTop();
                        var scrollPosition = scrollTop - 372;
                        
                        if (scrollPosition < 0) {
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', '0');
                            this.$el.find('.editortoolbar').css('margin-bottom','0');
                            this.$el.find('#mee-iframe').contents().find(".mainTable").css("margin-top","45px");
                        } else {
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', scrollPosition + 'px');
                        }
                    }, this));
                },
                initStep3: function () {
                    if (this.states.step3.recipientType)
                    {
                        var source_li = "choose_lists";
                        if (this.states.step3.recipientType.toLowerCase() == "list") {
                            source_li = "choose_lists";
                        }
                        else if (this.states.step3.recipientType.toLowerCase() == "target") {
                            source_li = "choose_targets";
                        }
                        else if (this.states.step3.recipientType.toLowerCase() == "tags") {
                            source_li = "choose_tags";
                        }
                        else if (this.states.step3.recipientType.toLowerCase() == "salesforce") {
                            source_li = "salesforce_import";
                        }
                        else if (this.states.step3.recipientType.toLowerCase() == "netsuite") {
                            source_li = "netsuite_import";
                        } else if (this.states.step3.recipientType.toLowerCase() == "highrise") {
                            source_li = "highrise_import";
                        } else if (this.states.step3.recipientType.toLowerCase() == "google") {
                            source_li = "google_import";
                        }
                        this.$(".step3 #" + source_li).click();

                    }
                    var that = this;
                    var width = 820;
                    if (this.scrollApply == false) {
                        that.$('.scroll-text').css('width', width + "px");
                        that.$('.step3').find('.selection-boxes').css('width', width + "px");

                        that.$('.scroll-text').scrollbox({
                            chunk: 6,
                            selection: true,
                            back: that.$('#box_backward'),
                            forward: that.$('#box_forward')
                        });

                        this.scrollApply = true;
                        that.$('#box_backward').click(function () {
                            that.$('.scroll-text').trigger('backward');

                        });
                        that.$('#box_forward').click(function () {
                            that.$('.scroll-text').trigger('forward');

                        });
                    }
                },
                fetchServerTime: function () {
                    this.app.showLoading("Loading Calendar...", this.$(".schedule-box2"));
                    require(["campaigns/schedule_campaign"], _.bind(function (scheduleCalnder) {
                        var tmPr = new scheduleCalnder({app: this.app, parent: this, currentStates: this.states.step4, campNum: this.camp_id, rescheduled: this.rescheduled, hidecalender: this.hidecalender, scheduleFlag: 'draft'});
                        //tmPr.init(); // Call view functions
                        this.$el.find('.schedule-box2').append(tmPr.$el);
                        this.$el.find('.schedule-box2').removeAttr('style');
                        this.app.showLoading(false, this.$(".schedule-box2"));
                    }, this));
                },
                initStep4: function () {
                    if (this.states.step4.init === false) {
                        this.$("#accordion_info").accordion({collapsible: false, heightStyle: "fill"});
                        this.$("#accordion_recipients").accordion({collapsible: false});
                        if (this.states.step4.camp_status == 'S') {
                            this.loadCalender(this.states.step4.sch_date);
                            this.showScheduleBox();
                        }
                        else {
                            this.fetchServerTime();
                        }
                        this.$(".gotostep3").click(_.bind(function () {
                            this.wizard.back();
                        }, this))
                        this.$(".gotostep2").click(_.bind(function () {
                            this.wizard.back();
                            this.wizard.back();
                        }, this))
                        this.$(".gotostep1").click(_.bind(function () {
                            this.wizard.back();
                            this.wizard.back();
                            this.wizard.back();
                        }, this))
                        this.states.step4.init = true;
                    }
                    this.rescheduled = this.wizard.options.rescheduled;
                    this.hidecalender = this.wizard.options.hidecalender;
                    //this.setScheduleArea();
                    //this.scheduleStateCamp();
                    this.$("#campaign_preview_subject").html(this.app.encodeHTML(this.$("#campaign_subject").val()));
                    //this.$("#campaign_preview_fromEmail").html(this.app.encodeHTML(this.$("#campaign_from_email_input").val()));
                    this.$("#campaign_preview_fromEmail").html(this.app.encodeHTML(this.$("#campaign_from_email").val()));
                    if (this.$("#fromemail_default").val() != '' && this.$('#campaign_from_email_default').css('display') == 'block')
                    {
                        this.$("#femail_default").show();
                        this.$("#campaign_preview_fromEmail_default").html(this.app.encodeHTML(this.$("#fromemail_default_input").val()));
                    }
                    this.$("#campaign_preview_defaultSenderName").html(this.app.encodeHTML(this.$("#campaign_from_name").val()));
                    if (this.$("#campaign_default_from_name").val() != '')
                    {
                        this.$("#fromname_default").show();
                        this.$("#campaign_preview_sendername_default").html(this.$("#campaign_default_from_name").val());
                    }
                    this.$("#campaign_preview_defaultReplyTo").html(this.app.encodeHTML(this.$("#campaign_reply_to").val()));
                    if (this.$("#campaign_default_reply_to").val() != '')
                    {
                        this.$("#replyto_default").show();
                        this.$("#campaign_preview_replyto_default").html(this.$("#campaign_default_reply_to").val());
                    }

                    var settings_field = this.$(".step1-settings .inputlabel");
                    var settings_html = "", recipients_html = "";
                    $.each(settings_field, function () {
                        if ($(this).find("input").attr("id") !== "campaign_isFooterText") {
                            if ($(this).find("input").prop("checked")) {
                                settings_html += '<div  class="row fluidlabel"><label class="checked">' + $(this).find("label").text() + '</label></div>'
                            }
                        }
                    })
                    if (this.$("#campaign_isFooterText").prop("checked")) {
                        settings_html += '<div class="row fluidlabel" style="margin:15px 0 0;"><label class=""><strong>Company and Physical Address in email footer:</strong></label>';
                        settings_html += ' <p class="clearfix">' + this.$("#campaign_footer_text").val() + '</p>'
                        settings_html += '</div>';
                    }
                    var camp_obj = this;
                    //var recipientsListsSch = this.getRecipientsListsRequest(this.states.step3.recipientType);

                    recipients_html = '<div  class="row fluidlabel"><label class="checked">Selected Recipient Type is "' + this.states.step3.recipientType + '"</label></div><div class="recipient-details"></div>'
                    //console.log(this.states.step3.recipientDetial.listNumbers.length);
                    this.$(".recipients-inner").html(recipients_html);
                    this.recipientDetails();

                    this.$(".settings-inner").html(settings_html + "<div class='clearfix'></div>");
                    var i = 0;
                    this.$(".step1 .socialbtns li").each(function () {
                        var checked = $(this).find("input").prop("checked");
                        if (checked) {
                            camp_obj.$(".step4 .socialbtns li." + $(this)[0].className).show();
                            i++;
                        }
                        else {
                            camp_obj.$(".step4 .socialbtns li." + $(this)[0].className).hide();
                        }
                    });
                    if (i == 0)
                        this.$('.social_accord').hide();
                    else
                        this.$('.social_accord').show();
                    if (this.$("#campaign_add_to_salesforce").prop("checked")) {
                        this.$(".sf-camp-info").show();
                        this.$(".sf-camp-info .text").html('<img width="18" title="Salesforce" src="img/sficon.png" alt="" class="left"/> &nbsp;&nbsp;' + this.$("#sf_campaigns_combo option:selected").text())
                    }
                    else {
                        this.$(".sf-camp-info").hide();
                    }
                    if (this.$("#conversion_filter").prop("checked")) {
                        this.$(".conversion-page-info").show();
                        var filter = this.$("#con_filter_combo").val() == 'ct' ? 'Contains' : 'Equal to';
                        this.$(".conversion-page-info .text").html('Text in URL <strong>' + filter + ' ' + this.$("#con_filter_field").val() + '</strong>');
                    }
                    else {
                        this.$(".conversion-page-info").hide();
                    }
                    if (this.$("#campaign_add_to_salesforce").prop("checked") || this.$("#conversion_filter").prop("checked"))
                        this.$(".other_accord").show();
                    else
                        this.$(".other_accord").hide();
                    if(this.camp_istext=="Y"){
                        var html = 'N';
                        this.$el.find('.previewbtns').hide();
                    }else{
                        var html = 'Y';
                        this.camp_istext = 'N';
                        this.$el.find('.previewbtns').show();
                    }
                    this.$el.find('.email-preview iframe').remove();
                    var transport = new easyXDM.Socket({           

                        remote:  window.location.protocol+'//'+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum=" + this.camp_id + "&html="+html+"&original="+this.camp_istext+"&xdm=true",

                        onReady: function(){
                              //  this._app.showLoading(false,dialog.getBody());
                        },
                        onMessage: _.bind(function(message, origin){
                            var response = jQuery.parseJSON(message);
                            if (Number(response.height) < 600) {
                                    this.$el.find('.email-preview iframe').height('600');
                                } else {
                                    this.$el.find('.email-preview iframe').height(response.height);
                                }
                        },this),
                        props:{style:{width:"100%",height:"600px"},frameborder:0},
                        container : this.$(".email-preview")[0]
                    }); 
                },
                setupCampaign: function () {
                    var active_ws = this.$el.parents(".ws-content");
                    if (this.camp_id === 0) {
                        active_ws.find(".camp_header .c-name h2,.camp_header  #campaign_tags").hide();
                        active_ws.find(".camp_header .c-name .edited ").show();
                        active_ws.find("#camp_tags").children().remove();
                        active_ws.find("#header_wp_field").focus().val('');
                        //active_ws.find(".step-contents").find("input,select,textarea").prop("disabled",true);
                        active_ws.find("#campMenu").prop("disabled", false);
                    }
                    else {
                        active_ws.find(".camp_header .c-name .edited").hide();
                        active_ws.find(".camp_header .c-name h2,.camp_header  #campaign_tags").show();
                        active_ws.find("#header_wp_field").focus().attr("process-id", this.camp_id);
                        active_ws.find(".step-contents").find("input,select,textarea").prop("disabled", false);
                        this.setFooterArea();
                        this.setCustomFooterArea();
                        this.setSalesForceCombo();
                        this.setNetsuiteCombo();
                        this.setConversionPage();
                    }
                },
                refreshCampaignList: function () {
                    var campaign_listing = $(".ws-tabs li[workspace_id='campaigns']");
                    if (campaign_listing.length) {
                        campaign_listing.data("viewObj").total_fetch = 0;
                        campaign_listing.data("viewObj").getallcampaigns();
                        campaign_listing.data("viewObj").headBadge();
                    }
                },
                saveCampaign: function (obj) {
                    var camp_obj = this;
                    var camp_name_input = $(obj.target).parents(".edited").find("input");
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    if (camp_name_input.val() !== "") {

                        if (camp_name_input.attr("process-id")) {
                            $(obj.target).addClass("saving");
                            var campName = camp_name_input.val();
                            $.post(URL, {type: "newName", campName: campName, campNum: this.camp_id})
                                    .done(function (data) {
                                        var camp_json = jQuery.parseJSON(data);
                                        if (camp_json[0] !== "err") {
                                            var new_name = camp_obj.app.encodeHTML(camp_name_input.val());
                                            camp_obj.$el.parents(".ws-content").find("#workspace-header").html(new_name);
                                            camp_obj.setupCampaign();
                                            camp_obj.app.showMessge("Campaign Renamed");
                                            camp_obj.app.removeCache("campaigns");
                                            camp_obj.refreshCampaignList();
                                            var workspace_id = camp_obj.$el.parents(".ws-content").attr("id");
                                            camp_obj.app.mainContainer.setTabDetails({workspace_id: workspace_id, heading: new_name, subheading: "Campaign Wizard"});
                                        }
                                        else {
                                            camp_obj.app.showAlert(camp_json[1], camp_obj.$el.parents(".ws-content.active"));

                                        }
                                        $(obj.target).removeClass("saving");
                                    });
                        }
                        else {
                            $(obj.target).addClass("saving");
                            $.post(URL, {type: "create", campName: camp_name_input.val()})
                                    .done(function (data) {
                                        var camp_json = jQuery.parseJSON(data);
                                        if (camp_json[0] !== "err") {
                                            camp_obj.$el.parents(".ws-content").find("#workspace-header").html(camp_obj.app.encodeHTML(camp_name_input.val()));
                                            camp_obj.camp_id = camp_json[1];
                                            var active_ws = camp_obj.$el.parents(".ws-content");
                                            var camp_tag_ele = active_ws.find(".camp_header #campaign_tags");
                                            if (camp_tag_ele.data("tags")) {
                                                camp_tag_ele.data("tags").setObjectId("campNum", camp_json[1]);
                                            }
                                            camp_obj.setupCampaign();
                                            camp_obj.app.showMessge("Campaign Created");

                                            //update workspace tab id 
                                            var li_id = camp_obj.$el.parents(".ws-content").attr("id").split("_")[1];
                                            $("#wp_li_" + li_id).attr("workspace_id", "campaign_" + camp_json[1]);
                                            camp_obj.app.removeCache("campaigns");
                                            camp_obj.refreshCampaignList();
                                        }
                                        else {
                                            camp_obj.app.showAlert(camp_json[1], camp_obj.$el.parents(".ws-content.active"));
                                        }
                                        $(obj.target).removeClass("saving");
                                    });
                        }
                    }
                    obj.stopPropagation();
                },
                saveStep1: function () {
                    var camp_obj = this;
                    var app = camp_obj.app;
                    var proceed = -1;
                    var errorHTML = "";
                    var isValid = true;
                    var el = camp_obj.$el;
                    var defaultSenderName = "", defaultReplyToEmail = "";
                    var replyto = el.find('#campaign_reply_to').val();
                    var email_addr = el.find('#campaign_default_reply_to').val();
                    var fromEmail = el.find('#campaign_from_email').val();//el.find('#campaign_from_email_input').val();
                    var fromEmailDefault = el.find('#fromemail_default_input').val();
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");


                    if (el.find('#campaign_subject').val() == '')
                    {
                        app.showError({
                            control: el.find('.subject-container'),
                            message: camp_obj.app.messages[0].CAMP_subject_empty_error
                        });
                        isValid = false;
                    }
                    else if (el.find('#campaign_subject').val().length > 100)
                    {
                        app.showError({
                            control: el.find('.subject-container'),
                            message: camp_obj.app.messages[0].CAMP_subject_empty_error
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({control: el.find(".subject-container")});
                    }
                    if (el.find('#campaign_from_name').val() == '')
                    {
                        app.showError({
                            control: el.find('.fname-container'),
                            message: camp_obj.app.messages[0].CAMP_fromname_empty_error
                        });
                        isValid = false;
                    }
                    else if (el.find('#campaign_from_name').val().indexOf("{{") && el.find('#campaign_from_name').val().search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/) == -1) {
                        app.showError({
                            control: el.find('.fname-container'),
                            message: 'Name must start with alphanumeric value. Valid special characters are - _ . ! & +\''
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({control: el.find(".fname-container")});
                    }
                    if (this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val() == "")
                    {
                        app.showError({
                            control: el.find('.fnamedefault-container'),
                            message: camp_obj.app.messages[0].CAMP_defaultfromname_empty_error
                        });
                        isValid = false;
                    }
                    else if (this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val().search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/) == -1) {
                        app.showError({
                            control: el.find('.fnamedefault-container'),
                            message: 'Name must start with alphanumeric value. Valid special characters are - _ . ! & + \''
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({control: el.find(".fnamedefault-container")});
                    }

                    if (fromEmail === '' || (!merge_field_patt.test(fromEmail) && !app.validateEmail(fromEmail)))
                    {
                        app.showError({
                            control: el.find('.fromeEmail-container'),
                            message: camp_obj.app.messages[0].CAMP_fromemail_format_error
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({control: el.find(".fromeEmail-container")});
                    }

                    if (this.$(".femail-default-container").css('display') == "block" && (fromEmailDefault === '' || !app.validateEmail(fromEmailDefault)))
                    {
                        app.showError({
                            control: el.find('.femail-default-container'),
                            message: camp_obj.app.messages[0].CAMP_fromemail_default_format_error
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({control: el.find(".femail-default-container")});
                    }
                    merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");

                    if (replyto !== '' && !merge_field_patt.test(replyto) && !app.validateEmail(replyto))
                    {
                        app.showError({
                            control: el.find('.replyto-container'),
                            message: camp_obj.app.messages[0].CAMP_replyto_format_error
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({control: el.find(".replyto-container")});
                    }
                    if (el.find('#campaign_reply_to_default').css('display') == 'block' && email_addr == '')
                    {
                        app.showError({
                            control: el.find('.replyemail-container'),
                            message: camp_obj.app.messages[0].CAMP_defaultreplyto_empty_error
                        });
                        isValid = false;
                    }
                    else if (el.find('#campaign_reply_to_default').css('display') == 'block' && !app.validateEmail(email_addr))
                    {
                        app.showError({
                            control: el.find('.replyemail-container'),
                            message: camp_obj.app.messages[0].CAMP_defaultreplyto_format_error
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({control: el.find(".replyemail-container")});
                    }

                    if (this.$("#campaign_add_to_salesforce").prop("checked")) {
                        if (this.validateRSF() == false) {
                            if (isValid) {
                                this.$("#campaign_add_to_salesforce").scrollintoview()
                            }
                            isValid = false;
                        }
                    }

                    if (this.$("#campaign_add_to_netsuite_accordion").parent().css("display") == "block" && this.$("#campaign_add_to_netsuite").prop("checked")) {
                        if (this.validateRNS() == false) {
                            if (isValid) {
                                this.$("#campaign_add_to_netsuite").scrollintoview()
                            }
                            isValid = false;
                        }
                    }

                    if (this.$("#conversion_filter").prop("checked")) {
                        if (this.validateConverionPage() == false) {
                            if (isValid) {
                                this.$("#conversion_filter").scrollintoview()
                            }
                            isValid = false;
                        }
                    }


                    if (!isValid)
                    {
                        proceed = 0;
                    }
                    else
                    {
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        defaultSenderName = merge_field_patt.test(this.$('#campaign_from_name').val()) ? this.$("#campaign_default_from_name").val() : "";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        defaultReplyToEmail = merge_field_patt.test(this.$('#campaign_reply_to').val()) ? this.$("#campaign_default_reply_to").val() : "";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                        var subject_field = this.$("#campaign_subject").val();

                        var fromEmail = this.$('#campaign_from_email').val();//this.$('#campaign_from_email_input').val();
                        var fromEmailMF = merge_field_patt.test(fromEmail) ? this.$('#fromemail_default_input').val() : "";
                        if (proceed !== 0 && (this.states.step1.change || this.camp_id == 0)) {
                            this.app.showLoading("Saving Step 1...", this.$el.parents(".ws-content"));
                            var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                            $.post(URL, {type: "saveStep1", campNum: this.camp_id,
                                subject: subject_field,
                                senderName: this.$("#campaign_from_name").val(),
                                fromEmail: fromEmail,
                                defaultFromEmail: fromEmailMF,
                                defaultSenderName: defaultSenderName,
                                replyTo: this.$("#campaign_reply_to").val(),
                                defaultReplyToEmail: defaultReplyToEmail,
                                tellAFriend: this.$("#campaign_tellAFriend")[0].checked ? 'Y' : 'N',
                                profileUpdate: 'N',//this.$("#campaign_subscribeInfoUpdate")[0].checked ? 'Y' : 'N',
                                subInfoUpdate: this.$("#campaign_subscribeInfoUpdate")[0].checked ? 'Y' : 'N',
                                unsubscribe: this.$("#campaign_unSubscribeType").val(),
                                provideWebVersionLink: this.$("#campaign_isWebVersion")[0].checked ? 'Y' : 'N',
                                //isCampaignText :this.$("#campaign_isTextOnly")[0].checked?'Y':'N',
                                isFooterText: this.$("#campaign_isFooterText")[0].checked ? 'Y' : 'N',
                                footerText: this.$("#campaign_footer_text").val(),
                                useCustomFooter: this.$("#campaign_useCustomFooter")[0].checked ? 'Y' : 'N',
                                isShareIcons: this.$("#campaign_socail_share input[type='checkbox']:checked").length ? 'Y' : 'N',
                                facebookShareIcon: this.$("#campaign_fb")[0].checked ? 'Y' : 'N',
                                twitterShareIcon: this.$("#campaign_twitter")[0].checked ? 'Y' : 'N',
                                linkedInShareIcon: this.$("#campaign_linkedin")[0].checked ? 'Y' : 'N',
                                googlePlusShareIcon: this.$("#campaign_gplus")[0].checked ? 'Y' : 'N',
                                pinterestShareIcon: this.$("#campaign_pintrest")[0].checked ? 'Y' : 'N'
                            })
                                    .done(function (data) {
                                        var step1_json = jQuery.parseJSON(data);
                                        camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                        if (step1_json[0] !== "err") {
                                            camp_obj.app.showMessge("Step 1 saved successfully!");
                                            camp_obj.states.step1.change = false;
                                            camp_obj.wizard.next();
                                        }
                                        else {
                                            camp_obj.app.showAlert(step1_json[1], $("body"));
                                        }
                                    });
                            if (this.$("#campaign_add_to_salesforce").prop("checked")) {
                                this.saveResultToSF();
                            }
                            if (this.$("#campaign_add_to_netsuite").prop("checked")) {
                                this.saveResultToNS();
                            }
                            if (this.$("#conversion_filter").prop("checked")) {
                                this.saveConversionPage();
                            }
                            proceed = 1;
                        }
                    }
                    return proceed;
                },
                saveForStep2: function (obj) {
                    this.isSaveCallFromMee = false;
                     var button = $.getObj(obj, "a");
                    if (!button.hasClass("saving")) {
                        this.saveStep2(false);
                        button.css('width',button.outerWidth());
                        button.addClass("saving savingbg");
                    }
                },
                saveForStep2Mee: function (obj) {
                    this.isSaveCallFromMee = true;
                     if(obj){
                           this.isNextPress = false;
                            var button = $.getObj(obj, "a");
                                if (!button.hasClass("disabled-btn")) {
                                this.saveStep2(false);
                                this.isSaveCallFromMee = false;
                                button.addClass("disabled-btn");
                            }  
                        }else{
                           this.meeView.autoSaveFlag = true; 
                           this.saveStep2(false); 
                        } 
                },
                saveStep2: function (gotoNext, htmlText) {
                    var camp_obj = this;
                    var proceed = -1;
                    var html = "", plain = "";
                    var post_data = {type: "saveStep2", campNum: this.camp_id, htmlCode: '', plainText: ''};
                    var campaign_subject_title = $.trim(this.$("#campaign_subject").val());
                    var selected_li = this.$(".step2 #choose_soruce li.selected").attr("id");
                    if (selected_li == "html_editor") {                                                
                        html = (this.$(".textdiv").css("display") == "block") ? this.$("#htmlarea").val() : _tinyMCE.get('bmseditor_' + this.wp_id).getContent();
                        //setting email title;                        
                        if(campaign_subject_title!==""){                            
                            var newTitle = '<title>'+campaign_subject_title+'</title>';
                            if(html.indexOf('<meta property="og:image"')==-1){
                                newTitle = newTitle + '<meta content="'+campaign_subject_title+'" itemprop="title name" property="og:title" name="twitter:title">';
                            }
                            html = html.replace(/<title>(.*?)<\/title>/ig, newTitle);
                        }
                        plain = this.$("#bmstexteditor").val();
                        post_data['htmlCode'] = html;
                        post_data['plainText'] = plain;
                        post_data['isCampaignText'] = 'N';
                        camp_obj.camp_istext = 'N';

                    } else if (selected_li == "html_code") {
                        html = this.$("textarea#handcodedhtml").val();
                        post_data['htmlCode'] = html;
                        post_data['isCampaignText'] = 'N';
                        camp_obj.camp_istext = 'N';
                    } else if (selected_li == "plain_text") {
                        plain = this.$("textarea#plain-text").val();
                        post_data['plainText'] = plain;
                        post_data['isCampaignText'] = 'Y';
                        camp_obj.camp_istext = 'Y';
                        post_data['htmlCode'] = '';
                    }
                    else if (selected_li == "html_editor_mee") {
                        if(campaign_subject_title!==""){
                            var newTitle = '<title>'+campaign_subject_title+'</title>';
                            var meeElement = this.$("#mee-iframe").contents();
                            if(meeElement.find("head title").length==1){
                                meeElement.find("head title").html(campaign_subject_title);
                            }
                            else{
                                 meeElement.find("head").append(newTitle);
                            }
                           // meeElement.find("head meta[property='og:title']").attr("content",campaign_subject_title);
                        }
                        html = this.$("#mee_editor").getMEEHTML();
                        post_data['htmlCode'] = html;
                        post_data['plainText'] = this.states.step2.plainText;
                        post_data['isCampaignText'] = 'N';
                        camp_obj.camp_istext = 'N';
                    }
                    if (typeof (htmlText) !== "undefined") {
                        post_data['htmlCode'] = "";
                    }                  
                    if ((this.states.editor_change === true || typeof (gotoNext) !== "undefined")) {
                        if (typeof (gotoNext) === "undefined") {
                            this.app.showLoading("Saving Step 2...", this.$el.parents(".ws-content"));
                        }
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                        $.post(URL, post_data)
                                .done(function (data) {
                                    var step1_json = jQuery.parseJSON(data);
                                    camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                    camp_obj.$(".save-step2,.MenuCallBackSave a").removeClass("disabled-btn");
                                    camp_obj.$(".save-step2,.MenuCallBackSave a").removeClass("saving savingbg");
                                    camp_obj.$(".save-step2").css('width','auto');
                                    if (step1_json[0] !== "err") {
                                        if(camp_obj.meeView && !camp_obj.meeView.autoSaveFlag && !camp_obj.isSaveCallFromMee){
                                        camp_obj.app.showMessge("Step 2 saved successfully!");
                                        if(camp_obj.options.params.parent !== ""){
                                                 camp_obj.options.params.parent.getallcampaigns();
                                             }
                                        }else if(!camp_obj.meeView && !camp_obj.isSaveCallFromMee){
                                             camp_obj.app.showMessge("Step 2 saved successfully!");
                                             if(camp_obj.options.params.parent !== ""){
                                                 camp_obj.options.params.parent.getallcampaigns();
                                             }
                                            
                                        }
                                        if(camp_obj.meeView){
                                            camp_obj.meeView._$el.find('.lastSaveInfo').html('<i class="icon time"></i>Last Saved: '+moment().format('h:mm:ss a'));
                                            camp_obj.meeView.autoSaveFlag = false;
                                        }
                                        if (selected_li == "plain_text") {
                                            camp_obj.states.step2.plainText = plain;
                                            camp_obj.states.step2.htmlText = "";
                                        }
                                        else {
                                            if (typeof (htmlText) == "undefined") {
                                                camp_obj.states.step2.htmlText = html;
                                            }
                                            camp_obj.states.step2.plainText = plain;
                                        }
                                        camp_obj.states.editor_change = false;
                                        if (typeof (gotoNext) == "undefined") {
                                            camp_obj.wizard.next();
                                        }
                                    }
                                    else {
                                        camp_obj.app.showAlert(step1_json[1], $("body"));
                                    }
                                });

                        proceed = 1
                    }
                    return proceed;
                },
                saveStep3: function () {
                    if (this.states.step3.change === false) {
                        return -1;
                    }
                    var source = this.$(".step3 #choose_soruce li.selected").attr("id");

                    if (source == "upload_csv")
                    {
                        this.saveCSVUpload();
                    }
                    else if (source == "choose_lists") {
                        var lists = this.saveLists();
                        if (!lists) {
                            return false;
                        }
                        this.step3SaveCall({'recipientType': 'List', listNum: lists});
                    }
                    else if (source == "choose_targets") {
                        var targets = this.saveTargets();
                        if (!targets) {
                            return false;
                        }
                        this.step3SaveCall({'recipientType': 'Target', filterNumber: targets});
                    }
                    else if (source == "choose_tags") {
                        var tagsView = this.states.step3.tags;
                        var tags = tagsView.saveTags();
                        if (!tags) {
                            this.app.showAlert("Please select tag(s) to set recipients", $("body"), {fixed: true});
                            return false;
                        }
                        this.step3SaveCall({'recipientType': 'Tags', tags: tags});
                    }
                    else if (source == "salesforce_import") {
                        this.step3SaveCall({'recipientType': 'Salesforce'});
                    }
                    else if (source == "netsuite_import") {
                        this.step3SaveCall({'recipientType': 'Netsuite'});
                    } else if (source == "highrise_import") {
                        this.step3SaveCall({'recipientType': 'Highrise'});
                    } else if (source == "google_import") {
                        this.step3SaveCall({'recipientType': 'Google'});
                    } else {
                        this.app.showAlert('We are not currently supporting Tags', $("body"));
                    }
                    //Save call step 3
                    return 1;
                },
                step3SaveCall: function (options) {
                    var camp_obj = this;
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    var no_list = "";
                    var post_data = {type: "recipientType", campNum: this.camp_id};
                    if (options) {
                        $.each(options, function (key, val) {
                            post_data[key] = val;
                        })
                    }
                    this.app.showLoading("Saving Step 3", this.$el.parents(".ws-content"));
                    $.post(URL, post_data)
                            .done(function (data) {
                                var step3_json = jQuery.parseJSON(data);
                                camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                if (step3_json[0] !== "err") {
                                    camp_obj.states.step3.recipientType = post_data['recipientType'];
                                    if (post_data['recipientType'] == "Target") {
                                        camp_obj.states.step3.recipientList = post_data['filterNumber'];
                                    } else if (post_data['recipientType'] == "List") {
                                        camp_obj.states.step3.recipientList = post_data['listNum'];
                                        camp_obj.states.step3.csvFlag = post_data['csvflag'];
                                    } else {
                                        camp_obj.states.step3.recipientList = post_data['tags'];
                                    }
                                    camp_obj.states.step3.change = false;
                                    camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                    camp_obj.refreshCampaignList();
                                    
                                    if (camp_obj.states.step3.recipientType == "Salesforce") {
                                        camp_obj.saveSalesForceDetails(true);
                                    }
                                    else if (camp_obj.states.step3.recipientType == "Netsuite") {
                                        camp_obj.saveNetSuiteDetails(true);
                                    } else if (camp_obj.states.step3.recipientType == "Highrise") {
                                        camp_obj.saveHighriseDetails(true);
                                    } else if (camp_obj.states.step3.recipientType == "Google") {
                                        camp_obj.saveGoogleDetails(true);
                                    } else {
                                        camp_obj.wizard.next();
                                        camp_obj.app.showMessge("Step 3 saved successfully!");
                                    }
                                }
                                else {
                                    camp_obj.app.showAlert(step3_json[1], $("body"));
                                }
                            })
                },
                saveStep4: function () {
                    return -1;
                },
                initCampaignTag: function (tags) {
                    var active_ws = this.$el.parents(".ws-content");
                    var camp_tag_ele = active_ws.find(".camp_header #campaign_tags");
                    camp_tag_ele.tags({app: this.app,
                        url: "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token'),
                        tags: tags,
                        showAddButton: (this.camp_id == "0") ? false : true,
                        params: {type: 'tags', campNum: this.camp_id, tags: ''},
                        typeAheadURL: "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=allCampaignTags"
                    });

                },
                loadDataAjax: function () {
                    var camp_obj = this;
                    //Load Defaults 
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=campaignDefaults";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if (camp_obj.app.checkError(defaults_json)) {
                                return false;
                            }
                            camp_obj.campDefaults = defaults_json;
                            camp_obj.$("#campaign_footer_text").val(camp_obj.app.decodeHTML(defaults_json.footerText));
                            camp_obj.$("#campaign_from_email").val(camp_obj.app.decodeHTML(defaults_json.fromEmail));
                            camp_obj.$("#campaign_from_name").val(camp_obj.app.decodeHTML(defaults_json.fromName));
                            camp_obj.campFromName = camp_obj.app.decodeHTML(defaults_json.fromName);
                            var fromEmails = defaults_json.fromEmail;
                            if (defaults_json.optionalFromEmails)
                                fromEmails += ',' + defaults_json.optionalFromEmails;
                            var fromEmailsArray = fromEmails.split(',');
                            var fromOptions = '';
                            var selected_fromEmail = '';
                            fromEmailsArray.sort();
                            //if (camp_obj.app.salesMergeAllowed) {
                            //  fromOptions += '<option value="{{BMS_SALESREP.EMAIL}}">{{BMS_SALESREP.EMAIL}}</option>';
                            // }
                            for (var i = 0; i < fromEmailsArray.length; i++)
                            {
                                if (fromEmailsArray[i] == defaults_json.fromEmail) {
                                    fromOptions += '<option value="' + fromEmailsArray[i] + '" selected="selected">' + fromEmailsArray[i] + '</option>';
                                    selected_fromEmail = fromEmailsArray[i];
                                }
                                else
                                    fromOptions += '<option value="' + fromEmailsArray[i] + '">' + fromEmailsArray[i] + '</option>';
                            }

                            camp_obj.$el.find('#campaign_from_email').append(fromOptions);
                            //console.log(fromOptions);
                            //if (camp_obj.app.salesMergeAllowed) {
                            camp_obj.$("#campaign_from_email").chosen().change(function (obj) {
                                if (obj.target.value === '{{BMS_SALESREP.EMAIL}}') {
                                    camp_obj.$('#campaign_from_email_default').show();
                                } else {
                                    camp_obj.$('#campaign_from_email_default').hide();
                                }
                            });
                            //}
                            camp_obj.$el.find('#fromemail_default').append(fromOptions);
                            camp_obj.$el.find('#fromemail_default option:contains({{BMS_SALESREP.EMAIL}})').remove();
                            camp_obj.$("#campaign_from_email").chosen({no_results_text: 'Oops, nothing found!', disable_search: (fromEmailsArray.length <= 5) ? true : false});
                            camp_obj.$("#campaign_from_email").css("visibility", "visible");
                            camp_obj.$('#fromemail_default').trigger("chosen:updated");
                            camp_obj.$(".flyinput").val(selected_fromEmail);
                            setTimeout(_.bind(camp_obj.setFromNameField, camp_obj), 300);

                            var subj_w = camp_obj.$el.find('#campaign_subject').innerWidth(); // Abdullah CHeck   
                            //camp_obj.$el.find('#campaign_from_email_chosen').width(parseInt(subj_w+40));
                            //camp_obj.$el.find('#campaign_from_email_chosen').width(parseInt(subj_w+40)); // Abdullah Try

                            if (defaults_json.customFooter == "") {
                                camp_obj.$("#campaign_useCustomFooter_div").hide();
                            }
                            else {
                                camp_obj.$("#campaign_useCustomFooter_div").show();
                                camp_obj.$(".step1col1").css("min-height", "427px");
                                camp_obj.$("#campaign_custom_footer_text").val(camp_obj.app.decodeHTML(defaults_json.customFooter, true));
                            }
                        }
                    }).fail(function () {
                        console.log("error in detauls");
                    });

                    this.app.getData({
                        "URL": "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                        "key": "salesfocre",
                        "callback": _.bind(this.showSalesForceArea, this)
                    });

                    this.app.getData({
                        "URL": "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                        "key": "netsuite",
                        "callback": _.bind(this.showNetsuiteArea, this)
                    });

                },
                step1Change: function () {
                    this.states.step1.change = true;
                },
                editorChange: function () {
                    this.states.editor_change = true;
                },
                step3Change: function () {
                    this.states.step3.change = true;
                },
                showSalesForceArea: function () {
                    var salesforce_setting = this.app.getAppData("salesfocre");
                    if (salesforce_setting && salesforce_setting.isSalesforceUser == "Y") {
                        this.$("#add_result_salesforce").show();
                    }
                    else {
                        this.$("#add_result_salesforce").hide();
                    }
                },
                showNetsuiteArea: function () {
                    var netsuite_setting = this.app.getAppData("netsuite");
                    if (netsuite_setting && netsuite_setting.isNetsuiteUser == "Y") {
                        this.$("#campaign_add_to_netsuite_accordion").parent().show();
                        this.$("#conversion_filter_accordion").parent().addClass("zero-margin-left");
                    }
                    else {
                        this.$("#campaign_add_to_netsuite_accordion").parent().hide();
                        this.$("#conversion_filter_accordion").parent().removeClass("zero-margin-left");
                    }
                },
                createListTable: function (xhr) {
                    var camp_obj = this;
                    this.$el.find("#recpcount span").text('0');
                    this.$el.find("#target-lists").children().remove();
                    var camp_list_json = this.app.getAppData("lists");

                    camp_obj.$el.find('#area_choose_lists #target-lists .bmsgrid').remove();
                    camp_obj.$el.find("#area_choose_lists .col2 .bmsgrid").remove();
                    camp_obj.$el.find("#area_choose_lists").removeData("mapping");

                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="list_grid"><tbody>';
                    camp_obj.$el.find(".list-count").html("Displaying <b>" + camp_list_json.count + "</b> lists");
                    $.each(camp_list_json.lists[0], function (index, val) {
                        list_html += '<tr id="row_' + val[0]["listNumber.encode"] + '" checksum="' + val[0]["listNumber.checksum"] + '">';
                        list_html += '<td><div class="name-type"><h3>' + val[0].name + '</h3><div class="tags tagscont">' + camp_obj.app.showTags(val[0].tags) + '</div></div></td>';
                        list_html += '<td><div class="subscribers show" style="min-width:70px;"><strong><span><em>Subscribers</em>' + val[0].subscriberCount + '</span></strong></div><div id="' + val[0]["listNumber.encode"] + '" class="action">';
                        //console.log(val[0]);
                        if (val[0]['isSupressList'] != "true")
                            list_html += '<a class="btn-green add move-row"><span>Use</span><i class="icon next"></i></a></div></td>';

                        list_html += '</tr>';
                    });
                    list_html += '</tbody></table>';

                    this.$el.find("#target-lists").html(list_html);

                    this.$el.find("#list_grid").bmsgrid({
                        useRp: false,
                        resizable: false,
                        colresize: false,
                        height: this.app.get('wp_height') - 122,
                        usepager: false,
                        colWidth: ['100%', '90px']
                    });
                    this.$("#list_grid tr td:first-child").attr("width", "100%");
                    this.$("#list_grid tr td:last-child").attr("width", "90px");
                    this.$("#recipients-list").css("height", this.app.get('wp_height') - 122);

                    this.$el.find(".taglink").click(_.bind(function (obj) {
                        camp_obj.app.initSearch(obj, this.$el.find("#list-search"));
                    }, this));

                    this.$el.find("#area_choose_lists").mapping({
                        gridHeight: this.app.get('wp_height') - 122,
                        sumColumn: 'subscribers',
                        sumTarget: 'recpcount span',
                        loadTarget: ''
                    });
                    this.app.showLoading(false, camp_obj.$el.find('#area_choose_lists .leftcol'));
                    if (this.states.step3.recipientType.toLowerCase() == "list") {
                        // this.setRecipients();
                    }
                },
                setSalesForceStep1: function (obj) {
                    if (obj.prop("checked")) {
                        this.states.step1.sf_checkbox = true;
                        this.$("#campaign_add_to_salesforce").prop("checked", this.states.step1.sf_checkbox);
                        if (this.states.saleforce_campaigns === null)
                            this.showSalesForceCampaigns();
                        this.$("#accordion").accordion({active: 0});
                    }
                    else {
                        this.removeResultFromSF();
                        this.states.step1.sf_checkbox = false;
                        this.$("#campaign_add_to_salesforce").prop("checked", this.states.step1.sf_checkbox);
                        this.$("#accordion").accordion({active: false});
                    }
                    this.setSalesForceCombo();
                },
                setNetSuiteStep1: function (obj) {
                    if (obj.prop("checked")) {
                        this.states.step1.ns_checkbox = true;
                        this.$("#campaign_add_to_netsuite").prop("checked", this.states.step1.ns_checkbox);
                        if (this.states.netsuite_campaigns === null)
                            this.showNetsuiteCampaigns();
                        this.$("#accordion").accordion({active: 0});
                    }
                    else {
                        this.removeResultFromNS();
                        this.states.step1.ns_checkbox = false;
                        this.$("#campaign_add_to_netsuite").prop("checked", this.states.step1.ns_checkbox);
                        this.$("#accordion").accordion({active: false});
                    }
                    this.setNetsuiteCombo();
                },
                setCoversionPageStep1: function (obj) {
                    if (obj.prop("checked")) {
                        this.states.step1.pageconversation_checkbox = true;
                        this.$("#conversion_filter").prop("checked", this.states.step1.pageconversation_checkbox);
                        this.$("#accordion1").accordion({active: 0});
                    }
                    else {
                        this.removeConversionPage();
                        this.states.step1.pageconversation_checkbox = false;
                        this.$("#conversion_filter").prop("checked", this.states.step1.pageconversation_checkbox);
                        this.$("#accordion1").accordion({active: 1});
                    }
                    this.setConversionPage();

                },
                createTargetsTable: function () {
                    var camp_obj = this;
                    this.$el.find("#trecpcount span").text('0');
                    this.$el.find("#targets").children().remove();
                    var targets_list_json = this.app.getAppData("targets");
                    camp_obj.$el.find('#area_choose_targets #targets .bmsgrid').remove();
                    camp_obj.$el.find("#area_choose_targets .col2 .bmsgrid").remove();
                    camp_obj.$el.find("#area_choose_targets").removeData("mapping");
                    if (targets_list_json.filters) {

                        var target_html = '<table cellpadding="0" cellspacing="0" width="100%" id="targets_grid"><tbody>';

                        $.each(targets_list_json.filters[0], function (index, val) {
                            target_html += '<tr id="row_' + val[0]["filterNumber.encode"] + '" checksum="' + val[0]["filterNumber.checksum"] + '">';
                            target_html += '<td><div class="name-type"><h3>' + val[0].name + '</h3><div class="tags tagscont">' + camp_obj.app.showTags(val[0].tags) + '</div></div></td>';
                            var upd_date = moment(val[0].updationDate, 'YYYY-M-D');
                            var upd_date_new = upd_date.date() + ' ' + camp_obj.app.getMMM(upd_date.month()) + ', ' + upd_date.year();
                            target_html += '<td><div><div class="time show" style="min-width:70px;"><strong><span><em>Updation Date</em>' + upd_date_new + '</span></strong></div><div id="' + val[0]["filterNumber.encode"] + '" class="action"><a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a><a id="' + val[0]["filterNumber.encode"] + '" class="btn-gray edit-action"><span>Edit</span><i class="icon edit"></i></a><a id="' + val[0]["filterNumber.encode"] + '" class="btn-blue copy-action"><span>Copy</span><i class="icon copy"></i></a></div></div></td>';
                            target_html += '</tr>';
                        });
                        target_html += '</tbody></table>';

                    }
                    this.$el.find("#targets").html(target_html);
                    this.$el.find("#targets").bmsgrid({
                        useRp: false,
                        resizable: false,
                        colresize: false,
                        height: this.app.get('wp_height') - 122,
                        usepager: false,
                        colWidth: ['100%', '100']
                    });

                    this.$("#targets tr td:first-child").attr("width", "100%");
                    this.$("#targets tr td:last-child").attr("width", "100px");
                    this.$("#target-recipients-list").css("height", this.app.get('wp_height') - 122);

                    this.$el.find("#area_choose_targets").mapping({
                        gridHeight: this.app.get('wp_height') - 122,
                        sumColumn: 'subscribers',
                        sumTarget: 'trecpcount span',
                        loadTarget: function (obj) {
                            camp_obj.loadTarget(obj);
                        },
                        copyTarget: function (obj) {
                            camp_obj.copyTarget(obj);
                        }
                    });
                    this.addToCol2();

                    this.$el.find(".taglink").click(_.bind(function (obj) {
                        camp_obj.app.initSearch(obj, camp_obj.$el.find("#target-search"));
                    }, camp_obj));

                    this.$el.find("#recipients .taglink").click(_.bind(function (obj) {
                        camp_obj.app.initSearch(obj, camp_obj.$el.find("#target-recps-search"));
                    }, camp_obj));

                    this.app.showLoading(false, camp_obj.$el.find('#area_choose_targets .leftcol'));
                    if (this.states.step3.recipientType.toLowerCase() == "target") {
                        // this.setRecipients();
                    }
                },
                addToCol2: function (obj) {
                    var camp_obj = this;
                    if (this.states.step3.isNewTarget == true)
                    {
                        this.$("#targets").find("tr").filter(function () {
                            if ($(this).find("td h3").text().toLowerCase().indexOf(camp_obj.states.step3.newTargetName) > -1)
                            {
                                var tr_copy = $(this).clone();
                                $(this).remove();
                                tr_copy.find(".action").children().hide();
                                tr_copy.find(".move-row").removeClass("btn-green").addClass("btn-red").html('<i class="icon back left"></i><span>Remove</span>');
                                tr_copy.find(".move-row").show();
                                tr_copy.find(".move-row").click(_.bind(camp_obj.removeFromCol2, camp_obj));
                                tr_copy.appendTo(camp_obj.$(".col2 .rightcol tbody"));
                            }
                        });
                    }
                },
                removeFromCol2: function (obj) {
                    var camp_obj = this;
                    var tr_obj = $(obj.target).parents("tr");
                    tr_obj.fadeOut("fast", function () {
                        var tr_copy = tr_obj.clone();
                        $(this).remove();
                        tr_copy.find(".action").children().show();
                        tr_copy.find(".move-row").removeClass("btn-red").addClass("btn-green").html('<span>Use</span><i class="icon next"></i>');
                        tr_copy.find(".move-row").click(_.bind(camp_obj.addToCol2, camp_obj))
                        var _index = tr_copy.attr("item_index")
                        var next_element = null
                        var col1_rows = camp_obj.$el.find(".col1 .leftcol tr");
                        for (var i = 0; i < col1_rows.length; i++) {
                            if (parseInt($(col1_rows[i]).attr("item_index")) > _index) {
                                next_element = $(col1_rows[i])
                                break
                            }
                        }
                        if (next_element) {
                            tr_copy.insertBefore(next_element)
                        }
                        tr_copy.appendTo(camp_obj.$el.find(".col1 .leftcol tbody"));
                    });
                },
                createCampaignListTable: function () {
                    var camp_obj = this;
                    this.app.showLoading(false, this.$("#copy-camp-listing"));
                    this.$el.find("#copy-camp-listing").children().remove();
                    var camp_list_json = this.app.getAppData("campaigns");
                    this.$el.find("#copy_no_of_camps .badge").html(camp_list_json.totalCount);

                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="camp_list_grid"><tbody>';
                    this.$el.find(".list-count").html("Displaying <b>" + camp_list_json.count + "</b> lists");
                    $.each(camp_list_json.campaigns[0], function (index, val) {
                        if (camp_obj.checksum !== val[0]["campNum.checksum"]) {
                            var dtHead = '';
                            var datetime = '';
                            if (val[0].status != 'D')
                            {
                                dtHead = '<em>Schedule Date</em>';
                                datetime = val[0].scheduledDate;
                            }
                            else
                            {
                                dtHead = '<em>Updation Date</em>';
                                if (val[0].updationDate)
                                    datetime = val[0].updationDate;
                                else
                                    datetime = val[0].creationDate;
                            }
                            var dateFormat = '';
                            if (datetime)
                            {
                                var date = datetime.split(' ');
                                var dateparts = date[0].split('-');
                                var month = camp_obj.app.getMMM(dateparts[1].replace('0', '') - 1);
                                ;
                                dateFormat = dateparts[2] + ' ' + month + ', ' + dateparts[0];
                            }
                            else {
                                dateFormat = '';
                            }
                            var flag_class = '';
                            if (val[0].status == 'D')
                                flag_class = 'pclr1';
                            else if (val[0].status == 'P')
                                flag_class = 'pclr6';
                            else if (val[0].status == 'S')
                                flag_class = 'pclr2';
                            else if (val[0].status == 'C')
                                flag_class = 'pclr18';
                            list_html += '<tr id="row_' + val[0]['campNum.encode'] + '">';
                            var chartIcon = '';
                            if (val[0].status == 'P' || val[0].status == 'C') {
                                chartIcon = '<div class="campaign_stats showtooltip" title="Click to View Chart"><a class="icon report"></a></div>';
                            }
                            list_html += '<td><div class="name-type"><div class="name-type"><h3><span class="campname" style="float:left;">' + val[0].name + '</span><span class="cstatus ' + flag_class + '">' + camp_obj.app.getCampStatus(val[0].status) + '</span>' + chartIcon + '</h3><div class="tags tagscont">' + camp_obj.app.showTags(val[0].tags) + '</div></div></td>';
                            if (val[0].status != 'D')
                                list_html += '<td><div class="subscribers show" style="min-width:60px"><strong><span><em>Sent</em>' + val[0].sentCount + '</span></strong></div></td>';
                            else
                                list_html += '<td></td>';



                            list_html += '<td><div class="time show" style="width:130px"><strong><span>' + dtHead + dateFormat + '</span></strong></div><div id="' + val[0]['campNum.encode'] + '" class="action"><a class="btn-green"><span>Copy</span><i class="icon copy"></i></a></div></td>';
                            list_html += '</tr>';
                        }
                    });
                    list_html += '</tbody></table>';

                    this.$el.find("#copy-camp-listing").html(list_html);
                    this.$el.find("#camp_list_grid").bmsgrid({
                        useRp: false,
                        resizable: false,
                        colresize: false,
                        lazyLoading: _.bind(this.appendCampaigns, this),
                        height: '100%',
                        usepager: false,
                        colWidth: ['100%', '90px', '66px', '132px']
                    });
                    this.$("#camp_list_grid tr td:nth-child(1)").attr("width", "100%");
                    this.$("#camp_list_grid tr td:nth-child(2)").attr("width", "90px");
                    this.$("#camp_list_grid tr td:nth-child(4)").attr("width", "132px");

                    if (camp_list_json.offset && parseInt(camp_list_json.count) == parseInt(camp_list_json.totalCount)) {
                        this.$("#camp_list_grid tr:last-child").removeAttr("data-load");
                    }

                    this.$("#copy-camp-listing .action").click(_.bind(this.copyCampaign, this));
                    this.$el.find(".taglink").click(_.bind(function (obj) {
                        camp_obj.app.initSearch(obj, this.$el.find("#copy-camp-search"));
                    }, this));
                    var that = this;
                    this.$el.find(".report").click(function () {
                        var camp_id = $(this).parents("tr").attr("id").split("_")[1];

                        that.app.mainContainer.addWorkSpace({params: {camp_id: camp_id}, type: '', title: 'Loading...', url: 'reports/summary/summary', workspace_id: 'summary_' + camp_id, tab_icon: 'campaign-summary-icon'});
                    })
                }
                ,
                appendCampaigns: function () {
                    var camp_list_json = this.app.getAppData("campaigns");
                    if (camp_list_json) {
                        var camp_obj = this;
                        var new_offset = camp_list_json.offset ? (camp_list_json.offset + 50) : 50;

                        var list_html = "";
                        var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=listNormalCampaigns&offset=" + new_offset;
                        jQuery.getJSON(URL, function (tsv, state, xhr) {
                            if (xhr && xhr.responseText) {
                                var campaigns = jQuery.parseJSON(xhr.responseText);
                                if (camp_obj.app.checkError(campaigns)) {
                                    return false;
                                }
                                var row_no = 1;
                                camp_obj.$("#copy-camp-listing .footer-loading").remove();
                                camp_list_json.offset = new_offset;
                                $.each(campaigns.campaigns[0], function (index, val) {
                                    list_html = $(camp_obj.makecamprows(val, true));
                                    if (row_no == 50 && camp_list_json.offset + parseInt(campaigns.count) < parseInt(campaigns.totalCount)) {
                                        list_html.attr("data-load", "true")
                                    }
                                    camp_list_json["campaigns"][0]["campaign" + (new_offset + row_no)] = val;
                                    camp_obj.$("#camp_list_grid tbody").append(list_html);
                                    row_no = row_no + 1;
                                });
                                camp_list_json.count = parseInt(camp_list_json.count) + parseInt(campaigns.count);
                                camp_obj.$el.find(".taglink").click(_.bind(function (obj) {
                                    camp_obj.app.initSearch(obj, camp_obj.$el.find("#list-search"));
                                }, camp_obj));

                            }
                        }).fail(function () {
                            console.log("error in campaign lazy loading fields");
                        });
                    }
                    else {
                        this.getallcampaigns();
                    }
                },
                showSalesForceCampaigns: function () {
                    var camp_obj = this;
                    camp_obj.app.showLoading("Loading Salesforce Campaigns...", camp_obj.$el.find('#salesforce_setup .salesforce_campaigns .template-container'));
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=sfCampaignList";
                    this.$("#sf_campaigns_combo").html("<option>Loading...</option>").prop("disabled", true).trigger("chosen:updated");
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            camp_obj.app.showLoading(false, camp_obj.$el.find('#salesforce_setup .salesforce_campaigns .template-container'));
                            var camps_html = '<select data-placeholder="Choose a Salesforce Campaign..." class="chosen-select" id="sf_campaigns_combo" >';
                            camps_html += '<option value=""></option>';
                            var s_camps_json = jQuery.parseJSON(xhr.responseText);
                            if (camp_obj.app.checkError(s_camps_json)) {
                                return false;
                            }
                            camp_obj.states.saleforce_campaigns = s_camps_json;
                            var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="sfcamp_list_grid"><tbody>';
                            $.each(s_camps_json.campList[0], function (index, val) {
                                var _selected = (camp_obj.states.step1.sfCampaignID == val[0].sfCampaignID) ? "selected=selected" : "";
                                camps_html += '<option value="' + val[0].sfCampaignID + '" ' + _selected + '>' + val[0].name + '</option>';
                                list_html += '<tr id="row_' + val[0].sfCampaignID + '">';
                                list_html += '<td><div class="name-type"><h3>' + val[0].name + '</h3> </td>';
                                var total_count = parseFloat(val[0].contactCount) + parseFloat(val[0].leadCount);
                                list_html += '<td><div><div class="subscribers show"><strong class="badge">' + total_count + '</strong></div><div id="' + val[0].sfCampaignID + '" class="action"><a class="btn-green select"><span>Use</span><i class="icon next"></div></div></td>';
                                list_html += '</tr>';
                            });
                            list_html += '</tbody></table>';
                            camps_html += "</select>";

                            //Setting salesforce campaigns in select box
                            camp_obj.$("#salesforce_campaigns").children().remove();
                            camp_obj.$("#salesforce_campaigns").html(camps_html);
                            //Setting salesforce campaigns listing grid
                            camp_obj.$("#salesforce-camp-listing").html(list_html);

                            camp_obj.$el.find("#sfcamp_list_grid").bmsgrid({
                                useRp: false,
                                resizable: false,
                                colresize: false,
                                height: 300,
                                usepager: false,
                                colWidth: ['100%', '90px']
                            });
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(1)").attr("width", "100%");
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(2)").attr("width", "90px");

                            camp_obj.$("#sfcamp_list_grid .action .select").click(function () {
                                camp_obj.$("input[name='options_sf']").eq(4).iCheck('check');
                                //camp_obj.$("#salesforce_setup .filterbtn").hide();
                                camp_obj.$("#sfcamp_list_grid tr.selected").removeClass("selected");
                                $(this).parents("tr").addClass("selected");
                            });

                            camp_obj.$("#sf_campaigns_combo").chosen({no_results_text: 'Oops, nothing found!', width: "280px"});
                            camp_obj.setSalesForceCombo();
                            camp_obj.setSalesForceData()

                        }
                    }).fail(function () {
                        console.log("error fetch sales force campaign");
                    });
                },
                saveResultToSF: function () {
                    var camp_obj = this;
                    var camp_id = this.camp_id;
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    this.$("#save_results_sf").addClass("saving");
                    $.post(URL, {campNum: camp_id, sfCampaignID: this.$("#sf_campaigns_combo").val(), add: 'Y', type: "addToSaleforce"})
                            .done(function (data) {
                                camp_obj.$("#save_results_sf").removeClass("saving");
                                camp_obj.states.step1.hasResultToSalesCampaign = true;
                            });

                },
                removeResultFromSF: function () {
                    var camp_obj = this;
                    var camp_id = this.camp_id;
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    if (this.states.step1.hasResultToSalesCampaign) {
                        $.post(URL, {campNum: camp_id, add: 'N', type: "addToSaleforce"})
                                .done(function (data) {
                                    camp_obj.$("#campaign_add_to_salesforce").prop("checked", false);
                                    camp_obj.states.step1.hasResultToSalesCampaign = false;
                                    camp_obj.setSalesForceCombo();
                                });
                    }
                    this.app.hideError({control: this.$("#sf-camp-container")});
                },
                validateRSF: function () {
                    var isValid = true;
                    if (this.$("#sf_campaigns_combo").val() == "") {
                        isValid = false;
                        //this.app.showAlert('Please select Salesforce campaign.',this.$el);
                        this.app.showError({
                            control: this.$("#sf-camp-container"),
                            message: 'Please select Salesforce campaign.'
                        });
                    }
                    else {
                        this.app.hideError({control: this.$("#sf-camp-container")});
                    }
                    return isValid;
                },
                setSalesForceCombo: function () {
                    if (this.states.step1.sf_checkbox) {
                        this.$("#sf_campaigns_combo").prop("disabled", false).trigger("chosen:updated");
                    }
                    else {
                        this.$("#sf_campaigns_combo").val("").prop("disabled", true).trigger("chosen:updated");
                    }
                },
                showNetsuiteCampaigns: function () {
                    this.$("#ns_campaigns_combo").html("<option>Loading...</option>").prop("disabled", true).trigger("chosen:updated");
                    require(["campaigns/collections/netsuite_campaigns"], _.bind(function (nsCampaignCollections) {
                        var nsCampaigns = new nsCampaignCollections();
                        var model = null;
                        var _offset = 0;
                        nsCampaigns.fetch({data: {type: 'nsCampaignList', offset: _offset}, remove: true,
                            success: _.bind(function (collection, response) {
                                var camps_html = '<select data-placeholder="Choose a Netsuite Campaign..." class="chosen-select" id="ns_campaigns_combo" >';
                                camps_html += '<option value=""></option>';
                                this.states.netsuite_campaigns = collection;
                                for (var s = _offset; s < collection.length; s++) {
                                    model = collection.at(s);
                                    var selected = (this.states.step1.nsCampaignID && this.states.step1.nsCampaignID === model.get("id")) ? 'selected="selected"' : "";
                                    camps_html += '<option value="' + model.get("id") + '" ' + selected + '>' + model.get("title") + '</option>';
                                }
                                camps_html += "</select>";
                                this.$("#netsuite_campaigns").html(camps_html);
                                this.$("#ns_campaigns_combo").chosen({no_results_text: 'Oops, nothing found!', width: "280px"});
                                this.setNetsuiteCombo();

                            }, this),
                            error: function (collection, resp) {

                            }
                        });


                    }, this));
                },
                saveResultToNS: function () {
                    var camp_obj = this;
                    var camp_id = this.camp_id;

                    var URL = "/pms/io/netsuite/setData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    this.$("#save_results_sf").addClass("saving");
                    $.post(URL, {campNum: camp_id, nsCampaignID: this.$("#ns_campaigns_combo").val(), add: 'Y', type: "addToNetsuite", "campaignType": "N"})

                            .done(function (data) {
                                camp_obj.$("#save_results_ns").removeClass("saving");
                                camp_obj.states.step1.hasResultToSalesCampaign = true;
                            });

                },
                removeResultFromNS: function () {
                    var camp_obj = this;
                    var camp_id = this.camp_id;
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    if (this.states.step1.hasResultToNetsuiteCampaign) {
                        $.post(URL, {campNum: camp_id, add: 'N', type: "addToNetsuite"})
                                .done(function (data) {
                                    camp_obj.$("#campaign_add_to_netsuite").prop("checked", false);
                                    camp_obj.states.step1.hasResultToNetsuiteCampaign = false;
                                    camp_obj.setNetsuiteCombo();
                                });
                    }
                    this.app.hideError({control: this.$("#ns-camp-container")});
                },
                validateRNS: function () {
                    var isValid = true;
                    if (this.$("#ns_campaigns_combo").val() == "") {
                        isValid = false;
                        //this.app.showAlert('Please select netsuite campaign.',this.$el);
                        this.app.showError({
                            control: this.$("#ns-camp-container"),
                            message: 'Please select Netsuite campaign.'
                        });
                    }
                    else {
                        this.app.hideError({control: this.$("#ns-camp-container")});
                    }
                    return isValid;
                },
                setNetsuiteCombo: function () {
                    if (this.states.step1.ns_checkbox) {
                        this.$("#ns_campaigns_combo").prop("disabled", false).trigger("chosen:updated");
                    }
                    else {
                        this.$("#ns_campaigns_combo").val("").prop("disabled", true).trigger("chosen:updated");
                    }
                },
                setConversionPage: function () {
                    if (this.states.step1.pageconversation_checkbox) {
                        this.$("#con_filter_field").prop("disabled", false);
                        this.$("#con_filter_combo").prop("disabled", false).trigger("chosen:updated");
                    }
                    else {
                        this.$("#con_filter_field").prop("disabled", true);
                        this.$("#con_filter_combo").prop("disabled", true).val("#").trigger("chosen:updated");
                    }
                },
                validateConverionPage: function () {
                    var isValid = true;
                    if (this.$("#con_filter_field").val() == "") {
                        isValid = false;
                        //this.app.showAlert('Please provide text in URL.',this.$el);
                        this.app.showError({
                            control: this.$("#cov-texturl-container"),
                            message: 'Please provide text in URL.'
                        });
                    }
                    else {
                        this.app.hideError({control: this.$("#cov-texturl-container")});
                    }
                    if (!this.$("#con_filter_combo").val()) {
                        isValid = false;
                        this.app.showError({
                            control: this.$("#cov-matchtype-container"),
                            message: 'Please select match type.'
                        });
                    }
                    else {
                        this.app.hideError({control: this.$("#cov-matchtype-container")});
                    }
                    return isValid;
                },
                saveConversionPage: function () {
                    var camp_obj = this;
                    var camp_id = this.camp_id;
                    var URL = "/pms/io/filters/saveLinkIDFilter/?BMS_REQ_TK=" + this.app.get('bms_token');
                    this.$("#save_conversion_filter").addClass("saving");
                    $.post(URL, {campNum: camp_id,
                        rule: this.$("select#con_filter_combo").val(),
                        matchValue: this.$("#con_filter_field").val(),
                        type: "conversion"})
                            .done(function (data) {
                                camp_obj.$("#save_conversion_filter").removeClass("saving");
                                camp_obj.hasConversionFilter = true;
                            });

                },
                removeConversionPage: function () {
                    var camp_obj = this;
                    var camp_id = this.camp_id;

                    var URL = "/pms/io/filters/saveLinkIDFilter/?BMS_REQ_TK=" + this.app.get('bms_token');
                    if (this.states.step1.hasConversionFilter) {
                        $.post(URL, {campNum: camp_id,
                            type: "delete"})
                                .done(function (data) {
                                    camp_obj.$("#conversion_filter").prop("checked", false);
                                    camp_obj.states.step1.hasConversionFilter = false;
                                    camp_obj.setConversionPage();

                                });
                    }
                    this.app.hideError({control: this.$("#cov-texturl-container")});

                },
                setFooterArea: function () {
                    this.$("#campaign_footer_text").prop("disabled", !this.$("#campaign_isFooterText")[0].checked)
                },
                setCustomFooterArea: function () {
                    this.$("#campaign_custom_footer_text").prop("disabled", !this.$("#campaign_useCustomFooter")[0].checked)
                },
                step2TileClick: function (obj) {
                    var camp_obj = this;
                    var target_li = $.getObj(obj, "li");
                    var selected_li = this.$(".step2 #choose_soruce li.selected");
                    if (selected_li.length == 0) {
                        var slider_width = "840px";
                        this.$(".step2 .selection-boxes").animate({width: slider_width, margin: '0px auto'}, "medium", function () {
                            $(this).removeClass("create-temp");
                            camp_obj.step2SlectSource(target_li);
                        });
                    }
                    else {
                        this.step2SlectSource(target_li);
                    }



                },
                showChangeEditorDialog: function (msg, target_li) {
                    this.app.showAlertPopup({heading: 'Confirm Change of Editor',
                        detail: msg,
                        text: "Start From Scratch",
                        btnClass: "btn-yellow",
                        dialogWidth: "460px",
                        icon: "next",
                        callback: _.bind(function () {

                            if (this.$("#mee_editor").setMEEHTML) {
                                this.$("#mee_editor").setMEEHTML("")
                            }
                            _tinyMCE.get('bmseditor_' + this.wp_id).setContent("");
                            this.states.step2.htmlText = "";
                            this.step2SlectSource(target_li, true);
                            this.saveStep2(false, "");

                        }, this)
                    },
                    $('body'));
                },
                showChangeEditorWarning: function (target_li) {
                    var selected_li = this.$(".step2 #choose_soruce li.selected");
                    if (selected_li.length && this.states.step2.editorType == "MEE" && target_li.attr("id") == "html_editor" && this.$("#mee_editor").getMEEBody() !== "") {
                        this.showChangeEditorDialog("Your current built Template will be lost, as it is not compatible with <b>HTML Editor</b>. Are you sure you want to continue?", target_li);
                        return true;
                    }
                    else if (selected_li.length && this.states.step2.editorType == "MEE" && target_li.attr("id") == "html_code" && this.$("#mee_editor").getMEEBody() !== "") {
                        this.showChangeEditorDialog("Your current built Template will be lost, as it is not compatible with <b>Hand Code HTML</b>. Are you sure you want to continue?", target_li);
                        return true;
                    }
                    else if (selected_li.length && ((this.states.step2.editorType == "W" && $(_tinyMCE.get('bmseditor_' + this.wp_id).getBody()).text() !== "") || (this.states.step2.editorType == "H" && this.$("textarea#handcodedhtml").val() != "")) && target_li.attr("id") == "html_editor_mee") {
                        this.showChangeEditorDialog("Your current built Template will be lost, as it is not compatible with <b>Easy Editor</b>. Are you sure you want to continue?", target_li);
                        return true;
                    }
                    return false;
                },
                step2SlectSource: function (target_li, byPass) {
                    if (!byPass && !this.copyFromCampaign && (this.states.step2.htmlText || this.states.editor_change) && this.showChangeEditorWarning(target_li)) {
                        return;
                    }

                    this.copyFromCampaign = false;
                    this.$(".step2 #choose_soruce li").removeClass("selected");
                    this.$(".step2 .soruces").hide();
                    this.$(".step2 #area_" + target_li.attr("id")).fadeIn("fast");
                    target_li.addClass("selected");
                    switch (target_li.attr("id")) {
                        case 'use_template':
                            this.loadTemplatesView();
                            break;
                        case 'html_editor':
                            this.setEditor();
                            _tinyMCE.get('bmseditor_' + this.wp_id).setContent(this.app.decodeHTML(this.states.step2.htmlText, true));
                            break;
                        case 'copy_campaign':
                            this.getcampaignscopy();
                            break;
                        case 'html_editor_mee':
                            this.loadMEE();
                            break;
                        default:
                            break;
                    }
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    var post_editor = {editorType: '', type: "editorType", campNum: this.camp_id};
                    var selected_li = this.$(".step2 #choose_soruce li.selected").attr("id");
                    if (selected_li == "html_editor") {
                        post_editor['editorType'] = 'W';
                    } else if (selected_li == "html_code") {
                        post_editor['editorType'] = 'H';
                    }
                    else if (selected_li == "html_editor_mee") {
                        post_editor['editorType'] = 'MEE';
                    }
                    else if (selected_li == "plain_text") {
                        post_editor['editorType'] = 'P';
                    }
                    if (post_editor['editorType'] && post_editor['editorType'] !== "P") {
                        this.states.step2.editorType = post_editor['editorType'];
                    }
                    if (post_editor["editorType"] && this.campobjData.editorType != post_editor["editorType"]) {
                        this.campobjData.editorType = post_editor["editorType"];
                        $.post(URL, post_editor)
                                .done(function (data) {
                                });
                    }
                },
                loadMEE: function () {
                    if (!this.states.step2.meeEditor) {
                        this.app.showLoading("Loading Easy Editor...", this.$("#area_html_editor_mee"));
                        this.states.step2.meeEditor = true;
                        setTimeout(_.bind(this.setMEEView, this), 100);
                    }
                },
                setMEEView: function () {
                    var _html = this.campobjData.editorType == "MEE" ? $('<div/>').html(this.states.step2.htmlText).text().replace(/&line;/g, "") : "";
                    require(["editor/MEE"], _.bind(function (MEE) {
                        var MEEPage = new MEE({app: this.app, _el: this.$("#mee_editor"), parentWindow: $(window),scrollTopMinus:43, html: '', text: this.states.step2.plainText, saveClick: _.bind(this.saveForStep2Mee, this), textVersionCallBack: _.bind(this.setTextVersion, this), previewCallback: _.bind(this.previewCallback, this)});
                        this.$("#mee_editor").setChange(this.states);
                        this.meeView = MEEPage;
                        this.setMEE(_html);
                        this.initScroll();
                        
                    }, this));
                },
                setTextVersion: function (text) {
                    this.states.step2.plainText = text;
                },
                getcampaignscopy: function () {
                    // Abdullah 
                    if (!this.states.step2.copyCampaigns) {
                        this.app.showLoading("Loading Campaigns...", this.$("#area_copy_campaign"));
                        require(["campaigns/copy_campaign_listing"], _.bind(function (copyCampaigns) {
                            var mPage = new copyCampaigns({app: this.app, sub: this, checksum: this.checksum});
                            this.$("#area_copy_campaign").html(mPage.$el);
                        }, this));
                        this.states.step2.copyCampaigns = true;
                    }
                },
                loadTemplatesView: function () {
                    if (!this.states.step2.templates) {
                        this.app.showLoading("Loading Templates...", this.$('#area_use_template'));
                        var _this = this;
                        //require(["bmstemplates/templates"], function (templatesPage) {
                            var page = new templatesPage({page: _this, app: _this.app, selectCallback: _.bind(_this.selectTemplate, _this)});
                            _this.$('#area_use_template').html(page.$el);
                            page.init();
                        //})

                        this.states.step2.templates = true;
                    }
                },
                selectTemplate: function (obj) {
                    this.setEditor();
                    var target = $.getObj(obj, "a");
                    var bms_token = this.app.get('bms_token');
                    this.app.showLoading('Loading HTML...', this.$el);
                    this.$("#mee-iframe").contents().find('.mainContentHtml').html('');
                    this.$el.find('.lastSaveInfo').html('Saving...').show();
                    this.states.editor_change = true;
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK=" + bms_token + "&type=html&templateNumber=" + target.attr("id").split("_")[1];
                    jQuery.getJSON(URL, _.bind(this.setEditorHTML, this));

                },
                copyCampaign: function (obj) {
                    this.setEditor();
                    var target = $.getObj(obj, "div");
                    var bms_token = this.app.get('bms_token');
                    this.states.editor_change = true;
                    this.app.showLoading('Loading HTML...', this.$el);
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + bms_token + "&campNum=" + target.attr("id") + "&type=basic";
                    jQuery.getJSON(URL, _.bind(this.setEditorHTML, this));
                    this.$("#html_editor").click();
                },
                setEditor: function () {
                    this.bmseditor.showEditor(this.wp_id);
                    _tinyMCE.get('bmseditor_' + this.wp_id).setContent("");
                    this.$("#bmstexteditor").val(this.app.decodeHTML(this.states.step2.plainText, true));

                    this.$(".textdiv").hide();
                },
                setEditorHTML: function (tsv, state, xhr) {
                    this.app.showLoading(false, this.$el);
                    var html_json = jQuery.parseJSON(xhr.responseText);
                    var htmlText = this.app.decodeJSON(html_json.htmlText);
                    if (htmlText) {
                        this.states.step2.htmlText = htmlText;
                        if (html_json.editorType == "MEE" || html_json.isEasyEditorCompatible == "Y") {
                            this.$("#html_editor_mee").click();
                            this.setMEE($('<div/>').html(htmlText).text().replace(/&line;/g, ""));
                        }
                        else {
                            this.$("#html_editor").click();
                            _tinyMCE.get('bmseditor_' + this.wp_id).setContent(this.app.decodeHTML(htmlText, true));
                        }
                        this.states.editor_change = true;
                    }

                },
                setMEE: function (html) {
                    if (this.$("#mee_editor").setMEEHTML && this.$("#mee_editor").getIframeStatus()) {
                        this.$("#mee_editor").setMEEHTML(html);
                        this.app.showLoading(false, this.$("#area_html_editor_mee"));
                    }
                    else {
                        setTimeout(_.bind(this.setMEE, this, html), 200);
                    }
                },
                step3TileClick: function (obj) {
                    var target_li = obj.target.tagName == "LI" ? $(obj.target) : $(obj.target).parents("li");
                    if (target_li.hasClass("selected"))
                        return false;
                    this.$(".step3 #choose_soruce li").removeClass("selected");
                    this.$(".step3 .soruces").hide();
                    this.$(".step3 #area_" + target_li.attr("id")).fadeIn("fast");
                    target_li.addClass("selected");
                    this.step3SlectSource(target_li);

                },
                step3SlectSource: function (target_li) {
                    var camp_obj = this;
                    //Check if cvs upload exits to delete
                    camp_obj.checkCSVUploaded();
                    switch (target_li.attr("id")) {
                        case 'create_target':
                            if (!this.$("#c_c_target").data("filters")) {
                                this.$("#c_c_target").filters({app: this.app});
                            }
                            else {
                                this.$("#c_c_target").data("filters").initFilters();
                                this.states.step3.target_id = 0;
                                this.showHideTargetTitle(true, true);
                            }
                            this.$("#targets_tags").tags({app: this.app,
                                url: '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=' + this.app.get('bms_token'),
                                params: {type: 'tags', filterNumber: '', tags: ''}
                            });
                            break;
                        case 'choose_targets':
                            this.choseTargets();
                            break;
                        case 'choose_lists':
                            this.choseLists();
                            break;
                        case 'upload_csv':
                            camp_obj.app.showLoading("Loading CSV upload...", camp_obj.$el.find('#area_upload_csv'));
                            //require(["listupload/csvupload"], function (csvuploadPage) {
                                var lPage = new csvuploadPage({camp: camp_obj, app: camp_obj.app});
                                camp_obj.$el.find('.step3 #area_upload_csv').html(lPage.$el);
                                camp_obj.states.step3.csvupload = lPage;
                            //})
                            break;
                        case 'salesforce_import':
                            this.checkSalesForceStatus();
                            break;
                        case 'netsuite_import':
                            this.checkNetSuiteStatus();
                            break;
                        case 'highrise_import':
                            this.showHighrise();
                            break;
                        case 'google_import':
                            this.showGoogle();
                            break;
                        case 'choose_tags':
                            if (this.checkRecipientsSaved("tags")) {
                                return false;
                            }
                            camp_obj.app.showLoading("Loading Tags...", camp_obj.$el.find('#area_choose_tags'));
                            require(["tags/tags"], function (tagsPage) {
                                var lPage = new tagsPage({camp: camp_obj, app: camp_obj.app});
                                camp_obj.$el.find('.step3 #area_choose_tags').html(lPage.$el);
                                camp_obj.states.step3.tags = lPage;
                            })
                            break;
                        default:
                            break;
                    }


                    this.states.step3.change = true;
                },
                checkRecipientsSaved: function (type) {
                    var exits = false;
                    if (this.states.step3.recipientType.toLowerCase() == type && this.states.step3.recipientDetial) {
                        return true;
                    }
                    return exits;
                },
                checkCSVUploaded: function ()
                {
                    var camp_obj = this;
                    var appMsgs = this.app.messages[0];
                    var csvupload = camp_obj.states.step3.csvupload;
                    var mapdataview = camp_obj.states.step3.mapdataview;
                    if (csvupload && csvupload.fileuploaded == true)
                    {
                        var cancelURL = '/pms/io/subscriber/uploadCSV/?BMS_REQ_TK=' + camp_obj.app.get('bms_token');
                        $.post(cancelURL, {stepType: "cancel"})
                                .done(function (data) {
                                    var list_json = jQuery.parseJSON(data);
                                    if (list_json[0] == 'success')
                                    {
                                        camp_obj.app.showAlert(appMsgs.CSVUpload_cancel_msg, camp_obj.$el, {type: 'caution'});
                                        csvupload.$el.find("#dropped-files").children().remove();
                                        csvupload.$el.find("#drop-files .middle").css("display", "block");
                                        csvupload.dataArray = [];
                                        csvupload.fileuploaded = false;
                                        csvupload.$el.find("#drop-files").css({'box-shadow': 'none', 'border': '1px dashed #CCCCCC'});
                                        mapdataview.$el.find('#uploadslist').children().remove();
                                        mapdataview.$el.find('#newlist').val('');
                                        mapdataview.$el.find('#alertemail').val('');
                                        camp_obj.app.showLoading(false, csvupload.$el);
                                    }
                                });
                    }
                },
                createTarget: function () {
                    this.app.showAddDialog(
                            {
                                app: this.app,
                                heading: 'Create a new Target',
                                buttnText: 'Create',
                                bgClass: 'target-tilt',
                                plHolderText: 'Enter target name here',
                                emptyError: 'Target name can\'t be empty',
                                createURL: '/pms/io/filters/saveTargetInfo/',
                                fieldKey: "filterName",
                                postData: {type: 'create', BMS_REQ_TK: this.app.get('bms_token'), filterFor: "C"},
                                saveCallBack: _.bind(this.addTarget, this) // Calling same view for refresh headBadge
                            });
                },
                addTarget: function (fieldText, camp_json) {
                    var target_id = camp_json[1];
                    if (this.states) {
                        this.states.step3.isNewTarget = true;
                        this.states.step3.newTargetName = fieldText;
                    }
                    this.initCreateEditTarget(target_id);
                },
                initCreateEditTarget: function (target_id) {
                    var self = this;
                    var t_id = target_id ? target_id : "";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 219;
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: true,
                        bodyCss: {"min-height": dialog_height + "px"},
                        headerIcon: 'target_headicon',
                        buttons: {saveBtn: {text: 'Save Target'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["target/target"], function (targetPage) {
                        var mPage = new targetPage({camp: self, target_id: t_id, dialog: dialog});
                        self.states.step3.targetDialog = mPage;
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.saveTargetFilter, mPage));
                    });
                },
                copyTarget: function (obj) {
                    var target_obj = $.getObj(obj, "div");
                    var target_id = target_obj.attr("id");
                    var camp_obj = this;
                    var dialog_title = "Copy Target";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Copy Target'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["target/copytarget"], function (copytargetPage) {
                        var mPage = new copytargetPage({camp: camp_obj, app: camp_obj.app, target_id: target_id, copydialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.copyTarget, mPage));
                    });
                },
                loadTarget: function (obj) {
                    var target_obj = $.getObj(obj, "div");
                    var target_id = target_obj.attr("id");
                    this.initCreateEditTarget(target_id);
                },
                loadTargets: function () {
                    var camp_obj = this;
                    camp_obj.$el.find("#trecpcount span").text('0');
                    camp_obj.app.showLoading("Loading Targets...", camp_obj.$el.find('#area_choose_targets .leftcol'));
                    this.app.getData({
                        "URL": "/pms/io/filters/getTargetInfo/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=list&filterFor=C",
                        "key": "targets",
                        "callback": _.bind(this.createTargetsTable, this)
                    });
                },
                checkSalesForceStatus: function () {
                    var camp_obj = this;
                    var salesforce_setting = this.app.getAppData("salesfocre");
                    if (!salesforce_setting || salesforce_setting[0] == "err" || salesforce_setting.isSalesforceUser == "N")
                    {
                        camp_obj.app.showLoading("Getting Salesforce Status...", camp_obj.$el.find('#area_salesforce_import'));
                        this.app.getData({
                            "URL": "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                            "key": "salesfocre",
                            "callback": _.bind(this.setSalesForceWiz, this),
                            "errorCallback": _.bind(this.setSalesForceWiz, this),
                        });
                    }
                    else {
                        this.setSalesForceWiz();
                    }
                },
                loginSalesForce: function (e) {
                    if ($(e.target).hasClass("disabled-btn")) {
                        return false;
                    }
                    var camp_obj = this;
                    var dialog = this.app.showDialog({title: 'Salesforce Login Setup',
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "400px"}
                    });
                    this.app.showLoading("Loading Login...", dialog.getBody());
                    require(["crm/salesforce/login"], function (loginPage) {
                        var lPage = new loginPage({camp: self, app: camp_obj.app, dialog: dialog});
                        dialog.getBody().html(lPage.$el);
                        dialog.getBody().find('#btnTestLogin').css('float', 'left');
                        dialog.getBody().find('.login-saving').css('width', 'auto');
                    })
                    //this.$("#salesforce_welcome").hide();
                    this.$("#salesforce_mapping").hide();
                    this.$("#salesforce_login").show();
                    this.$("#salesforce_setup").hide();
                    return false;
                },
                setSalesForceWiz: function () {
                    var camp_obj = this;
                    camp_obj.app.showLoading(false, camp_obj.$el.find('#area_salesforce_import'));
                    var salesforce_setting = this.app.getAppData("salesfocre");
                    var self = this;

                    if (salesforce_setting && salesforce_setting.isSalesforceUser == "N") {
                        this.$(".tag_msg1").html('<span class="caution"></span><span style="display: inline-block; text-align: left; margin-top: -24px; margin-left: 31px;">Please contact support@makesbridge.com to activiate your Salesforce setup.</span>');
                        this.$("#btnSFLogin").addClass("disabled-btn");
                        this.$("#salesforce_welcome").show();
                        this.$("#salesforce_setup").hide();
                    }
                    else if (salesforce_setting && salesforce_setting.isSalesforceUser == "Y" && salesforce_setting.isLoggedIn == "Y") {
                        if (this.states.saleforce_campaigns === null)
                            this.showSalesForceCampaigns();
                        this.$("#salesforce_welcome").hide();
                        this.$("#salesforce_setup").show();
                    }
                    else {
                        this.$("#salesforce_welcome").show();
                        this.$("#salesforce_setup").hide();
                        this.$("#btnSFLogin").removeClass("disabled-btn");
                        return;
                    }
                    if (this.states.step3.recipientType.toLowerCase() == "salesforce") {
                        this.setRecipients();
                    }
                    if (!this.states.step3.salesforce) {
                        this.$("#sf_accordion").accordion({active: 0, collapsible: false});
                        this.$("#sf_accordion h3.ui-accordion-header").unbind("keydown");
                        self.$("#salesforce_setup .filterbtn .managefilter").click(_.bind(self.showSalesForceFitler, self));
                        self.$("#salesforce_setup .filterbtn .selectall").click(_.bind(self.selectAllSalesforceFilter, self));

                        this.$('.salesforce_campaigns input.radiopanel').iCheck({
                            radioClass: 'radiopanelinput',
                            insert: '<div class="icheck_radio-icon"></div>'
                        });

                        this.$('.salesforce_campaigns input.radiopanel').on('ifChecked', function (event) {
                            camp_obj.$("#salesforce_setup .ui-accordion-header.selected").removeClass("selected");
                            $(this).parents(".ui-accordion-header").addClass("selected");
                            var icheck_val = $(this).attr("value");
                            if (icheck_val !== "campaign") {
                                camp_obj.$("#sfcamp_list_grid tr.selected").removeClass("selected");
                            }
                        });
                        this.$("input[value='opportunity']").on('ifClicked', function (event) {
                            if (self.$("input[value='opportunity']").prop("checked")) {
                                self.$(".contactby_opp").click()
                            }
                        })
                        if (this.states.step3.recipientType.toLowerCase() !== "salesforce") {
                            this.$("input[name='options_sf']").eq(0).iCheck('check');
                        }
                        self.$("#salesforce_setup .sf_all_count,#salesforce_setup .sf_lead_count,#salesforce_setup .sf_contact_count").addClass("loading-wheel-inline").html('');
                        var URL = '/pms/io/salesforce/getData/?BMS_REQ_TK=' + self.app.get('bms_token') + '&type=allCount';
                        jQuery.getJSON(URL, function (tsv, state, xhr) {
                            var total_count = jQuery.parseJSON(xhr.responseText);
                            var total = parseFloat(total_count.contactCount) + parseFloat(total_count.leadCount);
                            self.$("#salesforce_setup .sf_all_count").html(total).removeClass("loading-wheel-inline");
                            self.$("#salesforce_setup .sf_contact_count").html(total_count.contactCount).removeClass("loading-wheel-inline");
                            self.$("#salesforce_setup .sf_lead_count").html(total_count.leadCount).removeClass("loading-wheel-inline");
                        })

                        this.$("#salesforce-camp-search").searchcontrol({
                            id: 'salesforce-camp-search',
                            width: '300px',
                            height: '22px',
                            placeholder: 'Search Salesforce Campaign',
                            gridcontainer: 'sfcamp_list_grid',
                            showicon: 'yes',
                            iconsource: 'campaigns'
                        });
                        this.states.step3.salesforce = true;
                        this.$("#sf_setting_menu li").click(_.bind(function (obj) {
                            var target_obj = $.getObj(obj, "li");
                            if (target_obj.attr("id") == "sf_mapping") {
                                var dialog = this.app.showDialog({title: ' Specify Leads or/and Contacts to Import',
                                    css: {"width": "1200px", "margin-left": "-600px"},
                                    bodyCss: {"min-height": "443px"},
                                    buttons: {saveBtn: {text: 'Save Mapping'}}
                                });

                                this.app.showLoading("Loading Mapping...", dialog.getBody());
                                require(["crm/salesforce/mapping"], function (mappingPage) {
                                    var mPage = new mappingPage({camp: self, app: camp_obj.app, dialog: dialog});
                                    dialog.getBody().html(mPage.$el);
                                    dialog.saveCallBack(_.bind(mPage.saveCall, mPage));
                                });
                            }
                            else if (target_obj.attr("id") == "sf_user_setting") {

                                var dialog = this.app.showDialog({title: 'Salesforce Login Setup',
                                    css: {"width": "650px", "margin-left": "-325px"},
                                    bodyCss: {"min-height": "400px"}
                                });
                                this.app.showLoading("Loading Login...", dialog.getBody());
                                require(["crm/salesforce/login"], function (loginPage) {
                                    var lPage = new loginPage({camp: self, app: self.app, dialog: dialog});
                                    dialog.getBody().html(lPage.$el);
                                })

                            }
                        }, this))
                    }
                    else {
                        if (this.checkRecipientsSaved("salesforce")) {
                            return false;
                        }
                        this.$("#sfcamp_list_grid tr.selected").removeClass("selected");
                    }
                },
                selectAllSalesforceFilter: function (obj) {
                    var input_radio = $(obj.target).parents(".ui-accordion-header").find("input.radiopanel");
                    input_radio.iCheck('check');
                },
                showSalesForceFitler: function (obj) {
                    var dialog_title = "Lead";
                    var input_radio = $(obj.target).parents(".ui-accordion-header").find("input.radiopanel");
                    var filter_type = input_radio.val();
                    input_radio.iCheck('check');
                    if (filter_type == "contact") {
                        dialog_title = "Contant";
                    }
                    else if (filter_type == "both") {
                        dialog_title = "Lead & Contact";
                    }
                    else if (filter_type == "opportunity") {
                        dialog_title = "Opportunities";
                    }
                    var self = this;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 219;
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": dialog_height + "px"},
                        buttons: {saveBtn: {text: 'Save Filter'}}
                    });

                    this.app.showLoading("Loading Filters...", dialog.getBody());
                    require(["crm/salesforce/after_filter"], function (afterFilter) {
                        var step3_obj = self.states.step3;
                        var recipient_obj = (step3_obj.recipientType && step3_obj.recipientType.toLowerCase() == "salesforce") ? step3_obj.recipientDetial : null;
                        var afilter = new afterFilter({camp: self, savedObject: recipient_obj, type: filter_type});
                        afilter.$el.css("margin", "10px 0px");
                        dialog.getBody().html(afilter.$el);
                        dialog.saveCallBack(_.bind(afilter.saveFilter, afilter, dialog, _.bind(self.saveFilterStep3, self)));
                    });
                },
                setSalesForceData: function () {
                    if (this.states.step3.recipientDetial && this.states.step3.recipientType.toLowerCase() == "salesforce") {
                        var recipient_obj = this.states.step3.recipientDetial;
                        if (recipient_obj.filterType === "campaign") {
                            this.$("input[name='options_sf']").eq(4).iCheck('check');
                            this.$("#sfcamp_list_grid tr[id='row_" + recipient_obj.sfCampaignId + "']").addClass("selected");
                        }
                        else if (recipient_obj.filterType === "opportunity") {
                            this.$("input[name='options_sf']").eq(3).iCheck('check');
                        }
                        else if (recipient_obj.filterType === "filter" && recipient_obj.sfObject !== "both") {
                            if (recipient_obj.sfObject == "lead") {
                                this.$("input[name='options_sf']").eq(1).iCheck('check');
                            }
                            else if (recipient_obj.sfObject == "contact") {
                                this.$("input[name='options_sf']").eq(2).iCheck('check');
                            }
                        }
                        else if (recipient_obj.filterType == "filter" && recipient_obj.sfObject == "both") {
                            this.$("input[name='options_sf']").eq(0).iCheck('check');
                        }
                        this.states.step3.change = false;
                    }
                },
                saveSalesForceDetails: function (fromNext) {
                    var camp_obj = this;
                    var salesforce_val = this.$(".salesforce_campaigns input[name='options_sf']:checked").val();
                    var post_data = {type: 'import', synchType: 'recipients', campNum: this.camp_id};
                    var URL = "/pms/io/salesforce/setData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    if (salesforce_val == "campaign") {
                        var select_sCamp = this.$("#salesforce_setup .salesforce_campaigns #sfcamp_list_grid tr.selected")
                        if (select_sCamp.length === 1) {
                            post_data['filterType'] = "campaign";
                            this.states.step3.sfObject = post_data['filterType'];
                            post_data['sfCampaignId'] = select_sCamp.attr("id").split("_")[1];
                        }
                        else {
                            this.app.showAlert('Please select a salesforce campaign to proceed.', $("body"), {fixed: true});
                            return false;
                        }
                    }
                    else {
                        var importType = salesforce_val;
                        post_data['filterType'] = (importType == "opportunity") ? "opportunity" : "filter";
                        post_data['sfObject'] = (importType == "opportunity") ? "contact" : importType;

                        var leadPost = camp_obj.states.step3.sf_filters.lead;
                        var contactPost = camp_obj.states.step3.sf_filters.contact;
                        var opportunityPost = camp_obj.states.step3.sf_filters.opportunity;
                        if (importType == "lead") {
                            $.extend(post_data, leadPost)
                        }
                        else if (importType == "contact") {
                            $.extend(post_data, contactPost)
                        }
                        else if (importType == "opportunity") {
                            $.extend(post_data, opportunityPost)
                            post_data['isRefresh'] = 'N';
                        }
                        else if (importType == "both") {
                            $.extend(post_data, leadPost)
                            $.extend(post_data, contactPost)
                        }

                    }

                    this.app.showLoading("Saving Salesforce Settings...", this.$el.parents(".ws-content"));
                    $.post(URL, post_data)
                            .done(function (data) {
                                var camp_json = jQuery.parseJSON(data);
                                camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                if (camp_json[0] !== "err") {
                                    if (post_data['filterType'] == "campaign" || fromNext) {
                                        camp_obj.wizard.next();
                                        camp_obj.app.showMessge("Step 3 saved successfully!");
                                    }
                                    else {
                                        var badge = camp_obj.$(".salesforce_campaigns .ui-accordion-header.selected .managefilter .badge");
                                        camp_obj.app.showMessge("Saleforce Filters saved successfully!");
                                        camp_obj.$(".salesforce_campaigns .ui-accordion-header .managefilter .badge").hide();
                                        var totalCount = parseInt(camp_json.contactCount) + parseInt(camp_json.leadCount);
                                        badge.show().html(totalCount)
                                        camp_obj.fetchFilters("Saleforce");
                                    }
                                }
                                else {
                                    camp_obj.app.showAlert(camp_json[1], $("body"), {fixed: true});
                                }
                            });
                },
                fetchFilters: function (type) {
                    var camp_obj = this;
                    var URL = "";
                    if (type == "Saleforce") {
                        URL = "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    }
                    else {
                        URL = "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    }
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            var rec_josn = jQuery.parseJSON(xhr.responseText);
                            if (camp_obj.app.checkError(rec_josn)) {
                                return false;
                            }
                            if (rec_josn[0] !== "err") {
                                camp_obj.states.step3.recipientDetial = rec_josn;
                            }
                        }
                    });
                },
                saveFilterStep3: function (type) {
                    var camp_obj = this;
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    var post_data = {type: "recipientType", campNum: this.camp_id};
                    post_data['recipientType'] = type;
                    this.app.showLoading("Saving " + type + " Settings...", this.$el.parents(".ws-content"));
                    $.post(URL, post_data)
                            .done(function (data) {
                                var step3_json = jQuery.parseJSON(data);
                                if (step3_json[0] !== "err") {
                                    camp_obj.states.step3.recipientType = post_data['recipientType'];
                                    camp_obj.states.step3.change = false;
                                    if (type == "Salesforce") {
                                        camp_obj.saveSalesForceDetails();
                                    }
                                    else if (type == "Highrise") {
                                        camp_obj.saveHighriseDetails();
                                    } else if (type == "Google") {
                                        camp_obj.saveGoogleDetails();
                                    } else {
                                        camp_obj.saveNetSuiteDetails();
                                    }
                                }
                                else {
                                    camp_obj.app.showMessge(step3_json[0]);
                                }
                            })
                },
                loginNetSuite: function () {
                    var camp_obj = this;
                    var dialog = this.app.showDialog({title: 'NetSuite Login Setup',
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "425px"}
                    });
                    this.app.showLoading("Loading Login...", dialog.getBody());
                    require(["crm/netsuite/login"], function (loginPage) {
                        var lPage = new loginPage({camp: camp_obj, app: camp_obj.app, dialog: dialog});
                        dialog.getBody().html(lPage.$el);
                        dialog.getBody().find('#btnTestLogin').css('float', 'left');
                        dialog.getBody().find('.login-saving').css('width', 'auto');
                    })
                    // this.$("#netsuite_welcome").hide();
                    this.$("#netsuite_mapping").hide();
                    this.$("#netsuite_login").show();
                    this.$("#netsuite_setup").hide();
                    this.$('#highrise_setup').hide();
                    return false;
                },
                checkNetSuiteStatus: function () {

                    var camp_obj = this;
                    this.$("#highrise_setup").hide();
                    var netsuite_setting = this.app.getAppData("netsuite");
                    if (!netsuite_setting || netsuite_setting[0] == "err" || netsuite_setting.isNetsuiteUser == "N")
                    {
                        camp_obj.app.showLoading("Getting Netsuite Status...", camp_obj.$el.find('#area_netsuite_import'));
                        this.app.getData({
                            "URL": "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                            "key": "netsuite",
                            "callback": _.bind(this.setNetSuiteeWiz, this),
                            "errorCallback": _.bind(this.setNetSuiteeWiz, this),
                        });
                    }
                    else {
                        this.setNetSuiteeWiz();
                    }
                },
                setNetSuiteeWiz: function () {
                    var camp_obj = this;
                    camp_obj.app.showLoading(false, camp_obj.$el.find('#area_netsuite_import'));
                    var netsuite_setting = this.app.getAppData("netsuite");

                    if (netsuite_setting && netsuite_setting.isNetsuiteUser == "Y") {
                        this.$("#netsuite_login,#netsuite_welcome").hide();
                        this.$("#netsuite_setup").show();
                    }
                    else {
                        this.$("#netsuite_login,#netsuite_setup").hide();
                        this.$("#netsuite_welcome").show();
                        return;
                    }
                    if (this.states.step3.recipientType.toLowerCase() == "netsuite") {
                        this.setRecipients();
                    }
                    var self = this;
                    if (!this.states.step3.netsuite) {
                        this.$("#ns_accordion").accordion({active: 0, collapsible: false});
                        this.$("#ns_accordion h3.ui-accordion-header").unbind("keydown");
                        self.$("#netsuite_setup .filterbtn .managefilter").click(_.bind(self.showNetSuiteFitler, self));
                        self.$("#netsuite_setup .filterbtn .selectall").click(_.bind(self.selectAllNetSuiteFilter, self));
                        this.$('#netsuite_setup input.radiopanel').iCheck({
                            radioClass: 'radiopanelinput',
                            insert: '<div class="icheck_radio-icon"></div>'
                        });

                        this.$('.netsuite_groups input.radiopanel').on('ifChecked', function (event) {
                            camp_obj.$("#netsuite_setup .ui-accordion-header.selected").removeClass("selected");
                            $(this).parents(".ui-accordion-header").addClass("selected");
                            var icheck_val = $(this).attr("value");
                            if (icheck_val !== "campaign") {
                                camp_obj.$("#netsuite-group-listing tr.selected").removeClass("selected");
                            }
                            camp_obj.states.step3.change = true;
                        });

                        if (this.states.step3.recipientType.toLowerCase() !== "netsuite") {
                            this.$("input[name='options_ns']").eq(0).iCheck('check');
                        }

                        this.$("#netsuite-group-search").searchcontrol({
                            id: 'netsuite-group-search',
                            width: '300px',
                            height: '22px',
                            placeholder: 'Search NetSuite Groups',
                            gridcontainer: 'nsgroup_list_grid',
                            showicon: 'yes',
                            iconsource: 'campaigns'
                        });
                        this.states.step3.netsuite = true;

                        this.$("#ns_setting_menu li").click(_.bind(function (obj) {
                            var target_obj = $.getObj(obj, "li");
                            if (target_obj.attr("id") == "ns_mapping") {
                                var dialog = this.app.showDialog({title: ' Specify Customers, Contacts or/and Partners to Import',
                                    css: {"width": "1200px", "margin-left": "-600px"},
                                    bodyCss: {"min-height": "443px"},
                                    buttons: {saveBtn: {text: 'Save Mapping'}}
                                });
                                this.app.showLoading("Loading Mapping...", dialog.getBody());
                                require(["crm/netsuite/mapping"], function (mappingPage) {
                                    var mPage = new mappingPage({camp: self, app: camp_obj.app, dialog: dialog});
                                    dialog.getBody().html(mPage.$el);
                                    dialog.saveCallBack(_.bind(mPage.saveCall, mPage));
                                });

                            }
                            else if (target_obj.attr("id") == "ns_user_setting") {

                                var dialog = this.app.showDialog({title: 'NetSuite Login Setup',
                                    css: {"width": "650px", "margin-left": "-325px"},
                                    bodyCss: {"min-height": "425px"}
                                });
                                this.app.showLoading("Loading Login...", dialog.getBody());
                                require(["crm/netsuite/login"], function (loginPage) {
                                    var lPage = new loginPage({camp: self, app: camp_obj.app, dialog: dialog});
                                    dialog.getBody().html(lPage.$el);
                                    dialog.getBody().find('#btnTestLogin').css('float', 'left');
                                    dialog.getBody().find('.login-saving').css('width', 'auto');
                                })

                            }
                        }, this))
                    }
                    else {
                        if (this.checkRecipientsSaved("netsuite")) {
                            return false;
                        }
                        this.$("#nsgroup_list_grid tr.selected").removeClass("selected");
                    }
                    if (netsuite_setting && netsuite_setting.isNetsuiteUser == "Y") {
                        this.loadNetSuiteGroup();
                    }
                },
                selectAllNetSuiteFilter: function (obj) {
                    var input_radio = $(obj.target).parents(".ui-accordion-header").find("input.radiopanel");
                    input_radio.iCheck('check');
                },
                showNetSuiteFitler: function (obj) {
                    var dialog_title = "Customer";
                    var input_radio = $(obj.target).parents(".ui-accordion-header").find("input.radiopanel");
                    var filter_type = input_radio.val();
                    input_radio.iCheck('check');
                    if (filter_type == "contact") {
                        dialog_title = "Contant";
                    }
                    else if (filter_type == "partner") {
                        dialog_title = "Partner";
                    }
                    var self = this;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 219;
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": dialog_height + "px"},
                        buttons: {saveBtn: {text: 'Save Filter'}}
                    });

                    this.app.showLoading("Loading Filters...", dialog.getBody());
                    require(["crm/netsuite/after_filter"], function (afterFilter) {
                        var step3_obj = self.states.step3;
                        var recipient_obj = (step3_obj.recipientType && step3_obj.recipientType.toLowerCase() == "netsuite" && step3_obj.recipientDetial.filterType === "filter") ? step3_obj.recipientDetial : null;
                        var afilter = new afterFilter({camp: self, savedObject: recipient_obj, type: filter_type});
                        afilter.$el.css("margin", "10px 0px");
                        dialog.getBody().html(afilter.$el);
                        dialog.saveCallBack(_.bind(afilter.saveFilter, afilter, dialog, _.bind(self.saveFilterStep3, self)));
                    });
                    self.states.step3.change = true;

                },
                setNetSuiteData: function () {
                    if (this.states.step3.recipientDetial && this.states.step3.recipientType.toLowerCase() == "netsuite") {
                        var self = this;
                        var recipient_obj = this.states.step3.recipientDetial;
                        if (recipient_obj.filterType === "group") {
                            this.$("input[name='options_ns']").eq(3).iCheck('check');
                            this.$("#nsgroup_list_grid tr[id='row_" + recipient_obj.nsGroupId + "']").addClass("selected");
                        }
                        else if (recipient_obj.filterType === "filter") {
                            if (recipient_obj.nsObject.indexOf("customer") > -1) {
                                this.$("input[name='options_ns']").eq(0).iCheck('check');
                            }
                            else if (recipient_obj.nsObject == "contact") {
                                this.$("input[name='options_ns']").eq(1).iCheck('check');
                            }
                            else if (recipient_obj.nsObject == "partner") {
                                this.$("input[name='options_ns']").eq(2).iCheck('check');
                            }
                        }
                        this.states.step3.change = false;
                    }

                },
                loadNetSuiteGroup: function () {
                    var self = this;
                    if (self.states.step3.netsuitegroups)
                        return false;
                    this.app.showLoading("Loading Groups...", self.$("#netsuite_setup .netsuite_groups .template-container"));
                    URL = "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=nsGroupList";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        self.app.showLoading(false, self.$("#netsuite_setup .netsuite_groups .template-container"));
                        var netsuite_groups = jQuery.parseJSON(xhr.responseText);
                        if (self.app.checkError(netsuite_groups)) {
                            return false;
                        }
                        if (netsuite_groups[0] !== "err") {
                            if (netsuite_groups.count != "0") {
                                self.states.step3.netsuitegroups = netsuite_groups;
                                var group_html = '<table cellpadding="0" cellspacing="0" width="100%" id="nsgroup_list_grid"><tbody>';
                                $.each(netsuite_groups.groupList[0], function (index, val) {
                                    group_html += '<tr id="row_' + val[0].id + '">';
                                    group_html += '<td><div class="name-type"><h3>' + val[0].name + '</h3> </td>';
                                    var total_count = val[0].count;
                                    group_html += '<td><div class="subscribers show" style="min-width:70px"><span class=""></span>' + total_count + '</div><div id="' + val[0].id + '" class="action"><a class="btn-green use"><span>Use</span><i class="icon next"></i></a></div></td>';
                                    group_html += '</tr>';
                                });
                                group_html += '</tbody></table>';

                                //Setting netsuite group listing grid
                                self.$("#netsuite-group-listing").html(group_html);

                                self.$el.find("#nsgroup_list_grid").bmsgrid({
                                    useRp: false,
                                    resizable: false,
                                    colresize: false,
                                    height: 300,
                                    usepager: false,
                                    colWidth: ['100%', '90px']
                                });
                                self.$("#nsgroup_list_grid tr td:nth-child(1)").attr("width", "100%");
                                self.$("#nsgroup_list_grid tr td:nth-child(2)").attr("width", "90px");

                                self.$("#nsgroup_list_grid .action .use").click(function () {
                                    self.$("#nsgroup_list_grid tr.selected").removeClass("selected");
                                    self.$("input[name='options_ns']").eq(3).iCheck('check');

                                    $(this).parents("tr").addClass("selected");
                                });
                                self.setNetSuiteData();
                            }
                        }
                        else {
                            self.app.showAlert(netsuite_groups[1], $("body"), {fixed: true});
                        }
                    }).fail(function () {
                        console.log("error net suite group listing");
                    });
                },
                saveNetSuiteDetails: function (fromNext) {
                    var camp_obj = this;
                    var netsuite_val = this.$(".netsuite_groups input[name='options_ns']:checked").val();
                    var post_data = {type: 'import', synchType: 'recipients', campNum: this.camp_id};
                    var URL = "/pms/io/netsuite/setData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    if (netsuite_val == "group") {
                        var select_sCamp = this.$("#netsuite_setup .netsuite_groups #nsgroup_list_grid tr.selected")
                        if (select_sCamp.length === 1) {
                            post_data['filterType'] = "group";
                            post_data['nsGroupId'] = select_sCamp.attr("id").split("_")[1];
                            this.states.step3.nsObject = post_data['filterType'];
                        }
                        else {
                            this.app.showAlert('Please select a netsuite group to proceed.', $("body"), {fixed: true});
                            return false;
                        }
                    }
                    else {
                        post_data['filterType'] = "filter";
                        if (camp_obj.states.step3.ns_filters.nsObject !== "") {
                            post_data['nsObject'] = camp_obj.states.step3.ns_filters.nsObject;
                        }
                        else {
                            post_data['nsObject'] = netsuite_val;
                        }

                        var customerPost = camp_obj.states.step3.ns_filters.customer;
                        var contactPost = camp_obj.states.step3.ns_filters.contact;
                        var partnerPost = camp_obj.states.step3.ns_filters.partner;
                        if (netsuite_val == "customer") {
                            $.extend(post_data, customerPost)
                        }
                        else if (netsuite_val == "contact") {
                            $.extend(post_data, contactPost)
                        }
                        else if (netsuite_val == "partner") {
                            $.extend(post_data, partnerPost)
                        }

                    }
                    this.app.showLoading("Saving Netsuite settings...", this.$el.parents(".ws-content"));
                    $.post(URL, post_data)
                            .done(function (data) {
                                camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                var camp_json = jQuery.parseJSON(data);
                                if (camp_json[0] !== "err") {
                                    if (post_data['filterType'] == "group" || fromNext) {
                                        camp_obj.wizard.next();
                                        camp_obj.app.showMessge("Step 3 saved successfully!");
                                    }
                                    else {
                                        var badge = camp_obj.$(".netsuite_groups .ui-accordion-header.selected .managefilter .badge");
                                        camp_obj.app.showMessge("Netsuite Filters saved successfully!");
                                        //var totalCount = parseInt(camp_json.contactCount) + parseInt(camp_json.leadCount) ;
                                        //badge.show().html(totalCount);
                                        camp_obj.fetchFilters("Nesuite");
                                    }
                                }
                                else {
                                    camp_obj.app.showAlert(camp_json[1], $("body"), {fixed: true});
                                }
                            });
                },
                saveHighriseDetails: function (fromNext) {
                    var camp_obj = this;
                    var post_data = {type: 'import', synchType: 'recipients', campNum: this.camp_id};
                    var URL = "/pms/io/highrise/setData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    var data1 = this.getHighriseImportData();
                    $.extend(post_data, data1);
                    this.app.showLoading("Saving Highrise settings...", this.$el.parents(".ws-content"));
                    $.post(URL, post_data)
                            .done(function (data) {
                                camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                var camp_json = jQuery.parseJSON(data);
                                if (camp_json[0] !== "err") {
                                    camp_obj.wizard.next();
                                    camp_obj.app.showMessge("Step 3 saved successfully!");
                                    camp_obj.isHighriseRequire = true; // this will not load who view, when press back
                                    camp_obj.fetchFilters("Highrise");
                                } else {
                                    camp_obj.app.showAlert(camp_json[1], $("body"), {fixed: true});
                                }
                            });
                },
                saveCSVUpload: function () {
                    var camp_obj = this;
                    var isValid = false;
                    var csvupload = camp_obj.states.step3.csvupload;
                    var mapdataview = camp_obj.states.step3.mapdataview;
                    if (csvupload && csvupload.fileuploaded == true)
                    {
                        csvupload.$el.hide();
                        camp_obj.app.showLoading(false, mapdataview.$el);
                        isValid = mapdataview.mapAndImport();
                        if (isValid)
                        {
                            mapdataview.$el.hide();
                            camp_obj.$el.find('#upload_csv').removeClass('selected');
                        }
                        return isValid;
                    }
                    else {
                        this.app.showAlert('Please supply csv file to upload', this.$el.parents(".ws-content"));
                    }
                },
                saveLists: function () {
                    /*var selected_list = this.$("#area_choose_lists .col2 tr").map(function(){
                     return $(this).attr("id").split("_")[1]
                     }).toArray().join();*/
                    var selected_list = this.RecListsPage.getListCol2();
                    if (!selected_list || selected_list.length === 0) {
                        this.app.showAlert("Please select list(s) to set recipients", $("body"), {fixed: true});
                    }
                    return selected_list.toString();
                },
                saveTargets: function () {
                    /* var selected_targets = this.$("#area_choose_targets .col2 tr").map(function(){
                     return $(this).attr("id").split("_")[1]
                     }).toArray().join();*/
                    var selected_targets = this.RecTargetPage.getTargetCol2();
                    if (!selected_targets || selected_targets.length === 0) {
                        this.app.showAlert("Please select target(s) to set recipients", $("body"), {fixed: true});
                    }
                    //console.log(selected_targets);
                    return selected_targets.toString();
                    //this.RecTargetPage.saveCall();
                },
                setRecipients: function () {
                    var camp_obj = this;
                    if (this.states.step3.recipientDetial)
                        return false;
                    this.app.showLoading("Loading Recipients...", this.$el.parents(".ws-content"));
                    var URL = "";
                    var source_type = camp_obj.states.step3.recipientType.toLowerCase();
                    if (source_type == "salesforce") {
                        URL = "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    }
                    else if (source_type == "netsuite") {
                        URL = "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    } else if (source_type == "highrise") {
                        URL = "/pms/io/highrise/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    } else if (source_type == "google") {
                        URL = "/pms/io/google/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    } else {
                        URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=recipientType";
                    }
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                        if (xhr && xhr.responseText) {
                            var rec_josn = jQuery.parseJSON(xhr.responseText);
                            if (camp_obj.app.checkError(rec_josn)) {
                                return false;
                            }
                            if (source_type == "highrise") {
                                return rec_josn;
                            }
                            if (source_type == "google") {
                                return rec_josn;
                            }

                            camp_obj.states.step3.recipientDetial = rec_josn;

                            if (rec_josn.type) {
                                if (rec_josn.type.toLowerCase() == "list") {

                                    if (rec_josn.count !== "0") {
                                        camp_obj.RecListsPage.showRecList(rec_josn);
                                        /*$.each(rec_josn.listNumbers[0], function(index, val) { 
                                         camp_obj.$(".step3 #area_choose_lists .col1 tr[checksum='"+val[0].checksum+"'] .move-row").click();
                                         })*/
                                    }
                                    else
                                    {
                                        camp_obj.$el.find(".step3 #area_choose_lists .rightcol tbody").append('<div style="padding: 20px;" class="recp_empty_info"> <div style="width:auto;" class="messagebox info"><p>Don\'t worry about duplicates. only one message is sent to each email address</p></div></div>');
                                    }
                                }
                                else if (rec_josn.type.toLowerCase() == "target") {
                                    if (rec_josn.count !== "0") {
                                        camp_obj.RecTargetPage.showRecTarget(rec_josn);
                                        /* $.each(rec_josn.filterNumbers[0], function(index, val) { 
                                         camp_obj.$(".step3 #area_choose_targets .col1 tr[checksum='"+val[0].checksum+"'] .move-row").click();
                                         })*/
                                    }
                                    else
                                    {
                                        camp_obj.$(".step3 #area_choose_targets .rightcol tbody").append('<div style="padding: 20px;" class="recp_empty_info"> <div style="width:auto;" class="messagebox info"><p>Don\'t worry about duplicates. only one message is sent to each email address</p></div></div>');
                                    }
                                }
                                else if (rec_josn.type.toLowerCase() == "tags") {
                                    var tags = rec_josn.targetTags.split(',');
                                    for (var i = 0; i < tags.length; i++) {
                                        camp_obj.$(".step3 #area_choose_tags .col1 li[checksum='" + tags[i] + "'] .move-row").click();
                                    }
                                }
                            }
                            else {
                                if (source_type == "salesforce") {
                                    camp_obj.setSalesForceData();
                                }
                                else if (source_type == "netsuite") {
                                    camp_obj.setNetSuiteData();
                                }
                            }
                            camp_obj.states.step3.change = false;
                        }
                    }).fail(function () {
                        console.log("Receipts data load failed");
                    });

                },
                TryDialog: function () {
                    var that = this;
                    var app = this.options.app;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 162;
                    var dialog = this.options.app.showDialog({title: 'Images',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: true,
                        headerIcon: '_graphics',
                        tagRegen: true,
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    //// var _options = {_select:true,_dialog:dialog,_page:this}; // options pass to
                    this.options.app.showLoading("Loading...", dialog.getBody());
                    require(["userimages/userimages", 'app'], function (pageTemplate, app) {
                        var mPage = new pageTemplate({app: app, fromDialog: true, _select_dialog: dialog, _select_page: that});
                        dialog.getBody().append(mPage.$el);
                        that.app.showLoading(false, mPage.$el.parent());
                        var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                        mPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog                         
                        that.app.dialogArray[dialogArrayLength - 1].currentView = mPage; // New Dialog                       
                    });

                },
                useImage: function (url) {
                    if (this.$(".step2 #html_code").hasClass("selected")) {
                        this.$el.find("#image_url2").val(url);
                    }
                    else {
                        this.$el.find("#image_url").val(url);
                    }
                },
                previewCampaignstep4: function () {
                    var active_ws = this.$el.parents(".ws-content");
                    var camp_name = active_ws.find("#workspace-header").html();
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Campaign Preview of &quot;' + camp_name + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading Campaign Preview...", dialog.getBody());
                    var preview_url = "https://" + this.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + this.camp_id;
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: this.camp_id, isText: this.camp_istext});
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                },
                /**
                 * A customized button action/ Import from Highrise...
                 * @Require Module Conections highrise
                 * @ Get status and show it here if connected
                 * @further call.showHighriseArea
                 */
                showHighrise: function () {
                    this.$("#highrise_setup").show();
                    this.$('#highrise_welcome').hide();
                    this.$('#highrise_setup .heading').show();
                    var camp_obj = this;
                    var highrise_setting = this.app.getAppData("highrise");
                    this.app.showLoading("Checking Status...", this.$("#area_highrise_import"));
                    if (!highrise_setting || highrise_setting[0] == "err" || highrise_setting.isHighriseUser == "N")
                    {
                        this.app.getData({
                            "URL": "/pms/io/highrise/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                            "key": "highrise",
                            "callback": _.bind(camp_obj.getPeopleCountHighrise, this),
                            "errorCallback": _.bind(camp_obj.highriseErrorCallBack, this),
                        });
                    }
                    else {
                        camp_obj.getPeopleCountHighrise(this);
                    }
                },
                /**
                 * This function is called from showhighrise.
                 * @ Import Highrise 2nd step code is required here.
                 */
                showHighriseArea: function (that) {

                    var active_ws = this.$el.parents(".ws-content");
                    if (typeof this.isHighriseRequire != "undefined") {
                        if (this.isHighriseRequire) {
                            return;
                        }
                    }
                    var that = this;
                    this.app.showLoading("Now Loading Import...", this.$("#area_highrise_import"));
                    require(["crm/highrise/import"], _.bind(function (page) {
                        if (that.states.step3.recipientType.toLowerCase() == "highrise" && that.camp_id) {
                            var URL = "/pms/io/highrise/getData/?BMS_REQ_TK=" + that.app.get('bms_token') + "&campNum=" + that.camp_id + "&type=import";
                            jQuery.getJSON(URL, function (tsv, state, xhr) {
                                if (xhr && xhr.responseText) {
                                    that.app.showLoading(false, that.$("#area_highrise_import"));
                                    var rec_json = jQuery.parseJSON(xhr.responseText);
                                    if (rec_json[0] == "err") {
                                        if (rec_json[1].indexOf("Unauthorized") > -1) {
                                            that.highriseErrorCallBack();
                                            return;
                                        } else {
                                            that.app.showAlert(rec_json[1], that.$el.parents(".ws-content.active"));
                                            that.Import_page = new page({
                                                page: that,
                                                highriseCount: that.peopleCount
                                            })
                                            active_ws.find("#highrise_import_container").html(that.Import_page.$el);
                                            that.highriseBindEvents();
                                            return;
                                        }
                                    }
                                    if (that.app.checkError(rec_json)) {
                                        return false;
                                    }
                                    that.states.step3.recipientDetial = rec_json;
                                    that.Import_page = new page({
                                        page: that,
                                        highriseCount: that.peopleCount,
                                        edit: that.states.step3.recipientDetial
                                    })

                                    active_ws.find("#highrise_import_container").html(that.Import_page.$el);
                                } else {

                                }
                            });



                        } else {
                            that.app.showLoading(false, that.$("#area_highrise_import"));
                            that.Import_page = new page({
                                page: that,
                                highriseCount: that.peopleCount
                            })
                            active_ws.find("#highrise_import_container").html(that.Import_page.$el);
                        }


                    }, this));
                    that.highriseBindEvents();

                    //// Mapping 

                },
                /**
                 * When you press next or save, this function is just checking and collection data
                 * If the option is selected, then it passed this to backend. and save it.
                 */
                getHighriseImportData: function () {
                    var post_data = {};

                    var highrise_val = this.$("input[name='options_hr']:checked").val();
                    if (highrise_val == "tags") {
                        var selected_tag = this.$("#hsgroup_list_grid tr.selected")
                        if (selected_tag.length === 1) {
                            post_data['tagId'] = selected_tag.attr("id").split("_")[1];
                            post_data['filterType'] = "tag";//Required fields:  tagId  [22] 
                            this.states.step3.hsObject = post_data['filterType']; // Set an object for highrise by Abdullah
                        } else {
                            return 'Please select a highrise tags to proceed';

                        }
                    } else if (highrise_val == "importall") {
                        post_data['filterType'] = "all";
                        this.states.step3.hsObject = post_data['filterType'];
                    } else if (highrise_val == "filterbyfield") {
                        post_data['filterType'] = "criteria";
                        this.states.step3.hsObject = post_data['filterType'];
                        var filter_data = this.$el.find(".customer-filter").data("crmfilters").saveFilters('people');
                        var criteria = "";
                        _.each(filter_data, function (key, value) {
                            criteria = criteria + value + "=" + key + ","
                        })
                        if (!criteria) {
                            return 'Please select filters to proceed.';

                        }
                        criteria = criteria.substring(0, criteria.length - 1);
                        post_data['criteria'] = criteria
                        //Case (filterType = criteria) 
                        //Required fields:  criteria [firstName=babar,lastName=virk]
                    } else if (highrise_val == "search") {
                        post_data['filterType'] = "term";
                        this.states.step3.hsObject = post_data['filterType'];
                        post_data['term'] = this.$el.find('#txtsearchbyfield').val();
                        if (!this.$el.find('#txtsearchbyfield').val()) {
                            return 'Please enter search text to proceed.';
                        }
                        //Case (filterType = term) 
                        //Required fields:  term    [makesbridge]
                    } else if (highrise_val == "date") {
                        post_data['filterType'] = "since";
                        this.states.step3.hsObject = post_data['filterType'];
                        var date = this.$el.find('#txtdatefield').val();
                        date = date.replace(/\//g, '');
                        var date = date.replace(":", "");
                        var date = date.replace(" ", "");
                        post_data['since'] = date;
                        if (!date) {
                            return 'Please select date to proceed.';
                        }

                        //Case (filterType = since) 
                        //Required fields:  since [date format yyyyMMddHHmmss]
                    }

                    return post_data;
                },
                getPeopleCountHighrise: function () {
                    if (typeof this.isHighriseRequire != "undefined") {
                        if (this.isHighriseRequire) {
                            return;
                        }
                    }
                    var that = this;
                    var URL = "/pms/io/highrise/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=stats";
                    jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        var _count = jQuery.parseJSON(xhr.responseText);
                        if (_count[0] == "err") {
                            if (_count[1].indexOf("Unauthorized") > -1) {
                                that.highriseErrorCallBack();
                                return;
                            } else {
                                that.app.showAlert(_count[1], that.$el.parents(".ws-content.active"));
                                that.highriseBindEvents();
                                that.$("#highrise_import_container").html("<div class='tag_msg1'><span class='caution'></span>" + _count[1] + "</div>");
                                return;
                            }
                        }
                        that.peopleCount = _count.peopleCount;
                        that.showHighriseArea(that);

                    }));
                },
                highriseErrorCallBack: function () {
                    var that = this;
                    that.app.showLoading(false, that.$("#area_highrise_import"));
                    var active_ws = this.$el.parents(".ws-content");
                    active_ws.find('#highrise_welcome').show();
                    this.$('#highrise_setup .heading').hide();
                    active_ws.find("#highrise_import_container").html('');
                    that.highriseBindEvents();


                },
                loginHighrise: function () {
                    this.$("#hs_setting_menu #hs_user_setting").click();
                },
                highriseBindEvents: function () {
                    var that = this;
                    this.$("#hs_setting_menu li").unbind();
                    this.$("#hs_setting_menu li").click(_.bind(function (obj) {
                        var target_obj = $.getObj(obj, "li");

                        if (target_obj.attr("id") == "hs_mapping") {
                            var dialog = this.app.showDialog({title: ' Specify Import',
                                css: {"width": "1400px", "margin-left": "-700px"},
                                bodyCss: {"min-height": "410px"},
                                buttons: {saveBtn: {text: 'Save Mapping'}}
                            });
                            this.app.showLoading("Loading Mapping...", dialog.getBody());
                            require(["crm/highrise/mapping"], function (mappingPage) {
                                var mPage = new mappingPage({camp: that, app: that.app, dialog: dialog});
                                dialog.getBody().html(mPage.$el);
                                dialog.saveCallBack(_.bind(mPage.saveCall, mPage));
                                dialog.getBody().find('.bDiv').css('height', '320px');

                            });
                            this.app.showLoading(false, dialog.getBody());
                        }

                        else if (target_obj.attr("id") == "hs_user_setting") {

                            var dialog = this.app.showDialog({title: 'Highrise Login Setup',
                                css: {"width": "650px", "margin-left": "-325px"},
                                bodyCss: {"min-height": "390px"}
                            });
                            this.app.showLoading("Loading Login...", dialog.getBody());
                            require(["crm/highrise/login"], function (loginPage) {
                                var lPage = new loginPage({camp: that, app: that.app, dialog: dialog});
                                dialog.getBody().html(lPage.$el);
                                dialog.getBody().find('#btnTestLogin').css('float', 'left');
                                dialog.getBody().find('.login-saving').css('width', 'auto');
                            })
                            this.app.showLoading(false, dialog.getBody());
                        }
                    }, this))
                    that.app.showLoading(false, that.$("#area_highrise_import"));
                },
                recipientList: function (lists, flag) {
                    var returnList = [];
                    lists = lists.split(',');
                    var listValue = null;
                    if (flag) {
                        var toggleBtn = this.$('.map-toggle').find('.active').text();
                        if (toggleBtn === "Existing") {
                            listValue = $('#existing_lists option:selected').text();
                        } else {
                            listValue = $('#newlist').val();
                        }
                        this.$(".recipient-details").append('<label>' + listValue + '</label>');
                    } else {
                        var totalRecipientList = this.RecListsPage.getRecipientListCol2();
                        _.each(lists, function (values, k) {
                            _.each(totalRecipientList, function (val) {
                                if (val.encode === values) {
                                    returnList.push(val.name);
                                }
                            });
                        });
                        return returnList;
                    }

                },
                recipientDetails: function () {

                    /*List Values Abdullah */
                    var recipientLists = this.states.step3.recipientList;
                    var type = this.states.step3.recipientType;

                    var recipientChecksum = null;
                    if (recipientLists) {
                        if (type === "Target") {
                            recipientChecksum = this.recipientTarget(recipientLists);
                        }
                        else if (type === "List") {
                            var csvflag = this.states.step3.csvFlag;
                            recipientChecksum = this.recipientList(recipientLists, csvflag);
                        }
                        else {
                            recipientChecksum = this.recipientTags(recipientLists);
                        }
                        if (recipientChecksum != false) {
                            _.each(recipientChecksum, function (val) {
                                this.$(".recipient-details").append('<label>' + val + ', </label>');
                            }, this);
                            // Making Comma Separated String
                            var textstring = this.$('.recipient-details label').text();
                            this.$('.recipient-details').html(textstring.replace(/,(?=[^,]*$)/, '').trim());
                        }

                    }
                    else {
                        if (type === "Target" || type === "List") {
                            var recipientDetailsVal = this.$("#recipients tr");
                            _.each(recipientDetailsVal, function (val,key) {
                                //var checksum = $(val).attr('_checksum');
                                if(key < (recipientDetailsVal.length - 1)){
                                    this.$(".recipient-details").append('<label>' + $(val).find('h3').text() + ', </label>');
                                }else{
                                    this.$(".recipient-details").append('<label>' + $(val).find('h3').text() + '</label>');
                                }
                                
                            }, this);
                            // Making Comma Separated String
                            var textstring = this.$('.recipient-details label').text();
                            this.$('.recipient-details').html(textstring.trim());
                        }
                        else if (type === "Tags") {
                            var recipientDetailsVal = this.$("#tagsrecpslist ul li");
                            _.each(recipientDetailsVal, function (val,key) {
                                var tag = $(val).attr('checksum');
                                if(key < (recipientDetailsVal.length - 1)){
                                    this.$(".recipient-details").append('<label>' + $("[checksum='" + tag + "'] a:first-child").find('span').text() + ', </label>');
                                }else{
                                    this.$(".recipient-details").append('<label>' + $("[checksum='" + tag + "'] a:first-child").find('span').text() + '</label>');
                                }
                                
                            }, this);
                            // Making Comma Separated String
                            var textstring = this.$('.recipient-details label').text();
                            this.$('.recipient-details').html(textstring.trim());
                        }
                        else if (type === "Salesforce") {
                            if (this.states.step3.sfObject) {
                                this.sfRecipient(this.states.step3.sfObject);
                            }
                            else {
                                var sfRecipientVal = this.$("input[name=options_sf]:checked").val();

                                if (sfRecipientVal === "campaign") {
                                    var salesforce_val = this.$('#sfcamp_list_grid .selected').find('h3').text();

                                    this.$(".recipient-details").append('<label>' + this.$('#sfcamp_list_grid .selected').find('h3').text() + '</label>');

                                } else {
                                    if (sfRecipientVal == "both") {
                                        this.$(".recipient-details").append('<label>Leads & Contacts</label>');
                                    }
                                    if (sfRecipientVal == "lead") {
                                        this.$(".recipient-details").append('<label>Leads</label>');
                                    }
                                    if (sfRecipientVal == "contact") {
                                        this.$(".recipient-details").append('<label>Contacts</label>');
                                    }
                                }
                            }
                        } else if (type === "Netsuite") {

                            if (this.states.step3.nsObject) {
                                this.nsRecipient(this.states.step3.nsObject);
                            } else {
                                var nsRecipientVal = this.$("input[name=options_ns]:checked").val();
                                if (nsRecipientVal === "group") {
                                    this.$(".recipient-details").append('<label>' + this.$('#nsgroup_list_grid .selected').find('h3').text() + '</label>');
                                } else {
                                    if (nsRecipientVal == "contact") {
                                        this.$(".recipient-details").append('<label>Contact</label>');
                                    }
                                    else if (nsRecipientVal == "partner") {
                                        this.$(".recipient-details").append('<label>Partner</label>');
                                    }
                                    else {
                                        this.$(".recipient-details").append('<label>Customer</label>');
                                    }
                                }
                            }
                        }
                        else if (type === "Highrise") {

                            if (this.states.step3.hsObject) {
                                this.hsRecipient(this.states.step3.hsObject);
                            } else {
                                var hsRecipientVal = this.$("input[name=options_ns]:checked").val();

                                if (hsRecipientVal === "all") {
                                    this.$(".recipient-details").append('<label>Import all my records</label>');
                                }
                                else if (hsRecipientVal == "criteria") {
                                    this.$(".recipient-details").append('<label>Filter</label>');
                                }
                                else if (hsRecipientVal == "since") {
                                    this.$(".recipient-details").append('<label>' + this.$('#txtdatefield').val() + '</label>');
                                }
                                else if (hsRecipientVal == "term") {
                                    this.$(".recipient-details").append('<label>' + this.$('#txtsearchbyfield').val() + '</label>');
                                }
                                else if (hsRecipientVal == "tag") {
                                    this.$(".recipient-details").append('<label>' + this.$('#hsgroup_list_grid .selected').find('h3').text() + '</label>');
                                }

                            }
                        }

                    }
                    /* Recipient Listing Ends */

                },
                recipientTarget: function (lists) {

                    //  var  totalRecipientTarget = this.app.getAppData("targets");
                    var returnList = [];
                    lists = lists.split(',');
                    var totalRecipientTarget = this.RecTargetPage.getRecipientTargetCol2();
                    _.each(lists, function (values, k) {
                        _.each(totalRecipientTarget, function (val) {
                            if (val.encode === values) {
                                returnList.push(val.name);
                            }
                        });
                    });
                    return returnList;
                },
                recipientTags: function (lists) {
                    lists = lists.split(',');
                    _.each(lists, function (val) {
                        this.$(".recipient-details").append('<label>' + val + ', </label>');
                    }, this);
                    // Making Comma Separated String
                    var textstring = this.$('.recipient-details label').text();
                    this.$('.recipient-details').html(textstring.substring(0, textstring.length - 2));
                    return false;
                },
                sfRecipient: function (sfObject) {
                    if (sfObject == "both") {
                        this.$(".recipient-details").append('<label>Leads & Contacts</label>');
                    }
                    if (sfObject == "lead") {
                        this.$(".recipient-details").append('<label>Leads</label>');
                    }
                    if (sfObject == "contact") {
                        this.$(".recipient-details").append('<label>Contacts</label>');
                    }
                    if (sfObject == "campaign") {
                        this.$(".recipient-details").append('<label>' + this.$('#sfcamp_list_grid .selected').find('h3').text() + '</label>');
                    }
                },
                nsRecipient: function (nsObject) {
                    if (nsObject == "contact") {
                        this.$(".recipient-details").append('<label>Contact</label>');
                    }
                    if (nsObject == "partner") {
                        this.$(".recipient-details").append('<label>Partner</label>');
                    }
                    if (nsObject == "customer") {
                        this.$(".recipient-details").append('<label>Customer</label>');
                    }
                    if (nsObject == "group") {
                        this.$(".recipient-details").append('<label>' + this.$('#nsgroup_list_grid .selected').find('h3').text() + '</label>');
                    }
                },
                hsRecipient: function (hsObject) {
                    if (hsObject == "all") {
                        this.$(".recipient-details").append('<label>Import all my records</label>');
                    }
                    if (hsObject == "criteria") {
                        this.$(".recipient-details").append('<label>Filter</label>');
                    }
                    if (hsObject == "since") {
                        this.$(".recipient-details").append('<label>' + this.$('#txtdatefield').val() + '</label>');
                    }
                    if (hsObject == "term") {
                        this.$(".recipient-details").append('<label>' + this.$('#txtsearchbyfield').val() + '</label>');
                    }
                    if (hsObject == "tag") {
                        this.$(".recipient-details").append('<label>' + this.$('#hsgroup_list_grid .selected').find('h3').text() + '</label>');
                    }
                },
                getRecipientsListsRequest: function (source_type) {
                    var camp_obj = this;
                    var URL = "";
                    if (source_type == "salesforce") {
                        URL = "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    }
                    else if (source_type == "netsuite") {
                        URL = "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    } else if (source_type == "highrise") {
                        URL = "/pms/io/highrise/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    } else {
                        URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=recipientType";
                    }
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                        if (xhr && xhr.responseText) {
                            var rec_json = jQuery.parseJSON(xhr.responseText);
                            if (rec_json.type) {
                                if (rec_json.count !== "0") {
                                    _.each(rec_json.listNumbers[0], function (val) {
                                        console.log(val[0].checksum);
                                    });
                                }
                            }

                        }
                    }).fail(function () {
                        console.log("Receipts data load failed");
                    });
                },
                setiFrameSrc: function () { // HTML & Text Tab Click
                    /*Check show Orginal*/
                    if (this.$('.show-original').is(':checked')) {
                        this.original = 'Y';
                    } else {
                        this.original = 'N';
                    }
                    /*check contact selected or not*/
                    if (this.$('.prev-iframe.selected').attr('id') === "prev-iframe-html") {
                        this.html = 'Y';
                    }
                    else {
                        this.html = 'N';
                    }
                    /* Check if Text is N or Y*/
                    /*if(this.options.isText=='N'){
                     this.html='Y'; 
                     }else{
                     this.html='N';
                     }*/
                    if(this.html=='Y'){
                        this.$el.find('.email-preview iframe').remove();
                        var transport = new easyXDM.Socket({           
                                        remote:  window.location.protocol+'//'+this.app.get("preview_domain")+"/pms/events/viewcamp_test.jsp?cnum=" + this.camp_id + "&html="+this.html+"&original="+this.original,
                                        onReady: function(){
                                              //  this._app.showLoading(false,dialog.getBody());
                                        },
                                        onMessage: _.bind(function(message, origin){
                                            var response = jQuery.parseJSON(message);
                                            if (Number(response.height) < 600) {
                                                    this.$el.find('.email-preview iframe').height('600');
                                                } else {
                                                    this.$el.find('.email-preview iframe').height(response.height);
                                                }
                                        },this),
                                        props:{style:{width:"100%",height:"600px"},frameborder:0},
                                        container : this.$(".email-preview")[0]
                                    }); 
                    }else{
                                    var preview_url = "https://" + this.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + this.camp_id;
                                    var frame = preview_url + "&html=" + this.html + "&original=" + this.original;
                                     this.$('.email-preview iframe').attr('src', frame).css('height', 600);
                    }
                    //this.$el.find('.email-preview iframe').height(response.height);
                    /*Check if Contact is selected or not
                     if(this.subNum !== null){
                     frame+="&snum="+this.subNum; 
                     }*/
                   
                },
                htmlTextClick: function (ev) {
                    var tabID = ev.currentTarget.id;
                    this.$('.prev-iframe-campaign').removeClass('selected');
                    this.$('#' + tabID).addClass('selected');
                    this.setiFrameSrc();
                },
                choseLists: function () {
                    //var params = {type : 'lists'};
                    this.app.showLoading("Loading Lists...", this.$('#area_choose_lists'));
                    //require(["listupload/campaign_recipients_lists"], _.bind(function (selectListPage) {
                        this.RecListsPage = new selectListPage({params: {type: "batches", recipientType: this.states.step3.recipientType.toLowerCase()}, parent: this, app: this.app, campNum: this.camp_id});
                        this.$('#area_choose_lists').html(this.RecListsPage.$el);                      
                        this.setRecipients();
                      
                    //}, this));
                    

                },
                choseTargets: function () {
                    //var params = {type : 'lists'};
                    this.app.showLoading("Loading Targets...", this.$('#area_choose_targets'));
                    //require(["target/selecttarget"], _.bind(function (selectTarget) {
                        this.RecTargetPage = new selectTarget({page: this, editable: true});
                        this.$('#area_choose_targets').html(this.RecTargetPage.$el);
                        this.RecTargetPage.init();                        
                        this.setRecipients();                        
                    //}, this));                    

                },
                showGoogle: function () {
                    this.$("#google_setup").show();
                    this.$('#google_welcome').hide();
                    this.$('#google_setup .heading').show();

                    var camp_obj = this;
                    var google = this.app.getAppData("google");
                    this.app.showLoading("Checking Status...", this.$("#area_google_import"));
                    if (!google || google[0] == "err" || google.isGoogleUser == "N")
                    {

                        this.app.getData({
                            "URL": "/pms/io/google/setup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                            "key": "google",
                            "callback": _.bind(camp_obj.getWorksheet, this),
                            "errorCallback": _.bind(camp_obj.googleErrorCallBack, this),
                        });
                    }
                    else {

                        camp_obj.getWorksheet(this);
                    }
                    this.app.showLoading(false, this.$("#area_google_import"));
                },
                checkGoogleStatus: function () {
                    this.app.getData({
                        "URL": "/pms/io/google/setup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                        "key": "google",
                        "callback": _.bind(this.getWorksheet, this),
                        "errorCallback": _.bind(this.googleErrorCallBack, this),
                    });
                },
                showWelcomeScreen: function () {
                    var active_ws = this.$el.parents(".ws-content");
                    active_ws.find('#google_welcome').show();
                    var that = this;
                    active_ws.find("#google_welcome").find("#btnGoogleLogin").on('click', function () {
                        that.getStarted();
                    });
                    this.$('#google_setup .heading').hide();
                    active_ws.find("#google_import_container").html('');
                    that.googleBindEvents();

                },
                googleErrorCallBack: function () {
                    var that = this;
                    var active_ws = this.$el.parents(".ws-content");
                    active_ws.find('#google_welcome').show();
                    active_ws.find("#google_welcome").find("#btnGoogleLogin").on('click', function () {
                        that.getStarted();
                    });
                    this.$('#google_setup .heading').hide();
                    active_ws.find("#google_import_container").html('');
                    that.googleBindEvents();
                },
                getStarted: function () {
                    var that = this;
                    var URL = "/pms/io/google/setup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getAuthenticationUrl";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var urls = jQuery.parseJSON(xhr.responseText);
                        if (that.app.checkError(urls)) {
                            return false;
                        }
                        if (urls[0] !== "err") {
                            var url = urls.authenticationURL;
                            var windowName = "popUp";
                            var childWindow = window.open(url, windowName, "width=600,height=920,scrollbars=yes");
                            var intervalID = window.setInterval(function () {
                                if (childWindow && childWindow.closed) {
                                    window.clearInterval(intervalID);
                                    that.showGoogle();
                                    //that.parent.parent.init(true);
                                }
                            }, 200);

                        }

                    });

                },
                googleImport: function () {

                    var active_ws = this.$el.parents(".ws-content");
                    active_ws.find('#google_welcome').hide();
                    active_ws.find("#google_import_container").show();
                    active_ws.find("#google_import_container").html('');
                    var that = this;
                    this.app.showLoading("Loading Google...", this.$('#google_import_container'));
                    var URL = "/pms/io/google/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.camp_id + "&type=import";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        that.app.showLoading(false, that.$el.parents(".ws-content"));
                        if (xhr && xhr.responseText) {
                            var data = jQuery.parseJSON(xhr.responseText);

                            require(["crm/google/import"], _.bind(function (page) {

                                that.objGooglePage = null;
                                that.objGooglePage = new page({page: that, spreadSheet: that.spreadSheets, edit: data});
                                active_ws.find("#google_import_container").html(that.objGooglePage.$el);
                                that.app.showLoading(false, that.$('#google_import_container'));
                            }, this));
                        }
                        if (that.app.checkError(data)) {
                            return false;
                        }
                    });

                    that.googleBindEvents();
                },
                getWorksheet: function () {
                    var google = this.app.getAppData("google");
                    if (!google || google[0] == "err" || google.isGoogleUser == "N") {
                        this.showWelcomeScreen();
                        return;
                    }
                    this.isAuthorize = true;
                    this.app.showLoading("Loading Google Data...", this.$('#google_import_container'));
                    var URL = '/pms/io/google/getData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    var data = {
                        type: 'spreadsheetList'
                    }
                    var that = this;
                    $.getJSON(URL, data)
                            .done(_.bind(function (json) {
                                that.spreadSheets = json.spreadsheetList[0];
                                that.app.showLoading(false, that.$('#google_import_container'));
                                that.googleImport();
                            }, this))
                            .fail(_.bind(function (jqxhr, textStatus, error) {
                                console.log("Request Failed: " + err);
                            }, this));

                },
                googleBindEvents: function () {
                    var that = this;
                    this.$("#gg_setting_menu li").unbind();
                    this.$("#gg_setting_menu li").click(_.bind(function (obj) {
                        var target_obj = $.getObj(obj, "li");

                        if (target_obj.attr("id") == "gg_mapping") {
                            var dialog = this.app.showDialog({title: ' Specify Import',
                                css: {"width": "1400px", "margin-left": "-700px"},
                                bodyCss: {"min-height": "410px"},
                                buttons: {saveBtn: {text: 'Save Mapping'}}
                            });
                            this.app.showLoading("Loading Mapping...", dialog.getBody());
                            require(["crm/google/mapping"], function (mappingPage) {
                                var mPage = new mappingPage({page: that, app: that.app, dialog: dialog});
                                dialog.getBody().html(mPage.$el);
                                dialog.saveCallBack(_.bind(mPage.saveCall, mPage));
                                dialog.getBody().find('.bDiv').css('height', '320px');

                            });
                            this.app.showLoading(false, dialog.getBody());
                        }

                        else if (target_obj.attr("id") == "gg_user_setting") {

                            var dialog = this.app.showDialog({title: 'Google Login Setup',
                                css: {"width": "650px", "margin-left": "-325px"},
                                bodyCss: {"min-height": "390px"}
                            });
                            this.app.showLoading("Loading Login...", dialog.getBody());
                            require(["crm/google/login"], function (loginPage) {
                                var lPage = new loginPage({page: that, app: that.app, dialog: dialog, isAuthorize: that.isAuthorize});
                                dialog.getBody().html(lPage.$el);
                                dialog.getBody().find(".span6").css({'width': '100%', 'margin-left': '5%'});
                                dialog.getBody().find(".second-div").remove();

                            })
                            this.app.showLoading(false, dialog.getBody());
                        }
                    }, this))
                    that.app.showLoading(false, that.$("#area_google_import"));
                },
                saveGoogleDetails: function (fromNext) {
                    this.getGoogleImportData();
                    var camp_obj = this;
                    var post_data = {type: 'import', synchType: 'recipients', campNum: this.camp_id};
                    var URL = "/pms/io/google/setData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    $.extend(post_data, this.getMappingData());
                    var valid = this.objGooglePage.getImportData();
                    $.extend(post_data, valid);
                    this.app.showLoading("Saving google settings...", this.$el.parents(".ws-content"));
                    $.post(URL, post_data)
                            .done(function (data) {
                                camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                                var camp_json = jQuery.parseJSON(data);
                                if (camp_json[0] !== "err") {
                                    camp_obj.wizard.next();
                                    camp_obj.app.showMessge("Step 3 saved successfully!");
                                    camp_obj.isGoogleRequire = true; // this will not load who view, when press back
                                    camp_obj.fetchFilters("Google");
                                } else {
                                    camp_obj.app.showAlert(camp_json[1], $("body"), {fixed: true});
                                }
                            });
                },
                getGoogleImportData: function () {
                    var proceed = -1;
                    var valid = this.objGooglePage.getImportData();
                    var whichOption = this.objGooglePage.getImportData();
                    if (whichOption['filterType'] == 'sheet') {
                        if (this.objGooglePage.mapPage) {
                            this.mapping = this.objGooglePage.mapPage.mapAndImport();
                        } else {
                            this.app.showAlert("Please select worksheet.", $("body"), {fixed: true});
                            return false;
                        }

                        if (this.mapping == false) {
                            return false;
                        } else {
                            this.mapping = this.mapping;
                            return this.mapping;
                        }
                    }
                    if (valid == 0) {
                        return 0;
                    }
                    if (valid !== 0) {
                        this.objGooglePage.saveFilter('google', false);
                        proceed = 0;
                    }

                    return proceed;
                },
                getMappingData: function () {
                    var data = {};
                    var whichOption = this.objGooglePage.getImportData();
                    if (whichOption['filterType'] == 'all') {
                        return data;
                    }

                    var maps = this.mapping.split("&");
                    var result = "";
                    _.each(maps, function (key, value) {
                        if (key) {
                            var res = key.split("=");
                            result = result + res[0] + ":" + res[1] + ",";
                        }
                    });
                    data['mappingFields'] = result;
                    return data;
                },
                editFieldsLayout: function () {
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Subscriber Profile Update',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        bodyCss: {"min-height": dialog_height + "px"},
                        buttons: {saveBtn: {text: 'Save'}}
                    });
                    var URL = "/pms/list/UpdateSubscriberProfileLayout.jsp?campaignNumber=" + this.camp_id + "&origin=EditCampaignOptions.jsp&x=cccjsp&BMS_REQ_TK=" + this.app.get('bms_token') + "&fromNewUI=true&checksum=" + this.checksum;
                    var iframHTML = "<iframe src=\"" + URL + "\"  width=\"100%\" class=\"fieldsLayoutIframe\" frameborder=\"0\" style=\"height:" + (dialog_height - 7) + "px\"></iframe>"
                    dialog.getBody().html(iframHTML);
                    this.app.showLoading("Loading Subscriber Profile...", dialog.getBody());
                    dialog.getBody().find('.fieldsLayoutIframe').load(_.bind(function () {
                        this.app.showLoading(false, dialog.getBody());
                        // this.$("#workflowlistsearch #clearsearch").click();

                    }, this))
                    dialog.saveCallBack(function () {
                        dialog.$(".fieldsLayoutIframe")[0].contentWindow.document.updateSubscriberProfileLayout.submit();
                    });

                },
                optListSelection: function () {
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Opt-In List Selection',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        bodyCss: {"min-height": dialog_height + "px"},
                        buttons: {saveBtn: {text: 'Save'}}
                    });
                    var URL = "/pms/list/DesignateLists.jsp?campaignNumber=" + this.camp_id + "&BMS_REQ_TK=" + this.app.get('bms_token') + "&fromNewUI=true&checksum=" + this.checksum;
                    var iframHTML = "<iframe src=\"" + URL + "\"  width=\"100%\" class=\"optlistiframe\" frameborder=\"0\" style=\"height:" + (dialog_height - 7) + "px\"></iframe>"
                    dialog.getBody().html(iframHTML);
                    this.app.showLoading("Loading Opt-In List...", dialog.getBody());
                    dialog.getBody().find('.optlistiframe').load(_.bind(function () {
                        this.app.showLoading(false, dialog.getBody());
                        // this.$("#workflowlistsearch #clearsearch").click();

                    }, this))
                    dialog.saveCallBack(function () {
                        dialog.$(".optlistiframe")[0].contentWindow.document.designateLists.submit();
                    });
                }
                ,
                dcItemsDialog: function () {
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Dynamic Content Items',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    var URL = "/pms/publisher/dyFrame.jsp?BMS_REQ_TK=" + this.app.get('bms_token') + "&fromNewUI=true";
                    var iframHTML = "<iframe src=\"" + URL + "\"  width=\"100%\" class=\"dcItemsIframe\" frameborder=\"0\" style=\"height:" + (dialog_height - 7) + "px\"></iframe>"
                    dialog.getBody().html(iframHTML);

                },
                previewCallback : function(){
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");
                    header_title.find('.preview').trigger('click');
                }

            });
        });
