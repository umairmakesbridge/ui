define(['text!campaigns/html/newcampaign.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    "keyup #camp_name":function(e)
                    {
                            if(e.keyCode==13){
                                     this.createCampaign();
                             }
                    }
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.render();
                        var newcampdialog = this.options.newcampdialog;
                        var app = this.options.app;
                        if(this.options.templateID){
                            this.templateID = this.options.templateID
                        }
                      //  app.showLoading(false,newcampdialog.getBody());
                },

                render: function () {
                        this.app = this.options.app;						
			this.curview = this;
                        this.$el.html(this.template({}));
                },
		createCampaign:function(templateID){
                    var curview = this;
                    var camp_obj = curview.options.camp;                   
                    var el = curview.$el;
                    var app = curview.app;
                    var appMsgs = curview.app.messages[0];
                    var newcampdialog = curview.options.newcampdialog;
				  
                    if(el.find('#camp_name').val() == '')
                    {						
                            app.showError({
                                    control:el.find('.campname-container'),
                                    message:appMsgs.CAMPS_campname_empty_error
                            });
                    }
                    else
                    {						
                         app.hideError({control:el.find(".campname-container")});
                         app.showLoading("Creating campaign...",curview.$el);
                         var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                         var post_data = { type: "create",campName:el.find('#camp_name').val() };
                         if(this.templateID){
                           post_data['templateNumber'] = this.templateID;
                         }
                         $.post(URL,post_data )
                          .done(function(data) {  
                              app.showLoading(false,curview.$el);                            
                              var camp_json = jQuery.parseJSON(data);                              
                              if(camp_json[0]!=="err"){                                 
                                 var camp_id = camp_json[1];
                                 var camp_wsid = camp_json[2];
                                 newcampdialog.hide();
                                 if(camp_obj.headBadge){
                                     camp_obj.headBadge();
                                 }
                                 app.mainContainer.openCampaign(camp_id,camp_wsid);
                              }
                              else{
                                  app.showAlert(camp_json[1],curview.$el);
                              }                              
                         });
                    }
               }
        });
});