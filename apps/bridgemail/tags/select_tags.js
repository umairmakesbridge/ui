define(['text!tags/html/select_tags.html', 'bms-mapping', 'jquery.searchcontrol', 'bms-tags'],
        function (template, Mapping, bmsSearch, tags) {
            'use strict';
            return Backbone.View.extend({
                events: {
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.tagsModelArray = [];
                    this.render();                                        
                },
                render: function () {
                    this.parent = this.options.page;
                    this.app = this.parent.app;            
                    this.dialog = this.options.dialog;
                    this.$el.html(this.template({}));
                },
                init: function(){
                    this.loadTags();
                },
                loadTags: function () {
                    var app = this.app;
                    var that = this;
                    var curview = this;
                    var parentView = this.parent;
                    app.showLoading("Loading Tags...", curview.$el.find('.leftcol'));
                    URL = "/pms/io/user/getData/?BMS_REQ_TK=" + app.get('bms_token') + "&type=subscriberTagCountList";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        app.showLoading(false, curview.$el.find('.leftcol'));
                        if (xhr && xhr.responseText) {
                            var tags_array = jQuery.parseJSON(xhr.responseText);
                            var tags_html = '';
                            if (tags_array[0] != 'err')
                            {
                                if (typeof tags_array.tagList != "undefined") {
                                    app.setAppData('tags', tags_array);
                                    $.each(tags_array.tagList[0], function (key, val) {
                                        if (val[0].subCount !== "0"){
                                                tags_html += '<li class="action" id="row_' + key + '" checksum="' + val[0].tag + '"><a class="tag"><span>' + val[0].tag + '</span><strong class="badge">' + val[0].subCount + '</strong></a> <a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a></li>';                                       
                                            }
                                    });
                                }
                                curview.$el.find('.leftcol .tagslist ul').children().remove();
                                curview.$el.find('.leftcol .tagslist ul').html(tags_html);
                                
                                curview.$el.removeData("mapping");
                                curview.$el.mapping({
                                    sumColumn: 'a.tag .badge',
                                    sumTarget: 'tags_total_recps .badge',
                                    template: '',
                                    movingElement: 'li'
                                });
                                if(curview.options.tags){
                                    var tags = curview.options.tags;
                                    for (var i = 0; i < tags.length; i++) {
                                        if (curview.$el.find(".col1 li[checksum='" + tags[i] + "'] .move-row").length > 0) {
                                            curview.$el.find(".col1 li[checksum='" + tags[i] + "'] .move-row").click();
                                        } else if (tags[i] != "") {

                                            var tags_html = '<li class="action new-added"  checksum="' + tags[i] + '"><a class="tag"><span>' + tags[i] + '</span><strong class="badge">0</strong></a> <a style="display: inline;" class="move-row btn-red class-remove"><i class="icon back left"></i><span>Remove</span></a></li>';
                                            that.$el.find(".col2 .rightcol ul").append(tags_html);
                                            that.$el.find(".col2 .rightcol ul li .class-remove").on('click', function () {
                                                $(this).parents('li.action').remove();
                                                var maintags = '';


                                                that.$el.find(".col2 .rightcol li").each(function (i) {
                                                    maintags += $(this).find("a:nth-child(1) span").text() + ',';
                                                });

                                            });

                                        }
                                    }
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

                    if (this.$el.find('#tagsrecpslist ul li').length == 0)
                        this.$el.find('#tag-recps-search').attr('disabled', 'disabled');
                    else
                        this.$el.find('#tag-recps-search').attr('disabled', '');
                    

                },
                saveCall:function(){
                    var col2 = this.$(".col2 .tagslist");
                    var tags = col2.find("li");
                    if(tags.length>0){                       
                       var objectArray =[];                   
                       var tagVal = "";
                       var count = "0";
                        _.each(tags,function(val,key){                           
                           tagVal = $(val).find(".tag span").text();
                           count = $(val).find(".tag .badge").text();
                           objectArray.push({"id":tagVal,"checked":true});                           
                           this.tagsModelArray.push(new Backbone.Model({tag:tagVal,subCount:count}));
                        },this);   
                        this.parent.modelArray = this.tagsModelArray;                        
                        this.parent.objects = objectArray;
                        this.dialog.hide();
                        this.parent.createTags();
                    }
                    else{
                        this.app.showAlert("Please select at least on tag",this.$el);
                    }
                }
                
            });
        });