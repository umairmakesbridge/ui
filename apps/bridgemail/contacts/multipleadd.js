/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['text!contacts/html/multipleadd.html', 'app', "contacts/subscriber_fields"],
        function (template, app, sub_detail) {
            'use strict';
            return Backbone.View.extend({
                id: '',
                tags: 'div',
                initialize: function () {
                    this.template = _.template(template);
                    this.app = app;
                    this.parent = this.options.sub;
                    this.uploaded = 0;
                    this.isListSelected = false;
                    this.dialogStyles = {};
                    this.showPageList = false;
                    this.subsType = null;
                    this.subsriberObj = {};
                    this.listNum = (this.options.listobj) ? this.options.listobj.newList : "";
                    this.listChecksum = (this.options.listobj) ? this.options.listobj.listChecksum : '';
                    this.render();
                },
                events: {
                    'click .close-choose-bot': 'closeDialog',
                    'click .single-sub': function () {
                        if(this.listNum){
                            this.isListSelected = true;
                            this.createDialog('singlesub');
                        }else{
                            this.chooseList('singlesub')
                        }
                        
                    },
                    'click .opencsv': 'opeCSV',
                    'click .multisub-email': function () {
                        if(this.listNum){
                            this.isListSelected = true;
                            this.createDialog('multiEmails');
                        }else{
                        this.chooseList('multiEmails')
                        }
                    },
                },
                render: function () {
                    this.$el.html(this.template({}));
                },
                closeDialog: function () {
                    $(this.el).remove();
                    this.remove();
                    $("#new_autobot").parents('.campaign-content').find('.autobots-modal-in').remove();
                    $('.autobots-modal-in').remove();
                },
                /*====================================================
                 * Creates the Dialog
                 ====================================================*/
                createDialog : function(substype){
                    
                    this.editable=true;
                    var dialog_width = 1000;
                    var dialog_height = $(document.documentElement).height() - 192;
                    var btn_prp = {title: (this.editable) ? 'Add Contact' : 'View Profile',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'account',
                        bodyCss: {"min-height": dialog_height + "px"}

                    }

                    if (this.editable) {
                        btn_prp['buttons'] = {saveBtn: {text: 'Save', btnicon: 'save'}};
                    }
                    this.dialog = this.app.showDialog(btn_prp);
                    this.closeDialog();
                    if(substype=='singlesub'){
                           this.addSubscriber();
                    }else if(substype=='multiEmails'){
                        this.subDetail = new sub_detail({sub: this.parent, page: this, isSalesforceUser: false, isAddFlag: true, emailsFlag: true,listNum:this.listNum});
                        this.multiEmails();
                    }
                },
                /*====================================================
                 * 
                 * Lists viw loading
                 * 
                 ======================================================*/
                chooseList: function (substype) {
                    this.closeDialog();
                    this.subsType = substype;
                    var _this = this;
                    var dialog_width = 1000;
                    this.editable = true;

                    var dialog_height = $(document.documentElement).height() - 192;
                    var btn_prp = {title: this.editable ? 'Add Contact' : 'View Profile',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'account',
                        bodyCss: {"min-height": dialog_height + "px"}

                    }

                    if (this.editable) {
                        btn_prp['buttons'] = {saveBtn: {text: 'Save', btnicon: 'save'}};
                        // if (this.sub_fields["conLeadId"]) {
                        //     btn_prp['newButtons'] = [{'btn_name': 'Update at Salesforce'}];
                        // }
                    }
                    this.dialog = this.app.showDialog(btn_prp);
                    this.app.showLoading("Loading...", this.dialog.getBody());

                    this.dialog.getBody().append('<div class="temp-filters clearfix" style="margin:0px;"><h2 class="header-list"><strong class="left" style="font-size:15px"> Choose existing list</strong><div class="iconpointy" style="top:3px;"><a class="btn-green add-list" title="Create List"><i class="icon plus left"></i></a></div></h2><div style=" " class="srt-div"><div id="" class="input-append search myimports-search"></div><a class="refresh_btn showtooltip" data-original-title="Refresh listing"><i>Refresh</i></a></div></div>  <div class="template-container fields bms-lists sub-bms-list" style="margin:0 0 10px 0;"></div>')
                    this.dialog.getBody().find(".myimports-search").searchcontrol({
                        id: 'newimports-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchedtext, this),
                        gridcontainer: 'import-list-grid',
                        placeholder: 'Search lists',
                        tdNo: 2,
                        showicon: 'yes',
//                                        searchFunc: _.bind(this.searchedtext, this),
                        iconsource: 'list'
                    });
                    this.dialog.getBody().find(".taglink").highlight($.trim(this.tagTxt));
                    this.dialog.getBody().find(".add-list").addbox({app: this.app, placeholder_text: 'Enter new list name', addCallBack: _.bind(this.addlist, this)});
                    this.dialog.getBody().find(".add-list").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    if (this.subsType === 'multiEmails' || this.subsType === 'singlesub') {
                        this.dialogStyles['height'] = dialog_height;
                        this.dialogStyles['width'] = dialog_width;
                        this.dialogStyles['top'] = '10px';
                        if (this.subsType === 'multiEmails') {
                            this.dialog.getBody().css('overflow', 'hidden');
                        }
                        this.subDetail = new sub_detail({sub: this.parent, page: this, isSalesforceUser: false, isAddFlag: true, emailsFlag: true});
                    }
                    this.getLists();
                    this.dialog.getBody().find('.refresh_btn').click(_.bind(function () {
                        this.isListSelected = false;
                        this.getLists();
                    }, this))

                },
                searchedtext: function () {
                    this.dialog.getBody().find(".taglink").highlight($.trim(this.tagTxt));
                },
                getLists: function () {
                    this.app.showLoading("Loading Lists...", this.dialog.getBody());
                    this.app.getData({
                        "URL": "/pms/io/list/getListData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=all",
                        "key": "lists",
                        "callback": _.bind(this.createListTable, this)
                    });
                },
                createListTable: function (xhr) {
                    var camp_list_json = this.app.getAppData("lists");
                    this.app.showLoading(false, this.dialog.getBody());
                    var i = 0;
                    var subsCount = null;
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="import-list-grid"><tbody>';
                    $.each(camp_list_json.lists[0], _.bind(function (index, val) {
                        if (val[0].subscriberCount != "0") {
                            subsCount = '<a class="pageview showtooltip" data-original-title="Click to view population detail"  data-id="' + val[0]["listNumber.encode"] + '">' + val[0].subscriberCount + '</a>';
                        } else {
                            subsCount = val[0].subscriberCount;
                        }

                        if (val[0]["isBounceSupressList"] === "false" && val[0]["isSupressList"] === "false") {
                            list_html += '<tr id="row_' + val[0]["listNumber.encode"] + '" checksum="' + val[0]["listNumber.checksum"] + '">';
                            list_html += '<td style="padding: 2px;width:40px;"><div><input class="check-list" type="checkbox" value="' + val[0]["listNumber.encode"] + '" list_checksum="' + val[0]["listNumber.checksum"] + '" /></div></td>'
                            list_html += '<td><div class="name-type"><h3>' + val[0].name + '</h3><div class="tags tagscont">' + this.app.showTags(val[0].tags) + '</div></div></td>';
                            list_html += '<td><div class="subscribers lists_subscribers " style="min-width:90px;text-align:right;"><strong><span><em>Contacts</em>' + subsCount + '</span></strong></div></td>';
                            list_html += '</tr>';
                        } else {
                            i++;
                        }
                    }, this));
                    if (parseInt(camp_list_json.count) === i) {
                        list_html += '<tr><td colspan="2"><p class="notfound">No lists found.Please create new list</p><a class="btn-green left create-new-list" style="width: 139px; float: none ! important; margin: 5px auto;"><span>Create New</span><i class="icon plus"></i></td></tr>';
                    }
                    list_html += '</tbody></table>';

                    this.dialog.getBody().find(".bms-lists").html(list_html);
                    var listgridHeight = parseInt(this.dialog.options.bodyCss["min-height"]) - 20;
                    listgridHeight = listgridHeight > 300 ? listgridHeight : 300;
                    listgridHeight = listgridHeight - 41;
                    this.dialog.getBody().find("#import-list-grid").bmsgrid({
                        useRp: false,
                        resizable: false,
                        colresize: false,
                        height: listgridHeight,
                        usepager: false,
                        colWidth: ['100px', '100%', '90px']
                    });

                    this.dialog.getBody().find(".bms-lists .select-list").click(_.bind(this.markSelectList, this));
                    this.dialog.getBody().find(".bms-lists .bDiv").css('overflow-x', 'hidden')
                    if (this.dialog.$el.find('.modal-footer .nextbtn').length === 0) {
                        this.dialog.$el.find('.modal-footer .btn-gray').after('<a class="btn-green nextbtn pull-right"><span>Next</span><i class="icon next"></i></a>  ');
                        this.dialog.$el.find('.modal-footer .btn-close').before('<a style="" class="btn-yellow left btn-backlists"><i class="icon back left"></i><span>Back</span></a>')
                        this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists').hide();
                        if (this.subsType === 'singlesub') { // Check if its subscriber
                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.addSubscriber, this));
                        } else {
                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.multiEmails, this));
                        }

                        this.dialog.$el.find('.modal-footer .btn-backlists').click(_.bind(this.showLists, this));
                    }
                    /*ICHECK IMPLEMENTATION BY ABDULLAH*/
                    if (this.dialog.getBody().find('#import-list-grid .check-list').iCheck) {
                        this.icheckCreate(this.dialog.getBody().find('#import-list-grid .check-list'));
                    }
                    /*Ends*/
                    var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                    this.dialog.getBody().find('.temp-filters,.template-container').addClass('dialogWrap-' + dialogArrayLength);
                    this.dialog.getBody().find('.pageview').click(_.bind(function (ev) {
                        this.showPageViews(ev);
                        ev.stopPropagation();
                    }, this))
