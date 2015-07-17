define(['text!reports/html/report_row.html','jquery.searchcontrol','daterangepicker','jquery.icheck'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'act_row',                
                events: {                    
                   'click .delete':'removeReport',                   
                   'click .add-msg-report':'openSelectionDialog',
                   'click .edit':'openSelectionDialog',
                   "keyup #daterange":'showDatePicker',
                   "click #clearcal":'hideDatePicker',
                  "click .calendericon":'showDatePickerFromClick'
                },
                initialize: function () {
                    this.mapping = {campaigns:{label:'Campaigns',colorClass:'darkblue',iconClass:'open'},
                                    landingpages:{label:'Landing Pages',colorClass:'yellow',iconClass:'form2'},
                                    nurturetracks:{label:'Nurture Tracks',colorClass:'blue',iconClass:'track'},
                                    autobots:{label:'Autobots',colorClass:'grey',iconClass:'autobot'},
                                    tags:{label:'Tags',colorClass:'green',iconClass:'tags'},
                                    webforms:{label:'Signup Forms',colorClass:'',iconClass:'form'},
                                    targets:{label:'Targets',colorClass:'red',iconClass:'target'}
                                };
                    this.sub = this.options.sub;            
                    this.app = this.sub.app;   
                    this.objects = this.options.objects? this.options.objects:[];
                    this.modelArray = [];           
                    this.fromDate =null;
                    this.toDate =null;
                    this.reportType = this.options.reportType;
                    this.template = _.template(template);                                        
                    this.render();
                },
                render: function ()
                {                     
                    
                  var mapObj = this.mapping[this.reportType];  
                  this.$el.html(this.template({
                      rType: mapObj.label,
                      rIcon: mapObj.iconClass
                  }));  
                  this.$el.addClass(mapObj.colorClass);
                                  
                this.current_ws = this.$el.parents(".ws-content");                
                this.$('.listsearch').searchcontrol({
                        id:'list-search',
                        width:'300px',
                        height:'22px',                        
                        placeholder: 'Search '+mapObj.label,                        
                        showicon: 'yes',
                        iconsource: 'campaigns'
                 });	                 
                 this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                 
                 this.dateRangeControl = this.$('#daterange').daterangepicker();                
                 this.dateRangeControl.panel.find(".btnDone").click(_.bind(this.setDateRange,this));
                 this.dateRangeControl.panel.find("ul.ui-widget-content li").click(_.bind(this.setDateRangeLi,this));
                 this.loadRows();
                 
                },/*---------- Calender functions---------------*/
                showDatePicker:function(){
                    this.$('#clearcal').show();
                    return false;
                },
                hideDatePicker:function(){
                    this.$('#clearcal').hide();
                    this.fromDate = "";
                    this.toDate = "";
                    this.$('#daterange').val('');
                    this.showHideChartArea(false);
                    this.loadReports();
                },
                showDatePickerFromClick:function(){
                    this.$('#daterange').click();
                    return false;
                },
                setDateRange:function() {
                   var val = this.$("#daterange").val(); 
                   if($.trim(val)){      
                        this.$('#clearcal').show();
                        var _dateRange = val.split("-");
                        var toDate ="",fromDate="";                  
                        if(_dateRange[0]){
                            fromDate = moment($.trim(_dateRange[0]),'M/D/YYYY');
                        }   
                        if($.trim(_dateRange[1])){
                            toDate = moment($.trim(_dateRange[1]),'M/D/YYYY');
                        }                    
                        if(fromDate){
                            this.fromDate = fromDate.format("MM-DD-YYYY");
                        }
                        if(toDate){
                            this.toDate = toDate.format("MM-DD-YYYY");
                        }                           
                        this.loadSummaryReports();
                   }
                },
                setDateRangeLi:function(obj){
                    var target = $.getObj(obj,"li");
                    if(!target.hasClass("ui-daterangepicker-dateRange")){
                        this.setDateRange();
                    }
                },/*---------- End Calender functions---------------*/
                removeReport:function(){
                    this.$el.remove();
                    this.sub.removeMode(this.orderNo);
                    this.sub.saveSettings();
                },
                loadRows:function(){                    
                    if(this.reportType=="landingpages"){
                        this.app.showLoading('Loading...',this.$el);
                        require(["landingpages/landingpage_row"], _.bind(function (lpRow) {
                            this.lpRow = lpRow;
                            this.app.showLoading(false,this.$el);
                            if(this.objects.length){
                                this.loadLandingPages();
                            }
                        }, this));                        
                    } else if(this.reportType=="campaigns"){
                        this.app.showLoading('Loading...',this.$el);
                        require(["campaigns/campaign_row"], _.bind(function (campRow) {
                            this.campRow = campRow;
                            this.app.showLoading(false,this.$el);
                            if(this.objects.length){
                                this.loadCampaigns();
                            }
                        }, this));                        
                    } else if(this.reportType=="autobots"){
                        this.app.showLoading('Loading...',this.$el);
                        require(["autobots/autobot"], _.bind(function (botRow) {
                            this.botRow = botRow;
                            this.app.showLoading(false,this.$el);
                            if(this.objects.length){
                                this.loadAutobots();
                            }
                        }, this));                        
                    } else if(this.reportType=="webforms"){
                        this.app.showLoading('Loading...',this.$el);
                        require(["forms/formlistings_row"], _.bind(function (formRow) {
                            this.formRow = formRow;
                            this.app.showLoading(false,this.$el);
                            if(this.objects.length){
                                this.loadSignupforms();
                            }
                        }, this));                        
                    }else if(this.reportType=="nurturetracks"){
                        this.app.showLoading('Loading...',this.$el);
                        require(["nurturetrack/track_row"], _.bind(function (trackRow) {
                            this.trackRow = trackRow;
                            this.app.showLoading(false,this.$el);
                            if(this.objects.length){
                                this.loadNurtureTracks();
                            }
                        }, this));                        
                    }
                    else if(this.reportType=="targets"){
                        this.app.showLoading('Loading...',this.$el);
                        require(["target/views/recipients_target"], _.bind(function (targetRow) {
                            this.targetRow = targetRow;
                            this.app.showLoading(false,this.$el);
                            if(this.objects.length){
                                this.loadTargets();
                            }
                        }, this));                        
                    }
                                        
                    
                },
                openSelectionDialog : function(){
                    if(this.reportType=="landingpages"){
                        this.openLandingPagesDialog();
                    } else if(this.reportType=="campaigns"){
                        this.openCampaignsDialog();
                    } else if(this.reportType=="autobots"){
                        this.openAutobotsDialog();
                    } else if(this.reportType=="webforms"){
                        this.openSignupFormsDialog();
                    } else if(this.reportType=="nurturetracks"){
                         this.openNurtureTracksDialog();
                    } else if(this.reportType=="targets"){
                        this.openTargetsDialog();
                    }
                    
                },
                loadReports : function(){
                    if(this.reportType=="landingpages"){
                        //this.openLandingPagesDialog();
                    } else if(this.reportType=="campaigns"){
                        this.loadCampaigns();
                    } else if(this.reportType=="autobots"){
                        this.loadAutobots();
                    } else if(this.reportType=="webforms"){
                        //this.openSignupFormsDialog();
                    } else if(this.reportType=="nurturetracks"){
                         //this.openNurtureTracksDialog();
                    } else if(this.reportType=="targets"){
                        //this.openTargetsDialog();
                    }
                    
                },
                loadSummaryReports : function(){
                    if(this.reportType=="landingpages"){
                        //this.openLandingPagesDialog();
                    } else if(this.reportType=="campaigns"){
                        this.loadCampaignsSummary();
                    } else if(this.reportType=="autobots"){
                        this.loadAutobotsSummary();
                    } else if(this.reportType=="webforms"){
                        //this.openSignupFormsDialog();
                    } else if(this.reportType=="nurturetracks"){
                         //this.openNurtureTracksDialog();
                    } else if(this.reportType=="targets"){
                        //this.openTargetsDialog();
                    }
                    
                },
                //////********************* Landing pages *****************************************//////
                loadLandingPages:function(){
                    this.app.showLoading("Loading selection...",this.$el);
                    var pageIds = this.objects.map(function( index ) {
                                    return index.id
                                 } ).join()
                      var URL = "/pms/io/publish/getLandingPages/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=get_csv";                                                                   
                      var post_data = {pageId_csv:pageIds}    
                      this.states_call =  $.post(URL, post_data).done(_.bind(function (data) {
                          this.app.showLoading(false,this.$el);
                          var _json = jQuery.parseJSON(data);                          
                          _.each(_json.pages[0], function(val) {
                              this.modelArray.push(new Backbone.Model(val[0]));
                          },this);
                          this.createPages();                            
                      },this))
                },
                openLandingPagesDialog:function(){
                    this.targetsModelArray = [];
                    var dialog_object ={title:'Select Landing Pages',
                        css:{"width":"1200px","margin-left":"-600px"},
                        bodyCss:{"min-height":"423px"},
                        saveCall : '',
                        headerIcon : 'lppage'                        
                    }                     
                     dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;                      
                     var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Landing pages...",dialog.getBody());                                  
                    require(["landingpages/selectpage"],_.bind(function(page){                                     
                         var _page = new page({page:this,dialog:dialog,editable:this.editable});
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         dialog.getBody().html(_page.$el);
                         _page.$el.find('#targets_grid').addClass('targets_grid_table');
                         _page.$el.find('.col2 .template-container').addClass('targets_grid_table_right');
                         _page.$el.find('.step2-lists').css({'top':'0'});
                         _page.$el.find('.step2-lists span').css({'left':'70px'});
                         _page.init();
                         _page.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(_page.saveCall,_page); // New Dialog
                         dialog.saveCallBack(_.bind(_page.saveCall,_page));
                         _page.createRecipients(this.targetsModelArray);
                    },this));
                },
                createPages:function(){                    
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();                        
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width()*.5;
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {
                            var pageRow = new this.lpRow({model: val, sub: this,showCheckbox:true,maxWidth:_maxWidth});                            
                            _grid.append(pageRow.$el);                            
                        },this);
                        this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                            this.chartPage = new chart({page:this,legend:{position:'none'},chartArea:{width:"100%",height:"80%",left:'10%',top:'10%'}});
                            this.$(".col2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width":"100%","height":"280px"});                                
                            this.createPageChart();                            
                            this.app.showLoading(false,this.$(".cstats"));
                        },this));
                    }
                },
                createPageChart:function(){        
                   if(this.$(".checkedadded").length){ 
                        this.$(".start-message").hide();
                        this.$(".col2 .campaign-chart").show(this.$(".checkedadded").length);     
                        var total_pages_selected = this.$(".checkedadded").length;
                        if(total_pages_selected>1){
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> landing pages selected');
                        }
                        else{
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> landing page selected');
                        }
                        this.chart_data = {submitCount:0,viewCount:0};
                        _.each(this.modelArray, function(val, index) {
                            if(this.$("[id='"+val.get("pageId.encode")+"']").hasClass("checkedadded")){
                             this.chart_data['submitCount'] = this.chart_data['submitCount'] + parseFloat(val.get("submitCount"));
                             this.chart_data['viewCount'] = this.chart_data['viewCount'] + parseFloat(val.get("viewCount"));
                            }
                        },this);

                        var _data =[
                             ['Action', 'Count'],                               
                               ['Page Views',   this.chart_data["viewCount"]],
                               ['Submission',   this.chart_data["submitCount"]]
                           ];                      
                         this.chartPage.createChart(_data);
                         _.each(this.chart_data,function(val,key){
                            this.$(".col2 ."+key).html(this.app.addCommas(val));
                        },this);
                    }
                    else{
                        this.$(".start-message").show();
                        this.$(".col2 .campaign-chart").hide();     
                        this.$(".total-count").html('<strong class="badge">'+0+'</strong> landing pages selected');
                    }
                    
                    this.sub.saveSettings();
                    
                    
                },
                //////********************* Campaigns *****************************************//////
                loadCampaigns:function(){
                    this.app.showLoading("Loading selection...",this.$el);
                    var campNums = this.objects.map(function( index ) {
                                    return index.id
                                 } ).join()
                      var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=list_csv";                                                                   
                      var post_data = {campNum_csv:campNums};
                      this.modelArray = [];
                      this.states_call =  $.post(URL, post_data).done(_.bind(function (data) {
                          this.app.showLoading(false,this.$el);
                          var _json = jQuery.parseJSON(data);                          
                          _.each(_json.campaigns[0], function(val) {
                              this.modelArray.push(new Backbone.Model(val[0]));
                          },this);
                          this.createCampaigns();                            
                      },this))
                },
                openCampaignsDialog:function(){
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object ={title:'Select Campaigns',
                        css:{"width":_width+"px","margin-left":-(_width/2)+"px","top": "10px"},
                        bodyCss:{"min-height":_height+"px"},
                        saveCall : '',
                        headerIcon : 'campaigndlg'                        
                    }                     
                     dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;                      
                     var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Campaigns...",dialog.getBody());                                  
                    require(["campaigns/selectcampaign"],_.bind(function(page){                                     
                         var _page = new page({page:this,dialog:dialog,editable:this.editable,dialogHeight:_height-103});
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         dialog.getBody().html(_page.$el);                         
                         _page.init();
                         _page.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(_page.saveCall,_page); // New Dialog
                         dialog.saveCallBack(_.bind(_page.saveCall,_page));                         
                    },this));
                },
                createCampaigns:function(){                    
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();                        
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width()*.5;
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {
                            var campRow = new this.campRow({model: val, sub: this,showCheckbox:true,maxWidth:_maxWidth});                            
                            _grid.append(campRow.$el);                            
                        },this);
                        this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                            this.chartPage = new chart({page:this,legend:{position:'none'},chartArea:{width:"100%",height:"80%",left:'10%',top:'10%'}});
                            this.$(".col2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width":"100%","height":"280px"});                                
                            this.createCampaignChart();                                                        
                        },this));
                    }
                },
                createCampaignChart:function(){        
                   if(this.$(".checkedadded").length){ 
                        this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        this.$(".start-message").hide();
                        this.$(".col2 .campaign-chart").show(this.$(".checkedadded").length);     
                        var total_pages_selected = this.$(".checkedadded").length;
                        if(total_pages_selected>1){
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> campaigns selected');
                        }
                        else{
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> campaign selected');
                        }
                        var _campaigns = $.map(this.$(".checkedadded"),function(el){
                            return el.id;
                        }).join(",");
                        this.chart_data = {bounceCount:0,clickCount:0,conversionCount:0,facebookCount:0,googlePlusCount:0,linkedInCount:0
                                      ,openCount:0,pageViewsCount:0,pendingCount:0,pinterestCount:0,sentCount:0,supressCount:0,
                                      twitterCount:0,unSubscribeCount:0};
                        var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=stats";                                                                   
                        var post_data = {campNums:_campaigns}    
                        this.states_call =  $.post(URL, post_data).done(_.bind(function (data) {
                            var camp_json = jQuery.parseJSON(data);
                            _.each(camp_json.campaigns[0], function(val) {
                                this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(val[0].bounceCount);
                                this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                                this.chart_data["conversionCount"] = this.chart_data["conversionCount"] +parseInt(val[0].conversionCount);
                                this.chart_data["facebookCount"] = this.chart_data["facebookCount"] + parseInt(val[0].facebookCount);
                                this.chart_data["googlePlusCount"] = this.chart_data["googlePlusCount"] + parseInt(val[0].googlePlusCount);
                                this.chart_data["linkedInCount"] = this.chart_data["linkedInCount"] + parseInt(val[0].linkedInCount);
                                this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                                this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);
                                this.chart_data["pendingCount"] = this.chart_data["pendingCount"] + parseInt(val[0].pendingCount);
                                this.chart_data["pinterestCount"] = this.chart_data["pinterestCount"] + parseInt(val[0].pinterestCount);
                                this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);
                                this.chart_data["supressCount"] = this.chart_data["supressCount"] + parseInt(val[0].supressCount);
                                this.chart_data["twitterCount"] = this.chart_data["twitterCount"] + parseInt(val[0].twitterCount);
                                this.chart_data["unSubscribeCount"] = this.chart_data["unSubscribeCount"] + parseInt(val[0].unSubscribeCount);
                            },this);
                            var _data =[
                             ['Action', 'Count', { role: 'style' }],
                               ['Opens',   this.chart_data["openCount"],'#454f88'],
                               ['Clicks',    this.chart_data["clickCount"],'#0c73c2'],
                               ['Page Views',       this.chart_data["pageViewsCount"],'#2f93e5'],
                               ['Conversions',  this.chart_data["conversionCount"],'#62abe6']
                           ];

                           this.chartPage.createChart(_data);
                           this.app.showLoading(false,this.$(".cstats"));
                           _.each(this.chart_data,function(val,key){
                               this.$(".col2 ."+key).html(this.app.addCommas(val));
                           },this);
                            
                        },this));
                    }
                    else{
                        this.$(".start-message").show();
                        this.$(".col2 .campaign-chart").hide();     
                        this.$(".total-count").html('<strong class="badge">'+0+'</strong> campaigns selected');
                    }                    
                    this.sub.saveSettings();
                    
                },
                loadCampaignsSummary:function(){
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        this.showHideChartArea(true);
                        var _grid = this.$("#_grid tbody");                        
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {                                                        
                            var campRow = new this.campRow({model: val, sub: this,showSummaryChart:true});                                                                                    
                            _grid.append(campRow.$el);                                                        
                            this.app.showLoading("Loading Summary Chart...",this.$("#chart-"+val.get("campNum.checksum")));
                            var URL = "/pms/io/campaign/getCampaignSummaryStats/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=summaryDailyBreakUp";
                            var campNum = val.get("campNum.encode");
                            var post_data = {campNum:campNum,toDate:this.toDate,fromDate:this.fromDate}    
                            $.post(URL, post_data).done(_.bind(function (sJson) {
                                var summary_json = jQuery.parseJSON(sJson);
                                if(summary_json[0]=="err"){
                                    this.app.showAlert(summary_json[1], this.$el.parents(".ws-content.active"));
                                    return false;
                                }
                                if(summary_json.count!=="0"){
                                    require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                                        this.chartPage = new chart({page:this,legend:{},isStacked:true,vAxisLogScale:true});                                    
                                        this.$("#chart-"+val.get("campNum.checksum")).html(this.chartPage.$el);
                                        this.chartPage.$el.css({"width":"100%","height":"250px"});                                                                                            
                                        var _data = [
                                            ['Genre', 'Sent', 'Open', 'View', 'Click','Socail','Bounce',{ role: 'annotation' } ]
                                          ];
                                         _.each(summary_json.summaries[0], function(sVal) { 
                                            _data.push([ moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"), parseInt(sVal[0].sentCount), parseInt(sVal[0].openCount), parseInt(sVal[0].pageViewsCount), parseInt(sVal[0].clickCount), parseInt(sVal[0].socialCount), parseInt(sVal[0].bounceCount), '']) 
                                         });
                                         this.chartPage.createChart(_data);                                                        
                                    },this));
                                }
                                else{
                                    this.$("#chart-"+val.get("campNum.checksum")).html('<div class="loading"><p style="background:none">No data found for campaign <i>"'+val.get("name")+'"</i> </p></div>');
                                }
                            },this));
                            
                        },this);
                                                
                    }
                },
                showHideChartArea:function(flag){
                    if(flag){
                        this.$(".cols").removeClass("col1");
                        this.$(".col2").hide();
                        this.$(".template-container").css({"overflow-y":'hidden',height:'auto'});
                    }
                    else{
                        this.$(".cols").addClass("col1");
                        this.$(".col2").show();
                        this.$(".template-container").css({"overflow-y":'auto',height:'420px'});
                    }
                }
                ,
                //////********************* Autobots *****************************************//////
                loadAutobots:function(){
                     this.app.showLoading("Loading selection...",this.$el);
                    var botNums = this.objects.map(function( index ) {
                                    return index.id
                                 } ).join();           
                      this.modelArray = [];           
                      var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=get_csv";                                                                   
                      var post_data = {botId_csv:botNums}    
                      this.states_call =  $.post(URL, post_data).done(_.bind(function (data) {
                          this.app.showLoading(false,this.$el);
                          var _json = jQuery.parseJSON(data);                          
                          _.each(_json.autobots[0], function(val) {
                              this.modelArray.push(new Backbone.Model(val[0]));
                          },this);
                          this.createAutobots();                            
                      },this))
                },
                openAutobotsDialog:function(){
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object ={title:'Select Autobots',
                        css:{"width":_width+"px","margin-left":-(_width/2)+"px","top": "10px"},
                        bodyCss:{"min-height":_height+"px"},
                        saveCall : '',
                        headerIcon : 'bot'                        
                    }                     
                     dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;                      
                     var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Autobots...",dialog.getBody());                                  
                    require(["autobots/selectautobot"],_.bind(function(page){                                     
                         var _page = new page({page:this,dialog:dialog,editable:this.editable,dialogHeight:_height-103});
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         dialog.getBody().html(_page.$el);                         
                         _page.init();
                         _page.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(_page.saveCall,_page); // New Dialog
                         dialog.saveCallBack(_.bind(_page.saveCall,_page));                         
                    },this));
                },
                createAutobots:function(){                    
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();                        
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width()*.5;
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {
                            var botRow = new this.botRow({model: val, sub: this,page: this,showCheckbox:true,maxWidth:_maxWidth});                            
                            _grid.append(botRow.$el);                            
                        },this);
                        this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                            this.chartPage = new chart({page:this,legend:{position:'none'},chartArea:{width:"100%",height:"80%",left:'10%',top:'10%'}});
                            this.$(".col2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width":"100%","height":"280px"});                                
                            this.createAutobotChart();                                                        
                        },this));
                    }
                },
                createAutobotChart:function(){        
                   if(this.$(".checkedadded").length){ 
                        this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        this.$(".start-message").hide();
                        this.$(".col2 .campaign-chart").show(this.$(".checkedadded").length);     
                        var total_pages_selected = this.$(".checkedadded").length;
                        if(total_pages_selected>1){
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> autobots selected');
                        }
                        else{
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> autobots selected');
                        }
                        var _bots = $.map(this.$(".checkedadded"),function(el){
                            return el.id;
                        }).join(",");
                        this.chart_data = {bounceCount:0,clickCount:0,conversionCount:0,facebookCount:0,googlePlusCount:0,linkedInCount:0
                                      ,openCount:0,pageViewsCount:0,pendingCount:0,pinterestCount:0,sentCount:0,supressCount:0,
                                      twitterCount:0,unSubscribeCount:0};
                        var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=mailBotStats_csv";                                                                   
                        var post_data = {botId_csv:_bots}    
                        this.states_call =  $.post(URL, post_data).done(_.bind(function (data) {
                            var camp_json = jQuery.parseJSON(data);
                            _.each(camp_json.autobots[0], function(val) {
                                this.chart_data["bounceCount"] = this.chart_data["bounceCount"] + parseInt(val[0].bounceCount);
                                this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                                this.chart_data["conversionCount"] = this.chart_data["conversionCount"] +parseInt(val[0].conversionCount);
                                this.chart_data["facebookCount"] = this.chart_data["facebookCount"] + parseInt(val[0].facebookCount);
                                this.chart_data["googlePlusCount"] = this.chart_data["googlePlusCount"] + parseInt(val[0].googlePlusCount);
                                this.chart_data["linkedInCount"] = this.chart_data["linkedInCount"] + parseInt(val[0].linkedInCount);
                                this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                                this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);
                                this.chart_data["pendingCount"] = this.chart_data["pendingCount"] + parseInt(val[0].pendingCount);
                                this.chart_data["pinterestCount"] = this.chart_data["pinterestCount"] + parseInt(val[0].pinterestCount);
                                this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);
                                this.chart_data["supressCount"] = this.chart_data["supressCount"] + parseInt(val[0].supressCount);
                                this.chart_data["twitterCount"] = this.chart_data["twitterCount"] + parseInt(val[0].twitterCount);
                                this.chart_data["unSubscribeCount"] = this.chart_data["unSubscribeCount"] + parseInt(val[0].unSubscribeCount);
                            },this);
                            var _data =[
                             ['Action', 'Count', { role: 'style' }],
                               ['Opens',   this.chart_data["openCount"],'#454f88'],
                               ['Clicks',    this.chart_data["clickCount"],'#0c73c2'],
                               ['Page Views',       this.chart_data["pageViewsCount"],'#2f93e5'],
                               ['Conversions',  this.chart_data["conversionCount"],'#62abe6']
                           ];

                           this.chartPage.createChart(_data);
                           this.app.showLoading(false,this.$(".cstats"));
                           _.each(this.chart_data,function(val,key){
                               this.$(".col2 ."+key).html(this.app.addCommas(val));
                           },this);
                            
                        },this));
                    }
                    else{
                        this.$(".start-message").show();
                        this.$(".col2 .campaign-chart").hide();     
                        this.$(".total-count").html('<strong class="badge">'+0+'</strong> campaigns selected');
                    }                    
                    this.sub.saveSettings();
                    
                },
                loadAutobotsSummary:function(){
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();
                        this.showHideChartArea(true);
                        var _grid = this.$("#_grid tbody");                        
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {                            
                             var autobotRow = new this.botRow({model: val,page: this, sub: this,showSummaryChart:true});                                                                                    
                            _grid.append(autobotRow.$el);                                                        
                            this.app.showLoading("Loading Summary Chart...",this.$("#chart-"+val.get("botId.checksum")));
                            var URL = "/pms/io/campaign/getCampaignSummaryStats/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=summaryDailyBreakUp";
                            var campNum = val.get("actionData")[0]["campNum.encode"];
                            var post_data = {campNum:campNum,toDate:this.toDate,fromDate:this.fromDate}    
                            $.post(URL, post_data).done(_.bind(function (sJson) {
                                var summary_json = jQuery.parseJSON(sJson);
                                if(summary_json[0]=="err"){
                                    this.app.showAlert(summary_json[1], this.$el.parents(".ws-content.active"));
                                    return false;
                                }
                                if(summary_json.count!=="0"){
                                    require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                                        this.chartPage = new chart({page:this,legend:{},isStacked:true,vAxisLogScale:true});                                    
                                        this.$("#chart-"+val.get("botId.checksum")).html(this.chartPage.$el);
                                        this.chartPage.$el.css({"width":"100%","height":"250px"});                                                                                            
                                        var _data = [
                                            ['Genre', 'Sent', 'Open', 'View', 'Click','Social','Bounce',{ role: 'annotation' } ]
                                          ];
                                         _.each(summary_json.summaries[0], function(sVal) { 
                                            _data.push([ moment(sVal[0].reportDate, 'YYYY-M-D').format("DD MMM"), parseInt(sVal[0].sentCount), parseInt(sVal[0].openCount), parseInt(sVal[0].pageViewsCount), parseInt(sVal[0].clickCount), parseInt(sVal[0].socialCount), parseInt(sVal[0].bounceCount), '']) 
                                         });
                                         this.chartPage.createChart(_data);                                                        
                                    },this));
                                }
                                else{
                                    this.$("#chart-"+val.get("botId.checksum")).html('<div class="loading"><p style="background:none">No data found for autobot <i>"'+val.get("label")+'"</i> </p></div>');
                                }
                            },this));
                            
                        },this);
                                                
                    }
                },
                //////********************* Signup Forms  *****************************************//////
                loadSignupforms:function(){ 
                    
                },
                openSignupFormsDialog:function(){
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object ={title:'Select Signup Froms',
                        css:{"width":_width+"px","margin-left":-(_width/2)+"px","top": "10px"},
                        bodyCss:{"min-height":_height+"px"},
                        saveCall : '',
                        headerIcon : 'dlgformwizard'                        
                    }                     
                     dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;                      
                     var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Signup Forms...",dialog.getBody());                                  
                    require(["forms/selectform"],_.bind(function(page){                                     
                         var _page = new page({page:this,dialog:dialog,editable:this.editable,dialogHeight:_height-103});
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         dialog.getBody().html(_page.$el);                         
                         _page.init();
                         _page.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(_page.saveCall,_page); // New Dialog
                         dialog.saveCallBack(_.bind(_page.saveCall,_page));                         
                    },this));
                },
                createSignupForms:function(){                    
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();                        
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width()*.5;
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {
                            var formRow = new this.formRow({model: val, sub: this,page: this,showCheckbox:true,maxWidth:_maxWidth});                            
                            _grid.append(formRow.$el);                            
                        },this);
                        this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                            this.chartPage = new chart({page:this,legend:{position:'none'},chartArea:{width:"100%",height:"80%",left:'10%',top:'10%'}});
                            this.$(".col2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width":"100%","height":"280px"});                                                            
                            this.createSignupFormChart();                                                        
                            this.app.showLoading(false,this.$(".cstats")); 
                        },this));
                    }
                },
                createSignupFormChart:function(){        
                   if(this.$(".checkedadded").length){ 
                        this.$(".start-message").hide();
                        this.$(".col2 .campaign-chart").show(this.$(".checkedadded").length);     
                        var total_pages_selected = this.$(".checkedadded").length;
                        if(total_pages_selected>1){
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> signup forms selected');
                        }
                        else{
                            this.$(".total-count").html('<strong class="badge">'+total_pages_selected+'</strong> signup form selected');
                        }
                        this.chart_data = {submitCount:0};
                        _.each(this.modelArray, function(val, index) {
                            if(this.$("[id='"+val.get("formId.encode")+"']").hasClass("checkedadded")){
                               this.chart_data['submitCount'] = this.chart_data['submitCount'] + parseFloat(val.get("submitCount"));                             
                            }
                        },this);

                        var _data =[
                             ['Action', 'Count'],                                                              
                               ['Submission',   this.chart_data["submitCount"]]
                           ];                      
                         this.chartPage.createChart(_data);
                         _.each(this.chart_data,function(val,key){
                            this.$(".col2 ."+key).html(this.app.addCommas(val));
                        },this);
                    }
                    else{
                        this.$(".start-message").show();
                        this.$(".col2 .campaign-chart").hide();     
                        this.$(".total-count").html('<strong class="badge">'+0+'</strong> signup forms selected');
                    }
                    
                    this.sub.saveSettings();
                    
                    
                },
                //////********************* Nurture Tracks  *****************************************//////
                loadNurtureTracks:function(){
                    
                },
                openNurtureTracksDialog: function(){
                    var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object ={title:'Select Nurture Tracks',
                        css:{"width":_width+"px","margin-left":-(_width/2)+"px","top": "10px"},
                        bodyCss:{"min-height":_height+"px"},
                        saveCall : '',
                        headerIcon : 'nurturedlg'                        
                    }                     
                     dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;                      
                     var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Nurture Tracks...",dialog.getBody());                                  
                    require(["nurturetrack/selecttrack"],_.bind(function(page){                                     
                         var _page = new page({page:this,dialog:dialog,editable:this.editable,dialogHeight:_height-103});
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         dialog.getBody().html(_page.$el);                         
                         _page.init();
                         _page.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(_page.saveCall,_page); // New Dialog
                         dialog.saveCallBack(_.bind(_page.saveCall,_page));                         
                    },this));
                },                
                createNurtureTrack:function(){                    
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();                        
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width()*.5;
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {
                            var trackRow = new this.trackRow({model: val, sub: this,showCheckbox:true,maxWidth:_maxWidth});                            
                            _grid.append(trackRow.$el);                            
                        },this);
                        //this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                            this.chartPage = new chart({page:this,legend:{position:'none'},chartArea:{width:"100%",height:"80%",left:'10%',top:'10%'}});
                            this.$(".col2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width":"100%","height":"280px"});                                
                            //this.createCampaignChart();                                                        
                        },this));
                    }
                },
                 //////********************* Targets  *****************************************//////
                loadTargets:function(){
                   this.app.showLoading("Loading selection...",this.$el);
                   var targetsNums = this.objects.map(function( index ) {
                                    return index.id
                                 } ).join()
                      var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=list_csv";                                                                   
                      var post_data = {filterNumber_csv:targetsNums}    
                      this.states_call =  $.post(URL, post_data).done(_.bind(function (data) {
                          this.app.showLoading(false,this.$el);
                          var _json = jQuery.parseJSON(data);                          
                          _.each(_json.filters[0], function(val) {
                              this.modelArray.push(new Backbone.Model(val[0]));
                          },this);
                          this.createTargets();                            
                      },this)) 
                },
                openTargetsDialog:function(){
                     var _width = $(document.documentElement).width() - 60;
                    var _height = $(document.documentElement).height() - 182;
                    var dialog_object ={title:'Select Targets',
                        css:{"width":_width+"px","margin-left":-(_width/2)+"px","top": "10px"},
                        bodyCss:{"min-height":_height+"px"},
                        saveCall : '',
                        headerIcon : 'targetw'                        
                    }                     
                     dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;                      
                     var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Targets...",dialog.getBody());                                  
                    require(["target/select_target"],_.bind(function(page){                                     
                         var _page = new page({page:this,dialog:dialog,editable:this.editable,dialogHeight:_height-103});
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         dialog.getBody().html(_page.$el);                         
                         _page.init();
                         _page.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(_page.saveCall,_page); // New Dialog
                         dialog.saveCallBack(_.bind(_page.saveCall,_page));                         
                    },this));
                },                
                createTargets:function(){                    
                    if(this.modelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();                        
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width()*.5;
                        _grid.children().remove();
                        _.each(this.modelArray, function(val, index) {
                            var targetRow = new this.targetRow({model: val, sub: this,showCheckbox:true,maxWidth:_maxWidth});                            
                            _grid.append(targetRow.$el);                            
                        },this);
                        //this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/campaign_line_chart"],_.bind(function(chart){                            
                            this.chartPage = new chart({page:this,legend:{position:'none'},chartArea:{width:"100%",height:"80%",left:'10%',top:'10%'}});
                            this.$(".col2 .campaign-chart").html(this.chartPage.$el);
                            this.chartPage.$el.css({"width":"100%","height":"280px"});                                
                            //this.createCampaignChart();                                                        
                        },this));
                    }
                    this.sub.saveSettings();
                }
            });
        });
