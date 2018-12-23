define(['text!tipandtest/html/workflow_row.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track Makesbridge View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            /**
             * Attach events on elements in view.
            */
            events: {              
              'click .use-track':'copyWorflow',
              'click .preview':'viewWorkFlow',
              'click .view-track':'viewWorkFlow',
              'click .tag':'tagSearch'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.sub
                    this.app = this.parent.app;
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                    
                
                this.$el.html(this.template({
                    model: this.model
                }));                
                this.initControls();  
               
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            tagSearch:function(obj){
                
                return false;
            } ,
            viewWorkFlow:function(){
              //this.app.mainContainer.workflowListing(this.model.get('encodedWorkflowId'));
              this.app.showLoading("Loading...",this.parent.$el);
                require(["tipandtest/step_view"],_.bind(function(page){    
                     this.app.showLoading(false,this.parent.$el);                    
                     var view_page = new page({page:this,hideReport:"true"});                       
                     $("body").append(view_page.$el);        
                     view_page.init();
                 },this));
            },
            copyWorflow:function(){                                 
                var dialog = this.app.showDialog({title:'Use Playbook',
                    css:{"width":"600px","margin-left":"-300px"},
                    bodyCss:{"min-height":"260px"},							   
                    headerIcon : 'copycamp',
                    buttons: {saveBtn:{text:'Use'} }                                                                           
                });
                this.app.showLoading("Loading...",dialog.getBody());
                require(["tipandtest/copyworkflow"],_.bind(function(copyWorkflow){                                     
                    var mPage = new copyWorkflow({page:this,copydialog:dialog});
                    dialog.getBody().html(mPage.$el);
                    mPage.init();
                    dialog.saveCallBack(_.bind(mPage.copyWorkflow,mPage));
                },this));
            }
            
        });
});