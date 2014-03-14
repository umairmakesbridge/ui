define(['text!crm/html/crm.html','app'],
function (template,app) {
        'use strict';
        return Backbone.View.extend({                
            /**
             * Attach events on elements in view.
            */  
            events: {
                'click .salesforce-tile': 'loadSalesForceCRM'
                    
             },	
             /**
             * Initialize view .
            */
             initialize: function () {
                this.template = _.template(template);				
                this.app = this.options.app;
                this.checkSalesForceStatus();
                this.render();                
            },
            /**
             * Render view .
            */
            render: function () {                        
               this.$el.html(this.template({}));
            },
            /**
             * Load Salesforce CRM .
            */
            loadSalesForceCRM:function(){
                app.mainContainer.addWorkSpace({type:'',title:'Salesforce',url : 'crm/salesforce/salesforce',workspace_id: 'crm_salesforce',tab_icon:'salesforce', single_row:true});
            },
            checkSalesForceStatus: function(){                
                var salesforce_setting = this.app.getAppData("salesfocre");
                if(!salesforce_setting || salesforce_setting[0] == "err" || salesforce_setting.isSalesforceUser=="N")
                {                    
                    this.app.getData({
                        "URL":"/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                        "key":"salesfocre"
                    });
                }
                
           }
        });
});