define(['text!nurturetrack/html/copynurturetrack.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'keypress .inputcont #camp_name':'enterSave'
                },
                enterSave:function(e){
                
                     if(e.which === 13){
                         var _dilog = '';
                        if(this.options.copycampsdialog)
                           _dilog = this.options.copycampsdialog;
                        else
                           _dilog = this.options.copycampdialog;
                        _dilog.$el.find('.btn-save').click();  
                     }
                },
                initialize: function () {
                        this.template = _.template(template);				
                        this.parent = this.options.page;                        
                        this.app = this.parent.app;
                        this.render();                        
                },
                render: function () {                        						
                    this.$el.html(this.template({}));                                        
                },
                init:function(){
                  this.$("#camp_name").focus();  
                },
                copyTrack: function(){
                       
                }
                
        });
});
