define(['text!account/html/subaccount_row.html'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Sub Account Row View to show on sub acccount listing (Sub Account Management)
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .delete-subaccount':'deleteSubaccount',
              'click .edit-subaccount':'editSubaccount'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.parent = this.options.sub;      
                    this.app = this.parent.app;
                    this.hideSettings = this.options.hideSettings ? this.options.hideSettings : 0;
                    this.selection = this.options.selection ? this.options.selection: false;
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
            },
            tagSearch:function(obj){
                this.trigger('tagclick',$(obj.target).text());
                return false;
            },
            deleteSubaccount:function(){
                this.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this Sub Account?",                                                
                            callback: _.bind(function(){													
                                    this.delSubaccount();
                            },this)},
                    $("body"));                                                         
            },
            editSubaccount:function(){                
                this.parent.updateSubAccount(this.model.get('userId'));
                
            },
            delSubaccount:function(){
               this.app.showLoading("Deleting sub account...",this.parent.$el);
               var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');
               $.post(URL, {type:'deleteOperator',opUserId:this.model.get("userId")})
                .done(_.bind(function(data) {                  
                       this.app.showLoading(false,this.parent.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                            this.app.showMessge("Sub accounted deleted.");
                            this.$el.fadeOut(function(){
                                $(this).remove();
                            })
                       }
                       else{
                           this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                       }
               },this));
            }
        });
});