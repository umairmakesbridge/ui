define(['text!reports/html/reportflow.html','reports/report_row'],
        function (template,reportRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'content-inner',
                events: {                    
                     'click .addbar li':'addReport'
                },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
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
                  this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.current_ws = this.$el.parents(".ws-content"); 
                    this.ws_header = this.current_ws.find(".camp_header .edited"); 
                    this.getSettings();
                },
                addReport:function(event,obj){
                    var rType = typeof(event)=="object"?$.getObj(event, "li").attr("data-type"):event;
                    var row_view = new reportRow({reportType:rType,sub:this,objects:obj});
                    this.models.push(row_view);
                    row_view.orderNo = this.models.length;
                    row_view.$el.insertBefore(this.$(".addbar"));
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
                                        this.addReport(page_json[i].type,page_json[i][page_json[i].type],true);
                                    }
                                }
                            }else{
                                this.addReport('campaigns');
                            }
                        }
                        else{
                            this.addReport('campaigns');
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
                            }  
                            selected_obj['id'] = id;
                            selected_obj['checked'] =val.$("[id='"+id+"'] .check").length?true:false;
                            report_obj[type].push(selected_obj);          
                        },this);                                             
                        report_json.push(report_obj);
                    },this);
                                        
                    return JSON.stringify(report_json);
                },
                removeMode:function(no){
                    this.models.splice(no-1,1);
                }

            });
        });
