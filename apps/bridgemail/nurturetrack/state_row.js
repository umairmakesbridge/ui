define(['text!nurturetrack/html/state_row.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // States row view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            /**
             * Attach events on elements in view.
            */
            events: {
             'click .report':'reportShow'
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
               
            },
            reportShow:function(){
                var camp_id=this.model.get('campNum.encode');
                this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+camp_id,tab_icon:'campaign-summary-icon'});
            }
            
        });
});