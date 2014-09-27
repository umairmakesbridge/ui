define(['text!crm/salesforce/html/owner_sync.html','crm/salesforce/collections/ownerfields','jquery.icheck','jquery.bmsgrid'],
function (template,OwnerFields) {
        'use strict';
        return Backbone.View.extend({                                
                events: {
                    'click .update-fields': function(){
                        this.updateFields('owner');
                    },
                    'click .deactivate-fields': function(){
                        this.updateFields('deactivate');
                    },
                    'click .activate-fields':function(){
                        this.updateFields('owner');
                    }
                },
                initialize: function () {
                    this.template = _.template(template);				
                    this.ownerFieldsRequest = new OwnerFields(); 
                    this.tid='';
                    this.render();
                },
                render: function () {
                    this.app = this.options.page.app;                                                 
                    this.$el.html(this.template({}));      
                    this.defaultFields = ['Name','Email','id'];
                    this.$fieldsContainer = this.$(".template-container");
                    this.initControl();                                           
                },
                initControl:function(){                    
                    this.$('input.checkpanel').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                    });
                     this.$('input.checkpanel').on('ifChecked', _.bind(function(event){
                        this.$(".field-row-checkbox").iCheck('check');
                    },this));

                    this.$('input.checkpanel').on('ifUnchecked', _.bind(function(event){
                        this.$(".field-row-checkbox").iCheck('uncheck');  
                    },this));
                    
                    this.createTable();
                },
                createTable:function(){                   
                    this.app.showLoading("Loading Fields...",this.$fieldsContainer);
                    this._request = this.ownerFieldsRequest.fetch({
                      success: _.bind(function (collection, response) {  
                           this.$(".fields-count").html(collection.length);                          
                           this.getOwnerTrans();
                           var fields_html = '<table cellpadding="0" cellspacing="0" width="100%" id="ownerfields_list_grid"><tbody>';                             
                           _.each(collection.models,function(val,key){
                              fields_html += '<tr id="row_'+val.get("name")+'">';
                                if(this.defaultFields.indexOf(val.get("name"))>-1){
                                    fields_html += '<td><input type="checkbox" checked value="'+val.get("name")+'"  class="checkpanel default-fields"/></td>';
                                }else{
                                    fields_html += '<td><input type="checkbox" value="'+val.get("name")+'"  class="checkpanel field-row-checkbox"/></td>';
                                }
                                fields_html += '<td><div class="name-type"><h3>'+val.get("label")+'</h3></div></td>';
                              fields_html += '</tr>';
                          },this);
                          fields_html +="</tbody></table>";
                          this.$fieldsContainer.html(fields_html);
                          this.$("#ownerfields_list_grid").bmsgrid({
                                    useRp : false,
                                    resizable:false,
                                    colresize:false,
                                    height:285,
                                    usepager : false,
                                    colWidth : ['40px','100%']
                            });
                            this.$('#ownerfields_list_grid input.checkpanel').iCheck({
                                checkboxClass: 'checkpanelinput',
                                insert: '<div class="icheck_line-icon"></div>'
                            });
                            this.$("#ownerfields_list_grid input.default-fields").iCheck('disable');                           
                            
                      }, this),
                      error: function (collection, resp) {

                      }
                  });                  
               },
               getOwnerTrans:function(){
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=getOwnerTransaction";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){                        
                         this.app.showLoading(false,this.$fieldsContainer);
                         var owner_trans = jQuery.parseJSON(xhr.responseText);
                         if(owner_trans[0]=="err"){
                             return false;
                         }
                         if(owner_trans.count && owner_trans.count=="0"){
                             this.$(".update-fields,.deactivate-fields").hide();
                             this.$(".activate-fields").show();
                         }
                         else if(owner_trans.status=="D"){
                             this.$(".update-fields,.deactivate-fields").hide();
                             this.$(".activate-fields").show();
                         }else{
                             this.$(".update-fields,.deactivate-fields").show();
                             this.$(".activate-fields").hide();
                             
                         }
                         this.tid = owner_trans.tId;                          
                         this.$(".frequency .active").removeClass("active");
                         this.$(".frequency button[rule='"+owner_trans.frequency+"']").addClass("active");
                         if(owner_trans.count!=="0"){
                            _.each(owner_trans.fldList[0],function(val,key){
                                 this.$("input.field-row-checkbox[value='"+val[0].name+"']").iCheck('check');
                            },this);
                         }
                         
                        
                    },this));
               },
               updateFields:function(flag){
                    this.app.showLoading("Updating...",this.$el);
                    var URL = "/pms/io/salesforce/setData/?BMS_REQ_TK="+this.app.get('bms_token');
                    var selectedFields = this.$(".field-row-checkbox:checked").map(function(){
                          return $(this).val()
                    }).toArray().join();                   
                    var freq = this.$(".frequency .active").attr("rule");   
                    var postData = null;
                    if(flag=='owner'){
                        postData = {type:flag,ownerFields:selectedFields,frequency:freq};
                    }
                    else{
                        postData = {type:flag,tId:this.tid};
                    }
                    $.post(URL,postData)
                    .done(_.bind(function(data) {                      
                        this.app.showLoading(false,this.$el);
                        var _json = jQuery.parseJSON(data);                              
                        if(_json[0]!=="err"){                                                     
                           if(flag=="owner"){
                                this.app.showMessge("Salesforce owner transaction has been activated/updated successfully.");
                                this.$(".update-fields,.deactivate-fields").show();
                                this.$(".activate-fields").hide();
                                //this.tid = 
                           }
                           else{
                                this.app.showMessge("Salesforce owner transaction has been deactivated successfully.");
                                this.$(".update-fields,.deactivate-fields").hide();
                                this.$(".activate-fields").show();
                           }
                        }
                        else{                                  
                            this.app.showAlert(_json[1],this.$el,{fixed:true});
                        }                        
                   },this)); 
               }
                
        });
});