define(['text!reports/html/reportflow.html','reports/report_row','reports/report_placeholder'],
        function (template, reportRow, reportPlaceholder) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'content-inner',
                events: {                    
                     'click .addbar li':'addReport',
                     'click .add-report button':'addReport',
                     'click .help-video':'showVideo'
                },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
                    this.editable = true;
                    this.beforeElement = null;
                    this.models = [];                    
                    if (this.options.params) {
                        if(this.options.params.report_id){
                            this.reportId = this.options.params.report_id;
                        }
                        if(this.options.params.parent){
                            this.parentWS = this.options.params.parent;
                        }
                    }                    
                    this.render();
                },
                render: function ()
                {                     
                  this.$el.html(this.template({}));                    
                  this.checkBridgeStats();
                  this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                  
                },
                init: function () {
                    this.current_ws = this.$el.parents(".ws-content"); 
                    this.ws_header = this.current_ws.find(".camp_header .edited"); 
                    
                    
                   this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});                        
                                                         
                   var deleteIcon = $('<a class="icon delete showtooltip" title="Delete Report" style="margin-top:0px"></a>');                                                         
                   this.ws_header.find(".pointy").remove();                   
                   this.ws_header.find("h2").append(deleteIcon);
                   deleteIcon.click(_.bind(this.deleteReportDialog,this));
                                      
                    if(this.current_ws.find("#workspace-header").hasClass("header-edible-campaign")===false){
                        this.current_ws.find(".camp_header #workspace-header").addClass("showtooltip").attr("title","Click to rename").click(_.bind(this.showHideTitle,this));                   
                        this.current_ws.find("#workspace-header").addClass('header-edible-campaign');                                                         
                        this.current_ws.find(".camp_header .cancelbtn").click(_.bind(function(obj){                        
                              this.showHideTitle();                        
                         },this));
                         this.current_ws.find(".camp_header .savebtn").click(_.bind(this.renameReport,this));
                         this.current_ws.find(".camp_header  #header_wp_field").keyup(_.bind(function(e){
                             if(e.keyCode==13){
                                this.current_ws.find(".camp_header .savebtn").click();
                             }
                         },this));
                    }
                    
                    this.current_ws.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});                    
                    
                    this.getSettings();
                },
                addReport:function(event,obj,loadReport){
                    var rType ="";
                    if(typeof(event)=="object"){
                        if(event.target.tagName=="I" || event.target.tagName=="BUTTON"){
                            rType = $.getObj(event, "button").attr("data-type");
                        }
                        else{
                            rType = $.getObj(event, "li").attr("data-type");
                        }
                    }
                    else{
                        rType = event;
                    }                    
                    var objects = (obj) ? obj[obj.type]:null;
                    var row_view = new reportRow({reportType:rType,sub:this,row_obj:obj,objects:objects,loadReport:loadReport});                    
                    this.beforeElement = null;
                    if(typeof(event)=="object"){
                        var placeHolderRow = $(event.target).parents(".report-placeholder");
                        if(placeHolderRow.length){
                            this.beforeElement = parseInt(placeHolderRow.attr("t_order"));
                        }
                    }
                    if(!this.beforeElement){
                        this.models.push(row_view);
                    }
                    row_view.orderNo = this.models.length;                    
                    if(loadReport){
                        this.$(".report-empty").hide();
                        row_view.$el.insertBefore(this.$(".add-panel"));   
                        var placeholder_view = new reportPlaceholder({sub:this});                        
                        placeholder_view.$el.attr("t_order",this.models.length);
                        placeholder_view.$el.insertBefore(row_view.$el);
                    }
                    else{
                        row_view.openSelectionDialog();
                        row_view.doDraw = true;
                    }
                },
                insertReportRow: function(row_view){
                    if(this.beforeElement){
                        this.models.splice(this.beforeElement-1,0,row_view);
                        row_view.$el.insertBefore(this.$(".report-placeholder[t_order='"+this.beforeElement+"']"));                                            
                    }
                    else{
                        row_view.$el.insertBefore(this.$(".add-panel"));                          
                    }
                    var placeholder_view = new reportPlaceholder({sub:this});                                                
                    placeholder_view.$el.insertBefore(row_view.$el);
                    this.reOrderPlaceHolder();                        
                },
                reOrderPlaceHolder : function(){
                    var placeholders = this.$(".report-placeholder");
                    _.each(placeholders,function(val,index){
                        $(val).attr("t_order",index+1);
                        this.models[index].orderNo = index+1;
                    },this);
                },
                saveSettings:function(){
                    var URL = "/pms/io/user/customReports/?BMS_REQ_TK="+this.app.get('bms_token');                    
                    var page_json = this.getPageJSONString();
                    $.post(URL, { type:'update',p_json:page_json,reportId:this.reportId })
                      .done(_.bind(function(data) {                              
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                 
                             this.app.showMessge("Report updated successfully!");                                                                
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);
                          }							                            
                     },this));
                },
                getSettings:function(){
                    var bms_token = this.app.get('bms_token');     
                    var URL = "/pms/io/user/customReports/?BMS_REQ_TK=" + bms_token + "&type=get&reportId_csv="+this.reportId;
                    this.app.showLoading('Loading Report...', this.$el);
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        /*-----Remove loading------*/
                           this.app.removeSpinner(this.$el);
                         /*------------*/
                        if (this.app.checkError(_json)) {
                            return false;
                        }                             
                        if(_json && _json.count!=="0"){
                            _json = _json.reports[0].report1[0];
                            var workspace_id = this.current_ws.attr("id");
                            this.ws_header.find("#workspace-header").html(_json.reportName);
                            this.app.mainContainer.setTabDetails({workspace_id:workspace_id,heading:_json.reportName,subheading:"Analytics"});
                            if(_json.p_json){
                                var page_json = jQuery.parseJSON(this.app.decodeHTML(_json.p_json));
                                if(page_json.length){
                                    for(var i=0;i<page_json.length;i++){
                                        //if(page_json[i].type!=="webstats"){
                                            this.addReport(page_json[i].type,page_json[i],true);
                                        //}
                                    }
                                }
                            }else{
                               // this.addReport('campaigns');
                            }
                        }
                        else{
                            //this.addReport('campaigns');
                        }
                        
                    },this));
                },
                getPageJSONString:function(){
                    var report_json = [];
                    _.each(this.models,function(val,index){
                        var type = val.reportType;
                        var report_obj = {type:type};
                        var obj_models = val.modelArray;
                        report_obj[type]=[];                        
                        _.each(obj_models,function(r_val,r_index){
                            var selected_obj = {};
                            var id ="";                            
                            if(type=="campaigns"){
                               id = r_val.get("campNum.encode");                                
                            } else if(type=="landingpages"){
                               id = r_val.get("pageId.encode"); 
                            }else if(type=="autobots"){
                               id = r_val.get("botId.encode"); 
                            }else if(type=="nurturetracks"){
                               id = r_val.get("trackId.encode"); 
                            }else if(type=="tags"){
                               id = r_val.get("tag"); 
                            }else if(type=="webforms"){
                               id = r_val.get("formId.encode"); 
                            }else if(type=="webstats"){
                               id = r_val.id; 
                               selected_obj['subtype'] =r_val.subtype;
                               selected_obj['campMapping'] =r_val.campMapping;
                            }else if(type=="funnel"){
                                id = r_index;
                                selected_obj['level'+r_index] = [];                                                                
                                _.each(r_val,function(f_val){
                                    var obj_json = {"tag":f_val.get("tag"),"subCount":f_val.get("subCount")};
                                    if(val.subType!=="tag"){
                                        obj_json['id'] = f_val.get("id");
                                        obj_json['checkSum'] = f_val.get("checkSum");
                                    }
                                    selected_obj['level'+r_index].push(obj_json);
                                },this);
                            }
                            else if(type=="workflows"){
                                id = r_val.get("workflowId"); 
                                selected_obj['checkSum'] =r_val.get("workflowId.checksum");
                            }
                            else if(type=="lists"){
                                id = r_val.get("listNumber.encode"); 
                            }
                            
                            selected_obj['id'] = id;
                            if(type=="nurturetracks"){
                                selected_obj['checked'] =true;
                            }
                            else{
                                selected_obj['checked'] = true;//val.$("[value='"+id+"']").is(":checked")?true:false;
                            }
                            
                            report_obj[type].push(selected_obj);          
                        },this);       
                        if(type=="funnel"){
                            report_obj['subType'] = val.subType;
                        }
                        if(val.toDate){
                            report_obj['toDate'] = val.toDate;
                        }
                        if(val.fromDate){
                            report_obj['fromDate'] = val.fromDate;
                        }
                        report_obj['dateRange'] = val.dateRange;    
                        report_json.push(report_obj);
                    },this);
                                        
                    return JSON.stringify(report_json);
                },
                removeMode:function(no){                    
                    this.models.splice(no-1,1);
                    if(this.models.length==0){
                        this.$(".report-empty").fadeIn();
                    }
                    this.reOrderPlaceHolder(); 
                },
                removeUndrawModel:function(no){                    
                    this.models.splice(no-1,1);                    
                },                
                showHideTitle:function(show,isNew){
                    if(this.editable==false){
                        return false;
                    }
                    var current_ws = this.current_ws.find(".camp_header");
                    if(show){
                        current_ws.find("h2").hide();
                        current_ws.find(".workspace-field").show().css("margin-top","6px");                    
                        current_ws.find(".tagscont").hide();                   
                        current_ws.find("#header_wp_field").val(this.app.decodeHTML(this.current_ws.find("span#workspace-header").html())).focus();                    
                    }
                    else{
                        current_ws.find("h2").show();
                        current_ws.find(".workspace-field").hide();    
                        current_ws.find(".tagscont").show();
                    }
                },
                renameReport:function(obj){                    
                    var nt_name_input =  $(obj.target).parents(".edited").find("input");                                           
                    var workspace_head = this.current_ws.find(".camp_header");
                    var URL = "/pms/io/user/customReports/?BMS_REQ_TK="+this.app.get('bms_token');
                    $(obj.target).addClass("saving");
                    $.post(URL, { type: "rename",reportName:nt_name_input.val(),reportId:this.reportId })
                      .done(_.bind(function(data) {                              
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                  
                             workspace_head.find("span#workspace-header").html(this.app.encodeHTML(nt_name_input.val()));                                                                                                 
                             this.showHideTitle();
                             this.app.showMessge("Report renamed Successfully!");                                  
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);
                          }							  
                          $(obj.target).removeClass("saving");                              
                     },this));
                },
                deleteReportDialog: function () {                                      
                    var report_id = this.reportId;
                    if (report_id) {
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this report?",
                            callback: _.bind(function () {                                
                                this.deleteReport();
                            }, this)},
                        $('body'));                      
                    }
                },
                deleteReport: function ()
                {
                    var report_obj = this.parentWS;                   
                    var URL = '/pms/io/user/customReports/?BMS_REQ_TK=' + report_obj.app.get('bms_token');
                    report_obj.app.showLoading("Deleting Report...", report_obj.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                    $.post(URL, {type: 'delete', reportId: this.reportId})
                        .done(_.bind(function (data) {
                            this.app.showLoading(false, report_obj.$el.parents(".ws-content.active"));
                            var _json = jQuery.parseJSON(data);
                            if(this.app.checkError(_json)){
                             return false;
                             }
                            if (_json[0] !== "err") {
                                this.app.showMessge("Report has been deleted successfully!");                                    
                                this.$el.fadeOut(_.bind(function(){
                                   this.$el.remove();
                                },this));                                        
                                var total_count = report_obj.$("#total_reports .badge");
                                total_count.html(parseInt(total_count.text())-1);
                                this.current_ws.find(".camp_header .close-wp").click();
                            }
                            else {
                                report_obj.app.showAlert(_json[1], report_obj.$el.parents(".ws-content.active"));
                            }

                        }, this));
                },
                checkBridgeStats:function(){
                     if(this.app.get("bridgestatz") && this.app.get("bridgestatz").id){
                         this.$("li[data-type='webstats']").show();
                         this.$(".no-webstats").removeClass("no-webstats");
                     }
                     else{
                        var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.app.get("bms_token") + "&type=bridgestatz";
                        jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                            var _json = jQuery.parseJSON(xhr.responseText);                            
                            if (this.app.checkError(_json)) {
                                return false;
                            }
                            if(_json.id){
                                this.app.set("bridgestatz", _json);
                                this.$("li[data-type='webstats']").show();
                                this.$(".no-webstats").removeClass("no-webstats");
                            }                            
                            
                        }, this));
                     }
                },
                showVideo: function(){                    
                    var dialog_title = "Reports Help Video";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "580px", "margin-left": "-290px"},
                        bodyCss: {"min-height": "325px"}
                    });
                    dialog.getBody().html('<iframe width="560" height="315" src="https://www.youtube.com/embed/uyRu_a8yCQM" frameborder="0" allowfullscreen></iframe>');
                },
                refreshWorkSpace: function(options){
                    var highChartsArray = this.$("[data-highcharts-chart]");
                    _.each(highChartsArray,function(val,key){
                        if(val){
                          var _index = $(val).data("highcharts-chart");
                          if(Highcharts && Highcharts.charts && Highcharts.charts[_index]){
                             Highcharts.charts[_index].reflow();
                          }
                        }
                    },this);
                }

            });
        });
