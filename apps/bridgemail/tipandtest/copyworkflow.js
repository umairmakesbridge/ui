define(['text!tipandtest/html/copyworkflow.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'keypress .inputcont #camp_name':'enterSave'
                },
                enterSave:function(e){                
                     if(e.keyCode === 13){
                         this.copyWorkflow();
                     }
                },
                initialize: function () {
                    this.parent = this.options.page;      
                    this.app = this.parent.app;
                    this.template = _.template(template);				                                                                  
                    this.workflowObj = this.parent.model;
                    this.dialog = this.options.copydialog;
                    this.render();                        
                },
                render: function () {                        						
                    this.$el.html(this.template({trackName:this.workflowObj.get("name")})); 
                   
                },
                init:function(){
                  this.$("#camp_name").focus();  
                },
                copyWorkflow: function(){
                    if(this.$('#camp_name').val() == ''){						
                            this.app.showError({
                                    control:this.$('.campname-container'),
                                    message:'Workflow name can\'t be empty' 
                            });
                     }
                     else{
                             var URL = "/pms/input/workflow/saveWorkflowData.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&actionType=copy";
                             this.app.showLoading("Creating copy of workflow...",this.$el);
                             $.post(URL, { workflowId:this.workflowObj.get('workflowId'),name: this.$('#camp_name').val(),admin:"true"})
                             .done(_.bind(function(data){
                                     this.app.showLoading(false,this.$el);
                                     var res = data;
                                     if(res[0] == 'err')
                                             this.app.showAlert(res[1].replace('&#58;',':'),this.$el);
                                     else{
                                         this.dialog.hide();
                                         this.app.showMessge("Copy created successfully.");                                                    
                                         this.app.mainContainer.workflowListing(res[1]);  
                                     }
                             },this));
                     }
                }
                
        });
});
