define(['text!crm/salesloft/html/export.html','jquery.icheck'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'cont-box row-fluid',
                events: {
                    'click .target-select':'loadTargets'
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	                                        
                    this.render();                            
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));      	                    
                    this.$el.css({"position":"static","margin":"0px"});
                    this.initControl();   
                    
                },
                initControl:function(){
                    this.$("#import_time").chosen({no_results_text: 'Oops, nothing found!', width: "100%"});
                    this.$('input.checkinput').iCheck({
                        checkboxClass: 'checkinput'
                    });
                    //this.setUpSalesforceFields();                                                                                     
                },                
                loadTargets: function() {
                    var dialog_object = {title: 'Select Targets',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                    var dialog = this.app.showDialog(dialog_object);

                    this.options.app.showLoading("Loading Targets...", dialog.getBody());

                    require(["target/recipients_targets"], _.bind(function(page) {
                        var targetsPage = new page({page: this, dialog: dialog, editable: true, type: "autobots", showUseButton: true});
                        dialog.getBody().append(targetsPage.$el);
                        this.app.showLoading(false, targetsPage.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        targetsPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog                        

                    }, this));

                }
        });
});