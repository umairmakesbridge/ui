define(['text!target/html/target.html', 'bms-filters','bms-tags','jquery.bmsgrid','jquery.searchcontrol','jquery.icheck'],
        function(template, bmsfilters) {
            'use strict';
            return Backbone.View.extend({
                className:'edit-target-view',
                events: {
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.render();
                },
                render: function() {
                    this.app = this.options.camp.app;
                    this.target_id = this.options.target_id;
                    this.dialog = this.options.dialog;
                    this.editable = this.options.editable;
                    this.$el.html(this.template({}));
                    this.$("#c_c_target").filters({app: this.app});
                   
                    if (!this.target_id) {
                        this.dialog.$(".tagscont").tags({app: this.app,
                            url: '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=' + this.app.get('bms_token'),
                            params: {type: 'tags', filterNumber: '', tags: ''}
                        });
                        this.showHideTargetTitle(true);
                    }
                    else {
                        this.loadTarget(this.target_id);
                    }
                        this.showTitle();
                },
                showTitle: function() {
                    this.dialog.$(".pointy .edit").click(_.bind(function() {
                        this.showHideTargetTitle(true);
                    }, this));
                    this.dialog.$(".pointy .copy").click(_.bind(function() {
                        this.copyTarget();
                    }, this));
                    this.dialog.$(".pointy .delete").click(_.bind(function(obj) {
                        var curview = this;
                        var app = this.options.camp.app;
                        var appMsgs = app.messages[0];
                        app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: appMsgs.CAMPS_delete_confirm_error,
                            callback: _.bind(function() {
                                curview.deleteTarget();
                            }, curview)},
                        curview.$el);
                    }, this));

                    this.dialog.$("#dialog-title span").click(_.bind(function(obj) {
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$(".savebtn").click(_.bind(function(obj) {
                        this.saveTarget(obj)
                    }, this));
                    this.dialog.$(".cancelbtn").click(_.bind(function(obj) {
                        if (this.target_id) {
                            this.showHideTargetTitle();
                        }
                    }, this));

                },
                ReattachEvents: function(){
                    this.dialog.$(".pointy .edit").click(_.bind(function() {
                        this.showHideTargetTitle(true);
                    }, this));
                    this.dialog.$(".pointy .copy").click(_.bind(function() {
                        this.copyTarget();
                    }, this));
                    this.dialog.$(".pointy .delete").click(_.bind(function(obj) {
                        var curview = this;
                        var app = this.options.camp.app;
                        var appMsgs = app.messages[0];
                        app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: appMsgs.CAMPS_delete_confirm_error,
                            callback: _.bind(function() {
                                curview.deleteTarget();
                            }, curview)},
                        curview.$el);
                    }, this));

                    this.dialog.$("#dialog-title span").click(_.bind(function(obj) {
                        this.showHideTargetTitle(true);
                    }, this));
                    this.dialog.$(".savebtn").click(_.bind(function(obj) {
                        this.saveTarget(obj)
                    }, this));
                },
                saveTarget: function(obj) {
                    var camp_obj = this;
                    var campview = this.options.camp;
                    var target_name_input = $(obj.target).parents(".edited").find("input");
                    var target_head = this.dialog;
                    var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=" + this.app.get('bms_token') + "&filterFor=C";
                    if (target_name_input.val() !== "") {

                        if (this.target_id)
                        {
                            $(obj.target).addClass("saving");
                            $.post(URL, {type: "newName", filterName: target_name_input.val(), filterNumber: this.target_id})
                                    .done(function(data) {
                                        var target_json = jQuery.parseJSON(data);
                                        if (target_json[0] !== "err") {
                                            target_head.$("#dialog-title span").html(target_name_input.val());
                                            camp_obj.showHideTargetTitle();
                                            camp_obj.app.showMessge("Target Renamed");
                                            camp_obj.app.removeCache("targets");
                                            if(campview.loadTargets){
                                                campview.loadTargets();
                                            }
                                            else if(campview.parent && campview.parent.loadTargets){
                                                campview.parent.loadTargets();
                                            }
                                        }
                                        else {
                                            camp_obj.app.showAlert(target_json[1], camp_obj.$el);

                                        }
                                        $(obj.target).removeClass("saving");
                                    });
                        }
                        else {
                            $(obj.target).addClass("saving");
                            $.post(URL, {type: "create", filterName: target_name_input.val()})
                                    .done(function(data) {
                                        var camp_json = jQuery.parseJSON(data);
                                        if (camp_json[0] !== "err") {
                                            target_head.$("#dialog-title span").html(target_name_input.val());
                                            camp_obj.target_id = camp_json[1];
                                            if (camp_obj.dialog.$(".tagscont").data("tags")) {
                                                camp_obj.dialog.$(".tagscont").data("tags").setObjectId("filterNumber", camp_json[1]);
                                            }
                                            camp_obj.showHideTargetTitle();
                                            camp_obj.app.showMessge("Target Created");
                                            camp_obj.app.removeCache("targets");
                                            if(campview.loadTargets){
                                                campview.loadTargets();
                                            }
                                            else if(campview.parent && campview.parent.loadTargets){
                                                campview.parent.loadTargets();
                                            }
                                        }
                                        else {
                                            camp_obj.app.showAlert(camp_json[1], camp_obj.$el);
                                        }
                                        $(obj.target).removeClass("saving");
                                    });
                        }

                    }
                    obj.stopPropagation();
                },
                showHideTargetTitle: function(show, isNew) {
                    if (show) {
                        this.dialog.$("#dialog-title").hide();
                        this.dialog.$("#dialog-title-input").show();
                        this.dialog.$(".tagscont").hide();
                        if (isNew) {
                            this.dialog.$("#dialog-title span").html('');
                            this.target_id = 0;
                        }
                        this.dialog.$("#dialog-title-input input").val(this.dialog.$("#dialog-title span").html());
                    }
                    else {
                        this.dialog.$("#dialog-title").show();
                        this.dialog.$("#dialog-title-input").hide();
                        this.dialog.$(".tagscont").show();
                    }
                }
                ,
                deleteTarget: function() {
                    var camp_obj = this;
                    var camp = this.options.camp;
                    var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=' + camp_obj.app.get('bms_token');
                    camp_obj.app.showLoading("Deleting...", camp_obj.$el);
                    $.post(URL, {type: 'delete', filterNumber: this.target_id})
                            .done(function(data) {
                                camp_obj.app.showLoading(false, camp_obj.$el);
                                var del_target_json = jQuery.parseJSON(data);
                                if (camp_obj.app.checkError(del_target_json)) {
                                    return false;
                                }
                                if (del_target_json[0] !== "err") {
                                    camp_obj.app.showMessge("Target Deleted");
                                    camp_obj.dialog.hide();
                                    camp_obj.dialog.find('.overlay').remove();
                                    camp.loadTargets();
                                }
                                camp_obj.app.showLoading(false, camp_obj.$el);
                            });
                },
                saveTargetFilter: function() {
                    var camp_obj = this;
                    var campview = this.options.camp;
                    var target_id = this.target_id;
                    if (target_id) {
                        var camp_obj = this;
                        var post_data = "";
                        if (camp_obj.$("#c_c_target").data("filters")) {
                            post_data = camp_obj.$("#c_c_target").data("filters").saveFilters();
                        }
                        if (!post_data) {
                            return false;
                        }
                        camp_obj.app.showLoading("Saving Target...", camp_obj.$el.parents('.modal'));
                        this.dialog.$el.find(".btn-save").addClass("saveing-blue");
                        var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=' + this.app.get('bms_token');
                        post_data["type"]="update";
                        post_data["filterNumber"]=target_id;
                        $.post(URL, post_data)
                                .done(function(data) {
                                    camp_obj.app.showLoading(false, camp_obj.$el.parents('.modal'));
                                    camp_obj.dialog.$el.find(".btn-save").removeClass("saveing-blue");
                                    var target_json = jQuery.parseJSON(data);
                                    if (camp_obj.app.checkError(target_json)) {
                                        return false;
                                    }

                                    if (target_json[0] !== "err") {
                                        camp_obj.app.showMessge("Target has been updated");
                                    }
                                    else {
                                        camp_obj.app.showAlert(false, camp_obj.$el);
                                    }
                                    if(campview.loadTargets){
                                        campview.loadTargets();
                                    }
                                    else if(campview.parent && campview.parent.loadTargets){
                                        campview.parent.loadTargets();
                                    }
                                });
                    }
                    else {
                        this.app.showAlert("Please create a target first!", this.$el);
                    }
                },
                copyTarget: function() {
                    var target_id = this.target_id;
                    var curview = this;
                    var camp_obj = this.options.camp;
                    var dialog_title = "Copy Target";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Copy Target'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["target/copytarget"], function(copytargetPage) {
                        var mPage = new copytargetPage({camp: camp_obj, app: camp_obj.app, target_id: target_id, copydialog: dialog, editview: curview, source: 'edit'});
                        var dialogArrayLength = curview.app.dialogArray.length; // New Dialog
                        dialog.getBody().append(mPage.$el);
                        curview.app.showLoading(false, mPage.$el.parent());
                        mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        curview.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.copyTarget,mPage); // New Dialog
                        dialog.saveCallBack(_.bind(mPage.copyTarget, mPage));
                    });
                },
                loadTarget: function(target_id) {
                    var camp_obj = this;
                    var URL = '/pms/io/filters/getTargetInfo/?BMS_REQ_TK=' + this.app.get('bms_token') + '&type=get&filterNumber=' + target_id;
                    camp_obj.app.showLoading("Loading Target...", camp_obj.$el);
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        camp_obj.app.showLoading(false, camp_obj.$el);
                        var selected_target = jQuery.parseJSON(xhr.responseText);
                        if (camp_obj.app.checkError(selected_target)) {
                            return false;
                        }
                        if (selected_target) {
                            camp_obj.target_id = selected_target["filterNumber.encode"];
                            
                            camp_obj.dialog.$("#dialog-title span").html(selected_target.name);
                            camp_obj.app.dialogArray[camp_obj.app.dialogArray.length-1].title= selected_target.name; // New Dialog
                            camp_obj.targetTitle = selected_target.name;
                            camp_obj.showHideTargetTitle(false);
                            camp_obj.dialog.$(".modal-header .tagscont").tags({app: camp_obj.app,
                                url: '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=' + camp_obj.app.get('bms_token'),
                                params: {type: 'tags', filterNumber: selected_target["filterNumber.encode"], tags: ''}
                                , showAddButton: true,
                                fromDialog:camp_obj.dialog.$el,
                                tags: selected_target.tags
                            });
                             if(camp_obj.editable){
                                
                                camp_obj.dialog.$el.find('.btn-save').hide();
                                camp_obj.dialog.$el.find('.camp_header .tagscont ul li').addClass('not-editable');
                                camp_obj.dialog.$el.find('.camp_header .tagscont .tags-buttons').hide();
                                camp_obj.dialog.$el.find("#dialog-title span").unbind( "click" );
                                camp_obj.dialog.$el.find(".modal-header").removeClass("header-editable-highlight");
                                camp_obj.dialog.$el.find('.edit').hide();
                                
                                }
                            
                            var filters = camp_obj.$("#c_c_target").data("filters")
                            if (filters) {
                                filters.loadFilters(selected_target);
                            }
                             
                        }

                    });
                },
            });
        });