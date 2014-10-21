define(['text!editor/DC/html/filters.html'],
    function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Filter view for MEE Dynamic contents variation
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click .closebtn':'closeDialog',
                'click .ruleDialogClose':'closeDialog',
                'click .add-row':'createRow',
                'click .ruleDialogSave':'saveFilters'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                this.template = _.template(template);	                    
                this.app = this.options.opt._app;                                              
                this.args = this.options.args;                                              
                this.basicFields = [];
                this.customFields = [];
                this.lists = null;
                this.formats = [];
                this.rules = [];
                this.render();       
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                    }));    
                //this.row = _.template(this.$('#fitlerrow_template').html());                
                var dcRules = this.args.DynamicContent.ListOfDynamicRules;
                if(dcRules.length==0){
                    this.createRow();
                }
                else{
                    for(var i=0;i<dcRules.length;i++){                        
                       this.$(".dynamic_inputs_list").append(this.addBasicFilter(dcRules[i]));  
                    }
                    this.$(".all-any button").removeClass("active");
                    this.$(".all-any button[rule='"+this.args.DynamicContent.applyRuleCount+"']").addClass("active")
                }
                this.$(".showtooltip").tooltip({
                    'placement':'bottom',
                    delay: {
                        show: 0, 
                        hide:0
                    },
                    animation:false
                });
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            createRow:function(){
                var rowElement = this.addBasicFilter();
                this.$(".dynamic_inputs_list").append(rowElement);               
            },
            deleteRow:function(e){
                var obj = $.getObj(e,"a");
                obj.parents(".filter-row").remove();
            },
            closeDialog:function(){
                this.$el.parent().hide();
                this.$el.remove();
            },
            addBasicFilter:function(params){
                var filter = $('<div class="filter-row rule dc_rule"><div class="head-icon"><span class="icon filter"></span></div><div class="filter-cont"></div></div>')
                filter.addClass("filter")                
                var selected_field = "",selected_rule="",selected_formats="", matchValue="",gapValue = "0",list_html='<div class="btn-group sub-date-container" style="display:none;margin-right:5px;"><a class="icon add-list" style="margin:0px"></a></div>',
                format_display="none",value_display="block",gap_display="none"
                //In case of edit set parameters    
                if(params){    
                    matchValue = (params.matchValue)?params.matchValue:""
                    gapValue = (params.spanInDays)?params.spanInDays:"0"
                    if( params.fieldName=="{{SUBSCRIPTION_DATE}}"){
                        list_html = '<div class="btn-group sub-date-container" style="display:block" list_id="'+params['listNumber.encode']+'" list_checksum="'+params['listNumber.checksum']+'"><a class="icon list"></a></div>'          
                    }
                    if(params.rule=="dr" || params.rule=="prior" || params.rule=="after" || params.rule=="dayof" || params.rule=="birthday" || params.rule=="pbday"){               
                        format_display = "block"
                        if(params.rule=="prior" || params.rule=="after" || params.rule=="pbday"){
                            gap_display="block"
                        }
                        if(params.rule=="dr"){
                            value_display = "block"
                        }
                        else{
                            value_display = "none" 
                        }
                    }
                    if(params.rule=="empty" || params.rule=="notempty"){
                        value_display = "none" 
                        format_display = "none"
                        gap_display="none"
                    }
                }

                var filter_html = '<div class="btn-group field-container"><div class="inputcont"><select data-placeholder="Choose a Field" class="selectbox fields" disabled="disabled"><option>Loading Fields...</option>'                        
                filter_html +='</select></div></div>'
                filter_html +=list_html
                filter_html +='<div class="btn-group rules-container"><div class="inputcont"><select  class="selectbox rules" disabled="disabled"><option value="">Loading...</option>'                      
                filter_html +='</select></div></div>'          
                filter_html += '<div class="btn-group days-container" style="display:'+gap_display+'"><div class="inputcont"><input type="text" value="'+gapValue+'" name="" class="gap" style="width:30px;" /></div></div>'
                filter_html +='<div class="btn-group formats-container" style="display:'+format_display+'"><div class="inputcont"><select class="selectbox formats" disabled="disabled"><option>Loading...</option>'                    
                filter_html +='</select></div></div>'
                filter_html += '<div class="btn-group value-container" style="display:'+value_display+'"><div class="inputcont"><input type="text" value="'+matchValue+'" name="" class="matchValue" style="width:150px;" /></div></div>'                
                filter.find(".filter-cont").append(filter_html)
                //Chosen with fields
                filter.find(".fields").chosen({
                    width:'200px'
                }).change(function(){
                    if($(this).val()=="{{SUBSCRIPTION_DATE}}"){
                        filter.find(".sub-date-container").show();
                    }
                    else{
                        filter.find(".sub-date-container").hide();
                    }
                    if($(this).val()=="{{SUBSCRIPTION_DATE}}" || $(this).val()=="{{BIRTH_DATE}}" ){
                        filter.find(".formats-container").show()
                    }
                    else{
                        filter.find(".formats-container").hide()
                    }

                    filter.find(".selectbox.rules").change()             



                })
                var self = this
                //Chosen with rules
                filter.find(".selectbox.rules").chosen({
                    disable_search: "true",
                    width:'170px'
                }).change(function(){             
                    if((filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}") && ($(this).val()=="ct" || $(this).val()=="!ct" || $(this).val()=="nr") ){
                        self.app.showAlert("'Subscribe Date' OR 'Birth Date' field can not have rules like: contains, not contains & within numeric range.",$("body"),{
                            fixed:true
                        });
                        $(this).val('=').trigger("chosen:updated").change()
                        return false
                    }
                    if($(this).val()=="dr" || $(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="dayof" || $(this).val()=="birthday" || $(this).val()=="pbday"){

                        if(filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}"){
                            filter.find(".formats-container").hide()
                        }
                        else{
                            filter.find(".formats-container").show()
                        }

                        if($(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="pbday"){
                            filter.find(".days-container").show().val('0')
                        }
                        else{
                            filter.find(".days-container").hide()
                        }

                        if($(this).val()=="dr"){
                            filter.find(".value-container").show()
                            filter.find(".formats-container").show()
                        }
                        else{
                            filter.find(".value-container").hide()
                        }
                    }
                    else{
                        filter.find(".days-container").hide()
                        if((filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}")){
                            filter.find(".formats-container").show()
                        }
                        else{
                            filter.find(".formats-container").hide()
                        }
                        filter.find(".value-container").show()
                    }

                    if($(this).val()=="empty" || $(this).val()=="notempty"){
                        filter.find(".days-container").hide()  
                        filter.find(".formats-container").hide()
                        filter.find(".value-container").hide()
                    }


                });

                //Chosen with formats      
                filter.find(".selectbox.formats").chosen({
                    disable_search: "true",
                    width:'152px'
                })

                filter.find(".sub-date-container").on("click",$.proxy(this.showDialog,this))

                this.addActionBar(filter)                
                this.showTooltips(filter)
                //Loading Rules, basic fields and formats
                var URL = ""
                var self = this        
                if(this.basicFields.length===0){
                    URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=fields_all";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){                        
                            var fields_json = jQuery.parseJSON(xhr.responseText);                                
                            if(self.app.checkError(fields_json)){
                                return false;
                            }       
                            var bas_field_html ='<option value=""></option>'
                            bas_field_html +='<optgroup label="Basic Fields">'                            
                            var cust_field_html = '<optgroup label="Custom Fields">'                        
                            $.each(fields_json,function(key,val){
                                selected_field = (params && params.fieldName==val[0]) ? "selected" : ""
                                if(val[2]=="true"){                            
                                    self.basicFields.push(val)                            
                                    bas_field_html +='<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'                           
                                }
                                else{
                                    self.customFields.push(val)
                                    cust_field_html += '<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'
                                }
                            });
                            bas_field_html +='</optgroup>'
                            cust_field_html +='</optgroup>'                    
                            filter.find(".fields").html(bas_field_html+cust_field_html).prop("disabled",false).trigger("chosen:updated")
                        }
                    }).fail(function() {
                        console.log( "error in loading fields" );
                    });
                }
                else{
                    var fields_array =this.basicFields
                    var filter_html ='<option value=""></option>'
                    filter_html +='<optgroup label="Basic Fields">'
                    $.each(fields_array,function(k,val){
                        selected_field = (params && params.fieldName==val[0]) ? "selected" : ""
                        filter_html +='<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'
                    });
                    filter_html +='</optgroup>'
                    fields_array =this.customFields
                    filter_html +='<optgroup label="Custom Fields">'
                    $.each(fields_array,function(k,val){
                        selected_field = (params && params.fieldName==val[0]) ? "selected" : ""
                        filter_html +='<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'
                    });
                    filter_html +='</optgroup>'
                    filter.find(".fields").html(filter_html).prop("disabled",false).trigger("chosen:updated")
                }
                if(this.rules.length===0){
                    URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=rules";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){                        
                            var rules_json = jQuery.parseJSON(xhr.responseText);                                
                            if(self.app.checkError(rules_json)){
                                return false;
                            }                                     
                            var filter_html =''
                            $.each(rules_json,function(k,val){
                                selected_rule = (params && params.rule==val[0]) ? "selected" : ""
                                filter_html +='<option value="'+val[0]+'" '+selected_rule+'>'+val[1]+'</option>'
                                self.rules.push(val)
                            });                   
                            filter.find(".selectbox.rules").html(filter_html).prop("disabled",false).trigger("chosen:updated")
                        }
                    }).fail(function() {
                        console.log( "error in loading rules" );
                    });
                }
                else{
                    var filter_html = ''
                    $.each(this.rules,function(k,val){
                        selected_rule = (params && params.rule==val[0]) ? "selected" : ""
                        filter_html +='<option value="'+val[0]+'" '+selected_rule+'>'+val[1]+'</option>'                
                    })  

                    filter.find(".selectbox.rules").html(filter_html).prop("disabled",false).trigger("chosen:updated")
                }
                if(this.formats.length===0){
                    URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=formats";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){                        
                            var formats_json = jQuery.parseJSON(xhr.responseText);                                
                            if(self.app.checkError(formats_json)){
                                return false;
                            }

                            var filter_html =''
                            $.each(formats_json,function(k,val){
                                selected_formats = (params && params.dateFormat==val[0]) ? "selected" : ""
                                filter_html +='<option value="'+val[0]+'" '+selected_formats+'>'+val[1]+'</option>'
                                self.formats.push(val)
                            });                   
                            filter.find(".selectbox.formats").html(filter_html).prop("disabled",false).trigger("chosen:updated")

                        }
                    }).fail(function() {
                        console.log( "error in loading formats" );
                    });
                }
                else{
                    var filter_html = ''
                    $.each(this.formats,function(k,val){
                        selected_formats = (params && params.dateFormat==val[0]) ? "selected" : ""
                        filter_html +='<option value="'+val[0]+'" '+selected_formats+'>'+val[1]+'</option>'                
                    })  

                    filter.find(".selectbox.formats").html(filter_html).prop("disabled",false).trigger("chosen:updated")
                }
                return filter;

            },
            addActionBar:function(filterRow){
                var action =  $('<div class="right-btns"></div>')            
                var del_btn = $('<a title="Delete Filter" class="btn-red showtooltip"><i class="icon delete "></i></a>')      
                action.append(del_btn)            
                del_btn.click(function(){
                    $(this).parents(".filter-row").remove()
                });
                filterRow.find(".filter-cont").append(action)                       
            }, 
            showTooltips:function(filter){
                filter.find(".showtooltip").tooltip({
                    'placement':'bottom',
                    delay: {
                        show: 0, 
                        hide:0
                    },
                    animation:false
                })      
            },
            getPostData:function(){
                var filters_post = {type:'updateContentRules',dynamicNumber:this.args.DynamicContent.DynamicVariationID,contentNumber:this.args.DynamicContent.DynamicContentID};
                var total_rows = this.$(".dc_rule");
                if(this.validate(total_rows)){return false}
                var rules = {};
                filters_post["ruleCount"] = total_rows.length;
                filters_post["applyRuleCount"]= this.$(".all-any .btn.active").attr("rule")           
                this.args.DynamicContent.applyRuleCount = this.$(".all-any .btn.active").attr("rule");
                this.args.DynamicContent.ListOfDynamicRules = []
                for(var i=0;i<total_rows.length;i++){
                    rules = {};
                    var N = i+1
                    var filter = $(total_rows[i])                    
                    filters_post[N+".fieldName"]= filter.find(".fields").val()
                    rules["fieldName"] = filter.find(".fields").val();
                    filters_post[N+".rule"]= filter.find(".selectbox.rules").val()
                    rules["rule"] = filter.find(".selectbox.rules").val();
                    var rule_val = filter.find(".selectbox.rules").val()
                    if(rule_val=="dr" || rule_val=="prior" || rule_val=="after" || rule_val=="dayof" || rule_val=="birthday" || rule_val=="pbday"){
                      filters_post[N+".dateFormat"]= filter.find(".selectbox.formats").val()
                      rules["dateFormat"] = filter.find(".selectbox.formats").val();
                      if(rule_val=="prior" || rule_val=="after" || rule_val=="pbday"){
                          filters_post[N+".spanInDays"]= filter.find(".gap").val()
                          rules["spanInDays"] = filter.find(".gap").val();
                      }
                      if(rule_val=="dr"){
                        filters_post[N+".matchValue"]= filter.find(".matchValue").val()   
                        rules["matchValue"]= filter.find(".matchValue").val()   
                      }
                    }
                    else{
                        filters_post[N+".matchValue"]= filter.find(".matchValue").val()              
                        rules["matchValue"]= filter.find(".matchValue").val()   
                    }

                    if(filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}"){
                         filters_post[N+".listNum"]=filter.find(".sub-date-container").attr("list_id")
                         rules["listNumber.checksum"]= filter.find(".sub-date-container").attr("list_id")
                         rules["listNumber.encode"]= filter.find(".sub-date-container").attr("list_id")
                    }
                    this.args.DynamicContent.ListOfDynamicRules.push(rules); 
                }
                
                return filters_post;
            },
            saveFilters:function(){
               var URL = "/pms/io/publish/saveDynamicVariation/?BMS_REQ_TK="+this.app.get('bms_token');                                                     
               var post_data = this.getPostData();               
               if(post_data){
                this.$(".ruleDialogSave").addClass("saving");
                $.post(URL,post_data)
                .done(_.bind(function(data){
                    this.$(".ruleDialogSave").removeClass("saving");
                    var result = jQuery.parseJSON(data);
                    if(result[0]=="success"){
                        this.app.showMessge(result[1],$("body"));
                        this.closeDialog();
                    }
                    else{
                        this.app.showAlert(result[1],$("body"));
                    }
                },this));
              }  
            },
            validate:function(total_rows){
                var isError = false
                for(var i=0;i<total_rows.length;i++){
                    var filter = $(total_rows[i])
                    if(filter.hasClass("filter")){
                      if(filter.find(".fields").val()==""){
                          this.app.showError({
                              control:filter.find(".field-container"),
                              message:this.app.messages[0].TRG_basic_no_field
                          })
                          isError = true
                      }
                      else{
                          this.app.hideError({control:filter.find(".field-container")})
                      }

                      if(filter.find(".value-container").css("display")=="block" && filter.find(".matchValue").val()==""){
                           this.app.showError({
                              control:filter.find(".value-container"),
                              message:'Match value missing.'
                          })
                          isError = true
                      }
                      else{
                          this.app.hideError({control:filter.find(".value-container")})
                      }
                      //End of basic filter
                    }                   
                }
                return isError
            }

        });
    });