/* 
 * Module Name : Recipients Lists
 * Author: Pir Abdul Wakeel
 * Date Created: 05 May 2014
 * Description: this view is called from contacts/recipients, so changing this may cause problem in recipients list.
 * 
 **/

define(['text!tags/html/recipients_tags.html', 'tags/collections/recipients_tags', 'tags/recipients_tag', 'tags/models/recipients_tag', 'app', 'bms-addbox', 'bms-tags','jquery.searchcontrol'],
        function(template, tagsCollection, tagView, tagModel, app, addBox, tags,search) {
            'use strict';
            return Backbone.View.extend({
                className: 'div',
                events: {
                    //"keyup #tags_search": "search",
                    "click  #clearsearch": "clearSearch",
                    "click .closebtn": "closeContactsListing"
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.request = null;
                    this.app = app;
                    this.active_ws = "";
                    this.render();
                },
                render: function(search) {
                    this.$el.html(this.template({}));
                    this.loadTags();
                    this.$(".add-tag").addbox({app: this.app, placeholder_text: 'Enter new tag name', addCallBack: _.bind(this.addTags, this)});
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.active_ws = this.$el.parents(".ws-content");
                     this.$el.find('.input-append').searchcontrol({
                            id:'tags_search',
                            width:'300px',
                            height:'22px',
                            placeholder: this.$el,
                            gridcontainer: 'tagslist',
                            showicon: 'yes',
                            iconsource: 'list'
                     });
                },
                loadTags: function() {
                    var _data = {};
                    var that = this;
                    // _data['offset'] = this.offset;
                    if (this.searchText) {
                        _data['searchText'] = this.searchText;
                        that.showSearchFilters(this.searchText);
                    }
                    var that = this; // internal access
                    _data['type'] = 'subscriberTagCountList';
                    this.objTags = new tagsCollection();

                    this.app.showLoading('Loading Tags...', this.el);
                    this.request = this.objTags.fetch({data: _data, success: function(data) {
                            _.each(data.models, function(model) {
                                that.$el.find('#tagslist ul').append(new tagView({model: model, app: app}).el);
                            });
                            that.$("#total_tags .badge").html(that.objTags.total);
                            that.app.showLoading(false, that.el);
                        }});
                },
                search: function(ev) {
                    this.searchText = '';
                    this.searchTags = '';
                    var that = this;
                    var code = ev.keyCode ? ev.keyCode : ev.which;
                    var nonKey = [17, 40, 38, 37, 39, 16];
                    if ((ev.ctrlKey == true) && (code == '65' || code == '97')) {
                        return;
                    }
                    if ($.inArray(code, nonKey) !== -1)
                        return;
                    var text = $(ev.target).val();
                    text = text.replace('Sale Status:', '');
                    text = text.replace('Tag:', '');


                    if (code == 13 || code == 8) {
                        that.$el.find('#clearsearch').show();

                        this.searchText = text;
                        that.loadTags();
                    } else if (code == 8 || code == 46) {

                        if (!text) {
                            that.$el.find('#clearsearch').hide();
                            this.searchText = text;
                            that.loadTags();
                        }
                    } else {
                        that.$el.find('#clearsearch').show();

                        clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                        that.timer = setTimeout(function() { // assign timer a new timeout 
                            if (text.length < 2)
                                return;
                            that.searchText = text;
                            that.loadTags();
                        }, 500); // 2000ms delay, tweak for faster/slower
                    }
                }, clearSearch: function(ev) {
                    $(ev.target).hide();
                    $(".search-control").val('');
                    this.total = 0;
                    this.searchText = '';
                    this.searchTags = '';
                    this.total_fetch = 0;
                    this.$("#total_lists .badge").html("tags found");
                    this.loadTags();
                },
                addTags: function(data) {
                    var that = this;
                    var add_box = this.$(".add-tag").data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    var URL = "/pms/io/campaign/saveCampaignData/";
                    var post_data = {BMS_REQ_TK: that.app.get('bms_token'), type: "tags", tags: data};
                    $.post(URL, post_data)
                            .done(_.bind(function(data) {
                                add_box.dialog.find(".btn-add").removeClass("saving");
                                add_box.dialog.find(".input-field").val("");
                                add_box.hideBox();
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    var newModel = new tagModel({
                                        tag: data,
                                        subCount: 0,
                                    });
                                    that.objTags.add(newModel);
                                    var last_model = that.objTags.last();
                                    that.$el.find('#tagslist tbody').prepend(new tagView({model: last_model, app: app}).el);
                                    that.$el.find("#tagslist tbody tr:first").slideDown("slow");
                                }
                                else {
                                    that.app.showAlert(_json[1], $("body"), {fixed: true});
                                }
                            }, this));



                },
                closeContactsListing: function() {

                    $("#div_pageviews").empty('');
                    $("#div_pageviews").hide();
                }

            });
        });