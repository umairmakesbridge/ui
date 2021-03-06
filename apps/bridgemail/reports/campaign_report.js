define(['text!reports/html/campaign_report.html',"common/mapping"],
function (template, mappingPage) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Campaign Reports page 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            id: 'contacts_list',
            /**
             * Attach events on elements in view.
            */            
            events: {				
              'click .slidetoggle': "slidePanel",
              'click #template_search_menu li': "getCampaigns",
              "keyup #daterange":'showDatePicker',
              "click #clearcal":'hideDatePicker',
              "click .calendericon":'showDatePickerFromClick',
              "click .chart-dialog .closebtn":"closeChart",
              "click .sortoption_expand": "toggleSortOption",
              "click .download-csv":"downloadCSV"
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){              
               this.template = _.template(template);		               
               this.render();
               this.outside = false;               
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.app;                                                   
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){                
              this.initControls();
              this.getAllCampaigns(5);              
            },
            initControls:function(){
                 this.$('input.checkpanel').iCheck({
                      checkboxClass: 'checkpanelinput',
                      insert: '<div class="icheck_line-icon"></div>'
               });
               
                this.$('input.checkpanel').on('ifChecked', _.bind(function(event){
                   this.$("#camps_grid_report tr td:nth-child(1) .check-box").removeClass("unchecked").addClass("checkedadded");
                   if(!this.outside){
                     this.createChart();
                  }
                  this.outside = false;
                },this))
                
                this.$('input.checkpanel').on('ifUnchecked', _.bind(function(event){                   
                   if(!this.outside){
                     this.$("#camps_grid_report tr td:nth-child(1) .check-box").removeClass("checkedadded").addClass("unchecked");  
                     this.createChart();
                  }
                   this.outside = false;
                },this))
                this.dateRangeControl = this.$('#daterange').daterangepicker();                
                this.dateRangeControl.panel.find(".btnDone").click(_.bind(this.setDateRange,this));
                this.dateRangeControl.panel.find("ul.ui-widget-content li").click(_.bind(this.setDateRangeLi,this));
                this.current_ws = this.$el.parents(".ws-content");
                //this.current_ws.find(".camp_header #workspace-header").css("margin-top","10px")
                this.$('.campslistsearch').searchcontrol({
                     id:'list-search',
                     width:'300px',
                     height:'22px',
                     gridcontainer: 'camps_grid_report',
                     placeholder: 'Search Campaigns',                     
                     showicon: 'yes',
                     tdNo:2,
                     iconsource: 'campaigns',
                     searchFunc:_.bind(this.searchCampaigns,this),
                     searchCountEl : this.$(".total-camp-count"),
                     searchTextEl : this.$(".total-text"),
                     searchText : 'Camapigns'
                     
              });
                 this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                 this.$(".selected-campaign").chosen({ width: "220px",disable_search: "true"});
                 var _this = this;                 
                 this.app.showLoading("Loading...",this.$(".cstats"));
                 
                 require(["reports/campaign_pie_chart"],function(chart){
                    _this.app.showLoading(false,_this.$(".cstats"));  
                    _this.chartPage = new chart({page:_this,legend:{position:'right',alignment:'center'},chartArea:{width:"100%",height:"90%",left:'10%',top:'2%'}});
                    _this.$(".col-cstats .campaign-chart").html(_this.chartPage.$el);
                    _this.chartPage.$el.css({"width":"100%","height":"280px"});    
                    if(_this.$(".checkedadded").length){
                        _this.createChart();
                    }
                });
                
            },
            searchCampaigns: function(){
                
            },
            getCampaigns:function(obj){
                var _target= $.getObj(obj,"li");
                if(_target.hasClass("active")===false){                    
                    this.$(".filter-camp li.active").removeClass("active");
                    _target.addClass("active");
                    this.$(".spntext").html(_target.text());
                    this.getAllCampaigns(parseInt(_target.attr("last")));
                    if(parseInt(_target.attr("last"))){
                         this.$('input.checkpanel').iCheck('check');
                    }else{
                        this.$('input.checkpanel').iCheck('uncheck');
                    }
                }
                
            },
            getAllCampaigns: function (bucket) {
                this.showStart();
                this.$(".camp_listing").children().remove();				                               				                
                var _bucket_string = "";
                if(this.bucket || this.bucket!=bucket){                    
                    this.bucket = bucket;                    
                }
                if(this.bucket){
                    _bucket_string = "&bucket="+this.bucket;
                }                                
                this.app.showLoading("Loading Campaigns...",this.$(".camp_listing"));      
                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status=P,C"+_bucket_string;
                if(this.fromDate){
                    URL +="&fromDate="+this.fromDate;
                }
                if(this.toDate){
                    URL +="&toDate="+this.toDate;
                }
                jQuery.getJSON(URL, _.bind(this.createListTable,this));                
               
            },
            createListTable:function(tsv, state, xhr){
                var camp_list_json = jQuery.parseJSON(xhr.responseText);                                
                if(this.app.checkError(camp_list_json)){
                        return false;
                }                   
                this.$(".total-camp-count").html(camp_list_json.count);
                if(camp_list_json.count!=="0"){
                    this.setCounts = true;
                    this.reportCSVData = [["CampaignName","ScheduledDate","SentCount","Opened/Open Rate","Clicked/Open CTR","Converted","PageViews","Unsubscribed","Supressed","Bounced"]]
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="camps_grid_report"><tbody>';	
                        _.each(camp_list_json.campaigns[0], function(val, index) {
                             list_html += this.makerow(val);					
                        },this);
                    list_html += '</tbody></table>';
                    this.app.showLoading(false,this.$(".camp_listing"));
                     /*-----Remove loading------*/
                    this.app.removeSpinner(this.$el);
                   /*------------*/
                    this.$(".camp_listing").html(list_html);
                    
                    //Create Grid
                    this.$("#camps_grid_report").bmsgrid({
                        useRp : false,
                        resizable:false,
                        colresize:false,                        
                        height: 377, //this.app.get('wp_height')-160,                        
                        usepager : false,
                        colWidth : ["40px",'100%','60px','60px','60px','60px','60px','60px','60px','60px','132px']
                    });
                    this.$("#camps_grid_report tr td:nth-child(1)").attr("width","40px");                    
                    this.$("#camps_grid_report tr td:nth-child(2)").attr("width","100%");                                        
                    this.$("#camps_grid_report tr td:nth-child(3)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(4)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(5)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(6)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(7)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(8)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(9)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(10)").attr("width","60px"); 
                    this.$("#camps_grid_report tr td:nth-child(11)").attr("width","132px"); 
                    this.$("#camps_grid_report tr td:nth-child(1) .check-box").click(_.bind(this.addToChart,this));                    
                    this.$("#camps_grid_report tr td:nth-child(2) .campname").click(_.bind(this.previewCampaign,this));
                    // this.$("#camps_grid_report tr td:nth-child(1) .report").click(_.bind(this.showChart,this));
                      var that = this;
                    this.$("#camps_grid_report tr td:nth-child(2) .report").click(function(){
                            var camp_id=$(this).parents("tr").attr("id").split("_")[1];
                            that.app.mainContainer.addWorkSpace({params: {camp_id: camp_id},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+camp_id,tab_icon:'campaign-summary-icon'});
                    })
                     
                     
                     
                    if(!this.$(".filter-camp li:first-child").hasClass("active")){
                        this.createChart();
                    }
                    this.$("#camps_grid_report tr .showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                }
                else{
                     this.app.showLoading(false,this.$(".camp_listing"));
                     this.$(".camp_listing").append('<p class="notfound">No Campaigns found</p>');
                }
            },
            makerow:function(val){
                var row_html = "";
                var max_width = this.$(".camp_listing").width()*.50;
                var flag_class = this.getCampStatus(val[0].status);                 
                row_html += '<tr id="row_'+val[0]['campNum.encode']+'" data-checksum="'+val[0]['campNum.checksum']+'">';                        
                var _checked =this.$(".filter-camp li:first-child").hasClass("active")?'class="unchecked check-box"':'class="checkedadded check-box"';
                row_html += '<td style="padding:0px"><a '+_checked+' id="'+val[0]['campNum.encode']+'" style="margin:0px;position:relative"><i class="icon check"></i></a></td><td><div class="name-type"><h3><span class="campname showtooltip" style="float:left;overflow:hidden;min-width:40px;max-width:'+max_width+'px;" title="Click to Preview">'+val[0].name+'</span><span class="cstatus '+flag_class+'">'+this.app.getCampStatus(val[0].status)+'</span><div class="campaign_stats showtooltip" title="Click to View Chart"><a class="icon report"></a></div>';
                if(this.app.get("user").accountType =='A' && this.app.get("user").userId!==val[0]['userId']){
                    row_html += '<div class="sub_accountobj showtooltip" title="This campaign is created by sub account '+val[0]['userId'] +'"><a class="icon subaccount"></a></div>';
                }                
                row_html += '</h3><div class="tags tagscont">'+this.app.showTags(val[0].tags)+'</div></td>';                               
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em>Sent</em><span class="sentCount">'+val[0].sentCount+'</span></span></strong></div></div></td> ';
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em>Opened</em><span class="openCount">'+0+'</span></span></strong></div></div></td> ';
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em>Clicked</em><span class="clickCount">'+0+'</span></span></strong></div></div></td> ';
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em>Converted</em><span class="conversionCount">'+0+'</span></span></strong></div></div></td> ';
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em>Page Views</em><span class="pageViewsCount">'+0+'</span></span></strong></div></div></td> ';
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em style="margin-left:-32px">Unsubscribed</em><span class="unSubscribeCount">'+0+'</span></span></strong></div></div></td> ';
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em>Supressed</em><span class="supressCount">'+0+'</span></span></strong></div></div></td> ';
                row_html += '<td width="60px"><div><div class="subscribers"><strong><span><em>Bounced</em><span class="bounceCount">'+0+'</span></span></strong></div></div></td> ';
                var _dateTime = this.getDateFormat(val);
                row_html += '<td width="132px"><div><div style="width:105px" class="time"><strong><span><em>'+_dateTime.dtHead +'</em>'+ _dateTime.dateTime +'</span></strong></div></div></td> ';                  
                row_html += '</tr>';                
                this.reportCSVData.push([val[0].name,this.getCSVDate(val),0,0,0,0,0,0,0,0]);
                return row_html;
            }
            ,
            getCampStatus:function(status){
                var flag_class = "";
                if(status == 'D')
                   flag_class = 'pclr1';
                 else if(status == 'P')
                   flag_class = 'pclr6';
                 else if(status == 'S')
                   flag_class = 'pclr2';
                 else if(status == 'C')
                   flag_class = 'pclr18'; 
                return flag_class;
            }
            ,
            getDateFormat:function(val){
                var dtHead = '';
                var datetime = '';
		if(val[0].status != 'D')
                {
                    dtHead = '<em>Schedule Date</em>';
                    datetime = val[0].scheduledDate;
                }
                else
                {
                    dtHead = '<em>Updation Date</em>';
                    if(val[0].updationDate)
                        datetime = val[0].updationDate;
                    else
                        datetime = val[0].creationDate;
                }
                var dateFormat = '';
                if(datetime)
                {
                    var _date = moment(this.app.decodeHTML(datetime),'YYYY-M-D H:m');                        
                    dateFormat = _date.format("DD MMM, YYYY");
                }
                else{
                    dateFormat = '';					
                 }
                 
                 return {dtHead: dtHead, dateTime: dateFormat}
            },
            getCSVDate:function(val){
                var datetime = '';
                if(val[0].status != 'D')
                {                    
                    datetime = val[0].scheduledDate;
                }
                else
                {                 
                    if(val[0].updationDate)
                        datetime = val[0].updationDate;
                    else
                        datetime = val[0].creationDate;
                }
                var dateFormat = "";
                if(datetime)
                {
                    var _date = moment(this.app.decodeHTML(datetime),'YYYY-M-D H:m');                        
                    dateFormat = _date.format("DD/MM/YYYY");
                }                
                return  dateFormat
            },
            slidePanel:function(obj){
                var handle = $.getObj(obj,"a");
                if(handle.hasClass("close")){
                    handle.removeClass("close");
                    handle.next().animate({height:70}).removeClass('toggle-up-1');
                }
                else{
                    handle.addClass("close");
                    handle.next().animate({height:210}).addClass('toggle-up-1');
                }
            },
            addToChart:function(obj){
                var addBtn = $.getObj(obj,"a");     
                if(addBtn.hasClass("unchecked")){
                    addBtn.removeClass("unchecked").addClass("checkedadded");               
                }
                else{
                     addBtn.removeClass("checkedadded").addClass("unchecked"); 
                }
                var totalRows = this.$("#camps_grid_report tr").length;
                var totalChecked = this.$(".checkedadded").length;
                
                if(totalRows==totalChecked){
                    if(this.$(".select-all:checked").length==0){
                        this.outside = true;
                    }
                     this.$('input.checkpanel').iCheck('check');
                }
                else{
                    if(this.$(".select-all:checked").length==1){
                        this.outside = true;
                    }
                    this.$('input.checkpanel').iCheck('uncheck');
                }
                
                this.createChart();
            },
            populateTableCount: function(camp){
                var countKeys = {"bounceCount":{type:'bounce',show:true,showPer:true},"clickCount":{type:'clicker',show:true,showPer:true},"conversionCount":{type:'converted',show:true,showPer:true},
                    "openCount":{type:'opener',show:true,showPer:true},"pageViewsCount":{type:'webVisit',show:true,showPer:true},"unSubscribeCount":{type:'unsubscribe',show:true,showPer:true},
                    "supressCount":{type:'supress',show:true,showPer:true},sentCount:{type:'sent',show:false,showPer:false}}
                _.each(countKeys,function(val,key){
                    var countHTML = camp[key];
                    var iconCSV = "";
                    if(countHTML!=="0"){
                        if(val.show){
                            countHTML = "<a class='showtooltip download-count-csv' data-type='"+val.type+"' title='Click to download as CSV'>"+camp[key]+"</a>";
                            iconCSV = "<div class='download-csv-icon showtooltip download-count-csv' data-type='"+val.type+"' title='Click to download as CSV'></div>";
                        }
                    }
                    var percentageHTML = "";
                    if(val.showPer && parseInt(camp.sentCount)!==0){
                        var percentage = (parseInt(camp[key])/parseInt(camp.sentCount)) * 100;
                        if(percentage > 0){
                          percentage =percentage.toFixed(2); 
                        }
                        percentageHTML = "<small class='show-percentage'>( "+percentage+"% )</small>"
                    }
                    
                    this.$("#camps_grid_report tr[data-checksum='"+camp['campNum.checksum']+"'] ."+key).html(countHTML + iconCSV + percentageHTML)                    
                    this.$("#camps_grid_report tr[data-checksum='"+camp['campNum.checksum']+"'] ."+key+" .download-count-csv").click(_.bind(this.openMappingDialog,this));
                    
                },this) 
                
            },
            calcPer: function(u,d){
                var percentage = "";
                if(d!=="0"){
                    percentage = (parseInt(u)/parseInt(d)) * 100;
                    if(percentage > 0){
                      percentage =" ("+percentage.toFixed(2) + "% )"; 
                    }
                    else{
                     percentage = "";   
                    }
                }
                return percentage;
            },
            createChart:function(){
                var _this = this;
                var _campaigns = $.map(this.$(".checkedadded"),function(el){
                    return el.id;
                }).join(",");
                
                if(_campaigns && this.chartPage){
                   this.$(".start-message").hide();
                   this.$(".col-cstats .campaign-chart").show();
                   this.app.showLoading("Creating Chart...",this.$(".cstats")); 
                   if(this.states_call){
                       this.states_call.abort();
                       this.states_call = null;
                   }
                   this.chart_data = {bounceCount:0,clickCount:0,conversionCount:0,facebookCount:0,googlePlusCount:0,linkedInCount:0
                                      ,openCount:0,pageViewsCount:0,pendingCount:0,pinterestCount:0,sentCount:0,supressCount:0,
                                      twitterCount:0,unSubscribeCount:0};
                   var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=stats";                  
                       //URL +="&campNums="+_campaigns;                      
                   var post_data = {campNums:_campaigns}    
                   this.states_call =  $.post(URL, post_data).done(function (data) {
                       var camp_json = jQuery.parseJSON(data);
                       var camp_index = 1;                       
                       _.each(camp_json.campaigns[0], function(val) {                          
                           _this.chart_data["bounceCount"] = _this.chart_data["bounceCount"] + parseInt(val[0].bounceCount);
                           _this.reportCSVData[camp_index][9] = parseInt(val[0].bounceCount) + _this.calcPer(val[0].bounceCount,val[0].sentCount);
                           _this.chart_data["clickCount"] = _this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                           _this.reportCSVData[camp_index][4] = parseInt(val[0].clickCount) + _this.calcPer(val[0].clickCount,val[0].sentCount);
                           _this.chart_data["conversionCount"] = _this.chart_data["conversionCount"] +parseInt(val[0].conversionCount);
                           _this.reportCSVData[camp_index][5] = parseInt(val[0].conversionCount)+ _this.calcPer(val[0].conversionCount,val[0].sentCount);
                           _this.chart_data["facebookCount"] = _this.chart_data["facebookCount"] + parseInt(val[0].facebookCount);
                           _this.chart_data["googlePlusCount"] = _this.chart_data["googlePlusCount"] + parseInt(val[0].googlePlusCount);
                           _this.chart_data["linkedInCount"] = _this.chart_data["linkedInCount"] + parseInt(val[0].linkedInCount);
                           _this.chart_data["openCount"] = _this.chart_data["openCount"] + parseInt(val[0].openCount);
                           _this.reportCSVData[camp_index][3] = parseInt(val[0].openCount) + _this.calcPer(val[0].openCount,val[0].sentCount);
                           _this.chart_data["pageViewsCount"] = _this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);
                           _this.reportCSVData[camp_index][6] = parseInt(val[0].pageViewsCount) + _this.calcPer(val[0].pageViewsCount,val[0].sentCount);
                           _this.chart_data["pendingCount"] = _this.chart_data["pendingCount"] + parseInt(val[0].pendingCount);
                           _this.chart_data["pinterestCount"] = _this.chart_data["pinterestCount"] + parseInt(val[0].pinterestCount);
                           _this.chart_data["sentCount"] = _this.chart_data["sentCount"] + parseInt(val[0].sentCount);
                           _this.reportCSVData[camp_index][2] = parseInt(val[0].sentCount);
                           _this.chart_data["supressCount"] = _this.chart_data["supressCount"] + parseInt(val[0].supressCount);
                           _this.reportCSVData[camp_index][8] = parseInt(val[0].supressCount) + _this.calcPer(val[0].supressCount,val[0].sentCount);
                           _this.chart_data["twitterCount"] = _this.chart_data["twitterCount"] + parseInt(val[0].twitterCount);
                           _this.chart_data["unSubscribeCount"] = _this.chart_data["unSubscribeCount"] + parseInt(val[0].unSubscribeCount);
                           _this.reportCSVData[camp_index][7] = parseInt(val[0].unSubscribeCount)+ _this.calcPer(val[0].unSubscribeCount,val[0].sentCount);;
                           
                           if(_this.setCounts==true){
                               _this.populateTableCount(val[0]);
                           }
                           camp_index++;
                       });
                       if(_this.setCounts==true){
                            _this.$("#camps_grid_report tr .download-count-csv").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                            _this.setCounts = false;
                       }
                       var _data =[
                        ['Action', 'Count'],
                          ['Opens',   _this.chart_data["openCount"]],
                          ['Page Views',       _this.chart_data["pageViewsCount"]],
                          ['Conversions',  _this.chart_data["conversionCount"]],
                          ['Clicks',    _this.chart_data["clickCount"]]
                      ];
                      
                      _this.chartPage.createChart(_data);
                      _this.app.showLoading(false,_this.$(".cstats"));
                      _.each(_this.chart_data,function(val,key){
                          var av = (parseInt(val)/parseInt(_this.chart_data.sentCount)) * 100;
                          if(av > 0){
                            av =av.toFixed(2); 
                          }
                          if(key=="sentCount"){
                              _this.$(".col-cstats ."+key).html(_this.app.addCommas(val));
                              _this.$(".total-row-stats ."+key) .html(_this.app.addCommas(val));
                          }else{
                              _this.$(".col-cstats ."+key).html(_this.app.addCommas(val));
                              _this.$(".total-row-stats ."+key) .html(_this.app.addCommas(val));
                              
                              _this.$(".col-cstats ."+key+"-p").html(_this.app.addCommas(av)+"%");                              
                              _this.$(".total-row-stats ."+key+"-p").html(_this.app.addCommas(av)+"%");
                            
                              
                          }
                          
                      });
                      
                       var campaigns_name = $.map(_this.$(".checkedadded"),function(el){
                            return $(el).parents("tr").find("span.campname").text();
                        })
                        var _options = "";
                        _.each(campaigns_name,function(val){
                            _options +="<option>"+val+"</option>"
                        });
                        _this.$(".selected-campaign").html(_options).trigger("chosen:updated");
                   });
                }
                else{
                   this.showStart(); 
                }
                
            },
            showStart:function(){
                this.$(".start-message").show();                    
                this.$(".col-cstats .campaign-chart").hide();
                this.$(".selected-campaign").html('<option></option>').trigger("chosen:updated");
            },
            showDatePicker:function(){
                this.$('#clearcal').show();
                return false;
            },
            hideDatePicker:function(){
                this.$('#clearcal').hide();
                this.fromDate = "";
                this.toDate = "";
                this.$('#daterange').val('');   
                this.getAllCampaigns(this.$(".filter-camp li.active").attr("last"));
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
                    }  else {
                        this.toDate = fromDate.format("MM-DD-YYYY");
                    }
                    this.getAllCampaigns(this.$(".filter-camp li.active").attr("last"));
                    if(parseInt(this.$(".filter-camp li.active").attr("last"))){
                         this.$('input.checkpanel').iCheck('check');
                    }else{
                        this.$('input.checkpanel').iCheck('uncheck');
                    }
               }
            },
            setDateRangeLi:function(obj){
                var target = $.getObj(obj,"li");
                if(!target.hasClass("ui-daterangepicker-dateRange")){
                    this.setDateRange();
                }
            },			
            previewCampaign: function(obj)
            {   
                    var target = $.getObj(obj,"span");
                    var camp_id=target.parents("tr").attr("id").split("_")[1],camp_name=target.text();
                    var camp_obj = this;                    			
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialog = camp_obj.app.showDialog({title:'Campaign Preview of &quot;' + camp_name + '&quot;' ,
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                        headerEditable:false,
                        headerIcon : 'dlgpreview',
                        bodyCss:{"min-height":dialog_height+"px"},
                        buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                    });	
                    camp_obj.app.showLoading("Loading Campaign HTML...",dialog.getBody());									
                    var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id+"&html=Y&original=N";                                
                    var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\""+preview_url+"\"></iframe>");                                                            
                    dialog.getBody().html(preview_iframe);
                    dialog.saveCallBack(_.bind(this.sendTextPreview,this,camp_id));

            },
            sendTextPreview:function(camp_id){
                    var camp_obj = this;
                    var dialog_width = 650;
                    var dialog_height = 100;
                    var dialog = camp_obj.app.showDialog({title:'Email Preview' ,
                                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20%"},
                                    headerEditable:false,
                                    headerIcon : 'copycamp',
                                    bodyCss:{"min-height":dialog_height+"px"},
                                    buttons: {saveBtn:{text:'Send',btnicon:'copycamp'} }
                    });	
                    var email_preview ='<div style=" min-height:100px;"  class="clearfix template-container gray-panel" id="create-template-container">';
                            email_preview +='<div class="cont-box" style="margin-top:10px; top:0; left:56%; width:90%;">';
                            email_preview +='<div class="row campname-container">';
                            email_preview +='<label style="width:10%;">To:</label>';
                            email_preview +='<div class="inputcont" style="text-align:right;">';
                            email_preview +='<input type="text" name="_email" id="send_email" placeholder="Enter comma separated email addresses" style="width:83%;" />';
                            email_preview +='</div></div></div></div>';
                            email_preview = $(email_preview);                                
                            dialog.getBody().html(email_preview);
                            email_preview.find("#send_email").focus();
                            email_preview.find("#send_email").keydown(_.bind(function(e){
                                    if(e.keyCode==13){
                                            this.sendTestCampaign(dialog,camp_id);
                                    }
                            },this))
                            dialog.saveCallBack(_.bind(this.sendTestCampaign,this,dialog,camp_id));
            },
            sendTestCampaign:function(dialog,camp_id){
                    var _this = this;
                    var _emails = dialog.$el.find("#send_email").val();
                    if(_emails){
                        var post_data = {toEmails:_emails};                            
                        this.app.showLoading("Sending Email...",dialog.$el);
                        var _this = this;
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+camp_id+"&type=email";
                        $.post(URL, post_data)
                        .done(function(data) {                                 
                            var _json = jQuery.parseJSON(data);                         
                            _this.app.showLoading(false,dialog.$el);          
                            if(_json[0]!=="err"){
                                    dialog.hide();
                                    _this.app.showMessge("Email sent successfully!");  
                            }
                            else{
                                    _this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                            }
                       });
               }
            },
            showChart:function(obj){
                var _ele = $.getObj(obj,"div");
                var left_minus = 96;
                var ele_offset = _ele.offset();                    
                var ele_height =  _ele.height();
                var top = ele_offset.top + ele_height - 134;
                var left = ele_offset.left-left_minus;      
                var _this = this;                            
                var camp_id= _ele.parents("tr").attr("id").split("_")[1];
                this.$(".campaign-name").html( _ele.parents("tr").find("h3 span.campname").text()); //Setting name of Campaign in Chart
                this.app.showLoading("Loading Chart...",this.$(".chart-dialog .chart-area"));                            
                if(!this.chartDialog){
                    require(["reports/campaign_pie_chart"],function(chart){                                    
                        _this.chartDialog = new chart({page:_this,legend:'none',chartArea:{width:"95%",height:"95%",left:'0px',top:'0px'}});
                        _this.$(".chart-dialog .campaign-chart").html(_this.chartDialog.$el);
                        _this.chartDialog.$el.css({"width":"280px","height":"280px"});                                   
                        _this.loadChart(camp_id);
                    });
                }
                else{
                     this.loadChart(camp_id);
                }
                this.$(".chart-dialog").css({"left":left+"px","top":top+"px"}).show();
            },
            closeChart:function(){
                this.$(".chart-dialog").hide();
            },
            loadChart:function(camp_id){                            
                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=stats";                  
                URL +="&campNums="+camp_id;       
                if(this.states_call_dialog){
                    this.states_call_dialog.abort();
                    this.states_call_dialog = null;
                }
                this.s_chart_data = {clickCount:0,conversionCount:0,openCount:0,pageViewsCount:0,sentCount:0};
                this.states_call_dialog = jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){                                
                    var camp_json = jQuery.parseJSON(xhr.responseText);                                
                    this.app.showLoading(false,this.$(".chart-dialog .chart-area"));                                   
                    _.each(camp_json.campaigns[0], function(val) {                                    
                       this.s_chart_data["clickCount"] = this.s_chart_data["clickCount"] + parseInt(val[0].clickCount);
                       this.s_chart_data["conversionCount"] = this.s_chart_data["conversionCount"] +parseInt(val[0].conversionCount);                                                                                                            
                       this.s_chart_data["openCount"] = this.s_chart_data["openCount"] + parseInt(val[0].openCount);
                       this.s_chart_data["pageViewsCount"] = this.s_chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);                                                                                                                                                
                       this.s_chart_data["sentCount"] = this.s_chart_data["sentCount"] + parseInt(val[0].sentCount);                                                                                                                                                
                   },this);
                    var _data =[
                     ['Action', 'Count'],
                       ['Opens',   this.s_chart_data["openCount"]],
                       ['Page Views',       this.s_chart_data["pageViewsCount"]],
                       ['Conversions',  this.s_chart_data["conversionCount"]],
                       ['Clicks',    this.s_chart_data["clickCount"]]
                   ];

                   this.chartDialog.createChart(_data);                               
                   _.each(this.s_chart_data,function(val,key){
                       this.$(".chart-dialog ."+key).html(this.app.addCommas(val));
                   },this);

                },this));
          },
            toggleSortOption: function (ev) {               
                $(this.el).find(".filter-camp").slideToggle();
                ev.stopPropagation();
            },
            openMappingDialog: function(e){
                var downloadLink = $(e.target);   
                var campNum = downloadLink.parents("tr").attr("id").split("_")[1];
                var options = {type:downloadLink.data("type"),campNum:campNum};                
                this.mapCSVFieldsDialog(options);
                e.stopPropagation();                     
            },
            mapCSVFieldsDialog: function(options){
                var dialog = this.app.showDialog({title: ' Map Your .CSV Layout',
                    css: {"width": "1200px", "margin-left": "-600px"},
                    bodyCss: {"min-height": "400px"},
                    buttons: {saveBtn: {text: 'Export CSV',btnicon:'downloadcsv'}}
                });
                var mPage = new mappingPage({camp: this, app: this.app, dialog: dialog});
                var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                dialog.getBody().append(mPage.$el);                    
                mPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                dialog.saveCallBack(_.bind(mPage.saveCall, mPage, options));
            },
            downloadCSV:function(){          
               var _date = new Date();
               var timeStamp = Date.UTC(_date.getFullYear(), _date.getMonth(), _date.getDate(), _date.getHours(), _date.getMinutes(), _date.getSeconds(), _date.getMilliseconds())
               this.csvGenerator(this.reportCSVData, timeStamp+'_CSV_Campaign_Summary.csv');               
            },
            csvGenerator :function (dataArray, fileName) {
                this.dataArray = dataArray;
                this.fileName = fileName;                                                            
                var linkElement = this.getLinkElement();
                linkElement.style.display = 'none';
                document.body.appendChild(linkElement);
                linkElement.click();                        
                document.body.removeChild(linkElement);                                            
            },
            getDownloadLink: function () {
                var separator = ',';
                var addQuotes = this.addQuotes;
                var rows = this.dataArray.map(function (row) {
                    var rowData = row.join(separator);
                    if (rowData.length && addQuotes) {
                        return '"' + rowData + '"';
                    }
                    return rowData;
                });

                var type = 'data:text/csv;charset=utf-8';
                var data = rows.join('\n');

                if (typeof btoa === 'function') {
                    type += ';base64';
                    data = btoa(data);
                } else {
                    data = encodeURIComponent(data);
                }

                return type + ',' + data;
            },
            getLinkElement: function (){
                var downloadLink = this.getDownloadLink();
                var fileName = this.fileName;
                var linkElement = (function() {
                    var a = document.createElement('a');
                    a.innerHTML ='';
                    a.href = downloadLink;
                    a.download = fileName;
                    return a;
                }());
                return linkElement;
            }
            
            
        });
});