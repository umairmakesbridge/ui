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

            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.subscriber = this.options.sub;
                    this.editable = this.sub.editable;
                    this.app = this.subscriber.app;
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
                $.each(this.subscriber.basicFields,function(key,val){
                    var field_html = '<div class="row">';
                        var help_label = (val.label=="Birthday")?" (YYYY-MM-DD)":"";
                        field_html += '<label>'+val.label+help_label+'</label>';
                        field_html += '<div class="input-append">';
                        field_html += '<div class="inputcont ">';
                        field_html += '<input type="text" tabindex="'+tabindex+'" name="'+key+'" value="'+_this.subscriber.sub_fields[key]+'" class="header-info textfield"  />';
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
                if(this.subscriber.sub_fields.cusFldList){
                    $.each(this.subscriber.sub_fields.cusFldList[0],function(_key,val){
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
            ,
            /**
            * Update subscriber detail called from dialog update button
            *
            * @returns .
            */
            updateSubscriberDetail:function(dialog){
                var _this = this;
                _this.app.showLoading("Saving Subscriber Fields...",dialog.$el);
                var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK="+this.app.get('bms_token')+"&subNum="+this.subscriber.sub_id+"&type=editProfile";
                $.post(URL, this.$("#sub_fields_form").serialize())
                .done(function(data) {                                 
                       var _json = jQuery.parseJSON(data);                         
                       _this.app.showLoading(false,dialog.$el);
                       _this.updateValues();
                       _this.subscriber.showFields();
                        _this.updateSubscriberLetter();
                       _this.refreshContactList();
                       dialog.hide();
               });
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
            }
        });
});