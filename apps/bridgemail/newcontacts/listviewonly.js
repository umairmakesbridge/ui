define([ 'text!newcontacts/html/listviewonly.html','app'],
        function (template,app) {
             'use strict';
            return Backbone.View.extend({
                
                id: '',
                tags: 'div',
                events : {
                    'click .refresh_btn':function(){
                        this.isListSelected = false;
                        this.getLists();
                    }
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.app = app;
                    this.parent = this.options.sub;
                    this.model = this.options.model;
                    this.dialog = this.options.dialog;
                    this.isListSelected = false;
                    this.dialogStyles = {};
                    this.showPageList = false;
                     
                    this.render();
                },
                init:function(){
                     this.app.showLoading("Loading Lists...", this.dialog.getBody());
                    this.getLists();  
                },
                render: function () {
                    this.$el.html(this.template({}));
                    this.$(".myimports-search").searchcontrol({
                        id: 'newimports-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchedtext, this),
                        gridcontainer: 'import-list-grid',
                        placeholder: 'Search lists',
                        tdNo: 2,
                        showicon: 'yes',
                        iconsource: 'list'
                    });
                    this.app.showLoading("Loading Lists...", this.dialog.getBody());
                    this.dialog.getBody().find(".taglink").highlight($.trim(this.tagTxt));
                    this.$(".add-list").addbox({app: this.app, placeholder_text: 'Enter new list name', addCallBack: _.bind(this.addlist, this)});
                    this.$(".add-list").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                   
                     
                    
                },
                getLists: function () {
                   this.app.showLoading("Loading Lists...", this.dialog.getBody());
                    this.app.getData({
                        "URL": "/pms/io/list/getListData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=all",
                        "key": "lists",
                        "callback": _.bind(this.createListTable, this)
                    });
                },
                searchedtext: function () {
                    this.dialog.getBody().find(".taglink").highlight($.trim(this.tagTxt));
                },
                
                 createListTable: function (xhr) {
                     this.app.showLoading("Loading Lists...", this.dialog.getBody());
                    var camp_list_json = this.app.getAppData("lists");
                    
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
                    /*if (this.dialog.$el.find('.modal-footer .nextbtn').length === 0) {
                        this.dialog.$el.find('.modal-footer .btn-gray').after('<a class="btn-green nextbtn pull-right"><span>Next</span><i class="icon next"></i></a>  ');
                        this.dialog.$el.find('.modal-footer .btn-close').before('<a style="" class="btn-yellow left btn-backlists"><i class="icon back left"></i><span>Back</span></a>')
                        this.dialog.$el.find('.modal-footer .btn-save,.modal-footer .btn-backlists').hide();
                        if (this.subsType === 'singlesub') { // Check if its subscriber
                           // this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.addSubscriber, this));
                        } else {
                            //this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.multiEmails, this));
                        }

                        //this.dialog.$el.find('.modal-footer .btn-backlists').click(_.bind(this.showLists, this));
                    }*/
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
                    this.app.showLoading(false, this.dialog.getBody());

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
                    //this.app.showLoading(false, this.dialog.getBody().$el);
                    $.each(camp_list_json.lists[0], _.bind(function (index, val) {
                        if (val[0].name == listName) {
                            isListExits = true;
                            return false;
                        }
                    }, this));
                    return isListExits;
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
                    this.dialog.$el.removeAttr('style');

                        this.dialog.$el.css({'margin-left': -Math.abs(this.dialogStyles.width / 2), 'width': this.dialogStyles.width, 'top': this.dialogStyles.top});

                        this.dialog.$el.find('.modal-body').css('min-height', this.dialogStyles.height);
                        this.dialog.$el.find('#dialog-title .dialog-title').html('Add Contacts')
                    
                  
                    if (this.showPageList) {

                        //this.dialog.$el.find('.modal-footer .nextbtn').remove();
                        //this.dialog.$el.find('.modal-footer .btn-gray').after('<a class="btn-green nextbtn pull-right"><span>Next</span><i class="icon next"></i></a>  ');
//                        if (this.subsType === 'singlesub') { // Check if its subscriber
//                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.addSubscriber, this));
//                        } else {
//                            this.dialog.$el.find('.modal-footer .nextbtn').click(_.bind(this.multiEmails, this));
//                        }
                        this.app.dialogArray.pop();
                        this.dialog.$el.find('.modal-footer .btn-save span').html('Add');
                        this.dialog.$el.find('.modal-footer .btn-save').show();
                    }
                    //this.dialog.$el.find('.modal-footer .nextbtn').show();
                    this.dialog.$el.find('.modal-footer .btn-backlists').hide();
                },
                addSubscriber : function(){
                    //console.log(this.isListSelected);
                    //console.log(this.model.get("email"));
                    if(this.model.get("email")){
                            var _this = this;
                            _this.app.showLoading("Adding Subscriber to list...",_this.dialog.$el);
                             var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK="+_this.app.get('bms_token')+"&type=addByEmailOnly";
                             var serializedData = "emails="+this.model.get("email");
                             var listNum = _this.dialog.$el.find('#import-list-grid .selected').attr('id').split('_')[1];
                             serializedData = serializedData+"&listNum="+listNum;
                                $.post(URL,  serializedData)
                                .done(function(data) {  

                               var _json = jQuery.parseJSON(data);                         

                                if(_json[0] !== "err"){
                                    _this.app.showLoading(false,_this.dialog.$el);                            
                                     if(parseInt(_json.addedCount) > 0){
                                          _this.app.showMessge("Subscriber Added to List  Successfully!");
                                     }else{
                                         _this.app.showMessge("Subscriber Updated to List Successfully!");
                                     }
                                        _this.isListSelected = false;
                                        _this.getLists();
                                     

                                      _this.dialog.hide();                              
                                }else{
                                     _this.app.showLoading(false,_this.dialog.$el);
                                    _this.app.showAlert(_json[1],_this.$el);
                                }
                        
                    });
                    }else{
                        this.app.showAlert("Contact Email Doesn't Exists", $("body"), {fixed: true});
                    }
                    
                }
            })   
            
            
            
        })