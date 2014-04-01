define(['text!crm/html/crm.html','app'],
    function (template,app) {
        'use strict';
        return Backbone.View.extend({                
            /**
             * Attach events on elements in view.
            */  
            events: {
                'click .salesforce-tile': 'loadSalesForceCRM',
                'click .netsuite-tile': 'loadNetSuiteCRM'
                    
            },	
            /**
             * Initialize view .
            */
            initialize: function () {
                this.template = _.template(template);				
                this.app = this.options.app;                
                this.render();              
                this.checkSalesForceStatus();
                this.checkNetSuiteStatus();
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
            loadSalesForceCRM:function(e){
                var tile = $.getObj(e,"li");
                if(tile.find(".loading").length>0){
                    return false;
                }
                app.mainContainer.addWorkSpace({
                    type:'',
                    title:'Salesforce',
                    url : 'crm/salesforce/salesforce',
                    workspace_id: 'crm_salesforce',
                    tab_icon:'salesforce'
                });
            },
            loadNetSuiteCRM:function(e){
                var tile = $.getObj(e,"li");
                if(tile.find(".loading").length>0){
                    return false;
                }
                app.mainContainer.addWorkSpace({
                    type:'',
                    title:'NetSuite',
                    url : 'crm/netsuite/netsuite',
                    workspace_id: 'crm_netsuite',
                    tab_icon:'netsuite'
                });
            },
            checkSalesForceStatus: function(){                
                var salesforce_setting = this.app.getAppData("salesfocre");
                this.app.showLoading("...",this.$(".salesforce-tile"));
                if(!salesforce_setting || salesforce_setting[0] == "err" || salesforce_setting.isSalesforceUser=="N")
                {                    
                    this.app.getData({
                        "URL":"/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                        "key":"salesfocre",
                        callback:_.bind(function(){
                            this.app.showLoading(false,this.$(".salesforce-tile"));
                            var sf = this.app.getAppData("salesfocre");
                            if(sf[0] == "err" ||sf.isSalesforceUser=="N"){
                                this.$(".salesforce-tile").addClass("incomplete");
                            }
                            else{
                                this.$(".salesforce-tile").addClass("complete");
                            }
                        },this),
                        errorCallback:_.bind(function(){
                            this.app.showLoading(false,this.$(".salesforce-tile"));                            
                            this.$(".salesforce-tile").addClass("incomplete");                            
                        },this)
                    });
                }
                else{
                    this.app.showLoading(false,this.$(".salesforce-tile"));                            
                    this.$(".salesforce-tile").addClass("complete"); 
                }
                
            }
            ,
            checkNetSuiteStatus: function(){                                
                var netsuite_setting = this.app.getAppData("netsuite");
                this.app.showLoading("...",this.$(".netsuite-tile"));
                if(!netsuite_setting || netsuite_setting[0] == "err" || netsuite_setting.isNetsuiteUser=="N")
                {                        
                    this.app.getData({
                        "URL":"/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                        "key":"netsuite",
                        callback:_.bind(function(){
                            this.app.showLoading(false,this.$(".netsuite-tile"));
                            var ns = this.app.getAppData("netsuite");
                            if(ns[0]=="err" || ns.isNetsuiteUser=="N"){
                                this.$(".netsuite-tile").addClass("incomplete");
                            }
                            else{
                                this.$(".netsuite-tile").addClass("complete");
                            }
                        },this),
                        errorCallback:_.bind(function(){
                            this.app.showLoading(false,this.$(".netsuite-tile"));                            
                            this.$(".netsuite-tile").addClass("incomplete");                            
                        },this)
                    });
                }
                else{
                     this.app.showLoading(false,this.$(".netsuite-tile"));                            
                     this.$(".netsuite-tile").addClass("complete");
                }
                
            }
        });
    });