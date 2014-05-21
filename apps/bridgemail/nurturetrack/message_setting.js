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
                this.plainText = "";
                this.htmlText = "";                    
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
                this.$settingInner = this.$(".accordion_setting-inner"); 
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
            init:function(){
              
            },
           loadMessageHTML:function(){
               if(this.messagebody_page){
                   if(this.htmlText || this.plainText){
                    this.$("#accordion_messagebody").accordion( "option", "active", 0 );
                    this.messagebody_page.populateBody();
                   }
               }
               else{
                  setTimeout(_.bind(this.loadMessageHTML,this),200); 
               }
           }
          ,
           loadCallCampaign:function(){
              var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.camp_obj['campNum.encode']+"&type=basic";
              this.app.showLoading("Loading Campaign...",this.$el);
              jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                  this.app.showLoading(false,this.$el);  
                  var camp_json = jQuery.parseJSON(xhr.responseText);
                  this.camp_json = camp_json;
                  this.step1_page.loadCampaign(this.camp_json);
                  
              },this));    
             
           },
           loadStep1:function(){
                this.app.showLoading("Loading...",this.$settingInner);
                require(["campaigns/campaign_step1"],_.bind(function(page){    
                     this.app.showLoading(false,this.$settingInner);                    
                     this.step1_page = new page({page:this,camp_obj:this.camp_obj})                       
                     this.$settingInner.append(this.step1_page.$el);         
                     this.step1_page.init();
                 },this));
            },
            loadMessageBody:function(){
                this.app.showLoading("Loading...",this.$bodyInner);
                require(["campaigns/campaign_body"],_.bind(function(page){    
                     this.app.showLoading(false,this.$bodyInner);                    
                     this.messagebody_page = new page({page:this,scrollElement:this.dialog.$(".modal-body"),camp_obj:this.camp_obj})                       
                     this.$bodyInner.append(this.messagebody_page.$el);         
                     this.messagebody_page.init();
                 },this));
            },
            saveStep2:function(showLoading){                                                   
                 var html = "",plain="";                  
                 var post_data = {type: "saveStep2",campNum:this.camp_id}
                 var selected_li = this.$("#choose_soruce li.selected").attr("id");
                     if(selected_li=="html_editor"){
                        html= (this.messagebody_page.$(".textdiv").css("display")=="block")?this.messagebody_page.$("#htmlarea").val():tinyMCE.get('bmseditor_'+this.messagebody_page.wp_id).getContent();
                        plain = this.$("#bmstexteditor").val();
                        post_data['htmlCode'] = html; 
                        post_data['plainText'] = plain;                        
                     }else if(selected_li=="html_code"){
                        html = this.$("textarea#handcodedhtml").val();                     
                        post_data['htmlCode'] = html;                        
                     }else if(selected_li=="plain_text"){
                        plain = this.$("textarea#plain-text").val();      
                        post_data['plainText'] = plain;
                        post_data['isCampaignText'] = 'Y';                        
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
                            this.$(".save-step2").removeClass("saving");
                            if(step1_json[0]!=="err"){
                                this.app.showMessge("Message settings saved successfully!");
                                if(selected_li=="plain_text"){
                                    this.plainText = plain;                                    
                                    this.htmlText = "";
                                }
                                else{
                                    this.htmlText = html;
                                    this.plainText = plain;                                    
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
                }
            
            
        });
});