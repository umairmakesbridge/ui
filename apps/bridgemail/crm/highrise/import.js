define(['text!crm/highrise/html/import.html','jquery-ui','jquery.icheck','jquery.bmsgrid','jquery.searchcontrol','datetimepicker'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'netsuite_campaigns',
                events:{
                    'click .ui-accordion-header':function(){ return false;},
                    'click .calendericon':function(){this.$("#txtdatefield").focus()}
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.hrObject = null;
                    this.recipientDetial = null;
                    this.render();
                    this.countLoaded =false;
                },
                  render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                     
                    if(typeof this.options.edit !="undefined"){
                       this.recipientDetial = this.options.edit; 
                    }
                    this.$el.html(this.template({}));      	                                       
                    this.app.showLoading("Loading Data...",this.$el);
                    this.initControl();
                    this.showHighriseFitler();
                    this.$(".ui-accordion").accordion({ header: "h3", collapsible: false, active: true});
                   this.$(".tags-accordion").accordion({ collapsible: false, active: true});
                   
                    
                    //this.$el.find(".rules-container").remove();
                },
                
                 
                initControl:function(){
                    var highrise_setting = this.app.getAppData("highrise");
                  
                   // this.$("#ns_accordion").accordion({ active: 0, collapsible: false});   
                    if(highrise_setting && highrise_setting.isHighriseUser=="Y"){                        
                         this.loadHighriseTags();
                    }
                    
                      // this.$("#ns_accordion h3.ui-accordion-header").unbind("keydown");
                       this.$(".filterbtn .managefilter").click(_.bind(this.showHighriseFitler,this));
                       this.$(".filterbtn .selectall").click(_.bind(this.selectAllHighriseFilter,this));
                       if(typeof this.parent.options.page !="undefined") 
                          this.highriseCount = this.parent.options.page.peopleCount;
                        //this.$("#hImportAll").append("<div class='subscribers show' style='width:'><strong class='badge'>" +this.parent.options.page.peopleCount+"</strong></div>");
                        this.$('input.radiopanel').iCheck({
                             radioClass: 'radiopanelinput',
                             insert: '<div class="icheck_radio-icon"></div>'
                        });
                       var camp_obj = this;  
                       this.$('input.radiopanel').on('ifChecked', function(event){ 
                           camp_obj.$('.accordion-body:not("#pn")').slideUp();
                          if(typeof camp_obj.parent.options.page =="undefined")
                               camp_obj.parent.step3Change();
                           $(this).parents(".radiopanelinput").parents('h3').next('.accordion-body:not("#pn")').slideDown(); 
                           camp_obj.$("#hrTagsList .checkpanelinput").removeClass('checked');
                           self.$("#hsgroup_list_grid tr.selected").removeClass("selected");
                           self.$('#txtdatefield').val('');
                           self.$("#txtsearchbyfield").val('');
                           camp_obj.parent.isFilterChange = false;
                             
                        });
                        this.$("#highrise-group-search").searchcontrol({
                            id:'highrise-group-search',
                            width:'300px',
                            height:'28px',
                            placeholder: 'Search Highrise Tags',
                            gridcontainer: 'hsgroup_list_grid',
                            showicon: 'yes',
                            iconsource: 'campaigns'
                        });
                        this.$(".search-control").css('height','27px');
                        this.$el.find('#txtdatefield').datetimepicker()
                                .datetimepicker({step:10
                        });
                        this.$('#panel_1').css("height",'auto!important');    
                        
                                      
                },               
               selectAllHighriseFilter:function(obj){
                   var button = $.getObj(obj,"a");
                   button.next().removeClass("active");
                   button.addClass("active");
                   var input_radio = button.parents(".ui-accordion-header").find("input.radiopanel");                    
                   input_radio.iCheck('check');
                   this.contactFilter = null;
                   this.customerFilter = null;
                   this.partnerFilter = null;
                   this.hrObject = null;
                   this.$(".managefilter .badge").hide();
               },
               showHighriseFitler:function(){
                    var that = this;
                    this.app.showLoading("Loading Filters...", that.$el.find(".filters"));
                    require(["crm/highrise/after_filter"],function(afterFilter){
                        
                       var recipient_obj = that.recipientDetial?that.recipientDetial:that.parent.editImport;
                       
                        var afilter = new afterFilter({camp:that,savedObject:recipient_obj,type:"basic"});
                        afilter.$el.css("margin","10px 0px");
                        that.$el.find(".filter-by-field").html(afilter.$el);
                       
                    });                     
                    
               },
               loadHighriseTags:function(){
                    
                    var self = this;                   
                    this.app.showLoading("Loading Tags...",this.$("#hrTagsList"));
                    this.$el.find('#hrTagsList').parent().css("min-height","305px");
                    this.$el.find('.templates-container').parent().css("min-height","90px");
                   
                    
                    URL = "/pms/io/highrise/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=hrTagList";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$(".templates-container"));
                        var highrise_groups = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(highrise_groups)){
                            return false;
                        }
                        if(highrise_groups[0]!=="err"){
                            if(highrise_groups.count!="0"){
                                this.highrise_groups = highrise_groups;
                                 var group_html = '<table cellpadding="0" cellspacing="0" width="100%" id="hsgroup_list_grid"><tbody>';
                                $.each(highrise_groups.groupList[0], function(index, val) {                                              
                                   group_html += '<tr id="row_'+val[0].id+'">';
                                  // var checkbox = "<input type='checkbox' value='"+val[0].id+"' name='tags' data-id='"+val[0].id+"' id='no"+val[0].id+"' class='checkpanel contact-row-check' />";
                                   group_html += '<td width="97%" style="height:15px;padding:2px;line-height:15px;"><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                   var total_count = val[0].count;
                                   group_html += '<td><div id="'+val[0].id+'" class="action"><a class="btn-green use"><span>Use</span><i class="icon next"></i></a></div></td>';                        
                                   group_html += '</tr>';
                               });
                               group_html += '</tbody></table>';                                       
                               //Setting netsuite group listing grid
                               self.$("#hrTagsList").html(group_html);   
                               self.setHighriseData();
                               self.$el.find("#hsgroup_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:300,
                                       usepager : false,
                                       colWidth : ['97%','3%']
                               });
                            }
                        }
                        else{
                          self.app.showAlert(highrise_groups[1],$("body"),{fixed:true});  
                        }
                     self.$("#hsgroup_list_grid .action .use").click(function(){
                                   self.$("#hsgroup_list_grid tr.selected").removeClass("selected");    
                                    self.$("input[name='options_ns']").eq(3).iCheck('check');
                                     //self.$(":radio[value=tags]").parents('h3').click();
                                        self.$(":radio[value=tags]").iCheck('check');                               
                                   $(this).parents("tr").addClass("selected");
                     });   
                    }).fail(function() { console.log( "error net highrise group listing" ); });
                   
                   this.app.showLoading(false,this.$("#hrTagsList"));
               },
               setHighriseData:function(){
                   if(typeof this.parent.Import_page.options.highriseCount !="undefined")
                        this.highriseCount = this.parent.Import_page.options.highriseCount  
                 if(this.parent.editImport || this.parent.Import_page.options.edit){
                      
                    this.$("input[name='options_hr']").eq(0).iCheck('uncheck');
                    var recipient_obj ;
                    if(this.parent.editImport){
                       recipient_obj = this.parent.editImport;
                    }else{
                       recipient_obj = this.parent.Import_page.options.edit;
                      
                            
                        
                    }
                  
                   if(recipient_obj.filterType==="tag"){
                       this.$(":radio[value=tags]").parents('h3').click();
                       this.$(":radio[value=tags]").iCheck('check');
                       this.$("#hsgroup_list_grid tr[id='row_"+recipient_obj.filterQuery+"']").addClass("selected");    
                       this.$('#pn').slideDown();
                       
                   }
                  else if(recipient_obj.filterType==="since"){
                           this.$(":radio[value=date]").parents('h3').click();
                           this.$(":radio[value=date]").iCheck('check');   
                           var since = recipient_obj.filterQuery;
                           this.$('#pn').slideDown();
                           var since = since.substring(0, 4) + '/' +  since.substring(4,6)+ '/'+since.substring(6,8)+ '  '+ since.substring(8,10)+ ':'+since.substring(10)
                            this.$("#txtdatefield").val(since);
                   }
                   else if(recipient_obj.filterType==="criteria"){
                          this.$(":radio[value=filterbyfield]").parents('h3').click();
                           this.$(":radio[value=filterbyfield]").iCheck('check'); 
                           this.$('#pn').slideDown();
                   }
                   else if(recipient_obj.filterType==="term"){
                        this.$(":radio[value=search]").parents('h3').click();
                           this.$(":radio[value=search]").iCheck('check'); 
                           this.$("#txtsearchbyfield").val(recipient_obj.filterQuery);
                          this.$('#pn').slideDown();
                   }
                   else if(recipient_obj.filterType==="all" || recipient_obj.filterType===""){
                            this.$(":radio[value=importall]").iCheck('check');  
                            this.$('#pn').slideDown();
                   }
                   
                }
                else{
                 this.$(":radio[value=importall]").iCheck('check'); 
                 this.$('#pn').slideDown();
                   }
                   this.$("#hImportAll").append("<div class='subscribers show' style='width:'><strong class='badge'>" +this.highriseCount+"</strong></div>");
               this.app.showLoading(false,this.$el);
               },
                saveFilter:function(flag,goToNext){
                     
                    var URL = '/pms/io/highrise/getData/?BMS_REQ_TK='+this.app.get('bms_token');
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
                         $("highrise-sample-data .customer-count").html("0").show();
                        this.app.showLoading(false,this.parent.$el);
                        var err = textStatus + ", " + error;
                        console.log( "Request Failed: " + err );
                    },this));
                },
                getImportData:function(){
                    var post_data = {};
                      
                    var highrise_val = this.$("input[name='options_hr']:checked").val();    
                    if(highrise_val=="tags"){
                       var selected_tag = this.$("#hsgroup_list_grid tr.selected")
                       if(selected_tag.length===1){
                          post_data['tagId']= selected_tag.attr("id").split("_")[1];
                            post_data['filterType']= "tag";//Required fields:  tagId  [22]                            
                       }else{
                           this.app.showAlert('Please select a highrise tags to proceed.',$("body"),{fixed:true});
                           return false;
                       }
                    }else if(highrise_val == "importall"){                       
                        post_data['filterType']= "all";
                    }else if(highrise_val == "filterbyfield"){
                        post_data['filterType']= "criteria";
                            var filter_data = this.$el.find(".customer-filter").data("crmfilters").saveFilters('people');
                            var criteria = "";
                            _.each(filter_data,function(key,value){
                                    criteria = criteria + value +"=" + key+ ","
                             })
                            if(!criteria){
                                 this.app.showAlert('Please select filters to proceed.',$("body"),{fixed:true});
                                  return false;
                            }
                            criteria = criteria.substring(0, criteria.length - 1);
                            post_data['criteria']= criteria
                            //Case (filterType = criteria) 
                            //Required fields:  criteria [firstName=babar,lastName=virk]
                    }else if(highrise_val == "search"){
                        post_data['filterType']= "term";
                        post_data['term'] = this.$el.find('#txtsearchbyfield').val();
                         if(!this.$el.find('#txtsearchbyfield').val()){
                                 this.app.showAlert('Please enter search text to proceed.',$("body"),{fixed:true});
                                  return false;
                            }
                        //Case (filterType = term) 
                        //Required fields:  term    [makesbridge]
                    }else if(highrise_val == "date"){
                         post_data['filterType']= "since";
                         var date = this.$el.find('#txtdatefield').val();
                         date = date.replace(/\//g, '');
                         var date = date.replace(":","");
                         var date = date.replace(" ","");
                         post_data['since'] = date;
                         if(!date){
                                 this.app.showAlert('Please select date to proceed.',$("body"),{fixed:true});
                                  return false;
                            }
                          //Case (filterType = since) 
                        //Required fields:  since [date format yyyyMMddHHmmss]
                    } 
                    return post_data;
                },
                getCount:function(){
                     var URL = '/pms/io/highrise/getData/?BMS_REQ_TK='+this.app.get('bms_token');
                    var data = {
                        type:'importCount',
                        tId : this.parent.tId
                    }                                        
                    $.getJSON( URL, data )
                    .done(_.bind(function(json) {                     
                        var recipient_obj = this.parent.editImport;        
                        //this.$(".managefilter ._count").show().html(json[recipient_obj.nsObject+"Count"]);
                        
                    },this))
                    .fail(_.bind(function( jqxhr, textStatus, error ) {
                        this.app.showLoading(false,this.parent.$el);
                        var err = textStatus + ", " + error;
                        console.log( "Request Failed: " + err );
                    },this));
                },
                drawSampleData:function(data){
                    this.parent.$(".highrise-sample-data").children().remove();
                   
                    this.$el.find(".managefilter .badge").hide();
                    var table_html = '<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>';                     
                    var total = 0;
                    if(data.sampleCount)
                        total = data.sampleCount; 
                      
                     //this.parent.$("#customer_accordion .highrise-count").html(total).show();
                     var tableObj = null;
                     var table_row = "",table_head="";
                     if(data.recordList){
                         var found = false;
                        _.each(data.recordList[0],function(val,key){   
                            
                                if(parseInt(key.substring(key.length-1))==1){
                                    tableObj = $(table_html);
                                    table_head = "<tr>";
                                        _.each(val[0],function(val,key){
                                            table_head +="<th>"+val+"</th>";
                                          });
                                        table_head += "</tr>"
                                        tableObj.find("thead").append(table_head);                                                                                
                                        this.parent.$(".highrise-sample-data").append(tableObj);                                    
                                }
                                else{
                                    table_row = "<tr>";
                                        _.each(val[0],function(val,key){
                                            table_row +="<td>"+val+"</td>";
                                            found = true;
                                          });
                                    table_row += "</tr>"
                                    tableObj.find("tbody").append(table_row);
                                }
                        },this);
                        if(found == false){
                            tableObj.find("tbody").append("<tr> <td style='text-align:center' colspan='20' align='center'>No Records found</td></tr>");                                                               
                        }
                     
                    }
                }
        });
});