define(['text!workflow/html/workflow_row.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Workflow row View to show in listing
            // Created on : 24 May 2016
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'workflow-box',
                tagName: 'tr',
                /**
                 * Attach events on elements in view.
                 */
                events: {                                        
                    "click .row-move":"addRowToCol2",
                    "click .row-remove":"removeRowToCol2",
                    "click .check-box":'checkUncheck'                    
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;                    
                    this.showUseButton = this.options.showUse;
                    this.showRemoveButton = this.options.showRemove;                                        
                    this.render();                    
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        model: this.model
                    }));
                    if(this.showUseButton || this.showSummaryChart){
                        this.$el.attr("data-checksum",this.model.get("workflowId.checksum"))
                    }
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    
                    this.initControls();

                },
                /*
                 * 
                 * @returns Time Show
                 */
                getTimeShow: function () {
                    var datetime = '';
                    var dtHead = '';
                    var dateFormat = '';
                    if (this.model.get('status') == 'P' || this.model.get('status') == 'R')
                    {
                        dtHead = 'Played on';
                        datetime = this.model.get('updationDate');
                    }                                      
                    else {
                        dtHead = 'Last Edited on';
                        if (this.model.get('updationDate'))
                            datetime = this.model.get('updationDate');
                        else
                            datetime = this.model.get('creationDate');
                    }
                    if (datetime)
                    {
                        var date = moment(this.app.decodeHTML(datetime), 'M-D-YY HH:mm:ss');
                        dateFormat = date.format("DD MMM, YYYY");
                        if (this.model.get('status') == 'S' || this.model.get('status') == 'P') {
                            dateFormat = date.format("DD MMM, YYYY");
                        }
                    }
                    else {
                        dateFormat = '';
                    }
                    return {dtHead: dtHead, dateTime: dateFormat}
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                   

                },
                addRowToCol2:function(){                    
                    if(this.showUseButton){
                        this.$el.fadeOut("fast",_.bind(function(){                            
                            this.sub.addToCol2(this.model);    
                            this.$el.hide();                            
                        },this));
                    }
                },
                removeRowToCol2:function(){
                    if(this.showRemoveButton){
                        this.$el.fadeOut("fast",_.bind(function(){                        
                            this.sub.adToCol1(this.model);    
                            this.$el.remove();
                        },this));
                    }
                },
                checkUncheck:function(obj){
                    var addBtn = $.getObj(obj,"a");     
                    if(addBtn.hasClass("unchecked")){
                        addBtn.removeClass("unchecked").addClass("checkedadded");               
                    }
                    else{
                         addBtn.removeClass("checkedadded").addClass("unchecked"); 
                    }                    
                    if(this.sub.createPageChart){
                        this.sub.createPageChart();
                    }
                }

            });
        });