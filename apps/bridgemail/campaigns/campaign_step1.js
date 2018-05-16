define(['text!campaigns/html/campaign_step1.html','bms-mergefields'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Campaign step1 view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'pos-rel',            
            
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
                    this.parent = this.options.page
                    this.camp_obj = this.options.camp_obj;                    
                    this.app = this.parent.app;     
                    this.editable=this.options.editable;
                    this.settingchange = true;
                    this.isDataLoaded = false;
                    this.hasConversionFilter = false;
                    this.pageconversation_checkbox=false;
                    this.campDefaults = {};
                    this.render();                    
            },
              /**
             * Render view on page.
            */
            render: function () {                    
                
               this.$el.html(this.template({
                    model: this.model
                }));                               
                this.initControls();  
            
            },
            init:function(){
              this.setFromNameField();  
              this.loadData();  
              if(this.editable===false){
                this.$(".block-mask").show();
              }
              
              this.$("#con_filter_combo").chosen({no_results_text: 'Oops, nothing found!', width: "280px", disable_search: "true"});
              this.$("#conversion_filter_accordion").accordion({active: 0, collapsible: false, activate: _.bind(function () {
                    this.$("#conversion_filter").prop("checked", this.pageconversation_checkbox);
                }, this)});
              
            },
            initControls:function(){                
                
                this.$("#campaign_from_email").chosen({no_results_text:'Oops, nothing found!', disable_search: "true"});
                var camp_obj = this;
                /*this.$("#campaign_from_email").chosen().change(function(){
                    camp_obj.fromNameSelectBoxChange(this)
                    camp_obj.$("#campaign_from_email_input").val($(this).val());
                });*/
                this.$("#fromemail_default").chosen({no_results_text:'Oops, nothing found!', width: "67%",disable_search: "true"});                                        
                this.$("#fromemail_default").chosen().change(function(){                       
                    camp_obj.$("#fromemail_default_input").val($(this).val());
                });
                this.$("#campaign_from_email_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$("#fromemail_default_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                
                
                /*Campaign Merge Fields*/
                this.initMergeFields();
                
                this.$("#campaign_unSubscribeType").chosen({no_results_text:'Oops, nothing found!', width: "290px",disable_search: "true"});
                this.$("#campaign_unSubscribeType").chosen().change(_.bind(function(){                    
                    $(this).trigger("chosen:updated");
                },this));                    
                
               
                                
            },
            initMergeFields: function() {
                   this.$('#campaign_subject-wrap').mergefields({app:this.app,elementID:'campaign_subject',config:{state:'dialog',isrequest:true,parallel:true},placeholder_text:'Enter subject'});
                   this.$('#campaign_reply_to-wrap').mergefields({app:this.app,config:{salesForce:true,emailType:true,state:'dialog'},elementID:'campaign_reply_to',placeholder_text:'Enter reply to'});
                   this.$('#campaign_from_name-wrap').mergefields({app:this.app,config:{salesForce:true,state:'dialog'},elementID:'campaign_from_name',placeholder_text:'Enter from name'});
                   //this.$('#campaign_from_email-wrap').mergefields({app:this.app,config:{salesForce:true,emailType:true,state:'dialog'},elementID:'campaign_from_email',placeholder_text:'Enter from email'}); 
                },
            initCheckbox:function(){
                 this.$('input').iCheck({
                    checkboxClass: 'checkinput'
                });
                this.$('input.checkpanel').iCheck({
                    checkboxClass: 'checkpanelinput',
                    insert: '<div class="icheck_line-icon"></div>'
                });
                var camp = this;
                this.$(".iCheck-helper").click(function(){
                    var icheck = $(this).parent().find("input");
                    if(icheck.attr("type")=="checkbox"){
                       var icheck_id = icheck.attr("id");
                       if(icheck_id=="campaign_isFooterText"){
                          camp.setFooterArea();
                       }                       
                       else if(icheck_id=="campaign_useCustomFooter"){
                           camp.setCustomFooterArea();
                       } 
                       else if (icheck_id == "conversion_filter") {
                           camp.setCoversionPageStep1(icheck);
                       }

                    }                    

                })
            },
            setFooterArea:function(){
                this.$("#campaign_footer_text").prop("disabled",!this.$("#campaign_isFooterText")[0].checked)                                            
            },
            setCustomFooterArea:function(){
                this.$("#campaign_custom_footer_text").prop("disabled",!this.$("#campaign_useCustomFooter")[0].checked)                                            
            },            
            setFromNameField:function(){
               var active_workspace = this.$el;
               var subj_w = this.$('#campaign_subject').width(); // Abdullah Check
               active_workspace.find('#campaign_from_email_chosen').css({"width":parseInt(subj_w+82)+"px"});   // Abdullah Try
                if(active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()){  
                   active_workspace.find("#campaign_from_email_input").css({"width":active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()+"px","margin-right":"61px"}); // Abdullah Check
                   active_workspace.find("#campaign_from_email_chosen .chosen-drop").css("width",(parseInt(active_workspace.find('#campaign_from_email_chosen').width()))+"px");
                 }
                 if(active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()){
                   active_workspace.find("#fromemail_default_input").css("width",active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()-6+"px");   // Abdullah Check
                 } 
            },
           loadCampaign:function(camp_json){                     
                this.camp_obj = camp_json;
                this.$("#campaign_subject").val(this.app.decodeHTML(camp_json.subject));
                var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");                
                this.setGmailSMTPSettings();
                if(camp_json.fromEmail != '')
                 {
                     if(merge_field_patt.test(this.app.decodeHTML(camp_json.fromEmail)))
                     {
                         var merge_field = this.app.decodeHTML(camp_json.fromEmail);                                                                    
                         if(this.campDefaults.fromEmail){
                            this.$("#campaign_from_email").val(this.app.decodeHTML(camp_json.fromEmail)).trigger("chosen:updated");
                         }
                         else{
                           this.$("#campaign_from_email").val(this.app.decodeHTML(camp_json.defaultFromEmail)).trigger("chosen:updated");
                         }
                        
                         this.$("#campaign_from_email_input").val(merge_field);
                         this.$("#campaign_from_email_default").show();
                         this.$("#fromemail_default").val(this.app.decodeHTML(camp_json.defaultFromEmail)).trigger("chosen:updated");
                         this.$("#fromemail_default_input").val(this.app.decodeHTML(camp_json.defaultFromEmail));
                         //setTimeout(_.bind(this.setFromNameField,this),300);
                     }
                     else
                     {
                         this.$("#campaign_from_email").val(this.app.decodeHTML(camp_json.fromEmail)).trigger("chosen:updated");                                
                         //this.$("#campaign_from_email_input").val(this.app.decodeHTML(camp_json.fromEmail));
                         //this.$("#campaign_from_email_default").hide();                            
                     }
                 }
                 this.$("select#campaign_unSubscribeType").val(camp_json.unSubscribeType).trigger("chosen:updated");
                 if(camp_json.senderName != ''){
                     this.$("#campaign_from_name").val(this.app.decodeHTML(camp_json.senderName));                        
                 }                    
                 var smtp_setting = this.$("#campaign_from_email").find(":selected").attr("isThirdPartySMTP");
                 if(smtp_setting && smtp_setting=="Y"){
                    this.$("#campaign_from_name,#campaign_reply_to").prop("readonly",true);
                    this.isThirdPartySMTP = "Y";
                 }
                 this.$("#campaign_reply_to").val(this.app.decodeHTML(camp_json.replyTo));
                 if(this.options.isCreateCamp){
                     this.$("#campaign_reply_to").val(this.app.decodeHTML(camp_json.fromEmail));
                 }
                 this.$("#campaign_profileUpdate").prop("checked",camp_json.profileUpdate=="N"?false:true);
                 this.$("#campaign_useCustomFooter").prop("checked",camp_json.useCustomFooter=="N"?false:true);
                 this.$("#campaign_isFooterText").prop("checked",camp_json.isFooterText=="N"?false:true);
                 this.$("#campaign_tellAFriend").prop("checked",camp_json.tellAFriend=="N" ? false:true );                
                 this.$("#campaign_isWebVersion").prop("checked",camp_json.isWebVersionLink=="N"?false:true);
                 
                 this.parent.htmlText = camp_json.htmlText;
                 this.parent.plainText = camp_json.plainText;   
                 this.parent.editorType = camp_json.editorType;
                 if(camp_json.defaultSenderName != '')
                 {
                     if(camp_json.defaultSenderName){
                              this.$("#campaign_from_name_default").show();
                              this.$("#campaign_default_from_name").val(camp_json.defaultSenderName);
                     }
                     else{
                              this.$("#campaign_from_name_default").hide();
                     }
                 }

                 if(camp_json.defaultReplyTo){
                      this.$("#campaign_reply_to_default").show();
                      this.$("#campaign_default_reply_to").val(camp_json.defaultReplyTo);
                 }
                 else{
                      this.$("#campaign_reply_to_default").hide();
                 }
                 this.$("#campaign_fb").prop("checked",camp_json.facebook=="N"?false:true);                        
                 this.$("#campaign_twitter").prop("checked",camp_json.twitter=="N"?false:true);                        
                 this.$("#campaign_linkedin").prop("checked",camp_json.linkedin=="N"?false:true);                        
                 this.$("#campaign_pintrest").prop("checked",camp_json.pinterest=="N"?false:true);                        
                 this.$("#campaign_gplus").prop("checked",camp_json.googleplus=="N"?false:true);                        
                 
                 if (camp_json.conversionFilterStatus == 'Y') {
                    this.$("#conversion_filter").prop("checked", true);
                    this.hasConversionFilter = true;
                    this.pageconversation_checkbox = true;
                    var URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=get&campNum=" + this.parent.camp_id;

                    jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                        var conversation_filter = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(conversation_filter)) {
                            return false;
                        }
                        this.setConversionPage();
                        if (conversation_filter.ruleCount > 0) {
                            var r = conversation_filter.rules[0].rule1[0];
                            this.$("select#con_filter_combo").val(this.app.decodeHTML(r.rule));
                            this.$("#con_filter_field").val(this.app.decodeHTML(r.matchValue));
                            this.setConversionPage();
                        }

                    },this));
                    this.$("#accordion1").accordion({active: 0});
                }
                else {
                    this.hasConversionFilter = false;
                    this.pageconversation_checkbox = false;
                    this.$("#conversion_filter").prop("checked", false);
                    this.$("#accordion1").accordion({active: false});
                    this.setConversionPage();
                }
                 
                 this.initCheckbox();
                 this.isDataLoaded = true; 
                 this.parent.loadMessageHTML();              
           },
            fromNameSelectBoxChange:function(obj){
                var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                if(merge_field_patt.test($(obj).val())){
                   this.$("#campaign_from_email_default").show();      
                }
                else{
                  this.$("#campaign_from_email_default").hide();  
                }    
           },
           setConversionPage: function () {
                if (this.pageconversation_checkbox) {
                    this.$("#con_filter_field").prop("disabled", false);
                    this.$("#con_filter_combo").prop("disabled", false).trigger("chosen:updated");
                }
                else {
                    this.$("#con_filter_field").prop("disabled", true);
                    this.$("#con_filter_combo").prop("disabled", true).val("#").trigger("chosen:updated");
                }
            },
            setCoversionPageStep1: function (obj) {
                if (obj.prop("checked")) {
                    this.pageconversation_checkbox = true;
                    this.$("#conversion_filter").prop("checked", this.pageconversation_checkbox);
                    this.$("#accordion1").accordion({active: 0});
                }
                else {
                    this.removeConversionPage();
                    this.pageconversation_checkbox = false;
                    this.$("#conversion_filter").prop("checked", this.pageconversation_checkbox);
                    this.$("#accordion1").accordion({active: 1});
                }
                this.setConversionPage();

            },
            removeConversionPage: function () {
                var camp_obj = this;
                var camp_id = this.parent.camp_id;

                var URL = "/pms/io/filters/saveLinkIDFilter/?BMS_REQ_TK=" + this.app.get('bms_token');
                if (this.hasConversionFilter) {
                    $.post(URL, {campNum: camp_id,
                        type: "delete"})
                            .done(function (data) {
                                camp_obj.$("#conversion_filter").prop("checked", false);
                                camp_obj.hasConversionFilter = false;
                                camp_obj.setConversionPage();

                            });
                }
                this.app.hideError({control: this.$("#cov-texturl-container")});

            },
           loadData:function(){
               this.app.showLoading("Loading Campaign...",this.$el);  
               var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=campaignDefaults";
                    $.ajax({
                        type:'GET',
                        url:URL,
                        dataType:'json',
                        async:false,
                        success:_.bind(function(data){
                                if(data){
                                    this.app.showLoading(false,this.$el);  
                                    var defaults_json = data;
                                    if(this.app.checkError(defaults_json)){
                                        return false;
                                    }                            
                                    this.campDefaults = defaults_json;
                                    this.$("#campaign_footer_text").val(this.app.decodeHTML(defaults_json.footerText));
                                    this.$("#campaign_from_email").val(this.app.decodeHTML(defaults_json.fromEmail));
                                    this.$("#campaign_from_name").val(this.app.decodeHTML(defaults_json.fromName));
                                    if(!this.parent.camp_id) {
                                        this.$("#campaign_reply_to").val(this.app.decodeHTML(defaults_json.fromEmail));
                                    }
                                    var fromEmails = defaults_json.fromEmail;
                                    if(defaults_json.optionalFromEmails)
                                            fromEmails += ',' + defaults_json.optionalFromEmails;
                                    var fromEmailsArray = fromEmails.split(',');
                                    var fromOptions = '';
                                    var selected_fromEmail = '';
                                    //if(this.app.salesMergeAllowed){
                                    //    fromOptions += '<option value="{{BMS_SALESREP.EMAIL}}">{{BMS_SALESREP.EMAIL}}</option>';
                                   // }
                                    for(var i=0;i<fromEmailsArray.length;i++)
                                    {
                                        if(fromEmailsArray[i] == defaults_json.fromEmail){
                                                fromOptions += '<option value="'+ fromEmailsArray[i] +'" selected="selected">'+fromEmailsArray[i] + '</option>';
                                                selected_fromEmail = fromEmailsArray[i];
                                             }
                                        else
                                             fromOptions += '<option value="'+ fromEmailsArray[i] +'">'+fromEmailsArray[i] + '</option>';
                                    }
                                    
                                    
                                    //Add Gmail Address to fromEmail box
                                    //if(this.parent.type !== "workflow"){
                                        if(defaults_json.thirdpartysmtp && defaults_json.thirdpartysmtp[0].Gmail){
                                            this.gmailSMTPExists = false;
                                            var gmailAddresses = defaults_json.thirdpartysmtp[0].Gmail;
                                            if(gmailAddresses.length){
                                                for(var i=0;i<gmailAddresses.length;i++){
                                                    if(gmailAddresses[i].fromAddress){
                                                        fromOptions += '<option value="' + gmailAddresses[i].fromAddress + '" isThirdPartySMTP="Y" thirdPartySMTPName="Gmail" gmailFromName="'+gmailAddresses[i].gmailFromName+'">' + gmailAddresses[i].fromAddress + '</option>';
                                                        this.gmailSMTPExists = true;
                                                    }
                                                }
                                            }

                                        }
                                    //}
                                    
                                    this.$el.find('#campaign_from_email').append(fromOptions);
                                   // if(this.app.salesMergeAllowed){
                                        this.$("#campaign_from_email").chosen().change(_.bind(function(obj){
                                            if(obj.target.value === '{{BMS_SALESREP.EMAIL}}' || obj.target.value=='{{Owner.Email}}'){
                                                this.$('#campaign_from_email_default').show();
                                            }else{
                                                this.$('#campaign_from_email_default').hide();
                                            }
                                            
                                            //Gmail settings
                                            var selected_fromEmail = $(obj.target).find(":selected");
                                            if(selected_fromEmail.attr("isThirdPartySMTP") && selected_fromEmail.attr("isThirdPartySMTP")=="Y"){
                                                var gmailLimitText = "<span class='gmailLimitloading'>[Calculating...]</span>";
                                                var gmailLimitData = this.app.getAppData("gmailLimit");
                                                if(gmailLimitData.maxLimit){
                                                    gmailLimitText = parseInt(gmailLimitData.limitUsed) + "/" + parseInt(gmailLimitData.maxLimit)
                                                }
                                                var maxLimitReachedText = "";
                                                var fromNameEmpty = "";
                                                if(selected_fromEmail.attr("gmailFromName")){
                                                    this.$("#campaign_from_name").val(selected_fromEmail.attr("gmailFromName")).prop("readonly",true);
                                                }
                                                else{
                                                    var fromEmail = obj.target.value;
                                                    this.$("#campaign_from_name").val(fromEmail.substring(0,fromEmail.indexOf("@"))).prop("readonly",true);
                                                    fromNameEmpty = "<br><br><i>From Name is empty for gmail address. Your email will not have a from name. We are filling it to process campaign successfully.</i>"
                                                }
                                                if(parseInt(gmailLimitData.limitUsed) >= parseInt(gmailLimitData.maxLimit)){ 
                                                    maxLimitReachedText = "<br/><br/><i>Your daily Makesbridge Gmail API usage limit has been reached. You will not able to send message <b>today</b>.</i>";
                                                }
                                                setTimeout( _.bind(function(){this.app.showAlert('This message will be sent using third party email "'+obj.target.value+'".<br/><br/>Your daily sent count for today is <b>'+gmailLimitText+'</b>.'+maxLimitReachedText+fromNameEmpty,$("body"),{type:'Sent From Gmail',fixed: true}) },this)
                                                ,50);
                                                
                                                this.$("#campaign_reply_to").val(obj.target.value).prop("readonly",true); 

                                                this.isThirdPartySMTP = "Y";
                                            }
                                            else{
                                                this.isThirdPartySMTP = "N";                                            
                                                this.$("#campaign_from_name").val(defaults_json.fromName).prop("readonly",false);  
                                                this.$("#campaign_reply_to").val(defaults_json.fromEmail).prop("readonly",false);  ;
                                            }
                                            this.app.hideError({control: this.$el.find(".fname-container")});
                                            
                                        },this));
                                    //}
                                    this.$el.find('#fromemail_default').append(fromOptions);
                                    this.$el.find('#fromemail_default option:contains({{BMS_SALESREP.EMAIL}})').remove();
                                    this.$("#campaign_from_email").trigger("chosen:updated");
                                    this.$('#fromemail_default').trigger("chosen:updated");
                                    this.$(".flyinput").val(selected_fromEmail);
                                    setTimeout(_.bind(this.setFromNameField,this),300);                            

                                    var subj_w = this.$el.find('#campaign_subject').innerWidth(); // Abdullah CHeck                               
                                    //this.$el.find('#campaign_from_email_chosen').width(parseInt(subj_w+40)); // Abdullah Try

                                    if(defaults_json.customFooter==""){
                                        this.$("#campaign_useCustomFooter_div").hide();                                
                                    }
                                    else{
                                        this.$("#campaign_useCustomFooter_div").show();
                                        this.$(".step1col1").css("min-height","427px");
                                        this.$("#campaign_custom_footer_text").val(this.app.decodeHTML(defaults_json.customFooter,true));
                                    }
                                    if(this.camp_json){
                                        this.loadCampaign(this.camp_json);
                                    }
                                    else{
                                       this.parent.loadCallCampaign(); 
                                    } 
                                    if(this.parent.type=="workflow" && !this.parent.camp_id){
                                        this.createWorkFlowMessage();                                                 
                                    }
                                }
                            },this)
                    });
           },
            setGmailSMTPSettings: function(){
                 //For shared campaign                 
                if(this.camp_obj && this.camp_obj.isThirdPartySMTP=="Y" && this.app.get("user").userId!=this.camp_obj.userId){
                    var fromOptions = $('<option value="' + this.camp_obj.fromEmail + '" isThirdPartySMTP="Y" thirdPartySMTPName="Gmail" gmailFromName="'+this.camp_obj.senderName+'">' + this.camp_obj.fromEmail + '</option>');
                    $("#campaign_from_email").append(fromOptions);
                    this.$("#campaign_from_email").trigger("chosen:updated");
                    this.gmailSMTPExists = true;
                }

                if(this.gmailSMTPExists){
                    this.app.getData({                                        
                        "URL": "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=gmailAPILimit&userId="+this.getUserId(),
                        "key": "gmailLimit",
                        "callback" : _.bind(function(){
                            var gmailLimitData = this.app.getAppData("gmailLimit");
                            if(gmailLimitData.maxLimit){
                                 $(".gmailLimitloading").html(parseInt(gmailLimitData.maxLimit)-parseInt(gmailLimitData.remainingLimit) + "/" + parseInt(gmailLimitData.maxLimit));
                            }
                        },this)
                    });                                                        
                }
            },
                getUserId:function(){
                    var user_id= this.app.get("user").userId;
                    var smtpuser_id= this.camp_obj.thirdPartySMTPUserId;
                    if(this.camp_obj.userId !=user_id){
                        if(smtpuser_id && smtpuser_id!=="N" && user_id!= smtpuser_id){
                            user_id=smtpuser_id;
                        }                       
                    }
                    return user_id;
                },
           saveStep1:function(validate){            
                    var isValid = true;
                    var defaultSenderName = "",defaultReplyToEmail="";
                    var replyto = this.$('#campaign_reply_to').val();
                    var email_addr = this.$('#campaign_default_reply_to').val();
                    var fromEmail = this.$('#campaign_from_email').val();
                    var fromEmailDefault = this.$('#fromemail_default_input').val();
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                    
                    if(this.$('#campaign_subject').val() == '')
                    {         
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                                control:this.$('.subject-container'),
                                message:"Subject cannot be empty"
                            });
                        isValid = false;
                    }
                    else if(this.$('#campaign_subject').val().length > 100)
                    {      
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                                control:this.$('.subject-container'),
                                message:"Subject cannot have more than 100 characters"
                        });
                        isValid = false;
                    }
                    else
                    {           
                         this.app.hideError({control:this.$(".subject-container")});
                    }
                    if(this.$('#campaign_from_name').val() == '')
                    {       
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                            control:this.$('.fname-container'),
                            message:"From name cannot be empty"
                        });
                        isValid = false;
                    }
                    else if(this.$('#campaign_from_name').val().indexOf("{{") && this.$('#campaign_from_name').val().search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/)==-1)
                    {     
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                            control:this.$('.fname-container'),
                            message:'Name must start with alphanumeric value. Valid special characters are - _ . ! & + \''
                        });
                        isValid = false;
                    }
                    else
                    {           
                            this.app.hideError({control:this.$(".fname-container")});
                    }
                    if(this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val()=="")
                    {    
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                            control:this.$('.fnamedefault-container'),
                            message:"From name cannot be empty"
                        });
                        isValid = false;
                    }
                    else if(this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val().search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/)==-1){
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                            control:this.$('.fnamedefault-container'),
                             message:'Name must start with alphanumeric value. Valid special characters are - _ . ! & + \''
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".fnamedefault-container")});
                    }
                    
                    if(fromEmail === '' || (!merge_field_patt.test(fromEmail) && !this.app.validateEmail(fromEmail)))
                    {    
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                            control:this.$('.fromeEmail-container'),
                            message:"Please enter correct email address format"
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".fromeEmail-container")});
                    }
                    
                    if(this.$(".femail-default-container").css('display')=="block" && (fromEmailDefault === '' || !this.app.validateEmail(fromEmailDefault)))
                    {      
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                            control:this.$('.femail-default-container'),
                            message:"Please enter correct email address format"
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".femail-default-container")});
                    }
                    merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                    
                    if(replyto !== '' && !merge_field_patt.test(replyto) && !this.app.validateEmail(replyto))
                    {  
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                                control:this.$('.replyto-container'),
                                message:"Please enter correct email address format"
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".replyto-container")});
                    }
                    if(this.$('#campaign_reply_to_default').css('display') == 'block' && email_addr == '')
                    {      
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                                control:this.$('.replyemail-container'),
                                message:"Reply field cannot be empty"
                        });
                        isValid = false;
                    }
                    else if(this.$('#campaign_reply_to_default').css('display') == 'block' && !this.app.validateEmail(email_addr))
                    {    
                        if(!this.parent.$el.find('#accordion_setting').accordion( "option", "active" )){
                            this.parent.$el.find('#accordion_setting').accordion( "option", "active",0 );
                        }
                        this.app.showError({
                            control:this.$('.replyemail-container'),
                            message:"Please enter correct email address format"
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".replyemail-container")});
                    } 
                    
                    if(validate){
                        
                       return  isValid;
                    }                   
                    
                    if(isValid)
                    {
                            
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultSenderName = merge_field_patt.test(this.$('#campaign_from_name').val())?this.$("#campaign_default_from_name").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultReplyToEmail = merge_field_patt.test(this.$('#campaign_reply_to').val())?this.$("#campaign_default_reply_to").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        var fromEmail = this.$('#campaign_from_email').val();
                        var fromEmailMF = merge_field_patt.test(fromEmail) ? this.$('#fromemail_default_input').val():"";
                        if( this.settingchange || this.parent.camp_id==0){
                                this.app.showLoading("Saving settings...",this.parent.dialog.$el);
                                var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                                var _postData = { type: "saveStep1",campNum:this.parent.camp_id,
                                        subject : this.$("#campaign_subject").val(),
                                        senderName :this.$("#campaign_from_name").val(),
                                        fromEmail : fromEmail,
                                        defaultFromEmail : fromEmailMF,
                                        defaultSenderName :defaultSenderName,
                                        replyTo :this.$("#campaign_reply_to").val(),
                                        defaultReplyToEmail :defaultReplyToEmail,                                        
                                        tellAFriend :this.$("#campaign_tellAFriend")[0].checked?'Y':'N',
                                        subInfoUpdate :'N',
                                        unsubscribe :this.$("#campaign_unSubscribeType").val(),
                                        provideWebVersionLink :this.$("#campaign_isWebVersion")[0].checked?'Y':'N',
                                        isFooterText : this.$("#campaign_isFooterText")[0].checked?'Y':'N',
                                        footerText :this.$("#campaign_footer_text").val(),
                                        facebookShareIcon :this.$("#campaign_fb")[0].checked?'Y':'N',
                                        twitterShareIcon :this.$("#campaign_twitter")[0].checked?'Y':'N',
                                        linkedInShareIcon :this.$("#campaign_linkedin")[0].checked?'Y':'N',
                                        googlePlusShareIcon :this.$("#campaign_gplus")[0].checked?'Y':'N',
                                        pinterestShareIcon: this.$("#campaign_pintrest")[0].checked?'Y':'N',
                                        useCustomFooter :this.$("#campaign_useCustomFooter")[0].checked?'Y':'N',
                                        isShareIcons :this.$("#campaign_socail_share input[type='checkbox']:checked").length?'Y':'N',
                                        isThirdPartySMTP : 'N'
                                  }
                                //Gmail settings flag  
                                if(this.isThirdPartySMTP=="Y"){
                                      _postData.isThirdPartySMTP="Y"
                                      _postData.thirdPartySMTPName="Gmail"
                                  }
                                $.post(URL, _postData)
                                 .done(_.bind(function(data) {                                 
                                    var step1_json = jQuery.parseJSON(data);
                                    this.app.showLoading(false,this.parent.dialog.$el);
                                    if(step1_json[0]!=="err"){   
                                            this.parent.parent.loadCampaign();
                                            if(this.parent.type!=="workflow"){
                                                if(this.parent.dialog){
                                                    this.parent.dialog.$(".dialog-title").html("'"+this.$("#campaign_subject").val()+"' Settings")
                                                }
                                            }
                                            //if(this.parent.messagebody_page.states.editor_change === true ){
                                                this.parent.saveStep2();                                                
                                            //}
                                            //else{
                                              //  this.app.showMessge("Message settings saved successfully!");
                                            //}                                                                                                                                   
                                    }
                                    else{
                                           this.app.showAlert(step1_json[1],this.$el); 
                                    }
                                },this));
                                
                                if (this.$("#conversion_filter").prop("checked")) {
                                    this.saveConversionPage();
                                }
                                
                        }
                    }
                    else {
                        this.parent.dialog.$(".modal-body").animate({scrollTop: 0}, 300)
                    }
                    
                },
                saveConversionPage: function () {
                    var camp_obj = this;
                    var camp_id = this.parent.camp_id;
                    var URL = "/pms/io/filters/saveLinkIDFilter/?BMS_REQ_TK=" + this.app.get('bms_token');
                    this.$("#save_conversion_filter").addClass("saving");
                    $.post(URL, {campNum: camp_id,
                        rule: this.$("select#con_filter_combo").val(),
                        matchValue: this.$("#con_filter_field").val(),
                        type: "conversion"})
                            .done(function (data) {
                                camp_obj.$("#save_conversion_filter").removeClass("saving");
                                camp_obj.hasConversionFilter = true;
                            });

                },
                createWorkFlowMessage: function(){
                    this.app.showLoading("Creating Message...",this.parent.dialog.$el);
                    var URL = "/pms/io/workflow/saveWorkflowData/?BMS_REQ_TK="+this.app.get('bms_token');
                    var wf = this.parent.options.workflowObj;
                    $.post(URL, { type:"newWorkflowMessage",stepId: wf["stepId"],workflowId:wf["workflowId"],optionNumber:wf["optionNumber"]})
                     .done(_.bind(function(data) {                                 
                        var message_json = jQuery.parseJSON(data);
                        this.app.showLoading(false,this.parent.dialog.$el);
                        if(message_json[0]!=="err"){
                            this.parent.camp_id = message_json[1];
                            this.parent.parent.campNum = message_json[1];  
                            this.parent.messagebody_page.$(".save-step2").show();
                            //this.saveStep1();   
                            var workflowIframe = $(".workflowiframe");
                            if(workflowIframe.length && workflowIframe[0].contentWindow.submitAndRefreshPage){
                                workflowIframe[0].contentWindow.submitAndRefreshPage();
                            }
                            
                        }
                        else{
                               this.app.showAlert(message_json[1],this.$el); 
                        }
                    },this));
                },
                updateWorkFlowMessage: function(campNum){                   
                    var URL = "/pms/io/workflow/saveWorkflowData/?BMS_REQ_TK="+this.app.get('bms_token');
                    var wf = this.parent.options.workflowObj;
                    $.post(URL, { type:"saveWorkflowMessage",stepId: wf["stepId"],workflowId:wf["workflowId"],optionNumber:wf["optionNumber"],campNum:campNum})
                     .done(_.bind(function(data) {                                 
                        var message_json = jQuery.parseJSON(data);
                        this.app.showLoading(false,this.parent.dialog.$el);
                        if(message_json[0]!=="err"){
                            //this.saveStep1();   
                            var workflowIframe = $(".workflowiframe");
                            if(workflowIframe.length && workflowIframe[0].contentWindow.submitAndRefreshPage){
                                //workflowIframe[0].contentWindow.submitAndRefreshPage();
                            }
                            
                        }
                        else{
                               this.app.showAlert(message_json[1],this.$el); 
                        }
                    },this));
                }            
        });
});