define(['text!contacts/html/task_row.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Note View to show in Notes area
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
                    'click ._mks_task_delete_task':'deleteTaskConfirm',
                    'click .mks_task_edit_task':'editTask',
                    'click .mks_tasks_lists_empty_icon': 'markComplete'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.fromDashboard = this.options.fromDashboard;
                    this.mapicons = {
                        "lunch" : "mksicon-Lunch",
                        "discovery" : "mksicon-Discovery",
                        "call" : "mksicon-Phone",
                        "email" : "mksicon-Mail",
                        "breakfast" : "mksicon-Breakfast",
                        "meeting" : "mksicon-Meeting",
                        "proposal" : "mksicon-Proposal",
                        "demo"  : "mksicon-Demo",
                        "first_touch":"mksicon-First-Touch"
                      }
                      this.priorityIcons = {
                        "low" : {"label":"Low", "topClass":"mks_priority_low pclr9","icon" : "mksicon-Triangle_Down"},
                        "high" : {"label":"High", "topClass":"mks_priority_high pclr12","icon" : "mksicon-Triangle_Up"},
                        "medium" : {"label":"Medium", "topClass":"mks_priority_medium pclr19","icon" : "mksicon-More"}
                     }
                    this.render();
//                    this.model.on('change', this.renderRow, this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        
                    }));
                    this.initControls();
                    if(this.fromDashboard){
                        this.$el.addClass("")
                        this.$el.bind("click",_.bind(function(){
                            this.$el.addClass("selected");                                                            
                        },this));
                    }
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    
                    this.$el.css({"padding":"10px 12px"});
                    if(this.model.get("status")=="C"){
                        this.$(".mks_tasks_lists_user").addClass("task_status_C");
                    }
                    else{
                        this.$(".mks_tasks_lists_user").addClass("task_status_P");
                    }

                },
                getDateTimeStamp: function(){
                    var _date = moment(this.app.decodeHTML(this.model.get("taskDate")),'YYYY-M-D H:m');                    
                    var format = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
                    return format.time+', '+format.date;
                },
                getUserName: function(){
                    var user = (this.model.get("taskAddedBy") == this.app.get("user").userId) ? "You" : this.model.get("userId");
                    return user;
                },
                deleteTaskConfirm: function(){
                    this.app.showAlertDetail({heading: 'Confirm Deletion',
                        detail: "Are you sure you want to delete?",
                        callback: _.bind(function () {
                            this.deleteTask();
                        }, this)},
                    $('body'));
                },
                deleteTask: function(){
                     var URL ="/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.sub.model.get("subNum");
                     $.post(URL, {type:"delete",taskId:this.model.get("taskId.encode")})
                    .done(_.bind(function (data) {
                        var _json = jQuery.parseJSON(data);

                        if (_json[0] !== "err") {
                           this.sub.fetchTasks(); 
                           
                        } else {
                            this.app.showAlert(_json[1], $("body"));
                        }


                    },this));
                },
                editTask: function(){
                    this.sub.editTask(this.model);
                },
                markComplete:function(){                    
                    var URL ="/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.sub.model.get("subNum");
                    this.app.showLoading("Marking Complete...", this.$el);
                     $.post(URL, {type:"complete",taskId:this.model.get("taskId.encode")})
                    .done(_.bind(function (data) {
                        var _json = jQuery.parseJSON(data);
                        this.app.showLoading(false, this.$el);
                        if (_json[0] !== "err") {
                           this.sub.fetchTasks();                            
                        } else {
                            this.app.showAlert(_json[1], $("body"));
                        }
                    },this));
                    
                },
                showContact: function(obj){                    
                    var liRow = this.$el;
                    if(!liRow.hasClass("selected")){
                        var selected_contact = this.sub.$("ul.contact-list div.selected-contact");
                        selected_contact.removeClass("selected-contact");
                        liRow.addClass("selected");

                        var subView = new subscriberColView({sub: this, model: Backbone.Model.extend(this.model.get("subscriberInfo")), parentPage: this.sub});
                        this.sub.$(".contact-detail-area").html(subView.$el);
                        subView.init();
                                             
                    }
                }
            });
        });