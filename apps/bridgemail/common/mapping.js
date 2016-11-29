define(['text!common/html/mapping.html','bms-mapping','jquery.bmsgrid','jquery.searchcontrol','jquery.highlight'],
function (template,Mapping) {
        'use strict';
        return Backbone.View.extend({                
                events: {                    
                },
                initialize: function () {
                        this.template = _.template(template);				
                        this.render();
                },

                render: function () {
                        this.page = this.options.camp
                        this.app = this.options.app
                        this.dialog = this.options.dialog;
                        this.selectedFields = "";
                        this.$el.html(this.template({}));                        
                        this.$(".mapTab a:first").tab('show');
                        
                        this.loadMappings();
                },
                loadMappings:function(){
                    var self = this;
                    var selectedFields = [];
                    this.app.showLoading("Loading Fields...",this.$(".fields-grid"));                                        
                    var URL = "/pms/report/getCSV.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&type=get";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$(".fields-grid"));                        
                        var import_fields = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(import_fields)){
                            return false;
                        }
                         if(import_fields[0]!=="err"){
                            if(import_fields.count!="0"){
                                var fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="field_mapping_list_grid"><tbody>';                                
                                var system_flag = "";
                                $.each(import_fields.fields[0], function(index, val) {                                              
                                    
                                    system_flag = (val[0].fieldValue=="EMAIL_ADDR")?"system":""; 
                                    
                                     fields_html += '<tr id="row_'+val[0].fieldValue+'">';                                                                                               
                                     fields_html += '<td><div class="name-type colico mbr"> <strong><span><em>Data Field</em><a><b>'+val[0].fieldName+'</b></a></span></strong> </div></td>';                                                                             
                                     fields_html += '<td><div class="type colico mbr" style="width:162px">  </div><div id="'+val[0].fieldValue+'" class="action"><a class="btn-green use move-row '+system_flag+'"><span>Add</span><i class="icon next"></i></a></div></td>';                                                             
                                     fields_html += '</tr>';
                                     if(val[0].isSelected=="true"){
                                         selectedFields.push(val[0].fieldValue);
                                     }
                                   
                               });
                               fields_html += '</tbody></table>';                                   
                               self.$(".fields-grid").html(fields_html);                               
                               self.$el.find("#field_mapping_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:300,
                                       usepager : false,
                                       colWidth : ['100%','90px']
                               });
                               self.$("#field_mapping_list_grid tr td:nth-child(1)").attr("width","100%");
                               self.$("#field_mapping_list_grid tr td:nth-child(2)").attr("width","110px");                                                              
                               
                               self.$(".tab-content").mapping({app:self.app,moveLimit:50,moveItemName:"Fields"});                               
                            }
                            self.$("#field_mapping_list_grid tr .system").click();
                            self.selectedFields = selectedFields.toString();
                            if(selectedFields.length){
                                $.each(selectedFields, function(index, val) {                                                                                                 
                                     self.$("#field_mapping_list_grid tr[id='row_"+val+"'] .use").click()                                                                                            
                                });
                            }
                            /*URL = "/pms/report/getCSV.jsp?BMS_REQ_TK="+self.app.get('bms_token')+"&type=get";
                            self.app.showLoading("Loading Mapped Fields...",self.$(".map-fields-grid"));                            
                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                self.app.showLoading(false,self.$(".map-fields-grid"));                                
                                var mapped_fields = jQuery.parseJSON(xhr.responseText);
                                if(self.app.checkError(mapped_fields)){
                                    return false;
                                }
                                if(mapped_fields[0]!=="err"){
                                    if(mapped_fields.fields){                                          
                                        $.each(mapped_fields.fields[0], function(index, val) {                                                                                                 
                                              self.$("#field_mapping_list_grid tr[id='row_"+val[0].fieldValue+"'] .use").click()                                                                                            
                                        });
                                    }
                                }
                            });*/
                            
                        }
                        
                   });
                   
                   this.$("#field-mapping-search").searchcontrol({
                        id:'field-mapping-search',
                        width:'250px',
                        height:'22px',
                        placeholder: 'Search CSV Mapping Field',
                        gridcontainer: 'field_mapping_list_grid',
                        showicon: 'no',
                        iconsource: ''
                    });                    
                    
                    
                },
                skipFields:function(name){
                    var skip = false;
                    if(name=="Email"){
                        skip = true;
                    }
                    
                    return skip;
                },
                saveCall:function(options){                   
                   var getSelectedMapping = this.getMappedFields();
                   
                   if(this.selectedFields==getSelectedMapping){
                       this.generateCSV(options);
                   }
                   else{
                       var URL = "/pms/report/getCSV.jsp?BMS_REQ_TK="+this.app.get('bms_token');
                       var postData = {layout:getSelectedMapping,type:"save"};
                       this.app.showLoading("Preparing CSV...",this.$el);
                       $.post(URL,postData).done(_.bind(function(data) {
                          this.app.showLoading(false,this.$el);                           
                          var mapping_json = jQuery.parseJSON(data);                              
                          if(mapping_json[0]!=="err"){                           
                               this.generateCSV(options)
                          }
                          else{                                  
                             this.app.showAlert(mapping_json[1],this.$el,{fixed:true});
                          }
                           
                       },this))
                   }
                   
                },
                generateCSV: function(options){
                   this.app.showLoading("Preparing CSV...",this.$el);
                   var URL = "/pms/report/getCSV.jsp?BMS_REQ_TK="+this.app.get('bms_token');
                   var postData ={type:options.type,campaignNumber:options.campNum};
                   if(options.type=="article"){
                       postData["articleNumber"]=options.articleNum;
                   }                  
                   $.post(URL,postData)
                    .done(_.bind(function(data) {                      
                        this.app.showLoading(false,this.$el);
                        var mapping_json = jQuery.parseJSON(data);                              
                        if(mapping_json[0]!=="err"){                           
                           if(this.page.$("iframe.download-iframe").length){
                               this.page.$("iframe.download-iframe").attr("src",mapping_json.url.replace("http","https"));
                           }
                           else{
                              var iframHTML = "<iframe src=\"" + mapping_json.url.replace("http","https") + "\"  width=\"1px\" class=\"download-iframe\" frameborder=\"0\" style=\"height:1px\"></iframe>" ;
                              this.page.$el.append($(iframHTML));
                           }
                           this.dialog.hide();
                        }
                        else{                                  
                            this.app.showAlert(mapping_json[1],this.$el,{fixed:true});
                        }                        
                   },this));  
                },
                getMappedFields:function(){
                    var mapped_trs = this.$(".map-fields-grid tr");
                    var fields_string = "";
                    mapped_trs.each(function(i,v){
                        fields_string += $(this).attr("id").substr(4);
                        if(i<mapped_trs.length-1){
                         fields_string +=",";
                        }
                    });
                    return fields_string;
                }
        });
});