//                               this.dialog.$el.find('.btn-close').click(_.bind(function(){
//                                   this.dialog.$el.remove();
//                               },this))
                    //this.dialog.getBody().find('.create-new-list').addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)});
                    //.this.loadData(this.editImport);
                    this.dialog.getBody().find(".taglink").click(_.bind(this.tagClick, this));
                    this.dialog.getBody().find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    if (this.newList) {
                        this.dialog.getBody().find(".bms-lists tr").removeClass("selected");
                        this.dialog.getBody().find(".bms-lists tr[checksum='" + this.newList + "']").addClass("selected");
                        this.dialog.getBody().find(".bms-lists tr[checksum='" + this.newList + "']").scrollintoview();
                        this.dialog.getBody().find(".bms-lists tr[checksum='" + this.newList + "']").iCheck('check');
                        this.newList = null;
                    }

                },
                markSelectList: function (e) {
                    var target = $.getObj(e, "a");
                    var parent_row = target.parents("tr");
                    if (!parent_row.hasClass("selected")) {
                        this.dialog.getBody().find(".bms-lists tr").removeClass("selected");
                        this.dialog.getBody().find(".bms-lists .check-list").iCheck('uncheck');
                        parent_row.addClass("selected");
                        parent_row.find(".check-list").iCheck('check');
                    }
                    this.isListSelected = true;
                },
                showLists: function () {
                    this.dialog.getBody().find('.temp-filters,.template-container').show();
                    this.dialog.getBody().find('.subscriber_field_form').remove();
                    this.dialog.getBody().find('#sub_fields_viaEmails_form').hide();
                    this.dialog.$el.find('.btn-closebk,.toolbar .closebk').remove();
                    this.dialog.$el.find('.btn-close,.toolbar .close').show();
                    this.dialog.$el.find('.btn-close,.toolbar .close').click(_.bind(function () {
                        this.dialog.hide();
                        this.dialog.$el.find('.btn-close,.toolbar .close').click();
                    }, this))

                    if (this.subsType === 'multiEmails' || this.subsType === 'singlesub') {
                        this.dialog.$el.removeAttr('style');

                        this.dialog.$el.css({'margin-left': -Math.abs(this.dialogStyles.width / 2), 'width': this.dialogStyles.width, 'top': this.dialogStyles.top});

                        this.dialog.$el.find('.modal-body').css('min-height', this.dialogStyles.height);
                        this.dialog.$el.find('#dialog-title .dialog-title').html('Add Contacts')
                    }
                    if (!this.isListSelected) {
                        this.dialog.$el.find('.modal-footer .btn-gray').after('<a class="btn-green nextbtn pull-right"><span>Next</span><i class="icon next"></i></a>  ');
                        if (this.subsType === 'singlesub') { // Check if its subscriber
                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.addSubscriber, this));
                        } else {
                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.multiEmails, this));
                        }
                    }
                    if (this.showPageList) {

                        this.dialog.$el.find('.modal-footer .nextbtn').remove();
                        this.dialog.$el.find('.modal-footer .btn-gray').after('<a class="btn-green nextbtn pull-right"><span>Next</span><i class="icon next"></i></a>  ');
                        if (this.subsType === 'singlesub') { // Check if its subscriber
                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.addSubscriber, this));
                        } else {
                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.multiEmails, this));
                        }
                        this.app.dialogArray.pop();
                        this.dialog.$el.find('.modal-footer .btn-save span').html('Save');
                    }
                    this.dialog.$el.find('.modal-footer .nextbtn').show();
                    this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists,.modal-footer .btn-update').hide();
                },
                loadData: function (data) {
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
                addlist: function (listName, ele) {
                    if (this.checkListName(listName)) {
                        this.app.showAlert("List already exists with same name", $("body"), {fixed: true});
                        return false;
                    }
                    if (listName.toLowerCase().indexOf("supress_list_") >= 0) {
                        this.app.showAlert("List name with word supress_list_ not allowed", $("body"), {fixed: true});
                        return false;
                    }
                    var add_box = this.dialog.getBody().find(".add-list").data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    var URL = "/pms/io/list/saveListData/";
                    var post_data = {BMS_REQ_TK: this.app.get('bms_token'), type: "create", listName: listName};
                    $.post(URL, post_data)
                            .done(_.bind(function (data) {
                                add_box.dialog.find(".btn-add").removeClass("saving");
                                add_box.dialog.find(".input-field").val("");
                                add_box.hideBox();
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    this.app.removeCache("lists");
                                    this.getLists();
                                    this.newList = _json[2];
                                    this.isListSelected = true;
                                }
                                else {
                                    this.app.showAlert(_json[1], $("body"), {fixed: true});
                                }
                            }, this));
                },
                checkListName: function (listName) {
                    var camp_list_json = this.app.getAppData("lists");
                    var isListExits = false;
                    this.app.showLoading(false, this.dialog.getBody().$el);
                    $.each(camp_list_json.lists[0], _.bind(function (index, val) {
                        if (val[0].name == listName) {
                            isListExits = true;
                            return false;
                        }
                    }, this));
                    return isListExits;
                },
                icheckCreate: function (obj) {
                    //var filter = $(this.options.filterRow)
                    var _this = this;
                    obj.iCheck({
                        checkboxClass: 'checkpanelinput filtercheck',
                        insert: '<div class="icheck_line-icon" style="margin: 22px 0 0 10px;"></div>'
                    });
                    obj.on('ifChecked', function (event) {
                        _this.dialog.getBody().find(".bms-lists .check-list").iCheck('uncheck');
                        _this.dialog.getBody().find(".bms-lists .check-list").iCheck('update');
                        _this.dialog.getBody().find(".bms-lists tr").removeClass('selected');
                        $(event.target).parents("tr").addClass("selected");
                        _this.isListSelected = true;
                    });
                    obj.on('ifUnchecked', function (event) {
                        $(event.target).parents("tr").removeClass("selected");
                        _this.isListSelected = false;
                    });
                },
                showPageViews: function (ev) {

                    var that = this;
                    if(ev){
                        var dialog_title = "Population '" + $(ev.target).parents('tr').find('h3').text() + "'";
                    }
                    
                    var listNum = (this.listNum)? this.listNum : $(ev.target).data('id');
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        bodyCss: {"min-height": dialog_height + "px"},
                        headerIcon: 'population'
                    });

                    this.dialog.getBody().find('.temp-filters,.template-container').hide();
                    this.app.showLoading("Populating Emails...", this.dialog.getBody());
                    require(["recipientscontacts/rcontacts"], function (Contacts) {
                        var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                        var objContacts = new Contacts({app: that.app, listNum: listNum, dialogHeight: dialog_height, isSubscriber: true});
                        dialog.getBody().append(objContacts.$el);
                        objContacts.$el.addClass('dialogWrap-' + dialogArrayLength);
                        that.app.showLoading(false, objContacts.$el.parent());
                        //that.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                        //that.app.dialogArray[dialogArrayLength - 1].currentView = objContacts; // New Dialog
                        objContacts.$el.find('#contacts_close').remove();
                        objContacts.$el.addClass('subscriber_field_form');
                        dialog.$el.find('.dialog-backbtn').addClass('btn-backlists')
                        dialog.$el.find('.btn-backlists').removeClass('dialog-backbtn')
                        objContacts.$el.find('.temp-filters').removeAttr('style');
                        that.dialog.$el.find('.modal-footer .btn-backlists').click(_.bind(that.showLists, that));
                        that.dialog.$el.find('.btn-close,.toolbar .close').hide();
                        that.dialog.$el.find('.modal-footer').append('<a class="btn-gray btn-closebk right"><span>Close</span><i class="icon cross"></i></a>')
                        that.dialog.$el.find('.modal-header .toolbar').append('<li><a data-original-title="Close" class="icon closebk showtooltip" title=""></a></li>')
                        that.showPageList = true;
                        that.dialog.$el.find('.btn-closebk,.toolbar .closebk').click(function () {
                            that.showLists();
                        })
                    });
                },
                tagClick: function (obj) {
                    //this.sub.taglinkVal = true;
                    this.tagTxt = $(obj.currentTarget).text();

                    this.app.initSearch(obj, this.dialog.$el.find("#newimports-search"));
                },
                /*====================================================
                 * 
                 * Subscriber Form view 
                 * 
                 ======================================================*/


                addSubscriber: function () {
                    //this.closeDialog();

                    if (!this.isListSelected) {
                        this.app.showAlert('No List Selected', $("body"), {fixed: true});
                        return false;
                    } else {
                        this.dialog.getBody().find('.temp-filters,.template-container').hide();
                        this.dialog.$el.find('.modal-footer .nextbtn').hide();
                        this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists,.modal-footer .btn-update').show();
                        this.app.showLoading("Loading...", this.dialog.getBody());
                        var _this = this;

                        //require(["contacts/subscriber_fields"], function(sub_detail) {
                        var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                        var page = new sub_detail({sub: _this.parent, page: _this, listNum:_this.listNum,isSalesforceUser: false, isAddFlag: true});
                        _this.dialog.getBody().append(page.$el);
                        page.$el.addClass('dialogWrap-' + dialogArrayLength);
                        _this.app.showLoading(false, page.$el.parent());
                        _this.dialog.saveCallBack(_.bind(page.createSubscriber, page, _this.dialog));
                        page.$el.addClass('subscriber_field_form');
                        // _this.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                        _this.app.dialogArray[dialogArrayLength - 1].currentView = page; // New Dialog

                        //});
                    }
                },
                /*====================================================
                 * 
                 * CSV uploading view
                 * 
                 ======================================================*/
                opeCSV: function () {
                    this.closeDialog();
                    if(this.listNum){
                      this.app.mainContainer.csvUpload(this.listChecksum);  
                    }else{
                        this.app.mainContainer.csvUpload();
                    }
                    
                },
                /*====================================================
                 * 
                 * Comma Separated Multiple emails
                 * 
                 ======================================================*/
                multiEmails: function () {
                    this.closeDialog();
                    var _this = this;
                    if (!this.isListSelected) {
                        this.app.showAlert('No List Selected', $("body"), {fixed: true});
                        return false;
                    } else {
                        this.dialogStyles['modalstyle'] = this.dialog.$el.attr('style');
                        this.dialogStyles['modalbody'] = this.dialog.$el.find('.modal-body').attr('style');
                        var dialog_width = 1000;
                        var dialog_height = $(document.documentElement).height() - 582;
                        this.dialog.$el.css({"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"})
                        this.dialog.$el.find('.modal-body').css('min-height', dialog_height);
                        this.dialog.getBody().find('.temp-filters,.template-container').hide();
                        this.dialog.$el.find('.modal-footer .nextbtn').hide();
                        this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists,.modal-footer .btn-update').show();
                        this.app.showLoading("Loading...", this.dialog.getBody());
                        var dialog = this.dialog;

                        var page = this.subDetail;
                        if (dialog.getBody().find('.model_form').length === 0) {
                            dialog.getBody().append(page.$el);
                        } else {
                            page.$el.show();
                            this.dialog.getBody().find('#sub_fields_viaEmails_form').show();
                        }

                        dialog.$el.find('.contactsEmails').focus();
                        dialog.$el.find('.contactsEmails').css('width', '935px');
                        /*if (_this.sub_fields["conLeadId"]) {
                         dialog.saveCallBack2(_.bind(page.updateSubscriberDetailAtSalesForce, page, dialog));
                         }*/
                        _this.app.showLoading(false, page.$el.parent());
                        dialog.saveCallBack(_.bind(page.createSubscriberViaEmail, page, dialog));


                    }

                }
            })
        })
