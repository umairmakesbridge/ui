define(['text!bmstemplates/html/template.html', 'jquery.icheck', 'bms-tags', 'bms-addbox', 'bms-dragfile', 'bms-mergefields'],
        function (template, icheck, bmstags) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Template save and update view
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'change #file_control': 'uploadImage',
                    'click #btn_image_url': "TryDialog",
                    'click .btn-opengallery': "TryDialog"
                },
                /**
                 * Initialize view - backbone .
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.render();
                },
                /**
                 * Initialize view .
                 */
                render: function () {
                    this.app = this.options.template.app;
                    this.$el.html(this.template({}));
                    this.page = this.options.template;
                    this.editor_change = false;
                    if (this.options.rowtemplate) {
                        this.modelTemplate = this.options.rowtemplate;
                    }

                    this.dialog = this.options.dialog;
                    this.template_id = this.page.template_id;
                    this.meeEditor = false;
                    this.$('input.checkpanel').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                    });
                }
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                ,
                init: function () {
                    var self = this;
                    this.modal = this.$el.parents(".modal");
                    this.tagDiv = this.modal.find(".tagscont");
                    this.imageval = null;
                    this.$('#file_control').attr('title', '');
                    this.head_action_bar = this.modal.find(".modal-header .edited  h2");
                    this.head_action_bar.find(".preview").remove();
                    var previewIconTemplate = $('<a class="icon preview showtooltip" data-original-title="Preview template"></a>').tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.head_action_bar.find(".edit").hide();
                    var copyIconTemplate = this.head_action_bar.find(".copy");
                    copyIconTemplate.attr('data-original-title', 'Copy template').tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    ;
                    this.head_action_bar.find(".delete").attr('data-original-title', 'Delete template').tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.head_action_bar.append(previewIconTemplate);
                    if (!this.app.get("isMEETemplate")) {
                        this.initEditor();
                        this.$("textarea").css("height", (this.$("#area_create_template").height() - 270) + "px");
                    }
                    else {
                        this.$("textarea").css({"height": (this.$("#area_create_template").height() - 250) + "px", width: (this.$("#area_create_template").width() - 28) + "px"});
                    }
                    this.loadMEE();
                    this.tagDiv.addClass("template-tag");
                    this.loadTemplate();
                    this.iThumbnail = this.$(".droppanel");
                    this.iThumbImage = null;
                    this.$("textarea").css("height", (this.$("#area_create_template").height() - 270) + "px");
                    this.$(".droppanel").dragfile({
                        post_url: '/pms/io/publish/saveImagesData/?BMS_REQ_TK=' + this.app.get('bms_token') + '&type=add&allowOverwrite=N&th_width=240&th_height=320',
                        callBack: _.bind(this.processUpload, this),
                        app: this.app,
                        module: 'template',
                        progressElement: this.$('.droppanel')
                    });
                    this.$('#file_control').on('mouseover', _.bind(function (obj) {
                        this.$("#list_file_upload").css({'background': '#00A1DD', 'color': '#ffffff'});
                    }, this));
                    this.$('#file_control').on('mouseout', _.bind(function (obj) {
                        this.$("#list_file_upload").css({'background': '#01AEEE', 'color': '#ffffff'});
                    }, this));

                    this.$(".add-cat").addbox({app: this.app,
                        addCallBack: _.bind(this.addCategory, this),
                        placeholder_text: 'Please enter category'
                    });

                    // Merge Field Abdullah 
                    this.$('#merge_field_plugin-wrap').mergefields({app: this.app, view: this, config: {links: true, state: 'dialog'}, elementID: 'merge_field_plugin', placeholder_text: 'Merge Tags'});
                    copyIconTemplate.click(_.bind(function (e) {
                        if (this.options.rowtemplate) {
                            this.options.rowtemplate.copyTemplate()
                        }
                        else {
                            this.copyTemplate();
                        }
                    }, this));
                    previewIconTemplate.click(_.bind(function (e) {
                        var dialog_width = $(document.documentElement).width() - 60;
                        var dialog_height = $(document.documentElement).height() - 162;
                        var dialog = this.app.showDialog({title: 'Template Preview',
                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                            headerEditable: false,
                            headerIcon: 'dlgpreview',
                            bodyCss: {"min-height": dialog_height + "px"}
                        });
                        var preview_iframe = "https://" + this.app.get("preview_domain") + "/pms/events/viewtemp.jsp?templateNumber=" + this.template_id;
                        require(["common/templatePreview"], _.bind(function (templatePreview) {
                            var tmPr = new templatePreview({frameSrc: preview_iframe, app: this.app, frameHeight: dialog_height, prevFlag: 'T', tempNum: this.template_id});
                            dialog.getBody().append(tmPr.$el);
                            this.app.showLoading(false, tmPr.$el.parent());
                            tmPr.init();
                            var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                            tmPr.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                            dialog.$el.find('#dialog-title .preview').remove();
                        }, this));
//                    dialog.getBody().html(preview_iframe);                                         
                        e.stopPropagation();
                    }, this));

                    this.dialog.$(".pointy .edit").click(_.bind(function () {
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$("#dialog-title span").click(_.bind(function (obj) {
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$(".savebtn").click(_.bind(function (obj) {
                        this.saveTemplateName(obj)
                    }, this));

                    this.dialog.$(".cancelbtn").click(_.bind(function (obj) {
                        if (this.template_id) {
                            this.showHideTargetTitle();
                        }
                    }, this));
                    this.dialog.$(".pointy .delete").click(_.bind(function (obj) {
                        var _this = this;
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this template?",
                            callback: _.bind(function () {
                                _this.deleteTemplate(_this.template_id);
                            }, _this)},
                        _this.dialog.$el);

                    }, this));
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
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

                    this.app.showLoading("Loading Template...", this.$el);
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=get&templateNumber=" + this.template_id;
                    this.getTemplateCall = jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            _this.app.showLoading(false, _this.$el);
                            var template_json = jQuery.parseJSON(xhr.responseText);
                            if (_this.app.checkError(template_json)) {
                                return false;
                            }

                            _this.modal.find(".dialog-title").html(template_json.name).attr("data-original-title", "Click to rename").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                            _this.app.dialogArray[_this.app.dialogArray.length - 1].title = template_json.name;
                            //_this.$("textarea").val(_this.app.decodeHTML(template_json.htmlText,true));
                            if (_tinyMCE.get('bmseditor_template')) {
                                _tinyMCE.get('bmseditor_template').setContent(_this.app.decodeHTML(template_json.htmlText, true));
                            }
                            else {
                                _this.editorContent = _this.app.decodeHTML(template_json.htmlText, true);
                            }
                            if (template_json.isFeatured == 'Y') {
                                _this.$(".featured").iCheck('check');
                            }
                            if (_this.app.get("isMEETemplate")) {
                                _this.$("#bmseditor_template").val(_this.app.decodeHTML(template_json.htmlText, true));
                            }
                            if (template_json.isAdmin == "Y") {
                                if (template_json.isReturnPath == 'Y') {
                                    _this.$(".return-path").closest('.btnunchecked').css('display', 'inline-block');
                                    _this.$(".return-path").iCheck('check');
                                }
                            } else {
                                _this.$(".return-path").closest('.btnunchecked').remove();
                            }
                            if (template_json.isMobile == 'Y') {
                                _this.$(".mobile-comp").iCheck('check');
                            }
                            if (template_json.categoryID) {
                                _this.$(".iconpointy").before($('<a class="cat">' + template_json.categoryID + '</a>'))
                            }
                            if (template_json.thumbURL) {
                                _this.iThumbnail.find("h4").hide();
                                _this.iThumbnail.find("img").attr("src", _this.app.decodeHTML(template_json.thumbURL)).show();
                            }
                            _this.app.dialogArray[_this.app.dialogArray.length - 1].tags = template_json.tags;
                            _this.tagDiv.tags({app: _this.app,
                                url: '/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK=' + _this.app.get('bms_token'),
                                params: {type: 'tags', templateNumber: _this.template_id, tags: ''}
                                , showAddButton: true,
                                tags: template_json.tags,
                                fromDialog: _this.dialog.$el,
                                callBack: _.bind(_this.newTags, _this),
                                typeAheadURL: "/pms/io/user/getData/?BMS_REQ_TK=" + _this.app.get('bms_token') + "&type=allTemplateTags"
                            });
                        }
                    }).fail(function () {
                        console.log("error in loading template");
                    });
                },
                addCategory: function (val) {
                    val = this.app.encodeHTML(val);
                    if (this.$(".cat").length) {
                        this.$(".cat").html(val);
                    }
                    else {
                        this.$(".iconpointy").before($('<a class="cat">' + val + '</a>'))
                    }
                    return true;
                },
                uploadImage: function (obj) {
                    var input_obj = obj.target;
                    var files = input_obj.files;
                    if (this.iThumbnail.data("dragfile")) {
                        this.iThumbnail.data("dragfile").handleFileUpload(files);
                    }
                },
                newTags: function (data) {
                    this.modelTemplate.model.set("tags", data);
                },
                processUpload: function (data) {
                    var _image = jQuery.parseJSON(data);
                    this.$('.droppanel #progress').remove();
                    this.$('.csv-opcbg').hide();
                    if (_image.success) {

                        _.each(_image.images[0], function (val) {
                            this.iThumbnail.remove("file-border");
                            this.imageCheckSum = val[0]['imageId.encode'];
                            this.iThumbnail.find("h4").hide();
                            this.iThumbnail.find("img").attr("src", this.app.decodeHTML(val[0]['thumbURL'])).show();
                            this.iThumbImage = this.app.decodeHTML(val[0]['thumbURL']);
                            this.saveUserImage();

                        }, this)
                    }
                    else {
                        this.app.showAlert(_image.err1, $("body"), {fixed: true});
                    }
                },
                copyTemplate: function () {
                    var dialog_title = "Copy Template";
                    var self;
                    var __dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'copy',
                        overlay: true,
                        buttons: {saveBtn: {text: 'Create Template'}}
                    });
                    this.app.showLoading("Loading...", __dialog.getBody());
                    require(["bmstemplates/copytemplate"], _.bind(function (copyTemplatePage) {
                        var mPage = new copyTemplatePage({templ: self, template_id: this.template_id, app: this.app, templatesDialog: __dialog});
                        __dialog.getBody().append(mPage.$el);
                        this.app.showLoading(false, mPage.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        mPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(mPage.copyTemplate, mPage); // New Dialog
                        __dialog.$el.find('#dialog-title .preview').remove();
                        __dialog.saveCallBack(_.bind(mPage.copyTemplate, mPage));
                    }, this));
                },
                saveTemplateCall: function () {
                    var _this = this;
                    var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token');
                    var isReturnPath = this.$(".return-path").prop("checked") ? 'Y' : 'N';
                    var isFeatured = this.$(".featured").prop("checked") ? 'Y' : 'N';
                    var isMobile = this.$(".mobile-comp").prop("checked") ? 'Y' : 'N';
                    this.dataObj = {type: 'update', templateNumber: this.template_id,
                        imageId: this.imageCheckSum,
                        isFeatured: isFeatured,
                        isReturnPath: isReturnPath,
                        isMobile: isMobile,
                        categoryID: this.$(".cat").text()
                    };
                    if (this.app.get("isMEETemplate")) {
                        this.dataObj["isMEE"] = 'Y';
                        this.dataObj["templateHtml"] = this.$("#bmseditor_template").val();
                    }
                    else {
                        this.dataObj["templateHtml"] = _tinyMCE.get('bmseditor_template').getContent()//_this.$("textarea").val()
                    }
                    _this.app.showLoading("Updating Template...", this.$el.parents('.modal'));
                    $.post(URL, this.dataObj)
                            .done(function (data) {
                                _this.app.showLoading(false, _this.$el.parents('.modal'));
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== 'err') {
                                    _this.app.showMessge("Template Updated Successfully!");
                                    if (_this.modelTemplate) {
                                        _this.modelSave();
                                    }
                                }
                                else {
                                    _this.app.showAlert(_json[1], $("body"), {fixed: true});
                                }
                            });
                },
                initEditor: function () {
                    var _this = this;
                    _tinyMCE.init({
                        // General options
                        mode: "exact",
                        elements: "bmseditor_template",
                        theme: "advanced",
                        plugins: "contextmenu,fullscreen,inlinepopups,paste,searchreplace,iespell,style,table,visualchars,fullpage,preview,imagemanager",
                        //browsers : "msie,gecko,opera,safari",

                        doctype: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
                        element_format: "html",
                        //plugins : "safari",
                        convert_urls: false,
                        relative_urls: false,
                        remove_script_host: false,
                        // paste options
                        paste_auto_cleanup_on_paste: true,
                        paste_retain_style_properties: "none",
                        paste_convert_middot_lists: false,
                        paste_strip_class_attributes: "all",
                        paste_remove_spans: true,
                        paste_remove_styles: true,
                        paste_text_use_dialog: true,
                        //paste_text_sticky : false,
                        paste_text_linebreaktype: "<br>",
                        // for <br>
                        forced_root_block: "",
                        force_br_newlines: true,
                        force_p_newlines: false,
                        // clean code
                        //apply_source_formatting : true,
                        //convert_newlines_to_brs : true,
                        convert_fonts_to_spans: false,
                        valid_elements: "*[*]",
                        height: 450,
                        // Theme options
                        theme_advanced_buttons1: "newdocument,bold,italic,underline,justifyleft,justifycenter,justifyright,justifyfull,formatselect,fontselect,fontsizeselect",
                        theme_advanced_buttons2: "cut,copy,paste,pastetext,pasteword,search,replace,bullist,numlist,outdent,indent,blockquote,undo,redo,hr,removeformat,sub,sup,forecolor,backcolor,link,unlink,anchor,image,cleanup,code,fullscreen,preview",
                        theme_advanced_buttons3: "",
                        //preview options
                        plugin_preview_width: "950",
                        plugin_preview_height: "750",
                        //theme_advanced_buttons4 : "styleprops",
                        theme_advanced_toolbar_location: "top",
                        theme_advanced_toolbar_align: "left",
                        theme_advanced_statusbar_location: "bottom",
                        theme_advanced_font_sizes: "8=8px,9=9px,10=10px,11=11px,12=12px,13=13px,14=14px,15=15px,16=16px,18=18px,20=20px,22=22px,24=24px,26=26px,28=28px,30=30px,36=36px",
                        theme_advanced_fonts: "Arial=Arial;Comic Sans MS=Comic Sans MS;Courier=Courier;Courier New=Courier New;Georgia=Georgia;Tahoma=Tahoma;" +
                                "Times New Roman=Times New Roman;Trebuchet MS=Trebuchet MS;Lucinda Sans Unicode=Lucinda Sans Unicode;Verdana=Verdana",
                        theme_advanced_resizing: true,
                        // Example content CSS (should be your site CSS)
                        content_css: "/pms/css/tiny_mce.css",
                        //font_size_style_values : "10px,12px,13px,14px,16px,18px,20px",

                        // Drop lists for link/image/media/template dialogs
                        template_external_list_url: "/pms/js/tiny_mce_templates.js",
                        external_link_list_url: "lists/link_list.js",
                        external_image_list_url: "lists/image_list.js",
                        media_external_list_url: "lists/media_list.js",
                        // Replace values for the template plugin
                        template_replace_values: {
                            username: "Some User",
                            staffid: "991234"
                        },
                        setup: function (ed) {
                            /*ed.onChange.add(function(ed, l) {
                             editor.page.states.editor_change = true;                                               
                             });*/
                            ed.onInit.add(function (ed, l) {
                                var _height = _this.$("#area_create_template").parents(".modal-body").height();
                                var editor_heigt = _height - 350;
                                if (editor_heigt < 600) {
                                    editor_heigt = 504;
                                }
                                _this.$("#bmseditor_template_ifr").css("height", (editor_heigt) + "px");
                                _this.$("#bmseditor_template_tbl").css("height", (editor_heigt - 100) + "px");
                                if (_this.editorContent) {
                                    _tinyMCE.get('bmseditor_template').setContent(_this.editorContent);
                                }
                            })
                        }

                    });
                },
                saveTemplateName: function (obj) {
                    var _this = this;
                    var template_name_input = $(obj.target).parents(".edited").find("input");
                    var dailog_head = this.dialog;
                    var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token');
                    $(obj.target).addClass("saving");
                    $.post(URL, {type: "rename", templateName: template_name_input.val(), templateNumber: this.template_id})
                            .done(function (data) {
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    dailog_head.$("#dialog-title span").html(_this.app.encodeHTML(template_name_input.val()));
                                    _this.showHideTargetTitle();
                                    _this.app.showMessge("Templated Renamed");
                                    //_this.page.$("#template_search_menu li:first-child").removeClass("active").click();
                                    _this.modelTemplate.model.set("name", template_name_input.val());
                                }
                                else {
                                    _this.app.showAlert(_json[1], _this.$el);

                                }
                                $(obj.target).removeClass("saving");
                            });
                },
                showHideTargetTitle: function (show, isNew) {
                    if (show) {
                        this.dialog.$("#dialog-title").hide();
                        this.dialog.$("#dialog-title-input").show();
                        this.dialog.$(".tagscont").hide();
                        this.dialog.$("#dialog-title-input input").val(this.app.decodeHTML(this.dialog.$("#dialog-title span").html())).focus();
                    }
                    else {
                        this.dialog.$("#dialog-title").show();
                        this.dialog.$("#dialog-title-input").hide();
                        this.dialog.$(".tagscont").show();
                    }
                },
                TryDialog: function (obj) {
                    this.image_obj = $.getObj(obj, "a");
                    var that = this;
                    var app = this.app;
                    this.$el.parents('body').find('#merge-field-plug-wrap').hide();
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 162;
                    var dialog = this.app.showDialog({title: 'Images',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: true,
                        headerIcon: '_graphics',
                        tagRegen: true,
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    //// var _options = {_select:true,_dialog:dialog,_page:this}; // options pass to
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["userimages/userimages", 'app'], _.bind(function (pageTemplate, app) {
                        var mPage = new pageTemplate({app: app, fromDialog: true, _select_dialog: dialog, _select_page: this, callBack: _.bind(this.insertImage, this)});
                        var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                        dialog.getBody().append(mPage.$el);
                        that.app.showLoading(false, mPage.$el.parent());
                        mPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        that.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                        that.app.dialogArray[dialogArrayLength - 1].currentView = mPage; // New Dialog
                        // $('.modal .modal-body').append("<button class='ScrollToTop' style='display:none;display: block;position: relative;left: 95%;bottom: 70px;' type='button'></button>");
                        // this.$el.parents(".modal").find(".modal-footer").find(".ScrollToTop").remove();
                        //dialog.saveCallBack(_.bind(mPage.returnURL,mPage,dialog,_.bind(that.useImage,that)));
                    }, this));

                },
                insertImage: function (data) {
                    if (this.image_obj.hasClass('btn-opengallery')) {
                        this.iThumbnail.remove("file-border");
                        this.imageCheckSum = data.imgencode;
                        this.iThumbnail.find("h4").hide();
                        this.iThumbImage = data.imgthumb;
                        this.iThumbnail.find("img").attr("src", this.iThumbImage).show();
                        this.saveUserImage();
                    } else {
                        this.$el.find("#image_url").val(data.imgurl);
                    }
                    //console.log();
                },
                saveUserImage: function () {
                    var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token');
                    $.post(URL, {type: 'thumbnail', templateNumber: this.template_id,
                        imageId: this.imageCheckSum
                    })
                            .done(_.bind(function (data) {
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== 'err') {
                                    this.app.showMessge("Thumbnail Saved Successfully");
                                    this.modelTemplate.model.set("thumbURL", this.iThumbImage);
                                } else {
                                    this.app.showAlert(_json[1], $("body"), {fixed: true});
                                }
                            }, this));
                },
                deleteTemplate: function (templateNum) {
                    this.app.showLoading("Deleting Template...", this.$el, {fixed: 'fixed'});
                    var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token');
                    $.post(URL, {type: 'delete', templateNumber: templateNum})
                            .done(_.bind(function (data) {
                                this.app.showLoading(false, this.$el);
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== 'err') {
                                    if (this.options.rowtemplate) {
                                        this.page.offset = 0;
                                        this.page.callTemplates(this.page.offset, true);
                                    }
                                    this.$el.parents('.modal').find('.btn-close').click();
                                    //this.parent.$el.find("#template_search_menu li:first-child").removeClass("active").click();

                                }
                                else {
                                    this.app.showAlert(_json[1], $("body"), {fixed: true});
                                }
                            }, this));
                },
                modelSave: function () {
                    this.modelTemplate.model.set("isFeatured", this.dataObj.isFeatured);
                    this.modelTemplate.model.set("isReturnPath", this.dataObj.isReturnPath);
                    this.modelTemplate.model.set("isMobile", this.dataObj.isMobile);
                    this.modelTemplate.model.set("categoryID", this.dataObj.categoryID);

                },
                ReattachEvents: function () {
                    var copyIconTemplate = this.head_action_bar.find(".copy");
                    var _this = this;
                    var dialogArrayLength = this.app.dialogArray.length;
                    this.head_action_bar.find('.preview').remove();
                    var previewIconTemplate = $('<a class="icon preview showtooltip" data-original-title="Preview template"></a>').tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.head_action_bar = this.modal.find(".modal-header .edited  h2");
                    this.head_action_bar.append(previewIconTemplate);
                    this.dialog.$(".pointy").show();
                    if (this.dialog.$el.find('.c-current-status').length > 0) {
                        this.dialog.$el.find('.c-current-status').remove();
                    }
                    copyIconTemplate.click(_.bind(function (e) {
                        // this.rowtemplate.copyTemplate(this);
                        if (this.app.dialogArray[dialogArrayLength - 1].copyCall) {
                            this.app.dialogArray[dialogArrayLength - 1].copyCall(this);
                        } else {
                            this.copyTemplate(); // call from dashboard
                        }
                    }, this));
                    this.dialog.$('.pointy .edit').hide();
                    this.dialog.$(".pointy .edit").click(_.bind(function () {
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$("#dialog-title span").click(_.bind(function (obj) {
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$(".savebtn").click(_.bind(function (obj) {
                        this.saveTemplateName(obj)
                    }, this));

                    this.dialog.$(".cancelbtn").click(_.bind(function (obj) {
                        if (this.template_id) {
                            this.showHideTargetTitle();
                        }
                    }, this));
                    this.dialog.$(".pointy .delete").click(_.bind(function (obj) {
                        var _this = this;
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this template?",
                            callback: _.bind(function () {
                                _this.deleteTemplate();
                            }, _this)},
                        _this.dialog.$el);

                    }, this));
                    this.tagDiv.tags({app: this.app,
                        url: '/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK=' + this.app.get('bms_token'),
                        params: {type: 'tags', templateNumber: this.template_id, tags: ''}
                        , showAddButton: true,
                        tags: this.app.dialogArray[this.app.dialogArray.length - 1].tags,
                        fromDialog: this.dialog.$el,
                        callBack: _.bind(this.newTags, this),
                        typeAheadURL: "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=allTemplateTags"
                    });
                    previewIconTemplate.click(_.bind(function (e) {
                        var dialog_width = $(document.documentElement).width() - 60;
                        var dialog_height = $(document.documentElement).height() - 162;
                        var dialog = this.app.showDialog({title: 'Template Preview',
                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                            headerEditable: false,
                            headerIcon: 'dlgpreview',
                            bodyCss: {"min-height": dialog_height + "px"}
                        });
                        var preview_iframe = "https://" + this.app.get("preview_domain") + "/pms/events/viewtemp.jsp?templateNumber=" + this.template_id;
                        require(["common/templatePreview"], _.bind(function (templatePreview) {
                            var tmPr = new templatePreview({frameSrc: preview_iframe, app: this.app, frameHeight: dialog_height, prevFlag: 'T', tempNum: this.template_id});
                            dialog.getBody().append(tmPr.$el);
                            this.app.showLoading(false, tmPr.$el.parent());
                            tmPr.init();
                            var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                            tmPr.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                            dialog.$el.find('#dialog-title .preview').remove();
                        }, this));
//                    dialog.getBody().html(preview_iframe);                                         
                        e.stopPropagation();
                    }, this));
                },
                loadMEE:function(){
                    if(!this.meeEditor){
                         this.app.showLoading("Loading MEE Editor...",this.$("#area_html_editor_mee"));                         
                         this.meeEditor = true;               
                         setTimeout(_.bind(this.setMEEView,this),100);                        
                    }
                },
                setMEEView:function(){
                        var _html = "";//this.campobjData.editorType=="MEE"?$('<div/>').html(this.parent.htmlText).text().replace(/&line;/g,""):""; 
                         require(["editor/MEE"],_.bind(function(MEE){                                              
                            var MEEPage = new MEE({app:this.app,_el:this.$("#mee_editor"),html:'',saveClick:_.bind(this.saveTemplateCall,this) ,fromDialog:true,reattachEvents:_.bind(this.ReattachEvents,this)});                                    
                            this.$("#mee_editor").setChange(this.states);                
                            this.setMEE(_html);
                            this.initScroll();
                            this.app.showLoading(false,this.$("#area_html_editor_mee")); 
                        },this));  
                },
                setMEE:function(html){
                   if(this.$("#mee_editor").setMEEHTML){
                        this.$("#mee_editor").setMEEHTML(html);                        
                   } 
                   else{
                       setTimeout(_.bind(this.setMEE,this,html),200);
                   }
                },
                initScroll:function(){            
                    this.$win=this.$el.parents(".modal-body")
                    ,this.$nav = this.$('.editortoolbar')
                    ,this.$tools = this.$('.editortools')                                    
                    ,this.$editorarea =this.$('.editorbox')
                    ,this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').offset().top                
                    ,this.isFixed = 0,this.scrollChanged=false;

                    this.processScroll=_.bind(function(){                                                       
                      if(this.$("#area_html_editor_mee").height() > 0 ){ 
                        if(this.$("#area_html_editor_mee").css("display")!=="none"){  
                          var i, scrollTop = this.$win.scrollTop();
                          this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').offset().top;
                          scrollTop = scrollTop - 220;
                          if (scrollTop >= this.navTop && !this.isFixed) {
                            this.isFixed = 1
                            this.$nav.addClass('editor-toptoolbar-fixed');                            
                            this.$nav.css("width",this.$(".editorpanel").width());
                            this.$tools.addClass('editor-lefttoolbar-fixed');                        
                            this.$editorarea.addClass('editor-panel-fixed');                                                
                            this.$nav.css("top","90px");this.$tools.css("top","90px");
                          } else if (scrollTop <= this.navTop && this.isFixed) {
                            this.isFixed = 0
                            this.$nav.removeClass('editor-toptoolbar-fixed');
                            this.$nav.css("top","0px");this.$tools.css("top","0px");
                            this.$nav.css("width","100%");
                            this.$tools.removeClass('editor-lefttoolbar-fixed');                        
                            this.$editorarea.removeClass('editor-panel-fixed');                        
                          }                      
                        }
                      }
                    },this);
                    this.processScroll();
                    this.$win.on('scroll', this.processScroll);                                
                }
            });
        });