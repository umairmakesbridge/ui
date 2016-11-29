/* 
 * Name: Links Views
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Display All links
 * Dependency: LINKS COLLECTION, LINK VIEW, LINKS HTML
 */

define(['reports/summary/collections/links', 'reports/summary/views/link', 'text!reports/summary/html/links.html'],
        function (Links, viewLinks, template) {
            'use strict';
            return Backbone.View.extend({
                className: 'toplinks',
                events: {
                    "click .view-all": "viewAll",
                    "click .download-csv": "callMappingDialog"
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.campNum = this.options.campNum;
                    this.type = "topLinks";
                    this.total = 0;
                    this.objLinks = new Links();
                    this.render();
                },
                render: function () {
                    var that = this;
                    this.$el.html(this.template({}));
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    var _data = {};
                    _data['type'] = this.type;
                    _data['campNum'] = this.campNum;
                    this.objLinks.fetch({data: _data, success: function (data) {
                            var counter = 0; // show only 5
                            var uniqueSubscribersCount = 0;
                            that.$el.find(".view-all").html("total " + data.total + " links");
                            if (data.total) {
                                that.$el.find(".view-all").unbind("click");
                            }
                            that.total = data.total;
                            _.each(data.models, function (model) {
                                if (counter < 5) {
                                    var linkView = new viewLinks({model: model, app: that.options.app, campNum: that.campNum, clicks: that.options.clickCount});
                                    that.$el.append(linkView.el);
                                    linkView.on('linkDownloadClick', _.bind(that.openMappingDialog, that));
                                    uniqueSubscribersCount = uniqueSubscribersCount + parseFloat(model.get("clickCount"));
                                }
                                counter = counter + 1;

                            });
                            
                            if(uniqueSubscribersCount==0){
                                that.$(".download-csv").addClass("disabled-csv-download")
                            }
                        }});
                },
                viewAll: function (ev) {

                    if (this.total <= 0)
                        return;
                    var dialog_width = 80;
                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.options.app.showDialog(
                    {
                        title: 'Top Links',
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'link24',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    var that = this;
                    dialog.$el.find('.modal-body').addClass('toplinks');
                    this.options.app.showLoading("Loading...", dialog.getBody());
                    dialog.getBody().append($("<div class='all-links'></div>"))
                    dialog.getBody().find(".all-links").append("<div><strong class='badge'>" + this.total + "</strong>  <span>links found</span></div>");
                    _.each(this.objLinks.models, function (model) {
                        var linkView = new viewLinks({model: model, app: that.options.app, campNum: that.campNum, clicks: that.options.clickCount});                        
                        dialog.getBody().find(".all-links").append(linkView.el);                    
                        linkView.on('linkDownloadClick', _.bind(that.openMappingDialog, that));
                    });
                    var dialogArrayLength = that.options.app.dialogArray.length; // New Dialog
                    dialog.getBody().find(".all-links").addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                    this.options.app.showLoading(false, dialog.getBody());

                },
                callMappingDialog: function (e) {
                    if($(e.target).hasClass("disabled-csv-download")){
                        return false;
                    }
                    var options = {type: "allArticle", campNum: this.campNum}
                    this.trigger("linksDownloadClick", options);
                },
                openMappingDialog: function (options) {
                    this.trigger("linksDownloadClick", options);
                }
            });
        });