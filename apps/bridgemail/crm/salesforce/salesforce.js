define(['text!crm/salesforce/html/salesforce.html'],
    function (template) {
        'use strict';
        return Backbone.View.extend({                
            /**
             * Attach events on elements in view.
            */ 
            events: {
                'click #choose_soruce li':'chooseTile'
            },
            /**
             * Initialize view - backbone .
            */
            initialize: function () {                    
                this.template = _.template(template);	
                this.states = {
                    setup:false,
                    imports:false,
                    newimport:false,
                    newexport:false
                };
                this.render();

            },
            /**
             * Initialize view .
            */
            render: function () {                        
                this.$el.html(this.template({}));                    
                this.app = this.options.app;
                this.setupArea = this.$("#salesforce-setup");
                this.myImportsArea = this.$("#salesforce-imports");
                this.newImportArea = this.$("#salesforce-new-import");
                this.newExportArea = this.$("#salesforce-new-export");
            },
            /**
             * Intialize workspace when it is rendered and ready. 
            */
            init:function(){
                this.loadSetupArea();  
            },
            /**
             * Call when a tile is clicked.
            */
            chooseTile:function(obj){
                var li = $.getObj(obj,"li");
                if(!li.hasClass("selected")){    
                    var titleName = li[0].className;
                    //switch Title area
                    this.$(".tiles-area").hide();
                    this.$("#"+titleName).show();                        

                    //switch Titles
                    this.$("#choose_soruce li").removeClass("selected");
                    li.addClass("selected");

                    this.loadTitleArea(titleName);
                }
            },
            /**
             * Load area according to selected title calls view accordiongly
            */
            loadTitleArea:function(tileName){
                switch(tileName){
                    case 'salesforce-setup':
                        this.loadSetupArea();
                        break;
                    case 'salesforce-imports':
                        this.loadMyImportsArea();
                        break;
                    case 'salesforce-new-import':
                        this.loadNewImportArea();
                        break;
                    case 'salesforce-new-export':
                        this.loadNewExportArea();    
                        break;
                    default:
                        break;
                }
            },
            /**
             * Load setup area for salesforce and intialize
            */
            loadSetupArea:function(){
                if(this.states.setup==false){
                    this.states.setup = true; 
                    this.app.showLoading("Loading Setup...",this.setupArea);
                    require(["crm/salesforce/setup_step"],_.bind(function(page){    
                        var setup_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.setupArea);
                        this.setupArea.append(setup_page.$el);                       
                    },this));
                }
            },
            /**
             * Load My Imports salesforce
            */
            loadMyImportsArea:function(){
                if(this.states.imports==false){
                    this.states.imports = true; 
                    this.app.showLoading("Loading My Imports...",this.myImportsArea);
                    require(["crm/salesforce/myimports"],_.bind(function(page){    
                        var myimports_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.myImportsArea);
                        this.myImportsArea.append(myimports_page.$el);                       
                    },this));
                }
            },
            /**
             * Load New Import/Schedule/Recur area for salesforce
            */
            loadNewImportArea:function(){
                if(this.states.newimport==false){
                    this.states.newimport = true; 
                    this.app.showLoading("Loading New Import...",this.newImportArea);
                    require(["crm/salesforce/newimport"],_.bind(function(page){    
                        var newImport_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.newImportArea);
                        this.newImportArea.append(newImport_page.$el);                       
                    },this));
                }
            },
            /**
             * Load New Export area for salesforce
            */
            loadNewExportArea:function(){
                if(this.states.newexport==false){
                    this.states.newexport = true; 
                    this.app.showLoading("Loading New Export...",this.newExportArea);
                    require(["crm/salesforce/export"],_.bind(function(page){    
                        var export_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.newExportArea);
                        this.newExportArea.append(export_page.$el);                       
                    },this));
                }
            }
        });
    });