define(['text!crm/salesforce/html/setup_step.html','jquery-ui'],
function (template,crm_filters) {
        'use strict';
        return Backbone.View.extend({                                
                events: {

                 },
                initialize: function () {
                    this.template = _.template(template);				
                    this.render();
                },

                render: function () {
                    this.mappingLoaded = false;
                    this.syncAreaLoaded = false;
                    this.app = this.options.page.app;           
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));
                    this.initControl();                                       
                       
                },
                initControl:function(){                    
                    var sf = this.app.getAppData("salesfocre");                   
                    this.$loginInner = this.$(".accordion_login-inner");
                    if(sf && sf.isSalesforceUser=="N"){                       
                       this.$(".setup-accordion").show();
                       this.$("#accordion_login").accordion({heightStyle: "fill",collapsible: true});
                       this.$loginInner.css({"min-height":"235px","position":"relative"});
                       this.app.showLoading("Loading Login...",this.$loginInner);
                       require(["crm/salesforce/login"],_.bind(function(page){    
                           this.app.showLoading(false,this.$loginInner);
                           this.$loginInner.css("position","inherit");
                           var login_page = new page({page:this,layout:'col'})                       
                           this.$loginInner.append(login_page.$el);                       
                       },this));
                       this.$("#accordion_mapping,#accordion_sync").hide();
                   } 
                   else{
                       this.$("#salesforce_welcome").hide();
                       this.$(".setup-accordion").show();
                        this.$("#accordion_login").accordion({heightStyle: "fill",collapsible: true});
                        this.$("#accordion_sync").accordion({heightStyle: "fill",collapsible: true,active:1});
                        this.$("#accordion_mapping").accordion({heightStyle: "fill",collapsible: true,active:1});

                       
                       this.$syncInner = this.$(".accordion_sync-inner");
                       this.$mappingInner = this.$(".accordion_mapping-inner");
                       /*Load login view for salesforce*/
                       this.$loginInner.css({"min-height":"235px","position":"relative"});
                       this.app.showLoading("Loading Login...",this.$loginInner);
                       require(["crm/salesforce/login"],_.bind(function(page){    
                           this.app.showLoading(false,this.$loginInner);
                           this.$loginInner.css("position","inherit");
                           var login_page = new page({page:this,layout:'col'})                       
                           this.$loginInner.append(login_page.$el);                       
                       },this));

                       if(sf && sf.isSalesforceUser=="Y"){
                            this.loadMapping();
                            this.loadSyncArea();
                       } 
                   }
                },
                loadMapping:function(){
                   if(this.mappingLoaded ==false){ 
                        this.mappingLoaded = true;
                        this.parent.salesforceSetup = true;
                        /*Load mapping view for salesforce*/
                       this.$mappingInner.css({"min-height":"480px","position":"relative"});
                       this.app.showLoading("Loading Mapping...",this.$mappingInner);                   
                       require(["crm/salesforce/mapping"],_.bind(function(page){    
                           this.app.showLoading(false,this.$mappingInner);
                           this.$mappingInner.css("position","inherit");
                           var mapping_page = new page({page:this,showSaveButton:true})                       
                           this.$mappingInner.append(mapping_page.$el);                       
                       },this));
                   }
                },
                loadSyncArea:function(){
                   if(this.syncAreaLoaded ==false){  
                   this.syncAreaLoaded = true;    
                   /*Load owner synchronization view for salesforce*/
                    this.$syncInner.css({"min-height":"390px","position":"relative"});
                    this.app.showLoading("Loading Login...",this.$syncInner);
                    require(["crm/salesforce/owner_sync"],_.bind(function(page){    
                        this.app.showLoading(false,this.$syncInner);
                        this.$syncInner.css("position","inherit");
                        var owner_page = new page({page:this,layout:'col'})                       
                        this.$syncInner.append(owner_page.$el);                       
                    },this));                   
                   }
                }
        });
});