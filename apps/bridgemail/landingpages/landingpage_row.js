define(['text!landingpages/html/landingpage_row.html', 'jquery.highlight'],
        function (template, highlighter) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Landing page row View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'landingpage-box',
                tagName: 'tr',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .copy-page': 'copyPage',
                    'click .edit-page': 'openPage',
                    "click .preview-page": 'previewPage',                    
                    "click .publish-page": 'publishPage',
                    "click .unpublish-page": 'unpublishPage',
                    'click .delete-page': 'deletePageDialoge',
                    'click .taglink': 'tagClick'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.tagTxt = '';
                    this.render();
                    //this.model.on('change',this.renderRow,this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        model: this.model
                    }));

                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.initControls();

                },
                /*
                 * 
                 * @returns Page Status
                 */
                getPageStatus: function () {
                    var value = this.app.getCampStatus(this.model.get('status'));
                    var tooltipMsg = '';
                    if (this.model.get('status') == 'D')
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
                publishPage: function(){
                    
                },
                unpublishPage: function(){
                    
                },
                openPage: function () {
                    var camp_id = this.model.get('campNum.encode');
                    var camp_wsid = this.model.get('campNum.checksum');
                    this.app.mainContainer.openCampaign(camp_id, camp_wsid);

                },
                copyPage: function ()
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
                    require(["campaigns/copycampaign"], _.bind(function (copycampaignPage) {
                        var mPage = new copycampaignPage({camp: this.sub, camp_id: camp_id, app: this.app, copycampsdialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.copyCampaign, mPage));
                    }, this));
                },
                previewPage: function () {
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
                    this.app.showLoading("Loading Page...", dialog.getBody());
                    var preview_url = "https://" + this.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + camp_id;
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: camp_id, isText: isTextOnly}); // isText to Dynamic
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                },
                deletePageDialoge: function () {
                    var camp_obj = this.sub;
                    var appMsgs = camp_obj.app.messages[0];
                    var camp_id = this.model.get('campNum.encode')
                    if (camp_id) {
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: appMsgs.CAMPS_delete_confirm_error,
                            callback: _.bind(function () {
                                camp_obj.$el.parents(".ws-content.active").find(".overlay").remove();
                                this.deletePage();
                            }, this)},
                        $('body'));                      
                    }
                },
                deletePage: function ()
                {
                    var camp_obj = this.sub;

                    var appMsgs = this.app.messages[0];
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
                                    this.app.showMessge(appMsgs.CAMPS_delete_success_msg);
                                    //camp_obj.$el.find("#area_copy_campaign .bmsgrid").remove();
                                    this.app.removeCache("campaigns");
                                    camp_obj.total_fetch = 0;
                                    camp_obj.getallcampaigns();
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
                }

            });
        });