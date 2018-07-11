define(['text!newcontacts/html/task_row.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber Record View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'div',
                className: 'tasks_content',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click ._mks_task_delete_task': 'deleteTaskConfirm',
                    'click .mks_task_edit_task': 'editTask',
                    'click .mks_tasks_lists_empty_icon': 'markComplete'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.todayTask = this.options.isTodayTasks;
                    this.fromDashboard = this.options.fromDashboard;
                    this.subscriberNum = this.options.subNum;
                    
                    this.mapicons = {
                        "lunch": "mksicon-Lunch",
                        "discovery": "mksicon-Discovery",
                        "call": "mksicon-Phone",
                        "email": "mksicon-Mail",
                        "breakfast": "mksicon-Breakfast",
                        "meeting": "mksicon-Meeting",
                        "proposal": "mksicon-Proposal",
                        "demo": "mksicon-Demo",
                        "first_touch": "mksicon-First-Touch",
                        "connect": "mksicon-Connect",
                        "introduction": "mksicon-Shake_hands",
                        "firstMessage": "mksicon-First_Message",
                        "secondMessage": "mksicon-Second_Message",
                        "thirdMessage": "mksicon-Third_Message",
                        "pdf": "mksicon-PDF",
                        "webSeminarInvite": "mksicon-Web_Seminar_Invite",
                        "inviteToGroup": "mksicon-Invite_to_Group"
                        
                    }
                    this.priorityIcons = {
                        "low": {"label": "Low", "topClass": "mks_priority_low pclr9", "icon": "mksicon-Triangle_Down"},
                        "high": {"label": "High", "topClass": "mks_priority_high pclr12", "icon": "mksicon-Triangle_Up"},
                        "medium": {"label": "Medium", "topClass": "mks_priority_medium pclr19", "icon": "mksicon-More"}
                    }
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({

                    }));
                    this.initControls();
                    if (this.fromDashboard) {
                        this.$el.addClass("task-dashboard")
                        this.$el.bind("click", _.bind(function () {
                            this.showContact();
                        }, this));
                    }
                },
                showContact: function () {
                    var liRow = this.$el;
                    if (!liRow.hasClass("selected-task")) {
                        var selected_tasks = this.sub.$(".tasks-listing .content-wrapper .selected-task");
                        selected_tasks.removeClass("selected-task");
                        liRow.addClass("selected-task");
                        this.sub.closeCallBack();
                        var tempJson = this.model.get("subscriberInfo");
                        tempJson["subNum"] = tempJson["subscriberNumber.encode"];
                        var subView = new this.sub.subColView({sub: this, model: new Backbone.Model(tempJson), parentPage: this.sub});
                        this.sub.$(".contact-detail-area").html(subView.$el);
                        subView.init();

                    }
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    if (this.fromDashboard) {
                        this.$el.css({"padding": "5px 0px","margin":"0px 5px"});
                    } else {
                        this.$el.css({"padding": "10px 12px"});
                    }
                    if (this.model.get("status") == "C") {
                        this.$(".mks_tasks_lists_user").addClass("task_status_C");
                    } else {
                        this.$(".mks_tasks_lists_user").addClass("task_status_P");
                    }

                },
                getDateTimeStamp: function () {
                    var _date = moment(this.app.decodeHTML(this.model.get("taskDate")), 'YYYY-M-D H:m');
                    var format = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
                    var returnDateTime = null;
                    if (this.fromDashboard) {
                        if(this.todayTask){
                           returnDateTime = format.time;
                        }
                        else{
                           returnDateTime = format.time + ', ' + format.date;
                        }
                    } else {
                        returnDateTime = format.time + ', ' + format.date;
                    }
                    return returnDateTime;
                },
                getUserName: function () {
                    var user = (this.model.get("taskAddedBy") == this.app.get("user").userId) ? "You" : this.model.get("userId");
                    return user;
                },
                getContactName: function () {
                    var full_name = '';
                    var subInfo = this.model.get("subscriberInfo");
                    if (subInfo) {
                        var fName = subInfo.firstName;
                        var lName = subInfo.lastName;
                        full_name = this.app.decodeHTML(fName) + ' ' + this.app.decodeHTML(lName);
                        if (!fName && !lName) {
                            full_name = this.app.decodeHTML(subInfo.email);
                        }
                    }
                    return full_name;
                },
                deleteTaskConfirm: function () {
                    this.app.showAlertDetail({heading: 'Confirm Deletion',
                        detail: "Are you sure you want to delete?",
                        callback: _.bind(function () {
                            this.deleteTask();
                        }, this)},
                            $('body'));
                },
                deleteTask: function () {
                    var URL = "/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.subscriberNum;
                    $.post(URL, {type: "delete", taskId: this.model.get("taskId.encode")})
                            .done(_.bind(function (data) {
                                var _json = jQuery.parseJSON(data);

                                if (_json[0] !== "err") {
                                    this.sub.fetchTasks();
                                    this.sub.updateDashboard();

                                } else {
                                    this.app.showAlert(_json[1], $("body"));
                                }


                            }, this));
                },
                editTask: function () {
                    this.sub.editTask(this.model);
                },
                markComplete: function () {
                    var URL = "/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.subscriberNum;
                    this.app.showLoading("Marking Complete...", this.$el);
                    $.post(URL, {type: "complete", taskId: this.model.get("taskId.encode")})
                            .done(_.bind(function (data) {
                                var _json = jQuery.parseJSON(data);
                                this.app.showLoading(false, this.$el);
                                if (_json[0] !== "err") {
                                    this.sub.fetchTasks();
                                    this.sub.updateDashboard();
                                } else {
                                    this.app.showAlert(_json[1], $("body"));
                                }
                            }, this));

                }
            });
        });
