define(['text!common/html/subaccount_selection_row.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subacoount selection View to show on sharing dialog
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            className:'erow',
            /**
             * Attach events on elements in view.
            */
            events: {              
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {                    
                    this.app = this.options.sub.app;
                    this.template = _.template(template);				                                                      
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
                this.$('input.checkpanel').iCheck({
                    checkboxClass: 'checkpanelinput',
                    insert: '<div class="icheck_line-icon" style="margin:18px 0 0 10px"></div>'
                });
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            }
        });
});