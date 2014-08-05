define(['text!target/html/newtarget.html'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                className: 'new-target-view',
                events: {
                    "keyup #target_name": function(e)
                    {
                        if (e.keyCode == 13) {
                            this.createTarget();
                        }
                    }
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.render();
                    var newtardialog = this.options.newtardialog;
                    var app = this.options.app;
                    app.showLoading(false, newtardialog.getBody());
                },
                render: function() {
                    this.app = this.options.app;
                    this.curview = this;
                    this.$el.html(this.template({}));
                    this.$el.find('#target_name').focus();
                },
                createTarget: function() {
                    var curview = this;
                    var camp_obj = curview.options.camp;
                    var el = curview.$el;
                    var app = curview.app;
                    var appMsgs = curview.app.messages[0];
                    var newtardialog = curview.options.newtardialog;
                    var source = curview.options.source;
                    //var target_head = this.dialog;
                    if (el.find('#target_name').val() == '')
                    {
                        app.showError({
                            control: el.find('.tarname-container'),
                            message: appMsgs.CRT_tarname_empty_error
                        });
                    }
                    else
                    {
                        app.hideError({control: el.find(".tarname-container")});
                        app.showLoading("Creating target...", curview.$el);
                        var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK=" + this.app.get('bms_token') + "&filterFor=C";
                        //$(obj.target).addClass("saving");
                        $.post(URL, {type: "create", filterName: el.find('#target_name').val()})
                                .done(function(data) {
                                    app.showLoading(false, curview.$el);
                                    var camp_json = jQuery.parseJSON(data);
                                    if (camp_json[0] !== "err") {
                                        var target_id = camp_json[1];
                                        //camp_obj.loadTargets();
                                        newtardialog.hide();
                                        if (camp_obj.states) {
                                            camp_obj.states.step3.isNewTarget = true;
                                            camp_obj.states.step3.newTargetName = el.find('#target_name').val();
                                        }
                                        camp_obj.initCreateEditTarget(target_id);
                                    }
                                    else {
                                        app.showAlert(camp_json[1], curview.$el);
                                    }
                                    //$(obj.target).removeClass("saving");                              
                                });
                    }
                }
            });
        });