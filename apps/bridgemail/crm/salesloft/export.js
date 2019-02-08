define(['text!crm/salesloft/html/export.html','jquery.icheck'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'cont-box row-fluid',
                events: {
                    'click .target-select':'loadTargets',
                    'click .edit-target':'loadTargets',
                    'click .btn-activate':'activate',
                    'click .btn-deactivate':'deactivate',
                    'click .field-mapping':'showMapping'
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	                                        
                    this.render();                            
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.targetCount = 0;
                    this.totalCount = 0;
                    this.$el.html(this.template({}));      	                    
                    this.$el.css({"position":"static","margin":"0px"});
                    this.initControl();   
                    
                },
                initControl:function(){
                    this.$("#import_time").chosen({no_results_text: 'Oops, nothing found!', width: "100%"});
                    this.$('input.checkinput').iCheck({
                        checkboxClass: 'checkinput'
                    });
                    this.$("#existing_targets").chosen({no_results_text: 'Oops, nothing found!'});
                    this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new target name',addCallBack:_.bind(this.addtarget,this)}); 
                    this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.getExportBot();                                                                                 
                },    
                loadAllTargets:function(){
                    var _this = this;
                    this.$("#existing_targets").prop('disabled', true).trigger("chosen:updated");
                    var selectedVal = "";
                    var URL = "/pms/io/filters/getTargetInfo/?BMS_REQ_TK=" + this.app.get('bms_token') + "&offset="+this.targetCount+"&type=batches&filterFor=C";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {                                                                                    
                            var targets_array = jQuery.parseJSON(xhr.responseText);
                            _.each(targets_array.filters[0],function(val,key){                      
                                 val[0]['filterNumber.encode'];
                                _this.$("#existing_targets")[0].options[ _this.$("#existing_targets")[0].options.length]= new Option(_this.app.decodeHTML(val[0]['name']), val[0]['filterNumber.encode']);                                
                                if(_this.exportBot['filterNumber.checksum']===val[0]['filterNumber.checksum'])  {
                                   selectedVal =val[0]['filterNumber.encode'];
                                } 
                            })  
                            if(selectedVal){
                                _this.$("#existing_targets").val(selectedVal);
                            }
                            _this.totalCount =  _this.totalCount + parseInt(targets_array.batchCount);
                            if(_this.totalCount==parseInt(targets_array.totalCount)){
                                _this.$("#existing_targets").prop('disabled', false).trigger("chosen:updated");                                
                                _this.setStatus();
                            }
                            else{
                                _this.targetCount = _this.targetCount + 20;
                                _this.loadAllTargets();
                            }
                        }
                    });
                }
                ,
               /* loadTargets: function() {
                    if(this.exportBot && this.exportBot.status!=="D") return false;
                    var dialog_object = {title: 'Select Targets',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                    var dialog = this.app.showDialog(dialog_object);

                    this.options.app.showLoading("Loading Targets...", dialog.getBody());

                    require(["target/recipients_targets"], _.bind(function(page) {
                        var targetsPage = new page({page: this, dialog: dialog, editable: true, type: "autobots", showUseButton: true, subType:'crm'});
                        dialog.getBody().append(targetsPage.$el);
                        this.app.showLoading(false, targetsPage.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        targetsPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog                        

                    }, this));

                },*/
                getExportBot:function(){
                    var self = this;
                    var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getSLBot";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) { 
                            var exportBot = jQuery.parseJSON(xhr.responseText);
                            if(exportBot[0]!=="err"){
                                self.exportBot = exportBot;
                                self.getTargets();                                
                                self.loadAllTargets();
                            }
                        }
                    }).fail(function () {
                       console.log("Error in Import get call");
                    });
                },
                getTargets: function() {
                    var that = this;
                    var bms_token = that.app.get('bms_token');
                    if(this.exportBot){
                        that.$(".target-select").html("Loading...");
                        this.filterNumber = this.exportBot['filterNumber.encode'];
                        if (this.filterNumber == "") {
                            return;
                        }
                        var URL = "/pms/io/filters/getTargetInfo/?BMS_REQ_TK=" + bms_token + "&filterNumber=" + this.filterNumber + "&type=get";
                        jQuery.getJSON(URL, function(tsv, state, xhr) {
                            var data = jQuery.parseJSON(xhr.responseText);
                            if (that.app.checkError(data)) {
                                return false;
                            }
                            that.$(".target-select").text(data.name)                            
                            that.targetsModel = new Backbone.Model(data);    
                        });
                    }
                },
                addToCol2: function(model) {
                    this.targetsModel = model;                 
                    this.$(".target-select").text(model.get("name"));                               
                },
                activate: function(){
                    this.$(".btn-activate").addClass("activating");
                    var URL = "/pms/io/trigger/saveAutobotData/";
                    var filterNumber = this.$("#existing_targets").val();
                    var senderAlert = this.$("#export_notification").prop("checked")?"Y":"N";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"playSLBot",filterNumber:filterNumber,recurPeriod:30,sendAlert:senderAlert,botId:this.exportBot["botId.encode"]};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        this.$(".btn-activate").removeClass("activating");                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            this.app.showMessge("Export activated successfully!");                             
                            this.exportBot.status = "R";
                            this.getExport();                            
                        }
                        else{
                            if(_json[1]){
                                this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                            }
                            else{
                                this.app.showAlert("There is some problem API.",{fixed:true}); 
                            }
                        }
                    },this));
                },
                deactivate: function(){
                    this.$(".btn-deactivate").addClass("deactivating");
                    var URL = "/pms/io/trigger/saveAutobotData/";                    
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"pauseSLBot",botId:this.exportBot["botId.encode"]};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        this.$(".btn-deactivate").removeClass("deactivating");                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]=="success"){
                            this.app.showMessge("Export Dectivated successfully!"); 
                            this.exportBot.status = "D";
                            this.getExport();                            
                        }
                        else{
                            if(_json[1]){
                                this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                            }
                            else{
                                this.app.showAlert("There is some problem API.",$("body"),{fixed:true}); 
                            }
                        }
                    },this));
                },
                getExport:function(){
                    this.setStatus();
                },
                setStatus:function(){
                    if(this.exportBot && this.exportBot.status!=="D"){
                        this.$('.btn-activate,.edit-target').hide();
                        this.$('.btn-deactivate').show();                        
                        this.$('input.checkinput').iCheck('disable');
                        this.$("#existing_targets").prop('disabled', true).trigger("chosen:updated");
                        this.$(".iconpointy").hide();
                    }
                    else{
                        this.$('.btn-activate,.edit-target').show();
                        this.$('.btn-deactivate').hide();
                        this.$('input.checkinput').iCheck('enable');
                        this.$("#existing_targets").prop('disabled', false).trigger("chosen:updated");
                        this.$(".iconpointy").show();
                    }
                    if(this.exportBot && this.exportBot.isAlert=="Y"){
                       this.$('input.checkinput').iCheck('check');     
                    }
                    else{
                       this.$('input.checkinput').iCheck('uncheck');
                    }
                },
                showMapping:function(){
                    var dialog = this.app.showDialog({title: 'Export Mapping',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "410px"}
                    });

                    this.app.showLoading("Loading Mapping...", dialog.getBody());
                    require(["crm/salesloft/mapping"], _.bind(function (mappingPage) {
                        var mPage = new mappingPage({camp: this, app: this.app, dialog: dialog,fieldType:'export'});
                        dialog.getBody().html(mPage.$el);                        
                    },this));
                },
                addtarget:function(targetName,ele){
                    
                    var add_box = this.$(".add-list").data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    var URL = "/pms/io/filters/saveTargetInfo/";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"create",filterFor:"C",filterName:targetName};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        add_box.dialog.find(".btn-add").removeClass("saving");
                        add_box.dialog.find(".input-field").val("");
                        add_box.hideBox();                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){                            
                            this.addTargetToExisting(targetName,_json);    
                            var self = this;
                            var t_id =_json[1];
                            var dialog_title = t_id ? "Edit Target" : "";
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
                        }
                        else{                            
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));                    
                },
                addTargetToExisting:function(list_name,data){
                    this.$("#existing_targets")[0].options[ this.$("#existing_targets")[0].options.length]= new Option(list_name, data[1]);
                    this.$("#existing_targets").val(data[1]).trigger("chosen:updated");
                }
        });
});