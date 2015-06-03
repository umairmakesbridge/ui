define(['text!reports/html/report_row.html','jquery.searchcontrol','daterangepicker','jquery.icheck'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'act_row',                
                events: {                    
                   'click .delete':'removeReport',
                   'click .showDatePickerFromClick':'showDatePickerFromClick'
                },
                initialize: function () {
                    this.mapping = {campaigns:{label:'Campaigns',colorClass:'darkblue',iconClass:'open'},
                                    landingpages:{label:'Landing Pages',colorClass:'yellow',iconClass:'form2'},
                                    nurturetracks:{label:'Nurture Tracks',colorClass:'blue',iconClass:'track'},
                                    autobots:{label:'Autobots',colorClass:'grey',iconClass:'autobot'},
                                    tags:{label:'Tags',colorClass:'green',iconClass:'tags'}};
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
                    this.render();
                },
                render: function ()
                {                     
                  var mapObj = this.mapping[this.options.reportType];  
                  this.$el.html(this.template({
                      rType: mapObj.label,
                      rIcon: mapObj.iconClass
                  }));  
                  this.$el.addClass(mapObj.colorClass);
                  
                this.dateRangeControl = this.$('#daterange').daterangepicker();                
                this.dateRangeControl.panel.find(".btnDone").click(_.bind(this.setDateRange,this));
                this.dateRangeControl.panel.find("ul.ui-widget-content li").click(_.bind(this.setDateRangeLi,this));
                this.current_ws = this.$el.parents(".ws-content");
                //this.current_ws.find(".camp_header #workspace-header").css("margin-top","10px")
                this.$('.listsearch').searchcontrol({
                        id:'list-search',
                        width:'300px',
                        height:'22px',
                        placeholder: 'Search '+mapObj.label,                        
                        showicon: 'yes',
                        iconsource: 'campaigns'
                 });	                 
                  this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                removeReport:function(){
                    this.$el.remove();
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
                        //this.getAllCampaigns(this.$(".filter-camp li.active").attr("last"));
                        
                   }
                },
                setDateRangeLi:function(obj){
                    var target = $.getObj(obj,"li");
                    if(!target.hasClass("ui-daterangepicker-dateRange")){
                        this.setDateRange();
                    }
                },showDatePickerFromClick:function(){
                    this.$('#daterange').click();
                    return false;
                }

            });
        });
