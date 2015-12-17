define(['text!landingpages/html/selectpage.html', 'landingpages/collections/landingpages', 'landingpages/landingpage_row','bms-shuffle'],
function (template, PagesCollection, pageRowView) {
        'use strict';
        return Backbone.View.extend({  
                className:'select-target-view',
                events: {                   
                      
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.parent = this.options.page;
                        this.app = this.parent.app ;
                        this.dialog = this.options.dialog;
                        this.scrollElement = null;
                        this.total_fetch = 0;
                        this.editable=this.options.editable;                        
                        this.pagesModelArray = [];
                        this.targetsIdArray = [];
                        this.total = 0;
                        this.offsetLength = 0;
                        this.render();
                },

                render: function () {                       
                        this.$el.html(this.template({}));                            
                },
                init:function(){
                  this.$('div#recpssearch').searchcontrol({
                            id:'target-recps-search',
                            width:'220px',
                            height:'22px',
                            placeholder: 'Search selection...',
                            gridcontainer: this.$('#area_choose_targets .col2'),
                            showicon: 'yes',
                            iconsource: 'lpage'
                     });                   
                     this.$el.find("#targets_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:345,							
                            usepager : false,
                            colWidth : ['100%','100']
                    });
                    this.$("#area_choose_targets").shuffle({
                            gridHeight:345                            
                    });
                    this.col2 =  this.$("#area_choose_targets").data("shuffle").getCol2();
                    this.col1 = this.$("#targets_grid tbody")
                    this.scrollElement = this.$(".leftcol .bDiv");
                    this.loadPages();
                    this.scrollElement.scroll(_.bind(this.liveLoading,this));
                    this.scrollElement.resize(_.bind(this.liveLoading,this));
                    this.$(".col1 #page-search").on("keyup",_.bind(this.search,this));
                    this.$(".col1 #clearsearch").on("click",_.bind(this.clearSearch,this));
                    this.$('.refresh_btn').click(_.bind(function(){                        
                        this.loadPages();
                    },this));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                loadPages:function(fcount){                  
                    if (!fcount) {
                        this.offset = 0;
                        this.total_fetch = 0;
                        this.$el.find('#targets_grid tbody').empty();
                       
                    }
                    else {
                        this.offset = this.offset + this.offsetLength;
                    }
                    if (this.request)
                        this.request.abort();
                    var _data = {offset: this.offset,type:'search',status:'P'};                    
                    
                    if(this.actionType){
                        _data['searchType'] = this.actionType;                        
                    }
                    else {
                        delete  _data['searchType'];
                    }
                    if (this.searchTxt) {
                        _data['searchText'] = this.searchTxt;
                    }                    
                    _data['bucket'] = 20;
                    
                    //this.objTargets = new TargetsCollection();
                    this.$('#targets_grid tbody .load-tr').remove();
                    this.$('#targets_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No pages founds!</div><div class='loading-target' style='margin-top:50px'></div></td></tr>");
                    this.app.showLoading("Please wait, loading pages...", this.$el.find('#targets_grid tbody').find('.loading-target'));
                    this.$('#targets_grid tbody').find('.loading-target .loading p ').css('padding','30px 0 0');
                    this.pagesCollection = new PagesCollection();
                    this.request = this.pagesCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$('#targets_grid tbody').find('.loading-campagins').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;                                                        
                                                        
                            //this.showTotalCount(collection.totalCount);                            
                            _.each(data1.models, _.bind(function (model) {
                                var lpRow = new pageRowView({model: model, sub: this,showUse:true});
                                this.$('#targets_grid tbody').append(lpRow.el);                                
                            }, this));
                                                                                    
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$(".landingpage-box").last().attr("data-load", "true");
                            }

                            if (this.offsetLength == 0) {                                                            
                                this.$('.no-contacts').show();
                                this.$('.loading-target').hide();
                            }else{
                                if(this.offset==0){
                                   this.showSelectedPages(); 
                                }
                                this.$('#targets_grid tbody #loading-tr').remove();
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    });   
                },
                addToCol2:function(model){
                    var _view_obj ={model: model,sub:this};                    
                    _view_obj["showRemove"]=this.col1;                         
                     var _view = new pageRowView(_view_obj);                                          
                     this.$(this.col2).find(".bDiv tbody").append(_view.$el);
                     this.pagesModelArray.push(model);                     
                     _view.$el.find('.tags ul li').click(_.bind(function(ev){
                         var val = $(ev.target).text();
                         this.searchByTagTile(val);
                     },this));
                },
                adToCol1:function(model){
                    for(var i=0;i<this.pagesModelArray.length;i++){
                        if(this.pagesModelArray[i].get("pageId.checksum")==model.get("pageId.checksum")){
                            this.pagesModelArray.splice(i,1);
                            //this.targetsIdArray.splice(i,1);
                            break;
                        }
                    }
                    this.col1.find("tr[data-checksum='"+model.get("pageId.checksum")+"']").show();
                },
                createRecipients:function(targets){
                    for(var i=0;i<targets.length;i++){
                        this.addToCol2(targets[i]);                       
                    }
                    this.pagesModelArray =  targets;
                    this.hideRecipients();
                },
                hideRecipients:function(){
                     for(var i=0;i<this.pagesModelArray.length;i++){                        
                        this.col1.find("tr[data-checksum='"+this.pagesModelArray[i].get("pageId.checksum")+"']").hide();
                    }
                },
                targetInRecipients:function(checksum){
                    var isExits = false;
                    if(this.pagesModelArray >0){
                        for(var i=0;i<this.pagesModelArray;i++){
                            if(this.pagesModelArray[i].get("pageId.checksum")==checksum)
                                {
                                    isExits = true;
                                    break;
                                }
                        }
                    }
                    return isExits;
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
                        that.loadPages();
                    } else if (code == 8 || code == 46) {

                        if (!text) {
                            that.$el.find('.col1 #clearsearch').hide();
                            this.searchTxt = text;
                            that.loadPages();
                        }
                    } else {
                        that.$el.find('.col1 #clearsearch').show();
                        clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                        that.timer = setTimeout(function() { // assign timer a new timeout 
                            if (text.length < 2)
                                return;
                            that.searchTxt = text;
                            that.loadPages();
                        }, 500); // 2000ms delay, tweak for faster/slower
                    }
                }, clearSearch: function(ev) {
                    $(ev.target).hide();
                    this.$(".col1 .search-control").val('');
                    this.total = 0;
                    this.searchTxt = '';
                    this.searchTags = '';
                    this.total_fetch = 0;
                    this.$("#total_targets span").html("Target(s) found");    
                    this.loadPages();
                },
                showSearchFilters: function(text, total) {
                    this.$("#total_targets .badge").html(total);
                    this.$("#total_targets span").html("Target(s) found for  <b>\"" + text + "\" </b>");
                },
                liveLoading: function(where) {
                    var $w = $(window);
                    var th = 200;

                    var inview = this.$el.find('table#targets_grid tbody tr:last').filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.loadPages(this.offsetLength);
                    }
                },
                saveCall:function(){
                    var col2 = this.$(this.col2).find(".bDiv tbody");
                    if(col2.find("tr").length>0){
                       var pagesArray =  {}
                        var t =1;
                        _.each(this.pagesModelArray,function(val,key){
                           pagesArray["page"+t] = [{"checksum":val.get("pageId.checksum"),"encode":val.get("pageId.checksum")}] ;
                           t++;
                        },this);   
                        this.parent.modelArray = this.pagesModelArray;
                        this.parent.pagesArray = pagesArray;
                        this.dialog.hide();
                        this.parent.createPages();
                    }
                    else{
                        this.app.showAlert("Please select at least on page",this.$el);
                    }
                },
                getTargetCol2: function(){
                    var returnArray = [];
                    _.each(this.targetsIdArray,function(val){
                        returnArray.push(val.encode);
                    })
                    return returnArray;
                },
                getRecipientTargetCol2 : function(){
                    return this.targetsIdArray;
              },
              showSelectedPages : function(lists){                                      
                  var selectedPages = this.parent.modelArray;
                  if(selectedPages.length){
                    for(var s=0;s<selectedPages.length;s++){                                
                         this.addToCol2(selectedPages[s]);                         
                    }                        
                  }
                  
                  this.hideRecipients();
                   
              },
              searchByTagTile:function(tag){
               this.$("#targetrecpssearch #target-recps-search").val(tag);
               this.$("#targetrecpssearch #clearsearch").show(); 
               this.$("#recipients tbody tr").hide();
               var count = 0;
               this.$("#recipients tbody tr").filter(function() {
                    var tagExist = false;
                    $(this).find(".tags a").each(function(i){
                        $(this).removeHighlight();
                        if($.trim($(this).text()).toLowerCase() == $.trim(tag).toLowerCase()){
                            $(this).highlight(tag);	
                            tagExist = true;
                        }
                    });                    
                    if(tagExist){
                         count++;
                        return $(this);
                    }
               }).show();
               
            },
        });
});