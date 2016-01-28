/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['text!onetooneemails/html/createmessage.html','common/ccontacts','bms-mergefields'],
function (template,contactsView) {
   /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
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
                    this.parent = this.options.page;
                    this.app = this.parent.app;
                    this.isPreviewEmail = this.options.isPreviewEmail;
                    this.subNum = (this.options.subNum) ? this.options.subNum : '';
                    this.msgID = (this.options.msg_id) ? this.options.msg_id : '';
                    this.isSendEmail = (this.options.isSendEmail) ? this.options.isSendEmail : '';
                    this.emailHTML = '';
                    this.tagTxt = '';
                    this.sub_name = '';
                    this.subEmailDetails = '';
                    this.dialog = this.options.dialog;
                    this.tinymceEditor = false;
                    this.meeEditor = false; 
                    this.isloadMeeEditor =false;
                    this.otoTemplateFlag = this.options.otoTemplateFlag;
                    this.template_id = (this.options.template_id) ? this.options.template_id : '';
                    this.directContactFlag = (this.options.directContactFlag) ? this.options.directContactFlag : false;
                    
                    this.render();
                    //this.model.on('change',this.renderRow,this);
            },
            render: function () {                    
                
               this.$el.html(this.template());
               this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});

                this.initControls();  
               
            },
            initControls : function(){
                 
            },
            init:function(){
              this.setFromNameField();
              
              if(this.isPreviewEmail){
                  this.initPreviewEmail();
              }
              else if(this.isSendEmail){
                  this.initSendEmail();
              }
              else {
                  this.initCreateEmail();
              }
              
            
            },
            initPreviewEmail : function(){
                this.loadVContact(); // Call when subNum is available
                this.getEmailSubDetail();
                this.showIframe();
            },
            initCreateEmail : function(){
                 this.loadContact();
                 this.loadData();
                 if(this.subNum){
                     this.loadVContact();
                 }
                 //this.$('#myTab li:nth-child(2) a').click();
                 if(this.otoTemplateFlag){
                     this.loadTemplate();
                 }else{
                     this.loadEditor();
                 }
            },
            initSendEmail : function(){
                 this.loadContact();
                 this.getEmailSubDetail();
                 this.loadVContact();
                 this.loadData();
                
            },
            
            loadData:function(){
               this.app.showLoading("Loading Email...",this.dialog.getBody());  
               var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=campaignDefaults";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if(this.app.checkError(defaults_json)){
                                return false;
                            }                            
                            this.campDefaults = defaults_json;
                            this.$("#campaign_footer_text").val(this.app.decodeHTML(defaults_json.footerText));
                            this.$("#campaign_from_email").val(this.app.decodeHTML(defaults_json.fromEmail));
                            this.$("#campaign_from_name").val(this.app.decodeHTML(defaults_json.fromName));
                            this.$('#campaign_reply_to').val(this.app.decodeHTML(defaults_json.fromEmail));
                            var fromEmails = defaults_json.fromEmail;
                            if(defaults_json.optionalFromEmails)
                                    fromEmails += ',' + defaults_json.optionalFromEmails;
                            var fromEmailsArray = fromEmails.split(',');
                            var fromOptions = '';
                            var selected_fromEmail = '';
                            //if(this.app.salesMergeAllowed){
                             //   fromOptions += '<option value="{{BMS_SALESREP.EMAIL}}">{{BMS_SALESREP.EMAIL}}</option>';
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
                            this.$el.find('#campaign_from_email').append(fromOptions);
                            //if(this.app.salesMergeAllowed){
                                this.$("#campaign_from_email").chosen().change(_.bind(function(obj){
                                    if(obj.target.value === '{{BMS_SALESREP.EMAIL}}'){
                                        this.$('#campaign_from_email_default').show();
                                    }else{
                                       this.$('#campaign_from_email_default').hide();
                                    }
                                },this));
                            //}
                            this.$el.find('#fromemail_default').append(fromOptions);
                            this.$el.find('#fromemail_default option:contains({{BMS_SALESREP.EMAIL}})').remove();
                            this.$("#campaign_from_email").trigger("chosen:updated");
                            this.$('#fromemail_default').trigger("chosen:updated");
                            this.$(".flyinput").val(selected_fromEmail);
                            setTimeout(_.bind(this.setFromNameField,this),300);                            
                            
                            var subj_w = this.$el.find('#campaign_subject').innerWidth(); // Abdullah CHeck                               
                            //this.app.showLoading(false,this.dialog.getBody());  
                            //this.$el.find('#campaign_from_email_chosen').width(parseInt(subj_w+40)); // Abdullah Try
                            
                            
                            if(this.camp_json){
                               // this.loadCampaign(this.camp_json);
                               console.log(this.camp_json);
                            }
                            else{
                               this.initChosenPlug();
                               //this.parent.loadCallCampaign(); 
                            }                            
                        }
                    },this)).fail(function() { console.log( "error in defaults" ); });      
           },
            initChosenPlug : function(){
              this.$("#campaign_from_email").chosen({no_results_text:'Oops, nothing found!', disable_search: "true"});
                var message_obj = this;
                
                this.$("#fromemail_default").chosen({no_results_text:'Oops, nothing found!', width: "62%",disable_search: "true"});                                        
                this.$("#fromemail_default").chosen().change(function(){                       
                    message_obj.$("#fromemail_default_input").val($(this).val());
                });
                this.$("#campaign_from_email_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$("#fromemail_default_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
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
             loadContact : function(){
                    var active_ws = $(".modal-body");
                    active_ws.find('.campaign-clickers').remove();                    
                    active_ws.find('#camp-prev-contact-search').append(new contactsView({page: this, searchCss: '489px', contactHeight: '274px', hideCross: true, isCamPreview: true, placeholderText: 'Search for a contact to use for sending an email',isOTOFlag:true}).el)
                    active_ws.find('#prev-closebtn').css({'top': '18px'});                    
                    return;
             },
             loadVContact : function(){
             if(this.isPreviewEmail){
                 this.$('.oto-message-contact-wrap h2').hide();
             }
             
             var vcontact = $('<div id="contact-vcard" class="activities_tbl"></div>');
             this.$('.oto-message-contact-wrap').append(vcontact);
             if(this.isSendEmail){
               $(vcontact).css({'background':'none repeat scroll 0 0 transparent','z-index': '100', 'min-height': '170px', 'position': 'relative', 'top': '45px','left':'-5px','width': '390px',});   
               this.$('.oto-message-contact-wrap').css('min-height','250px');
               this.$('.oto-message-fields-wrap').css({'min-height':'270px','margin-top':'0'});
             }else{ 
                this.$('.oto-message-contact').remove();
                $(vcontact).css({'background':'none repeat scroll 0 0 transparent','z-index': '100', 'min-height': '170px', 'position': 'relative', 'top': '15px','left':'0','width': '390px',});
             }
             this.app.showLoading("Loading Contact Details...", vcontact);
            // this.parent.$el.find('.stats_listing').hide();
                require(["common/vcontact"], _.bind(function(page) {
                            var visitcontact = new page({parent: this, app: this.app, subNum: this.subNum,isOTOFlag:true,isSendEmail:this.isSendEmail});
                            $(vcontact).html(visitcontact.$el);
                            this.isVisitcontactClick = true;
                            
                                    }, this));
             },
             getEmailSubDetail : function(){
                    var _this = this;
                    var bms_token = this.app.get('bms_token');
                    //Load subscriber details, fields and tags
                    this.app.showLoading("Loading Email Details...", this.dialog.getBody());
                    var URL = "/pms/io/subscriber/getSingleEmailData/?BMS_REQ_TK=" + bms_token + "&type=getMessageDetail&subNum=" + this.subNum + "&msgId="+this.msgID;
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (_this.app.checkError(_json)) {
                            return false;
                        }
                        else{
                           _this.subEmailDetails = _json;
                           _this.app.showLoading(false, _this.dialog.getBody());
                            if(_json.body.indexOf("__OUTERTD") != -1 && !_this.isPreviewEmail){
                                 _this.emailHTML = _json.body;
                                 _this.isloadMeeEditor = true;
                                 _this.loadEditor();
                             }
                            else{
                                _this.showIframe();
                                _this.$('#oto-easyeditor').html('<i class="icon preview left"></i>Message Preview<label style="position:absolute;top: 0px; left: 110px;" class="step2-lists"><span style="display: block;" class="fieldinfo"><i class="icon"></i><em>HTML is not compatible with the Easy Editor.</em></span></label>');
                                
                               // _this.editorContent = _this.app.decodeHTML(_json.body, true);
                               // _this.$('#myTab li:nth-child(2) a').click();
                            }
                          if(_this.isPreviewEmail)
                           {
                            _this.populateEmailDetail(_json);
                            }
                        }
                    })
             },
             populateEmailDetail : function (_json){
                 this.$('#oto_email_fields').hide();
                 this.$('#oto_email_preview').show();
                 this.$('#campaign_preview_subject').html(_json.subject);
                 this.$('#campaign_preview_fromEmail').html(_json.fromEmail);
                 this.$('#campaign_preview_defaultSenderName').html(_json.firstName);
                // this.$('#campaign_preview_bcc').html(_json.senderName);
                 this.$('#campaign_preview_defaultReplyTo').html(_json.replyTo);
                 //this.$('#campaign_preview_replyto_default').html(_json.toEmail);
             },
             loadEditor : function(){
                 
                      this.isloadMeeEditor = true;
                      if(!this.meeEditor){
                         this.app.showLoading("Loading Makesbridge Easy Editor...",this.dialog.getBody());                         
                         this.meeEditor = true; 
                         setTimeout(_.bind(this.setMEEView,this),100);                        
                    }
                     
                  
                },
             
             setMEEView:function(){
                    var _html = "";
                    _html = this.emailHTML?$('<div/>').html(this.emailHTML).text().replace(/&line;/g,""):""; 
                     this.app.showLoading("Loading Makesbridge Easy Editor...",this.dialog.getBody());
                     
                     require(["editor/MEE"],_.bind(function(MEE){                                              
                        var MEEPage = new MEE({app:this.app,margin:{top:373,left:0}, _el:this.$("#mee_editor"), html:''
                            ,saveClick:_.bind(this.sendEmail,this),fromDialog:true,parentWindow:this.$el.parents(".modal-body"),scrollTopMinus:410,isOTOFlag:true,isSaveHide:true, previewCallback: _.bind(this.previewCallback, this)});                                    
                        this.$("#mee_editor").setChange(this);                
                        this.setMEE(_html);
                        this.initScroll();
                       
                    },this));  
                },
                setMEE:function(html){
                   if(this.$("#mee_editor").setMEEHTML && this.$("#mee_editor").getIframeStatus()){
                        this.$("#mee_editor").setMEEHTML(html);
                         this.app.showLoading(false,this.dialog.getBody()); 
                   } 
                   else{
                       setTimeout(_.bind(this.setMEE,this,html),200);
                   }
                },
                initScroll:function(){            
                    this.$win=this.$el.parents(".modal-body")
                    ,this.$nav = this.$('.editortoolbar')
                    ,this.$tools = this.$('.editortools')                                    
                    ,this.$editorarea =this.$('.editorbox')
                    ,this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').position().top                
                    ,this.isFixed = 0,this.scrollChanged=false;

                    this.processScroll=_.bind(function(){                                                       
                      if(this.$("#area_html_editor_mee").height() > 0 ){ 
                        if(this.$("#area_html_editor_mee").css("display")!=="none"){  
                          var i, scrollTop = this.$win.scrollTop();
                          this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').position().top  ;
                          
                          if (scrollTop >= (this.navTop + 12) && !this.isFixed) {
                            this.isFixed = 1
                            this.$nav.addClass('editor-toptoolbar-fixed editor-toptoolbar-fixed-border');                            
                            this.$nav.css("width",this.$(".editorpanel").width());
                            this.$tools.addClass('editor-lefttoolbar-fixed');                        
                            this.$editorarea.addClass('editor-panel-fixed');                                                
                            this.$nav.css("top","60px");this.$tools.css("top","60px");
                            this.scrollfixPanel();
                          } else if (scrollTop <= (this.navTop + 12) && this.isFixed) {
                            this.isFixed = 0
                            this.$nav.removeClass('editor-toptoolbar-fixed  editor-toptoolbar-fixed-border');
                            this.$nav.css("top","7px");this.$tools.css("top","0px");
                            this.$nav.css("width","100%");
                            this.$tools.removeClass('editor-lefttoolbar-fixed');                        
                            this.$editorarea.removeClass('editor-panel-fixed');                        
                          }                      
                        }
                      }
                    },this);
                    this.processScroll();
                    this.$win.on('scroll', this.processScroll);                                
                },
             scrollfixPanel: function(){
                    this.$win.scroll(_.bind(function(){
                        var scrollTop = this.$win.scrollTop();
                        //var scrollPosition = scrollTop - 500;
                        var scrollTop = this.$win.scrollTop();
                        var scrollPosition = scrollTop - 410;
                        if(scrollPosition < 0 ){
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top','0');
                        }else{
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top',scrollPosition+'px');
                        }
                        
                    },this));
                },
             sendEmail : function(){
                    var isValid = true;
                    var html = '';
                    var campaign_subject_title = $.trim(this.$('#campaign_subject').val());
                        if(campaign_subject_title!==""){
                            var newTitle = '<title>'+campaign_subject_title+'</title>';
                            var meeElement = this.$("#mee-iframe").contents();
                            if(meeElement.find("head title").length==1){
                                meeElement.find("head title").html(campaign_subject_title);
                            }
                            else{
                                 meeElement.find("head").append(newTitle);
                            }
                           // meeElement.find("head meta[property='og:title']").attr("content",campaign_subject_title);
                        }
                    if(this.isloadMeeEditor){
                       html = this.$("#mee_editor").getMEEHTML();
                     }else{
                       //  html = _tinyMCE.get('bmseditor_template').getContent()
                     }
                    var defaultSenderName = "",defaultReplyToEmail="";
                    var msgId= this.subEmailDetails["msgId.encode"];
                    var subNum = this.subNum;
                    var replyto = this.$('#campaign_reply_to').val();
                    var email_addr = this.$('#campaign_default_reply_to').val();
                    var fromEmail = this.$('#campaign_from_email').val();
                    var fromEmailDefault = this.$('#fromemail_default_input').val();
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                    var bccEmail = this.$('#campaign_bcc').val();
                    
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
                        this.app.showError({
                            control:this.$('.fname-container'),
                            message:this.app.messages[0].CAMP_fromname_empty_error
                        });
                        isValid = false;
                    }
                    else if(this.$('#campaign_from_name').val().indexOf("{{") && this.$('#campaign_from_name').val().search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/)==-1)
                    {           
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
                        this.app.showError({
                            control:this.$('.fnamedefault-container'),
                            message:this.app.messages[0].CAMP_defaultfromname_empty_error
                        });
                        isValid = false;
                    }
                    else if(this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val().search(/^\w[A-Za-z0-9-'!_\.\+&x x]*$/)==-1){
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
                    
                    if(replyto === '')
                    {           
                        this.app.showError({
                                control:this.$('.replyto-container'),
                                message:this.app.messages[0].CAMP_defaultreplyto_empty_error
                        });
                        isValid = false;
                    }
                    else if(replyto !== '' && !this.app.validateEmail(replyto))
                    {           
                        this.app.showError({
                            control:this.$('.replyto-container'),
                            message:this.app.messages[0].CAMP_defaultreplyto_format_error
                        });
                        isValid = false;
                    }
                    else
                    {           
                        this.app.hideError({control:this.$(".replyto-container")});
                    }
                    
                    if(bccEmail !== '' )
                    {     
                        var bccEmailArray = bccEmail.split(',');
                        var validFlag = true;
                        _.each(bccEmailArray,_.bind(function(val){
                               if(!this.app.validateEmail(val)){
                                isValid = false;
                                validFlag = false;
                               }
                        },this));
                       if(!validFlag){
                                    this.app.showError({
                                    control:this.$('.bcc-container'),
                                    message:this.app.messages[0].CAMP_defaultreplyto_format_error
                                    });
                            }
                             else
                                    {           
                                        this.app.hideError({control:this.$(".bcc-container")});
                                    }
                    }   
                    
                    if(!subNum)
                    {           
                        this.$el.find('#contact-search').addClass('error-contact');
                        this.$el.find('#searchbtn').css('border','2px solid #fb8080');
                        this.$el.find('#contact-search').parent().append('<span class="errortext"><i class="erroricon"></i><em>No contact selected</em></span>');
                        isValid = false;
                    }
                    else
                    {           
                       this.$el.find('#contact-search').removeClass('error-contact');
                       this.$el.find('#searchbtn').removeAttr('style');
                        this.$el.find('#contact-search').parent().find('.errortext').remove();
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
                    //console.log(isValid);
                    if(isValid)
                    {   
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultSenderName = merge_field_patt.test(this.$('#campaign_from_name').val())?this.$("#campaign_default_from_name").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultReplyToEmail = merge_field_patt.test(this.$('#campaign_reply_to').val())?this.$("#campaign_default_reply_to").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        var fromEmail = this.$('#campaign_from_email').val();
                        var fromEmailMF = merge_field_patt.test(fromEmail) ? this.$('#fromemail_default_input').val():"";
                        
                        //if( this.settingchange || this.parent.camp_id==0){
                                this.app.showLoading("Sending message...",this.dialog.getBody());
                                var URL = "/pms/io/subscriber/saveSingleEmailData/?BMS_REQ_TK="+this.app.get('bms_token');
                                $.post(URL, { type: "sendMessage",
                                        subject : this.$("#campaign_subject").val(),
                                        senderName :this.$("#campaign_from_name").val(),
                                        fromEmail : fromEmail,
                                        defaultFromEmail : fromEmailMF,
                                        defaultSenderName :defaultSenderName,
                                        replyTo :this.$("#campaign_reply_to").val(),
                                        defaultReplyToEmail :defaultReplyToEmail,
                                        subNum:subNum,
                                        bccEmail:bccEmail,
                                        htmlCode:html,
                                        msgId:msgId
                                  })
                                 .done(_.bind(function(data) {                                 
                                    var step1_json = jQuery.parseJSON(data);
                                    this.app.showLoading(false,this.dialog.getBody());
                                    if(step1_json[0]!=="err"){ 
                                            if(!this.directContactFlag){
                                                this.parent.parent.type='getMessageList';
                                                this.parent.parent.getallemails();
                                                this.parent.parent.headBadge();
                                            }
                                            
                                           /* if(this.parent.dialog){
                                                this.parent.dialog.$(".dialog-title").html("'"+this.$("#campaign_subject").val()+"' Settings")
                                            }
                                            else{*/
                                                this.app.showMessge("Email send successfully!");
                                                this.closeDialog();
                                           // }
                                            //camp_obj.states.step1.change=false;
                                                                                       
                                    }
                                    else{
                                           this.app.showAlert(step1_json[1],this.$el); 
                                    }
                                },this));
                                
                       // }
                    }
             },
             showIframe : function(){
                 var iframe = '<iframe id="email-template-iframe" class="email-iframe" frameborder="0" style="height: 494px;" src="https://'+this.app.get("preview_domain")+'/pms/events/viewmsg.jsp?msgId='+this.msgID+'&subNo='+this.subNum+'"></iframe>'
                 this.$('.tabpanel-wrapper').hide();
                 this.$('#mee-iframe-wrapper').html(iframe);
             },
            
                 /**
                 * Load template contents and flag doing a get Ajax call.
                 *
                 * @param {o} textfield simple object.             
                 * 
                 * @param {txt} search text, passed from search control.
                 * 
                 * @returns .
                 */
                loadTemplate: function (o, txt) {
                    var _this = this;
                    
                    this.app.showLoading("Loading Template...", this.dialog.getBody());
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=get&templateNumber=" + this.template_id;
                    this.getTemplateCall = jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            
                            var template_json = jQuery.parseJSON(xhr.responseText);
                            if (_this.app.checkError(template_json)) {
                                return false;
                            }

                           // _this.modal.find(".dialog-title").html(template_json.name).attr("data-original-title", "Click to rename").addClass("showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                            //_this.app.dialogArray[_this.app.dialogArray.length - 1].title = template_json.name;                            
                            if(template_json.isEasyEditorCompatible=="N"){                                     
                                _this.editorContent = _this.app.decodeHTML(template_json.htmlText, true);
                                _this.$(".tinymce-editor a").click();
                            }
                            else{
                                _this.loadEditor();
                                 _this.emailHTML = template_json.htmlText;
                                 _this.isloadMeeEditor = true;
                                 _this.app.showLoading(false, _this.dialog.getBody());
                            }
                            
                            if (_this.app.get("isMEETemplate")) {
                                _this.$("#bmseditor_template").val(_this.app.decodeHTML(template_json.htmlText, true));
                            }
                           
                        }
                    }).fail(function () {
                        console.log("error in loading template");
                    });
                },
                ReattachEvents: function () {
                     var dialogArrayLength = this.app.dialogArray.length;
                     this.dialog.$(".savebtn").click(_.bind(function (obj) {
                        this.sendEmail()
                    }, this));
                },
                closeDialog : function(){
                    var arraylength = this.app.dialogArray.length;
                    for(var i = 0; i < arraylength; i++) {
                        this.dialog.hide();
                    }
                },
                previewCallback: function(){
                   
                   
                 			
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-182;
                var dialog = this.app.showDialog({title:'Message Preview' ,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgpreview',
                                  bodyCss:{"min-height":dialog_height+"px"}
                });	
                this.app.showLoading("Loading Message HTML...",dialog.getBody());									
                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?msgId="+this.msgID+"&subNo="+this.subNum;

                require(["common/templatePreview"],_.bind(function(MessagePreview){

                var tmPr =  new MessagePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'T',tempNum:this.msgID}); // isText to Dynamic
                 dialog.getBody().append(tmPr.$el);
                 this.app.showLoading(false, tmPr.$el.parent());
                 tmPr.init();
                 var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                 tmPr.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                 dialog.$el.find('#dialog-title .preview').remove();
               },this));
                   
                }
    });   
});