define(['text!contacts/html/addcustomfiled.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Add Custom field dilaog
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'scfe_field',            
            /**
             * Attach events on elements in view.
            */
            events: {
              'keypress #field_name':function(e){
                     if(e.keyCode==13){
                         this.addCustomField();
                     }
                },
                'keypress #fied_value':function(e){
                     if(e.keyCode==13){
                         this.addCustomField();
                     }
                }
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {                                        
                    this.template = _.template(template);
                    this.page = this.options.sub;
                    this.dialog = this.options.dialog;
                    this.render();                             
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                }));       
                this.$el.css({"margin-left":"10px"});
                                
            },
            init:function() {                
                this.$("#field_name").focus();
            },
            addCustomField: function(){
                var keyValue = $.trim(this.$("#field_name").val());
                if(keyValue){
                    var fieldValue = $.trim(this.$("#fied_value").val());
                    this.page.createNewCustField({fieldName:keyValue,fieldValue:fieldValue});
                    this.dialog.hide();
                }
                else{                    
                    this.$("#field_name").addClass("hasError").focus();
                }
            }
            
            
        });
});