define(['text!crm/netsuite/html/mapping.html','bms-mapping'],
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
                        this.camp = this.options.camp; 
                        this.app = this.camp.app;                        
                        this.$el.html(this.template({}));                        
                        this.$(".mapTab a:first").tab('show');
                        this.loadMappings();
                },loadMappings:function(){
                    var self = this;
                    this.app.showLoading("Loading Fields...",this.$(".customer-fields-grid"));
                    this.app.showLoading("Loading Fields...",this.$(".contact-fields-grid"));
                    this.app.showLoading("Loading Fields...",this.$(".partner-fields-grid"));
                    var URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=importFields";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$(".customer-fields-grid"));
                        self.app.showLoading(false,self.$(".contact-fields-grid"));
                        self.app.showLoading(false,self.$(".partner-fields-grid"));
                        var import_fields = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(import_fields)){
                            return false;
                        }
                         if(import_fields[0]!=="err"){
                            if(import_fields.count!="0"){
                                var fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="customer_mapping_list_grid"><tbody>';
                                var c_fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="contact_mapping_list_grid"><tbody>';
                                var p_fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="partner_mapping_list_grid"><tbody>';
                                $.each(import_fields.fldList[0], function(index, val) {                                              
                                   if(!self.skipFields(val[0].name)){ 
                                    if(val[0].nsObject=="Customer"){
                                     fields_html += '<tr id="row_'+val[0].name+'">';                                                           
                                     fields_html += '<td><div class="name-type"><h3>'+val[0].label+'</h3> </td>';                                                     
                                     var mapping_field = val[0].bmsMappingField!=='[Custom Field]'?val[0].bmsMappingField:'';
                                     fields_html += '<td><div class="type show" style="width:90px"><span class=""></span>'+mapping_field+'</div><div id="'+val[0].name+'" class="action"><a class="btn-green use move-row">Add</a></div></td>';                        
                                     fields_html += '</tr>';
                                    }
                                    else if(val[0].nsObject=="Contact"){
                                     c_fields_html+= '<tr id="row_'+val[0].name+'">';                        
                                     c_fields_html += '<td><div class="name-type"><h3>'+val[0].label+'</h3> </td>';                  
                                     var mapping_field = val[0].bmsMappingField!=='[Custom Field]'?val[0].bmsMappingField:'';
                                     c_fields_html += '<td><div class="type show" style="width:90px"><span class=""></span>'+mapping_field+'</div><div id="'+val[0].name+'" class="action"><a class="btn-green use move-row">Add</a></div></td>';                        
                                     c_fields_html += '</tr>';
                                    }
                                    else if(val[0].nsObject=="Partner"){
                                        p_fields_html+= '<tr id="row_'+val[0].name+'">';                        
                                        p_fields_html += '<td><div class="name-type"><h3>'+val[0].label+'</h3> </td>';                  
                                        var mapping_field = val[0].bmsMappingField!=='[Custom Field]'?val[0].bmsMappingField:'';
                                        p_fields_html += '<td><div class="type show" style="width:90px"><span class=""></span>'+mapping_field+'</div><div id="'+val[0].name+'" class="action"><a class="btn-green use move-row">Add</a></div></td>';                        
                                        p_fields_html += '</tr>';
                                    }
                                  }
                               });
                               fields_html += '</tbody></table>';   
                               c_fields_html += '</tbody></table>';   
                               p_fields_html += '</tbody></table>';   
                               self.$(".customer-fields-grid").html(fields_html);
                               self.$(".contact-fields-grid").html(c_fields_html);
                               self.$(".partner-fields-grid").html(p_fields_html);
                               self.$el.find("#customer_mapping_list_grid,#contact_mapping_list_grid,#partner_mapping_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:300,
                                       usepager : false,
                                       colWidth : ['100%','90px']
                               });
                               self.$("#customer_mapping_list_grid tr td:nth-child(1),#contact_mapping_list_grid tr td:nth-child(1),#partner_mapping_list_grid tr td:nth-child(1)").attr("width","100%");
                               self.$("#customer_mapping_list_grid tr td:nth-child(2),#contact_mapping_list_grid tr td:nth-child(2),#partner_mapping_list_grid tr td:nth-child(2)").attr("width","90px");                                                              
                               
                               self.$("#customers").mapping({});
                               self.$("#contacts").mapping({});
                               self.$("#partners").mapping({});
                            }
                            URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+self.app.get('bms_token')+"&type=getFields";
                            self.app.showLoading("Loading Mapped Fields...",self.$(".map-customer-fields-grid"));
                            self.app.showLoading("Loading Mapped Fields...",self.$(".map-contact-fields-grid"));
                            self.app.showLoading("Loading Mapped Fields...",self.$(".map-partner-fields-grid"));
                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                self.app.showLoading(false,self.$(".map-customer-fields-grid"));
                                self.app.showLoading(false,self.$(".map-contact-fields-grid"));
                                self.app.showLoading(false,self.$(".map-partner-fields-grid"));
                                var mapped_fields = jQuery.parseJSON(xhr.responseText);
                                if(self.app.checkError(mapped_fields)){
                                    return false;
                                }
                                if(mapped_fields[0]!=="err"){
                                    if(mapped_fields.count!="0"){                                                                                
                                        $.each(mapped_fields.fldList[0], function(index, val) {     
                                            if(self.skipFields(val[0].name)){
                                                var fields_html = '';                                                
                                                fields_html += '<tr id="row_'+val[0].name+'">';                                                           
                                                fields_html += '<td width="100%"><div><div class="name-type"><h3>'+val[0].name+'</h3> </div></div></td>';                                                                                                     
                                                fields_html += '<td width="90px"><div><div style="width:90px" class="type"><span class=""></span></div></div></td>';                        
                                                fields_html += '</tr>';
                                                
                                                if(val[0].nsObject=="Customer"){
                                                    self.$(".map-customer-fields-grid tbody").append(fields_html)
                                                }
                                                else if(val[0].nsObject=="Contact"){
                                                    self.$(".map-contact-fields-grid tbody").append(fields_html) 
                                                }
                                                else if(val[0].nsObject=="Partner"){
                                                    self.$(".map-partner-fields-grid tbody").append(fields_html) 
                                                }
                                                       
                                            }
                                            else{
                                                if(val[0].nsObject=="Customer"){
                                                    self.$("#customer_mapping_list_grid tr[id='row_"+val[0].name+"'] .use").click()
                                                }
                                                else if(val[0].nsObject=="Contact"){
                                                    self.$("#contact_mapping_list_grid tr[id='row_"+val[0].name+"'] .use").click()
                                                }
                                                 else if(val[0].nsObject=="Partner"){
                                                     self.$("#partner_mapping_list_grid tr[id='row_"+val[0].name+"'] .use").click()
                                                 }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        
                   });
                   
                   this.$("#customer-mapping-search").searchcontrol({
                        id:'customer-mapping-search',
                        width:'250px',
                        height:'22px',
                        placeholder: 'Search Customer Mapping Field',
                        gridcontainer: 'customer_mapping_list_grid',
                        showicon: 'no',
                        iconsource: ''
                    });
                    this.$("#contact-mapping-search").searchcontrol({
                        id:'contact-mapping-search',
                        width:'250px',
                        height:'22px',
                        placeholder: 'Search Contact Mapping Field',
                        gridcontainer: 'contact_mapping_list_grid',
                        showicon: 'no',
                        iconsource: ''
                    });
                    this.$("#partner-mapping-search").searchcontrol({
                        id:'partner-mapping-search',
                        width:'250px',
                        height:'22px',
                        placeholder: 'Search Partner Mapping Field',
                        gridcontainer: 'partner_mapping_list_grid',
                        showicon: 'no',
                        iconsource: ''
                    });
                    
                    
                },
                skipFields:function(name){
                    var skip = false;
                    if(name=="email" || name=="internalID" || name=="entityID"){
                        skip = true;
                    }
                    
                    return skip;
                },
                saveCall:function(){
                    var self = this;
                    this.app.showLoading("Saving Mapping...",this.$el);
                    var URL = "/pms/io/netsuite/setup/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=setFields";
                    $.post(URL,{type:"setFields",customerFields:this.getMappedFields("customer"),contactFields:this.getMappedFields("contact"),partnerFields:this.getMappedFields("partner")})
                    .done(function(data) {                      
                        self.app.showLoading(false,self.$el);
                        var mapping_json = jQuery.parseJSON(data);                              
                        if(mapping_json[0]!=="err"){                           
                           self.app.showMessge("Mapping Saved Successfully!");
                        }
                        else{                                  
                            self.app.showAlert(mapping_json[1],self.$el,{fixed:true});
                        }                        
                   }); 
                },
                getMappedFields:function(type){
                    var mapped_trs = this.$(".map-"+type+"-fields-grid tr");
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