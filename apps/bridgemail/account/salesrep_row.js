define(['text!account/html/salesrep_row.html','jquery.highlight'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Sal Rep Row View to show on salesrep listing (Sub Account Management)
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .delete-subaccount':'deleteSalerep',
              'click .edit-subaccount':'editSalerep',
              'click .copy-subaccount':'copySalerep'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.parent = this.options.sub;      
                    this.app = this.parent.app;
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
                    this.parent.$el);                                                         
            },
            editSubaccount:function(){
                var editable = true;
                if(this.model.get("status")!=="D"){
                    editable = false;
                }                
                this.app.mainContainer.openNurtureTrack({"id":this.model.get("trackId.encode"),"checksum":this.model.get("trackId.checksum"),"parent":this.parent,editable:editable});
                
            },
            delSubaccount:function(){
               this.app.showLoading("Deleting Nurture Track...",this.parent.$el);
               var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
               $.post(URL, {type:'delete',trackId:this.model.get("trackId.encode")})
                .done(_.bind(function(data) {                  
                       this.app.showLoading(false,this.parent.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                            this.app.showMessge("Nurture track deleted.");
                            this.parent.fetchTracks();   
                            this.parent.addCountHeader();
                       }
                       else{
                           this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                       }
               },this));
            }
        });
});