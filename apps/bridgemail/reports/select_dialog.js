define(['text!reports/html/select_dialog.html', 'landingpages/collections/landingpages', 'forms/collections/formlistings', 'reports/report_block','bms-shuffle'],
function (template, pagesCollection, FormsCollection, reportBlock) {
        'use strict';
        return Backbone.View.extend({  
                className:'select-view',
                events: {                   
                    'click .funnel-tabs-btns li':'changeLevel'
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        
                        this.mapping = {campaign: {label: 'Campaigns', colorClass: 'rpt-campaign', iconClass: 'campaigns'},
                            page: {label: 'Landing Pages', colorClass: 'rpt-landingpages', iconClass: 'lpage'},                            
                            autobot: {label: 'Autobots', colorClass: '.rpt-autobots', iconClass: 'tag'},
                            tag: {label: 'Tags', colorClass: 'rpt-tag', iconClass: 'bot'},
                            form: {label: 'Signup Forms', colorClass: 'rpt-webforms', iconClass: 'sforms'}
                                                       
                        };
                        this.levelExplain = {
                            "page":{
                                "1":{"text":"","cssClass":"one","label":"Level 1"},
                                "2":{"text":"","cssClass":"two","label":"Level 2"},
                                "3":{"text":"","cssClass":"three","label":"Level 3"},
                                "4":{"text":"","cssClass":"four","label":"Level 4"}
                            },
                            "form":{
                                "1":{"text":"Showing Moderate Interest (Example:  people who have clicked several times on email)","cssClass":"one","label":"New Leads"},
                                "2":{"text":"Marketing Qualified (Example: has requested a product trial or demo)","cssClass":"two","label":"MQL"},
                                "3":{"text":"Sales Qualified (Example: Meets your minimum engagement standard for sales follow up)","cssClass":"three","label":"SQL"},
                                "4":{"text":"Negotiations / Ready to Close (Example: Your in the top spot and in pricing discussions)","cssClass":"four","label":"Closed"}
                            }
                        }
                        this.parent = this.options.page;
                        this.app = this.parent.app ;
                        this.dialog = this.options.dialog;
                        this.scrollElement = null;
                        this.total_fetch = 0;
                        this.type =  this.options.type;                                                               
                        this.levels = {level1:[],level2:[],level3:[],level4:[]};                    
                        this.selectedLevel = this.options.selectedLevel ? this.options.selectedLevel: 1 ;                                         
                        this.objectsModelArray = [];
                        this.total = 0;
                        this.offsetLength = 0;
                        this.showSelectedRecords = false;
                        this.render();
                },

                render: function () {                       
                     this.$el.html(this.template({}));                               
                },
                init:function(){                                      
                    this.scrollElement = this.$(".leftcol .rpt-block-area");
                    this.loadRows();
                    this.scrollElement.scroll(_.bind(this.liveLoading,this));
                    this.scrollElement.resize(_.bind(this.liveLoading,this));
                    this.$(".col1 #form-search").on("keyup",_.bind(this.search,this));
                    this.$(".col1 #clearsearch").on("click",_.bind(this.clearSearch,this));
                    this.$('.refresh_btn').click(_.bind(function(){                        
                        this.loadRows();
                    },this));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.$(".funnel-tabs-btns li[data-tab='"+this.selectedLevel+"']").addClass("active");
                    this.drawExplain();
                    this.fillLevels();
                },
                changeLevel:function(e,obj){
                   var level = $.getObj(e, "li"); 
                   if(!level.hasClass("active")){
                       level.parent().find(".active").removeClass("active");
                       level.addClass("active");
                       this.selectedLevel = level.attr("data-tab");
                       this.showSelectedLevel();
                   }
                },
                loadRows:function(fcount){                  
                    if (!fcount){
                        this.offset = 0;
                        this.total_fetch = 0;
                        this.$('.leftcol .rpt-block-area').empty();                       
                    }
                    else {
                        this.offset = this.offset + this.offsetLength;
                    }
                    if (this.request){
                        this.request.abort();
                    }
                     var _data = {type: 'search'};
                    _data['offset'] = this.offset;                    
                    if (this.toDate && this.fromDate) {
                        _data['fromDate'] = this.fromDate;
                        _data['toDate'] = this.toDate;
                    }
                    if (this.searchTxt) {
                        _data['searchText'] = this.searchTxt;
                    }                    
                    _data['bucket'] = 20;
                                        
                    this.$('.leftcol .loadmore').remove();
                    if(this.type=="form"){
                        this.objectCollection = new FormsCollection();
                    }
                    else if(this.type=="page"){
                        this.objectCollection = new pagesCollection();
                    }
                    this.$(".leftcol .rpt-block-area").append('<div class="loadmore rpt-loadmore" style=""><img alt="" src="img/loading.gif"><p>Please wait, loading...</p></div>');
                    this.request = this.objectCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$('.leftcol .loadmore').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;                                                        
                                                        
                            //this.showTotalCount(collection.totalCount);                            
                            _.each(data1.models, _.bind(function (model) {
                                var row = new reportBlock({model: model, page: this, type: this.type, addClass:'add-rpt',isAddRemove:true,hideCheckbox:true });
                                this.$('.leftcol .rpt-block-area').append(row.$el);        
                                //hide selected items
                                for(var i=0;i<this.levels["level"+this.selectedLevel].length;i++){
                                    if(this.levels["level"+this.selectedLevel][i].get(this.getCheckSum())===model.get(this.getCheckSum())){
                                        row.$el.hide();
                                        break;
                                    }
                                }
                            }, this));
                                                                                    
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$(".leftcol .rept-data-box").last().attr("data-load", "true");
                            }                            

                        }, this),
                        error: function (collection, resp) {

                        }
                    });   
                },
                fillLevels:function(){
                    if(this.parent.modelArray.length){
                        this.$(".rightcol .rpt-block-area").append('<div class="loadmore rpt-loadmore" style=""><img alt="" src="img/loading.gif"><p>Please wait, loading selection...</p></div>');
                        for(var i=0;i<this.parent.modelArray.length;i++){
                            var objIds = this.parent.modelArray[i].map(function (index) {
                                return index.id
                            }).join();
                            
                            var URL = "/pms/io/publish/getLandingPages/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=get_csv";
                            var post_data = {pageId_csv: objIds};                            
                            if(this.type=="form"){
                                URL = "/pms/io/form/getSignUpFormData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=get_csv";
                                post_data = {formId_csv: objIds};
                            }
                            $.post(URL, post_data).done(_.bind(function (_i, data) {                                
                                var _json = jQuery.parseJSON(data);
                                var objs = null;
                                if(this.type=="form"){
                                    objs = _json.forms?_json.forms[0]:[];
                                }
                                else {
                                    objs = _json.pages?_json.pages[0]:[];
                                }
                                _.each(objs, function (val) {
                                    this.levels["level"+_i].push(new Backbone.Model(val[0]));
                                }, this);                        
                                if(_i==this.selectedLevel){
                                    this.$(".rightcol .rpt-block-area .loadmore").remove();
                                    this.showSelectedLevel();
                                }
                            }, this,(i+1)));
                        }
                    }                    
                },
                getCheckSum: function(){
                    var checkSumKey = "";
                    if(this.type=="page"){
                        checkSumKey = "pageId.checksum";
                    }
                    else if(this.type=="form"){
                        checkSumKey = "formId.checksum";
                    }
                    return checkSumKey;
                },
                getIdKey: function(){
                    var idKey = "";
                    if(this.type=="page"){
                        idKey = "pageId.encode";
                    }
                    else if(this.type=="form"){
                        idKey = "formId.encode";
                    }
                    return idKey;
                },
                getCount: function(){
                    var checkSumKey = "";
                    if(this.type=="page"){
                        checkSumKey = "viewCount";
                    }
                    else if(this.type=="form"){
                        checkSumKey = "submitCount";
                    }
                    return checkSumKey;
                },
                addToCol2:function(model){                    
                    var _view = new reportBlock({model: model, page: this, type: this.type,isAddRemove:true,hideCheckbox:true});
                    this.$(".rightcol .rpt-block-area").append(_view.$el);
                    this.levels["level"+this.selectedLevel].push(model);                                          
                },
                adToCol1:function(model){
                    for(var i=0;i<this.levels["level"+this.selectedLevel].length;i++){
                        if(this.levels["level"+this.selectedLevel][i].get(this.getCheckSum())==model.get(this.getCheckSum())){
                            this.levels["level"+this.selectedLevel].splice(i,1);                            
                            break;
                        }
                    }
                    this.$(".leftcol div[data-checksum='"+model.get(this.getCheckSum())+"']").parent().show();
                },
                search: function(ev) {
                    this.searchTxt = '';                    
                    var that = this;
                    var code = ev.keyCode ? ev.keyCode : ev.which;
                    var nonKey = [17, 40, 38, 37, 39, 16];
                    if ((ev.ctrlKey == true) && (code == '65' || code == '97')) {
                        return;
                    }
                    if ($.inArray(code, nonKey) !== -1)
                        return;
                    var text = $(ev.target).val();                    

                    if (code == 13 || code == 8) {
                        that.$el.find('.col1 #clearsearch').show();
                        this.searchTxt = text;
                        that.loadRows();
                    } else if (code == 8 || code == 46) {
                        if (!text) {
                            that.$el.find('.col1 #clearsearch').hide();
                            this.searchTxt = text;
                            that.loadRows();
                        }
                    } else {
                        that.$el.find('.col1 #clearsearch').show();
                        clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                        that.timer = setTimeout(function() { // assign timer a new timeout 
                            if (text.length < 2)
                                return;
                            that.searchTxt = text;
                            that.loadRows();
                        }, 500); // 2000ms delay, tweak for faster/slower
                    }
                }, clearSearch: function(ev) {
                    $(ev.target).hide();                    
                    this.total = 0;
                    this.searchTxt = '';                    
                    this.total_fetch = 0;                    
                    this.loadRows();
                },
                liveLoading: function(where) {
                    var $w = this.scrollElement;
                    var th = 200;

                    var inview = this.$el.find('.rpt-block-area div.rept-data-box:last').filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.loadRows(this.offsetLength);
                    }
                },
                saveCall:function(){                   
                    var level = this.levels;
                    _.each(level,function(val,key){                                                      
                       var _l = [];
                        _.each(level[key],function(val,key){ 
                            _l.push(new Backbone.Model({
                                    tag:val.get("name"),
                                    subCount:val.get(this.getCount()),
                                    checkSum : val.get(this.getCheckSum()),
                                    id : val.get(this.getIdKey()),
                                }))
                        },this);
                       this.objectsModelArray.push(_l);

                    },this);          
                    this.parent.modelArray = this.objectsModelArray;                            
                    this.dialog.hide(true);
                    this.parent.createFunnel();                        
                },
                showSelectedLevel : function(){                           
                    this.$(".rightcol .rpt-block-area").children().remove();
                    this.$(".leftcol .rpt-block-area > div").show();
                    for(var i=0;i<this.levels["level"+this.selectedLevel].length;i++){
                        var model = this.levels["level"+this.selectedLevel][i];
                        var _view = new reportBlock({model:model , page: this, type: this.type,isAddRemove:true,hideCheckbox:true});
                        this.$(".rightcol .rpt-block-area").append(_view.$el);
                        this.$(".leftcol div[data-checksum='"+model.get(this.getCheckSum())+"']").parent().hide();
                    }         
                    this.drawExplain();
                },
                drawExplain: function(){
                    if(this.dialog.$(".modal-footer .level-define").length){
                        this.dialog.$(".modal-footer .level-define").remove();
                    }
                    var _html = $('<div class="left level-define" style="display:none"> <div class="left level-text '+this.levelExplain[this.type][this.selectedLevel].cssClass+'">'+this.levelExplain[this.type][this.selectedLevel].label+'</div></a> <div class="left level-desc">'+this.levelExplain[this.type][this.selectedLevel].text+'</div></div>');
                    this.dialog.$(".modal-footer").prepend(_html);
                    this.dialog.$(".modal-footer .level-define").fadeIn(400);
                }
                
        });
});