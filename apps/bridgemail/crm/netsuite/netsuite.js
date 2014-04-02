define(['text!crm/netsuite/html/netsuite.html'],
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
                this.setupArea = this.$("#netsuite-setup");
                this.myImportsArea = this.$("#netsuite-imports");
                this.newImportArea = this.$("#netsuite-new-import");
                this.newExportArea = this.$("#netsuite-new-export");
                this.newImport_page = null;
                this.myimports_page = null;
                this.netsuiteSetup = false;
            },
            /**
             * Intialize workspace when it is rendered and ready. 
            */
            init:function(){
                this.current_ws = this.$el.parents(".ws-content");
                var ns = this.app.getAppData("netsuite");                
                if(!ns || ns.isNetsuiteUser=="N"){
                    this.loadSetupArea();  
                }
                else{                   
                    this.netsuiteSetup = true;
                    this.showHeader();
                    this.$(".netsuite-imports").click();                                            

                }
            },
            showHeader:function(){                               
                var header_part = $('<div class="bottomdiv">\n\
                <div class="syncing" style="cursor:pointer"></div>\n\
                </div>');
                this.current_ws.find(".camp_header .tagscont").remove();                
                this.current_ws.find(".camp_header .edited").append(header_part);                
                
                var URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+ this.app.get('bms_token')+"&type=stats";                    
                jQuery.getJSON(URL,_.bind(function(tsv, state, xhr){
                    var _count = jQuery.parseJSON(xhr.responseText);
                    if(_count.synchCount!=="0"){
                        this.current_ws.find(" .camp_header .syncing").html('<span class="syncingicon"></span> <span class="sync_count">'+_count.synchCount+'</span> synchs running');
                    }                                        
                },this));
                                
                this.current_ws.find(" .camp_header .syncing").click(_.bind(function(){
                    this.$("li.netsuite-imports").click();
                },this))
            },
              updateCount:function(c){
                var count = parseInt(this.current_ws.find(".camp_header .sync_count")[0].innerHTML); 
                this.current_ws.find(".camp_header .sync_count").html(count+c);
            },
            
            /**
             * Call when a tile is clicked.
            */
            chooseTile:function(obj){
                var li = $.getObj(obj,"li");
                if(!li.hasClass("selected")){    
                    if(this.netsuiteSetup===false){
                        this.app.showAlert("Please enter login settings for netsuite.",this.$el,{fixed:true});
                        return false;
                    }
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
                    case 'netsuite-setup':
                        this.loadSetupArea();
                        break;
                    case 'netsuite-imports':
                        this.loadMyImportsArea();
                        break;
                    case 'netsuite-new-import':
                        this.loadNewImportArea();
                        break;
                    case 'netsuite-new-export':
                        this.loadNewExportArea();    
                        break;
                    default:
                        break;
                }
            },
            /**
             * Load setup area for netsuite and intialize
            */
            loadSetupArea:function(){
                if(this.states.setup==false){
                    this.states.setup = true; 
                    this.app.showLoading("Loading Setup...",this.setupArea);
                    require(["crm/netsuite/setup_step"],_.bind(function(page){    
                        var setup_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.setupArea);
                        this.setupArea.append(setup_page.$el);                       
                    },this));
                }
            },
            /**
             * Load My Imports netsuite
            */
            loadMyImportsArea:function(){
                if(this.states.imports==false){
                    this.states.imports = true; 
                    this.app.showLoading("Loading My Imports...",this.myImportsArea);
                    require(["crm/netsuite/myimports"],_.bind(function(page){    
                        this.myimports_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.myImportsArea);
                        this.myImportsArea.append(this.myimports_page.$el);                       
                    },this));
                }
            },
            /**
             * Load New Import/Schedule/Recur area for netsuite
            */
            loadNewImportArea:function(){
                if(this.states.newimport==false){
                    this.states.newimport = true; 
                    this.app.showLoading("Loading New Import...",this.newImportArea);
                    require(["crm/netsuite/newimport"],_.bind(function(page){    
                        this.newImport_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.newImportArea);
                        this.newImportArea.append(this.newImport_page.$el);                       
                    },this));
                }else{
                    if(this.newImportArea){
                         this.newImport_page.initData();                 
                        this.newImport_page.mk_wizard.gotoStep(1);   
                    }
                }
            },
            /**
             * Load New Export area for netsuite
            */
            loadNewExportArea:function(){
                if(this.states.newexport==false){
                    this.states.newexport = true; 
                    this.app.showLoading("Loading New Export...",this.newExportArea);
                    require(["crm/netsuite/export"],_.bind(function(page){    
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