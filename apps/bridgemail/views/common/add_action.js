define(['jquery', 'backbone', 'underscore','text!templates/common/add_action.html'],
function ($,Backbone, _, template) {
        'use strict';
        return Backbone.View.extend({                
                className :'overlay',                
                events: {              
                    'click .closebtn': 'close',
                    'click .create-button': 'create',
                    'keyup .field-text': 'onkeycreate'
                },
                initialize: function () {
                        this.app = this.options.app;
                        this.template = _.template(template);				                                
                        this.render();
                        this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});	
                },
                render: function () {
                    var headText = this.options.heading ? this.options.heading : "Enter name to create";
                    var buttonText = this.options.buttnText ? this.options.buttnText : "Create";
                    var plHolderText = this.options.plHolderText ? this.options.plHolderText : "Enter name";
                    var bgClass = this.options.bgClass ? this.options.bgClass :"";
                    this.$el.html(this.template({heading:headText,button:buttonText,placeholdertext:plHolderText,bgClass:bgClass}));
                    this.init();    
                },
                init: function () {
                    this.$(".field-text").focus();
                },
                onkeycreate : function(e){
                    if(e.keyCode==13){
                        this.create();
                    }
                },
                create: function(e){
                    if($(".create-button").hasClass("saving")) return false;
                    var field_text = $.trim(this.$(".field-text").val());
                    if(field_text){
                        this.app.hideError({control:this.$('.lp_name')});                        
                        if(this.options.createURL){   
                            if(this.options.postData){this.options.postData[this.options.fieldKey] = field_text;}
                            this.$(".create-button").addClass("saving");
                            this.$(".field-text").prop("disabled",true);
                             $.post(this.options.createURL,this.options.postData )
                              .done(_.bind(function(data) {                                      
                                  var _json = jQuery.parseJSON(data);                              
                                  this.$(".create-button").removeClass("saving");
                                  this.$(".field-text").prop("disabled",false);
                                  if(_json[0]!=="err"){                                                                      
                                     if(this.options.saveCallBack){
                                         this.options.saveCallBack(field_text,_json);
                                     }
                                     this.close();
                                  }
                                  else{
                                      this.app.showAlert(_json[1],$("body"));
                                  }                              
                             },this));
                            
                        }
                    }
                    else{
                        this.app.showError({
                            control:this.$('.lp_name'),
                            message: this.options.emptyError?this.options.emptyError:"Name can't be empty."
                        });
                    }
                },
                close: function() {
                    this.$el.remove();
                }
        });
});
