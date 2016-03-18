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
                            "1":{"text":"Showing Moderate Interest (Example:  people who have clicked several times on email)","cssClass":"one","label":"New"},
                            "2":{"text":"Marketing Qualified (Example: has requested a product trial or demo)","cssClass":"two","label":"MQL"},
                            "3":{"text":"Sales Qualified (Example: Meets your minimum engagement standard for sales follow up)","cssClass":"three","label":"SQL"},
                            "4":{"text":"Negotiations / Ready to Close (Example: Your in the top spot and in pricing discussions)","cssClass":"four","label":"Closed"}
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
                  this.$('div#recpssearch').searchcontrol({
                            id:'form-recps-search',
                            width:'220px',
                            height:'22px',
                            placeholder: 'Search selection...',
                            gridcontainer: this.$('#area_choose_forms .col2'),
                            showicon: 'yes',
                            iconsource: this.mapping[this.type].iconClass
                     });                   
                     
                    
                    
                    
                    //this.scrollElement = this.$(".leftcol .bDiv");
                    this.loadRows();
                    //this.scrollElement.scroll(_.bind(this.liveLoading,this));
                    //this.scrollElement.resize(_.bind(this.liveLoading,this));
                    this.$(".col1 #form-search").on("keyup",_.bind(this.search,this));
                    this.$(".col1 #clearsearch").on("click",_.bind(this.clearSearch,this));
                    this.$('.refresh_btn').click(_.bind(function(){                        
                        this.loadRows();
                    },this));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.$(".funnel-tabs-btns li[data-tab='"+this.selectedLevel+"']").addClass("active");
                    this.drawExplain();
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
                                        
                    this.$('.leftcol .load-row').remove();
                    if(this.type=="form"){
                        this.objectCollection = new FormsCollection();
                    }
                    else if(this.type=="page"){
                        this.objectCollection = new pagesCollection();
                    }
                    
                    this.request = this.objectCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$('.leftcol .load-row').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;                                                        
                                                        
                            //this.showTotalCount(collection.totalCount);                            
                            _.each(data1.models, _.bind(function (model) {
                                var row = new reportBlock({model: model, page: this, type: this.type, addClass:'add-rpt',isAddRemove:true});
                                this.$('.leftcol .rpt-block-area').append(row.$el);                                                                
                            }, this));
                                                                                    
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$(".leftcol .rept-data-box").last().attr("data-load", "true");
                            }
                            this.$('.leftcol .load-row').remove();                            

                        }, this),
                        error: function (collection, resp) {

                        }
                    });   
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
                    var _view = new reportBlock({model: model, page: this, type: this.type,isAddRemove:true});
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
                    text = text.replace('Tag:', '');


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
                            that.loadCampaigns();
                        }, 500); // 2000ms delay, tweak for faster/slower
                    }
                }, clearSearch: function(ev) {
                    $(ev.target).hide();
                    this.$(".col1 .search-control").val('');
                    this.total = 0;
                    this.searchTxt = '';
                    this.searchTags = '';
                    this.total_fetch = 0;
                    this.$("#total_targets span").html("Campaign(s) found");    
                    this.loadCampaigns();
                },
                showSearchFilters: function(text, total) {
                    this.$("#total_targets .badge").html(total);
                    this.$("#total_targets span").html("Campaign(s) found for  <b>\"" + text + "\" </b>");
                },
                liveLoading: function(where) {
                    var $w = $(window);
                    var th = 200;

                    var inview = this.$el.find('table#forms_grid tbody tr:last').filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.loadCampaigns(this.offsetLength);
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
                    this.dialog.hide();
                    this.parent.createFunnel();                        
                },
                showSelectedLevel : function(){                           
                    this.$(".rightcol .rpt-block-area").children().remove();
                    this.$(".leftcol .rpt-block-area > div").show();
                    for(var i=0;i<this.levels["level"+this.selectedLevel].length;i++){
                        var model = this.levels["level"+this.selectedLevel][i];
                        var _view = new reportBlock({model:model , page: this, type: this.type,isAddRemove:true});
                        this.$(".rightcol .rpt-block-area").append(_view.$el);
                        this.$(".leftcol div[data-checksum='"+model.get(this.getCheckSum())+"']").parent().hide();
                    }         
                    this.drawExplain();
                },
                drawExplain: function(){
                    if(this.dialog.$(".modal-footer .level-define").length){
                        this.dialog.$(".modal-footer .level-define").remove();
                    }
                    var _html = $('<div class="left level-define" style="display:none"> <div class="left level-text '+this.levelExplain[this.selectedLevel].cssClass+'">'+this.levelExplain[this.selectedLevel].label+'</div></a> <div class="left level-desc">'+this.levelExplain[this.selectedLevel].text+'</div></div>');
                    this.dialog.$(".modal-footer").prepend(_html);
                    this.dialog.$(".modal-footer .level-define").fadeIn(400);
                }
                
        });
});