define(['text!editor/DC/html/filters.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Filter view for MEE Dynamic contents variation
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .closebtn':'closeDialog',
              'click .ruleDialogClose':'closeDialog',
              'click .add-row':'createRow'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);	                    
                    this.app = this.options.opt._app;                           
                    this.render();                             
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                }));    
                this.row = _.template(this.$('#fitlerrow_template').html());                
                this.createRow();
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            createRow:function(){
                var rowElement = $(this.row({}));
                this.$(".dynamic_inputs_list").append(rowElement);
                rowElement.find(".dcRuleFieldName").chosen({width:'200px'});
                rowElement.find(".dcRuleCondition").chosen({disable_search: "true",width:'170px'});
                rowElement.find(".dcRuleFormat").chosen({disable_search: "true",width:'152px'});
                rowElement.find(".btn-del-row").click(_.bind(this.deleteRow,this))
            },
            deleteRow:function(e){
                var obj = $.getObj(e,"a");
                obj.parents(".filter-row").remove();
            },
            closeDialog:function(){
                this.$el.parent().hide();
                this.$el.remove();
            }            
            
        });
});