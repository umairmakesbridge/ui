/* 
 * Name: Link View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!target/html/recipients_target.html', "target/copytarget"],
function (template,copytargetPage) {
        'use strict';
        return Backbone.View.extend({
            tagName:'tr',
            events: {
                "click .percent":'showPercentDiv',
                "click .pageview":'showPageViews',
                "click .edit-target":"editTarget",
                "click .copy-target":"copyTarget",
                "click .delete-target":"deleteTarget",
                "click .refresh":"refreshTarget",
                "click .preview":"previewTarget",
                "click .row-move":"addRowToCol2",
                "click .row-remove":"removeRowToCol2",
                "click .stop-target":"stopTargetDialog"
                   
            },
            initialize: function () {
                if(this.options.app){
                    this.app = this.options.app;
                    this.parent = this.options.page;
                }
                else{                    
                    this.parent = this.options.sub;
                    this.app = this.parent.app;
                }
                this.template = _.template(template);
                this.showUseButton = this.options.showUse;
                this.showRemoveButton = this.options.showRemove;
                this.fromReport = this.options.fromReport;
                this.showCheckbox = this.options.showCheckbox;
                this.maxWidth = this.options.maxWidth?this.options.maxWidth:'auto';
                this.hidePopulation = this.options.hidePopulation;
                this.dialogArray = this.options.dialogArray ;
                this.model.on('change',this.render,this);
                this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON())); 
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                if(this.showUseButton){
                    this.$el.attr("data-checksum",this.model.get("filterNumber.checksum"))
                }
                if(this.parent.searchText){
                    this.$(".edit-target").highlight($.trim(this.parent.searchText));
                    this.$(".tag").highlight($.trim(this.parent.searchText));
                }else{
                    this.$(".tag").highlight($.trim(this.parent.searchTags));
                }
            },
            
               deleteTarget:function(ev){
                var that = this;
                var target_id = $(ev.target).data('id');
                var bms_token =that.app.get('bms_token');
                 var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK="+bms_token;
                   that.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this target?",                                                
                            callback: _.bind(function(){													
                                that.app.showLoading("Deleting Target...",that.$el);
                                $.post(URL, {type:'delete',filterNumber:target_id})
                                    .done(function(data) {                  
                                          that.app.showLoading(false,that.$el);   
                                           var _json = jQuery.parseJSON(data);
                                           if(_json[0]!=='err'){
                                               $(ev.target).parents('tr').fadeOut('slow');
                                              
                                             }
                                           else{
                                                that.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                           }
                                   });
                            },that)},
                       $("body")); 
                
                },
                refreshTarget:function(ev){
                    if(this.model.get('filtersCount') == "0" || this.model.get('filtersCount') == ""){
                        this.app.showAlert("This Target is empty and can't be refreshed. Please add filters in it.",$("body"),{fixed:true}); 
                        return ;
                    }
                     var that = this;
                     var target_id = this.model.get('filterNumber.encode');
                     var bms_token =that.app.get('bms_token');
                     var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK="+bms_token;
                                    that.app.showLoading("Refreshing Target...",that.$el);
                                    $.post(URL, {type:'runPopulation',filterNumber:target_id})
                                        .done(function(data) {                  
                                              that.app.showLoading(false,that.$el);   
                                               var _json = jQuery.parseJSON(data);
                                               if(_json[0]!=='err'){
                                                   if (_json[1].indexOf("Error") >= 0){
                                                     that.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                                    }else{
                                                        that.model.set('status',"S");
                                                        that.render();
                                                    }
                                                    
                                                }
                                               else{
                                                    that.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                               }
                                   });
                
                },
                editTarget:function(ev){
                    var target_id = this.model.get('filterNumber.encode');
                    var self = this;
                    var isEditable = false;
                    var camp_parent_obj = this.parent;
                    if(this.options.type == "autobots_listing"){
                        if(this.options.editable == true){
                            this.previewTarget(target_id); 
                            return;
                        }
                    }else{
                        isEditable = false;
                    }
                    //console.log(isEditable);
                    var t_id = target_id?target_id:"";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              headerIcon : 'targetw',
                              wrapDiv : 'edit-target-view',
                              buttons: {saveBtn:{text:'Save Target'} },
                              
                        });         
                    this.app.showLoading("Loading...",dialog.getBody());                                  
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog,editable:isEditable,camp_parent_obj:camp_parent_obj,});
                           var dialogArrayLength = self.app.dialogArray.length; // New Dialog
                           dialog.getBody().append(mPage.$el);
                           mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                           self.app.showLoading(false, mPage.$el.parent());
                           self.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                           self.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New dialog
                            dialog.$el.find('#target_name').focus();    
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                           dialog.closeDialogCallBack(_.bind(mPage.closeCallBack,mPage));
                          //Autobots
                          if(self.options.type == "autobots_listing"){
                              dialog.$el.find('.modal-footer').find('.btn-save').removeClass('btn-green').addClass('btn-blue');
                              dialog.$el.find('.modal-footer').find('.btn-play').hide();
                              dialog.$el.find('.modal-header .cstatus').remove();
                          }
                      });
                       
                },
                
                copyTarget: function(ev) {
                    var target_id = $(ev.target).data('id');
                    var curview = this;
                    var camp_obj = this.parent;
                    var dialog_title = "Copy Target";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Copy Target'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    //require(["target/copytarget"], function(copytargetPage) {
                        var mPage = new copytargetPage({camp: camp_obj, app: curview.app, target_id: target_id, copydialog: dialog, editview: curview, source: 'edit'});
                        var dialogArrayLength = curview.app.dialogArray.length; // New Dialog
                        dialog.getBody().append(mPage.$el);
                        mPage.$el.find('#copy_name').focus();
                        
                        curview.app.showLoading(false, mPage.$el.parent());
                        mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        curview.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.copyTarget,mPage); // New Dialog
                        dialog.saveCallBack(_.bind(mPage.copyTarget, mPage));
                        mPage.$el.find("#copy_name").keyup(function (e) {
                        if (e.keyCode == 13) {
                            dialog.$el.find(".btn-save").click();
                            }
                        });
                    //});
                },
               previewTarget:function(ev){
                      if(this.options.type == "autobots_listing"){
                        if(this.options.editable == true){
                            var target_id = ev;
                        }else{
                            var target_id = $(ev.target).data('id');
                        }      
                      }else{
                           var target_id = $(ev.target).data('id');
                      }
                    var self = this;
                    var isEditable = true; // Future will be get from server side
                    var t_id = target_id?target_id:"";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              wrapDiv : 'edit-target-view',
                              headerIcon : 'targetw'
                        });        
                      this.app.showLoading("Loading...",dialog.getBody());                               
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog,editable:isEditable});
                           var dialogArrayLength = self.app.dialogArray.length; // New Dialog
                               dialog.getBody().append(mPage.$el);
                                self.app.showLoading(false, mPage.$el.parent());
                               mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                               dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                               self.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveTargetFilter,mPage); // New Dialog
                           mPage.$el.find('.addfilter').hide();
                           mPage.$el.find('#c_c_target .filter-div').append('<div class="block-mask"></div>');
                           dialog.$el.find('#dialog-title .pointy .delete').hide();
                      });
                },
            showPercentDiv:function(ev){
                   var target = $(ev.target);
                   var filterNumber = target.data('filter');
                   if($('.pstats').length > 0) $('.pstats').remove();
                   var that = this;
                   that.showLoadingWheel(true,target);
                   var bms_token =that.app.get('bms_token');
                   var URL = "/pms/io/filters/getTargetPopulation/?BMS_REQ_TK="+bms_token+"&filterNumber="+filterNumber+"&type=stats";
                   
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        var percentDiv ="<div class='pstats left-side' style='display:block'><ul><li class='openers'><strong>"+that.app.addCommas(data.openers)+"<sup>%</sup></strong><span>Openers</span></li>";
                         percentDiv =percentDiv + "<li class='clickers'><strong>"+that.app.addCommas(data.clickers)+"<sup>%</sup></strong><span>Clickers</span></li>";
                         percentDiv =percentDiv + "<li class='visitors'><strong>"+that.app.addCommas(data.pageviewers)+"<sup>%</sup></strong><span>Visitors</span></li></ul></div>";
                         that.showLoadingWheel(false,target);
                     target.parents('.percent_stats').append(percentDiv);
                                           	
                    });
                    that.app.showLoading(false, that.$el);
                } 
            ,
           showPageViews:function(ev){
                var that = this;
                var dialog_title = "Population of '"+this.model.get("name")+"'";
                var listNum = $(ev.target).data('id');
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-182;
                 var dialog = that.app.showDialog({
                                  title:dialog_title,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'population',
                                  wrapDiv : 'rcontacts-view',
                                  bodyCss:{"min-height":dialog_height+"px"},
                                  //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                        });     
                this.app.showLoading("Loading...",dialog.getBody());
                require(["recipientscontacts/rcontacts"],function(Contacts){
                  var objContacts = new Contacts({app:that.app,listNum:listNum,type:'target',dialogHeight:dialog_height});
                  var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                    dialog.getBody().append(objContacts.$el);
                    that.app.showLoading(false, objContacts.$el.parent());
                    objContacts.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                    objContacts.$el.find('#contacts_close').remove();
                    objContacts.$el.find('.temp-filters').removeAttr('style');
                   //Autobots
                          if(that.options.type == "autobots_listing"){
                              dialog.$el.find('.modal-header .cstatus').remove();
                              dialog.$el.find('.modal-footer').find('.btn-play').hide();
                          }
                });
           }
            ,
               showLoadingWheel:function(isShow,target){
               if(isShow)
                target.append("<div class='pstats left-side' style='display:block; background:#01AEEE;'><div class='loading-wheel right' style='margin-left:-10px;margin-top: -5px;position: inherit!important;'></div></div>")
               else{
                var ele = target.find(".loading-wheel") ;      
                    ele.remove();
                }
            },
            getProgressBar:function(){
                if(this.model.get('status') == "S") return 1 + "%";
                if(this.model.get('status') == "P"){
                    var progress = ((parseInt(this.model.get('totalCount')) - parseInt(this.model.get('pendingCount'))) / parseInt(this.model.get('totalCount'))  * 100);
                    progress = Math.ceil(progress);
                    progress = (isNaN(progress = parseInt(progress, 10)) ? 0 : progress)
                    if(progress !="Infinity" || progress!="NaN" )return progress + "%"; else return 0 + '%';
                    if(progress.isNaN || progress.isInfinity )  return  "0%"; else return progress + "%";
                }
            },
            getTooltipForStatus:function(){
                if(this.model.get('status') == "S") return "Population count is in progress 1%";
                if(this.model.get('status') == "P"){
                    var progress = ((parseInt(this.model.get('totalCount'))- parseInt(this.model.get('pendingCount'))) / parseInt(this.model.get('totalCount'))  * 100);
                    progress = Math.ceil(progress);
                    progress = (isNaN(progress = parseInt(progress, 10)) ? 0 : progress)
                    progress ="Population count is in progress " + progress ;
                    if(progress.isNaN || progress.isInfinity )  return  "Total count is 0"; else return progress + "%";
                }
            },
            addRowToCol2:function(){
                var that = this;
                if(this.showUseButton){
                    this.$el.fadeOut("fast",_.bind(function(){
                        if(that.options.type == "autobots"){
                            that.parent.options.page.addToCol2(this.model);
                            that.options.dialog.showPrevious();
                        }else{
                            this.parent.addToCol2(this.model);    
                            this.$el.hide();
                        }
                    },this));
                }
            },
            removeRowToCol2:function(){
                if(this.showRemoveButton){
                    this.$el.fadeOut("fast",_.bind(function(){                        
                        this.parent.adToCol1(this.model);    
                        this.$el.remove();
                    },this));
                }
            },
            stopTargetDialog: function(){
                this.app.showAlertPopup({heading: 'Confirm Target Stop',
                    detail: "Are you sure you want to stop this target refresh?",
                    text: "Stop",
                    icon: "stop-w",
                    callback: _.bind(this.stopTarget, this)},
                $('body'));
            },
            stopTarget: function(){
                var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=' + this.app.get('bms_token');
                this.app.showLoading("Stopping target...", this.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                $.post(URL, {type: 'stop', filterNumber: this.model.get('filterNumber.encode')})
                .done(_.bind(function (data) {
                    this.app.showLoading(false, this.$el.parents(".ws-content.active"));
                    var _json = jQuery.parseJSON(data);                    
                    if (_json[0] !== "err") {
                        this.app.showMessge("Target has been Stopped successfully!");                            
                        this.model.set('status',"D");
                        this.render();
                    }
                    else {
                        this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                    }

                }, this));
            },
            checkUncheck: function (obj) {
                var addBtn = $.getObj(obj, "a");
                if (addBtn.hasClass("unchecked")) {
                    addBtn.removeClass("unchecked").addClass("checkedadded");
                }
                else {
                    addBtn.removeClass("checkedadded").addClass("unchecked");
                }
                if (this.parent.createTargetChart) {
                    this.parent.createTargetChart();
                }
            }
                
        });    
});