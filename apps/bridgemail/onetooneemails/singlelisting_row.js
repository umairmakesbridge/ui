define(['text!onetooneemails/html/createmessage.html','jquery.highlight'],
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
               'click .copy-camp':'copyEmail',
               "click .preview-camp":'previewEmail',
               'click .oto-subject':'subjectClick',
               'click .metericon':'showProgressMeter',
               'click .contact-name':'singleContact',
               'click .show-detail':'openContact'
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
                                
				if(this.model.get('isOpen'))
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
            
            copyEmail: function()
			{
                            var camp_id = this.model.get('campNum.encode');
                            
                            var dialog_title = "Copy Campaign";
                            var dialog = this.app.showDialog({title:dialog_title,
                                              css:{"width":"600px","margin-left":"-300px"},
                                              bodyCss:{"min-height":"260px"},							   
                                              headerIcon : 'copycamp',
                                              buttons: {saveBtn:{text:'Create Campaign'} }                                                                           
                            });
                            this.app.showLoading("Loading...",dialog.getBody());
                            this.parent.total_fetch = 0;
                           require(["campaigns/copycampaign"],_.bind(function(copycampaignPage){                                     
                                             var mPage = new copycampaignPage({camp:this.parent,camp_id:camp_id,app:this.app,copycampsdialog:dialog});
                                             dialog.getBody().html(mPage.$el); 
                                             dialog.saveCallBack(_.bind(mPage.copyCampaign,mPage));
                            },this));
			},
                        previewEmail:function(){
                                var camp_id = this.model.get('campNum.encode');
                                var camp_obj = this.parent;
                                var isTextOnly = this.model.get('isTextOnly');
				//var appMsgs = this.app.messages[0];				
				var dialog_width = $(document.documentElement).width()-60;
				var dialog_height = $(document.documentElement).height()-182;
				var dialog = camp_obj.app.showDialog({title:'Campaign Preview of &quot;' + this.model.get('name') + '&quot;' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'dlgpreview',
						  bodyCss:{"min-height":dialog_height+"px"}
				});	
				this.app.showLoading("Loading Campaign HTML...",dialog.getBody());									
                                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                                require(["common/templatePreview"],_.bind(function(templatePreview){
                                var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:isTextOnly}); // isText to Dynamic
                                 dialog.getBody().html(tmPr.$el);
                                 tmPr.init();
                               },this));
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
                                    $(engview).css({'top': top, 'left': left, 'z-index': '100', 'min-height': '109px'});
                                    this.app.showLoading("Loading Engagment view...", engview);
                                    engview.click(function(event) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                    });
                                    require(["common/engagemeter"], _.bind(function(page) {
                                        var visitcontact = new page({parent: this, app: this.app,params:{isOpen : this.model.get('isOpen'),subNum:this.model.get('subNum'),clicked:this.model.get('clicked'),openDate:this.model.get('openDate')}});
                                        engview.html(visitcontact.$el);
                                    }, this));
            },
            openContact:function(){
                this.app.mainContainer.openSubscriber(this.subNum,this.sub_name);
            },
        });
});