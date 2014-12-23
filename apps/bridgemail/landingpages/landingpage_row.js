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
                    'click .link-page' : 'linkPageDialog',
                    'click .taglink': 'tagClick',
                    'click .category-click': 'categoryClick'
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
                        if(this.sub.actionType=="T"){
                            this.$(".taglink").highlight($.trim(this.sub.searchTxt));
                        }
                        else if(this.sub.actionType=="C"){
                            this.$(".category-click").highlight($.trim(this.sub.searchTxt));
                        }
                        else {                             
                            this.$(".edit-page").highlight($.trim(this.sub.searchTxt));
                            this.$(".taglink").highlight($.trim(this.sub.searchTxt));
                            this.$(".category-click").highlight($.trim(this.sub.searchTxt));
                        }
                    } else {
                        this.$(".taglink").highlight($.trim(this.sub.tagTxt));
                    }

                },
                publishPage: function(){
                    this.app.showLoading("Publishing landing page...",this.$el.parents(".ws-content.active"));
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'changeStatus',pageId:this.model.get("pageId.encode"),status:'P'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el.parents(".ws-content.active"));   
                           var _json = jQuery.parseJSON(data);        
                           if(!_json.err){
                               this.app.showMessge("Landing page is published.");
                               this.sub.headBadge();                                                                
                               this.sub.getLandingPages();                                                                
                           }
                           else{
                               this.app.showAlert(_json.err1,$("body"),{fixed:true}); 
                           }
                   },this));
                },
                unpublishPage: function(){
                    this.app.showLoading("Unpublishing landing page...",this.$el);
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'changeStatus',pageId:this.model.get("pageId.encode"),status:'D'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                              this.app.showMessge("Landing page is Unpublished.");
                              this.sub.headBadge();                                                                
                              this.sub.getLandingPages();                                                                
                           }
                           else{
                              this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                openPage: function () {
                    var editable = true;
                    if(this.model.get("status")!=="D"){
                        editable = false;
                    }                
                    this.app.mainContainer.openLandingPage({"id":this.model.get("pageId.encode"),"checksum":this.model.get("pageId.checksum"),"parent":this.sub,editable:editable});
                },
                copyPage: function ()
                {
                    var page_id = this.model.get('pageId.encode');
                    var dialog_title = "Copy Landing Page";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Create Page'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    this.sub.total_fetch = 0;
                    require(["landingpages/copylandingpage"], _.bind(function (page) {
                        var mPage = new page({page: this, copydialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        mPage.init();
                        dialog.saveCallBack(_.bind(mPage.copyPage, mPage));
                    }, this));
                },
                previewPage: function () {                    
                    var camp_obj = this.sub;                                        
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = camp_obj.app.showDialog({title: 'Preview of landing page &quot;' + this.model.get('name') + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading Page...", dialog.getBody());
                    var preview_url =  this.app.decodeHTML(this.model.get('previewURL')).replace("http","https");
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height}); // isText to Dynamic
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                },
                linkPageDialog: function(){                    
                    var dialog_title = "Link of Landing Page &quot;" + this.model.get('name') + "&quot;";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "140px"},
                        headerIcon: 'link'
                    });
                    var html = '<div style="margin-top:0px;" class="blockname-container">'
                        html += '<div class="label-text">Page Link:</div>'
                        html += '<div class="input-append sort-options blockname-container"><div class="inputcont">'  
                        html += '<input type="text" id="page_link" value="'+this.app.decodeHTML(this.model.get("publishURL"))+'" style="width:558px" readonly="readonly">'
                        html += '</div></div>'
                        html += '<div style="font-size: 12px;margin-top:10px">'
                        var key = navigator.platform.toUpperCase().indexOf("MAC")>-1 ? "Command" : "Ctrl";
                        html += '<i>Press '+key+' + C to copy link.</i>'
                        html += '</div> </div>'
                        
                        html = $(html);
                        dialog.getBody().append(html);
                        dialog.getBody().find("#page_link").select().focus();
                        dialog.getBody().find("#page_link").mousedown(function(event){
                            $(this).select().focus();
                             event.stopPropagation();
                             event.preventDefault();
                        })
                        
                },
                deletePageDialoge: function () {                                      
                    var page_id = this.model.get('pageId.encode')
                    if (page_id) {
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this page?",
                            callback: _.bind(function () {                                
                                this.deletePage();
                            }, this)},
                        $('body'));                      
                    }
                },
                deletePage: function ()
                {
                    var camp_obj = this.sub;                   
                    var URL = '/pms/io/publish/saveLandingPages/?BMS_REQ_TK=' + camp_obj.app.get('bms_token');
                    camp_obj.app.showLoading("Deleting Page...", camp_obj.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                    $.post(URL, {type: 'delete', pageId: this.model.get('pageId.encode')})
                            .done(_.bind(function (data) {
                                this.app.showLoading(false, camp_obj.$el.parents(".ws-content.active"));
                                var _json = jQuery.parseJSON(data);
                                if(this.app.checkError(_json)){
                                 return false;
                                 }
                                if (_json[0] !== "err") {
                                    this.app.showMessge("Page has been deleted successfully!");                                    
                                    this.$el.fadeOut(_.bind(function(){
                                       this.$el.remove();
                                    },this));    
                                    camp_obj.headBadge();
                                    var total_count = camp_obj.$("#total_templates .badge");
                                    total_count.html(parseInt(total_count.text())-1);
                                    if ($("#wstabs li[workspace_id=landingpage_" + this.model.get('pageId.checksum') + "]").length) {
                                        var wp_id = $("#wstabs li[workspace_id=landingpage_" + this.model.get('pageId.checksum') + "]").attr('id').split("_")[2];
                                        $("#wp_li_" + wp_id + ",#workspace_" + wp_id).remove();
                                    }
                                }
                                else {
                                    camp_obj.app.showAlert(_json[1], camp_obj.$el.parents(".ws-content.active"));
                                }

                            }, this));
                },
                tagClick: function (obj) {
                    this.sub.taglinkVal = true;
                    this.sub.actionType = "T";
                    this.tagTxt = $(obj.currentTarget).text();
                    this.app.initSearch(obj, this.sub.$el.find("#list-search"));
                },
                categoryClick: function(obj){
                    this.trigger('categorySearch',$(obj.target).text());                    
                }

            });
        });