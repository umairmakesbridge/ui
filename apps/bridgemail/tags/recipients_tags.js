/* 
 * Module Name : Recipients Tags
 * Author: Pir Abdul Wakeel
 * Date Created: 05 May 2014
 * Description: Recipients Tags
 * 
 **/

define(['text!tags/html/recipients_tags.html', 'tags/collections/recipients_tags', 'tags/recipients_tag', 'tags/models/recipients_tag', 'app', 'bms-addbox', 'bms-tags','jquery.searchcontrol'],
        function(template, tagsCollection, tagView, tagModel, app, addBox, tags,search) {
            'use strict';
            return Backbone.View.extend({
                className: 'div',
                events: {
                    "keyup #tags_search": "search",
                    "click  #clearsearch": "clearSearch",
                    "click .closebtn": "closeContactsListing",
                    "click .refresh_btn":function(){
                        this.app.addSpinner(this.$el);
                        this.loadTags();
                    }
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
                      
                },
                loadTags: function() {
                    var _data = {};
                    var that = this;
                    // _data['offset'] = this.offset;
                    var that = this; // internal access
                    _data['type'] = 'subscriberTagCountList';
                    that.$el.find('#tagslist ul').children().remove();
                    this.objTags = new tagsCollection();
                    this.app.showLoading('Loading Tags...', this.el);
                    this.request = this.objTags.fetch({data: _data, success: function(data) {
                            _.each(data.models, function(model) {
                                that.$el.find('#tagslist ul').append(new tagView({model: model, app: app}).el);
                            });
                             /*-----Remove loading------*/
                             that.app.removeSpinner(that.$el);
                             /*------------*/
                            that.$("#total_tags .badge").html(that.objTags.total);
                            that.app.showLoading(false, that.el);
                        }});
                },
                search: function(ev) {
                    
                    if ($(ev.target).val().length > 0) {
                         this.$el.find('#clearsearch').show();
                        this.$el.find(".action").show().filter(function () {
                          return $(this).find('.tag span').text().toLowerCase().indexOf($(ev.target).val().toLowerCase()) == -1;
                        }).hide();
                    }
                    else {
                        this.$el.find('#clearsearch').hide();
                        this.$el.find(".action").show();
                    }
                    var total = $('#tagslist ul li:visible').size()
                    var searchText = $(ev.target).val();
                    if(searchText){
                        this.$("#total_tags span").html("Tag(s) found for <b> \""+searchText+"\"</b>"); 
                    }else{
                        this.$("#total_tags span").html("Tag(s) found"); 
                    }
                    this.$("#total_tags .badge").html(total);
                }, 
                clearSearch: function(ev) {
                    this.$("#total_tags .badge").html(this.objTags.total);
                    this.$("#total_tags span").html("Tag(s) found");
                    this.$el.find('#tags_search').val('');
                    this.$el.find(".action").show();
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

                    $("#div_tagviews").empty('');
                    $("#div_tagviews").hide();
                }

            });
        });