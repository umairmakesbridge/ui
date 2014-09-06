define(['text!tags/html/tags.html', 'bms-mapping', 'jquery.searchcontrol','bms-tags'],
        function(template, Mapping, bmsSearch,tags) {
            'use strict';
            return Backbone.View.extend({
                events: {
                },
                saveTags: function() {
                    var curview = this;
                    var tags = '';
                    curview.$el.find(".col2 .rightcol li").each(function(i) {
                        tags += $(this).find("a:nth-child(1) span").text() + ',';
                    });
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                    var  params = {type: 'tags', botId: this.options.botId}
                     $.post(URL, params)
                        .done(function(data) {

                        });
                    if (typeof curview.options.type != "undefined" && curview.options.type == "autobots") {
                        this.campview.tags = tags.substring(0, tags.length - 1);
                        this.campview.updateTags();
                        if (curview.options.dialog) {
                            if (curview.options.type === "autobots") {
                                curview.options.dialog.showPrevious();
                            } else
                            {
                                curview.options.dialog.hide();
                            }
                        }

                    } else {
                        return tags.substring(0, tags.length - 1);
                    }

                },
                loadTags: function() {
                    var app = this.app;
                    var curview = this;
                    var campview = this.campview;
                    app.showLoading("Loading Tags...", curview.$el.find('.leftcol'));
                    URL = "/pms/io/user/getData/?BMS_REQ_TK=" + app.get('bms_token') + "&type=subscriberTagCountList";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        app.showLoading(false, curview.$el.find('.leftcol'));
                        if (xhr && xhr.responseText) {
                            var tags_array = jQuery.parseJSON(xhr.responseText);
                            var tags_html = '';
                            if (tags_array[0] != 'err')
                            {
                                app.setAppData('tags', tags_array);
                                $.each(tags_array.tagList[0], function(key, val) {
                                    if (val[0].subCount == 0)
                                        tags_html += '<li class="action inactive" id="row_' + key + '" checksum="' + val[0].tag + '"><a class="tag"><span>' + val[0].tag + '</span><strong class="badge">' + val[0].subCount + '</strong></a></li>';
                                    else
                                        tags_html += '<li class="action" id="row_' + key + '" checksum="' + val[0].tag + '"><a class="tag"><span>' + val[0].tag + '</span><strong class="badge">' + val[0].subCount + '</strong></a> <a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a></li>';
                                });
                                curview.$el.find('.leftcol .tagslist ul').children().remove();
                                curview.$el.find('.leftcol .tagslist ul').html(tags_html);

                                if (typeof campview.states != "undefined" && campview.states.step3.recipientType.toLowerCase() == "tags")
                                    campview.setRecipients();

                                if (typeof curview.options.type != "undefined" && curview.options.type == "autobots") {
                                    curview.$el.removeData("mapping");
                                    curview.$el.mapping({
                                        sumColumn: 'a.tag .badge',
                                        sumTarget: 'tags_total_recps .badge',
                                        template: '',
                                        movingElement: 'li'
                                    });

                                    var tags = curview.options.tags;

                                    for (var i = 0; i < tags.length; i++) {
                                        curview.$el.find(".col1 li[checksum='" + tags[i] + "'] .move-row").click();
                                    }
                                } else {
                                    campview.$el.find("#area_choose_tags").removeData("mapping");
                                    campview.$el.find("#area_choose_tags").mapping({
                                        sumColumn: 'a.tag .badge',
                                        sumTarget: 'tags_total_recps .badge',
                                        template: '',
                                        movingElement: 'li'
                                    });
                                }
                            }
                        }
                    });
                    this.$el.find('div#tagssearch').searchcontrol({
                        id: 'tag-search',
                        width: '210px',
                        height: '25px',
                        placeholder: 'Search tags',
                        gridcontainer: 'tagslist ul',
                        showicon: 'yes',
                        movingElement: 'li',
                        iconsource: 'tags'
                    });
                    this.$el.find('div#tagsrecpssearch').searchcontrol({
                        id: 'tag-recps-search',
                        width: '210px',
                        height: '25px',
                        placeholder: 'Search recipient tags',
                        gridcontainer: 'tagsrecpslist ul',
                        showicon: 'yes',
                        movingElement: 'li',
                        iconsource: 'tags'
                    });
                    if (this.$el.find('#tagsrecpslist ul li').length == 0)
                        this.$el.find('#tag-recps-search').attr('disabled', 'disabled');
                    else
                        this.$el.find('#tag-recps-search').attr('disabled', '');
                    
                    console.log(this.options.botId);
                    this.$(".template-tag").tags({app: this.options.app,
                       url: "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.options.app.get('bms_token'),
                        params: {type: 'tags', actionTags: '', botId: this.options.botId}
                        , showAddButton: true,
                         actionTags: tags,
                        module:"rec_tag",
                        callBack: _.bind(this.newTags, this),
                        typeAheadURL: "/pms/io/user/getData/?BMS_REQ_TK=" + this.options.app.get('bms_token') + "&type=allTemplateTags"
                    });
                    this.$(".template-tag").find(".tagicon.gray").remove();
                    
                },
                newTags: function(tags) {
                    var tag = tags.split(',');
                    var that = this;
                    if(tag.length > 0){
                     tag = tag[tag.length-1];
                    }else{
                        tag = tags;
                    }
                    var tags_html =  '<li class="action new-added"  checksum="' + tag + '"><a class="tag"><span>' + tag + '</span><strong class="badge">0</strong></a> <a style="display: inline;" class="move-row btn-red class-remove"><i class="icon back left"></i><span>Remove</span></a></li>';
                    this.$el.find(".col2 .rightcol ul").append(tags_html);
                    this.$el.find(".col2 .rightcol ul li .class-remove").on('click',function(){
                        $(this).parents('li.action').remove();
                        var maintags = '';
                        that.$el.find(".col2 .rightcol li").each(function(i) {
                            maintags += $(this).find("a:nth-child(1) span").text() + ',';
                        });
                            var post_data = {botId: that.options.botId, type: "update",actionTags: maintags};
                            var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + that.app.get('bms_token');
                            
                            $.post(URL, post_data)
                                    .done(function(data) {

                                    });

                            });
                   // 
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.render();
                    if (this.options.type == "autobots")
                        this.app.showLoading(false, this.campview.$el);
                    else
                        this.app.showLoading(false, this.campview.$el.find('#area_choose_tags'));

                    this.loadTags();
                },
                render: function() {
                    this.app = this.options.app;
                    this.campview = this.options.camp;
                    this.$el.html(this.template({}));
                }
            });
        });