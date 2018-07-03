define(['text!newcontacts/html/subscriber_fields_col.html','newcontacts/addcustomfiled'],
        function (template,customfieldpage) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber fields View
            // 
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: '',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .add-to-salesforce': 'addToSalesForce',
                    'click .mks_expandable': 'collapseExpandFields',
                    'click .mkb_basic_edit': 'basicFieldEdit',
                    'click .mkb_basic_cancel': 'cancelBasicFieldEdit',
                    'click .mkb_cf_edit_btn': 'customFieldEdit',
                    'click .mkb_cf_cancel_btn': 'cancelCustomFieldEdit',
                    'click .scfe_save_t':'updateSubscriberDetailAtSalesForce',
                    'click .mkb_basic_done': function () {
                        this.updateSubscriberDetail('basic');
                    },
                    'click .mkb_cf_done': function () {
                        this.updateSubscriberDetail('custom');
                    },
                    'click .addCF':'addNewCustomField'
                },
                basicFields: {"firstName": {"label": "First Name"}, "lastName": {"label": "Last Name"}, "company": {"label": "Company"}, "telephone": {"label": "Phone"},
                    "city": {"label": "City"}, "address1": {"label": "Address 1"}, "address2": {"label": "Address 2"}, "state": {"label": "State"}, "zip": {"label": "Zip"},
                    "country": {"label": "Country"}, "birthDate": {"label": "Birthday"}, "occupation": {"label": "Occupation"}, "industry": {"label": "Industry"},
                    "jobStatus": {"label": "Job Status"}, "areaCode": {"label": "Area Code"}, "salesRep": {"label": "Sales Rep"}, "source": {"label": "Source"}, "salesStatus": {"label": "Sales Status"}},
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.subscriber = this.options.sub;
                    this.pPage = this.options.parentPage;
                    this.editable = this.subscriber.editable;
                    this.app = this.subscriber.app;
                    this.emailsFlag = this.options.emailsFlag;
                    if (this.options.rowtemplate) {
                        this.modelTemplate = this.options.rowtemplate;
                    }
                    this.elDialogView = '';

                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function () {
                    this.$el.html(this.template({}));
                    this.initControls();
                    this.setupFields();
                    if(this.options.isSalesforceUser){                     
                     this.showSalesforceUser();
                    }
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    if(this.editable==false){
                        this.$el.addClass("supress-mode");
                    }

                },
                /**
                 * Create fields and Append to view
                 */
                setupFields: function () {
                    var _this = this;
                    var tabindex = 1;
                    var basicFields;
                    basicFields = this.basicFields
                    _this.basicFieldsContainer = _this.$(".basic_fields");
                    _this.basicFieldsContainer.children().remove();
                    $.each(basicFields, function (key, val) {
                        var field_html = '<div class="mksph_contact_data">';
                        field_html += '<span class="mksph_contact_title">' + val.label + ':&nbsp;</span>';
                        field_html += '<span class="mksph_contact_value show">' + _this.model.get(key) + '</span>';
                        field_html += '<input class="hide focusThis" tabindex="' + tabindex + '" type="text" name="' + key + '" value="' + _this.model.get(key) + '">';
                        field_html += '</div>';
                        _this.basicFieldsContainer.append(field_html);
                        tabindex++;
                    });

                },
                /**
                 * Create custom fields and Append to view
                 */
                createCustomFields: function () {
                    var customFields = null;
                    var tabindex = 1;
                    var _this = this;
                    this.customFieldContainer = this.$(".csfields-contents");
                    this.customFieldContainer.children().remove();
                    customFields = this.subscriber.sub_fields.cusFldList;
                    var custFieldCount = 0;

                    if (customFields) {
                        this.customFieldContainer.html('<ul class="customFields_ul"></ul>');
                        $.each(customFields[0], function (_key, val) {
                            $.each(val[0], function (key, val) {
                                var field_html = '<li><div>';
                                field_html += '<span class="mksph_contact_title">' + key + '</span>:&nbsp;';
                                field_html += '<span class="mksph_contact_value show mkb_elipsis">' + val + '</span>';
                                field_html += '<input class="hide" id="' + _key + '" name="frmFld_' + key + '" type="text" tabindex="' + tabindex + '" value="' + val + '">';
                                _this.customFieldContainer.find(".customFields_ul").append(field_html);
                                tabindex++;
                                custFieldCount = custFieldCount + 1;
                            });

                        });
                    } else {
                        _this.customFieldContainer.html('<p class="not-found">No Custom Fields found</p>')
                    }
                    if(custFieldCount > 6){
                        this.$(".cf_expand").removeClass("hide");
                    }
                    
                    
                },
                /**
                 * Update fields value in cache.
                 *
                 * @returns .
                 */
                updateValues: function (area) {
                    var _this = this;

                    if (area == "basic") { // check if subscriber exists
                        this.basicFieldsContainer.find("input[type='text']").each(function () {
                            $(this).prev().html($(this).val());
                        });
                        this.hideShowBasicInputs("hide");
                    } else {
                        var last_val = 0;
                        if (_this.subscriber.sub_fields.cusFldList) {
                            this.customFieldContainer.find("input[type='text']").each(function () {
                                if ($(this).attr("id")) {
                                    /*var custFieldList = _this.subscriber.sub_fields.cusFldList[0][$(this).attr("id")];
                                     var key = null;
                                     $.each(custFieldList[0],function(k,v){
                                     key = k;
                                     });
                                     custFieldList[0][key] = _this.app.encodeHTML($(this).val());                            */
                                    $(this).prev().html($(this).val());
                                } else {

                                    last_val = 1;
                                }
                            });

                            if (last_val) {
                                _this.subscriber.loadData();
                            }
                        }
                        this.showHideCustomInputs("hide");
                    }

                }
                ,
                /**
                 * Update subscriber detail called from dialog update button
                 *
                 * @returns .
                 */
                updateSubscriberDetail: function (area) {
                    var _this = this;
                    var msg = area=="new"?"Creating Custom Field....":"Saving Subscriber Fields...";
                    _this.app.showLoading(msg, this.$el);
                    var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.subscriber.sub_id + "&type=editProfile";
                    var formSerialize = this.$("#sub_fields_form").serializeArray();
                    $.post(URL, this.$("#sub_fields_form").serialize())
                            .done(function (data) {
                                var _json = jQuery.parseJSON(data);
                                _this.app.showLoading(false, _this.$el);
                                if (_json[0] !== "err") {
                                    if(area!=="new"){
                                        _this.app.showMessge("Subscriber Updated Successfully!");
                                        _this.updateValues(area);
                                        _this.updateModel(formSerialize);
                                    } 
                                    else{
                                         _this.subscriber.loadData();
                                    }

                                } else {
                                    _this.app.showAlert(_json[1], $("body"));
                                }


                            });
                },
                updateModel: function (data) {
                    //console.log(data);
                    var dataObj = {};
                    // Form array to Json
                    for (var i = 0; i < data.length; i++) {
                        dataObj[data[i].name] = data[i].value;
                    }
                    //console.log(dataObj.firstName);
                    this.model.set(dataObj);
                },
                updateSubscriberDetailAtSalesForce: function ()
                {
                    var _this = this;
                    _this.app.showLoading("Saving Subscriber Fields & updating on salesforce...", this.$el);
                    var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.subscriber.sub_id + "&type=editProfile&updateAtSF=y";
                    $.post(URL, this.$("#sub_fields_form").serialize())
                            .done(function (data) {
                                var _json = jQuery.parseJSON(data);
                                _this.app.showLoading(false, _this.$el);
                                if (_json[0] !== "err") {
                                    _this.app.showMessge("Subscriber Updated Successfully on Salesforce!");
                                }
                                else{
                                    _this.app.showAlert(_json[1], $("body"));
                                }
                            });
                },
                refreshContactList: function () {
                    var contact_listing = $(".ws-tabs li[workspace_id='contacts']");
                    if (contact_listing.length) {
                        contact_listing.data("viewObj").fetchContacts();
                    }
                },
                updateSubscriberLetter: function () {

                    var subName = '';
                    if (this.subscriber.sub_fields.firstName) {
                        subName = this.subscriber.sub_fields.firstName;
                    } else if (this.subscriber.sub_fields.lastName) {
                        subName = this.subscriber.sub_fields.lastName;
                    } else {
                        subName = this.subscriber.sub_fields.email;
                    }
                    this.app.mainContainer.SubscriberName(this.subscriber.sub_id, subName);
                },
                showSalesforceUser: function () {
                    if (this.model.get("conLeadId") && this.editable) {
                        this.$('#SalesForce').removeClass("hide");
                        this.$('#sfid').val(this.model.get("conLeadId"));
                        this.$('#sfowner').val(this.model.get("salesRep"));
                    } else {
                        this.$('#SalesForce').addClass("hide");
                    }
                },
                /*
                 * Add to salesforce User
                 */
                addToSalesForce: function (event) {
                    if (this.$('.add-to-salesforce').hasClass('add-cursor')) {
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
                        //var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                        // page.$el.addClass('dialogWrap-' + dialogArrayLength);
                        var url = "/pms/dashboard/AddToSalesForce.jsp?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + _this.subscriber.sub_id;
                        var iframHTML = "<iframe src=\"" + url + "\"  width=\"100%\" id='addtosalesforceframe' class='workflowiframe dialogWrap-2'  frameborder=\"0\" style=\"height:" + (dialog_height - 7) + "px\"></iframe>"
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
                                _this.refreshContactList();
                                dialog.$el.find('.modal-footer .dialog-backbtn').hide();
                                //dialog.hide();   
                                dialog.hide();
                            }
                            if (iframe.contents().find('.error').hasClass('error-lead')) {
                                // console.log('lead error  ');

                                dialog.$el.find('.modal-footer .btn-add').hide().delay(1000);
                                dialog.$el.find('.modal-footer .dialog-backbtn').hide();
                                dialog.$el.find('.modal-footer .btn-close').before('<a style="" class="btn-yellow left btn-backsales"><i class="icon back left"></i><span>Back</span></a>')
                                //_this.app.showMessge("Subscriber has been added successfully as a lead at Salesforce.");
                                //dialog.hide();  
                                dialog.$el.find('.modal-footer .btn-backsales').click(function () {
                                    dialog.$el.find('#addtosalesforceframe').attr('src', url);
                                })

                            } else {
                                dialog.$el.find('.modal-footer .btn-add').show();
                                // dialog.$el.find('.modal-footer .dialog-backbtn').show();
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
                    }
                },
                collapseExpandFields: function (e) {
                    var handle = $(e.target)[0].tagName !== "DIV" ? $(e.target).parent(".mks_expandable") : $(e.target);
                    if (handle.hasClass('basic_expand')) {
                        if (handle.hasClass('expand')) {
                            handle.find('span').eq(0).text('Click to collapse')
                            this.$('.basic_expand_height').addClass('heighAuto');
                        } else {
                            handle.find('span').eq(0).text('Click to expand')
                            this.$('.basic_expand_height').removeClass('heighAuto');
                        }

                    } else if (handle.hasClass('cf_expand')) {

                        if (handle.hasClass('expand')) {
                            handle.find('span').eq(0).text('Click to collapse')
                            this.$('.cf_expand_height').addClass('heighAuto');
                        } else {
                            handle.find('span').eq(0).text('Click to expand');
                            this.$('.cf_expand_height').removeClass('heighAuto');
                        }

                    }

                    if (handle.hasClass('expand')) {
                        handle.removeClass('expand');
                        handle.addClass('collapse');
                    } else {
                        handle.removeClass('collapse');
                        handle.addClass('expand');
                    }
                },
                basicFieldEdit: function () {
                    this.hideShowBasicInputs("show");
                    if (this.$(".basic_expand").hasClass("expand")) {
                        this.$(".basic_expand").trigger("click");
                    }
                    setTimeout(_.bind(function () {
                        this.basicFieldsContainer.find("input").eq(0).focus()
                    }, this), 50);
                },
                hideShowBasicInputs : function(showHide){
                    var _reverse = showHide =="show"?"hide":"show";
                    this.basicFieldsContainer.find(".mksph_contact_value").removeClass(showHide).addClass(_reverse);
                    this.basicFieldsContainer.find("input").removeClass(_reverse).addClass(showHide);
                    this.$(".mkb_basic_cancel,.mkb_basic_done").addClass(showHide).removeClass(_reverse);
                    this.$(".mkb_basic_edit").addClass(_reverse).removeClass(showHide);
                },
                cancelBasicFieldEdit: function () {
                    this.hideShowBasicInputs("hide");
                    if (this.$(".basic_expand").hasClass("collapse")) {
                        this.$(".basic_expand").trigger("click");
                    }
                },
                customFieldEdit: function () {
                    this.showHideCustomInputs("show");
                    if (this.$(".cf_expand").hasClass("expand")) {
                        this.$(".cf_expand").trigger("click");
                    }
                    setTimeout(_.bind(function () {
                        this.customFieldContainer.find("input").eq(0).focus()
                    }, this), 50);
                },
                showHideCustomInputs: function(showHide){
                    var _reverse = showHide =="show"?"hide":"show";
                    this.customFieldContainer.find(".mksph_contact_value").removeClass(showHide).addClass(_reverse);
                    this.customFieldContainer.find("input").removeClass(_reverse).addClass(showHide);
                    this.$(".mkb_cf_cancel_btn,.mkb_cf_done").addClass(showHide).removeClass(_reverse);
                    this.$(".mkb_cf_edit_btn,.addCF").addClass(_reverse).removeClass(showHide);  
                },
                cancelCustomFieldEdit: function () {
                    this.showHideCustomInputs("hide");                    
                    if (this.$(".cf_expand").hasClass("collapse")) {
                        this.$(".cf_expand").trigger("click");
                    }
                },
                addNewCustomField: function(){
                    var _this = this;
                    var dialog_width = 432;
                    var dialog_height = 185;
                    var btn_prp = {title: 'Add Custom Field',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "50px"},
                        headerEditable: false,
                        headerIcon: 'account',
                        bodyCss: {"min-height": dialog_height + "px"}
                        
                    }                    
                    btn_prp['buttons']= {saveBtn: {text: 'Add'}};                                           
                    var dialog = this.app.showDialog(btn_prp);                    
                    
                    var page = new customfieldpage({sub: _this,dialog:dialog});
                    dialog.getBody().html(page.$el);  
                    page.init();
                    dialog.saveCallBack(_.bind(page.addCustomField, page, dialog));
                   
                },
                createNewCustField: function(newField){
                    
                    var field_html = '<li><div>';
                    field_html += '<span class="mksph_contact_title">' + newField.fieldName + '</span>:&nbsp;';
                    field_html += '<span class="mksph_contact_value show mkb_elipsis">' + newField.fieldValue + '</span>';
                    field_html += '<input class="hide" name="frmFld_' + newField.fieldName + '" type="text" tabindex="" value="' + newField.fieldValue + '">';
                    this.customFieldContainer.append(field_html);
                    this.updateSubscriberDetail('new');
                    this.customFieldContainer.html('<p class="not-found">Loading...</p> ');
                    
                }
            });
        });