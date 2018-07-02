define(['text!contacts/html/contact_tasks.html', 'contacts/collections/tasks', 'contacts/task_row', 'contacts/addtask'],
        function (template, tasksCollection, taskRowView, addTaskDialog) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Task View for Contacts
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'div',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .add-button': 'saveTask',                                        
                    'click .tasks_collapse':'expandCollapseTasks',
                    'click .add-button':'newTask'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.page = this.options.sub;
                    this.app = this.page.app;
                    this.tasksRequest = new tasksCollection();
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function () {
                    this.$el.html(this.template({
                    }));
                    this.fetchTasks();

                },
                init: function () {

                },
                fetchTasks: function (fcount) {
                    var remove_cache = false;
                    this.$(".not-found").html("Loading...");
                    if (!fcount) {
                        remove_cache = true;
                        this.offset = 0;    
                        this.$('.content-wrapper').children().remove();
                    } else {
                        this.offset = this.offset + 20;
                    }
                    var _data = {order: "desc",orderBy:"updationTime",subNum:this.model.get("subNum"),offset:0,type:"getTasks"};
                    _data["fromDate"] = moment().add('days', -90).format('MM-DD-YYYY');
                    _data["toDate"] = moment().add('days', 90).format('MM-DD-YYYY');
                                       
                    if (this.tasks_request) {
                        this.tasks_request.abort();
                    }
                    
                    
                    this.tasks_request = this.tasksRequest.fetch({data: _data, remove: remove_cache,
                        success: _.bind(function (collection, response) {
                            // Display items
                            if (this.app.checkError(response)) {
                                return false;
                            }
                            //this.app.showLoading(false, this.$contactList);
                                                        
                            for (var s = this.offset; s < collection.length; s++) {
                                var rowView = new taskRowView({model: collection.at(s), sub: this});                                
                                this.$('.content-wrapper').append(rowView.$el);                                
                            }
                            
                            if(collection.length==0){
                                this.$(".not-found").show();                       
                                this.$(".not-found").html("No Task found.")
                            }
                            else{
                                this.$(".not-found").hide();  
                                if(collection.length>3){
                                    this.$(".tasks_collapse").removeClass("hide")
                                }                                
                            }
                           

                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                    // add into enqueueAjax Request
                    this.page.pPage.enqueueAjaxReq.push(this.tasks_request);
                },
                expandCollapseTasks: function(e){
                    var handle = $(e.target)[0].tagName !== "DIV" ? $(e.target).parent(".tasks_collapse") : $(e.target);
                    if (handle.hasClass('expand')) {
                        handle.find('span').eq(0).text('Click to collapse')
                        this.$('.task_expand_height').addClass('heighAuto');
                    } else {
                        handle.find('span').eq(0).text('Click to expand')
                        this.$('.task_expand_height').removeClass('heighAuto');
                    }
                    if (handle.hasClass('expand')) {
                        handle.removeClass('expand');
                        handle.addClass('collapse');
                    } else {
                        handle.removeClass('collapse');
                        handle.addClass('expand');
                    }
                },
                newTask: function(){             
                    this.openTaskDialog();
                },
                openTaskDialog: function(model){
                    var _this = this;
                    var dialog_width = 450;
                    var dialog_height = 280;
                    var btn_prp = {title: model?'Edit Task':'Add Task',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "50px"},
                        headerEditable: false,
                        headerIcon: 'template',
                        bodyCss: {"min-height": dialog_height + "px"}
                        
                    }                    
                    btn_prp['buttons']= {saveBtn: {text: model?'Update':'Add'}};                                           
                    var dialog = this.app.showDialog(btn_prp);                    
                    
                    var page = new addTaskDialog({sub: _this,dialog:dialog,subNum:this.model.get("subNum"),taskModel:model});
                    dialog.getBody().html(page.$el);  
                    page.init();
                    dialog.saveCallBack(_.bind(page.saveTask, page, dialog)); 
                },
                editTask: function(model){                   
                    this.openTaskDialog(model);
                }


            });
        });