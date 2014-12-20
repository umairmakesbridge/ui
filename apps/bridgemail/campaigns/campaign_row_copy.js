define(['text!campaigns/html/campaign_row_copy.html','jquery.highlight'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'copy-campaign-box',
            tagName:'tr',
            
            /**
             * Attach events on elements in view.
            */
            events: {
               'click .copy-camp':'copyCampaign',
               'click  a.campname-copy':'previewCampaign',
               "click .preview-camp-copy":'previewCampaign',
               'click .taglink':'tagClick',
               'click .delete-camp-copy':'deleteCampaginDialoge',
               'click .report':'reportShow'
               
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.sub = this.options.sub; // Campaign View
                    this.app = this.sub.app; 
                    this.parent = this.options.parent;
                    this.editable=this.options.editable;
                    this.tagTxt = '';
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
             * @returns Campaign Status
             */
            getCampStatus:function(){
                
                var value = this.app.getCampStatus(this.model.get('status'));
                var tooltipMsg = '';
                if(this.model.get('status') == 'D' || this.model.get('status') == 'S')
				{
					tooltipMsg = "Click to edit";
				}
				else 
				{
					tooltipMsg = "Click to preview";
				}
                  return {status:value,tooltip:tooltipMsg}
            },
            /*
             * 
             * @returns Time Show
             */
            getTimeShow :function(){
                                var datetime = '';
				var dtHead = '';
                                var dateFormat = '';
				if(this.model.get('status') != 'D')
				{
					dtHead = 'Schedule Date';
					datetime = this.model.get('scheduledDate');
				}
                                else {
                                    dtHead = 'Updation Date';
                                    if(this.model.get('updationDate'))
                                            datetime = this.model.get('updationDate');
                                    else
                                            datetime = this.model.get('creationDate');
                                }
                             if(datetime)
				{
					var date = moment(this.app.decodeHTML(datetime),'YYYY-M-D H:m');														
					dateFormat = date.format("DD MMM, YYYY");
                                        if(this.model.get('status') == 'S' || this.model.get('status') =='P'){
                                            dateFormat = date.format("DD MMM, YYYY<br/>hh:mm A");
                                        }
				}
				else{
					dateFormat = '03 Sep, 2013';					
                                     }
                       return {dtHead:dtHead,dateTime:dateFormat}
            },          
            /**
             * Draw Buttons 
            */
            drawButtons:function(){  
                                var btns = '';
                            	
				btns += '<a class="btn-red"><i class="icon delete"></i></a>';
				btns += '<a  class="btn-green btn-copy"><span>Copy</span><i class="icon copy"></i></a>';
				btns += '<a class="btn-blue btn-preview"><span>Preview</span><i class="icon preview3"></i></a>';
				return btns;
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                if(this.parent.searchTxt){
                    this.$(".show-detail").highlight($.trim(this.parent.searchTxt));
                    this.$(".taglink").highlight($.trim(this.parent.searchTxt));
                }else{
                    this.$(".taglink").highlight($.trim(this.parent.tagTxt));
                }    
            },
             previewCampaign:function(){
                                var camp_id = this.model.get('campNum.encode');
                                var camp_obj = this.parent;
				//var appMsgs = this.app.messages[0];				
				var dialog_width = $(document.documentElement).width()-60;
				var dialog_height = $(document.documentElement).height()-182;
				var dialog = this.app.showDialog({title:'Campaign Preview of &quot;' + this.model.get('name') + '&quot;' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'dlgpreview',
						  bodyCss:{"min-height":dialog_height+"px"}
				});	
				this.app.showLoading("Loading Campaign HTML...",dialog.getBody());									
                                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                                require(["common/templatePreview"],_.bind(function(templatePreview){
                                var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:'N'}); // isText to Dynamic
                                 dialog.getBody().append(tmPr.$el);
                                 this.app.showLoading(false, tmPr.$el.parent());
                                 dialog.$el.find('#dialog-title .preview').remove();
                                 var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                                 tmPr.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog

                                 tmPr.init();
                               },this));
                    },
            copyCampaign: function()
			{
                          
                    this.sub.setEditor();
                    //var target = $.getObj(obj,"div");
                    var camp_id = this.model.get('campNum.encode');
                    var bms_token =this.app.get('bms_token');
                    this.sub.states.editor_change = true;
                    this.app.showLoading('Loading HTML...',this.sub.$el);
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+bms_token+"&campNum="+camp_id+"&type=basic";                    
                    jQuery.getJSON(URL,_.bind(function(tsv, state, xhr){
                       var callBack = this.sub.setEditorHTML(tsv, state,xhr);
                    },this));
                    this.sub.$("#html_editor").click();
               
            },
            getFlagClass:function(){
                var flag_class = '';
                var chartIcon = '';
                
				if(this.model.get('status') == 'D')
					flag_class = 'pclr1';
				else if(this.model.get('status') == 'P')
					flag_class = 'pclr6';
				else if(this.model.get('status') == 'S')
					flag_class = 'pclr2';
				else if(this.model.get('status') == 'C')
					flag_class = 'pclr18';
                                else
                                        flag_class = 'pclr1';
                                    if(this.model.get('status') == 'P' || this.model.get('status') == 'C')
				{
					chartIcon = '<div class="campaign_stats showtooltip" title="Click to View Chart"><a class="icon report"></a></div>';
				}
				
                 return {flag_class:flag_class,chartIcon:chartIcon};
                 
            },

                        tagClick:function(obj){
                            this.parent.taglinkVal = true;
                            //this.tagTxt = obj.currentTarget.text;
                            this.app.initSearch(obj,this.parent.$el.find("#copy-camp-search"));
                        },
                        reportShow:function(){
                                        var camp_id=this.model.get('campNum.encode');
                                        this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+camp_id,tab_icon:'campaign-summary-icon'});
                        },
                        deleteCampaginDialoge:function(){
                                var camp_obj = this.sub;
                                var appMsgs = camp_obj.app.messages[0];
                                var camp_id = this.model.get('campNum.encode')
                                if(camp_id){
                                        this.app.showAlertDetail({heading:'Confirm Deletion',
                                        detail:appMsgs.CAMPS_delete_confirm_error,                                                
                                        callback: _.bind(function(){
                                                camp_obj.$el.parents(".ws-content.active").find(".overlay").remove();
                                                this.deleteCampaign();
                                        },this)},
                                        camp_obj.$el.parents(".ws-content.active"));
                                            /*$(".overlay .btn-ok").click(function(){
                                                    $(".overlay").remove();
                                               camp_obj.deleteCampaign(target.attr("id"));
                                            });*/
                                }
            },
            deleteCampaign: function()
			{
                            var camp_obj = this.sub;
                            
                            var appMsgs = this.app.messages[0];
                            var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                            camp_obj.app.showLoading("Deleting Campaign...",camp_obj.$el.parents(".ws-content.active"),{fixed:'fixed'});
                            $.post(URL, {type:'delete',campNum:this.model.get('campNum.encode')})
                            .done(_.bind(function(data) {   
                                this.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));	
                                var del_camp_json = jQuery.parseJSON(data);  
                                /*if(camp_obj.app.checkError(del_camp_json)){
                                               return false;
                                }*/
                                if(del_camp_json[0]!=="err"){
                                        this.app.showMessge(appMsgs.CAMPS_delete_success_msg);
                                        //camp_obj.$el.find("#area_copy_campaign .bmsgrid").remove();
                                        this.app.removeCache("campaigns");
                                        camp_obj.total_fetch = 0;
                                        //camp_obj.$el.find('.step2 .refresh_btn').click();
                                        this.$el.fadeOut(_.bind(function(){
                                            this.$el.remove();
                                         },this));
                                         if($("#wstabs li[workspace_id=campaign_"+this.model.get('campNum.encode')+"]").length){
                                            var wp_id = $("#wstabs li[workspace_id=campaign_"+this.model.get('campNum.encode')+"]").attr('id').split("_")[2];
                                            $("#wp_li_"+wp_id+",#workspace_"+wp_id).remove();
                                       }
                                }
                                else{
                                             camp_obj.app.showAlert(del_camp_json[1],camp_obj.$el.parents(".ws-content.active"));							
                                }
                              				   
                            },this));
			},
            
        });
});