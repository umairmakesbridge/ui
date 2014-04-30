define(['text!crm/salesforce/html/salesforce.html'],
    function (template) {
        'use strict';
        return Backbone.View.extend({                
            /**
             * Attach events on elements in view.
            */ 
            events: {
                'click #choose_soruce li':'chooseTile',
                'mouseover #choose_soruce li':'chooseTileHover'
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
                    newexport:false,
                    peerWizard:false
                };
                this.peeringId = null;
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
                this.newImport_page = null;
                this.myimports_page = null;
                this.setup_page = null;
                this.salesforceSetup = false;
            },
            /**
             * Intialize workspace when it is rendered and ready. 
            */
            init:function(){
                this.current_ws = this.$el.parents(".ws-content");                
                this.checkSalesforceStatus();
            },
            // showing hover, change text of tooltip
            chooseTileHover:function(obj){
                var li = $.getObj(obj,"li");
                if(li.hasClass("salesforce-imports")){
                   this.$(".messagebox p").html("Create, view and edit your existing imports.");  
                }else if(li.hasClass("salesforce-setup")){
                    this.$(".messagebox p").html("Provide API token, User ID, and map fields you wish to import.");
                }else{
                    this.$(".messagebox p").html("Export your existing imports.");
                }
            },
            checkSalesforceStatus:function(){
              var salesforce_setting = this.app.getAppData("salesfocre");  
              this.app.showLoading("Checking Salesforce status...",this.$el);    
              if(!salesforce_setting || salesforce_setting[0] == "err" || salesforce_setting.isSalesforceUser=="N")
                {                    
                    this.app.getData({
                        "URL":"/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                        "key":"salesfocre",
                        callback:_.bind(function(){
                            this.app.showLoading(false,this.$el);    
                            var sf = this.app.getAppData("salesfocre");
                            if(sf[0] == "err" ||sf.isSalesforceUser=="N"){
                               this.loadSetupArea();  
                            }
                            else{
                                this.salesforceSetup = true;
                                this.$(".salesforce-imports").click();    
                                this.showHeader();
                            }
                        },this),
                        errorCallback:_.bind(function(){
                            this.app.showLoading(false,this.$el);                        
                            this.loadSetupArea();  
                        },this)
                    });
                }
                else{
                    this.app.showLoading(false,this.$el);                            
                    this.salesforceSetup = true;
                    this.$(".salesforce-imports").click();    
                    this.showHeader();
                }  
            },
            showHeader:function(){                               
                var header_part = $('<div class="bottomdiv">\n\
                <div class="peerings"><span class="peeringicon"></span><span class="left">Peering</span> <span class="onoff"><em>Off</em><em>On</em></span></div>\n\
                <div class="syncing" style="cursor:pointer"></div>\n\
                </div>\n\
                <div class="campaign_stats cstats" style="display:none"><a class="closebtn"></a></div>');
                this.current_ws.find(".camp_header .tagscont").remove();                
                this.current_ws.find(".camp_header .edited").append(header_part);                
                
                var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+ this.app.get('bms_token')+"&type=stats";                    
                jQuery.getJSON(URL,_.bind(function(tsv, state, xhr){
                    var _count = jQuery.parseJSON(xhr.responseText);
                    if(_count.synchCount!=="0"){
                        this.current_ws.find(" .camp_header .syncing").html('<span class="syncingicon"></span> <span class="sync_count">'+_count.synchCount+'</span> synchs running');
                    }                    
                    this.peeringId = _count.peerTransactionId;
                    this.peerOnOff(_count.peerTransactionId);
                },this));
                
                this.current_ws.find(" .camp_header .cstats .closebtn").click(_.bind(this.hidePeeringDialog,this));
                this.current_ws.find(" .camp_header .onoff").click(_.bind(this.showPeeringDialog,this));
                this.current_ws.find(" .camp_header .syncing").click(_.bind(function(){
                    this.$("li.salesforce-imports").click();
                },this))
            },
            peerOnOff:function(flag){
              if(flag){
                    this.current_ws.find(".camp_header .onoff em:last-child").addClass("on");
                    this.current_ws.find(".camp_header .onoff em:first-child").removeClass("off");
                }
                else{
                    this.current_ws.find(".camp_header .onoff em:first-child").addClass("off");
                    this.current_ws.find(".camp_header .onoff em:last-child").removeClass("on");
                }  
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
                    if(this.salesforceSetup===false){
                        this.app.showAlert("Please enter login settings for salesforce.",this.$el,{fixed:true});
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
                        this.setup_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.setupArea);
                        this.setupArea.append(this.setup_page.$el);                       
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
                        this.myimports_page = new page({
                            page:this
                        })
                        this.app.showLoading(false,this.myImportsArea);
                        this.myImportsArea.append(this.myimports_page.$el);                       
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
            },
            showPeeringDialog:function(obj){
                var _ele = $.getObj(obj,"span");                
                var _this = this;                                                                                                 
                if(!this.states.peerWizard){
                    this.states.peerWizard=true;
                    this.app.showLoading("Loading Peering...",this.current_ws.find(".camp_header .cstats"));       
                    require(["crm/salesforce/peering"],function(page){
                        _this.app.showLoading(false,_this.current_ws.find(".camp_header .cstats"));
                        _this.peeringPage = new page({page:_this});
                        _this.current_ws.find(".camp_header .cstats").append(_this.peeringPage.$el);                        
                        _this.peeringPage.init();
                    });
                }               
                this.current_ws.find(".camp_header .cstats").css({"left":103+"px","top":63+"px","width":"520px","height":"286px"}).show();
            },
            hidePeeringDialog:function(){
                this.current_ws.find(".camp_header .cstats").hide();
            },
            updateImport:function(importName,json){                                       
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialogTitle = importName?importName:"Loading...";
                    var dialog = this.app.showDialog({title:dialogTitle,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                              headerEditable:true,
                              headerIcon : 'import',
                              bodyCss:{"min-height":dialog_height+"px"},
                              buttons: {saveBtn:{text:'Save'} }                                                                           
                        });                                           
                    this.app.showLoading("Loading...",dialog.getBody());                                  
                    require(["crm/salesforce/newimport"],_.bind(function(page){                                     
                           this.newImport_page = new page({
                                page:this,
                                dialog:dialog
                           })                        
                           dialog.getBody().html(this.newImport_page.$el);                           
                           dialog.getBody().addClass("dialog-wizard")
                           dialog.saveCallBack(_.bind(this.newImport_page.startImport,this.newImport_page));
                           this.myimports_page.loadImport(json);
                    },this));                   
                }
            
        });
    });