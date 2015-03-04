define(['text!account/html/addeditsalerep.html','jquery.icheck'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'manage_account row-fluid',                
                events: {                    
                },
                initialize: function () {
                    this.template = _.template(template);                       
                    this.user_id = this.options.user_id;    
                    this.readonly = this.options.readonly
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.sub.app;                    
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$('input.salerep-sendalert').iCheck({
                        checkboxClass: 'checkinput'
                    });
                                       
                },
                init: function () { 
                   if(!this.readonly) {
                    this.$("[name='name']").focus();
                   }
                   this.$("[name='salesrepNumber']").val(this.user_id?this.user_id:"");
                   this.$("[name='type']").val(this.user_id?"set":"add");                   
                   this.$('input.salerep-sendalert').on('ifChecked', _.bind(function(){
                        this.$("[name='sendAlert']").val('Y');
                   },this));
                   this.$('input.salerep-sendalert').on('ifUnchecked', _.bind(function(){
                        this.$("[name='sendAlert']").val('N');
                   },this));
                   this.loadSalesRepFields();                   
                },
                loadSalerep:function(){
                    var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Sales Rep Details...", this.$el.parents(".modal"));
                    var URL = "/pms/io/user/getSalesrepData/?BMS_REQ_TK=" + bms_token + "&type=get&salesrepNumber="+this.user_id;
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                       this.app.showLoading(false, this.$el.parents(".modal"));
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        _.each(_json,function(val,key){
                            this.$("[name='"+key+"']").val(val);                            
                        },this)
                        if(_json.sendAlert=="Y"){
                            this.$('input.salerep-sendalert').iCheck('check');
                        }   
                        else{
                            this.$('input.salerep-sendalert').iCheck('uncheck');
                        }
                                                                                                                
                    },this))  
                },
                updateSalerep: function(dialog){                    
                    this.app.showLoading(this.user_id?"Updating ...":"Adding Sales Rep...", dialog.$el);                        
                    var URL = "/pms/io/user/setSalesrepData/?BMS_REQ_TK="+this.app.get('bms_token');                                  
                    $.post(URL, this.$("#salesrep_form").serialize())
                      .done(_.bind(function(data) {                                                          
                          this.app.showLoading(false, dialog.$el);
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                 
                              this.app.showMessge(this.user_id?"Sales Rep updated Successfully!":"Sales Rep added Successfully!"); 
                              this.options.sub.loadSalesRep();
                              if(!this.user_id){                                  
                                  dialog.hide();
                              }
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);
                          }							                            
                     },this));                                        
                },
                validateForm: function(){
                    var isValid = true;
                    var user_id =  $.trim(this.$(".subacc-userid").val());                                                            
                    if(user_id==""){
                        this.app.showError({
                            control:this.$('.subacc-userid').parents(".input-append"),
                            message: "Please enter user id."
                        });
                        isValid = false;
                    }
                    else{
                        this.app.hideError({control:this.$('.subacc-userid').parents(".input-append")});
                    }
                    
                   
                    return isValid ;
                }  ,
                loadSalesRepFields:function(){
                    var bms_token = this.app.get('bms_token');                    
                    this.basicFields = ['name','email','LastName','FirstName','CompanyName','Title','City','Extension'];
                    var fieldCounter = 1;
                    this.app.showLoading("Loading Sales Rep fields...", this.$el.parents(".modal"));
                    var URL = "/pms/io/user/getSalesrepData/?BMS_REQ_TK=" + bms_token + "&type=getFields";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                       this.app.showLoading(false, this.$el.parents(".modal"));
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }             
                        if(_json.fldList){
                            _.each(_json.fldList[0],function(val,key){
                                if(this.basicFields.indexOf(val[0].name)==-1){
                                    if(fieldCounter % 2){
                                        this.$(".salerep-col1").append(this.saleRepFieldHTML(val[0].name,""));                                        
                                    }
                                    else{
                                        this.$(".salerep-col2").append(this.saleRepFieldHTML(val[0].name,""));                                        
                                    }
                                    fieldCounter = fieldCounter +1;
                                }
                            },this)      
                        }
                        if(this.readonly){
                            this.$("input").prop("readonly",true)
                            this.$('input.salerep-sendalert').iCheck("disable");
                        }
                        if(this.user_id){
                            this.loadSalerep();
                        }                        
                                                                                                                
                    },this)) 
                },
                saleRepFieldHTML : function(fieldLabel,fieldValue){
                    var _html = '<div class="row">';
                        _html += '<label>'+fieldLabel+'</label>';
                        _html += '<div class="input-append  ">';
                        _html += '<div class="inputcont">';
                        _html += '<input type="text" value="'+fieldValue+'" class="" name="'+fieldLabel+'">';
                        _html += '</div></div></div>';
                        
                        return _html;
                }
                
            });
        });
