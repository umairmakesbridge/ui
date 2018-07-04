define(['text!tipandtest/html/copynurturetrack.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'keypress .inputcont #camp_name':'enterSave'
                },
                enterSave:function(e){                
                     if(e.keyCode === 13){
                         this.copyTrack();
                     }
                },
                initialize: function () {
                    this.parent = this.options.page;      
                    this.app = this.parent.app;
                    this.template = _.template(template);				                                                                  
                    this.trackObj = this.parent.model;
                    this.dialog = this.options.copydialog;
                    this.render();                        
                },
                render: function () {                        						
                    this.$el.html(this.template({trackName:this.trackObj.get("name")})); 
                   
                },
                init:function(){
                  this.$("#camp_name").focus();  
                },
                copyTrack: function(){
                    if(this.$('#camp_name').val() == ''){						
                            this.app.showError({
                                    control:this.$('.campname-container'),
                                    message:'Nurture track name can\'t be empty' 
                            });
                     }
                     else{
                             var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=clone";
                             this.app.showLoading("Creating copy of nurture track...",this.$el);
                             $.post(URL, { trackId:this.trackObj.get('trackId.encode'),name: this.$('#camp_name').val()})
                             .done(_.bind(function(data){
                                     this.app.showLoading(false,this.$el);
                                     var res = jQuery.parseJSON(data);
                                     if(res[0] == 'err')
                                             this.app.showAlert(res[1].replace('&#58;',':'),this.$el);
                                     else{
                                         this.dialog.hide();
                                         this.app.showMessge("Copy created successfully.");           
                                         this.app.mainContainer.openNurtureTrack({"id":res[1],"checksum":res[2],"parent":this.parent,editable:true,kill:false});
                                     }
                             },this));
                     }
                }
                
        });
});
