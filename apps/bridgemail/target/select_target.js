define(['text!target/html/select_target.html', 'target/collections/recipients_targets', 'target/views/recipients_target','bms-shuffle'],
function (template, TargetsCollection, targetRowView) {
        'use strict';
        return Backbone.View.extend({  
                className:'select-target-view',
                events: {                   
                      "keyup #daterange":'showDatePicker',
                      "click #clearcal":'hideDatePicker',
                      "click .calendericon":'showDatePickerFromClick'
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.parent = this.options.page;
                        this.app = this.parent.app ;
                        this.dialog = this.options.dialog;
                        this.scrollElement = null;
                        this.total_fetch = 0;
                        this.gridHeight = this.options.dialogHeight?this.options.dialogHeight:345;
                        this.editable=this.options.editable;                        
                        this.targetsModelArray = [];                        
                        this.total = 0;
                        this.offsetLength = 0;
                        this.showSelectedRecords = false;
                        this.render();
                },

                render: function () {                       
                        this.$el.html(this.template({}));       
                        this.dateRangeControl = this.$('#daterange').daterangepicker();                
                        this.dateRangeControl.panel.find(".btnDone").click(_.bind(this.setDateRange,this));
                        this.dateRangeControl.panel.find("ul.ui-widget-content li").click(_.bind(this.setDateRangeLi,this));
                },
                init:function(){
                  this.$('div#recpssearch').searchcontrol({
                            id:'target-recps-search',
                            width:'220px',
                            height:'22px',
                            placeholder: 'Search selection...',
                            gridcontainer: this.$('#area_choose_targets .col2'),
                            showicon: 'yes',
                            iconsource: 'target'
                     });                   
                     this.$el.find("#targets_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:this.gridHeight,							
                            usepager : false,
                            colWidth : ['100%','100']
                    });
                    this.$("#area_choose_targets").shuffle({
                            gridHeight:this.gridHeight                            
                    });
                    this.col2 =  this.$("#area_choose_targets").data("shuffle").getCol2();
                    this.col1 = this.$("#targets_grid tbody")
                    this.scrollElement = this.$(".leftcol .bDiv");
                    this.loadTargets();
                    this.scrollElement.scroll(_.bind(this.liveLoading,this));
                    this.scrollElement.resize(_.bind(this.liveLoading,this));
                    this.$(".col1 #target-search").on("keyup",_.bind(this.search,this));
                    this.$(".col1 #clearsearch").on("click",_.bind(this.clearSearch,this));
                    this.$('.refresh_btn').click(_.bind(function(){                        
                        this.loadTargets();
                    },this));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                loadTargets:function(fcount){                  
                    if (!fcount){
                        this.offset = 0;
                        this.total_fetch = 0;
                        this.$el.find('#targets_grid tbody').empty();                       
                    }
                    else {
                        this.offset = this.offset + this.offsetLength;
                    }
                    if (this.request)
                        this.request.abort();
                     var _data = {type: 'batches',filterFor:'C'};
                    _data['offset'] = this.offset;                    
                    if (this.toDate && this.fromDate) {
                        _data['fromDate'] = this.fromDate;
                        _data['toDate'] = this.toDate;
                    }
                    if (this.searchTxt) {
                        _data['searchText'] = this.searchTxt;

                    }                    
                    _data['bucket'] = 20;
                                        
                    this.$('#targets_grid tbody .load-tr').remove();
                    this.$('#targets_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No targets founds!</div><div class='loading-targets' style='margin-top:50px'></div></td></tr>");
                    this.app.showLoading("Please wait, loading targets...", this.$el.find('#targets_grid tbody').find('.loading-targets'));
                    this.$('#targets_grid tbody').find('.loading-targets .loading p ').css('padding','30px 0 0');
                    this.targetsCollection = new TargetsCollection();
                    this.request = this.targetsCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$('#targets_grid tbody').find('.loading-targets').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }
                            this.offsetLength = data1.length;
                            this.total_fetch = this.total_fetch + data1.length;                                                        
                                                        
                            //this.showTotalCount(collection.totalCount);                            
                            _.each(data1.models, _.bind(function (model) {
                                var row = new targetRowView({model: model, sub: this,showUse:true,fromReport:true});
                                this.$('#targets_grid tbody').append(row.el);                                
                            }, this));
                                                                                    
                            if (this.total_fetch < parseInt(collection.totalCount)) {
                                this.$("#targets_grid tbody tr:last").last().attr("data-load", "true");
                            }

                            if (this.offsetLength == 0) {                                                            
                                this.$('.no-contacts').show();
                                this.$("#targets_grid .loading-targets").hide();                                
                            }else{
                                if(this.offset==0){
                                   this.showSelectedTargets(); 
                                }                                
                                this.$('#targets_grid tbody #loading-tr').remove();
                            }
                            

                        }, this),
                        error: function (collection, resp) {

                        }
                    });   
                },
                addToCol2:function(model){
                    var _view_obj ={model: model,sub:this,fromReport:true};                    
                    _view_obj["showRemove"]=this.col1;                         
                     var _view = new targetRowView(_view_obj);                                          
                     this.$(this.col2).find(".bDiv tbody").append(_view.$el);
                     this.targetsModelArray.push(model);                     
                     _view.$el.find('.tags ul li').click(_.bind(function(ev){
                         var val = $(ev.target).text();
                         this.searchByTagTile(val);
                     },this));
                },
                adToCol1:function(model){
                    for(var i=0;i<this.targetsModelArray.length;i++){
                        if(this.targetsModelArray[i].get("filterNumber.checksum")==model.get("filterNumber.checksum")){
                            this.targetsModelArray.splice(i,1);                            
                            break;
                        }
                    }
                    this.col1.find("tr[data-checksum='"+model.get("filterNumber.checksum")+"']").show();
                },
                createRecipients:function(targets){
                    for(var i=0;i<targets.length;i++){
                        this.addToCol2(targets[i]);                       
                    }
                    this.targetsModelArray =  targets;
                    this.hideRecipients();
                },
                hideRecipients:function(){
                     for(var i=0;i<this.targetsModelArray.length;i++){                        
                        this.col1.find("tr[data-checksum='"+this.targetsModelArray[i].get("filterNumber.checksum")+"']").hide();
                    }
                },
                targetInRecipients:function(checksum){
                    var isExits = false;
                    if(this.targetsModelArray >0){
                        for(var i=0;i<this.targetsModelArray;i++){
                            if(this.targetsModelArray[i].get("filterNumber.checksum")==checksum)
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
                        that.loadTargets();
                    } else if (code == 8 || code == 46) {

                        if (!text) {
                            that.$el.find('.col1 #clearsearch').hide();
                            this.searchTxt = text;
                            that.loadTargets();
                        }
                    } else {
                        that.$el.find('.col1 #clearsearch').show();
                        clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                        that.timer = setTimeout(function() { // assign timer a new timeout 
                            if (text.length < 2)
                                return;
                            that.searchTxt = text;
                            that.loadTargets();
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
                    this.loadTargets();
                },
                showSearchFilters: function(text, total) {
                    this.$("#total_targets .badge").html(total);
                    this.$("#total_targets span").html("Campaign(s) found for  <b>\"" + text + "\" </b>");
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
                        this.loadTargets(this.offsetLength);
                    }
                },
                saveCall:function(){
                    var col2 = this.$(this.col2).find(".bDiv tbody");
                    if(col2.find("tr").length>0){
                       var pagesArray =  {}
                        var t =1;
                        _.each(this.targetsModelArray,function(val,key){
                           pagesArray["page"+t] = [{"checksum":val.get("filterNumber.checksum"),"encode":val.get("filterNumber.checksum")}] ;
                           t++;
                        },this);   
                        this.parent.modelArray = this.targetsModelArray;
                        this.parent.pagesArray = pagesArray;
                        this.dialog.hide();
                        this.parent.createTargets();
                    }
                    else{
                        this.app.showAlert("Please select at least on page",this.$el);
                    }
                },
              showSelectedTargets : function(lists){                                      
                  if(this.showSelectedRecords==false){
                    var selectedPages = this.parent.modelArray;
                    if(selectedPages.length){
                      for(var s=0;s<selectedPages.length;s++){                                
                           this.addToCol2(selectedPages[s]);                         
                      }                        
                    }
                    this.showSelectedRecords=true;
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
            showStart:function(){
                this.$(".start-message").show();                    
                this.$(".col2 .campaign-chart").hide();
                this.$(".selected-campaign").html('<option></option>').trigger("chosen:updated");
            },
            showDatePicker:function(){
                this.$('#clearcal').show();
                return false;
            },
            hideDatePicker:function(){
                this.$('#clearcal').hide();
                this.fromDate = "";
                this.toDate = "";
                this.$('#daterange').val('');   
                this.loadTargets();
            },
            showDatePickerFromClick:function(){
                this.$('#daterange').click();
                return false;
            },
            setDateRange:function() {
               var val = this.$("#daterange").val(); 
               if($.trim(val)){      
                    this.$('#clearcal').show();
                    var _dateRange = val.split("-");
                    var toDate ="",fromDate="";                  
                    if(_dateRange[0]){
                        fromDate = moment($.trim(_dateRange[0]),'M/D/YYYY');
                    }   
                    if($.trim(_dateRange[1])){
                        toDate = moment($.trim(_dateRange[1]),'M/D/YYYY');
                    }                    
                    if(fromDate){
                        this.fromDate = fromDate.format("MM-DD-YYYY");
                    }
                    if(toDate){
                        this.toDate = toDate.format("MM-DD-YYYY");
                    }   
                    this.loadTargets();
                    
               }
            },
            setDateRangeLi:function(obj){
                var target = $.getObj(obj,"li");
                if(!target.hasClass("ui-daterangepicker-dateRange")){
                    this.setDateRange();
                }
            }
        });
});