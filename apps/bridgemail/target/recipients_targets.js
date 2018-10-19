/* 
 * Module Name : Recipients Targets
 * Author: Pir Abdul Wakeel
 * Date Created: 05 May 2014
 * Description: targets are used to filter out contacts using rules ...
 & to send campaign on these filtered contacts
 you can view target wizard dialog in CampWiz @ Step3
 for listing page they are same ... targets are kind of list with rules to it.
 * 
 **/

define(['text!target/html/recipients_targets.html', 'target/collections/recipients_targets', 'target/views/recipients_target', 'app'],
        function(template, TargetsCollection, TargetView, app, addBox,chosen) {
            'use strict';
            return Backbone.View.extend({
               
                events: {
                    "keyup #grids_search": "search",
                    "click #clearsearch": "clearSearch",
                    'click #newTarget ,.create_new': "createTarget",
                    "click .closebtn": "closeContactsListing",
                    "click .refresh_btn":function(){
                        this.app.addSpinner(this.$el);
                        this.loadTargets();
                    },
                    "click .sortoption_expand": "toggleSortOption",
                    "click .stattype": "fitlerTargets"
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.request = null;
                    this.app = app;
                    this.total_fetch = 0;
                    this.objTargets = new TargetsCollection();
                    this.total = 0;
                    this.offsetLength = 0;
                    this.type = "batches";
                    this.showUse = false;                    
                    if(typeof this.options.showUseButton !="undefined"){
                        this.showUse = this.options.showUseButton;
                    }
                    this.dialog = null;
                    if(typeof this.options.type !="undefined"){
                        this.dialogType = this.options.type;
                        this.dialog = this.options.dialog;
                    } 
                    if(typeof(this.options.isSharedAllowed)!=="undefined" && this.options.isSharedAllowed==false){
                        this.doNotShowSharedTargets = true;
                    }   
                    this.render();
                },
                render: function(search) {
                    this.$el.html(this.template({}));
                    this.loadTargets();
                    var that = this;
                    
                    this.active_ws = this.$el.parents(".ws-content");
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                    if(this.dialog && this.dialogType=="autobots"){
                       var dialogBody = this.dialog.getBody();
                       dialogBody.scroll(_.bind(this.liveLoading, this));
                    }
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
                loadTargets: function(fcount) {
                    var _data = {};
                    if (!fcount) {
                        this.offset = 0;
                        this.total_fetch = 0;

                        this.$el.find('#targets_grid tbody').empty();
                    }else {
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
                    _data['type'] = this.type;//'batches';
                    _data['filterFor'] = 'C';                    

                    this.$el.find('#targets_grid tbody .load-tr').remove();
                    this.$el.find('#targets_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No targets founds!</div><div class='loading-target' style='margin-top:50px'></div></td></tr>");
                    this.app.showLoading("&nbsp;", this.$el.find('#targets_grid tbody').find('.loading-target'));
                    this.objTargets = new TargetsCollection();

                    this.request = this.objTargets.fetch({remove: false,data: _data, success: function(data) {
                            _.each(data.models, function(model) {
                                if(that.allowShared(model)){
                                                                    
                                    that.$el.find('#targets_grid tbody').append(new TargetView({model: model, app: app,page:that,showUse:that.showUse,type:that.dialogType,dialog:that.dialog}).el);
                                }
                            });
                             /*-----Remove loading------*/
                             that.app.removeSpinner(that.$el);
                             /*------------*/
                            if (that.searchText) {
                                that.showSearchFilters(that.searchText, that.objTargets.total);
                            } else {
                                that.$("#total_targets .badge").html(that.objTargets.total);
                                that.$("#total_targets span").html(that.totalLabel());    
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
                                that.$el.find("#grids_search").val(that.searchText);
                                that.$el.find('#clearsearch').show();

                                that.loadTargets();
                            });
                            that.app.showLoading(false, that.el);
                            setInterval(function(){
                                that.updateRunningModels();
                            },30000);
                        }});
                },
                allowShared:function(model){
                    var allow = true;
                    if(this.doNotShowSharedTargets) {
                        if(this.app.get("user").userId!==model.get('userId')){
                            allow =false;
                        }
                    }
                    return allow;
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
                        that.$el.find('#clearsearch').show();

                        this.searchText = text;
                        that.loadTargets();
                    } else if (code == 8 || code == 46) {

                        if (!text) {
                            that.$el.find('#clearsearch').hide();
                            this.searchText = text;
                            that.loadTargets();
                        }
                    } else {
                        that.$el.find('#clearsearch').show();

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
                    $(".search-control").val('');
                    this.total = 0;
                    this.searchText = '';
                    this.searchTags = '';
                    this.total_fetch = 0;
                    this.$("#total_targets span").html(this.totalLabel());    
                    this.loadTargets();
                },
                showSearchFilters: function(text, total) {
                    this.$("#total_targets .badge").html(total);
                    this.$("#total_targets span").html(this.totalLabel()+" for  <b>\"" + text + "\" </b>");
                },
                deleteTarget:function(ev){
                    
                },
                createTarget: function() {
                    var camp_obj = this;
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Create a new Target',
                      buttnText: 'Create',
                      bgClass :'target-tilt',
                      plHolderText : 'Enter target name here',
                      emptyError : 'Target name can\'t be empty',
                      createURL : '/pms/io/filters/saveTargetInfo/',
                      fieldKey : "filterName",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token'),filterFor:"C"},
                      saveCallBack :  _.bind(this.addTarget,this) // Calling same view for refresh headBadge
                    });
                },
                addTarget : function(fieldText, camp_json){
                    var target_id = camp_json[1];
                    if (this.states) {
                        this.states.step3.isNewTarget = true;
                        this.states.step3.newTargetName = fieldText;
                    }
                    this.initCreateEditTarget(target_id);
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
                           dialog.getBody().append(mPage.$el);
                           self.app.showLoading(false, dialog.getBody()); 
                           var dialogArrayLength = self.app.dialogArray.length;
                           mPage.$el.addClass('dialogWrap-'+dialogArrayLength);
                           self.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                           self.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New dialog
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                          //dialog.closeDialogCallBack(_.bind(mPage.closeCallBack,mPage));
                      });
                },
                closeContactsListing: function() {
                    $("#div_targets").empty('');
                    $("#div_targets").hide();
                },
                liveLoading: function(where) {
                    var $w = $(window);
                    var th = 200;

                    var inview = this.$el.find('table tbody tr:last').filter(function() {
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
                toggleSortOption: function (ev) {
                    $(this.el).find("#template_search_menu").slideToggle();
                    ev.stopPropagation();
                },
                fitlerTargets: function(obj){
                    var target = $.getObj(obj, "a");
                    var prevStatus = this.searchTxt;
                    if (target.parent().hasClass('active')) {
                        return false;
                    }
                    this.$('.stattype').parent().removeClass('active');
                    target.parent().addClass('active');
                    var html = target.clone();
                    $(this.el).find(".sortoption_expand").find('.spntext').html(html.html());                               

                    var type = target.attr("search");
                    if (!type){
                        type = this.$('#template_search_menu li.active a').attr('search');
                    }
                    this.status = type;                                    
                    if (this.status !== prevStatus) {
                        this.$el.find('#lists-search').val('');
                        this.$el.find('#clearsearch').hide();
                         if (type == "SS" || type == "F") {
                             this.type = 'sharedTarget';                                
                         } else {
                             this.type = 'batches';                                
                         }
                        this.searchTxt = '';
                    }
                    this.total_fetch = 0;
                    this.loadTargets();
                },
                totalLabel: function(){
                    var label = "Targets(s) found";
                    if (this.status == "SS") {
                       label = 'Shared target(s) found';                                
                    } else if (this.status == "F") { 
                        label= 'My shared target(s) found';                                
                    } else {
                        label = 'Target(s) found';                                
                    }
                    return label;
                }
                
            });
        });