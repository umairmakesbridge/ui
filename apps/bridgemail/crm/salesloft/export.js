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
                    this.$el.html(this.template({}));      	                    
                    this.$el.css({"position":"static","margin":"0px"});
                    this.initControl();   
                    
                },
                initControl:function(){
                    this.$("#import_time").chosen({no_results_text: 'Oops, nothing found!', width: "100%"});
                    this.$('input.checkinput').iCheck({
                        checkboxClass: 'checkinput'
                    });
                    this.getExportBot();                                                                                 
                },                
                loadTargets: function() {
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

                },
                getExportBot:function(){
                    var self = this;
                    var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getSLBot";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) { 
                            var exportBot = jQuery.parseJSON(xhr.responseText);
                            if(exportBot[0]!=="err"){
                                self.exportBot = exportBot;
                                self.getTargets();
                                self.setStatus();
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
                    this.$(".btn-activate").addClass("saving");
                    var URL = "/pms/io/trigger/saveAutobotData/";
                    var filterNumber = this.targetsModel.get("filterNumber.encode");
                    var senderAlert = this.$("#export_notification").prop("checked")?"Y":"N";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"playSLBot",filterNumber:filterNumber,recurPeriod:30,sendAlert:senderAlert,botId:this.exportBot["botId.encode"]};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        this.$(".btn-activate").removeClass("saving");                        
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
                    this.$(".btn-deactivate").addClass("saving");
                    var URL = "/pms/io/trigger/saveAutobotData/";                    
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"pauseSLBot",botId:this.exportBot["botId.encode"]};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        this.$(".btn-deactivate").removeClass("saving");                        
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
                    }
                    else{
                        this.$('.btn-activate,.edit-target').show();
                        this.$('.btn-deactivate').hide();
                        this.$('input.checkinput').iCheck('enable');
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
                }
        });
});