define(['text!crm/google/html/setup_step.html','jquery-ui'],
function (template,crm_filters) {
        'use strict';
        return Backbone.View.extend({                                
                events: {

                 },
                initialize: function () {
                    this.template = _.template(template);
                    this.isAuthorize = false;
                    this.render();
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.isGoogle = this.options.isGoogle?this.options.isGoogle:false;
                    
                    this.mappingLoaded = false;
                    this.$el.html(this.template({}));
                    this.initControl();                                       
                       
                },
                initControl:function(){
                    this.$("#accordion_login").accordion({heightStyle: "fill",collapsible: true});                    
                    this.$("#accordion_mapping").accordion({heightStyle: "fill",collapsible: true});
                    
                   this.$loginInner = this.$(".accordion_login-inner");                   
                   this.$mappingInner = this.$(".accordion_mapping-inner");
                   
                   /*Load login view for Netsuite*/
                   this.$loginInner.css({"min-height":"400px","position":"relative"});
                   this.$mappingInner.css({"min-height":"445px","position":"relative"});
                   this.app.showLoading("Loading Login...",this.$loginInner)
                                                       
                    var google = this.app.getAppData("google");  
                    var that = this;
                    if(google && google.isGoogleUser=="Y" && this.isGoogle == false){
                         this.isAuthorize = true;                
                    }  else{
                        this.$("#accordion_mapping").hide();
                    }
                   require(["crm/google/login"],_.bind(function(page){    
                       this.app.showLoading(false,this.$loginInner);
                       this.$loginInner.css("position","inherit");
                       var login_page = new page({page:this,layout:'col',isAuthorize:that.isAuthorize});
                       this.$loginInner.append(login_page.$el);                       
                   },this));
                   if(this.isAuthorize)
                       this.loadMapping();        
                },
                loadMapping:function(){
                   if(this.mappingLoaded ==false){ 
                        this.mappingLoaded = true;
                        this.parent.googleSetup = true;                        
                       /*Load mapping view for Netsuite*/
                        this.$mappingInner.css({"min-height":"445px","position":"relative"});
                        this.app.showLoading("Loading Mapping...",this.$mappingInner);                   
                        require(["crm/google/mapping"],_.bind(function(page){    
                            this.app.showLoading(false,this.$mappingInner);
                            this.$mappingInner.css("position","inherit");
                             var mapping_page = new page({page:this,showSaveButton:true})                       
                            this.$mappingInner.append(mapping_page.$el);                       
                        },this));

                   }
                }
        });
});