define(['text!newcontacts/html/subscriber_col.html', "newcontacts/subscriber_timeline","newcontacts/listviewonly",'newcontacts/subscriber_fields_col','newcontacts/contact_notes','newcontacts/contact_tasks'],
        function(template, timelinePage,listView, subscriberFieldsCol, contactNotes, contactTasks) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber detail page view depends on search control, chosen , date library moment and tags control
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'subscriber-detail',
                basicFields: {"firstName": {"label": "First Name"}, "lastName": {"label": "Last Name"}, "company": {"label": "Company"}, "areaCode": {"label": "Area Code"}, "telephone": {"label": "Telephone"},
                    "email": {"label": "Email"}, "city": {"label": "City"},
                    "country": {"label": "Country"}, "state": {"label": "State"}, "zip": {"label": "Zip"}, "address1": {"label": "Address 1"}, "address2": {"label": "Address 2"},
                    "jobStatus": {"label": "Job Status"}, "industry": {"label": "Industry"}, "salesRep": {"label": "Sales Rep"},
                    "source": {"label": "Source"}, "salesStatus": {"label": "Sales Status"}, "occupation": {"label": "Occupation"}, "birthDate": {"label": "Birthday"}},
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .toggleinfo': 'toggleFieldsView',
                    'click .edit-profile': 'editProfile',
                    'click .oto-sendmail': 'sendEmail',
                    'click .manage-my-lists': 'manageLists',
                    'click .suppress-contact' : 'suppressDialog',
                    'click .add-to-sequence':'addToWorkflowDialog',
                    'click .course-correct':'courseCorrectDialog',
                    'click .add-to-list':'add2list',
                    'click .add-notes':function(){                      
                      
                       $('html, body').animate({
                            scrollTop: this.$("#note_textarea").offset().top
                          }, 1000,_.bind(function(){
                              this.$("#note_textarea").focus();
                          },this));
                      
                    },
                    'click .mkb_tag-add':'addTag',
                    'click .add-tag-button':'addTagMode',
                    'click .mkb_tag-close': 'addTagMode',
                    'click .addSf':'synctoSF',
                    'click .jumpSf':'viewSyncedSF'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {
                    this.sub_fields = null;
                    this.current_ws = null;    
                    this.getSubscriber = null;
                    this.getTimeLine = null;
                    this.getTimeLineDetail = null;
                    this.enqueueAjaxReq = [];
                    this.tags_array = "";
                    this.template = _.template(template);
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function() {
                    this.app = this.options.sub.app;     
                    this.pPage = this.options.parentPage;
               
                    if (this.model) {
                        var sub_name = '';
                        if (this.model.get("firstName")) {
                            sub_name = this.model.get("firstName");
                        } else if (this.model.get("lastName")) {
                            sub_name = this.model.get("lastName");
                        } else {
                            sub_name = this.model.get("email");
                        }
                        this.sub_id = this.model.get("subNum");
                        this.sub_name = sub_name;
                        this.editable = this.model.get("supress")=="S"?false:true;
                        this.email = this.model.get("email");
                    }
                    
                    this.$el.html(this.template({}));      
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                   
                    if (this.options.params && this.options.params.rowtemplate) {
                        this.modelTemplate = this.options.params.rowtemplate;
                    }
                    this.initControls();
                    this.loadData();
                }
                ,
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                init: function() {
                    
                    this.loadActivityTimeLine();        
                    /*Load Fields Column*/
                    this.subFieldsView = new subscriberFieldsCol({sub: this, model: this.model, parentPage: this.pPage, isSalesforceUser: this.pPage.isSalesforceUser});
                    this.pPage.$(".contact-info").html(this.subFieldsView.$el);
                    this.pPage.selectContactTab("contact-info");
                    
                    /*Load Notes Area*/
                    
                    this.subContactNotes = new contactNotes({sub: this, model: this.model});
                    this.$("#contact-notes").html(this.subContactNotes.$el);
                    
                    this.subContactTasks = new contactTasks({sub: this, model: this.model});
                    this.$("#contact-tasks").html(this.subContactTasks.$el);
                    
                    if(this.editable===false){
                        this.$(".SuppressNotify").removeClass("hide");
                        this.$el.addClass("supress-mode");
                    }
                    
                    if(this.pPage.isSalesforceUser){
                        this.$(".top_manager_ul_wraps").addClass("seven");                        
                        if(this.model.get("conLeadId")){
                            this.$(".jumpSf").removeClass("hide");
                            this.$(".jumpSf").addClass("mks_hideRightBorder");
                        }
                        else{
                            this.$(".addSf").removeClass("hide");
                            this.$(".addSf").addClass("mks_hideRightBorder");
                        }
                    }
                    else{
                        this.$(".top_manager_ul_wraps").addClass("six");  
                        this.$(".add-notes").parent().addClass("mks_hideRightBorder")
                    }
                    

                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function() {

                    //this.$(".connection-setup").chosen({width: "150px", disable_search: "true"});
                    this.tags_array = this.model.get("tags");
                    if(this.tags_array){
                        this.populateTags();
                    }
                    
                },
                /**
                 * 
                 * @returns {Sub Name first Alphabet}
                 */
                getSubLetter: function(){
                    var fName = this.model.get("firstName");
                    var lName = this.model.get("lastName");
                    var email = this.model.get("email");
                    var firstAlpha = '';
                    if (fName) {
                        firstAlpha = this.app.decodeHTML(fName);
                    } else if (lName) {
                        firstAlpha = this.app.decodeHTML(lName);
                    } else {
                        firstAlpha = this.app.decodeHTML(email);
                    }
                    return firstAlpha.charAt(0);                                        
                },
                /**
                 * Loading data from server to populate page info.
                 */
                loadData: function() {
                    var _this = this;
                    var bms_token = this.app.get('bms_token');
                    //Load subscriber details, fields and tags                    
                    var URL = "";                    
                    URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + bms_token + "&subNum=" + this.sub_id + "&type=getSubscriber";

                    //URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + bms_token + "&sfid=" + this.sub_id + "&type=getSubscriberBySfInfo&email="+this.email;
                    
                    var getSubscriber = jQuery.getJSON(URL, function(tsv, state, xhr) {                        
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (_this.app.checkError(_json)) {
                            return false;
                        }
                        
                        var create_date = moment(_this.app.decodeHTML(_json.creationDate), 'YYYY-M-D H:m');
                        _this.$(".s-date").html(create_date.date());
                        _this.$(".s-month-year").html("<strong>" + _this.app.getMMM(create_date.month()) + "</strong> " + create_date.year());
                        _this.sub_fields = _json;
                        
                        if(_json.score !== '0'){
                            _this.$('.score').html('<i class="icon score"></i>+<span class="score-value">'+_json.score+'</span>');
                        }else{
                            _this.$('.score').html('<i class="icon score"></i>&nbsp;<span class="score-value">0</span>');
                        }
                                                
                        if(!_this.tags_array){
                            _this.tags_array = _json["tags"];
                            if(_this.tags_array){
                                _this.populateTags();
                            }
                        }
                        _this.showTags();
                        //_this.showFields();
                        //Show Custom Fields
                        _this.subFieldsView.createCustomFields();
                       
                        
                        
                    })
                    this.pPage.enqueueAjaxReq.push(getSubscriber);
                    /*if(this.editable){
                        this.getActiviites();
                    }*/
                    
                },
                closeCallBack:function(){
                if(this.enqueueAjaxReq.length > 0){
                    for(var i=0;i < this.enqueueAjaxReq.length ; i++){
                                        
                        if(this.enqueueAjaxReq[i].readyState !== 4 && this.enqueueAjaxReq[i].status !== 200){

                            this.enqueueAjaxReq[i].abort();
                        }
                       //this.app.enqueueAjaxReq[i].abort();
                       var poped = this.enqueueAjaxReq.splice(i,1);

                    }   
                }
                      
            },
            getActiviites: function(){
                  //Loading subscriber activities like last seen, visists and actions 
                    var _this = this;
                    this.app.showLoading("States..", this.$(".sub-stats"));
                    URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + bms_token + "&subNum=" + this.sub_id + "&type=getActivityStats";
                   var getTimeLine = jQuery.getJSON(URL, function(tsv, state, xhr) {
                        _this.app.showLoading(false, _this.$(".sub-stats"));
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (_this.app.checkError(_json)) {
                            return false;
                        }
                        _this.$("._visits").html(_json.visits);
                        _this.$("._actions").html(_json.actions);
                        if (_json.lastSeenDate) {
                            var date_today = new Date();
                            var date1 = moment(date_today.getFullYear() + '-' + (date_today.getMonth() + 1) + '-' + date_today.getDate() + " " + date_today.getHours() + ":" + date_today.getMinutes(), 'YYYY-M-D H:m');
                            var date2 = moment(_this.app.decodeHTML(_json.lastSeenDate), 'YYYY-M-D H:m');
                            var diffMin = date1.diff(date2, 'minutes');
                            var diffHour = date1.diff(date2, 'hours');
                            var diffDays = date1.diff(date2, 'days');
                            var diffMonths = date1.diff(date2, 'months');
                            var diffYear = date1.diff(date2, 'years');
                            if (diffMin < 60) {
                                _this.$(".seen-interval").html(diffMin);
                                _this.$(".seen-time-text").html("Mins")
                            }
                            else if (diffHour < 24) {
                                _this.$(".seen-interval").html(diffHour);
                                _this.$(".seen-time-text").html("Hrs")
                            }
                            else if (diffDays < 32) {
                                _this.$(".seen-interval").html(diffDays);
                                _this.$(".seen-time-text").html("Days")
                            }
                            else if (diffMonths < 12) {
                                _this.$(".seen-interval").html(diffMonths);
                                _this.$(".seen-time-text").html("Months")
                            }
                            else if (diffMonths >= 12) {
                                _this.$(".seen-interval").html(diffYear);
                                _this.$(".seen-time-text").html("Years")
                            }
                        }
                        else {
                            _this.$(".seen-interval").html("&nbsp;");
                            _this.$(".seen-time-text").html("-")
                        }
                    })
                    this.enqueueAjaxReq.push(getTimeLine);
                    //Loading subscriber activities COUNT like email, alert, workflows, segements, lists and alerts
                    this.app.showLoading("Activities...", this.$(".activity-details"));
                    URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + bms_token + "&subNum=" + this.sub_id + "&type=getInvolvedInStats";
                    var getTimeLineDetail=jQuery.getJSON(URL, function(tsv, state, xhr) {
                        _this.app.showLoading(false, _this.$(".activity-details"));
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (_this.app.checkError(_json)) {
                            return false;
                        }
                        $.each(_json, function(key, value) {
                            _this.$("." + key).html(value);
                        })
                    })  
                    this.enqueueAjaxReq.push(getTimeLineDetail);
                },
                /**
                 * Show tags of view called when data is fetched.
                 */
                showTags: function() {                                       
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=allSubscriberTags";                    
                    var allTagsCall = jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                       if(xhr && xhr.responseText){                        
                            var tags_json = jQuery.parseJSON(xhr.responseText);                                
                            if(this.app.checkError(tags_json)){
                                return false;
                            }
                            var tags_common = [];
                            if(tags_json.tags){
                              $.each(tags_json.tags[0], function(index, val) {
                                    tags_common.push(val[0].tag);
                              })

                              var typeahead = this.$("input.autocomplete__input").data('typeahead');
                              if(typeahead) typeahead.source = tags_common;
                              else this.$("input.autocomplete__input").typeahead({source:tags_common,items:10});
                            }
                       }
                    },this)).fail(function() {  }); 
                    this.pPage.enqueueAjaxReq.push(allTagsCall);

                },
                newTags: function (data) {
                    if(this.modelTemplate){
                        this.modelTemplate.model.set("tags", data);
                    }
                },
                /**
                 * Show and hide large view of fields on view.
                 *
                 * @param {obj} clicked object.
                 *
                 * @returns .
                 */
                toggleFieldsView: function(obj) {
                    var a_button = $.getObj(obj, "a");
                    if (a_button.hasClass("up")) {
                        this.$(".topinfo").scrollTop(0)
                        this.$('.topinfo').animate({'height': '173px'}, 1000, function() {
                            $(this).css("overflow-y", "hidden");
                        });

                        a_button.removeClass("up")
                    }
                    else {
                        this.$(".topinfo").animate({'height': '420px'}, 1000, function() {
                            $(this).css("overflow-y", "auto");
                        });
                        a_button.addClass("up")
                    }
                },
                /**
                 * Populate basic and custom fields in view.
                 */
                showFields: function() {
                    var _this = this;
                    _this.$(".topinfo").children().remove();
                    var changeFieldsBtn = $('<a class="settingbtn"></a>');
                    changeFieldsBtn.click(_.bind(this.editProfile, this));
                    if(this.editable){
                        _this.$(".topinfo").append(changeFieldsBtn);
                    }
                    /*Contact Name on Header*/
                    var workspaceTitle = _this.sub_fields["firstName"] + " " + _this.sub_fields["lastName"];
                    if (_this.sub_fields["firstName"] !== "" || _this.sub_fields["lastName"] !== "")
                    {                       
                         workspaceTitle = _this.sub_fields["firstName"] + " " + _this.sub_fields["lastName"];                        
                    } else {                     
                         workspaceTitle = _this.sub_fields["email"];                        
                    }
                    this.sub_name = workspaceTitle;
                    _this.$el.parents(".ws-content").find("#workspace-header").html(workspaceTitle);
                    var workspace_id = _this.$el.parents(".ws-content").attr("id");
                    _this.app.mainContainer.setTabDetails({workspace_id:workspace_id,heading:workspaceTitle,subheading:"Contact Profile"});

                    $.each(_this.basicFields, function(key, val) {
                        if (key !== "telephone") {
                            if (key !== "title" && key !== "areaCode" && key !== "email") {
                                var _val = _this.sub_fields[key] ? _this.sub_fields[key] : "&nbsp;";
                                _this.$(".topinfo").append('<span>' + val.label + '<strong>' + _val + '</strong> </span>');
                            }
                            else {
                                if (key == "areaCode") {
                                    var _val = "&nbsp;";
                                    if (_this.sub_fields["areaCode"] !== "" && _this.sub_fields["telephone"] !== "") {
                                        _val = _this.sub_fields["areaCode"] + '-' + _this.sub_fields["telephone"];
                                    }
                                    else if (_this.sub_fields["areaCode"] == "" && _this.sub_fields["telephone"] !== "") {
                                        _val = _this.sub_fields["telephone"];
                                    }
                                    else if (_this.sub_fields["areaCode"] !== "" && _this.sub_fields["telephone"] === "") {
                                        _val = _this.sub_fields["areaCode"];
                                    }
                                    _this.$(".topinfo").append('<span>Area Code - Telephone<strong>' + _val + '</strong> </span>');
                                }
                                else {
                                    var _val = _this.sub_fields[key] ? _this.sub_fields[key] : "&nbsp;";
                                    var border = (key == "email") ? "border-bottom:1px solid #fff;padding-bottom:20px;margin-bottom:15px" : "";
                                    _this.$(".topinfo").append('<span style="width:98%;' + border + '">' + val.label + '<strong style="width:98%">' + _val + '</strong> </span>');
                                }
                            }
                        }

                    })
                    if (_this.sub_fields.cusFldList) {
                        $.each(_this.sub_fields.cusFldList[0], function(key, val) {
                            $.each(val[0], function(key, val) {
                                var _val = val ? val : "&nbsp;";
                                _this.$(".topinfo").append('<span>' + key + '<strong>' + _val + '</strong> </span>');

                            });
                        });
                    }
                    _this.$(".topinfo").append('<div class="clearfix"></div>');
                    if (this.sub_fields["salesStatus"]) {
                        this.$(".statusdd").show();
                        this.$(".statusdd span").html(this.sub_fields["salesStatus"]);
                        this.sub_saleStatus = this.sub_fields["salesStatus"];
                    }
                    else {
                        this.$(".statusdd").hide();
                    }
                    this.$(".score span").html(this.sub_fields["score"]);
                },
                /**
                 * Open edit profile dialog view.
                 */
                editProfile: function() {
                    var _this = this;
                    var dialog_width = 1000;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var btn_prp = {title: this.editable?'Edit Profile':'View Profile',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'account',
                        bodyCss: {"min-height": dialog_height + "px"}
                        
                    }
                    if(this.editable){
                        btn_prp['buttons']= {saveBtn: {text: 'Update', btnicon: 'update'}};
                        if (this.sub_fields["conLeadId"]) {
                            btn_prp['newButtons'] = [{'btn_name': 'Update at Salesforce'}];
                        }
                    }
                    var dialog = this.app.showDialog(btn_prp);
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["contacts/subscriber_fields"], function(sub_detail) {
                        var page = new sub_detail({sub: _this,isSalesforceUser:_this.options.params.isSalesforceUser,rowtemplate:_this.modelTemplate});
                        dialog.getBody().html(page.$el);
                        if (_this.sub_fields["conLeadId"]) {
                            dialog.saveCallBack2(_.bind(page.updateSubscriberDetailAtSalesForce, page, dialog));
                        }
                        dialog.saveCallBack(_.bind(page.updateSubscriberDetail, page, dialog));
                    });
                }
                /**
                 * Manage lists , loading view in same area and hiding parent detail view.
                 */
                ,
                manageLists: function() {
                    var _this = this;
                    var dialog_width = 1000;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var btn_prp = {title: this.editable?'Manage Lists':"Lists",
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10%"},
                        headerEditable: false,
                        headerIcon: 'mlist2',
                        bodyCss: {"min-height": "448px"}
                        
                    }
                    if(this.editable){
                        btn_prp["buttons"] = {saveBtn: {text: 'Save', btnicon: 'save'}}
                    }

                    var dialog = this.app.showDialog(btn_prp);
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["contacts/manage_lists"], function(sub_manage_lists) {
                        var page = new sub_manage_lists({sub: _this});
                        dialog.getBody().html(page.$el);
                        dialog.saveCallBack(_.bind(page.updateSubscriberLists, page, dialog));
                    });
                },
                fetchContacts: function() {
                    //this.sub.fetchContacts();
                },
                loadActivityTimeLine: function() {                    
                    
                    //require(["contacts/subscriber_timeline"], function(timelinePage) {
                        var page = new timelinePage({sub:this});
                        this.pPage.$(".contact-activity").html(page.$el);
                    //});
                },
                sendEmail : function(){
                         // Loading templates 
                        var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-182;
                        var dialog = this.app.showDialog({title:'Templates'+'<strong id="oto_total_templates" class="cstatus pclr18 right" style="margin-left:5px;display:none;"> Total <b></b> </strong>',
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                        headerEditable:false,
                        headerIcon : 'template',
                        bodyCss:{"min-height":dialog_height+"px"},
                        tagRegen:false,
                        reattach : false
                        });
                        this.app.showLoading("Loading Templates...",dialog.getBody());
                        var _this = this;
                        require(["bmstemplates/templates"],function(templatesPage){                                                     
                             _this.templateView = new templatesPage({page:_this,app:_this.app,scrollElement:dialog.getBody(),dialog:dialog,selectCallback:_.bind(_this.selectTemplate,_this),isOTO : true,subNum:_this.sub_id,directContactFlag:true});               
                           var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                           dialog.getBody().append( _this.templateView.$el);
                            _this.templateView.$el.addClass('dialogWrap-'+dialogArrayLength); 
                           _this.app.showLoading(false,  _this.templateView.$el.parent());                     
                             _this.templateView.init();
                             _this.templateView.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                             _this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                            _this.app.dialogArray[dialogArrayLength-1].currentView = _this.templateView; // New Dialog
                        })
                 },
                 selectTemplate:function(obj){                   
                    var target = $.getObj(obj,"a");
                    var bms_token =this.app.get('bms_token');                   
                     this.template_id = target.attr("id").split("_")[1]; 
                     this.templateView.createOTODialog();
                    
                },
                suppressDialog:function(){
                    this.app.showAlertPopup({heading: 'Confirm Suppress',
                            detail: "Are you sure you want to suppress this subscriber?",
                            text: "Suppress",
                            icon: "supress-w",
                            callback: _.bind(function () {                                
                                this.suppressSub();
                            }, this)},
                        $('body'));   
                },
                suppressSub:function(){
                    var URL = '/pms/io/subscriber/setData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    this.app.showLoading("Suppressing Subscriber...", this.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                    $.post(URL, {type: 'suppress', subNum: this.sub_id})
                    .done(_.bind(function (data) {
                        this.app.showLoading(false, this.$el.parents(".ws-content.active"));
                        var _json = jQuery.parseJSON(data);
                        if (_json[0] !== "err") {
                            this.app.showMessge("Subscriber has been successfully suppressed!");    
                            this.$('.suppress-sub').parent().hide();
                        }
                        else {
                            this.app.showAlert(_json[1], $("body"));
                        }

                    }, this));
                },
                courseCorrectDialog:function(){                     
                        var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-182;
                        var workspaceTitle = this.sub_fields["firstName"] + " " + this.sub_fields["lastName"];
                        var dialog = this.app.showDialog({title:'Course Correct Drip Messages For '+workspaceTitle,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgcoursecorrect',
                                  bodyCss:{"min-height":dialog_height+"px"}
                        });
                        
                        var coursecorrect_url = "/pms/trigger/CourseCorrect_new.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&subNum="+ this.sub_id+"&fromNewUI=true&popup=Y";
                        var iframHTML = "<iframe src=\""+coursecorrect_url+"\"  width=\"100%\" class=\"workflowiframe\" frameborder=\"0\" style=\"height:"+(dialog_height-7)+"px\"></iframe>"
                        dialog.getBody().html(iframHTML);
                        this.app.showLoading("Loading Course Correct...",dialog.getBody());
                         dialog.getBody().find('.workflowiframe').load(_.bind(function () {
                                this.app.showLoading(false,dialog.getBody());
                                // this.$("#workflowlistsearch #clearsearch").click();

                         },this))
                                                
                },
                addToWorkflowDialog:function(){                     
                        var dialog_width = 600;
                        var dialog_height = 280;
                        var dialog = this.app.showDialog({title:'Add To Workflow',
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgcoursecorrect',
                                  bodyCss:{"min-height":dialog_height+"px"}
                        });
                        
                        var coursecorrect_url = "/pms/trigger/addToWorkflow.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&subNum="+ this.sub_id+"&fromNewUI=true";
                        var iframHTML = "<iframe src=\""+coursecorrect_url+"\"  width=\"100%\" id=\"addToWorkFlow\" class=\"workflowiframe\" frameborder=\"0\" style=\"height:"+(dialog_height-7)+"px\"></iframe>"
                        dialog.getBody().html(iframHTML);
                        $("[workspace_id='contacts']").data("dialogObj",dialog);
                        this.app.showLoading("Loading..",dialog.getBody());
                         dialog.getBody().find('.workflowiframe').load(_.bind(function () {
                                this.app.showLoading(false,dialog.getBody());                                
                                dialog.$el.find('.modal-footer .btn-save span').html('Add to Workflow');
                                dialog.$el.find('.modal-footer .btn-save').removeClass('btn-save').addClass('btn-add').show();                                                
                                dialog.$el.find('.modal-footer .btn-add i.icon').removeClass('save').addClass('plus');
                                dialog.$el.find('.modal-footer .btn-add').unbind('click');
                                dialog.$el.find('.modal-footer .btn-add').bind('click',function (event) {
                                    document.getElementById('addToWorkFlow').contentWindow.validate();
                                })

                         },this))
                                                
                },
                firstLetterContact : function(){
                    //console.log('id : '+ this.sub_id + ' name : '+ this.sub_name);
                    this.app.mainContainer.SubscriberName(this.sub_id,this.sub_name);
                },
                //////////////////////////
                /// Add 2 Lists
                /////////////////////////
                add2list : function(){
                  //this.subsType = substype;
                    var _this = this;
                    var dialog_width = 1000;
                    this.editable = true;

                    var dialog_height = $(document.documentElement).height() - 192;
                    var btn_prp = {title: 'Add Contact into List',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'account',
                        bodyCss: {"min-height": dialog_height + "px"}

                    }

                    if (this.editable) {
                        btn_prp['buttons'] = {saveBtn: {text: 'Add', btnicon: 'plus'}};
                        // if (this.sub_fields["conLeadId"]) {
                        //     btn_prp['newButtons'] = [{'btn_name': 'Update at Salesforce'}];
                        // }
                    }
                    this.dialog = this.app.showDialog(btn_prp);
                    this.app.showLoading("Loading...", this.dialog.getBody());
                     
                            var page = new listView({sub: this, model: this.model,dialog:this.dialog});
                            this.dialog.getBody().html(page.$el);
                            page.dialogStyles['height'] = dialog_height;
                            page.dialogStyles['width'] = dialog_width;
                            page.dialogStyles['top'] = '10px';
                            page.init();
                            this.dialog.saveCallBack(_.bind(page.addSubscriber, page, this.dialog));
                       
                    
                        //if (this.subsType === 'multiEmails') {
                        //    this.dialog.getBody().css('overflow', 'hidden');
                        //}
                        //this.subDetail = new sub_detail({sub: this.parent, page: this, isSalesforceUser: false, isAddFlag: true, emailsFlag: true});
                    
                    
                },
                addTagMode: function(){
                    if(this.$(".addTagWrapper").hasClass("hide")){
                        this.$(".addTagWrapper").removeClass("hide");
                        this.$(".add-tag-button").addClass("hide");
                        this.$("input.tag__input_mks").focus();
                    }
                    else{
                        this.$(".addTagWrapper").addClass("hide");
                        this.$(".add-tag-button").removeClass("hide");
                    }
                },
                populateTags: function(){                    
                    var tags_ul = this.$(".mks_tag_ul");
                    tags_ul.children().remove();
                    var tags_array = this.tags_array ? this.tags_array.split(","):[];
                    var _this = this;
                    if(tags_ul.length==0 && tags_array.length>0){
                        this.$(".tags-contents").html('<div class="tags_content"><ul class="mks_tag_ul"></ul></div>');
                        tags_ul = this.$(".mks_tag_ul");
                    }
                    else if(tags_array.length==0){
                        this.$(".tags-contents").html('<div class="tags-not-found"><p class="not-found">No tags available.</p></div>');
                    }
                    $.each(tags_array,function(i,t){            
                        var li_html =$('<li id="_tag_'+i+'" data-id="'+i+'"><a class="tag" ><span> '+t+'</span><i class="icon cross" ></i></a></li>')            
                        li_html.find(".cross").click(function(event){
                           var li = $(this).parents("li")                           
                           _this.deleteTag(li.data("id"));
                        })
                        tags_ul.append(li_html);                    
                    });    
                },
                deleteTag: function(tag_id){
                    var self = this  
                    var URL = '/pms/io/subscriber/setData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    var tags_array = this.tags_array.split(",")
                    var tag = tags_array[tag_id];
                    tags_array.splice(tag_id,1)    
                    var temp_tags = tags_array.join();
                    tag = this.app.encodeHTML(tag);
                    var _data = {"type":"deleteTag","tag":tag,subNum:this.sub_id} 
                    this.app.showLoading("Deleting Tag...", this.$("#Tags"));
                    $.post(URL, _data)
                        .done(_.bind(function(data) {         
                            this.app.showLoading(false, this.$("#Tags"));
                            var tag_json = jQuery.parseJSON(data);
                            if (this.app.checkError(tag_json)) {
                                this.app.showAlert(tag_json[1], $("body"));
                                return false;
                            }                                   
                            else if(tag_json && tag_json.success){
                                this.tags_array = temp_tags;
                                this.model.set("tags",this.app.encodeHTML(this.tags_array));
                                this.populateTags();                                                                
                            }
                            

                     },this));
                },
                addTag: function(){
                     var _input = this.$("input.tag__input_mks")
                     var tag = _input.val();
                     var URL = '/pms/io/subscriber/setData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    if(URL && this.validationTag(tag)){  
                        this.app.showLoading("Adding Tag...", this.$("#Tags"));
                        tag = this.app.encodeHTML(tag)                        
                        var temp_tags = (this.tags_array)?(this.tags_array+","+tag):tag                         
                        _input.prop("disabled",true);                         
                         var _data = {"type":"addTag","tag":tag,subNum:this.sub_id,tags:""}                                                    
                          $.post(URL, _data)
                              .done(_.bind(function(data) {                                  
                                  var tag_json = jQuery.parseJSON(data);  
                                  this.app.showLoading(false, this.$("#Tags"));
                                  if (this.app.checkError(tag_json)) {
                                        return false;
                                   }
                                  _input.prop("disabled",false);
                                  this.app.showLoading(false, this.$el);
                                  if (tag_json[0] !== "err") {
                                       this.tags_array = this.app.encodeHTML(temp_tags); 
                                       this.model.set("tags",this.app.encodeHTML(this.tags_array));
                                       _input.val('');
                                       this.populateTags();                                       
                                    } else {
                                        this.app.showAlert(tag_json[1], $("body"));
                                    }

                           },this));
                    }
                },
                validationTag:function(tag){
                    var isValid = true;
                   
                    var tags_arr = this.tags_array.split(",");
                    var edit_id = null;
                    if($.trim(tag)==""){
                        isValid = false;
                    }
                    else if(tag.length>30){                        
                        this.app.showAlert('Tag length shouldn\'t be greater than 30 characters.',$("body"),{fixed:true});
                        isValid = false;
                    }
                    else if(tag.indexOf(",")>-1){                        
                        this.app.showAlert('Tag shouldn\'t contain ",".',$("body"),{fixed:true});
                        isValid = false;
                    }
                    else if($.inArray(this.app.encodeHTML(tag),tags_arr)>-1){                        
                        if(edit_id===null){                            
                            this.app.showAlert('Tag already exists with same name.',$("body"),{fixed:true});
                            isValid = false;
                        }                        
                    }                            
                    
                    return isValid;
                },
                synctoSF: function (event) {
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Add to Salesforce',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'salesforcelog',
                        bodyCss: {"min-height": dialog_height + "px"},
                        tagRegen: false,
                        reattach: false
                    });
                    var _this = this;
                    this.app.showLoading("Loading Salesforce...", dialog.getBody());
                    var url = "/pms/dashboard/AddToSalesForce.jsp?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.model.get("subNum");
                    var iframHTML = "<iframe src=\"" + url + "\"  width=\"100%\" id='addtosalesforceframe' class=\"workflowiframe\" frameborder=\"0\" style=\"height:" + (dialog_height - 7) + "px\"></iframe>"
                    dialog.getBody().append(iframHTML);
                    dialog.getBody().find('.workflowiframe').load(function () {
                        //$(this).show();
                        var iframe = $(this);
                        //console.log('load the iframe')
                        if (iframe.contents().find('.info').hasClass('successfull-lead')) {
                            // console.log('Successfully lead added need to hide ');
                            _this.app.showLoading("Saving Salesforce...", dialog.getBody());
                            _this.app.showMessge("Subscriber has been added successfully as a lead at Salesforce.");
                            iframe.contents().find('.publisherPageWrapper').hide();
                            _this.sub.$el.find('.refresh_btn').click();

                            dialog.hide();
                        }
                        if (iframe.contents().find('.error').hasClass('error-lead')) {
                            // console.log('lead error  ');
                            dialog.$el.find('.modal-footer .btn-add').hide().delay(1000);
                            dialog.$el.find('.modal-footer .btn-close').before('<a style="" class="btn-yellow left btn-backsales"><i class="icon back left"></i><span>Back</span></a>')
                            //_this.app.showMessge("Subscriber has been added successfully as a lead at Salesforce.");
                            //dialog.hide();  
                            dialog.$el.find('.modal-footer .btn-backsales').click(function () {
                                dialog.$el.find('#addtosalesforceframe').attr('src', url);
                            })

                        } else {
                            dialog.$el.find('.modal-footer .btn-add').show();
                            dialog.$el.find('.modal-footer .btn-backsales').remove();
                        }
                        _this.app.showLoading(false, dialog.getBody());
                        dialog.$el.find('.modal-footer .btn-save span').html('Add to Salesforce');
                        dialog.$el.find('.modal-footer .btn-save').removeClass('btn-save').addClass('btn-add').show();
                        iframe.contents().find('.hideitiframe').hide();
                        //console.log(url);
                        dialog.$el.find('.modal-footer .btn-add').click(function (event) {
                            document.getElementById('addtosalesforceframe').contentWindow.addtosf();
                        })
                    });
                    event.stopPropagation();

                },
                viewSyncedSF: function (event) {
                    var url = this.app.decodeHTML(this.model.get('sfUrl'));
                    window.open(url, 'newwindow', 'scrollbars=yes,resizable=yes');
                    event.stopPropagation();
                }

            });
        });