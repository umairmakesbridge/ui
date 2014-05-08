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
                
                this.$(".accordion_login-inner").css({"min-height":"201px","position":"relative","overflow":"inherit"});
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
           setFromNameField:function(){
               var active_workspace = this.$el;
                var subj_w = this.$('#campaign_subject').width(); // Abdullah Check
                active_workspace.find('#campaign_from_email_chosen').css({"width":parseInt(subj_w+21)+"px","padding-right":"61px"});   // Abdullah Try
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
                    var messagebody_page = new page({page:this})                       
                    this.$bodyInner.append(messagebody_page.$el);         
                    messagebody_page.init();
                },this));
           }
            
            
        });
});