define(['text!forms/html/formlistings_row.html','forms/copyform'],
        function (template, copyFormPage) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber Record View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'form-box',
                tagName: 'tr',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    "click .edit-form": 'editForm',
                    "click .preview-form": 'previewForm',
                    "click .link-form": "linkFormDialog",
                    "click .snippet-form": "snippetFormDialog",
                    "click .copy-form": "copyForm",
                    "click .delete-form": 'deleteFormDialog',
                    'click .row-move': 'addRowToCol2',
                    'click .row-remove': 'removeRowToCol2',
                    'click .check-box': 'checkUncheck'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.parent = this.options.sub;
                    this.app = this.parent.app;
                    this.showUseButton = this.options.showUse;
                    this.showRemoveButton = this.options.showRemove;
                    this.showCheckbox = this.options.showCheckbox;
                    this.maxWidth = this.options.maxWidth?this.options.maxWidth:'auto';
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
                    if(this.showUseButton){
                        this.$el.attr("data-checksum",this.model.get("formId.checksum"))
                    }
                    this.initControls();

                },
                /*
                 * 
                 * @returns Time Show
                 */
                getDate: function () {
                    var datetime = this.model.get('updationDate') ? this.model.get('updationDate') : this.model.get('creationDate');
                    var date = moment(this.app.decodeHTML(datetime), 'MM-DD-YY');
                    return date.format("DD MMM, YYYY") == "Invalid date" ? "&nbsp;" : date.format("DD MMM, YYYY");
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    if (this.parent.searchTxt) {
                        this.$(".form-name").highlight($.trim(this.parent.searchTxt));                        
                    } 
                },
                editForm: function () {
                    this.parent.openFormDialog(this.model.get("formId.encode"),this.model.get('name'))
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
                    var preview_url = this.app.decodeHTML(this.model.get('formPreviewURL'))+"?preview=Y";
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height}); // isText to Dynamic
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                },
                snippetFormDialog: function () {
                    var dialog_title = "Snippet of form &quot;" + this.model.get('name') + "&quot;";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "642px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "170px"},
                        headerIcon: 'dlgsnippet'
                    });
                    var html = '<div style="margin-top:0px;" class="blockname-container">'
                    html += '<div class="label-text">Form Snippet:</div>'
                    html += '<div class="input-append sort-options blockname-container"><div class="inputcont">'
                    html += '<textarea id="form_link" style="width:600px;height:60px" readonly="readonly">' + this.app.decodeHTML(this.model.get("snippet")) + '</textarea>'
                    html += '</div></div>'
                    html += '<div style="font-size: 12px;margin-top:10px">'
                    var key = navigator.platform.toUpperCase().indexOf("MAC") > -1 ? "Command" : "Ctrl";
                    html += '<i>Press ' + key + ' + C to copy link.</i>'
                    html += '</div> </div>'

                    html = $(html);
                    dialog.getBody().append(html);
                    dialog.getBody().find("#form_link").select().focus();
                    dialog.getBody().find("#form_link").mousedown(function (event) {
                        $(this).select().focus();
                        event.stopPropagation();
                        event.preventDefault();
                    })

                },
                linkFormDialog: function () {
                    var dialog_title = "Link of form &quot;" + this.model.get('name') + "&quot;";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "642px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'link'
                    });
                    var html = '<div style="margin-top:0px;" class="blockname-container">'
                    html += '<div class="label-text">Form Link:</div>'
                    html += '<div class="input-append sort-options blockname-container"><div class="inputcont">'
                    html += '<input id="form_link" style="width:600px" readonly="readonly" value="'+this.app.decodeHTML(this.model.get("formPreviewURL"))+'"></input>'
                    html += '</div></div>'
                    html += '<div style="font-size: 12px;margin-top:10px">'
                    var key = navigator.platform.toUpperCase().indexOf("MAC") > -1 ? "Command" : "Ctrl";
                    html += '<i>Press ' + key + ' + C to copy link.</i>'
                    html += '</div> </div>'

                    html = $(html);
                    dialog.getBody().append(html);
                    dialog.getBody().find("#form_link").select().focus();
                    dialog.getBody().find("#form_link").mousedown(function (event) {
                        $(this).select().focus();
                        event.stopPropagation();
                        event.preventDefault();
                    })

                },
                copyForm: function () {
                    var dialog_title = "Copy Form";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Create Form'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    //require(["forms/copyform"], _.bind(function (copyFormPage) {
                        var mPage = new copyFormPage({page: this, copydialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        mPage.init();
                        dialog.saveCallBack(_.bind(mPage.copyForm, mPage));
                    //}, this));
                },
                deleteFormDialog: function () {
                    var form_id = this.model.get('formId.encode')
                    if (form_id) {
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this form?",
                            callback: _.bind(function () {
                                this.deleteForm();
                            }, this)},
                        $('body'));
                    }
                },
                deleteForm: function () {
                    var parent_view = this.parent;
                    var URL = '/pms/io/form/saveSignUpFormData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    this.app.showLoading("Deleting Form...", parent_view.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                    $.post(URL, {type: 'delete', formId: this.model.get('formId.encode')})
                            .done(_.bind(function (data) {
                                this.app.showLoading(false, parent_view.$el.parents(".ws-content.active"));
                                var _json = jQuery.parseJSON(data);
                                if (this.app.checkError(_json)) {
                                    return false;
                                }
                                if (_json[0] !== "err") {
                                    this.app.showMessge("Form has been deleted successfully!");
                                    this.$el.fadeOut(_.bind(function () {
                                        this.$el.remove();
                                    }, this));
                                    var total_count = parent_view.$("#total_templates .badge");
                                    var badge_total_count = parent_view.$el.parents(".ws-content.active").find(".total_forms");
                                    var r_count = parseInt(total_count.text()) - 1;
                                    var top_r_count = parseInt(badge_total_count.text())-1;
                                    total_count.html(r_count);
                                    badge_total_count.html(top_r_count);

                                }
                                else {
                                    parent_view.app.showAlert(_json[1], parent_view.$el.parents(".ws-content.active"));
                                }

                            }, this));
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
                    if (this.parent.createSignupFormChart) {
                        this.parent.createSignupFormChart();
                    }
                }
            });
        });