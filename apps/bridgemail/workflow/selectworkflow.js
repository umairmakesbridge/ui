define(['text!workflow/html/selectworkflow.html', 'workflow/collections/workflows', 'workflow/workflow_row','bms-shuffle'],
function (template, WorkflowsCollection, workflowRowView) {
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
                        this.wfModelArray = [];                        
                        this.total = 0;
                        this.offsetLength = 0;
                        this.render();
                },

                render: function () {                       
                        this.$el.html(this.template({}));                            
                },
                init:function(){
                  
                    this.$("#workflowsearch").searchcontrol({
                            id:'wf-search',
                            width:'200px',
                            height:'22px',
                            gridcontainer: this.$('#targets_grid'),
                            placeholder: 'Search workflows',                     
                            showicon: 'yes',
                            iconsource: 'workflow-sicon',
                            searchFunc:_.bind(this.search,this)                            

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
                    this.loadWorkflows();
                    
                    //this.$(".col1 #workflow-search").on("keyup",_.bind(this.search,this));
                    //this.$(".col1 #clearsearch").on("click",_.bind(this.clearSearch,this));
                    
                  
                                        
                    this.$('.refresh_btn').click(_.bind(function(){                        
                        this.loadWorkflows();
                    },this));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                loadWorkflows:function(fcount){                  
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
                    var _data = {isJson:'Y',offset:0};                    
                                        
                    this.$('#targets_grid tbody .load-tr').remove();
                    this.$('#targets_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No pages founds!</div><div class='loading-target' style='margin-top:50px'></div></td></tr>");
                    this.app.showLoading("Please wait, loading workflows...", this.$el.find('#targets_grid tbody').find('.loading-target'));
                    this.$('#targets_grid tbody').find('.loading-target .loading p ').css('padding','30px 0 0');
                    this.workflowsCollection = new WorkflowsCollection();
                    this.request = this.workflowsCollection.fetch({data: _data,
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
                                var wfRow = new workflowRowView({model: model, sub: this,showUse:true});
                                this.$('#targets_grid tbody').append(wfRow.el);                                
                            }, this));
                                                                                    
                            

                            if (this.offsetLength == 0) {                                                            
                                this.$('.no-contacts').show();
                                this.$('.loading-target').hide();
                            }else{
                                if(!this.selectedLoaded){
                                   this.showSelectedWF(); 
                                }
                                this.$('#targets_grid tbody #loading-tr').remove();
                            }
                            this.hideRecipients();           

                        }, this),
                        error: function (collection, resp) {

                        }
                    });   
                },
                addToCol2:function(model){
                    var _view_obj ={model: model,sub:this};                    
                    _view_obj["showRemove"]=this.col1;                         
                     var _view = new workflowRowView(_view_obj);                                          
                     this.$(this.col2).find(".bDiv tbody").append(_view.$el);
                     this.wfModelArray.push(model);                                          
                },
                adToCol1:function(model){
                    for(var i=0;i<this.wfModelArray.length;i++){
                        if(this.wfModelArray[i].get("workflowId.checksum")==model.get("workflowId.checksum")){
                            this.wfModelArray.splice(i,1);
                            //this.targetsIdArray.splice(i,1);
                            break;
                        }
                    }
                    this.col1.find("tr[data-checksum='"+model.get("workflowId.checksum")+"']").show();
                },
                createRecipients:function(targets){
                    for(var i=0;i<targets.length;i++){
                        this.addToCol2(targets[i]);                       
                    }
                    this.wfModelArray =  targets;
                    this.hideRecipients();
                },
                hideRecipients:function(){
                     for(var i=0;i<this.wfModelArray.length;i++){                        
                        this.col1.find("tr[data-checksum='"+this.wfModelArray[i].get("workflowId.checksum")+"']").hide();
                    }
                },
                targetInRecipients:function(checksum){
                    var isExits = false;
                    if(this.wfModelArray >0){
                        for(var i=0;i<this.wfModelArray;i++){
                            if(this.wfModelArray[i].get("workflowId.checksum")==checksum)
                                {
                                    isExits = true;
                                    break;
                                }
                        }
                    }
                    return isExits;
                },
                search: function(ev) {
                    
                },
                clearSearch:function(){
                    
                },
                showSearchFilters: function(text, total) {
                    this.$("#total_targets .badge").html(total);
                    this.$("#total_targets span").html("Target(s) found for  <b>\"" + text + "\" </b>");
                },
                showSelectedWF : function(lists){                                      
                  var selectedPages = this.parent.modelArray;
                  if(selectedPages.length){
                    for(var s=0;s<selectedPages.length;s++){                                
                         this.addToCol2(selectedPages[s]);                         
                    }                        
                  }
                  this.selectedLoaded = true;
                          
                },
                saveCall:function(){
                    var col2 = this.$(this.col2).find(".bDiv tbody");
                    if(col2.find("tr").length>0){
                        if(this.wfModelArray.length <= 6){  
                            var wfArray =  {}
                             var t =1;
                             _.each(this.pagesModelArray,function(val,key){
                                wfArray["wf"+t] = [{"checksum":val.get("workflowId.checksum"),"encode":val.get("workflowId")}] ;
                                t++;
                             },this);   
                             this.parent.modelArray = this.wfModelArray;                             
                             this.dialog.hide(true);
                             this.parent.createWorkflow(true);
                        }
                        else{
                            setTimeout(_.bind(function(){this.app.showAlert("You cann't select more than 6 workflows",this.$el)},this),100);
                        }
                    }
                    else{
                        this.app.showAlert("Please select at least on workflow",this.$el);
                    }
                }
        });
});