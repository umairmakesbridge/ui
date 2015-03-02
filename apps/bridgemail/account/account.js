define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!account/html/account.html'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {
                    'click .btn-unsubscribe-logo':"setImage",
                    'click ul.mng_acct li':'loadtab',
                    'click .save-profile':'updateProfile'
                },
                initialize: function () {
                    this.template = _.template(template);    
                    this.postObject = {};
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                                        
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {                   
                   this.loadData();                   
                },
                loadData:function(){
                   var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Account Details...", this.$el);
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + bms_token + "&type=get";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);
                        /*-----Remove loading------*/
                           this.app.removeSpinner(this.$el);
                        /*------------*/
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.$(".user-id").html(_json.userId);
                        this.$(".account-type").html(_json["account-type"]=="O"?"Operator":"Master");
                        this.$(".subscription").html(_json["packageType"]);
                        this.$(".account-expiry").html(_json["accountExpiry"]);
                        
                        this.$(".acc-email").val(this.app.decodeHTML(_json.userEmail));
                        this.postObject['email']= this.app.decodeHTML(_json.userEmail);                        
                        this.$(".acc-firstname").val(this.app.decodeHTML(_json.firstName));
                        this.postObject['firstName']= this.app.decodeHTML(_json.firstName);
                        this.$(".acc-lastname").val(this.app.decodeHTML(_json.lastName));
                        this.postObject['lastName']= this.app.decodeHTML(_json.lastName);
                        this.$(".acc-telephone").val(this.app.decodeHTML(_json.phone));
                        this.postObject['phone']= this.app.decodeHTML(_json.phone);
                        this.$(".acc-url").val(this.app.decodeHTML(_json.url));
                        this.postObject['url']= this.app.decodeHTML(_json.url);
                        this.$(".acc-company").val(this.app.decodeHTML(_json.customerName));
                        this.postObject['customerName']= this.app.decodeHTML(_json.customerName);
                        this.$(".acc-unsubscribed-logo").val(this.app.decodeHTML(_json.customerLogo));
                        this.postObject['customerLogo']= this.app.decodeHTML(_json.customerLogo);
                        this.$(".acc-addressline1").val(this.app.decodeHTML(_json.address1));
                        this.postObject['address1']= this.app.decodeHTML(_json.address1);
                        this.$(".acc-addressline2").val(this.app.decodeHTML(_json.address2));
                        this.postObject['address2']= this.app.decodeHTML(_json.address2);
                        
                        
                        this.postObject['senderName']= this.app.decodeHTML(_json.senderName);
                        this.postObject['fromEmail']= this.app.decodeHTML(_json.fromEmail);                        
                        this.postObject['replyToEmail']= this.app.decodeHTML(_json.replyToEmail);
                        
                        this.postObject['webAddress']= this.app.decodeHTML(_json.webAddress);
                        this.postObject['hasSFDataSyncAccess']= this.app.decodeHTML(_json.hasSFDataSyncAccess);
                                               
                        
                    },this))  
                },               
               
                setImage:function(){
                    var that = this;
                    var app = this.options.app;
                    var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-150;
                        var dialog = this.options.app.showDialog({title:'Images',
                                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                    headerEditable:true,
                                    headerIcon : '_graphics',
                                    tagRegen:true,
                                    bodyCss:{"min-height":dialog_height+"px"}                                                                          
                         });                        
                     this.options.app.showLoading("Loading...",dialog.getBody());
                     require(["userimages/userimages",'app'],function(pageTemplate,app){                                     
                         var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:that});
                         dialog.getBody().append(mPage.$el);
                         that.app.showLoading(false, mPage.$el.parent());
                         var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                         mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog                      
                         that.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog                      
                     });
                     
                },
                useImage:function(url){                    
                   this.$(".acc-unsubscribed-logo").val(url);                    
                },
                loadtab: function(e){
                     var clickedli = $.getObj(e,"li"); 
                     if(clickedli.hasClass("selected")==false){
                         var key = clickedli.attr("data-key");
                         this.$("ul.mng_acct li.selected").removeClass("selected");
                         clickedli.addClass("selected");
                         if(this.$("."+key).length==0){
                             this.app.showLoading("Loading...",this.$(".setting-container"));
                             require(["account/"+key],_.bind(function(page){
                                this.app.showLoading(false,this.$(".setting-container"));
                                var settingpage =  new page({app:this.app,postObj:this.postObject});                                                                  
                                this.$(".setting-section").hide();
                                this.$(".setting-container").append(settingpage.$el); 
                                if(settingpage.init){
                                    settingpage.init();
                                }
                              },this));
                         }
                         else{
                             this.$(".setting-section").hide();
                             this.$("."+key).show();
                         }
                    }
                },
                updateProfile: function(e){
                    var btn = $.getObj(e,"a");
                    if(btn.hasClass("saving")==false && this.validateForm()){
                        btn.addClass("saving");
                        this.$("#profile-form input").prop("readonly",true);
                        var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');                               
                        $.post(URL, {"type":"set","email":this.$(".acc-email").val(),"firstName":this.$(".acc-firstname").val(),"lastName":this.$(".acc-lastname").val(),
                                    "phone":this.$(".acc-telephone").val(),"url":this.$(".acc-url").val(),"customerName":this.$(".acc-company").val()
                                    ,"customerLogo":this.$(".acc-unsubscribed-logo").val(),"address1":this.$(".acc-addressline1").val(),"address2":this.$(".acc-addressline2").val(),
                                    "senderName":this.postObject['senderName'],"replyToEmail":this.postObject['replyToEmail'],"webAddress":this.postObject['webAddress'],"hasSFDataSyncAccess":this.postObject['hasSFDataSyncAccess']})
                          .done(_.bind(function(data) {               
                              btn.removeClass("saving");
                              this.$("#profile-form input").prop("readonly",false);
                              var _json = jQuery.parseJSON(data);                              
                              if(_json[0]!=="err"){                                                                         
                                   this.app.showMessge("Profile updated Successfully!");               
                                   this.postObject['email'] = this.$(".acc-email").val();
                                   this.postObject['firstName'] = this.$(".acc-firstname").val();
                                   this.postObject['lastName'] = this.$(".acc-lastname").val();
                                   this.postObject['phone'] = this.$(".acc-telephone").val();
                                   this.postObject['url'] = this.$(".acc-url").val();
                                   this.postObject['customerName'] = this.$(".acc-company").val();
                                   this.postObject['customerLogo'] = this.$(".acc-unsubscribed-logo").val();
                                   this.postObject['address1'] = this.$(".acc-addressline1").val();
                                   this.postObject['address2'] = this.$(".acc-addressline2").val();                                   
                              }
                              else{                                  
                                  this.app.showAlert(_json[1],this.$el);
                              }							                            
                         },this));
                    }
                },
                validateForm: function(){
                    var isValid = true;
                    var email = $.trim(this.$(".acc-email").val());
                    var company = $.trim(this.$(".acc-company").val());
                    
                    if(email==""){
                        this.app.showError({
                            control:this.$('.acc-email').parents(".input-append"),
                            message: "Email address can't be empty."
                        });
                        isValid = false;
                    }
                    else if(this.app.validateEmail(email)==false){
                        this.app.showError({
                            control:this.$('.acc-email').parents(".input-append"),
                            message: "Please provide valid email."
                        });
                        isValid = false;
                    }
                    else{
                        this.app.hideError({control:this.$('.acc-email').parents(".input-append")}); 
                    }
                    
                    if(company==""){
                        this.app.showError({
                            control:this.$('.acc-company').parents(".input-append"),
                            message: "Company name can't be empty."
                        });
                        isValid = false;
                    }
                    else{
                        this.app.hideError({control:this.$('.acc-company').parents(".input-append")}); 
                    }
                    
                    return isValid ;
                }                

            });
        });
