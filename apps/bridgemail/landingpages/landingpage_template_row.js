define(['text!landingpages/html/landingpage_template_row.html', 'jquery.highlight'],
        function (template, highlighter) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Landing page template row View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'landingpage-template-box',
                tagName: 'tr',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .use-page': 'usePage',
                    'click .edit-page': 'previewPage',
                    "click .preview-page": 'previewPage',
                    'click .taglink': 'tagClick',
                    'click .cstatus': 'categoryClick'
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
                 * @returns Time Show
                 */
                getTimeShow: function () {
                    var datetime = '';
                    var dtHead = '';
                    var dateFormat = '';
                    
                    dtHead = 'Last Edited';
                    if (this.model.get('updationDate'))
                        datetime = this.model.get('updationDate');
                    else
                        datetime = this.model.get('creationDate');
                    
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
                    if (this.sub.templateSearchTxt) {
                        if(this.sub.actionTypeTemplate=="T"){
                            this.$(".taglink").highlight($.trim(this.sub.templateSearchTxt));
                        }
                        else if(this.sub.actionTypeTemplate=="C"){
                            this.$(".cstatus").highlight($.trim(this.sub.templateSearchTxt));
                        }
                        else {                             
                            this.$(".edit-page").highlight($.trim(this.sub.templateSearchTxt));
                            this.$(".taglink").highlight($.trim(this.sub.templateSearchTxt));
                            this.$(".cstatus").highlight($.trim(this.sub.templateSearchTxt));
                        }
                    } else {
                        this.$(".taglink").highlight($.trim(this.sub.tagTxt));
                    }

                },
                openPage: function () {
                    var editable = true;
                    if(this.model.get("status")!=="D"){
                        editable = false;
                    }                
                    this.app.mainContainer.openLandingPage({"id":this.model.get("pageId.encode"),"checksum":this.model.get("pageId.checksum"),"parent":this.sub,editable:editable});
                },
                usePage: function(){
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Enter name of your  Landing Page',
                      buttnText: 'Create',
                      bgClass :'landingpage-tilt',
                      plHolderText : 'Enter landing page name here',
                      emptyError : 'Landing page name can\'t be empty',
                      createURL : '/pms/io/publish/saveLandingPages/',
                      fieldKey : "name",
                      postData : {type:'clone',BMS_REQ_TK:this.app.get('bms_token'),pageId:this.model.get("pageId.encode")},
                      saveCallBack :  _.bind(this.createPage,this)
                    });                  
                },
                createPage: function(txt,json){
                    if(json[0]=="success"){
                        this.app.mainContainer.openLandingPage({"id":json[1],"checksum":json[2],"parent":this.sub,editable:true});        
                        this.sub.headBadge();
                        this.sub.getLandingPages();
                    }
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
                tagClick: function (obj) {
                    this.sub.taglinkVal = true;
                    this.sub.actionTypeTemplate = "T";
                    this.tagTxt = $(obj.currentTarget).text();
                    this.app.initSearch(obj, this.sub.$el.find("#list-search"));
                },
                categoryClick: function(obj){
                     this.trigger('categoryTemplateSearch',$(obj.target).text());            
                }

            });
        });