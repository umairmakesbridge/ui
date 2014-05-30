define(['text!nurturetrack/html/newnurturetrack.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                  'keyup #nurturetrackname':function(e){
                      if(e.keyCode==13){
                          this.createNurtureTrack();
                      }
                  }
                },
                initialize: function () {
                    this.template = _.template(template);				                                         
                    this.dialog = this.options.newdialog;
                    this.parent = this.options.page;
                    this.app =  this.parent.app;                    
                    this.render();   
                },

                render: function () {                    									
                    this.$el.html(this.template({}));
                    this.nurtureTrackInput = this.$("#nurturetrackname");
                },
		createNurtureTrack:function(){
                    var inputContainer = this.$(".campname-container");
                    if(this.nurtureTrackInput.val() == '')
                    {				                            
                            this.app.showError({
                                    control:inputContainer,
                                    message:'Nuture Track name can\'t be empty'
                            });
                    }
                    else
                    {	
                        this.app.hideError({control:inputContainer});
                        this.app.showLoading("Creating nurture track...",this.$el);
                         var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                         var post_data = { type: "create",name:this.nurtureTrackInput.val() };                        
                         $.post(URL,post_data )
                          .done(_.bind(function(data) {  
                              this.app.showLoading(false,this.$el);                            
                              var _json = jQuery.parseJSON(data);                              
                              if(_json[0]!=="err"){                                                                  
                                 this.dialog.hide();
                                 this.app.mainContainer.openNurtureTrack({"id":_json[1],"checksum":_json[2],"parent":this.parent});                                 
                                 this.parent.addCountHeader();
                                 this.parent.fetchTracks();
                                 this.app.mainContainer.openNurtureTrack({"id":_json[1],"checksum":_json[2],"parent":this.parent});
                              }
                              else{
                                  this.app.showAlert(_json[1],this.$el);
                              }                              
                         },this));
                    }
               }
        });
});