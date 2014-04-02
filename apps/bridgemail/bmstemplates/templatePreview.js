define(['text!bmstemplates/html/templatePreview.html'],
function (template) {
     /////////////////////////////////////////////////////////////////////////////////////////////////////////
     //
     // Template Preview
     //
     /////////////////////////////////////////////////////////////////////////////////////////////////////////
      'use strict';
     return Backbone.View.extend({            
            /**
             * Attach events on elements in view.
            */     
            events: {				
                'click .sendcamp':'emailbtnToggle',  // Click event of Send email
                'click #send-template-preview':'sendTempPreview'
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){              
               this.template = _.template(template);
               /*this.offset = 0;
               this.totalcount = 0;
               this.searchValue = "";
               this.searchString = "";
               this.templates = null;               
               this.getTemplateCall = null;*/
               this.render();
            },
             /**
             * Initialize view .
            */
            render: function () {
               
               this.$el.html(this.template());
               this.app = this.options.app;           
               //this.page = this.options.page;
               //this.selectText  = this.options.selectAction?this.options.selectAction:'Select Template';
               //this.selectTextClass = this.options.selectTextClass?this.options.selectTextClass:'';
               /*if(this.options.hideCreateButton){
                   this.$(".iconpointy").hide();
               }*/
              
            },
             init:function(){                
               this.loadPrevTemplates();
               this.showFrame();
               //this.loadTemplates();
               //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            attachEvents:function(){
                /*Email Button toggle*/
                this.emailbtnToggle();
                
            },
            emailbtnToggle:function(){
                if(this.$('#prevtem-sendpreview').css('display')==='none'){
                    this.$('#prevtem-sendpreview').fadeIn('slow');
                }else{
                    this.$('#prevtem-sendpreview').fadeOut('slow');
                }
            },
            showFrame: function(){
               this.$('#email-template-iframe').attr('src',this.options.frameSrc).css('height',this.options.frameHeight-36);
            },
            loadPrevTemplates: function(){
                if(this.options.prevFlag==='T'){
                    this.$('.previewbtns').hide();
                }else if(this.options.prevFlag==='C'){
                    this.$('.previewbtns').show();
                }
            },
            sendTempPreview: function(){ // Template Preview Send
                var email = this.$('#prev-email').val();
                var validEmail = this.options.app.validateEmail(email);
                if(validEmail){
                    this.$('#prev-email').parent().removeClass('error');
                    this.$('#prev-email').parent().find('span').remove();
                    var bms_token =this.app.get('bms_token');
                    var tempNum = this.options.tempNum;
                    var URL = "https://test.bridgemailsystem.com/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK="+bms_token+"&type=email&templateNumber="+tempNum;
                    var post_val = this.$('#sendtemp-preview').serialize();
                    $.post(URL, post_val)
                        .done(_.bind(function(data) { 
                                    data = JSON.parse(data);
                                    if(data[0]=="success"){
                                        this.$('#prevtem-sendpreview').hide();
                                        this.$('#prev-email').val("");
                                        this.app.showMessge('Template Preview Sent Successfully');
                                    }
                                },this));
                }else{
                    this.$('#prev-email').parent().addClass('error');
                    this.$('#prev-email').parent().append('<span class="errortext"><i class="erroricon"></i><em>'+this.options.app.messages[0].CAMP_fromemail_format_error+'</em></span>');
                }
                
            }
       });
    
});

