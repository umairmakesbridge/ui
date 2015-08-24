define(['text!contacts/html/subscriber_fields.html','jquery-ui','bms-addbox'],
function (template,jqueryui,addbox) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber fields View
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'model_form',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click .add-to-salesforce':'addToSalesForce',
            },
             basicFields: {"firstName": {"label": "First Name"}, "lastName": {"label": "Last Name"}, "company": {"label": "Company"}, "areaCode": {"label": "Area Code"}, "telephone": {"label": "Telephone"},
                    "email": {"label": "Email"}, "city": {"label": "City"},
                    "country": {"label": "Country"}, "state": {"label": "State"}, "zip": {"label": "Zip"}, "address1": {"label": "Address 1"}, "address2": {"label": "Address 2"},
                    "jobStatus": {"label": "Job Status"}, "industry": {"label": "Industry"}, "salesRep": {"label": "Sales Rep"},
                    "source": {"label": "Source"}, "salesStatus": {"label": "Sales Status"}, "occupation": {"label": "Occupation"}, "birthDate": {"label": "Birthday"}},
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.subscriber = this.options.sub;
                    this.editable = this.subscriber.editable;
                    this.app = this.subscriber.app;
                    this.emailsFlag= this.options.emailsFlag;
                    if(this.options.rowtemplate){
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
            initControls:function(){
                this.$( ".basic-field-accordion" ).accordion({ active: 0, collapsible: false,heightStyle: "content"});
                this.$( ".custom-field-accordion" ).accordion({ active: 0, collapsible: true,heightStyle: "content"});
                if(this.editable){
                    this.$(".add-field").addbox({app:this.app,addCallBack:_.bind(this.addCustomField,this)});
                }
                else{
                    this.$("input").prop("readonly",true);
                }
            },
            /**
             * Create fields and Append dialog view
            */
            setupFields:function(){
                var _this=this;
                var col1 = $("<div class='span6'></div>");
                var col2 = $("<div class='span6'></div>");
                var index = 0;
                var tabindex = 1;
                var basicFields;
                if(this.options.isAddFlag){
                    basicFields = this.basicFields
                }else if(this.options.isUpdateSubs){
                    basicFields = this.basicFields
                }
                else{
                    basicFields = this.subscriber.basicFields
                }
                $.each(basicFields,function(key,val){
                    var field_html = '<div class="row">';
                        var help_label = (val.label=="Birthday")?" (YYYY-MM-DD)":"";
                        if(key==="email"){
                            field_html += '<label>'+val.label+help_label+'&nbsp;<span style="color:#fb8080;" class="required">*</span></label>';
                        }else{
                            field_html += '<label>'+val.label+help_label+'</label>';
                        }
                        field_html += '<div class="input-append">';
                        field_html += '<div class="inputcont ">';
                        if(_this.options.isAddFlag){
                           field_html += '<input type="text" tabindex="'+tabindex+'" name="'+key+'" class="header-info textfield newsub-'+key+'"  />'; 
                        }else if(_this.options.isUpdateSubs){
                            field_html += '<input type="text" tabindex="'+tabindex+'" name="'+key+'" value="'+_this.options.sub_fields[key]+'" class="header-info textfield"  />';  
                        }
                        else{
                            
                           field_html += '<input type="text" tabindex="'+tabindex+'" name="'+key+'" value="'+_this.subscriber.sub_fields[key]+'" class="header-info textfield"  />';  
                        }
                        field_html += '</div></div></div>';
                    if(index%2==0){
                       col1.append(field_html);
                    }
                    else{
                        col2.append(field_html)
                    }
                    index++;
                    tabindex++;
                });
                this.$(".basic-field-container").append(col1);
                this.$(".basic-field-container").append(col2);
                index = 0;
                col1 = $("<div class='span6 cust_col1'></div>");
                col2 = $("<div class='span6 cust_col2'></div>");
                if(!this.options.isAddFlag){
                    var customFields = null;
                    if(this.options.isUpdateSubs){
                        customFields = this.options.sub_fields.cusFldList;
                    }else{
                        customFields = this.subscriber.sub_fields.cusFldList;
                    }
                    if(customFields){
                      $.each(customFields[0],function(_key,val){
                          $.each(val[0],function(key,val){                        
                              var field_html = '<div class="row">';
                              field_html += '<label>'+key+'</label>';
                              field_html += '<div class="input-append">';
                              field_html += '<div class="inputcont ">';
                              field_html += '<input type="text" id="'+_key+'" name="frmFld_'+key+'" tabindex="'+tabindex+'" value="'+val+'" class="header-info textfield"  />';
                              field_html += '</div></div></div>';
                              if(index%2==0){
                                 col1.append(field_html);
                              }
                              else{
                                  col2.append(field_html)
                              }
                              index++;
                              tabindex++;
                         });

                      });                    
                  }  
                }
                
                this.$(".custom-field-container").append(col1);
                this.$(".custom-field-container").append(col2);
            },
            /**
            * Update fields value in cache.
            *
            * @returns .
            */
            updateValues:function(){
                var _this = this;
                if(this.subscriber.sub_fields){ // check if subscriber exists
                this.$(".basic-field-container input").each(function(){
                    _this.subscriber.sub_fields[$(this).attr("name")] = _this.app.encodeHTML($(this).val());
                });
                var last_val = 0;
                if(_this.subscriber.sub_fields.cusFldList){
                    this.$(".custom-field-container input").each(function(){
                       if($(this).attr("id")){
                            var custFieldList = _this.subscriber.sub_fields.cusFldList[0][$(this).attr("id")];
                            var key = null;
                            $.each(custFieldList[0],function(k,v){
                                key = k;
                            });
                            custFieldList[0][key] = _this.app.encodeHTML($(this).val());                            
                       } 
                       else{
                           
                            last_val = 1;
                       }
                    });
                    
                    if(last_val){
                         _this.subscriber.loadData();
                        }
                    }
                }
            }
            ,
            /**
             * 
             * Add Subscriber Call  
             * @returns {undefined}
             */
            createSubscriberViaEmail : function(dialog){
                if(this.validateViaEmails()){
                      var _this = this;
                        _this.app.showLoading("Create Multiple Subscribers...",dialog.$el);
                        var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=addByEmailOnly";
                        $.post(URL,  this.$("#sub_fields_viaEmails_form").serialize())
                        .done(function(data) {  
                        
                       var _json = jQuery.parseJSON(data);                         
                
                        if(_json[0] !== "err"){
                            _this.app.showLoading(false,dialog.$el);
                            //  _this.updateValues();
                             // _this.subscriber.showFields();
                             //  _this.updateSubscriberLetter();
                             _this.app.showMessge("New Subscribers Created Successfully!"); 
                              _this.refreshContactList();
                              dialog.hide();
                              //dialog.$el.find('.btn-save').unbind('click');
                              //dialog.$el.find('.btn-save').html('<span>Update</span><i class="icon update"></i>');
                              //_this.subscriber.sub_id = _json[1];
                              //dialog.$el.find('.btn-save').removeClass('btn-save').addClass('btn-update').click(function(){
                               //   _this.updateSubscriberDetail(dialog);
                              //})
                             // dialog.hide();
                        }else{
                             _this.app.showLoading(false,dialog.$el);
                            _this.app.showAlert(_json[1],_this.$el);
                        }
                        
                    });
                }
            },
            /**
             * 
             * Add Subscriber Call  
             * @returns {undefined}
             */
            createSubscriber : function(dialog){
                if(this.validateForm()){
                 var _this = this;
                _this.app.showLoading("Create Subscriber Fields...",dialog.$el);
                var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=addSubscriber";
                $.post(URL, this.$("#sub_fields_form").serialize())
                .done(function(data) {  
                        
                       var _json = jQuery.parseJSON(data);                         
                
                        if(_json[0] !== "err"){
                            _this.app.showLoading(false,dialog.$el);
                            //  _this.updateValues();
                             // _this.subscriber.showFields();
                             //  _this.updateSubscriberLetter();
                             _this.app.showMessge("New Subscriber Created Successfully!"); 
                              _this.refreshContactList();
                              _this.elDialogView = dialog;
                              dialog.$el.find('.btn-save').unbind('click');
                              dialog.$el.find('.btn-save').html('<span>Update</span><i class="icon update"></i>');
                              _this.subscriber.sub_id = _json[1];
                              _this.$el.find('.add-to-salesforce').removeClass('disabled-btn').addClass('add-cursor');
                              dialog.$el.find('.btn-save').removeClass('btn-save').addClass('btn-update').click(function(){
                                  _this.updateSubscriberDetail(dialog);
                              })
                             // dialog.hide();
                        }else{
                             _this.app.showLoading(false,dialog.$el);
                            _this.app.showAlert(_json[1],_this.$el);
                        }
                        
                    });
                }
            },
            /**
            * Update subscriber detail called from dialog update button
            *
            * @returns .
            */
            updateSubscriberDetail:function(dialog){
                var _this = this;
                _this.app.showLoading("Saving Subscriber Fields...",dialog.$el);
                var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK="+this.app.get('bms_token')+"&subNum="+this.subscriber.sub_id+"&type=editProfile";
                var formSerialize = this.$("#sub_fields_form").serializeArray();
                $.post(URL, this.$("#sub_fields_form").serialize())
                .done(function(data) {                                 
                       var _json = jQuery.parseJSON(data);                         
                       _this.app.showLoading(false,dialog.$el);
                       _this.app.showMessge("Subscriber Updated Successfully!"); 
                       _this.updateValues();
                       _this.updateModel(formSerialize);
                       //_this.refreshContactList();
                       if(!_this.options.isAddFlag){
                            _this.subscriber.showFields();
                             _this.updateSubscriberLetter();
                              dialog.hide();
                        }
                       
                      
               });
            },
            updateModel: function (data) {
                    //console.log(data);
                    var dataObj = {};
                    // Form array to Json
                    for(var i=0;i<data.length;i++){
                       dataObj[data[i].name] = data[i].value;
                    }
                     //console.log(dataObj.firstName);
                    this.modelTemplate.model.set(dataObj);
                },
            updateSubscriberDetailAtSalesForce:function(dialog)
			{
                var _this = this;
                _this.app.showLoading("Saving Subscriber Fields & updating on salesforce...",dialog.$el);
                var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK="+this.app.get('bms_token')+"&subNum="+this.subscriber.sub_id+"&type=editProfile&updateAtSF=y";
                $.post(URL, this.$("#sub_fields_form").serialize())
                .done(function(data) {                                 
                       var _json = jQuery.parseJSON(data);                         
                       _this.app.showLoading(false,dialog.$el);
                       _this.updateValues();
                       _this.subscriber.showFields();                       
                       _this.refreshContactList();
                      _this.updateSubscriberLetter();
                       dialog.hide();
               });
            },
             refreshContactList:function(){
                var contact_listing = $(".ws-tabs li[workspace_id='contacts']");
                if(contact_listing.length){
                  contact_listing.data("viewObj").fetchContacts();
                }
              },
            addCustomField:function(val){
                var newCustomField = $('<div class="row new-field"><label>'+val+'</label><div class="input-append"><div class="inputcont "><input type="text" class="header-info textfield" value="" name="frmFld_'+val+'"></div></div></div>') 
                if(this.$('.cust_col1 div.row').length > this.$('.cust_col2 div.row').length){
                    this.$('.cust_col2').append(newCustomField);                    
                }
                else{
                    this.$('.custom-field-container .cust_col1').append(newCustomField);   
                }
                this.$el.parents('.modal-body').scrollTop(this.$el.height());
                newCustomField.find("input").focus();
                return true;
            },
            updateSubscriberLetter : function(){
                
                var subName = '';
                if(this.subscriber.sub_fields.firstName){
                          subName = this.subscriber.sub_fields.firstName;
                      }else if(this.subscriber.sub_fields.lastName){
                          subName = this.subscriber.sub_fields.lastName;
                      }else{
                          subName = this.subscriber.sub_fields.email;
                      }
                this.app.mainContainer.SubscriberName(this.subscriber.sub_id,subName);
            },
            showSalesforceUser : function(){
                if(this.subscriber.sub_fields.conLeadId){
                this.$('#sfid').val(this.subscriber.sub_fields.conLeadId).attr('readonly','readonly');
                this.$('#sfowner').val(this.subscriber.sub_fields.salesRep).attr('readonly','readonly');
                }else{
                    this.$('.sf-field-accordion').hide();
                }
            },
            /*
             * Add to salesforce User
             */
            addToSalesForce : function(event){
                if(this.$('.add-to-salesforce').hasClass('add-cursor')){
                     var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-182;
                        var dialog = this.app.showDialog({title:'Add to Salesforce',
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                        headerEditable:false,
                        headerIcon : 'salesforcelog',
                        bodyCss:{"min-height":dialog_height+"px"},
                        tagRegen:false,
                        reattach : false
                        });
                        var _this = this;
                        this.app.showLoading("Loading Salesforce...",dialog.getBody());
                        //var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                        // page.$el.addClass('dialogWrap-' + dialogArrayLength);
                        var url = "/pms/dashboard/AddToSalesForce.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&subNum="+_this.subscriber.sub_id;
                        var iframHTML = "<iframe src=\""+url+"\"  width=\"100%\" id='addtosalesforceframe' class='workflowiframe dialogWrap-2'  frameborder=\"0\" style=\"height:"+(dialog_height-7)+"px\"></iframe>"
                        dialog.getBody().append(iframHTML);
                         dialog.getBody().find('.workflowiframe').load(function(){
                             //$(this).show();
                            var iframe = $(this);
                            //console.log('load the iframe')
                            if(iframe.contents().find('.info').hasClass('successfull-lead')){
                               // console.log('Successfully lead added need to hide ');
                                _this.app.showLoading("Saving Salesforce...",dialog.getBody());
                               _this.app.showMessge("Subscriber has been added successfully as a lead at Salesforce.");
                               iframe.contents().find('.publisherPageWrapper').hide();
                                _this.refreshContactList();
                                dialog.$el.find('.modal-footer .dialog-backbtn').hide();
                                //dialog.hide();   
                                dialog.hide();   
                            }
                            if(iframe.contents().find('.error').hasClass('error-lead')){
                               // console.log('lead error  ');
                                
                                dialog.$el.find('.modal-footer .btn-add').hide().delay( 1000);
                                dialog.$el.find('.modal-footer .dialog-backbtn').hide();
                                dialog.$el.find('.modal-footer .btn-close').before('<a style="" class="btn-yellow left btn-backsales"><i class="icon back left"></i><span>Back</span></a>')
                               //_this.app.showMessge("Subscriber has been added successfully as a lead at Salesforce.");
                                //dialog.hide();  
                                dialog.$el.find('.modal-footer .btn-backsales').click(function(){
                                    dialog.$el.find('#addtosalesforceframe').attr('src',url);
                                })
                                
                            }else{
                                dialog.$el.find('.modal-footer .btn-add').show();
                               // dialog.$el.find('.modal-footer .dialog-backbtn').show();
                                dialog.$el.find('.modal-footer .btn-backsales').remove();
                            }
                            _this.app.showLoading(false,  dialog.getBody()); 
                            
                            dialog.$el.find('.modal-footer .btn-save span').html('Add to Salesforce');
                            dialog.$el.find('.modal-footer .btn-save').removeClass('btn-save').addClass('btn-add').show();
                            iframe.contents().find('.hideitiframe').hide();
                            //console.log(url);
                            dialog.$el.find('.modal-footer .btn-add').click(function(event){
                               document.getElementById('addtosalesforceframe').contentWindow.addtosf();
                            })
                        });
                        event.stopPropagation();
                }
            },
            
            validateForm: function(){
                    var isValid = true;
                    var email = $.trim(this.$(".newsub-email").val());
                    
                    if(email==""){
                        this.app.showError({
                            control:this.$('.newsub-email').parents(".input-append"),
                            message: "Email address can't be empty."
                        });
                        isValid = false;
                    }
                    else if(this.app.validateEmail(email)==false){
                        this.app.showError({
                            control:this.$('.newsub-email').parents(".input-append"),
                            message: "Please provide valid email."
                        });
                        isValid = false;
                    }
                    else{
                        this.app.hideError({control:this.$('.newsub-email').parents(".input-append")}); 
                    }                    
                    return isValid ;
                },
                validateViaEmails:function(){
                    
                    var isValid = true;
                    var inValidEmail = false;
                    var email = $.trim(this.$(".contactsEmails").val());
                     var _this = this;
                   $.each(email.split(','),function(key,val){
                       if(_this.app.validateEmail(val)==false){
                           inValidEmail = true;
                       }
                   })
                    if(email==""){
                        this.app.showError({
                            control:this.$('.contactsEmails').parents(".input-append"),
                            message: "Atleast one Email is required."
                        });
                        this.$('.contactsEmails').parent().find('.errortext').css('bottom','153px');
                        isValid = false;
                    }else if(inValidEmail==true){
                        this.app.showError({
                            control:this.$('.contactsEmails').parents(".input-append"),
                            message: "Please provide valid email."
                        });
                        this.$('.contactsEmails').parent().find('.errortext').css('bottom','153px');
                        isValid = false;
                    }
                    else{
                        this.$('.contactsEmails').parent().find('.errortext').removeAttr('style');
                        this.app.hideError({control:this.$('.contactsEmails').parents(".input-append")}); 
                    }                    
                    return isValid ;
                },
                
                ReattachEvents: function () {
                     this.elDialogView.$el.find('.btn-save').unbind('click');
                     this.elDialogView .$el.find('.btn-save').html('<span>Update</span><i class="icon update"></i>');
                     this.elDialogView .$el.find('.btn-save').removeClass('btn-save').addClass('btn-update').click(_.bind(function(){
                                  this.updateSubscriberDetail(this.elDialogView);
                              },this))
                }
        });
});