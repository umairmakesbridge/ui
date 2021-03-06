define(['text!contacts/html/timeline_row.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Time line row view
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: "act_row",
                mapping: {
                    "SU": {"name": "Signed Up", "action": "Form", "cssClass": "form"}
                    , "SC": {"name": "Score Changed", "action": "Score", "cssClass": "score"}
                    , "A": {"name": "Alert", "action": "Autobot", "cssClass": "alert"}
                    , "W": {"name": "Workflow Wait", "action": "Workflow", "cssClass": "wait"}
                    , "CS": {"name": "Sent", "action": "Campaign", "cssClass": "sent"}
                    , "OP": {"name": "Opened", "action": "Campaign", "cssClass": "open"}
                    , "CK": {"name": "Clicked", "action": "Campaign", "cssClass": "click"}
                    , "WV": {"name": "Page Viewed", "action": "Web", "cssClass": "pageview"}
                    , "CT": {"name": "Converted", "action": "Campaign", "cssClass": "conversion"}
                    , "TF": {"name": "Tell a friend", "action": "Campaign", "cssClass": "tellfriend"}
                    , "UN": {"name": "Unsubscribed", "action": "Campaign", "cssClass": "unsubscribe"}
                    , "SP": {"name": "Suppressed", "action": "Campaign", "cssClass": "suppress"}
                    , "CB": {"name": "Bounced", "action": "Email", "cssClass": "bounce"}
                    , "MT": {"name": "Sent", "action": "Email", "cssClass": "sent"}
                    , "MC": {"name": "Clicked", "action": "Email", "cssClass": "click"}
                    , "MO": {"name": "Opened", "action": "Email", "cssClass": "open"}
                    , "MS": {"name": "Surpressed", "action": "Email", "cssClass": "suppress"}
                    , "WA": {"name": "Alert", "action": "Workflow", "cssClass": "alert"}
                    , "WM": {"name": "Workflow Trigger Mail", "action": "Workflow", "cssClass": "wtmail"}
                    , "MM": {"name": "Trigger Mail Sent", "action": "Workflow", "cssClass": "wtmail"}
                    , "N": {"name": "Workflow Do Nothing", "action": "Workflow", "cssClass": "alert"}

                },
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    "click .advance-filter":'openFilterDialog',
                    "click .this-event":'filterByEvent',
                    "click .preview-event":'previewCampaign',
                    "click .view-report":'viewReport',
                    "click .this-event-type":"fetchEventType",
                    "mouseover .filter":function(){this.$(".filter").addClass("active")},
                    "mouseout .filter":function(){this.$(".filter").removeClass("active")},
                    "click .this-event-campaign":'filterCampaign',
                    "click .all-timelineFilter":'fitlertimelineFilter',
                    "click .page-views":"loadPageViewsDialog"
                    
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub;
                    this.future = this.options.future;
                    this.app = this.sub.app;
                    this.render();
                    //this.model.on('change',this.renderRow,this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {
                    var dateTime = this.getActivityDate();
                    var _data = this.filterData();
                    var tType = this.getTriggerType();
                    var activitType = this.model.get("activityType");
                    this.$el.html(this.template({
                        date: dateTime.date,
                        time: dateTime.time,
                        name: _data.name,
                        summary: _data.summary,
                        tTypeName: tType.name,
                        tTypecss: tType.cssClass,
                        action: this.mapping[this.model.get("activityType")].name,
                        cssClass: this.mapping[this.model.get("activityType")].cssClass,
                        type: activitType,
                        model: this.model
                    }));

                    if (activitType == "A" || activitType == "WA" || activitType == "CT" || activitType == "UN" || activitType == "CB" || activitType == "SP") {
                        this.$el.addClass("red");
                    }
                    else if (activitType == "W") {
                        this.$el.addClass("yellow");
                    }
                    else if (activitType == "WM" || activitType == "CS" || activitType == "MT") {
                        this.$el.addClass("green");
                        if(activitType == "CS"){
                            this.$el.css("min-height","100px");
                        }
                    }
                    else if (activitType == "WV" || activitType == "OP" || activitType == "CK" || activitType == "SU" || activitType == "MC" || activitType == "MT") {
                        this.$el.addClass("blue");
                    }

                    this.initControls();
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {

                    //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});

                },
                getActivityDate: function () {
                    var _date = moment(this.app.decodeHTML(this.model.get("logTime")), 'M/D/YYYY h:m a');
                    return {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};

                },
                getLastExecutionDate: function () {
                    var _date = moment(this.app.decodeHTML(this.model.get("recur.lastExecDate")), 'M/D/YYYY h:m a');
                    return  _date.format("DD MMM YYYY") + " " + _date.format("hh:mm A");

                },
                filterData: function () {
                    var model = this.model;
                    var title = "";//model.get("name")?this.model.get("name"):this.mapping[this.model.get("activityType")].name;                                    
                    var summary = "";                    
                    title = this.mapping[model.get("activityType")].name;
                    var furtureText = this.future ? ('to be '+this.app.decodeHTML(title).toLowerCase()):this.app.decodeHTML(title);
                    return {name: furtureText, summary: this.app.decodeHTML(summary)};
                },
                getTriggerType: function () {
                    var triggerType = "";
                    var m = this.model;
                    var getTriggerType = m.get("campaignType");
                    if (getTriggerType) {
                        if (getTriggerType == "N") {
                            triggerType = {name: "Campaign", cssClass: "camp"};
                        }
                        else if (getTriggerType == "W" || typeof(m.get("workflowId.encode"))!=="undefined") {
                            triggerType = {name: "Workflow", cssClass: "wf"};
                        }
                        else if (getTriggerType == "A") {
                            triggerType = {name: "Autotrigger", cssClass: ""};
                        }
                        else if (getTriggerType == "T" || typeof(m.get("trackId.encode"))!=="undefined") {
                            triggerType = {name: "Nurture Track", cssClass: ""};
                        }
                        else if (getTriggerType == "B" || typeof(m.get("botId.encode"))!=="undefined" ) {
                            triggerType = {name: "Autobot", cssClass: ""};
                        }
                    } else if (typeof (m.get("singleMessageId.encode")) !== "undefined") {
                        triggerType = {name: "Single Message", cssClass: ""};
                    } else if (m.get("activityType") == "MM" || m.get("activityType") == "A") {
                        if(typeof(m.get("botId.encode"))!=="undefined"){
                            triggerType = {name: "Autobot", cssClass: ""};
                        }
                        else{
                            triggerType = {name: "Workflow", cssClass: "wf"};
                        }
                    }
                    else if(typeof(m.get("botId.encode"))!=="undefined"){
                        triggerType = {name: "Autobot", cssClass: ""};
                    }
                    

                    return triggerType;
                },
                getScore: function () {
                    var scoreHTML = "";
                    var score = this.model.get("score");                    
                    score = parseFloat(score);
                    if(score > 0) {
                        scoreHTML =  "+" +score;
                    } 
                    else{
                        scoreHTML = score;
                    }
                    
                    return scoreHTML;
                },
                openFilterDialog:function(){
                    this.sub.openFilterDialog();
                },
                filterByEvent:function(){
                    var model = this.model;
                    if(model.get('campaignType') && model.get('campaignType')=="N"){
                        this.sub.searchCampaign(model.get("campNum.encode"));
                    } else if(model.get('campaignType') && model.get('campaignType')=="W"){
                        this.sub.searchWorkflow(model.get("workflowId.encode"));
                    }else if( (model.get('campaignType') && model.get('campaignType')=="B") || typeof(model.get("botId.encode"))!=="undefined"){
                        this.sub.searchAutobot(model.get("botId.encode"));
                    }else if(model.get('campaignType') && model.get('campaignType')=="T"){
                        this.sub.searchNurturetrack(model.get("trackId.encode"));
                    }
                },
                filterCampaign:function(){
                     var model = this.model;
                    this.sub.searchMessage(model.get("campaignType"),model.get("campNum.encode"));
                },
                getMeter:function(){
                    var cssClass = "hide";
                    
                    if(this.model.get("isConversion")==="Y"){
                        cssClass="conversion";
                    }
                    else if(this.model.get("pageViewsCount")!=="0"){
                        cssClass="visit";
                    }
                     else if(this.model.get("isClick")=="Y"){
                        cssClass="click";
                    }else if(this.model.get("isOpen")=="Y"){
                        cssClass="open";
                    }
                    
                    return cssClass;
                },
                previewCampaign:function(){
                    var camp_id = this.model.get('campNum.encode');
                    if(camp_id){                            
                        var isTextOnly = this.model.get('isTextOnly');            
                        var title="";
                        if(this.model.get('workflowName')){
                            title=this.model.get('workflowName');
                        }
                        else if(this.model.get('campaignName')){
                            title=this.model.get('campaignName');
                        }
                        else if(this.model.get('trackName')){
                            title=this.model.get('trackName');
                        }
                        else if(this.model.get('botLabel')){
                            title=this.model.get('botLabel');
                        }
                        var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-182;
                        var dialog = this.app.showDialog({title:'Preview of &quot;' + title + '&quot;' ,
                                          css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                          headerEditable:false,
                                          headerIcon : 'dlgpreview',
                                          bodyCss:{"min-height":dialog_height+"px"}
                        });	
                        this.app.showLoading("Loading...",dialog.getBody());									
                        var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                        require(["common/templatePreview"],_.bind(function(templatePreview){
                        var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:isTextOnly}); // isText to Dynamic
                         dialog.getBody().html(tmPr.$el);
                         tmPr.init();
                       },this));
                   }
                },
                viewReport: function(){
                   var camp_id= this.model.get('campNum.encode');
                   this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('campNum.checksum'),tab_icon:'campaign-summary-icon'});
                },
                fetchEventType:function(){
                    this.sub.timelineFilter=null;
                    this.sub.searchAdvance("",this.model.get("activityType"));
                },
                fitlertimelineFilter:function(){                    
                    var m = this.model;
                    var getTriggerType = m.get("campaignType");
                    if(typeof(m.get("botId.encode"))!=="undefined"){
                        getTriggerType = "B"
                    }
                    if(getTriggerType){
                        this.sub.searchAdvance(getTriggerType,"");
                    }
                },
                loadPageViewsDialog: function (ev) {

                    var dialog_width = 80;
                    var encode = this.sub.sub.sub_id;                   
                    var url = "";
                    
                    var url = this.model.get('articleURL')?this.model.get('articleURL'):this.model.get('pageURL');
                    var title = this.model.get('articleTitle')?this.model.get('pageTitle'):this.model.get('pageURL');
                    url = title + '|-.-|' + url;
                    
                    
                    var dialog_height = $(document.documentElement).height() - 200;
                    var dialog = this.app.showDialog(
                        {
                            title: 'Page Views',
                            css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                            headerEditable: false,
                            headerIcon: 'preview3',
                            bodyCss: {"min-height": dialog_height + "px"}
                        });
                    this.app.showLoading('Loading Page Views....', dialog.getBody());
                    
                    var name = this.sub.sub.sub_name;
                    var salesStatus = this.sub.sub.sub_saleStatus;

                    require(["reports/summary/views/pageviews", ], _.bind(function (Views) {
                        var mPage = new Views({campNum: this.model.get('campNum.encode'), subNum: encode, encode: encode, app: this.app, email: name, salestatus: salesStatus, url: url});
                        dialog.getBody().html(mPage.$el);
                        this.app.showLoading(false, dialog.getBody());

                    },this));


                }
            });
        });