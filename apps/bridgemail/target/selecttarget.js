define(['text!target/html/selecttarget.html','target/collections/recipients_targets', 'target/views/recipients_target','moment','jquery.bmsgrid','bms-shuffle'],
function (template, TargetsCollection, TargetView,moment) {
        'use strict';
        return Backbone.View.extend({                
                events: {                   
                      'click .add-target':'createTarget'
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.parent = this.options.page;
                        this.app = this.parent.app ;
                        this.dialog = this.options.dialog;
                        this.scrollElement = null;
                        this.total_fetch = 0;
                        this.editable=this.options.editable;
                        this.objTargets = new TargetsCollection();
                        
                        this.targetsModelArray = [];
                        this.targetsIdArray = [];
                        this.total = 0;
                        this.offsetLength = 0;
                        this.render();
                },

                render: function () {                       
                        this.$el.html(this.template({}));                            
                },
                init:function(){
                  this.$('div#targetrecpssearch').searchcontrol({
                            id:'target-recps-search',
                            width:'220px',
                            height:'22px',
                            placeholder: 'Search recipient targets',
                            gridcontainer: this.$('#area_choose_targets .col2'),
                            showicon: 'yes',
                            iconsource: 'target'
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
                    this.loadTargets();
                    this.scrollElement.scroll(_.bind(this.liveLoading,this));
                    this.scrollElement.resize(_.bind(this.liveLoading,this));
                    this.$(".col1 #target-search").on("keyup",_.bind(this.search,this));
                    this.$(".col1 #clearsearch").on("click",_.bind(this.clearSearch,this));
                    this.$('.refresh_btn').click(_.bind(function(){
                        this.app.showLoading("Loading Targets...",this.$el);  
                        this.loadTargets();
                    },this));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                updateRunningModels:function(){
                    var that = this;
                    var csv = "";
                    var runningModels = this.objTargets.filter(function(target) {
                        return target.get("status") === "P" || target.get("status") === "S" 
                    });
                    _.each(runningModels,function(model){
                        csv = csv + model.get('filterNumber.encode')+",";
                    })
                    if(csv)
                        that.checkForUpdatedModels(csv);
                },
                checkForUpdatedModels:function(csv){
                     if(!csv || csv == "") return;
                     var that = this;
                     var URL = "/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&filterNumber_csv="+csv+"&type=list_csv";
                     jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        _.each(data.filters[0],function(val,key){
                            val[0]._id = val[0]['filterNumber.encode'];
                             var model = that.objTargets.findWhere({name:val[0]['name']});
                             model.set('status', val[0]['status']);
                             model.set('totalCount', val[0]['totalCount']);
                             model.set('pendingCount', val[0]['pendingCount']);
                             model.set('populationCount', val[0]['populationCount']);
                             model.set('scheduleDate', val[0]['scheduleDate']);
                             
                        })    
                    });
                    //return isListExists;
                },
                loadTargets:function(fcount){
                  var _data = {};
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
                    var that = this;
                    _data['offset'] = this.offset;
                    if (this.searchText) {
                        _data['searchText'] = this.searchText;
                        // that.showSearchFilters(this.searchText);
                    }
                    var that = this; // internal access
                    _data['type'] = 'batches';
                    _data['filterFor'] = 'C';
                    if(typeof this.options.type !="undefined" && this.options.type == "autobots"){
                        var type = this.options.type;
                    }
                    //this.objTargets = new TargetsCollection();
                    this.$el.find('#targets_grid tbody .load-tr').remove();
                    this.$el.find('#targets_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No targets founds!</div><div class='loading-target' style='margin-top:50px'></div></td></tr>");
                    this.app.showLoading("&nbsp;", this.$el.find('#targets_grid tbody').find('.loading-target'));
                    this.objTargets = new TargetsCollection();
                    this.request = this.objTargets.fetch({remove: false,data: _data, success: function(data) {
                            _.each(data.models, function(model) {
                                var _view_obj ={type:type,model: model, app: that.app,page:that,hidePopulation:false};
                                if(that.editable){
                                    _view_obj["showUse"]=that.col2;
                                }
                                var _view = new TargetView(_view_obj);          
                                _view.$el.attr("_checksum",model.get("filterNumber.checksum"));                                
                                that.$el.find('#targets_grid tbody').append(_view.$el);
                            });
                            if (that.searchText) {
                                that.showSearchFilters(that.searchText, that.objTargets.total);
                            } else {
                                that.$("#total_targets .badge").html(that.objTargets.total);
                                that.$("#total_targets span").html("Target(s) found");    
                            }
                            that.offsetLength = data.length;
                            that.total_fetch = that.total_fetch + data.length;
                            if (data.models.length == 0) {
                                that.$el.find('.no-contacts').show();
                                that.$el.find('#targets_grid tbody').find('.loading-target').remove();
                            } else {
                                $('#targets_grid tbody').find('.loading-target').remove();
                                that.$el.find('#targets_grid tbody #loading-tr').remove();
                            }
                            if (that.total_fetch < parseInt(that.objTargets.total)) {
                                that.$el.find("#targets_grid tbody tr:last").attr("data-load", "true");
                            }
                            that.$el.find('#targets_grid tbody').find('.tag').on('click', function() {
                                var html = $(this).html();
                                that.searchText = $.trim(html);
                                that.$el.find("#target-search").val(that.searchText);
                                that.$el.find('#clearsearch').show();
                                that.loadTargets();
                            });
                            that.hideRecipients();
                            that.app.showLoading(false, that.el);
                            setInterval(function(){
                                that.updateRunningModels();
                            },30000);
                        }});
                },
                addToCol2:function(model){
                    var _view_obj ={model: model, app: this.app,page:this,hidePopulation:true};
                    if(this.editable){
                        _view_obj["showRemove"]=this.col1;
                    }
                    if(this.options.type == "autobots"){
                        if(this.targetsModelArray.length == 1) {
                             this.app.showAlert("Only one target allowed",$("body"),{fixed:true}); 
                            return;
                        }
                    }
                     var _view = new TargetView(_view_obj);                                          
                     this.$(this.col2).find(".bDiv tbody").append(_view.$el);
                     this.targetsModelArray.push(model);
                     this.targetsIdArray.push({encode : model.get("filterNumber.encode"), checksum : model.get("filterNumber.checksum"), name:model.get('name')});
                     _view.$el.find('.tags ul li').click(_.bind(function(ev){
                         var val = $(ev.target).text();
                         this.searchByTagTile(val);
                     },this));
                },
                adToCol1:function(model){
                    for(var i=0;i<this.targetsModelArray.length;i++){
                        if(this.targetsModelArray[i].get("filterNumber.checksum")==model.get("filterNumber.checksum")){
                            this.targetsModelArray.splice(i,1);
                            this.targetsIdArray.splice(i,1);
                            break;
                        }
                    }
                    this.col1.find("tr[_checksum='"+model.get("filterNumber.checksum")+"']").show();
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
                        this.col1.find("tr[_checksum='"+this.targetsModelArray[i].get("filterNumber.checksum")+"']").hide();
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
                    text = text.replace('Tag:', '');


                    if (code == 13 || code == 8) {
                        that.$el.find('.col1 #clearsearch').show();

                        this.searchText = text;
                        that.loadTargets();
                    } else if (code == 8 || code == 46) {

                        if (!text) {
                            that.$el.find('.col1 #clearsearch').hide();
                            this.searchText = text;
                            that.loadTargets();
                        }
                    } else {
                        that.$el.find('.col1 #clearsearch').show();

                        clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                        that.timer = setTimeout(function() { // assign timer a new timeout 
                            if (text.length < 2)
                                return;
                            that.searchText = text;
                            that.loadTargets();
                        }, 500); // 2000ms delay, tweak for faster/slower
                    }
                }, clearSearch: function(ev) {
                    $(ev.target).hide();
                    this.$(".col1 .search-control").val('');
                    this.total = 0;
                    this.searchText = '';
                    this.searchTags = '';
                    this.total_fetch = 0;
                    this.$("#total_targets span").html("Target(s) found");    
                    this.loadTargets();
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
                        this.loadTargets(this.offsetLength);
                    }
                },
                createTarget:function(){
                    var camp_obj = this;
                    var dialog_title = "New Target";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'targetw',
                        buttons: {saveBtn: {text: 'Create Target'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["target/newtarget"], function(newtargetPage) {
                        var mPage = new newtargetPage({camp: camp_obj, app: camp_obj.app, newtardialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.createTarget, mPage));
                        dialog.$el.find('#target_name').focus();
                    });
                },
                initCreateEditTarget:function(target_id){
                    var self = this;
                    var t_id = target_id?target_id:"";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              headerIcon : 'target_headicon',
                              buttons: {saveBtn:{text:'Save Target'} }                                                                           
                        });         
                    this.app.showLoading("Loading...",dialog.getBody());                                  
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog});
                           dialog.getBody().html(mPage.$el);
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                      });
                },
                saveCall:function(){
                    var col2 = this.$(this.col2).find(".bDiv tbody");
                    if(col2.find("tr").length>0){
                       var targetsArray =  {}
                        var t =1;
                        _.each(this.targetsModelArray,function(val,key){
                           targetsArray["target"+t] = [{"checksum":val.get("filterNumber.checksum"),"encode":val.get("filterNumber.encode")}] ;
                           t++;
                        },this);   
                        this.parent.targetsModelArray = this.targetsModelArray;
                        this.parent.targets = targetsArray;
                        this.dialog.hide();
                        this.parent.createTargets(true);
                    }
                    else{
                        this.app.showAlert("Please use targets",this.$el);
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
              showRecTarget : function(lists){
                   var _targetsArray = [];
                   var recipientArray = [];
                    var offset = 0;
                    $.each(lists.filterNumbers[0], function(index, val) { 
                                           _targetsArray.push(val[0].encode);
                                         });
                   var that = this;
                   var remove_cache = true;
                   var _data = {offset:offset,type:'list_csv',filterNumber_csv:_targetsArray.join()};
                    this.tracks_bms_request = this.objTargets.fetch({data:_data,remove: remove_cache,
                        success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            } 
                          
                            for(var s=offset;s<collection.length;s++){                                
                                this.addToCol2(collection.at(s));
                            }   
                            //console.log(recipientArray);
                            //this.createTargets();
                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                   
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
               //this.$(".total-count").html(count);
               //this.$(".total-text").html('My Nurture Tracks <b>found for tag &lsquo;' + tag + '&rsquo;</b>');
            },
        });
});