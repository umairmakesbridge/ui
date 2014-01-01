define(['text!contacts/html/subscriber_fields.html','jquery-ui'],
function (template,jqueryui) {
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
                    this.subscriber = this.options.sub
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
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$( ".basic-field-accordion" ).accordion({ active: 0, collapsible: false,heightStyle: "content"});
                this.$( ".custom-field-accordion" ).accordion({ active: 1, collapsible: true,heightStyle: "content"});
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
                        field_html += '<label>'+val.label+'</label>';
                        field_html += '<div class="input-append">';
                        field_html += '<div class="inputcont ">';
                        field_html += '<input type="text" tabindex="'+tabindex+'" name="'+key+'" value="'+_this.subscriber.sub_fields[key]+'" class="header-info textfield" placeholder="Enter '+val.label+' here" />';
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
                col1 = $("<div class='span6'></div>");
                col2 = $("<div class='span6'></div>");
                if(this.subscriber.sub_fields.cusFldList){
                    $.each(this.subscriber.sub_fields.cusFldList[0],function(_key,val){
                        $.each(val[0],function(key,val){                        
                            var field_html = '<div class="row">';
                            field_html += '<label>'+key+'</label>';
                            field_html += '<div class="input-append">';
                            field_html += '<div class="inputcont ">';
                            field_html += '<input type="text" id="'+_key+'" name="'+key+'" tabindex="'+tabindex+'" value="'+val+'" class="header-info textfield" placeholder="Enter '+key+' here" />';
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
                    this.$(".custom-field-container").append(col1);
                    this.$(".custom-field-container").append(col2);
                }
            },
            /**
            * Update fields value in cache.
            *
            * @returns .
            */
            updateValues:function(){
                var _this = this;
                this.$(".basic-field-container input").each(function(){
                    _this.subscriber.sub_fields[$(this).attr("name")] = $(this).val();
                });
                if(_this.subscriber.sub_fields.cusFldList){
                    this.$(".custom-field-container input").each(function(){
                        var custFieldList = _this.subscriber.sub_fields.cusFldList[0][$(this).attr("id")];
                        var key = null;
                        $.each(custFieldList[0],function(k,v){
                            key = k;
                        });
                        custFieldList[0][key] = $(this).val();
                    });
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
                       dialog.hide();
               });
            }
            
        });
});