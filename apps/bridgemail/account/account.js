define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!account/html/account.html', 'bms-dragfile'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {
                    'click .btn-unsubscribe-logo':function(){this.setImage()},
                    'click ul.mng_acct li':'loadtab',
                    'click .save-profile':'updateProfile',
                    'click .btn-opengallery':'openImageGallery'
                },
                initialize: function () {
                    this.template = _.template(template);    
                    this.postObject = {};
                    this.appsStaus = {};                    
                    this.render();
                },
                render: function ()
                {
                    this.app = this.options.app;      
                    this.$el.html(this.template({}));                                                                          
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    
                    this.$(".droppanel").dragfile({
                        post_url: '/pms/io/publish/saveImagesData/?BMS_REQ_TK=' + this.app.get('bms_token') + '&type=add&allowOverwrite=N&th_width=100&th_height=100',
                        callBack: _.bind(this.processUpload, this),
                        app: this.app,
                        module: 'template',
                        progressElement: this.$('.droppanel')
                    });
                },
                init: function () {     
                   this.iThumbnail = this.$(".droppanel");
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
                        this.$(".account-type").html(_json["accountType"]=="O"?"Operator":"Master");
                        if(_json["accountType"]=="O"){
                            this.$("[data-key='managesubaccounts'],[data-key='updatesalesreps']").hide();
                        }
                        else{
                            this.$("[data-key='managesubaccounts'],[data-key='updatesalesreps']").show();
                        }
                        this.$(".subscription").html(_json["packageType"]);
                        this.$(".account-expiry").html(_json["accountExpiry"]);
                        
                        this.$(".acc-email").val(this.app.decodeHTML(_json.userEmail));
                        this.postObject['email']= this.app.decodeHTML(_json.userEmail); 
                        if(_json.firstName){
                            this.$(".acc-firstname").val(this.app.decodeHTML(_json.firstName));
                            this.postObject['firstName']= this.app.decodeHTML(_json.firstName);
                        }
                        else{
                            this.postObject['firstName']= "";
                        }
                        if(_json.lastName){
                            this.$(".acc-lastname").val(this.app.decodeHTML(_json.lastName));
                            this.postObject['lastName']= this.app.decodeHTML(_json.lastName);
                        }
                        else{
                            this.postObject['lastName']= "";
                        }
                        if(_json.phone){
                            this.$(".acc-telephone").val(this.app.decodeHTML(_json.phone));
                            this.postObject['phone']= this.app.decodeHTML(_json.phone);
                        }
                        else{
                            this.postObject['phone']= "";
                        }
                        if(_json.url){
                            this.$(".acc-url").val(this.app.decodeHTML(_json.url));
                            this.postObject['url']= this.app.decodeHTML(_json.url);
                        }
                        else{
                            this.postObject['url']= "";
                        }
                        if(_json.customerName){
                            this.$(".acc-company").val(this.app.decodeHTML(_json.customerName));
                            this.postObject['customerName']= this.app.decodeHTML(_json.customerName);
                        }
                        else{
                            this.postObject['customerName']=""; 
                        }
                        if(_json.customerLogo){
                            this.$(".acc-unsubscribed-logo").val(this.app.decodeHTML(_json.customerLogo));
                            this.postObject['customerLogo']= this.app.decodeHTML(_json.customerLogo);
                        }
                        else{
                            this.postObject['customerLogo']= "";
                        }
                        if(_json.address1){
                            this.$(".acc-addressline1").val(this.app.decodeHTML(_json.address1));
                            this.postObject['address1']= this.app.decodeHTML(_json.address1);
                        }
                        else{
                            this.postObject['address1']= "";
                        }
                        if(_json.address2){
                            this.$(".acc-addressline2").val(this.app.decodeHTML(_json.address2));
                            this.postObject['address2']= this.app.decodeHTML(_json.address2);
                        }
                        else{
                            this.postObject['address2'] ="";
                        }
                        
                        if(_json.senderName){
                            this.postObject['senderName']= this.app.decodeHTML(_json.senderName);
                        }
                        else{
                            this.postObject['senderName'] ="";
                        }
                        if(_json.fromEmail){
                            this.postObject['fromEmail']= this.app.decodeHTML(_json.fromEmail);                        
                        }
                        else{
                            this.postObject['fromEmail']=""
                        }
                        if(_json.replyToEmail){
                            this.postObject['replyToEmail']= this.app.decodeHTML(_json.replyToEmail);                        
                        }
                        else{
                            this.postObject['replyToEmail'] ="";
                        }
                        if (_json.thumbURL) {
                            this.postObject['imageId'] = _json['imageId.encode'];
                            this.iThumbnail.find("h4").hide();
                            this.iThumbnail.find("img").attr("src", this.app.decodeHTML(_json.thumbURL)).show();
                            this.iThumbImage = this.app.decodeHTML(_json.thumbURL);
                        }
                        else{
                            this.postObject['imageId'] ="";
                        }
                        if(_json.webAddress){
                            this.postObject['webAddress']= this.app.decodeHTML(_json.webAddress);
                        }
                        else{
                            this.postObject['webAddress'] ="";
                        }
                        if(_json.hasSFDataSyncAccess){
                            this.postObject['hasSFDataSyncAccess']= this.app.decodeHTML(_json.hasSFDataSyncAccess);
                        }
                        
                        if(_json.isWebTrack){
                            this.postObject['isWebTrack']= this.app.decodeHTML(_json.isWebTrack);
                        }
                        
                        if(_json.snippet){
                            this.postObject['snippet']= this.app.decodeHTML(_json.snippet,true);
                        }
                        
                        if(_json.apps){
                            _.each(_json.apps[0],function(val,key){
                                if(val[0].appShortName=="BridgeMail System"){
                                  this.appsStaus['bridgemail']= true;
                                }                 
                                else if(val[0].appShortName=="BridgeStatz"){
                                    this.appsStaus['bridgestatz']= true;
                                }
                                else if(val[0].appShortName=="SAM"){
                                    this.appsStaus['sam']= true;
                                }
                            },this)            
                        }
                                               
                        
                    },this))  
                },               
                openImageGallery: function(obj){
                    this.image_obj = $.getObj(obj, "a");
                    this.setImage(_.bind(this.insertImage,this));
                },
                setImage:function(callback){                    
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
                         var _prp = {app:app,fromDialog:true,_select_dialog:dialog,_select_page:that};
                         if(callback){
                             _prp['callBack'] = callback;
                         }
                         var mPage = new pageTemplate(_prp);
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
                insertImage: function (data) {                   
                    this.iThumbnail.remove("file-border");
                    this.imageId = data.imgencode;
                    this.iThumbnail.find("h4").hide();
                    this.iThumbImage = data.imgthumb;
                    this.iThumbnail.find("img").attr("src", this.iThumbImage).show();
                                                            
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
                                var settingpage =  new page({app:this.app,postObj:this.postObject,apps:this.appsStaus});                                                                  
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
                                    ,"customerLogo":this.$(".acc-unsubscribed-logo").val(),"address1":this.$(".acc-addressline1").val(),"address2":this.$(".acc-addressline2").val(),imageId:this.imageId,"isWebTrack":this.postObject['isWebTrack'],
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
                                   this.postObject['imageId'] =this.imageId;
                                   this.app.mainContainer.$(".user-name").html(this.$(".acc-firstname").val()+" "+this.$(".acc-lastname").val());
                                   if(this.iThumbImage){
                                      this.app.mainContainer.$(".profile img").attr("src",this.iThumbImage);
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
                },
                processUpload: function (data) {
                    var _image = jQuery.parseJSON(data);
                    this.$('.droppanel #progress').remove();
                    this.$('.csv-opcbg').hide();
                    if (_image.success) {
                        _.each(_image.images[0], function (val) {
                            this.iThumbnail.remove("file-border");
                            this.imageId = val[0]['imageId.encode'];
                            this.iThumbnail.find("h4").hide();
                            this.iThumbnail.find("img").attr("src", this.app.decodeHTML(val[0]['thumbURL'])).show();
                            this.iThumbImage = this.app.decodeHTML(val[0]['thumbURL']);                            

                        }, this)
                    }
                    else {
                        this.app.showAlert(_image.err1, $("body"), {fixed: true});
                    }
                }                

            });
        });
