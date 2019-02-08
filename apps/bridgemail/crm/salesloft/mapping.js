define(['text!crm/salesloft/html/mapping.html','bms-mapping','jquery.bmsgrid','jquery.searchcontrol','jquery.highlight'],
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
                        this.fieldType = this.options.fieldType;
                        this.$el.html(this.template({}));                        
                        this.$(".mapTab a:first").tab('show');
                        if(this.options.showSaveButton){
                            this.$(".button-bar").show();
                        }
                        this.loadMappings();
                },
                loadMappings:function(){
                    var self = this;
                    this.app.showLoading("Loading Fields...",this.$(".lead-fields-grid"));
                    this.app.showLoading("Loading Fields...",this.$(".contact-fields-grid"));
                    var URL = "/pms/io/salesloft/setup/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getFields";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$(".lead-fields-grid"));
                        self.app.showLoading(false,self.$(".contact-fields-grid"));
                        var import_fields = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(import_fields)){
                            return false;
                        }
                         if(import_fields[0]!=="err"){
                            
                            var fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="lead_mapping_list_grid"><tbody>';
                            var c_fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="contact_mapping_list_grid"><tbody>';                            
                            $.each(import_fields, function(index, val) {                                                                                  
                                if(val.type.toLowerCase()==self.fieldType || val.type.toLowerCase()=="both"){
                                    var fieldName = val.salesloftField=="BMS_LEAD_SCORE"?"Makesbridge Lead Score":val.salesloftField;
                                    fields_html += '<tr id="row_'+val.mksField+'">';                                                                                               
                                    fields_html += '<td><div class="name-type colico slr"> <strong><span><em>Salesloft Field</em><a><b>'+fieldName+'</b></a></span></strong> </div></td>';                                                                             
                                    fields_html += '<td><div class="type colico mbr show" style="width:162px"> <strong><span><em>Makesbridge Field</em>'+val.mksField+'</span></strong> </div><div id="'+val.mksField+'" class="action"></div></td>';                                                             
                                    fields_html += '</tr>';

                                    c_fields_html+= '<tr id="row_'+val.mksField+'">';                        
                                    c_fields_html += '<td><div class="name-type colico slr"> <strong><span><em>Salesloft Field</em><a><b>'+fieldName+'</b></a></span></strong> </div></td>';                                                       
                                    c_fields_html += '<td><div class="type colico mbr show" style="width:162px"> <strong><span><em>Makesbridge Field</em>'+val.mksField+'</span></strong></div><div id="'+val.mksField+'" class="action"></div></td>';                        
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
                                   height:375,
                                   usepager : false,
                                   colWidth : ['100%','90px']
                           });
                           self.$("#lead_mapping_list_grid tr td:nth-child(1),#contact_mapping_list_grid tr td:nth-child(1)").attr("width","100%");
                           self.$("#lead_mapping_list_grid tr td:nth-child(2),#contact_mapping_list_grid tr td:nth-child(2)").attr("width","110px");                                                              
                                                              
                            
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
                   
                }
        });
});