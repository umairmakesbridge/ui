define(['text!crm/netsuite/html/import.html','jquery-ui','jquery.icheck','jquery.bmsgrid','jquery.searchcontrol'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'netsuite_campaigns',
                events: {

                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.contactFilter = null;
                    this.customerFilter = null;
                    this.partnerFilter = null;
                    this.nsObject = null;
                    this.recipientDetial = null;
                    this.render();
                    this.countLoaded =false;
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));      	                                       
                    this.initControl();                                                              
                },
                initControl:function(){
                    var netsuite_setting = this.app.getAppData("netsuite");
                   
                    this.$("#ns_accordion").accordion({ active: 0, collapsible: false});   
                    if(netsuite_setting && netsuite_setting.isNetsuiteUser=="Y"){                        
                         this.loadNetSuiteGroup();
                    }
                    
                       this.$("#ns_accordion h3.ui-accordion-header").unbind("keydown");
                       this.$(".filterbtn .managefilter").click(_.bind(this.showNetSuiteFitler,this));
                       this.$(".filterbtn .selectall").click(_.bind(this.selectAllNetSuiteFilter,this));
                       this.$('input.radiopanel').iCheck({
                            radioClass: 'radiopanelinput',
                            insert: '<div class="icheck_radio-icon"></div>'
                       });
                       var camp_obj = this;  
                       this.$('input.radiopanel').on('ifChecked', function(event){                                                          
                             camp_obj.$(".ui-accordion-header.selected").removeClass("selected");
                             $(this).parents(".ui-accordion-header").addClass("selected");
                             var icheck_val = $(this).attr("value");
                             if(icheck_val!=="group"){
                                 camp_obj.$("#netsuite-group-listing tr.selected").removeClass("selected");    
                             }                             
                             camp_obj.parent.isFilterChange = false;
                             this.nsObject = null;
                       });
                       
                                                                    
                       
                       this.$("#netsuite-group-search").searchcontrol({
                            id:'netsuite-group-search',
                            width:'300px',
                            height:'22px',
                            placeholder: 'Search NetSuite Groups',
                            gridcontainer: 'nsgroup_list_grid',
                            showicon: 'yes',
                            iconsource: 'campaigns'
                        });            
                        
                        this.setNetSuiteData(); 
                                      
                },               
               selectAllNetSuiteFilter:function(obj){
                   var button = $.getObj(obj,"a");
                   button.next().removeClass("active");
                   button.addClass("active");
                   var input_radio = button.parents(".ui-accordion-header").find("input.radiopanel");                    
                   input_radio.iCheck('check');
                   this.contactFilter = null;
                   this.customerFilter = null;
                   this.partnerFilter = null;
                   this.nsObject = null;
                   this.$(".managefilter .badge").hide();
               },
               showNetSuiteFitler:function(obj){
                     var button = $.getObj(obj,"a");
                     button.prev().removeClass("active");
                     button.addClass("active");
                     var dialog_title= "Customer";
                     var input_radio = button.parents(".ui-accordion-header").find("input.radiopanel");
                     var filter_type = input_radio.val();
                     input_radio.iCheck('check');
                     if(filter_type=="contact"){
                         dialog_title= "Contant";
                     }
                     else if(filter_type=="partner"){
                         dialog_title= "Partner";
                     }
                     var self = this;
                     var dialog_width = $(document.documentElement).width()-60;
                     var dialog_height = $(document.documentElement).height()-219; 
                     var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              bodyCss:{"min-height":dialog_height+"px"},							   
                              buttons: {saveBtn:{text:'Save Filter'} }                                                                           
                    });                    
                    
                    this.app.showLoading("Loading Filters...",dialog.getBody());
                    require(["crm/netsuite/after_filter"],function(afterFilter){                                                
                        var recipient_obj = self.recipientDetial?self.recipientDetial:self.parent.editImport;
                        var afilter = new afterFilter({camp:self,savedObject:recipient_obj,type:filter_type});
                        afilter.$el.css("margin","10px 0px");
                        dialog.getBody().html(afilter.$el);
                        dialog.saveCallBack(_.bind(afilter.saveFilter,afilter,dialog,_.bind(self.saveFilter,self)));
                    });                     
                    
               },
               loadNetSuiteGroup:function(){
                    var self = this;                   
                    this.app.showLoading("Loading Groups...",self.$(".template-container"));
                    this.$el.find('.template-container').parent().css("height","308px");
                    URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=nsGroupList";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$(".template-container"));
                        var netsuite_groups = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(netsuite_groups)){
                            return false;
                        }
                        if(netsuite_groups[0]!=="err"){
                            if(netsuite_groups.count!="0"){
                                this.netsuitegroups = netsuite_groups;
                                 var group_html = '<table cellpadding="0" cellspacing="0" width="100%" id="nsgroup_list_grid"><tbody>';
                                $.each(netsuite_groups.groupList[0], function(index, val) {                                              
                                   group_html += '<tr id="row_'+val[0].id+'">';                        
                                   group_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                   var total_count = val[0].count;
                                   group_html += '<td><div class="subscribers show" style="min-width:70px"><span class=""></span>'+total_count+'</div><div id="'+val[0].id+'" class="action"><a class="btn-green use"><span>Use</span><i class="icon next"></i></a></div></td>';                        
                                   group_html += '</tr>';
                               });
                               group_html += '</tbody></table>';                                       

                               //Setting netsuite group listing grid
                               self.$("#netsuite-group-listing").html(group_html);   

                               self.$el.find("#nsgroup_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:300,
                                       usepager : false,
                                       colWidth : ['100%','90px']
                               });
                               self.$("#nsgroup_list_grid tr td:nth-child(1)").attr("width","100%");
                               self.$("#nsgroup_list_grid tr td:nth-child(2)").attr("width","90px");

                               self.$("#nsgroup_list_grid .action .use").click(function(){
                                   self.$("#nsgroup_list_grid tr.selected").removeClass("selected");    
                                   self.$("input[name='options_ns']").eq(3).iCheck('check');
                                                                  
                                   $(this).parents("tr").addClass("selected");
                               });   
                               self.setNetSuiteData();
                            }
                        }
                        else{
                          self.app.showAlert(netsuite_groups[1],$("body"),{fixed:true});  
                        }
                    }).fail(function() { console.log( "error net suite group listing" ); });
               },
               setNetSuiteData:function(){
                 if(this.parent.editImport){
                    var parent_accordion =null; 
                    this.$("input[name='options_sf']").eq(0).iCheck('uncheck');
                    var recipient_obj = this.parent.editImport;                       
                    if(recipient_obj.filterType==="group"){
                       this.$("input[name='options_ns']").eq(3).iCheck('check');                   
                       this.$("#nsgroup_list_grid tr[id='row_"+recipient_obj.nsGroupId+"']").addClass("selected");    
                   }
                   else if(recipient_obj.filterType==="filter"){
                       if(recipient_obj.nsObject.indexOf("customer")>-1){
                           this.$("input[name='options_ns']").eq(0).iCheck('check');  
                           parent_accordion = this.$("input[name='options_ns']").eq(0).parents("h3");
                       }
                       else if(recipient_obj.nsObject=="contact"){
                           this.$("input[name='options_ns']").eq(1).iCheck('check');                   
                           parent_accordion = this.$("input[name='options_ns']").eq(1).parents("h3");
                       }
                       else if(recipient_obj.nsObject=="partner"){
                           this.$("input[name='options_ns']").eq(2).iCheck('check');                   
                           parent_accordion = this.$("input[name='options_ns']").eq(3).parents("h3");
                       }
                   }
                   if(parent_accordion && recipient_obj.filterFields){
                        parent_accordion.find(".filterbtn .selectall").removeClass("active");
                        parent_accordion.find(".filterbtn .managefilter").addClass("active");
                    }
                   if(this.parent.tId && this.countLoaded===false){
                        this.countLoaded = true;
                        this.getCount();                            
                    }
                }
                else{
                    this.$("input[name='options_ns']").eq(0).iCheck('check');                   
                }  
               },
                saveFilter:function(flag,goToNext){
                    var URL = '/pms/io/netsuite/getData/?BMS_REQ_TK='+this.app.get('bms_token');
                    var data = {
                        type:'sample'
                    }
                    $.extend(data,this.getImportData());
                    this.app.showLoading("Fetching Count...",this.parent.$el);
                    $.getJSON( URL, data )
                    .done(_.bind(function(json) {
                        this.app.showLoading(false,this.parent.$el);
                        this.recipientDetial = json;
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
                getImportData:function(){
                    var post_data = {};
                    var camp_obj = this;  
                    var netsuite_val = this.$("input[name='options_ns']:checked").val();    
                    if(netsuite_val=="group"){
                       var select_sCamp = this.$("#nsgroup_list_grid tr.selected")
                       if(select_sCamp.length===1){
                            post_data['filterType']= "group";
                            post_data['nsGroupId']= select_sCamp.attr("id").split("_")[1];                            
                       }
                       else{
                           this.app.showAlert('Please select a netsuite group to proceed.',$("body"),{fixed:true});
                           return false;
                       }
                    }
                    else{                       
                        post_data['filterType']= "filter";
                        if(camp_obj.nsObject){
                            post_data['nsObject'] =  camp_obj.nsObject ;          
                        }
                        else{
                            post_data['nsObject'] =  netsuite_val;            
                        }

                        var customerPost = camp_obj.customerFilter;
                        var contactPost= camp_obj.contactFilter;
                        var partnerPost= camp_obj.partnerFilter;
                        if(netsuite_val=="customer"){
                           $.extend(post_data,customerPost)
                        }
                        else if(netsuite_val=="contact"){
                           $.extend(post_data,contactPost)
                        }
                        else if(netsuite_val=="partner"){
                           $.extend(post_data,partnerPost)                                                  
                        }

                     }
                    return post_data;
                },
                getCount:function(){
                     var URL = '/pms/io/netsuite/getData/?BMS_REQ_TK='+this.app.get('bms_token');
                    var data = {
                        type:'importCount',
                        tId : this.parent.tId
                    }                                        
                    $.getJSON( URL, data )
                    .done(_.bind(function(json) {                     
                        var recipient_obj = this.parent.editImport;        
                        this.$(".managefilter .ns_"+recipient_obj.nsObject+"_count").show().html(json[recipient_obj.nsObject+"Count"]);
                        
                    },this))
                    .fail(_.bind(function( jqxhr, textStatus, error ) {
                        this.app.showLoading(false,this.parent.$el);
                        var err = textStatus + ", " + error;
                        console.log( "Request Failed: " + err );
                    },this));
                },
                drawSampleData:function(data){
                    this.parent.$(".customer-sample-data").children().remove();
                    this.parent.$(".contact-sample-data").children().remove();
                    this.parent.$(".partner-sample-data").children().remove();
                    this.$(".managefilter .badge").hide();
                    var table_html = '<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>';                     
                     
                    this.parent.$("#customer_accordion,#contact_accordion,#partner_accordion").hide().removeClass("top-margin-zero");;
                    this.parent.$("#"+data.nsObject+"_accordion").show().addClass("top-margin-zero");
                    this.parent.$("."+data.nsObject+"-count").html(data.totalCount);
                    this.$(".managefilter .ns_"+data.nsObject+"_count").show().html(data.totalCount);
                         
                     var tableObj = null;
                     var table_row = "",table_head="";
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
                                        this.parent.$("."+data.nsObject+"-sample-data").append(tableObj);                                    
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
                     }
                }
        });
});