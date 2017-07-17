define(['text!reports/html/campaign_pie_chart.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Workflow Reports page 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                /**
                 * Attach events on elements in view.
                 */
                events: {
                },
                /**
                 * Initialize view - backbone .
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.render();
                },
                /**
                 * Initialize view .
                 */
                render: function () {
                    this.$el.html(this.template({}));
                    this.app = this.options.page.app;
                    this.checkSum = this.options.checkSum ? this.options.checkSum : "";
                    this.colors = this.options.colors ? this.options.colors : ['#8b9ca5','#ffb864','#5e63b3','#66a2cd','#39c8a9','#f71a1a'];
                    this.BMS_TOKEN = this.app.get('bms_token');
                    this.element = this.options.chartElement;
                    this.toDate = this.options.toDate;
                    this.fromDate = this.options.fromDate;
                    this.ids = new Array;
                    this.stepId = null;
                    this.campNum = new Array;
                    var that = this;
                    //Chart options for main chart
                    this.chartOptions = {
                            
                            colors: this.colors,
                            credits: {
                                enabled : false
                            },
                            title: {
                                text: ''
                            //	    margin: 150
                            },
                            subtitle: {
                                text: 'Workflow Activity'
                            },
                            xAxis:{
                            },
                            yAxis: [{
                                minorGridLineColor: '#E0E0E0',
                                minorTickInterval: 'auto',
                                minorGridLineDashStyle: 'longdash',
                                min: 0,
                                title: {
                                    text: 'Sent and Pending'
                                }
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Converted'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Page Views'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Clicks'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Opens'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Actions'
                                },
                                opposite: true
                            }
                            ],
                            exporting:{  buttons:{
                                            contextButton:{
                                                x:-10,
                                                y:30
                                            }
                                        }
                            },
                            legend: {
                                layout: 'horizontal',
                                backgroundColor: '#FFFFFF',
                                align: 'center',
                                verticalAlign: 'top',                                
                                y: 40,                                
                                shadow: true
                            },
                            plotOptions: {
                                series: {
                                    stacking: '',
                                    cursor: 'pointer',
                                    point:{
                                        events:{
                                            click: function(){
                                                that.stepId = that.ids[this.category];                                                
                                                that.SecondChart(that.ids[this.category],this.category);
                                                
                                            }
                                        }
                                    }
                                }
                            },
                            column: {
                                pointPadding: 0.1,
                                borderWidth: 0,
                                dataLabels: {
                                    enabled: true
                                }
                            },
                            spline: {
                                dataLabels: {
                                    enabled: true
                                }

                            },
                            series: [
                            {
                                name: 'Sent Count',
                                type: 'column',
                                yAxis: 0
                            },
                            {
                                name: 'Pending Count',
                                type: 'column',
                                yAxis: 0
                            },
                            {
                                name: 'Opens Count',
                                type: 'spline',
                                yAxis: 1

                            },
                            {
                                name: 'Clicks',
                                type: 'spline',
                                yAxis: 1
                            },
                            {
                                name: 'Web Visits',
                                type: 'spline',
                                yAxis: 1
                            },
                            {
                                name: 'Converted',
                                type: 'spline',
                                yAxis: 1
                            }
                            ]
                        }
                        /*
                         *  Set up our options for the second chart
                         */
                        this.chart2Options = {
                            chart: {
                                renderTo: 'container1'
                            },
                            colors: this.colors,
                            credits: {
                                enabled : false
                            },
                            subtitle: {
                                text: 'Options Performance Analysis'
                            },
                            xAxis:{

                            },
                            yAxis: [{
                                minorGridLineColor: '#E0E0E0',
                                minorTickInterval: 'auto',
                                minorGridLineDashStyle: 'longdash',
                                min: 0,
                                title: {
                                    text: 'Sent and Pending'
                                }
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Converted'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Page Views'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Clicks'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Opens'
                                },
                                opposite: true
                            },
                            {
                                min: 0,
                                title: {
                                    text: 'Actions'
                                },
                                opposite: true
                            }
                            ],
                            legend: {
                                layout: 'horizontal',
                                backgroundColor: '#FFFFFF',
                                align: 'center',
                                verticalAlign: 'top',
                                //	    x: 70,
                                y: 40,
                                shadow: true
                            },
                            plotOptions: {
                                series: {
                                    stacking: '',
                                    cursor: 'pointer',
                                    point:{
                                        events:{
                                            click: function(){ //Populations
                                                var optionNumber = that.ids[this.category];
                                                var campnum = that.campNum[this.category];
                                                var url = '/pms/trigger/viewWorkflowSubscribers.jsp?BMS_REQ_TK='+that.BMS_TOKEN+'&workflowId='                                                
                                                that.viewSubs(that.stepId,optionNumber,this.series.name,campnum)
                                            }
                                        }
                                    }
                                }
                            },
                            column: {
                                pointPadding: 0.1,
                                borderWidth: 0,
                                dataLabels: {
                                    enabled: true
                                }
                            },
                            spline: {
                                dataLabels: {
                                    enabled: true
                                }

                            },
                            series: [
                            {
                                name: 'Sent Count',
                                type: 'column',
                                yAxis: 0
                            },
                            {
                                name: 'Pending Count',
                                type: 'column',
                                yAxis: 0
                            },
                            {
                                name: 'Opens Count',
                                type: 'spline',
                                yAxis: 1

                            },
                            {
                                name: 'Clicks',
                                type: 'spline',
                                yAxis: 1
                            },
                            {
                                name: 'Web Visits',
                                type: 'spline',
                                yAxis: 1
                            },
                            {
                                name: 'Converted',
                                type: 'spline',
                                yAxis: 1
                            }
                            ]
                        }
                }
                ,
                /**
                 * 
                 * @param {JSON} json
                 * @param {String} label
                 * @param {String} chart
                 * @returns 
                 */
                SetCategories: function(json,label,chart){
                    var i = 0;
                    var categories = new Array;
                    //var ids = new Array;
                    try{
                        for (var key in json[0]){
                            categories[i] = json[0][key][0].label;
                            this.ids[json[0][key][0].label] = json[0][key][0].id
                            this.campNum[json[0][key][0].label] = json[0][key][0].campNum
                            i++;
                        }
                    }
                    catch(e){
                        alert(e.message)
                    }
                    chart.xAxis[0].setCategories(categories);
                },
                /**
                 * 
                 * @param {json} json
                 * @param {string} chart
                 * @returns false
                 */
                LoadData: function(json,chart){
                    var i = 0;
                    this.data = new Array;
                    this.sent = new Array;
                    this.pending = new Array;
                    this.opened = new Array;
                    this.clicked = new Array;
                    this.pageViews = new Array;
                    this.converted = new Array;
                    this.results = json[0]
                    try{
                        for (var key in this.results){
                            this.data[i] = this.results[key][0]
                            i++;
                        }
                        i = 0
                        _.each(this.data,function(val,obj){
                            this.sent[i] = (this.data[obj].sent == '-' ? 0 : parseFloat(this.data[obj].sent))
                            this.pending[i] = (this.data[obj].pending == '-' ? 0 : parseFloat(this.data[obj].pending))
                            this.opened[i] = (this.data[obj].opened == '-' ? 0 : parseFloat(this.data[obj].opened))
                            this.clicked[i] = (this.data[obj].clicked == '-' ? 0 : parseFloat(this.data[obj].clicked))
                            this.pageViews[i] = (this.data[obj].pageViews == '-' ? 0 : parseFloat(this.data[obj].pageViews))
                            this.converted[i] = (this.data[obj].converted == '-' ? 0 : parseFloat(this.data[obj].converted))
                            i++
                        },this)
                    } catch (e){
                        alert(e.message)
                    }
                    chart.series[0].data = this.sent
                    chart.series[1].data = this.pending
                    chart.series[2].data = this.opened
                    chart.series[3].data = this.clicked
                    chart.series[4].data = this.pageViews
                    chart.series[5].data = this.converted
                },
                /**
                 *                  
                 * @returns 
                 */
                createChart: function(){                    
                    var workflowId = this.model.get("workflowId");
                    var token = this.BMS_TOKEN;
                    var isSAM = false;
                    var fromDate = this.fromDate;
                    var toDate = this.toDate;
                    var that = this;
                    // Perform an ajax request to workflowToJSON to get our chart data
                    $.ajax({
                        url: '/pms/trigger/workflowToJSON.jsp',
                        dataType: 'json',
                        data: 'BMS_REQ_TK='+ token + '&workflowId=' + workflowId + '&isSAM=' + isSAM + "&fromDate=" + fromDate + "&toDate=" + toDate,
                        async: true,
                        cache: false,
                        error: function(){
                            console.log('some thing wrong with json or url');
                        },
                        success: function(json1){
                            try{
                                
                                that.LoadData(json1.steps,that.chartOptions); //Load our chart with data
                                //this.chart = new Highcharts.Chart(this.chartOptions);                               
                                that.$el.highcharts(that.chartOptions);  
                                that.chart = that.$el.highcharts();
                                that.SetCategories(json1.steps,'Step',that.chart); // set the y-axis categories for the chart
                                that.app.showLoading(false, that.element);
                                that.chart.setTitle({
                                    text: json1.workflowName
                                }) // Set the chart title
                                that.chart.redraw();
                                
                               
                            } catch(e){
                               that.app.showAlert(e.message, that.$el.parents(".ws-content.active"));                                    
                            }
                        }
                    })
                },
                /**
                 * 
                 * @param {type} stepId
                 * @returns 
                 */
                SecondChart: function(stepId,chartTitle){
                    var token = this.BMS_TOKEN;
                    var workflowId = this.model.get("workflowId");;
                    var isSAM = false;
                    var fromDate = this.fromDate;
                    var toDate = this.toDate;
                    var that = this;
                    
                    if(that.element.find(".step-chart").length==0){
                        that.element.append($("<div class='step-chart'></div>"));
                    }
                    that.app.showLoading("Loading Step...", that.element.find(".step-chart"));
                    
                    $.ajax({
                        url: '/pms/trigger/workflowToJSON.jsp',
                        dataType: 'json',
                        data: 'BMS_REQ_TK='+ token + '&workflowId=' + workflowId + '&stepId=' + stepId + '&isSAM=' + isSAM  + "&fromDate=" + fromDate + "&toDate=" + toDate,
                        async: true,
                        cache: false,
                        success: function(response){
                            try{
                                that.LoadData(response.options,that.chart2Options);
                                that.element.find(".step-chart").highcharts(that.chart2Options);  
                                that.chart2 = that.element.find(".step-chart").highcharts();                                
                                that.chart2.showLoading();
                                that.SetCategories(response.options,'Option',that.chart2);                                
                                that.chart2.hideLoading();
                                if(that.chart2 && that.chart2.setTitle){
                                    that.chart2.setTitle({
                                        text: chartTitle
                                    });
                                }
                            } catch(e){
                                that.element.find(".step-chart").remove();
                                var errorMessage = e.message;
                                if(e.message=="json is undefined"){
                                    errorMessage = "No data found for selected step.";                                    
                                }                                
                                that.app.showAlert(errorMessage, that.$el.parents(".ws-content.active"));   
                            }

                        }
                    }
                    )
                },
                /**
                 * 
                 * @param {Int} stepId
                 * @param {Int} optionNumber
                 * @param {Object} series
                 * @param {String} campNum
                 * @returns {false}
                 */
                viewSubs: function(stepId, optionNumber, series, campNum){                    
                    var workflowId = this.model.get("workflowId");                                                            
                    var isSAM = false;
                    var fromDate = this.fromDate;
                    var toDate = this.toDate;
                    var viewType = "";
                    var ws_title_part = "";
                    var responderURL = "/pms/trigger/viewWorkflowSubscribers.jsp";
                    var params = {stepId:stepId,optionNumber:optionNumber,viewType:'',actionType:'E',toDate:toDate,fromDate:fromDate,isJson:'Y',wfName:this.model.get("name"),
                                  stepNumber:this.chart2.title.textStr,campNum:campNum};
                    switch(series){
                        case 'Sent Count':
                            viewType = 'S';
                            ws_title_part = "Sent Subscribers";                            
                            break;
                        case 'Pending Count':
                            viewType = 'P'
                            ws_title_part = "Pending Subscribers";
                            break;
                        case 'Opens Count':
                            viewType = 'OP';
                            ws_title_part = "Opened Subscribers";
                            break;
                        case 'Clicks':
                            viewType = 'CK';
                            ws_title_part = "Clicked Subscribers";
                            break;
                        case 'Web Visits':
                            viewType = 'WV';
                            ws_title_part = "Email Responders Web Activity";
                            responderURL = "/pms/io/campaign/getResponders/";
                            params = {responderType:'WV',type:'campaignResponders',campNum:campNum,wfName:this.model.get("name"),
                                  stepNumber:this.chart2.title.textStr,stepId:stepId,optionNumber:optionNumber,toDate:toDate,fromDate:fromDate};
                            break;
                        case 'Converted':
                            viewType = 'CONV';
                            ws_title_part = "Converted Subscribers";
                            break;
                        default:
                    }
                     params['url'] = responderURL;
                    if(viewType!=="WV"){
                        params['viewType'] = viewType;
                    }
                    
                    var checkSum =  this.model.get("workflowId.checksum")+viewType+optionNumber;
                    var ws_title =  this.chart2.title.textStr + " - <i><u>"+ ws_title_part+"</u></i>";                    
                    this.app.mainContainer.openPopulation({objId: workflowId, ws_title: ws_title, objCheckSum: checkSum,type:"workflow",params:params});
                    /*if (viewType == 'WV'){
                        window.open('/pms/report/ViewWebActivityForCampaign.jsp?BMS_REQ_TK='+token+'&campNum='+campNum+"&fromDate="+fromDate+"&toDate="+toDate
                            ,'_blank', 'width=900,height=650,top=100,left=100,screenX=100,screenY=100,scrollbars=yes,status=yes,resizable=yes');

                    } else if(isSAM == 'true') {
                        window.open('/pms/trigger/viewCCWorkflowSubscribers.jsp?BMS_REQ_TK='+token+'&workflowId='+workflowId
                            +'&stepId='+stepId+'&optionNumber='+optionNumber+'&actionType=E&viewType='+viewType+"&fromDate="+fromDate+"&toDate="+toDate
                            ,'_blank', 'width=900,height=650,top=100,left=100,screenX=100,screenY=100,scrollbars=yes,status=yes,resizable=yes');

                    } else {
                        window.open('/pms/trigger/viewWorkflowSubscribers.jsp?BMS_REQ_TK='+token+'&workflowId='+workflowId
                            +'&stepId='+stepId+'&optionNumber='+optionNumber+'&actionType=E&viewType='+viewType+"&fromDate="+fromDate+"&toDate="+toDate
                            ,'_blank', 'width=900,height=650,top=100,left=100,screenX=100,screenY=100,scrollbars=yes,status=yes,resizable=yes');
                    }*/
                }
            });
        });