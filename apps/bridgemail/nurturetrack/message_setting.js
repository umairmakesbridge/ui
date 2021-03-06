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
            initialize: function () 
            {
                this.template = _.template(template);				
                this.parent = this.options.page;    
                this.dialog = this.options.dialog;
                this.camp_obj = this.parent.object ? this.parent.object[0]:null;
                this.camp_json = this.parent.camp_json;
                this.editable=this.options.editable;
                this.triggerOrder = this.options.triggerOrder;
                this.plainText = "";
                this.htmlText = "";   
                this.type = this.options.type;
                if(this.options.type == "autobots") {this.ABtype = true;}
                this.isCreateCamp = (this.options.isCreateNT) ? this.options.isCreateNT : '';
                if(this.options.type !="undefined" && this.options.type == "autobots")
                     this.camp_id = this.options.campNum;     
                 else if(this.options.type !="undefined" && this.options.type == "workflow"){
                     this.camp_id = this.options.campNum;     
                 }
                 else {
                     this.camp_id = this.camp_obj['campNum.encode'];     
                 }
                this.app = this.parent.app;       
                this.isSaveCallFromMee = false;
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
                this.$settingInner = this.$(".accordion_setting-inner"); 
                if($('body').find('#menu_bmseditor_NT_MESSAGE_bmseditor_NT_MESSAGE_fontsizeselect_menu').length > 0){
                        $('body').find('#menu_bmseditor_NT_MESSAGE_bmseditor_NT_MESSAGE_fontsizeselect_menu').remove();
                    }
                    if($('body').find('#menu_bmseditor_NT_MESSAGE_bmseditor_NT_MESSAGE_fontselect_menu').length > 0){
                        $('body').find('#menu_bmseditor_NT_MESSAGE_bmseditor_NT_MESSAGE_fontselect_menu').remove();
                    }
                    if($('body').find('#menu_bmseditor_NT_MESSAGE_bmseditor_NT_MESSAGE_formatselect_menu').length > 0){
                        $('body').find('#menu_bmseditor_NT_MESSAGE_bmseditor_NT_MESSAGE_formatselect_menu').remove();
                    }
                
                this.initControls();
                this.loadStep1();
                this.loadMessageBody();                
            }
            ,
            initControls:function(){
                var that = this;
                
                this.$("#accordion_setting").accordion({heightStyle: "fill",collapsible: true,active:1,activate: function( event, ui ) {
                        that.resizeStep1();
                }});                    
                this.$("#accordion_messagebody").accordion({heightStyle: "fill",collapsible: true});
                
                this.$bodyInner.css({"height":"auto","overflow":"inherit"});
                this.$settingInner.css({"height":"auto","overflow":"inherit"});
                                
                
            },
            previewCampaign:function(){
                var camp_id = this.camp_id;                                	
                if(!camp_id){return false}
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-146;
                var dialog = this.app.showDialog({title:'Message Preview' ,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgpreview',
                                  bodyCss:{"min-height":dialog_height+"px"}
                });	
                this.app.showLoading("Loading Message HTML...",dialog.getBody());									
                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                require(["common/templatePreview"],_.bind(function(MessagePreview){
                    
                var tmPr =  new MessagePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:this.camp_json.isTextOnly}); // isText to Dynamic
                 dialog.getBody().append(tmPr.$el);
                 this.app.showLoading(false, tmPr.$el.parent());
                 tmPr.init();
                 var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                 tmPr.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                 dialog.$el.find('#dialog-title .preview').remove();
               },this));
            },
            init:function(){
              this.modal = this.$el.parents(".modal");
              this.head_action_bar = this.modal.find(".modal-header .edited  h2");
              var previewIconMessage = $('<a class="icon preview showtooltip" title="Preview Message"></a>').tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
              this.head_action_bar.append(previewIconMessage);
              previewIconMessage.click(_.bind(this.previewCampaign,this));  
            },
           loadMessageHTML:function(){
               if(this.messagebody_page){                   
                    this.$("#accordion_messagebody").accordion( "option", "active", 0 );
                    this.messagebody_page.populateBody();                   
               }
               else{
                  setTimeout(_.bind(this.loadMessageHTML,this),200); 
               }
           }
          ,
           loadCallCampaign:function(){
              if(this.camp_id) {
                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.camp_id+"&type=basic";
                this.app.showLoading("Loading Campaign...",this.$el);
                jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                    this.app.showLoading(false,this.$el);  
                    var camp_json = jQuery.parseJSON(xhr.responseText);
                    this.camp_json = camp_json;                  
                    if(this.messagebody_page){
                        this.messagebody_page.campobjData = camp_json;
                    }
                    this.step1_page.loadCampaign(this.camp_json);                  

                },this));    
              }
              else{
                  this.step1_page.initCheckbox();
                  this.loadMessageHTML();                  
              }
             
           },
           loadStep1:function(){
                this.app.showLoading("Loading...",this.$settingInner);                
                require(["campaigns/campaign_step1"],_.bind(function(page){    
                     this.app.showLoading(false,this.$settingInner);                    
                     this.step1_page = new page({page:this,camp_obj:this.camp_obj,editable:this.editable,isCreateCamp:this.isCreateCamp})                       
                     this.$settingInner.append(this.step1_page.$el);         
                     this.step1_page.init();                     
                     this.validateStep1();
                 },this));
            },
            validateStep1:function(){
                if(this.camp_id) {
                    if(!this.step1_page.isDataLoaded){
                        setTimeout(_.bind(this.validateStep1,this),300)
                    }
                    else{
                        var isStep1Valid = this.step1_page.saveStep1(true);
                        if(isStep1Valid===false){
                            this.$("#accordion_setting").accordion( "option", "active", 0);
                        }

                    }
                }
                else{
                    this.$("#accordion_setting").accordion( "option", "active", 0);
                }
            },
            loadMessageBody:function(){
                this.app.showLoading("Loading...",this.$bodyInner);
                if(this.editable){
                    require(["campaigns/campaign_body"],_.bind(function(page){    
                         this.app.showLoading(false,this.$bodyInner);                    
                         this.messagebody_page = new page({page:this,ABtype:this.ABtype ,scrollElement:this.dialog.$(".modal-body"),camp_obj:this.camp_obj,editable:this.editable})                       
                         this.$bodyInner.append(this.messagebody_page.$el); 
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         this.messagebody_page.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                         this.app.dialogArray[dialogArrayLength-1].currentView = this.messagebody_page; // New Dialog
                         this.messagebody_page.init();
                     },this));
                 }
                 else{
                     var camp_id = this.camp_id;                
                     var dialog_height = $(document.documentElement).height()-146;
                     var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                        require(["common/templatePreview"],_.bind(function(MessagePreview){
                        var tmPr =  new MessagePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:'N'}); // isText to Dynamic
                        this.$bodyInner.append(tmPr.$el);
                        tmPr.$("#temp-camp-previewbar").hide();
                        tmPr.init();
                   },this));
                 }
            },
            saveStep2:function(showLoading,htmlText){       
                 if(!this.camp_id){return false}
                 this.saveEditorType();
                 var html = "",plain="";                  
                 var post_data = {type: "saveStep2",campNum:this.camp_id};                 
                 var campaign_subject_title = $.trim(this.$("#campaign_subject").val());
                 var selected_li = this.$("#choose_soruce li.selected").attr("id");
                    post_data['isCampaignText'] = 'N';                        
                     if(selected_li=="html_editor"){
                        html= (this.messagebody_page.$(".textdiv").css("display")=="block")?this.messagebody_page.$("#htmlarea").val():_tinyMCE.get('bmseditor_'+this.messagebody_page.wp_id).getContent();
                        //setting email title;                        
                        if(campaign_subject_title!==""){                            
                            var newTitle = '<title>'+campaign_subject_title+'</title>';
                            if(html.indexOf('<meta property="og:image"')==-1){
                                newTitle = newTitle + '<meta content="'+campaign_subject_title+'" itemprop="title name" property="og:title" name="twitter:title">';
                            }
                            html = html.replace(/<title>(.*?)<\/title>/ig, newTitle);
                        }
                        plain = this.$("#bmstexteditor").val();
                        post_data['htmlCode'] = html; 
                        post_data['plainText'] = plain;                        
                     }else if(selected_li=="html_code"){
                        html = this.$("textarea#handcodedhtml").val();                     
                        post_data['htmlCode'] = html;                        
                     }else if(selected_li=="plain_text"){
                        plain = this.$("textarea#plain-text").val();      
                        post_data['plainText'] = plain;
                        this.camp_json['isTextOnly'] = 'Y';
                        post_data['isCampaignText'] = 'Y';                        
                        post_data['htmlCode'] = '';
                        
                     }else if(selected_li=="html_editor_mee"){
                         if(campaign_subject_title!==""){
                            var newTitle = '<title>'+campaign_subject_title+'</title>';
                            var meeElement = this.$("#mee-iframe").contents();
                            if(meeElement.find("head title").length==1){
                                meeElement.find("head title").html(campaign_subject_title);
                            }
                            else{
                                 meeElement.find("head").append(newTitle);
                            }
                            meeElement.find("head meta[property='og:title']").attr("content",campaign_subject_title);
                        }
                         html =this.$("#mee_editor").getMEEHTML?this.$("#mee_editor").getMEEHTML():"";
                         post_data['htmlCode'] = html;       
                         post_data['plainText'] = this.plainText;
                         plain = this.plainText;
                         
                     }  
                     if(typeof(htmlText)!=="undefined"){
                         post_data['htmlCode'] = "";
                     }
                        
                 if(this.messagebody_page.states.editor_change ===true || typeof(showLoading)!=="undefined"){
                   if(typeof(showLoading)=="undefined"){  
                    this.app.showLoading("Saving settings...",this.dialog.$el); 
                   }
                   var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                   $.post(URL,post_data )
                        .done(_.bind(function(data) {                                 
                            var step1_json = jQuery.parseJSON(data);
                            this.app.showLoading(false,this.dialog.$el);
                            this.$(".save-step2").removeClass("disabled-btn");
                            this.$(".save-step2,.MenuCallBackSave a").removeClass("saving savingbg");
                            this.$(".save-step2").css('width','auto');
                            if(step1_json[0]!=="err"){
                                
                                if(this.messagebody_page.meeView && !this.messagebody_page.meeView.autoSaveFlag && !this.isSaveCallFromMee){
                                        this.app.showMessge("Message settings saved successfully!");
                                        }else if(!this.messagebody_page.meeView && !this.isSaveCallFromMee){
                                             this.app.showMessge("Message settings saved successfully!");
                                        }
                                        if(this.messagebody_page.meeView){
                                            this.$("#mee_editor").saveDCfromCamp();
                                            this.messagebody_page.meeView._$el.find('.lastSaveInfo').html('<i class="icon time"></i>Last Saved: '+moment().format('h:mm:ss a'));
                                            this.messagebody_page.meeView.autoSaveFlag = false;
                                        }
                                        
                                
                                if(selected_li=="plain_text"){
                                    this.plainText = plain;                                    
                                    this.htmlText = "";
                                    this.camp_json.isTextOnly = 'Y';
                                }
                                else{
                                    if(typeof(htmlText) =="undefined"){
                                        this.htmlText = html;
                                    }
                                    this.plainText = plain;                                    
                                    this.camp_json.isTextOnly = 'N';
                                }
                                this.messagebody_page.states.editor_change = false;
                                
                            }
                            else{
                               this.app.showAlert(step1_json[1],this.$el); 
                            }
                   },this));
                   
                 }  
                
                },
                saveCall:function(){
                    this.step1_page.saveStep1();
                },
                resizeStep1:function(){
                    this.step1_page.setFromNameField();
                    this.step1_page.$("#conversion_filter_accordion .accordion-inner").css("height","auto");
                },
                ReattachEvents: function(){
                    this.dialog.$el.find("#dialog-title i").hide();
                    this.dialog.$el.find("#dialog-title .preview").remove();
                    var previewIconMessage = $('<a class="icon preview showtooltip" title="Preview Message"></a>').tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.head_action_bar.append(previewIconMessage);
                    previewIconMessage.click(_.bind(this.previewCampaign,this)); 
                    if(this.options.type == "autobots"){
                         this.dialog.$el.find('.modal-header .cstatus').remove();
                        // this.dialog.$el.find("#dialog-title i").removeClass('dlgpreview').addClass('bot').show();
                    }
                },
                saveEditorType:function(){
                    if(typeof(this.editorType)=="undefined"){
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                        this.editorType = this.messagebody_page.campobjData.editorType;
                        var post_editor = {editorType:this.editorType,type:"editorType",campNum:this.camp_id};                                                                 
                        $.post(URL,post_editor)
                         .done(function(data) {
                         });                
                    }  
                }
            
            
        });
});