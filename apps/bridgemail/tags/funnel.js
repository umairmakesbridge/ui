define(['text!tags/html/funnel.html', 'bms-mapping'],
        function (template, Mapping) {
            'use strict';
            return Backbone.View.extend({
                className: 'funnel-dialog',
                events: {
                    'click .funnel-tabs-btns li':'changeLevel'
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.tagsModelArray = [];
                    this.levels = {level1:[],level2:[],level3:[],level4:[]};
                    this.tags = null;
                    this.selectedLevel = this.options.selectedLevel ? this.options.selectedLevel: 1 ;
                    this.doNotAdd = false;
                    this.render();                                        
                },
                render: function () {
                    this.parent = this.options.page;
                    this.tags = this.options.page.objects;
                    this.app = this.parent.app;            
                    this.dialog = this.options.dialog;
                    this.levelExplain = {
                        "1":{"text":"Showing Moderate Interest (Example:  people who have clicked several times on email)","cssClass":"one","label":"Cold"},
                        "2":{"text":"Marketing Qualified (Example: has requested a product trial or demo)","cssClass":"two","label":"Warm"},
                        "3":{"text":"Sales Qualified (Example: Meets your minimum engagement standard for sales follow up)","cssClass":"three","label":"Hot"},
                        "4":{"text":"Negotiations / Ready to Close (Example: Your in the top spot and in pricing discussions)","cssClass":"four","label":"Converted"}
                    }
                    this.$el.html(this.template({}));
                },
                init: function(){
                    if(this.parent.modelArray.length){
                        for(var i=0;i<this.parent.modelArray.length;i++){
                            _.each(this.parent.modelArray[i],function(val){
                                this.levels["level"+(i+1)].push({"id":val.get("tag"),"count":val.get("subCount")});
                            },this)
                            
                        }
                    }
                    this.$(".funnel-tabs-btns li[data-tab='"+this.selectedLevel+"']").addClass("active");
                    this.loadTags();
                },
                changeLevel:function(e,obj){
                   var level = $.getObj(e, "li"); 
                   if(!level.hasClass("active")){
                       level.parent().find(".active").removeClass("active");
                       level.addClass("active");
                       this.selectedLevel = level.attr("data-tab");
                       this.drawTags();
                   }
                },
                loadTags: function () {                                              
                    this.app.showLoading("Loading Tags...", this.$('.leftcol'));
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=subscriberTagCountList";
                    jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        this.app.showLoading(false, this.$('.leftcol'));
                        if (xhr && xhr.responseText) {
                            var tags_array = jQuery.parseJSON(xhr.responseText);
                            
                            if (tags_array[0] != 'err')
                            {
                                if (typeof tags_array.tagList != "undefined") {
                                    this.app.setAppData('tags', tags_array);                                    
                                }
                                
                                this.drawTags();
                                                                
                            }
                        }
                    },this));
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
                    var level = this.levels;
                    _.each(level,function(val,key){                                                      
                       var _l = [];
                        _.each(level[key],function(val,key){ 
                            _l.push(new Backbone.Model({tag:val.id,subCount:val.count}))
                        },this);
                       this.tagsModelArray.push(_l);

                    },this);          
                    this.parent.modelArray = this.tagsModelArray;
                    this.dialog.hide();
                    this.parent.createFunnel();
                   
                },
                drawTags:function(){
                    var tags_html = '';
                    var tags_array = this.app.getAppData('tags');
                    $.each(tags_array.tagList[0], function (key, val) {
                        if (val[0].subCount !== "0"){
                                tags_html += '<li class="action" id="row_' + key + '" checksum="' + val[0].tag + '"><a class="tag"><span>' + val[0].tag + '</span><strong class="badge">' + val[0].subCount + '</strong></a> <a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a></li>';                                       
                         }
                    });
                    
                    this.$('.leftcol .tagslist ul,.rightcol .tagslist ul').children().remove();
                    this.$('.leftcol .tagslist ul').html(tags_html);

                    this.$el.removeData("mapping");
                    this.$el.mapping({
                        sumColumn: 'a.tag .badge',
                        sumTarget: 'tags_total_recps .badge',
                        template: '',
                        movingElement: 'li',
                        addCallBack : _.bind(this.addTolevel,this),
                        removeCallBack : _.bind(this.removeFromLevel,this)
                    });
                    var selected_tags =  this.levels["level"+this.selectedLevel]
                    if(selected_tags){                                    
                        this.doNotAdd = true;
                        _.each(selected_tags, function (val, key) {
                            if (this.$(".col1 li[checksum='" + val.id + "'] .move-row").length > 0) {
                                this.$(".col1 li[checksum='" + val.id + "'] .move-row").click();
                            } 
                         },this);
                         
                         this.doNotAdd = false;
                    }
                    var dialog = this.$el.parents(".modal");
                    if(dialog.find(".modal-footer .level-define").length){
                        dialog.find(".modal-footer .level-define").remove();
                    }
                    var _html = $('<div class="left level-define" style="display:none"> <div class="left level-text '+this.levelExplain[this.selectedLevel].cssClass+'">'+this.levelExplain[this.selectedLevel].label+'</div></a> <div class="left level-desc">'+this.levelExplain[this.selectedLevel].text+'</div></div>');
                    dialog.find(".modal-footer").prepend(_html);
                    dialog.find(".modal-footer .level-define").fadeIn(400);
                    
                },
                addTolevel:function(obj){
                    if(!this.doNotAdd){
                        var tag = obj.find(".tag span").text();
                        var subCount =obj.find(".tag strong").text();                    
                        this.levels["level"+this.selectedLevel].push({"id":tag,"count":subCount});
                    }
                },
                removeFromLevel: function(obj){
                    var leveltags = this.levels["level"+this.selectedLevel];
                    var tag = obj.find(".tag span").text();
                    var index = -1;
                    for(var i=0;i<leveltags.length;i++){
                        if(tag==leveltags[i].id){
                            index = i;
                            break;
                        }
                    }
                    if(index>-1){
                        leveltags.splice(index,1);
                    }
                }
                
            });
        });