define(['text!crm/salesforce/html/mapping.html','bms-mapping'],
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
                },
                loadMappings:function(){
                    var self = this;
                    this.app.showLoading("Loading Fields...",this.$(".lead-fields-grid"));
                    this.app.showLoading("Loading Fields...",this.$(".contact-fields-grid"));
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=importFields";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$(".lead-fields-grid"));
                        self.app.showLoading(false,self.$(".contact-fields-grid"));
                        var import_fields = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(import_fields)){
                            return false;
                        }
                         if(import_fields[0]!=="err"){
                            if(import_fields.count!="0"){
                                var fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="lead_mapping_list_grid"><tbody>';
                                var c_fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="contact_mapping_list_grid"><tbody>';
                                var system_flag = "";
                                $.each(import_fields.fldList[0], function(index, val) {                                              
                                    system_flag = val[0].defaultSetup=="Y"?"system":""; 
                                    if(val[0].sfObject=="Lead"){
                                     fields_html += '<tr id="row_'+val[0].name+'">';                                                           
                                     fields_html += '<td><div class="name-type"><h3>'+val[0].label+'</h3> </td>';                                                                                           
                                     fields_html += '<td><div class="type show" style="width:144px"><span class=""></span>'+val[0].bmsMappingField+'</div><div id="'+val[0].name+'" class="action"><a class="btn-green use '+system_flag+'">Add</a></div></td>';                        
                                     fields_html += '</tr>';
                                    }
                                    else{
                                     c_fields_html+= '<tr id="row_'+val[0].name+'">';                        
                                     c_fields_html += '<td><div class="name-type"><h3>'+val[0].label+'</h3> </td>';                                                       
                                     c_fields_html += '<td><div class="type show" style="width:144px"><span class=""></span>'+val[0].bmsMappingField+'</div><div id="'+val[0].name+'" class="action"><a class="btn-green use '+system_flag+'">Add</a></div></td>';                        
                                     c_fields_html += '</tr>';
                                    }
                                   
                               });
                               fields_html += '</tbody></table>';   
                               c_fields_html += '</tbody></table>';   
                               self.$(".lead-fields-grid").html(fields_html);
                               self.$(".contact-fields-grid").html(c_fields_html);
                               self.$el.find("#lead_mapping_list_grid,#contact_mapping_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:300,
                                       usepager : false,
                                       colWidth : ['100%','90px']
                               });
                               self.$("#lead_mapping_list_grid tr td:nth-child(1),#contact_mapping_list_grid tr td:nth-child(1)").attr("width","100%");
                               self.$("#lead_mapping_list_grid tr td:nth-child(2),#contact_mapping_list_grid tr td:nth-child(2)").attr("width","110px");                                                              
                               
                               self.$("#leads").mapping({});
                               self.$("#contacts").mapping({});
                            }
                            self.$("#lead_mapping_list_grid tr .system").click();
                            self.$("#contact_mapping_list_grid tr .system").click();
                            
                            URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+self.app.get('bms_token')+"&type=getMappingFields";
                            self.app.showLoading("Loading Mapped Fields...",self.$(".map-lead-fields-grid"));
                            self.app.showLoading("Loading Mapped Fields...",self.$(".map-contact-fields-grid"));
                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                self.app.showLoading(false,self.$(".map-lead-fields-grid"));
                                self.app.showLoading(false,self.$(".map-contact-fields-grid"));
                                var mapped_fields = jQuery.parseJSON(xhr.responseText);
                                if(self.app.checkError(mapped_fields)){
                                    return false;
                                }
                                if(mapped_fields[0]!=="err"){
                                    if(mapped_fields.count!="0"){                                                                                
                                        $.each(mapped_fields.fldList[0], function(index, val) {     
                                            
                                                if(val[0].sfObject=="Lead"){
                                                    self.$("#lead_mapping_list_grid tr[id='row_"+val[0].name+"'] .use").click()
                                                }
                                                else{
                                                    self.$("#contact_mapping_list_grid tr[id='row_"+val[0].name+"'] .use").click()
                                                }
                                            
                                        });
                                    }
                                }
                            });
                        }
                        
                   });
                   
                   this.$("#lead-mapping-search").searchcontrol({
                        id:'lead-mapping-search',
                        width:'250px',
                        height:'22px',
                        placeholder: 'Search Lead Mapping Field',
                        gridcontainer: 'lead_mapping_list_grid',
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
                    
                    
                },
                skipFields:function(name){
                    var skip = false;
                    if(name=="Email" || name=="Owner.Name" || name=="Owner.Email" || name=="HasOptedOutOfEmail" || name=="HasOptedEmail"){
                        skip = true;
                    }
                    
                    return skip;
                },
                saveCall:function(){
                    var self = this;
                    this.app.showLoading("Saving Mapping...",this.$el);
                    var URL = "/pms/io/salesforce/setup/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL,{type:"setMappingFields",leadFields:this.getMappedFields("lead"),contactFields:this.getMappedFields("contact")})
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