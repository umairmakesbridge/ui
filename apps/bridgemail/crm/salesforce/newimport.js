define(['views/common/wizard','text!crm/salesforce/html/newimport.html','moment','jquery.bmsgrid','jquery.searchcontrol','jquery.highlight','bms-addbox','jquery.chosen','jquery-ui'],
function (Wizard,template,moment) {
        'use strict';
        return Backbone.View.extend({                                
                className:'clearfix',
                events: {
                    'click .activate-import':'startImport',
                    'click .update-import':'startImport'
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.improtLoaded = false;
                    this.tId = null;       
                    this.editImport = null;
                    this.newList = null;
                    this.render();
                    this.isFilterChange = false;
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.dialog = this.options.dialog;
                    
                    var wizard_options = {steps:3,active_step:1};
                    this.mk_wizard = new Wizard(wizard_options);  
                    this.$el.append(this.mk_wizard.$el);                                       
                    
                    this.mk_wizard.$(".step-contents").html(this.template({}));
                    this.mk_wizard.page = this;
                    
                    this.mk_wizard.initStep();                    
                    this.initControl();                                                              
                },
                initControl:function(){
                     this.$(".myimports-search").searchcontrol({
                            id:'newimports-search',
                            width:'300px',
                            height:'22px',
                            gridcontainer: 'import-list-grid',
                            placeholder: 'Search lists',                     
                            showicon: 'yes',
                            iconsource: 'list'
                     });
                    this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)}); 
                    this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.getLists();
                    this.setHeaderDialog();
                    this.showHideButton(false);
                                      
                },        
                getLists:function(){
                  if(!this.app.getAppData("lists")){
                        this.app.showLoading("Loading Lists...",this.$(".bms-lists"));                                    
                        this.app.getData({
                            "URL":"/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=all",
                            "key":"lists",
                            "callback":_.bind(this.createListTable,this)
                        });
                    }
                    else{
                        this.createListTable();
                    }  
                },
                setHeaderDialog:function(){
                   if(!this.dialog) return;                                      
                   this.dialog.$(".modal-footer .btn-save").hide();
                   this.head_action_bar = this.dialog.$(".modal-header .edited  h2");                   
                   //this.head_action_bar.css("margin-top","10px");
                   this.head_action_bar.find(".edit,.copy,.delete").hide();
                   this.head_action_bar.find(".dialog-title").attr("title","Click to rename").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                   this.head_action_bar.find(".delete").attr("title","Delete import").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                   
                   this.dialog.$("#dialog-title span").click(_.bind(function(obj){
                     this.showHideTitle(true);
                   },this));
                   
                   this.dialog.$(".cancelbtn").click(_.bind(function(){                        
                       this.showHideTitle();                        
                   },this));
                   this.dialog.$(".savebtn").click(_.bind(function(obj){
                     this.saveImportName(obj)
                   },this));
                },
                showHideTitle:function(show,isNew){
                    if(show){
                        this.dialog.$("#dialog-title").hide();
                        this.dialog.$("#dialog-title-input").show();                    
                        this.dialog.$(".tagscont").hide();                   
                        this.dialog.$("#dialog-title-input input").val(this.app.decodeHTML(this.dialog.$("#dialog-title span").html())).focus();                    
                    }
                    else{
                        this.dialog.$("#dialog-title").show();
                        this.dialog.$("#dialog-title-input").hide();   
                        this.dialog.$(".tagscont").show();
                    }
                },
                saveImportName:function(obj){
                    var name_input =  $(obj.target).parents(".edited").find("input");                       
                    this.dialog.$("#dialog-title span").html(this.app.encodeHTML(name_input.val()));                                                                                                 
                    this.showHideTitle();
                },
                initStepCall:function(stepNo){                    
                    switch (stepNo){                                                            
                        case 'step_2':
                            this.initStep2();
                            break;                                
                        case 'step_3':
                            this.initStep3();
                            break;                       
                        default:
                            break;
                    }
                },
                initStep2:function(){
                    if( this.improtLoaded==false){
                         this.improtLoaded = true; 
                        this.app.showLoading("Loading Import...",this.$(".step2"));
                        require(["crm/salesforce/import"],_.bind(function(page){    
                            this.Import_page = new page({
                                page:this
                            })
                            this.app.showLoading(false,this.$(".step2"));
                            this.$(".step2 .salesforce_campaigns").remove();
                            this.$(".step2").append(this.Import_page.$el);                       
                        },this));
                    }
                    this.dialog.$(".modal-footer .btn-save").hide();
                },
                initStep3:function(){
                    var _this = this;
                    this.dialog.$(".modal-footer .btn-save").show();
                    this.$(".step3 .summary-accordion").accordion({ active: 1, collapsible: true});   
                     this.$('.step3 input.radiopanel').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'
                    });
                    this.$('.step3 input.radiopanel').on('ifChecked', function(event){                                                                                     
                            var icheck_val = $(this).attr("value");
                            if(icheck_val!=="S"){
                                _this.$(".step3 .control-area select").attr("disabled",true);    
                                _this.$(".step3 .control-area button").attr("disabled",true);    
                            }    
                            else{
                                _this.$(".step3 .control-area button").attr("disabled",false);  
                                _this.$(".step3 .control-area select").attr("disabled",false);
                            }
                            _this.$(".step3 .nosearch").trigger("chosen:updated");
                        });
                    var currentDate = new Date(); 
                    var yearHTML = "<option value=''></option>";
                    for(var y=0;y<10;y++){
                        yearHTML +="<option value='"+(currentDate.getFullYear()+y)+"'>"+(currentDate.getFullYear()+y)+"</option>";
                    }
                    this.$("#year-select").html(yearHTML);  
                    if(this.editImport){
                        this.$(".frequency-type").val(this.editImport.frequency);
                        if(this.editImport.day){
                            if(this.editImport.frequency=="O" || this.editImport.frequency=="T"){
                                var _day = this.editImport.day.split(",");
                                this.$(".step3 .s-days button.selected").removeClass("selected");
                                _.each(_day,function(val,key){
                                    this.$(".step3 .s-days button[value='"+val+"']").addClass("selected");
                                },this);
                            }
                            else{
                                this.$(".step3 .import-day").val(this.editImport.day);
                            }
                        }
                    }
                    this.$(".step3 .nosearch").chosen({disable_search_threshold: 25});
                      _this.$(".step3 .s-days button").unbind("click").click(function(){
                                 $(this).addClass("selected");
                       });     
                    this.$(".step3 .frequency-type").change(function(){
                        var freq_val = $(this).val();
                        if(freq_val=="O"){                            
                            _this.$(".step3 .week-days-row").show();
                            _this.$(".step3 .s-days button").unbind("click").click(function(){
                                $(this).toggleClass("selected");
                            });
                            _this.$(".step3 .date-row").hide();
                        }
                        else if(freq_val=="T"){
                           _this.$(".step3 .week-days-row").show();
                           if(!_this.editImport || _this.editImport['frequency']!=="T"){
                            _this.$(".step3 .s-days button.selected").removeClass("selected");
                            _this.$(".step3 .s-days button:first-child").addClass("selected");
                           }
                           _this.$(".step3 .s-days button").unbind("click").click(function(){
                               $(this).parent().find(".selected").removeClass("selected");
                               $(this).addClass("selected");
                            });
                            _this.$(".step3 .date-row").hide();
                        }
                        else if(freq_val=="M"){
                            _this.$(".step3 .week-days-row").hide();
                            _this.$(".step3 .date-row").show();
                            _this.$(".step3 .date-row .month-year").hide();
                        }
                        else {
                            _this.$(".step3 .week-days-row").hide();
                            _this.$(".step3 .date-row").show();
                            _this.$(".step3 .date-row .month-year").show();
                        }
                    })
                    this.$(".step3 .frequency-type").change();
                    this.fetchServerTime();   
                    
                    
                },
                stepsCall:function(step){
                    var proceed = -1;
                    $(".messagebox.messagebox_").remove();
                    switch (step){
                        case 'step_1':
                            proceed = this.saveStep1();
                            break;
                        case 'step_2':
                            proceed=this.saveStep2();
                            break;
                    }
                    return proceed;
                },
                saveStep1:function(){
                    var proceed=-1;
                    if(!this.$(".bms-lists tr").hasClass("selected")){
                         this.app.showAlert("Please select a list to import recipients",$("body"),{fixed:true});
                         proceed =0;
                    }else{
                        this.listNumber = this.$(".bms-lists tr.selected").attr("id").split("_")[1];
                    }
                    return proceed;
                },
                saveStep2:function(){
                  var proceed =-1;
                  var valid = this.Import_page.getImportData();
                  if(valid==0){
                      return 0;
                  }
                  if(valid !==0 && this.isFilterChange==false){
                        this.Import_page.saveFilter('salesforce',true);
                        proceed = 0;
                    }
                  return proceed;
                },
                createListTable:function(xhr){                
                    var camp_list_json = this.app.getAppData("lists");
                    this.app.showLoading(false,this.$el);                                                        			
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="import-list-grid"><tbody>';                    
                    $.each(camp_list_json.lists[0], _.bind(function(index, val) {     
                        list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" checksum="'+val[0]["listNumber.checksum"]+'">';                        
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div></td>';                        
                        list_html += '<td><div class="subscribers show" style="min-width:70px;"><strong><span><em>Contacts</em>'+val[0].subscriberCount+'</span></strong></div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green add select-list"><span>Select</span><i class="icon next"></i></a></div></td>';                        
						
                        list_html += '</tr>';
                    },this));
                    list_html += '</tbody></table>';										
					
                    this.$(".bms-lists").html(list_html);
                    
                    var listgridHeight = parseInt(this.dialog.options.bodyCss["min-height"])-228;
                        listgridHeight = listgridHeight>300?listgridHeight:300;
                    this.$el.find("#import-list-grid").bmsgrid({
                        useRp : false,
                        resizable:false,
                        colresize:false,
                        height:listgridHeight,							
                        usepager : false,
                        colWidth : ['100%','90px']
                    });				
                    this.$(".bms-lists .select-list").click(_.bind(this.markSelectList,this));
                    this.loadData(this.editImport);
                    if(this.newList){
                        this.$(".bms-lists tr").removeClass("selected");
                        this.$(".bms-lists tr[checksum='"+this.newList+"']").addClass("selected");
                        this.$(".bms-lists tr[checksum='"+this.newList+"']").scrollintoview(); 
                        this.newList = null;
                    }
                },
                markSelectList:function(e){
                    var target = $.getObj(e,"a");
                    var parent_row = target.parents("tr");
                    if(!parent_row.hasClass("selected")){
                        this.$(".bms-lists tr").removeClass("selected");
                        parent_row.addClass("selected");
                    }
                },
                checkListName:function(listName){
                    var camp_list_json = this.app.getAppData("lists");
                    var isListExits = false;
                    this.app.showLoading(false,this.$el);                                                        			                    
                    $.each(camp_list_json.lists[0], _.bind(function(index, val) { 
                        if(val[0].name==listName){
                            isListExits = true;
                            return false;
                        }
                    },this));
                    return isListExits;
                },
                addlist:function(listName,ele){                    
                    if(this.checkListName(listName)){
                        this.app.showAlert("List already exists with same name",$("body"),{fixed:true});
                        return false;
                    }
                    if (listName.toLowerCase().indexOf("supress_list_") >= 0){
                        this.app.showAlert("List name with word supress_list_ not allowed",$("body"),{fixed:true});
                        return false;
                    }
                    var add_box = this.$(".add-list").data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    var URL = "/pms/io/list/saveListData/";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"create",listName:listName};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        add_box.dialog.find(".btn-add").removeClass("saving");
                        add_box.dialog.find(".input-field").val("");
                        add_box.hideBox();                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            this.app.removeCache("lists");
                            this.getLists();
                            this.newList = _json[2];
                        }
                        else{
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));
                },
                startImport:function(){                    
                    var URL = "/pms/io/salesforce/setData/?BMS_REQ_TK="+this.app.get('bms_token');
                    var post_data = {type:'import',synchType:'crm',listNumber:this.listNumber};
                    this.app.showLoading("Starting Import...",this.$el);  
                    $.extend(post_data,this.Import_page.getImportData());
                    var import_type = this.$(".step3 input[name='options_import']:checked").val();  
                    if(import_type=="I"){
                        post_data['frequency']=import_type;
                    }
                    else{
                        var import_type = this.$(".step3 .frequency-type").val();
                        
                        var _time = this.$(".timebox-hour").val(); 
                        var _hour = this.getHourForSchedule(_time);                    
                        _hour = this.addZero(_hour);
                        var _min = this.addZero(this.$(".timebox-min").val());
                        
                        post_data['frequency']=import_type;
                        post_data['hour']=_hour;
                        post_data['minute']=_min;
                        if(import_type=='O'){                                                      
                            post_data['day']=this.$(".step3 .s-days button.selected").map(function(){
                                                        return $(this).attr("value");
                                                    }).toArray().join();
                        }
                        else if(import_type=='T'){                                                
                            post_data['day']=this.$(".step3 .s-days button.selected").map(function(){
                                                        return $(this).attr("value");
                                                    }).toArray().join();
                        }                        
                        else if(import_type=='M'){
                            post_data['day']=this.$(".step3 .import-day").val();
                        }
                        else if(import_type==''){
                            post_data['onceDate']=this.$(".step3 .import-year").val()+"-"+this.$(".step3 .import-month").val()+"-"+this.$(".step3 .import-day").val();
                        }
                    }
                    if(this.tId){
                        post_data['tId'] = this.tId;
                    }
                    post_data['name'] = $.trim(this.dialog.$("#dialog-title span").html());
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {  
                        this.app.showLoading(false,this.$el);     
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){                            
                            if(_json.tId){
                                if(this.tId){
                                    this.app.showMessge("Your import has been successfully updated.");
                                }
                                else{
                                    this.app.showMessge("Your import has been successfully created.");
                                    this.parent.updateCount(1);
                                }
                                this.tId = _json.tId;                                
                                if(this.dialog){
                                     this.dialog.hide();
                                }
                                //this.parent.$(".salesforce-imports").click();                                
                                this.parent.myimports_page.getMyImports();                                
                            }
                            
                        }
                        else{
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));
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
                            if(this.editImport){
                                this.setDateTime(this.editImport.scheduledDate);
                            }
                            else{
                                this.setDateTime(_json[0]);
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
                loadData:function(data){
                    if(data){
                        this.tId = data.tId;
                        this.editImport=data;
                        if(data.name){
                            this.app.dialogArray[0].title=data.name;
                        }
                        this.$(".bms-lists tr").removeClass("selected");
                        this.$(".bms-lists tr[checksum='"+data.checkSum+"']").addClass("selected");
                        this.$(".bms-lists tr[checksum='"+data.checkSum+"']").scrollintoview(); 
                        var list_ = this.$(".bms-lists tr[checksum='"+data.checkSum+"']").find(".name-type h3");
                        if(list_.length){
                            list_ = this.app.encodeHTML(list_.html());
                        }
                        else{
                            list_ = "Import";
                        }
                        var import_name = data.name?data.name:list_;
                        this.dialog.$("#dialog-title span").html(import_name);
                        this.improtLoaded = false;
                        this.showHideButton(true);
                    }
                },
                initData:function(){
                    this.$(".bms-lists tr").removeClass("selected");
                    this.editImport = null;
                    this.tId = null;
                    this.showHideButton(false);
                    this.improtLoaded = false;
                    if(this.Import_page){
                        this.Import_page.$(".managefilter .badge").hide();
                    }
                },
                showHideButton:function(flag){
                    if(flag){
                        this.$(".cancel-import").css({display:"inline-block"});
                        this.$(".update-import").css({display:"inline-block"});
                        this.$(".activate-import").css({display:"none"});
                    }
                    else{
                        this.$(".cancel-import").css({display:"none"});
                        this.$(".update-import").css({display:"none"});
                        this.$(".activate-import").css({display:"block"});
                    }
                }
                
        });
});