define(['text!dctemplates/html/dctemplate.html', 'bms-dragfile'],
        function (template) {
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
                    'click #myTab li': 'loadEditor'
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
                    this.createTempOnly = this.options.createTempOnly;
                    this.isEasyEditorCompatibleFlag = true;
                    this.$el.html(this.template({}));
                    this.page = this.options.template;
                    this.editor_change = false;
                    this.editorContentMEE = "";
                    this.meeView = null;
                    if (this.options.rowtemplate) {
                        this.modelTemplate = this.options.rowtemplate;
                    }

                    this.dialog = this.options.dialog;
                    this.template_id = this.page.template_id;
                    this.dynamicData = this.options.dynamicData;
                    this.meeEditor = false;
                    this.tinymceEditor = false;
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
                    //this.modal = this.$el.parents(".modal");
                    //this.tagDiv = this.modal.find(".tagscont");
                    
                    
                    this.loadEditor();
                    
                    
                    this.imageval = null;
                    this.$('#file_control').attr('title', '');
                    this.dialog.$(".dialog-title").html(this.dynamicData.label).attr("data-original-title", "Click to rename").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.dialog.$(".pointy .edit").attr("data-original-title", "Edit Dynamic Block").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.dialog.$(".pointy .delete").attr("data-original-title", "Delete Dynamic Block").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.dialog.$('#dialog-title').parent().addClass('dc-header-template');
                    this.dialog.$('.modal-header').addClass('header-editable-highlight'); 
                    
                    this.dialog.$(".pointy .copy").hide();
                    this.iThumbnail = this.$(".droppanel");
                    this.iThumbImage = null;
                    this.$("textarea").css("height", (this.$("#area_create_template").height() - 270) + "px");
                    
                    
                    this.dialog.$(".pointy .edit").click(_.bind(function () {
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$("#dialog-title span").click(_.bind(function (obj) {
                        this.showHideTargetTitle(true);
                    }, this))

                    this.dialog.$(".savebtn").click(_.bind(function (obj) {
                        //this.saveTemplateName(obj)
                        this.saveDCName(obj)
                    }, this));

                    this.dialog.$(".cancelbtn").click(_.bind(function (obj) {
                            this.showHideTargetTitle();
                    }, this));
                    this.dialog.$(".pointy .delete").click(_.bind(function (obj) {
                        var _this = this;
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this dynamic block?",
                            callback: _.bind(function () {
                                _this.deleteTemplate();
                            }, _this)},
                        _this.dialog.$el);

                    }, this));
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                loadEditor: function (obj) {
                    //var target_li =$.getObj(obj,"li");   
                    if (obj === 'editor') {
                        this.initEditor();

                    }
                    else {
                        this.loadMEE();
                    }
                },
                
                saveDyanamicGalleryCall: function (obj) {
                    //console.log(this.meeView)
                    if(obj){
                        this.meeView.showSaveMsgNow = true;
                        this.dialog.getBody().parent().attr('data-dcsave','true');
                        this.app.showLoading("Saving Dynamic Block...", this.dialog.getBody().parent());
                    }
                    this.meeView._$el.find('.lastSaveInfo').html('<i class="icon time"></i>Last Saved: ' + moment().format('h:mm:ss a'));
                    this.$("#mee_editor").saveDCfromCamp();
                    
                },
                saveDCName: function (obj) {
                             var _this = this;
                             var template_name_input = $(obj.target).parents(".edited").find("input");
                             var dailog_head = this.dialog;
                             $(obj.target).addClass("saving");
                             $.ajax({
                                    url: "/pms/io/publish/saveDynamicVariation/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=relabel&label=" + template_name_input.val() + "&dynamicNumber=" + this.dynamicData['dynamicNumber.encode'],
                                    //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                    type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: false,
                                    success: function (e) {
                                        if(e[0]=="success"){
                                            dailog_head.$("#dialog-title span").html(_this.app.encodeHTML(template_name_input.val()));
                                            _this.showHideTargetTitle();
                                            _this.app.showMessge("Dynamic Block Renamed");
                                            _this.options.template.$el.find('.refresh_btn').trigger('click');
                                            this.dynamicData['label'] = template_name_input.val();
                                        }else{
                                            _this.app.showAlert(e[1], _this.$el);
                                        }
                                        
                                        //LoadBuildingBlocks();
                                    },
                                    error: function (e) {

                                    }

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
                deleteTemplate: function () {
                    this.app.showLoading("Deleting Dynamic...", this.$el, {fixed: 'fixed'});
                  
                    var url = "/pms/io/publish/saveDynamicVariation/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=delete&dynamicNumber=" + this.dynamicData['dynamicNumber.encode']+"&isGlobal=Y";
                                var _this = this;
                                $.ajax({
                                    url: url,
                                    //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                    type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: true,
                                    success: function (e) {
                                        //LoadBuildingBlocks();
                                        if(e[0]=="success"){
                                            /*if(args.mee_view){
                                                args.mee_view.app.showMessge('Dynamic content block deleted successfully',$('body'));
                                            }*/
                                            _this.options.template.$el.find('.refresh_btn').trigger('click');
                                            _this.app.showMessge('Dynamic content block deleted successfully',$('body'));
                                            _this.dialog.hide();
                                            /*if(args.allOptions){
                                                args.allOptions.saveCallBack();
                                            }*/
                                        }else{
                                            _this.app.showMessge(e[1],$('body'));
                                        }
                                    },
                                    error: function (e) {
                                        console.log("delete dynamicVariation failed:" + e);
                                    }

                                });
                },
                ReattachEvents: function () {
                    
                    var _this = this;
                    var dialogArrayLength = this.app.dialogArray.length;
                    
                    this.dialog.$(".dialog-title").html(this.dynamicData.label).attr("data-original-title", "Click to rename").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.dialog.$(".pointy .edit").attr("data-original-title", "Edit Dynamic Block").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.dialog.$(".pointy .delete").attr("data-original-title", "Delete Dynamic Block").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.dialog.$('#dialog-title').parent().addClass('dc-header-template');
                    this.dialog.$('.modal-header').addClass('header-editable-highlight'); 
                    
                    this.dialog.$(".pointy .copy").hide();
                    this.dialog.$(".pointy .edit").click(_.bind(function () {
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$("#dialog-title span").click(_.bind(function (obj) {
                        this.showHideTargetTitle(true);
                    }, this))

                    this.dialog.$(".savebtn").click(_.bind(function (obj) {
                        //this.saveTemplateName(obj)
                        this.saveDCName(obj)
                    }, this));
                    this.dialog.$(".pointy .delete").click(_.bind(function (obj) {
                        var _this = this;
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this dynamic block?",
                            callback: _.bind(function () {
                                _this.deleteTemplate();
                            }, _this)},
                        _this.dialog.$el);

                    }, this));
                    
                    
                },
                loadMEE: function () {
                    if (!this.meeEditor) {
                        this.app.showLoading("Loading MEE Editor...", this.$("#area_html_editor_mee"));
                        this.meeEditor = true;
                        setTimeout(_.bind(this.setMEEView, this), 100);
                    }
                },
                setMEEView: function () {
                    var _html = this.editorContent !== "" ? $('<div/>').html(this.editorContentMEE).text().replace(/&line;/g, "") : "";
                    var topaccordian = 31; // Scroll Top Minus from Body
                    require(["editor/MEE"], _.bind(function (MEE) {
                        var MEEPage = new MEE({app: this.app, isDcTemplate:true,isDCTemplateContentSet:false,margin: {top: 236, left: 0},dynamicData : this.dynamicData,_el: this.$("#mee_editor"), parentWindow: this.$el.parents(".modal-body"), scrollTopMinus: topaccordian, html: '', saveClick: _.bind(this.saveDyanamicGalleryCall, this), fromDialog: true, saveBtnText: 'Save Template Body', previewCallback: _.bind(this.previewCallback, this)});
                        this.$("#mee_editor").setChange(this);
                        this.meeView = MEEPage;
                        this.setMEE(_html);
                        this.initScroll();

                    }, this));
                },
                setMEE: function (html) {
                    if (this.$("#mee_editor").setMEEHTML) {
                        this.$("#mee_editor").setMEEHTML(html);
                        this.app.showLoading(false, this.$("#area_html_editor_mee"));
                    }
                    else {
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
                                    this.$nav.addClass('editor-toptoolbar-fixed  editor-toptoolbar-fixed-border');
                                    this.$nav.css("width", this.$(".editorpanel").width());
                                    this.$tools.addClass('editor-lefttoolbar-fixed');
                                    this.$editorarea.addClass('editor-panel-fixed');
                                    this.$nav.attr("style", "top:70px !important");
                                    this.$tools.attr("style", "top:70px !important");
                                    this.$nav.css("width", this.$(".editorpanel").width());
                                    this.scrollfixPanel();                                    
                                    this.$("#mee_editor").setAccordian(0);
                                } else if (scrollTop <= (this.navTop + 12) && this.isFixed) {
                                    this.isFixed = 0
                                    this.$nav.removeClass('editor-toptoolbar-fixed  editor-toptoolbar-fixed-border');
                                    if(this.$nav.find('.disabled-toolbar').css('visibility')=='hidden'){
                                        this.$nav.css("margin-bottom", "0");
                                         this.$el.find('#mee-iframe').contents().find('.mainTable').css('margin-top','45px');
                                    }else{
                                        this.$nav.css("margin-bottom", "45px");
                                        this.$el.find('#mee-iframe').contents().find('.mainTable').css('margin-top','0');
                                    }
                                    this.$nav[0].style.removeProperty("top");
                                    this.$tools.css("top", "0px");
                                    this.$nav.css("width", "100%");
                                    this.$tools.removeClass('editor-lefttoolbar-fixed');
                                    this.$editorarea.removeClass('editor-panel-fixed');
                                    var lessBy = this.navTop - scrollTop;
                                    this.$("#mee_editor").setAccordian(lessBy);
                                    
                                }
                                
                                var lessBy = this.navTop - scrollTop;
                                if(lessBy>0){
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

                        var topaccordian = (parseInt(this.$el.parents(".modal-body").find('.template-wrap').outerHeight()) + 31); // h3 + padding
                        var scrollTop = scrollTop - topaccordian;

                        if (scrollTop >= (this.navTop - 270) && scrollTop > 0) {
                            this.$editorarea.removeClass('editor-panel-zero-padding');
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', scrollTop + 'px');
                            this.$el.find('.editortoolbar').css('margin-bottom','0');
                            this.$el.find('#mee-iframe').contents().find(".mainTable").css("margin-top","45px");
                        } else if (this.$tools.hasClass('editor-lefttoolbar-fixed')) {
                            this.$editorarea.addClass('editor-panel-zero-padding');
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', '48px');
                        }
                        else {
                            this.$editorarea.addClass('editor-panel-zero-padding');
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', '0');
                        }

                    }, this));
                },
                previewCallback: function () {
                    this.head_action_bar.find('.preview').trigger('click');
                }
            });
        });