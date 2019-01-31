define(['text!crm/salesloft/html/import.html','jquery.icheck','bms-addbox'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'cont-box row-fluid',
                events: {
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
                    this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)}); 
                    this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.getImport(true);
                    //this.setUpSalesforceFields();                                                                                     
                },
                filllistsdropdown: function () {
                    var list_array = '';
                    var list_html = "";                    
                    var app = this.app;
                    var curview = this;
                    curview.$el.find('#existing_lists').prop('disabled', true)
                    var URL = "/pms/io/list/getListData/?BMS_REQ_TK=" + app.get('bms_token') + "&type=all";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {                                                                                    
                            list_array = jQuery.parseJSON(xhr.responseText);
                            if (list_array != '')
                            {
                                var $i = 0;
                                var selected = "";
                                list_html +="<option value='' ></option>";
                                $.each(list_array.lists[0], function (index, val) {
                                    /*=========
                                     * Check if Supress List to be show
                                     * ========*/                                    
                                    if (val[0].isSupressList == "false" && val[0].isBounceSupressList == "false") {
                                        
                                        if(curview.importDetails && curview.importDetails.checkSum){
                                            if(curview.importDetails.checkSum==val[0]["listNumber.checksum"]){
                                                selected = "selected='selected'";
                                            }
                                        }
                                        list_html += "<option value='" + val[0]["listNumber.encode"] + "' data-checksum='" + val[0]["listNumber.checksum"] + "' "+selected+">" + val[0].name + "</option>";
                                    } else {
                                        $i++; // count total supress list
                                    }                                    
                                });
                                var total_count = parseInt(list_array.count);                                
                                if (total_count != 0) {
                                    curview.$el.find("#existing_lists").html(list_html);
                                    curview.$el.find('#existing_lists option[data-checksum="' + curview.listChecksum + '"]').prop('selected', true).trigger("chosen:updated")
                                    if(curview.importDetails && curview.importDetails.status=="D"){
                                        curview.$el.find('#existing_lists').prop('disabled', false).trigger("chosen:updated");
                                    }
                                    else if(!curview.importDetails){
                                        curview.$el.find('#existing_lists').prop('disabled', false).trigger("chosen:updated");
                                    }
                                } else {
                                    curview.$el.find('#existing_lists').prop('disabled', true).trigger("chosen:updated");
                                }
                                

                            }
                            app.setAppData('lists', list_array);
                            curview.$el.find("#existing_lists").chosen({no_results_text: 'Oops, nothing found!'});
                        }
                        curview.$el.parents("#accordion_import .ui-accordion-content").css({"overflow":""});
                    }).fail(function () {
                        console.log("error lists listing");
                    });

                },
                addlist:function(listName,ele){                    
                    if(this.checkListName(listName)){
                        this.app.showAlert("List already exists with same name",$("body"),{fixed:true});
                        return false;
                    }
                    if (listName.toLowerCase().indexOf("supress_list_") >= 0){
                        this.app.showAlert("List name with word supress_list_ not allowed",$("body"),{fixed:true});
                        return false;
                    }
                    var add_box = this.$(".add-list").data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    var URL = "/pms/io/list/saveListData/";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"create",listName:listName};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        add_box.dialog.find(".btn-add").removeClass("saving");
                        add_box.dialog.find(".input-field").val("");
                        add_box.hideBox();                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            this.app.removeCache("lists");
                            this.addListToExisting(listName,_json);                            
                        }
                        else{                            
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));
                },
                checkListName:function(listName){
                    var camp_list_json = this.app.getAppData("lists");
                    var isListExits = false;
                    this.app.showLoading(false,this.$el);                                                        			                    
                    $.each(camp_list_json.lists[0], _.bind(function(index, val) { 
                        if(val[0].name==listName){
                            isListExits = true;
                            return false;
                        }
                    },this));
                    return isListExits;
                },
                addListToExisting: function(list_name,data){                    
                    this.$("#existing_lists")[0].options[ this.$("#existing_lists")[0].options.length]= new Option(list_name, data[1]);
                    this.$("#existing_lists").val(data[1]).trigger("chosen:updated");
                }
                ,
                activate: function(){
                    this.$(".btn-activate").addClass("saving");
                    var URL = "/pms/io/salesloft/setup/";
                    var listNumber = this.$("#existing_lists").val();
                    var senderAlert = this.$("#import_notification").prop("checked")?"Y":"N";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"activateSynch",listNumber:listNumber,recurPeriod:30,sendAlert:senderAlert};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        this.$(".btn-activate").removeClass("saving");                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            this.app.showMessge("Import activated successfully!");                             
                            this.getImport();
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
                    var URL = "/pms/io/salesloft/setup/";                    
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"deactivateSynch"};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        this.$(".btn-deactivate").removeClass("saving");                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]=="success"){
                            this.app.showMessge("Import Dectivated successfully!"); 
                            this.getImport();
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
                getImport:function(firstCall){
                    var self = this;
                    var URL = "/pms/io/salesloft/setup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getSynch";
                    //this.app.showLoading("Checking Status...",this.$el);
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        //this.app.showLoading(false,this.$el);
                        if (xhr && xhr.responseText) { 
                            var importDetails = jQuery.parseJSON(xhr.responseText);
                            if(importDetails[0]!=="err"){
                                self.importDetails = importDetails;
                                self.setStat();                                
                            }
                            if(firstCall){
                                self.filllistsdropdown();
                            }
                        }
                    }).fail(function () {
                       console.log("Error in Import get call");
                    });
                },
                setStat:function(){                    
                    if(this.importDetails.status!="D"){                                               
                        this.$('#existing_lists').prop('disabled', true).trigger("chosen:updated");
                        this.$('.btn-activate').hide();
                        this.$('.btn-deactivate').show();
                        if(this.importDetails.alert=="y"){
                            this.$('input.checkinput').iCheck('check');
                        }
                        else{
                            this.$('input.checkinput').iCheck('uncheck');
                        }
                        this.$('input.checkinput').iCheck('disable');
                        this.$(".iconpointy").hide();
                    }
                    else{
                        this.$('#existing_lists').prop('disabled', false).trigger("chosen:updated");
                        this.$('.btn-activate').show();
                        this.$('.btn-deactivate').hide();
                        this.$('input.checkinput').iCheck('enable');
                        this.$(".iconpointy").show();
                    }
                },
                showMapping:function(){
                    var dialog = this.app.showDialog({title: 'SalesLoft Leads or/and Contacts to Import Mapping',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "443px"}
                    });

                    this.app.showLoading("Loading Mapping...", dialog.getBody());
                    require(["crm/salesloft/mapping"], _.bind(function (mappingPage) {
                        var mPage = new mappingPage({camp: this, app: this.app, dialog: dialog,fieldType:'import'});
                        dialog.getBody().html(mPage.$el);                        
                    },this));
                }
        });
});