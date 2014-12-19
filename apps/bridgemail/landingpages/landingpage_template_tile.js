define(['text!landingpages/html/landingpage_template_tile.html', 'moment', 'jquery.highlight', 'common/tags_row', 'jquery.customScroll'],
        function (template, moment, highlighter, tagView) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Nurture track View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'li',
                className: 'spane3',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .use-track': 'useTemplate',
                    'click .page-view': 'pageView',
                    'click .view-template': 'pageView'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.parent = this.options.sub
                    this.app = this.parent.app;
                    this.template = _.template(template);
                    this.isTrim = false;
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        model: this.model,
                        ntDate: this.getDate()
                    }));
                    var _$this = this;
                    $(window).scroll(function () {
                        if (_$this.isTrim) {
                            _$this.collapseTags(window);
                        }
                    });
                    this.initControls();

                },
                /**
                 * Render Row view on page.
                 */
                renderRow: function () {

                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.showTagsTemplate();
                    if (this.parent.templateSearchTxt) {
                        this.$(".view-template").highlight($.trim(this.parent.templateSearchTxt));
                        this.$(".t-scroll").highlight($.trim(this.parent.templateSearchTxt));
                    }
                },
                showTagsTemplate: function () {
                    this.tmPr = new tagView(
                    {parent: this,
                        app: this.app,
                        parents: this.parent,
                        type: 'NT',
                        tagSearchCall: _.bind(this.tagSearch, this),
                        rowElement: this.$el,
                        helpText: 'Tracks',
                        tags: this.model.get('tags')});
                    this.$('.t-scroll').append(this.tmPr.$el);
                },
                tagSearch: function (val) {
                    this.trigger('tagclicktile', val);
                    return false;
                },
                getDate: function () {
                    var dateUpdated = this.model.get('updationDate') ? this.model.get('updationDate') : this.model.get('creationDate');
                    var _date = moment(dateUpdated, 'M-D-YY');
                    return _date.format("DD MMM YYYY")
                },
                pageView: function () {                    
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Preview of template &quot;' + this.model.get('name') + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading Preview...", dialog.getBody());
                    var preview_url =  this.app.decodeHTML(this.model.get('previewURL')).replace("http","https");
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height}); // isText to Dynamic                        
                        dialog.getBody().append(tmPr.$el);                        
                        this.app.showLoading(false, dialog.getBody());
                        tmPr.init();
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        tmPr.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        dialog.$el.find('#dialog-title .preview').remove();
                    }, this));
                                                           
                },
                ReattachEvents: function(){
                    
                },
                useTemplate: function(){
                     var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Template HTML...", this.parent.dialog.getBody().parents(".modal"));
                    var URL = "/pms/io/publish/getLandingPages/?BMS_REQ_TK=" + bms_token + "&pageId=" + this.model.get('pageId.encode') + "&type=get";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }                                                  
                        this.app.showLoading(false, this.parent.dialog.getBody().parents(".modal"));
                        var html = $('<div/>').html(_json.html).text().replace(/&line;/g,"");                        
                        this.parent.$("#mee_editor").setMEEHTML(html);   
                        this.parent.dialog.hide();
                    },this))  
                }

            });
        });