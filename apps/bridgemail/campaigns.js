define(['jquery.bmsgrid','jquery.highlight','jquery.searchcontrol','text!html/campaigns.html','bms-filters','daterangepicker','moment','campaigns/collections/campaigns','campaigns/campaign_row'],
function (bmsgrid,jqhighlight,jsearchcontrol,template,bmsfilters,_daterangepicker,moment,campaignCollection,campaignRowView) {
        'use strict';
        return Backbone.View.extend({
			id: 'campaigns_list',
			tags : 'div',
			events: {				
                            "click #addnew_campaign":function(){             		
                                    this.createCampaign();
                            },
                            "keyup #daterange":function(){
                                    this.$el.find('#clearcal').show();
                            },
                            "click #clearcal":function(obj){
                                    this.$el.find('#clearcal').hide();
                                    this.$el.find('#daterange').val('');
                                    this.findCampaigns(obj);
                            },
                            "click .stattype":function(obj){					
                                    var camp_obj = this;
                                    var appMsgs = this.app.messages[0];
                                    var target = $.getObj(obj,"a");
                                    if(target.parent().hasClass('active')){
                                        return false;
                                    }
                                    camp_obj.$el.find('.stattype').parent().removeClass('active');
                                    target.parent().addClass('active');
                                    var type = target.attr("search");
                                     var fromDate = "";
                                    var toDate = "";
                                    var schDates = '';
                                    if(this.$('#daterange').val() != '')
                                    {
                                            schDates = this.$('#daterange').val().split(' - ');
                                            if(schDates != '' && schDates.length == 1)
                                            {
                                                    schDates[1] = schDates[0];
                                            }
                                    }
                                    var dateURL = false;
                                    if(schDates)
                                    {
                                            var fromDateParts = schDates[0].split('/');
                                            fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2,4);
                                            var toDateParts = schDates[1].split('/');
                                            toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2,4);
                                            dateURL = true;
                                    }
                                    //camp_obj.$el.find("#target-camps .bmsgrid").remove();
                                    camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#target-camps"));
                                    this.status = type;
                                    this.fromDate = fromDate;
                                    this.toDate = toDate;
                                    //var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&"+dateURL;				
                                    //console.log(URL);
                                    
                                    var filterObj = {status:type,fromDate:fromDate,toDate:toDate,date:dateURL};
                                    this.total_fetch = 0;
                                    this.getallcampaigns(0,filterObj);
                                   
                            },
                           
                           
                            "click .calendericon":function(obj)
                            {
                                    this.$el.find('#daterange').click();
                                    return false;
                            },
                            "click .cstats .closebtn":"closeChart"
			},			
			
			createCampaign: function()
			{
                            var camp_obj = this;
                            var dialog_title = "New Campaign";
                            var dialog = this.app.showDialog({title:dialog_title,
                                              css:{"width":"650px","margin-left":"-325px"},
                                              bodyCss:{"min-height":"100px"},							   
                                              headerIcon : 'new_headicon',
                                              buttons: {saveBtn:{text:'Create Campaign'} }                                                                           
                            });
                            this.app.showLoading("Loading...",dialog.getBody());
                            require(["newcampaign"],function(newcampPage){                                     
                                             var mPage = new newcampPage({camp:camp_obj,app:camp_obj.app,newcampdialog:dialog});
                                             dialog.getBody().html(mPage.$el);
                                             mPage.$("input").focus();
                                             dialog.saveCallBack(_.bind(mPage.createCampaign,mPage));
                            });
			},
			
			findCampaigns: function(obj)
			{
				var camp_obj = this;
				var appMsgs = this.app.messages[0];
				var target = $.getObj(obj,"a");
				if(target.html() != 'Date Range')
				{
                                    if(target.prevObject && target.prevObject[0].localName == 'span')
                                    {
                                        target = $.getObj(obj,"span");
                                        camp_obj.$el.find('.stattype').parent().removeClass('active');
                                        switch(target.attr("search"))
                                        {
                                                case "C":
                                                        camp_obj.$el.find('.sent').parent().addClass('active');
                                                        break;
                                                case "P":
                                                        camp_obj.$el.find('.pending').parent().addClass('active');
                                                        break;
                                                case "S":
                                                        camp_obj.$el.find('.scheduled').parent().addClass('active');
                                                        break;
                                                case "D":
                                                        camp_obj.$el.find('.draft').parent().addClass('active');
                                                        break;
                                        }						
                                    }
                                    var dateStart = target.attr('dateStart');
                                    var dateEnd = target.attr('dateEnd');
                                    var schDates = [];
                                    if(dateStart)
                                    {					
                                            schDates[0] = $.datepicker.formatDate( 'm/d/yy', Date.parse(dateStart) );
                                            schDates[1] = $.datepicker.formatDate( 'm/d/yy', Date.parse(dateEnd) );
                                    }
                                    else
                                    {
                                            schDates = this.$('#daterange').val().split(' - ');
                                            if(schDates != '' && schDates.length == 1)
                                            {
                                                    schDates[1] = schDates[0];
                                            }
                                    }
                                    if(schDates != '')
                                    {
                                            var fromDateParts = schDates[0].split('/');
                                            var fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2,4);
                                            var toDateParts = schDates[1].split('/');
                                            var toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2,4);
                                    }
                                    var type = target.attr("search");
                                    if(!type)
                                            type = $('#template_search_menu li.active a').attr('search');
                                            this.status = type;
                                    if(target.attr('class') == 'stattype topbadges')
                                    {
                                            camp_obj.$el.find('#template_search_menu li').removeClass('active');
                                            $('#template_search_menu').find("li").each(function(i) {
                                                    if($(this).find('a').attr('search') == type)
                                                            $(this).addClass('active');							
                                            });
                                    }
                                    //camp_obj.$el.find("#target-camps .bmsgrid").remove();
                                    camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#target-camps"));				
                                    if(schDates != ''){
                                            this.toDate = toDate;
                                            this.fromDate = fromDate;
                                        }      // var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&fromDate="+fromDate+"&toDate="+toDate;
                                    else{
                                           this.toDate = toDate;
                                            this.fromDate = fromDate;
                                        }
                                    this.total_fetch = 0;
                                    this.getallcampaigns();
                            }
			},
			initialize:function(){
			   this.template = _.template(template);
                           this.campaignCollection = new campaignCollection();  
			   this.render();
			},
			render: function () 
			{
                            this.$el.html(this.template({}));
                            this.app = this.options.app;
                            this.$campaginLoading = this.$(".loadmore");
                            this.offset = 0;
                            this.offsetLength = 0;
                            this.total_fetch  = 0;
                            this.status = "A";
                            this.toDate = '';
                            this.type = 'listNormalCampaigns';
                            this.fromDate = '';
                            this.searchTxt = '';
                            this.taglinkVal = false;
                            this.timeout = null;
                            var camp_obj = this;
                            camp_obj.getallcampaigns();
                            camp_obj.$el.find('div#campslistsearch').searchcontrol({
                                    id:'list-search',
                                    width:'300px',
                                    height:'22px',
                                    searchFunc:_.bind(this.searchCampaigns,this),
                                    clearFunc:_.bind(this.clearSearchCampaigns,this),
                                    placeholder: 'Search Campaigns',
                                    showicon: 'yes',
                                    iconsource: 'campaigns',
                                    countcontainer: 'no_of_camps'
                             });
                             
                             camp_obj.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
			},
			init:function(){				
                            this.$el.find('#daterange').daterangepicker();
                            $(".btnDone").click(_.bind(this.findCampaigns,this));
                            $(".ui-daterangepicker li a").click(_.bind(function(obj){
                                    this.$el.find('#clearcal').show();
                                    this.findCampaigns(obj);
                            },this));
                            $("#daterange").keyup(_.bind(function(obj){
                                    this.$el.find('#clearcal').show();
                                    this.findCampaigns(obj);
                            },this));
                            // var camp_obj = this;
                            this.headBadge();
                            this.current_ws = this.$el.parents(".ws-content");
                            this.tagDiv = this.current_ws.find("#campaign_tags");
                            $(window).scroll(_.bind(this.liveLoading,this));
                            $(window).resize(_.bind(this.liveLoading,this));
                            this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
                            this.tagDiv.hide();    
			},
			getallcampaigns: function (fcount,filterObj) {
                            if(!fcount){
                            this.offset = 0;
                            this.app.showLoading("Loading Campaigns...",this.$("#target-camps"));
                            this.$el.find('#camps_grid tbody').html('');           
                            this.$(".notfound").remove();
                            }
                            else{
                                this.offset = parseInt(this.offset) + this.offsetLength;
                                this.$("#camps_grid tbody").append('<tr class="loading-campagins"><td colspan="3"><div class="loadmore"><img src="img/loading.gif" alt=""/></div></td></tr>');
                            }
                              if(this.campaigns_request)
                              {
                                this.campaigns_request.abort();
                              }
                            var _data = {type : this.type}; 
                            _data['offset'] = this.offset;
                            if(filterObj){
                                        //console.log(filterObj);
                                      _data['status'] = this.status;
                                       if(filterObj.date){
                                           _data['fromDate'] = filterObj.fromDate;
                                           _data['toDate'] = filterObj.toDate;
                                       }
                                   }
                            if(this.toDate && this.fromDate){
                                _data['fromDate'] = this.fromDate;
                                _data['toDate'] =  this.toDate;
                            }
                            if(this.searchTxt){
                                _data['searchText'] = this.searchTxt;
                                
                            }
                            _data['status'] = this.status;
                            _data['bucket'] = 20;
                            this.campaigns_request = this.campaignCollection.fetch({data: _data,
                                success: _.bind(function(data1,collection) {
                                // Display items
                                this.$("#camps_grid tbody").find('.loading-campagins').remove();
                                  if (this.app.checkError(data1)) {
                                    return false;
                                }
                                this.offsetLength = data1.length;
                                this.total_fetch = this.total_fetch + data1.length;
                                console.log('offsetLength = '+ this.offsetLength + ' & total Fetch = ' + this.total_fetch);
                              
                                this.app.showLoading(false, this.$("#target-camps"));
                                //this.showTotalCount(response.totalCount);
                                this.$el.find("#total_templates .badge").html(collection.totalCount);
                               
                                this.showTotalCount(collection.totalCount);
                                //this.$campaginLoading.hide();
                                
                                 _.each(data1.models, _.bind(function(model){
                                    this.$el.find('#camps_grid tbody').append(new campaignRowView({model:model,sub:this}).el);
                                },this));
                                
                                if (this.total_fetch < parseInt(collection.totalCount)) {
                                    this.$(".campaign-box").last().attr("data-load", "true");
                                }
                                
                                if (this.offsetLength  == 0) {
                                    var search_message = "";
                                    if (this.searchTxt) {
                                        search_message += " containing '" + this.searchTxt + "'";
                                    }
                                    this.$el.find('#camps_grid tbody').before('<p class="notfound">No Campaigns found' + search_message + '</p>');
                                }

                            }, this),
                            error: function(collection, resp) {

                                }
                            });
                    
			},
			
                        showChart:function(obj){
                            var _ele = $.getObj(obj.evobj,"div");
                            var left_minus = 96;
                            var ele_offset = _ele.offset();                    
                            var ele_height =  _ele.height();
                            var top = ele_offset.top + ele_height - 134;
                            var left = ele_offset.left-left_minus;      
                            var _this = this;                            
                            var camp_id= obj.camp_id;
                            this.$(".campaign-name").html(obj.camp_name); //Setting name of Campaign in Chart
                            this.app.showLoading("Loading Chart...",this.$(".cstats .chart-area"));                            
                            if(!this.chartPage){
                                require(["reports/campaign_pie_chart"],function(chart){                                    
                                    _this.chartPage = new chart({page:_this,legend:'none',chartArea:{width:"95%",height:"95%",left:'0px',top:'0px'}});
                                    _this.$(".campaign-chart").html(_this.chartPage.$el);
                                    _this.chartPage.$el.css({"width":"280px","height":"280px"});                                   
                                    _this.loadChart(camp_id);
                                });
                            }
                            else{
                                 this.loadChart(camp_id);
                            }
                                                        
                            
                            this.$(".cstats").css({"left":left+"px","top":top+"px"}).show();
                        },
                        closeChart:function(){
                            this.$(".cstats").hide();
                        },
                        loadChart:function(camp_id){                            
                            var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=stats";                  
                            URL +="&campNums="+camp_id;       
                            if(this.states_call){
                                this.states_call.abort();
                                this.states_call = null;
                            }
                            this.chart_data = {clickCount:0,conversionCount:0,openCount:0,pageViewsCount:0,sentCount:0};
                            this.states_call = jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){                                
                                var camp_json = jQuery.parseJSON(xhr.responseText);                                
                                this.app.showLoading(false,this.$(".cstats .chart-area"));                                   
                                _.each(camp_json.campaigns[0], function(val) {                                    
                                   this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                                   this.chart_data["conversionCount"] = this.chart_data["conversionCount"] +parseInt(val[0].conversionCount);                                                                                                            
                                   this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                                   this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);                                                                                                                                                
                                   this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);                                                                                                                                                
                               },this);
                                var _data =[
                                 ['Action', 'Count'],
                                   ['Opens',   this.chart_data["openCount"]],
                                   ['Page Views',       this.chart_data["pageViewsCount"]],
                                   ['Conversions',  this.chart_data["conversionCount"]],
                                   ['Clicks',    this.chart_data["clickCount"]]
                               ];

                               this.chartPage.createChart(_data);                               
                               _.each(this.chart_data,function(val,key){
                                   this.$("."+key).html(this.app.addCommas(val));
                               },this);
                               
                            },this));
                      },
                       liveLoading:function(){
                        var $w = $(window);
                        var th = 200;
                        var inview = this.$("#camps_grid tbody tr:last").filter(function() {
                            var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                            return eb >= wt - th && et <= wb + th;
                          });
                        if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                           inview.removeAttr("data-load");                        
                           this.getallcampaigns(this.offsetLength);
                        }  
                    },
                    searchCampaigns:function(o,txt){
                        
                    this.type = '';
                    this.searchTxt = txt;
                    this.total_fetch = 0;
                    this.type = 'searchNormalCampaigns';
                    if (this.taglinkVal) {

                        this.getallcampaigns();
                        this.taglinkVal = false;
                    } else {
                        var keyCode = this.keyvalid(o);
                        if(keyCode){
                            if (this.searchTxt.length > 2) {

                                this.timeout = setTimeout(_.bind(function() {
                                    clearTimeout(this.timeout);
                                    this.getallcampaigns();
                                }, this), 500);
                            }
                            this.$('#campslistsearch input').keydown(_.bind(function() {
                                clearTimeout(this.timeout);
                            }, this));
                        }else{
                            return false;
                        }
                        
                    }
                    
            },
             /**
            * Clear Search Results
            * 
            * @returns .
            */
            clearSearchCampaigns:function(){
               
                this.searchTxt = '';
                this.total_fetch = 0;
                this.type = 'listNormalCampaigns';
                this.getallcampaigns();                
            },
            showTotalCount:function(count){
               
                                      
                var _text = parseInt(count)<="1"?"Campaign":"Campaigns";
                var text_count = '<strong class="badge">'+this.app.addCommas(count)+'</strong>';
               
                if(this.searchTxt){
                    this.$("#total_templates").html(text_count+_text+" found containing text '<b>"+this.searchTxt+"</b>'");
                }
                else{
                    this.$("#total_templates").html(text_count+_text);
                }     
                
            },
            headBadge:function(){
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");
                    active_ws.find("#addnew_action").attr("data-original-title", "Add new Campaign").click(_.bind(this.createCampaign, this));
                    var URL = '/pms/io/campaign/getCampaignData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    $.post(URL, {type: 'allStats'})
                            .done(_.bind(function(data) {
                                var allStats = jQuery.parseJSON(data);
                                if (this.app.checkError(allStats)) {
                                    return false;
                                }
                                var header_title = active_ws.find(".camp_header .edited");
                                header_title.find('ul').remove();
                                var stats = '<ul class="c-current-status">';
                                stats += '<li><span class="badge pclr18 showtooltip stattype topbadges" tabindex="-1" search="C" data-original-title="Click to view sent campaigns">' + allStats['sent'] + '</span>Sent</li>';
                                stats += '<li><span class="badge pclr6 showtooltip stattype topbadges" tabindex="-1" search="P" data-original-title="Click to view pending campaigns">' + allStats['pending'] + '</span>Pending</li>';
                                stats += '<li><span class="badge pclr2 showtooltip stattype topbadges" tabindex="-1" search="S" data-original-title="Click to view scheduled campaigns">' + allStats['scheduled'] + '</span>Scheduled</li>';
                                stats += '<li><span class="badge pclr1 showtooltip stattype topbadges" tabindex="-1" search="D" data-original-title="Click to view draft campaigns">' + allStats['draft'] + '</span>Draft</li>';
                                stats += '</ul>';
                                header_title.append(stats);
                                $(".c-current-status li span").click(_.bind(this.findCampaigns, this));
                                header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                                //header_title.find(".c-current-status li a").click(_.bind(camp_obj.$el.find('.stattype').click(),camp_obj));
                            },this));
                        },
                   keyvalid:function(event){
                        var regex = new RegExp("^[A-Z,a-z,0-9]+$");
                        var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
                         if (event.keyCode == 8 || event.keyCode == 32 || event.keyCode == 37 || event.keyCode == 39) {
                            return true;
                        }
                        else if (regex.test(str)) {
                            return true;
                        }
                       else{
                            return false;
                        }
                        event.preventDefault();
                   }
                        
		});
});
