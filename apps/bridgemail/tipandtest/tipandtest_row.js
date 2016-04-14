define(['text!tipandtest/html/tipandtest_row.html','jquery.highlight'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'proven-box',
            tagName:'tr',
            
            /**
             * Attach events on elements in view.
            */
            events: {
               'click .opentiptest':'opentipandtest',
               'click .proven-td' : 'opentipandtest',
                'click .taglink':'tagClick'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.sub;
                    this.app = this.parent.app;
                    this.subNum = '';
                    this.tagTxt = '';
                    this.sub_name = '';
                    this.dialogView= '';
                    this.render();
                    //this.model.on('change',this.renderRow,this);
            },
              /**
             * Render view on page.
            */
            render: function () {                    
                
               this.$el.html(this.template({
                    model: this.model
                }));
              // this.$el.attr('id',this.options.idrow.tipid);
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.initControls();  
               
            },
            
           
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
               
              
            },
            opentipandtest : function(event){
                    this.app.mainContainer.addWorkSpace({type: '', noTags: true ,title: this.model.get('title'), sub_title: 'Proven Process', url: this.model.get('url'), workspace_id: this.model.get('tipid'), 'addAction': false, tab_icon: 'tipntest'}); 
            },
            tagClick:function(obj){
                            //this.sub.taglinkVal = true;
                            this.tagTxt = $(obj.currentTarget).text();
                            this.app.initSearch(obj,this.parent.$el.find("#list-search"));
                        }
        });
});/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


