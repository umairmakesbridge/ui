define(['text!onetooneemails/html/singlelisting_row.html','jquery.highlight','onetooneemails/singleemaillisting'],
function (template,highlighter,singleSubRowView) {
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
               "click .preview-camp":'previewEmail',
               'click .oto-subject':'subjectClick',
               'click .metericon-two':'showProgressMeter',
               'click .contact-name':'singleContact',
               'click .show-detail':'openContact',
               'click .sendmail' : 'sendEmail',
               'click .oto-single-contact-count': 'callSingleContactMessages'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.sub;
                    this.app = this.parent.app;
                    this.subNum = '';
                    this.tagTxt = '';
                    this.sub_name = '';
                    this.dialogView= '';
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
                    
          
                        subjectClick:function(obj){
                            this.parent.subjectlinkVal = true;
                            this.subjectTxt = $(obj.currentTarget).text();
                            this.app.initSearch(obj,this.parent.$el.find("#list-search"));
                        },
                        
                        singleContact : function(obj){
                                    obj.stopPropagation();
                                    obj.preventDefault();
                                    var vicon = $.getObj(obj, "i");
                                    var ele_offset = vicon.offset();
                                    var ele_width = vicon.width();
                                    var ele_height = vicon.height();
                                    var top = '';
                                    $('body').find('#contact-vcard').remove();
                                    var vcontact = $('<div id="contact-vcard" class="custom_popup activities_tbl contact_dd"></div>');
                                    $('body').append(vcontact);
                                    top = ele_offset.top + ele_height + 11;
                                    var left = ele_offset.left - 13;
                                    left = Math.round(left);
                                    $(vcontact).css({'top': top, 'left': left, 'z-index': '100', 'min-height': '170px'});
                                    this.app.showLoading("Loading Contact Details...", vcontact);
                                    vcontact.click(function(event) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                    });
                                    require(["common/vcontact"], _.bind(function(page) {
                                        var visitcontact = new page({parent: this, app: this.app, subNum: this.subNum});
                                        vcontact.html(visitcontact.$el);

                                        this.isVisitcontactClick = true;
                                    }, this));
                        },
                        showProgressMeter : function(obj){
                                    obj.stopPropagation();
                                    obj.preventDefault();
                                    var vicon = $.getObj(obj, "a");
                                    var ele_offset = vicon.offset();
                                    var ele_width = vicon.width();
                                    var ele_height = vicon.height();
                                    var top = '';
                                    $('body').find('#engagment-meter-view').remove();
                                    var engview = $('<div class="ocp_stats left-side engage-meter-wrap" id="engagment-meter-view" style="display:block;">');
                                    $('body').append(engview);
                                    top = ele_offset.top + ele_height + 5;
                                    var left = ele_offset.left;
                                    left = Math.round(left);
                                    $(engview).css({'top': top, 'left': left, 'z-index': '100', 'min-height': '109px','padding':'0'});
                                    this.app.showLoading("Loading Engagment view...", engview);
                                    engview.click(function(event) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                    });
                                    require(["common/engagemeter"], _.bind(function(page) {
                                        var visitcontact = new page({parent: this, app: this.app,meterClass:'meterdd-two',params:{isOpen : this.model.get('isOpen'),subNum:this.model.get('subNum'),clicked:this.model.get('clicked'),openDate:this.model.get('openDate')}});
                                        engview.html(visitcontact.$el);
                                    }, this));
            },
            openContact:function(){
                this.app.mainContainer.openSubscriber(this.subNum,this.sub_name);
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
                                     dialog.saveCallBack(_.bind(mPage.sendEmail,mPage));
                                    _this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                                    _this.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                                    _this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.sendEmail,mPage); // New Dialog
                                })
            },
            callSingleContactMessages : function(){
               			var email_obj = this.parent;					
                                var _this = this;
                                email_obj.type = 'getSubscriberMessageList';
                                email_obj.subNum = this.subNum;
                                
                                var dialog_width = $(document.documentElement).width()-60;
		 var dialog_height = $(document.documentElement).height()-182;
		 var dialog = email_obj.app.showDialog({title: this.sub_name ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'messageicon',
                                                  //buttons: {saveBtn:{text:'Send Message',btnicon:'next',btncolor:'btn-green'} },
						  bodyCss:{"min-height":dialog_height+"px"}
				});
                  email_obj.getSingleSubEmails('',this);
		  this.dialogView = dialog;
                               // console.log(email_obj.campaigns_request);
                              
            },
            showSingleContactMessages :  function(){
                 var email_obj = this.parent;
                 //console.log(email_obj.returnDataValue);
                 
                 var html = $('<div id="oto-single-wrapper"><div class="bmsgrid"><div class="hDiv"><div class="hDivBox campaings-hDiv"><table cellspacing="0" cellpadding="0"></table></div></div><div style="height: " class="bDiv"><table cellpadding="0" cellspacing="0" width="100%" id="camp_list_contactemail"><tbody></tbody></table><div style="display: none;" class="iDiv"></div></div></div></div>');
                  _.each(email_obj.returnDataValue.data.models, _.bind(function (model) {
                                html.find('#camp_list_contactemail').append(new singleSubRowView({model: model, sub: this }).el);
                            }, this));
                  var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                  this.dialogView.getBody().append(html);
                  this.app.showLoading(false, this.dialogView.getBody());
                  html.addClass('dialogWrap-'+dialogArrayLength); 
            },
            /*
             * Call to get click URL History 
             * 
             */
            getEmailSubDetail : function(obj){
                    var _this = this;
                    var email_obj = this.parent;
                    var bms_token = this.app.get('bms_token');
                     var getURLHistory = '';
                    //Load subscriber details, fields and tags
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialog = email_obj.app.showDialog({title: 'Clicks' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'preview3',
                                                  //buttons: {saveBtn:{text:'Send Message',btnicon:'next',btncolor:'btn-green'} },
						  bodyCss:{"min-height":dialog_height+"px"}
				});
                    this.app.showLoading("Loading Details...", dialog.getBody());
                    var URL = "/pms/io/subscriber/getSingleEmailData/?BMS_REQ_TK=" + bms_token + "&type=getMessageDetail&subNum=" + this.subNum + "&msgId="+this.model.get('msgId.encode');
                   
                    var QuestionsCollection = Backbone.Collection.extend({
                            url: function () {
                                return URL;
                            },
                            parse: function(response,sent) {
                                var result = [];
                                    _.each(response.urlHistoryList[0],function(val,key){
                                        val[0]['clicked_'] = parseInt(key.substring(10));
                                        result.push(val[0]);
                                    })                    
                                
                                return result;
                            }
                    });
                    var questions = new QuestionsCollection(getURLHistory);
                   var getResult = questions.fetch({success:function(data1, collection){
                           _this.genmeterUrl(dialog,data1, collection);
                          
                   }});
                 
             },
             genmeterUrl : function(dialog,data1, collection){
                   var _html = $('<div class="contacttitle"> <i class="icon contact left"></i> <a data-original-title="Click to view profile" class="contactnm showtooltip"><strong>'+this.sub_name+'</strong></a> <a class="statusdd color2 salestatus"></a> </div><div class=" shadow_panel clicks-listing"><div class=" stats_listing" id=""><div class="bmsgrid"><div style="height: ;" class="bDiv"><table cellspacing="0" cellpadding="0" border="0" id="oto_urlclicked_table"><tbody></tbody></table></div></div></div><div class="shadowbtm"></div></div>')
                  _.each(data1.models, _.bind(function (model) {
                               _html.find('table#oto_urlclicked_table tbody').append('<tr class="erow"><td width=""><div><div class="colico link"> <strong><span><em>Link URL</em><a target="_blank" href="'+model.get('url')+'" data-original-title="'+model.get('url')+'" class="showtooltip">'+model.get('url')+'</a></span></strong> </div></div></td></tr>');
                            }, this));
                    dialog.getBody().html(_html);        
             }
        });
});