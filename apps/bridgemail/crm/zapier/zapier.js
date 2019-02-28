define(['text!crm/zapier/html/zapier.html','crm/zapier/login','autobots/autobots'],
    function (template,sl_login,sl_score) {
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
                    imports:false,
                    export:false                    
                };                
                this.render();

            },
            /**
             * Initialize view .
            */
            render: function () {                        
                this.$el.html(this.template({}));                            
                this.$loginArea = this.$(".accordion_login-inner");                
                this.$scoreBotArea = this.$(".accordion_score-inner");                               
                this.salesloftSetup = false;                               
                                
            },
            /**
             * Intialize workspace when it is rendered and ready. 
            */
            init:function(){
                this.loginAccordion = new sl_login({page: this, app: this.app,});
                this.$loginArea.append(this.loginAccordion.$el);                                 
                
                this.scoreAccordion = new sl_score({page: this, app: this.app,botType:'Z',exportBot:true});
                this.$scoreBotArea.append(this.scoreAccordion.$el); 
                
                this.$(".salesloft-setup").show();
                this.$("#accordion_login").accordion({heightStyle: "fill",collapsible: true});                
                this.$("#accordion_score").accordion({heightStyle: "fill",collapsible: true});
                
                this.current_ws = this.$el.parents(".ws-content");                
                //this.checkSalesforceStatus();
                
                this.app.removeSpinner(this.$el); 
            }
            
        });
    });