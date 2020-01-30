define(['text!crm/esp/mailgun/html/mailgun.html','crm/esp/mailgun/login','crm/esp/mailgun/domains'],
    function (template,mg_login,mg_domains) {
        'use strict';
        return Backbone.View.extend({                
            /**
             * Attach events on elements in view.
            */ 
            events: {                
            },
            /**
             * Initialize view - backbone .
            */
            initialize: function () {   
                this.app = this.options.app;
                this.template = _.template(template);	
                this.states = {
                    login:false,
                    domains:false
                };                
                this.render();

            },
            /**
             * Initialize view .
            */
            render: function () {                        
                this.$el.html(this.template({}));            
                
                this.$loginArea = this.$(".accordion_login-inner");
                this.$domainsArea = this.$(".accordion_domains-inner");
                this.$importArea = this.$(".accordion_import-inner");
                this.mailgunSetup = false;
                //this.$("#accordion_score,#accordion_export").hide();
                                
            },
            /**
             * Intialize workspace when it is rendered and ready. 
            */
            init:function(){
                this.loginAccordion = new mg_login({page: this, app: this.app,});
                this.$loginArea.append(this.loginAccordion.$el); 
                
                this.domainsAccordion = new mg_domains({page: this, app: this.app,});
                this.$domainsArea.append(this.domainsAccordion.$el);
                
                //this.exportAccordion = new sl_export({page: this, app: this.app,});
                //this.$exportArea.append(this.exportAccordion.$el);
                
                this.$(".mailgun-setup").show();
                this.$("#accordion_login").accordion({heightStyle: "fill",collapsible: true});
                this.$("#accordion_domains").accordion({heightStyle: "fill",collapsible: true});
                this.$("#accordion_import").accordion({heightStyle: "fill",collapsible: true, "active": 2, "disabled": true});
                
                this.current_ws = this.$el.parents(".ws-content");                
                //this.checkSalesforceStatus();
                
                this.app.removeSpinner(this.$el); 
            }
            
        });
    });