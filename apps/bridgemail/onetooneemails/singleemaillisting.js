define(['text!onetooneemails/html/singleemaillisting.html','jquery.highlight'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'campaign-box',
            tagName:'tr',
            
            /**
             * Attach events on elements in view.
            */
            events: {
              // 'click .copy-camp':'copyEmail',
               "click .preview-camp,.subject-name":'previewEmail',
               'click .sendmail' : 'sendEmail'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.sub;
                    this.app = this.parent.app;
                    this.DialogView = this.options.dialog;
                    this.subNum = '';
                    this.tagTxt = '';
                    this.sub_name = '';
                    this.render();
                    //this.model.on('change',this.renderRow,this);
            },
              /**
             * Render view on page.
            */
            render: function () {                    
                
               this.$el.html(this.template({
                    model: this.model
                }));
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.initControls();  
               
            },
            
            /*
             * 
             * @returns Time Show
             */
            getTimeShow :function(){
                                var datetime = '';
				var DtOpen = '';
                                var dateFormat = '';
                                var dateOpFormat = '';
                                datetime = this.model.get('sentDate');
                                
				if(this.model.get('isOpen')==='Y')
				{
					DtOpen = this.model.get('openDate');
                                        var dateOpen = moment(this.app.decodeHTML(DtOpen),'M/D/YYYY H:m a');														
					dateOpFormat = dateOpen.format("DD MMM, YYYY");
				}
                                
                             if(datetime)
				{
					var date = moment(this.app.decodeHTML(datetime),'M/D/YYYY H:m a');														
					dateFormat = date.format("DD MMM, YYYY");
                                        
				}
				else{
					dateFormat = '';					
                                     }
                       return {dtOpen:dateOpFormat,dateTime:dateFormat}
            },          
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                if(this.parent.searchTxt){
                    this.$(".oto-subject").highlight($.trim(this.parent.searchTxt));
                    this.$(".taglink").highlight($.trim(this.parent.searchTxt));
                }else{
                    this.$(".taglink").highlight($.trim(this.parent.tagTxt));
                }
                this.subNum = this.model.get('subNum');
              
            },
            
            
             previewEmail:function(){
                                //var msg_id = this.model.get('campNum.encode');
                                //var subNum = this.model.get('isTextOnly');
                                var email_obj = this.parent;
                               // var isTextOnly = this.model.get('isTextOnly');
				//var appMsgs = this.app.messages[0];
                                var isPreviewEmail = true; 
				var dialog_width = $(document.documentElement).width()-60;
				var dialog_height = $(document.documentElement).height()-182;
				var dialog = email_obj.app.showDialog({title:'Email Preview of subject &quot;' + this.model.get('subject') + '&quot;' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'dlgpreview',
						  bodyCss:{"min-height":dialog_height+"px"}
				});	
				this.app.showLoading("Loading Email HTML...",dialog.getBody());									
                                var _this = this;
                                require(["onetooneemails/createmessage"],function(createMessagePage){                                                     
                                   var mPage = new createMessagePage({page:_this,app:_this.app,scrollElement:dialog.getBody(),dialog:dialog,isPreviewEmail:isPreviewEmail,subNum:_this.model.get('subNum'),msg_id:_this.model.get('msgId.encode')});               
                                   var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                                   dialog.getBody().append(mPage.$el);
                                   mPage.$el.addClass('dialogWrap-'+dialogArrayLength); 
                                   _this.app.showLoading(false, mPage.$el.parent());                     
                                    mPage.init();
                                    mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                                    _this.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                                })
                    },
                     getFirstAlphabet : function(){

                            if(this.model.get('firstName')){
                                     this.sub_name = this.model.get('firstName');
                                 }else if(this.model.get('lastName')){
                                     this.sub_name = this.model.get('lastName');
                                 }else{
                                     this.sub_name = this.model.get('email');
                                 }
                                return this.sub_name.charAt(0);
                       },
                    
  
                       
            
            sendEmail : function(){
                //var msg_id = this.model.get('campNum.encode');
                                //var subNum = this.model.get('isTextOnly');
                                var email_obj = this.parent;
                               // var isTextOnly = this.model.get('isTextOnly');
				//var appMsgs = this.app.messages[0];
                                var isSendEmail = true; 
				var dialog_width = $(document.documentElement).width()-60;
				var dialog_height = $(document.documentElement).height()-182;
				var dialog = email_obj.app.showDialog({title:'New Message' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'messageicon',
                                                  buttons: {saveBtn:{text:'Send Message',btnicon:'next',btncolor:'btn-green'} },
						  bodyCss:{"min-height":dialog_height+"px"}
				});	
				this.app.showLoading("Loading Email HTML...",dialog.getBody());									
                                var _this = this;
                                require(["onetooneemails/createmessage"],function(createMessagePage){                                                     
                                   var mPage = new createMessagePage({page:_this,app:_this.app,scrollElement:dialog.getBody(),dialog:dialog,isSendEmail:isSendEmail,subNum:_this.model.get('subNum'),msg_id:_this.model.get('msgId.encode')});               
                                   var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                                   dialog.getBody().append(mPage.$el);
                                   mPage.$el.addClass('dialogWrap-'+dialogArrayLength); 
                                   _this.app.showLoading(false, mPage.$el.parent());                     
                                    mPage.init();
                                    mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                                   // dialog.saveCallBack(_.bind(mPage.sendEmail,mPage));
                                    dialog.saveCallBack(_.bind(mPage.sendEmail,mPage));
                                })
            }
        });
});