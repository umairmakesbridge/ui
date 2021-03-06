/* 
 Module Name: Campaign Recipients Lists
 * Author:Abdullah Tariq    
 * Date Created:25 June 2014
 * Description:this view is called from campaign wizard, so changing this may cause problem in recipients list.
 */

define(['text!listupload/html/campaign_recipients_lists.html','listupload/collections/recipients_lists', 'listupload/views/campaign_recipients_list','bms-shuffle'],
function (template, ListsCollection, ListsView,moment) {
        'use strict';
        return Backbone.View.extend({  
                'className':'ListsViewWrap',
                events: {                   
                      "click .sortoption_expand": "toggleSortOption",
                      "click .stattype": "fitlerLists",
                      "click .status_tgl a": "toggleOrderOption",
                      "click .sortoption_sort": "toggleSortedOption"
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.parent = this.options.parent;
                        this.app = this.options.app;
                        this.dialog = this.options.dialog;
                        this.scrollElement = null;
                        this.total_fetch = 0;
                        this.editable=this.options.editable;                        
                        this.listsModelArray = [];
                        this.listsIdArray = [];
                        this.totalListArray = [];
                        this.total = 0;
                        this.status = "A";
                        this.type = "batches";
                        this.offsetLength = 0;
                        this.order = 'asc';
                        this.orderBy = 'name';
                        this.source = this.options.source?this.options.source:'';
                        this.render();
                },

                render: function () {                       
                        this.$el.html(this.template({})); 
                        this.init();
                },
                init:function(){
                  this.$('div#listrecpssearch').searchcontrol({
                            id:'list-recps-search',
                            width:'220px',
                            height:'22px',
                            placeholder: this.source=="" ? 'Search recipient list':"Search selected lists",
                            gridcontainer: 'recipients',
                            showicon: 'yes',
                            iconsource: 'list'
                     });    
                     
                     this.$el.find("#list_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:345,							
                            usepager : false,
                            colWidth : ['100%','100']
                    });
                    this.$("#choose_lists").shuffle({
                            gridHeight:345                            
                    });
                    this.col2 =  this.$("#choose_lists").data("shuffle").getCol2();
                    this.col1 = this.$("#list_grid tbody");
                    this.$("#list_grid").addClass('campaign_list_3col');
                    this.$("#recipients").addClass('campaign_list_3col');
                    this.scrollElement = this.$(".leftcol .bDiv");
                    this.loadLists();
                    this.scrollElement.scroll(_.bind(this.liveLoading,this));
                    this.scrollElement.resize(_.bind(this.liveLoading,this));
                    this.$('.refresh_btn').click(_.bind(function(){
                        this.app.showLoading("Loading Lists...",this.$el);  
                        this.loadLists();
                    },this));
                    this.$(".col1 #lists_search").on("keyup",_.bind(this.search,this));
                    this.$(".col1 #clearsearch").on("click",_.bind(this.clearSearch,this));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    var _this = this;
                    this.$("#test-chosen").chosen({no_results_text: 'Oops, nothing found!', width: "170px !important", disable_search: "true"}).change(function () {
                       var ptype = $(this).val();
                       if (ptype == "SS") {
                         _this.type = 'sharedList';                                
                        }else if (ptype == "name"){
                         _this.orderBy = 'name';
                        } else if(ptype == "date"){
                            _this.orderBy = 'date';
                        }else if(ptype=="A"){
                            _this.type = 'batches'; 
                        } 
                        _this.searchTxt = '';
                        _this.total_fetch = 0;
                        _this.loadLists();
                    });
                },
             
                loadLists:function(fcount){
                  var _data = {};
                    if (!fcount) {
                        this.offset = 0;
                        this.total_fetch = 0;
                        this.$el.find('#list_grid tbody').empty();
                        //this.objTargets = new ListsCollection();
                    }
                    else {
                        this.offset = this.offset + this.offsetLength;
                    }
                    if (this.request)
                        this.request.abort();
                    var that = this;
                    _data['offset'] = this.offset;
                    if (this.searchText) {
                        _data['searchText'] = this.searchText;
                        // that.showSearchFilters(this.searchText);
                    }
                    var that = this; // internal access
                    _data['type'] = this.type;
                    if(this.orderBy){
                        _data['orderBy'] = this.orderBy;
                    }
                    _data['order'] = this.order;
                    _data['campNum'] = this.options.campNum;
                    this.objTargets = new ListsCollection();
                    this.$el.find('#list_grid tbody .load-tr').remove();
                    this.$el.find('#list_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No Listings founds!</div><div class='loading-target' style='margin-top:50px'></div></td></tr>");
                    this.app.showLoading("Please wait, loading more lists.", this.$el.find('#list_grid tbody').find('.loading-target'));
                    this.$el.find('#list_grid tbody').find('.loading-target .loading p ').css('padding','30px 0 0');
                    this.request = this.objTargets.fetch({remove: false,data: _data, success: function(data) {
                            _.each(data.models, function(model) {
                                var _view_obj ={model: model, app: that.app,page:that,hidePopulation:true};
                                _view_obj["showUse"]=that.col2;
                               var _view = new ListsView(_view_obj);  
                               //that.totalListArray.push(that._view);
                                _view.$el.attr("_checksum",model.get("listNumber.checksum")); 
                                that.$el.find('#list_grid tbody').append(_view.$el);
                            });
                            
                            if (that.searchText) {
                                that.showSearchFilters(that.searchText, that.objTargets.total);
                            } else {
                                that.$("#total_lists .badge").html(that.objTargets.total);
                                that.$("#total_lists span").html(that.totalLabel());    
                            }
                            that.offsetLength = data.length;
                            that.total_fetch = that.total_fetch + data.length;
                            if (data.models.length == 0) {
                                that.$el.find('.no-contacts').show();
                                that.$el.find('#list_grid tbody').find('.loading-target').remove();
                            } else {                                
                                $('#list_grid tbody').find('.loading-target').remove();
                                that.$el.find('#list_grid tbody #loading-tr').remove();
                            }
                            
                            if (that.total_fetch < parseInt(that.objTargets.total)) {
                                that.$el.find("#list_grid tbody tr:last").attr("data-load", "true");
                            }
                            that.$el.find('#list_grid tbody').find('.tag').on('click', function() {
                                var html = $(this).html();
                                that.searchText = $.trim(html);
                                that.$el.find("#lists_search").val(that.searchText);
                                that.$el.find('.list-search-close').show();
                                that.loadLists();
                            });
                            
                            that.app.showLoading(false, that.el);
                            that.hideRecipients();
                            if(that.source=="report" && !that.selectedLoaded){
                                that.showSelectedList(); 
                            }
                            /*setInterval(function(){
                                that.updateRunningModels();
                            },30000);*/
                        }});
                },
                toggleOrderOption : function(ev){
                    var target = ev.currentTarget;
                    this.$el.find('.status_tgl a').removeClass('active');

                    if($(target).hasClass('dsctag')){
                       this.order = 'desc'; 
                       this.$el.find('.status_tgl a.asctag').addClass('active');
                    }else if($(target).hasClass('asctag')){
                        this.order = 'asc'; 
                        this.$el.find('.status_tgl a.dsctag').addClass('active');
                    }
                    this.loadLists();
                },
                toggleSortedOption: function (ev) {
                    $(this.el).find("#template_search_menu_sort").slideToggle();
                    ev.stopPropagation();
                },
                addToCol2:function(model){
                    this.$el.find('.recp_empty_info').hide();
                    var _view_obj ={model: model, app: this.app,page:this,hidePopulation:true};
                     _view_obj["showRemove"]=this.col1;
                     var _view = new ListsView(_view_obj);                                          
                     this.$(this.col2).find(".bDiv tbody").append(_view.$el);
                     _view.$el.attr("_checksum",model.get("listNumber.checksum"));
                     this.listsModelArray.push(model);
                     this.listsIdArray.push({encode : model.get("listNumber.encode"), checksum : model.get("listNumber.checksum"),name : model.get("name")});
                     _view.$el.find('.tags ul li').click(_.bind(function(ev){
                         var val = $(ev.target).text();
                         this.searchByTagTile(val);
                     },this));
                    // console.log(this.listsIdArray);
                },
                adToCol1:function(model){
                    for(var i=0;i<this.listsModelArray.length;i++){
                        if(this.listsModelArray[i].get("listNumber.checksum")==model.get("listNumber.checksum")){
                            this.listsModelArray.splice(i,1);
                            this.listsIdArray.splice(i,1);
                            break;
                        }
                    }
                    this.col1.find("tr[_checksum='"+model.get("listNumber.checksum")+"']").show();
                },
                deleteCol2:function(model){
                    for(var i=0;i<this.listsModelArray.length;i++){
                        if(this.listsModelArray[i].get("listNumber.checksum")==model.get("listNumber.checksum")){
                            this.listsModelArray.splice(i,1);
                            this.listsIdArray.splice(i,1);
                            break;
                        }
                    }
                },
               createRecipients:function(lists){
                   var collection = new Backbone.Collection(lists);
                    for(var i=0;i<collection.length;i++){
                        this.addToCol2(collection.models[i]);      
                    }
                    this.totalListArray =  collection.models;
                    this.hideRecipients();
                 
                },  
                 hideRecipients:function(){
                     for(var i=0;i<this.totalListArray.length;i++){                        
                        this.col1.find("tr[_checksum='"+this.totalListArray[i].get("listNumber.checksum")+"']").hide();
                    }
                }
                ,
                showSelectedList : function(){                                      
                  var selectedLists = this.parent.modelArray;
                  if(selectedLists.length){
                    for(var s=0;s<selectedLists.length;s++){                                
                         this.addToCol2(selectedLists[s]);                         
                         this.totalListArray.push(selectedLists[s]);
                    }                        
                  }               
                  this.selectedLoaded = true;
                  this.hideRecipients();                   
                },
              search:function(ev){
              this.searchText = '';
              this.searchTags = '';
              var that = this;
              var code = ev.keyCode ? ev.keyCode : ev.which;
              var nonKey =[17, 40 , 38 , 37 , 39 , 16];
              if ((ev.ctrlKey==true)&& (code == '65' || code == '97')) {
                    return;
              }
              if($.inArray(code, nonKey)!==-1) return;
               var text = $(ev.target).val();
             
               text = text.replace('Tag:', '');
                
                   
               if (code == 13 || code == 8){
                 that.$el.find('#clearsearch').show();
                
                 this.searchText = text;
                 that.loadLists();
               }else if(code == 8 || code == 46){
                    
                   if(!text){
                    that.$el.find('#clearsearch').hide();
                    this.searchText = text;
                    that.loadLists();
                   }
               }else{ 
                     that.$el.find('#clearsearch').show();
                     
                     clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                     that.timer = setTimeout(function() { // assign timer a new timeout 
                         if (text.length < 2) return;
                         that.searchText = text;
                         that.loadLists();
                    }, 500); // 2000ms delay, tweak for faster/slower
               }
            }, clearSearch:function(ev){
                   $(ev.target).hide();
                   $(".search-control").val('');
                   this.total = 0;
                   this.searchText = '';
                   this.searchTags = '';
                   this.total_fetch = 0; 
                   this.$("#total_lists span").html(this.totalLabel());
                   this.loadLists();
           },
                showSearchFilters: function(text, total) {
                    this.$("#total_lists .badge").html(total);
                    this.$("#total_lists span").html(this.totalLabel()+" for  <b>\"" + text + "\" </b>");
                },
                liveLoading: function(where) {
                    var $w = $(window);
                    var th = 200;

                    var inview = this.$el.find('table#list_grid tbody tr:last').filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.loadLists(this.offsetLength);
                    }
                },
                getListCol2 : function(){
                    var returnArray = [];
                    _.each(this.listsIdArray,function(val){
                        returnArray.push(val.encode);
                    })
                    return returnArray;
              },
              getRecipientListCol2 : function(){
                    return this.listsIdArray;
              },
              showRecList : function(lists){
                    /*var listArray = [];
                    $.each(lists.listNumbers[0], function(index, val) { 
                                           listArray.push(val[0]);
                                         });
                      //console.log(listArray.toString());
                    this.createRecipients(listArray)                     
                    //console.log(lists);*/
                   var listArray = [];
                    var recipientArray = [];
                    var offset = 0;
                    $.each(lists.listNumbers[0], function(index, val) { 
                                           listArray.push(val[0].encode);
                                         });
                      //console.log(listArray.toString());
                    //this.createRecipients(listArray)                     
                    //console.log(listArray.join());
                   var that = this;
                   var remove_cache = true;
                   //var _data = {offset:offset,type:'list_csv',listNum_csv:listArray.join()};
                   var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list_csv&listNum_csv="+listArray.join();
                   $.get( URL, function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                     $.each(rec_json.lists[0], function(index, val) { 
                                           recipientArray.push(val[0]);
                                         });
                     that.createRecipients(recipientArray) ;
                    });
                    
              },
              searchByTagTile:function(tag){
               this.$("#listrecpssearch #list-recps-search").val(tag);
               this.$("#listrecpssearch #clearsearch").show(); 
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
               //this.$(".total-count").html(count);
               //this.$(".total-text").html('My Nurture Tracks <b>found for tag &lsquo;' + tag + '&rsquo;</b>');
            },
            saveCall: function(){
                var col2 = this.$(this.col2).find(".bDiv tbody");
                if(col2.find("tr").length>0){
                    if(this.listsModelArray.length <= 6){  
                        var listArray =  {}
                         var t =1;
                         _.each(this.listsModelArray,function(val,key){
                            listArray["list"+t] = [{"checksum":val.get("listNumber.checksum"),"encode":val.get("listNumber.encode")}] ;
                            t++;
                         },this);   
                         this.parent.modelArray = this.listsModelArray;                             
                         this.dialog.hide(true);
                         this.parent.loadListsSummary(true);
                    }
                    else{
                        setTimeout(_.bind(function(){this.app.showAlert("You cann't select more than 6 lists",this.$el)},this),100);
                    }
                }
                else{
                    this.app.showAlert("Please select at least on list",this.$el);
                }
            },
            toggleSortOption: function (ev) {
                $(this.el).find(".shared-all-dropdown").slideToggle();
                ev.stopPropagation();
            },
            fitlerLists: function(obj){                               
                var target = $.getObj(obj, "a");
                var prevStatus = this.searchTxt;
                if (target.parent().hasClass('active')) {
                    return false;
                }
                this.$('.stattype').parent().removeClass('active');
                target.parent().addClass('active');
                var html = target.clone();
                $(this.el).find(".sortoption_expand").find('.spntext').html(html.html());                               
                $(this.el).find(".sortoption_sort").find('.spntext').html(html.html());                               

                var type = target.attr("search");
                if (!type){
                    type = this.$('#template_search_menu li.active a').attr('search');
                }
                this.status = type;                                    
                if (this.status !== prevStatus) {
                    this.$el.find('#lists_search').val('');
                    this.$el.find('#clearsearch').hide();
                     if (type == "SS") {
                         this.type = 'sharedList';                                
                     } else if (type == "F") { 
                         this.type = 'myAllSharedList';                                
                     }else if (type == "name"){
                         this.orderBy = 'name';
                     } else if(type == "date"){
                         this.orderBy = 'date';
                     } 
                     else {
                         this.type = 'batches';                                
                     }
                    this.searchTxt = '';
                }
                this.total_fetch = 0;
                this.loadLists();
            
        },
        totalLabel: function(){
            var label = "List(s) found";
            if (this.status == "SS") {
               label = 'Shared list(s) found';                                
            } else if (this.status == "F") { 
                label= 'My shared list(s) found';                                
            } else {
                label = 'List(s) found';                                
            }
            return label;
        }
        });
});
