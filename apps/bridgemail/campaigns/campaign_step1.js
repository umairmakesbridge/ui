define(['text!campaigns/html/campaign_step1.html','bms-mergefields','jquery.chosen','jquery.icheck'],
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
            },
            initControls:function(){                
                
                this.$("#campaign_from_email").chosen({no_results_text:'Oops, nothing found!', disable_search: "true"});
                var camp_obj = this;
                this.$("#campaign_from_email").chosen().change(function(){
                    camp_obj.fromNameSelectBoxChange(this)
                    camp_obj.$("#campaign_from_email_input").val($(this).val());
                });
                this.$("#fromemail_default").chosen({no_results_text:'Oops, nothing found!', width: "62%",disable_search: "true"});                                        
                this.$("#fromemail_default").chosen().change(function(){                       
                    camp_obj.$("#fromemail_default_input").val($(this).val());
                });
                this.$("#campaign_from_email_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$("#fromemail_default_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                
                this.$('#campaign_subject-wrap').mergefields({app:this.app,elementID:'campaign_subject',config:{state:'dialog'},placeholder_text:'Enter subject'});
                this.$('#campaign_reply_to-wrap').mergefields({app:this.app,config:{salesForce:true,emailType:true,state:'dialog'},elementID:'campaign_reply_to',placeholder_text:'Enter reply to'});
                this.$('#campaign_from_name-wrap').mergefields({app:this.app,config:{salesForce:true,state:'dialog'},elementID:'campaign_from_name',placeholder_text:'Enter from name'});
                this.$('#campaign_from_email-wrap').mergefields({app:this.app,config:{salesForce:true,emailType:true,state:'dialog'},elementID:'campaign_from_email',placeholder_text:'Enter from email'}); 
                
                this.$("#campaign_unSubscribeType").chosen({no_results_text:'Oops, nothing found!', width: "290px",disable_search: "true"});
                this.$("#campaign_unSubscribeType").chosen().change(_.bind(function(){                    
                    $(this).trigger("chosen:updated");
                },this));                    
                
               
                                
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
               active_workspace.find('#campaign_from_email_chosen').css({"width":parseInt(subj_w+22)+"px","padding-right":"61px"});   // Abdullah Try
                if(active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()){  
                   active_workspace.find("#campaign_from_email_input").css({"width":active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()+"px","margin-right":"61px"}); // Abdullah Check
                   active_workspace.find("#campaign_from_email_chosen .chosen-drop").css("width",(parseInt(active_workspace.find('#campaign_from_email_chosen').width()))+"px");
                 }
                 if(active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()){
                   active_workspace.find("#fromemail_default_input").css("width",active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()-6+"px");   // Abdullah Check
                 } 
            },
           loadCampaign:function(camp_json){              
                this.$("#campaign_subject").val(this.app.decodeHTML(camp_json.subject));
                var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                if(camp_json.fromEmail != '')
                 {
                     if(merge_field_patt.test(this.app.decodeHTML(camp_json.fromEmail)))
                     {
                         var merge_field = this.app.decodeHTML(camp_json.fromEmail);                                                                    
                         this.$("#campaign_from_email_input").val(merge_field);
                         this.$("#campaign_from_email_default").show();
                         this.$("#fromemail_default").val(this.app.decodeHTML(camp_json.defaultFromEmail)).trigger("chosen:updated");
                         this.$("#fromemail_default_input").val(this.app.decodeHTML(camp_json.defaultFromEmail));
                         setTimeout(_.bind(this.setFromNameField,this),300);
                     }
                     else
                     {
                         this.$("#campaign_from_email").val(this.app.decodeHTML(camp_json.fromEmail)).trigger("chosen:updated");                                
                         this.$("#campaign_from_email_input").val(this.app.decodeHTML(camp_json.fromEmail));
                         this.$("#campaign_from_email_default").hide();                            
                     }
                 }
                 this.$("select#campaign_unSubscribeType").val(camp_json.unSubscribeType).trigger("chosen:updated");
                 if(camp_json.senderName != ''){
                     this.$("#campaign_from_name").val(this.app.decodeHTML(camp_json.senderName));                        
                 }                    
                 this.$("#campaign_reply_to").val(this.app.decodeHTML(camp_json.replyTo));       
                 this.$("#campaign_profileUpdate").prop("checked",camp_json.profileUpdate=="N"?false:true);
                 this.$("#campaign_useCustomFooter").prop("checked",camp_json.useCustomFooter=="N"?false:true);
                 this.$("#campaign_isFooterText").prop("checked",camp_json.isFooterText=="N"?false:true);
                 this.$("#campaign_tellAFriend").prop("checked",camp_json.tellAFriend=="N" ? false:true );                
                 this.$("#campaign_isWebVersion").prop("checked",camp_json.isWebVersionLink=="N"?false:true);
                 
                 this.parent.htmlText = camp_json.htmlText;
                 this.parent.plainText = camp_json.plainText;                    
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
           loadData:function(){
               this.app.showLoading("Loading Campaign...",this.$el);  
               var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=campaignDefaults";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            this.app.showLoading(false,this.$el);  
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if(this.app.checkError(defaults_json)){
                                return false;
                            }                            
                            this.$("#campaign_footer_text").val(this.app.decodeHTML(defaults_json.footerText));
                            this.$("#campaign_from_email").val(this.app.decodeHTML(defaults_json.fromEmail));
                            this.$("#campaign_from_name").val(this.app.decodeHTML(defaults_json.fromName));
                            var fromEmails = defaults_json.fromEmail;
                            if(defaults_json.optionalFromEmails)
                                    fromEmails += ',' + defaults_json.optionalFromEmails;
                            var fromEmailsArray = fromEmails.split(',');
                            var fromOptions = '';
                            var selected_fromEmail = '';
                            for(var i=0;i<fromEmailsArray.length;i++)
                            {
                                if(fromEmailsArray[i] == defaults_json.fromEmail){
                                        fromOptions += '<option value="'+ fromEmailsArray[i] +'" selected="selected">'+fromEmailsArray[i] + '</option>';
                                        selected_fromEmail = fromEmailsArray[i];
                                     }
                                else
                                     fromOptions += '<option value="'+ fromEmailsArray[i] +'">'+fromEmailsArray[i] + '</option>';
                            }
                            this.$el.find('#campaign_from_email').append(fromOptions);
                            this.$el.find('#fromemail_default').append(fromOptions);
                            this.$("#campaign_from_email").trigger("chosen:updated");
                            this.$('#fromemail_default').trigger("chosen:updated");
                            this.$(".flyinput").val(selected_fromEmail);
                            setTimeout(_.bind(this.setFromNameField,this),300);                            
                            
                            var subj_w = this.$el.find('#campaign_subject').innerWidth(); // Abdullah CHeck                               
                            this.$el.find('#campaign_from_email_chosen').width(parseInt(subj_w+40)); // Abdullah Try
                            
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
                        }
                    },this)).fail(function() { console.log( "error in detauls" ); });      
           },
           saveStep1:function(validate){            
                    var isValid = true;
                    var defaultSenderName = "",defaultReplyToEmail="";
                    var replyto = this.$('#campaign_reply_to').val();
                    var email_addr = this.$('#campaign_default_reply_to').val();
                    var fromEmail = this.$('#campaign_from_email_input').val();
                    var fromEmailDefault = this.$('#fromemail_default_input').val();
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                    
                    if(this.$('#campaign_subject').val() == '')
                    {            
                        this.app.showError({
                                control:this.$('.subject-container'),
                                message:this.app.messages[0].CAMP_subject_empty_error
                        });
                        isValid = false;
                    }
                    else if(this.$('#campaign_subject').val().length > 100)
                    {           
                        this.app.showError({
                                control:this.$('.subject-container'),
                                message:this.app.messages[0].CAMP_subject_empty_error
                        });
                        isValid = false;
                    }
                    else
                    {           
                         this.app.hideError({control:this.$(".subject-container")});
                    }
                    if(this.$('#campaign_from_name').val() == '')
                    {           
                        this.showError({
                            control:this.$('.fname-container'),
                            message:this.app.messages[0].CAMP_fromname_empty_error
                        });
                        isValid = false;
                    }
                    else
                    {           
                            this.app.hideError({control:this.$(".fname-container")});
                    }
                    if(this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val()=="")
                    {           
                        this.app.showError({
                            control:this.$('.fnamedefault-container'),
                            message:this.app.messages[0].CAMP_defaultfromname_empty_error
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".fnamedefault-container")});
                    }
                    
                    if(fromEmail === '' || (!merge_field_patt.test(fromEmail) && !this.app.validateEmail(fromEmail)))
                    {           
                        this.app.showError({
                            control:this.$('.fromeEmail-container'),
                            message:this.app.messages[0].CAMP_fromemail_format_error
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".fromeEmail-container")});
                    }
                    
                    if(this.$(".femail-default-container").css('display')=="block" && (fromEmailDefault === '' || !this.app.validateEmail(fromEmailDefault)))
                    {           
                        this.app.showError({
                            control:this.$('.femail-default-container'),
                            message:this.app.messages[0].CAMP_fromemail_default_format_error
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
                        this.app.showError({
                                control:this.$('.replyto-container'),
                                message:this.app.messages[0].CAMP_replyto_format_error
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".replyto-container")});
                    }
                    if(this.$('#campaign_reply_to_default').css('display') == 'block' && email_addr == '')
                    {           
                        this.app.showError({
                                control:this.$('.replyemail-container'),
                                message:this.app.messages[0].CAMP_defaultreplyto_empty_error
                        });
                        isValid = false;
                    }
                    else if(this.$('#campaign_reply_to_default').css('display') == 'block' && !this.app.validateEmail(email_addr))
                    {           
                        this.app.showError({
                            control:this.$('.replyemail-container'),
                            message:this.app.messages[0].CAMP_defaultreplyto_format_error
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
                        var fromEmail = this.$('#campaign_from_email_input').val();
                        var fromEmailMF = merge_field_patt.test(fromEmail) ? this.$('#fromemail_default_input').val():"";
                        if( this.settingchange || this.parent.camp_id==0){
                                this.app.showLoading("Saving settings...",this.parent.dialog.$el);
                                var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                                $.post(URL, { type: "saveStep1",campNum:this.parent.camp_id,
                                        subject : this.$("#campaign_subject").val(),
                                        senderName :this.$("#campaign_from_name").val(),
                                        fromEmail : fromEmail,
                                        defaultFromEmail : fromEmailMF,
                                        defaultSenderName :defaultSenderName,
                                        replyTo :this.$("#campaign_reply_to").val(),
                                        defaultReplyToEmail :defaultReplyToEmail,                                        
                                        tellAFriend :this.$("#campaign_tellAFriend")[0].checked?'Y':'N',
                                        subInfoUpdate :this.$("#campaign_profileUpdate")[0].checked?'Y':'N',
                                        unsubscribe :this.$("#campaign_unSubscribeType").val(),
                                        provideWebVersionLink :this.$("#campaign_isWebVersion")[0].checked?'Y':'N',
                                        isFooterText : this.$("#campaign_isFooterText")[0].checked?'Y':'N',
                                        footerText :this.$("#campaign_footer_text").val(),
                                        facebookShareIcon :this.$("#campaign_fb")[0].checked?'Y':'N',
                                        twitterShareIcon :this.$("#campaign_twitter")[0].checked?'Y':'N',
                                        linkedInShareIcon :this.$("#campaign_linkedin")[0].checked?'Y':'N',
                                        googlePlusShareIcon :this.$("#campaign_gplus")[0].checked?'Y':'N',
                                        pinterestShareIcon: this.$("#campaign_pintrest")[0].checked?'Y':'N',
                                        isShareIcons :this.$("#campaign_socail_share input[type='checkbox']:checked").length?'Y':'N'
                                  })
                                 .done(_.bind(function(data) {                                 
                                    var step1_json = jQuery.parseJSON(data);
                                    this.app.showLoading(false,this.parent.dialog.$el);
                                    if(step1_json[0]!=="err"){   
                                            this.parent.parent.loadCampaign();
                                            if(this.parent.dialog){
                                                this.parent.dialog.$(".dialog-title").html("'"+this.$("#campaign_subject").val()+"' Settings")
                                            }
                                            if(this.parent.messagebody_page.states.editor_change ===true ){
                                                this.parent.saveStep2();                                                
                                            }
                                            else{
                                                this.app.showMessge("Message settings saved successfully!");
                                            }
                                            //camp_obj.states.step1.change=false;
                                                                                       
                                    }
                                    else{
                                           this.app.showAlert(step1_json[1],this.$el); 
                                    }
                                },this));
                                
                        }
                    }
                    
                }
            
        });
});