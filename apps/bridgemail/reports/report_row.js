define(['text!reports/html/report_row.html','jquery.searchcontrol','daterangepicker','jquery.icheck'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'act_row',                
                events: {                    
                   'click .delete':'removeReport',                   
                   'click .add-msg-report':'openSelectionDialog',
                   'click .edit':'openSelectionDialog'
                },
                initialize: function () {
                    this.mapping = {campaigns:{label:'Campaigns',colorClass:'darkblue',iconClass:'open'},
                                    landingpages:{label:'Landing Pages',colorClass:'yellow',iconClass:'form2'},
                                    nurturetracks:{label:'Nurture Tracks',colorClass:'blue',iconClass:'track'},
                                    autobots:{label:'Autobots',colorClass:'grey',iconClass:'autobot'},
                                    tags:{label:'Tags',colorClass:'green',iconClass:'tags'}};
                    this.app = this.options.app;     
                    this.pagesModelArray = [];
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
                 this.loadRows();
                 
                },
                removeReport:function(){
                    this.$el.remove();
                },
                loadRows:function(){
                    this.app.showLoading('Loading...',this.$el);
                    if(this.reportType=="landingpages"){
                        require(["landingpages/landingpage_row"], _.bind(function (lpRow) {
                            this.lpRow = lpRow;
                            this.app.showLoading(false,this.$el);
                        }, this));
                        
                    }
                                        
                    
                },
                openSelectionDialog : function(){
                    if(this.reportType=="landingpages"){
                        this.openLandingPagesDialog();
                    }
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
                    if(this.pagesModelArray.length){
                        this.$(".add-msg-report").hide();
                        this.$(".bmsgrid").show();                        
                        var _grid = this.$("#_grid tbody");
                        var _maxWidth = this.$(".col1 .template-container").width()*.5;
                        _grid.children().remove();
                        _.each(this.pagesModelArray, function(val, index) {
                            var pageRow = new this.lpRow({model: val, sub: this,showCheckbox:true,maxWidth:_maxWidth});                            
                            _grid.append(pageRow.$el);                            
                        },this);
                        this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                        require(["reports/campaign_pie_chart"],_.bind(function(chart){
                            this.app.showLoading(false,this.$(".cstats"));  
                            this.chartPage = new chart({page:this,legend:{position:'right',alignment:'center'},chartArea:{width:"100%",height:"90%",left:'10%',top:'2%'}});
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
                        _.each(this.pagesModelArray, function(val, index) {
                            if(this.$("[id='"+val.get("pageId.encode")+"']").hasClass("checkedadded")){
                             this.chart_data['submitCount'] = this.chart_data['submitCount'] + parseFloat(val.get("submitCount"));
                             this.chart_data['viewCount'] = this.chart_data['viewCount'] + parseFloat(val.get("viewCount"));
                            }
                        },this);

                        var _data =[
                             ['Action', 'Count'],
                               ['Submission',   this.chart_data["submitCount"]],
                               ['Page Views',   this.chart_data["viewCount"]]
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
                }

            });
        });
