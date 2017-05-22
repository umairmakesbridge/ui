define(['text!workflow/html/workflows.html', 'jquery.searchcontrol','jquery.highlight'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {                    
                        "click .refresh_btn": function () {
                           this.showLoadingMask();
                           this.$('iframe').attr('src', this.$('iframe').attr('src'));
                        }
                },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template); 
                    this.camp_json = null;
                    this.render();
                },
                render: function ()
                {                     
                   this.$el.html(this.template({})); 
                   this.$el.find('div#workflowlistsearch').searchcontrol({
                        id: 'workflow-search',
                        width: '300px',
                        height: '22px',                        
                        searchFunc: _.bind(this.searchWorkflow, this),
                        clearFunc: _.bind(this.clearSearchWorkflow, this),
                        placeholder: 'Search workflow by name',
                        showicon: 'yes',
                        iconsource: 'workflow-sicon',
                        countcontainer: 'no_of_camps'
                  });
                  this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.showLoadingMask();
                    this.current_ws = this.$el.parents(".ws-content");                                        
                    this.ws_header = this.current_ws.find(".camp_header .edited"); 
                    this.current_ws.find("#campaign_tags").remove();
                                       
                    this.current_ws.find("#addnew_action").attr("data-original-title", "Create Workflow").click(_.bind(this.createWorkflowDialog, this));
                    this.$("div.create_new").click(_.bind(this.createWorkflowDialog, this));  
                    this.$(".workflowiframe").load(_.bind(function () {
                        this.app.showLoading(false,this.$el);
                        this.app.removeSpinner(this.$el); 
                        //this.$("#workflowlistsearch #clearsearch").click();
                        
                    },this))
                },
                resizeHeight:function(height){
                    this.$(".workflowiframe").css("height",height+"px");
                },
                searchWorkflow:function(o, txt){
                    var workflow_tr = this.$('.workflowiframe').contents().find("#mainWrapper tr.workflow-row");
                    var count= 0;
                    workflow_tr.hide();
                    workflow_tr.filter(function() {
                        if($(this).find(".sectionHeader a").text().toLowerCase().indexOf(txt) > -1)
                        {
                            count++;
                            return $(this);
                        }
                    }).show();	

                    workflow_tr.each(function(i) {                    
                        $(this).find(".sectionHeader a").removeHighlight().highlight(txt);
                    });
                    
                    this.$("#total_templates").html("<strong class='badge'>"+count+"</strong>Workflows found containing text '<b>"+txt+"</b>'");
                                        
                },
                clearSearchWorkflow:function(){
                    var workflow_tr = this.$('.workflowiframe').contents().find("#mainWrapper tr.workflow-row")
                    workflow_tr.show();                    
                    workflow_tr.find(".sectionHeader a").each(function(i) {                    
                        $(this).removeHighlight()
                    });
                    this.$("#total_templates").html("<strong class='badge'>"+workflow_tr.length+"</strong>Workflows");
                },
                headBadge: function ( count ) {                    
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");                                                         
                    
                    var header_title = active_ws.find(".camp_header .edited");
                    header_title.find('ul').remove();                        
                    var stats = '<ul class="c-current-status">';                                
                        stats += '<li class="showhand showtooltip" title="Click to view all workflows"><span class="badge pclr18 topbadges total_forms" tabindex="-1">'+count+'</span>Total Workflows</li>';                            
                    stats += '</ul>';
                    header_title.append(stats);
                    this.ws_header.find(".c-current-status li").click(_.bind(function(){
                           this.showLoadingMask();
                           this.$('iframe').attr('src', this.$('iframe').attr('src'));
                    }, this));
                    header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    
                    
                    this.$("#total_templates").html("<strong class='badge'>"+count+"</strong>Workflows");
                    
                },
                openWorkflow: function(url){
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Workflow Wizard',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgworkflow',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading workflow...", dialog.getBody());                    
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: url, app: this.app, frameHeight: dialog_height}); // isText to Dynamic
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                    
                    
                },
                createWorkflowDialog: function(){
                    this.showLoadingMask("Creating New Workflow...",true);                    
                    this.$(".workflowiframe").attr("src","/pms/trigger/workflow.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&fromNewUI=true");                    
                },
                showWorkflowWizard:function(){
                    this.$(".temp-filters,.create_new").hide();
                    this.current_ws.find(".c-current-status").hide();
                    this.current_ws.find(".add-action").attr("style","display:none !important");
                    this.current_ws.find("#workspace-header").addClass("single").html("Workflow Wizard");
                    
                },
                hideWorkflowWizard:function(){
                    this.$(".temp-filters,.create_new").show();
                    this.current_ws.find(".c-current-status").show();
                    this.current_ws.find(".add-action").attr("style","display:none");
                    this.current_ws.find("#workspace-header").removeClass("single").html("Workflows");
                },
                showLoadingMask:function(msg,reduceHeight){
                    if(reduceHeight){
                        this.$(".workflowiframe").attr("src","about:blank").css("height","400px");
                    }
                    this.app.showLoading(msg?msg:"Loading Workflows...",this.$el);    
                },
                copyWFDialog : function(id,title,isWfEdit){
                    var dialog_title = "Copy Workflow";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "260px"},
                        headerIcon: 'copycamp',
                        buttons: {saveBtn: {text: 'Copy Workflow'}}
                    });
                    
                    this.app.showLoading("Loading...", dialog.getBody());
                    
                    //require(["campaigns/copycampaign"], _.bind(function (copycampaignPage) {
                        var dialogHtml = '<div class="model_form" style="display: block;" id="">';
                            dialogHtml += '<div class="copy_campbox">'
                            dialogHtml += '<div class="">'
                            dialogHtml += '<h2><span>'+title+'</span> </h2>'
                            dialogHtml += '<div class="tagscont">'
                            dialogHtml += '</div></div>'
                            dialogHtml += '<div class="img"><img alt="" data-src="holder.js" src="img/copycampaign.png" width="160" height="150"></div></div>';
                            dialogHtml += '<div class="row-fluid">'
                            dialogHtml += '<div class="span12">'
                            dialogHtml += '<div class="row campname-container">'
                            dialogHtml += '<label>New Workflow Name</label>'
                            dialogHtml += '<div class="input-append adv_dd sort-options">'
                            dialogHtml += '<div class="inputcont">'
                            dialogHtml += '<input id="camp_name" type="text" placeholder="Enter workflow name here" class="header-info textfield">'
                            dialogHtml += '</div></div></div></div></div><div class="clearfix"></div></div>';
                          
                        dialog.getBody().html(dialogHtml);
                        dialog.getBody().find('#camp_name').focus();
                        dialog.getBody().find("input#camp_name").keypress(_.bind(function (e) {
                                            if (e.keyCode == 13) {
                                                this.copyWorkFlow(id,dialog,isWfEdit);
                                            }
                                        },this))
                         
                        dialog.saveCallBack(_.bind(this.copyWorkFlow, this,id,dialog,isWfEdit));
                },
                copyWorkFlow : function(id,dialogObj,isWfEdit){
                    
                   var wf_name = dialogObj.getBody().find('#camp_name').val();
                   var _this = this;
                    if( wf_name == ''){						
                                this.app.showError({
                                        control:dialogObj.getBody().find('.campname-container'),
                                        message:"Workflow name cannot be empty"
                                });
                        }
                        else{
                             
                             var admin = false;
                             if(_this.app.get("user").accountType == "S"){
                                 admin = true
                             }
                            _this.app.showLoading("Copying Workflow...",dialogObj.getBody()); 
                            $.post( "/pms/input/workflow/saveWorkflowData.jsp?BMS_REQ_TK="+this.app.get('bms_token'), { 
                                    actionType: "copy", 
                                    workflowId: id,
                                    name: wf_name,
                                    admin : admin // Need to ask about this flag
                                })
                                .done(function( data ) {
                                  //alert( "Data Loaded: " + data ); // Server not responding anything thought it creates the workflow
                                 if(data[0]=="err"){
                                     _this.app.showAlert(data[1], $("body"), {fixed: true});
                                 }else{
                                        if(isWfEdit){
                                          _this.$el.find('iframe').attr('src','/pms/trigger/workflow.jsp?BMS_REQ_TK='+_this.app.get('bms_token')+'&fromNewUI=true&workflowId='+data[1]);
                                       }else{
                                           _this.$el.find('.refresh_btn').trigger('click');

                                       }
                                        dialogObj.$el.find('.btn-close').trigger('click');
                                 }
                                    
                                  _this.app.showLoading(false,dialogObj.getBody());
                                  
                                  
                                });
                        }
                    
                    
                },
                editMessage: function(params) {                                        
                    var isEdit = typeof(params.isEditable)!=="undefined"? params.isEditable: true;                    
                    var dialog_width = $(document.documentElement).width() - 50;
                    var dialog_height = $(document.documentElement).height() - 162;
                    var stepNum = "",optionNum = "";
                    if(params.optionID){
                        var messageDetail = params.optionID.split(".");
                        stepNum = "Step "+messageDetail[0];
                        optionNum = " Option "+messageDetail[1];
                    }
                    if(params.campNum){
                        this.campNum = params.campNum;
                    }
                    else{
                        this.camp_json = null;
                    }
                    var dialog_object = {title: "Message For "+stepNum+optionNum,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        bodyCss: {"min-height": dialog_height + "px"}
                    };

                    if(isEdit){
                        dialog_object["buttons"]=  {saveBtn:{text:'Save Message'} }
                    }

                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Settings...", dialog.getBody());                    
                    require(["nurturetrack/message_setting"], _.bind(function(settingPage) {
                        var sPage = new settingPage({page: this, dialog: dialog, editable: isEdit, type: "workflow", campNum: params.campNum, workflowObj:params});
                        this.sPage = sPage;
                        dialog.getBody().append(sPage.$el);
                        this.app.showLoading(false, sPage.$el.parent());
                        dialog.saveCallBack(_.bind(sPage.saveCall, sPage));     
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        sPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                        this.app.dialogArray[dialogArrayLength-1].currentView = sPage; // New dialog
                        this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(sPage.saveCall,sPage); // New Dialog
                        sPage.init();                        
                    }, this));
                    

                }, loadCampaign: function() {
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.campNum + "&type=basic";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        var camp_json = jQuery.parseJSON(xhr.responseText);
                        this.camp_json = camp_json;   
                        this.sPage.camp_json = camp_json;
                    }, this));
                },
                previewMessage:function(camp_id){                    
                    if(!camp_id){return false}
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialog = this.app.showDialog({title:'Message Preview' ,
                                      css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                      headerEditable:false,
                                      headerIcon : 'dlgpreview',
                                      bodyCss:{"min-height":dialog_height+"px"}
                    });	
                    this.app.showLoading("Loading Message HTML...",dialog.getBody());									
                    var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                    require(["common/templatePreview"],_.bind(function(MessagePreview){

                    var tmPr =  new MessagePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:'',loadCampaignData:true}); // isText to Dynamic
                     dialog.getBody().append(tmPr.$el);
                     this.app.showLoading(false, tmPr.$el.parent());
                     tmPr.init();
                                          
                   },this));
                }
                

            });
        });
