define(['text!workflow/html/workflows.html', 'jquery.searchcontrol'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {                    
                        "click .refresh_btn": function () {
                           this.$('iframe').attr('src', this.$('iframe').attr('src'));
                        }
                },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
                    this.render();
                },
                render: function ()
                {                     
                   this.$el.html(this.template({})); 
                   this.$el.find('div#workflowlistsearch').searchcontrol({
                        id: 'workflow-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchWorkflow, this),
                        clearFunc: _.bind(this.clearSearchWorkflow, this),
                        placeholder: 'Search workflow by name',
                        showicon: 'yes',
                        iconsource: 'workflow-sicon',
                        countcontainer: 'no_of_camps'
                  });
                  this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    this.current_ws = this.$el.parents(".ws-content");                                        
                    this.ws_header = this.current_ws.find(".camp_header .edited"); 
                    this.current_ws.find("#campaign_tags").remove();
                    this.app.removeSpinner(this.$el);
                    this.current_ws.find("#addnew_action").attr("data-original-title", "Create Workflow").click(_.bind(this.createWorkflowDialog, this));
                    this.$("div.create_new").click(_.bind(this.createWorkflowDialog, this));  
                },
                resizeHeight:function(height){
                    this.$(".workflowiframe").css("height",height+"px");
                },
                searchWorkflow:function(){
                    
                },
                clearSearchWorkflow:function(){
                    
                },
                headBadge: function ( count ) {                    
                    var active_ws = this.$el.parents(".ws-content");
                    var header_title = active_ws.find(".camp_header .edited  h2");                                                         
                    
                    var header_title = active_ws.find(".camp_header .edited");
                    header_title.find('ul').remove();                        
                    var stats = '<ul class="c-current-status">';                                
                        stats += '<li class="showhand showtooltip" title="Click to view all workflows"><span class="badge pclr18 topbadges total_forms" tabindex="-1">'+count+'</span>Total Workflows</li>';                            
                    stats += '</ul>';
                    header_title.append(stats);
                    this.ws_header.find(".c-current-status li").click(_.bind(function(){}, this));
                    header_title.find(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    
                    
                    this.$("#total_templates .badge").html(count)
                },
                openWorkflow: function(url){
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Workflow Wizard',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgworkflow',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading workflow...", dialog.getBody());                    
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: url, app: this.app, frameHeight: dialog_height}); // isText to Dynamic
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
                    
                    
                },
                createWorkflowDialog: function(){
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Enter name for your Workflow',
                      buttnText: 'Create',
                      bgClass :'no-tilt',
                      plHolderText : 'Enter workflow name here',
                      emptyError : 'Workflow name can\'t be empty',
                      createURL : '/pms/io/form/saveSignUpFormData/',
                      fieldKey : "name",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token')},
                      saveCallBack :  _.bind(this.createWorkflow,this)
                    });
                },
                createWorkflow:function(){
                    
                }

            });
        });
