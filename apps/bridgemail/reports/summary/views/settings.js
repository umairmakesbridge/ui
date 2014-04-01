/* 
 * Name: Setting View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Display Setting Dialog
 * Dependency: Setting HTML
 */
define(['text!reports/summary/html/settings.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
            className: 'camp_set',
            events: {
                
            },
            initialize: function () {
                 this.template = _.template(template);				
                 this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON()));
            },
            checkSubscriber:function(){
                if(this.model.get('isWebVersionLink') == "S")
                return "checked";
            },
            checkShowWebVersion:function(ev){
               if(this.model.get('isWebVersionLink') == "Y")
                 return "checked";

            },
            checkTextOnly:function(){
                if(this.model.get('isTextOnly') == "Y")
                 return "checked ";
                
            },
            checkTellAFriend:function(){
                if(this.model.get('tellafriend') == "Y")
                 return "checked ";
                
            },
            checkUseCustomFooter:function(){
                if(this.model.get('useCustomFooter') == "Y")
                 return "checked ";
            },
            isFooterText:function(){
                if(this.model.get('isFooterText') == "Y")
                return "Company and Physical Address in email footer:";
            }
            
        });
});
