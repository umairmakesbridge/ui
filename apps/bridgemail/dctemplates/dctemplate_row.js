define(['text!dctemplates/html/template_row.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber Record View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'span3',
                tagName: 'li',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    //'click .copybtn': 'copyTemplate',
                    'click .createcamp': 'createCampaign',
                    "click .previewbtn": 'previewTemplate',
                    'click .deletebtn': 'deleteTemplate',
                    'click .editbtn,.single-template': 'updateTemplate',
                    'click .cat': 'searchByCategory',
                    'click .feat_temp': 'featureClick',
                    'click .rpath': 'returnPath',
                    'click .mobile': 'mobileClick',
                    'click .builtin': 'mksBridge',
                    'click .mail': 'mailIconClick',
                    'click .view': 'viewIconClick',
                    'click .selecttemp': 'selectTemplate',
                    'click .easyEditorCompatible': 'meeClick',
                    //'click .t-scroll p i.ellipsis':'expandTags',
                    'mouseleave .thumbnail': 'collapseTags'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.parent = this.options.sub;
                    this.app = this.parent.app;
                    this.template = _.template(template);
                    this.tempNum = '';
                    this.tagTxt = '';
                    this.selectCallback = this.options.selectCallback;
                    this.selectTextClass = this.options.selectTextClass ? this.options.selectTextClass : '';
                    this.isAdmin = this.app.get("isAdmin");
                    
                    this.tagCount = 0;
                    //this.isAdmin = 'Y';
                    this.render();
                    //this.model.on('change', this.renderRow, this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        model: this.model
                    }));
                    this.tempNum = this.model.get('templateNumber.encode');
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    var _$this = this;
                    $(window).scroll(function () {
                        if (_$this.isTrim) {
                            _$this.collapseTags(window);
                        }
                    });
                    this.initControls();

                },
                /*
                 * 
                 * Template Render on Change
                 */
                renderRow: function () {
                    //console.log('Model Changed');
                    this.render();
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {

                    this.showTagsTemplate();
                    if (this.parent.searchString) {
                        this.$(".template-name").highlight($.trim(this.parent.searchString.searchText));
                        this.$(".tag").highlight($.trim(this.parent.searchString.searchText));
                    } else {
                        this.$(".tag").highlight($.trim(this.parent.searchTags));
                    }
                },
                showTagsTemplate: function () {
                    /*this.tmPr = new tagView(
                            {parent: this,
                                app: this.app,
                                parents: this.parent,
                                rowElement: this.$el,
                                helpText: 'Templates',
                                tags: this.model.get('tags')});
                    this.$('.t-scroll').append(this.tmPr.$el);*/

                },
                showCPCEDButtons: function () {
                    var templates_html = '';
                    /*var adminTemplate = this.model.get('isAdmin') === 'Y' ? "admin-template" : "";
                    if (adminTemplate === "admin-template") {
                        this.$('.thumbnail').addClass(adminTemplate);
                        if (this.isAdmin === "Y") {
                            templates_html += '<a class="previewbtn clr4"  ><span >Preview</span></a>';
                            templates_html += '<a class="editbtn clr3" ><span >Edit</span></a>';
                            templates_html += '<a class="copybtn clr2" ><span >Copy</span></a>';
                            templates_html += '<a class="deletebtn clr1"><span >Delete</span></a>';
                        } else {
                            templates_html += '<a class="previewbtn clr2"  style="width:50%" ><span >Preview</span></a>';
                            templates_html += '<a class="copybtn clr1"  style="width:50%" ><span >Copy</span></a>';
                        }
                    }
                    else if (this.options.OnOFlag) {
                        templates_html += '<a class="previewbtn clr2"  style="width:50%"  ><span >Preview</span></a>';
                        templates_html += '<a class="deletebtn clr1" style="width:50%"><span >Delete</span></a>';
                    }
                    else {*/
//                        templates_html += '<a class="previewbtn clr4" ><span >Preview</span></a>';
                        templates_html += '<a class="editbtn clr2"><span >Edit</span></a>';
//                        templates_html += '<a class="copybtn clr2" ><span >Copy</span></a>';
                        templates_html += '<a class="deletebtn clr1"><span >Delete</span></a>';
                    //}
                    return templates_html;
                },
                CPCEDWrap: function () {
                    var returnClass = '';
                    var createCampClass = '';
                    var adminTemplate = this.model.get('isAdmin') === 'Y' ? "admin-template" : "";
                    if (adminTemplate === "admin-template") {
                        this.$('.thumbnail').addClass(adminTemplate);
                        if (this.isAdmin === "Y") {
                            returnClass = 'five s-clr6';
                            createCampClass = 'clr9';
                        } else {
                            returnClass = 'three s-clr4';
                            createCampClass = 'clr9'
                        }
                    }
                    else if (this.options.OnOFlag) {
                        returnClass = 'three s-clr4';
                        createCampClass = 'clr9';
                    }
                    else {
                        returnClass = 'five s-clr6';
                        createCampClass = 'clr9'
                    }
                    return {returnClass: returnClass, campClass: createCampClass};

                },
                previewTemplate: function (obj, tag) {

                    var bms_token = this.app.get('bms_token');
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 162;
                    var srcUrl = "https://" + this.app.get("preview_domain") + "/pms/events/viewtemp.jsp?templateNumber=" + this.model.get('templateNumber.encode');
                    var dialog = this.app.showDialog({title: 'Template Preview',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: srcUrl, app: this.app, frameHeight: dialog_height, prevFlag: 'T', tempNum: this.model.get('templateNumber.encode')});
                        dialog.getBody().append(tmPr.$el);
                        this.app.showLoading(false, tmPr.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        tmPr.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        dialog.$el.find('#dialog-title .preview').remove();
                        tmPr.init();
                    }, this));
                },
                /*copyTemplate: function () {
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
                    //require(["bmstemplates/copytemplate"], _.bind(function (copyTemplatePage) {
                        var mPage = new copyTemplatePage({templ: self, template_id: this.model.get('templateNumber.encode'), _current: this, app: this.app, templatesDialog: __dialog});
                        __dialog.getBody().append(mPage.$el);
                        this.app.showLoading(false, mPage.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        mPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(mPage.copyTemplate, mPage); // New Dialog
                        __dialog.$el.find('#dialog-title .preview').remove();
                        __dialog.saveCallBack(_.bind(mPage.copyTemplate, mPage));
                    //}, this));
                },*/
                updateTemplate: function () {
                    var _this = this.parent;
                    var self = this;
                    
                     var dialog_width = $(document.documentElement).width() - 60;
                        var dialog_height = $(document.documentElement).height() - 182;
                        var dialog = 
                            this.app.showDialog({title: this.model.get('label'),
                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                            headerEditable: false,
                            headerIcon: 'dctemplate',
                            bodyCss: {"min-height": dialog_height + "px"},
                            tagRegen: false,
                            buttons: {saveBtn: {text: 'Save'}}
                        });
                        this.app.showLoading("Loading...", dialog.getBody());  
                       
                    this.getDynamicBlock(dialog);
                    
                },
                getDynamicBlock : function(dialog){
                       var _this = this;
                       var _parent = this.parent;
                       var URL = "/pms/io/publish/getDynamicVariation/?BMS_REQ_TK="+this.app.get('bms_token')+"&isGallery=Y&type=get&dynamicNumber="+this.model.get('dynamicNumber.encode');
                       jQuery.getJSON(URL,  function(tsv, state, xhr){
                           if(xhr && xhr.responseText){                                                       
                                var _json = jQuery.parseJSON(xhr.responseText);                                                                                               
                                if(_this.app.checkError(_json)){
                                    return false;
                                 }
                                 _parent.dynamicData = _json;
                                 _parent.loadDCSingleTemplate(dialog);
                               
                           }
                     }).fail(function() { console.log( "error in loading popular tags for templates" ); });
                   },
                deleteTemplate: function () {
                    this.app.showAlertDetail({heading: 'Confirm Deletion',
                        detail: "Are you sure you want to delete this '"+this.model.get('label')+"' block?",
                        callback: _.bind(function () {
                            this.deleteCall(this.model.get('dynamicNumber.encode'));
                        }, this)},
                    $('body'));
                },
                deleteCall: function (dynamicNumber) {
                                var url = "/pms/io/publish/saveDynamicVariation/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=delete&dynamicNumber=" + dynamicNumber+"&isGlobal=Y";
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
                                            _this.parent.loadDCBlocks();
                                            _this.app.showMessge('Dynamic content block deleted successfully',$('body'));
                                            
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
                createCampaign: function (obj) {
                    if (this.selectCallback) {
                        this.selectCallback(obj);
                    }
                },
                selectTemplate: function (obj) {
                    if (this.selectCallback) {
                        this.selectCallback(obj);
                    }
                },
                /*Search on Different icon*/
                searchByCategory: function (obj) {
                    var cat = $.getObj(obj, "a");
                    this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                    this.parent.$('#search-template-input').val('');
                    this.parent.$('#clearsearch').hide();
                    this.parent.loadTemplates('search', 'category', {category_id: this.model.get('categoryID')});
                },
                featureClick: function () {
                    this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                    this.parent.$('#search-template-input').val('');
                    this.parent.$('#clearsearch').hide();
                    this.parent.loadTemplates('search', 'featured');
                },
                returnPath: function () {
                    this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                    this.parent.$('#search-template-input').val('');
                    this.parent.$('#clearsearch').hide();
                    this.parent.loadTemplates('search', 'returnpath');
                },
                mobileClick: function () {
                    this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                    this.parent.$('#search-template-input').val('');
                    this.parent.$('#clearsearch').hide();
                    this.parent.loadTemplates('search', 'mobile');
                },
                mksBridge: function () {
                    this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                    this.parent.$('#search-template-input').val('');
                    this.parent.$('#clearsearch').hide();
                    this.parent.loadTemplates('search', 'admin', {user_type: 'A'});
                },
                mailIconClick: function () {
                    this.parent.$("#template_search_menu li:first-child").click();
                },
                viewIconClick: function () {
                    this.parent.$("#template_search_menu li:nth-child(4)").click();
                },
                meeClick: function () {
                    this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                    this.parent.$('#search-template-input').val('');
                    this.parent.$('#clearsearch').hide();
                    this.parent.loadTemplates('search', 'easyeditor');
                }


            });

        });