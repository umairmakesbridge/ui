define(['text!target/html/target.html','bms-filters'],
function (template,bmsfilters) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'click .savetarget': function(obj){
                          this.saveTarget(obj)
                      },
                       'click .canceltarget': function(obj){
                          if(this.target_id){
                            this.showHideTargetTitle();
                          }
                      },
                      'click .targt .edit': function(){
                          this.showHideTargetTitle(true);
                      },
                      'click .targt .delete':function(){
                        this.deleteTarget();  
                      },
                      'click .targt #target_name_text span': function(){
                          this.showHideTargetTitle(true);
                      }
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.render();
                },

                render: function () {
                        this.app = this.options.camp.app; 
                        this.target_id = this.options.target_id;
                        this.$el.html(this.template({}));                                                
                        this.$("#c_c_target").filters({app:this.app});                        
                        if(!this.target_id){
                            this.$("#targets_tags").tags({app:this.app,
                                url:'/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+this.app.get('bms_token'),
                                params:{type:'tags',filterNumber:'',tags:''}
                            });
                        }
                        else{
                            this.loadTarget(this.target_id);
                        }
                },
                saveTarget:function(obj){                   
                   var camp_obj = this;
                   var target_name_input =  $(obj.target).parent().find("input");                       
                   var target_head = $(obj.target).parents("div.targt");
                   var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&filterFor=C";
                   if(target_name_input.val()!==""){

                     if(this.target_id){
                        $(obj.target).addClass("saving");                         
                        $.post(URL, { type: "newName",filterName:target_name_input.val(),filterNumber:this.target_id })
                          .done(function(data) {                              
                              var target_json = jQuery.parseJSON(data);                              
                              if(target_json[0]!=="err"){
                                 target_head.find("#target_name_text").show(); 
                                 target_head.find("#target_name_text span").html(target_name_input.val());                                                                                                 
                                 target_head.find("#target_name_edit").hide();
                                 camp_obj.app.showMessge("Target Renamed");
                                 camp_obj.app.removeCache("targets");
                              }
                              else{                                  
                                  camp_obj.app.showAlert(target_json[1],camp_obj.$el);
                                  
                              }
                              $(obj.target).removeClass("saving");                              
                         }); 
                     }
                     else{                         
                         $(obj.target).addClass("saving");
                         $.post(URL, { type: "create",filterName:target_name_input.val() })
                          .done(function(data) {                              
                              var camp_json = jQuery.parseJSON(data);                              
                              if(camp_json[0]!=="err"){
                                 target_head.find("#target_name_text").show(); 
                                 target_head.find("#target_name_text span").html(target_name_input.val());
                                 camp_obj.target_id = camp_json[1];
                                 if(camp_obj.$("#targets_tags").data("tags")){
                                    camp_obj.$("#targets_tags").data("tags").setObjectId("filterNumber",camp_json[1]);
                                 }
                                 target_head.find("#target_name_edit").hide();
                                 camp_obj.app.showMessge("Target Created");
                                 camp_obj.app.removeCache("targets");
                              }
                              else{
                                  camp_obj.app.showAlert(camp_json[1],camp_obj.$el);
                              }
                              $(obj.target).removeClass("saving");                              
                         });
                     }
                   }                      
                    obj.stopPropagation();
               },
               showHideTargetTitle:function(show,isNew){
                   if(show){
                       this.$(".targt #target_name_text").hide();
                       this.$(".targt #target_name_edit").show();
                       if(isNew){
                           this.$(".targt #target_name_text span").html('');
                           this.target_id = 0;
                       }
                       this.$(".targt #target_name_edit input").val(this.$(".targt #target_name_text span").html());
                   }
                   else{
                       this.$(".targt #target_name_text").show();
                       this.$(".targt #target_name_edit").hide();                       
                   }
               },
               deleteTarget:function(){
                   var camp_obj = this;
                   if(confirm('Are you sure you want to delete this target?')){
                        var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                        camp_obj.app.showLoading("Deleting...",camp_obj.$el);
                        $.post(URL, {type:'delete',filterNumber:this.target_id})
                        .done(function(data) {                                 
                               var del_target_json = jQuery.parseJSON(data);  
                               if(camp_obj.app.checkError(del_target_json)){
                                      return false;
                               }
                               if(del_target_json[0]!=="err"){
                                   camp_obj.app.showMessge("Target Deleted");                                   
                                   camp_obj.showHideTargetTitle(true,true);
                               }                               
                               camp_obj.app.showLoading(false,camp_obj.$el);
                       });
                    }
               },
               saveTargetFilter:function(){
                   var target_id = this.target_id;
                   if(target_id){
                       var camp_obj = this;
                       var post_data = "";
                        if(camp_obj.$("#targets_tags").data("tags")){
                           post_data = camp_obj.$("#c_c_target").data("filters").saveFilters();
                        }
                        camp_obj.app.showLoading("Saving Target...",camp_obj.$el);                        
                        var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+this.app.get('bms_token')+post_data;
                        $.post(URL, {type:'update',filterNumber:target_id})
                        .done(function(data) {                                 
                            camp_obj.app.showLoading(false,camp_obj.$el);                        
                            var target_json = jQuery.parseJSON(data);  
                            if(camp_obj.app.checkError(target_json)){
                                   return false;
                            }   
                            
                            if(target_json[0]!=="err"){
                                camp_obj.app.showMessge("Target has been updated");
                            }
                            else{
                                camp_obj.app.showAlert(false,camp_obj.$el);
                            }
                            
                       });
                   }
                   else{
                       this.app.showAlert("Please create a target first!",this.$el);
                   }
               },
               loadTarget:function(target_id){                  
                   var camp_obj = this;
                   var URL = '/pms/io/filters/getTargetInfo/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=get&filterNumber='+target_id;
                   camp_obj.app.showLoading("Loading Target...",camp_obj.$el);
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        camp_obj.app.showLoading(false,camp_obj.$el);
                        var selected_target = jQuery.parseJSON(xhr.responseText);
                         if(camp_obj.app.checkError(selected_target)){
                             return false;
                         }
                         if(selected_target){
                             camp_obj.target_id = selected_target["filterNumber.encode"];
                             camp_obj.$(".targt #target_name_text span").html(selected_target.name);
                             camp_obj.showHideTargetTitle(false);
                             camp_obj.$("#targets_tags").tags({app:camp_obj.app,
                                url:'/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+camp_obj.app.get('bms_token'),
                                params:{type:'tags',filterNumber:selected_target["filterNumber.encode"],tags:''}
                                ,showAddButton:true,
                                tags:selected_target.tags
                             });
                             var filters = camp_obj.$("#c_c_target").data("filters")
                             if(filters){
                                 filters.loadFilters(selected_target);
                             }
                         }
                                                     
                    });
               }
        });
});