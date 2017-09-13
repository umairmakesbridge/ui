define(['text!account/html/gmailaccounts.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'gmailaccounts setting-section',                
                events: {                    
                    
                },
                initialize: function () {                    
                    this.template = _.template(template);                       
                    this.apps = this.options.apps;      
                    this.postObject = this.options.postObj;                    
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                                                            
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {                   
                   this.$gamilaccountContainer = this.$("#gmailaccount_grid tbody");  
                   
                   this.loadSubAccounts();                   
                },
                loadSubAccounts:function(){
                    
                },
                updateSubAccount: function(id){                    
                    
                }
                
            });
        });
