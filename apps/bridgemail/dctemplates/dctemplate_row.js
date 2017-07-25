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
                    'click .deletebtn': 'deleteTemplate',
                    'click .editbtn,.single-template': 'updateTemplate',
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
                    if (this.parent.searchString) {
                        this.$(".template-name").highlight($.trim(this.parent.searchString.searchText));
                        this.$(".tag").highlight($.trim(this.parent.searchString.searchText));
                    } else {
                        this.$(".tag").highlight($.trim(this.parent.searchTags));
                    }
                },
                showCPCEDButtons: function () {
                    var templates_html = '';
                    templates_html += '<a class="editbtn clr2"><span >Edit</span></a>';
                    templates_html += '<a class="deletebtn clr1"><span >Delete</span></a>';
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
                                        if(e[0]=="success"){
                                            _this.parent.loadDCBlocks();
                                            _this.app.showMessge('Dynamic content block deleted successfully',$('body'));
                                            
                                        }else{
                                            _this.app.showMessge(e[1],$('body'));
                                        }
                                    },
                                    error: function (e) {
                                        console.log("delete dynamicVariation failed:" + e);
                                    }

                                });
                            
                },
            });

        });