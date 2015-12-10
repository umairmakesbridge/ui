define(['text!contacts/html/subscriber_row.html', 'common/tags_row'],
        function (template, tagView) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber Record View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'li',
                className: 'contact-li',
                detailFields: {"firstName": {"label": "First Name"}, "lastName": {"label": "Last Name"}, "email": {"label": "Email"}, "company": {"label": "Company"}, "city": {"label": "City"},
                    "country": {"label": "Country"}, "state": {"label": "State"}, "zip": {"label": "Zip"}, "address1": {"label": "Address 1"}, "address2": {"label": "Address 2"},
                    "areaCode": {"label": "Area Code"}, "telephone": {"label": "Telephone"}, "jobStatus": {"label": "Job Status"}, "industry": {"label": "Industry"}, "salesRep": {"label": "Sales Rep"},
                    "source": {"label": "Source"}, "salesStatus": {"label": "Sales Status"}, "occupation": {"label": "Occupation"}, "birthDate": {"label": "Birthday"}},
                    mapping: {"SU": {"name": "Signup Form"}, "CS": {"name": "Campaign Sent"}, "OP": {"name": "Campaign Open"}, "CK": {"name": "Email Click"}, "MT": {"name": "Single Message Sent"}
                    , "MO": {"name": "Single Message Open"}, "MC": {"name": "Single Message URL Click"}, "MS": {"name": "Single Message Surpress"}, "WM": {"name": "WF C2Y Trigger Mail"}
                    , "MM": {"name": "MY C2Y Trigger Mail"}, "UN": {"name": "Unsubscribe"}, "SP": {"name": "Suppress"}, "SC": {"name": "Score Change"}, "TF": {"name": "Tell a friend"}
                    , "WV": {"name": "Web Visit"}, "WA": {"name": "Workflow Alert"}, "S": {"name": "Sent"}, "O": {"name": "Opened"}, "C": {"name": "Clicked"}},
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .more-detail': 'showDetail',
                    'click .closebtn': 'hideDetail',
                    'click .tag': 'tagSearch',
                    'click .oto-sendmail': 'sendEmail',
                    'click .show-detail': 'editProfile',
                    'click .show-contact-detail': 'openContact',
                    'click .add-to-salesforce': "synctoSF",
                    'click .salesforce-view': "viewSyncedSF"
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.tmPr = '';
                    this.render();
                    this.model.on('change', this.renderRow, this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        model: this.model,
                        time: this.getActivityDate(this.model.get("lastActivityDate")),
                        contact_name: this.getContactName(),
                        activity_type: this.mapping[this.model.get("lastActivityType")] ? this.mapping[this.model.get("lastActivityType")].name : this.model.get("lastActivityType")
                    }));
                    this.initControls();
                },
                /**
                 * Render Row view on page.
                 */
                renderRow: function () {
                    //console.log('Change Occured');
                    this.render();
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$('input.contact-row-check').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                    });

                    this.$('input.contact-row-check').on('ifChecked', _.bind(function (event) {
                        this.trigger('updatecount');
                        return false;
                    }, this))

                    this.$('input.contact-row-check').on('ifUnchecked', _.bind(function (event) {
                        this.trigger('updatecount');
                        return false;
                    }, this))

                    if (this.model.get("supress") == "S") {
                        this.$el.addClass("suppressed");
                        this.$(".checkpanelinput").addClass("disabled");
                        this.$('.suppressed-icon').show();
                    }

                    this.showTagsTemplate();
                    this.getFirstAlphabet();
                    this.lastOpenActivityDate();

                },
                lastOpenActivityDate: function () {
                    var date_today = new Date();
                    var date1 = moment(date_today.getFullYear() + '-' + (date_today.getMonth() + 1) + '-' + date_today.getDate() + " " + date_today.getHours() + ":" + date_today.getMinutes(), 'YYYY-M-D H:m');
                    var date2 = moment(this.app.decodeHTML(this.model.get("lastActivityDate")), 'YYYY-M-D H:m');
                    var diffMin = date1.diff(date2, 'minutes');
                    var diffHour = date1.diff(date2, 'hours');
                    var diffDays = date1.diff(date2, 'days');
                    var diffMonths = date1.diff(date2, 'months');
                    var diffYear = date1.diff(date2, 'years');
                    if (diffMin < 60) {

                        var mins = parseInt(diffMin) <= "1" ? "min" : "mins";
                        this.$(".act em").html("- " + diffMin + " " + mins + " ago");
                        //this.$(".act em").html("Mins")
                    }
                    else if (diffHour < 24) {
                        var hrs = parseInt(diffHour) <= "1" ? "hr" : "hrs";
                        this.$(".act em").html("- " + diffHour + " " + hrs + " ago");
                        //this.$(".seen-time-text").html("Hrs")
                    }
                    else if (diffDays < 32) {
                        var day = parseInt(diffDays) <= "1" ? "day" : "days";
                        this.$(".act em").html("- " + diffDays + " " + day + " ago");
                        //this.$(".seen-time-text").html("Days")
                    }
                    else if (diffMonths < 12) {
                        var month = parseInt(diffMonths) <= "1" ? "month" : "months";
                        this.$(".act em").html("- " + diffMonths + " " + month + " ago");
                        //this.$(".seen-time-text").html("Months")
                    }
                    else if (diffMonths >= 12) {
                        var year = parseInt(diffMonths) <= "1" ? "year" : "years";
                        this.$(".act em").html("- " + diffYear + " " + year + " ago");
                        //this.$(".seen-time-text").html("Years")
                    }


                    if (this.sub.searchTxt) {
                        this.$(".show-contact-detail a").highlight($.trim(this.sub.searchTxt));
                        this.$(".tag").highlight($.trim(this.sub.searchTxt));
                    }
                    else if (this.sub.tagTxt) {
                        this.$(".tag").highlight($.trim(this.app.decodeHTML(this.sub.tagTxt)));
                    }
                },
                showTagsTemplate: function () {

                    this.tmPr = new tagView(
                            {parent: this,
                                app: this.app,
                                parents: this.sub,
                                rowElement: this.$el,
                                helpText: 'Contacts',
                                type: 'contacts',
                                tags: this.model.get('tags')});

                    this.$('.tagscont').append(this.tmPr.$el);
                    this.$('.tagscont ul li a.showtooltip').tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                },
                showDetail: function () {
                    this.$(".allprofileinfo .proinfo span").remove();
                    this.$(".allprofileinfo,.closebtn").show();
                    var _this = this;
                    _.each(this.detailFields, function (val, key) {
                        var _val = _this.model.get(key) ? _this.model.get(key) : "&nbsp;";
                        _this.$(".allprofileinfo .proinfo").append('<span>' + val.label + '<strong>' + _val + '</strong></span>');

                    });

                },
                hideDetail: function () {
                    this.$(".allprofileinfo,.closebtn").hide();
                    this.$(".allprofileinfo .proinfo span").remove();
                },
                getActivityDate: function (_date) {
                    if (_date) {
                        var date_time = this.app.decodeHTML(_date);
                        date_time = date_time.split(" ")[0];
                        var _date = date_time.split("-");
                        return _date[2] + " " + this.app.getMMM(parseInt(_date[1]) - 1) + ", " + _date[0];
                    }
                    else {
                        return "";
                    }
                },
                getContactName: function () {
                    var fName = this.model.get("firstName");
                    var lName = this.model.get("lastName");
                    var full_name = this.app.decodeHTML(fName) + ' ' + this.app.decodeHTML(lName);
                    if (!fName && !lName) {
                        full_name = this.app.decodeHTML(this.model.get("email"));
                    }
                    return full_name;
                },
                getFirstAlphabet: function (json) {
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
                    //return firstAlpha.charAt(0);
                    this.$('.contact-firstAlphabet').find('.letter_block').addClass('l_' + firstAlpha.charAt(0).toLowerCase());
                    this.$('.contact-firstAlphabet').find('span').html(firstAlpha.charAt(0));
                },
                tagSearch: function (obj) {
                    var tag = this.app.encodeHTML($(obj.target).text())
                    this.trigger('tagclick', tag);
                    return false;
                },
                /**
                 * Open edit profile dialog view.
                 */
                editProfile: function () {
                    var _this = this;
                    var dialog_width = 1000;
                    var editable = true;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var btn_prp = {title: editable ? 'Edit Profile' : 'View Profile',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'account',
                        bodyCss: {"min-height": dialog_height + "px"}

                    }
                    if (editable) {
                        btn_prp['buttons'] = {saveBtn: {text: 'Update', btnicon: 'update'}};
                        if (this.sub.isSalesforceUser) {
                            btn_prp['newButtons'] = [{'btn_name': 'Update at Salesforce'}];
                        }
                    }
                    var dialog = this.app.showDialog(btn_prp);
                    this.app.showLoading("Loading...", dialog.getBody());
                    this.loadData(dialog);
                },
                /**
                 * Loading data from server to populate page info.
                 */
                loadData: function (dialog) {
                    var _this = this;
                    var bms_token = this.app.get('bms_token');
                    this.sub_id = this.model.get("subNum");
                    //Load subscriber details, fields and tags
                    this.app.showLoading("Loading Contact Details...", this.$el);
                    var URL = "";
                    var editable = true;
                    if (editable) {
                        URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + bms_token + "&subNum=" + this.sub_id + "&type=getSubscriber";
                    }
                    else {
                        URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + bms_token + "&sfid=" + this.sub_id + "&type=getSubscriberBySfInfo&email=" + this.model.get("email");
                    }
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        _this.app.showLoading(false, _this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (_this.app.checkError(_json)) {
                            return false;
                        }
                        _this.sub_fields = _json;
                        _this.sub_id = _json.subNum;
                        require(["contacts/subscriber_fields"], function (sub_detail) {
                            var page = new sub_detail({sub: _this, isSalesforceUser: _this.sub.isSalesforceUser, rowtemplate: _this, isUpdateSubs: true, sub_fields: _this.sub_fields});
                            dialog.getBody().html(page.$el);
                            if (_this.sub.isSalesforceUser) {
                                dialog.saveCallBack2(_.bind(page.updateSubscriberDetailAtSalesForce, page, dialog));
                            }
                            dialog.saveCallBack(_.bind(page.updateSubscriberDetail, page, dialog));
                        });
                    });
                },
                openContact: function () {
                    var sub_name = '';
                    if (this.model.get("firstName")) {
                        sub_name = this.model.get("firstName");
                    } else if (this.model.get("lastName")) {
                        sub_name = this.model.get("lastName");
                    } else {
                        sub_name = this.model.get("email");
                    }

                    this.app.mainContainer.openSubscriber(this.model.get("subNum"), sub_name, this.model.get("supress"), this.sub.isSalesforceUser, this);

                },
                sendEmail: function () {
                    // console.log(this.model.get("subNum"));
                    // Loading templates 
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Templates' + '<strong id="oto_total_templates" class="cstatus pclr18 right" style="margin-left:5px;display:none;"> Total <b></b> </strong>',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'template',
                        bodyCss: {"min-height": dialog_height + "px"},
                        tagRegen: false,
                        reattach: false
                    });
                    this.app.showLoading("Loading Templates...", dialog.getBody());
                    var _this = this;
                    require(["bmstemplates/templates"], function (templatesPage) {
                        _this.templateView = new templatesPage({page: _this, app: _this.app, scrollElement: dialog.getBody(), dialog: dialog, selectCallback: _.bind(_this.selectTemplate, _this), isOTO: true, subNum: _this.model.get("subNum"), directContactFlag: true});
                        var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                        dialog.getBody().append(_this.templateView.$el);
                        _this.templateView.$el.addClass('dialogWrap-' + dialogArrayLength);
                        _this.app.showLoading(false, _this.templateView.$el.parent());
                        _this.templateView.init();
                        _this.templateView.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        _this.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                        _this.app.dialogArray[dialogArrayLength - 1].currentView = _this.templateView; // New Dialog
                    })
                },
                selectTemplate: function (obj) {
                    // this.setEditor();
                    var target = $.getObj(obj, "a");
                    var bms_token = this.app.get('bms_token');
                    // this.app.showLoading('Loading HTML...',this.$el);
                    //this.states.editor_change = true;
                    // var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+                             
                    // jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));                    
                    this.template_id = target.attr("id").split("_")[1];
                    this.templateView.createOTODialog();

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
                    var url = $(event.target).parent().data('url');
                    window.open(url, 'newwindow', 'scrollbars=yes,resizable=yes');
                    event.stopPropagation();
                }


            });
        });