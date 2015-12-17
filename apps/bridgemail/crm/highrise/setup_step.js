define(['text!crm/highrise/html/setup_step.html','jquery-ui'],
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
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.mappingLoaded = false;
                    this.$el.html(this.template({}));
                    this.initControl();                                       
                       
                },
                initControl:function(){
                    this.$("#accordion_login").accordion({heightStyle: "fill",collapsible: true});                    
                    this.$("#accordion_mapping").accordion({heightStyle: "fill",collapsible: true,active:1});
                    
                   this.$loginInner = this.$(".accordion_login-inner");                   
                   this.$mappingInner = this.$(".accordion_mapping-inner");
                   
                   /*Load login view for Netsuite*/
                   this.$loginInner.css({"min-height":"300px","position":"relative"});
                   this.app.showLoading("Loading Login...",this.$loginInner);
                   require(["crm/highrise/login"],_.bind(function(page){    
                       this.app.showLoading(false,this.$loginInner);
                       this.$loginInner.css("position","inherit");
                       var login_page = new page({page:this,layout:'col'})                       
                       this.$loginInner.append(login_page.$el);                       
                   },this));
                   var nf = this.app.getAppData("highrise");                   
                   if(nf && nf.isHighriseUser=="Y"){
                        this.loadMapping();                        
                   }                                       
                  
                },
                loadMapping:function(){
                   if(this.mappingLoaded ==false){ 
                        this.mappingLoaded = true;
                        this.parent.highriseSetup = true;                        
                       /*Load mapping view for Netsuite*/
                        this.$mappingInner.css({"min-height":"445px","position":"relative"});
                        this.app.showLoading("Loading Mapping...",this.$mappingInner);                   
                        require(["crm/highrise/mapping"],_.bind(function(page){    
                            this.app.showLoading(false,this.$mappingInner);
                            this.$mappingInner.css("position","inherit");
                            var mapping_page = new page({page:this,showSaveButton:true})                       
                            this.$mappingInner.append(mapping_page.$el);                       
                        },this));

                   }
                }
        });
});