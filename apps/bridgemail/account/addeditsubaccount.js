define(['text!account/html/addeditsubaccount.html','account/collections/salesrep','account/salesrep_selection_row'],
        function (template,salesrepCollection,salesrepRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'manage_account row-fluid',                
                events: {                    
                },
                initialize: function () {
                    this.apps = this.options.apps;      
                    this.parent_acc = this.options.parent_acc;
                    this.template = _.template(template);                       
                    this.user_id = this.options.user_id;                          
                    this.salesrepRequest = new salesrepCollection();                      
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.sub.app;
                    this.$salesrepContainer = this.$("._salesrep_grid tbody")
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$('.btnunchecked input.checkpanel').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon" style="margin:5px 0 0 5px"></div>'
                    });
                    
                   this.$('.btnunchecked input#o-sam').on('ifChecked', _.bind(function(){
                        this.$("#select-sam-users").show();
                   },this));
                   this.$('.btnunchecked input#o-sam').on('ifUnchecked', _.bind(function(){
                        this.$("#select-sam-users").hide();
                   },this));                    
                   if(!this.user_id){
                       this.$(".subacc-fromEmail").prop("readonly",false);
                   }
                },
                init: function () {      
                   this.$(".subacc-userid").focus();
                   this.loadSalesRep();                   
                },
                loadSubAccount:function(){
                    var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Sub Account Details...", this.$el.parents(".modal"));
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + bms_token + "&type=operatorDetail&opUserId="+this.user_id;
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                       this.app.showLoading(false, this.$el.parents(".modal"));
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.$(".subacc-userid").val(_json.userId);
                                                                                                
                        this.$(".subacc-email").val(this.app.decodeHTML(_json.userEmail));                        
                        this.$(".subacc-firstname").val(this.app.decodeHTML(_json.firstName));                        
                        this.$(".subacc-lastname").val(this.app.decodeHTML(_json.lastName));                        
                        this.$(".subacc-telephone").val(this.app.decodeHTML(_json.phone));                        
                        this.$(".subacc-url").val(this.app.decodeHTML(_json.url));                                                                                         
                        this.$(".subacc-address1").val(this.app.decodeHTML(_json.address1));                        
                        this.$(".subacc-address2").val(this.app.decodeHTML(_json.address2));                        
                        if(this.app.decodeHTML(_json.isSuppressShared)=="Y"){
                            this.$("#o-partAsMaster").iCheck('check');
                        }
                        
                        this.$(".subacc-sendername").val(this.app.decodeHTML(_json.senderName));
                        this.$(".subacc-fromEmail").val(this.app.decodeHTML(_json.fromEmail));
                        this.$(".subacc-fromemail").html(this.app.decodeHTML(_json.fromEmail));                        
                        this.$(".subacc-replyto").val(this.app.decodeHTML(_json.replyToEmail));
                        this.$(".subacc-webaddress").val(this.app.decodeHTML(_json.webAddress));
                        
                        if(_json.apps){
                            _.each(_json.apps[0],function(val,key){
                                if(val[0].appShortName=="BridgeMail System"){
                                  this.$('[data-appid="1"]').iCheck('check')  
                                }                 
                                else if(val[0].appShortName=="BridgeStatz"){
                                    this.$('[data-appid="2"]').iCheck('check')  
                                }
                                else if(val[0].appShortName=="SAM"){
                                    this.$('[data-appid="3"]').iCheck('check');
                                    this.$("#select-sam-users").show();
                                    if(val[0].salesreps){
                                        _.each(val[0].salesreps[0],function(val,key){
                                                this.$("[data-checksum='"+val+"']").iCheck("check");
                                        },this)
                                    }
                                }
                            },this)            
                        }
                                                                                                                
                    },this))  
                },
                updateSubAccount: function(dialog){
                    if(this.validateForm()){
                        this.app.showLoading(this.user_id?"Updating ...":"Adding sub account...", dialog.$el);
                        var _type = this.user_id ? "updateOperator":"addOperator";
                        var pastAsMaster = "N";
                        var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');     
                        if($("#o-partAsMaster").is(':checked')){
                            pastAsMaster = "Y";
                        }
                        var post_data = {"type":_type,opUserId:this.$(".subacc-userid").val(),email:this.$(".subacc-email").val()
                                    ,firstName:this.$(".subacc-firstname").val(),lastName:this.$(".subacc-lastname").val()
                                    ,phone:this.$(".subacc-telephone").val(),address1:this.$(".subacc-address1").val()
                                    ,address2:this.$(".subacc-address2").val(),url:this.$(".subacc-url").val()
                                    ,senderName:this.$(".subacc-sendername").val(),webAddress:this.$(".subacc-webaddress").val()
                                    ,replyToEmail:this.$(".subacc-replyto").val()
                                    ,fromEmail:this.$(".subacc-fromEmail").val()
                                    ,isSupressShared:pastAsMaster
                                    ,salesrep:this.$("._salesrep_grid input:checked").map(function() {return $(this).attr("data-salerep");}).get().join(",")
                                    ,pass1:this.$(".subacc-password").val(),pass2:this.$(".subacc-confirm-password").val(),
                                    appId:this.$(".app_subs input:checked").map(function() {return $(this).attr("data-appid");}).get().join(",")};
                        if(this.user_id && this.$(".subacc-password").val()=="" && this.$(".subacc-confirm-password").val()==""){
                            delete post_data['pass1'];
                            delete post_data['pass2'];
                        }            
                        $.post(URL, post_data)
                          .done(_.bind(function(data) {                                                          
                              this.app.showLoading(false, dialog.$el);
                              var _json = jQuery.parseJSON(data);                              
                              if(_json[0]!=="err"){                                 
                                  this.app.showMessge(this.user_id?"Sub Account updated Successfully!":"Sub Account added Successfully!"); 
                                  this.options.sub.loadSubAccounts();
                                  if(!this.user_id){                                        
                                        dialog.hide();
                                    }
                              }
                              else{                                  
                                  this.app.showAlert(_json[1],this.$el);
                              }							                            
                         },this));
                    }
                    
                },
                validateForm: function(){
                    var isValid = true;
                    var user_id =  $.trim(this.$(".subacc-userid").val());
                    var new_password = $.trim(this.$(".subacc-password").val());
                    var confirm_password = $.trim(this.$(".subacc-confirm-password").val());
                    var email = $.trim(this.$(".subacc-email").val());
                    
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
                    
                    if(!this.user_id || (new_password!=="" || confirm_password!=="")){
                        
                        if(new_password==""){
                            this.app.showError({
                                control:this.$('.subacc-password').parents(".input-append"),
                                message: "Please enter password."
                            });
                            isValid = false;
                        }
                        else if(new_password.length<8){
                            this.app.showError({
                                control:this.$('.subacc-password').parents(".input-append"),
                                message: "Password should be 8 character long."
                            });
                            isValid = false;
                        }
                        else{
                            this.app.hideError({control:this.$('.subacc-password').parents(".input-append")}); 
                        }

                        if(confirm_password==""){
                            this.app.showError({
                                control:this.$('.subacc-confirm-password').parents(".input-append"),
                                message: "Please enter password again."
                            });
                            isValid = false;
                        }
                        else{
                            this.app.hideError({control:this.$('.subacc-confirm-password').parents(".input-append")}); 
                        }

                        if(confirm_password!=="" && new_password!==""){
                            if(confirm_password!==new_password){
                                this.app.showError({
                                    control:this.$('.subacc-confirm-password').parents(".input-append"),
                                    message: "Passwords are not matching."
                                });
                                isValid = false;
                            }
                            else{
                                this.app.hideError({control:this.$('.subacc-confirm-password').parents(".input-append")}); 
                            }                        
                        }
                    }
                    
                    if(email==""){
                        this.app.showError({
                            control:this.$('.subacc-email').parents(".input-append"),
                            message: "Email address can't be empty."
                        });
                        isValid = false;
                    }
                    else if(this.app.validateEmail(email)==false){
                        this.app.showError({
                            control:this.$('.subacc-email').parents(".input-append"),
                            message: "Please provide valid email."
                        });
                        isValid = false;
                    }
                    else{
                        this.app.hideError({control:this.$('.subacc-email').parents(".input-append")}); 
                    }
                    
                    return isValid ;
                }  ,
                loadSalesRep:function(){
                    var remove_cache = false;      
                    this.offset = 0;
                    var _data = {offset:this.offset,type:'allSalesreps',bucket:5000};                                        
                    this.app.showLoading("Loading Salesrep...", this.$el.parents(".modal"));
                    this.salesrepRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                            // Display items
                            this.app.showLoading(false, this.$el.parents(".modal"));
                            if(this.app.checkError(response)){
                                return false;
                            }
                            this.$salesrepContainer.children().remove();
                            for(var s=this.offset;s<collection.length;s++){
                                var salesrepView = new salesrepRow({ model: collection.at(s),sub:this });                                                                                            
                                this.$salesrepContainer.append(salesrepView.$el);                               
                            }     
                            if(this.user_id){
                                this.loadSubAccount();                   
                            }

                        }, this),
                        error: function (collection, resp) {
                            
                        }
                  });
                }
                
            });
        });
