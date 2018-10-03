define(['text!crm/salesforce/html/import.html','jquery-ui','jquery.icheck','jquery.bmsgrid','jquery.searchcontrol'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'salesforce_campaigns',
                events: {

                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.contactFilter = null;
                    this.leadFilter = null;
                    this.opportunityFilter = null;
                    this.recipientDetial = null;
                    this.render();
                    this.countLoaded =false;
                    this.refreshList = 'N';
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));      	                                       
                    this.initControl();   
                    
                },
                initControl:function(){
                    var salesforce_setting = this.app.getAppData("salesfocre");
                   
                    this.$("#sf_accordion").accordion({ active: 0, collapsible: false});                       
                    if(salesforce_setting && salesforce_setting.isSalesforceUser=="Y"){                        
                         this.showSalesForceCampaigns();
                    }
                    this.$("#sf_accordion h3.ui-accordion-header").unbind("keydown");
                    this.$(".filterbtn .managefilter").click(_.bind(this.showSalesForceFitler,this));
                    this.$(".filterbtn .selectall").click(_.bind(this.selectAllSalesforceFilter,this));
                    
                    this.$('input.radiopanel').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'
                     });
                     var self=this;                   
                     
                     this.$('input.radiopanel').on('ifChecked', function(event){                                                          
                             self.$(".ui-accordion-header.selected").removeClass("selected");
                             $(this).parents(".ui-accordion-header").addClass("selected");
                             var icheck_val = $(this).attr("value");
                             if(icheck_val!=="campaign"){
                                 self.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                             }                   
                             if($(this).parents(".ui-accordion-header").find(".filterbtn a:first-child").hasClass("active")==false){
                                $(this).parents(".ui-accordion-header").find(".filterbtn a").removeClass("active");
                                $(this).parents(".ui-accordion-header").find(".filterbtn a:first-child").addClass("active");
                             }
                             self.parent.isFilterChange = false;
                         });
                         
                        this.$("input[name='options_sf']").eq(0).iCheck('check');                                                                                                                                    
                        
                        this.$("#salesforce-camp-search").searchcontrol({
                            id:'salesforce-camp-search',
                            width:'300px',
                            height:'22px',
                            placeholder: 'Search salesforce campaign',
                            gridcontainer: 'sfcamp_list_grid',
                            showicon: 'yes',
                            iconsource: 'campaigns'
                        });              
                        
                       this.setUpSalesforceFields();
                       
                        this.$("input[value='opportunity']").on('ifClicked', function(event){
                            self.$(".contactby_opp").click()
                       })
                                      
                },
                setUpSalesforceFields : function (){
                     if(this.parent.editImport){
                        this.$("input[name='options_sf']").eq(0).iCheck('uncheck');
                        var parent_accordion = null;
                        var recipient_obj = this.parent.editImport;                       
                        if(recipient_obj.filterType==="campaign"){
                            this.$("input[name='options_sf']").eq(4).iCheck('check');                           
                            this.$("#sfcamp_list_grid tr[id='row_"+recipient_obj.sfCampaignId+"']").addClass("selected");    
                        }
                        else if(recipient_obj.filterType==="filter" && recipient_obj.sfObject!=="both"){                            
                            if(recipient_obj.sfObject=="lead"){
                                this.$("input[name='options_sf']").eq(1).iCheck('check');
                                parent_accordion = this.$("input[name='options_sf']").eq(1).parents("h3");
                            }
                            else if(recipient_obj.sfObject=="contact"){
                                this.$("input[name='options_sf']").eq(2).iCheck('check');
                                parent_accordion = this.$("input[name='options_sf']").eq(2).parents("h3");
                            }
                                                        
                        }
                        else if(recipient_obj.filterType==="opportunity"){
                                this.$("input[name='options_sf']").eq(3).iCheck('check');
                                parent_accordion = this.$("input[name='options_sf']").eq(3).parents("h3");
                        }
                        else if(recipient_obj.filterType=="filter" && recipient_obj.sfObject=="both"){
                            this.$("input[name='options_sf']").eq(0).iCheck('check');
                            parent_accordion = this.$("input[name='options_sf']").eq(0).parents("h3");
                        }
                        if(parent_accordion && recipient_obj.filterFields){
                            parent_accordion.find(".filterbtn .selectall").removeClass("active");
                            //parent_accordion.find(".filterbtn .managefilter").addClass("active");
                        }
                        if(this.parent.tId && this.countLoaded===false){
                            this.countLoaded = true;
                            this.getCount();                            
                        }
                    }
               },
               selectAllSalesforceFilter:function(obj){
                   var button = $.getObj(obj,"a");
                   button.next().removeClass("active");
                   //button.addClass("active");
                   var input_radio = button.parents(".ui-accordion-header").find("input.radiopanel");                   
                   input_radio.iCheck('check');
                   this.contactFilter = null;
                   this.leadFilter = null;
                   this.opportunityFilter = null;
                   this.$(".managefilter .badge").hide();
               },
               showSalesForceFitler:function(obj){
                     var button = $.getObj(obj,"a");
                     button.prev().removeClass("active");
                     button.addClass("active");
                     var dialog_title= "Lead";
                     var input_radio = button.parents(".ui-accordion-header").find("input.radiopanel");
                     var filter_type = input_radio.val();
                     input_radio.iCheck('check');
                     if(filter_type=="contact"){
                         dialog_title= "Contacts";
                     }
                     else if(filter_type=="both"){
                         dialog_title= "Leads & Contacts";
                     }
                     else if(filter_type=="opportunity"){
                         dialog_title= "Opportunities";
                     }
                     
                     var self = this;
                     var dialog_width = $(document.documentElement).width()-60;
                     var dialog_height = $(document.documentElement).height()-219; 
                     var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              bodyCss:{"min-height":dialog_height+"px"},							   
                              buttons: {saveBtn:{text:'Apply Filter'} }                                                                           
                    });                    
                    
                    this.app.showLoading("Loading Filters...",dialog.getBody());
                    require(["crm/salesforce/after_filter"],function(afterFilter){                                                
                        var recipient_obj = self.recipientDetial?self.recipientDetial:self.parent.editImport;                        
                        var afilter = new afterFilter({camp:self,savedObject:recipient_obj,type:filter_type});
                        afilter.$el.css("margin","10px 0px");
                        dialog.getBody().append(afilter.$el);
                        self.app.showLoading(false, afilter.$el.parent());
                        var dialogArrayLength = self.app.dialogArray.length; // New Dialog
                         afilter.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        dialog.saveCallBack(_.bind(afilter.saveFilter,afilter,dialog,_.bind(self.saveFilter,self)));
                    }); 
               },
               showSalesForceCampaigns:function(){
                    var camp_obj =this;				
                    camp_obj.$el.find('.template-container').parent().css("height","308px");
                    camp_obj.app.showLoading("Loading Salesforce Campaigns...",camp_obj.$el.find('.template-container'));
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=sfCampaignList"; 
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            camp_obj.app.showLoading(false,camp_obj.$el.find('.template-container'));                            
                             var s_camps_json = jQuery.parseJSON(xhr.responseText);
                             if(camp_obj.app.checkError(s_camps_json)){
                                return false;
                             }                             
                             var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="sfcamp_list_grid"><tbody>';
                             $.each(s_camps_json.campList[0], function(index, val) {     
                                //var _selected = (camp_obj.states.step1.sfCampaignID==val[0].sfCampaignID)?"selected=selected":"";                              
                                list_html += '<tr id="row_'+val[0].sfCampaignID+'">';                        
                                list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                var total_count = parseFloat(val[0].contactCount)+parseFloat(val[0].leadCount);
                                list_html += '<td><div><div class="subscribers show"><strong class="badge">'+total_count+'</strong></div><div id="'+val[0].sfCampaignID+'" class="action"><a class="btn-green select"><span>Use</span><i class="icon next"></div></div></td>';                        
                                list_html += '</tr>';
                            });
                            list_html += '</tbody></table>';                            
                                                        
                            //Setting salesforce campaigns listing grid
                            camp_obj.$("#salesforce-camp-listing").html(list_html);                               
                            camp_obj.$el.find("#sfcamp_list_grid").bmsgrid({
                                    useRp : false,
                                    resizable:false,
                                    colresize:false,
                                    height:300,
                                    usepager : false,
                                    colWidth : ['100%','90px']
                            });
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(1)").attr("width","100%");
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(2)").attr("width","90px");
                            
                            camp_obj.$("#sfcamp_list_grid .action .select").click(function(){
                                camp_obj.$("input[name='options_sf']").eq(4).iCheck('check');                            
                                camp_obj.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                                $(this).parents("tr").addClass("selected");
                            });
                            
                            camp_obj.setUpSalesforceFields()
                					                            
                        }
                    }).fail(function() { console.log( "error fetch sales force campaign" ); });  
                },
                saveFilter:function(flag,goToNext){
                    var URL = '/pms/io/salesforce/getData/?BMS_REQ_TK='+this.app.get('bms_token');
                    var data = {
                        type:'sample'
                    }
                    $.extend(data,this.getImportData());
                    this.app.showLoading("Fetching Count...",this.parent.$el);
                    $.getJSON( URL, data )
                    .done(_.bind(function(json) {
                        this.app.showLoading(false,this.parent.$el);
                        this.recipientDetial = json;
                        if(json.sfObject=="contact"){
                            this.recipientDetial.advancedOptionsC= data.advancedOptionsC;
                        }
                        else{
                            this.recipientDetial.advancedOptionsL =data.advancedOptionsL;
                        }
                        this.drawSampleData(json);
                        this.parent.isFilterChange=true;
                        if(goToNext){
                            this.parent.mk_wizard.next();
                        }
                    },this))
                    .fail(_.bind(function( jqxhr, textStatus, error ) {
                        this.app.showLoading(false,this.parent.$el);
                        var err = textStatus + ", " + error;
                        console.log( "Request Failed: " + err );
                    },this));
                },
                getCount:function(){
                     var URL = '/pms/io/salesforce/getData/?BMS_REQ_TK='+this.app.get('bms_token');
                    var data = {
                        type:'importCount',
                        tId : this.parent.tId
                    }                                        
                    $.getJSON( URL, data )
                    .done(_.bind(function(json) {                     
                        var recipient_obj = this.parent.editImport;        
                        if(recipient_obj.sfObject=="both"){
                            var _total = parseInt(json.contactCount) + parseInt(json.leadCount);
                            this.$(".managefilter .sf_all_count").show().html(_total);
                        }
                        else{
                           if(recipient_obj.filterType=="opportunity"){
                               this.$(".managefilter .sf_opportunity_count").show().html(json["contactCount"]);
                           }
                           else{                          
                            this.$(".managefilter .sf_"+recipient_obj.sfObject+"_count").show().html(json[recipient_obj.sfObject+"Count"]);
                           }
                        }
                        
                    },this))
                    .fail(_.bind(function( jqxhr, textStatus, error ) {
                        this.app.showLoading(false,this.parent.$el);
                        var err = textStatus + ", " + error;
                        console.log( "Request Failed: " + err );
                    },this));
                },
                 moveSampleRecord:function (table, from, to) {
                   
                    var rows = table.find("tr");
                    var cols;
                    rows.each(function() {
                        cols = $(this).children('th, td');
                        cols.eq(from).detach().insertBefore(cols.eq(to));
                    });
                },
                getImportData:function(){
                    var post_data = {isRefresh:"N"};
                    var camp_obj = this;  
                    var salesforce_val = this.$("input[name='options_sf']:checked").val();    
                    if(salesforce_val=="campaign"){
                        var select_sCamp = this.$("#sfcamp_list_grid tr.selected")
                        if(select_sCamp.length===1){
                             post_data['filterType']= "campaign";
                             post_data['sfCampaignId']= select_sCamp.attr("id").split("_")[1];                            
                        }
                        else{
                            this.app.showAlert('Please select a salesforce campaign to proceed.',$("body"),{fixed:true});
                            return 0;
                        }
                    }
                    else{
                        var importType = salesforce_val;
                        post_data['filterType']= (importType=="opportunity")?"opportunity":"filter";
                        post_data['sfObject'] = (importType=="opportunity")?"contact":importType;               

                        var leadPost = camp_obj.leadFilter;
                        var contactPost= camp_obj.contactFilter;
                        var opportunityPost= camp_obj.opportunityFilter;
                        if(importType=="lead"){
                         $.extend(post_data,leadPost)
                        }
                        else if(importType=="contact"){
                         $.extend(post_data,contactPost)
                        }
                        else if(importType=="opportunity"){
                         $.extend(post_data,opportunityPost)
                         post_data['isRefresh']=camp_obj.refreshList;
                        }
                        else if(importType=="both"){
                          $.extend(post_data,leadPost)
                          $.extend(post_data,contactPost)                         
                        }
                    }
                    return post_data;
                },
                drawSampleData:function(data){
                    this.parent.$(".lead-sample-data").children().remove();
                    this.parent.$(".contact-sample-data").children().remove();
                    this.$(".managefilter .badge").hide();
                     var table_html = '<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>';                     
                     if(data.sfObject=="both" || data.filterType=="campaign"){
                         this.parent.$("#contact_accordion,#lead_accordion").show().removeClass("top-margin-zero");
                         this.parent.$("#lead_accordion").addClass("top-margin-zero");
                         this.parent.$(".lead-count").html(data.leadCount);
                         this.parent.$(".contact-count").html(data.contactCount);
                         var totalcount = parseFloat(data.leadCount)+parseFloat(data.contactCount)
                         this.$(".managefilter .sf_all_count").show().html(totalcount);
                     }
                     else if(data.sfObject=="lead" || data.sfObject=="contact"){
                         this.parent.$("#contact_accordion,#lead_accordion").hide().removeClass("top-margin-zero");
                         this.parent.$("#"+data.sfObject+"_accordion").show().addClass("top-margin-zero");
                         this.parent.$("."+data.sfObject+"-count").html(data[data.sfObject+"Count"]);                         
                         if(data.filterType=="opportunity"){
                            this.$(".managefilter .sf_opportunity_count").show().html(data[data.sfObject+"Count"]);
                         }
                         else{
                            this.$(".managefilter .sf_"+data.sfObject+"_count").show().html(data[data.sfObject+"Count"]);
                         }
                     }    
                     
                     var tableObj = null;
                     var that = this;
                     var table_row = "",table_head="";
                     var isLead = false;
                     if(data.recordList){
                        _.each(data.recordList[0],function(val,key){                                
                                if(parseInt(key.substring(key.length-1))==1){
                                    tableObj = $(table_html);
                                    table_head = "<tr>";
                                        _.each(val[0],function(val,key){
                                            table_head +="<th>"+val+"</th>";
                                          });
                                        table_head += "</tr>"
                                        tableObj.find("thead").append(table_head);                                        
                                        
                                    if(key.indexOf("lead")>-1){
                                        isLead = true;
                                        that.parent.$(".lead-sample-data").append(tableObj);
                                    }
                                    else{
                                        that.parent.$(".contact-sample-data").append(tableObj);
                                    }
                                }
                                else{
                                    table_row = "<tr>";
                                        _.each(val[0],function(val,key){
                                            table_row +="<td>"+val+"</td>";
                                          });
                                    table_row += "</tr>"
                                    tableObj.find("tbody").append(table_row);
                                       
                               } 
                        },this);
                          if(isLead){    
                                      that.moveRecordSetTable(that.parent.$(".lead-sample-data"));
                                   
                                  }
                                  
                        that.moveRecordSetTable( that.parent.$(".contact-sample-data"));
                     }
                     
                },
               moveRecordSetTable:function(container){
                        
                        var tableObj = container.find('table');
                        var that = this;
                        $.extend($.expr[":"], {
                        "containsIN": function(elem, i, match, array) {
                        return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
                        }
                        });
                        var zip = tableObj.find("tr  th:containsIN('zip')").index();
                        
                        if(zip !="-1"){
                        that.moveSampleRecord(tableObj, zip, 0);
                        }
                        var state = tableObj.find("tr  th:containsIN('state')").index();
                        if(state !="-1"){
                        that.moveSampleRecord(tableObj, state, 0);
                        }
                        var city = tableObj.find("tr  th:containsIN('city')").index();
                        if(city !="-1"){
                        that.moveSampleRecord(tableObj, city, 0);
                        }
                        var phone = tableObj.find("tr  th:containsIN('phone')").index();
                        if(phone !="-1"){
                        that.moveSampleRecord(tableObj, phone, 0);
                        }
                        var company = tableObj.find("tr  th:containsIN('company')").index();
                        if(company !="-1"){
                        that.moveSampleRecord(tableObj, company, 0);
                        }
                        var last = tableObj.find("tr  th:containsIN('last')").index();
                        if(last !="-1"){
                        that.moveSampleRecord(tableObj, last, 0);
                        }
                        var first = tableObj.find("tr  th:containsIN('first')").index();
                        if(first !="-1"){
                        that.moveSampleRecord(tableObj, first, 0);
                        }
                        var add = tableObj.find("tr  th:containsIN('add')").index();
                        if(add !="-1"){
                        that.moveSampleRecord(tableObj, add, 0);
                        }
                        var email = tableObj.find("tr  th").filter(function() {
                            return $(this).html().toLowerCase() === "email";
                        }).index();
                            if(email !="-1"){
                                that.moveSampleRecord(tableObj, email, 0);
                            }               
               }
        });
});