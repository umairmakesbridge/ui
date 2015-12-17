define(['text!autobots/html/clone_autobot.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'keypress .inputcont #bot_name':'enterSave'
                },
                enterSave:function(e){                
                     if(e.keyCode === 13){
                         this.copyAutobot();
                     }
                },
                initialize: function () {
                        this.template = _.template(template);				
                        this.parent = this.options.page;                        
                        this.app = this.parent.options.app;
                        this.page = this.parent.model;
                        this.dialog = this.options.copydialog;
                        this.render();                        
                },
                render: function () {                        						
                    this.$el.html(this.template({botName:this.page.get("label")}));                                        
                },
                init:function(){
                  this.$("#bot_name").focus();  
                },
                copyAutobot: function(){
                    if(this.$('#bot_name').val() == ''){						
                            this.app.showError({
                                    control:this.$('.campname-container'),
                                    message:'Autobot name can\'t be empty' 
                            });
                     } 
                             var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=clone";
                             this.app.showLoading("Creating copy of Autobot...",this.$el);
                             $.post(URL, { botId:this.page.get('botId.encode'),label: this.$('#bot_name').val()})
                             .done(_.bind(function(data){
                                     this.app.showLoading(false,this.$el);
                                     var res = jQuery.parseJSON(data);
                                     if(res[0] == 'err')
                                             this.app.showAlert(res[1].replace('&#58;',':'),this.$el);
                                     else{
                                         this.dialog.hide();
                                         if(typeof this.parent.dialog !="undefined")
                                            this.parent.dialog.hide(); 
                                         this.app.showMessge("Copy created successfully.");
                                         this.options.page.options.page.fetchBots();  
                                     }
                             },this));
                     }
                
                
        });
});
