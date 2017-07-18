define(['text!crm/highrise/html/export.html','moment','jquery.chosen','jquery-ui'],
function (template,moment) {
        'use strict';
        return Backbone.View.extend({                                                              
                events: {
                    'click .update-export':'updateExport',
                    'click .deactivate-export':'deactivateExport',
                    'click .activate-export':'activateExport'
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.render();
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.$el.html(this.template({}));      	
                    this.tId = null;    
                    this.initControl();                                                              
                },
                initControl:function(){                                        
                    var currentDate = new Date(); 
                    var yearHTML = "<option value=''></option>";
                    for(var y=0;y<10;y++){
                        yearHTML +="<option value='"+(currentDate.getFullYear()+y)+"'>"+(currentDate.getFullYear()+y)+"</option>";
                    }
                    this.$("#year-select").html(yearHTML);                      
                    this.$(".frequency-type").chosen({disable_search_threshold: 5,width:"300px"});
                    this.$(".import-day").chosen({disable_search_threshold: 32,width:"90px"});
                    this.$(".import-month").chosen({disable_search_threshold:13 ,width:"120px"});
                    this.$(".import-year").chosen({disable_search_threshold:13 ,width:"100px"});
                    var _this = this;
                    this.$(".frequency-type").change(function(){
                        var freq_val = $(this).val();
                        if(freq_val=="O"){                            
                            _this.$(".week-days-row").show();
                            _this.$(".s-days button").unbind("click").click(function(){
                                $(this).toggleClass("selected");
                            });
                            _this.$(".date-row").hide();
                        }
                        else if(freq_val=="T"){
                           _this.$(".week-days-row").show();
                           _this.$(".s-days button.selected").removeClass("selected");
                           _this.$(".s-days button:first-child").addClass("selected");
                           _this.$(".s-days button").unbind("click").click(function(){
                               $(this).parent().find(".selected").removeClass("selected");
                               $(this).addClass("selected");
                            });
                            _this.$(".date-row").hide();
                        }
                        else if(freq_val=="M"){
                            _this.$(".week-days-row").hide();
                            _this.$(".date-row").show();
                            _this.$(".date-row .month-year").hide();
                        }
                        else {
                            _this.$(".week-days-row").hide();
                            _this.$(".date-row").show();
                            _this.$(".date-row .month-year").show();
                        }
                    })
                    this.$(".frequency-type").change();
                    this.fetchServerTime();
                    this.getExport();
                },
                fetchServerTime:function(){                            
                   var URL = '/pms/io/getMetaData/?type=time&BMS_REQ_TK='+this.app.get('bms_token');
                   jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var _json = jQuery.parseJSON(xhr.responseText);
                            if(this.app.checkError(_json)){
                                return false;
                            }
                            this.$(".timebox-hour").spinner({max: 12,min:1,start: function( event, ui ) {

                            }});
                            this.$(".timebox-min").spinner({max: 59,min:0,stop: function( event, ui ) {
                                   if($(this).val().length==1){
                                       $(this).val("0"+$(this).val())
                                   }
                            }});
                            if(!this.editImport){
                                this.setDateTime(_json[0]);
                            }
                            else{
                                this.setDateTime(this.editImport.scheduledDate);
                            }
                            
                        }
                   },this)); 
                },
                setDateTime:function(dateTime){
                        var serverDate = moment(this.app.decodeHTML(dateTime),"YYYY-M-D H:m");
                        var month = (serverDate.month()+1).toString().length==1?"0"+(serverDate.month()+1):(serverDate.month()+1); 
                        var date = serverDate.date().toString().length==1?"0"+serverDate.date():serverDate.date();
                         var hour = serverDate.hour();
                            var min = serverDate.minute();
                            this.$(".import-year").val(serverDate.year()).trigger("chosen:updated");
                            this.$(".import-month").val(month).trigger("chosen:updated");
                            this.$(".import-day").val(date).trigger("chosen:updated");
                            
                            if(hour>=12){
                                var hour = hour-12;                            
                                this.$(".timebox-hours button.pm").addClass("active");
                            }
                            else{
                                this.$(".timebox-hours button.am").addClass("active");
                            }
                            hour = hour==0 ? "12":hour;                                                    
                            this.$(".timebox-hour").val(hour);
                            this.$(".timebox-min").val(min.toString().length==1?("0"+min):min);  
                },
                getExport:function(){
                   var URL = '/pms/io/highrise/getData/?type=export&BMS_REQ_TK='+this.app.get('bms_token');
                   this.app.showLoading("Getting Export Data...",this.$el);
                   jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                        this.app.showLoading(false,this.$el);
                        if(xhr && xhr.responseText){
                            var _json = jQuery.parseJSON(xhr.responseText);
                            if(this.app.checkError(_json)){
                                return false;
                            }      
                            //this.setDateTime()
                            if(_json.tId){
                                this.tId = _json.tId;
                                this.editImport = _json;
                                this.showHideButton(true);
                                this.$(".frequency-type").val(this.editImport.frequency).trigger("chosen:updated");
                                this.$(".frequency-type").change();
                                if(this.editImport.day){
                                    if(this.editImport.frequency=="O" || this.editImport.frequency=="T"){
                                        var _day = this.editImport.day.split(",");
                                        this.$(".s-days button.selected").removeClass("selected");
                                        _.each(_day,function(val,key){
                                            this.$(".s-days button[value='"+val+"']").addClass("selected");
                                        },this);
                                    }
                                    else{
                                        this.$(".import-day").val(this.editImport.day);
                                    }                                    
                                }
                                this.setDateTime(this.editImport.scheduledDate);
                                
                            }
                            else{
                                this.showHideButton(false);
                            }
                        }
                   },this)); 
                },
                getPostData:function(){
                    var post_data = {type:'export'};
                    var import_type = this.$(".frequency-type").val();                        
                    var _time = this.$(".timebox-hour").val(); 
                    var _hour = this.getHourForSchedule(_time);                    
                    _hour = this.addZero(_hour);
                    var _min = this.addZero(this.$(".timebox-min").val());

                    post_data['frequency']=import_type;
                    post_data['hour']=_hour;
                    post_data['minute']=_min;
                    if(import_type=='O'){                                                      
                        post_data['day']=this.$(".s-days button.selected").map(function(){
                            return $(this).attr("value");
                        }).toArray().join();
                    }
                    else if(import_type=='T'){                                                
                        post_data['day']=this.$(".s-days button.selected").map(function(){
                            return $(this).attr("value");
                        }).toArray().join();
                    }                        
                    else if(import_type=='M'){
                        post_data['day']=this.$(".import-day").val();
                    }
                    else if(import_type==''){
                        post_data['onceDate']=this.$(".import-year").val()+"-"+this.$(".import-month").val()+"-"+this.$(".import-day").val();
                    }
                    if(this.tId){
                        post_data['tId'] = this.tId;
                    }
                    return post_data;
                },
                addZero:function(val){
                    val = val.toString().length==1?"0"+val:val;
                    return val;
                },
                getHourForSchedule:function(hour){                   
                    if(this.$(".timebox-hours button.pm").hasClass("active")){
                        if(parseInt(hour)<=11){
                           hour = parseInt(hour)+12;
                        }
                    }
                    else{
                        if(parseInt(hour)==12){
                            hour = "00";
                        }
                    }
                    return hour;
                },
                activateExport:function(){
                   var post_data = this.getPostData();
                   this.app.showLoading("Activating export...",this.$el);
                   this.update(post_data);     
                },
                updateExport:function(){
                   var post_data = this.getPostData();
                   this.app.showLoading("Updating export...",this.$el);
                   this.update(post_data);    
                },
                deactivateExport:function(){
                   var post_data = {type:'deactivate',tId:this.tId};
                   this.app.showLoading("Deactivating export...",this.$el);
                   this.update(post_data);   
                },
                update:function(post_data){
                    var URL = "/pms/io/highrise/setData/?BMS_REQ_TK="+ this.app.get('bms_token');                            
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {  
                        this.app.showLoading(false,this.$el);     
                        var _json = jQuery.parseJSON(data);                         
                        if(_json[0]!=="err"){
                            if(_json.tId){
                                this.tId = _json.tId;                            
                            }
                            if(post_data['type']=='deactivate'){
                                this.showHideButton(false);
                            }
                            else{
                                this.showHideButton(true);
                            }
                            this.app.showMessge("Google export transaction has been activated/updated successfully.");
                        }
                        else{
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                        
                    },this));
                },
                showHideButton:function(flag){
                    if(flag){
                        this.$(".deactivate-export").css({display:"inline-block"});
                        this.$(".update-export").css({display:"inline-block"});
                        this.$(".activate-export").css({display:"none"});
                    }
                    else{
                        this.$(".deactivate-export").css({display:"none"});
                        this.$(".update-export").css({display:"none"});
                        this.$(".activate-export").css({display:"block"});
                    }
                }
                
        });
});