define(['text!crm/highrise/html/mapping.html','bms-mapping','jquery.bmsgrid','jquery.searchcontrol','jquery.highlight'],
function (template,Mapping) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'click .btn-save-mapping':'saveCall'
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.render();
                },

                render: function () {
                        this.camp = this.options.camp?this.options.camp:this.options.page; 
                        this.app = this.camp.app;                        
                        this.$el.html(this.template({}));                        
                        this.$(".mapTab a:first").tab('show');
                        if(this.options.showSaveButton){
                            this.$(".button-bar").show();
                        }
                        this.loadMappings();
                },loadMappings:function(){
                    var self = this;
                    this.app.showLoading("Loading Fields...",this.$(".customer-fields-grid"));
                    var URL = "/pms/io/highrise/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=importFields";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$(".customer-fields-grid"));
                        var import_fields = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(import_fields)){
                            return false;
                        }
                         if(import_fields[0]!=="err"){
                            if(import_fields.count!="0"){
                                var fields_html = '<table cellpadding="0" cellspacing="0" width="100%" class="highrise-mapping-table" id="customer_mapping_list_grid"><tbody>';
                                var system_flag = "";
                                $.each(import_fields.fldList[0], function(index, val) {                                              
                                   system_flag = val[0].defaultSetup=="Y"?"system":""; 
                                   
                                                                   
                                     var mapping_field = val[0].bmsMappingField;
                                     fields_html += '<tr id="row_'+val[0].name+'">';                                                                                               
                                     fields_html += '<td><div class="name-type colico hr"> <strong><span><em>Highrise Field</em><a><b>'+val[0].label+'</b></a></span></strong> </div></td>';                                                                             
                                     fields_html += '<td><div class="type colico mbr show" style="width:174px"> <strong><span><em>Makesbridge Field</em>'+mapping_field+'</span></strong> </div><div id="'+val[0].name+'" class="action"><a class="btn-green use move-row '+system_flag+'"><span>Add</span><i class="icon next"></i></a></div></td>';                                                             
                                     fields_html += '</tr>';
                                     
                                     
                                  
                               });
                               fields_html += '</tbody></table>';   
                               
                               self.$(".customer-fields-grid").html(fields_html);
                               self.$el.find("#customer_mapping_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:300,
                                       usepager : false,
                                       colWidth : ['100%','90px']
                               });
                               self.$("#customer_mapping_list_grid tr td:nth-child(1),#contact_mapping_list_grid tr td:nth-child(1),#partner_mapping_list_grid tr td:nth-child(1)").attr("width","80%");
                               self.$("#customer_mapping_list_grid tr td:nth-child(2),#contact_mapping_list_grid tr td:nth-child(2),#partner_mapping_list_grid tr td:nth-child(2)").attr("width","20%");                                                              
                               
                               self.$("#customers").mapping({});
                            }
                            
                            self.$("#customer_mapping_list_grid tr .system").click()
                            
                            URL = "/pms/io/highrise/setup/?BMS_REQ_TK="+self.app.get('bms_token')+"&type=getFields";
                            self.app.showLoading("Loading Mapped Fields...",self.$(".map-customer-fields-grid"));
                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                self.app.showLoading(false,self.$(".map-customer-fields-grid"));
                                var mapped_fields = jQuery.parseJSON(xhr.responseText);
                                if(self.app.checkError(mapped_fields)){
                                    return false;
                                }
                                if(mapped_fields[0]!=="err"){
                                    if(mapped_fields.count!="0"){                                                                                
                                        $.each(mapped_fields.fldList[0], function(index, val) {                                                
                                                self.$("#customer_mapping_list_grid tr[id='row_"+val[0].name+"'] .use").click()
                                            
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
                        placeholder: 'Search People Mapping Field',
                        gridcontainer: 'customer_mapping_list_grid',
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
                    var URL = "/pms/io/highrise/setup/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL,{type:"setFields",fields:this.getMappedFields("customer")})
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