/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['jquery', 'backbone', 'underscore', 'app', 'text!contacts/html/multipleadd.html','fileuploader','bms-dragfile','bms-tags','scrollbox','contacts/subscriber_fields','jquery.bmsgrid','bms-addbox'],
	function ($, Backbone, _, app, template,fileuploader,dragfile,bmstags,scrollbox,sub_detail) {
		'use strict';
		return Backbone.View.extend({
                    
                id: '',
                tags : 'div',
                initialize: function () {
                          this.template = _.template(template);
                          this.app = app;
                          this.parent = this.options.sub; 
                          this.uploaded = 0;
                          this.isListSelected = false;
                          this.dialogStyles = {};
                          this.subsType = null;
                          this.render();
			},
                        events:{
                         'click .close-choose-bot':'closeDialog',
                         'click .single-sub': function(){this.chooseList('singlesub')},
                         'click .opencsv':'opeCSV',
                         'click .multisub-email': function(){this.chooseList('multiEmails')},
                        },
                        render : function(){
                            this.$el.html(this.template({}));
                        },
                        closeDialog : function(){
                             $(this.el).remove();
                             this.remove();
                             $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove();
                             $('.autobots-modal-in').remove();
                        },
                        
                       
                        /*====================================================
                         * 
                         * Lists viw loading
                         * 
                        ======================================================*/
                        chooseList: function(substype){
                            this.closeDialog();
                            this.subsType = substype;
                            var _this = this;
                            var dialog_width = 1000;
                            this.subsriberObj = {};
                            this.editable = true;
                                
                                var dialog_height = $(document.documentElement).height() - 192;
                                var btn_prp = {title: this.editable?'Add Contact':'View Profile',
                                    css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                                    headerEditable: false,
                                    headerIcon: 'account',
                                    bodyCss: {"min-height": dialog_height + "px"}

                                }
                                
                                if(this.editable){
                                    btn_prp['buttons']= {saveBtn: {text: 'Save', btnicon: 'save'}};
                                   // if (this.sub_fields["conLeadId"]) {
                                   //     btn_prp['newButtons'] = [{'btn_name': 'Update at Salesforce'}];
                                   // }
                                }
                                this.dialog = this.app.showDialog(btn_prp);
                                this.app.showLoading("Loading...", this.dialog.getBody());
                                
                                this.dialog.getBody().append('<div class="temp-filters clearfix" style="margin:0px;"><h2 class="header-list"><strong class="left" style="font-size:15px"> Choose existing list</strong><div class="iconpointy" style="top:3px;"><a class="btn-green add-list" title="Create List"><i class="icon plus left"></i></a></div></h2><div style=" " class="srt-div"><div id="" class="input-append search myimports-search"></div><a class="refresh_btn showtooltip" data-original-title="Refresh listing"><i>Refresh</i></a></div></div>  <div class="template-container fields bms-lists" style="margin:0 0 10px 0;"></div>')
                                 this.dialog.getBody().find(".myimports-search").searchcontrol({
                                        id:'newimports-search',
                                        width:'300px',
                                        height:'22px',
                                        gridcontainer: 'import-list-grid',
                                        placeholder: 'Search lists',                     
                                        showicon: 'yes',
                                        iconsource: 'list'
                                 });
                                this.dialog.getBody().find(".add-list").addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)}); 
                               this.dialog.getBody().find(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                                 if(this.subsType === 'multiEmails'){
                                    this.dialogStyles['height'] = dialog_height;
                                    this.dialogStyles['width'] = dialog_width;
                                    this.dialogStyles['top'] = '10px'; 
                                    this.dialog.getBody().css('overflow','hidden');
                                   this.subDetail = new sub_detail({ sub: this.parent,page:this,isSalesforceUser:false,isAddFlag:true,emailsFlag:true});    
                                }
                                this.getLists();
                                this.dialog.getBody().find('.refresh_btn').click(_.bind(function(){
                                        this.isListSelected = false;
                                        this.getLists();
                                },this))
                        },
                        getLists:function(){
                            this.app.showLoading("Loading Lists...",this.dialog.getBody());                                    
                            this.app.getData({
                                "URL":"/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=all",
                                "key":"lists",
                                "callback":_.bind(this.createListTable,this)
                            });
                          },
                        createListTable:function(xhr){
                                var camp_list_json = this.app.getAppData("lists");
                                this.app.showLoading(false,this.dialog.getBody());    
                                var i=0;
                                var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="import-list-grid"><tbody>';                    
                                $.each(camp_list_json.lists[0], _.bind(function(index, val) {  
                                    if(val[0]["isBounceSupressList"]==="false" && val[0]["isSupressList"]==="false"){
                                    list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" checksum="'+val[0]["listNumber.checksum"]+'">';                        
                                    list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div></td>';                        
                                    list_html += '<td><div class="subscribers lists_subscribers show" style="min-width:70px;"><strong><span><em>Contacts</em>'+val[0].subscriberCount+'</span></strong></div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green add select-list"><span>Select</span><i class="icon next"></i></a></div></td>';                        

                                    list_html += '</tr>';
                                    }else{
                                      i++;
                                    }
                                },this));
                                if(parseInt(camp_list_json.count)===i){
                                      list_html += '<tr><td colspan="2"><p class="notfound">No lists found.Please create new list</p><a class="btn-green left create-new-list" style="width: 139px; float: none ! important; margin: 5px auto;"><span>Create New</span><i class="icon plus"></i></td></tr>';  
                                }
                                list_html += '</tbody></table>';										
                                 
                                this.dialog.getBody().find(".bms-lists").html(list_html);
                                var listgridHeight = parseInt(this.dialog.options.bodyCss["min-height"])-20;
                                    listgridHeight = listgridHeight>300?listgridHeight:300;
                                    listgridHeight = listgridHeight - 41;
                                this.dialog.getBody().find("#import-list-grid").bmsgrid({
                                    useRp : false,
                                    resizable:false,
                                    colresize:false,
                                    height:listgridHeight,							
                                    usepager : false,
                                    colWidth : ['100%','90px']
                                });				
                                this.dialog.getBody().find(".bms-lists .select-list").click(_.bind(this.markSelectList,this));
                                if(this.dialog.$el.find('.modal-footer .nextbtn').length === 0){
                                    this.dialog.$el.find('.modal-footer .btn-gray').after('<a class="btn-green nextbtn pull-right"><span>Next</span><i class="icon next"></i></a>  ');
                                    this.dialog.$el.find('.modal-footer .btn-close').before('<a style="" class="btn-yellow left btn-backlists"><i class="icon back left"></i><span>Back</span></a>')
                                    this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists').hide();
                                    if(this.subsType==='singlesub'){ // Check if its subscriber
                                        this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.addSubscriber,this));
                                    }else{
                                        this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.multiEmails,this));
                                    }
                                    
                                this.dialog.$el.find('.modal-footer .btn-backlists').click(_.bind(this.showLists,this));
                                }
                                
                                //this.dialog.getBody().find('.create-new-list').addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)});
                                //.this.loadData(this.editImport);
                                if(this.newList){
                                    this.dialog.getBody().find(".bms-lists tr").removeClass("selected");
                                    this.dialog.getBody().find(".bms-lists tr[checksum='"+this.newList+"']").addClass("selected");
                                    this.dialog.getBody().find(".bms-lists tr[checksum='"+this.newList+"']").scrollintoview(); 
                                    this.newList = null;
                                }
                            },
                            markSelectList:function(e){
                                var target = $.getObj(e,"a");
                                var parent_row = target.parents("tr");
                                if(!parent_row.hasClass("selected")){
                                    this.dialog.getBody().find(".bms-lists tr").removeClass("selected");
                                    parent_row.addClass("selected");
                                }
                                this.isListSelected = true;
                            },
                            showLists : function(){
                                this.dialog.getBody().find('.temp-filters,.template-container').show();
                                this.dialog.getBody().find('.subscriber_field_form').remove();
                                this.dialog.getBody().find('#sub_fields_viaEmails_form').hide();
                               if( this.subsType === 'multiEmails'){
                                   this.dialog.$el.removeAttr('style');
                                   var margin = 
                                    this.dialog.$el.css({'margin-left':-Math.abs(this.dialogStyles.width/2),'width':this.dialogStyles.width,'top':this.dialogStyles.top});
                                    
                                    this.dialog.$el.find('.modal-body').css('min-height',this.dialogStyles.height);
                                    
                                }
                                this.dialog.$el.find('.modal-footer .nextbtn').show();
                                this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists,.modal-footer .btn-update').hide();
                            },
                            loadData:function(data){
                                    if (data) {
                                        this.tId = data.tId;
                                        this.editImport = data;
                                        if (data.name) {
                                            this.app.dialogArray[0].title = data.name;
                                        }
                                        this.$(".bms-lists tr").removeClass("selected");
                                        this.$(".bms-lists tr[checksum='" + data.checkSum + "']").addClass("selected");
                                        this.$(".bms-lists tr[checksum='" + data.checkSum + "']").scrollintoview();
                                        var list_ = this.$(".bms-lists tr[checksum='" + data.checkSum + "']").find(".name-type h3");
                                        if (list_.length) {
                                            list_ = this.app.encodeHTML(list_.html());
                                        }
                                        else {
                                            list_ = "Import";
                                        }
                                        var import_name = data.name ? data.name : list_;
                                        this.dialog.$("#dialog-title span").html(import_name);
                                        this.improtLoaded = false;
                                        this.showHideButton(true);
                                    }
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
                                        var add_box = this.dialog.getBody().find(".add-list").data("addbox");
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
                                                this.getLists();
                                                this.newList = _json[2];
                                            }
                                            else{
                                                this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                            }
                                        },this));
                            },
                            checkListName:function(listName){
                                var camp_list_json = this.app.getAppData("lists");
                                var isListExits = false;
                                this.app.showLoading(false,this.dialog.getBody().$el);                                                        			                    
                                $.each(camp_list_json.lists[0], _.bind(function(index, val) { 
                                    if(val[0].name==listName){
                                        isListExits = true;
                                        return false;
                                    }
                                },this));
                                return isListExits;
                            },
                        /*====================================================
                         * 
                         * Subscriber Form view 
                         * 
                        ======================================================*/  
                
                
                        addSubscriber: function(){
                            //this.closeDialog();
                            
                            if(!this.isListSelected){
                                this.app.showAlert('No List Selected',$("body"),{fixed:true});
                                return false;
                            }else{
                                this.dialog.getBody().find('.temp-filters,.template-container').hide();
                                this.dialog.$el.find('.modal-footer .nextbtn').hide();
                                this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists,.modal-footer .btn-update').show();
                                this.app.showLoading("Loading...", this.dialog.getBody());
                                var _this = this;
                                
                                require(["contacts/subscriber_fields"], function(sub_detail) {
                                    var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                                    var page = new sub_detail({sub: _this.parent,page:_this,isSalesforceUser:false,isAddFlag:true});
                                    _this.dialog.getBody().append(page.$el);
                                     page.$el.addClass('dialogWrap-' + dialogArrayLength);
                                    _this.app.showLoading(false, page.$el.parent());
                                    _this.dialog.saveCallBack(_.bind(page.createSubscriber, page, _this.dialog));
                                     page.$el.addClass('subscriber_field_form');
                                    _this.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                                    _this.app.dialogArray[dialogArrayLength - 1].currentView = page; // New Dialog
                                    
                                });
                            }
                        },
                
                
                
                         /*====================================================
                         * 
                         * CSV uploading view
                         * 
                        ======================================================*/
                        opeCSV : function(){
                                this.closeDialog();
                                this.app.mainContainer.csvUpload();
                        },
                         /*====================================================
                         * 
                         * Comma Separated Multiple emails
                         * 
                        ======================================================*/
                        multiEmails : function(){
                             this.closeDialog();
                            var _this = this;   
                                 if(!this.isListSelected){
                                    this.app.showAlert('No List Selected',$("body"),{fixed:true});
                                    return false;
                                }else{
                                    this.dialogStyles['modalstyle'] = this.dialog.$el.attr('style');
                                    this.dialogStyles['modalbody'] = this.dialog.$el.find('.modal-body').attr('style');
                                    var dialog_width = 1000;
                                    var dialog_height = $(document.documentElement).height() - 582;
                                    this.dialog.$el.css({"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"})
                                    this.dialog.$el.find('.modal-body').css('min-height',dialog_height);
                                    this.dialog.getBody().find('.temp-filters,.template-container').hide();
                                    this.dialog.$el.find('.modal-footer .nextbtn').hide();
                                    this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists,.modal-footer .btn-update').show();
                                    this.app.showLoading("Loading...", this.dialog.getBody());
                                    var dialog =this.dialog;
                                   
                                        var page = this.subDetail;
                                        if(dialog.getBody().find('.model_form').length === 0){
                                            dialog.getBody().append(page.$el);
                                        }else{
                                            page.$el.show();
                                            this.dialog.getBody().find('#sub_fields_viaEmails_form').show();
                                        }
                                        
                                        dialog.$el.find('.contactsEmails').focus();
                                        dialog.$el.find('.contactsEmails').css('width','935px');
                                        /*if (_this.sub_fields["conLeadId"]) {
                                            dialog.saveCallBack2(_.bind(page.updateSubscriberDetailAtSalesForce, page, dialog));
                                        }*/
                                        _this.app.showLoading(false, page.$el.parent());
                                        dialog.saveCallBack(_.bind(page.createSubscriberViaEmail, page, dialog));

                                   
                                }
                                
                        }
                })
        })
