define(['text!nurturetrack/html/message_setting.html','jquery-ui'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Setting Dialog View for page 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click .mergefields-box' :'showMergeFieldDialog'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;    
                    this.dialog = this.options.dialog;
                    this.camp_obj = this.parent.object[0];
                    this.plainText = "";
                    this.htmlText = "";
                    this.settingchange = true;
                    this.camp_id = this.camp_obj['campNum.encode'];                    
                    this.app = this.parent.app;                            
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({
                    model: this.model
                }));         
                this.$bodyInner = this.$(".accordion_messagebody-inner"); 
                this.initControl();
                this.loadMessageBody();                
            }
            ,
            initControl:function(){
                this.$("#accordion_setting").accordion({heightStyle: "fill",collapsible: true});                    
                this.$("#accordion_messagebody").accordion({heightStyle: "fill",collapsible: true,active:1});
                
                this.$(".accordion_login-inner").css({"height":"auto","overflow":"inherit"});
                this.$(".accordion_messagebody-inner").css({"height":"auto","overflow":"inherit"});
                
                this.$("#campaign_from_email").chosen({no_results_text:'Oops, nothing found!', disable_search: "true"});
                var camp_obj = this;
                this.$("#campaign_from_email").chosen().change(function(){
                    camp_obj.fromNameSelectBoxChange(this)
                    camp_obj.$("#campaign_from_email_input").val($(this).val());
                });
                this.$("#fromemail_default").chosen({no_results_text:'Oops, nothing found!', width: "67%",disable_search: "true"});                                        
                this.$("#campaign_from_email_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$("#fromemail_default_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.loadCampaign();
                
            },
            init:function(){
              this.setFromNameField();  
              this.loadData();
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
           loadCampaign:function(){
              this.app.showLoading("Loading Campaign...",this.$el);  
              var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.camp_id+"&type=basic";
              jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                   this.app.showLoading(false,this.$el);  
                   var camp_json = jQuery.parseJSON(xhr.responseText);
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
                            setTimeout(_.bind(this.parent.setFromNameField,this),300);
                        }
                        else
                        {
                            this.$("#campaign_from_email").val(this.app.decodeHTML(camp_json.fromEmail)).trigger("chosen:updated");                                
                            this.$("#campaign_from_email_input").val(this.app.decodeHTML(camp_json.fromEmail));
                            this.$("#campaign_from_email_default").hide();                            
                        }
                    }
                    if(camp_json.senderName != ''){
                        this.$("#campaign_from_name").val(this.app.decodeHTML(camp_json.senderName));                        
                    }                    
                    this.$("#campaign_reply_to").val(this.app.decodeHTML(camp_json.replyTo));       
                    this.htmlText = camp_json.htmlText;
                    this.plainText = camp_json.plainText;                    
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
                   
               },this));
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
           loadData:function(){
               var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=campaignDefaults";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
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
                            
                            
                        }
                    },this)).fail(function() { console.log( "error in detauls" ); });      
           },
           loadMessageBody:function(){
               this.app.showLoading("Loading...",this.$bodyInner);
               require(["campaigns/campaign_body"],_.bind(function(page){    
                    this.app.showLoading(false,this.$bodyInner);                    
                    var messagebody_page = new page({page:this,scrollElement:this.dialog.$(".modal-body"),camp_obj:this.camp_obj})                       
                    this.$bodyInner.append(messagebody_page.$el);         
                    messagebody_page.init();
                },this));
           },
           saveStep1:function(){            
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
                    
                    if(this.$(".femail-default-container").css('display')=="block" && (fromEmailDefault === '' || !app.validateEmail(fromEmailDefault)))
                    {           
                        this.app.showError({
                            control:this.$('.femail-default-container'),
                            message:this.app.messages[0].CAMP_fromemail_default_format_error
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:el.find(".femail-default-container")});
                    }
                    merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                    
                    if(replyto !== '' && !merge_field_patt.test(replyto) && !app.validateEmail(replyto))
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

            
                    if(isValid)
                    {   
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultSenderName = merge_field_patt.test(this.$('#campaign_from_name').val())?this.$("#campaign_default_from_name").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultReplyToEmail = merge_field_patt.test(this.$('#campaign_reply_to').val())?this.$("#campaign_default_reply_to").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        var fromEmail = this.$('#campaign_from_email_input').val();
                        var fromEmailMF = merge_field_patt.test(fromEmail) ? this.$('#fromemail_default_input').val():"";
                        if( this.settingchange || this.camp_id==0){
                                this.app.showLoading("Saving settings...",this.$el);
                                var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                                $.post(URL, { type: "saveStep1",campNum:this.camp_id,
                                        subject : this.$("#campaign_subject").val(),
                                        senderName :this.$("#campaign_from_name").val(),
                                        fromEmail : fromEmail,
                                        defaultFromEmail : fromEmailMF,
                                        defaultSenderName :defaultSenderName,
                                        replyTo :this.$("#campaign_reply_to").val(),
                                        defaultReplyToEmail :defaultReplyToEmail,                                        
                                  })
                                 .done(_.bind(function(data) {                                 
                                    var step1_json = jQuery.parseJSON(data);
                                    this.app.showLoading(false,this.$el);
                                    if(step1_json[0]!=="err"){                                            
                                            this.app.showMessge("Step 1 saved successfully!");                                     
                                            //camp_obj.states.step1.change=false;
                                                                                       
                                    }
                                    else{
                                           this.app.showMessge(step1_json[0]); 
                                    }
                                },this));
                                
                        }
                    }
                    
                },
                saveStep2:function(gotoNext){                 
                 var camp_obj = this; 
                 var proceed = -1;
                 var html = "",plain="";                  
                 var post_data = {type: "saveStep2",campNum:this.camp_id}
                 var selected_li = this.$(".step2 #choose_soruce li.selected").attr("id");
                     if(selected_li=="html_editor"){
                        html= (this.$(".textdiv").css("display")=="block")?this.$("#htmlarea").val():tinyMCE.get('bmseditor_'+this.wp_id).getContent();
                        plain = this.$("#bmstexteditor").val();
                        post_data['htmlCode'] = html; 
                        post_data['plainText'] = plain;
                        //this.$("#campaign_isTextOnly").prop("checked",false).iCheck('uncheck');
                     }else if(selected_li=="html_code"){
                        html = this.$("textarea#handcodedhtml").val();                     
                        post_data['htmlCode'] = html;
                        //this.$("#campaign_isTextOnly").prop("checked",false).iCheck('uncheck');
                     }else if(selected_li=="plain_text"){
                        plain = this.$("textarea#plain-text").val();      
                        post_data['plainText'] = plain;
                        post_data['isCampaignText'] = 'Y';
                        //this.$("#campaign_isTextOnly").prop("checked",true).iCheck('check');
                     }                 
                        
                 if(this.states.editor_change ===true || typeof(gotoNext)!=="undefined"){
                    if(typeof(gotoNext)==="undefined"){
                       this.app.showLoading("Saving Step 2...",this.$el.parents(".ws-content"));
                    }                   
                   var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                   $.post(URL,post_data )
                        .done(function(data) {                                 
                            var step1_json = jQuery.parseJSON(data);
                            camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));
                            camp_obj.$(".save-step2").removeClass("saving");
                            if(step1_json[0]!=="err"){
                                camp_obj.app.showMessge("Step 2 saved successfully!");
                                if(selected_li=="plain_text"){
                                    camp_obj.states.step2.plainText = plain;                                    
                                    camp_obj.states.step2.htmlText = "";
                                }
                                else{
                                    camp_obj.states.step2.htmlText = html;
                                    camp_obj.states.step2.plainText = plain;                                    
                                }
                                camp_obj.states.editor_change = false;
                                if(typeof(gotoNext)=="undefined"){
                                    camp_obj.wizard.next();
                                }
                            }
                            else{
                               camp_obj.app.showMessge(step1_json[0]); 
                            }
                   });
                   proceed = 1
                 }  
                return proceed;  
                },
                saveCall:function(){
                    this.saveStep1();
                }
            
            
        });
});