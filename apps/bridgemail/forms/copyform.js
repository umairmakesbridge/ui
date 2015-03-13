define(['text!forms/html/copyform.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'keypress .inputcont #camp_name':'enterSave'
                },
                enterSave:function(e){                
                     if(e.keyCode === 13){
                         this.copyForm();
                     }
                },
                initialize: function () {
                    this.parent = this.options.page;      
                    this.app = this.parent.app;
                    this.template = _.template(template);				                                                                  
                    this.pageObj = this.parent.model;
                    this.dialog = this.options.copydialog;
                    this.render();                        
                },
                render: function () {                        						
                    this.$el.html(this.template({pageName:this.pageObj.get("name")})); 
                   
                },
                init:function(){
                  this.$("#camp_name").focus();  
                },
                copyForm: function(){
                    if(this.$('#camp_name').val() == ''){						
                            this.app.showError({
                                    control:this.$('.campname-container'),
                                    message:'Form name can\'t be empty' 
                            });
                     }
                     else{
                             var URL = "/pms/io/form/saveSignUpFormData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=clone";
                             this.app.showLoading("Creating copy of form...",this.$el);
                             $.post(URL, { formId:this.pageObj.get('formId.encode'),name: this.$('#camp_name').val()})
                             .done(_.bind(function(data){
                                     this.app.showLoading(false,this.$el);
                                     var res = jQuery.parseJSON(data);
                                     if(res[0] == 'err')
                                             this.app.showAlert(res[1].replace('&#58;',':'),this.$el);
                                     else{
                                         this.dialog.hide();
                                         this.app.showMessge("Copy created successfully.");                                         
                                         this.parent.sub.fetchForms();
                                         this.parent.sub.openFormDialog(res[1]);                                         
                                     }
                             },this));
                     }
                }
                
        });
});
